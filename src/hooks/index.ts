/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useCallback, useRef, useEffect } from "react";

interface ChatMessage {
  id: string;
  content: string;
  role: "user" | "assistant";
}

interface UseChatReturn {
  messages: ChatMessage[];
  input: string;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  isLoading: boolean;
  reload: () => void;
}

const DIFY_API_KEY = "app-pN6TeCNsZabPo777JT1ANpfJ";
const DIFY_API_URL = "http://61.241.103.33:1880/v1/chat-messages";

export function useChat({
  onResponse,
  onError,
}: {
  onResponse?: (response: any) => void;
  onError?: (error: any) => void;
} = {}): UseChatReturn {
  const conversationId = useRef<string>();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const abortControllerRef = useRef<AbortController | null>(null);

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setInput(e.target.value);
    },
    []
  );

  const handleSubmit = useCallback(
    async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      if (!input.trim()) return;

      const userMessage: ChatMessage = {
        id: Date.now().toString(),
        content: input.trim(),
        role: "user",
      };

      setMessages((prevMessages) => [...prevMessages, userMessage]);
      setInput("");
      setIsLoading(true);

      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        content: "",
        role: "assistant",
      };
      setMessages((prevMessages) => [...prevMessages, assistantMessage]);

      abortControllerRef.current = new AbortController();

      try {
        const response = await fetch(DIFY_API_URL, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${DIFY_API_KEY}`,
          },
          body: JSON.stringify({
            inputs: {},
            query: input.trim(),
            response_mode: "streaming",
            conversation_id: conversationId.current,
            user: "user",
          }),
          signal: abortControllerRef.current.signal,
        });

        if (!response.ok) {
          throw new Error("API request failed");
        }

        const reader = response.body?.getReader();
        if (!reader) {
          throw new Error("Failed to get response reader");
        }

        const decoder = new TextDecoder();
        let accumulatedContent = "";
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value);
          const lines = chunk.split("\n").filter((line) => line.trim() !== "");

          for (const line of lines) {
            if (line.includes("workflow_finished")) {
              onResponse?.({});
            }

            if (line.startsWith("data:")) {
              try {
                const data = JSON.parse(line.slice(5));
                if (data.event === "workflow_started") {
                  if (!conversationId.current) {
                    conversationId.current = data.conversation_id;
                  }
                } else if (data.event === "message") {
                  accumulatedContent += data.answer;
                  setMessages((prevMessages) => {
                    const updatedMessages = [...prevMessages];
                    const lastMessage =
                      updatedMessages[updatedMessages.length - 1];
                    lastMessage.content = accumulatedContent;
                    return updatedMessages;
                  });
                  if (onResponse) {
                    onResponse(data);
                  }
                }
              } catch {
                // console.error("Failed to parse JSON.");
              }
            }
          }
        }
      } catch (error) {
        if ((error as Error).name === "AbortError") {
          console.log("Request was aborted");
        } else {
          console.error("Error in API call:", error);
          setMessages((prevMessages) => {
            const updatedMessages = [...prevMessages];
            const lastMessage = updatedMessages[updatedMessages.length - 1];
            lastMessage.content =
              "Error: Failed to get response from the server.";
            return updatedMessages;
          });
          if (onError) {
            onError(error);
          }
        }
      } finally {
        setIsLoading(false);
      }
    },
    [input, onResponse, onError]
  );

  const reload = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    setMessages([]);
    setInput("");
    setIsLoading(false);
  }, []);

  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  return {
    messages,
    input,
    handleInputChange,
    handleSubmit,
    isLoading,
    reload,
  };
}
