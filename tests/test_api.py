import unittest
from core.real_nlp_engine import RealNLPRAGEngine
from core.real_vision_engine import RealVisionAIEngine
from core.real_audio_engine import RealAudioAIEngine
from core.real_onnx_benchmark import RealONNXBenchmarkEngine
from core.ai_hub_catalog import QualcommAIHubCatalog

class TestRealAIEngines(unittest.TestCase):

    def setUp(self):
        self.nlp_engine = RealNLPRAGEngine()
        self.vision_engine = RealVisionAIEngine()
        self.audio_engine = RealAudioAIEngine()
        self.benchmark_engine = RealONNXBenchmarkEngine()
        self.ai_hub = QualcommAIHubCatalog()

    def test_real_nlp_rag(self):
        chunks = self.nlp_engine.add_document(
            "Snapdragon X Elite Architecture",
            "The Hexagon NPU features 45 TOPS of dedicated AI compute power for local ONNX models."
        )
        self.assertGreater(chunks, 0)

        matches = self.nlp_engine.query("Hexagon NPU 45 TOPS", top_k=1)
        self.assertEqual(len(matches), 1)
        self.assertGreater(matches[0]["score"], 0.0)

    def test_real_vision_ai(self):
        res = self.vision_engine.analyze_image()
        self.assertIn("edge_map_base64", res)
        self.assertIn("edge_density_pct", res)
        self.assertGreater(res["mean_brightness"], 0)

    def test_real_audio_ai(self):
        res = self.audio_engine.analyze_audio_spectrum()
        self.assertIn("spectral_metrics", res)
        self.assertGreater(res["spectral_metrics"]["dominant_frequency_hz"], 0)
        self.assertIn("summary", res)

    def test_real_onnx_benchmark(self):
        res = self.benchmark_engine.run_hardware_benchmark(matrix_size=128, iterations=5)
        self.assertIn("npu_results", res)
        self.assertIn("cpu_results", res)
        self.assertGreater(res["npu_results"]["gflops"], 0)

if __name__ == "__main__":
    unittest.main()
