import redis from "../helper/redis.service";

const CHAT_TTL_SECONDS = 60 * 60 * 24; // 24 hours
const MAX_MESSAGES = 20; // last 20 messages only

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

const CHAT_KEY = "chat";

export async function addChatMessage(message: ChatMessage) {
  const exists = await redis.exists(CHAT_KEY);

  const pipeline = redis.pipeline();
  pipeline.rpush(CHAT_KEY, JSON.stringify(message));
  pipeline.ltrim(CHAT_KEY, -MAX_MESSAGES, -1);

  // Set TTL only once
  if (!exists) {
    pipeline.expire(CHAT_KEY, CHAT_TTL_SECONDS);
  }

  await pipeline.exec();
}

export async function getChatHistory(): Promise<ChatMessage[]> {
  const messages = await redis.lrange(CHAT_KEY, 0, -1);
  return messages.map((m) => JSON.parse(m));
}

export async function resetChat() {
  await redis.del(CHAT_KEY);
}
