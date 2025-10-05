import Layout from '../Layout';
import { Link } from '@inertiajs/react';


export default function ByCategory({ category, posts }) {
    return (
        <Layout>
            <div className="container mx-auto px-4 py-8">
            <h1 className="text-2xl font-bold mb-4">Categoria: {category.name}</h1>
            <div className="grid md:grid-cols-3 gap-6">
                {posts.data.map((p) => (
                    <Link key={p.id} href={`/posts/${p.slug || p.id}`} className="block bg-white rounded-xl p-4 shadow hover:shadow-md transition">
                        {p.thumbnail && <img src={p.thumbnail} alt={p.title} className="w-full h-40 object-cover rounded-lg mb-3" />}
                        <h3 className="font-semibold line-clamp-2">{p.title}</h3>
                        <p className="text-sm text-gray-500 mt-1">{p.date} • {p.author}</p>
                    </Link>
                ))}
            </div>
        </div>
        </Layout>
    );
}