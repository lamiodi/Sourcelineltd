import { useState } from 'react';
import { Envelope as Mail, Phone, MapPin, Plus, InstagramLogo as Instagram, ArrowRight, CheckCircle, PaperPlaneRight as Send, CaretDown, Copy, Check } from '@phosphor-icons/react';
import SEO from '../components/SEO';
import useScrollReveal from '../hooks/useScrollReveal';

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

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    setSuccess(false);
    setError(null);

    const reqId = generateReqId();

    // Format the WhatsApp message
    const text = `*New Survey Request [${reqId}]*\n\n*Name:* ${formData.name}\n*Email:* ${formData.email}\n*Phone:* ${formData.phone}\n*Survey Type:* ${formData.serviceType || 'Not specified'}\n*Project Location:* ${formData.location}\n*Land Size:* ${formData.landSize || 'Not specified'}\n*Additional Details:*\n${formData.message}`;

    // Open WhatsApp in a new tab
    const targetPhone = "2348034618227";
    const whatsappUrl = `https://wa.me/${targetPhone}?text=${encodeURIComponent(text)}`;
    window.open(whatsappUrl, '_blank');

    // Clear form and stop loading state
    setTimeout(() => {
      setSuccess(true);
      setFormData({ name: '', email: '', phone: '', serviceType: '', location: '', landSize: '', message: '' });
      setLoading(false);

      // Give success message a brief timeout
      setTimeout(() => setSuccess(false), 5000);
    }, 1000);
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
        title="Start Your Request"
        description="Get in touch with Sourceline Limited for your land surveying needs. Request a quote or visit our office in Lagos."
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
          <div className="inline-flex items-center gap-2.5 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-5 py-2.5 mb-8 animate-fade-in">
            <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            <span className="text-white/90 text-xs font-bold uppercase tracking-[0.15em]">Start Your Request</span>
          </div>
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-display font-bold text-white tracking-tight mb-6 leading-[1.05] animate-fade-in-up">
            Get a Professional<br />
            <span className="text-primary">Quotation</span>
          </h1>
          <p className="text-xl text-white/60 max-w-2xl mx-auto leading-relaxed animate-fade-in-up animation-delay-200">
            Fill out the form below with your project details. A representative will attend to you shortly with a structured quotation.
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
            <span className="text-xs font-bold uppercase tracking-[0.2em] text-primary/70 mb-3 block flex items-center gap-3" style={{ fontFamily: 'Inter, sans-serif' }}>
              <span className="inline-block w-6 h-px bg-gradient-to-r from-primary to-accent" />
              Send a Message
            </span>
            <h2 className="text-3xl font-display font-bold text-white mb-8 mt-2">Tell us about your project</h2>

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
                <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-400 font-medium text-sm animate-fade-in flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 shrink-0" />
                  WhatsApp opened! Please complete sending your message there.
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="bg-primary text-white px-10 py-4 rounded-2xl font-bold text-sm uppercase tracking-wider hover:bg-primary-dark transition-all duration-300 shadow-primary-glow hover:shadow-primary-glow-lg flex items-center justify-center gap-2.5 hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed group w-full sm:w-[240px]"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    Send message <Send className="h-4 w-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                  </>
                )}
              </button>
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
              We are ready to assist you with your land surveying and geoinformatics needs. Reach out to us for quotes, consultations, or general inquiries.
            </p>

            <div className="space-y-8">
              <a href="tel:+2348034618227" className="flex items-start gap-4 group">
                <div className="p-3.5 bg-primary/5 border border-primary/10 rounded-xl group-hover:bg-primary/10 group-hover:border-primary/30 transition-all duration-300">
                  <Phone className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-bold text-xs text-gray-400 uppercase tracking-wider mb-1.5" style={{ fontFamily: 'Inter, sans-serif' }}>Call Us</h3>
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
                  <h3 className="font-bold text-xs text-gray-400 uppercase tracking-wider mb-1.5" style={{ fontFamily: 'Inter, sans-serif' }}>Email Us</h3>
                  <a href="mailto:sourcelineltd@gmail.com" className="font-bold text-secondary group-hover:text-primary transition-colors block">sourcelineltd@gmail.com</a>
                </div>
              </div>

              <div className="flex items-start gap-4 group">
                <div className="p-3.5 bg-primary/5 border border-primary/10 rounded-xl group-hover:bg-primary/10 group-hover:border-primary/30 transition-all duration-300">
                  <MapPin className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-bold text-xs text-gray-400 uppercase tracking-wider mb-1.5" style={{ fontFamily: 'Inter, sans-serif' }}>Visit Us</h3>
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
              <span className="text-xs font-bold uppercase tracking-[0.2em] text-primary/70 mb-3 block flex items-center gap-3" style={{ fontFamily: 'Inter, sans-serif' }}>
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
            <span className="text-xs font-bold uppercase tracking-[0.2em] text-primary/70 mb-3 block" style={{ fontFamily: 'Inter, sans-serif' }}>Our Office</span>
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
            <span className="text-xs font-bold uppercase tracking-[0.2em] text-primary/70 mb-3 block flex items-center justify-center gap-3" style={{ fontFamily: 'Inter, sans-serif' }}>
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

            <div className="w-full flex justify-center reveal">
              <div className="bg-white rounded-2xl overflow-hidden shadow-lg w-full max-w-[400px] p-4">
                <blockquote class="instagram-media" data-instgrm-captioned data-instgrm-permalink="https://www.instagram.com/p/DOa5iWYAiDZ/?utm_source=ig_embed&amp;utm_campaign=loading" data-instgrm-version="14" style=" background:#FFF; border:0; border-radius:3px; box-shadow:0 0 1px 0 rgba(0,0,0,0.5),0 1px 10px 0 rgba(0,0,0,0.15); margin: 1px; max-width:540px; min-width:326px; padding:0; width:99.375%; width:-webkit-calc(100% - 2px); width:calc(100% - 2px);"><div style="padding:16px;"> <a href="https://www.instagram.com/p/DOa5iWYAiDZ/?utm_source=ig_embed&amp;utm_campaign=loading" style=" background:#FFFFFF; line-height:0; padding:0 0; text-align:center; text-decoration:none; width:100%;" target="_blank"> <div style=" display: flex; flex-direction: row; align-items: center;"> <div style="background-color: #F4F4F4; border-radius: 50%; flex-grow: 0; height: 40px; margin-right: 14px; width: 40px;"></div> <div style="display: flex; flex-direction: column; flex-grow: 1; justify-content: center;"> <div style=" background-color: #F4F4F4; border-radius: 4px; flex-grow: 0; height: 14px; margin-bottom: 6px; width: 100px;"></div> <div style=" background-color: #F4F4F4; border-radius: 4px; flex-grow: 0; height: 14px; width: 60px;"></div></div></div><div style="padding: 19% 0;"></div> <div style="display:block; height:50px; margin:0 auto 12px; width:50px;"><svg width="50px" height="50px" viewBox="0 0 60 60" version="1.1" xmlns="https://www.w3.org/2000/svg" xmlns:xlink="https://www.w3.org/1999/xlink"><g stroke="none" stroke-width="1" fill="none" fill-rule="evenodd"><g transform="translate(-511.000000, -20.000000)" fill="#000000"><g><path d="M556.869,30.41 C554.814,30.41 553.148,32.076 553.148,34.131 C553.148,36.186 554.814,37.852 556.869,37.852 C558.924,37.852 560.59,36.186 560.59,34.131 C560.59,32.076 558.924,30.41 556.869,30.41 M541,60.657 C535.114,60.657 530.342,55.887 530.342,50 C530.342,44.114 535.114,39.342 541,39.342 C546.887,39.342 551.658,44.114 551.658,50 C551.658,55.887 546.887,60.657 541,60.657 M541,33.886 C532.1,33.886 524.886,41.1 524.886,50 C524.886,58.899 532.1,66.113 541,66.113 C549.9,66.113 557.115,58.899 557.115,50 C557.115,41.1 549.9,33.886 541,33.886 M565.378,62.101 C565.244,65.022 564.756,66.606 564.346,67.663 C563.803,69.06 563.154,70.057 562.106,71.106 C561.058,72.155 560.06,72.803 558.662,73.347 C557.607,73.757 556.021,74.244 553.102,74.378 C549.944,74.521 548.997,74.552 541,74.552 C533.003,74.552 532.056,74.521 528.898,74.378 C525.979,74.244 524.393,73.757 523.338,73.347 C521.94,72.803 520.942,72.155 519.894,71.106 C518.846,70.057 518.197,69.06 517.654,67.663 C517.244,66.606 516.755,65.022 516.623,62.101 C516.479,58.943 516.448,57.996 516.448,50 C516.448,42.003 516.479,41.056 516.623,37.899 C516.755,34.978 517.244,33.391 517.654,32.338 C518.197,30.938 518.846,29.942 519.894,28.894 C520.942,27.846 521.94,27.196 523.338,26.654 C524.393,26.244 525.979,25.756 528.898,25.623 C532.057,25.479 533.004,25.448 541,25.448 C548.997,25.448 549.943,25.479 553.102,25.623 C556.021,25.756 557.607,26.244 558.662,26.654 C560.06,27.196 561.058,27.846 562.106,28.894 C563.154,29.942 563.803,30.938 564.346,32.338 C564.756,33.391 565.244,34.978 565.378,37.899 C565.522,41.056 565.552,42.003 565.552,50 C565.552,57.996 565.522,58.943 565.378,62.101 M570.82,37.631 C570.674,34.438 570.167,32.258 569.425,30.349 C568.659,28.377 567.633,26.702 565.965,25.035 C564.297,23.368 562.623,22.342 560.652,21.575 C558.743,20.834 556.562,20.326 553.369,20.18 C550.169,20.033 549.148,20 541,20 C532.853,20 531.831,20.033 528.631,20.18 C525.438,20.326 523.257,20.834 521.349,21.575 C519.376,22.342 517.703,23.368 516.035,25.035 C514.368,26.702 513.342,28.377 512.574,30.349 C511.834,32.258 511.326,34.438 511.181,37.631 C511.035,40.831 511,41.851 511,50 C511,58.147 511.035,59.17 511.181,62.369 C511.326,65.562 511.834,67.743 512.574,69.651 C513.342,71.625 514.368,73.296 516.035,74.965 C517.703,76.634 519.376,77.658 521.349,78.425 C523.257,79.167 525.438,79.673 528.631,79.82 C531.831,79.965 532.853,80.001 541,80.001 C549.148,80.001 550.169,79.965 553.369,79.82 C556.562,79.673 558.743,79.167 560.652,78.425 C562.623,77.658 564.297,76.634 565.965,74.965 C567.633,73.296 568.659,71.625 569.425,69.651 C570.167,67.743 570.674,65.562 570.82,62.369 C570.966,59.17 571,58.147 571,50 C571,41.851 570.966,40.831 570.82,37.631"></path></g></g></g></svg></div><div style="padding-top: 8px;"> <div style=" color:#3897f0; font-family:Arial,sans-serif; font-size:14px; font-style:normal; font-weight:550; line-height:18px;">View this post on Instagram</div></div><div style="padding: 12.5% 0;"></div> <div style="display: flex; flex-direction: row; margin-bottom: 14px; align-items: center;"><div> <div style="background-color: #F4F4F4; border-radius: 50%; height: 12.5px; width: 12.5px; transform: translateX(0px) translateY(7px);"></div> <div style="background-color: #F4F4F4; height: 12.5px; transform: rotate(-45deg) translateX(3px) translateY(1px); width: 12.5px; flex-grow: 0; margin-right: 14px; margin-left: 2px;"></div> <div style="background-color: #F4F4F4; border-radius: 50%; height: 12.5px; width: 12.5px; transform: translateX(9px) translateY(-18px);"></div></div><div style="margin-left: 8px;"> <div style=" background-color: #F4F4F4; border-radius: 50%; flex-grow: 0; height: 20px; width: 20px;"></div> <div style=" width: 0; height: 0; border-top: 2px solid transparent; border-left: 6px solid #f4f4f4; border-bottom: 2px solid transparent; transform: translateX(16px) translateY(-4px) rotate(30deg)"></div></div><div style="margin-left: auto;"> <div style=" width: 0px; border-top: 8px solid #F4F4F4; border-right: 8px solid transparent; transform: translateY(16px);"></div> <div style=" background-color: #F4F4F4; flex-grow: 0; height: 12px; width: 16px; transform: translateY(-4px);"></div> <div style=" width: 0; height: 0; border-top: 8px solid #F4F4F4; border-left: 8px solid transparent; transform: translateY(-4px) translateX(8px);"></div></div></div> <div style="display: flex; flex-direction: column; flex-grow: 1; justify-content: center; margin-bottom: 24px;"> <div style=" background-color: #F4F4F4; border-radius: 4px; flex-grow: 0; height: 14px; margin-bottom: 6px; width: 224px;"></div> <div style=" background-color: #F4F4F4; border-radius: 4px; flex-grow: 0; height: 14px; width: 144px;"></div></div></a><p style=" color:#c9c8cd; font-family:Arial,sans-serif; font-size:14px; line-height:17px; margin-bottom:0; margin-top:8px; overflow:hidden; padding:8px 0 7px; text-align:center; text-overflow:ellipsis; white-space:nowrap;"><a href="https://www.instagram.com/p/DOa5iWYAiDZ/?utm_source=ig_embed&amp;utm_campaign=loading" style=" color:#c9c8cd; font-family:Arial,sans-serif; font-size:14px; font-style:normal; font-weight:normal; line-height:17px; text-decoration:none;" target="_blank">A post shared by @sourcelinelimited</a></p></div></blockquote>
                <script async src="//www.instagram.com/embed.js"></script>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Contact;
