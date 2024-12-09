import { NextRequest } from "next/server";
import { createOpenAI } from "@ai-sdk/openai";
import { streamText } from "ai";

const openai = createOpenAI({
  baseURL: "http://61.241.103.33:9959/v1",
  apiKey: "your-api-key",
});

export const maxDuration = 60;

export async function POST(req: NextRequest) {
  const { messages } = await req.json();

  const result = await streamText({
    model: openai("huatuo_o1"),
    messages,
  });

  return result.toDataStreamResponse();
}
