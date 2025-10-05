<?php

namespace App\Http\Controllers;

use App\Models\Noticia;
use Corcel\Model\Comment as WpComment;
use Corcel\Model\Post as WpPost;
use Corcel\Model\Taxonomy;
use Illuminate\Http\Request;
use Illuminate\Support\Collection;
use Inertia\Inertia;

class NoticiaController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $baseQuery = Noticia::published()->orderByDesc('post_date');

        $posts = (clone $baseQuery)
            ->paginate(12)
            ->through(fn ($post) => $this->transformPost($post));

        $highlights = (clone $baseQuery)
            ->take(4)
            ->get()
            ->map(fn ($post) => $this->transformPost($post))
            ->values()
            ->all();

        $latest = (clone $baseQuery)
            ->skip(4)
            ->take(8)
            ->get()
            ->map(fn ($post) => $this->transformPost($post))
            ->values()
            ->all();

        $mostViewedQuery = Noticia::published()
            ->orderByDesc('comment_count')
            ->orderByDesc('post_date');

        if (!empty($highlights)) {
            $mostViewedQuery->whereNotIn('ID', array_column($highlights, 'id'));
        }

        $mostViewed = $mostViewedQuery
            ->take(6)
            ->get()
            ->map(fn ($post) => $this->transformPost($post))
            ->values()
            ->all();

        return Inertia::render('Posts/Index', [
            'posts' => $posts,
            'sections' => $this->buildSections(),
            'highlights' => $highlights,
            'latest' => $latest,
            'most_viewed' => $mostViewed,
        ]);
    }

    /**
     * Display the specified resource.
     */
    public function show(Request $request, $id)
    {
        $post = Noticia::published()
            ->where('ID', $id)
            ->orWhere('post_name', $id)
            ->firstOrFail();

        $content = $this->processContent($post->content);

        $recentPosts = Noticia::published()
            ->where('ID', '!=', $post->ID)
            ->orderByDesc('post_date')
            ->take(5)
            ->get()
            ->map(fn ($item) => $this->transformPost($item))
            ->values()
            ->all();

        $trendingPosts = Noticia::published()
            ->where('ID', '!=', $post->ID)
            ->orderByDesc('comment_count')
            ->orderByDesc('post_date')
            ->take(5)
            ->get()
            ->map(fn ($item) => $this->transformPost($item))
            ->values()
            ->all();

        $approvedComments = $post->comments()
            ->where('comment_approved', 1)
            ->orderBy('comment_date')
            ->get();

        $rootComments = $approvedComments
            ->where('comment_parent', 0)
            ->values();

        $comments = $rootComments
            ->map(fn (WpComment $comment) => $this->transformComment($comment, $approvedComments))
            ->all();

        return Inertia::render('Posts/Show', [
            'post' => array_merge($this->transformPost($post), [
                'content' => $content,
                'author' => $post->author->name ?? 'Autor Desconhecido',
            ]),
            'recent' => $recentPosts,
            'trending' => $trendingPosts,
            'comments' => $comments,
            'can_comment' => (bool) $request->user(),
        ]);
    }

    private function transformPost(WpPost $post): array
    {
        return [
            'id' => $post->ID,
            'title' => $post->title,
            'excerpt' => $post->excerpt,
            'content' => $post->content,
            'date' => optional($post->post_date)->format('d/m/Y'),
            'author' => optional($post->author)->name ?? 'Redacao',
            'thumbnail' => $this->getFeaturedImage($post),
            'slug' => $post->post_name,
            'views' => (int) ($post->comment_count ?? 0),
        ];
    }

    private function transformComment(WpComment $comment, Collection $allComments): array
    {
        $children = $allComments
            ->where('comment_parent', $comment->comment_ID)
            ->sortBy('comment_date')
            ->values();

        return [
            'id' => (int) $comment->comment_ID,
            'content' => $comment->comment_content,
            'date' => optional($comment->comment_date)->format('d/m/Y H:i'),
            'author' => [
                'name' => $comment->comment_author ?: 'Leitor',
            ],
            'replies' => $children
                ->map(fn (WpComment $child) => $this->transformComment($child, $allComments))
                ->all(),
        ];
    }

    private function processContent($content)
    {
        $siteUrl = config('app.wp_url', 'http://noticias.co.mz');

        return preg_replace(
            '/(src|href)=["\']\/([^"\']*)["\']/',
            '$1="' . $siteUrl . '/$2"',
            $content
        );
    }

    private function getFeaturedImage($post)
    {
        try {
            return $post->thumbnail->attachment->url ?? null;
        } catch (\Exception $e) {
            return null;
        }
    }

    /** Listar posts por categoria (p�gina) */
    public function byCategory(string $slug)
    {
        $baseQuery = Noticia::published()
            ->whereHas('taxonomies', function ($query) use ($slug) {
                $query->where('taxonomy', 'category')
                    ->whereHas('term', fn ($termQuery) => $termQuery->where('slug', $slug));
            })
            ->orderByDesc('post_date');

        $posts = $baseQuery
            ->paginate(12)
            ->through(fn ($post) => $this->transformPost($post));

        $category = Taxonomy::category()
            ->whereHas('term', fn ($termQuery) => $termQuery->where('slug', $slug))
            ->first();

        $categoryName = optional($category?->term)->name ?? $slug;

        return Inertia::render('Posts/ByCategory', [
            'category' => ['slug' => $slug, 'name' => $categoryName],
            'posts' => $posts,
        ]);
    }

    /** Busca simples por titulo/conteudo */
    public function search(Request $request)
    {
        $q = trim((string) $request->get('q', ''));
        $base = Noticia::published();

        if ($q !== '') {
            $base->where(function ($query) use ($q) {
                $like = '%' . $q . '%';

                $query->where('post_title', 'like', $like)
                    ->orWhere('post_content', 'like', $like);
            });
        }

        $posts = $base->orderByDesc('post_date')
            ->paginate(12)
            ->withQueryString()
            ->through(fn ($post) => $this->transformPost($post));

        $latest = Noticia::published()
            ->orderByDesc('post_date')
            ->take(5)
            ->get()
            ->map(fn ($post) => $this->transformPost($post))
            ->values()
            ->all();

        return Inertia::render('Posts/Search', [
            'q' => $q,
            'posts' => $posts,
            'latest' => $latest,
        ]);
    }

    /** Preview JSON para dropdown (ate 5 posts) */
    public function categoryPreview(string $slug)
    {
        $items = Noticia::published()
            ->whereHas('taxonomies', function ($query) use ($slug) {
                $query->where('taxonomy', 'category')
                    ->whereHas('term', fn ($termQuery) => $termQuery->where('slug', $slug));
            })
            ->orderByDesc('post_date')
            ->take(5)
            ->get()
            ->map(fn ($post) => $this->transformPost($post))
            ->values()
            ->all();

        return response()->json(['posts' => $items]);
    }

    private function buildSections(): array
    {
        $categories = Taxonomy::category()
            ->whereHas('posts', function ($query) {
                $query->where('post_status', 'publish')->where('post_type', 'post');
            })
            ->take(6)
            ->get();

        return $categories->map(function (Taxonomy $taxonomy) {
            $posts = $taxonomy->posts()
                ->where('post_status', 'publish')
                ->where('post_type', 'post')
                ->orderByDesc('post_date')
                ->take(4)
                ->get()
                ->map(fn ($post) => $this->transformPost($post))
                ->values()
                ->all();

            return [
                'category' => [
                    'id' => (int) $taxonomy->term_id,
                    'name' => optional($taxonomy->term)->name ?? '',
                    'slug' => optional($taxonomy->term)->slug ?? '',
                ],
                'posts' => $posts,
            ];
        })
            ->filter(fn (array $section) => $section['category']['name'] !== '' && $section['category']['slug'] !== '' && !empty($section['posts']))
            ->values()
            ->all();
    }
}
