import React, { useState } from 'react';
import { Download, RefreshCw, WifiOff, X, Sparkles, Smartphone, Check } from 'lucide-react';
import { usePWA } from '../../hooks/usePWA';

export const PWAInstallBanner: React.FC = () => {
  const {
    isInstallable,
    isInstalled,
    isOnline,
    hasUpdate,
    installApp,
    applyUpdate,
    dismissInstallPrompt,
  } = usePWA();

  const [dismissedOffline, setDismissedOffline] = useState(false);
  const [isInstalling, setIsInstalling] = useState(false);

  const handleInstall = async () => {
    setIsInstalling(true);
    await installApp();
    setIsInstalling(false);
  };

  return (
    <>
      {/* 1. Offline Mode Banner */}
      {!isOnline && !dismissedOffline && (
        <div className="fixed top-18 left-4 right-4 md:left-auto md:right-8 z-50 max-w-md animate-fade-in">
          <div className="p-3.5 rounded-2xl bg-zinc-900/95 dark:bg-zinc-900/95 border border-amber-500/40 text-white shadow-xl backdrop-blur-md flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400 shrink-0">
                <WifiOff className="w-4 h-4" />
              </div>
              <div className="min-w-0 text-xs">
                <p className="font-bold text-amber-300">Modo Sin Conexión Activo</p>
                <p className="text-[11px] text-zinc-400 truncate">Tus bitácoras y tablas continúan funcionando localmente.</p>
              </div>
            </div>
            <button
              onClick={() => setDismissedOffline(true)}
              className="p-1 rounded-lg hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* 2. New Version Update Toast */}
      {hasUpdate && (
        <div className="fixed bottom-20 md:bottom-6 right-4 left-4 sm:left-auto sm:right-6 z-50 max-w-sm animate-bounce-subtle">
          <div className="p-4 rounded-[1.75rem] bg-emerald-950/95 border border-emerald-500/60 text-white shadow-2xl backdrop-blur-md space-y-3">
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-300">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-emerald-200">Nueva Versión de Cultiva</h4>
                  <p className="text-[11px] text-emerald-300/80">Actualización botánica lista para instalar.</p>
                </div>
              </div>
            </div>

            <button
              onClick={applyUpdate}
              className="w-full py-2.5 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold text-xs flex items-center justify-center gap-2 shadow-md shadow-emerald-500/20 transition-all cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Actualizar Ahora</span>
            </button>
          </div>
        </div>
      )}

      {/* 3. Android "Add to Home Screen" Install Banner */}
      {isInstallable && !isInstalled && (
        <div className="fixed bottom-20 md:bottom-6 left-4 right-4 sm:left-auto sm:right-6 z-50 max-w-sm animate-fade-in">
          <div className="p-4 sm:p-5 rounded-[2rem] bg-white dark:bg-zinc-900 border border-emerald-500/30 dark:border-emerald-500/40 shadow-2xl space-y-3">
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-emerald-900 dark:bg-emerald-950 flex items-center justify-center text-xl shrink-0 shadow-xs">
                  🌱
                </div>
                <div>
                  <h4 className="text-xs sm:text-sm font-bold text-zinc-900 dark:text-zinc-100">
                    Instalar Cultiva en Android
                  </h4>
                  <p className="text-[11px] text-zinc-500 leading-tight mt-0.5">
                    Acceso rápido desde tu pantalla de inicio y funcionamiento offline.
                  </p>
                </div>
              </div>

              <button
                onClick={dismissInstallPrompt}
                className="p-1 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex items-center gap-2 pt-1">
              <button
                onClick={handleInstall}
                disabled={isInstalling}
                className="flex-1 py-2.5 px-4 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md shadow-emerald-600/25 transition-all cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>{isInstalling ? 'Instalando...' : 'Instalar App'}</span>
              </button>

              <button
                onClick={dismissInstallPrompt}
                className="py-2.5 px-4 rounded-full bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-600 dark:text-zinc-300 font-semibold text-xs transition-colors cursor-pointer"
              >
                Ahora no
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};