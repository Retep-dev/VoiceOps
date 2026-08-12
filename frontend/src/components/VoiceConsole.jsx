import React, { useState, useRef, useEffect } from 'react';
import { Mic, MicOff, Send, Cpu, Wrench, Volume2, Clock, CheckCircle2, AlertTriangle, ShieldCheck, Sparkles, ArrowRight } from 'lucide-react';

export default function VoiceConsole() {
  const [isRecording, setIsRecording] = useState(false);
  const [liveTranscript, setLiveTranscript] = useState('');
  const [textInput, setTextInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [interactionResult, setInteractionResult] = useState(null);
  const [audioUrl, setAudioUrl] = useState(null);

  const recognitionRef = useRef(null);

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onresult = (event) => {
        let transcriptStr = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          transcriptStr += event.results[i][0].transcript;
        }
        setLiveTranscript(transcriptStr);
      };

      recognition.onend = () => {
        setIsRecording(false);
      };

      recognition.onerror = (err) => {
        console.warn("Speech recognition error:", err);
        setIsRecording(false);
      };

      recognitionRef.current = recognition;
    }
  }, []);

  const handleStartRecording = () => {
    setLiveTranscript('');
    if (recognitionRef.current) {
      try {
        recognitionRef.current.start();
        setIsRecording(true);
      } catch (e) {
        console.warn("Recognition start error:", e);
      }
    } else {
      alert("Browser speech recognition not supported. Please use text input or Chrome/Edge.");
    }
  };

  const handleStopRecording = () => {
    if (recognitionRef.current && isRecording) {
      recognitionRef.current.stop();
      setIsRecording(false);

      if (liveTranscript.trim()) {
        submitVoiceInteraction({ text_input: liveTranscript });
      }
    }
  };

  useEffect(() => {
    if (!isRecording && liveTranscript.trim() && !isLoading) {
      submitVoiceInteraction({ text_input: liveTranscript });
    }
  }, [isRecording]);

  const speakTextOutLoud = (text) => {
    if ('speechSynthesis' in window && text) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1.0;
      utterance.pitch = 1.0;
      window.speechSynthesis.speak(utterance);
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
        }),
      });
      const data = await res.json();
      setInteractionResult(data);

      if (data.ai_response_text) {
        speakTextOutLoud(data.ai_response_text);
      }

      if (data.audio_base64) {
        const mimeType = data.tts_metadata?.audio_format === 'mp3' ? 'audio/mp3' : 'audio/wav';
        const audioBlob = new Blob([Uint8Array.from(atob(data.audio_base64), c => c.charCodeAt(0))], { type: mimeType });
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
    <div style={{ maxWidth: '1240px', margin: '0 auto', padding: '0 24px 60px 24px' }}>
      <div className="responsive-two-column">
        {/* Left Column: Voice Console */}
        <div className="mono-card" style={{ padding: '28px' }}>

          <h2 style={{ fontSize: '1.25rem', fontWeight: '800', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px', color: '#09090b' }}>
            <Mic size={20} color="#000" />
            Voice Interaction Console
          </h2>

          {/* Recording Trigger Container */}
          <div style={{ background: '#fafafa', borderRadius: '16px', padding: '36px 24px', textAlign: 'center', marginBottom: '24px', border: '1px solid #e4e4e7' }}>
            <div style={{ marginBottom: '20px' }}>
              <button
                onClick={isRecording ? handleStopRecording : handleStartRecording}
                className={isRecording ? 'mono-recording-pulse' : ''}
                style={{
                  width: '80px',
                  height: '80px',
                  borderRadius: '50%',
                  border: 'none',
                  background: isRecording ? '#000000' : '#09090b',
                  color: '#fff',
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 8px 24px rgba(0, 0, 0, 0.15)',
                  transition: 'all 0.3s ease',
                }}
              >
                {isRecording ? <MicOff size={32} /> : <Mic size={32} />}
              </button>
            </div>

            <p style={{ fontSize: '0.9rem', fontWeight: '600', color: isRecording ? '#000000' : '#52525b' }}>
              {isRecording ? 'Listening... Speak your request now' : 'Click microphone to speak your request'}
            </p>

            {/* Real-time live transcript display */}
            {liveTranscript && (
              <div style={{ marginTop: '16px', padding: '10px 14px', borderRadius: '10px', background: '#ffffff', border: '1px solid #000000', fontSize: '0.9rem', color: '#09090b' }}>
                <span style={{ fontWeight: '700' }}>Live Speech: </span>"{liveTranscript}"
              </div>
            )}

            {/* Quick preset buttons */}
            <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', marginTop: '20px', flexWrap: 'wrap' }}>
              <button
                onClick={() => submitVoiceInteraction({ text_input: "Where is my recent order ORD-8842?" })}
                style={{ padding: '6px 14px', fontSize: '0.75rem', fontWeight: '600', borderRadius: '20px', border: '1px solid #e4e4e7', background: '#fff', color: '#09090b', cursor: 'pointer' }}
              >
                📦 Check Order ORD-8842
              </button>
              <button
                onClick={() => submitVoiceInteraction({ text_input: "What is your return policy window for items?" })}
                style={{ padding: '6px 14px', fontSize: '0.75rem', fontWeight: '600', borderRadius: '20px', border: '1px solid #e4e4e7', background: '#fff', color: '#09090b', cursor: 'pointer' }}
              >
                📖 Ask RAG Policy
              </button>
              <button
                onClick={() => submitVoiceInteraction({ text_input: "I need to speak to a human supervisor right now!" })}
                style={{ padding: '6px 14px', fontSize: '0.75rem', fontWeight: '600', borderRadius: '20px', border: '1px solid #000', background: '#000', color: '#fff', cursor: 'pointer' }}
              >
                ⚠️ Human Transfer
              </button>
            </div>
          </div>

          {/* Text Input Fallback */}
          <form onSubmit={handleTextSubmit} style={{ display: 'flex', gap: '10px' }}>
            <input
              type="text"
              placeholder="Or type customer message here..."
              value={textInput}
              onChange={(e) => setTextInput(e.target.value)}
              style={{
                flex: 1,
                padding: '12px 16px',
                borderRadius: '10px',
                border: '1px solid #e4e4e7',
                background: '#fafafa',
                color: '#09090b',
                outline: 'none',
                fontSize: '0.9rem',
              }}
            />
            <button type="submit" className="btn-black" disabled={isLoading} style={{ borderRadius: '10px', padding: '12px 20px' }}>
              <Send size={16} />
              Send
            </button>
          </form>
        </div>

        {/* Right Column: Multi-Agent Inspector */}
        <div className="mono-card" style={{ padding: '28px' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: '800', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px', color: '#09090b' }}>
            <Cpu size={20} color="#000" />
            Multi-Agent Execution Inspector
          </h2>

          {isLoading ? (
            <div style={{ textAlign: 'center', padding: '60px 0', color: '#71717a' }}>
              <div style={{ width: '36px', height: '36px', borderRadius: '50%', border: '3px solid #e4e4e7', borderTopColor: '#000000', margin: '0 auto 16px auto', animation: 'spin 1s linear infinite' }}></div>
              Processing Speech → Router → Agent Node → Tools...
            </div>
          ) : interactionResult ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {/* Active Agent Badge */}
              <div style={{ background: '#fafafa', padding: '16px', borderRadius: '12px', border: '1px solid #e4e4e7', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <span style={{ fontSize: '0.75rem', color: '#71717a', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: '700' }}>Routed Specialist Node</span>
                  <h3 style={{ fontSize: '1.1rem', color: '#09090b', marginTop: '2px', fontWeight: '800' }}>{interactionResult.active_agent}</h3>
                </div>
                <span className="badge-mono">
                  {interactionResult.active_agent}
                </span>
              </div>

              {/* Transcript & AI Response */}
              <div style={{ background: '#fafafa', padding: '16px', borderRadius: '12px', border: '1px solid #e4e4e7' }}>
                <p style={{ fontSize: '0.8rem', color: '#71717a', marginBottom: '4px', fontWeight: '600' }}>Customer Speech Transcript:</p>
                <p style={{ fontSize: '0.95rem', fontWeight: '700', color: '#09090b', marginBottom: '14px' }}>"{interactionResult.transcript}"</p>
                
                <p style={{ fontSize: '0.8rem', color: '#71717a', marginBottom: '4px', fontWeight: '600' }}>AI Agent Response (Audio Output):</p>
                <p style={{ fontSize: '0.95rem', color: '#27272a', lineHeight: '1.5' }}>{interactionResult.ai_response_text}</p>

                {/* Audio Player */}
                {audioUrl && (
                  <div style={{ marginTop: '16px', display: 'flex', alignItems: 'center', gap: '12px', background: '#ffffff', padding: '10px 14px', borderRadius: '10px', border: '1px solid #e4e4e7' }}>
                    <Volume2 color="#000" size={20} />
                    <audio controls autoPlay src={audioUrl} style={{ width: '100%', height: '32px' }} />
                  </div>
                )}
              </div>

              {/* Executed Tools */}
              {interactionResult.tool_calls && interactionResult.tool_calls.length > 0 && (
                <div style={{ background: '#ffffff', padding: '14px', borderRadius: '12px', border: '1px solid #000000' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
                    <Wrench color="#000" size={16} />
                    <span style={{ fontSize: '0.85rem', fontWeight: '800', color: '#09090b' }}>Validated Tool Calls Executed:</span>
                  </div>
                  {interactionResult.tool_calls.map((tool, idx) => (
                    <div key={idx} style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', background: '#fafafa', border: '1px solid #e4e4e7', padding: '8px 12px', borderRadius: '6px', color: '#09090b', fontWeight: '600' }}>
                      {tool.name}({JSON.stringify(tool.arguments)})
                    </div>
                  ))}
                </div>
              )}

              {/* Latency Waterfall */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px', fontSize: '0.75rem', textAlign: 'center' }}>
                <div style={{ background: '#fafafa', padding: '8px', borderRadius: '8px', border: '1px solid #e4e4e7' }}>
                  <span style={{ color: '#71717a' }}>ASR</span>
                  <p style={{ fontWeight: '700', color: '#09090b' }}>{interactionResult.latency_breakdown_ms?.asr_latency_ms}ms</p>
                </div>
                <div style={{ background: '#fafafa', padding: '8px', borderRadius: '8px', border: '1px solid #e4e4e7' }}>
                  <span style={{ color: '#71717a' }}>Agent</span>
                  <p style={{ fontWeight: '700', color: '#09090b' }}>{interactionResult.latency_breakdown_ms?.agent_latency_ms}ms</p>
                </div>
                <div style={{ background: '#fafafa', padding: '8px', borderRadius: '8px', border: '1px solid #e4e4e7' }}>
                  <span style={{ color: '#71717a' }}>TTS</span>
                  <p style={{ fontWeight: '700', color: '#09090b' }}>{interactionResult.latency_breakdown_ms?.tts_latency_ms}ms</p>
                </div>
                <div style={{ background: '#000000', padding: '8px', borderRadius: '8px', color: '#fff' }}>
                  <span style={{ color: '#a1a1aa' }}>Total</span>
                  <p style={{ fontWeight: '700', color: '#fff' }}>{interactionResult.latency_breakdown_ms?.total_latency_ms}ms</p>
                </div>
              </div>
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '60px 0', color: '#71717a' }}>
              Speak into your microphone or enter text to inspect real-time agent routing, tool execution, and audio synthesis output.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
