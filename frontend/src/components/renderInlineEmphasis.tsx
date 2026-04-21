export function renderInlineEmphasis(text: string) {
  return text.replace(/\*\*(.*?)\*\*/g, "$1");
}
