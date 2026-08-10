import React, { useState, useEffect } from 'react';
import { BarChart3, Play, CheckCircle2, Zap, Target, ShieldCheck } from 'lucide-react';

export default function EvaluationDashboard() {
  const [evalData, setEvalData] = useState(null);
  const [isRunning, setIsRunning] = useState(false);

  useEffect(() => {
    fetchLatestEval();
  }, []);

  const fetchLatestEval = async () => {
    try {
      const res = await fetch('/api/evaluations/latest');
      const data = await res.json();
      setEvalData(data);
    } catch (e) {
      console.error("Failed to fetch evaluation report:", e);
    }
  };

  const handleRunEval = async () => {
    setIsRunning(true);
    try {
      const res = await fetch('/api/evaluations/run', { method: 'POST' });
      const data = await res.json();
      setEvalData(data);
    } catch (e) {
      console.error("Evaluation run failed:", e);
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header & Run Trigger */}
      <div className="glass-panel" style={{ padding: '20px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <BarChart3 color="#a855f7" size={20} />
            Automated AI System Evaluation Suite
          </h2>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            Benchmark ASR Word Error Rate, RAG Grounded Faithfulness, Agent Routing Accuracy, & Voice Latencies
          </p>
        </div>
        <button onClick={handleRunEval} className="btn-primary" disabled={isRunning}>
          <Play size={16} />
          {isRunning ? 'Running Benchmark Suite...' : 'Run Automated Benchmark Suite'}
        </button>
      </div>

      {evalData && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
          {/* Card 1: ASR WER / CER */}
          <div className="glass-panel" style={{ padding: '20px' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: '700' }}>ASR Performance</span>
            <h3 style={{ fontSize: '1.8rem', fontWeight: '800', color: '#06b6d4', margin: '8px 0 4px 0' }}>
              {(evalData.asr?.word_error_rate * 100).toFixed(1)}% WER
            </h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>CER: {(evalData.asr?.character_error_rate * 100).toFixed(1)}% • Avg Latency: {evalData.asr?.avg_transcription_ms}ms</p>
          </div>

          {/* Card 2: RAG Faithfulness & Precision */}
          <div className="glass-panel" style={{ padding: '20px' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: '700' }}>RAG Groundedness</span>
            <h3 style={{ fontSize: '1.8rem', fontWeight: '800', color: '#10b981', margin: '8px 0 4px 0' }}>
              {(evalData.rag?.answer_faithfulness_score * 100).toFixed(0)}%
            </h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Precision: {(evalData.rag?.retrieval_precision * 100).toFixed(0)}% • Relevance: {(evalData.rag?.context_relevance_score * 100).toFixed(0)}%</p>
          </div>

          {/* Card 3: Agent Routing Accuracy */}
          <div className="glass-panel" style={{ padding: '20px' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: '700' }}>Agent Router Accuracy</span>
            <h3 style={{ fontSize: '1.8rem', fontWeight: '800', color: '#a855f7', margin: '8px 0 4px 0' }}>
              {(evalData.agent?.routing_accuracy * 100).toFixed(0)}%
            </h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Tool Precision: {(evalData.agent?.tool_selection_accuracy * 100).toFixed(0)}% • Escalation: {(evalData.agent?.escalation_accuracy * 100).toFixed(0)}%</p>
          </div>

          {/* Card 4: Time to First Response */}
          <div className="glass-panel" style={{ padding: '20px' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: '700' }}>Voice TTFB Latency</span>
            <h3 style={{ fontSize: '1.8rem', fontWeight: '800', color: '#f59e0b', margin: '8px 0 4px 0' }}>
              {evalData.voice?.time_to_first_response_ms}ms
            </h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Total Pipeline Latency: {evalData.voice?.avg_total_latency_ms}ms</p>
          </div>
        </div>
      )}
    </div>
  );
}
