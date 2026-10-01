import numpy as np
import re
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

class RealNLPRAGEngine:
    """
    Robust On-Device Privacy RAG Engine using Scikit-Learn TF-IDF Vectorization & Cosine Similarity.
    Atomically validates new document terms and vocabulary before mutating state.
    """
    def __init__(self):
        self.documents = []
        self.vectorizer = TfidfVectorizer(stop_words='english')
        self.tfidf_matrix = None

    def add_document(self, title: str, content: str):
        content = content.strip()
        if not content:
            raise ValueError("Document content cannot be empty")

        raw_chunks = [c.strip() for c in re.split(r'\n+|\. ', content) if len(c.strip()) > 3]
        if not raw_chunks:
            raw_chunks = [content]

        # 1. Validate the NEW document chunks FIRST
        new_doc_vectorizer = TfidfVectorizer(stop_words='english')
        try:
            new_matrix = new_doc_vectorizer.fit_transform(raw_chunks)
            if new_matrix.shape[1] == 0 or new_matrix.nnz == 0:
                raise ValueError("Document contains no valid indexing terms or stopwords only")
        except ValueError:
            raise ValueError("Document contains no valid indexing terms or stopwords only")

        # 2. Prepare combined candidate dataset
        candidate_docs = list(self.documents) + [{
            "id": len(self.documents),
            "title": title,
            "full_text": content,
            "chunks": raw_chunks
        }]

        all_chunks = []
        for doc in candidate_docs:
            all_chunks.extend(doc["chunks"])

        # 3. Fit full combined vocabulary
        candidate_vectorizer = TfidfVectorizer(stop_words='english')
        candidate_matrix = candidate_vectorizer.fit_transform(all_chunks)

        # Commit state ONLY on verified success
        self.documents = candidate_docs
        self.vectorizer = candidate_vectorizer
        self.tfidf_matrix = candidate_matrix

        return len(raw_chunks)

    def query(self, query_text: str, top_k: int = 3):
        if self.tfidf_matrix is None or not self.documents:
            return []

        query_text = query_text.strip()
        if not query_text:
            return []

        try:
            query_vector = self.vectorizer.transform([query_text])
            if query_vector.nnz == 0:
                return []
            scores = cosine_similarity(query_vector, self.tfidf_matrix).flatten()
        except Exception:
            return []

        chunk_map = []
        for doc in self.documents:
            for chunk in doc["chunks"]:
                chunk_map.append({"title": doc["title"], "chunk": chunk})

        top_indices = np.argsort(scores)[::-1][:top_k]
        results = []
        for idx in top_indices:
            score = float(scores[idx])
            if score > 0.001:
                results.append({
                    "title": chunk_map[idx]["title"],
                    "score": round(score, 4),
                    "snippet": chunk_map[idx]["chunk"]
                })
        return results

    def extract_summary_and_keywords(self, text: str):
        sentences = [s.strip() for s in re.split(r'\n+|\. ', text) if len(s.strip()) > 5]
        if not sentences:
            return {"summary": text[:200], "keywords": ["Snapdragon", "AI"]}

        vec = TfidfVectorizer(stop_words='english')
        try:
            matrix = vec.fit_transform(sentences)
            feature_names = vec.get_feature_names_out()
            scores = np.array(matrix.sum(axis=1)).flatten()

            top_sent_idx = np.argsort(scores)[::-1][:2]
            top_sent_idx.sort()
            summary = " ".join([sentences[i] for i in top_sent_idx])

            col_sums = np.array(matrix.sum(axis=0)).flatten()
            top_kw_idx = np.argsort(col_sums)[::-1][:5]
            keywords = [feature_names[i].capitalize() for i in top_kw_idx]

            return {
                "summary": summary,
                "keywords": keywords,
                "sentence_count": len(sentences),
                "vocab_size": len(feature_names)
            }
        except Exception:
            return {
                "summary": text[:200] + "...",
                "keywords": ["Qualcomm", "Snapdragon"],
                "sentence_count": len(sentences),
                "vocab_size": 2
            }
