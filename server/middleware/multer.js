import multer from "multer";
import path from "path";

// 1. Configure where to store the uploaded X-ray images
const storage = multer.diskStorage({
  destination: "uploads/", 
  filename: function (req, file, cb) {
    // Generates a unique name like: 1705912345678.png
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

// 2. Initialize the upload middleware
const upload = multer({ 
    storage: storage,
    limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit for high-res X-rays
});

export default upload;