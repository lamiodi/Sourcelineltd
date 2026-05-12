import { Ruler, CheckCircle, ArrowRight, Star, ShieldCheck, Clock, Medal as Award, Buildings as Building, HardHat, FileText } from '@phosphor-icons/react';
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

const LandSurveying = () => {
  useScrollReveal();

  const features = [
    {
      icon: ShieldCheck,
      title: "SURCON Certified",
      description: "All survey plans are lodged, signed, and stamped by our licensed surveyor registered with the Surveyors Council of Nigeria"
    },
    {
      icon: Award,
      title: "10+ Years Experience",
      description: "Over a decade of providing accurate boundary surveys for residential and commercial properties"
    },
    {
      icon: Clock,
      title: "Fast Turnaround",
      description: "Efficient field work and plan production, typically completed within 3-5 business days"
    }
  ];

  const processSteps = [
    {
      step: "01",
      title: "Site Inspection",
      description: "Our team visits your property to assess the terrain and existing boundary markers"
    },
    {
      step: "02",
      title: "Field Survey",
      description: "Precise measurements using modern equipment to determine exact boundary lines"
    },
    {
      step: "03",
      title: "Plan Production",
      description: "Creation of detailed survey plan with coordinates and boundary descriptions"
    },
    {
      step: "04",
      title: "Verification & Delivery",
      description: "Quality check and delivery of final survey documents with SURCON certification"
    }
  ];

  const testimonials = [
    {
      name: "Mrs. Adebayo",
      role: "Homeowner",
      content: "Sourceline's boundary survey saved me from a costly dispute with my neighbor. Their work was thorough and professional.",
      rating: 5
    },
    {
      name: "Engr. Johnson",
      role: "Real Estate Developer",
      content: "We've used Sourceline for multiple projects. Their accuracy and attention to detail is unmatched.",
      rating: 5
    }
  ];

  return (
    <div className="font-sans">
      <SEO
        title="Land Surveying Services"
        description="Precise boundary determination and land surveying services in Lagos, Nigeria by SURCON certified professionals."
      />

      {/* ─── PAGE HERO ───────────────────────────────────────── */}
      <section className="relative py-20 md:py-28 overflow-hidden bg-secondary">
        <div className="absolute inset-0">
          <img src="/images/whatsapp_20260212_105308.jpg" alt="Land Surveying Equipment"
            className="w-full h-full object-cover opacity-15 animate-ken-burns" />
        </div>
        <div className="absolute inset-0 bg-gradient-to-br from-secondary via-secondary/95 to-secondary-light" />
        <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-primary/10 rounded-full blur-[100px] translate-x-1/3 -translate-y-1/3 pointer-events-none" />
        <div className="absolute inset-0 opacity-[0.02]" style={{ backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize: '32px 32px' }} />

        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <div className="inline-flex items-center gap-2.5 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-5 py-2.5 mb-8 animate-fade-in">
            <Ruler className="h-4 w-4 text-primary" />
            <span className="text-white/90 text-xs font-bold uppercase tracking-[0.15em]">Land Surveying</span>
          </div>
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-display font-bold text-white tracking-tight mb-6 leading-[1.05] animate-fade-in-up">
            Precise Boundary <br />
            <span className="text-primary italic font-medium">Determination</span>
          </h1>
          <p className="text-xl text-white/50 max-w-2xl mx-auto leading-relaxed animate-fade-in-up animation-delay-200">
            Accurate land surveying services for property owners, developers, and investors.
            We ensure your property boundaries are clearly defined and legally documented.
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
            <h2 className="text-4xl font-display font-bold text-secondary mb-4 mt-3">Professional <br />Land Surveying</h2>
            <p className="text-gray-500 max-w-2xl mx-auto">
              Precision, accuracy, and full legal compliance for your peace of mind.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 stagger-children">
            {features.map((feature, idx) => (
              <div key={idx} className="reveal group bg-white p-8 rounded-2xl border border-gray-100 hover:border-primary/20 hover:shadow-card-hover transition-all duration-500 hover:-translate-y-1 card-premium text-center">
                <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:bg-primary transition-all duration-500 group-hover:scale-110 group-hover:shadow-primary-glow">
                  <feature.icon className="h-8 w-8 text-primary group-hover:text-white transition-colors duration-300" />
                </div>
                <h3 className="text-xl font-display font-bold text-secondary mb-3 group-hover:text-primary transition-colors duration-300">{feature.title}</h3>
                <p className="text-gray-500 leading-relaxed text-sm">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── PROCESS SECTION ─────────────────────────────────── */}
      <section className="bg-gray-50 py-12 md:py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-mesh-gradient pointer-events-none" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="text-center mb-16 reveal">
            <span className="section-label justify-center">How We Work</span>
            <h2 className="text-4xl font-display font-bold text-secondary mb-4 mt-3">Our Surveying Process</h2>
            <p className="text-gray-500 max-w-2xl mx-auto">
              A systematic and rigorous approach to ensure absolute accuracy in every survey
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {processSteps.map((step, idx) => (
              <div key={idx} className="relative reveal border border-gray-100 bg-white p-8 rounded-2xl group hover:border-primary/20 hover:shadow-card-hover transition-all duration-500">
                <div className="mb-6 flex items-center justify-between">
                  <span className="text-4xl font-display font-bold text-primary/20 group-hover:text-primary transition-colors duration-500">{step.step}</span>
                  {idx < processSteps.length - 1 && (
                    <div className="hidden lg:flex w-8 h-8 rounded-full bg-gray-50 items-center justify-center absolute -right-4 top-10 border border-gray-100 z-10 group-hover:bg-primary/10 transition-colors">
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

      {/* ─── TESTIMONIALS ────────────────────────────────────── */}
      <section className="bg-white py-12 md:py-24 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-[60px] translate-x-1/3 -translate-y-1/3" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="text-center mb-16 reveal">
            <span className="section-label justify-center">Client Feedback</span>
            <h2 className="text-4xl font-display font-bold text-secondary mb-4 mt-3">What Our Clients Say</h2>
            <p className="text-gray-500 max-w-2xl mx-auto">
              Hear from property owners and developers who trust Sourceline Limited
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 stagger-children">
            {testimonials.map((testimonial, idx) => (
              <div key={idx} className="reveal bg-gray-50 rounded-3xl p-10 border border-gray-100 hover:border-primary/20 hover:shadow-card-hover transition-all duration-500 relative group">
                <div className="absolute top-8 right-8 text-6xl font-serif text-gray-200/50 group-hover:text-primary/10 transition-colors opacity-50">&quot;</div>
                <div className="flex mb-6">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                  ))}
                </div>
                <p className="text-gray-600 leading-relaxed mb-8 italic text-lg relative z-10">
                  {testimonial.content}
                </p>
                <div className="flex items-center gap-4 border-t border-gray-200 pt-6">
                  <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                    <Building className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-display font-bold text-secondary">{testimonial.name}</h4>
                    <p className="text-xs font-bold uppercase tracking-wider text-primary mt-0.5">{testimonial.role}</p>
                  </div>
                </div>
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
          <h2 className="text-4xl md:text-5xl font-display font-bold text-white mb-6">Ready to Survey Your Property?</h2>
          <p className="text-white/40 max-w-2xl mx-auto mb-10 text-lg leading-relaxed">
            Get accurate boundary surveys from certified professionals. Contact us today for a free consultation and quote tailored to your specific parcel.
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

export default LandSurveying;