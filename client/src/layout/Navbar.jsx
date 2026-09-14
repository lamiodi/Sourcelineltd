import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { List as Menu, X, Phone, ArrowRight, Envelope as Mail } from '@phosphor-icons/react';
import { motion, AnimatePresence } from 'framer-motion';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const location = useLocation();

  useEffect(() => {
    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const scrollY = window.scrollY;
          setIsScrolled(scrollY > 20);
          const docHeight = document.documentElement.scrollHeight - window.innerHeight;
          setScrollProgress(docHeight > 0 ? (scrollY / docHeight) * 100 : 0);
          ticking = false;
        });
        ticking = true;
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  const navigation = [
    { name: 'Home', path: '/' },
    { name: 'About', path: '/about' },
    { name: 'Services', path: '/services' },
    { name: 'Portfolio', path: '/portfolio' },
    { name: 'Verify', path: '/verify' },
    { name: 'Blog', path: '/blog' },
  ];

  const isActive = (path) => {
    if (path === '/' && location.pathname !== '/') return false;
    return location.pathname.startsWith(path);
  };

  return (
    <>
      {/* Progress Bar */}
      <div
        className="fixed top-0 left-0 h-[3px] bg-gradient-to-r from-primary via-accent to-primary z-[60] transition-all duration-75"
        style={{ width: `${scrollProgress}%` }}
      />

      <nav
        className={`fixed top-0 w-full z-50 transition-all duration-500 ease-out-expo ${isScrolled
          ? 'bg-white/95 backdrop-blur-xl shadow-soft-lg py-0'
          : 'bg-gradient-to-b from-black/40 via-black/20 to-transparent py-1'
          }`}
        style={{ top: scrollProgress > 0 ? '3px' : '0' }}
        aria-label="Main navigation"
      >
        {/* Noise overlay for glassmorphism */}
        {isScrolled && (
          <div className="absolute inset-0 opacity-[0.015] mix-blend-overlay pointer-events-none" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noiseFilter%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.65%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noiseFilter)%22/%3E%3C/svg%3E")' }} />
        )}
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="flex justify-between items-center h-16 lg:h-18">

            {/* Logo */}
            <div className="flex-shrink-0 flex items-center z-50">
              <Link to="/" className="flex items-center gap-3 group" onClick={() => setIsOpen(false)}>
                <div className="relative">
                  <img
                    src="/images/favicon-new.jpeg"
                    alt="Sourceline Logo"
                    className="pb-1 h-10 w-10 rounded-xl object-cover ring-2 ring-primary bg-white transition-all duration-500 group-hover:ring-primary-light group-hover:scale-105 group-hover:shadow-primary-glow"
                  />
                  <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-primary rounded-full border-2 border-white transition-opacity" />
                </div>
                <div className="flex flex-col leading-none">
                  <span className={`font-display-alt font-bold text-base tracking-[0.14em] uppercase transition-colors duration-300 ${isScrolled ? 'text-secondary' : 'text-white'}`}>
                    Sourceline
                  </span>
                  <span className={`text-[9px] tracking-[0.18em] uppercase transition-colors duration-300 font-semibold ${isScrolled ? 'text-primary' : 'text-primary-light'}`}>
                    Limited
                  </span>
                </div>
              </Link>
            </div>

            {/* Desktop Menu */}
            <div className="hidden lg:flex items-center gap-0.5">
              {navigation.map((link) => (
                <Link
                  key={link.name}
                  to={link.path}
                  className={`relative text-[13px] font-semibold tracking-wide transition-colors duration-300 px-4 py-2 rounded-xl group ${
                    isActive(link.path)
                      ? isScrolled ? 'text-primary' : 'text-white'
                      : isScrolled ? 'text-secondary/60 hover:text-secondary hover:bg-gray-50' : 'text-white/70 hover:text-white hover:bg-white/10'
                  }`}
                  {...(isActive(link.path) ? { 'aria-current': 'page' } : {})}
                >
                  <span className="relative z-10">{link.name}</span>
                  {isActive(link.path) && (
                    <motion.span 
                      layoutId="navbar-underline"
                      transition={{ type: "spring", stiffness: 300, damping: 30 }}
                      className="absolute bottom-1 left-4 right-4 h-[2px] bg-gradient-to-r from-primary to-accent rounded-full" 
                    />
                  )}
                  {!isActive(link.path) && (
                    <span className="absolute bottom-1 left-4 right-4 h-[2px] bg-gradient-to-r from-primary to-accent transform origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-300 rounded-full" />
                  )}
                </Link>
              ))}
            </div>

            {/* Desktop CTA */}
            <div className="hidden lg:flex items-center gap-3">
              <a
                href="tel:+2348034618227"
                className={`flex items-center gap-2 text-sm font-medium transition-all duration-300 px-3 py-2 rounded-xl ${isScrolled ? 'text-secondary/50 hover:text-primary hover:bg-primary/5' : 'text-white/60 hover:text-white hover:bg-white/10'}`}
              >
                <Phone className="h-4 w-4" />
                <span className="hidden xl:inline text-xs font-semibold">+234 803 461 8227</span>
              </a>
              <Link
                to="/contact"
                className="bg-primary text-white px-6 py-2.5 rounded-xl text-[13px] font-bold uppercase tracking-wider shadow-primary-glow hover:bg-primary-dark hover:shadow-primary-glow-lg hover:-translate-y-0.5 transition-all duration-300 flex items-center gap-2"
              >
                Make an Enquiry
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>

            {/* Mobile menu button */}
            <div className="lg:hidden flex items-center gap-3">
              <Link
                to="/contact"
                className="bg-primary text-white px-3.5 py-2 rounded-xl text-[11px] font-bold uppercase tracking-wider shadow-primary-glow"
              >
                Make an Enquiry
              </Link>
              <button
                onClick={() => setIsOpen(!isOpen)}
                className={`inline-flex items-center justify-center p-2.5 rounded-xl transition-all duration-300 focus:outline-none ${isScrolled
                  ? 'text-secondary hover:bg-gray-100'
                  : 'text-white hover:bg-white/10'
                  }`}
                aria-label="Toggle menu"
                aria-expanded={isOpen}
              >
                <div className="relative w-6 h-6">
                  <Menu className={`h-6 w-6 absolute inset-0 transition-all duration-300 ${isOpen ? 'opacity-0 rotate-90 scale-75' : 'opacity-100 rotate-0 scale-100'}`} />
                  <X className={`h-6 w-6 absolute inset-0 transition-all duration-300 ${isOpen ? 'opacity-100 rotate-0 scale-100' : 'opacity-0 -rotate-90 scale-75'}`} />
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* Bottom border when scrolled */}
        {isScrolled && (
          <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent" />
        )}
      </nav>

      {/* Mobile Menu Overlay */}
      <div
        className={`fixed inset-0 bg-secondary/60 backdrop-blur-sm z-[9998] lg:hidden transition-all duration-400 ${isOpen ? 'opacity-100 visible' : 'opacity-0 invisible pointer-events-none'
          }`}
        onClick={() => setIsOpen(false)}
      />

      {/* Mobile Menu Panel */}
      <div
        className={`fixed inset-y-0 right-0 h-[100dvh] w-[85%] max-w-xs bg-white z-[9999] lg:hidden shadow-elevated transform transition-all duration-500 ease-out-expo flex flex-col ${isOpen ? 'translate-x-0' : 'translate-x-full pointer-events-none'
          }`}
      >
        {/* Header */}
        <div className="shrink-0 flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <Link to="/" className="flex items-center gap-2.5" onClick={() => setIsOpen(false)}>
            <img src="/images/favicon-new.jpeg" alt="Sourceline Logo" className="h-9 w-9 rounded-xl object-cover" />
            <div className="flex flex-col leading-none">
              <span className="font-bold text-secondary tracking-wider text-sm uppercase" style={{ fontFamily: '"Julius Sans One", sans-serif' }}>Sourceline</span>
              <span className="text-[8px] text-primary tracking-[0.15em] uppercase font-semibold">Limited</span>
            </div>
          </Link>
          <button
            onClick={() => setIsOpen(false)}
            className="p-2 rounded-xl text-gray-400 hover:text-secondary hover:bg-gray-100 transition-all"
            aria-label="Close menu"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Nav Links */}
        <div
          className="relative flex-1 overflow-y-auto min-h-0 px-4 py-3 space-y-1 overscroll-contain touch-pan-y"
          style={{ WebkitOverflowScrolling: 'touch' }}
        >
          {navigation.map((link) => (
            <Link
              key={link.name}
              to={link.path}
              className={`relative z-10 flex items-center justify-between px-4 py-3 rounded-xl text-sm font-bold tracking-wide transition-colors duration-200 group cursor-pointer ${
                isActive(link.path)
                  ? 'bg-primary text-white shadow-primary-glow'
                  : 'text-secondary/70 hover:text-secondary hover:bg-gray-50'
              }`}
              onClick={() => setIsOpen(false)}
              {...(isActive(link.path) ? { 'aria-current': 'page' } : {})}
            >
              <span>{link.name}</span>
              {isActive(link.path) ? (
                <div className="w-1.5 h-1.5 rounded-full bg-white" />
              ) : (
                <ArrowRight className="h-3.5 w-3.5 opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all text-primary" />
              )}
            </Link>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="shrink-0 p-4 border-t border-gray-100 bg-gray-50/90 backdrop-blur-sm z-20">
          <a
            href="tel:+2348034618227"
            className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl bg-secondary text-white font-bold text-xs uppercase tracking-wider mb-2 hover:bg-secondary-light transition-colors shadow-md shadow-secondary/20"
          >
            <Phone className="h-3.5 w-3.5" /> Call Us Now
          </a>
          <div className="flex justify-center gap-4">
            <a href="tel:+2348034618227" className="text-gray-500 hover:text-primary transition-colors text-[11px] font-semibold flex items-center gap-1">
              <Phone className="h-3 w-3" /> +234 803 461 8227
            </a>
            <a href="mailto:sourcelineltd@gmail.com" className="text-gray-500 hover:text-primary transition-colors text-[11px] font-semibold flex items-center gap-1">
              <Mail className="h-3 w-3" /> Email Us
            </a>
          </div>
        </div>
      </div>
    </>
  );
};

export default Navbar;
