import Layout from '../Layout';
import { Head, Link, usePage } from '@inertiajs/react';
import { useMemo, useState } from 'react';

type Post = {
    id: number | string;
    title: string;
    excerpt?: string | null;
    content?: string | null;
    date?: string | null;
    author?: string | null;
    thumbnail?: string | null;
    slug?: string | null;
    views?: number | null;
};

type PaginationLink = {
    url: string | null;
    label: string;
    active: boolean;
};

type Paginated<T> = {
    data: T[];
    links?: PaginationLink[];
};

type Category = {
    id: number;
    name: string;
    slug: string;
};

type SharedProps = {
    categories?: Category[];
};

type ByCategoryProps = {
    category: Category;
    posts: Paginated<Post>;
};

const resolveHref = (post: Post) => `/posts/${encodeURIComponent(post.slug ?? String(post.id))}`;

const parseDate = (value?: string | null) => {
    if (!value) return 0;
    const time = new Date(value).getTime();
    return Number.isFinite(time) ? time : 0;
};

export default function ByCategory({ category, posts }: ByCategoryProps) {
    const page = usePage<SharedProps>();
    const allCategories = page.props.categories ?? [];

    const [search, setSearch] = useState('');
    const [onlyWithImage, setOnlyWithImage] = useState(false);
    const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'popular'>('newest');
    const [showFilters, setShowFilters] = useState(false);

    const items = posts?.data ?? [];

    const filtered = useMemo(() => {
        const term = search.trim().toLowerCase();
        let result = items;

        if (term) {
            result = result.filter((p) =>
                (p.title ?? '').toLowerCase().includes(term) ||
                (p.excerpt ?? p.content ?? '').toLowerCase().includes(term) ||
                (p.author ?? '').toLowerCase().includes(term)
            );
        }

        if (onlyWithImage) {
            result = result.filter((p) => Boolean(p.thumbnail));
        }

        result = [...result].sort((a, b) => {
            if (sortBy === 'popular') {
                const av = (a.views ?? 0) || (typeof a.id === 'number' ? a.id : 0);
                const bv = (b.views ?? 0) || (typeof b.id === 'number' ? b.id : 0);
                return bv - av;
            }
            const ad = parseDate(a.date ?? null);
            const bd = parseDate(b.date ?? null);
            return sortBy === 'newest' ? bd - ad : ad - bd;
        });

        return result;
    }, [items, search, onlyWithImage, sortBy]);

    const clearFilters = () => {
        setSearch('');
        setOnlyWithImage(false);
        setSortBy('newest');
    };

    return (
        <Layout>
            <Head title={`Categoria: ${category?.name ?? ''}`} />

            <div className="bg-slate-100 py-8">
                <div className="mx-auto grid max-w-6xl gap-8 px-4 lg:grid-cols-[260px_minmax(0,1fr)] lg:items-start">
                    {/* Sidebar de filtros */}
                    <aside className="lg:sticky lg:top-24">
                        {/* Toggle para mobile */}
                        <div className="mb-4 lg:hidden">
                            <button
                                type="button"
                                onClick={() => setShowFilters((v) => !v)}
                                aria-expanded={showFilters}
                                className="inline-flex w-full items-center justify-between rounded-xl bg-white px-4 py-3 text-sm font-semibold text-slate-700 shadow-sm ring-1 ring-slate-200/60"
                            >
                                <span>Filtros</span>
                                <svg className={`h-4 w-4 transition ${showFilters ? 'rotate-180' : ''}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 9l6 6 6-6" />
                                </svg>
                            </button>
                        </div>

                        <div className={`space-y-6 ${showFilters ? 'block' : 'hidden'} lg:block`}>
                            <section className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200/60">
                                <header className="mb-4">
                                    <p className="text-xs font-semibold uppercase tracking-[0.25em] text-blue-500">Categoria</p>
                                    <h2 className="text-xl font-bold text-slate-900">{category?.name}</h2>
                                </header>

                                <div className="space-y-4">
                                    <div>
                                        <label htmlFor="search" className="mb-1 block text-xs font-semibold uppercase tracking-wider text-slate-500">
                                            Pesquisar nesta categoria
                                        </label>
                                        <input
                                            id="search"
                                            type="text"
                                            value={search}
                                            onChange={(e) => setSearch(e.target.value)}
                                            placeholder="Titulo, autor ou palavra-chave"
                                            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
                                        />
                                    </div>

                                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                                        <label className="flex items-center gap-2 text-sm text-slate-700">
                                            <input
                                                type="checkbox"
                                                checked={onlyWithImage}
                                                onChange={(e) => setOnlyWithImage(e.target.checked)}
                                                className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                                            />
                                            Apenas com imagem
                                        </label>

                                        <div>
                                            <label htmlFor="sort" className="mb-1 block text-xs font-semibold uppercase tracking-wider text-slate-500">
                                                Ordenar por
                                            </label>
                                            <select
                                                id="sort"
                                                value={sortBy}
                                                onChange={(e) => setSortBy(e.target.value as 'newest' | 'oldest' | 'popular')}
                                                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
                                            >
                                                <option value="newest">Mais recentes</option>
                                                <option value="oldest">Mais antigos</option>
                                                <option value="popular">Mais populares</option>
                                            </select>
                                        </div>
                                    </div>

                                    <div className="pt-2">
                                        <button
                                            type="button"
                                            onClick={clearFilters}
                                            className="inline-flex items-center rounded-full bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-200"
                                        >
                                            Limpar filtros
                                        </button>
                                    </div>
                                </div>
                            </section>

                            <section className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200/60">
                                <h3 className="mb-3 text-sm font-semibold uppercase tracking-[0.2em] text-slate-600">Categorias</h3>
                                <ul className="space-y-1">
                                    {allCategories.length > 0 ? (
                                        allCategories.map((cat) => {
                                            const isActive = cat.slug === category.slug;
                                            return (
                                                <li key={cat.id}>
                                                    <Link
                                                        href={`/categoria/${cat.slug}`}
                                                        className={`flex items-center justify-between rounded-xl px-3 py-2 text-sm transition ${
                                                            isActive
                                                                ? 'bg-blue-50 font-semibold text-blue-700'
                                                                : 'text-slate-700 hover:bg-slate-50'
                                                        }`}
                                                    >
                                                        <span className="line-clamp-1">{cat.name}</span>
                                                        {isActive && (
                                                            <svg className="h-4 w-4 text-blue-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                                                                <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14M12 5l7 7-7 7" />
                                                            </svg>
                                                        )}
                                                    </Link>
                                                </li>
                                            );
                                        })
                                    ) : (
                                        <li className="text-sm text-slate-500">Nenhuma categoria cadastrada.</li>
                                    )}
                                </ul>
                            </section>
                        </div>
                    </aside>

                    {/* Conteudo principal */}
                    <section className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200/60">
                        <header className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                            <div>
                                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-blue-500">Categoria</p>
                                <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">{category?.name}</h1>
                            </div>
                            <p className="text-sm text-slate-500">{filtered.length} resultado(s)</p>
                        </header>

                        {filtered.length > 0 ? (
                            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                                {filtered.map((p) => (
                                    <Link
                                        key={String(p.id)}
                                        href={resolveHref(p)}
                                        className="group flex h-full flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
                                    >
                                        {p.thumbnail ? (
                                            <div className="relative h-40 overflow-hidden">
                                                <img
                                                    src={p.thumbnail}
                                                    alt={p.title}
                                                    className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                                                />
                                            </div>
                                        ) : (
                                            <div className="flex h-40 items-center justify-center bg-slate-100 text-slate-400">
                                                <svg className="h-8 w-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 5h16M4 12h16M4 19h16" />
                                                </svg>
                                            </div>
                                        )}

                                        <div className="flex flex-1 flex-col gap-2 p-4">
                                            <div className="flex flex-wrap items-center gap-3 text-xs font-semibold uppercase tracking-wide text-blue-600">
                                                {p.date && <span>{p.date}</span>}
                                                {p.author && (
                                                    <span className="flex items-center gap-2 text-slate-400">
                                                        <span className="inline-block h-1.5 w-1.5 rounded-full bg-blue-200" />
                                                        {p.author}
                                                    </span>
                                                )}
                                            </div>
                                            <h3 className="line-clamp-2 text-base font-semibold text-slate-900">{p.title}</h3>
                                            <p className="line-clamp-3 text-sm text-slate-500">
                                                {p.excerpt ?? p.content?.slice(0, 160) ?? 'Confira os detalhes desta materia.'}
                                            </p>
                                            <div className="mt-auto pt-2">
                                                <span className="inline-flex items-center text-sm font-semibold text-blue-600 transition group-hover:text-blue-700">
                                                    Ler materia
                                                    <svg className="ml-2 h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14M12 5l7 7-7 7" />
                                                    </svg>
                                                </span>
                                            </div>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        ) : (
                            <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-12 text-center text-slate-500">
                                <svg className="mx-auto h-12 w-12 text-slate-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="m9 13-3-3m0 0 3-3m-3 3h12m-6 6h6" />
                                </svg>
                                <h2 className="mt-4 text-lg font-semibold text-slate-700">Nenhuma materia encontrada</h2>
                                <p className="mt-1 text-sm text-slate-500">Ajuste os filtros ou tente outra categoria.</p>
                            </div>
                        )}

                        {posts?.links && posts.links.length > 1 && (
                            <nav className="mt-8 flex flex-wrap items-center gap-2">
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
                </div>
            </div>
        </Layout>
    );
}
