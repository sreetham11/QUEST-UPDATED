'use client';

import { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { useRouter } from 'next/navigation';

export default function OnboardingPage() {
  const [step, setStep] = useState(1);
  const [tempName, setTempName] = useState('');
  const [tempFriends, setTempFriends] = useState<string[]>([]);
  const [tempMerchant, setTempMerchant] = useState('');
  
  const { setHasOnboarded, setUserName, setFrequentMerchant } = useApp();
  const router = useRouter();

  const handleNext = () => {
    if (step < 3) {
      setStep(step + 1);
    } else {
      // Save and finish
      setUserName(tempName || 'Sree');
      setFrequentMerchant(tempMerchant || 'Maxwell Food Centre');
      setHasOnboarded(true);
      router.push('/');
    }
  };

  const toggleFriend = (f: string) => {
    if (tempFriends.includes(f)) {
      setTempFriends(tempFriends.filter(x => x !== f));
    } else {
      setTempFriends([...tempFriends, f]);
    }
  };

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', padding: '20px', background: 'var(--body-bg)' }}>
      <div style={{ display: 'flex', gap: '4px', marginBottom: '40px', marginTop: '20px' }}>
        {[1, 2, 3].map(i => (
          <div key={i} style={{ flex: 1, height: '4px', background: step >= i ? 'var(--nets-red)' : '#ccc' }} />
        ))}
      </div>

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
        {step === 1 && (
          <div className="animate-slide-up">
            <div className="text-display" style={{ fontSize: '2rem', marginBottom: '8px' }}>What's your name?</div>
            <div style={{ color: 'var(--text-muted)', marginBottom: '24px' }}>We'll use this to personalise your Quest dashboard.</div>
            <input 
              autoFocus
              type="text" 
              value={tempName} 
              onChange={e => setTempName(e.target.value)} 
              placeholder="e.g. Sree"
              style={{
                width: '100%', padding: '16px', fontSize: '1.2rem', fontFamily: 'inherit',
                border: '2.5px solid var(--ink-black)', borderRadius: '12px', background: 'var(--card-bg)'
              }}
            />
          </div>
        )}

        {step === 2 && (
          <div className="animate-slide-up">
            <div className="text-display" style={{ fontSize: '2rem', marginBottom: '8px' }}>Who's your usual squad?</div>
            <div style={{ color: 'var(--text-muted)', marginBottom: '24px' }}>Pick the friends you split payments with the most.</div>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              {['Kai', 'Priya', 'Manoj', 'Wei'].map(friend => (
                <div 
                  key={friend}
                  onClick={() => toggleFriend(friend)}
                  style={{
                    padding: '16px', border: '2.5px solid var(--ink-black)', borderRadius: '12px',
                    textAlign: 'center', fontWeight: 900, cursor: 'pointer',
                    background: tempFriends.includes(friend) ? 'var(--nets-red)' : 'var(--card-bg)',
                    color: tempFriends.includes(friend) ? '#fff' : 'inherit',
                    transition: 'all 0.2s'
                  }}
                >
                  {friend}
                </div>
              ))}
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="animate-slide-up">
            <div className="text-display" style={{ fontSize: '2rem', marginBottom: '8px' }}>Where's your go-to spot?</div>
            <div style={{ color: 'var(--text-muted)', marginBottom: '24px' }}>Your most frequented hawker or cafe.</div>
            <input 
              autoFocus
              type="text" 
              value={tempMerchant} 
              onChange={e => setTempMerchant(e.target.value)} 
              placeholder="e.g. Maxwell Food Centre"
              style={{
                width: '100%', padding: '16px', fontSize: '1.2rem', fontFamily: 'inherit',
                border: '2.5px solid var(--ink-black)', borderRadius: '12px', background: 'var(--card-bg)'
              }}
            />
          </div>
        )}
      </div>

      <button 
        className="btn-primary animate-slap" 
        onClick={handleNext}
        style={{ width: '100%', padding: '16px', fontSize: '1.2rem', marginBottom: '20px' }}
      >
        {step === 3 ? "Let's Go 🚀" : "Next"}
      </button>
    </div>
  );
}
