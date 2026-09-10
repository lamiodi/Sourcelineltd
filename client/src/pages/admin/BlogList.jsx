import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Plus, 
  PencilSimple, 
  Trash, 
  Article, 
  Eye, 
  MagnifyingGlass as Search,
  ArrowsClockwise,
  CalendarBlank
} from '@phosphor-icons/react';
import { API_URL } from '../../config';
import { blogPosts as fallbackPosts } from '../../data';

const BlogList = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [deletingId, setDeletingId] = useState(null);

  const fetchPosts = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/blog`);
      if (res.ok) {
        const data = await res.json();
        setPosts(Array.isArray(data) && data.length > 0 ? data : fallbackPosts);
      } else {
        setPosts(fallbackPosts);
      }
    } catch {
      setPosts(fallbackPosts);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this blog post?')) return;
    setDeletingId(id);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_URL}/blog/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (res.ok) {
        setPosts(prev => prev.filter(p => p.id !== id));
      }
    } catch (err) {
      console.error('Error deleting post:', err);
    } finally {
      setDeletingId(null);
    }
  };

  const filteredPosts = posts.filter(p =>
    (p.title && p.title.toLowerCase().includes(search.toLowerCase())) ||
    (p.category && p.category.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2.5">
            <Article className="text-primary h-7 w-7" />
            Blog & Articles Manager
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Create, edit, and publish survey educational articles and news.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchPosts}
            className="inline-flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition"
          >
            <ArrowsClockwise className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
          <Link
            to="/admin/blog/new"
            className="inline-flex items-center gap-2 px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary-dark transition"
          >
            <Plus className="h-4 w-4" />
            Write Article
          </Link>
        </div>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        <input
          type="text"
          placeholder="Search articles by title or category..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
        />
      </div>

      {/* Table */}
      <div className="bg-white shadow rounded-xl border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="py-16 text-center text-gray-400 flex flex-col items-center justify-center">
            <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin mb-3" />
            Loading articles...
          </div>
        ) : filteredPosts.length === 0 ? (
          <div className="py-16 text-center text-gray-400">
            <Article className="h-10 w-10 mx-auto text-gray-300 mb-2" />
            <p className="font-medium text-gray-600">No articles found</p>
            <Link
              to="/admin/blog/new"
              className="mt-3 inline-flex items-center gap-1.5 text-xs font-bold text-primary hover:underline"
            >
              <Plus className="h-3.5 w-3.5" /> Publish the first article
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 text-sm">
              <thead className="bg-gray-50 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-3.5 text-left">Article</th>
                  <th className="px-6 py-3.5 text-left">Category</th>
                  <th className="px-6 py-3.5 text-left">Author</th>
                  <th className="px-6 py-3.5 text-left">Date</th>
                  <th className="px-6 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {filteredPosts.map((post) => (
                  <tr key={post.id || post.slug} className="hover:bg-gray-50/80 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-lg bg-gray-100 overflow-hidden shrink-0 border border-gray-200">
                          {post.image ? (
                            <img src={post.image} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-400">
                              <Article className="h-5 w-5" />
                            </div>
                          )}
                        </div>
                        <div className="max-w-md">
                          <p className="font-semibold text-gray-900 line-clamp-1">{post.title}</p>
                          <p className="text-xs text-gray-400 line-clamp-1 mt-0.5">{post.excerpt || 'No excerpt'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
                        {post.category || 'General'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-xs text-gray-600">
                      {post.author || 'Sourceline Team'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-xs text-gray-500 font-mono">
                      <div className="flex items-center gap-1.5">
                        <CalendarBlank className="h-3.5 w-3.5 text-gray-400" />
                        {new Date(post.published_at || post.date || Date.now()).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right space-x-2">
                      <Link
                        to={`/blog/${post.slug || post.id}`}
                        target="_blank"
                        className="inline-flex items-center p-1.5 text-gray-400 hover:text-gray-700 rounded-lg hover:bg-gray-100 transition"
                        title="View Live Article"
                      >
                        <Eye className="h-4 w-4" />
                      </Link>
                      <Link
                        to={`/admin/blog/edit/${post.id}`}
                        className="inline-flex items-center p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                        title="Edit Article"
                      >
                        <PencilSimple className="h-4 w-4" />
                      </Link>
                      <button
                        onClick={() => handleDelete(post.id)}
                        disabled={deletingId === post.id}
                        className="inline-flex items-center p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition disabled:opacity-50"
                        title="Delete Article"
                      >
                        <Trash className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default BlogList;
