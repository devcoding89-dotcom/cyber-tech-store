import { useState, useEffect } from 'react';
import { Download, Smartphone, CheckCircle2, Sparkles, ShieldCheck, ArrowRight, Zap, X, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';

const STORAGE_KEY = 'cybertech_app_downloaded';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export default function DownloadGateModal() {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [isInstalling, setIsInstalling] = useState<boolean>(false);
  const [hasDownloaded, setHasDownloaded] = useState<boolean>(false);
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showManualInstructions, setShowManualInstructions] = useState<boolean>(false);
  const [isIOS, setIsIOS] = useState<boolean>(false);

  useEffect(() => {
    // Detect iOS (Safari doesn't support beforeinstallprompt)
    const ios = /iphone|ipad|ipod/.test(navigator.userAgent.toLowerCase());
    setIsIOS(ios);

    // Check if already downloaded/installed
    const downloaded = localStorage.getItem(STORAGE_KEY);
    if (!downloaded) {
      setIsOpen(true);
    } else {
      setHasDownloaded(true);
    }

    // Capture the install prompt for Android/Desktop Chrome
    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };
    window.addEventListener('beforeinstallprompt', handleBeforeInstall);

    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
  }, []);

  const handleInstallApp = async () => {
    if (deferredPrompt) {
      // Native browser install prompt (Android Chrome)
      setIsInstalling(true);
      await deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        localStorage.setItem(STORAGE_KEY, 'true');
        setHasDownloaded(true);
        setTimeout(() => {
          setIsInstalling(false);
          setIsOpen(false);
        }, 1200);
      } else {
        setIsInstalling(false);
      }
      setDeferredPrompt(null);
    } else {
      // No native prompt (iOS or already installed) — show manual instructions
      setShowManualInstructions(true);
    }
  };

  const handleDoneManually = () => {
    localStorage.setItem(STORAGE_KEY, 'true');
    setHasDownloaded(true);
    setIsOpen(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
      <div className="relative w-full max-w-lg bg-[#0B0F17] border border-[#3B82F6]/30 rounded-2xl p-6 sm:p-8 shadow-2xl shadow-[#3B82F6]/20 overflow-hidden">
        {/* Glow accents */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-[#3B82F6]/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-[#9333EA]/20 rounded-full blur-3xl pointer-events-none" />

        {!showManualInstructions ? (
          <>
            {/* Icon */}
            <div className="flex justify-center mb-5">
              <div className="relative w-20 h-20 rounded-2xl gradient-gold p-[2px] shadow-lg shadow-[#3B82F6]/30">
                <div className="w-full h-full bg-[#0B0F17] rounded-[14px] flex items-center justify-center">
                  <Smartphone className="w-10 h-10 text-[#3B82F6] animate-pulse" />
                </div>
                <div className="absolute -bottom-1 -right-1 bg-[#3B82F6] rounded-full p-1">
                  <Zap className="w-4 h-4 text-black fill-current" />
                </div>
              </div>
            </div>

            {/* Title */}
            <div className="text-center space-y-2 mb-6">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#3B82F6]/10 text-[#3B82F6] border border-[#3B82F6]/20">
                <Sparkles className="w-3.5 h-3.5" />
                Install App to Continue
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white font-['Orbitron'] tracking-wide">
                Get Our Mobile App
              </h2>
              <p className="text-sm text-gray-300">
                Install <span className="text-[#3B82F6] font-semibold">Cyber Tech Store</span> on your phone to unlock full access.
              </p>
            </div>

            {/* Benefits */}
            <div className="bg-white/5 border border-white/10 rounded-xl p-4 mb-6 space-y-3">
              <div className="flex items-center gap-3 text-sm text-gray-200">
                <CheckCircle2 className="w-5 h-5 text-[#3B82F6] shrink-0" />
                <span>Exclusive gadget deals & offers</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-gray-200">
                <CheckCircle2 className="w-5 h-5 text-[#3B82F6] shrink-0" />
                <span>Real-time order tracking</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-gray-200">
                <ShieldCheck className="w-5 h-5 text-[#9333EA] shrink-0" />
                <span>Fast & secure checkout</span>
              </div>
            </div>

            {/* Action */}
            {hasDownloaded ? (
              <div className="flex flex-col items-center gap-2 p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-400">
                <CheckCircle2 className="w-8 h-8 animate-bounce" />
                <span className="font-semibold text-sm">App Installed! Opening Website...</span>
              </div>
            ) : (
              <Button
                onClick={handleInstallApp}
                disabled={isInstalling}
                className="w-full py-6 text-base font-bold gradient-gold text-black hover:opacity-95 shadow-lg transition-all flex items-center justify-center gap-2 group"
              >
                {isInstalling ? (
                  <>
                    <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin" />
                    <span>Installing...</span>
                  </>
                ) : (
                  <>
                    <Download className="w-5 h-5 group-hover:translate-y-0.5 transition-transform" />
                    <span>{deferredPrompt ? 'Install App to Phone' : 'Add App to Home Screen'}</span>
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform ml-1" />
                  </>
                )}
              </Button>
            )}

            <p className="text-xs text-center text-gray-500 mt-4">
              FREE • No Play Store required • Works on Android & iPhone
            </p>
          </>
        ) : (
          /* Manual Instructions Panel */
          <div className="space-y-5">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold text-white font-['Orbitron']">Add to Home Screen</h3>
              <button onClick={() => setShowManualInstructions(false)} className="text-gray-500 hover:text-white transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex items-start gap-2 bg-[#3B82F6]/10 border border-[#3B82F6]/20 rounded-xl p-3">
              <Info className="w-4 h-4 text-[#3B82F6] shrink-0 mt-0.5" />
              <p className="text-xs text-gray-300">Follow these steps to install the app on your phone's home screen — it will look and work like a real app!</p>
            </div>

            {isIOS ? (
              /* iOS Steps */
              <div className="space-y-3">
                <p className="text-xs font-semibold text-[#3B82F6] uppercase tracking-wider">iPhone / iPad (Safari)</p>
                {[
                  { step: '1', text: 'Tap the Share button (📤) at the bottom of Safari' },
                  { step: '2', text: 'Scroll down and tap "Add to Home Screen"' },
                  { step: '3', text: 'Tap "Add" in the top right corner' },
                  { step: '4', text: 'The CyberTech icon will appear on your home screen!' },
                ].map(({ step, text }) => (
                  <div key={step} className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full gradient-gold flex items-center justify-center text-black font-bold text-xs shrink-0">{step}</div>
                    <p className="text-sm text-gray-300">{text}</p>
                  </div>
                ))}
              </div>
            ) : (
              /* Android / Chrome Steps */
              <div className="space-y-3">
                <p className="text-xs font-semibold text-[#3B82F6] uppercase tracking-wider">Android (Chrome)</p>
                {[
                  { step: '1', text: 'Tap the 3-dot menu (⋮) in the top right of Chrome' },
                  { step: '2', text: 'Tap "Add to Home screen"' },
                  { step: '3', text: 'Tap "Add" to confirm' },
                  { step: '4', text: 'The CyberTech app icon will appear on your home screen!' },
                ].map(({ step, text }) => (
                  <div key={step} className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full gradient-gold flex items-center justify-center text-black font-bold text-xs shrink-0">{step}</div>
                    <p className="text-sm text-gray-300">{text}</p>
                  </div>
                ))}
              </div>
            )}

            <Button
              onClick={handleDoneManually}
              className="w-full py-4 gradient-gold text-black font-bold hover:opacity-95 transition-all"
            >
              <CheckCircle2 className="w-5 h-5 mr-2" />
              I've Added It — Continue to Website
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
