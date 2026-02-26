import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';
import {
    Save, Sparkles, Loader2, AlertCircle, CheckCircle, Tag, ChevronDown,
} from 'lucide-react';
import api from '../api';

const CATEGORIES = ['Tech', 'AI', 'Backend', 'Frontend', 'DevOps', 'Career'];

const QUILL_MODULES = {
    toolbar: [
        [{ header: [1, 2, 3, false] }],
        ['bold', 'italic', 'underline', 'strike'],
        [{ list: 'ordered' }, { list: 'bullet' }],
        ['blockquote', 'code-block'],
        ['link', 'image'],
        ['clean'],
    ],
};

export default function CreateArticle() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const editId = searchParams.get('id');
    const isEdit = Boolean(editId);

    const [form, setForm] = useState({
        title: '',
        summary: '',
        category: 'Tech',
        tags: '',
        body: '',
    });
    const [loading, setLoading] = useState(false);
    const [aiLoading, setAiLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [fetching, setFetching] = useState(isEdit);
    const quillRef = useRef(null);

    // Load existing article in edit mode
    useEffect(() => {
        if (!isEdit) return;
        const fetchArticle = async () => {
            try {
                const { data } = await api.get(`/articles/${editId}`);
                const a = data.article || data;
                setForm({
                    title: a.title || '',
                    summary: a.summary || '',
                    category: a.category || 'Tech',
                    tags: Array.isArray(a.tags) ? a.tags.join(', ') : (a.tags || ''),
                    body: a.body || a.content || '',
                });
            } catch {
                setError('Failed to load article for editing.');
            } finally {
                setFetching(false);
            }
        };
        fetchArticle();
    }, [isEdit, editId]);

    const handleChange = (e) =>
        setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

    const handleBodyChange = (value) =>
        setForm((prev) => ({ ...prev, body: value }));

    const handleAiImprove = async () => {
        if (!form.body || form.body === '<p><br></p>') {
            setError('Please write some content before using AI Improve.');
            return;
        }
        setAiLoading(true);
        setError('');
        try {
            const { data } = await api.post('/ai/improve', { content: form.body });
            const improved = data.improved || data.content || data.result;
            if (improved) {
                setForm((prev) => ({ ...prev, body: improved }));
                setSuccess('✨ Article improved by AI!');
                setTimeout(() => setSuccess(''), 4000);
            }
        } catch (err) {
            setError(err.response?.data?.message || 'AI service unavailable. Please try again.');
        } finally {
            setAiLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.title.trim()) { setError('Title is required.'); return; }
        if (!form.body || form.body === '<p><br></p>') { setError('Article body is required.'); return; }

        setError('');
        setLoading(true);
        const payload = {
            title: form.title,
            category: form.category,
            content: form.body,           // backend expects 'content'
            shortSummary: form.summary,   // backend expects 'shortSummary'
            tags: form.tags
                .split(',')
                .map((t) => t.trim())
                .filter(Boolean)
                .join(','),
        };
        try {
            if (isEdit) {
                await api.put(`/articles/${editId}`, payload);
                setSuccess('Article updated successfully!');
            } else {
                await api.post('/articles', payload);
                setSuccess('Article published successfully!');
            }
            setTimeout(() => navigate('/dashboard'), 1200);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to save article.');
        } finally {
            setLoading(false);
        }
    };

    if (fetching) {
        return (
            <div className="flex justify-center items-center min-h-[60vh]">
                <Loader2 size={36} className="animate-spin text-brand-600" />
            </div>
        );
    }

    return (
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10">
            <div className="mb-8">
                <h1 className="text-3xl font-extrabold text-slate-900">
                    {isEdit ? 'Edit Article' : 'Write a New Article'}
                </h1>
                <p className="text-slate-500 text-sm mt-1">
                    {isEdit ? 'Update your article details below.' : 'Share your knowledge with the community.'}
                </p>
            </div>

            {/* Alerts */}
            {error && (
                <div className="flex items-center gap-2 p-3 mb-5 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
                    <AlertCircle size={16} className="shrink-0" />
                    {error}
                </div>
            )}
            {success && (
                <div className="flex items-center gap-2 p-3 mb-5 bg-green-50 border border-green-200 rounded-xl text-green-700 text-sm">
                    <CheckCircle size={16} className="shrink-0" />
                    {success}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-5">
                    {/* Title */}
                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-1.5">Title *</label>
                        <input
                            type="text"
                            name="title"
                            value={form.title}
                            onChange={handleChange}
                            placeholder="E.g. Understanding React Hooks"
                            required
                            className="input-field"
                        />
                    </div>

                    {/* Summary */}
                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-1.5">Short Summary</label>
                        <textarea
                            name="summary"
                            value={form.summary}
                            onChange={handleChange}
                            placeholder="A brief description of your article (shown on the cards)…"
                            rows={3}
                            className="input-field resize-none"
                        />
                    </div>

                    {/* Category + Tags row */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Category</label>
                            <div className="relative">
                                <select
                                    name="category"
                                    value={form.category}
                                    onChange={handleChange}
                                    className="input-field appearance-none pr-9"
                                >
                                    {CATEGORIES.map((cat) => (
                                        <option key={cat} value={cat}>{cat}</option>
                                    ))}
                                </select>
                                <ChevronDown size={15} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                                <Tag size={13} className="inline mr-1" />
                                Tags <span className="font-normal text-slate-400">(comma-separated)</span>
                            </label>
                            <input
                                type="text"
                                name="tags"
                                value={form.tags}
                                onChange={handleChange}
                                placeholder="react, hooks, typescript"
                                className="input-field"
                            />
                        </div>
                    </div>
                </div>

                {/* Body editor */}
                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
                    <div className="flex items-center justify-between mb-3">
                        <label className="text-sm font-semibold text-slate-700">Article Body *</label>
                        <button
                            type="button"
                            onClick={handleAiImprove}
                            disabled={aiLoading}
                            className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-violet-600 to-brand-600 hover:from-violet-700 hover:to-brand-700 text-white text-xs font-semibold rounded-xl transition-all shadow-sm disabled:opacity-60"
                        >
                            {aiLoading ? (
                                <Loader2 size={13} className="animate-spin" />
                            ) : (
                                <Sparkles size={13} />
                            )}
                            {aiLoading ? 'Improving…' : 'Improve with AI'}
                        </button>
                    </div>
                    <ReactQuill
                        ref={quillRef}
                        theme="snow"
                        value={form.body}
                        onChange={handleBodyChange}
                        modules={QUILL_MODULES}
                        placeholder="Write your article here…"
                    />
                </div>

                {/* Submit */}
                <div className="flex justify-end gap-3">
                    <button
                        type="button"
                        onClick={() => navigate(-1)}
                        className="btn-secondary"
                    >
                        Cancel
                    </button>
                    <button type="submit" disabled={loading} className="btn-primary">
                        {loading ? (
                            <Loader2 size={16} className="animate-spin" />
                        ) : (
                            <Save size={16} />
                        )}
                        {loading ? 'Saving…' : isEdit ? 'Update Article' : 'Publish Article'}
                    </button>
                </div>
            </form>
        </div>
    );
}
