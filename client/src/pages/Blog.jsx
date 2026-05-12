import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, User, ArrowRight, FileText, MagnifyingGlass as Search, Tag, Clock, X } from '@phosphor-icons/react';
import SEO from '../components/SEO';
import useScrollReveal from '../hooks/useScrollReveal';
import { blogPosts } from '../data';

/* useScrollReveal imported from shared hooks */

const Blog = () => {
  const posts = blogPosts;
  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  useScrollReveal();

  const categories = ['All', ...new Set(posts.map(p => p.category).filter(Boolean))];

  const filteredPosts = posts.filter(post => {
    const q = search.toLowerCase();
    const matchesSearch = !q ||
      post.title?.toLowerCase().includes(q) ||
      post.excerpt?.toLowerCase().includes(q);
    const matchesCategory = activeCategory === 'All' || post.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  const handleSubscribe = async (e) => {
    e.preventDefault();
    if (!email) return;

    setSubmitting(true);
    setMessage({ type: '', text: '' });

    // Simulate API call since backend is not connected
    setTimeout(() => {
      setMessage({ type: 'success', text: 'Subscribed successfully!' });
      setEmail('');
      setSubmitting(false);
    }, 1000);
  };

  return (
    <div className="font-sans">
      <SEO
        title="Blog & News"
        description="Latest insights, tips, and industry news on land surveying, real estate, and property development in Nigeria."
      />

      {/* ─── PAGE HERO ───────────────────────────────────────── */}
      <section className="relative py-20 md:py-28 overflow-hidden bg-secondary">
        <div className="absolute inset-0">
          <img src="/images/20250515_134156.jpg.jpeg" alt="Blog Hero"
            className="w-full h-full object-cover opacity-15 animate-ken-burns" />
        </div>
        <div className="absolute inset-0 bg-gradient-to-br from-secondary via-secondary/95 to-secondary-light" />
        <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-primary/10 rounded-full blur-[100px] translate-x-1/3 -translate-y-1/3 pointer-events-none" />
        <div className="absolute inset-0 opacity-[0.02]" style={{ backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize: '32px 32px' }} />

        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <div className="inline-flex items-center gap-2.5 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-5 py-2.5 mb-8 animate-fade-in">
            <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            <span className="text-white/90 text-xs font-bold uppercase tracking-[0.15em]">Insights & Updates</span>
          </div>
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-display font-bold text-white tracking-tight mb-6 leading-[1.05] animate-fade-in-up">
            News & <span className="text-primary italic font-medium">Insights</span>
          </h1>
          <p className="text-xl text-white/60 max-w-2xl mx-auto leading-relaxed animate-fade-in-up animation-delay-200">
            Stay informed with the latest insights, tips, and industry news from our experts.
          </p>
        </div>
      </section>

      {/* ─── BLOG GRID ───────────────────────────────────────── */}
      <section className="py-12 md:py-24 bg-white relative overflow-hidden">
        <div className="absolute inset-0 bg-mesh-gradient pointer-events-none" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">

          {/* Search Bar */}
          <div className="max-w-xl mx-auto mb-8">
            <div className="relative group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 group-focus-within:text-primary transition-colors" />
              <input
                type="text"
                placeholder="Search articles..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full pl-11 pr-10 py-3.5 rounded-2xl border border-gray-200 bg-white text-sm text-secondary placeholder-gray-400 focus:outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/10 transition-all duration-300 shadow-sm"
              />
              {search && (
                <button onClick={() => setSearch('')} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-secondary transition-colors">
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>

          {/* Category Filters */}
          {categories.length > 1 && (
            <div className="flex flex-wrap justify-center gap-3 mb-10">
              {categories.map(cat => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`px-5 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all duration-300 ${activeCategory === cat
                    ? 'bg-secondary text-white shadow-lg -translate-y-0.5'
                    : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                    }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          )}

          {filteredPosts.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 stagger-children">
              {filteredPosts.map((article) => (
                <article key={article.id} className="reveal group relative bg-white rounded-3xl overflow-hidden border border-gray-100 hover:border-transparent transition-all duration-500 hover:-translate-y-2 flex flex-col shadow-sm hover:shadow-2xl">
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-primary to-orange-400 opacity-0 group-hover:opacity-20 transition-opacity duration-500 rounded-[1.5rem] blur-sm -z-10" />
                  <div className="h-60 lg:h-72 overflow-hidden relative bg-gray-50">
                    {article.image ? (
                      <img
                        src={article.image}
                        alt={article.title}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                        loading="lazy"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <FileText className="h-12 w-12 text-gray-200" />
                      </div>
                    )}
                    {article.category && (
                      <div className="absolute top-5 left-5 z-20">
                        <span className="bg-white/90 backdrop-blur-md text-secondary shadow-sm px-4 py-2 rounded-full text-[10px] font-bold uppercase tracking-[0.2em] group-hover:bg-primary group-hover:text-white transition-colors duration-300">
                          {article.category}
                        </span>
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-secondary/80 via-secondary/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-10" />
                  </div>
                  <div className="flex-1 p-8 flex flex-col bg-white relative z-20">
                    <div className="flex flex-wrap items-center text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-5 gap-y-2 gap-x-4">
                      <span className="flex items-center gap-1.5">
                        <Calendar className="h-3.5 w-3.5 text-primary" />
                        {new Date(article.published_at).toLocaleDateString()}
                      </span>
                      {article.author && (
                        <span className="flex items-center gap-1.5">
                          <User className="h-3.5 w-3.5 text-primary" />
                          {article.author}
                        </span>
                      )}
                      {article.content && (
                        <span className="flex items-center gap-1.5">
                          <Clock className="h-3.5 w-3.5 text-primary" />
                          {Math.max(1, Math.ceil((article.content?.split(/\s+/).length || 200) / 200))} min read
                        </span>
                      )}
                    </div>
                    <h3 className="text-xl md:text-2xl font-display font-bold text-secondary mb-4 line-clamp-2 leading-tight group-hover:text-primary transition-colors duration-300">
                      <Link to={`/blog/${article.slug || article.id}`} className="focus:outline-none">
                        <span className="absolute inset-0 z-20" aria-hidden="true" />
                        {article.title}
                      </Link>
                    </h3>
                    <p className="text-gray-500 text-sm mb-8 line-clamp-3 leading-relaxed flex-1 font-light">
                      {article.excerpt}
                    </p>
                    <div className="mt-auto flex items-center justify-between border-t border-gray-50 pt-5">
                      <span className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.15em] text-secondary group-hover:text-primary transition-colors duration-300 z-30 relative">
                        Read Article 
                        <ArrowRight className="h-4 w-4 transform group-hover:translate-x-1.5 transition-transform duration-300" />
                      </span>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 md:py-20 bg-gray-50 rounded-3xl border border-gray-100">
              <FileText className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-400 font-medium text-lg">
                {search ? `No articles found for "${search}"` : 'No articles found. Check back later!'}
              </p>
              {(search || activeCategory !== 'All') && (
                <button onClick={() => { setSearch(''); setActiveCategory('All'); }} className="mt-4 text-primary text-sm font-bold hover:underline">Clear filters</button>
              )}
            </div>
          )}

          <div className="mt-16 text-center reveal">
            <div className="inline-flex items-center gap-2 bg-gray-50 px-6 py-3.5 rounded-2xl border border-gray-100">
              <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              <p className="text-gray-400 font-bold text-xs uppercase tracking-wider">More articles coming soon</p>
            </div>
          </div>
        </div>
      </section>

      {/* ─── NEWSLETTER ──────────────────────────────────────── */}
      <section className="bg-secondary py-12 md:py-24 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-96 h-96 bg-primary/5 rounded-full blur-[80px] -translate-x-1/2 -translate-y-1/2 pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-[80px] translate-x-1/3 translate-y-1/3 pointer-events-none" />
        <div className="absolute inset-0 opacity-[0.015]" style={{ backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize: '32px 32px' }} />

        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10 reveal">
          <span className="text-xs font-bold uppercase tracking-[0.2em] text-primary/70 mb-4 block" style={{ fontFamily: 'Inter, sans-serif' }}>Stay Updated</span>
          <h2 className="text-4xl font-display font-bold text-white mb-4">Subscribe to our Newsletter</h2>
          <p className="text-white/60 mb-10 leading-relaxed max-w-xl mx-auto">
            Stay updated with the latest news, insights, and expert advice on land surveying and property development in Nigeria.
          </p>
          <form className="flex flex-col sm:flex-row gap-3 max-w-lg mx-auto" onSubmit={handleSubscribe}>
            <input
              type="email"
              placeholder="Enter your email address"
              className="flex-1 bg-white/5 border border-white/10 text-white placeholder-white/30 px-6 py-4 rounded-xl focus:outline-none focus:border-primary/50 focus:bg-white/10 transition-all duration-300 disabled:opacity-50"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={submitting}
              required
            />
            <button
              type="submit"
              className="bg-primary text-white px-8 py-4 rounded-xl font-bold text-sm uppercase tracking-wider hover:bg-primary-dark transition-all duration-300 shadow-primary-glow hover:shadow-primary-glow-lg shrink-0 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={submitting}
            >
              {submitting ? 'Subscribing...' : 'Subscribe'}
            </button>
          </form>
          {message.text && (
            <div className={`mt-4 text-sm font-medium ${message.type === 'success' ? 'text-emerald-400' : 'text-red-400'}`}>
              {message.text}
            </div>
          )}
          <p className="text-white/20 text-xs mt-4 font-medium">
            We respect your privacy. Unsubscribe at any time.
          </p>
        </div>
      </section>
    </div>
  );
};

export default Blog;