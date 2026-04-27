import React, { useState, useEffect, useRef } from 'react';

const DISMISS_KEY = 'pwa-install-dismissed';

export default function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showAndroid, setShowAndroid] = useState(false);
  const [showIOS, setShowIOS] = useState(false);
  const [dismissed, setDismissed] = useState(() => {
    return localStorage.getItem(DISMISS_KEY) === 'true';
  });
  const promptRef = useRef(null);

  useEffect(() => {
    if (dismissed) return;

    // ── Android / Chrome: listen for beforeinstallprompt ──
    const handler = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowAndroid(true);
    };
    window.addEventListener('beforeinstallprompt', handler);

    // ── iOS Safari detection ──
    const ua = window.navigator.userAgent;
    const isIOS = /iPhone|iPad|iPod/.test(ua);
    const isInStandalone = window.navigator.standalone === true;
    const isSafari = /Safari/.test(ua) && !/CriOS|FxiOS|OPiOS|EdgiOS/.test(ua);

    if (isIOS && isSafari && !isInStandalone) {
      setShowIOS(true);
    }

    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, [dismissed]);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setShowAndroid(false);
    }
    setDeferredPrompt(null);
  };

  const handleDismiss = () => {
    localStorage.setItem(DISMISS_KEY, 'true');
    setDismissed(true);
    setShowAndroid(false);
    setShowIOS(false);
  };

  if (dismissed || (!showAndroid && !showIOS)) return null;

  return (
    <div
      ref={promptRef}
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 9999,
        animation: 'slideUpBanner 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
      }}
    >
      <div
        style={{
          margin: '0 auto',
          maxWidth: 480,
          padding: '0 12px 12px',
        }}
      >
        <div
          style={{
            background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
            borderRadius: 16,
            padding: '16px 18px',
            display: 'flex',
            alignItems: 'center',
            gap: 14,
            boxShadow: '0 -4px 30px rgba(0,0,0,0.25), 0 0 0 1px rgba(255,255,255,0.08)',
            backdropFilter: 'blur(12px)',
          }}
        >
          {/* Icon */}
          <div
            style={{
              width: 44,
              height: 44,
              borderRadius: 12,
              background: 'linear-gradient(135deg, #58cc02, #89e219)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
              boxShadow: '0 2px 8px rgba(88,204,2,0.35)',
            }}
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 5v14M5 12l7 7 7-7" />
            </svg>
          </div>

          {/* Text */}
          <div style={{ flex: 1, minWidth: 0 }}>
            {showAndroid && (
              <>
                <p
                  style={{
                    margin: 0,
                    color: '#fff',
                    fontSize: 14,
                    fontWeight: 700,
                    lineHeight: 1.3,
                  }}
                >
                  Install Compass Habits
                </p>
                <p
                  style={{
                    margin: '3px 0 0',
                    color: 'rgba(255,255,255,0.55)',
                    fontSize: 12,
                    lineHeight: 1.3,
                  }}
                >
                  Get the full app experience on your home screen
                </p>
              </>
            )}

            {showIOS && (
              <>
                <p
                  style={{
                    margin: 0,
                    color: '#fff',
                    fontSize: 14,
                    fontWeight: 700,
                    lineHeight: 1.3,
                  }}
                >
                  Install Compass Habits
                </p>
                <p
                  style={{
                    margin: '3px 0 0',
                    color: 'rgba(255,255,255,0.55)',
                    fontSize: 12,
                    lineHeight: 1.4,
                  }}
                >
                  Tap{' '}
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="rgba(255,255,255,0.8)"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    style={{ verticalAlign: 'middle', margin: '0 2px' }}
                  >
                    <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
                    <polyline points="16 6 12 2 8 6" />
                    <line x1="12" y1="2" x2="12" y2="15" />
                  </svg>{' '}
                  Share then <strong>"Add to Home Screen"</strong>
                </p>
              </>
            )}
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
            {showAndroid && (
              <button
                onClick={handleInstall}
                style={{
                  background: 'linear-gradient(135deg, #58cc02, #89e219)',
                  border: 'none',
                  borderRadius: 10,
                  padding: '8px 16px',
                  color: '#fff',
                  fontWeight: 800,
                  fontSize: 13,
                  cursor: 'pointer',
                  boxShadow: '0 2px 8px rgba(88,204,2,0.35)',
                  whiteSpace: 'nowrap',
                  transition: 'transform 0.15s, box-shadow 0.15s',
                }}
                onMouseDown={(e) => (e.currentTarget.style.transform = 'scale(0.95)')}
                onMouseUp={(e) => (e.currentTarget.style.transform = 'scale(1)')}
              >
                Install
              </button>
            )}

            <button
              onClick={handleDismiss}
              aria-label="Dismiss install prompt"
              style={{
                background: 'rgba(255,255,255,0.08)',
                border: 'none',
                borderRadius: 8,
                width: 32,
                height: 32,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                transition: 'background 0.15s',
                flexShrink: 0,
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.15)')}
              onMouseLeave={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.08)')}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.5)" strokeWidth="2.5" strokeLinecap="round">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Slide-up animation */}
      <style>{`
        @keyframes slideUpBanner {
          from { transform: translateY(100%); opacity: 0; }
          to   { transform: translateY(0);    opacity: 1; }
        }
      `}</style>
    </div>
  );
}
