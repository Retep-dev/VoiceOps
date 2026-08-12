import React, { useState } from 'react';
import { ArrowRight, Play, Volume2, Mic, Bot, Zap, BookOpen, Sparkles, Check, ChevronRight } from 'lucide-react';

export default function LandingPage({ onGetStarted, onOpenConsole }) {
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);

  const handlePlayDemoAudio = () => {
    setIsPlayingAudio(true);
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance("Your order 4821 was shipped yesterday and will arrive tomorrow.");
      utterance.onend = () => setIsPlayingAudio(false);
      window.speechSynthesis.speak(utterance);
    } else {
      setTimeout(() => setIsPlayingAudio(false), 3000);
    }
  };

  return (
    <div style={{ maxWidth: '1240px', margin: '0 auto', padding: '0 24px 80px 24px' }}>
      {/* Hero Section */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.1fr 0.9fr', gap: '48px', alignItems: 'center', minHeight: '540px', padding: '40px 0' }}>
        {/* Left Hero Content */}
        <div>
          <div className="badge-pill" style={{ marginBottom: '24px' }}>
            <Sparkles size={14} color="#000" />
            AI VOICE SUPPORT, DONE RIGHT
          </div>

          <h1 style={{ fontSize: '3.6rem', fontWeight: '800', lineHeight: '1.08', letterSpacing: '-1.5px', color: '#09090b', marginBottom: '20px' }}>
            AI that listens, understands and acts.
          </h1>

          <p style={{ fontSize: '1.15rem', color: '#52525b', lineHeight: '1.6', marginBottom: '32px', maxWidth: '520px' }}>
            VoiceOps is an AI voice agent that handles customer conversations, retrieves knowledge, performs real actions and escalates when needed.
          </p>

          {/* CTA Buttons */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '48px' }}>
            <button onClick={onOpenConsole} className="btn-black" style={{ padding: '14px 28px', fontSize: '1rem' }}>
              Start your free trial <ArrowRight size={18} />
            </button>

            <button onClick={handlePlayDemoAudio} className="btn-outline" style={{ padding: '14px 24px', fontSize: '1rem' }}>
              <div style={{ width: '28px', height: '28px', borderRadius: '50%', border: '1px solid #000', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Play size={12} fill="#000" />
              </div>
              Watch demo
            </button>
          </div>

          {/* Sub-feature icons ribbon */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', paddingTop: '24px', borderTop: '1px solid #e4e4e7' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
              <div style={{ padding: '6px', border: '1px solid #e4e4e7', borderRadius: '8px', background: '#fff' }}>
                <Mic size={16} color="#000" />
              </div>
              <div>
                <h4 style={{ fontSize: '0.85rem', fontWeight: '700', color: '#09090b' }}>Speech to Text</h4>
                <p style={{ fontSize: '0.75rem', color: '#71717a' }}>Accurate ASR</p>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
              <div style={{ padding: '6px', border: '1px solid #e4e4e7', borderRadius: '8px', background: '#fff' }}>
                <Bot size={16} color="#000" />
              </div>
              <div>
                <h4 style={{ fontSize: '0.85rem', fontWeight: '700', color: '#09090b' }}>AI Agents</h4>
                <p style={{ fontSize: '0.75rem', color: '#71717a' }}>Multi-agent system</p>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
              <div style={{ padding: '6px', border: '1px solid #e4e4e7', borderRadius: '8px', background: '#fff' }}>
                <Zap size={16} color="#000" />
              </div>
              <div>
                <h4 style={{ fontSize: '0.85rem', fontWeight: '700', color: '#09090b' }}>Smart Actions</h4>
                <p style={{ fontSize: '0.75rem', color: '#71717a' }}>Tools & Integrations</p>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
              <div style={{ padding: '6px', border: '1px solid #e4e4e7', borderRadius: '8px', background: '#fff' }}>
                <Volume2 size={16} color="#000" />
              </div>
              <div>
                <h4 style={{ fontSize: '0.85rem', fontWeight: '700', color: '#09090b' }}>Text to Speech</h4>
                <p style={{ fontSize: '0.75rem', color: '#71717a' }}>Natural voices</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Hero Illustration */}
        <div style={{ position: 'relative', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          {/* Subtle dotted background grid */}
          <div style={{ position: 'absolute', top: '10%', right: '15%', width: '60px', height: '60px', backgroundImage: 'radial-gradient(#d4d4d8 1.5px, transparent 1.5px)', backgroundSize: '10px 10px', opacity: 0.8 }}></div>

          {/* Headset Vector Graphic */}
          <div style={{ position: 'relative', width: '380px', height: '380px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {/* Waveform Lines Left & Right */}
            <div style={{ display: 'flex', gap: '4px', alignItems: 'center', position: 'absolute', left: '-20px' }}>
              <span style={{ width: '3px', height: '12px', background: '#000', borderRadius: '2px' }}></span>
              <span style={{ width: '3px', height: '24px', background: '#000', borderRadius: '2px' }}></span>
              <span style={{ width: '3px', height: '36px', background: '#000', borderRadius: '2px' }}></span>
              <span style={{ width: '3px', height: '18px', background: '#000', borderRadius: '2px' }}></span>
            </div>

            <div style={{ display: 'flex', gap: '4px', alignItems: 'center', position: 'absolute', right: '-20px' }}>
              <span style={{ width: '3px', height: '18px', background: '#000', borderRadius: '2px' }}></span>
              <span style={{ width: '3px', height: '36px', background: '#000', borderRadius: '2px' }}></span>
              <span style={{ width: '3px', height: '24px', background: '#000', borderRadius: '2px' }}></span>
              <span style={{ width: '3px', height: '12px', background: '#000', borderRadius: '2px' }}></span>
            </div>

            {/* Clean Headset Icon Representation */}
            <svg width="260" height="260" viewBox="0 0 24 24" fill="none" stroke="#000" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 14v-3a9 9 0 0 1 18 0v3" />
              <path d="M18 19a2 2 0 0 1-2-2v-4a2 2 0 0 1 2-2h1a2 2 0 0 1 2 2v4a2 2 0 0 1-2 2h-1z" fill="#000" />
              <path d="M6 19a2 2 0 0 0 2-2v-4a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v4a2 2 0 0 0 2 2h1z" fill="#000" />
              <path d="M19 19c0 1.5-1.5 3-4 3h-2" />
              <circle cx="12" cy="22" r="1.5" fill="#000" />
            </svg>
          </div>

          {/* Floating Speech Bubble Card */}
          <div className="mono-card" style={{ position: 'absolute', bottom: '-20px', right: '10px', width: '340px', padding: '16px 20px', borderRadius: '16px', background: '#ffffff', boxShadow: '0 20px 40px rgba(0,0,0,0.08)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
              <div style={{ width: '36px', height: '36px', borderRadius: '50%', border: '1px solid #e4e4e7', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#fafafa' }}>
                <Volume2 size={18} color="#000" />
              </div>
              <p style={{ fontSize: '0.85rem', fontWeight: '600', color: '#09090b', lineHeight: '1.4' }}>
                Your order #4821 was shipped yesterday and will arrive tomorrow.
              </p>
            </div>

            {/* Audio Waveform visualization bar */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#fafafa', padding: '8px 12px', borderRadius: '10px', border: '1px solid #f4f4f5' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                {[12, 18, 24, 14, 28, 20, 10, 22, 16, 26, 12, 18, 22, 14].map((height, i) => (
                  <span key={i} style={{ width: '2.5px', height: `${height}px`, background: isPlayingAudio ? '#000' : '#a1a1aa', borderRadius: '2px', transition: 'all 0.2s ease' }}></span>
                ))}
              </div>
              <span style={{ fontSize: '0.75rem', fontFamily: 'var(--font-mono)', fontWeight: '600', color: '#71717a' }}>00:08</span>
            </div>
          </div>
        </div>
      </div>

      {/* Trusted Customer Logos Ribbon */}
      <div style={{ margin: '60px 0 80px 0', textAlign: 'center', borderTop: '1px solid #e4e4e7', paddingTop: '40px' }}>
        <p style={{ fontSize: '0.85rem', fontWeight: '600', color: '#71717a', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '24px' }}>
          Trusted by growing teams
        </p>

        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '48px', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '1.25rem', fontWeight: '900', letterSpacing: '-0.5px', color: '#09090b' }}>ACME</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '1.1rem', fontWeight: '700', color: '#09090b' }}>
            <span style={{ fontSize: '1.4rem' }}>☁</span> Cloudly
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '1.1rem', fontWeight: '700', color: '#09090b' }}>
            <span style={{ fontSize: '1.2rem' }}>❖</span> Layerstack
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '1.1rem', fontWeight: '700', color: '#09090b' }}>
            <span style={{ fontSize: '1.2rem' }}>✦</span> Spherule
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '1.1rem', fontWeight: '700', color: '#09090b' }}>
            <span style={{ fontSize: '1.2rem' }}>▶</span> Penta
          </div>
        </div>
      </div>

      {/* Bottom Features Grid */}
      <div className="mono-card" style={{ padding: '48px', borderRadius: '24px', background: '#ffffff' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 3fr', gap: '48px', alignItems: 'start' }}>
          <div>
            <h2 style={{ fontSize: '2.2rem', fontWeight: '800', lineHeight: '1.15', color: '#09090b', marginBottom: '16px' }}>
              Everything you need to deliver exceptional support
            </h2>
            <p style={{ fontSize: '0.95rem', color: '#52525b', lineHeight: '1.6' }}>
              Combine voice AI, knowledge retrieval and automation to resolve more in less time.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px' }}>
            {/* Feature Card 1 */}
            <div style={{ background: '#fafafa', padding: '24px 20px', borderRadius: '16px', border: '1px solid #f4f4f5', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', minHeight: '220px' }}>
              <div>
                <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: '#fff', border: '1px solid #e4e4e7', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
                  <Volume2 size={20} color="#000" />
                </div>
                <h3 style={{ fontSize: '1.05rem', fontWeight: '700', color: '#09090b', marginBottom: '8px' }}>Voice AI</h3>
                <p style={{ fontSize: '0.8rem', color: '#71717a', lineHeight: '1.5' }}>
                  Support real-time conversations with accurate ASR and natural TTS.
                </p>
              </div>
              <button onClick={onOpenConsole} style={{ background: 'transparent', border: 'none', color: '#09090b', fontWeight: '700', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer', padding: 0 }}>
                Learn more <ChevronRight size={14} />
              </button>
            </div>

            {/* Feature Card 2 */}
            <div style={{ background: '#fafafa', padding: '24px 20px', borderRadius: '16px', border: '1px solid #f4f4f5', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', minHeight: '220px' }}>
              <div>
                <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: '#fff', border: '1px solid #e4e4e7', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
                  <BookOpen size={20} color="#000" />
                </div>
                <h3 style={{ fontSize: '1.05rem', fontWeight: '700', color: '#09090b', marginBottom: '8px' }}>Knowledge Retrieval</h3>
                <p style={{ fontSize: '0.8rem', color: '#71717a', lineHeight: '1.5' }}>
                  Find answers instantly from your documents with RAG.
                </p>
              </div>
              <button onClick={onOpenConsole} style={{ background: 'transparent', border: 'none', color: '#09090b', fontWeight: '700', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer', padding: 0 }}>
                Learn more <ChevronRight size={14} />
              </button>
            </div>

            {/* Feature Card 3 */}
            <div style={{ background: '#fafafa', padding: '24px 20px', borderRadius: '16px', border: '1px solid #f4f4f5', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', minHeight: '220px' }}>
              <div>
                <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: '#fff', border: '1px solid #e4e4e7', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
                  <Bot size={20} color="#000" />
                </div>
                <h3 style={{ fontSize: '1.05rem', fontWeight: '700', color: '#09090b', marginBottom: '8px' }}>AI Agents</h3>
                <p style={{ fontSize: '0.8rem', color: '#71717a', lineHeight: '1.5' }}>
                  Specialized agents work together to understand and act.
                </p>
              </div>
              <button onClick={onOpenConsole} style={{ background: 'transparent', border: 'none', color: '#09090b', fontWeight: '700', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer', padding: 0 }}>
                Learn more <ChevronRight size={14} />
              </button>
            </div>

            {/* Feature Card 4 */}
            <div style={{ background: '#fafafa', padding: '24px 20px', borderRadius: '16px', border: '1px solid #f4f4f5', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', minHeight: '220px' }}>
              <div>
                <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: '#fff', border: '1px solid #e4e4e7', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
                  <Zap size={20} color="#000" />
                </div>
                <h3 style={{ fontSize: '1.05rem', fontWeight: '700', color: '#09090b', marginBottom: '8px' }}>Smart Actions</h3>
                <p style={{ fontSize: '0.8rem', color: '#71717a', lineHeight: '1.5' }}>
                  Perform real actions using secure tools and integrations.
                </p>
              </div>
              <button onClick={onOpenConsole} style={{ background: 'transparent', border: 'none', color: '#09090b', fontWeight: '700', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer', padding: 0 }}>
                Learn more <ChevronRight size={14} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
