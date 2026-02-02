import React, { useState, useEffect } from 'react';
import { X, Download, Share, PlusSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';

interface BeforeInstallPromptEvent extends Event {
    readonly platforms: string[];
    readonly userChoice: Promise<{
        outcome: 'accepted' | 'dismissed';
        platform: string;
    }>;
    prompt(): Promise<void>;
}

const InstallBanner: React.FC = () => {
    const [showBanner, setShowBanner] = useState(false);
    const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
    const [platform, setPlatform] = useState<'ios' | 'android' | 'other'>('other');

    useEffect(() => {
        // Check if already installed
        if (window.matchMedia('(display-mode: standalone)').matches) {
            return;
        }

        // OS Detection
        const userAgent = window.navigator.userAgent.toLowerCase();
        if (/iphone|ipad|ipod/.test(userAgent)) {
            setPlatform('ios');
        } else if (/android/.test(userAgent)) {
            setPlatform('android');
        }

        // BeforeInstallPrompt for Android/Chrome
        const handler = (e: Event) => {
            e.preventDefault();
            setDeferredPrompt(e as BeforeInstallPromptEvent);
            setShowBanner(true);
        };

        window.addEventListener('beforeinstallprompt', handler);

        // Show banner for iOS after a small delay if not already installed
        if (/iphone|ipad|ipod/.test(userAgent) && !window.matchMedia('(display-mode: standalone)').matches) {
            const timer = setTimeout(() => {
                const dismissed = localStorage.getItem('pwa-banner-dismissed');
                if (!dismissed) setShowBanner(true);
            }, 3000);
            return () => clearTimeout(timer);
        }

        return () => window.removeEventListener('beforeinstallprompt', handler);
    }, []);

    const handleInstallClick = async () => {
        if (deferredPrompt) {
            deferredPrompt.prompt();
            const { outcome } = await deferredPrompt.userChoice;
            if (outcome === 'accepted') {
                setDeferredPrompt(null);
                setShowBanner(false);
            }
        }
    };

    const dismissBanner = () => {
        setShowBanner(false);
        localStorage.setItem('pwa-banner-dismissed', 'true');
    };

    if (!showBanner) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ y: 100, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 100, opacity: 0 }}
                className="fixed bottom-4 left-4 right-4 z-[100] md:left-auto md:right-4 md:w-96"
            >
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl p-4 overflow-hidden relative group">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-sky-500 to-indigo-500" />

                    <button
                        onClick={dismissBanner}
                        className="absolute top-2 right-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                    >
                        <X size={20} />
                    </button>

                    <div className="flex items-start gap-4">
                        <div className="bg-sky-500 rounded-xl p-2.5 text-white shadow-lg shadow-sky-500/20">
                            <Download size={24} />
                        </div>

                        <div className="flex-1">
                            <h3 className="font-bold text-slate-900 dark:text-white text-lg">
                                Instalar Servitium
                            </h3>
                            <p className="text-slate-600 dark:text-slate-400 text-sm mt-0.5 leading-tight">
                                Acesso rápido e offline direto da sua tela inicial.
                            </p>
                        </div>
                    </div>

                    <div className="mt-4 flex flex-col gap-2">
                        {platform === 'ios' ? (
                            <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-3 border border-slate-100 dark:border-slate-800 text-sm animate-pulse">
                                <div className="flex items-center gap-2 mb-1 text-slate-700 dark:text-slate-300">
                                    <span>Toque em </span>
                                    <div className="bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded p-1 inline-flex items-center">
                                        <Share size={14} className="text-sky-600" />
                                    </div>
                                    <span> depois em </span>
                                </div>
                                <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                                    <div className="bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded p-1 inline-flex items-center">
                                        <PlusSquare size={14} className="text-sky-600" />
                                    </div>
                                    <span className="font-medium text-sky-600">Tela de Início</span>
                                </div>
                            </div>
                        ) : (
                            <Button
                                onClick={handleInstallClick}
                                className="w-full bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-600 hover:to-indigo-700 text-white border-0 shadow-lg shadow-sky-500/25 h-11 text-base font-semibold transition-all active:scale-95"
                            >
                                Instalar agora
                            </Button>
                        )}
                    </div>
                </div>
            </motion.div>
        </AnimatePresence>
    );
};

export default InstallBanner;
