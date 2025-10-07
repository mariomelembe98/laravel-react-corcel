import Layout from './Layout';
import { Head } from '@inertiajs/react';
import { useState } from 'react';

export default function Contact() {
    const [sent, setSent] = useState(false);

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        // 
        setSent(true);
    };

    return (
        <Layout>
            <Head title="Contacto" />
            <section className="container mx-auto px-4 py-10">
                <div className="mx-auto grid max-w-5xl gap-8 md:grid-cols-2">
                    <div className="rounded-2xl border border-slate-800 bg-gray-900/60 p-6 shadow">
                        <h1 className="mb-2 text-3xl font-bold tracking-tight text-white">Contacto</h1>
                        <p className="mb-6 text-slate-300">
                            Fale com a equipa da Revista Tempo. Estamos disponíveis para
                            parcerias editoriais, sugestões, direitos de uso de conteúdo e outros assuntos institucionais.
                        </p>

                        <div className="space-y-4 text-slate-300">
                            <div>
                                <p className="text-sm uppercase tracking-wide text-slate-400">E-mail</p>
                                <a href="mailto:contacto@revistatempo.co.mz" className="text-blue-300 hover:underline">
                                    contacto@tempo.co.mz
                                </a>
                            </div>
                            <div>
                                <p className="text-sm uppercase tracking-wide text-slate-400">Telefone</p>
                                <p className="text-slate-200">+258 00 000 000</p>
                            </div>
                            <div>
                                <p className="text-sm uppercase tracking-wide text-slate-400">Endereço</p>
                                <p className="text-slate-200">Maputo, Moçambique</p>
                            </div>
                        </div>
                    </div>

                    <div className="rounded-2xl border border-slate-800 bg-gray-900/60 p-6 shadow">
                        <h2 className="mb-4 text-xl font-semibold text-white">Envie uma mensagem</h2>
                        {sent ? (
                            <div className="rounded-xl border border-emerald-700 bg-emerald-900/30 p-4 text-emerald-200">
                                Obrigado! Recebemos a sua mensagem. Entraremos em contacto.
                            </div>
                        ) : (
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div>
                                    <label htmlFor="nome" className="mb-1 block text-sm font-medium text-slate-300">
                                        Nome
                                    </label>
                                    <input
                                        id="nome"
                                        type="text"
                                        required
                                        className="w-full rounded-xl border border-slate-700 bg-gray-900 px-3 py-2 text-slate-100 placeholder-slate-500 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30"
                                        placeholder="O seu nome"
                                    />
                                </div>
                                <div>
                                    <label htmlFor="email" className="mb-1 block text-sm font-medium text-slate-300">
                                        E-mail
                                    </label>
                                    <input
                                        id="email"
                                        type="email"
                                        required
                                        className="w-full rounded-xl border border-slate-700 bg-gray-900 px-3 py-2 text-slate-100 placeholder-slate-500 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30"
                                        placeholder="nome@exemplo.com"
                                    />
                                </div>
                                <div>
                                    <label htmlFor="mensagem" className="mb-1 block text-sm font-medium text-slate-300">
                                        Mensagem
                                    </label>
                                    <textarea
                                        id="mensagem"
                                        required
                                        rows={5}
                                        className="w-full rounded-xl border border-slate-700 bg-gray-900 px-3 py-2 text-slate-100 placeholder-slate-500 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30"
                                        placeholder="Escreva a sua mensagem"
                                    />
                                </div>
                                <div className="flex items-center justify-end">
                                    <button
                                        type="submit"
                                        className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2 text-sm font-semibold text-white shadow hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                                    >
                                        Enviar
                                    </button>
                                </div>
                               
                            </form>
                        )}
                    </div>
                </div>
            </section>
        </Layout>
    );
}

