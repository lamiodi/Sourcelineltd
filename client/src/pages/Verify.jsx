import { ShieldCheck, ArrowSquareOut as ExternalLink, MapPin, Buildings as Building, Shield, CheckCircle } from '@phosphor-icons/react';
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

const Verify = () => {
  useScrollReveal();

  return (
    <div className="font-sans">
      <SEO
        title="Verify Us"
        description="Verify the legitimacy and registration of Sourceline Limited with CAC and SURCON."
      />

      {/* ─── PAGE HERO ───────────────────────────────────────── */}
      <section className="relative py-20 md:py-28 overflow-hidden bg-secondary">
        <div className="absolute inset-0">
          <div className="w-full h-full bg-secondary bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(249,115,22,0.15),rgba(255,255,255,0))]" />
        </div>
        <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-primary/10 rounded-full blur-[100px] translate-x-1/3 -translate-y-1/3 pointer-events-none" />
        <div className="absolute inset-0 opacity-[0.02]" style={{ backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize: '32px 32px' }} />

        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <div className="inline-flex items-center gap-2.5 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-5 py-2.5 mb-8 animate-fade-in">
            <Shield className="h-4 w-4 text-primary" />
            <span className="text-white/90 text-xs font-bold uppercase tracking-[0.15em]">Trust & Transparency</span>
          </div>
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-display font-bold text-white tracking-tight mb-6 leading-[1.05] animate-fade-in-up">
            Verify Our<br />
            <span className="text-primary italic font-medium">Legitimacy</span>
          </h1>
          <p className="text-xl text-white/50 max-w-2xl mx-auto leading-relaxed animate-fade-in-up animation-delay-200">
            Your trust is our priority. We believe in complete transparency. Verify our registration status and official details below.
          </p>
        </div>
      </section>

      {/* ─── VERIFICATION CONTENT ────────────────────────────── */}
      <div className="py-12 md:py-24 px-4 sm:px-6 lg:px-8 bg-gray-50 relative overflow-hidden">
        <div className="absolute inset-0 bg-mesh-gradient pointer-events-none opacity-50" />

        <div className="max-w-4xl mx-auto space-y-8 relative">

          {/* CAC Verification */}
          <div className="reveal bg-slate-50 p-8 md:p-10 rounded-3xl border border-slate-200 shadow-sm hover:shadow-md transition-all duration-500 group relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-[40px] translate-x-1/2 -translate-y-1/2" />

            <div className="flex flex-col md:flex-row gap-8 items-start relative z-10">
              <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center shrink-0 group-hover:bg-primary transition-colors duration-500">
                <Building className="h-8 w-8 text-primary group-hover:text-white transition-colors" />
              </div>
              <div className="flex-1">
                <h3 className="text-2xl font-display font-bold text-secondary mb-4">Corporate Affairs Commission (CAC)</h3>
                <p className="text-slate-600 leading-relaxed mb-6 max-w-prose">
                  Sourceline Limited is fully incorporated under the Companies and Allied Matters Act. Our business registration ensures we operate as a legal entity in Nigeria.
                </p>
                <div className="bg-white p-6 rounded-2xl mb-6 border border-slate-200 relative overflow-hidden shadow-sm">
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-primary to-accent" />
                  <div className="space-y-3">
                    <p className="text-slate-600 flex justify-between items-center pb-2 border-b border-slate-100">
                      <strong className="text-secondary text-sm uppercase tracking-wider font-mono">Company Name</strong>
                      <span className="font-medium font-mono text-sm">Sourceline Limited</span>
                    </p>
                    <p className="text-slate-600 flex justify-between items-center pt-1">
                      <strong className="text-secondary text-sm uppercase tracking-wider font-mono">RC Number</strong>
                      <span className="font-mono bg-slate-50 px-3 py-1 rounded-md border border-slate-200 text-sm font-bold text-secondary">RC-1478564</span>
                    </p>
                  </div>
                </div>
                <a
                  href="https://search.cac.gov.ng/home"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-primary hover:text-primary-dark transition-colors focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 rounded"
                >
                  Verify on CAC Portal <ExternalLink className="h-4 w-4" />
                </a>
              </div>
            </div>
          </div>

          {/* SURCON Verification */}
          <div className="reveal bg-slate-50 p-8 md:p-10 rounded-3xl border border-slate-200 shadow-sm hover:shadow-md transition-all duration-500 group relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-[40px] translate-x-1/2 -translate-y-1/2" />

            <div className="flex flex-col md:flex-row gap-8 items-start relative z-10">
              <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center shrink-0 group-hover:bg-primary transition-colors duration-500">
                <ShieldCheck className="h-8 w-8 text-primary group-hover:text-white transition-colors" />
              </div>
              <div className="flex-1">
                <h3 className="text-2xl font-display font-bold text-secondary mb-4">Surveyors Council of Nigeria (SURCON)</h3>
                <p className="text-slate-600 leading-relaxed mb-6 max-w-prose">
                  Our principal surveyor is fully registered and licensed to practice in Nigeria. We adhere strictly to the professional code of ethics and regulatory standards set by SURCON.
                </p>
                <div className="flex items-center gap-3 mb-6 p-4 bg-emerald-50 text-emerald-800 rounded-2xl border border-emerald-200 shadow-sm">
                  <CheckCircle className="h-5 w-5 shrink-0" />
                  <span className="font-mono font-medium text-sm">All our survey plans are fully lodged, signed, and stamped by our registered statutory surveyor.</span>
                </div>
                <a
                  href="https://surcon.gov.ng/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-primary hover:text-primary-dark transition-colors focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 rounded"
                >
                  Visit SURCON Website <ExternalLink className="h-4 w-4" />
                </a>
              </div>
            </div>
          </div>

          {/* Bank Account Information */}
          <div className="reveal bg-secondary p-8 md:p-10 rounded-3xl shadow-elevated relative overflow-hidden text-white group hover:-translate-y-1 transition-transform duration-500">
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-[60px] translate-x-1/3 -translate-y-1/3" />
            <div className="absolute inset-0 opacity-[0.02]" style={{ backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize: '24px 24px' }} />

            <div className="flex flex-col md:flex-row gap-8 items-start relative z-10">
              <div className="w-16 h-16 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl flex items-center justify-center shrink-0">
                <Shield className="h-8 w-8 text-primary" />
              </div>
              <div className="flex-1">
                <h3 className="text-2xl font-display font-bold text-white mb-4">Official Bank Account</h3>
                <p className="text-white/60 mb-8 leading-relaxed">
                  To prevent fraud, please note that all payments to Sourceline Limited are made <strong className="text-white bg-primary/20 px-2 py-0.5 rounded">ONLY</strong> to our official corporate account. We will never ask you to pay into a personal or third-party account.
                </p>

                <div className="bg-white/5 backdrop-blur-md p-6 rounded-2xl border border-white/10">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-primary/20 rounded-xl flex items-center justify-center shrink-0">
                      <ShieldCheck className="h-5 w-5 text-primary" />
                    </div>
                    <p className="text-white/80 text-sm font-medium leading-relaxed">
                      Official bank account details are provided securely on official invoices only.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Physical Office Verification */}
          <div className="reveal bg-white p-8 md:p-10 rounded-3xl border border-gray-100 shadow-sm hover:shadow-card-hover transition-all duration-500 hover:-translate-y-1 group relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-[40px] translate-x-1/2 -translate-y-1/2" />

            <div className="flex flex-col md:flex-row gap-8 items-start relative z-10">
              <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center shrink-0 group-hover:bg-primary transition-colors duration-500">
                <MapPin className="h-8 w-8 text-primary group-hover:text-white transition-colors" />
              </div>
              <div className="flex-1 w-full">
                <h3 className="text-2xl font-display font-bold text-secondary mb-4">Physical Office Verification</h3>
                <p className="text-gray-500 leading-relaxed mb-6">
                  Visit us at our registered office address. We encourage clients to schedule a visit to verify our physical presence and meet the team.
                </p>
                <div className="bg-gray-50 p-6 rounded-2xl mb-6 border border-gray-100">
                  <p className="text-secondary font-medium">SOURCELINE LTD, Crown Court Terrace Vintage Estate, behind Mobil petrol station, Sangotedo.</p>
                </div>

                {/* Embedded Map */}
                <div className="rounded-2xl overflow-hidden h-64 border border-gray-100 shadow-soft">
                  <iframe
                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d470.38595928655235!2d3.6503460481050913!3d6.470256893475849!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x103bf924880649df%3A0x1864f73713b6cef4!2sSOURCELINE%20LTD!5e1!3m2!1sen!2sus!4v1772708798013!5m2!1sen!2sus"
                    width="100%"
                    height="100%"
                    style={{ border: 0 }}
                    allowFullScreen=""
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    title="Sourceline Limited Location"
                  ></iframe>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Verify;
