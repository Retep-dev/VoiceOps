import React from 'react';
import { Mic, Database, UserCheck, BarChart3, Activity } from 'lucide-react';

export default function Navbar({ activeTab, setActiveTab }) {
  const tabs = [
    { id: 'voice', label: 'Voice Console', icon: Mic },
    { id: 'knowledge', label: 'Knowledge Hub', icon: Database },
    { id: 'handoff', label: 'Human Escalations', icon: UserCheck },
    { id: 'evals', label: 'Evaluation & Analytics', icon: BarChart3 },
  ];

  return (
    <header className="glass-panel" style={{ padding: '16px 32px', marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div style={{ background: 'linear-gradient(135deg, #06b6d4, #6366f1)', padding: '10px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Activity color="#fff" size={24} />
        </div>
        <div>
          <h1 className="gradient-text" style={{ fontSize: '1.4rem', fontWeight: '800', letterSpacing: '-0.5px' }}>VoiceOps</h1>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Production AI Voice Support & Operations Platform</p>
        </div>
      </div>

      <nav style={{ display: 'flex', gap: '8px', background: 'rgba(255, 255, 255, 0.03)', padding: '6px', borderRadius: '12px', border: '1px solid rgba(255, 255, 255, 0.05)' }}>
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 16px',
                borderRadius: '8px',
                border: 'none',
                background: isActive ? 'linear-gradient(135deg, rgba(99, 102, 241, 0.25), rgba(168, 85, 247, 0.25))' : 'transparent',
                color: isActive ? '#fff' : 'var(--text-muted)',
                fontWeight: isActive ? '700' : '500',
                fontSize: '0.875rem',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                boxShadow: isActive ? '0 0 15px rgba(99, 102, 241, 0.3)' : 'none',
              }}
            >
              <Icon size={16} color={isActive ? '#38bdf8' : 'currentColor'} />
              {tab.label}
            </button>
          );
        })}
      </nav>
    </header>
  );
}
