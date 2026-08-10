import io
import uuid
import datetime
import csv
from typing import List, Tuple
from models.rag import DocumentChunk, DocumentMetadata


class DocumentIngestionService:
    """Parses PDF, DOCX, TXT, and CSV documents into structured, overlapping chunks."""

    def __init__(self, chunk_size: int = 500, chunk_overlap: int = 50):
        self.chunk_size = chunk_size
        self.chunk_overlap = chunk_overlap

    def parse_file(self, content_bytes: bytes, filename: str) -> str:
        ext = filename.split(".")[-1].lower() if "." in filename else "txt"

        if ext == "pdf":
            return self._parse_pdf(content_bytes)
        elif ext in ["docx", "doc"]:
            return self._parse_docx(content_bytes)
        elif ext == "csv":
            return self._parse_csv(content_bytes)
        else:
            return content_bytes.decode("utf-8", errors="ignore")

    def _parse_pdf(self, content_bytes: bytes) -> str:
        try:
            import pypdf
            reader = pypdf.PdfReader(io.BytesIO(content_bytes))
            text_parts = []
            for i, page in enumerate(reader.pages):
                page_text = page.extract_text() or ""
                if page_text.strip():
                    text_parts.append(f"[Page {i+1}]\n{page_text}")
            return "\n\n".join(text_parts)
        except Exception:
            return content_bytes.decode("utf-8", errors="ignore")

    def _parse_docx(self, content_bytes: bytes) -> str:
        try:
            import docx
            doc = docx.Document(io.BytesIO(content_bytes))
            return "\n".join([p.text for p in doc.paragraphs if p.text.strip()])
        except Exception:
            return content_bytes.decode("utf-8", errors="ignore")

    def _parse_csv(self, content_bytes: bytes) -> str:
        try:
            decoded = content_bytes.decode("utf-8", errors="ignore")
            reader = csv.reader(io.StringIO(decoded))
            rows = [", ".join(row) for row in reader if row]
            return "\n".join(rows)
        except Exception:
            return content_bytes.decode("utf-8", errors="ignore")

    def create_chunks(self, full_text: str, filename: str, doc_id: str = None) -> Tuple[DocumentMetadata, List[DocumentChunk]]:
        document_id = doc_id or f"doc_{uuid.uuid4().hex[:8]}"
        now_iso = datetime.datetime.now(datetime.timezone.utc).isoformat()


        # Clean text
        text = full_text.strip().replace("\r\n", "\n")
        
        # Recursive window sliding chunker
        chunks: List[DocumentChunk] = []
        start = 0
        text_length = len(text)
        chunk_idx = 0

        while start < text_length:
            end = min(start + self.chunk_size, text_length)
            
            # Try not to break words in the middle
            if end < text_length and text[end] not in [" ", "\n", ".", ","]:
                space_pos = text.rfind(" ", start, end)
                if space_pos > start + 100:
                    end = space_pos

            chunk_str = text[start:end].strip()
            if chunk_str:
                chunk_obj = DocumentChunk(
                    chunk_id=f"{document_id}_c{chunk_idx}",
                    document_id=document_id,
                    filename=filename,
                    chunk_index=chunk_idx,
                    content=chunk_str,
                    metadata={
                        "filename": filename,
                        "chunk_index": chunk_idx,
                        "character_start": start,
                        "character_end": end,
                        "created_at": now_iso,
                    }
                )
                chunks.append(chunk_obj)
                chunk_idx += 1

            if end >= text_length:
                break

            start = max(end - self.chunk_overlap, start + 1)

        ext = filename.split(".")[-1].lower() if "." in filename else "txt"
        doc_metadata = DocumentMetadata(
            document_id=document_id,
            filename=filename,
            file_type=ext,
            title=filename,
            created_at=now_iso,
            total_chunks=len(chunks),
            file_size_bytes=len(full_text.encode("utf-8")),
        )

        return doc_metadata, chunks


ingestion_service = DocumentIngestionService()
