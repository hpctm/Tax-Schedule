import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import fs from "fs";

const app = express();
const PORT = 3000;

app.use(express.json());

// LX MMA 2026 Annual Tax Filing & Payment Schedules (Monthly VAT, Monthly Withholding & Local Tax, Corporate Tax)
import { defaultSchedules } from "./src/data/defaultSchedules";

// In-memory or file store for user schedules & custom edits
const dataFilePath = path.join(process.cwd(), "schedules_store.json");

function getStoredSchedules() {
  try {
    if (fs.existsSync(dataFilePath)) {
      const fileContent = fs.readFileSync(dataFilePath, "utf-8");
      const parsed = JSON.parse(fileContent);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed.map((s: any) => ({
          ...s,
          source: s.source || (s.category === '법인세' ? '국세청 홈택스 법인세 신고안내 (hometax.go.kr)' : s.category === '부가가치세' ? '국세청 홈택스 및 LX MMA 월별 부가가치세 신고 지침' : s.category === '원천세' ? '국세청 홈택스 원천징수 신고 안내' : '위택스(Wetax) 지방소득세 특별징수 납부안내')
        }));
      }
    }
  } catch (e) {
    console.error("Error reading storage:", e);
  }
  const initialized = (defaultSchedules as any[]).map(s => ({
    ...s,
    source: s.source || (s.category === '법인세' ? '국세청 홈택스 법인세 신고안내 (hometax.go.kr)' : s.category === '부가가치세' ? '국세청 홈택스 및 LX MMA 월별 부가가치세 신고 지침' : s.category === '원천세' ? '국세청 홈택스 원천징수 신고 안내' : '위택스(Wetax) 지방소득세 특별징수 납부안내')
  }));
  saveStoredSchedules(initialized);
  return initialized;
}

function saveStoredSchedules(schedules: any[]) {
  try {
    fs.writeFileSync(dataFilePath, JSON.stringify(schedules, null, 2), "utf-8");
  } catch (e) {
    console.error("Error saving storage:", e);
  }
}

// API Routes
app.get("/api/tax-schedules", (req, res) => {
  const schedules = getStoredSchedules();
  res.json({ success: true, schedules });
});

app.post("/api/tax-schedules", (req, res) => {
  try {
    const { schedules } = req.body;
    if (Array.isArray(schedules)) {
      saveStoredSchedules(schedules);
      res.json({ success: true, schedules });
    } else {
      res.status(400).json({ success: false, error: "Invalid payload" });
    }
  } catch (e: any) {
    res.status(500).json({ success: false, error: e.message });
  }
});

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*all', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
