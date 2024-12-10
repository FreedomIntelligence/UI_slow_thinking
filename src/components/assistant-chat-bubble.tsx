import { FC, useState } from "react";
import { ChatBubbleContent } from "./chat-bubble-content";
import {
  ChatBubble,
  ChatBubbleAction,
  ChatBubbleAvatar,
  ChatBubbleMessage,
} from "./ui/chat/chat-bubble";
import { ChevronsUpDown, CopyIcon, RefreshCcw, Volume2 } from "lucide-react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Button } from "./ui/button";
import { parseThoughtMessage } from "@/lib/thought";

interface AssistantChatBubbleProps {
  isGenerating: boolean;
  message: string;
  index: number;
  onActionClick: (action: string, messageIndex: number) => void;
}

const ChatAiIcons = [
  {
    icon: CopyIcon,
    label: "Copy",
  },
  {
    icon: RefreshCcw,
    label: "Refresh",
  },
  {
    icon: Volume2,
    label: "Volume",
  },
];

export const AssistantChatBubble: FC<AssistantChatBubbleProps> = ({
  isGenerating,
  message,
  index,
  onActionClick: handleActionClick,
}) => {
  const [isOpen, setIsOpen] = useState(true);
  const { quote, body } = parseThoughtMessage(message);

  return (
    <ChatBubble variant="received" className="chat-bubble assistant-bubble">
      <ChatBubbleAvatar src="" fallback="🤖" />
      <ChatBubbleMessage className="pt-0">
        <Collapsible
          open={isOpen}
          onOpenChange={setIsOpen}
          className="w-full space-y-2 py-4"
        >
          <div className="flex items-center justify-between space-x-4 px-4 thought">
            <h4 className="text-sm font-semibold">模型内部深度思考</h4>
            <CollapsibleTrigger asChild>
              <Button variant="ghost" size="sm" className="w-9 p-0">
                <ChevronsUpDown className="h-4 w-4" />
                <span className="sr-only">Toggle</span>
              </Button>
            </CollapsibleTrigger>
          </div>

          <CollapsibleContent className="space-y-2">
            <ChatBubbleContent content={quote} />
          </CollapsibleContent>
        </Collapsible>

        <ChatBubbleContent content={body} />
        <div className="flex items-center mt-1.5 gap-1">
          {!isGenerating && (
            <>
              {ChatAiIcons.map((icon, iconIndex) => {
                const Icon = icon.icon;
                return (
                  <ChatBubbleAction
                    variant="outline"
                    className="size-5"
                    key={iconIndex}
                    icon={<Icon className="size-3" />}
                    onClick={() => handleActionClick(icon.label, index)}
                  />
                );
              })}
            </>
          )}
        </div>
      </ChatBubbleMessage>
    </ChatBubble>
  );
};
