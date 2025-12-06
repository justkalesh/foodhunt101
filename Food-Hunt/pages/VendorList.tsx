
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/mockDatabase';
import { Vendor } from '../types';
import { Search, MapPin, DollarSign, Star, Flame, Phone, Filter, X, ChevronDown } from 'lucide-react';

const VendorList: React.FC = () => {
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [filtered, setFiltered] = useState<Vendor[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  // Filter & Sort States
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [sortBy, setSortBy] = useState<string>(''); // 'avg_asc', 'avg_desc', 'cheapest_desc'
  const [selectedLocations, setSelectedLocations] = useState<string[]>([]);
  const [selectedOrigins, setSelectedOrigins] = useState<string[]>([]);

  // Derived Options
  const locations = Array.from(new Set(vendors.map(v => v.location))).filter(Boolean);
  const origins = Array.from(new Set(vendors.map(v => v.origin_tag))).filter(Boolean);

  const toggleSelection = (list: string[], item: string, setList: (l: string[]) => void) => {
    if (list.includes(item)) {
      setList(list.filter(i => i !== item));
    } else {
      setList([...list, item]);
    }
  };

  const clearFilters = () => {
    setSortBy('');
    setSelectedLocations([]);
    setSelectedOrigins([]);
    setSearch('');
  };

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
    let res = [...vendors];

    // 1. Text Search
    if (search) {
      const lower = search.toLowerCase();
      res = res.filter(v =>
        v.name.toLowerCase().includes(lower) ||
        v.cuisine.toLowerCase().includes(lower) ||
        v.origin_tag.toLowerCase().includes(lower)
      );
    }

    // 2. Location Filter
    if (selectedLocations.length > 0) {
      res = res.filter(v => selectedLocations.includes(v.location));
    }

    // 3. Origin Filter
    if (selectedOrigins.length > 0) {
      res = res.filter(v => selectedOrigins.includes(v.origin_tag));
    }

    // 4. Sorting
    if (sortBy === 'avg_asc') {
      res.sort((a, b) => a.avg_price_per_meal - b.avg_price_per_meal);
    } else if (sortBy === 'avg_desc') {
      res.sort((a, b) => b.avg_price_per_meal - a.avg_price_per_meal);
    } else if (sortBy === 'cheapest_desc') {
      res.sort((a, b) => b.lowest_item_price - a.lowest_item_price);
    }

    setFiltered(res);
  }, [search, vendors, sortBy, selectedLocations, selectedOrigins]);

  if (loading) return <div className="p-10 text-center dark:text-white animate-pulse">Loading campus vendors...</div>;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Campus Food Spots</h2>
        <div className="relative flex gap-2">
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="Search by name, cuisine (e.g. North, Chinese)..."
              className="w-full p-4 pl-12 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-dark-800 dark:text-white shadow-sm focus:ring-2 focus:ring-primary-500 focus:outline-none"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
            <Search className="absolute left-4 top-4 text-gray-400" />
          </div>
          <button
            onClick={() => setIsFilterOpen(true)}
            className="px-4 bg-white dark:bg-dark-800 border border-gray-300 dark:border-gray-700 rounded-xl shadow-sm hover:bg-gray-50 dark:hover:bg-dark-700 transition-colors flex items-center justify-center text-gray-700 dark:text-gray-200"
          >
            <Filter size={20} />
          </button>
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

      {/* Filter Modal */}
      {isFilterOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-dark-900 rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto shadow-2xl flex flex-col">
            <div className="p-5 border-b dark:border-gray-800 flex justify-between items-center sticky top-0 bg-white dark:bg-dark-900 z-10">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">Filters</h3>
              <button onClick={() => setIsFilterOpen(false)} className="p-1 hover:bg-gray-100 dark:hover:bg-dark-800 rounded-full transition-colors">
                <X size={24} className="text-gray-500" />
              </button>
            </div>

            <div className="p-5 space-y-6">
              {/* Sort Options */}
              <div>
                <h4 className="font-semibold text-gray-900 dark:text-white mb-3">Sort By</h4>
                <div className="space-y-2">
                  {[
                    { label: 'Avg Price: Low to High', value: 'avg_asc' },
                    { label: 'Avg Price: High to Low', value: 'avg_desc' },
                    { label: 'Cheapest Item: High to Low', value: 'cheapest_desc' },
                  ].map((option) => (
                    <label key={option.value} className="flex items-center gap-3 p-3 rounded-lg border dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-dark-800 cursor-pointer transition-colors">
                      <input
                        type="radio"
                        name="sort"
                        className="w-4 h-4 text-primary-600 focus:ring-primary-500"
                        checked={sortBy === option.value}
                        onChange={() => setSortBy(option.value)}
                        onClick={() => sortBy === option.value && setSortBy('')} // Allow toggle off
                      />
                      <span className="text-gray-700 dark:text-gray-300">{option.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Locations */}
              <div>
                <h4 className="font-semibold text-gray-900 dark:text-white mb-3">Food Courts</h4>
                <div className="flex flex-wrap gap-2">
                  {locations.map(loc => (
                    <button
                      key={loc}
                      onClick={() => toggleSelection(selectedLocations, loc, setSelectedLocations)}
                      className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors border ${selectedLocations.includes(loc)
                          ? 'bg-primary-100 dark:bg-primary-900/40 border-primary-500 text-primary-700 dark:text-primary-300'
                          : 'bg-gray-50 dark:bg-dark-800 border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-dark-700'
                        }`}
                    >
                      {loc}
                    </button>
                  ))}
                </div>
              </div>

              {/* Origins */}
              <div>
                <h4 className="font-semibold text-gray-900 dark:text-white mb-3">Origin</h4>
                <div className="flex flex-wrap gap-2">
                  {origins.map(origin => (
                    <button
                      key={origin}
                      onClick={() => toggleSelection(selectedOrigins, origin, setSelectedOrigins)}
                      className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors border ${selectedOrigins.includes(origin)
                          ? 'bg-primary-100 dark:bg-primary-900/40 border-primary-500 text-primary-700 dark:text-primary-300'
                          : 'bg-gray-50 dark:bg-dark-800 border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-dark-700'
                        }`}
                    >
                      {origin}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="p-5 border-t dark:border-gray-800 sticky bottom-0 bg-white dark:bg-dark-900 z-10 flex gap-3">
              <button
                onClick={clearFilters}
                className="flex-1 py-3 px-4 rounded-xl border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-white font-medium hover:bg-gray-50 dark:hover:bg-dark-800 transition-colors"
              >
                Clear All
              </button>
              <button
                onClick={() => setIsFilterOpen(false)}
                className="flex-1 py-3 px-4 rounded-xl bg-primary-600 hover:bg-primary-700 text-white font-bold shadow-lg shadow-primary-500/30 transition-all hover:scale-[1.02]"
              >
                Apply Filters
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VendorList;
