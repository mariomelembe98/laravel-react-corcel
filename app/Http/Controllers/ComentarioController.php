<?php

namespace App\Http\Controllers;

use App\Models\Noticia;
use Corcel\Model\Comment as WpComment;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;

class ComentarioController extends Controller
{
    public function store(Request $request)
    {
        $user = $request->user();

        if (!$user) {
            abort(403, 'Autenticacao obrigatoria.');
        }

        $validated = $request->validate([
            'post_id' => ['required', 'integer', 'exists:posts,ID'],
            'content' => ['required', 'string', 'max:2000'],
            'parent_id' => [
                'nullable',
                'integer',
                Rule::exists('comments', 'comment_ID')->where(fn ($query) => $query->where('comment_post_ID', $request->integer('post_id'))),
            ],
        ]);

        $post = Noticia::published()
            ->where('ID', $validated['post_id'])
            ->firstOrFail();

        $now = now();

        $comment = new WpComment();
        $comment->comment_post_ID = $post->ID;
        $comment->comment_author = $user->name ?? 'Usuario';
        $comment->comment_author_email = $user->email ?? '';
        $comment->comment_author_url = '';
        $comment->comment_author_IP = $request->ip();
        $comment->comment_date = $now;
        $comment->comment_date_gmt = $now->copy()->utc();
        $comment->comment_content = $validated['content'];
        $comment->comment_approved = 1;
        $comment->comment_agent = Str::limit((string) $request->userAgent(), 255, '');
        $comment->comment_type = '';
        $comment->comment_parent = $validated['parent_id'] ?? 0;
        $comment->user_id = $user->getAuthIdentifier();
        $comment->save();

        return redirect()
            ->back()
            ->with('success', 'Comentario publicado com sucesso.');
    }
}
