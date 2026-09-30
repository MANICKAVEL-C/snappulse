import math
import re
import uuid

class LocalPrivacyRAG:
    """
    On-Device Privacy RAG Engine for Snapdragon HP PCs.
    Processes documents, extracts semantic chunks, generates vector embeddings, and computes cosine similarity locally.
    """
    def __init__(self):
        self.documents = {}
        self.vocab = {}
        self.doc_vectors = {}

    def _tokenize(self, text: str):
        return re.findall(r'\b\w+\b', text.lower())

    def _build_vocab(self, texts):
        all_words = set()
        for t in texts:
            all_words.update(self._tokenize(t))
        return {word: idx for idx, word in enumerate(sorted(all_words))}

    def _vectorize(self, text: str):
        tokens = self._tokenize(text)
        vector = [0.0] * len(self.vocab)
        for token in tokens:
            if token in self.vocab:
                vector[self.vocab[token]] += 1.0
        
        # L2 Normalize
        norm = math.sqrt(sum(val * val for val in vector))
        if norm > 0:
            vector = [val / norm for val in vector]
        return vector

    def add_document(self, title: str, content: str):
        doc_id = str(uuid.uuid4())[:8]
        # Chunk text into ~250 character segments
        raw_chunks = [content[i:i+250] for i in range(0, len(content), 200)]
        if not raw_chunks:
            raw_chunks = [content]

        self.documents[doc_id] = {
            "title": title,
            "content": content,
            "chunks": raw_chunks
        }

        # Re-index vocabulary and vectors
        all_chunks = []
        for doc in self.documents.values():
            all_chunks.extend(doc["chunks"])
        
        self.vocab = self._build_vocab(all_chunks)
        self.doc_vectors = {}
        for d_id, doc in self.documents.items():
            self.doc_vectors[d_id] = [self._vectorize(chunk) for chunk in doc["chunks"]]

        return doc_id

    def query(self, query_text: str, top_k: int = 3):
        if not self.vocab or not self.documents:
            return []

        q_vec = self._vectorize(query_text)
        results = []

        for doc_id, chunk_vectors in self.doc_vectors.items():
            doc = self.documents[doc_id]
            for idx, c_vec in enumerate(chunk_vectors):
                # Cosine similarity between normalized vectors
                similarity = sum(qv * cv for qv, cv in zip(q_vec, c_vec))
                if similarity > 0.001:
                    results.append({
                        "doc_id": doc_id,
                        "title": doc["title"],
                        "score": round(similarity, 4),
                        "snippet": doc["chunks"][idx]
                    })

        # Sort descending by similarity score
        results.sort(key=lambda x: x["score"], reverse=True)
        return results[:top_k]
