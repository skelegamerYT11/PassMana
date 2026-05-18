import { useState, useEffect } from 'react';
import { Login } from './Login';
import { Dashboard } from './Dashboard';

function App() {
  const [unlocked, setUnlocked] = useState(false);

  useEffect(() => {
    window.vaultAPI.isUnlocked().then(setUnlocked);

    // Load and apply theme on startup
    const theme = localStorage.getItem('passmana-theme') || 'default';
    document.body.className = `theme-${theme}`;
    if (theme === 'custom') {
      try {
        const custom = JSON.parse(localStorage.getItem('passmana-custom-theme') || '{"bg":"#0c1020","panel":"#141b35","accent":"#f43f5e","text":"#f8fafc"}');
        const hexToRgba = (hex: string, alpha: number) => {
          const r = parseInt(hex.slice(1, 3), 16);
          const g = parseInt(hex.slice(3, 5), 16);
          const b = parseInt(hex.slice(5, 7), 16);
          return `rgba(${r}, ${g}, ${b}, ${alpha})`;
        };
        const adjustColorBrightness = (hex: string, percent: number) => {
          let R = parseInt(hex.substring(1, 3), 16);
          let G = parseInt(hex.substring(3, 5), 16);
          let B = parseInt(hex.substring(5, 7), 16);
          R = Math.min(255, Math.max(0, parseInt(((R * (100 + percent)) / 100).toString())));
          G = Math.min(255, Math.max(0, parseInt(((G * (100 + percent)) / 100).toString())));
          B = Math.min(255, Math.max(0, parseInt(((B * (100 + percent)) / 100).toString())));
          return `#${R.toString(16).padStart(2, '0')}${G.toString(16).padStart(2, '0')}${B.toString(16).padStart(2, '0')}`;
        };
        document.body.style.setProperty('--bg-color', custom.bg);
        document.body.style.setProperty('--panel-bg', custom.panel);
        document.body.style.setProperty('--panel-border', hexToRgba(custom.text, 0.1));
        document.body.style.setProperty('--accent', custom.accent);
        document.body.style.setProperty('--accent-hover', adjustColorBrightness(custom.accent, -20));
        document.body.style.setProperty('--text-primary', custom.text);
        document.body.style.setProperty('--text-secondary', hexToRgba(custom.text, 0.6));
        
        window.vaultAPI.updateTitlebar(custom.bg, custom.text);
      } catch(e) {}
    } else {
      const nativeColors: Record<string, { bg: string, text: string }> = {
        default: { bg: '#0f172a', text: '#f8fafc' },
        midnight: { bg: '#050505', text: '#f3f4f6' },
        purple: { bg: '#110724', text: '#fae8ff' },
        rainbow: { bg: '#0a0f1d', text: '#f9fafb' },
        orange: { bg: '#0d0907', text: '#fff0e5' }
      };
      const colors = nativeColors[theme] || nativeColors.default;
      window.vaultAPI.updateTitlebar(colors.bg, colors.text);
    }
  }, []);

  const handleLock = async () => {
    await window.vaultAPI.lock();
    setUnlocked(false);
  };

  return (
    <>
      <div className="titlebar-drag" />
      {unlocked ? (
        <Dashboard onLock={handleLock} />
      ) : (
        <Login onUnlock={() => setUnlocked(true)} />
      )}
    </>
  );
}

export default App;
