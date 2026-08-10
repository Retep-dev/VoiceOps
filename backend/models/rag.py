from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any


class DocumentMetadata(BaseModel):
    document_id: str
    filename: str
    file_type: str
    title: Optional[str] = None
    created_at: str
    total_chunks: int = 0
    file_size_bytes: int = 0


class DocumentChunk(BaseModel):
    chunk_id: str
    document_id: str
    filename: str
    chunk_index: int
    content: str
    metadata: Dict[str, Any] = Field(default_factory=dict)
    dense_embedding: Optional[List[float]] = None


class DocumentIngestResponse(BaseModel):
    document_id: str
    filename: str
    file_type: str
    total_chunks: int
    processing_ms: float
    status: str = "success"


class SearchResultChunk(BaseModel):
    chunk_id: str
    document_id: str
    filename: str
    chunk_index: int
    content: str
    score: float
    retrieval_method: str = "hybrid"  # dense, sparse, hybrid, reranked
    metadata: Dict[str, Any] = Field(default_factory=dict)


class Citation(BaseModel):
    document_id: str
    filename: str
    chunk_index: int
    excerpt: str


class RAGQueryRequest(BaseModel):
    query: str
    top_k: int = 4
    rerank: bool = True
    metadata_filter: Optional[Dict[str, Any]] = None


class RAGQueryResponse(BaseModel):
    query: str
    context_text: str
    citations: List[Citation] = Field(default_factory=list)
    retrieved_chunks: List[SearchResultChunk] = Field(default_factory=list)
    retrieval_ms: float
    reranked: bool = True
