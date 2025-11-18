const express = require("express");
const app = express();
const mongoose = require("mongoose");
const fs = require("fs");
const path = require("path");

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));
app.engine("ejs", require("ejs").renderFile);
app.set("view engine", "ejs");

const mongoUrl = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/f1";
mongoose.connect(mongoUrl, { useNewUrlParser: true, useUnifiedTopology: true });

const teamSchema = new mongoose.Schema({
  id: Number,
  name: String,
  nationality: String,
  url: String,
});
teamSchema.set("strictQuery", true);

const driverSchema = new mongoose.Schema({
  num: Number,
  code: String,
  forename: String,
  surname: String,
  dob: Date,
  nationality: String,
  url: String,
  team: teamSchema,
});
driverSchema.set("strictQuery", true);

const Team = mongoose.model("Team", teamSchema);
const Driver = mongoose.model("Driver", driverSchema);

let countries = [
  { code: "ENG", label: "England" },
  { code: "SPA", label: "Spain" },
  { code: "GER", label: "Germany" },
  { code: "FRA", label: "France" },
  { code: "MEX", label: "Mexico" },
  { code: "AUS", label: "Australia" },
  { code: "FIN", label: "Finland" },
  { code: "NET", label: "Netherlands" },
  { code: "CAN", label: "Canada" },
  { code: "MON", label: "Monaco" },
  { code: "THA", label: "Thailand" },
  { code: "JAP", label: "Japan" },
  { code: "CHI", label: "China" },
  { code: "USA", label: "USA" },
  { code: "DEN", label: "Denmark" },
];

function parseCsvDrivers(csvPath) {
  const csv = fs.readFileSync(csvPath, "utf8");
  const lines = csv.split(/\r?\n/).filter((l) => l.trim().length > 0);
  const header = lines.shift().split(",").map((h) => h.trim());
  const rows = lines.map((line) => {
    const parts = line.split(",");
    const obj = {};
    header.forEach((h, i) => (obj[h] = parts[i] ? parts[i].trim() : ""));
    return obj;
  });
  return rows.map((r) => {
    let dob = null;
    if (r.dob && r.dob.includes("/")) {
      const [d, m, y] = r.dob.split("/");
      dob = new Date(`${y}-${m.padStart(2, "0")}-${d.padStart(2, "0")}`);
    }
    return {
      num: Number(r.number) || null,
      code: r.code || "",
      forename: r.forename || "",
      surname: r.surname || "",
      dob: dob,
      nationality: r.nationality || "",
      url: r.url || "",
      team: { id: null, name: r.current_team || "", nationality: "", url: "" },
    };
  });
}

async function seedMiddleware(req, res, next) {
  try {
    const count = await Driver.countDocuments();
    if (count === 0) {
      const csvPath = path.join(__dirname, "public", "data", "f1_2023.csv");
      if (fs.existsSync(csvPath)) {
        const rows = parseCsvDrivers(csvPath);
        const teamMap = new Map();
        let teamId = 1;
        const driversToInsert = rows.map((r) => {
          const tName = r.team.name || "Unknown";
          if (!teamMap.has(tName)) {
            teamMap.set(tName, { id: teamId++, name: tName, nationality: "", url: "" });
          }
          r.team = teamMap.get(tName);
          return r;
        });
        await Driver.insertMany(driversToInsert);
        console.log(`Seeded ${driversToInsert.length} drivers from CSV`);
      }
    }
    next();
  } catch (err) {
    next(err);
  }
}

// Routes
app.get("/", seedMiddleware, async (req, res) => {
  try {
    const drivers = await Driver.find().lean();
    const teamNames = [];
    const teamSeen = new Set();
    drivers.forEach((d) => {
      if (d.team && d.team.name && !teamSeen.has(d.team.name)) {
        teamSeen.add(d.team.name);
        teamNames.push(d.team);
      }
    });
    const view = req.query.view === 'teams' ? 'teams' : 'drivers';
    const editId = req.query.edit || null;
    const editDriver = editId ? await Driver.findById(editId).lean() : null;
    const editTeam = req.query.editTeam || null;

    teamNames.sort((a,b)=> (a.name||'').localeCompare(b.name||''));

    res.render(path.join(__dirname, "views", "index.ejs"), {
      countries,
      teams: teamNames,
      drivers,
      editDriver,
      view,
      editTeam,
    });
  } catch (err) {
    res.status(500).send(err.message);
  }
});

app.post('/team', async (req, res) => {
  try {
    const oldName = req.body.team_old;
    const newName = req.body.team_new;
    if (!oldName || !newName) return res.redirect('/?view=teams');
    await Driver.updateMany({'team.name': oldName}, { $set: { 'team.name': newName } });
    res.redirect('/?view=teams');
  } catch (err) {
    res.status(500).send(err.message);
  }
});

app.post("/driver", async (req, res) => {
  try {
    const body = req.body;
    const teamName = body.team || "";
    const teamObj = { id: 0, name: teamName, nationality: "", url: "" };

    const driverData = {
      num: body.num ? Number(body.num) : null,
      code: body.code || "",
      forename: body.forename || body.name || "",
      surname: body.surname || body.lname || "",
      dob: body.dob ? new Date(body.dob) : null,
      nationality: body.nation || body.nationality || "",
      url: body.url || "",
      team: teamObj,
    };

    if (body._id) {
      await Driver.findByIdAndUpdate(body._id, driverData, { new: true });
    } else {
      const d = new Driver(driverData);
      await d.save();
    }
    res.redirect("/");
  } catch (err) {
    res.status(500).send(err.message);
  }
});

app.post("/driver/delete", async (req, res) => {
  try {
    const id = req.body._id;
    if (id) await Driver.findByIdAndDelete(id);
    res.redirect("/");
  } catch (err) {
    res.status(500).send(err.message);
  }
});

app.listen(3000, (err) => {
  console.log("Listening on port 3000");
});
