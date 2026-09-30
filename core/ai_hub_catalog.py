class QualcommAIHubCatalog:
    """
    Qualcomm AI Hub Pre-Optimized Model Catalog & NPU Profiler for Snapdragon HP PCs.
    """
    def __init__(self):
        self.catalog = [
            {
                "id": "llama-3-8b-instruct",
                "name": "Llama-3 8B Instruct",
                "category": "Generative LLM",
                "parameters": "8.0 Billion",
                "quantization": "W4A16 (Qualcomm AI Hub)",
                "target_npu": "Snapdragon Hexagon (45 TOPS)",
                "latency_npu_ms": 14.2,
                "latency_cpu_ms": 89.5,
                "memory_mb": 4200,
                "description": "Optimized for local conversational AI, code generation, and Privacy RAG."
            },
            {
                "id": "whisper-base-en",
                "name": "Whisper Base STT",
                "category": "Audio & Speech",
                "parameters": "74 Million",
                "quantization": "FP16 ONNX DirectML",
                "target_npu": "Snapdragon Hexagon",
                "latency_npu_ms": 8.5,
                "latency_cpu_ms": 42.0,
                "memory_mb": 290,
                "description": "Real-time, zero-cloud meeting transcription and voice control."
            },
            {
                "id": "bge-small-en-v1.5",
                "name": "BGE-Small Vector Embeddings",
                "category": "NLP & RAG",
                "parameters": "33 Million",
                "quantization": "INT8 QNN Format",
                "target_npu": "Snapdragon Hexagon",
                "latency_npu_ms": 2.4,
                "latency_cpu_ms": 18.2,
                "memory_mb": 110,
                "description": "Fast semantic text vectorization for instant local document search."
            },
            {
                "id": "mobilenet-v4-large",
                "name": "MobileNetV4 Vision",
                "category": "Computer Vision",
                "parameters": "3.8 Million",
                "quantization": "INT8 Hardware Accelerated",
                "target_npu": "Snapdragon Hexagon",
                "latency_npu_ms": 1.1,
                "latency_cpu_ms": 12.4,
                "memory_mb": 45,
                "description": "Ultra-fast document boundary detection and screen OCR."
            },
            {
                "id": "depth-anything-v2",
                "name": "Depth Anything V2",
                "category": "Computer Vision",
                "parameters": "24.8 Million",
                "quantization": "FP16 QNN Asset",
                "target_npu": "Snapdragon Hexagon",
                "latency_npu_ms": 6.8,
                "latency_cpu_ms": 54.0,
                "memory_mb": 310,
                "description": "Monocular 3D depth estimation for gesture workspace interaction."
            }
        ]

    def get_models(self, category: str = "all"):
        if category == "all":
            return self.catalog
        return [m for m in self.catalog if m["category"].lower() == category.lower()]
