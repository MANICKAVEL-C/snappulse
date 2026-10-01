import cv2
import numpy as np
import base64

class RealVisionAIEngine:
    """
    Real Computer Vision AI Engine using OpenCV & NumPy.
    Processes user-uploaded images or synthetic test patterns to compute Canny edge maps,
    resolution, brightness, and RGB color spectrum channels.
    """
    def generate_synthetic_pattern(self, width=320, height=240):
        img = np.zeros((height, width, 3), dtype=np.uint8)
        for y in range(height):
            img[y, :, 0] = int(y / height * 180)
            img[y, :, 1] = int(y / height * 80)
            img[y, :, 2] = 220
        
        cv2.circle(img, (100, 120), 45, (0, 240, 255), -1)
        cv2.rectangle(img, (180, 70), (280, 170), (255, 0, 100), -1)
        cv2.putText(img, "SNAPDRAGON NPU", (30, 210), cv2.FONT_HERSHEY_SIMPLEX, 0.6, (255, 255, 255), 2)
        return img

    def analyze_image(self, image_bytes: bytes = None):
        is_custom_upload = False
        if image_bytes and len(image_bytes) > 0:
            try:
                nparr = np.frombuffer(image_bytes, np.uint8)
                img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
                if img is not None and img.size > 0:
                    is_custom_upload = True
                else:
                    img = self.generate_synthetic_pattern()
            except Exception:
                img = self.generate_synthetic_pattern()
        else:
            img = self.generate_synthetic_pattern()

        # Resize large uploads to max 800px wide for speed & Vercel memory safety
        h, w = img.shape[:2]
        if w > 800:
            scale = 800.0 / w
            img = cv2.resize(img, (800, int(h * scale)))

        # 1. Canny Edge Detection
        gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
        edges = cv2.Canny(gray, 50, 150)
        edge_density = float(np.sum(edges > 0) / edges.size * 100)

        # 2. RGB Distribution Metrics
        color_b = float(np.mean(img[:, :, 0]))
        color_g = float(np.mean(img[:, :, 1]))
        color_r = float(np.mean(img[:, :, 2]))

        # 3. Base64 PNG Edge Map Generation
        _, buffer = cv2.imencode('.png', edges)
        edge_base64 = base64.b64encode(buffer).decode('utf-8')

        return {
            "resolution": f"{img.shape[1]}x{img.shape[0]} px",
            "channels": img.shape[2],
            "edge_density_pct": round(edge_density, 2),
            "mean_brightness": round(float(np.mean(gray)), 2),
            "rgb_distribution": {
                "red": round(color_r, 1),
                "green": round(color_g, 1),
                "blue": round(color_b, 1)
            },
            "edge_map_base64": f"data:image/png;base64,{edge_base64}",
            "is_custom_upload": is_custom_upload,
            "source_label": "User Uploaded Image (Processed via OpenCV)" if is_custom_upload else "Synthetic Demo Pattern (OpenCV Generated)"
        }
