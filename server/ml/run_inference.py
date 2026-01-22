import sys
import json
import os
import warnings

# Silence warnings to keep JSON output clean for Node.js
warnings.filterwarnings("ignore")
os.environ['TF_CPP_MIN_LOG_LEVEL'] = '3' 

try:
    from xray_inference import run_xray_inference
except Exception as e:
    sys.stdout.write(json.dumps({"error": f"Import Error: {str(e)}"}))
    sys.exit(1)

def main():
    if len(sys.argv) < 2:
        sys.stdout.write(json.dumps({"error": "No path provided"}))
        sys.exit(1)

    image_path = sys.argv[1]

    if not os.path.exists(image_path):
        sys.stdout.write(json.dumps({"error": f"File not found: {image_path}"}))
        sys.exit(1)

    try:
        with open(image_path, "rb") as f:
            image_bytes = f.read()

        # Run inference
        result = run_xray_inference(image_bytes)

        # Output ONLY JSON
        sys.stdout.write(json.dumps(result))
        sys.stdout.flush()

    except Exception as e:
        sys.stdout.write(json.dumps({"error": str(e)}))
        sys.stdout.flush()
        sys.exit(1)

if __name__ == "__main__":
    main()