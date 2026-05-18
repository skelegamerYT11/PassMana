import { useState, useEffect } from 'react';
import { Search, Plus, LogOut, Copy, ExternalLink, Key, Eye, EyeOff, Trash2, Menu, AlertTriangle, Sliders } from 'lucide-react';

const hexToRgba = (hex: string, alpha: number) => {
  try {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  } catch (e) {
    return `rgba(255, 255, 255, ${alpha})`;
  }
};

const adjustColorBrightness = (hex: string, percent: number) => {
  try {
    let R = parseInt(hex.substring(1, 3), 16);
    let G = parseInt(hex.substring(3, 5), 16);
    let B = parseInt(hex.substring(5, 7), 16);

    R = parseInt(((R * (100 + percent)) / 100).toString());
    G = parseInt(((G * (100 + percent)) / 100).toString());
    B = parseInt(((B * (100 + percent)) / 100).toString());

    R = R < 255 ? R : 255;
    G = G < 255 ? G : 255;
    B = B < 255 ? B : 255;

    R = R > 0 ? R : 0;
    G = G > 0 ? G : 0;
    B = B > 0 ? B : 0;

    const rHex = R.toString(16).padStart(2, '0');
    const gHex = G.toString(16).padStart(2, '0');
    const bHex = B.toString(16).padStart(2, '0');

    return `#${rHex}${gHex}${bHex}`;
  } catch (e) {
    return hex;
  }
};

interface PasswordEntry {
  id: string;
  title: string;
  username: string;
  password: string;
  url: string;
}

interface DashboardProps {
  onLock: () => void;
}

export function Dashboard({ onLock }: DashboardProps) {
  const [entries, setEntries] = useState<PasswordEntry[]>([]);
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showPassword, setShowPassword] = useState<Record<string, boolean>>({});

  // Theme states
  const [theme, setTheme] = useState(localStorage.getItem('passmana-theme') || 'default');
  const [isThemeMenuOpen, setIsThemeMenuOpen] = useState(false);
  const [isCustomizerOpen, setIsCustomizerOpen] = useState(false);

  // Custom colors state
  const [customColors, setCustomColors] = useState(() => {
    try {
      const saved = localStorage.getItem('passmana-custom-theme');
      return saved ? JSON.parse(saved) : {
        bg: '#0c1020',
        panel: '#141b35',
        accent: '#f43f5e',
        text: '#f8fafc'
      };
    } catch (e) {
      return {
        bg: '#0c1020',
        panel: '#141b35',
        accent: '#f43f5e',
        text: '#f8fafc'
      };
    }
  });

  const handleCustomColorChange = (key: string, value: string) => {
    const updated = { ...customColors, [key]: value };
    setCustomColors(updated);
    localStorage.setItem('passmana-custom-theme', JSON.stringify(updated));
  };

  // Custom Delete target state
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);

  // New entry state
  const [title, setTitle] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [url, setUrl] = useState('');

  useEffect(() => {
    loadEntries();
  }, []);

  useEffect(() => {
    document.body.className = `theme-${theme}`;
    localStorage.setItem('passmana-theme', theme);

    if (theme === 'custom') {
      document.body.style.setProperty('--bg-color', customColors.bg);
      document.body.style.setProperty('--panel-bg', customColors.panel);
      document.body.style.setProperty('--panel-border', hexToRgba(customColors.text, 0.1));
      document.body.style.setProperty('--accent', customColors.accent);
      document.body.style.setProperty('--accent-hover', adjustColorBrightness(customColors.accent, -20));
      document.body.style.setProperty('--text-primary', customColors.text);
      document.body.style.setProperty('--text-secondary', hexToRgba(customColors.text, 0.6));
      
      if (window.vaultAPI && window.vaultAPI.updateTitlebar) {
        window.vaultAPI.updateTitlebar(customColors.bg, customColors.text);
      }
    } else {
      document.body.style.removeProperty('--bg-color');
      document.body.style.removeProperty('--panel-bg');
      document.body.style.removeProperty('--panel-border');
      document.body.style.removeProperty('--accent');
      document.body.style.removeProperty('--accent-hover');
      document.body.style.removeProperty('--text-primary');
      document.body.style.removeProperty('--text-secondary');

      const nativeColors: Record<string, { bg: string, text: string }> = {
        default: { bg: '#0f172a', text: '#f8fafc' },
        midnight: { bg: '#050505', text: '#f3f4f6' },
        purple: { bg: '#110724', text: '#fae8ff' },
        rainbow: { bg: '#0a0f1d', text: '#f9fafb' },
        orange: { bg: '#0d0907', text: '#fff0e5' }
      };
      const colors = nativeColors[theme] || nativeColors.default;
      if (window.vaultAPI && window.vaultAPI.updateTitlebar) {
        window.vaultAPI.updateTitlebar(colors.bg, colors.text);
      }
    }
  }, [theme, customColors]);

  const loadEntries = async () => {
    try {
      const data = await window.vaultAPI.getEntries();
      setEntries(data || []);
    } catch (e) {
      console.error(e);
      onLock();
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const newEntry = {
      id: crypto.randomUUID(),
      title,
      username,
      password,
      url
    };
    const newEntries = [...entries, newEntry];
    await window.vaultAPI.saveEntries(newEntries);
    setEntries(newEntries);
    setIsModalOpen(false);
    
    // Reset
    setTitle('');
    setUsername('');
    setPassword('');
    setUrl('');
  };

  const confirmDelete = async () => {
    if (deleteTargetId) {
      const newEntries = entries.filter(e => e.id !== deleteTargetId);
      await window.vaultAPI.saveEntries(newEntries);
      setEntries(newEntries);
      setDeleteTargetId(null);
    }
  };

  const generatePassword = () => {
    const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+~`|}{[]:;?><,./-=";
    let pwd = "";
    const array = new Uint32Array(20);
    window.crypto.getRandomValues(array);
    for (let i = 0; i < 20; i++) {
      pwd += chars[array[i] % chars.length];
    }
    setPassword(pwd);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const filteredEntries = entries.filter(e => 
    e.title.toLowerCase().includes(search.toLowerCase()) || 
    e.username.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="dashboard">
      <div className="sidebar">
        <h2 style={{ marginBottom: 32, display: 'flex', alignItems: 'center', gap: 8, color: 'var(--accent)' }}>
          <Key /> PassMana
        </h2>
        
        <div style={{ flex: 1 }}>
          <button 
            style={{ width: '100%', justifyContent: 'flex-start' }}
            onClick={() => setIsModalOpen(true)}
          >
            <Plus size={18} /> New Password
          </button>
        </div>
        
        <button className="secondary" style={{ width: '100%' }} onClick={onLock}>
          <LogOut size={18} /> Lock Vault
        </button>
      </div>

      <div className="main-content">
        <div className="header-row">
          <div className="search-bar">
            <Search size={18} />
            <input 
              type="text" 
              placeholder="Search passwords..." 
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>

          <div style={{ display: 'flex', gap: 8, position: 'relative' }}>
            {theme === 'custom' && (
              <button className="secondary" onClick={() => setIsCustomizerOpen(true)} style={{ padding: '8px 12px' }} title="Customize Theme">
                <Sliders size={18} /> Customize
              </button>
            )}
            <button className="secondary" onClick={() => setIsThemeMenuOpen(!isThemeMenuOpen)} style={{ padding: '8px 16px' }}>
              <Menu size={18} /> Theme
            </button>
            {isThemeMenuOpen && (
              <div className="theme-dropdown">
                <button className={theme === 'default' ? 'active' : ''} onClick={() => { setTheme('default'); setIsThemeMenuOpen(false); }}>
                  Default Blue
                </button>
                <button className={theme === 'midnight' ? 'active' : ''} onClick={() => { setTheme('midnight'); setIsThemeMenuOpen(false); }}>
                  Midnight Dark
                </button>
                <button className={theme === 'purple' ? 'active' : ''} onClick={() => { setTheme('purple'); setIsThemeMenuOpen(false); }}>
                  Purple Dream
                </button>
                <button className={theme === 'rainbow' ? 'active' : ''} onClick={() => { setTheme('rainbow'); setIsThemeMenuOpen(false); }}>
                  Vibrant Rainbow
                </button>
                <button className={theme === 'orange' ? 'active' : ''} onClick={() => { setTheme('orange'); setIsThemeMenuOpen(false); }}>
                  Sunset Glow
                </button>
                <button className={theme === 'custom' ? 'active' : ''} onClick={() => { setTheme('custom'); setIsThemeMenuOpen(false); }}>
                  Custom Theme
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="password-list">
          {filteredEntries.map(entry => (
            <div key={entry.id} className="password-card">
              <div className="card-header">
                <div className="card-title">
                  {entry.title}
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  {entry.url && (
                    <button className="icon-btn" onClick={() => window.open(entry.url, '_blank')}>
                      <ExternalLink size={16} />
                    </button>
                  )}
                  <button className="icon-btn text-danger" onClick={() => setDeleteTargetId(entry.id)} title="Delete Password">
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
              <div className="card-username">{entry.username}</div>
              
              <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                <input 
                  type={showPassword[entry.id] ? "text" : "password"} 
                  value={entry.password} 
                  readOnly 
                  style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.2)', border: 'none' }}
                />
                <button className="icon-btn" onClick={() => setShowPassword({...showPassword, [entry.id]: !showPassword[entry.id]})}>
                  {showPassword[entry.id] ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
                <button className="icon-btn" onClick={() => copyToClipboard(entry.password)}>
                  <Copy size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal">
            <h2>Add Password</h2>
            <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div className="form-group">
                <label>Title (e.g. Google, GitHub)</label>
                <input required value={title} onChange={e => setTitle(e.target.value)} />
              </div>
              <div className="form-group">
                <label>Username or Email</label>
                <input required value={username} onChange={e => setUsername(e.target.value)} />
              </div>
              <div className="form-group">
                <label>Password</label>
                <div style={{ display: 'flex', gap: 8 }}>
                  <input 
                    required 
                    type="text" 
                    value={password} 
                    onChange={e => setPassword(e.target.value)} 
                    style={{ flex: 1 }}
                  />
                  <button type="button" className="secondary" onClick={generatePassword} title="Generate Secure Password">
                    <Key size={16} />
                  </button>
                </div>
              </div>
              <div className="form-group">
                <label>URL (Optional)</label>
                <input value={url} onChange={e => setUrl(e.target.value)} />
              </div>
              
              <div className="modal-footer">
                <button type="button" className="secondary" onClick={() => setIsModalOpen(false)}>Cancel</button>
                <button type="submit">Save</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {deleteTargetId && (
        <div className="modal-overlay">
          <div className="modal delete-modal">
            <div className="delete-modal-icon">
              <AlertTriangle size={24} />
            </div>
            <h2>Confirm Deletion</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '14px', margin: '8px 0' }}>
              Are you sure you want to delete this password?
            </p>
            <p style={{ color: 'var(--danger)', fontSize: '13px', fontWeight: 500, marginBottom: '24px' }}>
              This action is permanent and cannot be undone.
            </p>
            <div className="modal-footer" style={{ marginTop: 0 }}>
              <button className="secondary" onClick={() => setDeleteTargetId(null)}>Cancel</button>
              <button style={{ backgroundColor: 'var(--danger)' }} onClick={confirmDelete}>Delete</button>
            </div>
          </div>
        </div>
      )}

      {isCustomizerOpen && (
        <div className="modal-overlay">
          <div className="modal" style={{ maxWidth: '400px' }}>
            <h2>Customize Theme</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '13px', marginBottom: '20px' }}>
              Create your own look with dynamic live previews.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              
              <div className="form-group">
                <label style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                  <span style={{ fontSize: '14px', fontWeight: 500 }}>Background Color</span>
                  <span style={{ fontSize: '12px', fontFamily: 'monospace', color: 'var(--text-secondary)' }}>{customColors.bg}</span>
                </label>
                <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                  <input type="color" value={customColors.bg} onChange={e => handleCustomColorChange('bg', e.target.value)} style={{ width: 44, height: 36, padding: 0, cursor: 'pointer', border: '1px solid var(--panel-border)', borderRadius: '6px', backgroundColor: 'transparent' }} />
                  <input type="text" value={customColors.bg} onChange={e => handleCustomColorChange('bg', e.target.value)} style={{ flex: 1, height: 36, fontSize: '14px' }} />
                </div>
              </div>

              <div className="form-group">
                <label style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                  <span style={{ fontSize: '14px', fontWeight: 500 }}>Panel / Card Color</span>
                  <span style={{ fontSize: '12px', fontFamily: 'monospace', color: 'var(--text-secondary)' }}>{customColors.panel}</span>
                </label>
                <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                  <input type="color" value={customColors.panel} onChange={e => handleCustomColorChange('panel', e.target.value)} style={{ width: 44, height: 36, padding: 0, cursor: 'pointer', border: '1px solid var(--panel-border)', borderRadius: '6px', backgroundColor: 'transparent' }} />
                  <input type="text" value={customColors.panel} onChange={e => handleCustomColorChange('panel', e.target.value)} style={{ flex: 1, height: 36, fontSize: '14px' }} />
                </div>
              </div>

              <div className="form-group">
                <label style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                  <span style={{ fontSize: '14px', fontWeight: 500 }}>Accent Color</span>
                  <span style={{ fontSize: '12px', fontFamily: 'monospace', color: 'var(--text-secondary)' }}>{customColors.accent}</span>
                </label>
                <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                  <input type="color" value={customColors.accent} onChange={e => handleCustomColorChange('accent', e.target.value)} style={{ width: 44, height: 36, padding: 0, cursor: 'pointer', border: '1px solid var(--panel-border)', borderRadius: '6px', backgroundColor: 'transparent' }} />
                  <input type="text" value={customColors.accent} onChange={e => handleCustomColorChange('accent', e.target.value)} style={{ flex: 1, height: 36, fontSize: '14px' }} />
                </div>
              </div>

              <div className="form-group">
                <label style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                  <span style={{ fontSize: '14px', fontWeight: 500 }}>Text / Icon Color</span>
                  <span style={{ fontSize: '12px', fontFamily: 'monospace', color: 'var(--text-secondary)' }}>{customColors.text}</span>
                </label>
                <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                  <input type="color" value={customColors.text} onChange={e => handleCustomColorChange('text', e.target.value)} style={{ width: 44, height: 36, padding: 0, cursor: 'pointer', border: '1px solid var(--panel-border)', borderRadius: '6px', backgroundColor: 'transparent' }} />
                  <input type="text" value={customColors.text} onChange={e => handleCustomColorChange('text', e.target.value)} style={{ flex: 1, height: 36, fontSize: '14px' }} />
                </div>
              </div>

              <div className="modal-footer" style={{ marginTop: '12px' }}>
                <button onClick={() => setIsCustomizerOpen(false)} style={{ width: '100%' }}>Done</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
