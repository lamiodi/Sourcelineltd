import { Link } from 'react-router-dom';
import { House as Home, ArrowLeft, MapPin, ArrowRight } from '@phosphor-icons/react';

const NotFound = () => {
  return (
    <div className="min-h-screen bg-secondary flex flex-col justify-center items-center px-4 sm:px-6 lg:px-8 text-center relative overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[120px] translate-x-1/3 -translate-y-1/3 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-primary/5 rounded-full blur-[100px] -translate-x-1/3 translate-y-1/3 pointer-events-none" />
      <div className="absolute inset-0 opacity-[0.02]" style={{ backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize: '32px 32px' }} />

      <div className="max-w-lg w-full space-y-8 relative z-10">
        <div>
          {/* Animated icon */}
          <div className="mx-auto w-24 h-24 bg-primary/10 border border-primary/20 rounded-3xl flex items-center justify-center mb-8 animate-float">
            <MapPin className="h-12 w-12 text-primary" />
          </div>

          {/* 404 number with gradient */}
          <h1 className="text-8xl sm:text-[10rem] md:text-[12rem] font-display font-bold leading-none tracking-tighter gradient-text">
            404
          </h1>

          <h2 className="mt-4 text-2xl sm:text-3xl md:text-4xl font-display font-bold text-white tracking-tight">
            Page not found
          </h2>
          <p className="mt-4 text-lg text-white/40 max-w-md mx-auto leading-relaxed">
            It seems you&apos;ve wandered off the map. The coordinates you&apos;re looking for don&apos;t exist.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center mt-10">
          <Link
            to="/"
            className="bg-primary text-white px-8 py-4 rounded-2xl font-bold text-sm uppercase tracking-wider shadow-primary-glow hover:bg-primary-dark hover:shadow-primary-glow-lg hover:-translate-y-1 transition-all duration-300 inline-flex items-center justify-center gap-2 group"
          >
            <Home className="h-4 w-4" />
            Back to Home
          </Link>
          <button
            onClick={() => window.history.back()}
            className="border border-white/20 text-white/60 px-8 py-4 rounded-2xl font-bold text-sm uppercase tracking-wider hover:bg-white/10 hover:text-white hover:border-white/40 transition-all duration-300 inline-flex items-center justify-center gap-2 group"
          >
            <ArrowLeft className="h-4 w-4 group-hover:-translate-x-0.5 transition-transform" />
            Go Back
          </button>
        </div>

        {/* Quick links */}
        <div className="mt-12 pt-8 border-t border-white/10">
          <p className="text-white/25 text-xs font-bold uppercase tracking-wider mb-4">Popular Pages</p>
          <div className="flex flex-wrap justify-center gap-3">
            {[
              { name: 'Services', path: '/services' },
              { name: 'Portfolio', path: '/portfolio' },
              { name: 'Contact', path: '/contact' },
            ].map((link) => (
              <Link
                key={link.name}
                to={link.path}
                className="bg-white/5 border border-white/10 text-white/50 hover:text-white hover:border-primary/30 hover:bg-primary/10 px-4 py-2 rounded-xl text-xs font-semibold transition-all duration-300 flex items-center gap-1.5"
              >
                {link.name} <ArrowRight className="h-3 w-3" />
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotFound;