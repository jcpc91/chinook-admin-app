const app = require("./src/app");
const express = require("express");
const path = require("path");

const PORT = process.env.PORT || 3002;

app.use(express.static(path.join("public")));
app.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Catalogos API server running on http://0.0.0.0:${PORT}`);
});
