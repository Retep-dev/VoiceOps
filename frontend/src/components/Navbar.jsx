import React from 'react';
import { Mic, Database, UserCheck, BarChart3, Activity, AudioLines } from 'lucide-react';

export default function Navbar({ activeTab, setActiveTab }) {
  return (
    <header style={{ width: '100%', maxWidth: '1240px', margin: '0 auto', padding: '20px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#fafafa' }}>
      {/* Brand Logo */}
      <div 
        onClick={() => setActiveTab('landing')} 
        style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
          <span style={{ width: '3px', height: '14px', background: '#000', borderRadius: '2px' }}></span>
          <span style={{ width: '3px', height: '22px', background: '#000', borderRadius: '2px' }}></span>
          <span style={{ width: '3px', height: '12px', background: '#000', borderRadius: '2px' }}></span>
          <span style={{ width: '3px', height: '18px', background: '#000', borderRadius: '2px' }}></span>
        </div>
        <h1 style={{ fontSize: '1.4rem', fontWeight: '800', letterSpacing: '-0.5px', color: '#09090b' }}>
          VoiceOps
        </h1>
      </div>

      {/* Middle Navigation Links matching screenshot */}
      <nav style={{ display: 'flex', alignItems: 'center', gap: '32px' }}>
        <button onClick={() => setActiveTab('landing')} style={{ background: 'transparent', border: 'none', color: activeTab === 'landing' ? '#000' : '#52525b', fontWeight: activeTab === 'landing' ? '700' : '500', fontSize: '0.9rem', cursor: 'pointer' }}>
          Product
        </button>
        <button onClick={() => setActiveTab('voice')} style={{ background: 'transparent', border: 'none', color: activeTab === 'voice' ? '#000' : '#52525b', fontWeight: activeTab === 'voice' ? '700' : '500', fontSize: '0.9rem', cursor: 'pointer' }}>
          Voice Console
        </button>
        <button onClick={() => setActiveTab('knowledge')} style={{ background: 'transparent', border: 'none', color: activeTab === 'knowledge' ? '#000' : '#52525b', fontWeight: activeTab === 'knowledge' ? '700' : '500', fontSize: '0.9rem', cursor: 'pointer' }}>
          Knowledge Hub
        </button>
        <button onClick={() => setActiveTab('handoff')} style={{ background: 'transparent', border: 'none', color: activeTab === 'handoff' ? '#000' : '#52525b', fontWeight: activeTab === 'handoff' ? '700' : '500', fontSize: '0.9rem', cursor: 'pointer' }}>
          Escalations
        </button>
        <button onClick={() => setActiveTab('evals')} style={{ background: 'transparent', border: 'none', color: activeTab === 'evals' ? '#000' : '#52525b', fontWeight: activeTab === 'evals' ? '700' : '500', fontSize: '0.9rem', cursor: 'pointer' }}>
          Analytics
        </button>
      </nav>

      {/* Right Login / Get Started Action Buttons */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
        <button onClick={() => setActiveTab('voice')} style={{ background: 'transparent', border: 'none', color: '#09090b', fontWeight: '600', fontSize: '0.9rem', cursor: 'pointer' }}>
          Log in
        </button>
        <button onClick={() => setActiveTab('voice')} className="btn-black" style={{ padding: '9px 20px', fontSize: '0.85rem' }}>
          Get Started
        </button>
      </div>
    </header>
  );
}
