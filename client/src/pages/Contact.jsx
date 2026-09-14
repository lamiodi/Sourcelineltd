import { useState } from 'react';
import { Envelope as Mail, Phone, MapPin, Plus, InstagramLogo as Instagram, ArrowRight, CheckCircle, PaperPlaneRight as Send, CaretDown, Copy, Check } from '@phosphor-icons/react';
import SEO from '../components/SEO';
import useScrollReveal from '../hooks/useScrollReveal';
import { API_URL } from '../config';

/* useScrollReveal imported from shared hooks */

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    serviceType: '',
    location: '',
    landSize: '',
    message: ''
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);
  const [submittedReq, setSubmittedReq] = useState(null);
  const [openFaq, setOpenFaq] = useState(null);
  const [copiedId, setCopiedId] = useState(null);
  useScrollReveal();

  const handleCopy = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const toggleFaq = (index) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  const generateReqId = () => {
    const year = new Date().getFullYear();
    const randomChars = Math.random().toString(36).substring(2, 6).toUpperCase();
    return `REQ-${year}-${randomChars}`;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSuccess(false);
    setError(null);

    const reqId = generateReqId();

    // 1. Submit lead asynchronously to backend API
    try {
      await fetch(`${API_URL}/contact`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          serviceType: formData.serviceType,
          location: formData.location,
          landSize: formData.landSize,
          message: `[Request ID: ${reqId}]\n${formData.message}`
        })
      });
    } catch (apiErr) {
      console.warn('[Contact] Backend submission note:', apiErr.message);
    }

    // 2. Format the WhatsApp message with Request ID
    const text = `*New Survey Request [${reqId}]*\n\n*Name:* ${formData.name}\n*Email:* ${formData.email}\n*Phone:* ${formData.phone || 'Not specified'}\n*Survey Type:* ${formData.serviceType || 'Not specified'}\n*Project Location:* ${formData.location}\n*Land Size:* ${formData.landSize || 'Not specified'}\n*Additional Details:*\n${formData.message}`;

    // 3. Attempt direct WhatsApp opening (with fallback in state for popup blockers)
    const targetPhone = "2348034618227";
    const whatsappUrl = `https://wa.me/${targetPhone}?text=${encodeURIComponent(text)}`;
    try {
      window.open(whatsappUrl, '_blank');
    } catch {
      // Ignored if blocked by browser
    }

    setSubmittedReq({ id: reqId, url: whatsappUrl });
    setSuccess(true);
    setFormData({ name: '', email: '', phone: '', serviceType: '', location: '', landSize: '', message: '' });
    setLoading(false);
  };

  const faqs = [
    {
      question: "How many years of experience does Sourceline have?",
      answer: "We have over 10 years of experience delivering precision surveying and geoinformatics services across Nigeria."
    },
    {
      question: "How big is your team?",
      answer: "Our team consists of over 20 professionals, including a SURCON-registered surveyor, GIS specialists, survey technologists, and field engineers."
    },
    {
      question: "Do you have case studies of past successful projects?",
      answer: "Yes, please visit our Portfolio page to see detailed case studies of our residential, commercial, and infrastructure projects."
    },
    {
      question: "Does Sourceline have a project minimum?",
      answer: "We handle projects of all sizes, from single plot boundary surveys to large-scale engineering and mapping projects."
    }
  ];

  return (
    <div className="font-sans">
      <SEO
        title="Make an Enquiry | Sourceline Limited"
        description="Request statutory land verification and cadastral survey consultation from Sourceline Limited. Practice supervised by Surv. Fajimi S. Adebayo (SURCON No. 5073, mnis). Office in Sangotedo, Lagos."
      />

      {/* ─── PAGE HERO ───────────────────────────────────────── */}
      <section className="relative py-20 md:py-32 overflow-hidden bg-secondary">
        <div className="absolute inset-0">
          <img
            src="/images/dji_fly_20260128_125236_0_1769601156568_photo_low_quality.jpg.jpeg"
            alt="Contact Hero"
            className="w-full h-full object-cover opacity-15 animate-ken-burns"
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-br from-secondary via-secondary/95 to-secondary-light" />
        <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-primary/10 rounded-full blur-[100px] translate-x-1/3 -translate-y-1/3 pointer-events-none" />
        <div className="absolute inset-0 opacity-[0.02]" style={{ backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize: '32px 32px' }} />

        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <div className="inline-flex items-center gap-2.5 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-5 py-2 mb-6 animate-fade-in">
            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-white/90 text-xs font-mono tracking-wider uppercase">Direct Survey Consultation</span>
          </div>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-display font-bold text-white tracking-tight mb-5 leading-[1.1] animate-fade-in-up">
            Consult on Your Parcel.<br />
            <span className="text-primary">Protect Your Land Assets.</span>
          </h1>
          <p className="text-lg md:text-xl text-white/70 max-w-2xl mx-auto leading-relaxed animate-fade-in-up animation-delay-200">
            Provide your parcel location or project scope below. Our licensed survey team reviews your coordinates, examines statutory zoning, and advises you on the precise cadastral procedure.
          </p>
        </div>
      </section>

      {/* ─── FORM + INFO SPLIT ───────────────────────────────── */}
      <div className="flex flex-col lg:flex-row">
        {/* Left: Form (Dark Background) */}
        <div className="lg:w-1/2 bg-secondary px-6 py-12 md:py-20 lg:px-20 lg:py-28 relative overflow-hidden">
          {/* Decorative Elements */}
          <div className="absolute top-0 left-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2 pointer-events-none" />
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl translate-x-1/3 translate-y-1/3 pointer-events-none" />
          <div className="absolute inset-0 opacity-[0.015]" style={{ backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize: '32px 32px' }} />

          <div className="relative z-10 max-w-lg mx-auto lg:mx-0">
            <span className="text-xs font-bold uppercase tracking-[0.2em] text-primary/70 mb-3 block flex items-center gap-3">
              <span className="inline-block w-6 h-px bg-gradient-to-r from-primary to-accent" />
              Direct Engagement
            </span>
            <h2 className="text-3xl font-display font-bold text-white mb-2">Request Land Verification</h2>
            <p className="text-white/50 text-xs mb-8">
              Submit your property details or survey scope for statutory review by our registered survey office in Sangotedo, Lagos.
            </p>

            <form className="space-y-6" onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="group">
                  <label htmlFor="name" className="block text-xs font-bold text-white/40 mb-2 uppercase tracking-wider group-focus-within:text-primary transition-colors">Full name</label>
                  <input
                    type="text"
                    id="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    placeholder="John Carter"
                    className="input-float"
                  />
                </div>
                <div className="group">
                  <label htmlFor="email" className="block text-xs font-bold text-white/40 mb-2 uppercase tracking-wider group-focus-within:text-primary transition-colors">Email address</label>
                  <input
                    type="email"
                    id="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    placeholder="example@email.com"
                    className="input-float"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="group">
                  <label htmlFor="phone" className="block text-xs font-bold text-white/40 mb-2 uppercase tracking-wider group-focus-within:text-primary transition-colors">Phone number</label>
                  <input
                    type="tel"
                    id="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="(123) 456 - 789"
                    className="input-float"
                  />
                </div>
                <div className="group">
                  <label htmlFor="serviceType" className="block text-xs font-bold text-white/40 mb-2 uppercase tracking-wider group-focus-within:text-primary transition-colors">Type of Survey Required</label>
                  <div className="relative">
                    <select
                      id="serviceType"
                      value={formData.serviceType}
                      onChange={handleChange}
                      required
                      className="input-float bg-transparent appearance-none w-full text-white cursor-pointer"
                    >
                      <option value="" disabled className="bg-secondary text-white/50">Select a service</option>
                      <option value="Land Surveying" className="bg-secondary text-white">Land Surveying</option>
                      <option value="Engineering Survey" className="bg-secondary text-white">Engineering Survey</option>
                      <option value="Digital Mapping" className="bg-secondary text-white">Digital Mapping</option>
                      <option value="GIS & Property Consultancy" className="bg-secondary text-white">GIS & Property Consultancy</option>
                      <option value="Other" className="bg-secondary text-white">Other</option>
                    </select>
                    <CaretDown className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40 pointer-events-none group-focus-within:text-primary transition-colors" />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="group">
                  <label htmlFor="location" className="block text-xs font-bold text-white/40 mb-2 uppercase tracking-wider group-focus-within:text-primary transition-colors">Project Location</label>
                  <input
                    type="text"
                    id="location"
                    value={formData.location}
                    onChange={handleChange}
                    required
                    placeholder="e.g. Sangotedo, Lagos"
                    className="input-float"
                  />
                </div>
                <div className="group">
                  <label htmlFor="landSize" className="block text-xs font-bold text-white/40 mb-2 uppercase tracking-wider group-focus-within:text-primary transition-colors">Land Size (if available)</label>
                  <input
                    type="text"
                    id="landSize"
                    value={formData.landSize}
                    onChange={handleChange}
                    placeholder="e.g. 2 Plots, 1 Hectare"
                    className="input-float"
                  />
                </div>
              </div>

              <div className="group">
                <label htmlFor="message" className="block text-xs font-bold text-white/40 mb-2 uppercase tracking-wider group-focus-within:text-primary transition-colors">Additional Details</label>
                <textarea
                  id="message"
                  rows="4"
                  value={formData.message}
                  onChange={handleChange}
                  placeholder="Provide any other relevant details..."
                  className="input-float resize-none"
                ></textarea>
              </div>

              {error && (
                <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 font-medium text-sm animate-fade-in flex items-center gap-2">
                  <span className="w-2 h-2 bg-red-400 rounded-full shrink-0" />
                  {error}
                </div>
              )}
              {success && (
                <div className="p-6 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl text-emerald-300 font-medium text-sm animate-fade-in space-y-3">
                  <div className="flex items-center gap-2 font-bold text-emerald-400 text-base">
                    <CheckCircle className="h-5 w-5 shrink-0" />
                    Survey Brief Submitted Successfully!
                  </div>
                  <p className="text-white/80 text-xs leading-relaxed">
                    Your official inquiry reference is <span className="font-mono font-bold text-primary bg-white/10 px-2 py-0.5 rounded">{submittedReq?.id || 'SUBMITTED'}</span>. A registered surveyor has received your brief.
                  </p>
                  {submittedReq?.url && (
                    <div className="pt-1">
                      <a
                        href={submittedReq.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs uppercase tracking-wider px-5 py-3 rounded-xl transition-all shadow-lg shadow-emerald-900/30 hover:-translate-y-0.5"
                      >
                        <Send className="h-4 w-4" /> Open Brief in WhatsApp
                      </a>
                    </div>
                  )}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="bg-primary text-white px-10 py-4 rounded-2xl font-bold text-sm uppercase tracking-wider hover:bg-primary-dark transition-all duration-300 shadow-primary-glow hover:shadow-primary-glow-lg flex items-center justify-center gap-2.5 hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed group w-full sm:w-[260px]"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    Request Land Verification <Send className="h-4 w-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                  </>
                )}
              </button>

              <p className="text-[11px] text-white/40 leading-relaxed font-mono pt-1">
                * All project fee determinations comply with the approved Scale of Mandatory Minimum Professional Fees established by SURCON and the Nigerian Institution of Surveyors (NIS).
              </p>
            </form>
          </div>
        </div>

        {/* Right: Info (White Background) */}
        <div className="lg:w-1/2 bg-white px-6 py-12 md:py-20 lg:px-20 lg:py-28 flex flex-col justify-center relative">
          <div className="absolute inset-0 bg-mesh-gradient pointer-events-none opacity-50" />
          <div className="max-w-md relative">
            <span className="section-label">Contact Info</span>
            <h2 className="text-4xl md:text-5xl font-display font-bold text-secondary mb-4 mt-3">Contact us</h2>
            <p className="text-gray-500 mb-12 leading-relaxed">
              We are ready to assist you with your land surveying and geoinformatics needs. Reach out to us for technical consultations, project briefs, or boundary verification inquiries.
            </p>

            <div className="space-y-8">
              <a href="tel:+2348034618227" className="flex items-start gap-4 group">
                <div className="p-3.5 bg-primary/5 border border-primary/10 rounded-xl group-hover:bg-primary/10 group-hover:border-primary/30 transition-all duration-300">
                  <Phone className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-bold text-xs text-gray-400 uppercase tracking-wider mb-1.5">Call Us</h3>
                  <div className="flex items-center gap-3 group/phone mb-2">
                    <p className="font-bold text-secondary group-hover:text-primary transition-colors">+234 803 461 8227</p>
                    <button 
                      onClick={() => handleCopy('+2348034618227', 'p1')}
                      className="p-1.5 rounded-lg bg-gray-50 hover:bg-primary/10 text-gray-400 hover:text-primary transition-all active:scale-90"
                    >
                      {copiedId === 'p1' ? <Check className="h-3.5 w-3.5 text-green-500" /> : <Copy className="h-3.5 w-3.5" />}
                    </button>
                  </div>
                  <div className="flex items-center gap-3 group/phone">
                    <p className="font-semibold text-secondary/70 text-sm">+234 805 985 4911</p>
                    <button 
                      onClick={() => handleCopy('+2348059854911', 'p2')}
                      className="p-1 rounded-md bg-gray-50 hover:bg-primary/10 text-gray-400 hover:text-primary transition-all active:scale-90"
                    >
                      {copiedId === 'p2' ? <Check className="h-3 w-3 text-green-500" /> : <Copy className="h-3 w-3" />}
                    </button>
                  </div>
                </div>
              </a>

              <div className="flex items-start gap-4 group">
                <div className="p-3.5 bg-primary/5 border border-primary/10 rounded-xl group-hover:bg-primary/10 group-hover:border-primary/30 transition-all duration-300">
                  <Mail className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-bold text-xs text-gray-400 uppercase tracking-wider mb-1.5">Email Us</h3>
                  <a href="mailto:sourcelineltd@gmail.com" className="font-bold text-secondary group-hover:text-primary transition-colors block">sourcelineltd@gmail.com</a>
                </div>
              </div>

              <div className="flex items-start gap-4 group">
                <div className="p-3.5 bg-primary/5 border border-primary/10 rounded-xl group-hover:bg-primary/10 group-hover:border-primary/30 transition-all duration-300">
                  <MapPin className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-bold text-xs text-gray-400 uppercase tracking-wider mb-1.5">Visit Us</h3>
                  <p className="font-bold text-secondary max-w-xs leading-relaxed">
                    SOURCELINE LTD, Crown Court Terrace Vintage Estate, behind Mobil petrol station, Sangotedo.
                  </p>
                </div>
              </div>

              {/* Embedded Map */}
              <div className="rounded-2xl overflow-hidden h-64 border border-gray-100 shadow-soft hover:shadow-card transition-shadow duration-500">
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

      {/* ─── FAQ Section ─────────────────────────────────────── */}
      <section className="bg-secondary py-12 md:py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-secondary via-secondary-light to-secondary opacity-80 pointer-events-none" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-[80px] translate-x-1/3 -translate-y-1/3 pointer-events-none" />
        <div className="absolute inset-0 opacity-[0.015]" style={{ backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize: '32px 32px' }} />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="flex flex-col lg:flex-row gap-10 lg:gap-16">
            <div className="lg:w-1/3 reveal">
              <span className="text-xs font-bold uppercase tracking-[0.2em] text-primary/70 mb-3 block flex items-center gap-3">
                <span className="inline-block w-6 h-px bg-gradient-to-r from-primary to-accent" />
                FAQ
              </span>
              <h2 className="text-4xl font-display font-bold text-white mt-2">Frequently<br /> asked questions</h2>
            </div>
            <div className="lg:w-2/3 space-y-4">
              {faqs.map((faq, idx) => (
                <div key={idx} className={`border border-white/10 rounded-lg transition-colors ${openFaq === idx ? 'bg-white/10' : 'bg-white/5 hover:bg-white/10'}`}>
                  <button
                    onClick={() => toggleFaq(idx)}
                    className="w-full flex justify-between items-center px-6 py-5 text-left focus:outline-none"
                  >
                    <span className="text-base font-medium text-white">{faq.question}</span>
                    <Plus className={`h-5 w-5 text-gray-400 shrink-0 transform transition-transform duration-200 ${openFaq === idx ? 'rotate-45 text-white' : ''}`} />
                  </button>
                  {openFaq === idx && (
                    <div className="px-6 pb-6 text-gray-300 text-sm leading-relaxed border-t border-white/10 pt-4">
                      {faq.answer}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ─── Office Section ──────────────────────────────────── */}
      <section className="bg-secondary py-12 md:py-24 relative border-t border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16 reveal">
            <span className="text-xs font-bold uppercase tracking-[0.2em] text-primary/70 mb-3 block">Our Office</span>
            <h2 className="text-4xl font-display font-bold text-white mt-2">Visit our office</h2>
          </div>

          <div className="max-w-lg mx-auto reveal">
            <div className="bg-white/5 p-5 rounded-2xl border border-white/10 hover:bg-white/8 hover:border-white/20 transition-all duration-500 group">
              <div className="rounded-xl overflow-hidden mb-6 img-zoom">
                <img
                  src="/images/WhatsApp Image 2026-03-26 at 1.35.09 PM.jpeg"
                  alt="Lagos Office"
                  className="w-full h-80 object-cover transition-all duration-700"
                />
              </div>
              <div className="flex justify-between items-end">
                <div>
                  <h3 className="text-xl font-display font-bold text-white mb-1">Lagos, Nigeria</h3>
                  <p className="text-white/40 text-sm max-w-xs leading-relaxed">
                    SOURCELINE LTD, Crown Court Terrace Vintage Estate, behind Mobil petrol station, Sangotedo.
                  </p>
                </div>
                <div className="w-10 h-10 bg-primary/20 rounded-xl flex items-center justify-center group-hover:bg-primary transition-colors shrink-0">
                  <ArrowRight className="h-5 w-5 text-primary group-hover:text-white -rotate-45 transition-colors" />
                </div>
              </div>
              <div className="mt-6 space-y-2 border-t border-white/10 pt-6">
                <p className="text-sm text-white/40"><span className="font-bold text-white/60">Email:</span> sourcelineltd@gmail.com</p>
                <p className="text-sm text-white/40"><span className="font-bold text-white/60">Phone:</span> +234 803 461 8227</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Social Media Section ────────────────────────────── */}
      <section className="bg-secondary py-12 md:py-24 relative border-t border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col items-center text-center">
          <div className="mb-16 reveal flex flex-col items-center">
            <span className="text-xs font-bold uppercase tracking-[0.2em] text-primary/70 mb-3 block flex items-center justify-center gap-3">
              <span className="inline-block w-6 h-px bg-gradient-to-r from-primary to-accent" />
              Follow Us
              <span className="inline-block w-6 h-px bg-gradient-to-l from-primary to-accent" />
            </span>
            <h2 className="text-4xl font-display font-bold text-white mt-2">Follow our work on <br /> social media</h2>
          </div>

          <div className="w-full max-w-5xl grid grid-cols-1 md:grid-cols-3 gap-8 items-center">
            <div className="w-full max-w-sm mx-auto">
              {[
                { icon: Instagram, name: "Instagram", desc: "See our latest project photos and behind-the-scenes.", link: "https://www.instagram.com/sourcelinelimited?igsh=MWlrOTJwMDlkZmJuNg==" },
              ].map((social, idx) => (
                <a key={idx} href={social.link} target="_blank" rel="noopener noreferrer" className="reveal group bg-white/5 border border-white/10 rounded-2xl p-6 hover:bg-white/10 hover:border-primary/30 transition-all duration-500 block text-left">
                  <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-4 group-hover:bg-primary transition-all duration-300">
                    <social.icon className="h-6 w-6 text-primary group-hover:text-white transition-colors" />
                  </div>
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="font-bold text-lg text-white">{social.name}</h3>
                    <ArrowRight className="h-4 w-4 text-white/30 group-hover:text-primary transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 transition-all" />
                  </div>
                  <p className="text-sm text-white/40 leading-relaxed">{social.desc}</p>
                </a>
              ))}
            </div>

            <div className="w-full flex justify-center reveal">
              <div className="bg-white rounded-2xl overflow-hidden shadow-lg w-full max-w-[400px]">
                <iframe 
                  src="https://www.instagram.com/p/DOa5iWYAiDZ/embed" 
                  width="100%" 
                  height="480" 
                  frameBorder="0" 
                  scrolling="no" 
                  allowTransparency="true"
                  className="w-full border-0"
                  title="Instagram Post"
                ></iframe>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Contact;
