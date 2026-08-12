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
    <div style={{ maxWidth: '1240px', margin: '0 auto', padding: '0 24px 60px 24px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header & Run Trigger */}
      <div className="mono-card" style={{ padding: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '10px', color: '#09090b' }}>
            <BarChart3 size={20} color="#000" />
            Automated AI System Evaluation Suite
          </h2>
          <p style={{ fontSize: '0.85rem', color: '#52525b', marginTop: '4px' }}>
            Benchmark ASR Word Error Rate, RAG Grounded Faithfulness, Agent Routing Accuracy, & Voice Latencies
          </p>
        </div>
        <button onClick={handleRunEval} className="btn-black" disabled={isRunning}>
          <Play size={16} />
          {isRunning ? 'Running Benchmark Suite...' : 'Run Automated Benchmark Suite'}
        </button>
      </div>

      {evalData && (
        <div className="responsive-four-column">
          {/* Card 1: ASR WER / CER */}

          <div className="mono-card" style={{ padding: '24px' }}>
            <span style={{ fontSize: '0.75rem', color: '#71717a', textTransform: 'uppercase', fontWeight: '700', letterSpacing: '0.5px' }}>ASR Performance</span>
            <h3 style={{ fontSize: '2.2rem', fontWeight: '800', color: '#09090b', margin: '8px 0 4px 0' }}>
              {(evalData.asr?.word_error_rate * 100).toFixed(1)}% WER
            </h3>
            <p style={{ fontSize: '0.8rem', color: '#52525b' }}>CER: {(evalData.asr?.character_error_rate * 100).toFixed(1)}% • Avg: {evalData.asr?.avg_transcription_ms}ms</p>
          </div>

          {/* Card 2: RAG Faithfulness & Precision */}
          <div className="mono-card" style={{ padding: '24px' }}>
            <span style={{ fontSize: '0.75rem', color: '#71717a', textTransform: 'uppercase', fontWeight: '700', letterSpacing: '0.5px' }}>RAG Groundedness</span>
            <h3 style={{ fontSize: '2.2rem', fontWeight: '800', color: '#09090b', margin: '8px 0 4px 0' }}>
              {(evalData.rag?.answer_faithfulness_score * 100).toFixed(0)}%
            </h3>
            <p style={{ fontSize: '0.8rem', color: '#52525b' }}>Precision: {(evalData.rag?.retrieval_precision * 100).toFixed(0)}% • Relevance: {(evalData.rag?.context_relevance_score * 100).toFixed(0)}%</p>
          </div>

          {/* Card 3: Agent Routing Accuracy */}
          <div className="mono-card" style={{ padding: '24px' }}>
            <span style={{ fontSize: '0.75rem', color: '#71717a', textTransform: 'uppercase', fontWeight: '700', letterSpacing: '0.5px' }}>Agent Router Accuracy</span>
            <h3 style={{ fontSize: '2.2rem', fontWeight: '800', color: '#09090b', margin: '8px 0 4px 0' }}>
              {(evalData.agent?.routing_accuracy * 100).toFixed(0)}%
            </h3>
            <p style={{ fontSize: '0.8rem', color: '#52525b' }}>Tool Precision: {(evalData.agent?.tool_selection_accuracy * 100).toFixed(0)}% • Escalation: {(evalData.agent?.escalation_accuracy * 100).toFixed(0)}%</p>
          </div>

          {/* Card 4: Time to First Response */}
          <div className="mono-card" style={{ padding: '24px' }}>
            <span style={{ fontSize: '0.75rem', color: '#71717a', textTransform: 'uppercase', fontWeight: '700', letterSpacing: '0.5px' }}>Voice TTFB Latency</span>
            <h3 style={{ fontSize: '2.2rem', fontWeight: '800', color: '#09090b', margin: '8px 0 4px 0' }}>
              {evalData.voice?.time_to_first_response_ms}ms
            </h3>
            <p style={{ fontSize: '0.8rem', color: '#52525b' }}>Total Pipeline Latency: {evalData.voice?.avg_total_latency_ms}ms</p>
          </div>
        </div>
      )}
    </div>
  );
}
