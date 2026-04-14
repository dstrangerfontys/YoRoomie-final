const express = require("express");
const cors = require("cors");

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("YoRoomie API werkt");
});

app.get("/api/health", (req, res) => {
  res.json({ message: "API werkt" });
});

app.listen(PORT, () => {
  console.log(`Server running on ${PORT}`);
});