import type { ChatMessage as ChatMessageType } from "../types/chat";
import { FileText } from "lucide-react";

interface Props {
    message: ChatMessageType;
}

const ChatMessage = ({ message }: Props) => {
    const isUser = message.role === "user";

    return (
        <div className={`flex ${isUser ? "justify-end" : "justify-start"} mb-3`}>
            <div
                className={`max-w-[75%] px-4 py-3 rounded-2xl text-sm space-y-2 ${
                    isUser
                        ? "bg-blue-600 text-white rounded-br-none"
                        : "bg-gray-100 text-gray-900 rounded-bl-none"
                }`}
            >
                {/* File Attachment */}
                {message.file && (
                    <div
                        className={`flex items-center gap-2 rounded-lg px-3 py-2 text-xs ${
                            isUser
                                ? "bg-blue-500/30"
                                : "bg-white border"
                        }`}
                    >
                        <FileText className="w-4 h-4" />
                        <span className="truncate max-w-45">
              {message.file.name}
            </span>
                    </div>
                )}

                {/* Text Message */}
                {message.content && (
                    <p className="leading-relaxed whitespace-pre-wrap">
                        {message.content}
                    </p>
                )}
            </div>
        </div>
    );
};

export default ChatMessage;
