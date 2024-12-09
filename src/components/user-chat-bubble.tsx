import { ChatBubbleContent } from "./chat-bubble-content";
import { ChatBubble, ChatBubbleMessage } from "./ui/chat/chat-bubble";

interface UserChatBubbleProps {
    message: string;
}

export const UserChatBubble: React.FC<UserChatBubbleProps> = ({ message }) => {
    return (
        <ChatBubble variant="sent" className="chat-bubble user-bubble">
            <ChatBubbleMessage>
                <ChatBubbleContent content={message} />
            </ChatBubbleMessage>
        </ChatBubble>
    );
};