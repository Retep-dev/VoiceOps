import React, { useState, useEffect } from 'react';
import { X, Play, Pause, Volume2, Mic, Cpu, Wrench, ArrowRight, CheckCircle2, RotateCcw } from 'lucide-react';

export default function DemoModal({ isOpen, onClose, onLaunchConsole }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  const steps = [
    {
      title: "1. Speech-to-Text (ASR)",
      subtitle: "Capturing customer speech input in real-time",
      speaker: "Customer",
      text: "I was charged for my order ORD-8842, can you check the shipping status?",
      badge: "Deepgram Nova-2 ASR",
    },
    {
      title: "2. Supervisor Agent Routing",
      subtitle: "Classifying customer intent & urgency",
      speaker: "Router Agent",
      text: "Intent: Order Tracking • Urgency: Normal • Selected Specialist: Operations Agent",
      badge: "Supervisor Router Node",
    },
    {
      title: "3. Validated Tool Execution",
      subtitle: "Executing Pydantic validated database tool calls",
      speaker: "Operations Agent",
      text: "Executed Tool: get_order({'order_id': 'ORD-8842'}) → Returns Order Details",
      badge: "Tool Registry Safety Check",
    },
    {
      title: "4. Text-to-Speech Output (TTS)",
      subtitle: "Synthesizing natural voice response",
      speaker: "Voice AI Response",
      text: "Your order ORD-8842 containing Wireless Headphones is currently Processing and will arrive tomorrow by 5 PM.",
      badge: "ElevenLabs / Browser TTS",
    },
  ];

  useEffect(() => {
    let timer;
    if (isPlaying) {
      // Speak the step content
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(steps[currentStep].text);
        utterance.onend = () => {
          if (currentStep < steps.length - 1) {
            setCurrentStep((prev) => prev + 1);
          } else {
            setIsPlaying(false);
          }
        };
        window.speechSynthesis.speak(utterance);
      } else {
        timer = setTimeout(() => {
          if (currentStep < steps.length - 1) {
            setCurrentStep((prev) => prev + 1);
          } else {
            setIsPlaying(false);
          }
        }, 4000);
      }
    }
    return () => {
      clearTimeout(timer);
      if ('speechSynthesis' in window) window.speechSynthesis.cancel();
    };
  }, [isPlaying, currentStep]);

  if (!isOpen) return null;

  const handlePlayPause = () => {
    if (isPlaying) {
      setIsPlaying(false);
      if ('speechSynthesis' in window) window.speechSynthesis.cancel();
    } else {
      setIsPlaying(true);
    }
  };

  const handleRestart = () => {
    setCurrentStep(0);
    setIsPlaying(true);
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0, 0, 0, 0.75)',
      backdropFilter: 'blur(8px)',
      zIndex: 1000,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px',
    }}>
      <div className="mono-card" style={{
        width: '100%',
        maxWidth: '720px',
        background: '#ffffff',
        borderRadius: '24px',
        padding: '28px',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        position: 'relative',
      }}>
        {/* Top Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '1px solid #e4e4e7', paddingBottom: '16px' }}>
          <div>
            <span className="badge-mono" style={{ marginBottom: '4px', display: 'inline-block' }}>Interactive Product Demo</span>
            <h3 style={{ fontSize: '1.25rem', fontWeight: '800', color: '#09090b' }}>VoiceOps Platform Walkthrough</h3>
          </div>
          <button 
            onClick={onClose} 
            style={{ background: '#fafafa', border: '1px solid #e4e4e7', borderRadius: '50%', width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
          >
            <X size={18} color="#000" />
          </button>
        </div>

        {/* Interactive Visual Canvas Player */}
        <div style={{ background: '#fafafa', border: '1px solid #e4e4e7', borderRadius: '16px', padding: '24px', marginBottom: '24px', position: 'relative', minHeight: '260px' }}>
          {/* Step Badges Navbar */}
          <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', flexWrap: 'wrap' }}>
            {steps.map((step, idx) => (
              <button
                key={idx}
                onClick={() => { setCurrentStep(idx); setIsPlaying(false); }}
                style={{
                  padding: '6px 12px',
                  borderRadius: '20px',
                  border: currentStep === idx ? '1px solid #000' : '1px solid #e4e4e7',
                  background: currentStep === idx ? '#000' : '#fff',
                  color: currentStep === idx ? '#fff' : '#52525b',
                  fontSize: '0.75rem',
                  fontWeight: '700',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                }}
              >
                {step.title}
              </button>
            ))}
          </div>

          {/* Step Active Display Card */}
          <div style={{ background: '#ffffff', border: '1px solid #000000', borderRadius: '14px', padding: '20px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
              <span style={{ fontSize: '0.8rem', fontWeight: '800', color: '#09090b', textTransform: 'uppercase' }}>{steps[currentStep].speaker}</span>
              <span className="badge-mono">{steps[currentStep].badge}</span>
            </div>

            <p style={{ fontSize: '1rem', fontWeight: '600', color: '#09090b', lineHeight: '1.5', marginBottom: '16px' }}>
              "{steps[currentStep].text}"
            </p>

            {/* Audio Waveform visualization */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', background: '#fafafa', padding: '10px 14px', borderRadius: '10px', border: '1px solid #f4f4f5' }}>
              <Volume2 size={16} color="#000" />
              <div style={{ display: 'flex', alignItems: 'center', gap: '3px', flex: 1, marginLeft: '8px' }}>
                {[12, 22, 16, 28, 14, 24, 18, 30, 20, 14, 26, 18, 22, 16, 24, 12, 20].map((h, i) => (
                  <span 
                    key={i} 
                    style={{ 
                      width: '3px', 
                      height: `${h}px`, 
                      background: isPlaying ? '#000' : '#d4d4d8', 
                      borderRadius: '2px', 
                      transition: 'all 0.2s ease' 
                    }} 
                  />
                ))}
              </div>
              <span style={{ fontSize: '0.75rem', fontWeight: '700', fontFamily: 'var(--font-mono)', color: '#71717a' }}>Step {currentStep + 1} of 4</span>
            </div>
          </div>

          {/* Subtitle description */}
          <p style={{ fontSize: '0.85rem', color: '#52525b', marginTop: '14px', textAlign: 'center', fontWeight: '500' }}>
            {steps[currentStep].subtitle}
          </p>
        </div>

        {/* Media Controls & Live Console CTA */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button onClick={handlePlayPause} className="btn-outline" style={{ padding: '10px 18px', fontSize: '0.85rem' }}>
              {isPlaying ? <Pause size={16} color="#000" /> : <Play size={16} color="#000" />}
              {isPlaying ? 'Pause Speech' : 'Play Walkthrough Audio'}
            </button>
            <button onClick={handleRestart} className="btn-outline" style={{ padding: '10px 14px' }}>
              <RotateCcw size={16} color="#000" />
            </button>
          </div>

          <button 
            onClick={() => { onClose(); onLaunchConsole(); }} 
            className="btn-black"
            style={{ padding: '12px 24px', fontSize: '0.9rem' }}
          >
            Try Live Console Now <ArrowRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
