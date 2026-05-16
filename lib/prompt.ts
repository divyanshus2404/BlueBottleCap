export const prompts = {
  rewrite: 'Rewrite the following text for a polished, clear, and natural flow. Keep the meaning intact and return only the revised text.',
  explain: 'Explain the following text in simple, student-friendly language. Focus on comprehension and return only the explanation.',
  formalize: 'Rewrite the following text in a polished, professional tone suitable for academic or formal writing. Keep the meaning and clarity intact.',
  expand: 'Expand the following text with clear structure and useful detail while preserving the original idea. Keep the result concise and easy to follow.',
};

export function getPrompt(action: keyof typeof prompts, text: string) {
  return `${prompts[action]}\n\nText:\n${text}`;
}
