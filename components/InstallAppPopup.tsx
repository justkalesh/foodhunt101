import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Download, Share, Plus } from 'lucide-react';
import { useInstallPrompt } from '../hooks/useInstallPrompt';

const InstallAppPopup: React.FC = () => {
  const { shouldShowPopup, isIOS, promptInstall, dismiss } = useInstallPrompt();

  const handleInstall = async () => {
    const accepted = await promptInstall();
    if (!accepted) {
      dismiss();
    }
  };

  return (
    <AnimatePresence>
      {shouldShowPopup && (
        <>
          {/* Backdrop */}
          <motion.div
            key="install-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-0 z-[200] bg-black/50 backdrop-blur-sm"
            onClick={dismiss}
          />

          {/* Popup — centered */}
          <motion.div
            key="install-popup"
            initial={{ opacity: 0, y: 60, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 40, scale: 0.97 }}
            transition={{ type: 'spring', damping: 28, stiffness: 350 }}
            className="fixed inset-0 z-[201] flex items-center justify-center pointer-events-none px-4"
          >
            <div className="w-full max-w-sm pointer-events-auto">
              <div
                className="
                  relative overflow-hidden
                  bg-white/90 dark:bg-slate-900/90
                  backdrop-blur-xl
                  border border-gray-200/60 dark:border-slate-700/60
                  rounded-3xl
                  shadow-2xl shadow-black/20 dark:shadow-black/50
                  p-8
                "
              >
                {/* Decorative gradient orbs */}
                <div className="absolute -top-20 -right-20 w-48 h-48 bg-primary-500/15 rounded-full blur-3xl pointer-events-none" />
                <div className="absolute -bottom-16 -left-16 w-40 h-40 bg-accent-sky/10 rounded-full blur-3xl pointer-events-none" />

                {/* Content */}
                <div className="relative z-10 text-center">
                  {/* App Icon */}
                  <div className="w-20 h-20 mx-auto mb-5 rounded-2xl bg-white dark:bg-slate-800 shadow-lg shadow-primary-500/10 p-2 ring-1 ring-gray-100 dark:ring-slate-700">
                    <img
                      src="/logo.png"
                      alt="Food-Hunt"
                      className="w-full h-full object-contain rounded-xl"
                    />
                  </div>

                  {/* Title */}
                  <h2 className="text-2xl font-extrabold text-gray-900 dark:text-white mb-2 tracking-tight">
                    Install Food-Hunt
                  </h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-8 max-w-xs mx-auto leading-relaxed">
                    Get the full app experience — faster, offline-ready & always up to date.
                  </p>

                  {/* Buttons / Instructions */}
                  {isIOS ? (
                    <div className="space-y-4">
                      <div className="bg-primary-50 dark:bg-primary-900/20 rounded-2xl p-5 text-left">
                        <p className="text-sm font-semibold text-primary-700 dark:text-primary-300 mb-3 flex items-center gap-2">
                          <Download size={16} />
                          Add to Home Screen
                        </p>
                        <ol className="text-sm text-gray-600 dark:text-gray-300 space-y-3">
                          <li className="flex items-start gap-3">
                            <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary-100 dark:bg-primary-900/40 text-primary-600 dark:text-primary-400 flex items-center justify-center text-xs font-bold">1</span>
                            <span>
                              Tap the <Share size={14} className="inline text-primary-500 -mt-0.5" /> <strong>Share</strong> button in Safari
                            </span>
                          </li>
                          <li className="flex items-start gap-3">
                            <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary-100 dark:bg-primary-900/40 text-primary-600 dark:text-primary-400 flex items-center justify-center text-xs font-bold">2</span>
                            <span>
                              Scroll down and tap <Plus size={14} className="inline text-primary-500 -mt-0.5" /> <strong>"Add to Home Screen"</strong>
                            </span>
                          </li>
                          <li className="flex items-start gap-3">
                            <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary-100 dark:bg-primary-900/40 text-primary-600 dark:text-primary-400 flex items-center justify-center text-xs font-bold">3</span>
                            <span>Tap <strong>"Add"</strong> to install</span>
                          </li>
                        </ol>
                      </div>

                      <button
                        onClick={dismiss}
                        className="
                          w-full py-3.5 rounded-xl
                          text-sm font-semibold
                          text-gray-600 dark:text-gray-400
                          hover:bg-gray-100 dark:hover:bg-slate-800
                          transition-colors
                        "
                      >
                        Maybe Later
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <button
                        onClick={handleInstall}
                        className="
                          w-full py-4 rounded-xl
                          bg-gradient-to-r from-primary-600 to-primary-500
                          hover:from-primary-700 hover:to-primary-600
                          text-white font-bold text-base
                          shadow-lg shadow-primary-500/30
                          hover:shadow-xl hover:shadow-primary-500/40
                          hover:-translate-y-0.5
                          active:translate-y-0
                          transition-all duration-200
                          flex items-center justify-center gap-2
                        "
                      >
                        <Download size={20} />
                        Install
                      </button>

                      <button
                        onClick={dismiss}
                        className="
                          w-full py-3.5 rounded-xl
                          text-sm font-semibold
                          text-gray-500 dark:text-gray-400
                          hover:bg-gray-100 dark:hover:bg-slate-800
                          transition-colors
                        "
                      >
                        Maybe Later
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default InstallAppPopup;
