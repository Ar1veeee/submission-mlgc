  const express = require("express");
  const routes = require("./routes");

  const app = express();
  const port = process.env.PORT || 3000;

  app.use(express.json()); // Mengizinkan JSON request body
  app.use(express.urlencoded({ extended: true })); // Mengizinkan URL-encoded request body
  app.use(routes); // Menambahkan routes

  app.listen(port, () => {
    console.log(`Server running on port ${port}`);
  });
