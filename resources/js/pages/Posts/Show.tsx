// import Layout from '@/layouts/app-layout'
import Layout from '../Layout';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { FormEvent, useEffect, useMemo, useState } from 'react';

type Post = {
    id: string | number;
    title: string;
    content?: string | null;
    excerpt?: string | null;
    author?: string | null;
    date?: string | null;
    thumbnail?: string | null;
    slug?: string | null;
};

type CommentNode = {
    id: number;
    content: string;
    date?: string | null;
    author: {
        name: string;
    };
    replies: CommentNode[];
};

type ShowProps = {
    post?: Post;
    recent?: Post[];
    trending?: Post[];
    comments?: CommentNode[];
    can_comment?: boolean;
};

type CommentComposerProps = {
    postId: number | string;
    parentId?: number | null;
    onSubmitted?: () => void;
    onCancel?: () => void;
    autoFocus?: boolean;
};

const hasHtml = (value: string) => /<\/?[a-z][^>]*>/i.test(value);

const resolveHref = (post: Post) => `/posts/${encodeURIComponent(post.slug ?? post.id)}`;

const normalizeId = (value: number | string) =>
    typeof value === 'number' ? value : Number.parseInt(String(value), 10);

const CommentComposer = ({ postId, parentId = null, onSubmitted, onCancel, autoFocus }: CommentComposerProps) => {
    const normalizedPostId = normalizeId(postId);
    const form = useForm({
        post_id: normalizedPostId,
        parent_id: parentId,
        content: '',
    });

    useEffect(() => {
        form.setData('parent_id', parentId ?? null);
    }, [parentId]);

    const submit = (event: FormEvent) => {
        event.preventDefault();

        form.post('/comments', {
            preserveScroll: true,
            onSuccess: () => {
                form.reset('content');
                onSubmitted?.();
            },
        });
    };

    return (
        <form onSubmit={submit} className="space-y-3">
            <div>
                <textarea
                    rows={4}
                    autoFocus={autoFocus}
                    value={form.data.content}
                    onChange={(event) => form.setData('content', event.target.value)}
                    className="w-full resize-none rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-700 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
                    placeholder="Escreva o seu comentario..."
                />
                {form.errors.content && (
                    <p className="mt-1 text-xs text-red-600">{form.errors.content}</p>
                )}
            </div>

            <div className="flex items-center gap-3">
                <button
                    type="submit"
                    disabled={form.processing || form.data.content.trim().length === 0}
                    className="inline-flex items-center rounded-full bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-300"
                >
                    {form.processing ? 'Enviando...' : 'Publicar comentario'}
                </button>
                {onCancel && (
                    <button
                        type="button"
                        onClick={onCancel}
                        className="text-sm font-semibold text-slate-500 hover:text-slate-700"
                    >
                        Cancelar
                    </button>
                )}
            </div>
        </form>
    );
};

type CommentCardProps = {
    comment: CommentNode;
    postId: number | string;
    canComment: boolean;
};

const CommentCard = ({ comment, postId, canComment }: CommentCardProps) => {
    const [replying, setReplying] = useState(false);

    return (
        <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <header className="flex items-start justify-between gap-4">
                <div>
                    <p className="text-sm font-semibold text-slate-900">{comment.author.name}</p>
                    {comment.date && <p className="text-xs text-slate-500">{comment.date}</p>}
                </div>
                {canComment && (
                    <button
                        type="button"
                        onClick={() => setReplying((value) => !value)}
                        className="text-xs font-semibold text-blue-600 hover:text-blue-700"
                    >
                        {replying ? 'Fechar resposta' : 'Responder'}
                    </button>
                )}
            </header>

            <p className="mt-4 whitespace-pre-line text-sm text-slate-700">{comment.content}</p>

            {replying && (
                <div className="mt-4">
                    <CommentComposer
                        postId={postId}
                        parentId={comment.id}
                        autoFocus
                        onSubmitted={() => setReplying(false)}
                        onCancel={() => setReplying(false)}
                    />
                </div>
            )}

            {comment.replies.length > 0 && (
                <div className="mt-6 space-y-6 border-l border-slate-200 pl-6">
                    {comment.replies.map((reply) => (
                        <CommentCard key={reply.id} comment={reply} postId={postId} canComment={canComment} />
                    ))}
                </div>
            )}
        </article>
    );
};

export default function Show({ post, recent = [], trending = [], comments = [], can_comment = false }: ShowProps) {
    const { props: pageProps } = usePage<{ flash?: { success?: string } }>();
    const flashSuccess = pageProps.flash?.success;

    if (!post) {
        return (
            <Layout>
                <Head title="Noticia" />
                <div className="mx-auto max-w-4xl px-4 py-20 text-center text-slate-500">
                    Nao foi possivel carregar esta materia.
                </div>
            </Layout>
        );
    }

    const content = post.content ?? '';
    const canComment = Boolean(can_comment);

    const commentList = useMemo(() => comments ?? [], [comments]);

    return (
        <Layout>
            <Head title={post.title ?? 'Noticia'} />

            <section className="relative bg-slate-900 text-white">
                {post.thumbnail && (
                    <div
                        className="absolute inset-0 bg-cover bg-center opacity-60"
                        style={{ backgroundImage: `linear-gradient(180deg, rgba(15,23,42,0.4) 0%, rgba(15,23,42,0.92) 80%), url(${post.thumbnail})` }}
                    />
                )}
                <div className="relative mx-auto max-w-5xl px-4 py-16">
                    <p className="text-sm font-semibold uppercase tracking-[0.2em] text-blue-200">
                        Portal de noticias
                    </p>
                    <h1 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
                        {post.title}
                    </h1>
                    <div className="mt-6 flex flex-wrap items-center gap-4 text-sm text-slate-200/90">
                        {post.author && <span>Por {post.author}</span>}
                        {post.date && (
                            <span className="flex items-center gap-2">
                                <span className="inline-block h-1.5 w-1.5 rounded-full bg-slate-300" />
                                {post.date}
                            </span>
                        )}
                    </div>
                </div>
            </section>

            <div className="bg-slate-100">
                <div className="mx-auto max-w-6xl px-4 py-12">
                    <div className="grid gap-10 lg:grid-cols-12">
                        <article className="space-y-8 lg:col-span-8">
                            {post.thumbnail && (
                                <div className="overflow-hidden rounded-2xl bg-white shadow">
                                    <img
                                        src={post.thumbnail}
                                        alt={post.title}
                                        className="h-full w-full object-cover"
                                    />
                                </div>
                            )}

                            <div className="rounded-2xl bg-white p-8 shadow-sm">
                                {content && (
                                    hasHtml(content) ? (
                                        <div
                                            className="prose prose-slate max-w-none"
                                            dangerouslySetInnerHTML={{ __html: content }}
                                        />
                                    ) : (
                                        <p className="whitespace-pre-line text-lg leading-relaxed text-slate-700">
                                            {content}
                                        </p>
                                    )
                                )}

                                <div className="mt-10 flex flex-wrap items-center gap-4 border-t border-slate-200 pt-6 text-sm text-slate-500">
                                    <span>Compartilhe:</span>
                                    <div className="flex gap-3">
                                        <button type="button" className="rounded-full bg-blue-600 px-4 py-2 font-semibold text-white transition hover:bg-blue-700">
                                            Facebook
                                        </button>
                                        <button type="button" className="rounded-full bg-sky-500 px-4 py-2 font-semibold text-white transition hover:bg-sky-600">
                                            Twitter
                                        </button>
                                        <button type="button" className="rounded-full bg-emerald-500 px-4 py-2 font-semibold text-white transition hover:bg-emerald-600">
                                            WhatsApp
                                        </button>
                                    </div>
                                </div>
                            </div>

                            <section id="comments" className="rounded-2xl bg-white p-8 shadow-sm">
                                <header className="flex flex-wrap items-center justify-between gap-4">
                                    <div>
                                        <h2 className="text-xl font-bold text-slate-900">Comentarios</h2>
                                        <p className="text-sm text-slate-500">
                                            {commentList.length === 0
                                                ? 'Seja o primeiro a comentar esta noticia.'
                                                : `${commentList.length} comentario${commentList.length > 1 ? 's' : ''}`}
                                        </p>
                                    </div>
                                </header>

                                {flashSuccess && (
                                    <div className="mt-4 rounded-xl bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                                        {flashSuccess}
                                    </div>
                                )}

                                <div className="mt-6">
                                    {canComment ? (
                                        <CommentComposer postId={post.id} />
                                    ) : (
                                        <p className="text-sm text-slate-500">
                                            <Link href="/login" className="font-semibold text-blue-600 hover:text-blue-700">
                                                Entre na sua conta
                                            </Link>{' '}
                                            para participar desta conversa.
                                        </p>
                                    )}
                                </div>

                                <div className="mt-8 space-y-6">
                                    {commentList.length === 0 ? (
                                        <p className="text-sm text-slate-500">Nenhum comentario publicado ainda.</p>
                                    ) : (
                                        commentList.map((comment) => (
                                            <CommentCard
                                                key={comment.id}
                                                comment={comment}
                                                postId={post.id}
                                                canComment={canComment}
                                            />
                                        ))
                                    )}
                                </div>
                            </section>
                        </article>

                        <aside className="space-y-8 lg:col-span-4">
                            <section className="rounded-2xl bg-white p-6 shadow-sm">
                                <h2 className="text-xl font-bold text-slate-900">Ultimas publicacoes</h2>
                                <div className="mt-4 space-y-4">
                                    {recent.map((item) => (
                                        <Link
                                            key={item.id}
                                            href={resolveHref(item)}
                                            className="block rounded-xl p-3 transition hover:bg-slate-100"
                                        >
                                            <p className="text-sm font-semibold text-slate-900">
                                                {item.title}
                                            </p>
                                            {item.date && <span className="text-xs text-slate-500">{item.date}</span>}
                                        </Link>
                                    ))}
                                    {recent.length === 0 && (
                                        <p className="text-sm text-slate-500">Nenhuma noticia recente disponivel.</p>
                                    )}
                                </div>
                            </section>

                            <section className="rounded-2xl bg-slate-900 p-6 text-white shadow-lg">
                                <h2 className="text-xl font-semibold">Mais lidas</h2>
                                <p className="mt-1 text-sm text-slate-300">Os assuntos que estao rendendo agora.</p>
                                <div className="mt-4 space-y-4">
                                    {trending.map((item, index) => (
                                        <Link
                                            key={item.id}
                                            href={resolveHref(item)}
                                            className="group flex gap-3 rounded-xl p-3 transition hover:bg-white/10"
                                        >
                                            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-sm font-semibold text-white">
                                                {index + 1}
                                            </span>
                                            <div className="space-y-1">
                                                <p className="text-sm font-semibold text-white group-hover:text-blue-200">
                                                    {item.title}
                                                </p>
                                                {item.date && <span className="text-xs text-slate-200/80">{item.date}</span>}
                                            </div>
                                        </Link>
                                    ))}
                                    {trending.length === 0 && (
                                        <p className="text-sm text-slate-200/80">Ainda nao ha materias em destaque.</p>
                                    )}
                                </div>
                            </section>
                        </aside>
                    </div>
                </div>
            </div>
        </Layout>
    );
}
