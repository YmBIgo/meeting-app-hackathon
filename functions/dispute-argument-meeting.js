const functions = require("@google-cloud/functions-framework");
const openAIEndpoint = "https://api.openai.com/v1/chat/completions";

function getPrompt(agenda, goal, content) {
  const prompt = `以下の会議の内容を見て、争いが起きていないかを答えて。
また争いが起きていたら、仲裁する手順をJSON形式で教えて。

<入力>
\`\`\`アジェンダ
${agenda}
\`\`\`

\`\`\`会議のゴール
${goal}
\`\`\`

\`\`\`会議の内容
${content}
\`\`\`

<出力>
\`\`\`json
{
  "conflict_detected": false,
  "conflict_description": "明確な争い（意見の対立、対立的な発言、批判、感情的な衝突等）は見受けられません。発言は中立的かつ穏やかで、意見の対立や反論は確認されません。",
  "steps": [
    {
      "step": 1,
      "title": "冷静に現状を把握する",
      "action": "意見の対立内容と当事者の主張を客観的に整理する"
    },
    {
      "step": 2,
      "title": "当事者に意図・背景を確認する",
      "action": "発言の背景や真意を聞き出す（例：「○○さんの意図は？」）"
    },
    {
      "step": 3,
      "title": "相互理解の促進",
      "action": "誤解を確認し、共通点や目的を見つけて橋渡しを行う"
    },
    {
      "step": 4,
      "title": "論点の明確化と整理",
      "action": "議論の本質や論点をリストアップして明確にする"
    },
    {
      "step": 5,
      "title": "ファクトや目的に立ち返る",
      "action": "感情から離れ、事実や会議のゴールを軸に議論を戻す"
    },
    {
      "step": 6,
      "title": "解決案を一緒に考える",
      "action": "当事者同士で妥協点や合意点を検討する"
    },
    {
      "step": 7,
      "title": "時間を置いて冷静になる（必要時）",
      "action": "一時休憩や別途話し合いの場を設けてクールダウンを図る"
    }
  ]
}
\`\`\`
`;
  return prompt
}

functions.http("helloHttp", async (req, res) => {
  res.set("Access-Control-Allow-Origin", "*")
  try {
    const { agenda, goal, content } = JSON.parse(req.body)
    const completionTextResponse = await fetch(openAIEndpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-4.1",
        messages: [
          { role: "system", content: "あなたは会議の進行に詳しいAIです。" },
          { role: "user", content: getPrompt(agenda, goal, content) },
        ],
      })
    })
    const completionTextJSON = await completionTextResponse.json()
    res.send(completionTextJSON.choices[0].message.content)
  } catch (e) {
    console.error(e);
    res.send(`{"status": "failed"}`);
  }
});
