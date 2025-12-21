import { v4 as uuid } from "uuid";
import type { ChatMessage } from "../../types/chat";
import * as React from "react";
import { baseURL } from "../../utils/constants";

interface StreamChatArgs {
  message: string;
  setMessages: React.Dispatch<React.SetStateAction<ChatMessage[]>>;
}

export const streamChat = async ({ message, setMessages }: StreamChatArgs) => {
  // 1️⃣ Add user message immediately
  const userMessage: ChatMessage = {
    id: uuid(),
    role: "user",
    content: message,
  };

  // 2️⃣ Create placeholder assistant message
  const assistantMessageId = uuid();
  const assistantMessage: ChatMessage = {
    id: assistantMessageId,
    role: "assistant",
    content: "",
  };

  setMessages((prev) => [...prev, userMessage, assistantMessage]);

  // 3️⃣ Call streaming API
  const response = await fetch(`${baseURL}/chat/stream`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message }),
  });

  if (!response.body) {
    throw new Error("Streaming not supported by browser");
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();

  // 4️⃣ Read stream chunk-by-chunk
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    const chunk = decoder.decode(value, { stream: true });

    // 5️⃣ Append chunk to the LAST assistant message
    setMessages((prev) =>
      prev.map((msg) =>
        msg.id === assistantMessageId
          ? {
              ...msg,
              content: (msg.content ?? "") + chunk,
            }
          : msg
      )
    );
  }
};

export const uploadFile = async (file: File) => {
  const formData = new FormData();
  formData.append("file", file);
  await fetch(`${baseURL}/chat/upload`, {
    method: "POST",
    body: formData,
  });
};

export const fetchChats = async () => {
  return await fetch(`${baseURL}/chat`);
};

export const fetchUploadedDocument = async () => {
  return await fetch(`${baseURL}/chat/document`);
};

export const deleteUploadedDocument = async (id: string) => {
  return await fetch(`${baseURL}/chat/document/delete/${id}`, {
    method: "DELETE",
  });
};
