const express = require("express");
const cors = require("cors");
const path = require("path");
const fs = require("fs");
const os = require("os");
const youtubedl = require("yt-dlp-exec");

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
app.use(express.static("public"));

app.post("/api/download", async (req, res) => {
  const { url, format } = req.body;

  if (!url || !format) {
    return res.status(400).json({ error: "Missing URL or format." });
  }

  const filename = `media_${Date.now()}.${format}`;
  const filePath = path.join(os.tmpdir(), filename);

  const options = {
    output: filePath,
    format: format === "mp3" || format === "m4a" ? "bestaudio" : "best",
    extractAudio: format === "mp3" || format === "m4a",
    audioFormat: format === "mp3" || format === "m4a" ? format : undefined,
    mergeOutputFormat: format !== "mp3" && format !== "m4a" ? format : undefined,
  };

  try {
    await youtubedl(url, options);

    res.download(filePath, filename, (err) => {
      if (err) {
        console.error("Download error:", err);
        res.status(500).json({ error: "Download failed." });
      }

      fs.unlink(filePath, () => {});
    });
  } catch (err) {
    console.error("Download error:", err);
    res.status(500).json({ error: "Download failed." });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
