"use client";

import {
  ChatBubble,
  ChatBubbleAvatar,
  ChatBubbleMessage,
} from "@/components/ui/chat/chat-bubble";
import { ChatInput } from "@/components/ui/chat/chat-input";
import { ChatMessageList } from "@/components/ui/chat/chat-message-list";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { CornerDownLeft, Mic } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useChat } from "ai/react";
import { AssistantChatBubble } from "@/components/assistant-chat-bubble";
import { UserChatBubble } from "@/components/user-chat-bubble";
import Image from "next/image";

export default function Home() {
  const [selectedChat, setSelectedChat] = useState<string | null>(null);
  const [chats, setChats] = useState<
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    { id: string; title: string }[]
  >([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const {
    messages,
    setMessages,
    input,
    handleInputChange,
    handleSubmit,
    isLoading,
    reload,
  } = useChat({
    onResponse(response) {
      if (response) {
        setIsGenerating(false);
      }
    },
    onError(error) {
      if (error) {
        setIsGenerating(false);
      }
    },
  });

  function loadMessages(id: string) {
    const storedMessages = localStorage.getItem(`chat:${id}:messages`);
    if (storedMessages) {
      setMessages(JSON.parse(storedMessages));
    } else {
      setMessages([]);
    }
  }

  useEffect(() => {
    if (selectedChat && messages) {
      localStorage.setItem(
        `chat:${selectedChat}:messages`,
        JSON.stringify(messages)
      );
    }
  }, [messages]);

  useEffect(() => {
    const storedChats = localStorage.getItem("chats");
    if (storedChats) {
      const chats = (
        JSON.parse(storedChats) as { id: string; title: string }[]
      ).sort((a, b) => Number(b.id) - Number(a.id));
      setChats(chats);
      setSelectedChat(chats[0].id);
      loadMessages(chats[0].id);
    } else {
      createNewChat();
    }
  }, []);

  useEffect(() => {
    if (selectedChat) {
      loadMessages(selectedChat);
    }
  }, [selectedChat]);

  const createNewChat = () => {
    const newChat = {
      id: Date.now().toString(),
      title: "New Chat",
    };
    const updatedChats = [newChat, ...chats];
    setChats(updatedChats);
    localStorage.setItem("chats", JSON.stringify(updatedChats));
    setSelectedChat(newChat.id);
    setMessages([]);
    return newChat.id;
  };

  const selectChat = (id: string) => {
    setSelectedChat(id);
    loadMessages(id);
  };

  const messagesRef = useRef<HTMLDivElement>(null);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (messagesRef.current) {
      // @ts-expect-error TODO: Fix this
      messagesRef.current.lastChild?.lastChild?.lastChild?.lastChild?.scrollIntoView();
    }
  }, [messages]);

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsGenerating(true);
    handleSubmit(e);
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (isGenerating || isLoading || !input) return;
      setIsGenerating(true);
      onSubmit(e as unknown as React.FormEvent<HTMLFormElement>);
    }
  };

  const handleActionClick = async (action: string, messageIndex: number) => {
    console.log("Action clicked:", action, "Message index:", messageIndex);
    if (action === "Refresh") {
      setIsGenerating(true);
      try {
        await reload();
      } catch (error) {
        console.error("Error reloading:", error);
      } finally {
        setIsGenerating(false);
      }
    }

    if (action === "Copy") {
      const message = messages[messageIndex];
      if (message && message.role === "assistant") {
        navigator.clipboard.writeText(message.content);
      }
    }
  };

  return (
    <main className="h-screen w-full flex flex-col">
      <div
        className="flex items-center justify-between h-12 px-8 py-8 border-b"
        style={{
          backgroundColor: "rgba(255, 255, 255, .6)",
        }}
      >
        <div className="text-xl font-bold"> 华佗GPT O1</div>
        <div className="flex gap-4">
          <Image src="/sribd-logo2x.png" alt="" width={200} height={50} />
          <Image src="/cuhk-sz-logo2x.png" alt="" width={200} height={50} />
        </div>
      </div>
      <div
        className="flex"
        style={{
          height: "calc(100vh - 4rem)",
        }}
      >
        <div className="w-56 border-r p-4 flex flex-col">
          <Button onClick={createNewChat} className="mb-4">
            New Chat
          </Button>
          <ScrollArea className="flex-grow">
            {chats.map((chat) => (
              <Button
                key={chat.id}
                variant={selectedChat === chat.id ? "secondary" : "ghost"}
                className="w-full justify-start mb-2"
                onClick={() => selectChat(chat.id)}
              >
                {chat.title}
              </Button>
            ))}
          </ScrollArea>
        </div>
        <div className="flex flex-col flex-1 h-full max-w-5xl mx-auto">
          <ScrollArea ref={messagesRef} className="flex-grow">
            <ChatMessageList>
              {/* Messages */}
              {messages &&
                messages.map((message, index) => {
                  return message.role === "assistant" ? (
                    <AssistantChatBubble
                      key={index}
                      index={index}
                      isGenerating={isGenerating}
                      message={message.content}
                      onActionClick={handleActionClick}
                    />
                  ) : (
                    <UserChatBubble key={index} message={message.content} />
                  );
                })}

              {/* Loading */}
              {isGenerating && (
                <ChatBubble variant="received">
                  <ChatBubbleAvatar src="" fallback="🤖" />
                  <ChatBubbleMessage isLoading />
                </ChatBubble>
              )}
            </ChatMessageList>
          </ScrollArea>
          <div className="w-full px-4">
            <form
              ref={formRef}
              onSubmit={onSubmit}
              className="relative rounded-lg border bg-background focus-within:ring-1 focus-within:ring-ring"
            >
              <ChatInput
                value={input}
                onKeyDown={onKeyDown}
                onChange={handleInputChange}
                placeholder="请在这儿输入你的消息"
                className="min-h-12 resize-none rounded-lg bg-background border-0 p-3 shadow-none focus-visible:ring-0"
              />
              <div className="flex items-center p-3 pt-0">
                {/* <Button variant="ghost" size="icon">
              <Paperclip className="size-4" />
              <span className="sr-only">Attach file</span>
            </Button> */}
                <Button variant="ghost" size="icon">
                  <Mic className="size-4" />
                  <span className="sr-only">Use Microphone</span>
                </Button>

                <Button
                  disabled={!input || isLoading}
                  type="submit"
                  size="sm"
                  className="ml-auto gap-1.5"
                >
                  发送消息
                  <CornerDownLeft className="size-3.5" />
                </Button>
              </div>
            </form>
          </div>
          <footer className="py-4 flex justify-center">
            <div className="text-sm">
              版权所有 © 深圳市大数据研究院{" "}
              <a href="https://beian.miit.gov.cn/">粤ICP备16049670号-4</a>
            </div>
          </footer>
        </div>
      </div>
    </main>
  );
}
