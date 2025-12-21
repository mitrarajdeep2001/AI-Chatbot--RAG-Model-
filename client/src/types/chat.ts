export type MessageRole = "user" | "assistant";

export interface ChatFile {
    name: string;
    type: string;
    size: number;
}

export interface ChatMessage {
    id: string;
    role: MessageRole;
    content?: string;
    file?: ChatFile;
}
