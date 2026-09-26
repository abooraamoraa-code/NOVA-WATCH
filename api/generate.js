```javascript
export default async function handler(req, res) {
    if (req.method !== "POST") {
        return res.status(405).json({
            error: "Method not allowed"
        });
    }

    try {
        const { idea } = req.body || {};

        if (!idea || !idea.trim()) {
            return res.status(400).json({
                error: "اكتب فكرة التطبيق أولاً."
            });
        }

        const apiKey = process.env.GEMINI_API_KEY;

        if (!apiKey) {
            return res.status(500).json({
                error: "مفتاح Gemini غير مضبوط على الخادم."
            });
        }

        const prompt = `
أنت NOVA AI، مهندس برمجيات متخصص في بناء تطبيقات كاملة.

المستخدم أعطاك فكرة التطبيق التالية:

${idea}

قم بتحليل الفكرة وتحويلها إلى مخطط مشروع احترافي.

أعد النتيجة بصيغة JSON فقط، بالشكل التالي:

{
  "appName": "",
  "description": "",
  "category": "",
  "pages": [],
  "features": [],
  "technology": [],
  "database": [],
  "nextSteps": []
}

لا تكتب أي Markdown.
لا تضع أي نص خارج JSON.
`;

        const response = await fetch(
            "https://generativelanguage.googleapis.com/v1beta/models/gemini-3.8-flash:generateContent",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "x-goog-api-key": apiKey
                },
                body: JSON.stringify({
                    contents: [
                        {
                            parts: [
                                {
                                    text: prompt
                                }
                            ]
                        }
                    ],
                    generationConfig: {
                        responseMimeType: "application/json"
                    }
                })
            }
        );

        const data = await response.json();

        if (!response.ok) {
            return res.status(response.status).json({
                error: "فشل الاتصال بمحرك Gemini.",
                details: data
            });
        }

        const result =
            data?.candidates?.[0]?.content?.parts?.[0]?.text;

        if (!result) {
            return res.status(500).json({
                error: "لم يرجع Gemini نتيجة."
            });
        }

        return res.status(200).json({
            success: true,
            result: JSON.parse(result)
        });

    } catch (error) {

        return res.status(500).json({
            error: "حدث خطأ داخل NOVA AI.",
            message: error.message
        });
    }
}
```
