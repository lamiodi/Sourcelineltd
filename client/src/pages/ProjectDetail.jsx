import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, ArrowRight, MapPin, Ruler, CheckCircle, Buildings as Building, Camera } from '@phosphor-icons/react';
import SEO from '../components/SEO';
import { API_URL } from '../config';
import { projects as staticProjectsData } from '../data';

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

const ProjectDetail = () => {
    const { id } = useParams();
    const [project, setProject] = useState(null);
    const [projectsData, setProjectsData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeGalleryIndex, setActiveGalleryIndex] = useState(0);

    useScrollReveal();

    useEffect(() => {
        const fetchProjectData = async () => {
            setLoading(true);
            try {
                // Fetch the single project
                const projectRes = await fetch(`${API_URL}/projects/${id}`);
                if (projectRes.ok) {
                    const projectData = await projectRes.json();
                    setProject(projectData);
                } else {
                    // Fallback to static
                    const fallbackProject = staticProjectsData.find(p => String(p.id) === String(id));
                    if (fallbackProject) setProject(fallbackProject);
                    else throw new Error('Project not found');
                }

                // Fetch all projects to calculate next/prev and related
                const allRes = await fetch(`${API_URL}/projects`);
                if (allRes.ok) {
                    const allData = await allRes.json();
                    setProjectsData(allData);
                } else {
                    setProjectsData(staticProjectsData);
                }
            } catch (err) {
                // Complete fallback to static if API fails entirely
                const fallbackProject = staticProjectsData.find(p => String(p.id) === String(id));
                if (fallbackProject) {
                    setProject(fallbackProject);
                    setProjectsData(staticProjectsData);
                } else {
                    setError(err.message);
                }
            } finally {
                setLoading(false);
            }
        };

        fetchProjectData();
        window.scrollTo(0, 0);
        setActiveGalleryIndex(0);
    }, [id]);

    // Find previous and next projects for navigation
    const currentIndex = projectsData.findIndex(p => String(p.id) === String(id));
    const prevProject = currentIndex > 0 ? projectsData[currentIndex - 1] : null;
    const nextProject = currentIndex >= 0 && currentIndex < projectsData.length - 1 ? projectsData[currentIndex + 1] : null;

    // Get related projects (same category, excluding current)
    const relatedProjects = project
        ? projectsData.filter(p => p.category === project.category && p.id !== project.id).slice(0, 3)
        : [];

    if (loading) {
        return (
            <div className="font-sans min-h-[60vh] flex items-center justify-center bg-gray-50">
                <div className="animate-pulse flex flex-col items-center">
                    <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4"></div>
                    <p className="text-secondary font-medium">Loading project details...</p>
                </div>
            </div>
        );
    }

    if (!project) {
        return (
            <div className="font-sans min-h-[60vh] flex items-center justify-center bg-gray-50">
                <div className="text-center max-w-md px-4">
                    <div className="w-16 h-16 bg-red-50 text-red-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
                        <MapPin className="h-8 w-8" />
                    </div>
                    <h2 className="text-2xl font-display font-bold text-secondary mb-3">Project not found</h2>
                    <p className="text-gray-500 mb-8">The project you are looking for doesn&apos;t exist or has been moved.</p>
                    <Link to="/portfolio" className="inline-flex items-center gap-2 bg-secondary text-white px-6 py-3 rounded-xl font-bold text-sm uppercase tracking-wider hover:bg-primary transition-colors group">
                        <ArrowLeft className="h-4 w-4 transform group-hover:-translate-x-1 transition-transform" />
                        Back to Portfolio
                    </Link>
                </div>
            </div>
        );
    }

    const projectImage = project.image || '/images/project-placeholder.png';
    const placeholder = '/images/project-placeholder.png';

    // Build gallery: use project.gallery if available, otherwise create 7 slots
    const galleryImages = project.gallery && project.gallery.length > 0
        ? project.gallery
        : [projectImage, placeholder, placeholder, placeholder, placeholder, placeholder, placeholder];

    return (
        <div className="font-sans">
            <SEO
                title={project.title}
                description={project.description}
            />

            {/* ─── PAGE HERO ───────────────────────────────────────── */}
            <section className="relative py-20 md:py-28 overflow-hidden bg-secondary">
                <div className="absolute inset-0">
                    <img src={projectImage} alt={project.title}
                        className="w-full h-full object-cover opacity-20" />
                </div>
                <div className="absolute inset-0 bg-gradient-to-br from-secondary via-secondary/95 to-secondary-light" />
                <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-primary/10 rounded-full blur-[100px] translate-x-1/3 -translate-y-1/3 pointer-events-none" />

                <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6">
                    <Link to="/portfolio" className="inline-flex items-center gap-2 text-white/50 text-xs font-bold uppercase tracking-wider mb-8 hover:text-primary transition-colors group animate-fade-in">
                        <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" /> Back to Portfolio
                    </Link>

                    <div className="animate-fade-in-up">
                        <span className="inline-block bg-primary text-white text-xs font-bold px-4 py-1.5 rounded-xl uppercase tracking-wider mb-6">
                            {project.category}
                        </span>

                        <h1 className="text-4xl md:text-5xl lg:text-6xl font-display font-bold text-white tracking-tight leading-[1.1] mb-4">
                            {project.title}
                        </h1>

                        <div className="flex items-center gap-2 text-white/50 text-sm">
                            <MapPin className="h-4 w-4 text-primary" />
                            <span className="font-semibold">{project.location}</span>
                        </div>
                    </div>
                </div>
            </section>

            {/* ─── PROJECT GALLERY CAROUSEL ─────────────────────────── */}
            <section className="bg-white relative">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 -mt-8 relative z-10 reveal">
                    {/* Main Image */}
                    <div className="relative rounded-3xl overflow-hidden shadow-elevated group">
                        <img
                            src={galleryImages[activeGalleryIndex]}
                            alt={`${project.title} - Image ${activeGalleryIndex + 1}`}
                            className="w-full h-[300px] md:h-[500px] lg:h-[600px] object-cover transition-opacity duration-500"
                        />

                        {/* Image counter badge */}
                        <div className="absolute top-4 right-4 bg-black/50 backdrop-blur-sm text-white text-xs font-bold px-3 py-1.5 rounded-lg flex items-center gap-1.5">
                            <Camera className="h-3.5 w-3.5" />
                            {activeGalleryIndex + 1} / {galleryImages.length}
                        </div>

                        {/* Arrow Controls */}
                        <button
                            onClick={() => setActiveGalleryIndex(p => (p - 1 + galleryImages.length) % galleryImages.length)}
                            className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/80 backdrop-blur-sm rounded-xl flex items-center justify-center text-secondary hover:bg-white hover:scale-105 transition-all opacity-0 group-hover:opacity-100 shadow-md"
                            aria-label="Previous image"
                        >
                            <ArrowLeft className="h-4 w-4" />
                        </button>
                        <button
                            onClick={() => setActiveGalleryIndex(p => (p + 1) % galleryImages.length)}
                            className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/80 backdrop-blur-sm rounded-xl flex items-center justify-center text-secondary hover:bg-white hover:scale-105 transition-all opacity-0 group-hover:opacity-100 shadow-md"
                            aria-label="Next image"
                        >
                            <ArrowRight className="h-4 w-4" />
                        </button>
                    </div>

                    {/* Thumbnail Strip */}
                    <div className="flex gap-2 mt-4 overflow-x-auto pb-2 scrollbar-hide">
                        {galleryImages.map((img, idx) => (
                            <button
                                key={idx}
                                onClick={() => setActiveGalleryIndex(idx)}
                                className={`shrink-0 rounded-xl overflow-hidden border-2 transition-all duration-300 ${idx === activeGalleryIndex
                                        ? 'border-primary shadow-md scale-105'
                                        : 'border-transparent opacity-60 hover:opacity-100'
                                    }`}
                            >
                                <img
                                    src={img}
                                    alt={`${project.title} thumbnail ${idx + 1}`}
                                    className="w-20 h-14 md:w-24 md:h-16 object-cover"
                                />
                            </button>
                        ))}
                    </div>
                </div>
            </section>

            {/* ─── PROJECT DETAILS ──────────────────────────────────── */}
            <section className="py-16 md:py-24 bg-white relative overflow-hidden">
                <div className="absolute inset-0 bg-mesh-gradient pointer-events-none" />
                <div className="max-w-6xl mx-auto px-4 sm:px-6 relative">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 lg:gap-16">

                        {/* Main Content */}
                        <div className="lg:col-span-2 reveal-left">
                            <span className="section-label">About This Project</span>
                            <h2 className="text-3xl md:text-4xl font-display font-bold text-secondary mb-6 mt-3">Project Overview</h2>

                            <p className="text-gray-600 text-lg leading-relaxed mb-8">
                                {project.details || project.description}
                            </p>

                            {/* Scope of Work Summary */}
                            <div className="bg-primary/5 border-l-4 border-primary rounded-r-2xl p-6 mb-8">
                                <h3 className="text-sm font-bold uppercase tracking-wider text-primary mb-2">Scope of Work</h3>
                                <p className="text-gray-600 text-sm leading-relaxed">{project.description}</p>
                            </div>

                            {/* Services Delivered */}
                            <div className="bg-gray-50 rounded-2xl border border-gray-100 p-8 mb-8">
                                <h3 className="text-lg font-display font-bold text-secondary mb-5">Services Delivered</h3>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    {(project.services || [
                                        'Boundary Survey & Demarcation',
                                        'Topographic Mapping',
                                        'Beacon Placement & Verification',
                                        'Estate Layout & Setting Out',
                                        'Survey Plan Production',
                                        'Coordinate Charting',
                                    ]).map((item, i) => (
                                        <div key={i} className="flex items-center gap-3 group">
                                            <div className="w-5 h-5 bg-primary/10 rounded-full flex items-center justify-center shrink-0 group-hover:bg-primary transition-colors duration-300">
                                                <CheckCircle className="h-3 w-3 text-primary group-hover:text-white transition-colors" />
                                            </div>
                                            <span className="text-gray-600 text-sm">{item}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Sidebar */}
                        <div className="lg:col-span-1 reveal-right">
                            {/* Project Info Card */}
                            <div className="bg-gray-50 rounded-2xl border border-gray-100 p-8 mb-6">
                                <h3 className="text-lg font-display font-bold text-secondary mb-6">Project Details</h3>
                                <div className="space-y-5">
                                    <div className="flex items-start gap-3">
                                        <Building className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                                        <div>
                                            <p className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-1">Project Name</p>
                                            <p className="text-secondary font-semibold">{project.title}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-3">
                                        <MapPin className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                                        <div>
                                            <p className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-1">Location</p>
                                            <p className="text-secondary font-semibold">{project.location}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-3">
                                        <Ruler className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                                        <div>
                                            <p className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-1">Category</p>
                                            <p className="text-secondary font-semibold">{project.category}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* CTA Card */}
                            <div className="bg-secondary rounded-2xl p-8 relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 rounded-full blur-[40px] translate-x-1/2 -translate-y-1/2" />
                                <div className="relative z-10">
                                    <h3 className="text-xl font-display font-bold text-white mb-3">Have a similar project?</h3>
                                    <p className="text-white/50 text-sm leading-relaxed mb-6">
                                        Contact us to discuss your surveying requirements. We deliver accurate results on time.
                                    </p>
                                    <Link
                                        to="/contact"
                                        className="flex items-center justify-between w-full bg-primary text-white px-6 py-4 rounded-xl font-bold text-sm uppercase tracking-wider hover:bg-primary-dark transition-all duration-300 group"
                                    >
                                        <span>Get a Quote</span>
                                        <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                                    </Link>
                                </div>
                            </div>
                        </div>

                    </div>
                </div>
            </section>

            {/* ─── PROJECT NAVIGATION ───────────────────────────────── */}
            <section className="bg-gray-50 border-t border-gray-100">
                <div className="max-w-6xl mx-auto px-4 sm:px-6">
                    <div className="grid grid-cols-2">
                        {prevProject ? (
                            <Link to={`/portfolio/${prevProject.id}`} className="py-8 pr-6 group border-r border-gray-100 hover:bg-white transition-colors">
                                <span className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-2 block">Previous Project</span>
                                <p className="text-secondary font-display font-bold group-hover:text-primary transition-colors">{prevProject.title}</p>
                            </Link>
                        ) : (
                            <div className="py-8 pr-6 border-r border-gray-100" />
                        )}
                        {nextProject ? (
                            <Link to={`/portfolio/${nextProject.id}`} className="py-8 pl-6 text-right group hover:bg-white transition-colors">
                                <span className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-2 block">Next Project</span>
                                <p className="text-secondary font-display font-bold group-hover:text-primary transition-colors">{nextProject.title}</p>
                            </Link>
                        ) : (
                            <div className="py-8 pl-6" />
                        )}
                    </div>
                </div>
            </section>

            {/* ─── RELATED PROJECTS ─────────────────────────────────── */}
            {relatedProjects.length > 0 && (
                <section className="py-16 md:py-24 bg-white relative overflow-hidden">
                    <div className="absolute inset-0 bg-mesh-gradient pointer-events-none" />
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
                        <div className="text-center mb-14 reveal">
                            <span className="section-label justify-center">More Work</span>
                            <h2 className="text-3xl md:text-4xl font-display font-bold text-secondary mt-3">Related Projects</h2>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 stagger-children">
                            {relatedProjects.map((rp) => (
                                <Link key={rp.id} to={`/portfolio/${rp.id}`} className="reveal group">
                                    <div className="overflow-hidden rounded-2xl mb-4 relative">
                                        <img
                                            src={rp.image || '/images/project-placeholder.png'}
                                            alt={rp.title}
                                            className="w-full h-64 object-cover transition-transform duration-700 group-hover:scale-105"
                                            loading="lazy"
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-secondary/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                                    </div>
                                    <h3 className="text-lg font-display font-bold text-secondary group-hover:text-primary transition-colors">{rp.title}</h3>
                                    <div className="flex items-center text-gray-400 text-xs mt-1">
                                        <MapPin className="h-3 w-3 mr-1 text-primary" />
                                        <span className="font-semibold uppercase tracking-wide">{rp.location}</span>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </div>
                </section>
            )}
        </div>
    );
};

export default ProjectDetail;
