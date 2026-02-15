import sys
import os

print("--- DIAGNOSTIC START ---")
print(f"Python Executable: {sys.executable}")
print(f"Working Directory: {os.getcwd()}")

try:
    print("1. Testing Numpy...")
    import numpy
    print(f"   ✅ Numpy Version: {numpy.__version__}")
except ImportError as e:
    print(f"   ❌ Numpy Failed: {e}")

try:
    print("2. Testing PyTorch...")
    import torch
    print(f"   ✅ Torch Version: {torch.__version__}")
except ImportError as e:
    print(f"   ❌ PyTorch Failed: {e}")

try:
    print("3. Testing OpenCV...")
    import cv2
    print(f"   ✅ OpenCV Version: {cv2.__version__}")
except ImportError as e:
    print(f"   ❌ OpenCV Failed: {e}")

try:
    print("4. Testing GradCAM Import...")
    # This checks if your rename worked
    from ml.my_gradcam import GradCAM
    print("   ✅ GradCAM Imported Successfully")
except ImportError as e:
    print(f"   ❌ GradCAM Failed: {e}")
except Exception as e:
    print(f"   ❌ GradCAM Error: {e}")

try:
    print("5. Testing Model Loading...")
    # Adjust path to where your model actually is
    model_path = os.path.join("ml", "best_model.pth")
    if os.path.exists(model_path):
        print(f"   ✅ Model File Found: {model_path}")
        # Try a dry run load
        device = torch.device("cpu")
        model = torch.load(model_path, map_location=device)
        print("   ✅ Model Loaded into Memory")
    else:
        print(f"   ❌ Model File NOT Found at: {model_path}")
except Exception as e:
    print(f"   ❌ Model Load Failed: {e}")

print("--- DIAGNOSTIC END ---")