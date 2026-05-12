import { useState } from 'react';
import { Plus, Minus } from '@phosphor-icons/react';
import { motion, AnimatePresence } from 'framer-motion';

const FaqItem = ({ question, answer, isOpen, onClick, id }) => {
  return (
    <div className="border-b border-gray-200 last:border-0 group transition-colors duration-300 hover:bg-gray-50 rounded-lg">
      <button
        type="button"
        className="w-full py-6 px-4 flex items-center justify-between gap-4 text-left focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none rounded-lg"
        onClick={(event) => {
          event.preventDefault();
          event.stopPropagation();
          onClick();
        }}
        aria-expanded={isOpen}
        aria-controls={`faq-answer-${id}`}
      >
        <h3 className="text-lg md:text-xl font-display font-medium text-secondary group-hover:text-primary transition-colors">
          {question}
        </h3>
        <motion.span 
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
          className="flex-shrink-0 text-primary"
        >
          {isOpen ? <Minus className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
        </motion.span>
      </button>
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            id={`faq-answer-${id}`}
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "circOut" }}
            style={{ overflow: "hidden" }}
            role="region"
            aria-labelledby={`faq-question-${id}`}
          >
            <div className="pb-6 px-4">
              <p className="text-gray-600 leading-relaxed font-sans text-base md:text-lg max-w-prose">
                {answer}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const Faq = () => {
  const [openIndex, setOpenIndex] = useState(null);

  const faqs = [
    {
      question: 'How many years of experience does Sourceline have?',
      answer: 'We have over 10 years of experience delivering precision surveying and geoinformatics services across Nigeria.'
    },
    {
      question: 'How big is your team?',
      answer: 'Our team consists of over 20 professionals, including a SURCON-registered surveyor, GIS specialists, survey technologists, and field engineers.'
    },
    {
      question: 'Do you have case studies of past successful projects?',
      answer: 'Yes, we have completed over 200 projects ranging from residential boundary surveys to large-scale infrastructure mapping. You can view our Portfolio page for detailed case studies.'
    },
    {
      question: 'Does Sourceline have a project minimum?',
      answer: 'We handle projects of all sizes, from single plot boundary verifications to large estate layouts and engineering construction surveys. Contact us for a custom quote.'
    }
  ];

  const handleToggle = (index) => {
    setOpenIndex((prevIndex) => (prevIndex === index ? null : index));
  };

  return (
    <section className="bg-white py-12 md:py-32">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <span className="section-label justify-center">
            Common Questions
          </span>
          <h2 className="text-4xl md:text-5xl font-display font-bold text-secondary mb-6 mt-3">
            Frequently Asked Questions
          </h2>
          <p className="text-gray-500 max-w-2xl mx-auto text-lg font-sans">
            Find answers to common questions about our surveying services, processes, and capabilities.
          </p>
        </div>

        <div className="bg-gray-50 rounded-3xl p-8 md:p-12 border border-gray-100">
          {faqs.map((faq, index) => (
            <FaqItem
              key={index}
              id={index}
              question={faq.question}
              answer={faq.answer}
              isOpen={openIndex === index}
              onClick={() => handleToggle(index)}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default Faq;
