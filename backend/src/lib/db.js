import mongoose from "mongoose";
import { seedAdminFromEnv } from "./seedAdmin.js";

let connectionPromise = null;

export const connectDB = async () => {
  if (mongoose.connection.readyState === 1) {
    return mongoose.connection;
  }

  if (connectionPromise) {
    return connectionPromise;
  }

  connectionPromise = mongoose
    .connect(process.env.MONGO_URI)
    .then(async (conn) => {
      console.log(`MongoDB Connected: ${conn.connection.host}`);
      await seedAdminFromEnv();
      return conn.connection;
    })
    .catch((error) => {
      connectionPromise = null;
      console.log("Error in connecting to MongoDB", error);
      throw error;
    });

  return connectionPromise;
};
