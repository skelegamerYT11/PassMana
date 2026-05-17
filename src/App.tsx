import { useState, useEffect } from 'react';
import { Login } from './Login';
import { Dashboard } from './Dashboard';

function App() {
  const [unlocked, setUnlocked] = useState(false);

  useEffect(() => {
    window.vaultAPI.isUnlocked().then(setUnlocked);
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
