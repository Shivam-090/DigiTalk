import dotenv from "dotenv";
import app from "./app.js";
import { connectDB } from "./lib/db.js";

dotenv.config({ quiet: true });

const PORT = process.env.PORT || 3000;

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
});
