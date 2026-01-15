import logging
from typing import List, Dict, Any
from dataclasses import dataclass

logger = logging.getLogger(__name__)


@dataclass
class Chunk:
    chunk_id: str
    doc_id: str
    content: str
    metadata: Dict[str, Any]
    chunk_index: int
    total_chunks: int


class DocumentChunker:
    
    def __init__(self, chunk_size: int = 1024, chunk_overlap: int = 128):
        self.chunk_size = chunk_size
        self.chunk_overlap = chunk_overlap
    
    def chunk_document(self, doc_id: str, content: str, metadata: Dict[str, Any]) -> List[Chunk]:
        chunks = []
        
        # Simple character-based chunking
        sentences = self._split_into_sentences(content)
        current_chunk = []
        current_size = 0
        
        for i, sentence in enumerate(sentences):
            sentence_size = len(sentence)
            
            # Add sentence to current chunk
            current_chunk.append(sentence)
            current_size += sentence_size
            
            # Flush chunk if size exceeded
            if current_size >= self.chunk_size or i == len(sentences) - 1:
                chunk_text = ' '.join(current_chunk).strip()
                
                if chunk_text:  # Skip empty chunks
                    chunk = Chunk(
                        chunk_id=f"{doc_id}_chunk_{len(chunks)}",
                        doc_id=doc_id,
                        content=chunk_text,
                        metadata={
                            **metadata,
                            "chunk_index": len(chunks),
                            "chunk_size": len(chunk_text),
                        },
                        chunk_index=len(chunks),
                        total_chunks=0  # Will be updated after counting
                    )
                    chunks.append(chunk)
                
                # Keep overlap for next chunk
                overlap_size = 0
                overlap_sentences = []
                for sent in reversed(current_chunk):
                    if overlap_size + len(sent) <= self.chunk_overlap:
                        overlap_sentences.insert(0, sent)
                        overlap_size += len(sent)
                    else:
                        break
                
                current_chunk = overlap_sentences
                current_size = overlap_size
        
        # Update total chunks count
        total = len(chunks)
        for chunk in chunks:
            chunk.total_chunks = total
        
        logger.info(f"Created {len(chunks)} chunks from document {doc_id}")
        return chunks
    
    @staticmethod
    def _split_into_sentences(text: str) -> List[str]:
        # Simple sentence splitter based on common delimiters
        import re
        
        # Replace newlines with spaces
        text = text.replace('\n', ' ')
        
        # Split by sentence boundaries
        sentences = re.split(r'(?<=[.!?])\s+', text)
        
        # Clean and filter
        sentences = [s.strip() for s in sentences if s.strip()]
        
        return sentences
    
    def chunk_text(self, text: str) -> List[str]:
        sentences = self._split_into_sentences(text)
        chunks = []
        current_chunk = []
        current_size = 0
        
        for sentence in sentences:
            current_chunk.append(sentence)
            current_size += len(sentence)
            
            if current_size >= self.chunk_size:
                chunks.append(' '.join(current_chunk))
                # Apply overlap
                current_chunk = current_chunk[-(self.chunk_overlap // 50):]
                current_size = sum(len(s) for s in current_chunk)
        
        if current_chunk:
            chunks.append(' '.join(current_chunk))
        
        return chunks
