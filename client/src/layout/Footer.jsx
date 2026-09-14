import { Link } from 'react-router-dom';
import { InstagramLogo, LinkedinLogo, TwitterLogo, EnvelopeSimple, Phone, MapPin, ArrowUpRight, CaretUp } from '@phosphor-icons/react';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="bg-secondary text-white border-t border-white/10 pt-16 pb-12 overflow-hidden relative font-sans">
      {/* Subtle background ambient mesh */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-primary/10 rounded-full blur-[110px] pointer-events-none" />
      <div className="absolute bottom-0 left-10 w-80 h-80 bg-accent/5 rounded-full blur-[90px] pointer-events-none" />
      <div className="absolute inset-0 opacity-[0.015]" style={{ backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize: '32px 32px' }} />

      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 relative z-10">
        {/* Main 4-Column Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 lg:gap-8 pb-14 border-b border-white/10">
          
          {/* Col 1: Brand & Profile (4 cols) */}
          <div className="lg:col-span-4 space-y-5">
            <Link to="/" className="inline-flex items-center gap-3 group">
              <div className="w-10 h-10 rounded-xl overflow-hidden bg-white/10 p-1 border border-white/15 flex items-center justify-center group-hover:border-primary/50 transition-colors">
                <img 
                  src="/images/companylogo.jpeg" 
                  alt="Sourceline Limited" 
                  className="w-full h-full object-cover rounded-lg"
                />
              </div>
              <div className="flex flex-col leading-none">
                <span className="font-display-alt font-bold text-base tracking-[0.14em] uppercase text-white group-hover:text-primary transition-colors">
                  SOURCELINE
                </span>
                <span className="text-[10px] tracking-[0.2em] uppercase text-primary font-semibold mt-1">
                  Limited
                </span>
              </div>
            </Link>

            <p className="text-white/60 text-sm leading-relaxed max-w-sm">
              Professional cadastral surveying, geodetic engineering, and geospatial data consultancy. Delivering statutory survey documentation and spatial precision across Nigeria.
            </p>

            <div className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-lg bg-white/[0.04] border border-white/10 text-xs font-mono text-white/70">
              <span className="w-2 h-2 rounded-full bg-emerald-400 shrink-0" />
              <span>RC: 1572232 · SURCON Supervised Practice</span>
            </div>

            {/* Social Icons */}
            <div className="flex items-center gap-2.5 pt-2">
              <a 
                href="https://www.instagram.com/sourcelinelimited?igsh=MWlrOTJwMDlkZmJuNg==" 
                target="_blank" 
                rel="noopener noreferrer"
                title="Follow Sourceline on Instagram"
                className="w-9 h-9 rounded-lg bg-white/5 hover:bg-primary/20 hover:text-primary hover:border-primary/40 border border-white/10 flex items-center justify-center text-white/70 transition-all duration-200"
              >
                <InstagramLogo className="w-4 h-4" />
              </a>
              <a 
                href="#" 
                className="w-9 h-9 rounded-lg bg-white/5 hover:bg-primary/20 hover:text-primary hover:border-primary/40 border border-white/10 flex items-center justify-center text-white/70 transition-all duration-200"
                title="Sourceline on LinkedIn"
              >
                <LinkedinLogo className="w-4 h-4" weight="fill" />
              </a>
              <a 
                href="#" 
                className="w-9 h-9 rounded-lg bg-white/5 hover:bg-primary/20 hover:text-primary hover:border-primary/40 border border-white/10 flex items-center justify-center text-white/70 transition-all duration-200"
                title="Sourceline on Twitter"
              >
                <TwitterLogo className="w-4 h-4" weight="fill" />
              </a>
              <a 
                href="mailto:sourcelineltd@gmail.com" 
                className="w-9 h-9 rounded-lg bg-white/5 hover:bg-primary/20 hover:text-primary hover:border-primary/40 border border-white/10 flex items-center justify-center text-white/70 transition-all duration-200"
                title="Email Sourceline Limited"
              >
                <EnvelopeSimple className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Col 2: Services (3 cols) */}
          <div className="lg:col-span-3 space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-[0.18em] text-accent/90 font-mono">
              Survey Services
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link to="/services/land-surveying" className="text-white/70 hover:text-primary transition-colors inline-flex items-center gap-1">
                  Cadastral & Boundary Survey
                </Link>
              </li>
              <li>
                <Link to="/services/engineering-survey" className="text-white/70 hover:text-primary transition-colors inline-flex items-center gap-1">
                  Engineering & Topography
                </Link>
              </li>
              <li>
                <Link to="/services/digital-mapping" className="text-white/70 hover:text-primary transition-colors inline-flex items-center gap-1">
                  Drone & Digital Mapping
                </Link>
              </li>
              <li>
                <Link to="/services" className="text-white/70 hover:text-primary transition-colors inline-flex items-center gap-1">
                  Layout & Estate Partitioning
                </Link>
              </li>
              <li>
                <Link to="/point-converter" className="text-accent hover:text-accent/80 transition-colors inline-flex items-center gap-1.5 font-medium">
                  Point Converter Tool
                  <span className="text-[10px] bg-accent/20 text-accent px-1.5 py-0.2 rounded font-bold uppercase">Free</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Practice & Trust (2 cols) */}
          <div className="lg:col-span-2 space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-[0.18em] text-accent/90 font-mono">
              The Firm
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link to="/about" className="text-white/70 hover:text-primary transition-colors">
                  About the Firm
                </Link>
              </li>
              <li>
                <Link to="/portfolio" className="text-white/70 hover:text-primary transition-colors">
                  Project Portfolio
                </Link>
              </li>
              <li>
                <Link to="/verify" className="text-white/70 hover:text-primary transition-colors inline-flex items-center gap-1">
                  Verify Credentials
                  <ArrowUpRight className="w-3.5 h-3.5 text-primary/70" />
                </Link>
              </li>
              <li>
                <Link to="/blog" className="text-white/70 hover:text-primary transition-colors">
                  Survey Insights & Law
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-white/70 hover:text-primary transition-colors">
                  Verify Your Land
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 4: Office & Inquiries (3 cols) */}
          <div className="lg:col-span-3 space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-[0.18em] text-accent/90 font-mono">
              Sangotedo Office
            </h4>
            <div className="space-y-3 text-sm text-white/70">
              <div className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                <p className="leading-relaxed text-xs text-white/60">
                  Crown Court Terrace, Vintage Estate, Behind Mobil Petrol Station, Sangotedo, Lekki-Epe Corridor, Lagos
                </p>
              </div>
              <div className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-primary shrink-0" />
                <a href="tel:+2348034618227" className="hover:text-primary transition-colors text-xs font-medium text-white/80">
                  +234 803 461 8227
                </a>
              </div>
              <div className="flex items-center gap-2.5">
                <EnvelopeSimple className="w-4 h-4 text-primary shrink-0" />
                <a href="mailto:sourcelineltd@gmail.com" className="hover:text-primary transition-colors text-xs text-white/80">
                  sourcelineltd@gmail.com
                </a>
              </div>
            </div>

            <div className="pt-2">
              <Link 
                to="/contact" 
                className="inline-flex items-center justify-center gap-2 w-full py-3 px-4 rounded-xl bg-primary text-white text-xs font-bold uppercase tracking-wider shadow-primary-glow hover:bg-primary-dark hover:shadow-primary-glow-lg transition-all duration-300 hover:-translate-y-0.5"
              >
                Verify Your Land
              </Link>
            </div>
          </div>

        </div>

        {/* Bottom Bar: Clean, Minimalist, No Oversized Slop */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-white/40">
          <div className="text-center sm:text-left">
            <span>© {currentYear} Sourceline Limited (RC: 1572232). All cadastral surveys executed under registered seal.</span>
          </div>

          <div className="flex items-center gap-6">
            <Link to="/terms" className="hover:text-white/70 transition-colors">
              Terms
            </Link>
            <Link to="/privacy" className="hover:text-white/70 transition-colors">
              Privacy Policy
            </Link>
            <Link to="/verify" className="hover:text-white/70 transition-colors">
              SURCON Verification
            </Link>
            <button 
              onClick={scrollToTop}
              className="inline-flex items-center gap-1 text-white/50 hover:text-primary transition-colors ml-2"
              title="Scroll to top"
            >
              <span>Top</span>
              <CaretUp className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
