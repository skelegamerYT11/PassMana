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
        return setError('Passwords do not match.');
      }
      if (password.length < 8) {
        return setError('Master Password must be at least 8 characters long.');
      }
      
      const success = await window.vaultAPI.setup(password);
      if (success) {
        setIsSetup(false);
        setPassword('');
        setConfirmPassword('');
      } else {
        setError('Error creating the Vault.');
      }
    } else {
      const success = await window.vaultAPI.unlock(password);
      if (success) {
        onUnlock();
      } else {
        setError('Incorrect Master Password.');
      }
    }
  };

  if (loading) return null;

  return (
    <div className="auth-container">
      <div className="auth-box">
        <div className="auth-header">
          {isSetup ? <ShieldAlert size={48} color="var(--accent)" style={{marginBottom: 16}} /> : <Lock size={48} color="var(--accent)" style={{marginBottom: 16}} />}
          <h1>{isSetup ? 'Create your Vault' : 'Unlock the Vault'}</h1>
          <p>{isSetup ? 'Choose a very strong Master Password. If you lose it, your data is unrecoverable.' : 'Enter your Master Password to decrypt your data.'}</p>
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
              <label>Confirm Master Password</label>
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
            {isSetup ? 'Initialize Secure Vault' : 'Unlock'}
          </button>
        </form>
      </div>
    </div>
  );
}
