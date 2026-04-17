/**
 * LocationSelector — Responsive location picker.
 * Desktop: positioned dropdown from trigger button.
 * Mobile (<640px): slides up as a bottom sheet for thumb-friendly interaction.
 * Uses React Portal to escape parent stacking contexts.
 */

import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { MapPin, Navigation, Plus, X, Trash2, Loader, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocation } from '../contexts/LocationContext';
import { useAuth } from '../contexts/AuthContext';

const useIsMobile = () => {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 640);
  useEffect(() => {
    const handler = () => setIsMobile(window.innerWidth < 640);
    window.addEventListener('resize', handler);
    return () => window.removeEventListener('resize', handler);
  }, []);
  return isMobile;
};

const LocationSelector: React.FC = () => {
  const { user } = useAuth();
  const {
    selectedLabel,
    campusLocations,
    userAddresses,
    isGPSActive,
    gpsError,
    setManualLocation,
    startGPS,
    addUserAddress,
    deleteUserAddress,
  } = useLocation();

  const isMobile = useIsMobile();
  const [isOpen, setIsOpen] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newName, setNewName] = useState('');
  const [gettingGPS, setGettingGPS] = useState(false);
  const [newCoords, setNewCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [saving, setSaving] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Desktop: position dropdown relative to trigger button
  const [dropdownPos, setDropdownPos] = useState({ top: 0, right: 0 });

  useEffect(() => {
    if (isOpen && buttonRef.current && !isMobile) {
      const rect = buttonRef.current.getBoundingClientRect();
      setDropdownPos({
        top: rect.bottom + 8,
        right: window.innerWidth - rect.right,
      });
    }
  }, [isOpen, isMobile]);

  // Close dropdown on outside click (desktop only)
  useEffect(() => {
    if (!isOpen || isMobile) return;
    const handler = (e: MouseEvent) => {
      if (
        dropdownRef.current && !dropdownRef.current.contains(e.target as Node) &&
        buttonRef.current && !buttonRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [isOpen, isMobile]);

  // Lock body scroll when bottom sheet or modal is open on mobile
  useEffect(() => {
    if ((isOpen || showAddModal) && isMobile) {
      document.body.style.overflow = 'hidden';
      return () => { document.body.style.overflow = ''; };
    }
  }, [isOpen, showAddModal, isMobile]);

  const handleGPSSelect = () => {
    startGPS();
    setIsOpen(false);
  };

  const handleAreaSelect = (name: string, lat: number, lng: number) => {
    setManualLocation({ latitude: lat, longitude: lng }, name);
    setIsOpen(false);
  };

  const handleGetCurrentGPS = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser');
      return;
    }
    setGettingGPS(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setNewCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setGettingGPS(false);
      },
      (err) => {
        alert('Could not get location: ' + err.message);
        setGettingGPS(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const handleSaveAddress = async () => {
    if (!newName.trim() || !newCoords) return;
    setSaving(true);
    const ok = await addUserAddress(newName.trim(), newCoords.lat, newCoords.lng);
    setSaving(false);
    if (ok) {
      setShowAddModal(false);
      setNewName('');
      setNewCoords(null);
    } else {
      alert('Failed to save address');
    }
  };

  // ===== SHARED MENU CONTENT =====
  const menuContent = (
    <>
      {/* GPS Option */}
      <div className="p-2">
        <button
          onClick={handleGPSSelect}
          className={`w-full flex items-center gap-3 px-3 py-3 sm:py-2.5 rounded-xl text-sm font-medium transition-colors ${
            isGPSActive
              ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300'
              : 'hover:bg-gray-50 dark:hover:bg-slate-700 text-gray-700 dark:text-gray-200'
          }`}
        >
          <div className={`w-9 h-9 sm:w-8 sm:h-8 rounded-full flex items-center justify-center ${
            isGPSActive ? 'bg-blue-100 dark:bg-blue-900/40' : 'bg-gray-100 dark:bg-slate-600'
          }`}>
            <Navigation size={16} className={isGPSActive ? 'text-blue-600' : 'text-gray-500 dark:text-gray-400'} />
          </div>
          <div className="text-left">
            <div>Use My Location</div>
            {isGPSActive && <div className="text-xs text-blue-500">● Tracking active</div>}
            {gpsError && <div className="text-xs text-red-500">{gpsError}</div>}
          </div>
        </button>
      </div>

      <div className="border-t border-gray-100 dark:border-gray-700" />

      {/* Campus Areas */}
      <div className="p-2">
        <div className="px-3 py-1.5 text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Campus Areas</div>
        {campusLocations.map((loc) => (
          <button
            key={loc.id}
            onClick={() => handleAreaSelect(loc.name, loc.latitude, loc.longitude)}
            className={`w-full flex items-center gap-3 px-3 py-2.5 sm:py-2 rounded-xl text-sm transition-colors ${
              selectedLabel === loc.name
                ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300'
                : 'hover:bg-gray-50 dark:hover:bg-slate-700 text-gray-700 dark:text-gray-200'
            }`}
          >
            <div className="w-8 h-8 sm:w-7 sm:h-7 rounded-full bg-orange-50 dark:bg-orange-900/30 flex items-center justify-center">
              <MapPin size={14} className="text-primary-500" />
            </div>
            {loc.name}
          </button>
        ))}
      </div>

      {/* Custom Addresses */}
      {user && userAddresses.length > 0 && (
        <>
          <div className="border-t border-gray-100 dark:border-gray-700" />
          <div className="p-2">
            <div className="px-3 py-1.5 text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Saved Places</div>
            {userAddresses.map((addr) => (
              <div key={addr.id} className="flex items-center group">
                <button
                  onClick={() => handleAreaSelect(addr.name, addr.latitude, addr.longitude)}
                  className={`flex-1 flex items-center gap-3 px-3 py-2.5 sm:py-2 rounded-xl text-sm transition-colors ${
                    selectedLabel === addr.name
                      ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300'
                      : 'hover:bg-gray-50 dark:hover:bg-slate-700 text-gray-700 dark:text-gray-200'
                  }`}
                >
                  <div className="w-8 h-8 sm:w-7 sm:h-7 rounded-full bg-green-50 dark:bg-green-900/30 flex items-center justify-center">
                    <MapPin size={14} className="text-green-500" />
                  </div>
                  {addr.name}
                </button>
                <button
                  onClick={() => deleteUserAddress(addr.id)}
                  className="p-2 text-red-400 hover:text-red-600 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity"
                  title="Delete address"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Add Custom Address */}
      {user && (
        <>
          <div className="border-t border-gray-100 dark:border-gray-700" />
          <div className="p-2 pb-3">
            <button
              onClick={() => { setShowAddModal(true); setIsOpen(false); }}
              className="w-full flex items-center gap-3 px-3 py-3 sm:py-2.5 rounded-xl text-sm font-medium text-primary-600 dark:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-colors"
            >
              <div className="w-8 h-8 sm:w-7 sm:h-7 rounded-full bg-primary-50 dark:bg-primary-900/30 flex items-center justify-center">
                <Plus size={14} className="text-primary-500" />
              </div>
              Add Custom Address
            </button>
          </div>
        </>
      )}
    </>
  );

  // ===== DROPDOWN PORTAL =====
  const dropdownPortal = isOpen ? createPortal(
    <AnimatePresence>
      {/* Full-screen backdrop */}
      <motion.div
        key="backdrop"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/40 backdrop-blur-md z-[100]"
        onClick={() => setIsOpen(false)}
      />

      {isMobile ? (
        /* ===== MOBILE: Bottom Sheet ===== */
        <motion.div
          key="bottom-sheet"
          ref={dropdownRef}
          initial={{ y: '100%' }}
          animate={{ y: 0 }}
          exit={{ y: '100%' }}
          transition={{ type: 'spring', damping: 28, stiffness: 300 }}
          className="fixed bottom-0 left-0 right-0 bg-white dark:bg-slate-800 rounded-t-3xl shadow-2xl z-[101] max-h-[80vh] overflow-hidden flex flex-col"
        >
          {/* Drag handle */}
          <div className="flex justify-center pt-3 pb-1">
            <div className="w-10 h-1 rounded-full bg-gray-300 dark:bg-gray-600" />
          </div>
          {/* Header */}
          <div className="px-5 pb-3 pt-1 flex items-center justify-between border-b border-gray-100 dark:border-gray-700">
            <h3 className="text-base font-bold text-gray-900 dark:text-white">Select Location</h3>
            <button
              onClick={() => setIsOpen(false)}
              className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center"
            >
              <X size={16} className="text-gray-500" />
            </button>
          </div>
          {/* Scrollable content */}
          <div className="overflow-y-auto flex-1 overscroll-contain pb-safe">
            {menuContent}
          </div>
        </motion.div>
      ) : (
        /* ===== DESKTOP: Positioned Dropdown ===== */
        <motion.div
          key="dropdown"
          ref={dropdownRef}
          initial={{ opacity: 0, y: -8, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -8, scale: 0.95 }}
          transition={{ duration: 0.15 }}
          style={{ top: dropdownPos.top, right: dropdownPos.right }}
          className="fixed w-72 bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 z-[101] overflow-hidden max-h-[70vh] overflow-y-auto"
        >
          {menuContent}
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  ) : null;

  // ===== ADD ADDRESS MODAL =====
  const modalPortal = showAddModal ? createPortal(
    <AnimatePresence>
      <motion.div
        key="modal-backdrop"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-md"
        onClick={() => setShowAddModal(false)}
      >
        <motion.div
          initial={isMobile ? { y: '100%' } : { scale: 0.9, opacity: 0 }}
          animate={isMobile ? { y: 0 } : { scale: 1, opacity: 1 }}
          exit={isMobile ? { y: '100%' } : { scale: 0.9, opacity: 0 }}
          transition={isMobile ? { type: 'spring', damping: 28, stiffness: 300 } : undefined}
          onClick={(e) => e.stopPropagation()}
          className={`bg-white dark:bg-slate-900 shadow-2xl w-full border border-gray-200 dark:border-slate-700 ${
            isMobile ? 'rounded-t-3xl max-w-full' : 'rounded-2xl max-w-sm mx-4'
          }`}
        >
          {/* Mobile drag handle */}
          {isMobile && (
            <div className="flex justify-center pt-3 pb-1">
              <div className="w-10 h-1 rounded-full bg-gray-300 dark:bg-gray-600" />
            </div>
          )}

          <div className={`${isMobile ? 'px-5 pb-3 pt-1' : 'p-5'} border-b border-gray-100 dark:border-slate-800 flex justify-between items-center`}>
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">Add Custom Address</h2>
            <button onClick={() => setShowAddModal(false)}>
              <X size={22} className="text-gray-500" />
            </button>
          </div>

          <div className={`${isMobile ? 'px-5 py-5 pb-8' : 'p-5'} space-y-4`}>
            {/* Name Input */}
            <div>
              <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">Location Name</label>
              <input
                type="text"
                placeholder="e.g. My Hostel Room"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                className="w-full p-3 sm:p-2.5 border rounded-xl text-sm dark:bg-slate-800 dark:text-white dark:border-slate-700 focus:ring-2 focus:ring-primary-500 outline-none"
                maxLength={50}
              />
            </div>

            {/* GPS Button */}
            <div>
              <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">Coordinates</label>
              {newCoords ? (
                <div className="flex items-center gap-2 p-3 sm:p-2.5 bg-green-50 dark:bg-green-900/20 rounded-xl border border-green-200 dark:border-green-800">
                  <Navigation size={16} className="text-green-600" />
                  <span className="text-sm text-green-700 dark:text-green-300 font-medium">
                    {newCoords.lat.toFixed(6)}, {newCoords.lng.toFixed(6)}
                  </span>
                </div>
              ) : (
                <button
                  onClick={handleGetCurrentGPS}
                  disabled={gettingGPS}
                  className="w-full flex items-center justify-center gap-2 p-3 sm:p-2.5 rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-600 text-sm font-medium text-gray-600 dark:text-gray-300 hover:border-primary-400 hover:text-primary-600 transition-colors"
                >
                  {gettingGPS ? (
                    <><Loader size={16} className="animate-spin" /> Getting location...</>
                  ) : (
                    <><Navigation size={16} /> Use Current GPS</>
                  )}
                </button>
              )}
            </div>

            {/* Save Button */}
            <button
              onClick={handleSaveAddress}
              disabled={!newName.trim() || !newCoords || saving}
              className="w-full py-3 sm:py-2.5 rounded-xl font-bold text-white bg-primary-600 hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {saving ? 'Saving...' : 'Save Address'}
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>,
    document.body
  ) : null;

  return (
    <>
      {/* TRIGGER BUTTON */}
      <button
        ref={buttonRef}
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3.5 py-2 rounded-xl text-sm font-medium transition-all border ${
          isGPSActive
            ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300'
            : 'bg-white dark:bg-slate-700 border-gray-200 dark:border-gray-500 text-gray-700 dark:text-gray-200'
        }`}
      >
        {isGPSActive ? (
          <Navigation size={15} className="text-blue-500 animate-pulse" />
        ) : (
          <MapPin size={15} className="text-primary-500" />
        )}
        <span className="max-w-[100px] sm:max-w-[150px] truncate">{selectedLabel}</span>
        <ChevronDown size={14} className={`transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Portaled overlays */}
      {dropdownPortal}
      {modalPortal}
    </>
  );
};

export default LocationSelector;
