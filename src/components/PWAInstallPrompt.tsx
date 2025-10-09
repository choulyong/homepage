'use client';

import { useState, useEffect } from 'react';
import { Button } from './ui/Button';
import { Card } from './ui/Card';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // Service Worker 등록
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker
        .register('/sw.js')
        .then((registration) => {
          console.log('Service Worker registered:', registration);
        })
        .catch((error) => {
          console.error('Service Worker registration failed:', error);
        });
    }

    // PWA 설치 프롬프트 이벤트 리스너
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);

      // 한 번만 보여주기 (localStorage 체크)
      const promptShown = localStorage.getItem('pwa-prompt-shown');
      if (!promptShown) {
        setShowPrompt(true);
      }
    };

    // 이미 설치되었는지 확인
    const checkIfInstalled = () => {
      if (window.matchMedia('(display-mode: standalone)').matches) {
        setIsInstalled(true);
        setShowPrompt(false);
      }
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', () => {
      setIsInstalled(true);
      setShowPrompt(false);
      console.log('PWA installed');
    });

    checkIfInstalled();

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === 'accepted') {
      console.log('User accepted PWA install');
    } else {
      console.log('User dismissed PWA install');
    }

    setDeferredPrompt(null);
    setShowPrompt(false);
    localStorage.setItem('pwa-prompt-shown', 'true');
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    localStorage.setItem('pwa-prompt-shown', 'true');
  };

  if (isInstalled || !showPrompt || !deferredPrompt) {
    return null;
  }

  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-96 z-50 animate-slide-up">
      <Card variant="featured" padding="lg" className="shadow-2xl border-2 border-teal-500">
        <div className="flex items-start gap-4">
          <div className="text-4xl">📱</div>
          <div className="flex-1">
            <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-2">
              앱으로 설치하기
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
              Metaldragon을 홈 화면에 추가하고 앱처럼 사용하세요!
            </p>
            <div className="flex gap-2">
              <Button variant="primary" size="sm" onClick={handleInstallClick} className="flex-1">
                설치
              </Button>
              <Button variant="outline" size="sm" onClick={handleDismiss}>
                나중에
              </Button>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
