import React, { useState, useEffect } from 'react';
import { Database, Upload, Search, FileText, CheckCircle2, AlertCircle } from 'lucide-react';

export default function KnowledgeManager() {
  const [documents, setDocuments] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResult, setSearchResult] = useState(null);
  const [isSearching, setIsSearching] = useState(false);
  const [fileToUpload, setFileToUpload] = useState(null);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    fetchDocuments();
  }, []);

  const fetchDocuments = async () => {
    try {
      const res = await fetch('/api/knowledge/documents');
      const data = await res.json();
      setDocuments(data.documents || []);
    } catch (e) {
      console.error("Failed to fetch documents:", e);
    }
  };

  const handleFileUpload = async (e) => {
    e.preventDefault();
    if (!fileToUpload) return;

    setIsUploading(true);
    const formData = new FormData();
    formData.append('file', fileToUpload);

    try {
      const res = await fetch('/api/knowledge/ingest', {
        method: 'POST',
        body: formData,
      });
      if (res.ok) {
        setFileToUpload(null);
        fetchDocuments();
      }
    } catch (e) {
      console.error("Upload error:", e);
    } finally {
      setIsUploading(false);
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
    } catch (e) {
      console.error("RAG search failed:", e);
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div style={{ maxWidth: '1240px', margin: '0 auto', padding: '0 24px 60px 24px' }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
        {/* Left: Document Ingestion */}
        <div className="mono-card" style={{ padding: '28px' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: '800', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px', color: '#09090b' }}>
            <Database size={20} color="#000" />
            Enterprise Knowledge Ingestion
          </h2>

          <form onSubmit={handleFileUpload} style={{ marginBottom: '24px' }}>
            <div style={{ border: '2px dashed #e4e4e7', borderRadius: '16px', padding: '32px', textAlign: 'center', background: '#fafafa', marginBottom: '16px' }}>
              <Upload size={32} color="#71717a" style={{ marginBottom: '12px' }} />
              <p style={{ fontSize: '0.9rem', fontWeight: '600', color: '#09090b', marginBottom: '4px' }}>
                {fileToUpload ? fileToUpload.name : 'Select or drag policy files (PDF, DOCX, TXT, CSV)'}
              </p>
              <p style={{ fontSize: '0.75rem', color: '#71717a', marginBottom: '16px' }}>Max size 10MB per file</p>

              <input
                type="file"
                id="file-input"
                accept=".pdf,.docx,.txt,.csv"
                onChange={(e) => setFileToUpload(e.target.files[0])}
                style={{ display: 'none' }}
              />
              <label htmlFor="file-input" className="btn-outline" style={{ cursor: 'pointer', fontSize: '0.85rem' }}>
                Browse File
              </label>
            </div>

            {fileToUpload && (
              <button type="submit" className="btn-black" disabled={isUploading} style={{ width: '100%', justifyContent: 'center' }}>
                {isUploading ? 'Ingesting & Chunking...' : 'Ingest Document into RAG Vector Store'}
              </button>
            )}
          </form>

          <h3 style={{ fontSize: '1rem', fontWeight: '800', marginBottom: '12px', color: '#09090b' }}>Indexed Knowledge Base Documents</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '240px', overflowY: 'auto' }}>
            {documents.length > 0 ? (
              documents.map((doc) => (
                <div key={doc.document_id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#fafafa', padding: '12px 16px', borderRadius: '10px', border: '1px solid #e4e4e7' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <FileText size={18} color="#000" />
                    <div>
                      <h4 style={{ fontSize: '0.85rem', fontWeight: '700', color: '#09090b' }}>{doc.filename}</h4>
                      <span style={{ fontSize: '0.75rem', color: '#71717a' }}>{doc.total_chunks} Chunks • {(doc.file_size_bytes / 1024).toFixed(1)} KB</span>
                    </div>
                  </div>
                  <span className="badge-mono">Indexed</span>
                </div>
              ))
            ) : (
              <p style={{ fontSize: '0.85rem', color: '#71717a' }}>No documents ingested yet.</p>
            )}
          </div>
        </div>

        {/* Right: RAG Playground */}
        <div className="mono-card" style={{ padding: '28px' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: '800', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px', color: '#09090b' }}>
            <Search size={20} color="#000" />
            Hybrid Retrieval & Citation Playground
          </h2>

          <form onSubmit={handleSearch} style={{ display: 'flex', gap: '10px', marginBottom: '24px' }}>
            <input
              type="text"
              placeholder="Ask a question about company policies or orders..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
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
            <button type="submit" className="btn-black" disabled={isSearching} style={{ borderRadius: '10px' }}>
              Query RAG
            </button>
          </form>

          {isSearching ? (
            <div style={{ textAlign: 'center', padding: '40px 0', color: '#71717a' }}>Searching Sparse BM25 + Dense Vectors + Reranking...</div>
          ) : searchResult ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ background: '#fafafa', padding: '16px', borderRadius: '12px', border: '1px solid #e4e4e7' }}>
                <h4 style={{ fontSize: '0.85rem', fontWeight: '800', color: '#09090b', marginBottom: '8px' }}>Grounded RAG Context:</h4>
                <p style={{ fontSize: '0.9rem', color: '#27272a', lineHeight: '1.6' }}>{searchResult.context_text}</p>
              </div>

              <h4 style={{ fontSize: '0.85rem', fontWeight: '800', color: '#09090b' }}>Reranked Source Citations ({searchResult.citations?.length}):</h4>
              {searchResult.citations?.map((cit, idx) => (
                <div key={idx} style={{ background: '#ffffff', padding: '12px 16px', borderRadius: '10px', border: '1px solid #000000' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                    <span style={{ fontWeight: '700', fontSize: '0.8rem', color: '#09090b' }}>{cit.filename} (Chunk #{cit.chunk_index})</span>
                    <span style={{ fontSize: '0.75rem', fontWeight: '700', color: '#000000' }}>Score: {cit.rerank_score}</span>
                  </div>
                  <p style={{ fontSize: '0.8rem', color: '#52525b' }}>"{cit.snippet}"</p>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '40px 0', color: '#71717a' }}>
              Enter a search query to test hybrid BM25 + Vector retrieval and view exact source citations.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
