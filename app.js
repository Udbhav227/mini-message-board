const express = require('express');
const path = require('node:path');
const indexRouter = require('./routes/indexRouter')

const app = express();
const PORT = 3000;

app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

const assetsPath = path.join(__dirname, "public");
app.use(express.static(assetsPath));

app.use(express.urlencoded({ extended: true }));
app.use("/", indexRouter);
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});