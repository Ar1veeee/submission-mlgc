const tf = require("@tensorflow/tfjs-node");
const InputError = require("../exceptions/inputError");

async function predictClassification(model, image, threshold = 0.5) {
  try {
    // Validasi input
    if (!image) {
      throw new InputError("Input gambar tidak valid atau kosong.");
    }

    // Preprocess input image
    const tensor = tf.node
      .decodeJpeg(image) // Decode JPEG file
      .resizeNearestNeighbor([224, 224]) // Resize sesuai input shape model
      .expandDims() // Tambahkan batch dimension
      .toFloat()

    // Get model prediction
    const prediction = model.predict(tensor);
    const score = Array.from(await prediction.data()); // Ambil hasil prediksi sebagai array

    // Debug untuk memastikan keluaran
    console.log("Prediction Scores:", score);

    // Validasi output
    if (score.length !== 1) {
      throw new InputError(
        "Output model tidak sesuai, harus berupa array dengan panjang 1."
      );
    }

    // Tentukan confidence score
    const confidenceScore = score[0] * 100; // Konversi ke persentase

    // Klasifikasi berdasarkan threshold
    const label = confidenceScore > threshold * 100 ? "Cancer" : "Non-cancer";

    const suggestion =
      label === "Cancer"
        ? "Segera periksa ke dokter untuk evaluasi lebih lanjut!"
        : "Penyakit kanker tidak terdeteksi.";

    // Kembalikan hasil sebagai objek dengan confidence dan label
    return {
      confidenceScore: confidenceScore.toFixed(1), // Batasi ke 1 desimal
      label,
      suggestion,
    };
  } catch (error) {
    throw new InputError("Prediksi gagal: " + error.message);
  }
}

module.exports = predictClassification;
