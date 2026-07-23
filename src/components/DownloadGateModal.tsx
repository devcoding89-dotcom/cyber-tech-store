import { useState, useEffect } from 'react';
import { Download, Smartphone, CheckCircle2, Sparkles, ShieldCheck, ArrowRight, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';

const STORAGE_KEY = 'cybertech_app_downloaded';

export default function DownloadGateModal() {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [isDownloading, setIsDownloading] = useState<boolean>(false);
  const [hasDownloaded, setHasDownloaded] = useState<boolean>(false);

  useEffect(() => {
    // Check if the user has already downloaded the app in a previous session
    const downloaded = localStorage.getItem(STORAGE_KEY);
    if (!downloaded) {
      setIsOpen(true);
    } else {
      setHasDownloaded(true);
    }
  }, []);

  // Handler to trigger app download and unlock the website
  const handleDownloadApp = () => {
    setIsDownloading(true);

    // Create a downloadable app installer package
    const apkFileName = 'CyberTechStore-MobileApp.apk';
    const sampleContent = 'Cyber Tech Store Mobile App Package';
    const blob = new Blob([sampleContent], { type: 'application/vnd.android.package-archive' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = apkFileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    // Save download status in localStorage so existing users won't see this modal again
    localStorage.setItem(STORAGE_KEY, 'true');
    setHasDownloaded(true);

    // Delay closing slightly so user sees success confirmation
    setTimeout(() => {
      setIsDownloading(false);
      setIsOpen(false);
    }, 1400);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-300">
      <div className="relative w-full max-w-lg bg-[#0B0F17] border border-[#3B82F6]/30 rounded-2xl p-6 sm:p-8 shadow-2xl shadow-[#3B82F6]/20 overflow-hidden">
        {/* Glowing Background Accents */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-[#3B82F6]/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-[#9333EA]/20 rounded-full blur-3xl pointer-events-none" />

        {/* Modal Header Icon */}
        <div className="flex justify-center mb-5">
          <div className="relative w-20 h-20 rounded-2xl gradient-gold p-[2px] shadow-lg shadow-[#3B82F6]/30 flex items-center justify-center">
            <div className="w-full h-full bg-[#0B0F17] rounded-[14px] flex items-center justify-center">
              <Smartphone className="w-10 h-10 text-[#3B82F6] animate-pulse" />
            </div>
            <div className="absolute -bottom-1 -right-1 bg-[#3B82F6] rounded-full p-1 text-black">
              <Zap className="w-4 h-4 fill-current" />
            </div>
          </div>
        </div>

        {/* Title & Subtitle */}
        <div className="text-center space-y-2 mb-6">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#3B82F6]/10 text-[#3B82F6] border border-[#3B82F6]/20">
            <Sparkles className="w-3.5 h-3.5" />
            Required App Installation
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white font-['Orbitron'] tracking-wide">
            Download App to Continue
          </h2>
          <p className="text-sm text-gray-300">
            Welcome to <span className="text-[#3B82F6] font-semibold">Cyber Tech Store</span>. Please download our official mobile application to unlock full access to the store.
          </p>
        </div>

        {/* Benefits List */}
        <div className="bg-white/5 border border-white/10 rounded-xl p-4 mb-6 space-y-3">
          <div className="flex items-center gap-3 text-sm text-gray-200">
            <CheckCircle2 className="w-5 h-5 text-[#3B82F6] shrink-0" />
            <span>Instant access to exclusive gadgets & deals</span>
          </div>
          <div className="flex items-center gap-3 text-sm text-gray-200">
            <CheckCircle2 className="w-5 h-5 text-[#3B82F6] shrink-0" />
            <span>Fast track order updates & tracking</span>
          </div>
          <div className="flex items-center gap-3 text-sm text-gray-200">
            <ShieldCheck className="w-5 h-5 text-[#9333EA] shrink-0" />
            <span>Secure 1-click order placement</span>
          </div>
        </div>

        {/* Action Button */}
        {hasDownloaded && !isDownloading ? (
          <div className="flex flex-col items-center gap-2 p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-400">
            <CheckCircle2 className="w-8 h-8 animate-bounce" />
            <span className="font-semibold text-sm">Download Complete! Opening Website...</span>
          </div>
        ) : (
          <Button
            onClick={handleDownloadApp}
            disabled={isDownloading}
            className="w-full py-6 text-base font-bold gradient-gold text-black hover:opacity-95 shadow-lg shadow-[#3B82F6]/25 transition-all flex items-center justify-center gap-2 group"
          >
            {isDownloading ? (
              <>
                <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin" />
                <span>Downloading App Package...</span>
              </>
            ) : (
              <>
                <Download className="w-5 h-5 group-hover:translate-y-0.5 transition-transform" />
                <span>Download App Now</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform ml-1" />
              </>
            )}
          </Button>
        )}

        {/* Footnote */}
        <p className="text-xs text-center text-gray-500 mt-4">
          Once downloaded, existing users will not be prompted again.
        </p>
      </div>
    </div>
  );
}
