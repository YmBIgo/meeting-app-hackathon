const functions = require("@google-cloud/functions-framework");
const openAIEndpoint = "https://api.openai.com/v1/chat/completions";

function getPrompt(agenda, goal, content) {
  const prompt = `以下の会議の内容を見て、会議の内容がアジェンダ・ゴールに対して脇道に逸れていないか答えて。
脇道に逸れていたら、脇道に逸れないような問いを考えて
confidenceは、0〜100で答えて

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
  "confidence": 0,
  "content": "### 判定\n\n会議のアジェンダ・ゴール「森岡毅のマーケティングの議論」と、会議の内容を照らし合わせると――\n\n#### 内容について\n- 「議論を数歩前に進めたことに意味がある」と述べられているが、森岡毅のどのマーケティング手法・理論について述べているかが具体的に不明です。\n- 「世界初かどうかわからない」「数学的証明式に落とした事例は知らない」という発言が繰り返され、抽象的で何を議論しているのかが見えにくい状態です。\n\n#### ゴールとの整合性\n- 森岡毅のマーケティングそのものに言及しているものの、「マーケティングの議論」とするには抽象的すぎて、中身が見えません。\n- 現状では**話題が大枠では一致しているが、具体的なマーケティング理論や事例に踏み込めておらず、意味のある議論になっていない**可能性があります。\n- 会議の目的に対し、議論が浅く、問題の本質や具体的内容に触れていないため、実質的には「脇道に逸れている」状態に近いです。\n\n---\n\n### 改善に向けた問い\n\n議論をアジェンダ・ゴールに沿わせ、「森岡毅のマーケティング」というテーマを深掘りするためには、以下のような問いを投げかけると良いでしょう。\n\n#### 具体化・主題への集中を促す問い\n- 森岡毅さんが提唱した具体的なマーケティング理論や手法について、どのような点が革新的だと思いますか？\n- 他のマーケターと比べて、森岡毅さん独自のアプローチにはどのような強みや特徴がありますか？\n- 実際の企業で森岡毅さんのマーケティング理論がどのように応用され、どんな成果がありましたか？\n- 数学的証明式に落としたという点について、それがどのようにマーケティングの実務や戦略に影響を与えたのか詳しく説明してもらえますか？\n- 今後森岡毅さんのマーケティングが発展・応用されると、業界にはどんなインパクトがあると考えられるでしょうか？\n\n### 一言アドバイス\n\n発言に「具体的な内容」「事例」「意味合い」「他理論・他者との比較」などを求めると、議論がよりアジェンダ・ゴールに沿いやすくなります。"
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
