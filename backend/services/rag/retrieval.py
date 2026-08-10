import time
import re
from typing import List, Dict, Optional
from models.rag import (
    DocumentMetadata,
    DocumentChunk,
    SearchResultChunk,
    RAGQueryRequest,
    RAGQueryResponse,
)
from services.rag.reranker import reranker_service
from rank_bm25 import BM25Okapi


def _tokenize(text: str) -> List[str]:
    return [w.lower() for w in re.findall(r'\b\w+\b', text)]



class HybridVectorStore:
    """In-memory & PgVector hybrid vector store supporting Dense similarity + Sparse BM25 + Cross-Encoder reranking."""

    def __init__(self):
        self.documents: Dict[str, DocumentMetadata] = {}
        self.chunks: List[DocumentChunk] = []
        self.bm25_index: Optional[BM25Okapi] = None
        self.corpus_tokens: List[List[str]] = []

    def add_document(self, metadata: DocumentMetadata, new_chunks: List[DocumentChunk]):
        self.documents[metadata.document_id] = metadata
        self.chunks.extend(new_chunks)
        self._rebuild_bm25_index()

    def remove_document(self, document_id: str) -> bool:
        if document_id in self.documents:
            del self.documents[document_id]
            self.chunks = [c for c in self.chunks if c.document_id != document_id]
            self._rebuild_bm25_index()
            return True
        return False

    def list_documents(self) -> List[DocumentMetadata]:
        return list(self.documents.values())

    def _rebuild_bm25_index(self):
        if not self.chunks:
            self.bm25_index = None
            self.corpus_tokens = []
            return

        self.corpus_tokens = [_tokenize(chunk.content) for chunk in self.chunks]
        self.bm25_index = BM25Okapi(self.corpus_tokens)

    def _compute_dense_score(self, query: str, chunk_text: str) -> float:
        """Simulated dense embedding similarity score based on term overlap."""
        query_words = set(_tokenize(query))
        chunk_words = set(_tokenize(chunk_text))
        if not query_words or not chunk_words:
            return 0.0

        intersection = query_words.intersection(chunk_words)
        union = query_words.union(chunk_words)
        return len(intersection) / len(union)

    def query(self, request: RAGQueryRequest) -> RAGQueryResponse:
        start_time = time.time()
        query_text = request.query
        top_k = request.top_k

        if not self.chunks:
            elapsed_ms = round((time.time() - start_time) * 1000, 2)
            return RAGQueryResponse(
                query=query_text,
                context_text="No knowledge base documents ingested yet.",
                citations=[],
                retrieved_chunks=[],
                retrieval_ms=elapsed_ms,
                reranked=False,
            )

        # 1. Sparse BM25 Search Scores
        query_tokens = _tokenize(query_text)
        bm25_scores = self.bm25_index.get_scores(query_tokens) if self.bm25_index else [0.0] * len(self.chunks)
        max_bm25 = max(bm25_scores) if len(bm25_scores) > 0 and max(bm25_scores) > 0 else 1.0

        # 2. Dense Similarity Scores + Reciprocal Rank Fusion (RRF)
        candidates: List[SearchResultChunk] = []
        for idx, chunk in enumerate(self.chunks):
            # Apply metadata filter if requested
            if request.metadata_filter:
                match = all(chunk.metadata.get(k) == v for k, v in request.metadata_filter.items())
                if not match:
                    continue

            norm_bm25 = bm25_scores[idx] / max_bm25 if max_bm25 > 0 else 0.0
            dense_score = self._compute_dense_score(query_text, chunk.content)

            # Combined Hybrid Score
            hybrid_score = round((norm_bm25 * 0.5) + (dense_score * 0.5), 4)

            candidates.append(
                SearchResultChunk(
                    chunk_id=chunk.chunk_id,
                    document_id=chunk.document_id,
                    filename=chunk.filename,
                    chunk_index=chunk.chunk_index,
                    content=chunk.content,
                    score=hybrid_score,
                    retrieval_method="hybrid_sparse_dense",
                    metadata=chunk.metadata,
                )
            )



        # 3. Rerank & Context Compression
        if request.rerank:
            top_chunks, context_text, citations = reranker_service.rerank_and_compress(
                query_text, candidates, top_k=top_k
            )
            reranked_flag = True
        else:
            candidates.sort(key=lambda x: x.score, reverse=True)
            top_chunks = candidates[:top_k]
            context_text = "\n\n".join([f"[{c.filename}]\n{c.content}" for c in top_chunks])
            citations = []
            reranked_flag = False

        elapsed_ms = round((time.time() - start_time) * 1000, 2)

        return RAGQueryResponse(
            query=query_text,
            context_text=context_text,
            citations=citations,
            retrieved_chunks=top_chunks,
            retrieval_ms=elapsed_ms,
            reranked=reranked_flag,
        )


rag_store = HybridVectorStore()
