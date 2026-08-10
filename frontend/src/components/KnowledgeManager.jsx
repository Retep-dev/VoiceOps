import React, { useState, useEffect } from 'react';
import { Database, Upload, Search, FileText, CheckCircle, Trash2 } from 'lucide-react';

export default function KnowledgeManager() {
  const [documents, setDocuments] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResult, setSearchResult] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    fetchDocuments();
  }, []);

  const fetchDocuments = async () => {
    try {
      const res = await fetch('/api/knowledge/documents');
      const data = await res.json();
      setDocuments(data || []);
    } catch (e) {
      console.error("Failed to fetch documents:", e);
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setIsUploading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch('/api/knowledge/upload', {
        method: 'POST',
        body: formData,
      });
      if (res.ok) {
        await fetchDocuments();
      }
    } catch (err) {
      console.error("Document upload failed:", err);
    } finally {
      setIsUploading(false);
    }
  };

  const handleDeleteDoc = async (docId) => {
    try {
      await fetch(`/api/knowledge/documents/${docId}`, { method: 'DELETE' });
      await fetchDocuments();
    } catch (e) {
      console.error("Delete failed:", e);
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    try {
      const res = await fetch('/api/knowledge/query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: searchQuery, top_k: 3, rerank: true }),
      });
      const data = await res.json();
      setSearchResult(data);
    } catch (err) {
      console.error("RAG search failed:", err);
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
      {/* Left Panel: Document Upload & List */}
      <div className="glass-panel" style={{ padding: '24px' }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: '700', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Database color="#06b6d4" size={20} />
          Enterprise Document Knowledge Store
        </h2>

        {/* Upload Box */}
        <label style={{ display: 'block', border: '2px dashed var(--bg-card-border)', borderRadius: '12px', padding: '32px', textAlign: 'center', cursor: 'pointer', marginBottom: '24px', background: 'rgba(0,0,0,0.2)' }}>
          <Upload size={32} color="#38bdf8" style={{ margin: '0 auto 12px auto' }} />
          <p style={{ fontWeight: '600', marginBottom: '4px' }}>{isUploading ? 'Ingesting document into RAG engine...' : 'Click to Upload Policy / Product Document'}</p>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Supported formats: PDF, DOCX, TXT, CSV</span>
          <input type="file" onChange={handleFileUpload} accept=".pdf,.docx,.txt,.csv" style={{ display: 'none' }} />
        </label>

        {/* Document List */}
        <h3 style={{ fontSize: '1rem', fontWeight: '600', marginBottom: '12px' }}>Ingested Documents ({documents.length})</h3>
        {documents.length === 0 ? (
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>No enterprise documents uploaded yet.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {documents.map((doc) => (
              <div key={doc.document_id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.03)', padding: '12px 16px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.05)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <FileText size={18} color="#06b6d4" />
                  <div>
                    <p style={{ fontWeight: '600', fontSize: '0.9rem' }}>{doc.filename}</p>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{doc.total_chunks} chunks • {doc.file_type.toUpperCase()}</span>
                  </div>
                </div>
                <button onClick={() => handleDeleteDoc(doc.document_id)} style={{ background: 'transparent', border: 'none', color: '#f43f5e', cursor: 'pointer', padding: '4px' }}>
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Right Panel: Hybrid RAG Search Playground */}
      <div className="glass-panel" style={{ padding: '24px' }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: '700', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Search color="#a855f7" size={20} />
          Hybrid Retrieval Playground (BM25 + Dense Vectors)
        </h2>

        <form onSubmit={handleSearch} style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
          <input
            type="text"
            placeholder="Test query: e.g. What is the return policy window?"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
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
          <button type="submit" className="btn-primary" disabled={isSearching}>
            Search
          </button>
        </form>

        {searchResult && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ background: 'rgba(0, 0, 0, 0.3)', padding: '14px', borderRadius: '10px' }}>
              <span style={{ fontSize: '0.75rem', color: '#38bdf8', textTransform: 'uppercase', fontWeight: '700' }}>Reranked Grounded Context ({searchResult.retrieval_ms}ms)</span>
              <p style={{ fontSize: '0.85rem', color: '#e2e8f0', marginTop: '6px', whiteSpace: 'pre-line' }}>{searchResult.context_text}</p>
            </div>

            {searchResult.citations && searchResult.citations.length > 0 && (
              <div>
                <h4 style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '8px' }}>Source Attribution Citations:</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  {searchResult.citations.map((cite, idx) => (
                    <div key={idx} style={{ background: 'rgba(255, 255, 255, 0.03)', padding: '8px 12px', borderRadius: '8px', borderLeft: '3px solid #06b6d4', fontSize: '0.8rem' }}>
                      <span style={{ fontWeight: '600', color: '#06b6d4' }}>{cite.filename} (Chunk {cite.chunk_index})</span>
                      <p style={{ color: 'var(--text-muted)', marginTop: '2px' }}>"{cite.excerpt}"</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
