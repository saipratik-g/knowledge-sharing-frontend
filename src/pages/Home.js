import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Search, Tag, BookOpen, User, ChevronRight, Loader2, AlertCircle, Filter } from 'lucide-react';
import api from '../api';

const CATEGORIES = ['All', 'Tech', 'AI', 'Backend', 'Frontend', 'DevOps', 'Career'];

const CATEGORY_COLORS = {
    Tech: 'bg-blue-100 text-blue-700',
    AI: 'bg-purple-100 text-purple-700',
    Backend: 'bg-orange-100 text-orange-700',
    Frontend: 'bg-pink-100 text-pink-700',
    DevOps: 'bg-green-100 text-green-700',
    Career: 'bg-yellow-100 text-yellow-700',
};

function ArticleCard({ article }) {
    const catColor = CATEGORY_COLORS[article.category] || 'bg-slate-100 text-slate-600';
    return (
        <Link
            to={`/articles/${article._id || article.id}`}
            className="card group flex flex-col p-6 hover:border-brand-200 cursor-pointer"
        >
            {/* Category + reading time */}
            <div className="flex items-center justify-between mb-3">
                <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${catColor}`}>
                    {article.category || 'General'}
                </span>
                {article.readTime && (
                    <span className="text-xs text-slate-400">{article.readTime} min read</span>
                )}
            </div>

            {/* Title */}
            <h2 className="text-lg font-bold text-slate-900 mb-2 group-hover:text-brand-700 transition-colors line-clamp-2 leading-snug">
                {article.title}
            </h2>

            {/* Summary */}
            <p className="text-sm text-slate-500 leading-relaxed line-clamp-3 flex-1">
                {article.shortSummary || article.summary || article.description || 'No summary available.'}
            </p>

            {/* Tags */}
            {article.tags?.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-3">
                    {(typeof article.tags === 'string'
                        ? article.tags.split(',').map(t => t.trim()).filter(Boolean)
                        : article.tags
                    ).slice(0, 3).map((tag) => (
                        <span key={tag} className="flex items-center gap-1 text-xs text-slate-500 bg-slate-50 border border-slate-100 px-2 py-0.5 rounded-full">
                            <Tag size={10} />
                            {tag}
                        </span>
                    ))}
                </div>
            )}

            {/* Footer */}
            <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-100">
                <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-brand-100 flex items-center justify-center">
                        <User size={13} className="text-brand-700" />
                    </div>
                    <span className="text-xs font-medium text-slate-600">
                        {article.author?.username || article.author?.name || article.authorName || 'Anonymous'}
                    </span>
                </div>
                <span className="text-brand-600 text-xs font-semibold flex items-center gap-1 group-hover:gap-2 transition-all">
                    Read more <ChevronRight size={14} />
                </span>
            </div>
        </Link>
    );
}

export default function Home() {
    const [articles, setArticles] = useState([]);
    const [filtered, setFiltered] = useState([]);
    const [search, setSearch] = useState('');
    const [activeCategory, setActiveCategory] = useState('All');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchArticles = async () => {
            try {
                const { data } = await api.get('/articles');
                const list = Array.isArray(data) ? data : data.articles || [];
                setArticles(list);
                setFiltered(list);
            } catch (err) {
                setError('Failed to load articles. Please try again later.');
            } finally {
                setLoading(false);
            }
        };
        fetchArticles();
    }, []);

    const applyFilters = useCallback(
        (query, category) => {
            let result = articles;
            if (category !== 'All') {
                result = result.filter(
                    (a) => a.category?.toLowerCase() === category.toLowerCase()
                );
            }
            if (query.trim()) {
                const q = query.toLowerCase();
                result = result.filter(
                    (a) => {
                        const tagList = typeof a.tags === 'string'
                            ? a.tags.split(',').map(t => t.trim())
                            : (a.tags || []);
                        return a.title?.toLowerCase().includes(q) ||
                            tagList.some((t) => t.toLowerCase().includes(q));
                    }
                );
            }
            setFiltered(result);
        },
        [articles]
    );

    useEffect(() => {
        applyFilters(search, activeCategory);
    }, [search, activeCategory, applyFilters]);

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
            {/* Hero */}
            <div className="text-center mb-10">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-brand-50 border border-brand-100 rounded-full text-brand-700 text-xs font-semibold mb-4">
                    <BookOpen size={14} />
                    Knowledge Sharing Platform
                </div>
                <h1 className="text-4xl sm:text-5xl font-extrabold text-slate-900 leading-tight mb-3">
                    Discover and Share <br />
                    <span className="text-brand-600">Technical Knowledge</span>
                </h1>
                <p className="text-slate-500 text-lg max-w-lg mx-auto">
                    Read articles written by engineers. Learn, grow, and share your own expertise.
                </p>
            </div>

            {/* Search + filter bar */}
            <div className="bg-white border border-slate-100 rounded-2xl shadow-sm p-4 mb-8 flex flex-col sm:flex-row gap-3">
                {/* Search */}
                <div className="relative flex-1">
                    <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Search by title or tags…"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="input-field pl-10"
                    />
                </div>
                {/* Category chips */}
                <div className="flex items-center gap-1 flex-wrap">
                    <Filter size={14} className="text-slate-400 mr-1 shrink-0" />
                    {CATEGORIES.map((cat) => (
                        <button
                            key={cat}
                            onClick={() => setActiveCategory(cat)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${activeCategory === cat
                                ? 'bg-brand-600 text-white shadow-sm'
                                : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-100'
                                }`}
                        >
                            {cat}
                        </button>
                    ))}
                </div>
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
                </div>
            )}

            {!loading && !error && filtered.length === 0 && (
                <div className="flex flex-col items-center py-24 gap-3">
                    <BookOpen size={40} className="text-slate-300" />
                    <p className="text-slate-500 font-medium">No articles found.</p>
                    {(search || activeCategory !== 'All') && (
                        <button
                            onClick={() => { setSearch(''); setActiveCategory('All'); }}
                            className="btn-secondary !py-1.5 !text-xs"
                        >
                            Clear filters
                        </button>
                    )}
                </div>
            )}

            {/* Article grid */}
            {!loading && !error && filtered.length > 0 && (
                <>
                    <p className="text-sm text-slate-400 mb-4 font-medium">
                        {filtered.length} article{filtered.length !== 1 ? 's' : ''} found
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filtered.map((article) => (
                            <ArticleCard key={article._id || article.id} article={article} />
                        ))}
                    </div>
                </>
            )}
        </div>
    );
}
