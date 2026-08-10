from fastapi import APIRouter, UploadFile, File, HTTPException, Query, Path
from typing import List
import time
from models.rag import (
    DocumentIngestResponse,
    DocumentMetadata,
    RAGQueryRequest,
    RAGQueryResponse,
)
from services.rag.ingestion import ingestion_service
from services.rag.retrieval import rag_store

router = APIRouter()


@router.post("/upload", response_model=DocumentIngestResponse)
async def upload_document(file: UploadFile = File(...)):
    """Upload and ingest a PDF, DOCX, TXT, or CSV document into the Enterprise Knowledge Base."""
    start_time = time.time()
    try:
        content_bytes = await file.read()
        filename = file.filename or "document.txt"

        parsed_text = ingestion_service.parse_file(content_bytes, filename)
        if not parsed_text.strip():
            raise HTTPException(status_code=400, detail="Document contains no readable text content.")

        doc_metadata, chunks = ingestion_service.create_chunks(parsed_text, filename)
        rag_store.add_document(doc_metadata, chunks)

        elapsed_ms = round((time.time() - start_time) * 1000, 2)

        return DocumentIngestResponse(
            document_id=doc_metadata.document_id,
            filename=doc_metadata.filename,
            file_type=doc_metadata.file_type,
            total_chunks=doc_metadata.total_chunks,
            processing_ms=elapsed_ms,
            status="success",
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Document ingestion failed: {str(e)}")


@router.post("/query", response_model=RAGQueryResponse)
async def query_knowledge_base(request: RAGQueryRequest):
    """Query enterprise knowledge base using Hybrid Search (Dense + Sparse BM25) and Reranking."""
    try:
        return rag_store.query(request)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Knowledge retrieval query failed: {str(e)}")


@router.get("/documents", response_model=List[DocumentMetadata])
async def list_documents():
    """List all ingested enterprise documents in the knowledge base."""
    return rag_store.list_documents()


@router.delete("/documents/{document_id}")
async def delete_document(document_id: str = Path(..., description="Document ID to remove")):
    """Delete a document and its vector chunks from the knowledge base."""
    success = rag_store.remove_document(document_id)
    if not success:
        raise HTTPException(status_code=404, detail="Document ID not found.")
    return {"status": "success", "deleted_document_id": document_id}
