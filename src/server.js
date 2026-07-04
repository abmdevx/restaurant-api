import "dotenv/config";
import connectDB from "./config/db.js";
import app from "./app.js";

const PORT = process.env.PORT || 3000;

await connectDB()

app.listen(PORT, () => {
  console.log(`🍽️  Restaurant server running on port ${PORT}`);
});