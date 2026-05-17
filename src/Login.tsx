import { useState, useEffect } from 'react';
import { Lock, Unlock, ShieldAlert } from 'lucide-react';

interface LoginProps {
  onUnlock: () => void;
}

export function Login({ onUnlock }: LoginProps) {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSetup, setIsSetup] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    window.vaultAPI.exists().then(exists => {
      setIsSetup(!exists);
      setLoading(false);
    });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (isSetup) {
      if (password !== confirmPassword) {
        return setError('Le password non coincidono.');
      }
      if (password.length < 8) {
        return setError('La Master Password deve avere almeno 8 caratteri.');
      }
      
      const success = await window.vaultAPI.setup(password);
      if (success) {
        setIsSetup(false);
        setPassword('');
        setConfirmPassword('');
      } else {
        setError('Errore durante la creazione del Vault.');
      }
    } else {
      const success = await window.vaultAPI.unlock(password);
      if (success) {
        onUnlock();
      } else {
        setError('Master Password errata.');
      }
    }
  };

  if (loading) return null;

  return (
    <div className="auth-container">
      <div className="auth-box">
        <div className="auth-header">
          {isSetup ? <ShieldAlert size={48} color="var(--accent)" style={{marginBottom: 16}} /> : <Lock size={48} color="var(--accent)" style={{marginBottom: 16}} />}
          <h1>{isSetup ? 'Crea il tuo Vault' : 'Sblocca il Vault'}</h1>
          <p>{isSetup ? 'Scegli una Master Password molto sicura. Se la perdi, i tuoi dati saranno irrecuperabili.' : 'Inserisci la tua Master Password per decriptare i tuoi dati.'}</p>
        </div>
        
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div className="form-group">
            <label>Master Password</label>
            <input 
              type="password" 
              value={password}
              onChange={e => setPassword(e.target.value)}
              autoFocus
            />
          </div>

          {isSetup && (
            <div className="form-group">
              <label>Conferma Master Password</label>
              <input 
                type="password" 
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
              />
            </div>
          )}

          {error && <div style={{ color: 'var(--danger)', fontSize: 13, textAlign: 'center' }}>{error}</div>}

          <button type="submit" style={{ width: '100%', marginTop: 8 }}>
            {isSetup ? <ShieldAlert size={18} /> : <Unlock size={18} />}
            {isSetup ? 'Inizializza Vault Sicuro' : 'Sblocca'}
          </button>
        </form>
      </div>
    </div>
  );
}
