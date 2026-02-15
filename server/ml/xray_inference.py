import os
import torch
import torch.nn as nn
import torch.nn.functional as F
import torchvision.transforms as transforms
import torchvision.models as models
import numpy as np
import cv2
import base64
from io import BytesIO
from PIL import Image
# from gradcam import GradCAM, overlay_heatmap
from my_gradcam import GradCAM, overlay_heatmap
# from my_gradcam import GradCAM

# --------------------------------------------------
# CONFIG
# --------------------------------------------------
# Use __file__ (standard Python) to find the script's directory
CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))

# Correctly point to best_model.pth in the same folder as this script
MODEL_PATH = os.path.join(CURRENT_DIR, "best_model.pth")
DEVICE = torch.device("cuda" if torch.cuda.is_available() else "cpu")
CLASS_NAMES = ["NORMAL", "PNEUMONIA", "TB"]

# --------------------------------------------------
# Model Architecture & Weight Loading
# --------------------------------------------------
def load_model():
    # Initialize DenseNet121 architecture
    model = models.densenet121(weights=None)
    
    # Adjust classifier to match our 3 classes
    num_ftrs = model.classifier.in_features
    model.classifier = nn.Linear(num_ftrs, len(CLASS_NAMES))
    
    # Check if model exists before loading
    if not os.path.exists(MODEL_PATH):
        raise FileNotFoundError(f"Model file not found at: {MODEL_PATH}")
        
    # Load weights onto the specific device (CPU/GPU)
    state_dict = torch.load(MODEL_PATH, map_location=DEVICE)
    model.load_state_dict(state_dict)
    model.to(DEVICE)
    model.eval()
    return model

# Global initialization
model = load_model()
target_layer = model.features[-1] 
gradcam = GradCAM(model, target_layer)

# --------------------------------------------------
# Image Preprocessing Logic
# --------------------------------------------------
transform = transforms.Compose([
    transforms.Resize((224, 224)),
    transforms.ToTensor(),
    transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225])
])

def preprocess_xray(image_bytes):
    """
    Converts raw bytes into a PIL image for display 
    and a normalized tensor for the AI model.
    """
    image = Image.open(BytesIO(image_bytes)).convert("RGB")
    original_for_display = image.copy()
    tensor = transform(image).unsqueeze(0).to(DEVICE)
    return original_for_display, tensor

# --------------------------------------------------
# Main Inference Pipeline (Dual View)
# --------------------------------------------------
def run_xray_inference(image_bytes):
    original_image, input_tensor = preprocess_xray(image_bytes)

    # 1. Forward pass for classification
    with torch.no_grad():
        logits = model(input_tensor)
        probs = F.softmax(logits, dim=1)[0]
    
    probs_np = probs.cpu().numpy()
    pred_idx = int(np.argmax(probs_np))

    # 2. Grad-CAM generation (highlights abnormality)
    cam = gradcam.generate(input_tensor, class_idx=pred_idx)

    # 3. Process Original Image for Frontend
    original_np = np.array(original_image.convert("RGB"))
    original_np = cv2.cvtColor(original_np, cv2.COLOR_RGB2BGR)
    
    _, original_buf = cv2.imencode(".jpg", original_np)
    original_base64 = base64.b64encode(original_buf).decode("utf-8")

    # 4. Process Grad-CAM Overlay for Frontend
    gradcam_img = overlay_heatmap(cam, original_np)
    _, gradcam_buf = cv2.imencode(".jpg", gradcam_img)
    gradcam_base64 = base64.b64encode(gradcam_buf).decode("utf-8")

    # Final JSON structure for Node.js
    return {
        "prediction": CLASS_NAMES[pred_idx],
        "probabilities": {
            "NORMAL": float(probs_np[0]),
            "PNEUMONIA": float(probs_np[1]),
            "TB": float(probs_np[2])
        },
        "original_base64": original_base64,
        "gradcam_base64": gradcam_base64 
    }