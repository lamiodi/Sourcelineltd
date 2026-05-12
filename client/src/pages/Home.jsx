import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ArrowLeft, CheckCircle, ShieldCheck, Briefcase, Ruler, MapTrifold as Map, HardHat, Plus, Globe, Stack as Layers, Tree as Trees, FileText, MapPin, Star, CaretRight as ChevronRight, Medal as Award, Users, TrendUp as TrendingUp, Clock } from '@phosphor-icons/react';
import { motion, AnimatePresence } from 'framer-motion';
import SEO from '../components/SEO';
import Faq from '../components/Faq';
import Process from '../components/process';
import LogoStream from '../components/LogoStream';
import useScrollReveal from '../hooks/useScrollReveal';
import { API_URL } from '../config';
import { projects as projectsData, services as servicesData, team as teamData } from '../data';

const iconMap = {
  Ruler, Map, Briefcase, FileText, Globe, Trees, Layers, ShieldCheck, HardHat, MapPin
};

/* ── Intersection Observer hook ────────── */
const useInView = (threshold = 0.2) => {
  const ref = useRef(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setInView(true); obs.disconnect(); } },
      { threshold }
    );
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, [threshold]);
  return [ref, inView];
};

/* useScrollReveal imported from shared hooks */

const Home = () => {
  const [currentHeroSlide, setCurrentHeroSlide] = useState(0);
  const [aboutSlide, setAboutSlide] = useState(0);
  const [missionSlide, setMissionSlide] = useState(0);
  const [isHeroPaused] = useState(false);

  const [recentProjects, setRecentProjects] = useState([]);
  const [services] = useState(servicesData.slice(0, 4));
  const [team] = useState(teamData.slice(0, 3));

  useEffect(() => {
    const fetchRecentProjects = async () => {
      try {
        const response = await fetch(`${API_URL}/projects`);
        if (response.ok) {
          const data = await response.json();
          setRecentProjects(data.slice(0, 4));
        } else {
          setRecentProjects(projectsData.slice(0, 4)); // fallback to static
        }
      } catch (err) {
        setRecentProjects(projectsData.slice(0, 4)); // fallback to static
      }
    };
    fetchRecentProjects();
  }, []);

  const [statsRef] = useInView(0.3);
  useScrollReveal();

  const heroCarouselImages = [
    "/images/dji_fly_20260128_125210_0_1769601130705_photo_low_quality.jpg.jpeg",
    "/images/Gemini_Generated_Image_cbkrlkcbkrlkcbkr.png",
    "/images/20250516_111224.jpg.jpeg",
    "/images/hero-new.jpeg"
  ];

  const missionImages = [
    "/images/IMG-20260113-WA0016.jpg.jpeg",
    "/images/20260204_120313.jpg.jpeg",
    "/images/d/WhatsApp Image 2026-04-05 at 7.34.35 PM (1).jpeg",
    "/images/newpic/tinywow_IMG_5654_89632580.jpg"
  ];

  const aboutCarouselImages = [
    "/images/isimi/WhatsApp Image 2026-02-10 at 3.30.16 PM (1).jpeg",
    "/images/isimi/WhatsApp Image 2026-02-10 at 3.30.21 PM (1).jpeg"
  ];

  const galleryImages = [
    "/images/d/WhatsApp Image 2026-04-05 at 7.34.35 PM.jpeg",
    "/images/20251029_104101.jpg.jpeg",
    "/images/d/WhatsApp Image 2026-04-05 at 7.34.36 PM.jpeg",
    "/images/20251103_103611.jpg copy.jpeg"
  ];

  useEffect(() => {
    if (isHeroPaused) return;
    const t = setInterval(() => setCurrentHeroSlide(p => (p + 1) % heroCarouselImages.length), 5000);
    return () => clearInterval(t);
  }, [heroCarouselImages.length, isHeroPaused]);

  useEffect(() => {
    const t = setInterval(() => setMissionSlide(p => (p + 1) % missionImages.length), 5000);
    return () => clearInterval(t);
  }, [missionImages.length]);

  useEffect(() => {
    const t = setInterval(() => setAboutSlide(p => (p + 1) % aboutCarouselImages.length), 4500);
    return () => clearInterval(t);
  }, [aboutCarouselImages.length]);

  const stats = [
    { value: '10+', label: 'Years Experience', icon: Clock },
    { value: '200+', label: 'Projects Completed', icon: TrendingUp },
    { value: '100%', label: 'SURCON Registered', icon: Award },
    { value: '100%', label: 'Client Satisfaction', icon: Users },
  ];

  const values = [
    { icon: ShieldCheck, title: 'Quality', desc: 'We adhere to the highest standards of surveying practice in every project.' },
    { icon: CheckCircle, title: 'Commitment', desc: 'Dedicated to delivering results on time, within scope and budget.' },
    { icon: Ruler, title: 'Precision', desc: 'Using modern equipment and methods for millimeter-level accuracy.' },
    { icon: HardHat, title: 'Safety', desc: 'Prioritizing the safety of our team and clients in all field operations.' },
    { icon: Map, title: 'Innovation', desc: 'Leveraging GIS, drone, and digital technologies for superior insights.' },
    { icon: Briefcase, title: 'Integrity', desc: 'Transparent dealings, honest consultancy, and ethical professionalism.' },
  ];

  const testimonials = [
    {
      name: 'Dr. Adebayo Johnson',
      role: 'Real Estate Developer',
      content: 'Sourceline delivered exceptional boundary survey services for our residential estate. Their precision and attention to detail saved us from potential legal disputes. Highly professional.',
      rating: 5,
      initial: 'D',
      color: 'from-orange-400 to-orange-600'
    },
    {
      name: 'Mrs. Chiamaka Okafor',
      role: 'Property Owner',
      content: "I was thoroughly impressed by their professionalism. They handled my land documentation seamlessly and kept me informed throughout. The SURCON verification gave me complete peace of mind.",
      rating: 5,
      initial: 'C',
      color: 'from-blue-400 to-blue-600'
    },
    {
      name: 'Engr. Tunde Williams',
      role: 'Construction CEO',
      content: "For our commercial projects, we trust only Sourceline. Their engineering surveys are always accurate and delivered on time. They've become our go-to surveying partner.",
      rating: 5,
      initial: 'E',
      color: 'from-emerald-400 to-emerald-600'
    }
  ];

  return (
    <div className="font-sans">
      <SEO
        title="Home"
        description="Sourceline Limited: Premier Land Surveying and Geoinformatics services in Nigeria. Accurate boundaries, engineering surveys, and digital mapping. SURCON registered."
        keywords="land surveying, nigeria, geoinformatics, boundary survey, surcon, topography, lagos"
      />

      {/* ─── HERO SECTION ──────────────────────────────────── */}
      <section className="relative min-h-[90vh] lg:min-h-screen flex items-center justify-center overflow-hidden bg-secondary">
        {/* Background Slides */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentHeroSlide}
            initial={{ opacity: 0, scale: 1.05 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.2, ease: "easeOut" }}
            className="absolute inset-0"
          >
            <img
              src={heroCarouselImages[currentHeroSlide]}
              alt={`Hero Slide ${currentHeroSlide + 1}`}
              className="w-full h-full object-cover"
              loading={currentHeroSlide === 0 ? 'eager' : 'lazy'}
            />
          </motion.div>
        </AnimatePresence>

        {/* Overlay — gradient for depth */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/35 to-black/20" />

        {/* Hero Content */}
        <div className="relative z-10 max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 w-full pt-32 sm:pt-40 lg:pt-0 flex flex-col h-full min-h-[70vh] sm:min-h-0 sm:justify-center">
          <div>
            {/* Label */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.6 }}
              className="flex items-center gap-4 mb-6"
            >
              <span className="w-8 h-px bg-primary" />
              <span className="text-primary text-[10px] sm:text-xs font-bold uppercase tracking-[0.3em]">
                Sourceline Limited
              </span>
            </motion.div>

            {/* Heading */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.6 }}
              className="text-5xl sm:text-7xl md:text-8xl font-display font-bold text-white tracking-tight leading-[1.05] mb-8"
            >
              Precision<br />
              <span className="text-primary font-light italic">Defined.</span>
            </motion.h1>

            {/* Description */}
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.6 }}
              className="text-base sm:text-lg text-white/60 max-w-lg leading-relaxed mb-12 font-light"
            >
              Delivering SURCON-compliant surveys and geospatial data across Nigeria with uncompromising accuracy.
            </motion.p>
          </div>

          {/* CTA Buttons */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.6 }}
            className="flex flex-col sm:flex-row gap-3 sm:gap-5 mt-auto sm:mt-0 mb-16 sm:mb-16 w-full sm:w-auto items-center sm:items-start"
          >
            <Link
              to="/contact"
              className="bg-primary text-white px-6 sm:px-10 py-5 rounded-2xl font-bold text-sm uppercase tracking-wider hover:bg-primary-dark transition-all duration-300 shadow-primary-glow hover:shadow-primary-glow-lg flex items-center justify-center gap-2.5 hover:-translate-y-1 group w-[85%] sm:w-auto whitespace-nowrap"
            >
              Request a Quote <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform shrink-0" />
            </Link>
            <Link
              to="/services"
              className="hidden sm:flex text-white px-6 sm:px-8 py-3.5 sm:py-4 rounded-full font-bold text-[10px] sm:text-xs uppercase tracking-[0.15em] border border-white/20 hover:bg-white/10 transition-all duration-300 items-center justify-center sm:w-auto whitespace-nowrap backdrop-blur-sm sm:backdrop-blur-none bg-white/5 sm:bg-transparent"
            >
              Our Services
            </Link>
          </motion.div>

          {/* Minimal Trust Indicators */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.7 }}
            transition={{ delay: 1, duration: 0.8 }}
            className="hidden sm:flex flex-wrap items-center gap-6 sm:gap-8 opacity-70"
          >
            {['SURCON Certified', '10+ Years Experience', 'Nationwide Reach'].map((item, i) => (
              <div key={i} className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                <span className="text-white text-[10px] sm:text-xs font-medium tracking-widest uppercase">{item}</span>
              </div>
            ))}
          </motion.div>
        </div>

        {/* Slide Indicators with Progress Bar */}
        <div className="absolute bottom-16 left-1/2 -translate-x-1/2 flex items-center gap-2.5 z-10">
          {heroCarouselImages.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentHeroSlide(index)}
              className="relative h-2 rounded-full overflow-hidden transition-all duration-500 bg-white/30"
              style={{ width: index === currentHeroSlide ? '2rem' : '0.5rem' }}
              aria-label={`Go to slide ${index + 1}`}
            >
              {index === currentHeroSlide && (
                <motion.div 
                  initial={{ width: "0%" }}
                  animate={{ width: "100%" }}
                  transition={{ duration: 5, ease: "linear" }}
                  className="absolute top-0 left-0 bottom-0 bg-primary"
                />
              )}
            </button>
          ))}
        </div>

        {/* Bottom Shape Divider */}
        <div className="absolute -bottom-[2px] left-0 w-full overflow-hidden leading-[0] rotate-180">
          <svg
            data-name="Layer 1"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 1200 120"
            preserveAspectRatio="none"
            className="relative block w-[calc(168%_+_1.3px)] md:w-[calc(150%_+_1.3px)] h-[89px]"
            style={{ stroke: 'none' }}
          >
            <path
              d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V0H0V27.35A600.21,600.21,0,0,0,321.39,56.44Z"
              className="fill-white"
              style={{ stroke: 'none' }}
            />
          </svg>
        </div>
      </section>

      <LogoStream />

      {/* ─── STATS SECTION ─────────────────────────────────── */}
      <section className="bg-white py-12 md:py-20" ref={statsRef}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="flex flex-col md:flex-row justify-between items-center md:items-end mb-12 sm:mb-16 reveal text-center md:text-left gap-4 md:gap-0">
            <div className="flex flex-col items-center md:items-start">
              <span className="section-label justify-center md:justify-start">Our Numbers</span>
              <h2 className="text-4xl md:text-5xl font-display font-bold text-secondary mt-2">Trusted by hundreds</h2>
            </div>
            <p className="text-gray-500 max-w-md text-sm leading-relaxed hidden md:block mt-2 md:text-right">
              Over a decade of providing reliable geospatial data for infrastructure development across Nigeria.
            </p>
          </div>

          {/* Image + Stats Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 md:gap-16 items-center mb-16">
            <div className="relative rounded-2xl sm:rounded-[2.5rem] overflow-hidden shadow-2xl reveal-left img-zoom h-[220px] sm:h-[400px] lg:h-[520px]">
              <img
                src="/images/20250516_130158.jpg.jpeg"
                alt="Field Survey Work"
                className="w-full h-full object-cover object-[25%_center]"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-secondary/40 via-transparent to-transparent opacity-40" />
            </div>

            <div className="grid grid-cols-2 gap-4 sm:gap-6 stagger-children">
              {stats.map((stat, idx) => (
                <div
                  key={idx}
                  className="reveal bg-white border border-gray-100 rounded-2xl sm:rounded-[2rem] p-6 sm:p-8 hover:border-primary/30 hover:bg-primary/5 transition-all duration-500 group hover:-translate-y-2 hover:shadow-2xl shadow-sm flex justify-between items-center"
                >
                  <div>
                    <div className="text-3xl sm:text-5xl font-display font-bold text-secondary mb-2 stat-number group-hover:text-primary transition-colors">{stat.value}</div>
                    <div className="text-[10px] sm:text-xs text-secondary/60 font-bold uppercase tracking-[0.2em]">{stat.label}</div>
                  </div>
                  <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center group-hover:bg-primary transition-all duration-500 group-hover:scale-110 group-hover:shadow-primary-glow shrink-0 ml-4">
                    <stat.icon className="h-6 w-6 text-primary group-hover:text-white transition-colors duration-300" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ─── SERVICES SECTION ──────────────────────────────── */}
      <section className="bg-gray-50 py-12 md:py-24 relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-primary/3 rounded-full blur-[100px] translate-x-1/3 -translate-y-1/3 pointer-events-none" />
        <div className="absolute inset-0 bg-mesh-gradient pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="text-center mb-12 sm:mb-16 reveal flex flex-col items-center">
            <span className="section-label justify-center">What We Do</span>
            <h2 className="text-4xl md:text-5xl font-display font-bold text-secondary mt-3 mb-6">
              Our Core Services
            </h2>
            <Link
              to="/services"
              className="hidden md:inline-flex items-center gap-2 text-sm font-bold text-secondary/50 hover:text-primary transition-colors group"
            >
              View All Services
              <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 stagger-children">
            {services.length > 0 ? services.map((service, idx) => {
              const IconComponent = iconMap[service.icon] || Ruler;
              return (
                <Link
                  key={idx}
                  to={`/services/${service.slug || service.id}`}
                  className="reveal group bg-white rounded-2xl overflow-hidden border border-gray-100 hover:border-primary/20 transition-all duration-500 hover:shadow-card-hover hover:-translate-y-2 flex flex-col"
                >
                  <div className="h-60 sm:h-64 md:h-72 relative overflow-hidden">
                    {/* Background Image */}
                    {service.image ? (
                      <div className="absolute inset-0 transition-transform duration-700 group-hover:scale-110">
                        <img
                          src={service.image}
                          alt={service.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ) : (
                      <div className="absolute inset-0 bg-gradient-to-br from-gray-50 to-gray-100/50">
                        <div className="absolute inset-0 dot-grid opacity-40" />
                      </div>
                    )}

                    {/* Icon Corner Badge */}
                    <div className="absolute top-4 right-4 z-10 transition-all duration-500 group-hover:scale-110">
                      <div className="w-12 h-12 bg-white/90 backdrop-blur-md shadow-lg border border-gray-100 rounded-xl flex items-center justify-center group-hover:bg-primary group-hover:border-primary group-hover:shadow-primary-glow transition-all duration-500">
                        <IconComponent className="h-6 w-6 text-primary group-hover:text-white transition-colors duration-300" />
                      </div>
                    </div>
                  </div>
                  <div className="p-6 flex-1 flex flex-col">
                    <h3 className="text-lg font-display font-bold text-secondary mb-2 group-hover:text-primary transition-colors duration-300">{service.title}</h3>
                    <p className="text-gray-500 text-sm leading-relaxed line-clamp-3 flex-1">{service.description}</p>
                    <div className="flex items-center gap-2 text-xs font-bold text-primary mt-4 uppercase tracking-wider group-hover:gap-3 transition-all">
                      Learn More <ArrowRight className="h-3 w-3 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </Link>
              );
            }) : (
              // Skeleton loaders
              [1, 2, 3, 4].map(i => (
                <div key={i} className="bg-white rounded-2xl overflow-hidden border border-gray-100">
                  <div className="h-60 sm:h-64 md:h-72 skeleton" />
                  <div className="p-6 space-y-3">
                    <div className="h-5 skeleton rounded-lg w-3/4" />
                    <div className="h-3 skeleton rounded w-full" />
                    <div className="h-3 skeleton rounded w-2/3" />
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="text-center mt-10 md:hidden">
            <Link to="/services" className="btn-secondary text-sm uppercase tracking-wider">
              View All Services <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* ─── VALUES SECTION ─────────────────────────────────── */}
      <section className="bg-white py-12 md:py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-mesh-gradient pointer-events-none" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="text-center mb-16 max-w-3xl mx-auto reveal">
            <span className="section-label justify-center">Why Choose Us</span>
            <h2 className="text-4xl md:text-5xl font-display font-bold text-secondary mb-4 mt-3">
              Built on Core Values
            </h2>
            <p className="text-gray-500 text-lg leading-relaxed">
              We operate with strict adherence to professional ethics and standards, ensuring every project is delivered with excellence.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 stagger-children">
            {values.map((item, idx) => (
              <div
                key={idx}
                className="reveal group p-8 rounded-2xl border border-gray-100 hover:border-primary/20 bg-white hover:bg-primary/[0.02] transition-all duration-500 hover:shadow-card-hover hover:-translate-y-1 card-premium"
              >
                <div className="flex justify-between items-start gap-4">
                  <div className="flex-1">
                    <h3 className="text-xl font-display font-bold text-secondary mb-3 group-hover:text-primary transition-colors duration-300">
                      {item.title}
                    </h3>
                    <p className="text-gray-500 leading-relaxed text-sm">{item.desc}</p>
                  </div>
                  <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center group-hover:bg-primary transition-all duration-500 group-hover:scale-110 group-hover:shadow-primary-glow shrink-0">
                    <item.icon className="h-7 w-7 text-primary group-hover:text-white transition-colors duration-300" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Process />

      {/* ─── FEATURED PROJECTS ──────────────────────────────── */}
      <section className="bg-secondary py-12 md:py-24 relative overflow-hidden">
        {/* Decorative blur circles */}
        <div className="absolute top-0 left-0 w-96 h-96 bg-primary/5 rounded-full blur-[80px] -translate-x-1/2 -translate-y-1/2 pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-[80px] translate-x-1/3 translate-y-1/3 pointer-events-none" />
        <div className="absolute inset-0 opacity-[0.015]" style={{ backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize: '32px 32px' }} />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-16 reveal">
            <div>
              <span className="text-xs font-bold uppercase tracking-[0.2em] text-primary/70 mb-3 block flex items-center gap-3" style={{ fontFamily: 'Inter, sans-serif' }}>
                <span className="inline-block w-8 h-px bg-gradient-to-r from-primary to-accent" />
                Recent Work
              </span>
              <h2 className="text-4xl md:text-5xl font-display font-bold text-white leading-tight mt-1">
                Our Latest<br className="hidden md:block" /> Projects
              </h2>
            </div>
            <Link
              to="/portfolio"
              className="hidden md:flex items-center gap-2 text-sm font-bold text-white/60 hover:text-white transition-colors group mt-4"
            >
              View All Projects <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          {recentProjects.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {recentProjects.map((project, idx) => (
                <Link
                  key={idx}
                  to={`/portfolio/${project.id || idx + 1}`}
                  className={`reveal group relative overflow-hidden rounded-2xl ${idx === 0 ? 'h-[400px] md:h-[500px]' : 'h-[350px] md:h-[400px]'}`}
                >
                  {project.image ? (
                    <img
                      src={project.image}
                      alt={project.title}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                      loading="lazy"
                    />
                  ) : (
                    <div className="w-full h-full bg-white/5 flex items-center justify-center">
                      <MapPin className="h-12 w-12 text-white/20" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />

                  <div className="absolute bottom-0 left-0 right-0 p-8 transform translate-y-2 group-hover:translate-y-0 transition-transform duration-500">
                    <div className="flex items-center gap-2 mb-3 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                      <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                      <span className="text-primary font-bold text-xs uppercase tracking-widest">{project.category}</span>
                    </div>
                    <h3 className="text-2xl font-display font-bold text-white leading-tight">{project.title}</h3>
                    {project.location && (
                      <div className="flex items-center gap-1.5 mt-2 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                        <MapPin className="h-3.5 w-3.5 text-primary/80" />
                        <span className="text-white/50 text-xs font-medium">{project.location}</span>
                      </div>
                    )}
                  </div>

                  <div className="absolute top-4 right-4 bg-white/10 backdrop-blur-md p-3 rounded-xl text-white opacity-0 -translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-500 group-hover:bg-primary">
                    <ArrowRight className="h-5 w-5 transform -rotate-45" />
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="rounded-2xl overflow-hidden bg-white/5" style={{ height: i <= 2 ? '400px' : '350px' }}>
                  <div className="w-full h-full skeleton opacity-20" />
                </div>
              ))}
            </div>
          )}

          <div className="text-center mt-10 md:hidden">
            <Link to="/portfolio" className="btn-primary text-sm uppercase tracking-wider">
              View All Projects <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* ─── QUALITY / ABOUT SPLIT SECTION ─────────────────── */}
      <section className="bg-white py-12 md:py-24 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          {/* Row 1: About - Image Right */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 md:gap-16 items-center mb-16 md:mb-28">
            <div className="reveal-left text-center lg:text-left flex flex-col items-center lg:items-start">
              <span className="section-label justify-center lg:justify-start">Excellence</span>
              <h2 className="text-4xl md:text-5xl font-display font-bold text-secondary mb-6 leading-tight mt-3">
                Exceptional quality<br /> that can&apos;t be beaten
              </h2>
              <p className="text-gray-500 text-lg leading-relaxed mb-6">
                From boundary surveys to complex engineering projects, our team brings decades of combined experience. We don&apos;t just measure land: we provide data that secures your future.
              </p>
              <ul className="space-y-3 mb-8 w-full text-left inline-block lg:w-auto">
                {['SURCON Certified Surveyors', 'Fully licensed professional team', 'Modern total station & GPS equipment', 'Available for interstate travel across Nigeria'].map((item, i) => (
                  <li key={i} className="flex items-center gap-3 text-gray-600 text-sm">
                    <div className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center shrink-0">
                      <CheckCircle className="h-3.5 w-3.5 text-primary" />
                    </div>
                    {item}
                  </li>
                ))}
              </ul>
              <Link
                to="/services"
                className="inline-flex items-center gap-2 border-2 border-secondary text-secondary px-8 py-3.5 rounded-2xl font-bold text-sm uppercase tracking-wider hover:bg-secondary hover:text-white transition-all duration-300 group"
              >
                Explore Services <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>

            <div className="relative reveal-right">
              {/* Image carousel */}
              <div className="relative w-full h-[480px] rounded-3xl overflow-hidden shadow-elevated img-zoom">
                {aboutCarouselImages.map((img, index) => (
                  <div
                    key={index}
                    className={`absolute inset-0 transition-opacity duration-1000 ${index === aboutSlide ? 'opacity-100' : 'opacity-0'}`}
                  >
                    <img src={img} alt={`About Slide ${index + 1}`} className="w-full h-full object-cover" loading="lazy" />
                  </div>
                ))}
                <div className="absolute inset-0 bg-gradient-to-t from-secondary/20 to-transparent" />

                {/* Slide dots */}
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-10">
                  {aboutCarouselImages.map((_, i) => (
                    <button key={i} onClick={() => setAboutSlide(i)}
                      className={`transition-all duration-300 rounded-full ${i === aboutSlide ? 'w-6 h-2 bg-primary shadow-primary-glow' : 'w-2 h-2 bg-white/50'}`}
                    />
                  ))}
                </div>
              </div>

              {/* Floating Info Card */}
              <div className="absolute bottom-6 left-6 md:-bottom-6 md:-left-6 bg-white/90 backdrop-blur-md border border-gray-100 rounded-2xl p-4 md:p-5 shadow-xl hover-lift z-20">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 md:w-12 md:h-12 bg-primary rounded-xl flex items-center justify-center shrink-0 shadow-lg shadow-primary/20">
                    <TrendingUp className="h-5 w-5 md:h-6 md:w-6 text-white" />
                  </div>
                  <div>
                    <p className="font-display font-bold text-xl md:text-2xl text-secondary">200+</p>
                    <p className="text-gray-500 text-[10px] md:text-xs">Completed Projects</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Row 2: Mission - Image Left */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 md:gap-16 items-center">
            <div className="relative order-2 lg:order-1 reveal-left">
              <div className="relative w-full h-[480px] rounded-3xl overflow-hidden shadow-elevated img-zoom">
                {missionImages.map((img, index) => (
                  <div
                    key={index}
                    className={`absolute inset-0 transition-opacity duration-1000 ${index === missionSlide ? 'opacity-100' : 'opacity-0'}`}
                  >
                    <img src={img} alt={`Mission Slide ${index + 1}`} className="w-full h-full object-cover" loading="lazy" />
                  </div>
                ))}
                <div className="absolute inset-0 bg-gradient-to-t from-secondary/20 to-transparent" />
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-10">
                  {missionImages.map((_, i) => (
                    <button key={i} onClick={() => setMissionSlide(i)}
                      className={`transition-all duration-300 rounded-full ${i === missionSlide ? 'w-6 h-2 bg-primary shadow-primary-glow' : 'w-2 h-2 bg-white/50'}`}
                    />
                  ))}
                </div>
              </div>

              <div className="absolute bottom-6 right-6 md:-bottom-6 md:-right-6 bg-secondary/90 backdrop-blur-md text-white rounded-2xl p-4 md:p-5 shadow-2xl hover-lift z-20">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 md:w-12 md:h-12 bg-primary rounded-xl flex items-center justify-center shrink-0 shadow-lg shadow-primary/20">
                    <Clock className="h-5 w-5 md:h-6 md:w-6 text-white" />
                  </div>
                  <div>
                    <p className="font-display font-bold text-xl md:text-2xl">10+</p>
                    <p className="text-white/70 text-[10px] md:text-xs">Years of Excellence</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="order-1 lg:order-2 reveal-right text-center lg:text-left flex flex-col items-center lg:items-start">
              <span className="section-label justify-center lg:justify-start">Our Mission</span>
              <h2 className="text-4xl md:text-5xl font-display font-bold text-secondary mb-6 leading-tight mt-3">
                Delivering precision,<br /> every single time
              </h2>
              <p className="text-gray-500 text-lg leading-relaxed mb-6">
                To be the leading provider of geospatial solutions in Nigeria, known for accuracy, reliability, and professional integrity. We strive to empower our clients with the precise data they need.
              </p>
              <p className="text-gray-500 leading-relaxed mb-8 text-base">
                Our team of dedicated field engineers and GIS specialists brings together technology and experience to deliver results that matter.
              </p>
              <Link
                  to="/contact"
                  className="inline-flex items-center gap-2 bg-secondary text-white px-8 py-3.5 rounded-2xl font-bold text-sm uppercase tracking-wider hover:bg-secondary-light transition-all duration-300 hover:-translate-y-0.5 group"
                >
                  Request a Quote <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ─── TESTIMONIALS ───────────────────────────────────── */}
      <section className="bg-gray-50 py-12 md:py-24 overflow-hidden relative">
        <div className="absolute inset-0 bg-mesh-gradient pointer-events-none" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="text-center mb-16 reveal">
            <span className="section-label justify-center">Social Proof</span>
            <h2 className="text-4xl font-display font-bold text-secondary mb-4 mt-3">What Our Clients Say</h2>
            <p className="text-gray-500 max-w-2xl mx-auto">
              Don&apos;t just take our word for it. Here&apos;s what our satisfied clients have to say.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 stagger-children">
            {testimonials.map((t, idx) => (
              <div
                key={idx}
                className="reveal bg-white rounded-2xl p-8 border border-gray-100 hover:border-primary/20 hover:shadow-card-hover transition-all duration-500 relative group quote-mark hover:-translate-y-1"
              >
                {/* Stars */}
                <div className="flex gap-1 mb-5">
                  {[...Array(t.rating)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 text-amber-400 fill-amber-400" />
                  ))}
                </div>

                <p className="text-gray-600 leading-relaxed text-sm mb-6 italic relative z-10">
                  &ldquo;{t.content}&rdquo;
                </p>

                <div className="flex items-center gap-3 border-t border-gray-100 pt-6">
                  <div className={`w-12 h-12 bg-gradient-to-br ${t.color} rounded-2xl flex items-center justify-center text-white font-display font-bold text-lg shrink-0 shadow-lg`}>
                    {t.initial}
                  </div>
                  <div>
                    <h4 className="font-bold text-secondary text-sm">{t.name}</h4>
                    <p className="text-gray-400 text-xs font-medium">{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── TEAM SECTION ───────────────────────────────────── */}
      <section className="bg-white py-12 md:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center md:items-end mb-12 sm:mb-16 reveal text-center md:text-left gap-6 md:gap-0">
            <div className="flex flex-col items-center md:items-start">
              <span className="section-label justify-center md:justify-start">Our People</span>
              <h2 className="text-4xl font-display font-bold text-secondary mt-3">
                The team behind<br /> Sourceline
              </h2>
            </div>
            <Link
              to="/about#team"
              className="hidden md:flex items-center gap-2 text-sm font-bold text-secondary/50 hover:text-primary transition-colors mt-4 group"
            >
              Meet Everyone <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 stagger-children">
            {(team.length > 0 ? team : [
              { name: 'Principal Surveyor', position: 'Lead Surveyor & CEO', image: '/images/IMG-20260113-WA0012.jpg.jpeg' },
              { name: 'GIS Specialist', position: 'Head of GIS & Mapping', image: '/images/IMG-20260113-WA0016.jpg.jpeg' },
              { name: 'Site Engineer', position: 'Field Operations Manager', image: '/images/IMG-20260129-WA0005.jpg.jpeg' }
            ]).map((member, idx) => (
              <div key={idx} className="reveal group">
                <div className="relative overflow-hidden rounded-2xl mb-5 aspect-[3/4]">
                  {member.image ? (
                    <img
                      src={member.image}
                      alt={member.name}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                      loading="lazy"
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                      <span className="text-5xl font-display font-bold text-gray-300">{member.name?.[0]}</span>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-secondary/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  <div className="absolute inset-0 flex items-end justify-center pb-6 opacity-0 group-hover:opacity-100 transition-all duration-500 translate-y-2 group-hover:translate-y-0">
                    <Link to="/about#team" className="bg-primary text-white px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider shadow-primary-glow hover:bg-primary-dark transition-all">
                      View Team
                    </Link>
                  </div>
                </div>
                <h3 className="text-xl font-display font-bold text-secondary">{member.name}</h3>
                <p className="text-sm text-primary font-semibold mt-1">{member.position}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── FAQ SECTION ────────────────────────────────────── */}
      <Faq />

      {/* ─── GALLERY SECTION ────────────────────────────────── */}
      <section className="bg-gray-50 py-16 md:py-28 relative overflow-hidden">
        {/* Background Decorative Elements */}
        <div className="absolute top-0 left-0 w-full h-full opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle, #FF6806 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
        <div className="absolute top-1/2 left-0 -translate-y-1/2 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[120px] pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="text-center mb-16 reveal">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gradient-to-r from-[#833ab4]/10 via-[#fd1d1d]/10 to-[#fcb045]/10 border border-red-500/10 mb-6">
              <span className="w-2 h-2 rounded-full bg-gradient-to-tr from-[#833ab4] via-[#fd1d1d] to-[#fcb045] animate-pulse" />
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-secondary/60">Follow Along</span>
            </div>
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-display font-bold text-secondary mb-6 tracking-tight">
              Our Work in <span className="text-primary italic font-medium">Action</span>
            </h2>
            <a
              href="https://www.instagram.com/sourcelinelimited?igsh=MWlrOTJwMDlkZmJuNg=="
              target="_blank"
              rel="noopener noreferrer"
              className="group inline-flex items-center gap-3 px-6 py-3 bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:border-primary/20 transition-all duration-300"
            >
              <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-[#833ab4] via-[#fd1d1d] to-[#fcb045] flex items-center justify-center text-white shadow-sm">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" /></svg>
              </div>
              <div className="text-left">
                <span className="block text-xs font-bold text-secondary uppercase tracking-wider group-hover:text-primary transition-colors">@sourcelinelimited</span>
                <span className="block text-[10px] text-gray-400 font-medium leading-none mt-0.5">Visit our Instagram</span>
              </div>
              <ArrowRight className="h-4 w-4 text-gray-300 group-hover:text-primary group-hover:translate-x-1 transition-all ml-2" />
            </a>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 items-start">
            {galleryImages.map((img, idx) => (
              <a
                key={idx}
                href="https://www.instagram.com/sourcelinelimited?igsh=MWlrOTJwMDlkZmJuNg=="
                target="_blank"
                rel="noopener noreferrer"
                className={`reveal group overflow-hidden rounded-3xl relative shadow-md hover:shadow-2xl transition-all duration-700 hover:-translate-y-2 ${idx === 0 ? 'aspect-[3/4] lg:mt-8' :
                  idx === 1 ? 'aspect-square' :
                    idx === 2 ? 'aspect-[3/4] lg:mt-12' :
                      'aspect-square'
                  }`}
              >
                <img
                  src={img}
                  alt={`Gallery ${idx + 1}`}
                  className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
                  loading="lazy"
                />

                {/* Refined Instagram Style Overlay */}
                <div className="absolute inset-0 bg-gradient-to-tr from-[#833ab4]/40 via-[#fd1d1d]/30 to-[#fcb045]/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-500 scale-75 group-hover:scale-100">
                  <div className="w-12 h-12 bg-white/20 backdrop-blur-md border border-white/40 rounded-2xl flex items-center justify-center text-white shadow-xl">
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" /></svg>
                  </div>
                </div>
              </a>
            ))}
          </div>
        </div>
      </section>

    </div>
  );
};

export default Home;
