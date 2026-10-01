# ⚡ SnapPulse: Snapdragon® Wireless Communication & On-Device AI Studio

[![CI Test Suite](https://github.com/MANICKAVEL-C/snappulse/actions/workflows/ci.yml/badge.svg)](https://github.com/MANICKAVEL-C/snappulse/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

SnapPulse is a full-stack, production-grade AI studio designed and optimized for **Snapdragon-powered HP PCs** (Windows on ARM). It combines **Qualcomm® 5G Wireless Signal Processing** with **Hexagon™ NPU (45 TOPS)** hardware acceleration, delivering real on-device NLP vector search, OpenCV vision analysis, SciPy audio spectral processing, and real ONNX Runtime execution sessions.

---

## 🌟 Architecture & Key Features

1. **⚡ Real ONNX Runtime Execution Profiler**: Runs real ONNX `InferenceSession` model graphs in memory using warm-up runs, median/p95 latency profiling, and real execution provider detection (`QNNExecutionProvider` -> `DmlExecutionProvider` -> `CPUExecutionProvider`).
2. **📡 5G Wireless Carrier Waveform & QAM-64 Constellation**: Interactive visualizers demonstrating 5G NR signal modulation, QAM-64 constellation points, and DSP noise filtering.
3. **📄 Scikit-Learn Privacy RAG Vault**: Real TF-IDF L2 vector embeddings and cosine similarity search running 100% locally on-device.
4. **👁️ OpenCV Computer Vision Engine**: Supports real user image uploads (`cv2.Canny` edge detection, brightness, and RGB spectrum channels).
5. **🎙️ SciPy Audio Spectral AI**: Supports real WAV audio uploads (Fast Fourier Transform frequency spectrum, RMS decibels, and NLP summarization).
6. **🤖 Qualcomm® AI Hub Model Catalog**: Filterable specifications for pre-quantized Qualcomm AI Hub assets (Llama-3 8B W4A16, Whisper Base FP16, BGE-Small INT8, MobileNetV4, Depth Anything V2).

---

## 🛠️ Tech Stack & Dependencies

- **API Backend**: FastAPI (`>=0.109.0`), Uvicorn (`>=0.27.0`), Pydantic (`>=2.5.0`)
- **AI & ML Execution**: ONNX Runtime (`>=1.16.0`), ONNX (`>=1.15.0`), Scikit-Learn (`>=1.3.0`), SciPy (`>=1.11.0`), OpenCV Headless (`>=4.8.0`), NumPy (`>=1.24.0,<2.0.0`)
- **Frontend UI**: Responsive HTML5, Tailwind-inspired Light Theme, Vanilla JS, Chart.js, Interactive HTML5 Canvases

---

## 🚀 Quick Start & Local Execution

### 1. Install Dependencies
```powershell
pip install -r requirements.txt
```

### 2. Run Automated Test Suite
```powershell
python -m unittest discover -s tests -p "test_*.py"
```

### 3. Launch Server
```powershell
python -m uvicorn api.index:app --reload --port 8000
```
Open [http://localhost:8000](http://localhost:8000) in your web browser.

---

## 🔒 Security & Robustness Fixes

- **Strict Input Validation**: All API endpoints use Pydantic models (`matrix_size` bounded between 16 and 1024, `iterations` bounded between 1 and 100).
- **CORS Protection**: Configured with strict origins and disabled credential wildcard sharing.
- **XSS Protection**: Frontend text rendering uses HTML entity escaping to prevent cross-site scripting.
- **Atomic State Integrity**: Document indexing validates vocabulary before state mutation; stopword-only or empty texts return HTTP 400 Bad Request.

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).
