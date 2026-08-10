import React, { useState, useRef } from 'react';
import { Mic, MicOff, Send, Cpu, Wrench, Volume2, Clock, CheckCircle2, AlertTriangle, ShieldCheck } from 'lucide-react';

export default function VoiceConsole() {
  const [isRecording, setIsRecording] = useState(false);
  const [textInput, setTextInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [interactionResult, setInteractionResult] = useState(null);
  const [audioUrl, setAudioUrl] = useState(null);

  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);

  const handleStartRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      audioChunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorderRef.current.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        const reader = new FileReader();
        reader.readAsDataURL(audioBlob);
        reader.onloadend = async () => {
          const base64Audio = reader.result.split(',')[1];
          await submitVoiceInteraction({ audio_base64: base64Audio });
        };
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
    } catch (err) {
      console.warn("Microphone access denied or unreleased — using test voice payload:", err);
      setIsRecording(false);
      // Fallback submit for demonstration
      await submitVoiceInteraction({ text_input: "Where is my recent order ORD-8842?" });
    }
  };

  const handleStopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const submitVoiceInteraction = async (payload) => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/voice/interact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...payload,
          customer_id: 'cust_1001',
          asr_provider: 'mock',
          tts_provider: 'mock',
        }),
      });
      const data = await res.json();
      setInteractionResult(data);

      if (data.audio_base64) {
        const audioBlob = new Blob([Uint8Array.from(atob(data.audio_base64), c => c.charCodeAt(0))], { type: 'audio/mp3' });
        setAudioUrl(URL.createObjectURL(audioBlob));
      }
    } catch (error) {
      console.error("Voice interaction failed:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleTextSubmit = (e) => {
    e.preventDefault();
    if (!textInput.trim()) return;
    submitVoiceInteraction({ text_input: textInput });
    setTextInput('');
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
      {/* Left Column: Voice Console & Audio Control */}
      <div className="glass-panel" style={{ padding: '24px' }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: '700', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Mic color="#06b6d4" size={20} />
          Voice Interaction Console
        </h2>

        {/* Audio Waveform & Mic Trigger */}
        <div style={{ background: 'rgba(0, 0, 0, 0.3)', borderRadius: '16px', padding: '36px 24px', textAlign: 'center', marginBottom: '24px', border: '1px dashed rgba(255, 255, 255, 0.1)' }}>
          <div style={{ marginBottom: '20px' }}>
            <button
              onClick={isRecording ? handleStopRecording : handleStartRecording}
              className={isRecording ? 'recording-pulse' : ''}
              style={{
                width: '80px',
                height: '80px',
                borderRadius: '50%',
                border: 'none',
                background: isRecording ? 'linear-gradient(135deg, #f43f5e, #e11d48)' : 'linear-gradient(135deg, #06b6d4, #6366f1)',
                color: '#fff',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 0 30px rgba(99, 102, 241, 0.4)',
                transition: 'all 0.3s ease',
              }}
            >
              {isRecording ? <MicOff size={32} /> : <Mic size={32} />}
            </button>
          </div>
          <p style={{ fontSize: '0.9rem', fontWeight: '600', color: isRecording ? '#f43f5e' : 'var(--text-muted)' }}>
            {isRecording ? 'Listening... Speak your request now' : 'Click microphone to record customer voice input'}
          </p>

          {/* Quick preset buttons */}
          <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', marginTop: '16px', flexWrap: 'wrap' }}>
            <button
              onClick={() => submitVoiceInteraction({ text_input: "Where is my recent order ORD-8842?" })}
              style={{ padding: '6px 12px', fontSize: '0.75rem', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.05)', color: '#fff', cursor: 'pointer' }}
            >
              📦 Preset: Check Order ORD-8842
            </button>
            <button
              onClick={() => submitVoiceInteraction({ text_input: "What is your return policy window for items?" })}
              style={{ padding: '6px 12px', fontSize: '0.75rem', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.05)', color: '#fff', cursor: 'pointer' }}
            >
              📖 Preset: Ask RAG Policy
            </button>
            <button
              onClick={() => submitVoiceInteraction({ text_input: "I need to speak to a human supervisor right now!" })}
              style={{ padding: '6px 12px', fontSize: '0.75rem', borderRadius: '20px', border: '1px solid rgba(244,63,94,0.3)', background: 'rgba(244,63,94,0.1)', color: '#f43f5e', cursor: 'pointer' }}
            >
              ⚠️ Preset: Human Transfer
            </button>
          </div>
        </div>

        {/* Text Input Fallback */}
        <form onSubmit={handleTextSubmit} style={{ display: 'flex', gap: '8px' }}>
          <input
            type="text"
            placeholder="Or type customer message here..."
            value={textInput}
            onChange={(e) => setTextInput(e.target.value)}
            style={{
              flex: 1,
              padding: '12px 16px',
              borderRadius: '10px',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              background: 'rgba(0, 0, 0, 0.4)',
              color: '#fff',
              outline: 'none',
            }}
          />
          <button type="submit" className="btn-primary" disabled={isLoading}>
            <Send size={16} />
            Send
          </button>
        </form>
      </div>

      {/* Right Column: Active Agent Node, Tool Execution & Audio Output */}
      <div className="glass-panel" style={{ padding: '24px' }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: '700', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Cpu color="#a855f7" size={20} />
          Multi-Agent Execution Inspector
        </h2>

        {isLoading ? (
          <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-muted)' }}>
            <div className="recording-pulse" style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'var(--primary-indigo)', margin: '0 auto 16px auto' }}></div>
            Processing Speech → Router → Agent Node → Tools...
          </div>
        ) : interactionResult ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {/* Active Agent Badge */}
            <div style={{ background: 'rgba(255, 255, 255, 0.03)', padding: '16px', borderRadius: '12px', border: '1px solid rgba(255, 255, 255, 0.08)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Routed Specialist Node</span>
                <h3 style={{ fontSize: '1.1rem', color: '#38bdf8', marginTop: '2px', fontWeight: '700' }}>{interactionResult.active_agent}</h3>
              </div>
              <span className={`badge ${interactionResult.active_agent.includes('escalation') ? 'badge-rose' : 'badge-purple'}`}>
                {interactionResult.active_agent}
              </span>
            </div>

            {/* Transcript & AI Response */}
            <div style={{ background: 'rgba(0, 0, 0, 0.3)', padding: '16px', borderRadius: '12px' }}>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '4px' }}>Customer ASR Transcript:</p>
              <p style={{ fontSize: '0.95rem', fontWeight: '600', color: '#fff', marginBottom: '12px' }}>"{interactionResult.transcript}"</p>
              
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '4px' }}>AI Agent Response:</p>
              <p style={{ fontSize: '0.95rem', color: '#e2e8f0', lineHeight: '1.5' }}>{interactionResult.ai_response_text}</p>

              {/* TTS Audio Player */}
              {audioUrl && (
                <div style={{ marginTop: '16px', display: 'flex', alignItems: 'center', gap: '12px', background: 'rgba(99, 102, 241, 0.1)', padding: '10px 14px', borderRadius: '10px' }}>
                  <Volume2 color="#6366f1" size={20} />
                  <audio controls src={audioUrl} style={{ width: '100%', height: '32px' }} />
                </div>
              )}
            </div>

            {/* Executed Tools */}
            {interactionResult.tool_calls && interactionResult.tool_calls.length > 0 && (
              <div style={{ background: 'rgba(255, 255, 255, 0.03)', padding: '14px', borderRadius: '12px', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
                  <Wrench color="#10b981" size={16} />
                  <span style={{ fontSize: '0.85rem', fontWeight: '700', color: '#10b981' }}>Validated Tool Calls Executed:</span>
                </div>
                {interactionResult.tool_calls.map((tool, idx) => (
                  <div key={idx} style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', background: 'rgba(0, 0, 0, 0.5)', padding: '8px 12px', borderRadius: '6px', color: '#38bdf8' }}>
                    {tool.name}({JSON.stringify(tool.arguments)})
                  </div>
                ))}
              </div>
            )}

            {/* Latency Breakdown Waterfall */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px', fontSize: '0.75rem', textAlign: 'center' }}>
              <div style={{ background: 'rgba(255,255,255,0.03)', padding: '8px', borderRadius: '8px' }}>
                <span style={{ color: 'var(--text-muted)' }}>ASR</span>
                <p style={{ fontWeight: '700', color: '#38bdf8' }}>{interactionResult.latency_breakdown_ms?.asr_latency_ms}ms</p>
              </div>
              <div style={{ background: 'rgba(255,255,255,0.03)', padding: '8px', borderRadius: '8px' }}>
                <span style={{ color: 'var(--text-muted)' }}>Agent</span>
                <p style={{ fontWeight: '700', color: '#a855f7' }}>{interactionResult.latency_breakdown_ms?.agent_latency_ms}ms</p>
              </div>
              <div style={{ background: 'rgba(255,255,255,0.03)', padding: '8px', borderRadius: '8px' }}>
                <span style={{ color: 'var(--text-muted)' }}>TTS</span>
                <p style={{ fontWeight: '700', color: '#10b981' }}>{interactionResult.latency_breakdown_ms?.tts_latency_ms}ms</p>
              </div>
              <div style={{ background: 'rgba(99, 102, 241, 0.15)', padding: '8px', borderRadius: '8px' }}>
                <span style={{ color: '#818cf8' }}>Total</span>
                <p style={{ fontWeight: '700', color: '#fff' }}>{interactionResult.latency_breakdown_ms?.total_latency_ms}ms</p>
              </div>
            </div>
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-muted)' }}>
            Record audio or enter text to inspect real-time agent routing, tool execution, and latency waterfalls.
          </div>
        )}
      </div>
    </div>
  );
}
