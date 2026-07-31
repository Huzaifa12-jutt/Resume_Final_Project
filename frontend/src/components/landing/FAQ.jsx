import React, { useState } from 'react';
import { FiChevronDown } from 'react-icons/fi';

const FAQ = () => {
  const [openIndex, setOpenIndex] = useState(0);

  const faqs = [
    {
      q: 'How does the AI rank candidates?',
      a: 'Our AI uses semantic matching algorithms that parse education, experience, and skills against the job description context rather than relying on exact keyword matches.',
    },
    {
      q: 'Can candidates track their application status?',
      a: 'Yes! Candidates get a dedicated dashboard to browse open jobs, apply with one click, and track application status in real-time.',
    },
    {
      q: 'What file formats are supported for resumes?',
      a: 'Currently, the system parses PDF documents up to 10MB each.',
    },
    {
      q: 'Is there a limit on how many candidate resumes can be uploaded?',
      a: 'No, you can upload multiple PDFs per job position and run AI ranking in bulk.',
    },
  ];

  return (
    <section className="py-20 bg-white border-t border-gray-100">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">Frequently Asked Questions</h2>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, i) => (
            <div key={i} className="border border-gray-200 rounded-2xl overflow-hidden bg-white">
              <button
                onClick={() => setOpenIndex(openIndex === i ? null : i)}
                className="w-full p-5 text-left flex justify-between items-center font-bold text-gray-900 hover:bg-gray-50"
              >
                <span>{faq.q}</span>
                <FiChevronDown className={`h-5 w-5 transition-transform ${openIndex === i ? 'rotate-180' : ''}`} />
              </button>
              {openIndex === i && (
                <div className="p-5 pt-0 text-sm text-gray-600 border-t border-gray-100 bg-gray-50/50">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FAQ;
