const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const healthRoutes = require("./routes/healthRoutes");

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
    res.send("YoRoomie API is running");
});

app.use("/api/health", healthRoutes);

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});