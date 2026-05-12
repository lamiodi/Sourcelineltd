import { useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Calendar, User, ArrowLeft, FileText, ShareNetwork as Share2, FacebookLogo as Facebook, TwitterLogo as Twitter, LinkedinLogo as Linkedin, Clock, Tag, Eye } from '@phosphor-icons/react';
import ReactMarkdown from 'react-markdown';
import SEO from '../components/SEO';
import { blogPosts } from '../data';

/* ── Scroll reveal hook ────────────────── */
const useScrollReveal = () => {
  useEffect(() => {
    const els = document.querySelectorAll('.reveal, .reveal-left, .reveal-right, .reveal-scale');
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('revealed');
            obs.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1, rootMargin: '0px 0px -40px 0px' }
    );
    els.forEach(el => obs.observe(el));
    return () => obs.disconnect();
  }, []);
};

const BlogDetail = () => {
  const { slug } = useParams();
  const post = blogPosts.find(p => p.slug === slug || String(p.id) === slug);
  const relatedPosts = blogPosts.filter(p => p.id !== post?.id).slice(0, 3);
  useScrollReveal();

  // Calculate reading time
  const readingTime = post ? Math.ceil(post.content.split(' ').length / 200) : 0;
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

  if (!post) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center p-8 bg-white rounded-3xl border border-gray-100 shadow-sm max-w-md w-full">
          <div className="w-16 h-16 bg-red-50 text-red-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <FileText className="h-8 w-8" />
          </div>
          <h2 className="text-2xl font-display font-bold text-secondary mb-3">Post not found</h2>
          <p className="text-gray-500 mb-8">The article you are looking for does not exist or has been moved.</p>
          <Link to="/blog" className="inline-flex items-center gap-2 bg-secondary text-white px-6 py-3 rounded-xl font-bold text-sm uppercase tracking-wider hover:bg-primary transition-colors group">
            <ArrowLeft className="h-4 w-4 transform group-hover:-translate-x-1 transition-transform" />
            Back to Blog
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="font-sans">
      <SEO
        title={post.title}
        description={post.excerpt}
        image={post.image}
      />

      {/* ─── HERO HEADER ───────────────────────────────────────── */}
      <section className="relative pt-32 md:pt-44 pb-20 md:pb-32 overflow-hidden bg-secondary">
        <div className="absolute inset-0">
          {post.image ? (
            <img src={post.image} alt={post.title} className="w-full h-full object-cover opacity-20 animate-ken-burns" />
          ) : (
            <div className="w-full h-full bg-secondary bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(249,115,22,0.15),rgba(255,255,255,0))]" />
          )}
        </div>

        {/* Gradients to blend image cleanly into background */}
        <div className="absolute inset-0 bg-gradient-to-t from-secondary via-secondary/80 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-secondary to-transparent" />

        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6">
          <Link to="/blog" className="inline-flex items-center gap-2 text-white/50 hover:text-primary transition-colors mb-8 font-bold text-xs uppercase tracking-wider group animate-fade-in">
            <ArrowLeft className="h-4 w-4 transform group-hover:-translate-x-1 transition-transform" /> Back to Articles
          </Link>

          <div className="animate-fade-in-up">
            {post.category && (
              <span className="inline-block bg-primary/20 text-primary border border-primary/30 px-3 py-1.5 rounded-xl text-xs font-bold uppercase tracking-wider mb-6">
                {post.category}
              </span>
            )}

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-playfair font-bold text-white mb-8 leading-tight">
              {post.title}
            </h1>

            <div className="flex flex-wrap items-center text-white/60 text-sm font-medium gap-6">
              <span className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-primary" />
                {new Date(post.published_at).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
              </span>
              {post.author && (
                <span className="flex items-center gap-2">
                  <User className="h-4 w-4 text-primary" />
                  {post.author}
                </span>
              )}
              <span className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-primary" />
                {readingTime} min read
              </span>
              <span className="flex items-center gap-2">
                <Eye className="h-4 w-4 text-primary" />
                {viewCount} views
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* ─── ARTICLE CONTENT ───────────────────────────────────── */}
      <section className="py-16 bg-white relative overflow-hidden text-lg">
        <div className="absolute inset-0 bg-mesh-gradient pointer-events-none opacity-50" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            {/* Table of Contents - Desktop */}
            <div className="lg:col-span-1 hidden lg:block">
              <div className="sticky top-24 bg-gray-50 rounded-2xl p-6 border border-gray-100">
                <h3 className="font-playfair font-bold text-secondary mb-4 flex items-center gap-2">
                  <FileText className="h-5 w-5 text-primary" /> Table of Contents
                </h3>
                <nav className="space-y-2 text-sm">
                  {post.content.match(/^##\s+(.+)$/gm)?.map((heading, index) => {
                    const title = heading.replace(/^##\s+/, '');
                    return (
                      <a
                        key={index}
                        href={`#section-${index}`}
                        className="block text-gray-600 hover:text-primary transition-colors py-1 border-l-2 border-transparent hover:border-primary pl-3"
                        onClick={(e) => {
                          e.preventDefault();
                          document.getElementById(`section-${index}`)?.scrollIntoView({ behavior: 'smooth' });
                        }}
                      >
                        {title}
                      </a>
                    );
                  })}
                </nav>
              </div>
            </div>

            {/* Main Content */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-3xl p-8 md:p-14 shadow-sm border border-gray-100 reveal-up relative -mt-20 md:-mt-32">

                {post.excerpt && (
                  <div className="text-xl text-secondary font-medium leading-relaxed mb-12 border-l-4 border-primary pl-6 py-2 italic opacity-80">
                    {post.excerpt}
                  </div>
                )}

                <article className="prose prose-lg prose-headings:font-playfair prose-headings:font-bold prose-headings:text-secondary prose-p:text-gray-600 prose-a:text-primary prose-a:no-underline hover:prose-a:underline prose-img:rounded-2xl prose-img:shadow-md max-w-none">
                  <ReactMarkdown
                    components={{
                      h2: ({ ...props }) => <h2 id={`section-${props.children?.toString().toLowerCase().replace(/\s+/g, '-')}`} className="text-3xl mt-12 mb-6 scroll-mt-24 font-playfair" {...props} />,
                      h3: ({ ...props }) => <h3 className="text-2xl mt-8 mb-4 font-playfair" {...props} />,
                      p: ({ ...props }) => <p className="mb-6 leading-relaxed font-opensans" {...props} />,
                      ul: ({ ...props }) => <ul className="list-disc pl-6 mb-6 space-y-2 marker:text-primary font-opensans" {...props} />,
                      li: ({ ...props }) => <li className="" {...props} />,
                      blockquote: ({ ...props }) => <blockquote className="border-l-4 border-gray-200 pl-6 italic text-gray-500 my-8 bg-gray-50 py-4 rounded-r-xl font-playfair" {...props} />,
                      img: ({ ...props }) => <img className="my-10" {...props} />,
                      strong: ({ ...props }) => <strong className="text-secondary font-bold font-playfair" {...props} />,
                    }}
                  >
                    {post.content}
                  </ReactMarkdown>
                </article>

                {/* Tags Section */}
                {post.tags && post.tags.length > 0 && (
                  <div className="mt-12 pt-8 border-t border-gray-100">
                    <div className="flex flex-wrap items-center gap-3">
                      <Tag className="h-4 w-4 text-gray-400" />
                      <span className="text-sm font-bold text-secondary uppercase tracking-wider">Tags:</span>
                      {post.tags.map((tag, index) => (
                        <span
                          key={index}
                          className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-xs font-medium hover:bg-primary hover:text-white transition-colors cursor-pointer"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Share Section */}
                <div className="mt-12 pt-8 border-t border-gray-100 flex flex-col sm:flex-row justify-between items-center gap-6">
                  <div className="flex items-center gap-3 text-secondary font-bold text-sm uppercase tracking-wider">
                    <Share2 className="h-5 w-5 text-gray-400" /> Share this article
                  </div>
                  <div className="flex gap-3">
                    <button className="w-10 h-10 rounded-full bg-gray-50 hover:bg-primary/10 border border-gray-100 hover:border-primary/30 flex items-center justify-center hover:-translate-y-1 transition-all group">
                      <Facebook className="h-4 w-4 text-gray-500 group-hover:text-primary transition-colors" />
                    </button>
                    <button className="w-10 h-10 rounded-full bg-gray-50 hover:bg-primary/10 border border-gray-100 hover:border-primary/30 flex items-center justify-center hover:-translate-y-1 transition-all group">
                      <Twitter className="h-4 w-4 text-gray-500 group-hover:text-primary transition-colors" />
                    </button>
                    <button className="w-10 h-10 rounded-full bg-gray-50 hover:bg-primary/10 border border-gray-100 hover:border-primary/30 flex items-center justify-center hover:-translate-y-1 transition-all group">
                      <Linkedin className="h-4 w-4 text-gray-500 group-hover:text-primary transition-colors" />
                    </button>
                  </div>
                </div>

              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── RELATED POSTS ───────────────────────────────────── */}
      <section className="py-12 md:py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-12">
            <h3 className="text-3xl font-playfair font-bold text-secondary">Related Articles</h3>
            <Link to="/blog" className="hidden sm:inline-flex items-center gap-2 text-primary font-bold text-sm uppercase tracking-wider hover:text-primary-dark transition-colors">
              View All <ArrowLeft className="h-4 w-4 rotate-180" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {relatedPosts.map((article) => (
              <Link key={article.id} to={`/blog/${article.slug || article.id}`} className="group bg-white rounded-2xl overflow-hidden border border-gray-100 hover:shadow-card-hover transition-all duration-300 hover:-translate-y-1">
                <div className="h-48 overflow-hidden relative">
                  <img
                    src={article.image}
                    alt={article.title}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  <div className="absolute top-4 left-4">
                    <span className="bg-secondary/90 backdrop-blur-sm text-white px-2 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider">
                      {article.category}
                    </span>
                  </div>
                </div>
                <div className="p-6">
                  <h4 className="text-lg font-playfair font-bold text-secondary mb-2 line-clamp-2 group-hover:text-primary transition-colors">
                    {article.title}
                  </h4>
                  <p className="text-gray-600 text-sm mb-4 line-clamp-3">{article.excerpt}</p>
                  <div className="flex items-center justify-between text-xs text-gray-400 font-medium">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-3 w-3 text-primary" />
                      {new Date(article.published_at).toLocaleDateString()}
                    </div>
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3 text-primary" />
                      {Math.ceil(article.content.split(' ').length / 200)} min
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {/* Newsletter Signup */}
          <div className="mt-16 bg-white rounded-3xl p-8 md:p-12 border border-gray-100 text-center">
            <div className="max-w-2xl mx-auto">
              <h3 className="text-2xl font-playfair font-bold text-secondary mb-4">Stay Updated</h3>
              <p className="text-gray-600 mb-8">Get the latest insights on surveying and geoinformatics delivered to your inbox.</p>
              <form className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
                <input
                  type="email"
                  placeholder="Enter your email address"
                  className="flex-1 px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  required
                />
                <button
                  type="submit"
                  className="bg-primary text-white px-6 py-3 rounded-xl font-bold text-sm uppercase tracking-wider hover:bg-primary-dark transition-colors"
                >
                  Subscribe
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* ─── CTA NEXT ────────────────────────────────────────── */}
      <section className="bg-gray-50 py-12 md:py-24 text-center">
        <div className="max-w-2xl mx-auto px-4">
          <h3 className="text-3xl font-playfair font-bold text-secondary mb-6">Need a Surveying Expert?</h3>
          <p className="text-gray-500 mb-10 leading-relaxed">Let our team of experienced professionals help you navigate your next project with precision and confidence.</p>
          <Link to="/contact" className="inline-flex bg-primary text-white px-8 py-4 rounded-xl font-bold text-sm uppercase tracking-wider hover:bg-primary-dark shadow-primary-glow hover:-translate-y-1 transition-all duration-300">
            Contact Us Today
          </Link>
        </div>
      </section>
    </div>
  );
};

export default BlogDetail;
