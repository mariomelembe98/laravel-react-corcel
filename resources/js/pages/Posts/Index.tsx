//import Layout from '@/layouts/app-layout'
import Layout from '../Layout';

import { Head, Link } from '@inertiajs/react'
import { useCallback, useEffect, useMemo, useState } from 'react'

type Post = {
    id: string | number
    title: string
    excerpt?: string
    content?: string
    date?: string
    author?: string
    thumbnail?: string | null
    slug?: string
    views?: number
}

type CategorySummary = {
    id: number
    name: string
    slug: string
}

type CategorySection = {
    category: CategorySummary
    posts: Post[]
}

type PaginationLink = {
    url: string | null
    label: string
    active: boolean
}

type Paginated<T> = {
    data: T[]
    links?: PaginationLink[]
}

type PostsIndexProps = {
    posts: Paginated<Post>
    sections?: CategorySection[]
    highlights?: Post[]
    latest?: Post[]
    most_viewed?: Post[]
}

const resolveHref = (post: Post) => `/posts/${encodeURIComponent(post.slug ?? post.id)}`

const resolveViews = (post: Post) =>
    post.views ?? (typeof post.id === 'number' ? post.id : parseInt(String(post.id), 10) || 0)

export default function PostsIndex({ posts, highlights, latest, most_viewed, sections }: PostsIndexProps) {
    const categorySections = sections ?? []
    const allPosts = posts?.data ?? []
    const destaqueLista = useMemo(() => (highlights && highlights.length > 0 ? highlights : allPosts), [highlights, allPosts])
    const highlightCount = destaqueLista.length
    const [activeHighlight, setActiveHighlight] = useState(0)
    const goToHighlight = useCallback(
        (index: number) => {
            if (highlightCount === 0) {
                return
            }
            setActiveHighlight((index + highlightCount) % highlightCount)
        },
        [highlightCount]
    )

    const goToPreviousHighlight = useCallback(() => {
        if (highlightCount === 0) {
            return
        }
        setActiveHighlight((prev) => (prev - 1 + highlightCount) % highlightCount)
    }, [highlightCount])

    const goToNextHighlight = useCallback(() => {
        if (highlightCount === 0) {
            return
        }
        setActiveHighlight((prev) => (prev + 1) % highlightCount)
    }, [highlightCount])


    useEffect(() => {
        setActiveHighlight(0)
    }, [highlightCount])

    useEffect(() => {
        if (highlightCount <= 1) {
            return
        }
        const interval = window.setInterval(() => {
            setActiveHighlight((prev) => (prev + 1) % highlightCount)
        }, 7000)

        return () => window.clearInterval(interval)
    }, [highlightCount])

    const currentHighlight = destaqueLista[activeHighlight]
    const secondaryHighlights = useMemo(
        () => destaqueLista.filter((_, index) => index !== activeHighlight).slice(0, 3),
        [destaqueLista, activeHighlight]
    )

    const ultimasNoticias = (latest && latest.length > 0)
        ? latest
        : allPosts.slice(1, 6)

    const maisLidas = (most_viewed && most_viewed.length > 0)
        ? most_viewed
        : [...allPosts]
            .sort((a, b) => resolveViews(b) - resolveViews(a))
            .slice(0, 5)

    const renderPostCard = (post: Post) => (
        <article
            key={String(post.id)}
            className="group flex h-full flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
        >
            {post.thumbnail && (
                <div className="relative h-48 overflow-hidden">
                    <img
                        src={post.thumbnail}
                        alt={post.title}
                        className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                    />
                </div>
            )}
            <div className="flex flex-1 flex-col p-6">
                <div className="flex items-center gap-3 text-xs font-semibold uppercase tracking-wide text-blue-600">
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
                    className="mt-3 text-lg font-semibold text-slate-900 transition group-hover:text-blue-600"
                >
                    {post.title}
                </Link>
                <p className="mt-2 text-sm text-slate-500">
                    {post.excerpt ?? post.content?.slice(0, 150)}
                </p>
                <div className="mt-auto pt-4">
                    <Link
                        href={resolveHref(post)}
                        className="inline-flex items-center text-sm font-semibold text-blue-600 hover:text-blue-700"
                    >
                        Ler mais -&gt;
                    </Link>
                </div>
            </div>
        </article>
    )

    return (
        <Layout>
            <Head title="Portal de Noticias" />

            <div className="bg-slate-100">
                <div className="mx-auto max-w-6xl px-4 py-10 lg:py-14">
                    {currentHighlight ? (
                        <div className="grid gap-8 lg:grid-cols-12">
                            <div className="relative min-h-[320px] overflow-hidden rounded-2xl bg-slate-900 text-white shadow-xl sm:min-h-[380px] lg:col-span-8">
                                <Link
                                    href={resolveHref(currentHighlight)}
                                    className="group block h-full"
                                >
                                    <div
                                        className="absolute inset-0 bg-cover bg-center opacity-70 transition-opacity group-hover:opacity-90"
                                        style={currentHighlight.thumbnail ? { backgroundImage: `linear-gradient(180deg, rgba(15,23,42,0.4) 0%, rgba(15,23,42,0.85) 80%), url(${currentHighlight.thumbnail})` } : undefined}
                                    />
                                    <div className="relative flex h-full flex-col justify-end space-y-4 p-8">
                                        <span className="inline-flex w-fit rounded-full bg-blue-500/20 px-4 py-1 text-sm font-semibold text-blue-100">
                                            Em destaque
                                        </span>
                                        <h1 className="text-3xl font-bold leading-tight tracking-tight sm:text-4xl lg:text-5xl">
                                            {currentHighlight.title}
                                        </h1>
                                        <p className="max-w-2xl text-base text-slate-200 sm:text-lg">
                                            {currentHighlight.excerpt ?? currentHighlight.content?.slice(0, 160)}
                                        </p>
                                        <div className="flex items-center gap-4 text-sm text-slate-200/80">
                                            {currentHighlight.author && <span>{currentHighlight.author}</span>}
                                            {currentHighlight.date && (
                                                <span className="flex items-center gap-2">
                                                    <span className="inline-block h-1.5 w-1.5 rounded-full bg-slate-400" />
                                                    {currentHighlight.date}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </Link>

                                {highlightCount > 1 && (
                                    <>
                                        <div className="pointer-events-none absolute inset-y-0 left-0 right-0 flex items-center justify-between px-4">
                                            <button
                                                type="button"
                                                onClick={goToPreviousHighlight}
                                                className="pointer-events-auto inline-flex h-10 w-10 items-center justify-center rounded-full bg-white/20 text-white backdrop-blur transition hover:bg-white/40"
                                                aria-label="Ver destaque anterior"
                                            >
                                                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 18l-6-6 6-6" />
                                                </svg>
                                            </button>
                                            <button
                                                type="button"
                                                onClick={goToNextHighlight}
                                                className="pointer-events-auto inline-flex h-10 w-10 items-center justify-center rounded-full bg-white/20 text-white backdrop-blur transition hover:bg-white/40"
                                                aria-label="Ver proximo destaque"
                                            >
                                                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 6l6 6-6 6" />
                                                </svg>
                                            </button>
                                        </div>

                                        <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 items-center gap-2">
                                            {destaqueLista.map((item, index) => (
                                                <button
                                                    key={String(item.id ?? index)}
                                                    type="button"
                                                    onClick={() => goToHighlight(index)}
                                                    className={`h-2.5 w-2.5 rounded-full transition ${index === activeHighlight ? 'bg-white' : 'bg-white/40 hover:bg-white/70'}`}
                                                    aria-label="Ir para destaque"
                                                    aria-current={index === activeHighlight ? 'true' : undefined}
                                                />
                                            ))}
                                        </div>
                                    </>
                                )}
                            </div>

                            <div className="grid gap-4 sm:grid-cols-2 lg:col-span-4 lg:grid-cols-1">
                                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">
                                    Destaques do dia
                                </p>
                                {secondaryHighlights.length === 0 && (
                                    <p className="rounded-2xl bg-white p-6 text-sm text-slate-500 shadow-sm">
                                        Aguarde novidades em breve.
                                    </p>
                                )}
                                {secondaryHighlights.map((post) => (
                                    <Link
                                        key={String(post.id)}
                                        href={resolveHref(post)}
                                        className="group flex flex-col gap-4 rounded-2xl bg-white p-4 shadow-sm transition hover:-translate-y-1 hover:shadow-lg sm:flex-row"
                                    >
                                        {post.thumbnail && (
                                            <div className="h-20 w-28 flex-none overflow-hidden rounded-xl bg-slate-200">
                                                <img
                                                    src={post.thumbnail}
                                                    alt={post.title}
                                                    className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                                                />
                                            </div>
                                        )}
                                        <div className="flex flex-1 flex-col justify-between">
                                            <h3 className="text-base font-semibold text-slate-900">
                                                {post.title}
                                            </h3>
                                            <div className="mt-2 flex items-center gap-3 text-xs text-slate-500">
                                                {post.date && <span>{post.date}</span>}
                                                {post.author && (
                                                    <span className="flex items-center gap-2">
                                                        <span className="inline-block h-1 w-1 rounded-full bg-slate-300" />
                                                        {post.author}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        </div>
                    ) : (
                        <div className="rounded-2xl bg-white p-12 text-center text-slate-500 shadow-sm">
                            Nenhuma noticia encontrada.
                        </div>
                    )}
                    {categorySections.length > 0 && (
                        <section className="mt-12 space-y-12">
                            {categorySections.map((section) => (
                                <div key={section.category.id} className="space-y-6">
                                    <div className="flex items-center justify-between gap-4">
                                        <h2 className="text-2xl font-bold text-slate-900">{section.category.name}</h2>
                                        <Link
                                            href={`/categoria/${section.category.slug}`}
                                            className="text-sm font-semibold text-blue-600 hover:text-blue-700"
                                        >
                                            Ver categoria
                                        </Link>
                                    </div>
                                    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                                        {section.posts.map(renderPostCard)}
                                    </div>
                                </div>
                            ))}
                        </section>
                    )}
                </div>
            </div>

            {allPosts.length > 0 && (
                <div className="mx-auto max-w-6xl px-4 py-12">
                    <div className="grid gap-8 lg:grid-cols-12">
                        <section className="lg:col-span-8">
                            <header className="mb-6 flex items-center justify-between">
                                <h2 className="text-2xl font-bold text-slate-900">Ultimas noticias</h2>
                                <Link
                                    href="/posts"
                                    className="text-sm font-semibold text-blue-600 hover:text-blue-700"
                                >
                                    Ver tudo
                                </Link>
                            </header>

                            <div className="space-y-6">
                                {ultimasNoticias.map((post) => (
                                    <article
                                        key={String(post.id)}
                                        className="group grid gap-6 rounded-2xl border border-slate-200 bg-white p-6 transition hover:-translate-y-1 hover:border-transparent hover:shadow-xl sm:grid-cols-4"
                                    >
                                        {post.thumbnail && (
                                            <div className="relative h-40 overflow-hidden rounded-xl sm:col-span-1">
                                                <img
                                                    src={post.thumbnail}
                                                    alt={post.title}
                                                    className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                                                />
                                            </div>
                                        )}
                                        <div className="sm:col-span-3">
                                            <div className="flex items-center gap-4 text-xs font-semibold uppercase tracking-wide text-blue-600">
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
                                                className="mt-3 text-xl font-semibold text-slate-900 transition group-hover:text-blue-600"
                                            >
                                                {post.title}
                                            </Link>
                                            <p className="mt-2 text-sm text-slate-500">
                                                {post.excerpt ?? post.content?.slice(0, 180)}
                                            </p>
                                            <div className="mt-4">
                                                <Link
                                                    href={resolveHref(post)}
                                                    className="text-sm font-semibold text-blue-600 hover:text-blue-700"
                                                >
                                                    Ler materia completa -&gt;
                                                </Link>
                                            </div>
                                        </div>
                                    </article>
                                ))}
                            </div>
                        </section>

                        <aside className="space-y-8 lg:col-span-4">
                            <section className="rounded-2xl bg-white p-6 shadow-sm">
                                <h3 className="text-xl font-bold text-slate-900">Mais lidas</h3>
                                <p className="mt-1 text-sm text-slate-500">Acompanhe as historias que estao em alta agora.</p>
                                <div className="mt-5 space-y-4">
                                    {maisLidas.map((post, index) => (
                                        <Link
                                            key={String(post.id)}
                                            href={resolveHref(post)}
                                            className="group flex gap-4 rounded-xl p-3 transition hover:bg-slate-100">
                                            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-sm font-semibold text-slate-600">
                                                {index + 1}
                                            </span>
                                            <div className="space-y-1">
                                                <h4 className="text-sm font-semibold text-slate-900 group-hover:text-blue-600">
                                                    {post.title}
                                                </h4>
                                                {post.date && <p className="text-xs text-slate-500">{post.date}</p>}
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            </section>

                            <section className="rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-500 p-6 text-white shadow-lg">
                                <h3 className="text-xl font-semibold">Receba alertas</h3>
                                <p className="mt-2 text-sm text-blue-100">Assine para receber um resumo diario com as principais manchetes.</p>
                                <a
                                    href="#newsletter"
                                    className="mt-4 inline-flex items-center justify-center rounded-full bg-white/10 px-6 py-2 text-sm font-semibold text-white transition hover:bg-white/20"
                                >
                                    Quero me inscrever
                                </a>
                            </section>
                        </aside>
                    </div>

                    <section className="mt-12">
                        <h2 className="text-2xl font-bold text-slate-900">Todas as noticias</h2>
                        <div className="mt-6 grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
                            {allPosts.map(renderPostCard)}
                        </div>

                        {posts.links && posts.links.length > 0 && (
                            <div className="mt-10 flex justify-center">
                                <div className="flex flex-wrap items-center gap-2">
                                    {posts.links.map((link, index) => {
                                        const baseClasses = `px-4 py-2 rounded-full text-sm font-semibold transition ${
                                            link.active
                                                ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30'
                                                : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                                        }`

                                        if (!link.url) {
                                            return (
                                                <span
                                                    key={index}
                                                    className={`${baseClasses} cursor-not-allowed opacity-60`}
                                                    dangerouslySetInnerHTML={{ __html: link.label }}
                                                />
                                            )
                                        }

                                        return (
                                            <Link
                                                key={index}
                                                href={link.url}
                                                className={baseClasses}
                                                dangerouslySetInnerHTML={{ __html: link.label }}
                                            />
                                        )
                                    })}
                                </div>
                            </div>
                        )}
                    </section>
                </div>
            )}
        </Layout>
    )
}










