import unittest
from fastapi.testclient import TestClient
from api.index import app

class TestSnapPulseFastAPI(unittest.TestCase):

    def setUp(self):
        self.client = TestClient(app)

    def test_health_endpoint(self):
        response = self.client.get("/api/health")
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(data["status"], "online")
        self.assertIn("detected_provider", data)
        self.assertIn("execution_providers", data)

    def test_benchmark_endpoint_valid(self):
        payload = {"matrix_size": 128, "iterations": 5}
        response = self.client.post("/api/benchmark/run", json=payload)
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertIn("target_results", data)
        self.assertIn("cpu_results", data)
        self.assertIn("median_latency_ms", data["target_results"])
        self.assertIn("median_latency_ms", data["cpu_results"])

    def test_benchmark_endpoint_validation_bounds(self):
        # Invalid matrix size > 1024
        payload = {"matrix_size": 5000, "iterations": 5}
        response = self.client.post("/api/benchmark/run", json=payload)
        self.assertEqual(response.status_code, 422)  # Pydantic Validation Error

        # Invalid string instead of int
        payload = {"matrix_size": "invalid_string", "iterations": 5}
        response = self.client.post("/api/benchmark/run", json=payload)
        self.assertEqual(response.status_code, 422)

    def test_rag_index_and_query_endpoints(self):
        # 1. Index document
        index_payload = {
            "title": "Snapdragon 5G Architecture",
            "content": "The Snapdragon X Elite processor integrates Hexagon NPU hardware for high efficiency AI compute."
        }
        idx_res = self.client.post("/api/rag/index", json=index_payload)
        self.assertEqual(idx_res.status_code, 200)
        self.assertEqual(idx_res.json()["title"], "Snapdragon 5G Architecture")

        # 2. Query document
        query_payload = {"query": "Hexagon NPU AI compute"}
        query_res = self.client.post("/api/rag/query", json=query_payload)
        self.assertEqual(query_res.status_code, 200)
        matches = query_res.json()["matches"]
        self.assertGreater(len(matches), 0)
        self.assertIn("Snapdragon", matches[0]["title"])

    def test_rag_index_stopwords_rejection(self):
        # Stopwords only document must fail gracefully with 400 Bad Request
        index_payload = {
            "title": "Stopwords Document",
            "content": "the and of or to in a is"
        }
        idx_res = self.client.post("/api/rag/index", json=index_payload)
        self.assertEqual(idx_res.status_code, 400)
        self.assertIn("contains no valid indexing terms", idx_res.json()["detail"])

    def test_vision_analyze_endpoint(self):
        response = self.client.post("/api/vision/analyze")
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertIn("edge_map_base64", data)
        self.assertIn("edge_density_pct", data)

    def test_audio_analyze_endpoint(self):
        response = self.client.post("/api/audio/analyze")
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertIn("spectral_metrics", data)
        self.assertIn("dominant_frequency_hz", data["spectral_metrics"])

    def test_ai_hub_catalog_endpoint(self):
        response = self.client.get("/api/ai-hub/models")
        self.assertEqual(response.status_code, 200)
        models = response.json()
        self.assertGreater(len(models), 0)

if __name__ == "__main__":
    unittest.main()
