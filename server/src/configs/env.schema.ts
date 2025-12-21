import { JSONSchemaType } from "ajv";

export interface EnvConfig {
    PORT: number;
    NODE_ENV: "development" | "production" | "test";
    GEMINI_API_KEY: string;
    VECTOR_DB_PATH: string;
}

export const envSchema: JSONSchemaType<EnvConfig> = {
    type: "object",
    required: ["GEMINI_API_KEY"],
    properties: {
        PORT: {
            type: "number",
            default: 3000
        },
        NODE_ENV: {
            type: "string",
            default: "development"
        },
        GEMINI_API_KEY: {
            type: "string"
        },
        VECTOR_DB_PATH: {
            type: "string",
            default: "./vector-store"
        }
    }
};
