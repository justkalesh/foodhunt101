import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ChevronDown, MessageCircle } from 'lucide-react';
import { usePageMeta } from '../hooks/usePageMeta';

const FAQ_DATA = [
    {
        question: 'Does "splitting" mean the vendor will serve the food on two different plates?',
        answer: "We can't guarantee the vendor will physically divide the food for you. The app connects you to share the meal, but you'll need to ask the vendor directly for extra plates when you order.",
    },
    {
        question: 'Are the menus and prices on the app exactly the same as at the stall?',
        answer: 'Prices and menu items might slightly vary when you visit in person. If you spot an outdated price, please let us know at @foodhunt101lpu so we can fix it!',
    },
    {
        question: 'What should I do if I have a dispute with a vendor or another user?',
        answer: 'Please report the issue to us with valid proof. Our team will personally look into the matter and provide the appropriate support to help resolve it.',
    },
    {
        question: 'Do you guys also take orders?',
        answer: 'Bro seriously, leave, go, get lost "BHAK". Jokes apart, we are not taking in orders yet, because we focus on connecting people for now, once we build our user base we will plan to integrate pre-order/order.',
    },
    {
        question: 'Who is the team behind Food-Hunt?',
        answer: "It's just me (Kalash), my laptop, and a whole lot of prompts with AI tools like Gemini and Claude.",
    },
    {
        question: 'How does the Meal-Split Board actually work?',
        answer: 'Just post what you want to eat and where, or browse existing requests. When you find a match, connect with the student to split the bill and the meal!',
    },
    {
        question: 'Is Food-Hunt only for the LPU campus?',
        answer: 'Yes! Right now, the platform is exclusively built to help LPU students navigate campus food options and save money.',
    },
    {
        question: "I'm a vendor. How do I get my menu listed on the app?",
        answer: 'Reach out to us on Instagram at @foodhunt101lpu with your stall details, and we\'ll get your menu and location added to the platform.',
    },
];

const FAQItem: React.FC<{ question: string; answer: string; isOpen: boolean; onToggle: () => void }> = ({ question, answer, isOpen, onToggle }) => (
    <div className="border border-gray-200 dark:border-gray-700 rounded-2xl overflow-hidden transition-all duration-200 hover:border-primary-300 dark:hover:border-primary-700">
        <button
            onClick={onToggle}
            className="w-full flex items-center justify-between gap-4 p-5 sm:p-6 text-left bg-white dark:bg-slate-900 hover:bg-gray-50 dark:hover:bg-slate-800/50 transition-colors"
            aria-expanded={isOpen}
        >
            <span className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white pr-2">{question}</span>
            <ChevronDown
                size={20}
                className={`flex-shrink-0 text-primary-500 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}
            />
        </button>
        <div
            className={`overflow-hidden transition-all duration-300 ease-in-out ${isOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}
        >
            <div className="px-5 sm:px-6 pb-5 sm:pb-6 text-gray-600 dark:text-gray-300 text-sm sm:text-base leading-relaxed border-t border-gray-100 dark:border-gray-800 pt-4">
                {answer}
            </div>
        </div>
    </div>
);

const FAQ: React.FC = () => {
    const navigate = useNavigate();
    const [openIndex, setOpenIndex] = useState<number | null>(0);

    usePageMeta({
        title: 'FAQs — Food-Hunt | Campus Food Discovery at LPU',
        description: 'Frequently asked questions about Food-Hunt — meal splitting, vendor listings, pricing, and how to get your stall listed at LPU campus.',
        canonicalPath: '/faq',
    });

    // Inject FAQ JSON-LD structured data for rich snippets
    useEffect(() => {
        const jsonLd = {
            "@context": "https://schema.org",
            "@type": "FAQPage",
            "mainEntity": FAQ_DATA.map((faq) => ({
                "@type": "Question",
                "name": faq.question,
                "acceptedAnswer": {
                    "@type": "Answer",
                    "text": faq.answer,
                },
            })),
        };

        let script = document.getElementById('faq-jsonld') as HTMLScriptElement | null;
        if (!script) {
            script = document.createElement('script');
            script.id = 'faq-jsonld';
            script.type = 'application/ld+json';
            document.head.appendChild(script);
        }
        script.textContent = JSON.stringify(jsonLd);

        return () => {
            const el = document.getElementById('faq-jsonld');
            if (el) el.remove();
        };
    }, []);

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-slate-950">
            <div className="max-w-3xl mx-auto px-4 py-8 sm:py-12">
                <button
                    onClick={() => navigate(-1)}
                    className="inline-flex items-center gap-2 text-primary-600 hover:underline mb-6"
                >
                    <ArrowLeft size={20} /> Back
                </button>

                {/* Header */}
                <div className="text-center mb-10 sm:mb-12">
                    <div className="w-16 h-16 mx-auto mb-5 rounded-2xl bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
                        <MessageCircle size={32} className="text-primary-500" />
                    </div>
                    <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 dark:text-white mb-3">
                        Frequently Asked <span className="text-primary-600">Questions</span>
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400 max-w-lg mx-auto">
                        Everything you need to know about Food-Hunt, meal splits, and how it all works at LPU.
                    </p>
                </div>

                {/* FAQ Accordion */}
                <div className="space-y-3">
                    {FAQ_DATA.map((faq, index) => (
                        <FAQItem
                            key={index}
                            question={faq.question}
                            answer={faq.answer}
                            isOpen={openIndex === index}
                            onToggle={() => setOpenIndex(openIndex === index ? null : index)}
                        />
                    ))}
                </div>

                {/* Contact CTA */}
                <div className="mt-10 sm:mt-12 text-center p-6 sm:p-8 rounded-2xl bg-white dark:bg-slate-900 border border-gray-200 dark:border-gray-700">
                    <p className="text-gray-600 dark:text-gray-300 mb-1">Still have questions?</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                        Reach out to us on Instagram{' '}
                        <a
                            href="https://www.instagram.com/foodhunt101lpu/"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary-600 font-semibold hover:underline"
                        >
                            @foodhunt101lpu
                        </a>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default FAQ;
