import { Link } from 'react-router-dom';
import { InstagramLogo, LinkedinLogo, TwitterLogo, EnvelopeSimple } from '@phosphor-icons/react';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-secondary text-white pt-20 pb-0 overflow-hidden relative">
      <div className="max-w-7xl mx-auto px-8 md:px-16 relative z-10">
        {/* Top Grid Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-8 mb-24">
          
          {/* Column 1: Navigation Links */}
          <div className="flex flex-col space-y-3">
            <Link to="/" className="text-white/60 hover:text-primary transition-colors text-sm font-medium">Home</Link>
            <Link to="/portfolio" className="text-white/60 hover:text-primary transition-colors text-sm font-medium">Works</Link>
            <Link to="/services" className="text-white/60 hover:text-primary transition-colors text-sm font-medium">Services</Link>
            <Link to="/about" className="text-white/60 hover:text-primary transition-colors text-sm font-medium">About</Link>
            <Link to="/pricing" className="text-white/60 hover:text-primary transition-colors text-sm font-medium">Pricing</Link>
            <Link to="/contact" className="text-white/60 hover:text-primary transition-colors text-sm font-medium">Contact us</Link>
          </div>

          {/* Column 2: Contact & Socials */}
          <div className="flex flex-col items-start md:items-center space-y-6">
            <div className="text-left md:text-center">
              <p className="text-white/60 text-sm font-medium mb-1">Follow us</p>
              <a href="mailto:sourcelineltd@gmail.com" className="block text-white hover:text-primary transition-colors text-sm mb-1">
                sourcelineltd@gmail.com
              </a>
              <a href="tel:+2348034618227" className="block text-white hover:text-primary transition-colors text-sm">
                +234 803 461 8227
              </a>
            </div>
            
            {/* Social Icons - Boxed style matching template */}
            <div className="flex items-center gap-3">
              <a href="#" className="w-10 h-10 bg-white/5 hover:bg-primary rounded-xl flex items-center justify-center text-white/80 hover:text-white transition-all duration-300">
                <InstagramLogo className="w-5 h-5" />
              </a>
              <a href="#" className="w-10 h-10 bg-white/5 hover:bg-primary rounded-xl flex items-center justify-center text-white/80 hover:text-white transition-all duration-300">
                <LinkedinLogo className="w-5 h-5" weight="fill" />
              </a>
              <a href="#" className="w-10 h-10 bg-white/5 hover:bg-primary rounded-xl flex items-center justify-center text-white/80 hover:text-white transition-all duration-300">
                <TwitterLogo className="w-5 h-5" weight="fill" />
              </a>
              <a href="mailto:sourcelineltd@gmail.com" className="w-10 h-10 bg-white/5 hover:bg-primary rounded-xl flex items-center justify-center text-white/80 hover:text-white transition-all duration-300">
                <EnvelopeSimple className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Column 3: Address */}
          <div className="flex flex-col md:items-end text-left md:text-right space-y-2">
            <p className="text-white/60 text-sm font-medium mb-1">Address</p>
            <p className="text-white text-sm leading-relaxed max-w-[200px]">
              Lagos, Nigeria
            </p>
          </div>
          
        </div>

        {/* Middle Section: Legal Links & Copyright */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 border-t border-white/10 pt-8 pb-12">
          <div className="text-white/40 text-xs md:text-sm order-3 md:order-1">
            © {currentYear} Sourceline Ltd. All Rights Reserved.
          </div>
          <div className="flex justify-start md:justify-center order-1 md:order-2">
            <Link to="/terms" className="text-white/60 hover:text-primary transition-colors text-xs md:text-sm">
              Terms & Conditions
            </Link>
          </div>
          <div className="flex justify-start md:justify-end order-2 md:order-3">
            <Link to="/privacy" className="text-white/60 hover:text-primary transition-colors text-xs md:text-sm">
              Privacy Policy
            </Link>
          </div>
        </div>
      </div>

      {/* Massive Bottom Text Effect */}
      <div className="w-full flex justify-center translate-y-[25%] pointer-events-none select-none">
        <h1 className="text-[17vw] font-display font-bold tracking-tighter text-white leading-none whitespace-nowrap">
          SOURCELINE
        </h1>
      </div>
    </footer>
  );
};

export default Footer;
