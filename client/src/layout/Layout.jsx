import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';
import { ChatCircle as MessageCircle, ArrowUp } from '@phosphor-icons/react';

const Layout = ({ children }) => {
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    // Robot-like animation for the WhatsApp tooltip
    const interval = setInterval(() => {
      setShowTooltip(true);
      setTimeout(() => {
        setShowTooltip(false);
      }, 4000); // Tooltip stays visible for 4 seconds
    }, 12000); // Pops up every 12 seconds

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 600);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (location.hash) {
      setTimeout(() => {
        const id = location.hash.replace('#', '');
        const element = document.getElementById(id);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
        }
      }, 100); // Small delay to ensure the page has rendered
    } else {
      window.scrollTo({ top: 0, left: 0 });
    }
  }, [location.pathname, location.hash]);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="flex flex-col min-h-screen relative">
      {/* Skip to Content Link — Accessibility */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[100] focus:bg-primary focus:text-white focus:px-6 focus:py-3 focus:rounded-xl focus:font-bold focus:text-sm focus:uppercase focus:tracking-wider focus:shadow-primary-glow"
      >
        Skip to main content
      </a>

      <Navbar />
      <main id="main-content" className="flex-grow">
        {children}
      </main>
      <Footer />

      {/* Scroll to Top Button */}
      <button
        onClick={scrollToTop}
        className={`fixed bottom-24 right-6 z-40 w-12 h-12 bg-secondary/90 backdrop-blur-sm text-white rounded-xl shadow-lg flex items-center justify-center transition-all duration-500 hover:bg-secondary hover:shadow-xl hover:-translate-y-1 ${showScrollTop ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'
          }`}
        aria-label="Scroll to top"
      >
        <ArrowUp className="h-5 w-5" />
      </button>

      {/* WhatsApp Enhanced Widget */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
        {/* Chat Window */}
        <div 
          className={`mb-4 w-[320px] sm:w-[360px] bg-white rounded-3xl shadow-2xl overflow-hidden transition-all duration-500 ease-spring origin-bottom-right border border-gray-100 ${
            isOpen ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-90 translate-y-10 pointer-events-none'
          }`}
        >
          {/* Header */}
          <div className="bg-secondary p-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
            <div className="flex items-center gap-4 relative z-10">
              <div className="relative">
                <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center border border-gray-100 overflow-hidden shadow-sm">
                  <img src="/images/companylogo.jpeg" alt="Sourceline" className="w-full h-full object-cover" />
                </div>
                <span className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-green-500 border-2 border-secondary rounded-full" />
              </div>
              <div>
                <h3 className="text-white font-display font-bold">Sourceline Support</h3>
                <p className="text-white/60 text-xs">Typically replies in minutes</p>
              </div>
              <button 
                onClick={() => setIsOpen(false)}
                className="ml-auto text-white/50 hover:text-white transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
          </div>

          {/* Body */}
          <div className="p-6 bg-gray-50/50">
            <div className="bg-white p-4 rounded-2xl rounded-tl-none shadow-sm border border-gray-100 max-w-[85%] relative">
              <p className="text-gray-700 text-sm leading-relaxed">
                Hello! 👋 <br />
                Welcome to Sourceline Limited. How can we help you with your surveying needs today?
              </p>
              <span className="text-[10px] text-gray-400 mt-2 block text-right">09:00 AM</span>
            </div>

            <a 
              href="https://wa.me/2348034618227?text=Hello! I'm interested in your surveying services."
              target="_blank"
              rel="noopener noreferrer"
              className="mt-6 w-full bg-[#25D366] hover:bg-[#1DA851] text-white py-3.5 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-green-500/20 transition-all duration-300 hover:-translate-y-1 active:scale-95"
            >
              <MessageCircle className="h-5 w-5 fill-current" />
              Start Chat on WhatsApp
            </a>
          </div>

          {/* Footer */}
          <div className="px-6 py-3 bg-white text-center border-t border-gray-50">
            <p className="text-[10px] text-gray-400 font-medium uppercase tracking-widest">Powered by Sourceline Limited</p>
          </div>
        </div>

        {/* Floating Button */}
        <div className="relative group">
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="relative bg-[#25D366] text-white p-3.5 sm:p-4 rounded-full shadow-2xl hover:bg-[#1DA851] transition-all duration-300 hover:scale-110 flex items-center justify-center z-10"
            aria-label="Toggle WhatsApp Chat"
          >
            {/* Pulse ring (only when closed) */}
            {!isOpen && (
              <>
                <span className="absolute inset-0 rounded-full bg-[#25D366] animate-ping opacity-20" />
                <span className="absolute inset-[-4px] rounded-full bg-[#25D366]/20 animate-pulse-ring" />
              </>
            )}
            
            {isOpen ? (
              <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
            ) : (
              <MessageCircle className="h-[25px] w-[25px] sm:h-7 sm:w-7 fill-current" />
            )}
          </button>

          {/* Tooltip (only when closed) */}
          {!isOpen && (
            <span 
              className={`absolute right-full mr-3 top-1/2 -translate-y-1/2 bg-white text-gray-800 px-4 py-2.5 rounded-xl shadow-lg text-sm font-bold transition-all duration-500 ease-spring whitespace-nowrap pointer-events-none border border-gray-100 ${
                showTooltip ? 'opacity-100 translate-x-0 scale-100' : 'opacity-0 translate-x-4 scale-95'
              } group-hover:opacity-100 group-hover:translate-x-0 group-hover:scale-100`}
            >
              Chat with us 👋
              <span className="absolute right-[-6px] top-1/2 -translate-y-1/2 w-3 h-3 bg-white border-r border-b border-gray-100 rotate-[-45deg]" />
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default Layout;
