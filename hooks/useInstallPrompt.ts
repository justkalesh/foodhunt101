import { useState, useEffect, useCallback } from 'react';

// Module-level variable shared across all hook instances
let deferredPrompt: any = null;

const DISMISS_KEY = 'fh_install_dismissed';

function isDismissed(): boolean {
  try {
    return sessionStorage.getItem(DISMISS_KEY) === 'true';
  } catch {
    return false;
  }
}

function setDismissed(): void {
  try {
    sessionStorage.setItem(DISMISS_KEY, 'true');
  } catch {
    // Storage full or blocked — ignore
  }
}

function getIsStandalone(): boolean {
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    (window.navigator as any).standalone === true
  );
}

function getIsIOS(): boolean {
  return /iPhone|iPad|iPod/i.test(navigator.userAgent) && !(window as any).MSStream;
}

export function useInstallPrompt() {
  const [isInstallable, setIsInstallable] = useState(false);
  const [isInstalled, setIsInstalled] = useState(getIsStandalone);
  const [isIOS, setIsIOS] = useState(false);
  const [dismissed, setDismissedState] = useState(isDismissed);

  useEffect(() => {
    // Already running as installed PWA — nothing to show
    if (getIsStandalone()) {
      setIsInstalled(true);
      return;
    }

    setIsIOS(getIsIOS());

    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      deferredPrompt = e;
      setIsInstallable(true);
    };

    const handleAppInstalled = () => {
      deferredPrompt = null;
      setIsInstalled(true);
      setIsInstallable(false);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);
    window.addEventListener('appinstalled', handleAppInstalled);

    // If event already fired before hook mounted
    if (deferredPrompt) {
      setIsInstallable(true);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const promptInstall = useCallback(async (): Promise<boolean> => {
    if (!deferredPrompt) return false;
    try {
      deferredPrompt.prompt();
      const result = await deferredPrompt.userChoice;
      if (result.outcome === 'accepted') {
        setIsInstalled(true);
        setIsInstallable(false);
      }
      deferredPrompt = null;
      return result.outcome === 'accepted';
    } catch {
      return false;
    }
  }, []);

  const dismiss = useCallback(() => {
    setDismissed();
    setDismissedState(true);
  }, []);

  // Show the popup if:
  // - Not already installed as PWA
  // - Not dismissed within the last 7 days
  const shouldShowPopup = !isInstalled && !dismissed;

  return {
    isInstallable,
    isInstalled,
    isIOS,
    shouldShowPopup,
    promptInstall,
    dismiss,
  };
}
