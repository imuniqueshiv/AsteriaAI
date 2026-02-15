import sys
import json
import os
import warnings
import traceback

# Silence warnings to keep output clean
os.environ['TF_CPP_MIN_LOG_LEVEL'] = '3'
warnings.filterwarnings("ignore")

def main():
    try:
        if len(sys.argv) < 2:
            raise ValueError("No path provided")

        image_path = sys.argv[1]

        if not os.path.exists(image_path):
             raise FileNotFoundError(f"Image not found: {image_path}")

        # ✅ Import libraries HERE to avoid warnings before we start
        from my_gradcam import GradCAM, overlay_heatmap
        from xray_inference import run_xray_inference

        # Read Image
        with open(image_path, "rb") as f:
            image_bytes = f.read()

        # Run Inference
        result = run_xray_inference(image_bytes)

        # ✅ CRITICAL: Wrap the JSON in tags so Node.js can find it
        print("<<<JSON_START>>>")
        print(json.dumps(result))
        print("<<<JSON_END>>>")

    except Exception as e:
        # Capture full error details
        error_details = {
            "error": str(e),
            "traceback": traceback.format_exc()
        }
        # Print error inside tags too
        print("<<<JSON_START>>>")
        print(json.dumps(error_details))
        print("<<<JSON_END>>>")
        sys.exit(1)

if __name__ == "__main__":
    main()