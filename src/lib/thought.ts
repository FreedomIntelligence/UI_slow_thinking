export function isThoughtMessage(message: string): boolean {
  // If the message starts with "##", return true
  return message.startsWith("##");
}

export function processingQuote(quote: string): string {
  // If the quote is empty, return an empty string
  // If the quote is not empty, return the quote with a ">" at the beginning of each line
  if (quote.includes("##")) {
    quote = quote.slice(0, quote.indexOf("##"));
  }
  return `> ${quote.trim().replace(/\n/g, "\n> ")}`;
}

export function parseThoughtMessage(message: string): {
  quote: string;
  body: string;
} {
  if (!isThoughtMessage(message)) {
    // If the message is not a thought message, return the message as the body
    return {
      quote: "",
      body: message,
    };
  }

  // Split the message into two parts: the quote and the body
  const thoughtMarker = "## 模型内部深度思考";
  const outputStartMarker = "## 思考完毕开始输出";

  const thoughtIndex = message.indexOf(thoughtMarker);
  const outputStartIndex = message.indexOf(outputStartMarker);

  // If the thought marker is not found and the output start marker is not found, return an empty quote and body
  if (thoughtIndex === -1 && outputStartIndex === -1) {
    return {
      quote: "",
      body: "",
    };
  }
  
  // If the thought marker is found and the output start marker is not found, return the quote and an empty body
  if (thoughtIndex !== -1 && outputStartIndex === -1) {
    const quote = message.slice(thoughtIndex + thoughtMarker.length);
    return {
      quote: processingQuote(quote),
      body: "",
    };
  }

  // If both markers are found, return the quote and the body
  const quoteContent = message
    .slice(thoughtIndex + thoughtMarker.length, outputStartIndex)
    .trim();

  const bodyContent = message
    .slice(outputStartIndex + outputStartMarker.length)
    .trim();

  return {
    quote: processingQuote(quoteContent),
    body: bodyContent,
  };
}
