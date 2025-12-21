import { useEffect, useRef } from "react";
import ChatMessage from "./ChatMessage";
import type {ChatMessage as ChatMessageType} from "../types/chat";

interface Props {
    messages: ChatMessageType[];
    isLoading: boolean;
}

const ChatWindow = ({ messages, isLoading }: Props) => {
    const bottomRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages, isLoading]);

    return (
        <div className="flex-1 overflow-y-auto px-6 py-4 bg-gray-50">
            {messages.map((msg) => (
                <ChatMessage key={msg.id} message={msg} />
            ))}

            {isLoading && (
                <div className="text-sm text-gray-500 italic">
                    Assistant is typing...
                </div>
            )}

            <div ref={bottomRef} />
        </div>
    );
};

export default ChatWindow;
