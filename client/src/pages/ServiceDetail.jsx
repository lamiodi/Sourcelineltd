import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Ruler, Briefcase, MapTrifold as Map, FileText, Globe, Stack as Layers, Tree as Trees, ShieldCheck, HardHat, MapPin, ArrowRight, Copy, Check } from '@phosphor-icons/react';
import { useState } from 'react';
import { API_URL } from '../config';
import SEO from '../components/SEO';
import useScrollReveal from '../hooks/useScrollReveal';
import { services as servicesData } from '../data';

const iconMap = {
  Ruler, Map, Briefcase, FileText, Globe, Trees, Layers, ShieldCheck, HardHat, MapPin
};

/* useScrollReveal imported from shared hooks */

const ServiceDetail = () => {
  const { slug } = useParams();
  const service = servicesData.find(s => s.slug === slug || String(s.id) === String(slug));
  const loading = false;
  const [copied, setCopied] = useState(false);
  useScrollReveal();

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!service) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center p-8 bg-white rounded-3xl border border-gray-100 shadow-sm max-w-md w-full">
          <div className="w-16 h-16 bg-red-50 text-red-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <MapPin className="h-8 w-8" />
          </div>
          <h2 className="text-2xl font-display font-bold text-secondary mb-3">Service not found</h2>
          <p className="text-gray-500 mb-8">The service you are looking for doesn&apos;t exist or has been moved.</p>
          <Link to="/services" className="inline-flex items-center gap-2 bg-secondary text-white px-6 py-3 rounded-xl font-bold text-sm uppercase tracking-wider hover:bg-primary transition-colors group">
            <ArrowLeft className="h-4 w-4 transform group-hover:-translate-x-1 transition-transform" />
            Back to Services
          </Link>
        </div>
      </div>
    );
  }

  const Icon = iconMap[service.icon] || Ruler;
  const details = service.details || service.description;

  return (
    <div className="font-sans">
      <SEO
        title={service.title}
        description={service.description}
      />

      {/* ─── PAGE HERO ───────────────────────────────────────── */}
      <section className="relative py-20 md:py-28 overflow-hidden bg-secondary">
        <div className="absolute inset-0">
          <img src={service.image || "/images/dji_fly_20260128_125236_0_1769601156568_photo_low_quality.jpg.jpeg"} alt={service.title}
            className="w-full h-full object-cover opacity-15 animate-ken-burns" />
        </div>
        <div className="absolute inset-0 bg-gradient-to-br from-secondary via-secondary/95 to-secondary-light" />
        <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-primary/10 rounded-full blur-[100px] translate-x-1/3 -translate-y-1/3 pointer-events-none" />
        <div className="absolute inset-0 opacity-[0.02]" style={{ backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize: '32px 32px' }} />

        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6">
          <Link to="/services" className="inline-flex items-center gap-2 text-white/50 text-xs font-bold uppercase tracking-wider mb-8 hover:text-primary transition-colors group animate-fade-in">
            <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" /> Back to Services
          </Link>

          <div className="flex flex-col md:flex-row md:items-center gap-6 mb-8 animate-fade-in-up">
            <div className="w-16 h-16 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl flex items-center justify-center shrink-0 shadow-glass">
              <Icon className="h-8 w-8 text-primary" />
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-display font-bold text-white tracking-tight leading-[1.1]">
              {service.title}
            </h1>
          </div>

          <p className="text-xl text-white/60 max-w-2xl leading-relaxed animate-fade-in-up animation-delay-200">
            {service.description}
          </p>
        </div>
      </section>

      {/* ─── CONTENT SECTION ─────────────────────────────────── */}
      <section className="py-12 md:py-24 bg-white relative overflow-hidden">
        <div className="absolute inset-0 bg-mesh-gradient pointer-events-none" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 lg:gap-16 items-start">

            {/* Main Content */}
            <div className="lg:col-span-2 reveal-left">
              <h2 className="text-3xl font-display font-bold text-secondary mb-6">{service.title} Overview</h2>
              <div className="prose prose-lg text-slate-600 max-w-prose">
                {details.split('\n').map((line, idx) => {
                  if (line.trim().startsWith('###')) {
                    return <h3 key={idx} className="text-2xl font-display font-bold text-secondary mt-10 mb-5 flex items-center gap-3">
                      <span className="w-8 h-px bg-primary hidden sm:block"></span>
                      {line.replace('###', '').trim()}
                    </h3>;
                  }
                  if (line.trim().startsWith('-')) {
                    return (
                      <div key={idx} className="flex items-start gap-3 mb-3 group">
                        <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-1">
                          <div className="w-2 h-2 rounded-full bg-primary group-hover:scale-150 transition-transform"></div>
                        </div>
                        <p className="m-0 leading-relaxed text-slate-600">{line.replace('-', '').trim()}</p>
                      </div>
                    );
                  }
                  if (line.trim().match(/^\d\./)) {
                    return (
                      <div key={idx} className="flex gap-4 mb-5 p-5 bg-slate-50 rounded-2xl border border-slate-100 hover:border-primary/20 transition-colors">
                        <span className="font-display font-bold text-white bg-secondary w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-md">
                          {line.split('.')[0].padStart(2, '0')}
                        </span>
                        <p className="m-0 leading-relaxed text-slate-600 pt-1.5">{line.split('.').slice(1).join('.').trim()}</p>
                      </div>
                    );
                  }
                  if (line.trim() === '') return null;
                  return <p key={idx} className="mb-6 leading-relaxed text-slate-600">{line}</p>;
                })}
              </div>
            </div>

            {/* Sidebar CTA */}
            <div className="lg:col-span-1 reveal-right">
              <div className="bg-secondary rounded-3xl p-8 sticky top-28 overflow-hidden relative shadow-elevated">
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 rounded-full blur-[40px] translate-x-1/2 -translate-y-1/2" />
                <div className="absolute inset-0 opacity-[0.02]" style={{ backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize: '24px 24px' }} />

                <div className="relative z-10">
                  <div className="w-12 h-12 bg-white/10 backdrop-blur-md rounded-xl flex items-center justify-center mb-6">
                    <HardHat className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-2xl font-display font-bold text-white mb-4">Start your project with us today</h3>
                  <p className="text-white/50 mb-8 text-sm leading-relaxed">
                    Contact us to schedule a consultation. Our experts will review your requirements and provide a detailed timeline and quote.
                  </p>
                  <Link
                    to="/contact"
                    className="flex items-center justify-between w-full bg-primary text-white px-6 py-4 rounded-xl font-bold text-sm uppercase tracking-wider hover:bg-primary-dark transition-all duration-300 shadow-primary-glow group"
                  >
                    <span>Request a Quote</span>
                    <ArrowRight className="h-4 w-4 transform group-hover:translate-x-1 transition-transform" />
                  </Link>

                  <div className="mt-6 pt-6 border-t border-white/10">
                    <p className="text-white/60 text-sm mb-4">
                      Speak directly with our expert surveyors about your project requirements.
                    </p>
                    <div className="flex flex-col gap-1">
                      <span className="text-white/40 text-xs font-bold uppercase tracking-wider">Call Us</span>
                      <div className="flex flex-col">
                        <div className="flex items-center gap-3 group/phone">
                          <a href="tel:+2348034618227" className="text-white font-display font-bold text-lg hover:text-primary transition-colors">
                            +234 803 461 8227
                          </a>
                          <button 
                            onClick={() => handleCopy('+2348034618227')}
                            className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white/40 hover:text-primary transition-all active:scale-90"
                            title="Copy number"
                          >
                            {copied ? <Check className="h-3.5 w-3.5 text-green-500" /> : <Copy className="h-3.5 w-3.5" />}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>
    </div>
  );
};

export default ServiceDetail;
