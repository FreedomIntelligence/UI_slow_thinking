import Markdown from "react-markdown";
import CodeDisplayBlock from "./code-display-block";
import remarkGfm from "remark-gfm";
import "github-markdown-css";

interface ChatContent {
  content: string;
}

export const ChatBubbleContent: React.FC<ChatContent> = ({ content }) => {
  const parts = content.split("```");

  return parts.map((part: string, index: number) => {
    if (index % 2 === 0) {
      return (
        <div
          key={index}
          className="markdown-body"
          style={{ backgroundColor: "transparent", color: "black" }}
        >
          <Markdown remarkPlugins={[remarkGfm]}>{part}</Markdown>
        </div>
      );
    } else {
      return (
        <pre className="whitespace-pre-wrap pt-2" key={index}>
          <CodeDisplayBlock code={part} lang="" />
        </pre>
      );
    }
  });
};
