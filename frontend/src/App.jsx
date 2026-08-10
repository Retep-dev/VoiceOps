import React, { useState } from 'react';
import Navbar from './components/Navbar';
import VoiceConsole from './components/VoiceConsole';
import KnowledgeManager from './components/KnowledgeManager';
import EscalationQueue from './components/EscalationQueue';
import EvaluationDashboard from './components/EvaluationDashboard';

export default function App() {
  const [activeTab, setActiveTab] = useState('voice');

  return (
    <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '24px' }}>
      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />

      <main>
        {activeTab === 'voice' && <VoiceConsole />}
        {activeTab === 'knowledge' && <KnowledgeManager />}
        {activeTab === 'handoff' && <EscalationQueue />}
        {activeTab === 'evals' && <EvaluationDashboard />}
      </main>

      <footer style={{ textAlign: 'center', marginTop: '40px', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
        VoiceOps Platform — Production AI Voice Agent • Built with FastAPI, NVIDIA LLaMA 3.1 70B, Deepgram Nova-2, ElevenLabs & React
      </footer>
    </div>
  );
}
