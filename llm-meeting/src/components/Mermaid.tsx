import mermaid from "mermaid";
import {copy} from "clipboard";
import React from "react";
import { Button } from "@mui/material";

type Props = {
  code: string;
};

const Mermaid: React.FC<Props> = (props) => {
  const { code } = props;
  const outputRef = React.useRef<HTMLDivElement>(null);
  const id = React.useId();

  const render = React.useCallback(async () => {
    if (outputRef.current && code) {
      try {
        // ① 一意な ID を指定する必要あり
        const { svg } = await mermaid.render(id, code);
        outputRef.current.innerHTML = svg;
      } catch (error) {
        console.error(error);
        outputRef.current.innerHTML = "Invalid syntax";
      }
    }
  }, [code]);

  const copyToClipboard = async () => {
    copy(code)
  };

  React.useEffect(() => {
    render();
  }, [render]);

  return code ? (
    <div style={{ backgroundColor: "#00000050" }}>
      <div ref={outputRef} />
      <Button
        color="primary"
        variant="contained"
        onClick={copyToClipboard}
      >
        Copy Mermaid Content
      </Button>
    </div>
  ) : null;
};

export default Mermaid;