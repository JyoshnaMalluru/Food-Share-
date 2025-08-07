const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");
require('dotenv').config();
const app = express();

const PORT =  process.env.PORT||5000;

app.use(cors());
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