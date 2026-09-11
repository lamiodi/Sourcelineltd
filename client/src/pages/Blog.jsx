import { useState, useEffect, useRef, useLayoutEffect } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, User, ArrowRight, FileText, MagnifyingGlass as Search, Clock, X } from '@phosphor-icons/react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import SEO from '../components/SEO';
import { API_URL } from '../config';
import { blogPosts } from '../data';

gsap.registerPlugin(ScrollTrigger);

const Blog = () => {
  const [posts, setPosts] = useState(blogPosts);
  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');

  const heroRef = useRef(null);
  const heroImgRef = useRef(null);
  const gridRef = useRef(null);
  const newsletterRef = useRef(null);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const res = await fetch(`${API_URL}/blog`);
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data) && data.length > 0) {
            setPosts(data);
          }
        }
      } catch (err) {
        console.warn('[Blog] Using static articles fallback:', err.message);
      }
    };
    fetchPosts();
  }, []);

  /* ── GSAP Animations ── */
  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      // Hero parallax
      if (heroImgRef.current) {
        gsap.to(heroImgRef.current, {
          yPercent: 30,
          ease: 'none',
          scrollTrigger: {
            trigger: heroRef.current,
            start: 'top top',
            end: 'bottom top',
            scrub: true,
          },
        });
      }

      // Hero text entrance
      gsap.from('.blog-hero-content > *', {
        y: 60,
        opacity: 0,
        duration: 1,
        stagger: 0.15,
        ease: 'power3.out',
        delay: 0.2,
      });
    });

    return () => ctx.revert();
  }, []);

  // Grid stagger animation — re-run when filtered posts change
  useLayoutEffect(() => {
    if (!gridRef.current) return;
    const ctx = gsap.context(() => {
      const cards = gridRef.current.querySelectorAll('.blog-card');
      gsap.fromTo(
        cards,
        { y: 80, opacity: 0, scale: 0.95 },
        {
          y: 0,
          opacity: 1,
          scale: 1,
          duration: 0.8,
          stagger: 0.1,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: gridRef.current,
            start: 'top 85%',
            once: true,
          },
        }
      );
    }, gridRef);
    return () => ctx.revert();
  }, [posts, search, activeCategory]);

  // Newsletter section reveal
  useLayoutEffect(() => {
    if (!newsletterRef.current) return;
    const ctx = gsap.context(() => {
      gsap.from(newsletterRef.current.querySelectorAll('.nl-reveal'), {
        y: 50,
        opacity: 0,
        duration: 0.9,
        stagger: 0.12,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: newsletterRef.current,
          start: 'top 80%',
          once: true,
        },
      });
    }, newsletterRef);
    return () => ctx.revert();
  }, []);

  const categories = ['All', ...new Set(posts.map(p => p.category).filter(Boolean))];

  const filteredPosts = posts.filter(post => {
    const q = search.toLowerCase();
    const matchesSearch = !q ||
      post.title?.toLowerCase().includes(q) ||
      post.excerpt?.toLowerCase().includes(q);
    const matchesCategory = activeCategory === 'All' || post.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  const featuredPost = filteredPosts[0];
  const remainingPosts = filteredPosts.slice(1);

  const handleSubscribe = async (e) => {
    e.preventDefault();
    if (!email) return;

    setSubmitting(true);
    setMessage({ type: '', text: '' });

    try {
      const res = await fetch(`${API_URL}/newsletter/subscribe`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      const data = await res.json();

      if (res.ok) {
        setMessage({ type: 'success', text: 'Thank you for subscribing! Check your inbox for confirmation.' });
        setEmail('');
      } else if (res.status === 409) {
        setMessage({ type: 'info', text: 'You are already subscribed to our newsletter.' });
      } else {
        setMessage({ type: 'error', text: data.message || 'Subscription failed. Please try again.' });
      }
    } catch {
      setMessage({ type: 'error', text: 'Unable to connect to newsletter service. Please try again later.' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="overflow-x-hidden w-full max-w-full font-sans">
      <SEO
        title="Blog & News"
        description="Latest insights, tips, and industry news on land surveying, real estate, and property development in Nigeria."
      />

      {/* ═══ CINEMATIC HERO ═══════════════════════════════════════ */}
      <section ref={heroRef} className="relative min-h-[70vh] flex items-center justify-center overflow-hidden bg-secondary">
        {/* Parallax background */}
        <div ref={heroImgRef} className="absolute inset-0 will-change-transform">
          <img
            src="/images/20250515_134156.jpg.jpeg"
            alt=""
            className="w-full h-[130%] object-cover opacity-20"
            style={{ filter: 'contrast(1.1) brightness(0.9)' }}
          />
        </div>
        {/* Gradient overlays */}
        <div className="absolute inset-0 bg-gradient-to-b from-secondary/60 via-secondary/80 to-secondary" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-10%,rgba(255,104,6,0.12),transparent)]" />

        {/* Hero content */}
        <div className="blog-hero-content relative z-10 max-w-6xl mx-auto px-4 sm:px-6 text-center py-32 md:py-40">
          <div className="w-16 h-[2px] bg-gradient-to-r from-primary to-accent mx-auto mb-8" />
          <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-[5.5rem] font-display font-bold text-white tracking-tight leading-[1.05] mb-8">
            News & <span className="italic font-normal text-primary">Insights</span>
          </h1>
          <p className="text-lg md:text-xl text-white/50 max-w-2xl mx-auto leading-relaxed font-light">
            Expert perspectives on land surveying, geospatial technology, and property development across Nigeria.
          </p>
        </div>
      </section>

      {/* ═══ CONTENT SECTION ══════════════════════════════════════ */}
      <section className="py-20 md:py-32 bg-white relative">
        <div className="absolute inset-0 bg-mesh-gradient pointer-events-none opacity-60" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">

          {/* Search + Category Filters */}
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-16">
            {/* Category tabs */}
            {categories.length > 1 && (
              <div className="flex flex-wrap gap-1">
                {categories.map(cat => (
                  <button
                    key={cat}
                    onClick={() => setActiveCategory(cat)}
                    className={`relative px-5 py-2.5 text-xs font-bold uppercase tracking-[0.15em] transition-all duration-400 rounded-xl ${
                      activeCategory === cat
                        ? 'text-primary bg-primary/8'
                        : 'text-gray-400 hover:text-secondary'
                    }`}
                  >
                    {cat}
                    {activeCategory === cat && (
                      <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-5 h-[2px] bg-primary rounded-full" />
                    )}
                  </button>
                ))}
              </div>
            )}

            {/* Search */}
            <div className="relative group w-full md:w-80">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-300 group-focus-within:text-primary transition-colors duration-300" />
              <input
                type="text"
                placeholder="Search articles..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full pl-11 pr-10 py-3 rounded-xl border border-gray-100 bg-gray-50/50 text-sm text-secondary placeholder-gray-300 focus:outline-none focus:border-primary/40 focus:ring-2 focus:ring-primary/8 focus:bg-white transition-all duration-400"
              />
              {search && (
                <button onClick={() => setSearch('')} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-300 hover:text-secondary transition-colors">
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>

          {filteredPosts.length > 0 ? (
            <div ref={gridRef}>
              {/* ── Featured Article ── */}
              {featuredPost && (
                <article className="blog-card group relative mb-16">
                  <Link to={`/blog/${featuredPost.slug || featuredPost.id}`} className="grid grid-cols-1 lg:grid-cols-2 gap-0 bg-white rounded-3xl overflow-hidden border border-gray-100 hover:border-gray-200 transition-all duration-700 hover:shadow-elevated">
                    {/* Image */}
                    <div className="h-72 lg:h-[480px] overflow-hidden relative bg-gray-50">
                      {featuredPost.image ? (
                        <img
                          src={featuredPost.image}
                          alt={featuredPost.title}
                          className="w-full h-full object-cover transition-transform duration-[1.2s] ease-out group-hover:scale-105"
                          style={{ filter: 'contrast(1.05)' }}
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <FileText className="h-16 w-16 text-gray-200" />
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-transparent to-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                    </div>
                    {/* Content */}
                    <div className="flex flex-col justify-center p-8 md:p-12 lg:p-16">
                      {featuredPost.category && (
                        <span className="text-primary text-[10px] font-bold uppercase tracking-[0.25em] mb-6 block">
                          {featuredPost.category}
                        </span>
                      )}
                      <h2 className="text-3xl md:text-4xl lg:text-[2.75rem] font-display font-bold text-secondary leading-[1.1] mb-6 group-hover:text-primary transition-colors duration-500">
                        {featuredPost.title}
                      </h2>
                      <p className="text-gray-400 text-base md:text-lg leading-relaxed mb-8 line-clamp-3 font-light">
                        {featuredPost.excerpt}
                      </p>
                      <div className="flex flex-wrap items-center text-xs text-gray-300 font-semibold uppercase tracking-wider gap-5 mb-8">
                        <span className="flex items-center gap-1.5">
                          <Calendar className="h-3.5 w-3.5 text-primary/60" />
                          {new Date(featuredPost.published_at).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                        </span>
                        {featuredPost.author && (
                          <span className="flex items-center gap-1.5">
                            <User className="h-3.5 w-3.5 text-primary/60" />
                            {featuredPost.author}
                          </span>
                        )}
                        {featuredPost.content && (
                          <span className="flex items-center gap-1.5">
                            <Clock className="h-3.5 w-3.5 text-primary/60" />
                            {Math.max(1, Math.ceil((featuredPost.content?.split(/\s+/).length || 200) / 200))} min read
                          </span>
                        )}
                      </div>
                      <span className="inline-flex items-center gap-2.5 text-xs font-bold uppercase tracking-[0.18em] text-secondary group-hover:text-primary transition-colors duration-300">
                        Read Article
                        <ArrowRight className="h-4 w-4 transform group-hover:translate-x-2 transition-transform duration-500" />
                      </span>
                    </div>
                  </Link>
                </article>
              )}

              {/* ── Remaining Articles Grid ── */}
              {remainingPosts.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {remainingPosts.map((article) => (
                    <article key={article.id} className="blog-card group relative">
                      <Link to={`/blog/${article.slug || article.id}`} className="block bg-white rounded-2xl overflow-hidden border border-gray-100 hover:border-transparent transition-all duration-500 hover:-translate-y-2 hover:shadow-card-hover">
                        {/* Image */}
                        <div className="h-56 lg:h-64 overflow-hidden relative bg-gray-50">
                          {article.image ? (
                            <img
                              src={article.image}
                              alt={article.title}
                              className="w-full h-full object-cover transition-transform duration-[1s] ease-out group-hover:scale-[1.08]"
                              loading="lazy"
                              style={{ filter: 'contrast(1.03)' }}
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <FileText className="h-10 w-10 text-gray-200" />
                            </div>
                          )}
                          {article.category && (
                            <div className="absolute top-4 left-4 z-10">
                              <span className="bg-white/95 backdrop-blur-sm text-secondary px-3.5 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-[0.2em] shadow-sm group-hover:bg-primary group-hover:text-white transition-colors duration-400">
                                {article.category}
                              </span>
                            </div>
                          )}
                          <div className="absolute inset-0 bg-gradient-to-t from-secondary/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                        </div>

                        {/* Content */}
                        <div className="p-7">
                          <div className="flex flex-wrap items-center text-[10px] font-bold text-gray-300 uppercase tracking-[0.15em] mb-4 gap-4">
                            <span className="flex items-center gap-1.5">
                              <Calendar className="h-3 w-3 text-primary/50" />
                              {new Date(article.published_at).toLocaleDateString()}
                            </span>
                            {article.content && (
                              <span className="flex items-center gap-1.5">
                                <Clock className="h-3 w-3 text-primary/50" />
                                {Math.max(1, Math.ceil((article.content?.split(/\s+/).length || 200) / 200))} min
                              </span>
                            )}
                          </div>
                          <h3 className="text-lg font-display font-bold text-secondary mb-3 line-clamp-2 leading-snug group-hover:text-primary transition-colors duration-300">
                            {article.title}
                          </h3>
                          <p className="text-gray-400 text-sm mb-6 line-clamp-2 leading-relaxed font-light">
                            {article.excerpt}
                          </p>
                          <span className="inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-secondary/60 group-hover:text-primary transition-colors duration-300">
                            Read more
                            <ArrowRight className="h-3.5 w-3.5 transform group-hover:translate-x-1 transition-transform duration-300" />
                          </span>
                        </div>
                      </Link>
                    </article>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-20 md:py-28">
              <FileText className="h-12 w-12 text-gray-200 mx-auto mb-5" />
              <p className="text-gray-300 font-medium text-lg mb-2">
                {search ? `No articles found for "${search}"` : 'No articles found.'}
              </p>
              <p className="text-gray-300 text-sm mb-6">Check back later for new content.</p>
              {(search || activeCategory !== 'All') && (
                <button onClick={() => { setSearch(''); setActiveCategory('All'); }} className="text-primary text-xs font-bold uppercase tracking-wider hover:underline">
                  Clear filters
                </button>
              )}
            </div>
          )}

          {/* Coming soon strip */}
          <div className="mt-20 flex items-center gap-4 justify-center">
            <div className="h-[1px] w-12 bg-gray-200" />
            <p className="text-gray-300 font-bold text-[10px] uppercase tracking-[0.25em]">More articles coming soon</p>
            <div className="h-[1px] w-12 bg-gray-200" />
          </div>
        </div>
      </section>

      {/* ═══ NEWSLETTER ═══════════════════════════════════════════ */}
      <section ref={newsletterRef} className="bg-secondary py-24 md:py-36 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_50%_50%,rgba(255,104,6,0.06),transparent)]" />
        <div className="absolute inset-0 opacity-[0.02]" style={{ backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize: '32px 32px' }} />

        <div className="max-w-2xl mx-auto px-4 sm:px-6 text-center relative z-10">
          <div className="nl-reveal w-12 h-[2px] bg-gradient-to-r from-primary to-accent mx-auto mb-8" />
          <h2 className="nl-reveal text-4xl md:text-5xl font-display font-bold text-white mb-5 leading-tight">
            Stay in the loop
          </h2>
          <p className="nl-reveal text-white/40 mb-12 leading-relaxed max-w-lg mx-auto font-light">
            Get the latest insights on surveying, geoinformatics, and property development delivered to your inbox.
          </p>
          <form className="nl-reveal flex flex-col sm:flex-row gap-3 max-w-md mx-auto" onSubmit={handleSubscribe}>
            <input
              type="email"
              placeholder="Your email address"
              className="flex-1 bg-white/[0.04] border border-white/10 text-white placeholder-white/20 px-6 py-4 rounded-xl focus:outline-none focus:border-primary/50 focus:bg-white/[0.08] transition-all duration-400 disabled:opacity-50 text-sm"
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
            <div className={`nl-reveal mt-5 text-sm font-medium ${message.type === 'success' ? 'text-emerald-400' : message.type === 'info' ? 'text-blue-300' : 'text-red-400'}`}>
              {message.text}
            </div>
          )}
          <p className="nl-reveal text-white/15 text-xs mt-5 font-medium">
            We respect your privacy. Unsubscribe at any time.
          </p>
        </div>
      </section>
    </main>
  );
};

export default Blog;