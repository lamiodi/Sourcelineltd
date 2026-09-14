import { useState, useEffect } from 'react';

const Preloader = () => {
  // Check if user has already seen the preloader in this session
  const [isVisible, setIsVisible] = useState(() => {
    if (typeof window !== 'undefined') {
      return !sessionStorage.getItem('sl_intro_seen');
    }
    return true;
  });
  const [displayedText, setDisplayedText] = useState('');
  
  const fullText = "Precise measurements with accuracy are our words...";

  useEffect(() => {
    if (!isVisible) return;

    // Mark as seen for session so internal navigation is instant
    sessionStorage.setItem('sl_intro_seen', 'true');

    const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
    const typingSpeed = isMobile ? 18 : 28; // Fast, snappy typing on mobile
    const totalDuration = isMobile ? 1100 : 1600; // Snappy exit

    let i = 0;
    const typingInterval = setInterval(() => {
      if (i < fullText.length) {
        setDisplayedText(fullText.substring(0, i + 1));
        i++;
      } else {
        clearInterval(typingInterval);
      }
    }, typingSpeed);

    const timer = setTimeout(() => {
      setIsVisible(false);
    }, totalDuration);

    return () => {
      clearInterval(typingInterval);
      clearTimeout(timer);
    };
  }, [isVisible]);

  const dismissImmediately = () => {
    setIsVisible(false);
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('sl_intro_seen', 'true');
    }
  };

  if (!isVisible) return null;

  return (
    <div 
      onClick={dismissImmediately}
      onTouchStart={dismissImmediately}
      className={`fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-white cursor-pointer transition-opacity duration-500 ${!isVisible ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}
    >
      <div className="relative flex flex-col items-center animate-fade-in-up">
        {/* Glowing background effect */}
        <div className="absolute inset-0 bg-primary/20 blur-[50px] rounded-full" />
        
        {/* Logo Container */}
        <div className="relative w-32 h-32 md:w-40 md:h-40 mb-8 rounded-3xl overflow-hidden border border-gray-100 shadow-2xl animate-pulse">
          <img 
            src="/images/companylogo.jpeg" 
            alt="Sourceline Limited" 
            className="w-full h-full object-cover"
          />
        </div>
        
        {/* Loading text & animation */}
        <div className="flex flex-col items-center gap-4 mt-2 h-16 justify-center">
          <div className="text-xs md:text-sm font-bold uppercase tracking-[0.15em] text-secondary/80 font-sans max-w-[280px] md:max-w-md text-center leading-relaxed">
            {displayedText}
            <span className="inline-block w-1.5 h-4 ml-1 bg-primary align-middle animate-pulse" />
          </div>
          
          <div className="flex gap-1.5 mt-2 opacity-50">
            <div className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
            <div className="w-1.5 h-1.5 bg-secondary rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
            <div className="w-1.5 h-1.5 bg-accent rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Preloader;
