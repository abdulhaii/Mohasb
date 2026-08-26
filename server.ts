import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

// Body parser with 20MB limit for image receipt uploads
app.use(express.json({ limit: "20mb" }));
app.use(express.urlencoded({ extended: true, limit: "20mb" }));

// Lazy initialize Gemini client
function getGenAI() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY environment variable is missing.");
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build",
      },
    },
  });
}

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// 1. Multi-turn Chat Endpoint for Financial Advisor & Accountant
app.post("/api/gemini/chat", async (req, res) => {
  try {
    const {
      messages,
      systemInstruction,
      model = "gemini-3.5-flash",
      financialContext,
    } = req.body;

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: "Messages array is required." });
    }

    const ai = getGenAI();

    // Default or user-selected model
    // Allowed: gemini-3.1-flash-lite, gemini-3.5-flash, gemini-3.1-pro-preview
    const allowedModels = [
      "gemini-3.1-flash-lite",
      "gemini-3.5-flash",
      "gemini-3.1-pro-preview",
      "gemini-3.7-flash",
    ];
    const selectedModel = allowedModels.includes(model) ? model : "gemini-3.5-flash";

    let sysPrompt = `أنت "محاسب ومستشار مالي ذكي" محترف وخبير في المحاسبة الشخصية وإدارة المصاريف اليومية والميزانيات باللغة العربية.
مهمتك مساعدة المستخدم في:
- تسجيل وتحليل المصاريف والإيرادات بدقة ووضوح.
- تقديم نصائح فورية وعملية لترشيد الإنفاق وتوفير المال بدون حرمان.
- تقديم تحليلات حسابية دقيقة (النسب المئوية، متوسط الصرف اليومي، مقارنة المصاريف بالأهداف).
- الإجابة بأسلوب ودود، مشجع، منظم، واستخدام نقاط واضحة وأرقام سهلة الفهم.
- عند طلب المستخدم، يمكنك اقتراح توزيع ميزانيات وفق قاعدة 50/30/20 أو حسب أولوياته.`;

    if (financialContext) {
      sysPrompt += `\n\n[بيانات المستخدم المالية الحالية في التطبيق]:
- إجمالي المصاريف: ${financialContext.totalExpenses || 0} ${financialContext.currency || "ر.س"}
- إجمالي الدخل: ${financialContext.totalIncome || 0} ${financialContext.currency || "ر.س"}
- الرصيد الحالي الصافي: ${financialContext.netBalance || 0} ${financialContext.currency || "ر.س"}
- عدد المعاملات المسجلة: ${financialContext.transactionCount || 0}
- سقف الميزانية الشهري: ${financialContext.monthlyBudget || "غير محدد"} ${financialContext.currency || "ر.س"}
- تفصيل المصاريف حسب الفئات: ${JSON.stringify(financialContext.categoriesBreakdown || {})}
استند إلى هذه الأرقام عند الإجابة لتقديم تحليلات حقيقية مخصصة له بدقة!`;
    }

    if (systemInstruction) {
      sysPrompt += `\n\n[توجيه مخصص إضافي]: ${systemInstruction}`;
    }

    // Format contents for generateContent / chat
    // Convert client messages to Gemini contents structure
    const contents = messages.map((m: { role: string; content: string }) => ({
      role: m.role === "assistant" ? "model" : "user",
      parts: [{ text: m.content }],
    }));

    const response = await ai.models.generateContent({
      model: selectedModel,
      contents,
      config: {
        systemInstruction: sysPrompt,
        temperature: 0.7,
      },
    });

    const reply = response.text || "عذراً، لم أتمكن من تكوين إجابة في الوقت الحالي.";
    res.json({ reply, model: selectedModel });
  } catch (error: any) {
    console.error("Error in /api/gemini/chat:", error);
    res.status(500).json({
      error: error?.message || "حدث خطأ أثناء معالجة المحادثة مع المستشار المالي.",
    });
  }
});

// 2. Receipt / Invoice OCR & Smart Expense Extractor
app.post("/api/gemini/parse-receipt", async (req, res) => {
  try {
    const { imageBase64, mimeType = "image/jpeg", rawText } = req.body;

    const ai = getGenAI();

    const promptText = `قم بتحليل الفاتورة / الإيصال المرفق واستخرج بيانات المصروف بالتفصيل بتنسيق JSON حصراً بدون أي كود إضافي أو شرح.
الحقول المطلوبة:
{
  "merchant": "اسم المتجر أو الجهة (مثال: سوبرماركت الدانوب أو كافيه)",
  "amount": 0.0, (المبلغ الإجمالي النهائي كـ رقم)
  "date": "YYYY-MM-DD" (تاريخ الفاتورة إذا وجد، وإلا تاريخ اليوم),
  "time": "HH:MM" (الوقت إن وجد، وإلا فارغ),
  "category": "إحدى هذه الفئات: طعام ومشتريات | سكن وفواتير | مواصلات ووقود | تسوق وملابس | صحة وعلاج | ترفيه ومطاعم | تعليم | أخرى",
  "paymentMethod": "نقد | بطاقة بنكية | أبل باي | تحويل بنكي",
  "items": [
    {"name": "اسم الصنف", "price": 0.0, "quantity": 1}
  ],
  "taxAmount": 0.0,
  "notes": "ملاحظات مختصرة أو ملخص المشتريات"
}`;

    const parts: any[] = [];

    if (imageBase64) {
      // Remove data url prefix if present
      const cleanBase64 = imageBase64.replace(/^data:image\/[a-z]+;base64,/, "");
      parts.push({
        inlineData: {
          mimeType,
          data: cleanBase64,
        },
      });
    }

    if (rawText) {
      parts.push({
        text: `نص الفاتورة المطلوب تحليله:\n${rawText}`,
      });
    }

    parts.push({ text: promptText });

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: { parts },
      config: {
        responseMimeType: "application/json",
      },
    });

    const parsedJson = JSON.parse(response.text || "{}");
    res.json({ success: true, data: parsedJson });
  } catch (error: any) {
    console.error("Error in /api/gemini/parse-receipt:", error);
    res.status(500).json({
      error: error?.message || "حدث خطأ أثناء فحص وقراءة الفاتورة.",
    });
  }
});

// 3. High-Quality Image Generation (gemini-3-pro-image-preview with 1K, 2K, 4K affordance)
app.post("/api/gemini/generate-image", async (req, res) => {
  try {
    const {
      prompt,
      imageSize = "1K", // "1K" | "2K" | "4K"
      aspectRatio = "1:1", // "1:1" | "16:9" | "4:3" | "3:4"
    } = req.body;

    if (!prompt) {
      return res.status(400).json({ error: "Prompt is required." });
    }

    const ai = getGenAI();

    // The feature explicitly requires model: gemini-3-pro-image-preview
    // with affordance for 1K, 2K, 4K
    const validSizes = ["1K", "2K", "4K"];
    const selectedSize = validSizes.includes(imageSize) ? imageSize : "1K";

    const validAspectRatios = ["1:1", "16:9", "4:3", "3:4", "9:16"];
    const selectedRatio = validAspectRatios.includes(aspectRatio)
      ? aspectRatio
      : "1:1";

    let imageUrl = "";

    try {
      const response = await ai.models.generateContent({
        model: "gemini-3-pro-image-preview",
        contents: {
          parts: [{ text: prompt }],
        },
        config: {
          imageConfig: {
            aspectRatio: selectedRatio,
            imageSize: selectedSize,
          },
        },
      });

      if (response.candidates?.[0]?.content?.parts) {
        for (const part of response.candidates[0].content.parts) {
          if (part.inlineData && part.inlineData.data) {
            imageUrl = `data:${part.inlineData.mimeType || "image/png"};base64,${part.inlineData.data}`;
            break;
          }
        }
      }
    } catch (primaryErr: any) {
      console.warn("Primary image model attempt error:", primaryErr?.message);
      // Fallback to gemini-3.1-flash-image if pro-image is unavailable
      const fallbackResponse = await ai.models.generateContent({
        model: "gemini-3.1-flash-image",
        contents: {
          parts: [{ text: prompt }],
        },
        config: {
          imageConfig: {
            aspectRatio: selectedRatio,
            imageSize: selectedSize,
          },
        },
      });

      if (fallbackResponse.candidates?.[0]?.content?.parts) {
        for (const part of fallbackResponse.candidates[0].content.parts) {
          if (part.inlineData && part.inlineData.data) {
            imageUrl = `data:${part.inlineData.mimeType || "image/png"};base64,${part.inlineData.data}`;
            break;
          }
        }
      }
    }

    if (!imageUrl) {
      return res.status(500).json({ error: "لم يتم استلام صورة من النموذج." });
    }

    res.json({
      imageUrl,
      model: "gemini-3-pro-image-preview",
      imageSize: selectedSize,
      aspectRatio: selectedRatio,
    });
  } catch (error: any) {
    console.error("Error in /api/gemini/generate-image:", error);
    res.status(500).json({
      error: error?.message || "حدث خطأ أثناء توليد الصورة المالية.",
    });
  }
});

// Vite middleware setup
async function start() {
  if (process.env.NODE_ENV !== "production") {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Smart Expense Accounting Server running on http://0.0.0.0:${PORT}`);
  });
}

start();
