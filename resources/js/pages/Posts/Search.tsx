import Layout from '../Layout';
import { Head, Link, router } from '@inertiajs/react';
import { ChangeEvent, FormEvent, useCallback, useEffect, useMemo, useRef, useState } from 'react';

type Post = {
    id: number | string;
    title: string;
    excerpt?: string | null;
    content?: string | null;
    date?: string | null;
    author?: string | null;
    thumbnail?: string | null;
    slug?: string | null;
};

type PaginationLink = {
    url: string | null;
    label: string;
    active: boolean;
};

type Paginated<T> = {
    data: T[];
    links?: PaginationLink[];
    meta?: {
        from?: number | null;
        to?: number | null;
        total?: number;
    };
};

type SearchPageProps = {
    q: string;
    posts: Paginated<Post>;
    latest: Post[];
};

const resolveHref = (post: Post) => `/posts/${encodeURIComponent(post.slug ?? String(post.id))}`;

export default function Search({ q, posts, latest }: SearchPageProps) {
    const [term, setTerm] = useState(q ?? '');
    const [isSearching, setIsSearching] = useState(false);
    const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const triggerSearch = useCallback(
        (value: string) => {
            const trimmed = value.trim();
            const query = trimmed ? { q: trimmed } : {};

            router.get('/posts/search', query, {
                preserveScroll: true,
                preserveState: true,
                replace: true,
                onStart: () => setIsSearching(true),
                onFinish: () => setIsSearching(false),
            });
        },
        []
    );

    const handleSubmit = useCallback(
        (event: FormEvent<HTMLFormElement>) => {
            event.preventDefault();
            triggerSearch(term);
        },
        [term, triggerSearch]
    );

    const handleChange = useCallback(
        (event: ChangeEvent<HTMLInputElement>) => {
            const value = event.target.value;
            setTerm(value);

            if (debounceRef.current) {
                clearTimeout(debounceRef.current);
            }

            debounceRef.current = setTimeout(() => {
                triggerSearch(value);
            }, 400);
        },
        [triggerSearch]
    );

    useEffect(() => {
        setTerm(q ?? '');
        setIsSearching(false);
    }, [q]);

    useEffect(() => () => {
        if (debounceRef.current) {
            clearTimeout(debounceRef.current);
        }
    }, []);

    const results = posts?.data ?? [];
    const totalResults = posts?.meta?.total ?? results.length;

    const suggestions = useMemo(() => {
        const trimmed = term.trim().toLowerCase();

        if (!trimmed) {
            return [] as Post[];
        }

        return results
            .filter((post) => (post.title ?? '').toLowerCase().includes(trimmed))
            .slice(0, 5);
    }, [results, term]);

    const hasResults = results.length > 0;

    return (
        <Layout>
            <Head title={term ? `Pesquisar: ${term}` : 'Pesquisar'} />

            <div className="bg-slate-100 py-10">
                <div className="mx-auto grid max-w-6xl gap-10 px-4 lg:grid-cols-[minmax(0,1fr)_320px] lg:items-start">
                    <section className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200/60">
                        <header className="space-y-4">
                            <div>
                                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-blue-500">
                                    Busca
                                </p>
                                <h1 className="text-3xl font-bold text-slate-900">Encontre as materias que voce procura</h1>
                                <p className="text-sm text-slate-500">
                                    Pesquise por titulo, conteudo ou palavra-chave. Resultados sao atualizados em tempo real enquanto voce digita.
                                </p>
                            </div>

                            <form onSubmit={handleSubmit} className="relative">
                                <div className="flex items-center overflow-hidden rounded-full border border-slate-200 bg-white shadow-sm transition focus-within:border-blue-500 focus-within:ring focus-within:ring-blue-200">
                                    <span className="pl-4 text-slate-400">
                                        <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-4.35-4.35M17 10a7 7 0 1 0-7 7 7 7 0 0 0 7-7Z" />
                                        </svg>
                                    </span>
                                    <input
                                        type="search"
                                        value={term}
                                        onChange={handleChange}
                                        placeholder="Digite termos para pesquisar..."
                                        className="flex-1 bg-transparent px-4 py-3 text-base text-slate-900 placeholder-slate-400 outline-none"
                                        aria-label="Pesquisar posts"
                                    />
                                    <button
                                        type="submit"
                                        className="mr-2 rounded-full bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700"
                                    >
                                        Pesquisar
                                    </button>
                                </div>
                                {suggestions.length > 0 && (
                                    <div className="absolute left-0 right-0 z-10 mt-2 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl">
                                        <p className="border-b border-slate-100 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
                                            Sugestoes rapidas
                                        </p>
                                        <ul className="divide-y divide-slate-100">
                                            {suggestions.map((post) => (
                                                <li key={post.id}>
                                                    <Link
                                                        href={resolveHref(post)}
                                                        className="flex items-center gap-3 px-4 py-3 text-sm text-slate-600 transition hover:bg-slate-50 hover:text-blue-600"
                                                    >
                                                        <svg className="h-4 w-4 flex-none text-slate-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
                                                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14M12 5l7 7-7 7" />
                                                        </svg>
                                                        <span className="line-clamp-1">{post.title}</span>
                                                    </Link>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                            </form>

                            <div className="flex items-center gap-2 text-sm text-slate-500">
                                {isSearching ? (
                                    <span className="flex items-center gap-2">
                                        <span className="h-2 w-2 animate-pulse rounded-full bg-blue-500" />
                                        A carregar resultados...
                                    </span>
                                ) : (
                                    <span>{totalResults} resultado(s) encontrado(s)</span>
                                )}
                            </div>
                        </header>

                        <div className="mt-8 space-y-6">
                            {hasResults ? (
                                results.map((post) => (
                                    <article
                                        key={post.id}
                                        className="group grid gap-6 rounded-2xl border border-slate-200 p-6 transition hover:-translate-y-1 hover:border-transparent hover:shadow-xl md:grid-cols-[200px_minmax(0,1fr)]"
                                    >
                                        {post.thumbnail ? (
                                            <div className="relative h-40 overflow-hidden rounded-xl bg-slate-100">
                                                <img
                                                    src={post.thumbnail}
                                                    alt={post.title}
                                                    className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                                                />
                                            </div>
                                        ) : (
                                            <div className="flex h-40 items-center justify-center rounded-xl bg-slate-100 text-slate-400">
                                                <svg className="h-10 w-10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4">
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 5h16M4 12h16M4 19h16" />
                                                </svg>
                                            </div>
                                        )}

                                        <div className="flex flex-col gap-3">
                                            <div className="flex flex-wrap items-center gap-3 text-xs font-semibold uppercase tracking-wide text-blue-600">
                                                {post.date && <span>{post.date}</span>}
                                                {post.author && (
                                                    <span className="flex items-center gap-2 text-slate-400">
                                                        <span className="inline-block h-1.5 w-1.5 rounded-full bg-blue-200" />
                                                        {post.author}
                                                    </span>
                                                )}
                                            </div>
                                            <Link
                                                href={resolveHref(post)}
                                                className="text-xl font-semibold text-slate-900 transition group-hover:text-blue-600"
                                            >
                                                {post.title}
                                            </Link>
                                            <p className="line-clamp-3 text-sm text-slate-500">
                                                {post.excerpt ?? post.content?.slice(0, 200) ?? 'Confira os detalhes desta materia.'}
                                            </p>
                                            <div>
                                                <Link
                                                    href={resolveHref(post)}
                                                    className="inline-flex items-center text-sm font-semibold text-blue-600 transition hover:text-blue-700"
                                                >
                                                    Ler materia
                                                    <svg className="ml-2 h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14M12 5l7 7-7 7" />
                                                    </svg>
                                                </Link>
                                            </div>
                                        </div>
                                    </article>
                                ))
                            ) : (
                                <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-12 text-center text-slate-500">
                                    <svg className="mx-auto h-12 w-12 text-slate-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="m9 13-3-3m0 0 3-3m-3 3h12m-6 6h6" />
                                    </svg>
                                    <h2 className="mt-4 text-lg font-semibold text-slate-700">Nenhum resultado encontrado</h2>
                                    <p className="mt-2 text-sm text-slate-500">Tente outros termos ou verifique se ha erros de digitacao.</p>
                                </div>
                            )}
                        </div>

                        {posts?.links && posts.links.length > 1 && (
                            <nav className="mt-10 flex flex-wrap items-center gap-2">
                                {posts.links.map((link, index) => {
                                    const isDisabled = !link.url;
                                    const classes = `rounded-full px-4 py-2 text-sm font-semibold transition ${
                                        link.active
                                            ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30'
                                            : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                                    } ${isDisabled ? 'cursor-not-allowed opacity-60 hover:bg-slate-200' : ''}`;

                                    if (isDisabled) {
                                        return (
                                            <span
                                                key={`pagination-${index}`}
                                                className={classes}
                                                dangerouslySetInnerHTML={{ __html: link.label }}
                                            />
                                        );
                                    }

                                    return (
                                        <Link
                                            key={`pagination-${index}`}
                                            href={link.url!}
                                            className={classes}
                                            preserveScroll
                                            dangerouslySetInnerHTML={{ __html: link.label }}
                                        />
                                    );
                                })}
                            </nav>
                        )}
                    </section>

                    <aside className="space-y-6">
                        <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200/60">
                            <h2 className="text-lg font-semibold text-slate-900">Ultimas postagens</h2>
                            <p className="text-sm text-slate-500">Fique por dentro do que acabou de ser publicado.</p>
                            <ul className="mt-4 space-y-4">
                                {latest.length > 0 ? (
                                    latest.map((post) => (
                                        <li key={`latest-${post.id}`} className="flex gap-3">
                                            {post.thumbnail && (
                                                <div className="h-16 w-16 flex-none overflow-hidden rounded-xl bg-slate-100">
                                                    <img
                                                        src={post.thumbnail}
                                                        alt={post.title}
                                                        className="h-full w-full object-cover"
                                                    />
                                                </div>
                                            )}
                                            <div className="flex flex-1 flex-col justify-between">
                                                <Link
                                                    href={resolveHref(post)}
                                                    className="text-sm font-semibold text-slate-800 transition hover:text-blue-600"
                                                >
                                                    {post.title}
                                                </Link>
                                                <div className="flex items-center gap-2 text-xs text-slate-400">
                                                    {post.date && <span>{post.date}</span>}
                                                    {post.author && (
                                                        <span className="flex items-center gap-1">
                                                            <span>-</span>
                                                            {post.author}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </li>
                                    ))
                                ) : (
                                    <li className="rounded-xl bg-slate-50 p-4 text-sm text-slate-500">
                                        Nenhuma postagem recente disponivel.
                                    </li>
                                )}
                            </ul>
                        </div>
                    </aside>
                </div>
            </div>
        </Layout>
    );
}
