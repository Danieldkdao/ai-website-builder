import { Sandbox } from "@e2b/code-interpreter";
import type { AgentResult, Message, TextMessage } from "@inngest/agent-kit";

const textMessageContentToString = (content: TextMessage["content"]) => {
  return typeof content === "string"
    ? content
    : content.map((part) => part.text).join("");
};

export const getSandbox = async (sandboxId: string) => {
  const sandbox = await Sandbox.connect(sandboxId);
  // await sandbox.setTimeout()
  return sandbox;
};

export const lastAssistantTextMessageContent = (result: AgentResult) => {
  const lastAssistantTextMessageIndex = result.output.findLastIndex(
    (message) => message.role === "assistant"
  );

  const message = result.output[lastAssistantTextMessageIndex] as
    | TextMessage
    | undefined;

  return message?.content ? textMessageContentToString(message.content) : undefined;
};

export const parseAgentOutput = (
  value: Message[],
  type: "fragment-title" | "response"
): string => {
  const output = value[0];
  if (!output || output.type !== "text") {
    return type === "fragment-title" ? "Fragment" : "Here you go";
  }
  return textMessageContentToString(output.content);
};
