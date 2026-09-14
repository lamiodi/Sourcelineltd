import { useState, useEffect, useRef, useLayoutEffect } from 'react';
import { MapPin, ArrowRight, Buildings as Building, CheckCircle, MagnifyingGlass as Search, X } from '@phosphor-icons/react';
import { Link } from 'react-router-dom';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import SEO from '../components/SEO';
import { API_URL } from '../config';
import { projects as staticProjectsData } from '../data';

gsap.registerPlugin(ScrollTrigger);

/* ── Animated Counter ── */
const AnimatedCounter = ({ value, suffix = '' }) => {
  const ref = useRef(null);
  const numVal = parseInt(value, 10);

  useLayoutEffect(() => {
    if (!ref.current || isNaN(numVal)) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(
        ref.current,
        { textContent: 0 },
        {
          textContent: numVal,
          duration: 2,
          ease: 'power2.out',
          snap: { textContent: 1 },
          scrollTrigger: {
            trigger: ref.current,
            start: 'top 90%',
            once: true,
          },
          onUpdate() {
            if (ref.current) {
              ref.current.textContent = Math.round(gsap.getProperty(ref.current, 'textContent')) + suffix;
            }
          },
        }
      );
    });
    return () => ctx.revert();
  }, [numVal, suffix]);

  return <span ref={ref}>0{suffix}</span>;
};

const Portfolio = () => {
  const [filter, setFilter] = useState("All");
  const [search, setSearch] = useState("");
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  const heroRef = useRef(null);
  const heroImgRef = useRef(null);
  const gridRef = useRef(null);
  const trustRef = useRef(null);
  const ctaRef = useRef(null);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const response = await fetch(`${API_URL}/projects`);
        if (response.ok) {
          const data = await response.json();
          setProjects(data);
        } else {
          setProjects(staticProjectsData);
        }
      } catch {
        setProjects(staticProjectsData);
      } finally {
        setLoading(false);
      }
    };
    fetchProjects();
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
      gsap.from('.portfolio-hero-content > *', {
        y: 60,
        opacity: 0,
        duration: 1,
        stagger: 0.14,
        ease: 'power3.out',
        delay: 0.2,
      });
    });

    return () => ctx.revert();
  }, []);

  // Grid stagger
  useLayoutEffect(() => {
    if (!gridRef.current || loading) return;
    const ctx = gsap.context(() => {
      const cards = gridRef.current.querySelectorAll('.project-card');
      gsap.fromTo(
        cards,
        { y: 80, opacity: 0, scale: 0.95 },
        {
          y: 0,
          opacity: 1,
          scale: 1,
          duration: 0.8,
          stagger: 0.08,
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
  }, [projects, filter, search, loading]);

  // Trust section items
  useLayoutEffect(() => {
    if (!trustRef.current) return;
    const ctx = gsap.context(() => {
      gsap.from(trustRef.current.querySelectorAll('.trust-item'), {
        x: -40,
        opacity: 0,
        duration: 0.7,
        stagger: 0.12,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: trustRef.current,
          start: 'top 75%',
          once: true,
        },
      });
      // Trust image
      gsap.from(trustRef.current.querySelector('.trust-image'), {
        scale: 0.92,
        opacity: 0,
        duration: 1,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: trustRef.current,
          start: 'top 75%',
          once: true,
        },
      });
    }, trustRef);
    return () => ctx.revert();
  }, []);

  // CTA reveal
  useLayoutEffect(() => {
    if (!ctaRef.current) return;
    const ctx = gsap.context(() => {
      gsap.from(ctaRef.current.querySelectorAll('.cta-reveal'), {
        y: 50,
        opacity: 0,
        duration: 0.9,
        stagger: 0.1,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: ctaRef.current,
          start: 'top 80%',
          once: true,
        },
      });
    }, ctaRef);
    return () => ctx.revert();
  }, []);

  const uniqueCategories = ["All", ...new Set(projects.map(p => p.category))];

  const filteredProjects = projects.filter(project => {
    const matchesCategory = filter === "All" || project.category === filter;
    const q = search.toLowerCase();
    const matchesSearch = !q ||
      project.title?.toLowerCase().includes(q) ||
      project.location?.toLowerCase().includes(q) ||
      project.description?.toLowerCase().includes(q);
    return matchesCategory && matchesSearch;
  });

  const featuredProjects = filteredProjects.slice(0, 2);
  const gridProjects = filteredProjects.slice(2);

  const stats = [
    { value: `${projects.length}`, suffix: '+', label: "Estates Surveyed" },
    { value: "10", suffix: '+', label: "Years Experience" },
    { value: "100", suffix: '%', label: "Client Satisfaction" },
    { value: "6", suffix: '+', label: "Service Categories" },
  ];

  return (
    <main className="overflow-x-hidden w-full max-w-full font-sans">
      <SEO
        title="Portfolio"
        description="Browse our portfolio of successful estate surveying projects across Lagos and Nigeria. From residential layouts to large-scale infrastructure developments."
      />

      {/* ═══ CINEMATIC HERO ═══════════════════════════════════════ */}
      <section ref={heroRef} className="relative min-h-[80vh] flex items-center justify-center overflow-hidden bg-secondary">
        <div ref={heroImgRef} className="absolute inset-0 will-change-transform">
          <img
            src="/images/20250516_111224.jpg.jpeg"
            alt=""
            className="w-full h-[130%] object-cover opacity-20"
            style={{ filter: 'contrast(1.1) brightness(0.85)' }}
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-b from-secondary/50 via-secondary/75 to-secondary" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-10%,rgba(255,104,6,0.1),transparent)]" />

        <div className="portfolio-hero-content relative z-10 max-w-6xl mx-auto px-4 sm:px-6 text-center py-32 md:py-40">
          <div className="w-16 h-[2px] bg-gradient-to-r from-primary to-accent mx-auto mb-8" />
          <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-[5.5rem] font-display font-bold text-white tracking-tight leading-[1.05] mb-8">
            Our <span className="text-primary">Projects</span>
          </h1>
          <p className="text-lg md:text-xl text-white/45 max-w-2xl mx-auto leading-relaxed mb-16 font-light">
            Every estate tells a story of precision, expertise, and trust. Explore {projects.length} successful projects delivered across Nigeria.
          </p>

          {/* Inline stat counters */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto">
            {stats.map((stat, idx) => (
              <div key={idx} className="bg-white/[0.04] backdrop-blur-sm border border-white/[0.06] rounded-2xl p-5 text-center">
                <p className="text-3xl md:text-4xl font-display font-bold text-primary mb-1">
                  <AnimatedCounter value={stat.value} suffix={stat.suffix} />
                </p>
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/30">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ PROJECTS ═════════════════════════════════════════════ */}
      <section className="py-20 md:py-32 bg-white relative overflow-hidden">
        <div className="absolute inset-0 bg-mesh-gradient pointer-events-none opacity-60" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">

          {/* Header + Controls */}
          <div className="text-center mb-6">
            <div className="w-10 h-[2px] bg-gradient-to-r from-primary to-accent mx-auto mb-5" />
            <h2 className="text-4xl md:text-5xl font-display font-bold text-secondary mb-4">Projects We Have Delivered</h2>
            <p className="text-gray-400 max-w-2xl mx-auto font-light">From boundary demarcation to full estate layout surveys, each project reflects our commitment to accuracy and professional excellence.</p>
          </div>

          {/* Search + Filters */}
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-16 mt-12">
            {/* Category tabs */}
            <div className="flex flex-wrap gap-1">
              {uniqueCategories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setFilter(cat)}
                  className={`relative px-5 py-2.5 text-xs font-bold uppercase tracking-[0.15em] transition-all duration-400 rounded-xl ${
                    filter === cat
                      ? 'text-primary bg-primary/8'
                      : 'text-gray-400 hover:text-secondary'
                  }`}
                >
                  {cat}
                  {filter === cat && (
                    <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-5 h-[2px] bg-primary rounded-full" />
                  )}
                </button>
              ))}
            </div>

            {/* Search */}
            <div className="relative group w-full md:w-80">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-300 group-focus-within:text-primary transition-colors duration-300" />
              <input
                type="text"
                placeholder="Search projects..."
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

          {/* Projects Display */}
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[1, 2, 3].map(i => (
                <div key={i} className="rounded-2xl overflow-hidden">
                  <div className="h-80 skeleton" />
                  <div className="p-4 space-y-2">
                    <div className="h-5 skeleton rounded-lg w-2/3" />
                    <div className="h-3 skeleton rounded w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          ) : filteredProjects.length > 0 ? (
            <div ref={gridRef}>
              {/* ── Featured Projects (first 2) ── */}
              {featuredProjects.length > 0 && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
                  {featuredProjects.map((project) => (
                    <Link key={project.id} to={`/portfolio/${project.id}`} className="project-card group block">
                      <div className="relative rounded-3xl overflow-hidden h-[400px] lg:h-[480px] bg-gray-50">
                        {project.image ? (
                          <img
                            src={project.image}
                            alt={project.title}
                            className="w-full h-full object-cover transition-transform duration-[1.2s] ease-out group-hover:scale-105"
                            loading="lazy"
                            style={{ filter: 'contrast(1.05)' }}
                          />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-50 flex flex-col items-center justify-center">
                            <Building className="h-14 w-14 text-gray-200 mb-3" />
                            <span className="text-xs font-bold uppercase tracking-wider text-gray-300">Estate Project</span>
                          </div>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-secondary/80 via-secondary/20 to-transparent" />

                        {/* Category badge */}
                        <div className="absolute top-5 left-5 z-10">
                          <span className="bg-primary text-white text-[10px] font-bold px-3.5 py-1.5 rounded-xl uppercase tracking-[0.2em] shadow-primary-glow/50">
                            {project.category}
                          </span>
                        </div>

                        {/* Arrow */}
                        <div className="absolute top-5 right-5 z-10 w-10 h-10 bg-white/10 backdrop-blur-md rounded-xl flex items-center justify-center opacity-0 -translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-500">
                          <ArrowRight className="h-4 w-4 text-white -rotate-45" />
                        </div>

                        {/* Bottom content */}
                        <div className="absolute bottom-0 left-0 right-0 p-7 z-10">
                          <h3 className="text-2xl md:text-3xl font-display font-bold text-white mb-2 leading-tight group-hover:text-primary transition-colors duration-500">
                            {project.title}
                          </h3>
                          <div className="flex items-center text-white/50 text-xs font-semibold uppercase tracking-wider gap-1.5">
                            <MapPin className="h-3.5 w-3.5 text-primary" />
                            {project.location}
                          </div>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}

              {/* ── Remaining projects — bento grid ── */}
              {gridProjects.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8" style={{ gridAutoFlow: 'dense' }}>
                  {gridProjects.map((project) => (
                    <Link key={project.id} to={`/portfolio/${project.id}`} className="project-card group block">
                      <div className="overflow-hidden rounded-2xl mb-5 relative bg-gray-50">
                        <div className="absolute top-4 left-4 z-10">
                          <span className="bg-primary text-white text-[10px] font-bold px-3 py-1.5 rounded-xl uppercase tracking-[0.18em]">
                            {project.category}
                          </span>
                        </div>
                        <div className="absolute top-4 right-4 z-10 w-9 h-9 bg-white/10 backdrop-blur-md rounded-xl flex items-center justify-center opacity-0 -translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-500">
                          <ArrowRight className="h-3.5 w-3.5 text-white -rotate-45" />
                        </div>
                        {project.image ? (
                          <img
                            src={project.image}
                            alt={project.title}
                            className="w-full h-80 object-cover transition-all duration-[1s] ease-out group-hover:scale-[1.06]"
                            loading="lazy"
                            style={{ filter: 'contrast(1.03)' }}
                          />
                        ) : (
                          <div className="w-full h-80 bg-gradient-to-br from-gray-100 to-gray-50 flex flex-col items-center justify-center">
                            <Building className="h-12 w-12 text-gray-200 mb-3" />
                            <span className="text-xs font-bold uppercase tracking-wider text-gray-300">Estate Project</span>
                          </div>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-secondary/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                      </div>
                      <h3 className="text-lg font-display font-bold text-secondary mb-2 group-hover:text-primary transition-colors duration-300">{project.title}</h3>
                      <div className="flex items-center text-gray-400 text-xs mb-3">
                        <MapPin className="h-3.5 w-3.5 mr-1.5 text-primary" />
                        <span className="font-semibold uppercase tracking-wide">{project.location}</span>
                      </div>
                      <p className="text-gray-400 leading-relaxed text-sm line-clamp-2 font-light">{project.description}</p>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-20 md:py-28">
              <MapPin className="h-12 w-12 text-gray-200 mx-auto mb-5" />
              <p className="text-gray-300 font-medium text-lg mb-2">
                No projects found{search ? ` for "${search}"` : ' for this category'}.
              </p>
              {(search || filter !== 'All') && (
                <button onClick={() => { setSearch(''); setFilter('All'); }} className="mt-4 text-primary text-xs font-bold uppercase tracking-wider hover:underline">
                  Clear filters
                </button>
              )}
            </div>
          )}
        </div>
      </section>

      {/* ═══ WHY TRUST US ═════════════════════════════════════════ */}
      <section className="py-24 md:py-36 bg-gray-50/50 relative overflow-hidden" ref={trustRef}>
        <div className="absolute inset-0 bg-mesh-gradient pointer-events-none opacity-40" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 md:gap-20 items-center">
            <div className="text-center lg:text-left flex flex-col items-center lg:items-start">
              <div className="w-10 h-[2px] bg-gradient-to-r from-primary to-accent mb-6" />
              <h2 className="text-4xl md:text-5xl font-display font-bold text-secondary mb-6 leading-tight">
                Delivered with precision,<br className="hidden lg:block" /> every single time
              </h2>
              <p className="text-gray-400 text-lg leading-relaxed mb-10 max-w-lg font-light">
                Every estate in our portfolio was delivered on time, within budget, and to the highest SURCON standards. Our clients return because they trust our accuracy and professionalism.
              </p>
              <ul className="space-y-5 w-full max-w-lg">
                {[
                  'SURCON-certified survey plans for every project',
                  'Millimetre-level accuracy with RTK GNSS equipment',
                  'Same team from field survey to final plan delivery',
                  'Transparent reporting and ongoing client communication',
                ].map((item, i) => (
                  <li key={i} className="trust-item flex items-start gap-4 group">
                    <div className="w-7 h-7 bg-primary/10 rounded-full flex items-center justify-center shrink-0 mt-0.5 group-hover:bg-primary transition-colors duration-400">
                      <CheckCircle className="h-4 w-4 text-primary group-hover:text-white transition-colors" weight="bold" />
                    </div>
                    <span className="text-gray-500 leading-relaxed text-[15px]">{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="trust-image relative rounded-3xl overflow-hidden shadow-elevated">
              <img
                src="/images/20260204_120452.jpg.jpeg"
                alt="Survey team in the field"
                className="w-full h-[350px] md:h-[520px] object-cover"
                loading="lazy"
                style={{ filter: 'contrast(1.05)' }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-secondary/50 via-transparent to-transparent" />
              <div className="absolute bottom-6 left-6 right-6">
                <div className="bg-white/10 backdrop-blur-xl border border-white/10 rounded-2xl p-5 flex items-center gap-4">
                  <div className="w-11 h-11 bg-primary rounded-xl flex items-center justify-center shrink-0">
                    <Building className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <p className="text-white font-bold text-sm">{projects.length} Estates Completed</p>
                    <p className="text-white/40 text-xs">Across Lagos &amp; Nigeria</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ CTA SECTION ══════════════════════════════════════════ */}
      <section className="bg-secondary py-24 md:py-36 overflow-hidden relative" ref={ctaRef}>
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_50%_50%,rgba(255,104,6,0.06),transparent)]" />
        <div className="absolute inset-0 opacity-[0.02]" style={{ backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize: '32px 32px' }} />

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <div className="cta-reveal w-12 h-[2px] bg-gradient-to-r from-primary to-accent mx-auto mb-8" />
          <h2 className="cta-reveal text-4xl md:text-5xl font-display font-bold text-white mb-6 leading-tight">
            Ready to add your estate to this list?
          </h2>
          <p className="cta-reveal text-white/40 max-w-2xl mx-auto mb-12 text-lg leading-relaxed font-light">
            Whether you need a boundary survey for a single parcel or comprehensive cadastral layout for a multi-hectare estate, our practice is ready.
            Contact our registered surveying team for technical scope evaluation.
          </p>
          <div className="cta-reveal flex flex-col sm:flex-row gap-4 justify-center w-full">
            <Link
              to="/contact"
              className="bg-primary text-white px-8 py-4 rounded-xl font-bold text-sm uppercase tracking-wider shadow-primary-glow hover:bg-primary-dark hover:shadow-primary-glow-lg hover:-translate-y-1 transition-all duration-300 flex items-center justify-center gap-2.5 group w-full sm:w-[240px]"
            >
              Verify Your Land <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              to="/services"
              className="border border-white/15 text-white/50 px-8 py-4 rounded-xl font-bold text-sm uppercase tracking-wider hover:bg-white/[0.06] hover:text-white hover:border-white/30 transition-all duration-300 flex items-center justify-center gap-2.5 group w-full sm:w-[240px]"
            >
              View Our Services <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
};

export default Portfolio;
