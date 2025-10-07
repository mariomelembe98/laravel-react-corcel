import Layout from './Layout';
import { Head } from '@inertiajs/react';

export default function About() {
    return (
        <Layout>
            <Head title="Sobre Nós" />
            <section className="container mx-auto px-4 py-10">
                <div className="mx-auto max-w-4xl">
                    <header className="mb-8 text-center">
                        <h1 className="text-3xl font-bold tracking-tight text-white">Sobre Nós</h1>
                        <p className="mt-2 text-slate-300">Revista Tempo — Moçambique</p>
                    </header>

                    <div className="space-y-8">
                        <article className="rounded-2xl border border-slate-800 bg-gray-900/60 p-6 shadow">
                            <h2 className="mb-3 text-xl font-semibold text-white">Quem Somos</h2>
                            <p className="text-slate-300">
                                A Revista Tempo é uma publicação moçambicana de referência, dedicada ao jornalismo
                                rigoroso, à reportagem aprofundada e à análise de temas que impactam o país e a região.
                                Trabalhamos para informar com qualidade, contexto e independência editorial, valorizando
                                a pluralidade de vozes e o interesse público.
                            </p>
                        </article>

                        <article className="rounded-2xl border border-slate-800 bg-gray-900/60 p-6 shadow">
                            <h2 className="mb-3 text-xl font-semibold text-white">Missão</h2>
                            <p className="text-slate-300">
                                Produzir jornalismo responsável e acessível, promovendo transparência, cidadania e
                                desenvolvimento em Moçambique, com conteúdos que informam, explicam e inspiram.
                            </p>
                        </article>

                        <article className="rounded-2xl border border-slate-800 bg-gray-900/60 p-6 shadow">
                            <h2 className="mb-3 text-xl font-semibold text-white">Visão</h2>
                            <p className="text-slate-300">
                                Ser a plataforma de referência em informação e análise em Moçambique, aliando
                                tradição jornalística a inovação digital, para servir melhor os nossos leitores.
                            </p>
                        </article>

                        <article className="rounded-2xl border border-slate-800 bg-gray-900/60 p-6 shadow">
                            <h2 className="mb-3 text-xl font-semibold text-white">Valores</h2>
                            <ul className="list-inside list-disc space-y-1 text-slate-300">
                                <li>Independência editorial e integridade</li>
                                <li>Rigor, verificação e contexto</li>
                                <li>Serviço público e responsabilidade social</li>
                                <li>Respeito pela diversidade e inclusão</li>
                                <li>Inovação e melhoria contínua</li>
                            </ul>
                        </article>

                        <article className="rounded-2xl border border-slate-800 bg-gray-900/60 p-6 shadow">
                            <h2 className="mb-3 text-xl font-semibold text-white">A Nossa História</h2>
                            <p className="text-slate-300">
                                A marca Tempo faz parte do património do jornalismo moçambicano. Ao longo dos anos,
                                consolidou um legado de reportagem e análise, acompanhando momentos decisivos do país.
                                Esta presença histórica inspira o trabalho actual, com foco na qualidade editorial e na
                                relevância para os leitores de hoje.
                            </p>
                            
                        </article>
                    </div>
                </div>
            </section>
        </Layout>
    );
}

