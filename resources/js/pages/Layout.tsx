import { Link, router, usePage } from '@inertiajs/react';
import { type ReactNode, useEffect, useRef, useState } from 'react';

type PostPreview = {
    id: number;
    title: string;
    slug?: string;
    thumbnail?: string;
    date?: string;
    author?: string;
};

type Category = {
    id: number;
    name: string;
    slug: string;
};

type SharedProps = {
    categories?: Category[];
};

interface LayoutProps {
    children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
    const page = usePage<SharedProps>();
    const categories = page.props.categories ?? [];

    const [query, setQuery] = useState('');
    const [openSlug, setOpenSlug] = useState<string | null>(null);
    const [previewByCat, setPreviewByCat] = useState<Record<string, PostPreview[]>>({});
    const [loadingSlug, setLoadingSlug] = useState<string | null>(null);
    const [isMobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [isMobileSearchOpen, setMobileSearchOpen] = useState(false);
    const [isScrolled, setScrolled] = useState(false);
    const hoverTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

    useEffect(
        () => () => {
            if (hoverTimeout.current) {
                clearTimeout(hoverTimeout.current);
            }
        },
        []
    );

    // Fecha menus quando navega para outra pagina
    useEffect(() => {
        setMobileMenuOpen(false);
        setMobileSearchOpen(false);
        setOpenSlug(null);
    }, [page.url]);

    useEffect(() => {
        if (typeof window === 'undefined') {
            return;
        }

        const handleScroll = () => {
            setScrolled(window.scrollY > 80);
        };

        handleScroll();

        window.addEventListener('scroll', handleScroll, { passive: true });

        return () => {
            window.removeEventListener('scroll', handleScroll);
        };
    }, []);

    const handleSearchSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const trimmed = query.trim();

        if (!trimmed) {
            return;
        }

        router.get('/posts/search', { q: trimmed }, { preserveState: true, preserveScroll: true });
    };

    const loadPreview = async (slug: string) => {
        setLoadingSlug(slug);

        try {
            const response = await fetch(`/api/categories/${slug}/preview`);
            if (!response.ok) {
                throw new Error('Failed to load preview');
            }

            const payload = (await response.json()) as { posts?: PostPreview[] };
            setPreviewByCat((previous) => ({
                ...previous,
                [slug]: payload.posts ?? [],
            }));
        } catch {
            setPreviewByCat((previous) => ({
                ...previous,
                [slug]: [],
            }));
        } finally {
            setLoadingSlug((current) => (current === slug ? null : current));
        }
    };

    const handleCategoryOpen = (slug: string) => {
        if (hoverTimeout.current) {
            clearTimeout(hoverTimeout.current);
        }

        setOpenSlug(slug);

        if (previewByCat[slug] || loadingSlug === slug) {
            return;
        }

        void loadPreview(slug);
    };

    const handleCategoryClose = () => {
        if (hoverTimeout.current) {
            clearTimeout(hoverTimeout.current);
        }

        hoverTimeout.current = setTimeout(() => setOpenSlug(null), 150);
    };

    const renderPreview = (category: Category) => {
        const posts = previewByCat[category.slug];
        const isLoading = loadingSlug === category.slug && !posts;

        if (isLoading) {
            return <p className="p-4 text-sm text-gray-500">Carregando...</p>;
        }

        if (!posts || posts.length === 0) {
            return <p className="p-4 text-sm text-gray-500">Sem posts recentes nesta categoria.</p>;
        }

        return (
            <ul className="divide-y divide-gray-100">
                {posts.slice(0, 5).map((post) => {
                    const href = post.slug ? `/posts/${post.slug}` : `/posts/${post.id}`;
                    const metaParts = [post.date, post.author].filter(Boolean).join(' - ');

                    return (
                        <li key={post.id} className="p-3 transition hover:bg-gray-50">
                            <Link href={href} className="flex items-start gap-3 text-gray-900">
                                {post.thumbnail && (
                                    <img
                                        src={post.thumbnail}
                                        alt={post.title}
                                        className="h-14 w-14 flex-shrink-0 rounded-lg object-cover"
                                    />
                                )}
                                <div>
                                    <p className="font-medium leading-snug line-clamp-2">{post.title}</p>
                                    {metaParts && <p className="mt-1 text-xs text-gray-500">{metaParts}</p>}
                                </div>
                            </Link>
                        </li>
                    );
                })}
            </ul>
        );
    };

    const toggleMobileMenu = () => {
        setMobileMenuOpen((prev) => {
            const next = !prev;
            if (next) {
                setMobileSearchOpen(false);
            } else {
                setOpenSlug(null);
            }
            return next;
        });
    };

    const toggleMobileSearch = () => {
        setMobileSearchOpen((prev) => {
            const next = !prev;
            if (next) {
                setMobileMenuOpen(false);
                setOpenSlug(null);
            }
            return next;
        });
    };

    const closeMobileMenu = () => {
        setMobileMenuOpen(false);
        setOpenSlug(null);
    };


    const SearchForm = ({
        className,
        autoFocus,
        inputClassName,
    }: {
        className?: string;
        autoFocus?: boolean;
        inputClassName?: string;
    }) => (
        <form onSubmit={handleSearchSubmit} className={className ?? 'relative'}>
            <input
                autoFocus={autoFocus}
                type="search"
                placeholder="Pesquisar posts..."
                className={`w-full rounded-full bg-gray-800/70 px-4 py-2 text-sm text-gray-100 placeholder-gray-400 outline-none transition focus:bg-gray-800 focus:ring-2 focus:ring-blue-500 ${inputClassName ?? ''}`}
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                aria-label="Pesquisar posts"
            />
        </form>
    );

    return (
        <div className="flex min-h-screen flex-col bg-gray-900 text-gray-100">

            <header className="relative z-40">
                <div className="border-b border-gray-800 bg-gray-900/95 backdrop-blur supports-[backdrop-filter]:bg-gray-900/80">
                    <div className="container mx-auto flex items-center gap-3 px-4 py-6">
                        <div className="flex items-center md:flex-1">
                            <Link href="/" className="text-2xl font-semibold tracking-tight">
                                Noticias
                            </Link>
                        </div>

                        <div className="hidden md:flex md:flex-[1.6] md:justify-center">
                            <div className="w-full max-w-2xl">
                                <SearchForm inputClassName="px-6 py-3 text-base shadow-lg shadow-blue-500/10" />
                            </div>
                        </div>

                        <div className="flex items-center justify-end gap-2 md:flex-1">
                            <button
                                type="button"
                                className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-gray-800 bg-gray-900 text-gray-200 transition hover:bg-gray-800 md:hidden"
                                onClick={toggleMobileSearch}
                                aria-expanded={isMobileSearchOpen}
                                aria-label={isMobileSearchOpen ? 'Fechar busca' : 'Abrir busca'}
                            >
                                {isMobileSearchOpen ? (
                                    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M18 6L6 18M6 6l12 12" />
                                    </svg>
                                ) : (
                                    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-4.35-4.35M17 10a7 7 0 1 0-7 7 7 7 0 0 0 7-7Z" />
                                    </svg>
                                )}
                            </button>
                            <button
                                type="button"
                                className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-gray-800 bg-gray-900 text-gray-200 transition hover:bg-gray-800 md:hidden"
                                onClick={toggleMobileMenu}
                                aria-expanded={isMobileMenuOpen}
                                aria-label={isMobileMenuOpen ? 'Fechar menu' : 'Abrir menu'}
                            >
                                {isMobileMenuOpen ? (
                                    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M18 6L6 18M6 6l12 12" />
                                    </svg>
                                ) : (
                                    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                                    </svg>
                                )}
                            </button>
                        </div>
                    </div>

                    {isMobileSearchOpen && (
                        <div className="container mx-auto px-4 pb-4 md:hidden">
                            <SearchForm autoFocus className="relative" />
                        </div>
                    )}
                </div>

                <nav
                    className={`sticky top-0 z-30 border-b border-gray-800 bg-gray-900/95 backdrop-blur supports-[backdrop-filter]:bg-gray-900/80 transition-shadow ${isScrolled ? 'shadow-lg shadow-black/30' : ''}`}
                >
                    <div className="container mx-auto hidden items-center gap-4 px-4 py-4 md:flex">
                        <ul className="flex flex-1 flex-wrap items-center gap-6">
                            {categories.length > 0 ? (
                                categories.map((category) => (
                                    <li
                                        key={category.id}
                                        className="relative"
                                        onMouseEnter={() => handleCategoryOpen(category.slug)}
                                        onMouseLeave={handleCategoryClose}
                                    >
                                        <Link
                                            href={`/categoria/${category.slug}`}
                                            className="text-sm font-medium uppercase tracking-wide transition hover:text-white"
                                        >
                                            {category.name}
                                        </Link>

                                        {openSlug === category.slug && (
                                            <div className="absolute left-0 top-full z-20 mt-3 w-80 rounded-2xl bg-white shadow-xl ring-1 ring-black/5">
                                                {renderPreview(category)}
                                            </div>
                                        )}
                                    </li>
                                ))
                            ) : (
                                <li className="text-sm text-gray-400">Nenhuma categoria cadastrada.</li>
                            )}
                        </ul>
                        {isScrolled && (
                            <div className="ml-6 hidden w-full max-w-xs md:block">
                                <SearchForm className="relative" inputClassName="px-4 py-2.5 text-sm" />
                            </div>
                        )}
                    </div>

                    {/* Mobile navigation */}
                    {isMobileMenuOpen && (
                        <div className="absolute inset-x-0 top-full z-30 md:hidden">
                            <div className="bg-gray-900/95 px-4 pt-4 pb-6 shadow-2xl backdrop-blur">
                                <div className="mb-4">
                                    <SearchForm className="relative" />
                                </div>
                                <ul className="space-y-3">
                                    {categories.length > 0 ? (
                                        categories.map((category) => (
                                            <li key={category.id}>
                                                <Link
                                                    href={`/categoria/${category.slug}`}
                                                    className="flex items-center justify-between rounded-xl bg-gray-800/40 px-4 py-3 text-sm font-semibold uppercase tracking-wide text-gray-100 transition hover:bg-gray-800"
                                                    onClick={closeMobileMenu}
                                                >
                                                    <span>{category.name}</span>
                                                    <svg
                                                        className="h-4 w-4"
                                                        viewBox="0 0 24 24"
                                                        fill="none"
                                                        stroke="currentColor"
                                                        strokeWidth="1.5"
                                                    >
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                                                    </svg>
                                                </Link>
                                            </li>
                                        ))
                                    ) : (
                                        <li className="text-sm text-gray-400">Nenhuma categoria cadastrada.</li>
                                    )}
                                </ul>
                            </div>
                        </div>
                    )}
                </nav>

                {isMobileMenuOpen && (
                    <div
                        className="fixed inset-0 z-20 bg-black/40 backdrop-blur-sm md:hidden"
                        aria-hidden="true"
                        onClick={closeMobileMenu}
                    />
                )}
            </header>

            <main className="flex-1 animate-fadeIn">
                {children}</main>

            <footer className="mt-12 bg-gray-800 py-8 text-white">
                <div className="container mx-auto px-4 text-center">
                    <p>&copy; 2025 Meu Site. Todos os direitos reservados.</p>
                </div>
            </footer>

            <style>
                {`
                    .animate-fadeIn { animation: fadeIn 0.35s ease-out both; }
                    @keyframes fadeIn { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: translateY(0); } }
                `}
            </style>
        </div>
    );
}

