import { Box, CircularProgress } from "@mui/material";
import { useEffect, useState, type Dispatch, type SetStateAction } from "react";
import ReactMarkdown from "react-markdown";

type Props = {
  setPhase: Dispatch<SetStateAction<number>>;
  agenda: string;
  goal: string;
  limitTime: number;
  meetingContentAll: string;
};

const Phase2: React.FC<Props> = ({
  agenda,
  goal,
  limitTime,
  meetingContentAll,
}) => {
  const [summarizeResult, setSummarizeResult] = useState<string>("");

  async function fetchSummarize() {
    try {
      const response = await fetch(
        "https://summarize-meeting-1013324790992.asia-northeast1.run.app",
        {
          method: "POST",
          body: JSON.stringify({
            agenda,
            goal,
            content: meetingContentAll,
          }),
        }
      );
      const result = await (await response).text();
      setSummarizeResult(result);
    } catch (e) {
      console.error(e);
    }
  }

  useEffect(() => {
    fetchSummarize();
  }, []);

  return (
    <Box sx={{overflow: "scroll", height: "calc(100vh - 200px)"}}>
      <p>上限時間{limitTime}秒の会議</p>
      <hr />
      {summarizeResult ? (
        <ReactMarkdown>{summarizeResult}</ReactMarkdown>
      ) : (
        <>
          <CircularProgress />
          <p>議事録生成中...</p>
        </>
      )}
    </Box>
  );
};

export default Phase2;
