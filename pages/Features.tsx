import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
    ArrowLeft,
    ArrowRight,
    Search,
    Users,
    MessageCircle,
    Shield,
    Sparkles,
    Camera,
    Zap,
    Globe,
    BadgeCheck,
    Brain,
    MapPin
} from 'lucide-react';
import MegaFooter from '../components/MegaFooter';
import { usePageMeta } from '../hooks/usePageMeta';
import { useAuth } from '../contexts/AuthContext';

const CORE_FEATURES = [
    {
        title: 'Vendor Discovery',
        desc: 'Browse every food spot on campus with real menus, live prices, and authentic student reviews. Filter by cuisine, price range, location, and dietary preference.',
        icon: Search,
        color: 'from-primary-500 to-orange-500',
        bgLight: 'bg-primary-50',
        bgDark: 'dark:bg-primary-900/20',
    },
    {
        title: 'Meal Splits',
        desc: 'Post a split or join one — share family pizzas, thalis, and combos with fellow students. Save up to 50% on every meal while making new friends.',
        icon: Users,
        color: 'from-sky-500 to-blue-600',
        bgLight: 'bg-sky-50',
        bgDark: 'dark:bg-sky-900/20',
    },
    {
        title: 'AI Food Assistant',
        desc: 'Ask our Gemini-powered chatbot for food recommendations. "Best butter chicken under ₹100?" — it knows every vendor, menu, and deal on campus.',
        icon: Brain,
        color: 'from-violet-500 to-purple-600',
        bgLight: 'bg-violet-50',
        bgDark: 'dark:bg-violet-900/20',
    },
    {
        title: 'Real-Time Chat',
        desc: 'Coordinate meals with split partners through our built-in messenger. Mention vendors inline, accept/decline split requests, and stay connected.',
        icon: MessageCircle,
        color: 'from-emerald-500 to-green-600',
        bgLight: 'bg-emerald-50',
        bgDark: 'dark:bg-emerald-900/20',
    },
    {
        title: 'Menu Scanner',
        desc: 'Admins can photograph a vendor\'s physical menu and our AI auto-extracts every item, price, and size variant — no manual entry needed.',
        icon: Camera,
        color: 'from-amber-500 to-yellow-600',
        bgLight: 'bg-amber-50',
        bgDark: 'dark:bg-amber-900/20',
    },
    {
        title: 'Verified Profiles',
        desc: 'Aadhaar-based identity verification adds a trust badge to your profile. Know who you\'re splitting meals with — verified students only.',
        icon: BadgeCheck,
        color: 'from-teal-500 to-cyan-600',
        bgLight: 'bg-teal-50',
        bgDark: 'dark:bg-teal-900/20',
    },
];

const DIFFERENTIATORS = [
    {
        title: 'Not a Delivery App',
        desc: 'We connect you with campus food spots and people — no delivery fees, no middlemen. Walk, eat, and socialize.',
        icon: MapPin,
    },
    {
        title: 'Built for Campus Life',
        desc: 'Rush-level indicators, food court locations, and student-only community. This isn\'t Zomato — it\'s for your campus.',
        icon: Globe,
    },
    {
        title: 'Privacy First',
        desc: 'Your data stays yours. No location tracking, no ad targeting, no selling your food preferences to marketers.',
        icon: Shield,
    },
    {
        title: 'Lightning Fast',
        desc: 'Optimized for slow campus WiFi. Instant page loads, offline support, and push notifications when it matters.',
        icon: Zap,
    },
];

/* ─── Tech Stack Data (only tech used in Food-Hunt) ─── */
const D = 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons'; // devicon CDN base

const TECH_STACK_ROW1 = [
    { name: 'React', icon: `${D}/react/react-original.svg` },
    { name: 'TypeScript', icon: `${D}/typescript/typescript-original.svg` },
    { name: 'Vite', icon: `${D}/vitejs/vitejs-original.svg` },
    { name: 'Tailwind CSS', icon: `${D}/tailwindcss/tailwindcss-original.svg` },
    { name: 'Supabase', icon: `${D}/supabase/supabase-original.svg` },
    { name: 'Firebase', icon: `${D}/firebase/firebase-original.svg` },
    { name: 'Node.js', icon: `${D}/nodejs/nodejs-original.svg` },
    { name: 'PostgreSQL', icon: `${D}/postgresql/postgresql-original.svg` },
    { name: 'HTML5', icon: `${D}/html5/html5-original.svg` },
    { name: 'CSS3', icon: `${D}/css3/css3-original.svg` },
    { name: 'JavaScript', icon: `${D}/javascript/javascript-original.svg` },
    { name: 'Git', icon: `${D}/git/git-original.svg` },
];

const TECH_STACK_ROW2 = [
    { name: 'Gemini AI', icon: 'https://upload.wikimedia.org/wikipedia/commons/8/8a/Google_Gemini_logo.svg' },
    { name: 'Framer Motion', icon: `${D}/framermotion/framermotion-original.svg`, invert: true },
    { name: 'Capacitor', icon: `${D}/capacitor/capacitor-original.svg` },
    { name: 'Cloudflare', icon: `${D}/cloudflare/cloudflare-original.svg` },
    { name: 'npm', icon: `${D}/npm/npm-original-wordmark.svg` },
    { name: 'React Router', icon: `${D}/reactrouter/reactrouter-original.svg` },
    { name: 'Figma', icon: `${D}/figma/figma-original.svg` },
    { name: 'Vercel', icon: `${D}/vercel/vercel-original.svg`, invert: true },
    { name: 'TanStack Query', icon: 'https://raw.githubusercontent.com/TanStack/query/main/media/emblem-light.svg' },
];

/* Pill-shaped tech badge for the marquee */
const TechPill: React.FC<{ name: string; icon: string; invert?: boolean }> = ({ name, icon, invert }) => (
    <div className="tech-pill flex items-center gap-3 px-5 py-3 mx-2 rounded-full bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 shadow-sm hover:shadow-md hover:border-primary-300 dark:hover:border-primary-600 transition-all duration-200 cursor-default shrink-0 group">
        <img
            src={icon}
            alt={name}
            loading="lazy"
            className={`w-6 h-6 object-contain group-hover:scale-110 transition-transform duration-200 ${invert ? 'dark:invert' : ''}`}
        />
        <span className="text-sm font-semibold text-gray-700 dark:text-gray-300 whitespace-nowrap">
            {name}
        </span>
    </div>
);

const Features: React.FC = () => {
    const navigate = useNavigate();
    const { user } = useAuth();

    usePageMeta({
        title: 'Features — Food-Hunt | Everything You Need on Campus',
        description: 'Explore Food-Hunt features: vendor discovery, meal splitting, AI food assistant, real-time chat, menu scanning, and verified profiles. Built for LPU students.',
        canonicalPath: '/features',
    });

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-slate-950">
            <div className="max-w-6xl mx-auto px-4 py-8 pb-0">
                {/* Back Button */}
                <button
                    onClick={() => navigate(-1)}
                    className="inline-flex items-center gap-2 text-primary-600 hover:underline mb-6"
                >
                    <ArrowLeft size={20} /> Back
                </button>

                {/* ═══════════════════════════════════════════════
                    HERO SECTION
                ═══════════════════════════════════════════════ */}
                <div className="text-center mb-16 relative">
                    {/* Background glow */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-primary-500/10 blur-[100px] rounded-full pointer-events-none" />

                    <div className="relative z-10">
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 text-sm font-semibold mb-6">
                            <Sparkles size={16} />
                            <span>Platform Features</span>
                        </div>

                        <h1 className="text-4xl md:text-6xl font-extrabold text-gray-900 dark:text-white mb-5 tracking-tight">
                            Everything You Need,{' '}
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-orange-500">
                                Nothing You Don't
                            </span>
                        </h1>

                        <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto leading-relaxed">
                            Food-Hunt is packed with features designed specifically for campus life.
                            Discover food, save money, and connect with your community.
                        </p>
                    </div>
                </div>

                {/* ═══════════════════════════════════════════════
                    CORE FEATURES GRID
                ═══════════════════════════════════════════════ */}
                <section className="mb-20">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {CORE_FEATURES.map((feature, idx) => (
                            <div
                                key={feature.title}
                                className="group p-6 rounded-2xl bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
                                style={{ animationDelay: `${idx * 0.08}s` }}
                            >
                                {/* Icon */}
                                <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-5 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                                    <feature.icon size={26} className="text-white" />
                                </div>

                                {/* Content */}
                                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                                    {feature.title}
                                </h3>
                                <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
                                    {feature.desc}
                                </p>
                            </div>
                        ))}
                    </div>
                </section>

                {/* ═══════════════════════════════════════════════
                    HOW WE'RE DIFFERENT
                ═══════════════════════════════════════════════ */}
                <section className="mb-20">
                    <div className="rounded-3xl bg-white dark:bg-slate-900 p-8 md:p-12 border border-gray-200 dark:border-slate-800 shadow-sm relative overflow-hidden">
                        {/* Background decoration */}
                        <div className="absolute top-0 right-0 w-72 h-72 bg-primary-500/8 dark:bg-primary-500/10 rounded-full blur-3xl -mr-36 -mt-36 pointer-events-none" />
                        <div className="absolute bottom-0 left-0 w-48 h-48 bg-sky-500/5 dark:bg-sky-500/10 rounded-full blur-3xl -ml-24 -mb-24 pointer-events-none" />

                        <div className="relative z-10">
                            <div className="text-center mb-10">
                                <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 text-sm font-medium mb-4">
                                    <Zap size={14} />
                                    What Makes Us Different
                                </span>
                                <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 dark:text-white tracking-tight">
                                    Built for <span className="text-primary-600 dark:text-primary-400">Campus</span>, Not Commerce
                                </h2>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                {DIFFERENTIATORS.map((item) => (
                                    <div
                                        key={item.title}
                                        className="flex gap-4 p-5 rounded-2xl bg-gray-50 dark:bg-slate-800/60 border border-gray-100 dark:border-slate-700/50 hover:border-primary-200 dark:hover:border-primary-800 transition-colors duration-200"
                                    >
                                        <div className="w-12 h-12 rounded-xl bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center flex-shrink-0">
                                            <item.icon size={22} className="text-primary-600 dark:text-primary-400" />
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">
                                                {item.title}
                                            </h3>
                                            <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed">
                                                {item.desc}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </section>

                {/* ═══════════════════════════════════════════════
                    TECH STACK MARQUEE
                ═══════════════════════════════════════════════ */}
                <section className="mb-20">
                    <div className="text-center mb-10">
                        <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 dark:text-white tracking-tight">
                            Powered By <span className="text-primary-600">Modern Tech</span>
                        </h2>
                        <p className="text-gray-500 dark:text-gray-400 mt-3 max-w-lg mx-auto">
                            The stack behind your campus food experience.
                        </p>
                    </div>

                    <div
                        className="relative overflow-hidden marquee-container py-4"
                        style={{
                            maskImage: 'linear-gradient(to right, transparent, black 8%, black 92%, transparent)',
                            WebkitMaskImage: 'linear-gradient(to right, transparent, black 8%, black 92%, transparent)',
                        }}
                    >
                        {/* Row 1 — Forward */}
                        <div className="flex w-max mb-4">
                            <div className="flex shrink-0 marquee-forward">
                                {TECH_STACK_ROW1.map((t) => <TechPill key={`a-${t.name}`} {...t} />)}
                            </div>
                            <div className="flex shrink-0 marquee-forward" aria-hidden="true">
                                {TECH_STACK_ROW1.map((t) => <TechPill key={`b-${t.name}`} {...t} />)}
                            </div>
                        </div>
                        {/* Row 2 — Reverse */}
                        <div className="flex w-max">
                            <div className="flex shrink-0 marquee-reverse">
                                {TECH_STACK_ROW2.map((t) => <TechPill key={`a-${t.name}`} {...t} />)}
                            </div>
                            <div className="flex shrink-0 marquee-reverse" aria-hidden="true">
                                {TECH_STACK_ROW2.map((t) => <TechPill key={`b-${t.name}`} {...t} />)}
                            </div>
                        </div>
                    </div>
                </section>

                {/* ═══════════════════════════════════════════════
                    CTA SECTION
                ═══════════════════════════════════════════════ */}
                <section className="mb-16">
                    <div className="p-8 md:p-12 rounded-3xl bg-gradient-to-br from-primary-500 via-primary-600 to-primary-700 text-white text-center relative overflow-hidden">
                        {/* Decorative blobs */}
                        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-white/10 rounded-full blur-3xl pointer-events-none" />
                        <div className="absolute bottom-1/4 right-1/4 w-48 h-48 bg-orange-400/20 rounded-full blur-3xl pointer-events-none" />

                        <div className="relative z-10">
                            <h2 className="text-3xl md:text-4xl font-extrabold mb-4">
                                Ready to Explore?
                            </h2>
                            <p className="text-primary-100 text-lg max-w-xl mx-auto mb-8">
                                Join hundreds of LPU students already discovering better food, saving money, and making friends.
                            </p>
                            <div className="flex flex-col sm:flex-row justify-center gap-4">
                                <Link
                                    to={user ? '/vendors' : '/register'}
                                    className="inline-flex items-center justify-center gap-2 px-10 py-4 rounded-full bg-white text-primary-600 font-bold text-lg hover:bg-gray-100 transition-all transform hover:-translate-y-0.5 shadow-xl"
                                >
                                    {user ? 'Browse Vendors' : 'Get Started Free'}
                                    <ArrowRight size={20} />
                                </Link>
                                <Link
                                    to="/splits"
                                    className="inline-flex items-center justify-center gap-2 px-10 py-4 rounded-full bg-primary-800/50 backdrop-blur-sm text-white border border-primary-400/30 font-bold text-lg hover:bg-primary-800 transition-all"
                                >
                                    <Users size={20} />
                                    Join a Split
                                </Link>
                            </div>
                        </div>
                    </div>
                </section>
            </div>

            {/* Mega Footer */}
            <MegaFooter />
        </div>
    );
};

export default Features;
