<?php

namespace App\Http\Middleware;

use Corcel\Model\Taxonomy;
use Illuminate\Foundation\Inspiring;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that's loaded on the first page visit.
     *
     * @see https://inertiajs.com/server-side-setup#root-template
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determines the current asset version.
     *
     * @see https://inertiajs.com/asset-versioning
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @see https://inertiajs.com/shared-data
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        [$message, $author] = str(Inspiring::quotes()->random())->explode('-');

        $categories = Cache::remember('shared.categories', now()->addMinutes(10), function () {
            return Taxonomy::category()
                ->whereHas('posts', function ($query) {
                    $query->where('post_status', 'publish')->where('post_type', 'post');
                })
                ->get()
                ->map(function (Taxonomy $taxonomy) {
                    return [
                        'id' => (int) $taxonomy->term_id,
                        'name' => $taxonomy->term->name ?? '',
                        'slug' => $taxonomy->term->slug ?? '',
                    ];
                })
                ->filter(fn (array $category) => $category['name'] !== '' && $category['slug'] !== '')
                ->values()
                ->all();
        });

        return [
            ...parent::share($request),
            'name' => config('app.name'),
            'quote' => ['message' => trim($message), 'author' => trim($author)],
            'auth' => [
                'user' => $request->user(),
            ],
            'sidebarOpen' => ! $request->hasCookie('sidebar_state') || $request->cookie('sidebar_state') === 'true',
            'categories' => $categories,
        ];
    }
}
