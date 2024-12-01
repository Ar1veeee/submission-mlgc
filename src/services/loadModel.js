const tf = require('@tensorflow/tfjs-node');
require('dotenv').config();

async function loadModel() {
    return tf.loadGraphModel(process.env.MODEL_URL);
}
module.exports = loadModel;