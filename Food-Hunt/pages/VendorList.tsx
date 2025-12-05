
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/mockDatabase';
import { Vendor } from '../types';
import { Search, MapPin, DollarSign, Star, Flame, Phone } from 'lucide-react';

const VendorList: React.FC = () => {
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [filtered, setFiltered] = useState<Vendor[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      const res = await api.vendors.getAll();
      if (res.success && res.data) {
        setVendors(res.data);
        setFiltered(res.data);
      }
      setLoading(false);
    };
    fetch();
  }, []);

  useEffect(() => {
    const lower = search.toLowerCase();
    const res = vendors.filter(v =>
      v.name.toLowerCase().includes(lower) ||
      v.cuisine.toLowerCase().includes(lower) ||
      v.origin_tag.toLowerCase().includes(lower)
    );
    setFiltered(res);
  }, [search, vendors]);

  if (loading) return <div className="p-10 text-center dark:text-white animate-pulse">Loading campus vendors...</div>;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Campus Food Spots</h2>
        <div className="relative">
          <input
            type="text"
            placeholder="Search by name, cuisine (e.g. North, Chinese)..."
            className="w-full p-4 pl-12 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-dark-800 dark:text-white shadow-sm focus:ring-2 focus:ring-primary-500 focus:outline-none"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          <Search className="absolute left-4 top-4 text-gray-400" />
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filtered.map(vendor => (
          <Link to={`/vendors/${vendor.id}`} key={vendor.id} className="group block bg-gradient-to-br from-white to-orange-50/50 dark:bg-none dark:bg-dark-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden hover:shadow-xl transition-all hover:-translate-y-1">
            <div className="h-48 overflow-hidden relative">
              <img src={vendor.logo_url || vendor.menu_image_urls?.[0]} alt={vendor.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />

              <div className="absolute top-2 right-2 bg-white dark:bg-dark-900 px-2 py-1 rounded-md text-xs font-bold shadow flex items-center gap-1 dark:text-white">
                <Star size={12} className="text-yellow-400 fill-current" /> {vendor.rating_avg || 'New'}
              </div>

              {vendor.rush_level === 'high' && (
                <div className="absolute top-2 left-2 bg-red-500 text-white px-2 py-1 rounded-md text-xs font-bold shadow flex items-center gap-1">
                  <Flame size={12} /> Busy
                </div>
              )}
            </div>

            <div className="p-5">
              <div className="flex justify-between items-start mb-2">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white group-hover:text-primary-600 truncate pr-2">{vendor.name}</h3>
                <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded font-semibold whitespace-nowrap">
                  Min ₹{vendor.lowest_item_price}
                </span>
              </div>

              <p className="text-gray-500 dark:text-gray-400 text-sm mb-4 line-clamp-2">{vendor.description}</p>

              <div className="flex flex-wrap items-center gap-2 mb-4">
                <span className="px-2 py-1 bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 text-xs rounded-md border border-primary-100 dark:border-primary-800">
                  {vendor.origin_tag}
                </span>
                <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-xs rounded-md">
                  {vendor.cuisine}
                </span>
              </div>

              <div className="flex items-center justify-between text-gray-400 text-sm border-t dark:border-gray-700 pt-3">
                <div className="flex items-center">
                  <MapPin size={14} className="mr-1" /> {vendor.location}
                </div>
                {vendor.contact_number && (
                  <div className="flex items-center">
                    <Phone size={14} className="mr-1" /> {vendor.contact_number}
                  </div>
                )}
              </div>
            </div>
          </Link>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-20 text-gray-500 dark:text-gray-400">
          No vendors found. Try a different search!
        </div>
      )}
    </div>
  );
};

export default VendorList;
