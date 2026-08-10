import React, { useState, useEffect } from 'react';
import { UserCheck, AlertTriangle, CheckCircle, Clock, FileText, ArrowRight } from 'lucide-react';

export default function EscalationQueue() {
  const [escalations, setEscalations] = useState([]);
  const [selectedEscalation, setSelectedEscalation] = useState(null);
  const [resolutionNotes, setResolutionNotes] = useState('');

  useEffect(() => {
    fetchEscalations();
  }, []);

  const fetchEscalations = async () => {
    try {
      const res = await fetch('/api/escalations');
      const data = await res.json();
      setEscalations(data || []);
      if (data && data.length > 0 && !selectedEscalation) {
        setSelectedEscalation(data[0]);
      }
    } catch (e) {
      console.error("Failed to fetch escalations:", e);
    }
  };

  const handleResolve = async (e) => {
    e.preventDefault();
    if (!selectedEscalation || !resolutionNotes.trim()) return;

    try {
      const res = await fetch(`/api/escalations/${selectedEscalation.escalation_id}/resolve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ human_agent_id: 'human_rep_1', notes: resolutionNotes }),
      });
      if (res.ok) {
        const updated = await res.json();
        setSelectedEscalation(updated);
        setResolutionNotes('');
        await fetchEscalations();
      }
    } catch (err) {
      console.error("Resolve failed:", err);
    }
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: '24px' }}>
      {/* Left Column: Escalations Queue List */}
      <div className="glass-panel" style={{ padding: '24px' }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: '700', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <UserCheck color="#f43f5e" size={20} />
          Human Escalation Queue ({escalations.length})
        </h2>

        {escalations.length === 0 ? (
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>No escalated conversations requiring human transfer.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {escalations.map((esc) => (
              <div
                key={esc.escalation_id}
                onClick={() => setSelectedEscalation(esc)}
                style={{
                  padding: '14px 16px',
                  borderRadius: '12px',
                  border: selectedEscalation?.escalation_id === esc.escalation_id ? '1px solid #f43f5e' : '1px solid rgba(255,255,255,0.05)',
                  background: selectedEscalation?.escalation_id === esc.escalation_id ? 'rgba(244, 63, 94, 0.1)' : 'rgba(255,255,255,0.03)',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                  <span style={{ fontWeight: '700', fontSize: '0.9rem', color: '#fff' }}>{esc.customer_id}</span>
                  <span className={`badge ${esc.status === 'resolved' ? 'badge-green' : 'badge-rose'}`}>
                    {esc.status}
                  </span>
                </div>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '4px' }}>Reason: {esc.reason}</p>
                <span style={{ fontSize: '0.7rem', color: '#818cf8' }}>ID: {esc.escalation_id}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Right Column: Structured Handoff Dossier Inspector */}
      <div className="glass-panel" style={{ padding: '24px' }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: '700', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <FileText color="#38bdf8" size={20} />
          AI-Generated Handoff Dossier
        </h2>

        {selectedEscalation ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ background: 'rgba(0,0,0,0.3)', padding: '16px', borderRadius: '12px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Customer ID</span>
                <p style={{ fontWeight: '700', color: '#38bdf8' }}>{selectedEscalation.customer_id}</p>
              </div>
              <div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Escalation Status</span>
                <p style={{ fontWeight: '700', color: selectedEscalation.status === 'resolved' ? '#10b981' : '#f43f5e' }}>{selectedEscalation.status.toUpperCase()}</p>
              </div>
              <div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Urgency Priority</span>
                <p style={{ fontWeight: '700', color: '#f59e0b' }}>{selectedEscalation.urgency.toUpperCase()}</p>
              </div>
              <div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Detected Intent</span>
                <p style={{ fontWeight: '700', color: '#a855f7' }}>{selectedEscalation.intent}</p>
              </div>
            </div>

            <div style={{ background: 'rgba(255, 255, 255, 0.03)', padding: '14px', borderRadius: '12px' }}>
              <h4 style={{ fontSize: '0.85rem', color: '#f43f5e', marginBottom: '4px' }}>Escalation Reason:</h4>
              <p style={{ fontSize: '0.9rem', color: '#fff' }}>{selectedEscalation.reason}</p>
            </div>

            {/* Conversation Transcript History */}
            {selectedEscalation.full_transcript && selectedEscalation.full_transcript.length > 0 && (
              <div>
                <h4 style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '8px' }}>Call Transcript History:</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', maxHeight: '180px', overflowY: 'auto' }}>
                  {selectedEscalation.full_transcript.map((turn, i) => (
                    <div key={i} style={{ fontSize: '0.8rem', background: 'rgba(0,0,0,0.3)', padding: '8px 12px', borderRadius: '6px' }}>
                      <span style={{ fontWeight: '700', color: turn.role === 'user' ? '#38bdf8' : '#a855f7' }}>{turn.role.toUpperCase()}: </span>
                      <span style={{ color: '#e2e8f0' }}>{turn.content}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Resolve Form */}
            {selectedEscalation.status !== 'resolved' ? (
              <form onSubmit={handleResolve} style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
                <input
                  type="text"
                  placeholder="Enter human representative resolution notes..."
                  value={resolutionNotes}
                  onChange={(e) => setResolutionNotes(e.target.value)}
                  style={{
                    flex: 1,
                    padding: '10px 14px',
                    borderRadius: '8px',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    background: 'rgba(0,0,0,0.4)',
                    color: '#fff',
                    outline: 'none',
                  }}
                />
                <button type="submit" className="btn-primary">
                  Resolve Ticket
                </button>
              </form>
            ) : (
              <div style={{ background: 'rgba(16, 185, 129, 0.1)', padding: '12px', borderRadius: '10px', border: '1px solid rgba(16, 185, 129, 0.3)', fontSize: '0.85rem' }}>
                <span style={{ fontWeight: '700', color: '#10b981' }}>Resolved Notes: </span>
                <span style={{ color: '#fff' }}>{selectedEscalation.human_notes}</span>
              </div>
            )}
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-muted)' }}>
            Select an escalation record to view AI-generated handoff details.
          </div>
        )}
      </div>
    </div>
  );
}
