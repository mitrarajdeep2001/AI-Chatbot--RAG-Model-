import { useEffect, useState } from "react";
import ChatHeader from "../components/ChatHeader";
import ChatWindow from "../components/ChatWindow";
import ChatInput from "../components/ChatInput";
import type { ChatMessage } from "../types/chat";
import {
  fetchChats,
  pollStatus,
  streamChat,
  uploadFile,
} from "../services/apis/chat.ts";

const ChatPage = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);

  // chat
  const [isStreaming, setIsStreaming] = useState(false);

  // upload
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [documentId, setDocumentId] = useState<string | null>(null);
  const [docStatus, setDocStatus] = useState<
    "IDLE" | "UPLOADING" | "PROCESSING" | "READY" | "FAILED"
  >("IDLE");

  const sendMessage = async (message: string) => {
    setIsStreaming(true);
    await streamChat({ message, setMessages });
    setIsStreaming(false);
  };

  const sendFile = async (file: File) => {
    setDocStatus("UPLOADING");
    setUploadProgress(0);

    const result = await uploadFile(file, (p) => {
      setUploadProgress(p);
    });

    setDocumentId(result.documentId);
    setDocStatus("PROCESSING");
    return result.documentId
  };

  const disableSend =
    isStreaming || docStatus === "UPLOADING" || docStatus === "PROCESSING";

  useEffect(() => {
    (async () => {
      await fetchChats();
    })();
  }, []);

  useEffect(() => {
    if (!documentId || docStatus !== "PROCESSING") return;

    const interval = setInterval(async () => {
      const res = await pollStatus(documentId);
      const data = await res.json();

      if (data.status === "COMPLETED") {
        setDocStatus("READY");
        setUploadProgress(data.progress);
        clearInterval(interval);
      } else if (data.status === "FAILED") {
        setDocStatus("FAILED");
        setUploadProgress(data.progress);
        // setError(
        //   data.reason || "Document processing failed. Please try again."
        // );
        clearInterval(interval);
      } else {
        setUploadProgress(data.progress);
      }
    }, 2000);

    return () => clearInterval(interval);
  }, [documentId, docStatus]);

  return (
    <div className="h-screen flex flex-col">
      <ChatHeader />
      <ChatWindow messages={messages} isLoading={isStreaming} />
      <ChatInput
        onSend={sendMessage}
        onUpload={sendFile}
        disabled={disableSend}
        uploadProgress={uploadProgress}
        docStatus={docStatus}
        setUploadProgress={setUploadProgress}
        setDocStatus={setDocStatus}
      />
    </div>
  );
};

export default ChatPage;
