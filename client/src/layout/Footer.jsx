import { Link } from 'react-router-dom';
import { 
  Envelope, 
  Phone, 
  InstagramLogo, 
  ArrowUpRight, 
  LinkedinLogo, 
  TwitterLogo,
  Globe,
  Clock,
  CloudSun
} from '@phosphor-icons/react';
import { useState, useEffect } from 'react'; 

const Footer = () => {
  const displayYear = new Date().getFullYear();
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  const formattedTime = currentTime.toLocaleTimeString('en-US', { 
    hour: 'numeric', 
    minute: '2-digit', 
    hour12: true,
    timeZone: 'Africa/Lagos'
  });

  return (
    <footer className="bg-white py-12 px-6 md:px-10 lg:px-16 font-sans">
      {/* Main Rounded Container */}
      <div className="max-w-[1600px] mx-auto bg-secondary rounded-[3rem] md:rounded-[5rem] overflow-hidden relative shadow-2xl">
        
        {/* Top Content Grid */}
        <div className="px-8 md:px-16 lg:px-24 pt-16 md:pt-24 pb-4 relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-12 lg:gap-8">
            
            {/* Brand Statement */}
            <div className="lg:col-span-4">
              <h2 className="text-white text-2xl md:text-3xl font-bold leading-tight max-w-xs">
                Sourceline is a premier <span className="text-primary">surveying</span> and geoinformatics firm
              </h2>
            </div>

            {/* Explore Links */}
            <div className="lg:col-span-2">
              <h3 className="text-white/40 text-sm font-medium mb-6">Explore</h3>
              <ul className="space-y-3">
                {[
                  { name: 'About', path: '/about' },
                  { name: 'Services', path: '/services' },
                  { name: 'Portfolio', path: '/portfolio' },
                  { name: 'Insights', path: '/blog' },
                  { name: 'Verify', path: '/verify' },
                ].map((link) => (
                  <li key={link.name}>
                    <Link to={link.path} className="text-white hover:text-primary transition-colors text-base font-medium">
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Social Links */}
            <div className="lg:col-span-3">
              <h3 className="text-white/40 text-sm font-medium mb-6">Follow us</h3>
              <div className="grid grid-cols-1 gap-x-8 gap-y-4">
                {[
                  { icon: InstagramLogo, label: '@sourcelinelimited', url: 'https://instagram.com/sourcelinelimited', color: '#E4405F' },
                  { icon: LinkedinLogo, label: 'LinkedIn', url: '#', color: '#0A66C2' },
                  { icon: TwitterLogo, label: 'Twitter', url: '#', color: '#1DA1F2' },
                  { icon: Envelope, label: 'Email Us', url: 'mailto:sourcelineltd@gmail.com', color: '#EA4335' },
                ].map((social) => (
                  <a 
                    key={social.label}
                    href={social.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 text-white hover:text-primary transition-all group"
                  >
                    <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <social.icon className="h-5 w-5" style={{ color: social.color }} />
                    </div>
                    <span className="text-sm font-medium">{social.label}</span>
                  </a>
                ))}
              </div>
            </div>

            {/* CTA Section */}
            <div className="lg:col-span-3 space-y-10 lg:text-right">
              <div>
                <Link to="/contact" className="group inline-flex flex-col lg:items-end">
                  <span className="flex items-center gap-2 text-primary text-2xl font-bold mb-1">
                    Work together <ArrowUpRight weight="bold" className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                  </span>
                  <span className="text-white/40 text-sm">Let's build your vision</span>
                </Link>
              </div>

              <div>
                <a href="tel:+2348034618227" className="group inline-flex flex-col lg:items-end">
                  <span className="flex items-center gap-2 text-white text-2xl font-bold mb-1">
                    Call Us <Phone weight="fill" className="text-white/20 h-5 w-5" />
                  </span>
                  <span className="text-white/40 text-sm">+234 803 461 8227</span>
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Massive Branding Text */}
        <div className="relative h-[250px] md:h-[400px] flex items-end select-none pointer-events-none overflow-hidden">
          <h1 className="text-[35vw] font-black leading-[0.6] text-white tracking-tighter opacity-[0.03] ml-[-0.05em] translate-y-[0.1em]">
            sourceline
          </h1>
        </div>

        {/* Bottom Bar */}
        <div className="px-8 md:px-16 lg:px-24 py-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-6 relative z-10">
          <div className="flex items-center gap-6 text-white/30 text-[11px] font-bold uppercase tracking-widest">
            <span>Sourceline © {displayYear}</span>
            <span className="w-1 h-1 rounded-full bg-white/10" />
            <Link to="/privacy" className="hover:text-primary transition-colors">Privacy Policy</Link>
          </div>

          <div className="flex items-center gap-8 text-white/40 text-xs font-medium">
            <div className="flex items-center gap-2">
              <Globe className="h-4 w-4 text-primary" />
              <span>Lagos, Nigeria</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              <span>{formattedTime}</span>
            </div>
            <div className="hidden sm:flex items-center gap-2">
              <CloudSun className="h-4 w-4" />
              <span>28°C</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
