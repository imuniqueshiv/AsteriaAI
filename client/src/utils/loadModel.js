import axios from "axios";

/**
 * Sends the X-ray file to the Node.js backend for AI analysis.
 * The backend will spawn the Python process and return Grad-CAM results.
 */
export async function uploadXray(file) {
  const formData = new FormData();

  // ✅ MUST match the field name used in your Multer middleware
  formData.append("xray", file);

  try {
    const response = await axios.post(
      "http://localhost:4000/api/screen/analyze", // Updated to match your server.js mount point
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        withCredentials: true, // Required if you are using cookies/auth
      }
    );

    return response.data;
  } catch (error) {
    console.error("API Error during X-ray analysis:", error.response?.data || error.message);
    throw error;
  }
}