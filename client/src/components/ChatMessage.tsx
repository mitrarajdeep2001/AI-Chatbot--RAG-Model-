import type { ChatMessage as ChatMessageType } from "../types/chat";

interface Props {
  message: ChatMessageType;
}

const ChatMessage = ({ message }: Props) => {
  const isUser = message.role === "user";

  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"} mb-3`}>
      {message.content && (
        <div
          className={`max-w-[75%] px-4 py-3 rounded-2xl text-sm space-y-2 ${
            isUser
              ? "bg-blue-600 text-white rounded-br-none"
              : "bg-gray-100 text-gray-900 rounded-bl-none"
          }`}
        >
          {/* Text Message */}
          <p className="leading-relaxed whitespace-pre-wrap">
            {message.content}
          </p>
        </div>
      )}
    </div>
  );
};

export default ChatMessage;
