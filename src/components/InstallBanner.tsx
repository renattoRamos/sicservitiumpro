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
                initial={{ y: 50, opacity: 0, scale: 0.95 }}
                animate={{ y: 0, opacity: 1, scale: 1 }}
                exit={{ y: 50, opacity: 0, scale: 0.95 }}
                transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                className="fixed bottom-6 left-6 right-6 z-[100] md:left-auto md:right-6 md:w-[400px]"
            >
                <div className="neo-card p-6 overflow-hidden relative group border-t-4 border-primary">
                    <button
                        onClick={dismissBanner}
                        className="absolute top-3 right-3 text-slate-400 hover:text-primary transition-colors p-1"
                        aria-label="Fechar"
                    >
                        <X size={20} />
                    </button>

                    <div className="space-y-6">
                        <motion.div
                            initial={{ x: -20, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            transition={{ delay: 0.2 }}
                            className="flex items-center gap-4"
                        >
                            <div className="bg-primary/10 rounded-2xl p-4 text-primary shrink-0">
                                <Download size={32} />
                            </div>

                            <div className="flex-1 min-w-0">
                                <h3 className="font-bold text-foreground text-xl leading-tight">
                                    Instalar Servitium
                                </h3>
                                <p className="text-muted-foreground text-sm mt-1">
                                    Acesse o sistema CPR/CMA SUL direto da tela inicial.
                                </p>
                            </div>
                        </motion.div>

                        <motion.div
                            initial={{ y: 10, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.3 }}
                        >
                            {platform === 'ios' ? (
                                <div className="bg-muted/50 rounded-2xl p-4 space-y-3 border border-border">
                                    <p className="text-sm font-medium text-foreground flex items-center gap-2">
                                        Instruções para iPhone:
                                    </p>

                                    <div className="grid grid-cols-1 gap-3">
                                        <div className="flex items-center gap-3 text-sm text-muted-foreground">
                                            <div className="bg-background border border-border rounded-lg p-2 shadow-sm">
                                                <Share size={18} className="text-secondary" />
                                            </div>
                                            <span>1. Toque no botão de <strong>Compartilhar</strong></span>
                                        </div>

                                        <div className="flex items-center gap-3 text-sm text-muted-foreground">
                                            <div className="bg-background border border-border rounded-lg p-2 shadow-sm">
                                                <PlusSquare size={18} className="text-secondary" />
                                            </div>
                                            <span>2. Selecione <strong>Tela de Início</strong></span>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <Button
                                    onClick={handleInstallClick}
                                    className="w-full h-14 text-lg font-bold bg-secondary hover:bg-secondary/90 text-white shadow-lg shadow-secondary/20 transition-all hover:scale-[1.02] active:scale-95 rounded-2xl"
                                >
                                    Instalar Agora
                                </Button>
                            )}
                        </motion.div>

                        <div className="flex justify-center">
                            <div className="h-1 w-12 bg-muted rounded-full opacity-50" />
                        </div>
                    </div>
                </div>
            </motion.div>
        </AnimatePresence>
    );
};

export default InstallBanner;
