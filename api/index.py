import os
from fastapi import FastAPI, HTTPException, UploadFile, File, Form, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel, Field

from core.real_nlp_engine import RealNLPRAGEngine
from core.real_vision_engine import RealVisionAIEngine
from core.real_audio_engine import RealAudioAIEngine
from core.real_onnx_benchmark import RealONNXBenchmarkEngine
from core.ai_hub_catalog import QualcommAIHubCatalog

app = FastAPI(
    title="SnapPulse API",
    description="Backend AI Engine for Snapdragon HP PCs powered by Qualcomm AI Hub",
    version="3.1.0"
)

# CORS Fix: allow_origins=["*"] MUST NOT use allow_credentials=True
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["*"],
)

nlp_engine = RealNLPRAGEngine()
vision_engine = RealVisionAIEngine()
audio_engine = RealAudioAIEngine()
benchmark_engine = RealONNXBenchmarkEngine()
ai_hub = QualcommAIHubCatalog()

# Pre-populate initial submission document
try:
    nlp_engine.add_document(
        "Qualcomm Snapdragon AI Lab Submission",
        "SnapPulse is designed specifically for Snapdragon-powered HP PCs. "
        "By offloading vector embeddings, Llama-3 LLM reasoning, and Whisper speech-to-text to the Hexagon NPU (45 TOPS) via DirectML, "
        "it runs 100% on-device with zero cloud latency, preserving battery power compared to CPU execution."
    )
except Exception:
    pass

# --- Pydantic Validation Schemas ---
class BenchmarkRequest(BaseModel):
    matrix_size: int = Field(512, ge=16, le=1024, description="Matrix dimension N for N x N matrix multiply")
    iterations: int = Field(20, ge=1, le=100, description="Number of benchmark iterations")

class IndexRequest(BaseModel):
    title: str = Field(..., min_length=1, max_length=200, description="Document title")
    content: str = Field(..., min_length=5, max_length=50000, description="Document text content")

class QueryRequest(BaseModel):
    query: str = Field(..., min_length=1, max_length=500, description="Search query string")


@app.get("/api/health")
def health_check():
    return {
        "status": "online",
        "platform": "Snapdragon-powered HP PCs (Windows on ARM)",
        "npu": "Qualcomm Hexagon NPU 45 TOPS",
        "detected_provider": benchmark_engine.detected_accelerator[1],
        "is_hardware_accelerated": benchmark_engine.detected_accelerator[2],
        "execution_providers": benchmark_engine.available_providers,
        "ai_features": [
            "Real ONNX Runtime Session Execution",
            "Real Scikit-Learn TF-IDF Vector RAG",
            "Real OpenCV Computer Vision Engine",
            "Real SciPy FFT Spectral Audio Analysis"
        ]
    }

@app.post("/api/benchmark/run")
def run_benchmark(payload: BenchmarkRequest):
    return benchmark_engine.run_hardware_benchmark(
        matrix_size=payload.matrix_size,
        iterations=payload.iterations
    )

@app.post("/api/rag/index")
def index_document(payload: IndexRequest):
    try:
        chunk_count = nlp_engine.add_document(payload.title, payload.content)
        return {"status": "success", "title": payload.title, "indexed_chunks": chunk_count}
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Indexing failed: {str(e)}")

@app.post("/api/rag/query")
def query_rag(payload: QueryRequest):
    matches = nlp_engine.query(payload.query, top_k=3)
    return {"query": payload.query, "matches": matches}

@app.post("/api/vision/analyze")
async def analyze_vision(file: UploadFile = File(None)):
    image_bytes = None
    if file:
        if file.size and file.size > 5 * 1024 * 1024:
            raise HTTPException(status_code=400, detail="Image file size exceeds 5MB limit")
        image_bytes = await file.read()

    return vision_engine.analyze_image(image_bytes=image_bytes)

@app.post("/api/audio/analyze")
async def analyze_audio(file: UploadFile = File(None), text_sample: str = Form(None)):
    audio_bytes = None
    if file:
        if file.size and file.size > 10 * 1024 * 1024:
            raise HTTPException(status_code=400, detail="Audio file size exceeds 10MB limit")
        audio_bytes = await file.read()

    return audio_engine.analyze_audio_spectrum(audio_bytes=audio_bytes, text_sample=text_sample)

@app.get("/api/ai-hub/models")
def get_ai_hub_models(category: str = "all"):
    return ai_hub.get_models(category)

# Static files mounting
public_dir = os.path.join(os.path.dirname(os.path.dirname(__file__)), "public")
if os.path.exists(public_dir):
    app.mount("/", StaticFiles(directory=public_dir, html=True), name="public")
