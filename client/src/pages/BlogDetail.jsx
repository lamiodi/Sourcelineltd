import { useState, useEffect, useRef, useLayoutEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Calendar, User, ArrowLeft, ArrowRight, FileText, ShareNetwork as Share2, FacebookLogo as Facebook, TwitterLogo as Twitter, LinkedinLogo as Linkedin, Clock, Tag, Eye } from '@phosphor-icons/react';
import ReactMarkdown from 'react-markdown';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import SEO from '../components/SEO';
import { API_URL } from '../config';
import { blogPosts } from '../data';

gsap.registerPlugin(ScrollTrigger);

const BlogDetail = () => {
  const { slug } = useParams();
  const staticPost = blogPosts.find(p => p.slug === slug || String(p.id) === slug);
  const [post, setPost] = useState(staticPost);
  const [relatedPosts] = useState(blogPosts.filter(p => p.id !== staticPost?.id).slice(0, 3));
  const [subEmail, setSubEmail] = useState('');
  const [subStatus, setSubStatus] = useState({ text: '', type: '' });
  const [submitting, setSubmitting] = useState(false);
  const [activeSection, setActiveSection] = useState('');

  const heroRef = useRef(null);
  const heroImgRef = useRef(null);
  const articleRef = useRef(null);
  const relatedRef = useRef(null);

  useEffect(() => {
    const fetchArticle = async () => {
      try {
        const res = await fetch(`${API_URL}/blog/${slug}`);
        if (res.ok) {
          const data = await res.json();
          if (data && data.title) {
            setPost(data);
          }
        }
      } catch (err) {
        console.warn('[BlogDetail] Using static fallback:', err.message);
      }
    };
    fetchArticle();
  }, [slug]);

  /* ── GSAP Animations ── */
  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      // Hero parallax
      if (heroImgRef.current) {
        gsap.to(heroImgRef.current, {
          yPercent: 25,
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
      gsap.from('.detail-hero-content > *', {
        y: 50,
        opacity: 0,
        duration: 0.9,
        stagger: 0.12,
        ease: 'power3.out',
        delay: 0.15,
      });

      // Article content paragraphs
      if (articleRef.current) {
        const proseEls = articleRef.current.querySelectorAll('.prose > *, .detail-excerpt, .detail-tags, .detail-share');
        gsap.fromTo(
          proseEls,
          { y: 30, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.7,
            stagger: 0.06,
            ease: 'power2.out',
            scrollTrigger: {
              trigger: articleRef.current,
              start: 'top 80%',
              once: true,
            },
          }
        );
      }

      // Related posts stagger
      if (relatedRef.current) {
        const cards = relatedRef.current.querySelectorAll('.related-card');
        gsap.fromTo(
          cards,
          { y: 60, opacity: 0, scale: 0.96 },
          {
            y: 0,
            opacity: 1,
            scale: 1,
            duration: 0.8,
            stagger: 0.12,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: relatedRef.current,
              start: 'top 85%',
              once: true,
            },
          }
        );
      }
    });

    return () => ctx.revert();
  }, [post]);

  /* ── Scroll Spy for Table of Contents ── */
  useEffect(() => {
    if (!post?.content) return;
    const headings = document.querySelectorAll('[id^="section-"]');
    if (headings.length === 0) return;

    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        });
      },
      { threshold: 0.3, rootMargin: '-80px 0px -60% 0px' }
    );
    headings.forEach(h => obs.observe(h));
    return () => obs.disconnect();
  }, [post]);

  const handleSubscribe = async (e) => {
    e.preventDefault();
    if (!subEmail) return;
    setSubmitting(true);
    setSubStatus({ text: '', type: '' });
    try {
      const res = await fetch(`${API_URL}/newsletter/subscribe`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: subEmail })
      });
      if (res.ok) {
        setSubStatus({ text: 'Subscribed successfully! Welcome to Sourceline.', type: 'success' });
        setSubEmail('');
      } else if (res.status === 409) {
        setSubStatus({ text: 'You are already subscribed.', type: 'info' });
      } else {
        setSubStatus({ text: 'Subscription error. Please try again.', type: 'error' });
      }
    } catch {
      setSubStatus({ text: 'Unable to connect to newsletter service.', type: 'error' });
    } finally {
      setSubmitting(false);
    }
  };

  const readingTime = post && post.content ? Math.ceil(post.content.split(' ').length / 200) : 0;
  const viewCount = post
    ? (() => {
      const source = post.slug || String(post.id || '');
      let hash = 0;
      for (let i = 0; i < source.length; i += 1) {
        hash = (hash * 31 + source.charCodeAt(i)) % 100000;
      }
      return 50 + (hash % 451);
    })()
    : 0;

  // Extract headings for TOC
  const tocHeadings = post?.content?.match(/^##\s+(.+)$/gm)?.map((heading, index) => ({
    id: `section-${index}`,
    title: heading.replace(/^##\s+/, ''),
  })) || [];

  if (!post) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center p-10 max-w-md w-full">
          <div className="w-16 h-16 bg-gray-50 text-gray-300 rounded-2xl flex items-center justify-center mx-auto mb-8">
            <FileText className="h-8 w-8" />
          </div>
          <h2 className="text-3xl font-display font-bold text-secondary mb-4">Article not found</h2>
          <p className="text-gray-400 mb-10 font-light">The article you are looking for does not exist or has been moved.</p>
          <Link to="/blog" className="inline-flex items-center gap-2 bg-secondary text-white px-7 py-3.5 rounded-xl font-bold text-xs uppercase tracking-wider hover:bg-primary transition-colors duration-300 group">
            <ArrowLeft className="h-4 w-4 transform group-hover:-translate-x-1 transition-transform" />
            Back to Blog
          </Link>
        </div>
      </div>
    );
  }

  return (
    <main className="overflow-x-hidden w-full max-w-full font-sans">
      <SEO
        title={post.title}
        description={post.excerpt}
        image={post.image}
      />

      {/* ═══ CINEMATIC HERO ═══════════════════════════════════════ */}
      <section ref={heroRef} className="relative min-h-[60vh] md:min-h-[70vh] flex items-end overflow-hidden bg-secondary">
        {/* Parallax image */}
        <div ref={heroImgRef} className="absolute inset-0 will-change-transform">
          {post.image ? (
            <img src={post.image} alt="" className="w-full h-[130%] object-cover opacity-25"
              style={{ filter: 'contrast(1.1) brightness(0.85)' }} />
          ) : (
            <div className="w-full h-full bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(255,104,6,0.12),transparent)]" />
          )}
        </div>
        {/* Gradient overlays */}
        <div className="absolute inset-0 bg-gradient-to-t from-secondary via-secondary/70 to-secondary/30" />
        <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-secondary to-transparent" />

        {/* Content */}
        <div className="detail-hero-content relative z-10 max-w-5xl mx-auto px-4 sm:px-6 pb-16 md:pb-24 pt-40">
          <Link to="/blog" className="inline-flex items-center gap-2 text-white/30 hover:text-primary transition-colors mb-8 font-bold text-xs uppercase tracking-[0.15em] group">
            <ArrowLeft className="h-3.5 w-3.5 transform group-hover:-translate-x-1 transition-transform" />
            All Articles
          </Link>

          {post.category && (
            <span className="block text-primary/80 text-[10px] font-bold uppercase tracking-[0.3em] mb-5">
              {post.category}
            </span>
          )}

          <h1 className="text-4xl md:text-5xl lg:text-6xl xl:text-[4rem] font-display font-bold text-white leading-[1.08] mb-10 max-w-5xl">
            {post.title}
          </h1>

          {/* Glass meta card */}
          <div className="inline-flex flex-wrap items-center gap-6 bg-white/[0.05] backdrop-blur-xl border border-white/10 rounded-2xl px-7 py-4">
            <span className="flex items-center gap-2 text-white/50 text-sm font-medium">
              <Calendar className="h-4 w-4 text-primary/60" />
              {new Date(post.published_at).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
            </span>
            {post.author && (
              <span className="flex items-center gap-2 text-white/50 text-sm font-medium">
                <User className="h-4 w-4 text-primary/60" />
                {post.author}
              </span>
            )}
            <span className="flex items-center gap-2 text-white/50 text-sm font-medium">
              <Clock className="h-4 w-4 text-primary/60" />
              {readingTime} min read
            </span>
            <span className="flex items-center gap-2 text-white/50 text-sm font-medium">
              <Eye className="h-4 w-4 text-primary/60" />
              {viewCount} views
            </span>
          </div>
        </div>
      </section>

      {/* ═══ ARTICLE CONTENT ══════════════════════════════════════ */}
      <section className="py-16 md:py-24 bg-white relative">
        <div className="absolute inset-0 bg-mesh-gradient pointer-events-none opacity-40" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            {/* Table of Contents — Desktop Sidebar */}
            {tocHeadings.length > 0 && (
              <div className="lg:col-span-3 hidden lg:block">
                <div className="sticky top-24">
                  <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-gray-300 mb-5">In this article</p>
                  <nav className="space-y-1">
                    {tocHeadings.map((heading) => (
                      <a
                        key={heading.id}
                        href={`#${heading.id}`}
                        className={`block text-sm py-2 pl-4 border-l-2 transition-all duration-300 ${
                          activeSection === heading.id
                            ? 'border-primary text-primary font-semibold'
                            : 'border-transparent text-gray-400 hover:text-secondary hover:border-gray-200'
                        }`}
                        onClick={(e) => {
                          e.preventDefault();
                          document.getElementById(heading.id)?.scrollIntoView({ behavior: 'smooth' });
                        }}
                      >
                        {heading.title}
                      </a>
                    ))}
                  </nav>
                </div>
              </div>
            )}

            {/* Main Content */}
            <div className={tocHeadings.length > 0 ? 'lg:col-span-9' : 'lg:col-span-10 lg:col-start-2'} ref={articleRef}>
              <div className="bg-white rounded-3xl p-8 md:p-14 shadow-sm border border-gray-100 relative -mt-16 md:-mt-28">

                {post.excerpt && (
                  <div className="detail-excerpt text-xl text-secondary/70 font-medium leading-relaxed mb-14 border-l-[3px] border-primary/40 pl-7 py-1 italic">
                    {post.excerpt}
                  </div>
                )}

                <article className="prose prose-lg prose-headings:font-display prose-headings:font-bold prose-headings:text-secondary prose-p:text-gray-500 prose-p:font-light prose-a:text-primary prose-a:no-underline hover:prose-a:underline prose-img:rounded-2xl prose-img:shadow-md max-w-none">
                  <ReactMarkdown
                    components={{
                      h2: ({ ...props }) => {
                        const headingIndex = tocHeadings.findIndex(
                          h => h.title === props.children?.toString()
                        );
                        return <h2 id={headingIndex >= 0 ? `section-${headingIndex}` : undefined} className="text-3xl mt-14 mb-6 scroll-mt-24 font-display" {...props} />;
                      },
                      h3: ({ ...props }) => <h3 className="text-2xl mt-10 mb-4 font-display" {...props} />,
                      p: ({ ...props }) => <p className="mb-6 leading-[1.85] font-sans text-gray-500" {...props} />,
                      ul: ({ ...props }) => <ul className="list-disc pl-6 mb-6 space-y-2 marker:text-primary font-sans" {...props} />,
                      li: ({ ...props }) => <li className="text-gray-500" {...props} />,
                      blockquote: ({ ...props }) => <blockquote className="border-l-[3px] border-primary/30 pl-7 italic text-gray-400 my-10 bg-gray-50/50 py-5 px-2 rounded-r-xl font-display text-xl leading-relaxed" {...props} />,
                      img: ({ ...props }) => <img className="my-10" {...props} />,
                      strong: ({ ...props }) => <strong className="text-secondary font-semibold" {...props} />,
                    }}
                  >
                    {post.content}
                  </ReactMarkdown>
                </article>

                {/* Tags */}
                {post.tags && post.tags.length > 0 && (
                  <div className="detail-tags mt-14 pt-8 border-t border-gray-100">
                    <div className="flex flex-wrap items-center gap-3">
                      <Tag className="h-3.5 w-3.5 text-gray-300" />
                      {post.tags.map((tag, index) => (
                        <span
                          key={index}
                          className="bg-gray-50 text-gray-500 px-3.5 py-1.5 rounded-lg text-xs font-medium hover:bg-primary hover:text-white transition-colors duration-300 cursor-pointer"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Share */}
                <div className="detail-share mt-10 pt-8 border-t border-gray-100 flex flex-col sm:flex-row justify-between items-center gap-6">
                  <span className="text-gray-300 text-xs font-bold uppercase tracking-[0.2em]">Share this article</span>
                  <div className="flex gap-2.5">
                    {[Facebook, Twitter, Linkedin].map((Icon, i) => (
                      <button key={i} className="w-10 h-10 rounded-xl bg-gray-50 hover:bg-primary/10 border border-gray-100 hover:border-primary/20 flex items-center justify-center hover:-translate-y-0.5 transition-all duration-300 group">
                        <Icon className="h-4 w-4 text-gray-400 group-hover:text-primary transition-colors" />
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ RELATED ARTICLES ═════════════════════════════════════ */}
      <section className="py-20 md:py-28 bg-gray-50/50" ref={relatedRef}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-14">
            <div>
              <div className="w-10 h-[2px] bg-gradient-to-r from-primary to-accent mb-5" />
              <h3 className="text-3xl md:text-4xl font-display font-bold text-secondary">More to read</h3>
            </div>
            <Link to="/blog" className="hidden sm:inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.15em] text-secondary/40 hover:text-primary transition-colors group">
              All Articles <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {relatedPosts.map((article) => (
              <Link key={article.id} to={`/blog/${article.slug || article.id}`} className="related-card group block bg-white rounded-2xl overflow-hidden border border-gray-100 hover:border-transparent hover:shadow-card-hover transition-all duration-500 hover:-translate-y-2">
                <div className="h-52 overflow-hidden relative">
                  <img
                    src={article.image}
                    alt={article.title}
                    className="w-full h-full object-cover transition-transform duration-[1s] ease-out group-hover:scale-[1.08]"
                    loading="lazy"
                    style={{ filter: 'contrast(1.03)' }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-secondary/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  <div className="absolute top-4 left-4">
                    <span className="bg-white/90 backdrop-blur-sm text-secondary px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider">
                      {article.category}
                    </span>
                  </div>
                </div>
                <div className="p-6">
                  <h4 className="text-lg font-display font-bold text-secondary mb-2 line-clamp-2 leading-snug group-hover:text-primary transition-colors duration-300">
                    {article.title}
                  </h4>
                  <p className="text-gray-400 text-sm mb-4 line-clamp-2 font-light">{article.excerpt}</p>
                  <div className="flex items-center justify-between text-[10px] text-gray-300 font-bold uppercase tracking-wider">
                    <span className="flex items-center gap-1.5">
                      <Calendar className="h-3 w-3 text-primary/50" />
                      {new Date(article.published_at).toLocaleDateString()}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Clock className="h-3 w-3 text-primary/50" />
                      {Math.ceil(article.content.split(' ').length / 200)} min
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ NEWSLETTER + CTA ═════════════════════════════════════ */}
      <section className="bg-secondary py-24 md:py-32 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_40%_at_50%_50%,rgba(255,104,6,0.06),transparent)]" />
        <div className="absolute inset-0 opacity-[0.02]" style={{ backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize: '32px 32px' }} />

        <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center relative z-10">
          <div className="mb-16">
            <div className="w-12 h-[2px] bg-gradient-to-r from-primary to-accent mx-auto mb-8" />
            <h3 className="text-3xl md:text-4xl font-display font-bold text-white mb-4">Stay Updated</h3>
            <p className="text-white/35 mb-10 max-w-lg mx-auto font-light">Get the latest insights on surveying and geoinformatics delivered to your inbox.</p>
            <form className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto" onSubmit={handleSubscribe}>
              <input
                type="email"
                value={subEmail}
                onChange={(e) => setSubEmail(e.target.value)}
                placeholder="Your email address"
                className="flex-1 bg-white/[0.04] border border-white/10 text-white placeholder-white/20 px-6 py-4 rounded-xl focus:outline-none focus:border-primary/50 focus:bg-white/[0.08] transition-all duration-400 text-sm"
                required
              />
              <button
                type="submit"
                disabled={submitting}
                className="bg-primary text-white px-7 py-4 rounded-xl font-bold text-sm uppercase tracking-wider hover:bg-primary-dark transition-colors shadow-primary-glow disabled:opacity-50"
              >
                {submitting ? 'Subscribing...' : 'Subscribe'}
              </button>
            </form>
            {subStatus.text && (
              <div className={`mt-4 text-sm font-medium ${subStatus.type === 'success' ? 'text-emerald-400' : subStatus.type === 'info' ? 'text-blue-300' : 'text-red-400'}`}>
                {subStatus.text}
              </div>
            )}
          </div>

          <div className="h-[1px] bg-white/5 mb-16" />

          <h3 className="text-3xl md:text-4xl font-display font-bold text-white mb-5">Need a Surveying Expert?</h3>
          <p className="text-white/35 mb-10 max-w-lg mx-auto font-light leading-relaxed">
            Let our team of experienced professionals help you navigate your next project with precision and confidence.
          </p>
          <Link to="/contact" className="inline-flex bg-primary text-white px-8 py-4 rounded-xl font-bold text-sm uppercase tracking-wider hover:bg-primary-dark shadow-primary-glow hover:shadow-primary-glow-lg hover:-translate-y-1 transition-all duration-300">
            Contact Us Today
          </Link>
        </div>
      </section>
    </main>
  );
};

export default BlogDetail;
