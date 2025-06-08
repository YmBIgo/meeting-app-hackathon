import Box from "@mui/material/Box"
import { useState } from "react"
import Phase0 from "./pages/Phase0";
import Phase1 from "./pages/Phase1";
import Phase2 from "./pages/Phase2";
import Phase3 from "./pages/Phase3";

function App() {
  const [phase, setPhase] = useState<number>(0);
  const [agenda, setAgenda] = useState<string>("");
  const [goal, setGoal] = useState<string>("");
  const [limitTime, setLimitTime] = useState<number>(1800);
  const [meetingContentAll, setMeetingContentAll] = useState<string>("");
  return (
    <Box sx={{
      width: "100vw",
      height: "100vh",
      backgroundColor: "rgba(36, 99, 235, 0.05)",
      padding: "30px 0"
    }}>
      <Box sx={{
        width: "80vw",
        margin: "0px 10vw",
        padding: "30px 20px 50px",
        height: "auto",
        backgroundColor: "white",
        borderRadius: "20px"
      }}>
        {
        phase === 0
        ?
        <Phase0
          setPhase={setPhase}
          agenda={agenda}
          goal={goal}
          limitTime={limitTime}
          setAgenda={setAgenda}
          setGoal={setGoal}
          setLimitTime={setLimitTime}
        />
        : phase === 1
        ?
        <Phase1
          setPhase={setPhase}
        />
        : phase === 2
        ?
        <Phase2
          setPhase={setPhase}
          agenda={agenda}
          goal={goal}
          limitTime={limitTime}
          setMeetingContentAll={setMeetingContentAll}
        />
        : phase === 3
        ?
        <Phase3
          setPhase={setPhase}
          agenda={agenda}
          goal={goal}
          limitTime={limitTime}
          meetingContentAll={meetingContentAll}
        />
        : <p>unknown phase...</p>
        }
      </Box>
    </Box>
  )
}

export default App
