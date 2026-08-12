import React, { useState } from 'react';
import { Menu, X, Mic, Database, UserCheck, BarChart3, ChevronRight } from 'lucide-react';

export default function Navbar({ activeTab, setActiveTab }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleNavClick = (tabId) => {
    setActiveTab(tabId);
    setMobileMenuOpen(false);
  };

  return (
    <header style={{ width: '100%', maxWidth: '1240px', margin: '0 auto', padding: '16px 20px', background: '#fafafa', position: 'relative' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        {/* Brand Logo */}
        <div 
          onClick={() => handleNavClick('landing')} 
          style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '2.5px' }}>
            <span style={{ width: '3px', height: '14px', background: '#000', borderRadius: '2px' }}></span>
            <span style={{ width: '3px', height: '22px', background: '#000', borderRadius: '2px' }}></span>
            <span style={{ width: '3px', height: '12px', background: '#000', borderRadius: '2px' }}></span>
            <span style={{ width: '3px', height: '18px', background: '#000', borderRadius: '2px' }}></span>
          </div>
          <h1 style={{ fontSize: '1.35rem', fontWeight: '800', letterSpacing: '-0.5px', color: '#09090b' }}>
            VoiceOps
          </h1>
        </div>

        {/* Desktop Navigation Links */}
        <nav className="desktop-nav" style={{ display: 'flex', alignItems: 'center', gap: '28px' }}>
          <button onClick={() => handleNavClick('landing')} style={{ background: 'transparent', border: 'none', color: activeTab === 'landing' ? '#000' : '#52525b', fontWeight: activeTab === 'landing' ? '700' : '500', fontSize: '0.9rem', cursor: 'pointer' }}>
            Product
          </button>
          <button onClick={() => handleNavClick('voice')} style={{ background: 'transparent', border: 'none', color: activeTab === 'voice' ? '#000' : '#52525b', fontWeight: activeTab === 'voice' ? '700' : '500', fontSize: '0.9rem', cursor: 'pointer' }}>
            Voice Console
          </button>
          <button onClick={() => handleNavClick('knowledge')} style={{ background: 'transparent', border: 'none', color: activeTab === 'knowledge' ? '#000' : '#52525b', fontWeight: activeTab === 'knowledge' ? '700' : '500', fontSize: '0.9rem', cursor: 'pointer' }}>
            Knowledge Hub
          </button>
          <button onClick={() => handleNavClick('handoff')} style={{ background: 'transparent', border: 'none', color: activeTab === 'handoff' ? '#000' : '#52525b', fontWeight: activeTab === 'handoff' ? '700' : '500', fontSize: '0.9rem', cursor: 'pointer' }}>
            Escalations
          </button>
          <button onClick={() => handleNavClick('evals')} style={{ background: 'transparent', border: 'none', color: activeTab === 'evals' ? '#000' : '#52525b', fontWeight: activeTab === 'evals' ? '700' : '500', fontSize: '0.9rem', cursor: 'pointer' }}>
            Analytics
          </button>
        </nav>

        {/* Desktop Right Action Buttons */}
        <div className="desktop-actions" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <button onClick={() => handleNavClick('voice')} style={{ background: 'transparent', border: 'none', color: '#09090b', fontWeight: '600', fontSize: '0.9rem', cursor: 'pointer' }}>
            Log in
          </button>
          <button onClick={() => handleNavClick('voice')} className="btn-black" style={{ padding: '9px 20px', fontSize: '0.85rem' }}>
            Get Started
          </button>
        </div>

        {/* Mobile Hamburger Toggle Button */}
        <button 
          className="mobile-hamburger-btn" 
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          style={{ background: 'transparent', border: '1px solid #e4e4e7', borderRadius: '8px', padding: '6px 10px', cursor: 'pointer', display: 'none' }}
        >
          {mobileMenuOpen ? <X size={20} color="#000" /> : <Menu size={20} color="#000" />}
        </button>
      </div>

      {/* Mobile Slide-Down Navigation Menu */}
      {mobileMenuOpen && (
        <div className="mobile-menu-drawer" style={{ background: '#ffffff', border: '1px solid #e4e4e7', borderRadius: '16px', padding: '16px', marginTop: '12px', boxShadow: '0 10px 30px rgba(0,0,0,0.1)', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <button onClick={() => handleNavClick('landing')} style={{ textAlign: 'left', padding: '12px 16px', borderRadius: '10px', border: 'none', background: activeTab === 'landing' ? '#fafafa' : 'transparent', fontWeight: '700', color: '#09090b', fontSize: '0.95rem', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            Product <ChevronRight size={16} color="#71717a" />
          </button>
          <button onClick={() => handleNavClick('voice')} style={{ textAlign: 'left', padding: '12px 16px', borderRadius: '10px', border: 'none', background: activeTab === 'voice' ? '#fafafa' : 'transparent', fontWeight: '700', color: '#09090b', fontSize: '0.95rem', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            Voice Console <ChevronRight size={16} color="#71717a" />
          </button>
          <button onClick={() => handleNavClick('knowledge')} style={{ textAlign: 'left', padding: '12px 16px', borderRadius: '10px', border: 'none', background: activeTab === 'knowledge' ? '#fafafa' : 'transparent', fontWeight: '700', color: '#09090b', fontSize: '0.95rem', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            Knowledge Hub <ChevronRight size={16} color="#71717a" />
          </button>
          <button onClick={() => handleNavClick('handoff')} style={{ textAlign: 'left', padding: '12px 16px', borderRadius: '10px', border: 'none', background: activeTab === 'handoff' ? '#fafafa' : 'transparent', fontWeight: '700', color: '#09090b', fontSize: '0.95rem', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            Escalations <ChevronRight size={16} color="#71717a" />
          </button>
          <button onClick={() => handleNavClick('evals')} style={{ textAlign: 'left', padding: '12px 16px', borderRadius: '10px', border: 'none', background: activeTab === 'evals' ? '#fafafa' : 'transparent', fontWeight: '700', color: '#09090b', fontSize: '0.95rem', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            Analytics <ChevronRight size={16} color="#71717a" />
          </button>

          <div style={{ borderTop: '1px solid #e4e4e7', paddingTop: '12px', marginTop: '4px', display: 'flex', gap: '8px' }}>
            <button onClick={() => handleNavClick('voice')} className="btn-outline" style={{ flex: 1, justifyContent: 'center' }}>
              Log in
            </button>
            <button onClick={() => handleNavClick('voice')} className="btn-black" style={{ flex: 1, justifyContent: 'center' }}>
              Get Started
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
