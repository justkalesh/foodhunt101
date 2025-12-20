import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Search, Users, Star, Sparkles, Utensils, MessageCircle, Award } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';

const Home: React.FC = () => {
  return (
    <div className="min-h-screen glass-card">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        {/* Background Gradient Blobs */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary-500/20 rounded-full blur-3xl" />
          <div className="absolute top-1/2 right-0 w-80 h-80 bg-accent-sky/15 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-accent-lime/10 rounded-full blur-3xl" />
        </div>

        <div className="max-w-6xl mx-auto px-4 py-20 md:py-32 relative z-10">
          <div className="text-center max-w-4xl mx-auto">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 text-sm font-semibold mb-8 animate-fade-in">
              <Sparkles size={16} />
              <span>Campus Food Discovery Platform</span>
            </div>

            {/* Main Heading */}
            <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-gray-900 dark:text-white mb-6 animate-slide-up">
              Find <span className="text-primary-600">Food</span>.
              <br />
              Find <span className="text-primary-600">Friends</span>.
            </h1>

            {/* Subtitle */}
            <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto mb-10 leading-relaxed">
              The ultimate campus companion. Discover hidden gems, split meals to save money, and never eat alone again.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Link to="/vendors">
                <Button
                  size="lg"
                  leftIcon={<Search size={22} />}
                  className="!rounded-full !px-8 shadow-glow-primary"
                >
                  Browse Food
                </Button>
              </Link>
              <Link to="/splits">
                <Button
                  variant="ghost"
                  size="lg"
                  leftIcon={<Users size={22} />}
                  className="!rounded-full !px-8 !bg-white dark:!bg-slate-800 border border-gray-200 dark:border-gray-700 shadow-lg"
                >
                  Find a Squad
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="relative py-16 border-y border-gray-100 dark:border-gray-800">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { value: '10+', label: 'Campus Vendors', icon: Utensils, color: 'primary' },
              { value: '₹35-220', label: 'Meal Price Range', icon: Star, color: 'sky' },
              { value: 'Save 50%', label: 'By Splitting Meals', icon: Users, color: 'lime' },
            ].map((stat, idx) => (
              <div
                key={idx}
                className="stagger-item group relative bg-white dark:bg-dark-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-8 shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden"
              >
                {/* Gradient blob decoration */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary-500/5 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none group-hover:bg-primary-500/10 transition-all" />

                <div className="relative z-10 text-center">
                  <div className={`w-14 h-14 mx-auto mb-4 rounded-xl flex items-center justify-center ${stat.color === 'primary' ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-600' :
                      stat.color === 'sky' ? 'bg-sky-100 dark:bg-sky-900/30 text-sky-600' :
                        'bg-lime-100 dark:bg-lime-900/30 text-lime-600'
                    }`}>
                    <stat.icon size={24} />
                  </div>
                  <div className="text-3xl md:text-4xl font-extrabold text-gray-900 dark:text-white mb-2">
                    {stat.value}
                  </div>
                  <div className="text-gray-500 dark:text-gray-400 font-medium">
                    {stat.label}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20">
        <div className="max-w-6xl mx-auto px-4">
          <Card variant="glass" padding="lg" hover={false} className="overflow-hidden">
            <div className="relative z-10">
              {/* Section Header */}
              <div className="text-center mb-12">
                <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 text-sm font-medium mb-4">
                  <Sparkles size={14} />
                  Getting Started
                </span>
                <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 dark:text-white tracking-tight">
                  How It <span className="text-primary-600">Works</span>
                </h2>
              </div>

              {/* Steps Grid */}
              <div className="grid md:grid-cols-3 gap-8">
                {[
                  {
                    num: 1,
                    title: 'Discover Vendors',
                    desc: 'Search every food spot on campus, filter by cuisine, price, and dietary needs.',
                    icon: Search,
                    color: 'bg-primary-500'
                  },
                  {
                    num: 2,
                    title: 'Split Meals',
                    desc: 'Want that family pizza but alone? Find people to share costs and make friends.',
                    icon: Users,
                    color: 'bg-accent-sky'
                  },
                  {
                    num: 3,
                    title: 'Earn Rewards',
                    desc: 'Rate food, upload photos, and join splits to earn Loyalty Points and badges.',
                    icon: Award,
                    color: 'bg-accent-lime'
                  },
                ].map((step, i) => (
                  <div key={step.num} className="text-center group">
                    <div
                      className={`w-20 h-20 mx-auto rounded-2xl ${step.color} flex items-center justify-center text-white mb-6 shadow-lg group-hover:scale-110 group-hover:shadow-xl transition-all duration-300`}
                    >
                      <step.icon size={32} />
                    </div>
                    <h3 className="font-bold text-xl text-gray-900 dark:text-white mb-3">
                      {step.title}
                    </h3>
                    <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed px-4">
                      {step.desc}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Background decorations */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary-500/5 rounded-full blur-3xl -mr-32 -mt-32 pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-accent-sky/5 rounded-full blur-3xl -ml-24 -mb-24 pointer-events-none" />
          </Card>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 relative overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary-600 via-primary-700 to-primary-800">
          <div className="absolute inset-0 opacity-20">
            <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-white rounded-full blur-3xl" />
            <div className="absolute bottom-1/4 right-1/4 w-48 h-48 bg-accent-lime rounded-full blur-3xl" />
          </div>
        </div>

        <div className="max-w-6xl mx-auto px-4 relative z-10 text-center">
          <h2 className="text-3xl md:text-5xl font-extrabold text-white mb-6">
            Ready to Find Your <span className="text-primary-200">Food Squad</span>?
          </h2>
          <p className="text-lg md:text-xl text-primary-100 max-w-2xl mx-auto mb-10">
            Join hundreds of students saving money and making friends over food.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link to="/register">
              <button className="bg-white text-primary-600 px-10 py-4 rounded-full font-bold text-lg hover:bg-gray-100 transition-all transform hover:-translate-y-0.5 shadow-xl flex items-center justify-center gap-2">
                Get Started Free
                <ArrowRight size={20} />
              </button>
            </Link>
            <Link to="/vendors">
              <button className="bg-primary-800/50 backdrop-blur-sm text-white border border-primary-400/30 px-10 py-4 rounded-full font-bold text-lg hover:bg-primary-800 transition-all flex items-center justify-center gap-2">
                <Search size={20} />
                Explore Vendors
              </button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;