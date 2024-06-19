const mongoose = require("mongoose");
const dotenv = require ('dotenv');
dotenv.config();

const uri = "mongodb+srv://testeSync:testeSync@teste.wb71wzk.mongodb.net/?retryWrites=true&w=majority&appName=teste";

async function connectDb() {
  try {
    await mongoose.connect(uri); //Substitua "process.env.REACT_APP_MONGODB_URI" pela URI mandada no e-mail
    console.log("Conectado ao MongoDB");
  } catch (err) {
    console.log(err.message);
  }
}

async function disconnectDb() {
  await mongoose.disconnect();
}

module.exports = { connectDb, disconnectDb };