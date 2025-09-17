
const express = require("express");
const bodyParser = require("body-parser");
const sqlite3 = require("sqlite3").verbose();
const cors = require("cors");

const app = express();
const PORT = 5000;

app.use(cors());
app.use(bodyParser.json());

// Initialize SQLite database
const db = new sqlite3.Database("./bloodlife.db", (err) => {
  if (err) {
    console.error("Error opening database", err.message);
  } else {
    db.run(
      `CREATE TABLE IF NOT EXISTS donors (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT,
        bloodGroup TEXT,
        location TEXT,
        contact TEXT
      )`
    );
  }
});

// Add new donor
app.post("/donors", (req, res) => {
  const { name, bloodGroup, location, contact } = req.body;
  db.run(
    "INSERT INTO donors (name, bloodGroup, location, contact) VALUES (?, ?, ?, ?)",
    [name, bloodGroup, location, contact],
    function (err) {
      if (err) {
        res.status(400).json({ error: err.message });
      } else {
        res.json({ id: this.lastID, name, bloodGroup, location, contact });
      }
    }
  );
});

// Search donors by bloodGroup and location
app.get("/donors", (req, res) => {
  const { bloodGroup, location } = req.query;
  let query = "SELECT * FROM donors WHERE 1=1";
  let params = [];

  if (bloodGroup) {
    query += " AND bloodGroup = ?";
    params.push(bloodGroup);
  }
  if (location) {
    query += " AND location = ?";
    params.push(location);
  }

  db.all(query, params, (err, rows) => {
    if (err) {
      res.status(400).json({ error: err.message });
    } else {
      res.json(rows);
    }
  });
});

// Request blood (simple logging for now)
app.post("/request", (req, res) => {
  const { donorId, recipientName } = req.body;
  console.log(`Recipient ${recipientName} requested blood from donor ${donorId}`);
  res.json({ message: "Request sent successfully" });
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
