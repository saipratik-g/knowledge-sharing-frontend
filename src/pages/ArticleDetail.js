import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
    ArrowLeft, User, Calendar, Tag, BookOpen, Loader2, AlertCircle, Edit2, Trash2,
} from 'lucide-react';
import api from '../api';

const CATEGORY_COLORS = {
    Tech: 'bg-blue-100 text-blue-700',
    AI: 'bg-purple-100 text-purple-700',
    Backend: 'bg-orange-100 text-orange-700',
    Frontend: 'bg-pink-100 text-pink-700',
    DevOps: 'bg-green-100 text-green-700',
    Career: 'bg-yellow-100 text-yellow-700',
};

export default function ArticleDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [article, setArticle] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const currentUser = (() => {
        try { return JSON.parse(localStorage.getItem('user')); } catch { return null; }
    })();

    useEffect(() => {
        const fetchArticle = async () => {
            try {
                const { data } = await api.get(`/articles/${id}`);
                setArticle(data.article || data);
            } catch (err) {
                setError('Article not found or failed to load.');
            } finally {
                setLoading(false);
            }
        };
        fetchArticle();
    }, [id]);

    const handleDelete = async () => {
        if (!window.confirm('Are you sure you want to delete this article?')) return;
        try {
            await api.delete(`/articles/${id}`);
            navigate('/dashboard');
        } catch {
            alert('Failed to delete article.');
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-[60vh]">
                <Loader2 size={36} className="animate-spin text-brand-600" />
            </div>
        );
    }

    if (error || !article) {
        return (
            <div className="flex flex-col items-center py-24 gap-3">
                <AlertCircle size={40} className="text-red-400" />
                <p className="text-slate-600 font-medium">{error || 'Article not found.'}</p>
                <Link to="/" className="btn-primary !py-1.5">Go home</Link>
            </div>
        );
    }

    const authorName = article.author?.username || article.author?.name || article.authorName || 'Anonymous';
    const catColor = CATEGORY_COLORS[article.category] || 'bg-slate-100 text-slate-600';
    const isOwner = currentUser && (currentUser.id === article.userId);

    return (
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10">
            {/* Back */}
            <Link
                to="/"
                className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-800 font-medium mb-6 group transition-colors"
            >
                <ArrowLeft size={16} className="group-hover:-translate-x-0.5 transition-transform" />
                Back to articles
            </Link>

            {/* Article card */}
            <article className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                {/* Header */}
                <div className="p-8 pb-6 border-b border-slate-100">
                    <div className="flex items-center gap-2 mb-4">
                        {article.category && (
                            <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${catColor}`}>
                                {article.category}
                            </span>
                        )}
                        {article.readTime && (
                            <span className="flex items-center gap-1 text-xs text-slate-400">
                                <BookOpen size={12} />
                                {article.readTime} min read
                            </span>
                        )}
                    </div>

                    <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 leading-tight mb-4">
                        {article.title}
                    </h1>

                    {(article.shortSummary || article.summary) && (
                        <p className="text-slate-500 text-lg leading-relaxed mb-5">{article.shortSummary || article.summary}</p>
                    )}

                    {/* Meta row */}
                    <div className="flex flex-wrap items-center gap-4 text-sm text-slate-500">
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-brand-100 flex items-center justify-center">
                                <User size={14} className="text-brand-700" />
                            </div>
                            <span className="font-semibold text-slate-700">{authorName}</span>
                        </div>
                        {article.createdAt && (
                            <div className="flex items-center gap-1.5">
                                <Calendar size={14} />
                                {new Date(article.createdAt).toLocaleDateString('en-US', {
                                    year: 'numeric', month: 'long', day: 'numeric',
                                })}
                            </div>
                        )}
                    </div>

                    {/* Tags */}
                    {article.tags?.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-4">
                            {(typeof article.tags === 'string'
                                ? article.tags.split(',').map(t => t.trim()).filter(Boolean)
                                : article.tags
                            ).map((tag) => (
                                <span
                                    key={tag}
                                    className="flex items-center gap-1 text-xs text-slate-500 bg-slate-50 border border-slate-100 px-2.5 py-1 rounded-full"
                                >
                                    <Tag size={10} />
                                    {tag}
                                </span>
                            ))}
                        </div>
                    )}

                    {/* Owner actions */}
                    {isOwner && (
                        <div className="flex gap-2 mt-5">
                            <button
                                onClick={() => navigate(`/create?id=${id}`)}
                                className="btn-secondary !py-1.5 !text-xs"
                            >
                                <Edit2 size={13} /> Edit
                            </button>
                            <button onClick={handleDelete} className="btn-danger !py-1.5 !text-xs">
                                <Trash2 size={13} /> Delete
                            </button>
                        </div>
                    )}
                </div>

                {/* Body */}
                <div
                    className="prose prose-slate max-w-none p-8 text-slate-700 leading-relaxed"
                    dangerouslySetInnerHTML={{ __html: article.body || article.content || '' }}
                />
            </article>
        </div>
    );
}
