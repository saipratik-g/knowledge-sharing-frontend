import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
    LayoutDashboard, PenSquare, Trash2, Edit2, Loader2, AlertCircle, BookOpen,
    Tag, Calendar, Eye,
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

export default function Dashboard() {
    const navigate = useNavigate();
    const [articles, setArticles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [deletingId, setDeletingId] = useState(null);

    const user = (() => {
        try { return JSON.parse(localStorage.getItem('user')); } catch { return null; }
    })();

    useEffect(() => {
        const fetchMyArticles = async () => {
            try {
                const { data } = await api.get('/articles/my');
                setArticles(Array.isArray(data) ? data : data.articles || []);
            } catch (err) {
                setError('Failed to load your articles. Please try again.');
            } finally {
                setLoading(false);
            }
        };
        fetchMyArticles();
    }, []);

    const handleDelete = async (id) => {
        if (!window.confirm('Delete this article? This action cannot be undone.')) return;
        setDeletingId(id);
        try {
            await api.delete(`/articles/${id}`);
            setArticles((prev) => prev.filter((a) => (a._id || a.id) !== id));
        } catch {
            alert('Failed to delete article. Please try again.');
        } finally {
            setDeletingId(null);
        }
    };

    return (
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10">
            {/* Page header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <LayoutDashboard size={20} className="text-brand-600" />
                        <h1 className="text-2xl font-extrabold text-slate-900">My Articles</h1>
                    </div>
                    <p className="text-slate-500 text-sm">
                        Welcome back, <span className="font-semibold text-slate-700">{user?.username || user?.email || 'there'}</span>!
                        {!loading && !error && ` You have ${articles.length} article${articles.length !== 1 ? 's' : ''}.`}
                    </p>
                </div>
                <Link to="/create" className="btn-primary shrink-0">
                    <PenSquare size={16} />
                    New Article
                </Link>
            </div>

            {/* States */}
            {loading && (
                <div className="flex justify-center items-center py-24">
                    <Loader2 size={32} className="animate-spin text-brand-600" />
                </div>
            )}

            {error && !loading && (
                <div className="flex flex-col items-center py-24 gap-3">
                    <AlertCircle size={40} className="text-red-400" />
                    <p className="text-slate-600 font-medium">{error}</p>
                    <button onClick={() => window.location.reload()} className="btn-secondary !py-1.5">
                        Retry
                    </button>
                </div>
            )}

            {!loading && !error && articles.length === 0 && (
                <div className="flex flex-col items-center py-24 gap-4">
                    <div className="w-16 h-16 rounded-2xl bg-brand-50 flex items-center justify-center">
                        <BookOpen size={28} className="text-brand-500" />
                    </div>
                    <div className="text-center">
                        <p className="text-slate-700 font-semibold text-lg">No articles yet</p>
                        <p className="text-slate-400 text-sm mt-1">Write your first article and share it with the world!</p>
                    </div>
                    <Link to="/create" className="btn-primary">
                        <PenSquare size={16} /> Write your first article
                    </Link>
                </div>
            )}

            {/* Articles list */}
            {!loading && !error && articles.length > 0 && (
                <div className="space-y-4">
                    {articles.map((article) => {
                        const artId = article._id || article.id;
                        const catColor = CATEGORY_COLORS[article.category] || 'bg-slate-100 text-slate-600';
                        return (
                            <div key={artId} className="card p-5 flex flex-col sm:flex-row gap-4">
                                {/* Content */}
                                <div className="flex-1 min-w-0">
                                    <div className="flex flex-wrap items-center gap-2 mb-2">
                                        {article.category && (
                                            <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${catColor}`}>
                                                {article.category}
                                            </span>
                                        )}
                                        {article.createdAt && (
                                            <span className="flex items-center gap-1 text-xs text-slate-400">
                                                <Calendar size={11} />
                                                {new Date(article.createdAt).toLocaleDateString('en-US', {
                                                    year: 'numeric', month: 'short', day: 'numeric',
                                                })}
                                            </span>
                                        )}
                                    </div>
                                    <h2 className="text-base font-bold text-slate-900 mb-1 truncate">{article.title}</h2>
                                    <p className="text-sm text-slate-500 line-clamp-2 leading-relaxed">
                                        {article.shortSummary || article.summary || 'No summary.'}
                                    </p>
                                    {article.tags?.length > 0 && (
                                        <div className="flex flex-wrap gap-1.5 mt-2">
                                            {(typeof article.tags === 'string'
                                                ? article.tags.split(',').map(t => t.trim()).filter(Boolean)
                                                : article.tags
                                            ).slice(0, 4).map((tag) => (
                                                <span key={tag} className="flex items-center gap-1 text-xs text-slate-400 bg-slate-50 border border-slate-100 px-2 py-0.5 rounded-full">
                                                    <Tag size={9} />{tag}
                                                </span>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                {/* Actions */}
                                <div className="flex sm:flex-col gap-2 sm:gap-2 items-center sm:items-end justify-end shrink-0">
                                    <Link to={`/articles/${artId}`} className="btn-secondary !py-1.5 !text-xs">
                                        <Eye size={13} /> View
                                    </Link>
                                    <button
                                        onClick={() => navigate(`/create?id=${artId}`)}
                                        className="btn-secondary !py-1.5 !text-xs"
                                    >
                                        <Edit2 size={13} /> Edit
                                    </button>
                                    <button
                                        onClick={() => handleDelete(artId)}
                                        disabled={deletingId === artId}
                                        className="btn-danger !py-1.5 !text-xs"
                                    >
                                        {deletingId === artId ? (
                                            <Loader2 size={13} className="animate-spin" />
                                        ) : (
                                            <Trash2 size={13} />
                                        )}
                                        Delete
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
