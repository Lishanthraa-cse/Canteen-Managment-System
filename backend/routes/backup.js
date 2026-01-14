const express = require("express");
const { exec } = require("child_process");
const path = require("path");
const fs = require("fs");
require("dotenv").config(); // make sure this is here

const router = express.Router();

const BACKUP_PATH = path.resolve(__dirname, "../backups");

if (!fs.existsSync(BACKUP_PATH)) {
  fs.mkdirSync(BACKUP_PATH, { recursive: true });
}

router.get("/backup", (req, res) => {
  const mongoUri = process.env.MONGO_URI;

  const cmd = `"C:/Program Files/MongoDB/Tools/bin/mongodump.exe" --uri="${mongoUri}" --out="${BACKUP_PATH}"`;


  exec(cmd, (err, stdout, stderr) => {
    if (err) {
      console.error("❌ Backup failed:", stderr);
      return res.status(500).json({ error: stderr || "Backup failed" });
    }
    res.json({ message: "✅ Backup successful!", path: BACKUP_PATH });
  });
});

module.exports = router;
