const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");
require('dotenv').config();
const app = express();

const PORT =  process.env.PORT||5000;

// app.use(cors({
//   origin: "https://foodshare-frontend.onrender.com",
//   credentials: true
// }));

const allowedOrigins = [
  "http://localhost:5173",
  "https://food-share-woad.vercel.app"
];

app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (like Postman or curl)
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      } else {
        return callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  })
);

app.use(express.json());
app.set('view engine', 'ejs');
app.get("/", (req, res) => {
  res.send("API is working");
});
app.use("/api/foodposts", require("./routes/food"));
app.use("/api/users", require("./routes/user"));   
app.use('/uploads', express.static('uploads'));

connectDB();
app.listen(PORT, () => {
    console.log(`Server is listening to port ${PORT}`);
});