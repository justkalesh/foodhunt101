import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Search, Users, Star } from 'lucide-react';

const Home: React.FC = () => {
  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative bg-primary-600 text-white overflow-hidden">
        <div className="absolute inset-0 bg-black opacity-10 pattern-dots"></div>
        <div className="max-w-7xl mx-auto px-4 py-24 sm:px-6 lg:px-8 relative z-10 text-center">
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-6">
            FIND FOOD. <br /> <span className="text-primary-200">FIND FRIENDS.</span>
          </h1>
          <p className="text-xl md:text-2xl mb-8 max-w-2xl mx-auto opacity-90">
            The ultimate campus companion. Discover hidden gems, split meals to save money, and never eat alone again.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link to="/vendors" className="bg-white text-primary-600 px-8 py-3 rounded-full font-bold text-lg hover:bg-gray-100 transition-colors flex items-center justify-center gap-2">
              <Search size={20} /> Browse Food
            </Link>
            <Link to="/splits" className="bg-primary-800 text-white px-8 py-3 rounded-full font-bold text-lg hover:bg-primary-900 transition-colors flex items-center justify-center gap-2">
              <Users size={20} /> Find a Squad
            </Link>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="bg-black text-white py-12 border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div className="p-4">
              <div className="text-4xl font-bold mb-2">10+</div>
              <div className="text-gray-400">Campus Vendors</div>
            </div>
            <div className="p-4">
              <div className="text-4xl font-bold mb-2">₹35-220</div>
              <div className="text-gray-400">Meal Price Range</div>
            </div>
            <div className="p-4">
              <div className="text-4xl font-bold mb-2">Save 50%</div>
              <div className="text-gray-400">By Splitting Meals</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 bg-white dark:bg-dark-900">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8">
            <div className="p-6 rounded-2xl bg-gradient-to-br from-white to-orange-50/50 dark:bg-none dark:bg-dark-800 border border-gray-100 dark:border-gray-700">
              <div className="w-12 h-12 bg-orange-100 text-orange-600 rounded-lg flex items-center justify-center mb-4">
                <Search size={24} />
              </div>
              <h3 className="text-xl font-bold mb-2 dark:text-white">Discover Vendors</h3>
              <p className="text-gray-600 dark:text-gray-400">Search every food spot on campus, filter by cuisine, price, and dietary needs.</p>
            </div>
            <div className="p-6 rounded-2xl bg-gradient-to-br from-white to-orange-50/50 dark:bg-none dark:bg-dark-800 border border-gray-100 dark:border-gray-700">
              <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center mb-4">
                <Users size={24} />
              </div>
              <h3 className="text-xl font-bold mb-2 dark:text-white">Split Meals</h3>
              <p className="text-gray-600 dark:text-gray-400">Want that family pizza but alone? Find people to share costs and make friends.</p>
            </div>
            <div className="p-6 rounded-2xl bg-gradient-to-br from-white to-orange-50/50 dark:bg-none dark:bg-dark-800 border border-gray-100 dark:border-gray-700">
              <div className="w-12 h-12 bg-yellow-100 text-yellow-600 rounded-lg flex items-center justify-center mb-4">
                <Star size={24} />
              </div>
              <h3 className="text-xl font-bold mb-2 dark:text-white">Earn Rewards</h3>
              <p className="text-gray-600 dark:text-gray-400">Rate food, upload photos, and join splits to earn Loyalty Points and badges.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;