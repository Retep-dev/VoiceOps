from typing import List, Tuple
from models.rag import SearchResultChunk, Citation


class CrossEncoderReranker:
    """Reranks candidate retrieved chunks based on exact term overlap and semantic relevance."""

    def rerank_and_compress(
        self, query: str, candidate_chunks: List[SearchResultChunk], top_k: int = 4
    ) -> Tuple[List[SearchResultChunk], str, List[Citation]]:
        if not candidate_chunks:
            return [], "No relevant enterprise policy or product documentation found.", []

        query_terms = set(query.lower().split())

        scored_candidates = []
        for chunk in candidate_chunks:
            content_lower = chunk.content.lower()
            
            # Exact keyword match bonus score
            exact_matches = sum(1 for term in query_terms if term in content_lower and len(term) > 3)
            keyword_score = (exact_matches / max(len(query_terms), 1)) * 0.4
            
            # Combine initial retrieval score with term overlap reranking score
            final_score = round(chunk.score * 0.6 + keyword_score, 4)
            
            updated_chunk = SearchResultChunk(
                chunk_id=chunk.chunk_id,
                document_id=chunk.document_id,
                filename=chunk.filename,
                chunk_index=chunk.chunk_index,
                content=chunk.content,
                score=final_score,
                retrieval_method="hybrid_reranked",
                metadata=chunk.metadata,
            )
            scored_candidates.append(updated_chunk)

        # Sort descending by final score
        scored_candidates.sort(key=lambda x: x.score, reverse=True)
        top_chunks = scored_candidates[:top_k]

        # Build clean grounded context pack + citations
        context_parts = []
        citations = []
        for idx, chunk in enumerate(top_chunks):
            citation_tag = f"[Source {idx+1}: {chunk.filename} (Chunk {chunk.chunk_index})]"
            context_parts.append(f"{citation_tag}\n{chunk.content}")
            
            citations.append(
                Citation(
                    document_id=chunk.document_id,
                    filename=chunk.filename,
                    chunk_index=chunk.chunk_index,
                    excerpt=chunk.content[:150] + "..." if len(chunk.content) > 150 else chunk.content,
                )
            )

        context_text = "\n\n".join(context_parts)
        return top_chunks, context_text, citations


reranker_service = CrossEncoderReranker()
