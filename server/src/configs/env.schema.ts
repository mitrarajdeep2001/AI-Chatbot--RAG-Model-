import { JSONSchemaType } from "ajv";

export interface EnvConfig {
  PORT: number;
  CLIENT_URL: string;
  NODE_ENV: "development" | "production" | "test";
  GEMINI_API_KEY: string;
  VECTOR_DB_PATH: string;
  HF_API_KEY: string;
}

export const envSchema: JSONSchemaType<EnvConfig> = {
  type: "object",
  required: ["GEMINI_API_KEY", "HF_API_KEY"],
  properties: {
    PORT: {
      type: "number",
      default: 3000,
    },
    CLIENT_URL: {
      type: "string",
      default: "http://localhost:5173",
    },
    NODE_ENV: {
      type: "string",
      default: "development",
    },
    GEMINI_API_KEY: {
      type: "string",
    },
    VECTOR_DB_PATH: {
      type: "string",
      default: "./vector-store",
    },
    HF_API_KEY: {
      type: "string",
    },
  },
};
