import { Link } from 'react-router-dom';
import { 
  InstagramLogo, 
  LinkedinLogo, 
  TwitterLogo,
  Envelope
} from '@phosphor-icons/react';

const Footer = () => {
  const displayYear = new Date().getFullYear();

  return (
    <footer className="bg-[#111111] text-white pt-20 pb-8 px-8 md:px-16 lg:px-24 font-sans relative overflow-hidden flex flex-col justify-between min-h-[500px]">
      
      {/* Top Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-32 relative z-10">
        
        {/* Left Column: Navigation */}
        <div className="flex flex-col space-y-4">
          {[
            { name: 'Home', path: '/' },
            { name: 'Works', path: '/portfolio' },
            { name: 'Services', path: '/services' },
            { name: 'About', path: '/about' },
            { name: 'Pricing', path: '/contact' },
            { name: 'Contact us', path: '/contact' },
          ].map((link) => (
            <Link key={link.name} to={link.path} className="text-[#a0a0a0] hover:text-white transition-colors text-sm font-medium w-max">
              {link.name}
            </Link>
          ))}
        </div>

        {/* Middle Column: Contact & Socials */}
        <div className="flex flex-col items-center text-center space-y-6">
          <div className="space-y-2">
            <h3 className="text-white text-sm font-medium mb-4">Follow us</h3>
            <a href="mailto:sourcelineltd@gmail.com" className="block text-[#a0a0a0] hover:text-white transition-colors text-sm">
              sourcelineltd@gmail.com
            </a>
            <a href="tel:+2348034618227" className="block text-[#a0a0a0] hover:text-white transition-colors text-sm">
              +234 803 461 8227
            </a>
          </div>
          
          <div className="flex gap-4 pt-2">
            {[
              { icon: InstagramLogo, url: 'https://instagram.com/sourcelinelimited' },
              { icon: LinkedinLogo, url: '#' },
              { icon: TwitterLogo, url: '#' },
              { icon: Envelope, url: 'mailto:sourcelineltd@gmail.com' },
            ].map((social, index) => (
              <a 
                key={index}
                href={social.url}
                target="_blank"
                rel="noopener noreferrer"
                className="w-11 h-11 rounded-[10px] bg-white/10 hover:bg-white/20 flex items-center justify-center transition-all"
              >
                <social.icon className="h-5 w-5 text-white" weight="fill" />
              </a>
            ))}
          </div>
        </div>

        {/* Right Column: Address */}
        <div className="flex flex-col md:items-end text-left md:text-right space-y-4">
          <h3 className="text-white text-sm font-medium">Address</h3>
          <p className="text-[#a0a0a0] text-sm max-w-[200px] leading-relaxed">
            Lagos,<br />
            Nigeria.
          </p>
        </div>
      </div>

      {/* Bottom Legal Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 items-center text-[#a0a0a0] text-xs font-medium relative z-10 mb-16 md:mb-8 gap-6 md:gap-0">
        <p className="text-left">© {displayYear} Sourceline. All Rights Reserved.</p>
        <div className="text-center">
          <Link to="/terms" className="hover:text-white transition-colors">Terms & Conditions</Link>
        </div>
        <div className="text-left md:text-right">
          <Link to="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link>
        </div>
      </div>

      {/* Massive Text (SOURCELINE) */}
      <div className="absolute bottom-[-10%] md:bottom-[-15%] left-0 w-full flex justify-center pointer-events-none select-none">
        <h1 className="text-[17vw] font-bold tracking-tight text-white m-0 p-0 leading-none" style={{ fontFamily: 'system-ui, sans-serif' }}>
          SOURCELINE
        </h1>
      </div>
    </footer>
  );
};

export default Footer;
