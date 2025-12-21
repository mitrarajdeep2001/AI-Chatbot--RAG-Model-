import { useEffect, useState } from "react";
import ChatHeader from "../components/ChatHeader";
import ChatWindow from "../components/ChatWindow";
import ChatInput from "../components/ChatInput";
import type { ChatMessage } from "../types/chat";
// import { v4 as uuid } from "uuid";
import { fetchChats, streamChat, uploadFile } from "../services/apis/chat.ts";

const ChatPage = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const sendMessage = async (message: string) => {
    setIsLoading(true);
    await streamChat({ message, setMessages });
    setIsLoading(false);
  };

  const sendFile = async (file: File) => {
    setIsLoading(true);
    await uploadFile(file);
    setIsLoading(false);
  };

  useEffect(() => {
    (async () => {
      await fetchChats();
    })();
  }, []);
  return (
    <div className="h-screen flex flex-col">
      <ChatHeader />
      <ChatWindow messages={messages} isLoading={isLoading} />
      <ChatInput onSend={sendMessage} onUpload={sendFile} disabled={isLoading} />
    </div>
  );
};

export default ChatPage;
