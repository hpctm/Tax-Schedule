import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import fs from "fs";

const app = express();
const PORT = 3000;

app.use(express.json());

// LX MMA 2026 Annual Tax Filing & Payment Schedules (Monthly VAT, Monthly Withholding & Local Tax, Corporate Tax)
const defaultSchedules = [
  // --- 법인세 ---
  {
    id: "sched-corp-1",
    title: "2025년 귀속 법인세 확정 신고 및 납부 (12월 결산법인)",
    category: "법인세",
    dueDate: "2026-03-31",
    description: "전기분 법인세 신고 및 납부 (재무제표, 세무조정계산서 제출)",
    isOfficial: true,
    isImportant: true,
    reminderDays: 7,
    status: "upcoming",
    completed: false,
    notes: "회계법인 감사보고서 첨부 및 홈택스 전자신고"
  },
  {
    id: "sched-corp-2",
    title: "2026년 법인세 중간예납 신고 및 납부",
    category: "법인세",
    dueDate: "2026-08-31",
    description: "상반기(1월 1일 ~ 6월 30일) 실적에 대한 법인세 중간예납",
    isOfficial: true,
    isImportant: true,
    reminderDays: 5,
    status: "upcoming",
    completed: false,
    notes: "직전 사업년도 산출세액 기준 또는 중간예납 기간 가결산 선택"
  },

  // --- 원천세 (매월 10일, 휴일인 경우 익영업일 반영) ---
  {
    id: "sched-wh-1",
    title: "1월분 원천세 신고 및 납부",
    category: "원천세",
    dueDate: "2026-02-10",
    description: "1월 지급 소득에 대한 원천징수세액 신고 및 납부",
    isOfficial: true,
    isImportant: false,
    reminderDays: 3,
    status: "upcoming",
    completed: false,
    notes: "홈택스 전자신고"
  },
  {
    id: "sched-wh-2",
    title: "2월분 원천세 신고 및 납부",
    category: "원천세",
    dueDate: "2026-03-10",
    description: "2월 지급 소득에 대한 원천징수세액 신고 및 납부",
    isOfficial: true,
    isImportant: false,
    reminderDays: 3,
    status: "upcoming",
    completed: false,
    notes: "홈택스 전자신고"
  },
  {
    id: "sched-wh-3",
    title: "3월분 원천세 신고 및 납부",
    category: "원천세",
    dueDate: "2026-04-10",
    description: "3월 지급 소득에 대한 원천징수세액 신고 및 납부",
    isOfficial: true,
    isImportant: false,
    reminderDays: 3,
    status: "upcoming",
    completed: false,
    notes: "홈택스 전자신고"
  },
  {
    id: "sched-wh-4",
    title: "4월분 원천세 신고 및 납부",
    category: "원천세",
    dueDate: "2026-05-11",
    description: "4월 지급 소득에 대한 원천징수세액 신고 및 납부 (5월 10일 일요일 -> 익영업일)",
    isOfficial: true,
    isImportant: false,
    reminderDays: 3,
    status: "upcoming",
    completed: false,
    notes: "홈택스 전자신고"
  },
  {
    id: "sched-wh-5",
    title: "5월분 원천세 신고 및 납부",
    category: "원천세",
    dueDate: "2026-06-10",
    description: "5월 지급 소득에 대한 원천징수세액 신고 및 납부",
    isOfficial: true,
    isImportant: false,
    reminderDays: 3,
    status: "upcoming",
    completed: false,
    notes: "홈택스 전자신고"
  },
  {
    id: "sched-wh-6",
    title: "6월분 원천세 신고 및 납부",
    category: "원천세",
    dueDate: "2026-07-10",
    description: "6월 지급 소득에 대한 원천징수세액 신고 및 납부",
    isOfficial: true,
    isImportant: false,
    reminderDays: 3,
    status: "upcoming",
    completed: false,
    notes: "홈택스 전자신고"
  },
  {
    id: "sched-wh-7",
    title: "7월분 원천세 신고 및 납부",
    category: "원천세",
    dueDate: "2026-08-10",
    description: "7월 지급 소득에 대한 원천징수세액 신고 및 납부",
    isOfficial: true,
    isImportant: false,
    reminderDays: 3,
    status: "upcoming",
    completed: false,
    notes: "홈택스 전자신고"
  },
  {
    id: "sched-wh-8",
    title: "8월분 원천세 신고 및 납부",
    category: "원천세",
    dueDate: "2026-09-10",
    description: "8월 지급 소득에 대한 원천징수세액 신고 및 납부",
    isOfficial: true,
    isImportant: false,
    reminderDays: 3,
    status: "upcoming",
    completed: false,
    notes: "홈택스 전자신고"
  },
  {
    id: "sched-wh-9",
    title: "9월분 원천세 신고 및 납부",
    category: "원천세",
    dueDate: "2026-10-12",
    description: "9월 지급 소득에 대한 원천징수세액 신고 및 납부 (10월 10일 토요일 -> 익영업일)",
    isOfficial: true,
    isImportant: false,
    reminderDays: 3,
    status: "upcoming",
    completed: false,
    notes: "홈택스 전자신고"
  },
  {
    id: "sched-wh-10",
    title: "10월분 원천세 신고 및 납부",
    category: "원천세",
    dueDate: "2026-11-10",
    description: "10월 지급 소득에 대한 원천징수세액 신고 및 납부",
    isOfficial: true,
    isImportant: false,
    reminderDays: 3,
    status: "upcoming",
    completed: false,
    notes: "홈택스 전자신고"
  },
  {
    id: "sched-wh-11",
    title: "11월분 원천세 신고 및 납부",
    category: "원천세",
    dueDate: "2026-12-10",
    description: "11월 지급 소득에 대한 원천징수세액 신고 및 납부",
    isOfficial: true,
    isImportant: false,
    reminderDays: 3,
    status: "upcoming",
    completed: false,
    notes: "홈택스 전자신고"
  },
  {
    id: "sched-wh-12",
    title: "12월분 원천세 신고 및 납부",
    category: "원천세",
    dueDate: "2027-01-11",
    description: "12월 지급 소득에 대한 원천징수세액 신고 및 납부 (1월 10일 일요일 -> 익영업일)",
    isOfficial: true,
    isImportant: false,
    reminderDays: 3,
    status: "upcoming",
    completed: false,
    notes: "홈택스 전자신고"
  },

  // --- 지방세 (특별징수분 - 원천세와 연동, 매월 10일) ---
  {
    id: "sched-loc-1",
    title: "1월분 지방소득세(특별징수) 납부",
    category: "지방세",
    dueDate: "2026-02-10",
    description: "원천징수 소득세의 지방소득세 특별징수분 납부",
    isOfficial: true,
    isImportant: false,
    reminderDays: 3,
    status: "upcoming",
    completed: false,
    notes: "위택스(Wetax) 납부"
  },
  {
    id: "sched-loc-2",
    title: "2월분 지방소득세(특별징수) 납부",
    category: "지방세",
    dueDate: "2026-03-10",
    description: "원천징수 소득세의 지방소득세 특별징수분 납부",
    isOfficial: true,
    isImportant: false,
    reminderDays: 3,
    status: "upcoming",
    completed: false,
    notes: "위택스(Wetax) 납부"
  },
  {
    id: "sched-loc-3",
    title: "3월분 지방소득세(특별징수) 납부",
    category: "지방세",
    dueDate: "2026-04-10",
    description: "원천징수 소득세의 지방소득세 특별징수분 납부",
    isOfficial: true,
    isImportant: false,
    reminderDays: 3,
    status: "upcoming",
    completed: false,
    notes: "위택스(Wetax) 납부"
  },
  {
    id: "sched-loc-4",
    title: "4월분 지방소득세(특별징수) 납부",
    category: "지방세",
    dueDate: "2026-05-11",
    description: "원천징수 소득세의 지방소득세 특별징수분 납부",
    isOfficial: true,
    isImportant: false,
    reminderDays: 3,
    status: "upcoming",
    completed: false,
    notes: "위택스(Wetax) 납부"
  },
  {
    id: "sched-loc-5",
    title: "5월분 지방소득세(특별징수) 납부",
    category: "지방세",
    dueDate: "2026-06-10",
    description: "원천징수 소득세의 지방소득세 특별징수분 납부",
    isOfficial: true,
    isImportant: false,
    reminderDays: 3,
    status: "upcoming",
    completed: false,
    notes: "위택스(Wetax) 납부"
  },
  {
    id: "sched-loc-6",
    title: "6월분 지방소득세(특별징수) 납부",
    category: "지방세",
    dueDate: "2026-07-10",
    description: "원천징수 소득세의 지방소득세 특별징수분 납부",
    isOfficial: true,
    isImportant: false,
    reminderDays: 3,
    status: "upcoming",
    completed: false,
    notes: "위택스(Wetax) 납부"
  },
  {
    id: "sched-loc-7",
    title: "7월분 지방소득세(특별징수) 납부",
    category: "지방세",
    dueDate: "2026-08-10",
    description: "원천징수 소득세의 지방소득세 특별징수분 납부",
    isOfficial: true,
    isImportant: false,
    reminderDays: 3,
    status: "upcoming",
    completed: false,
    notes: "위택스(Wetax) 납부"
  },
  {
    id: "sched-loc-8",
    title: "8월분 지방소득세(특별징수) 납부",
    category: "지방세",
    dueDate: "2026-09-10",
    description: "원천징수 소득세의 지방소득세 특별징수분 납부",
    isOfficial: true,
    isImportant: false,
    reminderDays: 3,
    status: "upcoming",
    completed: false,
    notes: "위택스(Wetax) 납부"
  },
  {
    id: "sched-loc-9",
    title: "9월분 지방소득세(특별징수) 납부",
    category: "지방세",
    dueDate: "2026-10-12",
    description: "원천징수 소득세의 지방소득세 특별징수분 납부",
    isOfficial: true,
    isImportant: false,
    reminderDays: 3,
    status: "upcoming",
    completed: false,
    notes: "위택스(Wetax) 납부"
  },
  {
    id: "sched-loc-10",
    title: "10월분 지방소득세(특별징수) 납부",
    category: "지방세",
    dueDate: "2026-11-10",
    description: "원천징수 소득세의 지방소득세 특별징수분 납부",
    isOfficial: true,
    isImportant: false,
    reminderDays: 3,
    status: "upcoming",
    completed: false,
    notes: "위택스(Wetax) 납부"
  },
  {
    id: "sched-loc-11",
    title: "11월분 지방소득세(특별징수) 납부",
    category: "지방세",
    dueDate: "2026-12-10",
    description: "원천징수 소득세의 지방소득세 특별징수분 납부",
    isOfficial: true,
    isImportant: false,
    reminderDays: 3,
    status: "upcoming",
    completed: false,
    notes: "위택스(Wetax) 납부"
  },
  {
    id: "sched-loc-12",
    title: "12월분 지방소득세(특별징수) 납부",
    category: "지방세",
    dueDate: "2027-01-11",
    description: "원천징수 소득세의 지방소득세 특별징수분 납부",
    isOfficial: true,
    isImportant: false,
    reminderDays: 3,
    status: "upcoming",
    completed: false,
    notes: "위택스(Wetax) 납부"
  },

  // --- 부가가치세 (LX MMA 월별 신고제: 매월 25일, 주말/휴일 익영업일 반영) ---
  {
    id: "sched-vat-1",
    title: "1월 부가가치세 월별 신고 및 납부",
    category: "부가가치세",
    dueDate: "2026-02-25",
    description: "1월분 부가가치세 신고 및 납부",
    isOfficial: true,
    isImportant: true,
    reminderDays: 3,
    status: "upcoming",
    completed: false,
    notes: "월별 부가가치세 신고 사업장"
  },
  {
    id: "sched-vat-2",
    title: "2월 부가가치세 월별 신고 및 납부",
    category: "부가가치세",
    dueDate: "2026-03-25",
    description: "2월분 부가가치세 신고 및 납부",
    isOfficial: true,
    isImportant: true,
    reminderDays: 3,
    status: "upcoming",
    completed: false,
    notes: "월별 부가가치세 신고 사업장"
  },
  {
    id: "sched-vat-3",
    title: "3월 부가가치세 월별 신고 및 납부",
    category: "부가가치세",
    dueDate: "2026-04-27",
    description: "3월분 부가가치세 신고 및 납부 (4월 25일 토요일 -> 익영업일)",
    isOfficial: true,
    isImportant: true,
    reminderDays: 3,
    status: "upcoming",
    completed: false,
    notes: "월별 부가가치세 신고 사업장"
  },
  {
    id: "sched-vat-4",
    title: "4월 부가가치세 월별 신고 및 납부",
    category: "부가가치세",
    dueDate: "2026-05-25",
    description: "4월분 부가가치세 신고 및 납부",
    isOfficial: true,
    isImportant: true,
    reminderDays: 3,
    status: "upcoming",
    completed: false,
    notes: "월별 부가가치세 신고 사업장"
  },
  {
    id: "sched-vat-5",
    title: "5월 부가가치세 월별 신고 및 납부",
    category: "부가가치세",
    dueDate: "2026-06-25",
    description: "5월분 부가가치세 신고 및 납부",
    isOfficial: true,
    isImportant: true,
    reminderDays: 3,
    status: "upcoming",
    completed: false,
    notes: "월별 부가가치세 신고 사업장"
  },
  {
    id: "sched-vat-6",
    title: "6월 부가가치세 월별 신고 및 납부",
    category: "부가가치세",
    dueDate: "2026-07-27",
    description: "6월분 부가가치세 신고 및 납부 (7월 25일 토요일 -> 익영업일)",
    isOfficial: true,
    isImportant: true,
    reminderDays: 3,
    status: "upcoming",
    completed: false,
    notes: "월별 부가가치세 신고 사업장"
  },
  {
    id: "sched-vat-7",
    title: "7월 부가가치세 월별 신고 및 납부",
    category: "부가가치세",
    dueDate: "2026-08-25",
    description: "7월분 부가가치세 신고 및 납부",
    isOfficial: true,
    isImportant: true,
    reminderDays: 3,
    status: "upcoming",
    completed: false,
    notes: "월별 부가가치세 신고 사업장"
  },
  {
    id: "sched-vat-8",
    title: "8월 부가가치세 월별 신고 및 납부",
    category: "부가가치세",
    dueDate: "2026-09-25",
    description: "8월분 부가가치세 신고 및 납부",
    isOfficial: true,
    isImportant: true,
    reminderDays: 3,
    status: "upcoming",
    completed: false,
    notes: "월별 부가가치세 신고 사업장"
  },
  {
    id: "sched-vat-9",
    title: "9월 부가가치세 월별 신고 및 납부",
    category: "부가가치세",
    dueDate: "2026-10-26",
    description: "9월분 부가가치세 신고 및 납부 (10월 25일 일요일 -> 익영업일)",
    isOfficial: true,
    isImportant: true,
    reminderDays: 3,
    status: "upcoming",
    completed: false,
    notes: "월별 부가가치세 신고 사업장"
  },
  {
    id: "sched-vat-10",
    title: "10월 부가가치세 월별 신고 및 납부",
    category: "부가가치세",
    dueDate: "2026-11-25",
    description: "10월분 부가가치세 신고 및 납부",
    isOfficial: true,
    isImportant: true,
    reminderDays: 3,
    status: "upcoming",
    completed: false,
    notes: "월별 부가가치세 신고 사업장"
  },
  {
    id: "sched-vat-11",
    title: "11월 부가가치세 월별 신고 및 납부",
    category: "부가가치세",
    dueDate: "2026-12-28",
    description: "11월분 부가가치세 신고 및 납부 (12월 25일 크리스마스 공휴일 -> 익영업일)",
    isOfficial: true,
    isImportant: true,
    reminderDays: 3,
    status: "upcoming",
    completed: false,
    notes: "월별 부가가치세 신고 사업장"
  },
  {
    id: "sched-vat-12",
    title: "12월 부가가치세 월별 신고 및 납부",
    category: "부가가치세",
    dueDate: "2027-01-25",
    description: "12월분 부가가치세 신고 및 납부",
    isOfficial: true,
    isImportant: true,
    reminderDays: 3,
    status: "upcoming",
    completed: false,
    notes: "월별 부가가치세 신고 사업장"
  }
];

// In-memory or file store for user schedules & custom edits
const dataFilePath = path.join(process.cwd(), "schedules_store.json");

function getStoredSchedules() {
  try {
    if (fs.existsSync(dataFilePath)) {
      const fileContent = fs.readFileSync(dataFilePath, "utf-8");
      return JSON.parse(fileContent);
    }
  } catch (e) {
    console.error("Error reading storage:", e);
  }
  return defaultSchedules;
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
