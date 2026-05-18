import { useState, useEffect } from 'react';
import { Search, Plus, LogOut, Copy, ExternalLink, Key, Eye, EyeOff, Trash2, Menu, AlertTriangle } from 'lucide-react';

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
  }, [theme]);

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

          <div style={{ position: 'relative' }}>
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
    </div>
  );
}
