import {
  useEffect,
  useRef,
  useState,
  type Dispatch,
  type SetStateAction,
} from "react";
import ReactMarkdown from "react-markdown";
import { blobToBase64 } from "../utils/blob";
import { Box, Button } from "@mui/material";
import Mermaid from "../components/Mermaid";

type Props = {
  setPhase: Dispatch<SetStateAction<number>>;
  agenda: string;
  goal: string;
  limitTime: number;
  setMeetingContentAll: Dispatch<SetStateAction<string>>;
};

const Phase1: React.FC<Props> = ({ setPhase, limitTime, agenda, goal, setMeetingContentAll }) => {
  const meetingStartTime = useRef<Date>(new Date());
  const meetingEndTime = useRef<Date>(new Date());
  const [meetingTime, setMeetingTime] = useState<number>(0);
  const meetingTimeRef = useRef<number>(0);
  const startTime = useRef<Date>(new Date());
  const endTime = useRef<Date>(new Date());
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const audioChunks = useRef<any[]>([]);

  const [meetingContent, setMeetingContent] = useState<string[]>([]);
  const meetingContentRef = useRef<string[]>([]);
  const [actionItem, setActionItem] = useState("アクションアイテムが表示されます");
  const [tangent, setTangent] = useState("内容が脇道に逸れているか表示されます");
  const [dispute, setDispute] = useState("争いが起きていたら仲裁します");
  const [mermaidM, setMermaidM] = useState("");

  const onEndMeeting = () => {
    setPhase(2);
  };

  async function recordMedia() {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    // const audioContext = new AudioContext();
    // const analyser = audioContext.createAnalyser();
    // const source = audioContext.createMediaStreamSource(stream);
    // source.connect(analyser);
    const mediaRecorder = new MediaRecorder(stream);

    // analyser.fftSize = 32; // 周波数データの分解能を設定

    mediaRecorder.ondataavailable = (event) => {
      console.log(event.data);
      audioChunks.current = [...audioChunks.current, event.data];
    };

    mediaRecorder.onstop = async () => {
      const audioBlob = new Blob(audioChunks.current, { type: "audio/webm" });
      const audioBase64 = await blobToBase64(audioBlob);
      await new Promise((resolve) => setTimeout(resolve, 300));

      try {
        const response = await fetch(
          "https://meeting-llm-recording-1013324790992.asia-northeast1.run.app",
          {
            method: "POST",
            body: JSON.stringify({ audioBase64 }),
          }
        );
        const result = await response.text();
        audioChunks.current = [];
        setMeetingContent((prev) => [...prev, result]);
        setMeetingContentAll((prev) => prev + result);
        meetingContentRef.current = [...meetingContentRef.current, result];
      } catch (e) {
        console.error(e);
      }

      // 次の録音へ（会議が終わっていないなら）
      if (meetingTimeRef.current > 0) {
        setTimeout(() => {
          recordMedia();
        }, 0); // 次の録音を即開始
      }
    };

    mediaRecorder.start();
    setTimeout(() => {
      mediaRecorder.stop();
    }, 10000); // 10秒録音
  }

  async function fetchActionItem() {
    try {
        const response = await fetch("https://action-item-meeting-1013324790992.asia-northeast1.run.app", {
            method: "POST",
            body: JSON.stringify({
                agenda,
                goal,
                content: meetingContentRef.current.join("")
            })
        })
        const result = await (await response).text();
        setActionItem(result);
    } catch(e) {
        console.error(e);
    }
  }
  async function fetchTangent() {
    try {
        const response = await fetch("https://tangent-topic-meeting-1013324790992.asia-northeast1.run.app", {
            method: "POST",
            body: JSON.stringify({
                agenda,
                goal,
                content: meetingContentRef.current.join("")
            })
        })
        const result = await (await response).text();
        setTangent(result);
    } catch(e) {
        console.error(e);
    }
  }
  async function fetchDispute() {
    try {
        const response = await fetch("https://dispute-argument-meeting-1013324790992.asia-northeast1.run.app", {
            method: "POST",
            body: JSON.stringify({
                agenda,
                goal,
                content: meetingContentRef.current.join("")
            })
        })
        const result = await (await response).text();
        setDispute(result);
    } catch(e) {
        console.error(e);
    }
  }
  async function fetchMermaid() {
    try {
        const response = await fetch("https://visualize-mermaid-meeting-1013324790992.asia-northeast1.run.app", {
            method: "POST",
            body: JSON.stringify({
                agenda,
                goal,
                content: meetingContentRef.current.join("")
            })
        })
        const result = await (await response).text();
        setMermaidM(result.replace("```mermaid", "").replace("```", ""));
    } catch(e) {
        console.error(e);
    }
  }

  useEffect(() => {
    startTime.current = new Date();
    const endTimeTmp = new Date();
    endTimeTmp.setSeconds(startTime.current.getSeconds() + 30);
    endTime.current = endTimeTmp;
    recordMedia();
  }, []);

  useEffect(() => {
    const meetingEndTimeTmp = new Date();
    meetingEndTimeTmp.setSeconds(
      meetingStartTime.current.getSeconds() + limitTime
    );
    meetingEndTime.current = meetingEndTimeTmp;
    const id = setInterval(() => {
      const diffTime = meetingEndTime.current.getTime() - Date.now();
      setMeetingTime(Math.floor(diffTime / 1000));
      meetingTimeRef.current = Math.floor(diffTime / 1000);
      if (diffTime % 30 === 0) {
        fetchActionItem();
        fetchDispute();
        fetchTangent();
        fetchMermaid();
      }
      if (diffTime < 0) {
        setPhase(2);
      }
    }, 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        gap: "2vw",
      }}
    >
      <Box
        sx={{
          width: "39vw",
          flexBasis: "39vw",
          maxHeight: "calc(100vh - 100px)",
          overflow: "scroll"
        }}
      >
        <p>会議の内容</p>
        <p>残り：{meetingTime}秒</p>
        <Box sx={{
            maxHeight: "calc(100% - 150px)",
            backgroundColor: "#00000030"
        }}>
            <p>
            {meetingContent.length
                ? meetingContent.join("\n")
                : "会議をレコーディング中..."}
            </p>
            <hr />
        </Box>
        <Button onClick={onEndMeeting} color="error" variant="contained">
          会議を終了する
        </Button>
      </Box>
      <Box
        sx={{
          width: "39vw",
          flexBasis: "39vw",
          display: "flex",
          flexFlow: "column",
        }}
      >
        <Box
          sx={{
            height: "100px",
            overflow: "scroll",
            marginBottom: "20px",
            border: "1px solid black",
            padding: "10px",
          }}
        >
          <p>脇道脱線防止</p>
          <ReactMarkdown>{tangent}</ReactMarkdown>
        </Box>
        <Box
          sx={{
            height: "100px",
            overflow: "scroll",
            marginBottom: "20px",
            border: "1px solid black",
            padding: "10px",
          }}
        >
          <p>アクションアイテム通知</p>
          <ReactMarkdown>{actionItem}</ReactMarkdown>
        </Box>
        <Box
          sx={{
            height: "100px",
            overflow: "scroll",
            marginBottom: "20px",
            border: "1px solid black",
            padding: "10px",
          }}
        >
          <p>対立仲裁</p>
          <ReactMarkdown>{dispute}</ReactMarkdown>
        </Box>
        <Box
          sx={{
            height: "100px",
            overflow: "scroll",
            marginBottom: "20px",
            border: "1px solid black",
            padding: "10px",
          }}
        >
          <p>懐疑図示化</p>
          { mermaidM
          ? <Mermaid code={mermaidM}/>
          : <p>議論している内容をマーメイド図に図示します</p>
          }
        </Box>
      </Box>
    </Box>
  );
};

export default Phase1;
