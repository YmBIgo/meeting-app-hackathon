const functions = require("@google-cloud/functions-framework");
const anniversaryJSON = require("./year_anniversary.json");
const openAIEndpoint = "https://api.openai.com/v1/chat/completions";

function getPrompt(date, anniversary) {
  const prompt = `以下の日時・記念日を見て、いい感じのアイスブレイクを返して。
\`\`\`日時
${date}
\`\`\`

\`\`\`記念日
${anniversary}
\`\`\`
`;
  return prompt;
}

functions.http("helloHttp", async (req, res) => {
  res.set("Access-Control-Allow-Origin", "*");
  try {
    const {month, date} = JSON.parse(req.body);
    const today = `${month}/${date}`;
    const monthIndex = month - 1;
    const todayAnniversaries = anniversaryJSON[monthIndex][today];
    const randomAnniversaryIndex = Math.floor(Math.random() * todayAnniversaries.length);
    const selectedAnniversary = todayAnniversaries[randomAnniversaryIndex];
    const completionTextResponse = await fetch(openAIEndpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-4.1",
        messages: [
          { role: "system", content: "あなたはアイスブレイクの達人です。" },
          { role: "user", content: getPrompt(today, selectedAnniversary) },
        ],
      })
    });
    const completionTextJSON = await completionTextResponse.json();
    res.send(completionTextJSON.choices[0].message.content);
  } catch (e) {
    console.error(e);
    res.send(`{"status": "failed"}`);
  }
});
