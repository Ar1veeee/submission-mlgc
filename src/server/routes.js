const express = require("express");
const multer = require("multer");
const { postPredictHandler, getPredictionHistories } = require("./handler");

// Setup multer untuk menangani file upload
const storage = multer.memoryStorage(); // Menyimpan file di memory
const upload = multer({
  storage: storage,
  limits: { fileSize: 1000000 }, // Membatasi ukuran file menjadi 1MB
});

// Middleware untuk menangani error jika ukuran file melebihi batas
const handleMulterError = (err, req, res, next) => {
  if (err instanceof multer.MulterError && err.code === 'LIMIT_FILE_SIZE') {
    return res.status(413).json({
      status: "fail",
      message: "Payload content length greater than maximum allowed: 1000000",
    });
  }
  next(err); // Jika error bukan karena ukuran file, lanjutkan ke error handler lainnya
};

const router = express.Router();

// Route GET untuk mengambil riwayat prediksi
router.get("/predict/histories", getPredictionHistories);

// Route POST untuk /predict dengan penanganan error Multer
router.post("/predict", upload.single("image"), handleMulterError, postPredictHandler);

module.exports = router;
