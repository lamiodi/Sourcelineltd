import { Shield, Lock, FileText, ArrowLeft } from '@phosphor-icons/react';
import { Link } from 'react-router-dom';
import SEO from '../components/SEO';
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

const Privacy = () => {
  useScrollReveal();

  return (
    <div className="font-sans">
      <SEO
        title="Privacy Policy"
        description="Privacy Policy for Sourceline Limited. How we collect, use, and protect your data."
        keywords="privacy policy, data protection, sourceline terms"
      />

      {/* ─── PAGE HERO ───────────────────────────────────────── */}
      <section className="relative py-20 md:py-28 overflow-hidden bg-secondary">
        <div className="absolute inset-0 bg-gradient-to-br from-secondary via-secondary/95 to-secondary-light" />
        <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-primary/10 rounded-full blur-[100px] translate-x-1/3 -translate-y-1/3 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-72 h-72 bg-primary/5 rounded-full blur-[80px] -translate-x-1/3 translate-y-1/3 pointer-events-none" />
        <div className="absolute inset-0 opacity-[0.02]" style={{ backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize: '32px 32px' }} />

        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <div className="inline-flex items-center gap-2.5 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-5 py-2.5 mb-8 animate-fade-in">
            <Lock className="h-4 w-4 text-primary" />
            <span className="text-white/90 text-xs font-bold uppercase tracking-[0.15em]">Legal</span>
          </div>
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-display font-bold text-white tracking-tight mb-6 leading-[1.05] animate-fade-in-up">
            Privacy <span className="text-primary italic font-medium">Policy</span>
          </h1>
          <p className="text-xl text-white/50 max-w-2xl mx-auto leading-relaxed animate-fade-in-up animation-delay-200">
            We value your trust and are committed to protecting your personal information. Read how we collect, use, and protect your data.
          </p>
          <p className="text-sm font-bold uppercase tracking-wider text-white/30 mt-8 animate-fade-in-up animation-delay-300">
            Last Updated: February 2026
          </p>
        </div>
      </section>

      {/* ─── CONTENT ─────────────────────────────────────────── */}
      <div className="py-12 md:py-24 px-4 sm:px-6 lg:px-8 bg-gray-50 relative overflow-hidden">
        <div className="absolute inset-0 bg-mesh-gradient pointer-events-none opacity-50" />

        <div className="max-w-4xl mx-auto space-y-12 relative z-10">

          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8 md:p-14 space-y-12 reveal-scale">

            <section>
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center shrink-0">
                  <FileText className="h-6 w-6 text-primary" />
                </div>
                <h2 className="text-2xl font-display font-bold text-secondary">Information We Collect</h2>
              </div>
              <div className="prose text-gray-500 leading-relaxed ml-0 md:ml-16">
                <p className="mb-4">
                  At Sourceline Limited, we collect information that is necessary to provide you with our surveying and geoinformatics services. This includes:
                </p>
                <ul className="space-y-3 list-none p-0">
                  <li className="flex items-start gap-3">
                    <span className="w-2 h-2 mt-2 bg-primary/50 rounded-full shrink-0" />
                    <span><strong className="text-secondary font-bold">Personal Identification:</strong> Name, email address, phone number, and physical address provided via our contact forms.</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="w-2 h-2 mt-2 bg-primary/50 rounded-full shrink-0" />
                    <span><strong className="text-secondary font-bold">Project Details:</strong> Information regarding land location, size, and specific survey requirements.</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="w-2 h-2 mt-2 bg-primary/50 rounded-full shrink-0" />
                    <span><strong className="text-secondary font-bold">Usage Data:</strong> Information on how you access and use our website, including device type and browser version.</span>
                  </li>
                </ul>
              </div>
            </section>

            <div className="w-full h-px bg-gray-100 my-8"></div>

            <section>
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center shrink-0">
                  <Shield className="h-6 w-6 text-primary" />
                </div>
                <h2 className="text-2xl font-display font-bold text-secondary">How We Use Your Information</h2>
              </div>
              <div className="prose text-gray-500 leading-relaxed ml-0 md:ml-16">
                <p className="mb-4">
                  We use the collected data for various professional purposes:
                </p>
                <ul className="space-y-3 list-none p-0">
                  <li className="flex items-start gap-3">
                    <span className="w-4 h-4 mt-1 bg-green-100 text-green-600 rounded flex items-center justify-center text-[10px] shrink-0">✓</span>
                    To provide and maintain our surveying services.
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="w-4 h-4 mt-1 bg-green-100 text-green-600 rounded flex items-center justify-center text-[10px] shrink-0">✓</span>
                    To notify you about changes to our Service.
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="w-4 h-4 mt-1 bg-green-100 text-green-600 rounded flex items-center justify-center text-[10px] shrink-0">✓</span>
                    To provide customer support and respond to your inquiries.
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="w-4 h-4 mt-1 bg-green-100 text-green-600 rounded flex items-center justify-center text-[10px] shrink-0">✓</span>
                    To gather analysis or valuable information so that we can improve our Service.
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="w-4 h-4 mt-1 bg-green-100 text-green-600 rounded flex items-center justify-center text-[10px] shrink-0">✓</span>
                    To monitor the usage of our Service securely.
                  </li>
                </ul>
              </div>
            </section>

            <div className="w-full h-px bg-gray-100 my-8"></div>

            <section>
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center shrink-0">
                  <Lock className="h-6 w-6 text-primary" />
                </div>
                <h2 className="text-2xl font-display font-bold text-secondary">Data Security</h2>
              </div>
              <div className="prose text-gray-500 leading-relaxed ml-0 md:ml-16">
                <p className="mb-4">
                  The security of your data is paramount to us. We implement appropriate technical, physical, and organizational measures to protect your personal data against unauthorized access, alteration, disclosure, or destruction. We treat your land data with the strict confidentiality expected in the surveying profession.
                </p>
                <p>
                  However, please remember that no method of transmission over the Internet, or method of electronic storage is 100% secure. While we strive to use commercially acceptable means to protect your Personal Data, we cannot guarantee its absolute security.
                </p>
              </div>
            </section>

            <div className="w-full h-px bg-gray-100 my-8"></div>

            <section>
              <h2 className="text-2xl font-display font-bold text-secondary mb-4 ml-0 md:ml-16">Third-Party Services</h2>
              <div className="prose text-gray-500 leading-relaxed ml-0 md:ml-16">
                <p>
                  We may employ third-party companies and individuals to facilitate our Service, to provide the Service on our behalf, to perform Service-related services, or to assist us in analyzing how our Service is used. These third parties have access to your Personal Data only to perform these tasks on our behalf and are obligated not to disclose or use it for any other purpose.
                </p>
              </div>
            </section>

            <div className="w-full h-px bg-gray-100 my-8"></div>

            <section>
              <h2 className="text-2xl font-display font-bold text-secondary mb-4 ml-0 md:ml-16">Contact Us</h2>
              <div className="prose text-gray-500 leading-relaxed ml-0 md:ml-16">
                <p className="mb-4">
                  If you have any questions about this Privacy Policy, please contact us immediately:
                </p>
                <div className="mt-8 pt-8 border-t border-gray-100 flex flex-col md:flex-row gap-6">
                  <div>
                    <h4 className="font-bold text-secondary mb-1">Email</h4>
                    <a href="mailto:sourcelineltd@gmail.com" className="text-primary font-medium hover:underline">sourcelineltd@gmail.com</a>
                  </div>
                  <div>
                    <h4 className="font-bold text-secondary mb-1">Phone</h4>
                    <a href="tel:+2348165683949" className="font-medium text-gray-600 hover:text-primary transition-colors">+234 816 568 3949</a>
                  </div>
                  <div>
                    <h4 className="font-bold text-secondary mb-1">Office</h4>
                    <p className="text-gray-500">Crown Court Terrace Vintage Estate, Sangotedo, Lagos State.</p>
                  </div>
                </div>
              </div>
            </section>

            <div className="ml-0 md:ml-16 mt-12">
              <Link to="/" className="inline-flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-gray-400 hover:text-primary transition-colors group">
                <ArrowLeft className="h-4 w-4 transform group-hover:-translate-x-1 transition-transform" />
                Back to Home
              </Link>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default Privacy;