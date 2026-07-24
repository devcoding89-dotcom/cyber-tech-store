import { useState, useEffect } from 'react';
import { Download, Smartphone, CheckCircle2, Sparkles, ShieldCheck, ArrowRight, Zap, X, Share2, MoreVertical } from 'lucide-react';
import { Button } from '@/components/ui/button';

const STORAGE_KEY = 'cybertech_app_downloaded';

const isStandaloneMode = () => {
  const standalone = (window.navigator as Navigator & { standalone?: boolean }).standalone;
  const displayMode = window.matchMedia('(display-mode: standalone)').matches;
  return Boolean(standalone || displayMode);
};

const isMobileDevice = () => /android|iphone|ipad|ipod/i.test(navigator.userAgent);

export default function DownloadGateModal() {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [isInstalling, setIsInstalling] = useState<boolean>(false);
  const [installed, setInstalled] = useState<boolean>(false);
  const [showInstructions, setShowInstructions] = useState<boolean>(false);
  const [isIOS, setIsIOS] = useState<boolean>(false);

  useEffect(() => {
    const ios = /iphone|ipad|ipod/.test(navigator.userAgent.toLowerCase());
    setIsIOS(ios);

    const alreadyDownloaded = localStorage.getItem(STORAGE_KEY) === 'true';
    const alreadyInstalled = isStandaloneMode();

    if (!alreadyDownloaded && !alreadyInstalled && isMobileDevice()) {
      setIsOpen(true);
    }

    const handleInstallPrompt = (e: Event) => {
      e.preventDefault();
      (window as any).__pwaInstallPrompt = e;
    };

    const handleAppInstalled = () => {
      localStorage.setItem(STORAGE_KEY, 'true');
      setInstalled(true);
      setIsOpen(false);
    };

    window.addEventListener('beforeinstallprompt', handleInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstallClick = async () => {
    const prompt = (window as any).__pwaInstallPrompt;

    if (prompt) {
      setIsInstalling(true);
      try {
        await prompt.prompt();
        const { outcome } = await prompt.userChoice;

        if (outcome === 'accepted') {
          localStorage.setItem(STORAGE_KEY, 'true');
          setInstalled(true);
          setTimeout(() => setIsOpen(false), 1500);
        } else {
          setShowInstructions(true);
        }
      } catch {
        setShowInstructions(true);
      } finally {
        setIsInstalling(false);
        (window as any).__pwaInstallPrompt = null;
      }
    } else {
      setShowInstructions(true);
    }
  };

  const handleConfirmDone = () => {
    localStorage.setItem(STORAGE_KEY, 'true');
    setIsOpen(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
      <div className="relative w-full max-w-lg bg-[#0B0F17] border border-[#3B82F6]/30 rounded-2xl p-6 sm:p-8 shadow-2xl overflow-hidden">
        {/* Glow blobs */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-[#3B82F6]/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-[#9333EA]/20 rounded-full blur-3xl pointer-events-none" />

        {!showInstructions ? (
          /* ─── Main Install Screen ─── */
          <>
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

            <div className="text-center space-y-2 mb-6">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#3B82F6]/10 text-[#3B82F6] border border-[#3B82F6]/20">
                <Sparkles className="w-3.5 h-3.5" />
                Free App — No Play Store Required
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white font-['Orbitron']">
                Install the App First
              </h2>
              <p className="text-sm text-gray-300">
                Add <span className="text-[#3B82F6] font-semibold">Cyber Tech Store</span> to your home screen and get full app access for free.
              </p>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-xl p-4 mb-6 space-y-3">
              <div className="flex items-center gap-3 text-sm text-gray-200">
                <CheckCircle2 className="w-5 h-5 text-[#3B82F6] shrink-0" />
                <span>Works like a real app — no Play Store needed</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-gray-200">
                <CheckCircle2 className="w-5 h-5 text-[#3B82F6] shrink-0" />
                <span>Shows as icon on your phone home screen</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-gray-200">
                <ShieldCheck className="w-5 h-5 text-[#9333EA] shrink-0" />
                <span>100% free — fast & secure</span>
              </div>
            </div>

            {installed ? (
              <div className="flex flex-col items-center gap-2 p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-400">
                <CheckCircle2 className="w-8 h-8 animate-bounce" />
                <span className="font-semibold text-sm">App Installed! Entering Store...</span>
              </div>
            ) : (
              <Button
                onClick={handleInstallClick}
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
                    <span>Add App to My Phone</span>
                    <ArrowRight className="w-5 h-5 ml-1 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </Button>
            )}

            <p className="text-xs text-center text-gray-500 mt-4">
              Tap the button above then follow the prompt on your phone
            </p>
          </>
        ) : (
          /* ─── Step-by-Step Instructions ─── */
          <div className="space-y-5">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold text-white font-['Orbitron']">Add to Home Screen</h3>
              <button
                onClick={() => setShowInstructions(false)}
                className="text-gray-500 hover:text-white transition-colors p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-sm text-gray-400">Follow these quick steps to install the app on your phone:</p>

            {isIOS ? (
              <div className="space-y-3">
                <p className="text-xs font-bold text-[#3B82F6] uppercase tracking-wider">iPhone / iPad (Safari)</p>
                {[
                  { step: '1', icon: <Share2 className="w-4 h-4 text-[#3B82F6]" />, text: 'Tap the Share button (📤) at the bottom of Safari' },
                  { step: '2', icon: <Smartphone className="w-4 h-4 text-[#3B82F6]" />, text: 'Scroll down and tap "Add to Home Screen"' },
                  { step: '3', icon: <CheckCircle2 className="w-4 h-4 text-emerald-400" />, text: 'Tap "Add" in the top right corner' },
                  { step: '4', icon: <Zap className="w-4 h-4 text-yellow-400" />, text: 'Done! CyberTech icon appears on your home screen 🎉' },
                ].map(({ step, icon, text }) => (
                  <div key={step} className="flex items-start gap-3 bg-white/5 rounded-xl p-3">
                    <div className="w-7 h-7 rounded-full gradient-gold flex items-center justify-center text-black font-bold text-sm shrink-0">{step}</div>
                    <div className="flex items-start gap-2">
                      <span className="mt-0.5 shrink-0">{icon}</span>
                      <p className="text-sm text-gray-200">{text}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-3">
                <p className="text-xs font-bold text-[#3B82F6] uppercase tracking-wider">Android (Chrome)</p>
                {[
                  { step: '1', icon: <MoreVertical className="w-4 h-4 text-[#3B82F6]" />, text: 'Tap the 3-dot menu (⋮) in the top right of Chrome' },
                  { step: '2', icon: <Smartphone className="w-4 h-4 text-[#3B82F6]" />, text: 'Tap "Add to Home screen"' },
                  { step: '3', icon: <CheckCircle2 className="w-4 h-4 text-emerald-400" />, text: 'Tap "Add" to confirm' },
                  { step: '4', icon: <Zap className="w-4 h-4 text-yellow-400" />, text: 'Done! CyberTech icon appears on your home screen 🎉' },
                ].map(({ step, icon, text }) => (
                  <div key={step} className="flex items-start gap-3 bg-white/5 rounded-xl p-3">
                    <div className="w-7 h-7 rounded-full gradient-gold flex items-center justify-center text-black font-bold text-sm shrink-0">{step}</div>
                    <div className="flex items-start gap-2">
                      <span className="mt-0.5 shrink-0">{icon}</span>
                      <p className="text-sm text-gray-200">{text}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <Button
              onClick={handleConfirmDone}
              className="w-full py-4 gradient-gold text-black font-bold hover:opacity-95 transition-all"
            >
              <CheckCircle2 className="w-5 h-5 mr-2" />
              I've Added It — Take Me to the Store
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
