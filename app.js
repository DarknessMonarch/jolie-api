const express = require("express");
const app = express();
const cors = require("cors");
const path = require("path");
const dotenv = require("dotenv");
const fetch = require("node-fetch");
const session = require("express-session");
const morgan = require("morgan");
const MongoStore = require("connect-mongo");
const helmet = require("helmet");
const { connectDB } = require("./config/db");
const bodyParser = require("body-parser");
const authRoute = require("./routes/authRoute");
const subcriptionRoute = require("./routes/subcriptionRoute");
const appointmentRoute = require("./routes/appointmentRoute");

dotenv.config();
connectDB();

const PORT = process.env.PORT || 5000;

const fetchDataFromServer = async () => {
  try {
    await fetch("https://farid-creations-server.onrender.com/current");
  } catch (error) {
    console.error("[!] Error fetching data:", error);
  }
};

fetchDataFromServer();
setInterval(fetchDataFromServer, 13 * 60 * 1000);

app.use(express.json());
app.use(cors());
app.use(express.urlencoded({ extended: false }));
app.use(bodyParser.json()); 

app.use(helmet());

app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({ mongoUrl: process.env.MONGO_CONNECTION_URL }),
    cookie: {
      maxAge: 1000 * 60 * 60 * 24, 
    },
  })
);

app.use(morgan("dev"));

app.use("/api/v1/auth", authRoute);
app.use("/api/v1/subcription", subcriptionRoute);
app.use("/api/v1/appointment", appointmentRoute);

app.get("/", (req, res) => {
  const filePath = path.join(__dirname, "client", "index.html");
  res.sendFile(filePath);
});

app.use((err, req, res, next) => {
  console.error("[!] Unhandled error:", err);
  res.status(500).json({ error: "[!] An unexpected error occurred" });
});

app.listen(PORT, () => {
  console.log(`[+] Server running on port ${PORT}`);
});

process.on("SIGINT", async () => {
  console.log("[-] Sayonara...");
  process.exit(0);
});
