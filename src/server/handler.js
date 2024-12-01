const loadModel = require("../services/loadModel");
const predictClassification = require("../services/inferenceService");
const { Firestore } = require("@google-cloud/firestore");
const InputError = require("../exceptions/inputError");
const { v4: uuidv4 } = require("uuid"); // Untuk menghasilkan ID unik
const storeData = require("../services/storeData");

async function postPredictHandler(req, res) {
  try {
    // Memeriksa apakah file ada dan ukuran file sesuai
    if (!req.file) {
      return res.status(400).json({
        status: "fail",
        message: "No file uploaded",
      });
    }

    if (req.file.size > 1000000) {
      // Membatasi ukuran file maksimal 1MB
      return res.status(413).json({
        status: "fail",
        message: "Payload content length greater than maximum allowed: 1000000",
      });
    }

    const image = req.file.buffer; // Mendapatkan file yang diupload
    const model = await loadModel(); // Memuat model

    // Melakukan prediksi
    const predictionResult = await predictClassification(model, image);

    // Menghasilkan ID unik
    const id = uuidv4();

    // Menyimpan hasil prediksi ke Firestore
    const predictionData = {
      id: id,
      result: predictionResult.label,
      suggestion: predictionResult.suggestion,
      createdAt: new Date().toISOString(),
    };

    await storeData(id, predictionData); // Menyimpan ke Firestore

    // Membentuk respon berdasarkan hasil prediksi
    const response = {
      status: "success",
      message: "Model is predicted successfully",
      data: {
        id: id,
        result: predictionResult.label, // Hasil prediksi: "Cancer" atau "Non-cancer"
        suggestion: predictionResult.suggestion, // Saran terkait hasil prediksi
        createdAt: new Date().toISOString(), // Timestamp prediksi
      },
    };

    return res.json(response);
  } catch (error) {
    console.error(error); // Menampilkan error untuk debugging

    // Menangani error dalam proses prediksi
    if (error instanceof InputError) {
      return res.status(400).json({
        status: "fail",
        message: "Terjadi kesalahan dalam melakukan prediksi",
      });
    }

    // Jika ada error lain (seperti model tidak dapat dimuat)
    return res.status(500).json({
      status: "fail",
      message: "Internal server error",
    });
  }
}

// Handler untuk mengambil riwayat prediksi
// Handler untuk mengambil riwayat prediksi
async function getPredictionHistories(req, res) {
    try {
      const db = new Firestore();
      const predictionsCollection = db.collection("predictions");
      const snapshot = await predictionsCollection.get();
  
      if (snapshot.empty) {
        return res.status(404).json({
          status: "fail",
          message: "No prediction histories found.",
        });
      }
  
      // Membentuk array riwayat prediksi
      const histories = snapshot.docs.map((doc) => {
        let historyData = doc.data();
  
        // Modifikasi suggestion jika result adalah "Non-cancer"
        if (historyData.result === "Non-cancer") {
          historyData.suggestion = "Anda sehat!";
        }
  
        return {
          id: doc.id,
          history: {
            ...historyData,
            id: doc.id,
          },
        };
      });
  
      return res.status(200).json({
        status: "success",
        data: histories,
      });
    } catch (error) {
      console.error("Error fetching prediction histories:", error);
      return res.status(500).json({
        status: "fail",
        message: "An error occurred while fetching prediction histories.",
      });
    }
  }
  
  

module.exports = { getPredictionHistories, postPredictHandler };
