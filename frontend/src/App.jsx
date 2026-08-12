import React, { useState } from 'react';
import Navbar from './components/Navbar';
import LandingPage from './components/LandingPage';
import VoiceConsole from './components/VoiceConsole';
import KnowledgeManager from './components/KnowledgeManager';
import EscalationQueue from './components/EscalationQueue';
import EvaluationDashboard from './components/EvaluationDashboard';

export default function App() {
  const [activeTab, setActiveTab] = useState('landing');

  return (
    <div style={{ minHeight: '100vh', background: '#fafafa', color: '#09090b' }}>
      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />

      <main>
        {activeTab === 'landing' && (
          <LandingPage 
            onGetStarted={() => setActiveTab('voice')} 
            onOpenConsole={() => setActiveTab('voice')} 
          />
        )}
        {activeTab === 'voice' && <VoiceConsole />}
        {activeTab === 'knowledge' && <KnowledgeManager />}
        {activeTab === 'handoff' && <EscalationQueue />}
        {activeTab === 'evals' && <EvaluationDashboard />}
      </main>

      <footer style={{ textAlign: 'center', padding: '32px 0', borderTop: '1px solid #e4e4e7', fontSize: '0.8rem', color: '#71717a', background: '#fafafa' }}>
        VoiceOps Platform — Production AI Voice Support & Operations • Monochromatic Clean Architecture
      </footer>
    </div>
  );
}
