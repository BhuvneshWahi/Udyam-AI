// UDYAM AI — PWA Manager (Service Worker & Install Prompt Hook)

export interface PwaState {
  isInstallable: boolean;
  isInstalled: boolean;
  isRegistered: boolean;
  registration: ServiceWorkerRegistration | null;
}

class PwaManager {
  private deferredPrompt: any = null;
  private isInstalled: boolean = false;
  private registration: ServiceWorkerRegistration | null = null;
  private listeners: Set<(state: PwaState) => void> = new Set();

  constructor() {
    if (typeof window !== 'undefined') {
      // Check if launched as standalone PWA
      this.isInstalled = 
        window.matchMedia('(display-mode: standalone)').matches ||
        (window.navigator as any).standalone === true ||
        document.referrer.includes('android-app://');

      // Listen for display-mode changes
      window.matchMedia('(display-mode: standalone)').addEventListener('change', (e) => {
        this.isInstalled = e.matches;
        this.notifyListeners();
      });

      // Capture beforeinstallprompt
      window.addEventListener('beforeinstallprompt', (e: Event) => {
        e.preventDefault();
        this.deferredPrompt = e;
        this.notifyListeners();
      });

      // Capture appinstalled
      window.addEventListener('appinstalled', () => {
        this.deferredPrompt = null;
        this.isInstalled = true;
        this.notifyListeners();
        console.log('[UDYAM AI PWA] Successfully installed to home screen / desktop');
      });
    }
  }

  public async registerServiceWorker(): Promise<ServiceWorkerRegistration | null> {
    if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
      return null;
    }

    try {
      const registration = await navigator.serviceWorker.register('/sw.js', {
        scope: '/'
      });
      this.registration = registration;
      console.log('[UDYAM AI PWA] Service Worker registered with scope:', registration.scope);

      // Check for updates
      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing;
        if (newWorker) {
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              console.log('[UDYAM AI PWA] New update available');
            }
          });
        }
      });

      this.notifyListeners();
      return registration;
    } catch (error) {
      console.warn('[UDYAM AI PWA] Service Worker registration failed (normal in some sandboxes):', error);
      return null;
    }
  }

  public getState(): PwaState {
    return {
      isInstallable: !!this.deferredPrompt,
      isInstalled: this.isInstalled,
      isRegistered: !!this.registration,
      registration: this.registration
    };
  }

  public subscribe(callback: (state: PwaState) => void): () => void {
    this.listeners.add(callback);
    callback(this.getState());
    return () => {
      this.listeners.delete(callback);
    };
  }

  public async promptInstall(): Promise<boolean> {
    if (!this.deferredPrompt) {
      // Fallback instruction if browser prompt not ready
      if (this.isInstalled) {
        alert('UDYAM AI is already installed on your device.');
      } else {
        alert('To install UDYAM AI:\n- On Chrome/Edge: Click the install icon in the address bar or browser menu.\n- On iOS Safari: Tap Share -> Add to Home Screen.');
      }
      return false;
    }

    try {
      this.deferredPrompt.prompt();
      const choice = await this.deferredPrompt.userChoice;
      this.deferredPrompt = null;
      this.notifyListeners();
      return choice.outcome === 'accepted';
    } catch (err) {
      console.error('[UDYAM AI PWA] Install prompt failed:', err);
      return false;
    }
  }

  private notifyListeners() {
    const state = this.getState();
    this.listeners.forEach((fn) => fn(state));
  }
}

export const pwaManager = new PwaManager();
