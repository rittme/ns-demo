const express = require("express");
const fetch = require("node-fetch");

const app = express();

const url = "http://bnsapi.iov.one:8000/username/resolve/";

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  next();
});

app.get("/:id", async (req, res) => {
  const id = req.params.id;

  try {
    const fetched = await fetch(url + id);
    return res.json(await fetched.json());
  } catch (err) {
    return res.status(500).json({ type: "error", message: err.message });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`listening on ${PORT}`));
