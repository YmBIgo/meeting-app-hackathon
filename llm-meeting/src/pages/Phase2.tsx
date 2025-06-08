import {
  useEffect,
  useRef,
  useState,
  type Dispatch,
  type SetStateAction,
} from "react";
import ReactMarkdown from "react-markdown";
import { copy } from "clipboard";
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
} from "@mui/material";

import { blobToBase64 } from "../utils/blob";
import Mermaid from "../components/Mermaid";
import type { Dispute } from "../type/Dispute";
import type { Tangent } from "../type/Tangent";

type Props = {
  setPhase: Dispatch<SetStateAction<number>>;
  agenda: string;
  goal: string;
  limitTime: number;
  setMeetingContentAll: Dispatch<SetStateAction<string>>;
};

const Phase1: React.FC<Props> = ({
  setPhase,
  limitTime,
  agenda,
  goal,
  setMeetingContentAll,
}) => {
  const meetingStartTime = useRef<Date>(new Date());
  const meetingEndTime = useRef<Date>(new Date());
  const [meetingTime, setMeetingTime] = useState<number>(0);
  const meetingTimeRef = useRef<number>(0);
  const startTime = useRef<Date>(new Date());
  const endTime = useRef<Date>(new Date());
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const audioChunks = useRef<any[]>([]);

  const [dialogContent, setDialogContent] = useState<string>("");

  const [meetingContent, setMeetingContent] = useState<string[]>([]);
  const meetingContentRef = useRef<string[]>([]);
  const [actionItem, setActionItem] =
    useState("アクションアイテムが表示されます");
  // 内容が脇道に逸れているか表示されます
  const [tangent, setTangent] = useState<Tangent>({} as Tangent);
  // 争いが起きていたら仲裁します
  const [dispute, setDispute] = useState<Dispute>({} as Dispute);
  const [mermaidM, setMermaidM] = useState("");

  const onEndMeeting = () => {
    setPhase(3);
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
        setMeetingContent((prev) => [...prev, result].slice(-10));
        setMeetingContentAll((prev) => prev + result);
        meetingContentRef.current = [
          ...meetingContentRef.current,
          result,
        ].slice(-10);
      } catch (e) {
        console.error(e);
      }
    };

    mediaRecorder.start();
    setTimeout(() => {
      mediaRecorder.stop();
    }, 15000); // 15秒録音
  }

  function convertDispute(d: Dispute): string {
    return d.steps
      .map((eachD) => {
        return `### ${eachD.step}: ${eachD.title}  \n${eachD.action}`;
      })
      .join("    \n\n");
  }

  function openDialog(content: string) {
    setDialogContent(content);
  }

  async function fetchActionItem() {
    try {
      const response = await fetch(
        "https://action-item-meeting-1013324790992.asia-northeast1.run.app",
        {
          method: "POST",
          body: JSON.stringify({
            agenda,
            goal,
            content: meetingContentRef.current.join(""),
          }),
        }
      );
      const result = await response.text();
      setActionItem(result);
    } catch (e) {
      console.error(e);
    }
  }
  async function fetchTangent() {
    try {
      const response = await fetch(
        "https://tangent-topic-meeting-1013324790992.asia-northeast1.run.app",
        {
          method: "POST",
          body: JSON.stringify({
            agenda,
            goal,
            content: meetingContentRef.current.join(""),
          }),
        }
      );
      const result = await response.text();
      const tangentJSON = JSON.parse(
        result.replace("```json", "").replace("```", "")
      );
      setTangent(tangentJSON as Tangent);
    } catch (e) {
      console.error(e);
    }
  }
  async function fetchDispute() {
    try {
      const response = await fetch(
        "https://dispute-argument-meeting-1013324790992.asia-northeast1.run.app",
        {
          method: "POST",
          body: JSON.stringify({
            agenda,
            goal,
            content: meetingContentRef.current.join(""),
          }),
        }
      );
      const result = await response.text();
      const disputeJSON = JSON.parse(
        result.replace("```json", "").replace("```", "")
      );
      setDispute(disputeJSON as Dispute);
    } catch (e) {
      console.error(e);
    }
  }
  async function fetchMermaid() {
    try {
      const response = await fetch(
        "https://visualize-mermaid-meeting-1013324790992.asia-northeast1.run.app",
        {
          method: "POST",
          body: JSON.stringify({
            agenda,
            goal,
            content: meetingContentRef.current.join(""),
          }),
        }
      );
      const result = await response.text();
      setMermaidM(result.replace("```mermaid", "").replace("```", ""));
    } catch (e) {
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
      // 次の録音へ（会議が終わっていないなら）
      if (
        meetingTimeRef.current % 15 === 0 &&
        meetingContentRef.current.length
      ) {
        requestAnimationFrame(() => {
          recordMedia();
        }); // 次の録音を即開始
      }
      if (
        meetingTimeRef.current % 30 === 0 &&
        meetingContentRef.current.length
      ) {
        fetchActionItem();
        fetchDispute();
        fetchTangent();
        fetchMermaid();
      }
      if (meetingTimeRef.current < 0) {
        setPhase(3);
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
          overflow: "scroll",
        }}
      >
        <p>会議の内容</p>
        <p>残り：{meetingTime}秒</p>
        <Box
          sx={{
            maxHeight: "calc(100% - 150px)",
            backgroundColor: "#00000030",
          }}
        >
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
            border: "1px solid green",
            padding: "10px",
            borderColor:
                (tangent.confidence ?? 100) > 40
                ? "green"
                : (tangent.confidence ?? 100) > 20
                ? "orange"
                : "red",
            borderWidth: (tangent.confidence ?? 100) > 40 ? "2px" : "4px",
            borderRadius: "20px",
          }}
        >
          <p>
            脇道脱線防止{"　"}
            <Button
              color="primary"
              variant="contained"
              size="small"
              sx={{ display: (tangent.confidence ?? 0) > 40 ? "none" : "block" }}
              onClick={() => openDialog(tangent.content)}
            >
              指摘を見る
            </Button>
          </p>
          { !tangent.content
          ? <p>内容が脇道に逸れているか表示されます</p>
          : <ReactMarkdown>{tangent.content}</ReactMarkdown>
          }
        </Box>
        <Box
          sx={{
            height: "100px",
            overflow: "scroll",
            marginBottom: "20px",
            border: "1px solid green",
            padding: "10px",
            borderColor: !dispute.conflict_detected ? "green" : "red",
            borderWidth: !dispute.conflict_detected ? "2px" : "4px",
            borderRadius: "20px",
          }}
        >
          <p>
            対立仲裁{"　"}
            <Button
              color="primary"
              variant="contained"
              size="small"
              sx={{ display: dispute.conflict_detected ? "block" : "none" }}
              onClick={() => openDialog(convertDispute(dispute))}
            >
              指摘を見る
            </Button>
          </p>
          { !dispute.conflict_description
          ? <p>争いが起きていたら仲裁します</p>
          : <ReactMarkdown>{dispute.conflict_description}</ReactMarkdown>
          }
        </Box>
        <Box
          sx={{
            height: "100px",
            overflow: "scroll",
            marginBottom: "20px",
            border: "1px solid black",
            padding: "10px",
            borderRadius: "20px",
          }}
        >
          <p>
            アクションアイテム通知{"　"}
            <Button
              onClick={() => copy(actionItem)}
              color="primary"
              variant="contained"
              size="small"
            >
              コピーする
            </Button>
          </p>
          <ReactMarkdown>{actionItem}</ReactMarkdown>
        </Box>
        <Box
          sx={{
            height: "100px",
            overflow: "scroll",
            marginBottom: "20px",
            border: "1px solid black",
            padding: "10px",
            borderRadius: "20px",
          }}
        >
          <p>懐疑図示化</p>
          {mermaidM ? (
            <Mermaid code={mermaidM} />
          ) : (
            <p>議論している内容をマーメイド図に図示します</p>
          )}
        </Box>
      </Box>
      <Dialog open={!!dialogContent}>
        <DialogContent>
          <ReactMarkdown>{dialogContent}</ReactMarkdown>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setDialogContent("")}
            color="error"
            variant="outlined"
          >
            キャンセル
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Phase1;
