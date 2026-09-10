import { useState } from 'react';
import { 
  Calculator, 
  MapPin, 
  Ruler, 
  CheckCircle, 
  WhatsappLogo, 
  ArrowRight, 
  ArrowLeft,
  X,
  FileText,
  ShieldCheck,
  Sparkle
} from '@phosphor-icons/react';

const locations = [
  { id: 'lagos-eti-osa', name: 'Lagos — Eti-Osa / Lekki / Victoria Island', multiplier: 1.35, zone: 'Prime Urban Zone' },
  { id: 'lagos-ibeju', name: 'Lagos — Ibeju-Lekki / Sangotedo / Eleko', multiplier: 1.15, zone: 'High Growth Corridor' },
  { id: 'lagos-epe', name: 'Lagos — Epe / Ketu / Alaro City Axis', multiplier: 1.05, zone: 'Emerging Estate Zone' },
  { id: 'lagos-mainland', name: 'Lagos — Mainland / Ikeja / Surulere', multiplier: 1.25, zone: 'Metropolitan Zone' },
  { id: 'lagos-ikorodu', name: 'Lagos — Ikorodu / Badagry', multiplier: 1.0, zone: 'Developing District' },
  { id: 'ogun', name: 'Ogun State — Mowe / Ofada / Sagamu / Simawa', multiplier: 0.9, zone: 'Interstate Hub' },
  { id: 'other', name: 'Other States across Nigeria', multiplier: 0.95, zone: 'Nationwide Network' }
];

const surveyTypes = [
  { 
    id: 'perimeter', 
    name: 'Registered Perimeter / Boundary Survey', 
    basePrice: 350000, 
    desc: 'Mandatory registered plan with SURCON seal, pillar beacons, and Surveyor General record copy lodgment.' 
  },
  { 
    id: 'topographic', 
    name: 'Topographical & Contour Survey', 
    basePrice: 280000, 
    desc: 'Detailed elevation models, contours, and spot heights for architectural, drainage & civil design.' 
  },
  { 
    id: 'layout', 
    name: 'Estate Layout Partitioning & Master Plan', 
    basePrice: 500000, 
    desc: 'Subdivision design, road alignment, boundary pillars, and plot-by-plot pegging for estates.' 
  },
  { 
    id: 'as-built', 
    name: 'As-Built Survey (Post-Construction)', 
    basePrice: 250000, 
    desc: 'Verification of erected buildings, underground utilities, and road reserves vs approved plans.' 
  },
  { 
    id: 'drone', 
    name: 'Drone UAV Orthophoto & Aerial Mapping', 
    basePrice: 400000, 
    desc: 'High-resolution geo-referenced orthomosaic images and Digital Elevation Models (DEM).' 
  }
];

const landSizes = [
  { id: '1-plot', name: '1 Plot (up to 600 – 650 sqm)', factor: 1.0 },
  { id: '2-3-plots', name: '2 to 3 Plots (1,200 – 1,800 sqm)', factor: 1.45 },
  { id: 'half-hectare', name: 'Half Hectare (Approx. 7 – 8 Plots)', factor: 2.1 },
  { id: '1-hectare', name: '1 Hectare (10,000 sqm / 15 Plots)', factor: 3.2 },
  { id: '2-5-hectares', name: '2 to 5 Hectares', factor: 5.5 },
  { id: 'estate-large', name: '10+ Hectares (Large Estate / Farmland)', factor: 9.0 }
];

const SurveyCostEstimator = ({ isOpen, onClose }) => {
  const [step, setStep] = useState(1);
  const [selectedLocation, setSelectedLocation] = useState(locations[1]);
  const [selectedType, setSelectedType] = useState(surveyTypes[0]);
  const [selectedSize, setSelectedSize] = useState(landSizes[0]);

  // Calculate estimated range
  const baseRate = selectedType.basePrice * selectedLocation.multiplier * selectedSize.factor;
  const minEstimate = Math.round(baseRate * 0.95 / 10000) * 10000;
  const maxEstimate = Math.round(baseRate * 1.15 / 10000) * 10000;

  const formatNaira = (amount) => {
    return new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', maximumFractionDigits: 0 }).format(amount);
  };

  const handleWhatsAppInquiry = () => {
    const text = `*Survey Cost Estimate Inquiry*\n\n` +
      `*Location:* ${selectedLocation.name}\n` +
      `*Survey Type:* ${selectedType.name}\n` +
      `*Land Size:* ${selectedSize.name}\n` +
      `*Estimated Range:* ${formatNaira(minEstimate)} – ${formatNaira(maxEstimate)}\n\n` +
      `Hello Sourceline, I used your online Survey Cost Estimator and would like to proceed with a formal stamped quotation for my site.`;

    const url = `https://wa.me/2348034618227?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
    if (onClose) onClose();
  };

  const content = (
    <div className="bg-white rounded-3xl overflow-hidden max-w-2xl w-full border border-gray-100 shadow-2xl relative">
      {/* Top Banner */}
      <div className="bg-secondary p-6 md:p-8 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 rounded-full blur-3xl pointer-events-none -translate-y-1/2 translate-x-1/3" />
        <div className="relative z-10 flex items-start justify-between">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-primary text-xs font-bold uppercase tracking-wider mb-3">
              <Sparkle className="h-3.5 w-3.5" /> Instant Fee Guide
            </div>
            <h3 className="text-2xl sm:text-3xl font-display font-bold">
              Survey Cost Estimator
            </h3>
            <p className="text-white/60 text-sm mt-1">
              Compliant with approved Nigerian NIS & SURCON scale of fees.
            </p>
          </div>
          {onClose && (
            <button 
              onClick={onClose}
              className="p-2 rounded-full text-white/60 hover:text-white hover:bg-white/10 transition"
            >
              <X className="h-5 w-5" />
            </button>
          )}
        </div>

        {/* Progress Dots */}
        <div className="flex items-center gap-2 mt-6">
          {[1, 2, 3, 4].map((s) => (
            <div 
              key={s} 
              className={`h-1.5 rounded-full transition-all duration-300 ${
                step === s ? 'w-8 bg-primary' : step > s ? 'w-4 bg-white/60' : 'w-4 bg-white/20'
              }`} 
            />
          ))}
        </div>
      </div>

      {/* Body */}
      <div className="p-6 md:p-8">
        {/* Step 1: Location */}
        {step === 1 && (
          <div className="space-y-4 animate-fade-in">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-primary">Step 1 of 3</span>
              <h4 className="text-xl font-bold text-gray-900 mt-0.5">Where is the land located?</h4>
              <p className="text-xs text-gray-500">Statutory beacon lodgment fees vary across state and local zones.</p>
            </div>

            <div className="grid grid-cols-1 gap-2.5 max-h-72 overflow-y-auto pr-1">
              {locations.map((loc) => (
                <button
                  key={loc.id}
                  onClick={() => setSelectedLocation(loc)}
                  className={`p-3.5 rounded-xl border text-left transition-all flex items-center justify-between ${
                    selectedLocation.id === loc.id
                      ? 'border-primary bg-primary/5 text-secondary font-semibold shadow-xs'
                      : 'border-gray-200 hover:border-gray-300 text-gray-700'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <MapPin className={`h-4 w-4 ${selectedLocation.id === loc.id ? 'text-primary' : 'text-gray-400'}`} />
                    <div>
                      <p className="text-sm font-medium">{loc.name}</p>
                      <span className="text-[11px] text-gray-400">{loc.zone}</span>
                    </div>
                  </div>
                  {selectedLocation.id === loc.id && (
                    <CheckCircle className="h-5 w-5 text-primary shrink-0" />
                  )}
                </button>
              ))}
            </div>

            <div className="pt-4 flex justify-end">
              <button
                onClick={() => setStep(2)}
                className="inline-flex items-center gap-2 px-6 py-2.5 bg-primary text-white rounded-xl text-sm font-bold shadow-primary-glow hover:bg-primary-dark transition"
              >
                Next Step <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Survey Type */}
        {step === 2 && (
          <div className="space-y-4 animate-fade-in">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-primary">Step 2 of 3</span>
              <h4 className="text-xl font-bold text-gray-900 mt-0.5">What type of survey is required?</h4>
              <p className="text-xs text-gray-500">Select the scope matching your physical and legal requirements.</p>
            </div>

            <div className="grid grid-cols-1 gap-2.5 max-h-72 overflow-y-auto pr-1">
              {surveyTypes.map((type) => (
                <button
                  key={type.id}
                  onClick={() => setSelectedType(type)}
                  className={`p-3.5 rounded-xl border text-left transition-all flex items-start justify-between ${
                    selectedType.id === type.id
                      ? 'border-primary bg-primary/5 text-secondary shadow-xs'
                      : 'border-gray-200 hover:border-gray-300 text-gray-700'
                  }`}
                >
                  <div className="pr-3">
                    <p className="text-sm font-bold text-gray-900">{type.name}</p>
                    <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">{type.desc}</p>
                  </div>
                  {selectedType.id === type.id && (
                    <CheckCircle className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                  )}
                </button>
              ))}
            </div>

            <div className="pt-4 flex justify-between">
              <button
                onClick={() => setStep(1)}
                className="inline-flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50"
              >
                <ArrowLeft className="h-4 w-4" /> Back
              </button>
              <button
                onClick={() => setStep(3)}
                className="inline-flex items-center gap-2 px-6 py-2.5 bg-primary text-white rounded-xl text-sm font-bold shadow-primary-glow hover:bg-primary-dark transition"
              >
                Next Step <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Land Size */}
        {step === 3 && (
          <div className="space-y-4 animate-fade-in">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-primary">Step 3 of 3</span>
              <h4 className="text-xl font-bold text-gray-900 mt-0.5">Estimated Land Size</h4>
              <p className="text-xs text-gray-500">Number of plots or acreage determines pillar counts and field days.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {landSizes.map((size) => (
                <button
                  key={size.id}
                  onClick={() => setSelectedSize(size)}
                  className={`p-3.5 rounded-xl border text-left transition-all ${
                    selectedSize.id === size.id
                      ? 'border-primary bg-primary/5 text-secondary font-semibold shadow-xs'
                      : 'border-gray-200 hover:border-gray-300 text-gray-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium">{size.name}</p>
                    {selectedSize.id === size.id && (
                      <CheckCircle className="h-4 w-4 text-primary shrink-0" />
                    )}
                  </div>
                </button>
              ))}
            </div>

            <div className="pt-4 flex justify-between">
              <button
                onClick={() => setStep(2)}
                className="inline-flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50"
              >
                <ArrowLeft className="h-4 w-4" /> Back
              </button>
              <button
                onClick={() => setStep(4)}
                className="inline-flex items-center gap-2 px-6 py-2.5 bg-primary text-white rounded-xl text-sm font-bold shadow-primary-glow hover:bg-primary-dark transition"
              >
                Calculate Fee Estimate <Calculator className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}

        {/* Step 4: Result Output & CTA */}
        {step === 4 && (
          <div className="space-y-6 animate-fade-in">
            <div className="bg-primary/5 border border-primary/20 rounded-2xl p-6 text-center">
              <span className="text-xs font-bold text-primary uppercase tracking-widest block mb-1">
                Estimated Professional & Statutory Fee
              </span>
              <div className="text-3xl sm:text-4xl font-display font-extrabold text-secondary mt-2">
                {formatNaira(minEstimate)} – {formatNaira(maxEstimate)}
              </div>
              <p className="text-xs text-gray-500 mt-2">
                Based on: <strong className="text-gray-700">{selectedType.name}</strong> for{' '}
                <strong className="text-gray-700">{selectedSize.name}</strong> in{' '}
                <strong className="text-gray-700">{selectedLocation.name}</strong>.
              </p>
            </div>

            {/* Inclusions */}
            <div className="space-y-2.5">
              <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block">
                Standard Deliverables Included:
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-gray-700">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4 text-emerald-600 shrink-0" />
                  <span>SURCON Registered Red Copy</span>
                </div>
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-emerald-600 shrink-0" />
                  <span>Surveyor General Record Lodgment</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-emerald-600 shrink-0" />
                  <span>Numbered Concrete Beacon Pillars</span>
                </div>
                <div className="flex items-center gap-2">
                  <Ruler className="h-4 w-4 text-emerald-600 shrink-0" />
                  <span>AutoCAD (DXF) & Coordinate Data</span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="pt-2 flex flex-col sm:flex-row gap-3">
              <button
                onClick={() => setStep(1)}
                className="px-4 py-3 border border-gray-200 rounded-xl text-sm font-semibold text-gray-600 hover:bg-gray-50 transition"
              >
                Recalculate
              </button>
              <button
                onClick={handleWhatsAppInquiry}
                className="flex-1 inline-flex items-center justify-center gap-2.5 px-6 py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-sm uppercase tracking-wider shadow-lg hover:shadow-xl transition"
              >
                <WhatsappLogo className="h-5 w-5" />
                Get Formal Quotation on WhatsApp
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  if (!isOpen && onClose) return null;

  if (onClose) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
        {content}
      </div>
    );
  }

  return content;
};

export default SurveyCostEstimator;
