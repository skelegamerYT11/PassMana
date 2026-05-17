import { useState, useEffect } from 'react';
import { Search, Plus, LogOut, Copy, ExternalLink, Key, Eye, EyeOff } from 'lucide-react';

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

  // New entry state
  const [title, setTitle] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [url, setUrl] = useState('');

  useEffect(() => {
    loadEntries();
  }, []);

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
            <Plus size={18} /> Nuova Password
          </button>
        </div>
        
        <button className="secondary" style={{ width: '100%' }} onClick={onLock}>
          <LogOut size={18} /> Blocca Vault
        </button>
      </div>

      <div className="main-content">
        <div className="header-row">
          <div className="search-bar">
            <Search size={18} />
            <input 
              type="text" 
              placeholder="Cerca password..." 
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
        </div>

        <div className="password-list">
          {filteredEntries.map(entry => (
            <div key={entry.id} className="password-card">
              <div className="card-header">
                <div className="card-title">
                  {entry.title}
                </div>
                {entry.url && (
                  <button className="icon-btn" onClick={() => window.open(entry.url, '_blank')}>
                    <ExternalLink size={16} />
                  </button>
                )}
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
            <h2>Aggiungi Password</h2>
            <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div className="form-group">
                <label>Titolo (es. Google, GitHub)</label>
                <input required value={title} onChange={e => setTitle(e.target.value)} />
              </div>
              <div className="form-group">
                <label>Username o Email</label>
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
                  <button type="button" className="secondary" onClick={generatePassword} title="Genera Password Sicura">
                    <Key size={16} />
                  </button>
                </div>
              </div>
              <div className="form-group">
                <label>URL (Opzionale)</label>
                <input value={url} onChange={e => setUrl(e.target.value)} />
              </div>
              
              <div className="modal-footer">
                <button type="button" className="secondary" onClick={() => setIsModalOpen(false)}>Annulla</button>
                <button type="submit">Salva</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
