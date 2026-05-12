import { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { ChatTeardropText as MessageSquare, Compass, Database, FileText as FileCheck } from '@phosphor-icons/react';

const steps = [
  {
    icon: MessageSquare,
    title: 'Consultation',
    description: 'We begin with a detailed discussion of your project requirements, objective, and legal status. Our team prepares a comprehensive proposal tailored to your specific land location.',
    duration: '24 - 48 Hours',
  },
  {
    icon: Compass,
    title: 'Field Work',
    description: 'Our survey team conducts high-precision on-site measurements using RTK GNSS and Total Stations. Timelines depend on project scale, ranging from 1 day for single plots to 2 weeks for large estate layouts.',
    duration: '1 - 14 Days (Scope Dependent)',
  },
  {
    icon: Database,
    title: 'Data Processing',
    description: 'Collected field data is processed using modern CAD and GIS software. We perform rigorous coordinate verification and plan drafting to SURCON technical standards.',
    duration: '2 - 3 Working Days',
  },
  {
    icon: FileCheck,
    title: 'Delivery',
    description: 'Finalized survey documents, signed plans, and digital data files are delivered to you. We provide guidance on further title processing or building approval steps.',
    duration: 'Within 24 Hours',
  },
];

export default function Process() {
  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start center", "end center"]
  });

  const pathLength = useTransform(scrollYProgress, [0, 1], [0, 1]);

  return (
    <section
      id="process"
      className="py-12 md:py-24 bg-white relative overflow-hidden"
    >
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-primary/3 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-accent/3 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute inset-0 bg-mesh-gradient pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="text-center max-w-3xl mx-auto mb-20"
        >
          <span className="section-label justify-center">Our Process</span>
          <h2 className="text-4xl md:text-5xl font-display font-bold text-secondary mb-6 mt-3">
            How We <span className="text-primary">Work</span>
          </h2>
          <p className="text-lg text-gray-500 leading-relaxed max-w-prose mx-auto">
            A streamlined four-step process designed to deliver accurate results
            on time and within budget.
          </p>
        </motion.div>

        {/* Timeline */}
        <div ref={containerRef} className="relative">
          {/* SVG Path (Desktop only) */}
          <svg
            className="absolute left-1/2 top-0 h-full w-4 -translate-x-1/2 hidden lg:block"
            viewBox="0 0 4 800"
            preserveAspectRatio="none"
          >
            <motion.path
              d="M2 0 L2 800"
              stroke="#FF6806"
              strokeWidth="2"
              fill="none"
              strokeLinecap="round"
              style={{ pathLength }}
            />
          </svg>

          {/* Mobile Vertical Timeline */}
          <div className="lg:hidden space-y-8 relative">
            {/* Vertical Line */}
            <div className="absolute left-6 top-8 bottom-8 w-px bg-primary/20" />
            
            {steps.map((step, index) => {
              const Icon = step.icon;
              return (
                <motion.div 
                  key={step.title}
                  initial={{ opacity: 0, y: 30, x: -10 }}
                  whileInView={{ opacity: 1, y: 0, x: 0 }}
                  viewport={{ once: true, margin: "-50px" }}
                  transition={{ duration: 0.5, type: "spring", stiffness: 100, damping: 20 }}
                  className="relative pl-16 pr-2 sm:pr-8"
                >
                  {/* Number Node */}
                  <div className="absolute left-2 top-6 w-8 h-8 bg-primary rounded-full flex items-center justify-center shadow-primary-glow z-10 ring-4 ring-white">
                    <span className="text-white font-bold text-sm">{index + 1}</span>
                  </div>
                  
                  <div className="card-premium p-6 sm:p-8 flex flex-col bg-white border border-gray-100 shadow-sm hover:shadow-md transition-shadow rounded-2xl">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="w-10 h-10 sm:w-12 sm:h-12 bg-primary/10 rounded-xl flex items-center justify-center shrink-0">
                        <Icon className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
                      </div>
                      <div>
                        <span className="text-[10px] sm:text-xs font-bold text-primary uppercase tracking-wider">
                          Step {index + 1}
                        </span>
                        <h3 className="text-lg sm:text-xl font-display font-bold text-secondary mt-0.5">
                          {step.title}
                        </h3>
                      </div>
                    </div>
                    <p className="text-gray-500 text-sm leading-relaxed mb-5">
                      {step.description}
                    </p>
                    <div className="inline-flex items-center gap-2 bg-gray-50 border border-gray-100 px-3 py-2 rounded-lg self-start">
                      <span className="w-1.5 h-1.5 rounded-full bg-accent" />
                      <span className="text-[10px] sm:text-xs font-bold text-gray-600 uppercase tracking-wider">
                        {step.duration}
                      </span>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Desktop Timeline Steps */}
          <div className="hidden lg:block space-y-24">
            {steps.map((step, index) => {
              const Icon = step.icon;
              const isLeft = index % 2 === 0;

              return (
                <motion.div
                  key={step.title}
                  initial={{ opacity: 0, x: isLeft ? -50 : 50 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, margin: "-100px" }}
                  transition={{ duration: 0.6, type: "spring", stiffness: 100, damping: 20 }}
                  className={`relative flex flex-col lg:flex-row items-center gap-8 ${isLeft ? 'lg:flex-row' : 'lg:flex-row-reverse'}`}
                >
                  {/* Content Card */}
                  <div className={`step-card flex-1 w-full ${isLeft ? 'lg:text-right lg:pr-16' : 'lg:text-left lg:pl-16'}`}>
                    <div className={`card-premium p-8 inline-block w-full lg:max-w-md ${isLeft ? 'lg:ml-auto' : 'lg:mr-auto'}`}>
                      <div className={`flex items-center gap-4 mb-4 ${isLeft ? 'lg:flex-row-reverse' : ''}`}>
                        <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center shrink-0">
                          <Icon className="w-6 h-6 text-primary" />
                        </div>
                        <div className={isLeft ? 'lg:text-right' : ''}>
                          <span className="text-xs font-bold text-primary uppercase tracking-wider">
                            Step {index + 1}
                          </span>
                          <h3 className="text-xl font-display font-bold text-secondary mt-1">
                            {step.title}
                          </h3>
                        </div>
                      </div>
                      <p className="text-gray-500 leading-relaxed mb-4 text-sm">
                        {step.description}
                      </p>
                      <div
                        className={`flex items-center gap-2 text-sm text-gray-500 font-medium ${isLeft ? 'lg:justify-end' : ''
                          }`}
                      >
                        <span className="w-1.5 h-1.5 bg-accent rounded-full" />
                        <span>Duration: {step.duration}</span>
                      </div>
                    </div>
                  </div>

                  {/* Center Node */}
                  <div className="step-node absolute left-1/2 -translate-x-1/2 hidden lg:flex items-center justify-center">
                    <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center shadow-primary-glow z-10 transition-transform hover:scale-110 cursor-default">
                      <span className="text-white font-bold text-xl">{index + 1}</span>
                    </div>
                    <div className="absolute w-24 h-24 bg-primary/20 rounded-full animate-pulse-ring" />
                  </div>

                  {/* Mobile Node */}
                  <div className="lg:hidden absolute left-0 top-0">
                    <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center shadow-primary-glow z-10">
                      <span className="text-white font-bold">{index + 1}</span>
                    </div>
                  </div>

                  {/* Spacer for alternating layout */}
                  <div className="flex-1 hidden lg:block" />
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}