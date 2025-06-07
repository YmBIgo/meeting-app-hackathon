import { Box, Button, TextareaAutosize, TextField } from "@mui/material";
import type { Dispatch, SetStateAction } from "react";
import { styled } from '@mui/system';

const CustomTextarea = styled(TextareaAutosize)(
  () => ({
    width: '100%',
    fontSize: '16px',
    fontFamily: 'inherit',
    padding: '12px',
    borderRadius: '8px',
    border: '1px solid #ccc',
    boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
    transition: 'border-color 0.2s, box-shadow 0.2s',
    resize: 'vertical',
    '&:focus': {
      outline: 'none',
      borderColor: '#1976d2',
      boxShadow: '0 0 0 3px rgba(25, 118, 210, 0.2)',
    },
    '&::placeholder': {
      color: '#aaa',
    },
  })
);

type Props = {
    setPhase: Dispatch<SetStateAction<number>>;
    agenda: string;
    setAgenda: Dispatch<SetStateAction<string>>;
    goal: string;
    setGoal: Dispatch<SetStateAction<string>>;
    limitTime: number;
    setLimitTime: Dispatch<SetStateAction<number>>;
}

const Phase0: React.FC<Props> = ({
    setPhase,
    agenda,
    goal,
    limitTime,
    setAgenda,
    setGoal,
    setLimitTime
}) => {

    const onSubmit = () => {
        if (!agenda || !goal || !limitTime) return
        setPhase(1);
    }

    return (
        <Box>
            <h3>会議を開始する</h3>
            <p>ゴールを入力してください</p>
            <TextField
                value={goal}
                onChange={(e) => {
                    setGoal(e.target.value);
                }}
                sx={{
                    width: "50vw",
                    margin: "15px"
                }}
            />
            <br/>
            <p>アジェンダを入力してください</p>
            <CustomTextarea
                style={{
                    width: "60vw",
                    margin: "15px"
                }}
                value={agenda}
                onChange={(e) => {
                    setAgenda(e.target.value);
                }}
            />
            <br/>
            <p>会議の時間を入力してください</p>
            <TextField
                type="number"
                value={limitTime}
                onChange={(e) => {
                    const value = parseInt(e.target.value)
                    if (isNaN(value)) return;
                    setLimitTime(value);
                }}
                sx={{
                    width: "50vw",
                    margin: "15px"
                }}
            />
            <br/>
            <br/>
            <Button
                color="primary"
                variant="contained"
                onClick={onSubmit}
                sx={{
                    padding: "10px 15px"
                }}
            >
                会議に進む（自動的にレコードが開始します）
            </Button>
        </Box>
    )
}

export default Phase0;