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
    <div style={{ maxWidth: '1240px', margin: '0 auto', padding: '0 24px 60px 24px' }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: '24px' }}>
        {/* Left Column: Escalations Queue List */}
        <div className="mono-card" style={{ padding: '28px' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: '800', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px', color: '#09090b' }}>
            <UserCheck size={20} color="#000" />
            Human Escalation Queue ({escalations.length})
          </h2>

          {escalations.length === 0 ? (
            <p style={{ fontSize: '0.85rem', color: '#71717a' }}>No escalated conversations requiring human transfer.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {escalations.map((esc) => (
                <div
                  key={esc.escalation_id}
                  onClick={() => setSelectedEscalation(esc)}
                  style={{
                    padding: '16px',
                    borderRadius: '12px',
                    border: selectedEscalation?.escalation_id === esc.escalation_id ? '2px solid #000000' : '1px solid #e4e4e7',
                    background: selectedEscalation?.escalation_id === esc.escalation_id ? '#fafafa' : '#ffffff',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                    <span style={{ fontWeight: '800', fontSize: '0.9rem', color: '#09090b' }}>{esc.customer_id}</span>
                    <span className="badge-mono">
                      {esc.status}
                    </span>
                  </div>
                  <p style={{ fontSize: '0.8rem', color: '#52525b', marginBottom: '4px' }}>Reason: {esc.reason}</p>
                  <span style={{ fontSize: '0.7rem', color: '#71717a', fontFamily: 'var(--font-mono)' }}>ID: {esc.escalation_id}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Column: Structured Handoff Dossier Inspector */}
        <div className="mono-card" style={{ padding: '28px' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: '800', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px', color: '#09090b' }}>
            <FileText size={20} color="#000" />
            AI-Generated Handoff Dossier
          </h2>

          {selectedEscalation ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ background: '#fafafa', padding: '16px', borderRadius: '12px', border: '1px solid #e4e4e7', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <span style={{ fontSize: '0.75rem', color: '#71717a', fontWeight: '600' }}>Customer ID</span>
                  <p style={{ fontWeight: '800', color: '#09090b' }}>{selectedEscalation.customer_id}</p>
                </div>
                <div>
                  <span style={{ fontSize: '0.75rem', color: '#71717a', fontWeight: '600' }}>Escalation Status</span>
                  <p style={{ fontWeight: '800', color: '#09090b' }}>{selectedEscalation.status.toUpperCase()}</p>
                </div>
                <div>
                  <span style={{ fontSize: '0.75rem', color: '#71717a', fontWeight: '600' }}>Urgency Priority</span>
                  <p style={{ fontWeight: '800', color: '#09090b' }}>{selectedEscalation.urgency.toUpperCase()}</p>
                </div>
                <div>
                  <span style={{ fontSize: '0.75rem', color: '#71717a', fontWeight: '600' }}>Detected Intent</span>
                  <p style={{ fontWeight: '800', color: '#09090b' }}>{selectedEscalation.intent}</p>
                </div>
              </div>

              <div style={{ background: '#ffffff', padding: '16px', borderRadius: '12px', border: '1px solid #000000' }}>
                <h4 style={{ fontSize: '0.85rem', color: '#09090b', marginBottom: '4px', fontWeight: '800' }}>Escalation Reason:</h4>
                <p style={{ fontSize: '0.9rem', color: '#27272a' }}>{selectedEscalation.reason}</p>
              </div>

              {/* Conversation Transcript History */}
              {selectedEscalation.full_transcript && selectedEscalation.full_transcript.length > 0 && (
                <div>
                  <h4 style={{ fontSize: '0.85rem', color: '#71717a', marginBottom: '8px', fontWeight: '700' }}>Call Transcript History:</h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', maxHeight: '180px', overflowY: 'auto' }}>
                    {selectedEscalation.full_transcript.map((turn, i) => (
                      <div key={i} style={{ fontSize: '0.8rem', background: '#fafafa', padding: '8px 12px', borderRadius: '6px', border: '1px solid #e4e4e7' }}>
                        <span style={{ fontWeight: '800', color: '#09090b' }}>{turn.role.toUpperCase()}: </span>
                        <span style={{ color: '#27272a' }}>{turn.content}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Resolve Form */}
              {selectedEscalation.status !== 'resolved' ? (
                <form onSubmit={handleResolve} style={{ display: 'flex', gap: '10px', marginTop: '8px' }}>
                  <input
                    type="text"
                    placeholder="Enter human representative resolution notes..."
                    value={resolutionNotes}
                    onChange={(e) => setResolutionNotes(e.target.value)}
                    style={{
                      flex: 1,
                      padding: '12px 16px',
                      borderRadius: '10px',
                      border: '1px solid #e4e4e7',
                      background: '#fafafa',
                      color: '#09090b',
                      outline: 'none',
                    }}
                  />
                  <button type="submit" className="btn-black" style={{ borderRadius: '10px' }}>
                    Resolve Ticket
                  </button>
                </form>
              ) : (
                <div style={{ background: '#fafafa', padding: '14px', borderRadius: '10px', border: '1px solid #e4e4e7', fontSize: '0.85rem' }}>
                  <span style={{ fontWeight: '800', color: '#09090b' }}>Resolved Notes: </span>
                  <span style={{ color: '#27272a' }}>{selectedEscalation.human_notes}</span>
                </div>
              )}
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '60px 0', color: '#71717a' }}>
              Select an escalation record to view AI-generated handoff details.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
