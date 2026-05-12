import { MapTrifold as Map, ArrowRight, ShieldCheck, Clock, Medal as Award, Stack as Layers } from '@phosphor-icons/react';
import { Link } from 'react-router-dom';
import SEO from '../../components/SEO';
import { useEffect } from 'react';

/* ── Scroll reveal hook ────────────────── */
const useScrollReveal = () => {
  useEffect(() => {
    const els = document.querySelectorAll('.reveal, .reveal-left, .reveal-right, .reveal-scale');
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('revealed');
            obs.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1, rootMargin: '0px 0px -40px 0px' }
    );
    els.forEach(el => obs.observe(el));
    return () => obs.disconnect();
  }, []);
};

const DigitalMapping = () => {
  useScrollReveal();

  const features = [
    {
      icon: ShieldCheck,
      title: "High Resolution",
      description: "Detailed digital maps with precise measurements and accurate representations"
    },
    {
      icon: Award,
      title: "Multiple Formats",
      description: "Maps delivered in various formats including CAD, GIS, and web-ready formats"
    },
    {
      icon: Clock,
      title: "Quick Turnaround",
      description: "Efficient mapping processes with fast delivery times"
    }
  ];

  const processSteps = [
    {
      step: "01",
      title: "Data Collection",
      description: "Comprehensive field data collection using advanced surveying equipment"
    },
    {
      step: "02",
      title: "Processing",
      description: "Professional processing of survey data into digital format"
    },
    {
      step: "03",
      title: "Mapping",
      description: "Creation of detailed digital maps with layers and annotations"
    },
    {
      step: "04",
      title: "Delivery",
      description: "Final maps delivered in requested formats with documentation"
    }
  ];

  const applications = [
    {
      title: "Urban Planning",
      description: "Detailed city maps for development and infrastructure planning"
    },
    {
      title: "Property Development",
      description: "Site maps for residential and commercial development projects"
    },
    {
      title: "Environmental Studies",
      description: "Environmental mapping for conservation and impact assessment"
    },
    {
      title: "Infrastructure Design",
      description: "Engineering maps for roads, utilities, and public works"
    }
  ];

  return (
    <div className="font-sans">
      <SEO
        title="Digital Mapping Services"
        description="Precise digital mapping and GIS solutions for urban planning, property development, and engineering."
      />

      {/* ─── PAGE HERO ───────────────────────────────────────── */}
      <section className="relative py-20 md:py-28 overflow-hidden bg-secondary">
        <div className="absolute inset-0">
          <img src="/images/20260204_120452.jpg.jpeg" alt="Digital Mapping"
            className="w-full h-full object-cover opacity-15 animate-ken-burns" />
        </div>
        <div className="absolute inset-0 bg-gradient-to-br from-secondary via-secondary/95 to-secondary-light" />
        <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-primary/10 rounded-full blur-[100px] translate-x-1/3 -translate-y-1/3 pointer-events-none" />
        <div className="absolute inset-0 opacity-[0.02]" style={{ backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize: '32px 32px' }} />

        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <div className="inline-flex items-center gap-2.5 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-5 py-2.5 mb-8 animate-fade-in">
            <Map className="h-4 w-4 text-primary" />
            <span className="text-white/90 text-xs font-bold uppercase tracking-[0.15em]">Digital Mapping</span>
          </div>
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-display font-bold text-white tracking-tight mb-6 leading-[1.05] animate-fade-in-up">
            Precision Digital <br />
            <span className="text-primary italic font-medium">Mapping</span> Solutions
          </h1>
          <p className="text-xl text-white/50 max-w-2xl mx-auto leading-relaxed animate-fade-in-up animation-delay-200">
            Professional digital mapping services for planning, analysis, and design.
            We create highly accurate, detailed maps for your projects.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center mt-10 animate-fade-in-up animation-delay-300">
            <Link
              to="/contact"
              className="bg-primary text-white px-8 py-4 rounded-xl font-bold text-sm uppercase tracking-wider hover:bg-primary-dark transition-all duration-300 shadow-primary-glow flex justify-center items-center gap-2 group"
            >
              Request Quote <ArrowRight className="h-4 w-4 transform group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              to="/services"
              className="border border-white/20 text-white/60 px-8 py-4 rounded-xl font-bold text-sm uppercase tracking-wider hover:bg-white/10 hover:text-white transition-all duration-300 flex justify-center items-center"
            >
              All Services
            </Link>
          </div>
        </div>
      </section>

      {/* ─── FEATURES SECTION ────────────────────────────────── */}
      <section className="bg-white py-12 md:py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-mesh-gradient pointer-events-none" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="text-center mb-16 reveal">
            <span className="section-label justify-center">Why Choose Us</span>
            <h2 className="text-4xl font-display font-bold text-secondary mb-4 mt-3">Professional Digital<br />Mapping Services</h2>
            <p className="text-gray-500 max-w-2xl mx-auto">
              Accuracy, detail, and technical expertise applied to spatial intelligence.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 stagger-children">
            {features.map((feature, idx) => (
              <div key={idx} className="reveal group bg-gray-50 p-8 rounded-2xl border border-gray-100 hover:border-primary/20 hover:shadow-card-hover transition-all duration-500 hover:-translate-y-1 text-center">
                <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-sm border border-gray-100 group-hover:bg-primary transition-all duration-500 group-hover:scale-110 group-hover:shadow-primary-glow group-hover:border-primary">
                  <feature.icon className="h-8 w-8 text-primary group-hover:text-white transition-colors duration-300" />
                </div>
                <h3 className="text-xl font-display font-bold text-secondary mb-3 group-hover:text-primary transition-colors duration-300">{feature.title}</h3>
                <p className="text-gray-500 leading-relaxed text-sm">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── APPLICATIONS SECTION ────────────────────────────── */}
      <section className="bg-gray-50 py-12 md:py-24 relative overflow-hidden border-t border-gray-100">
        <div className="absolute inset-0 bg-mesh-gradient pointer-events-none opacity-50" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="text-center mb-16 reveal">
            <span className="section-label justify-center">Applications</span>
            <h2 className="text-4xl font-display font-bold text-secondary mb-4 mt-3">Where We Apply It</h2>
            <p className="text-gray-500 max-w-2xl mx-auto">
              Our digital maps support various planning and development domains
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 stagger-children">
            {applications.map((app, idx) => (
              <div key={idx} className="reveal bg-white rounded-2xl p-8 border border-gray-100 hover:border-primary/30 shadow-sm hover:shadow-card transition-all duration-500 hover:-translate-y-1 group">
                <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center mb-5 group-hover:bg-primary transition-colors">
                  <Layers className="h-5 w-5 text-primary group-hover:text-white transition-colors" />
                </div>
                <h3 className="text-lg font-display font-bold text-secondary mb-3 group-hover:text-primary transition-colors">{app.title}</h3>
                <p className="text-gray-500 leading-relaxed text-sm">{app.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── PROCESS SECTION ─────────────────────────────────── */}
      <section className="bg-white py-12 md:py-24 relative overflow-hidden border-t border-gray-100">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-[60px] translate-x-1/3 -translate-y-1/3" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="text-center mb-16 reveal">
            <span className="section-label justify-center">Workflow</span>
            <h2 className="text-4xl font-display font-bold text-secondary mb-4 mt-3">Our Survey Process</h2>
            <p className="text-gray-500 max-w-2xl mx-auto">
              A systematic approach to capture high-accuracy spatial data effectively
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {processSteps.map((step, idx) => (
              <div key={idx} className="relative reveal border border-gray-100 bg-gray-50 p-8 rounded-2xl group hover:border-primary/20 hover:bg-white hover:shadow-card-hover transition-all duration-500">
                <div className="mb-6 flex items-center justify-between">
                  <span className="text-4xl font-display font-bold text-primary/20 group-hover:text-primary transition-colors duration-500">{step.step}</span>
                  {idx < processSteps.length - 1 && (
                    <div className="hidden lg:flex w-8 h-8 rounded-full bg-white items-center justify-center absolute -right-4 top-10 border border-gray-100 z-10 group-hover:bg-primary/10 transition-colors shadow-sm">
                      <ArrowRight className="h-4 w-4 text-gray-300 group-hover:text-primary transition-colors" />
                    </div>
                  )}
                </div>
                <h3 className="text-lg font-display font-bold text-secondary mb-3 group-hover:text-primary transition-colors">{step.title}</h3>
                <p className="text-gray-500 leading-relaxed text-sm">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── CTA SECTION ─────────────────────────────────────── */}
      <section className="bg-secondary py-12 md:py-24 overflow-hidden relative border-t border-white/10">
        <div className="absolute top-0 left-0 w-96 h-96 bg-primary/5 rounded-full blur-[80px] -translate-x-1/2 -translate-y-1/2 pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-[80px] translate-x-1/3 translate-y-1/3 pointer-events-none" />
        <div className="absolute inset-0 opacity-[0.015]" style={{ backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize: '32px 32px' }} />

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10 reveal">
          <span className="text-xs font-bold uppercase tracking-[0.2em] text-primary/70 mb-4 block" style={{ fontFamily: 'Inter, sans-serif' }}>Get Started</span>
          <h2 className="text-4xl md:text-5xl font-display font-bold text-white mb-6">Need Digital Mapping Services?</h2>
          <p className="text-white/40 max-w-2xl mx-auto mb-10 text-lg leading-relaxed">
            Get precise digital maps for your planning and development projects. Contact us today for professional mapping solutions.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/contact"
              className="bg-primary text-white px-8 py-4 rounded-xl font-bold text-sm uppercase tracking-wider shadow-primary-glow hover:bg-primary-dark hover:shadow-primary-glow-lg hover:-translate-y-1 transition-all duration-300 flex items-center justify-center gap-2 group"
            >
              Get a Free Quote <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default DigitalMapping;