import { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { ArrowLeft, FloppyDisk, Eye, PencilSimple } from '@phosphor-icons/react';
import ReactMarkdown from 'react-markdown';
import { API_URL } from '../../config';
import { blogPosts as fallbackPosts } from '../../data';

const categories = [
  'Land Surveying',
  'Real Estate & Laws',
  'Engineering Survey',
  'Digital Mapping & GIS',
  'Technology & Equipment',
  'Advisory & Tips'
];

const BlogForm = () => {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    category: 'Land Surveying',
    author: 'Sourceline Team',
    excerpt: '',
    content: '',
    image: ''
  });

  const [loading, setLoading] = useState(isEdit);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [previewTab, setPreviewTab] = useState(false);

  useEffect(() => {
    if (isEdit) {
      const fetchArticle = async () => {
        try {
          const res = await fetch(`${API_URL}/blog/${id}`);
          if (res.ok) {
            const data = await res.json();
            setFormData({
              title: data.title || '',
              slug: data.slug || '',
              category: data.category || 'Land Surveying',
              author: data.author || 'Sourceline Team',
              excerpt: data.excerpt || '',
              content: data.content || '',
              image: data.image || ''
            });
          } else {
            const fallback = fallbackPosts.find(p => String(p.id) === id || p.slug === id);
            if (fallback) {
              setFormData({
                title: fallback.title || '',
                slug: fallback.slug || '',
                category: fallback.category || 'Land Surveying',
                author: fallback.author || 'Sourceline Team',
                excerpt: fallback.excerpt || '',
                content: fallback.content || '',
                image: fallback.image || ''
              });
            }
          }
        } catch {
          const fallback = fallbackPosts.find(p => String(p.id) === id || p.slug === id);
          if (fallback) setFormData(fallback);
        } finally {
          setLoading(false);
        }
      };
      fetchArticle();
    }
  }, [id, isEdit]);

  const generateSlug = (title) => {
    return title
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-');
  };

  const handleTitleChange = (e) => {
    const newTitle = e.target.value;
    setFormData(prev => ({
      ...prev,
      title: newTitle,
      slug: isEdit && prev.slug ? prev.slug : generateSlug(newTitle)
    }));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    const token = localStorage.getItem('token');
    const url = isEdit ? `${API_URL}/blog/${id}` : `${API_URL}/blog`;
    const method = isEdit ? 'PUT' : 'POST';

    try {
      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      if (res.ok) {
        navigate('/admin/blog');
      } else {
        const errData = await res.json();
        setError(errData.message || 'Failed to save blog post');
      }
    } catch {
      setError('Network error saving article. Please verify backend connection.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="py-20 text-center text-gray-500">
        <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin mx-auto mb-3" />
        Loading article details...
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-16">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Link
          to="/admin/blog"
          className="inline-flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-gray-900 transition"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Articles
        </Link>
        <span className="text-xs font-semibold uppercase tracking-wider text-primary">
          {isEdit ? 'Edit Article' : 'New Article'}
        </span>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900">
            {isEdit ? 'Update Article' : 'Draft New Article'}
          </h2>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setPreviewTab(!previewTab)}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                previewTab ? 'bg-primary text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {previewTab ? <PencilSimple className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
              {previewTab ? 'Edit Mode' : 'Preview Mode'}
            </button>
          </div>
        </div>

        {error && (
          <div className="m-6 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm">
            {error}
          </div>
        )}

        {previewTab ? (
          <div className="p-8 prose prose-headings:font-display max-w-none">
            <h1>{formData.title || 'Untitled Article'}</h1>
            <p className="text-gray-400 text-xs uppercase tracking-wider font-semibold">
              {formData.category} · By {formData.author}
            </p>
            {formData.image && (
              <img src={formData.image} alt="" className="rounded-xl w-full max-h-80 object-cover my-4" />
            )}
            {formData.excerpt && (
              <p className="text-lg text-gray-600 italic border-l-4 border-primary pl-4">{formData.excerpt}</p>
            )}
            <hr className="my-6" />
            <ReactMarkdown>{formData.content || '*No content written yet.*'}</ReactMarkdown>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Title */}
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                Article Title *
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleTitleChange}
                placeholder="e.g. 5 Critical Signs of Land Fraud in Lagos State"
                required
                className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary font-medium"
              />
            </div>

            {/* Slug */}
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                URL Slug *
              </label>
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-400 font-mono">/blog/</span>
                <input
                  type="text"
                  name="slug"
                  value={formData.slug}
                  onChange={handleChange}
                  required
                  className="flex-1 px-4 py-2 bg-gray-50 border border-gray-300 rounded-xl text-xs font-mono focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
              </div>
            </div>

            {/* Category & Author */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                  Category *
                </label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                >
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                  Author *
                </label>
                <input
                  type="text"
                  name="author"
                  value={formData.author}
                  onChange={handleChange}
                  required
                  placeholder="e.g. Surv. Oladipupo"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
              </div>
            </div>

            {/* Featured Image URL */}
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                Featured Image URL
              </label>
              <input
                type="text"
                name="image"
                value={formData.image}
                onChange={handleChange}
                placeholder="https://... or /images/..."
                className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary font-mono text-xs"
              />
              {formData.image && (
                <div className="mt-3 w-40 h-24 rounded-lg overflow-hidden border border-gray-200">
                  <img src={formData.image} alt="Preview" className="w-full h-full object-cover" />
                </div>
              )}
            </div>

            {/* Excerpt */}
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                Short Excerpt (Summary) *
              </label>
              <textarea
                name="excerpt"
                rows="2"
                value={formData.excerpt}
                onChange={handleChange}
                required
                placeholder="Brief summary shown on social media and preview cards..."
                className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
            </div>

            {/* Content Markdown */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider">
                  Full Article Body (Markdown Supported) *
                </label>
                <span className="text-xs text-gray-400">Supports headers (##), lists, bold, blockquotes</span>
              </div>
              <textarea
                name="content"
                rows="14"
                value={formData.content}
                onChange={handleChange}
                required
                placeholder="Write your article content using markdown..."
                className="w-full px-4 py-3 border border-gray-300 rounded-xl text-sm font-mono leading-relaxed focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
            </div>

            {/* Submit */}
            <div className="pt-4 border-t border-gray-100 flex justify-end gap-3">
              <Link
                to="/admin/blog"
                className="px-5 py-2.5 border border-gray-300 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 transition"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={submitting}
                className="inline-flex items-center gap-2 px-6 py-2.5 bg-primary text-white rounded-xl text-sm font-bold shadow-primary-glow hover:bg-primary-dark transition disabled:opacity-50"
              >
                {submitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <FloppyDisk className="h-4 w-4" />
                    {isEdit ? 'Update Article' : 'Publish Article'}
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default BlogForm;
