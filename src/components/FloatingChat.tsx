'use client';

import { useState } from 'react';
import { useApp } from '@/context/AppContext';
import Typewriter from './Typewriter';

export default function FloatingChat() {
  const [isOpen, setIsOpen] = useState(false);
  const [question, setQuestion] = useState('');
  const [chatHistory, setChatHistory] = useState<{role: 'user' | 'ai', text: string}[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  
  const { allTransactions, vaults } = useApp();

  const handleSend = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!question.trim()) return;

    const q = question;
    setQuestion('');
    setChatHistory(prev => [...prev, { role: 'user', text: q }]);
    setIsLoading(true);

    try {
      const res = await fetch('/api/chat-coach', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          question: q,
          spendingData: {
            totalTransactions: allTransactions.length,
            recentTransactions: allTransactions.slice(0, 5),
            activeVaults: vaults
          }
        })
      });
      
      const data = await res.json();
      setChatHistory(prev => [...prev, { role: 'ai', text: data.answer }]);
    } catch {
      setChatHistory(prev => [...prev, { role: 'ai', text: "Sorry, I'm having trouble connecting right now." }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ position: 'fixed', bottom: '100px', left: '20px', zIndex: 100 }}>
      {isOpen && (
        <div className="animate-slide-up" style={{
          position: 'absolute',
          bottom: '70px',
          left: '0',
          width: '300px',
          height: '400px',
          background: 'var(--card-bg)',
          border: '2.5px solid var(--ink-black)',
          boxShadow: '6px 6px 0 var(--ink-black)',
          display: 'flex',
          flexDirection: 'column',
          borderRadius: '12px',
          borderBottomLeftRadius: '0px',
          overflow: 'hidden'
        }}>
          <div style={{ background: 'var(--ink-black)', color: '#fff', padding: '12px', fontWeight: 900 }}>
            Budget Coach 🤖
          </div>
          
          <div style={{ flex: 1, overflowY: 'auto', padding: '12px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{
              alignSelf: 'flex-start',
              background: '#f0f0f0',
              padding: '8px 12px',
              borderRadius: '12px',
              borderBottomLeftRadius: '0',
              border: '1px solid var(--ink-black)',
              fontSize: '0.85rem'
            }}>
              Ask me about your spending or vault goals! e.g. &quot;Am I on track for Bangkok?&quot;
            </div>
            
            {chatHistory.map((msg, i) => (
              <div key={i} style={{
                alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start',
                background: msg.role === 'user' ? 'var(--nets-red)' : '#f0f0f0',
                color: msg.role === 'user' ? '#fff' : 'inherit',
                padding: '8px 12px',
                borderRadius: '12px',
                borderBottomRightRadius: msg.role === 'user' ? '0' : '12px',
                borderBottomLeftRadius: msg.role === 'ai' ? '0' : '12px',
                border: '1px solid var(--ink-black)',
                fontSize: '0.85rem',
                maxWidth: '85%'
              }}>
                {msg.role === 'ai' && i === chatHistory.length - 1 ? (
                  <Typewriter text={msg.text} speed={30} />
                ) : (
                  msg.text
                )}
              </div>
            ))}
            
            {isLoading && (
              <div style={{ alignSelf: 'flex-start', padding: '8px 12px', fontSize: '0.85rem' }}>
                <span className="skeleton-pulse" style={{ display: 'inline-block', width: '80px', height: '16px', borderRadius: '4px' }}></span>
              </div>
            )}
          </div>
          
          <form onSubmit={handleSend} style={{ display: 'flex', borderTop: '2px solid var(--ink-black)' }}>
            <input 
              type="text" 
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="Ask anything..."
              style={{ flex: 1, padding: '12px', border: 'none', outline: 'none', background: 'var(--body-bg)', fontFamily: 'inherit' }}
            />
            <button type="submit" style={{ padding: '0 16px', background: 'var(--nets-red)', color: '#fff', border: 'none', borderLeft: '2px solid var(--ink-black)', fontWeight: 900, cursor: 'pointer' }}>
              SEND
            </button>
          </form>
        </div>
      )}

      <div 
        onClick={() => setIsOpen(!isOpen)}
        style={{
          width: '60px',
          height: '60px',
          borderRadius: '50%',
          background: 'var(--ink-black)',
          color: '#fff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '4px 4px 0 var(--nets-blue)',
          cursor: 'pointer',
          fontSize: '1.5rem',
          transition: 'all 0.2s'
        }}
      >
        {isOpen ? '✕' : '🤖'}
      </div>
    </div>
  );
}
