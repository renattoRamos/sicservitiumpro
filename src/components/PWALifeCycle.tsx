import React, { useEffect } from 'react';
import { useRegisterSW } from 'virtual:pwa-register/react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { RefreshCw, WifiOff } from 'lucide-react';

const PWALifeCycle: React.FC = () => {
    const {
        offlineReady: [offlineReady, setOfflineReady],
        needRefresh: [needRefresh, setNeedRefresh],
        updateServiceWorker,
    } = useRegisterSW({
        onRegistered(r) {
            // Service worker successfully registered
        },
        onRegisterError(error) {
            console.error('SW registration error', error);
        },
    });

    useEffect(() => {
        if (offlineReady) {
            toast.info("Aplicativo pronto para uso offline!", {
                description: "Você pode acessar o Servitium mesmo sem internet.",
                icon: <WifiOff className="h-4 w-4" />,
                duration: 5000,
            });
            setOfflineReady(false);
        }
    }, [offlineReady, setOfflineReady]);

    useEffect(() => {
        if (needRefresh) {
            toast("Nova versão disponível!", {
                description: "Atualize para receber as últimas melhorias.",
                action: {
                    label: "Atualizar",
                    onClick: () => updateServiceWorker(true),
                },
                duration: 10000,
                icon: <RefreshCw className="h-4 w-4" />,
            });
        }
    }, [needRefresh, updateServiceWorker]);

    return null;
};

export default PWALifeCycle;
