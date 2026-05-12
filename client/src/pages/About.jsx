import { useState } from 'react';
import { API_URL } from '../config';
import { CheckCircle, ShieldCheck, Ruler, MapTrifold as Map, Medal as Award, Users, TrendUp as TrendingUp, ArrowRight, Clock } from '@phosphor-icons/react';
import { Link } from 'react-router-dom';
import SEO from '../components/SEO';
import useScrollReveal from '../hooks/useScrollReveal';
import { team as teamData } from '../data';

/* useScrollReveal imported from shared hooks */

const About = () => {
  const [team] = useState(teamData);
  const [loading] = useState(false);
  useScrollReveal();

  const values = [
    { icon: ShieldCheck, title: 'Integrity', desc: 'We adhere to the highest ethical standards in all our dealings, ensuring transparent and honest consultancy.' },
    { icon: Ruler, title: 'Precision', desc: 'Accuracy is not just a goal, it is our guarantee. We use modern instruments for millimeter-level results.' },
    { icon: Map, title: 'Innovation', desc: 'We leverage modern GIS, drone, and digital technologies to deliver results that exceed expectations.' }
  ];

  const milestones = [
    { year: '2015 - 2018', event: 'Initial professional experience gained by our founder in precision surveying and geospatial mapping before officially incorporating the firm.' },
    { year: '2019', event: 'Founded on March 27, 2019 by Surv. Fajimi S. Adebayo in Lagos, Nigeria with a vision for precision surveying.' },
    { year: '2020 - 2021', event: 'Launched GIS and digital mapping services, integrating drone technology into our workflow.' },
    { year: '2022 - 2023', event: 'Expanded core operations to include major residential estate developments across the Lekki-Epe corridor.' },
    { year: '2024 - 2026', event: 'Marked 200+ completed projects milestone with 100% client satisfaction and SURCON compliance.' },
  ];

  return (
    <div className="font-sans">
      <SEO
        title="About Us"
        description="Learn about Sourceline Limited, our mission, vision, and the experienced team of SURCON-registered surveyors dedicated to precision and integrity in Lagos, Nigeria."
      />

      {/* ─── PAGE HERO ───────────────────────────────────────── */}
      <section className="relative py-28 md:py-44 overflow-hidden bg-secondary">
        {/* Background image */}
        <div className="absolute inset-0">
          <img
            src="/images/dji_fly_20260128_125236_0_1769601156568_photo_low_quality.jpg.jpeg"
            alt="About Hero"
            className="w-full h-full object-cover opacity-25 animate-ken-burns"
          />
        </div>
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-secondary via-secondary/95 to-secondary-light" />
        {/* Decorative circles */}
        <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-primary/10 rounded-full blur-[100px] translate-x-1/3 -translate-y-1/3 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-72 h-72 bg-primary/5 rounded-full blur-[80px] -translate-x-1/3 translate-y-1/3 pointer-events-none" />
        {/* Dot pattern */}
        <div className="absolute inset-0 opacity-[0.02]" style={{ backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize: '32px 32px' }} />

        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <div className="inline-flex items-center gap-2.5 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-5 py-2.5 mb-8 animate-fade-in">
            <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            <span className="text-white/90 text-xs font-bold uppercase tracking-[0.15em]">About Sourceline Limited</span>
          </div>
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-display font-bold text-white tracking-tight mb-6 leading-[1.05] animate-fade-in-up">
            Building Trust<br />
            Through <span className="text-primary italic font-medium">Precision</span>
          </h1>
          <p className="text-xl text-white/70 max-w-2xl mx-auto leading-relaxed animate-fade-in-up animation-delay-200">
            Sourceline Limited is a registered land surveying firm in Nigeria, dedicated to providing precision, integrity, and trust in every project we undertake.
          </p>
        </div>
      </section>

      {/* ─── QUICK STATS BAR ─────────────────────────────────── */}
      <section className="bg-primary relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-primary via-primary-light/20 to-primary opacity-50" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-px bg-primary-dark/10">
            {[
              { icon: TrendingUp, value: '200+', label: 'Projects Completed' },
              { icon: Clock, value: '10+', label: 'Years Experience' },
              { icon: Award, value: '100%', label: 'SURCON Registered' },
              { icon: CheckCircle, value: '100%', label: 'Client Satisfaction' },
            ].map((stat, i) => (
              <div key={i} className="flex flex-col items-center justify-center py-6 md:py-10 px-4 text-center group bg-primary">
                <stat.icon className="h-5 w-5 md:h-6 md:w-6 text-white/60 mb-1.5 group-hover:scale-110 transition-transform" />
                <div className="text-2xl md:text-3xl lg:text-4xl font-display font-bold text-white leading-none mb-1">{stat.value}</div>
                <div className="text-white/60 text-[10px] sm:text-xs font-bold uppercase tracking-wider">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── MISSION & VISION ─────────────────────────────────── */}
      <section className="py-16 md:py-24 bg-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[100px] translate-x-1/2 -translate-y-1/2 pointer-events-none" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="reveal bg-gray-50 p-10 md:p-12 rounded-3xl border border-gray-100 hover:border-primary/20 transition-all duration-500 hover:shadow-card-hover group relative overflow-hidden">
              <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-primary to-accent rounded-l-3xl" />
              <span className="section-label">Our Mission</span>
              <h2 className="text-3xl font-display font-bold text-secondary mb-4 mt-3">Precision in every step</h2>
              <p className="text-gray-500 text-lg leading-relaxed">
                To deliver accurate, reliable, and timely surveying and geoinformatics solutions that empower our clients to make informed decisions about their land and property assets.
              </p>
            </div>

            <div className="reveal bg-secondary p-10 md:p-12 rounded-3xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-[200px] h-[200px] bg-primary/10 rounded-full blur-[60px] translate-x-1/3 -translate-y-1/3 pointer-events-none" />
              <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-primary to-accent rounded-l-3xl" />
              <span className="text-xs font-bold uppercase tracking-[0.2em] text-primary/70 mb-3 block flex items-center gap-3" style={{ fontFamily: 'Inter, sans-serif' }}>
                <span className="inline-block w-6 h-px bg-gradient-to-r from-primary to-accent" />
                Our Vision
              </span>
              <h2 className="text-3xl font-display font-bold text-white mb-4 mt-1">Leading the industry</h2>
              <p className="text-white/70 text-lg leading-relaxed relative z-10">
                To be the leading reference point for land surveying excellence in Nigeria, known for our commitment to professional ethics, technological innovation, and client satisfaction.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ─── TIMELINE SECTION ────────────────────────────────── */}
      <section className="py-12 md:py-24 bg-gray-50 relative overflow-hidden">
        <div className="absolute inset-0 bg-mesh-gradient pointer-events-none" />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="text-center mb-16 reveal">
            <span className="section-label justify-center">Our Journey</span>
            <h2 className="text-4xl font-display font-bold text-secondary mb-4 mt-3">Milestones</h2>
            <p className="text-gray-500 max-w-xl mx-auto">From a small team with a big vision to Nigeria&apos;s trusted surveying partner.</p>
          </div>

          <div className="relative">
            {/* Timeline line */}
            <div className="absolute left-6 md:left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-primary via-primary/30 to-transparent md:-translate-x-px" />

            <div className="space-y-12">
              {milestones.map((m, idx) => (
                <div key={idx} className={`reveal relative flex items-start gap-8 ${idx % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'}`}>
                  {/* Timeline dot */}
                  <div className="absolute left-6 md:left-1/2 w-3 h-3 bg-primary rounded-full border-4 border-white shadow-primary-glow -translate-x-1.5 md:-translate-x-1.5 mt-2 z-10" />

                  {/* Content */}
                  <div className={`ml-14 md:ml-0 md:w-[calc(50%-2rem)] ${idx % 2 === 0 ? 'md:text-right md:pr-8' : 'md:text-left md:pl-8'}`}>
                    <div className={`bg-white p-6 rounded-2xl border border-gray-100 hover:border-primary/20 hover:shadow-card transition-all duration-500 group ${idx % 2 === 0 ? '' : ''}`}>
                      <span className="text-primary font-display font-bold text-2xl">{m.year}</span>
                      <p className="text-gray-500 text-sm leading-relaxed mt-2">{m.event}</p>
                    </div>
                  </div>

                  {/* Spacer for the other side */}
                  <div className="hidden md:block md:w-[calc(50%-2rem)]" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ─── CEO SECTION ─────────────────────────────────────── */}
      <section className="py-12 md:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 md:gap-16 items-center">
            <div className="relative reveal-left">
              <div className="relative rounded-3xl overflow-hidden shadow-elevated img-zoom">
                <img
                  src="/images/IMG-20260113-WA0012.jpg.jpeg"
                  alt="CEO Sourceline"
                  className="w-full h-[400px] md:h-[550px] object-cover"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-secondary/50 to-transparent" />
              </div>
              {/* Floating badge */}
              <div className="absolute -bottom-6 -right-6 bg-white rounded-2xl p-5 shadow-card-hover border border-gray-100 hover-lift">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center">
                    <Award className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <p className="font-bold text-secondary text-sm">SURCON Licensed</p>
                    <p className="text-gray-400 text-xs text-primary font-medium">Registered Surveyor</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="reveal-right text-center lg:text-left flex flex-col items-center lg:items-start">
              <span className="section-label justify-center lg:justify-start">Leadership</span>
              <h2 className="text-4xl md:text-5xl font-display font-bold text-secondary mb-6 mt-3 leading-tight">
                Our Founder:<br /> <span className="text-secondary opacity-90">Surv. Fajimi S. Adebayo</span>
              </h2>
              <div className="prose prose-lg text-slate-600 mb-8 max-w-prose">
                <p>
                  A visionary leader with a passion for precision and excellence. With over 10 years of experience in the land surveying and geoinformatics industry, he has steered Sourceline Limited to become a household name in accurate measurement and spatial data solutions.
                </p>
                <p className="mt-4">
                  His commitment to professional ethics and adoption of modern technology ensures that every project meets global standards. He believes in a client-first approach, ensuring that every survey tells the true story of the land.
                </p>
              </div>

              <div className="grid grid-cols-3 gap-2 md:gap-4 w-full">
                <div className="bg-gray-50 rounded-xl md:rounded-2xl px-2 py-3 md:px-6 md:py-4 text-center hover:bg-gray-100 transition-colors group">
                  <div className="font-display font-bold text-lg md:text-2xl text-secondary group-hover:text-primary transition-colors leading-none">10+</div>
                  <div className="text-gray-400 text-[10px] md:text-xs font-medium mt-1 leading-tight">Years Experience</div>
                </div>
                <div className="bg-gray-50 rounded-xl md:rounded-2xl px-2 py-3 md:px-6 md:py-4 text-center hover:bg-gray-100 transition-colors group">
                  <div className="font-display font-bold text-lg md:text-2xl text-secondary group-hover:text-primary transition-colors leading-none">200+</div>
                  <div className="text-gray-400 text-[10px] md:text-xs font-medium mt-1 leading-tight">Projects Led</div>
                </div>
                <div className="bg-primary/10 border border-primary/20 rounded-xl md:rounded-2xl px-2 py-3 md:px-6 md:py-4 text-center hover:bg-primary/15 transition-colors">
                  <div className="font-display font-bold text-lg md:text-2xl text-primary leading-none">SURCON</div>
                  <div className="text-gray-400 text-[10px] md:text-xs font-medium mt-1 leading-tight">Certified</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── COMPANY REGISTRATION ────────────────────────────── */}
      <section className="py-12 md:py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="reveal bg-secondary text-white rounded-3xl relative overflow-hidden p-6 md:p-14">
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-[60px] translate-x-1/3 -translate-y-1/3" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-primary/5 rounded-full blur-[50px] -translate-x-1/4 translate-y-1/4" />
            <div className="absolute inset-0 opacity-[0.015]" style={{ backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize: '32px 32px' }} />

            <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-8 text-center md:text-left">
              <div>
                <div className="flex items-center justify-center md:justify-start gap-3 mb-3">
                  <div className="w-8 h-8 md:w-10 md:h-10 bg-primary rounded-xl flex items-center justify-center">
                    <CheckCircle className="h-4 w-4 md:h-5 md:w-5 text-white" />
                  </div>
                  <h2 className="text-2xl md:text-3xl font-display font-bold">Registered & Certified</h2>
                </div>
                <p className="text-white/60 text-base md:text-lg max-w-lg">
                  Sourceline Limited is a fully registered entity with the Corporate Affairs Commission of Nigeria, operating under all applicable professional guidelines.
                </p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm p-5 md:p-8 rounded-2xl border border-white/20 text-center w-full md:min-w-[200px] md:w-auto shrink-0 hover:bg-white/15 transition-colors">
                <p className="text-[10px] md:text-xs font-bold uppercase tracking-[0.2em] text-primary mb-2" style={{ fontFamily: 'Inter, sans-serif' }}>RC Number</p>
                <p className="text-3xl md:text-4xl font-display font-bold text-white">Verified</p>
                <Link to="/verify" className="mt-4 inline-flex items-center gap-1 text-white/50 hover:text-primary text-[10px] md:text-xs transition-colors font-medium group">
                  Verify Now <ArrowRight className="h-3 w-3 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── CORE VALUES ─────────────────────────────────────── */}
      <section className="py-12 md:py-24 bg-white relative overflow-hidden">
        <div className="absolute inset-0 bg-mesh-gradient pointer-events-none" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="text-center mb-16 reveal">
            <span className="section-label justify-center">Values</span>
            <h2 className="text-4xl font-display font-bold text-secondary mb-4 mt-3">Our Core Values</h2>
            <p className="text-gray-500 max-w-2xl mx-auto">The principles that guide every survey we conduct and every client interaction we have.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 stagger-children">
            {values.map((value, idx) => (
              <div key={idx} className="reveal bg-white p-8 rounded-2xl border border-gray-100 hover:border-primary/20 hover:shadow-card-hover transition-all duration-500 group hover:-translate-y-1 card-premium">
                <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-primary transition-all duration-500 group-hover:scale-110 group-hover:shadow-primary-glow">
                  <value.icon className="h-7 w-7 text-primary group-hover:text-white transition-colors duration-300" />
                </div>
                <h3 className="text-2xl font-display font-bold text-secondary mb-3 group-hover:text-primary transition-colors duration-300">{value.title}</h3>
                <p className="text-gray-500 leading-relaxed">{value.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── TEAM SECTION ────────────────────────────────────── */}
      <section id="team" className="py-12 md:py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16 reveal">
            <span className="section-label justify-center">Our People</span>
            <h2 className="text-4xl font-display font-bold text-secondary mb-4 mt-3">Meet the Experts</h2>
            <p className="text-gray-500 max-w-2xl mx-auto">Our team consists of dedicated professionals with years of field experience and technical expertise.</p>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[1, 2, 3].map(i => (
                <div key={i} className="rounded-2xl overflow-hidden">
                  <div className="h-96 skeleton" />
                  <div className="p-4 space-y-2">
                    <div className="h-5 skeleton rounded-lg w-2/3" />
                    <div className="h-3 skeleton rounded w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          ) : team.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 stagger-children">
              {team.map((member) => (
                <div key={member.id} className="reveal group">
                  <div className="relative overflow-hidden rounded-2xl mb-5 aspect-[3/4]">
                    {member.image ? (
                      <img
                        src={member.image}
                        alt={member.name}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                        loading="lazy"
                      />
                    ) : (
                      <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                        <span className="text-6xl font-display font-bold text-gray-200">{member.name?.[0]}</span>
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-secondary/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    {member.surcon_number && (
                      <div className="absolute bottom-4 left-4 bg-primary/90 backdrop-blur-sm text-white text-xs font-bold px-3 py-1.5 rounded-xl opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-500">
                        {member.surcon_number}
                      </div>
                    )}
                  </div>
                  <h3 className="text-xl font-display font-bold text-secondary">{member.name}</h3>
                  <p className="text-primary text-sm font-bold uppercase tracking-wider mt-1">{member.position}</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16 bg-white rounded-3xl border border-gray-100">
              <Users className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-400 font-medium">Team members will be listed here soon.</p>
            </div>
          )}
        </div>
      </section>

      {/* ─── CTA SECTION ───────────────────────────────────── */}
      <section className="bg-secondary py-12 md:py-24 overflow-hidden relative">
        <div className="absolute top-0 left-0 w-96 h-96 bg-primary/5 rounded-full blur-[80px] -translate-x-1/2 -translate-y-1/2 pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-[80px] translate-x-1/3 translate-y-1/3 pointer-events-none" />
        <div className="absolute inset-0 opacity-[0.015]" style={{ backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize: '32px 32px' }} />

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10 reveal">
          <span className="text-xs font-bold uppercase tracking-[0.2em] text-primary/70 mb-4 block" style={{ fontFamily: 'Inter, sans-serif' }}>Work With Us</span>
          <h2 className="text-4xl md:text-5xl font-display font-bold text-white mb-6">Ready to start your project?</h2>
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
              to="/services"
              className="border border-white/20 text-white/70 px-8 py-4 rounded-2xl font-bold text-sm uppercase tracking-wider hover:bg-white/10 hover:text-white hover:border-white/40 transition-all duration-300 flex items-center justify-center gap-2 group w-full sm:w-[240px]"
            >
              View Our Services <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default About;