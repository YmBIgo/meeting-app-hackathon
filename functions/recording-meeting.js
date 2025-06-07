const functions = require('@google-cloud/functions-framework');
const openAIEndpoint = "https://api.openai.com/v1/audio/transcriptions"

function base64ToBlob(base64, mimeType) {
  console.log(base64.slice(0, 100));
  const byteCharacters = atob(base64);
  const byteNumbers = new Array(byteCharacters.length).fill(0).map((_, i) => byteCharacters.charCodeAt(i));
  const byteArray = new Uint8Array(byteNumbers);
  return new Blob([byteArray], { type: mimeType });
}

functions.http('helloHttp', async(req, res) => {
  res.set('Access-Control-Allow-Origin', '*');
  try {
    const { audioBase64 } = JSON.parse(req.body);
    // OpenAI API の音声認識エンドポイント
    const formData = new FormData()
    const file = new File([base64ToBlob(audioBase64)], "input.webm", { type: "audio/webm" });
    formData.append("file", file);
    formData.append("model", "whisper-1")
    formData.append("language", "ja")
    formData.append('response_format', 'text');
    const transcriptionsResponse = await fetch(openAIEndpoint, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`
      },
      body: formData
    });
    // なぜか json 形式で帰ってこないので text で取得
    const transcriptionJson = await transcriptionsResponse.text();
    console.log(transcriptionJson);
    const transcription = transcriptionJson;
    res.send(transcription);
  } catch(e) {
    console.error(e);
    res.send(`{"status": "failed"}`)
  }
});
