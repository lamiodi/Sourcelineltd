import { useState } from 'react';
import { Ruler, MapTrifold as Map, Briefcase, FileText, Globe, Tree as Trees, Stack as Layers, ArrowRight, ShieldCheck, HardHat, MapPin, CheckCircle } from '@phosphor-icons/react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { API_URL } from '../config';
import SEO from '../components/SEO';
import useScrollReveal from '../hooks/useScrollReveal';
import { services as servicesData } from '../data';

const iconMap = {
  Ruler, Map, Briefcase, FileText, Globe, Trees, Layers, ShieldCheck, HardHat, MapPin
};

/* useScrollReveal imported from shared hooks */

const Services = () => {
  const [services] = useState(servicesData);
  const [loading] = useState(false);
  useScrollReveal();

  return (
    <div className="font-sans">
      <SEO
        title="Our Services"
        description="Comprehensive land surveying services including Boundary Surveys, Engineering Surveys, Digital Mapping, and GIS Solutions in Lagos, Nigeria."
      />

      {/* ─── PAGE HERO ───────────────────────────────────────── */}
      <section className="relative py-20 md:py-32 overflow-hidden bg-secondary">
        <div className="absolute inset-0">
          <img src="/images/20250516_104441.jpg.jpeg" alt="Services Hero"
            className="w-full h-full object-cover opacity-25 animate-ken-burns" />
        </div>
        <div className="absolute inset-0 bg-gradient-to-br from-secondary via-secondary/95 to-secondary-light" />
        <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-primary/10 rounded-full blur-[100px] translate-x-1/3 -translate-y-1/3 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-72 h-72 bg-primary/5 rounded-full blur-[80px] -translate-x-1/3 translate-y-1/3 pointer-events-none" />
        <div className="absolute inset-0 opacity-[0.02]" style={{ backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize: '32px 32px' }} />

        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <div className="inline-flex items-center gap-2.5 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-5 py-2.5 mb-8 animate-fade-in">
            <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            <span className="text-white/90 text-xs font-bold uppercase tracking-[0.15em]">Professional Surveying Services</span>
          </div>
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-display font-bold text-white tracking-tight mb-6 leading-[1.05] animate-fade-in-up">
            Our <span className="text-primary">Services</span>
          </h1>
          <p className="text-xl text-white/70 max-w-2xl mx-auto leading-relaxed animate-fade-in-up animation-delay-200">
            We offer a comprehensive range of surveying and geoinformatics services tailored to meet your specific needs.
          </p>
        </div>
      </section>

      {/* ─── SERVICES GRID ───────────────────────────────────── */}
      <section className="py-12 md:py-24 bg-white relative overflow-hidden">
        <div className="absolute inset-0 bg-mesh-gradient pointer-events-none" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="text-center mb-16 reveal">
            <span className="section-label justify-center">What We Offer</span>
            <h2 className="text-4xl font-display font-bold text-secondary mb-4 mt-3">All Services</h2>
            <p className="text-gray-500 max-w-2xl mx-auto">From boundary surveying to advanced GIS solutions, our expertise covers every aspect of land and spatial data services.</p>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map(i => (
                <div key={i} className="rounded-2xl overflow-hidden border border-gray-100">
                  <div className="h-72 skeleton" />
                  <div className="p-6 space-y-3">
                    <div className="h-5 skeleton rounded w-3/4" />
                    <div className="h-3 skeleton rounded w-full" />
                    <div className="h-3 skeleton rounded w-2/3" />
                  </div>
                </div>
              ))}
            </div>
          ) : services.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 stagger-children">
              {services.map((service, index) => {
                const IconComponent = iconMap[service.icon] || Ruler;
                return (
                  <motion.div
                    key={service.id || index}
                    whileHover={{ y: -8, scale: 1.02 }}
                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                  >
                    <Link
                      to={`/services/${service.slug || service.id}`}
                      className="reveal group bg-white rounded-2xl overflow-hidden border border-gray-100 hover:border-primary/20 hover:shadow-2xl transition-shadow duration-500 flex flex-col card-premium h-full"
                    >
                      {/* Image header with number */}
                      <div className="h-72 relative overflow-hidden">
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

                        {/* Number indicator */}
                        <span className="absolute top-4 left-5 text-white/20 font-display font-bold text-5xl select-none z-10 transition-colors group-hover:text-primary/20" style={{ textShadow: '0 1px 4px rgba(0,0,0,0.3)' }}>
                          {String(index + 1).padStart(2, '0')}
                        </span>

                        {/* Icon Corner Badge */}
                        <div className="absolute top-4 right-4 z-20 transition-all duration-500 group-hover:scale-110">
                          <div className="w-12 h-12 bg-white/90 backdrop-blur-md shadow-lg border border-gray-100 rounded-xl flex items-center justify-center group-hover:bg-primary group-hover:border-primary group-hover:shadow-primary-glow transition-all duration-500">
                            <IconComponent className="h-6 w-6 text-primary group-hover:text-white transition-colors duration-300" />
                          </div>
                        </div>
                      </div>

                      <div className="p-7 flex-1 flex flex-col">
                        <h3 className="text-xl font-display font-bold text-secondary mb-3 group-hover:text-primary transition-colors duration-300">{service.title}</h3>
                        <p className="text-gray-500 leading-relaxed text-sm mb-6 flex-1">{service.description}</p>

                        <span
                          className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-secondary/50 group-hover:text-primary transition-all duration-300"
                        >
                          Learn More
                          <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
                        </span>
                      </div>
                    </Link>
                  </motion.div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-12 md:py-20 bg-gray-50 rounded-3xl border border-gray-100">
              <Ruler className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-400 font-medium text-lg">Services are being updated. Check back soon.</p>
            </div>
          )}
        </div>
      </section>

      {/* ─── WHY CHOOSE US ───────────────────────────────────── */}
      <section className="py-12 md:py-24 bg-gray-50 relative overflow-hidden">
        <div className="absolute inset-0 bg-mesh-gradient pointer-events-none" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 md:gap-16 items-center">
            <div className="reveal-left">
              <span className="section-label">Why Sourceline</span>
              <h2 className="text-4xl font-display font-bold text-secondary mb-6 mt-3 leading-tight">
                Industry-leading<br /> expertise & tools
              </h2>
              <p className="text-slate-600 text-lg leading-relaxed mb-8 max-w-prose">
                Our team of SURCON-registered surveyors combines decades of field experience with the latest geospatial technology to deliver results that exceed expectations.
              </p>
              <ul className="space-y-4 max-w-prose">
                {[
                  'SURCON-registered and licensed professionals',
                  'Modern total station, GNSS & drone technology',
                  'Comprehensive digital documentation & GIS',
                  'Fast turnaround: most surveys within 72 hours',
                  'Transparent pricing with no hidden charges'
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-3 group">
                    <div className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center shrink-0 mt-0.5 group-hover:bg-primary transition-colors duration-300">
                      <CheckCircle className="h-3.5 w-3.5 text-primary group-hover:text-white transition-colors" />
                    </div>
                    <span className="text-slate-600 leading-relaxed text-sm">{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="relative rounded-3xl overflow-hidden shadow-elevated reveal-right img-zoom">
              <img
                src="/images/20250516_130158.jpg.jpeg"
                alt="Survey Equipment"
                className="w-full h-[300px] md:h-[500px] object-cover"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-secondary/60 via-transparent to-transparent" />
            </div>
          </div>
        </div>
      </section>

      {/* ─── CTA SECTION ─────────────────────────────────────── */}
      <section className="bg-secondary py-12 md:py-24 overflow-hidden relative">
        <div className="absolute top-0 left-0 w-96 h-96 bg-primary/5 rounded-full blur-[80px] -translate-x-1/2 -translate-y-1/2 pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-[80px] translate-x-1/3 translate-y-1/3 pointer-events-none" />
        <div className="absolute inset-0 opacity-[0.015]" style={{ backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize: '32px 32px' }} />

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10 reveal">
          <span className="text-xs font-bold uppercase tracking-[0.2em] text-primary/70 mb-4 block" style={{ fontFamily: 'Inter, sans-serif' }}>Get Started</span>
          <h2 className="text-4xl md:text-5xl font-display font-bold text-white mb-6">Need a custom solution?</h2>
          <p className="text-white/60 max-w-2xl mx-auto mb-10 text-lg leading-relaxed">
            Contact us today to discuss your specific project requirements. We are ready to provide expert consultation and a tailored quote.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center w-full">
            <Link
              to="/contact"
              className="bg-primary text-white px-8 py-4 rounded-2xl font-bold text-sm uppercase tracking-wider shadow-primary-glow hover:bg-primary-dark hover:shadow-primary-glow-lg hover:-translate-y-1 transition-all duration-300 flex items-center justify-center gap-2 group w-full sm:w-[240px]"
            >
              Request a Quote <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              to="/portfolio"
              className="border border-white/20 text-white/60 px-8 py-4 rounded-2xl font-bold text-sm uppercase tracking-wider hover:bg-white/10 hover:text-white hover:border-white/40 transition-all duration-300 flex items-center justify-center gap-2 group w-full sm:w-[240px]"
            >
              View Projects <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Services;
