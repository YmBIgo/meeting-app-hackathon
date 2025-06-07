const functions = require("@google-cloud/functions-framework");
const openAIEndpoint = "https://api.openai.com/v1/chat/completions";

function getPrompt(agenda, goal, content) {
  const prompt = `以下の会議の内容を見て、議事録を作って。

\`\`\`アジェンダ
${agenda}
\`\`\`

\`\`\`会議のゴール
${goal}
\`\`\`

\`\`\`会議の内容
${content}
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
