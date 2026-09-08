import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import fs from "fs";
import { GoogleGenAI } from "@google/genai";

const app = express();
const PORT = 3000;

app.use(express.json());

// Initialize Gemini client if API key exists
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || "",
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    }
  }
});

// Default official tax schedules for Korean corporations / businesses (2026)
const defaultSchedules = [
  {
    id: "sched-1",
    title: "1월 원천세 신고 및 납부",
    category: "원천세",
    dueDate: "2026-02-10",
    description: "전년도 12월분 소상공인/근로소득 원천징수세액 신고 및 납부",
    isOfficial: true,
    isImportant: true,
    reminderDays: 3,
    status: "upcoming",
    completed: false,
    notes: "국세청 홈택스 전자신고 필수"
  },
  {
    id: "sched-2",
    title: "법인세 확정 신고 및 납부 (12월 결산법인)",
    category: "법인세",
    dueDate: "2026-03-31",
    description: "전기분 법인세 신고 및 납부 (재무제표, 세무조정계산서 제출)",
    isOfficial: true,
    isImportant: true,
    reminderDays: 7,
    status: "upcoming",
    completed: false,
    notes: "회계법인 감사보고서 첨부 확인 필요"
  },
  {
    id: "sched-3",
    title: "4대사회보험 보수총액 통보 및 신고",
    category: "4대보험",
    dueDate: "2026-03-10",
    description: "전년도 보수총액 기준 고용/산재보험 정산 및 건강보험 연말정산",
    isOfficial: true,
    isImportant: false,
    reminderDays: 5,
    status: "upcoming",
    completed: false,
    notes: "국민건강보험공단 / 고용산재토탈서비스 신고"
  },
  {
    id: "sched-4",
    title: "1분기(1기) 부가가치세 예정신고 및 납부",
    category: "부가가치세",
    dueDate: "2026-04-25",
    description: "1월 1일 ~ 3월 31일 기간에 대한 부가가치세 예정신고 (법인사업자 필수)",
    isOfficial: true,
    isImportant: true,
    reminderDays: 3,
    status: "upcoming",
    completed: false,
    notes: "예정고지 대상자는 고지서 납부"
  },
  {
    id: "sched-5",
    title: "종합소득세 확정 신고 및 납부",
    category: "소득세",
    dueDate: "2026-05-31",
    description: "개인사업자 및 프리랜서 등 종합소득세 확정신고",
    isOfficial: true,
    isImportant: true,
    reminderDays: 7,
    status: "upcoming",
    completed: false,
    notes: "성실신고확인대상자는 6월 30일까지"
  },
  {
    id: "sched-6",
    title: "1기 부가가치세 확정신고 및 납부",
    category: "부가가치세",
    dueDate: "2026-07-25",
    description: "1기(1월 1일 ~ 6월 30일) 확정 부가가치세 신고 및 납부",
    isOfficial: true,
    isImportant: true,
    reminderDays: 5,
    status: "upcoming",
    completed: false,
    notes: "신용카드발행세액공제 등 세무 대리인 검토"
  },
  {
    id: "sched-7",
    title: "법인세 중간예납 신고 및 납부",
    category: "법인세",
    dueDate: "2026-08-31",
    description: "상반기(1월 1일 ~ 6월 30일) 실적에 대한 법인세 중간예납",
    isOfficial: true,
    isImportant: true,
    reminderDays: 5,
    status: "upcoming",
    completed: false,
    notes: "직전 사업년도 산출세액 기준 또는 가결산 선택"
  },
  {
    id: "sched-8",
    title: "2분기(2기) 부가가치세 예정신고 및 납부",
    category: "부가가치세",
    dueDate: "2026-10-25",
    description: "7월 1일 ~ 9월 30일 기간에 대한 부가가치세 예정신고",
    isOfficial: true,
    isImportant: false,
    reminderDays: 3,
    status: "upcoming",
    completed: false,
    notes: "법인사업자 예정신고 대상"
  },
  {
    id: "sched-9",
    title: "2기 부가가치세 확정신고 및 납부",
    category: "부가가치세",
    dueDate: "2027-01-25",
    description: "2기(7월 1일 ~ 12월 31일) 확정 부가가치세 신고 및 납부",
    isOfficial: true,
    isImportant: true,
    reminderDays: 5,
    status: "upcoming",
    completed: false,
    notes: "연말 세무마감과 연계하여 철저한 자료 준비"
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

// AI Tax Assistant endpoint using Gemini
app.post("/api/ai-tax-assistant", async (req, res) => {
  try {
    const { prompt, schedulesContext } = req.body;
    if (!process.env.GEMINI_API_KEY) {
      return res.status(400).json({ 
        success: false, 
        error: "GEMINI_API_KEY가 설정되지 않았습니다. Settings > Secrets에서 API Key를 설정해주세요." 
      });
    }

    const systemInstruction = `당신은 대한민국 기업 세무 및 회계 전문가이자 사내 세무일정 관리 어시스턴트입니다. 
국세청 홈택스 기준 법인세, 부가가치세, 원천세, 종합소득세 및 4대보험 신고/납부 일정에 대해 정확하고 친절하게 답변해주세요.
사용자의 질문과 현재 등록된 세무 일정 데이터를 참고하여 유용한 세무 조언, 준비 서류, 주의사항을 안내해주세요.
답변은 명확하고 간결한 한국어로 작성하세요.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.8-flash",
      contents: `사용자 질문: ${prompt}\n\n참고 세무 일정 목록: ${JSON.stringify(schedulesContext || [])}`,
      config: {
        systemInstruction,
        temperature: 0.3,
        tools: [{ googleSearch: {} }],
      }
    });

    res.json({ success: true, answer: response.text });
  } catch (e: any) {
    console.error("Gemini AI Error:", e);
    res.status(500).json({ success: false, error: e.message || "AI 응답 생성 중 오류가 발생했습니다." });
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
