import { useState, useEffect } from 'react';
import { MapPin, ArrowRight, Buildings as Building, CheckCircle, MagnifyingGlass as Search, X } from '@phosphor-icons/react';
import { Link } from 'react-router-dom';
import SEO from '../components/SEO';
import useScrollReveal from '../hooks/useScrollReveal';
import { API_URL } from '../config';
import { projects as staticProjectsData } from '../data';

/* useScrollReveal imported from shared hooks */

const Portfolio = () => {
  const [filter, setFilter] = useState("All");
  const [search, setSearch] = useState("");
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  useScrollReveal();

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const response = await fetch(`${API_URL}/projects`);
        if (response.ok) {
          const data = await response.json();
          setProjects(data);
        } else {
          setProjects(staticProjectsData);
        }
      } catch (err) {
        setProjects(staticProjectsData);
      } finally {
        setLoading(false);
      }
    };
    fetchProjects();
  }, []);

  // Extract unique categories from projects
  const uniqueCategories = ["All", ...new Set(projects.map(p => p.category))];

  const filteredProjects = projects.filter(project => {
    const matchesCategory = filter === "All" || project.category === filter;
    const q = search.toLowerCase();
    const matchesSearch = !q ||
      project.title?.toLowerCase().includes(q) ||
      project.location?.toLowerCase().includes(q) ||
      project.description?.toLowerCase().includes(q);
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="font-sans">
      <SEO
        title="Portfolio"
        description="Browse our portfolio of successful estate surveying projects across Lagos and Nigeria. From residential layouts to large-scale infrastructure developments."
      />

      {/* ─── PAGE HERO ───────────────────────────────────────── */}
      <section className="relative py-36 md:py-44 overflow-hidden bg-secondary">
        <div className="absolute inset-0">
          <img src="/images/20250516_111224.jpg.jpeg" alt="Portfolio Hero"
            className="w-full h-full object-cover opacity-15 animate-ken-burns" />
        </div>
        <div className="absolute inset-0 bg-gradient-to-br from-secondary via-secondary/95 to-secondary-light" />
        <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-primary/10 rounded-full blur-[100px] translate-x-1/3 -translate-y-1/3 pointer-events-none" />
        <div className="absolute inset-0 opacity-[0.02]" style={{ backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize: '32px 32px' }} />

        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <div className="inline-flex items-center gap-2.5 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-5 py-2.5 mb-8 animate-fade-in">
            <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            <span className="text-white/90 text-xs font-bold uppercase tracking-[0.15em]">Our Work</span>
          </div>
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-display font-bold text-white tracking-tight mb-6 leading-[1.05] animate-fade-in-up">
            Our <span className="text-primary">Projects</span>
          </h1>
          <p className="text-xl text-white/60 max-w-2xl mx-auto leading-relaxed animate-fade-in-up animation-delay-200">
            Every estate tells a story of precision, expertise, and trust. Explore our portfolio of {projects.length} successful projects delivered across Lagos and Nigeria.
          </p>
        </div>
      </section>

      {/* ─── STATS BANNER ────────────────────────────────────── */}
      <section className="bg-white border-b border-gray-100 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 -mt-10 relative z-10 reveal">
            {[
              { value: `${projects.length}+`, label: "Estates Surveyed" },
              { value: "10+", label: "Years Experience" },
              { value: "100%", label: "Client Satisfaction" },
              { value: "6+", label: "Service Categories" },
            ].map((stat, idx) => (
              <div key={idx} className="bg-white border border-gray-100 p-6 md:p-8 text-center first:rounded-l-2xl last:rounded-r-2xl shadow-sm hover:shadow-card transition-shadow duration-300">
                <p className="text-3xl md:text-4xl font-display font-bold text-primary mb-1">{stat.value}</p>
                <p className="text-xs font-bold uppercase tracking-wider text-gray-400">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── PROJECTS GRID ───────────────────────────────────── */}
      <section className="py-16 md:py-24 bg-white relative overflow-hidden">
        <div className="absolute inset-0 bg-mesh-gradient pointer-events-none" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">

          <div className="text-center mb-12 reveal">
            <span className="section-label justify-center">Portfolio</span>
            <h2 className="text-4xl font-display font-bold text-secondary mb-4 mt-3">Projects We Have Delivered</h2>
            <p className="text-gray-500 max-w-2xl mx-auto">From boundary demarcation to full estate layout surveys, each project below reflects our commitment to accuracy and professional excellence.</p>
          </div>

          {/* Search Bar */}
          <div className="max-w-xl mx-auto mb-8 reveal">
            <div className="relative group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 group-focus-within:text-primary transition-colors" />
              <input
                type="text"
                placeholder="Search projects by name, location..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full pl-11 pr-10 py-3.5 rounded-2xl border border-gray-200 bg-white text-sm text-secondary placeholder-gray-400 focus:outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/10 transition-all duration-300 shadow-sm"
              />
              {search && (
                <button onClick={() => setSearch('')} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-secondary transition-colors">
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>

          {/* Filter Buttons */}
          <div className="flex flex-wrap justify-center gap-3 mb-16 reveal">
            {uniqueCategories.map((cat) => (
              <button
                key={cat}
                onClick={() => setFilter(cat)}
                className={`px-6 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all duration-300 ${filter === cat
                  ? "bg-secondary text-white shadow-lg -translate-y-0.5"
                  : "bg-gray-100 text-gray-500 hover:bg-gray-200 hover:text-gray-700"
                  }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Projects Grid */}
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[1, 2, 3].map(i => (
                <div key={i} className="rounded-2xl overflow-hidden">
                  <div className="h-80 skeleton" />
                  <div className="p-4 space-y-2">
                    <div className="h-5 skeleton rounded-lg w-2/3" />
                    <div className="h-3 skeleton rounded w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          ) : filteredProjects.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 stagger-children">
              {filteredProjects.map((project) => (
                <Link key={project.id} to={`/portfolio/${project.id}`} className="reveal group block">
                  <div className="overflow-hidden rounded-2xl mb-5 relative">
                    <div className="absolute top-4 left-4 z-10">
                      <span className="bg-primary text-white text-xs font-bold px-3 py-1.5 rounded-xl uppercase tracking-wider shadow-primary-glow">
                        {project.category}
                      </span>
                    </div>
                    {/* Arrow icon */}
                    <div className="absolute top-4 right-4 z-10 w-10 h-10 bg-white/10 backdrop-blur-md rounded-xl flex items-center justify-center opacity-0 -translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-500">
                      <ArrowRight className="h-4 w-4 text-white -rotate-45" />
                    </div>
                    {project.image ? (
                      <img
                        src={project.image}
                        alt={project.title}
                        className="w-full h-80 object-cover transition-all duration-700 group-hover:scale-105"
                        loading="lazy"
                      />
                    ) : (
                      <div className="w-full h-80 bg-gradient-to-br from-gray-100 to-gray-50 flex flex-col items-center justify-center">
                        <Building className="h-12 w-12 text-gray-300 mb-3" />
                        <span className="text-xs font-bold uppercase tracking-wider text-gray-300">Estate Project</span>
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-secondary/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  </div>
                  <h3 className="text-xl font-display font-bold text-secondary mb-2 group-hover:text-primary transition-colors">{project.title}</h3>
                  <div className="flex items-center text-gray-400 text-xs mb-3">
                    <MapPin className="h-3.5 w-3.5 mr-1.5 text-primary" />
                    <span className="font-semibold uppercase tracking-wide">{project.location}</span>
                  </div>
                  <p className="text-gray-500 leading-relaxed text-sm line-clamp-2">{project.description}</p>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 md:py-20 bg-gray-50 rounded-3xl border border-gray-100">
              <MapPin className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-400 font-medium text-lg">No projects found{search ? ` for "${search}"` : ' for this category'}.</p>
              {(search || filter !== 'All') && (
                <button onClick={() => { setSearch(''); setFilter('All'); }} className="mt-4 text-primary text-sm font-bold hover:underline">Clear filters</button>
              )}
            </div>
          )}
        </div>
      </section>

      {/* ─── WHY TRUST US ─────────────────────────────────────── */}
      <section className="py-12 md:py-24 bg-gray-50 relative overflow-hidden">
        <div className="absolute inset-0 bg-mesh-gradient pointer-events-none" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 md:gap-16 items-center">
            <div className="reveal-left text-center lg:text-left flex flex-col items-center lg:items-start">
              <span className="section-label justify-center lg:justify-start">Why Clients Trust Us</span>
              <h2 className="text-4xl font-display font-bold text-secondary mb-6 mt-3 leading-tight">
                Delivered with precision,<br />every single time
              </h2>
              <p className="text-gray-500 text-lg leading-relaxed mb-8">
                Every estate in our portfolio was delivered on time, within budget, and to the highest SURCON standards. Our clients return because they trust our accuracy and professionalism.
              </p>
              <ul className="space-y-4">
                {[
                  'SURCON-certified survey plans for every project',
                  'Millimetre-level accuracy with RTK GNSS equipment',
                  'Same team from field survey to final plan delivery',
                  'Transparent reporting and ongoing client communication',
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-3 group">
                    <div className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center shrink-0 mt-0.5 group-hover:bg-primary transition-colors duration-300">
                      <CheckCircle className="h-3.5 w-3.5 text-primary group-hover:text-white transition-colors" />
                    </div>
                    <span className="text-gray-600 leading-relaxed text-sm">{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="relative rounded-3xl overflow-hidden shadow-elevated reveal-right img-zoom">
              <img
                src="/images/20260204_120452.jpg.jpeg"
                alt="Survey team in the field"
                className="w-full h-[300px] md:h-[500px] object-cover"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-secondary/60 via-transparent to-transparent" />
              <div className="absolute bottom-6 left-6 right-6">
                <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-4 flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center">
                    <Building className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <p className="text-white font-bold text-sm">{projects.length} Estates Completed</p>
                    <p className="text-white/50 text-xs">Across Lagos &amp; Nigeria</p>
                  </div>
                </div>
              </div>
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
          <span className="text-xs font-bold uppercase tracking-[0.2em] text-primary/70 mb-4 block" style={{ fontFamily: 'Inter, sans-serif' }}>Start Your Project</span>
          <h2 className="text-4xl md:text-5xl font-display font-bold text-white mb-6">Ready to add your estate to this list?</h2>
          <p className="text-white/60 max-w-2xl mx-auto mb-10 text-lg leading-relaxed">
            Whether you need a boundary survey for a single plot or a full estate layout for hundreds of plots, our team is ready.
            Contact us today for a professional consultation.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center w-full">
            <Link
              to="/contact"
              className="bg-primary text-white px-8 py-4 rounded-2xl font-bold text-sm uppercase tracking-wider shadow-primary-glow hover:bg-primary-dark hover:shadow-primary-glow-lg hover:-translate-y-1 transition-all duration-300 flex items-center justify-center gap-2 group w-full sm:w-[240px]"
            >
              Get a Free Quote <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              to="/services"
              className="border border-white/20 text-white/60 px-8 py-4 rounded-2xl font-bold text-sm uppercase tracking-wider hover:bg-white/10 hover:text-white hover:border-white/40 transition-all duration-300 flex items-center justify-center gap-2 group w-full sm:w-[240px]"
            >
              View Our Services <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Portfolio;
