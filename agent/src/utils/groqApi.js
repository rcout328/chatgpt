import Groq from "groq-sdk";

const groq = new Groq({
  apiKey: process.env.NEXT_PUBLIC_GROQ_API_KEY || "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",
  dangerouslyAllowBrowser: true
});

export async function callGroqApi(messages) {
  try {
    if (typeof window !== 'undefined' && !process.env.NEXT_PUBLIC_GROQ_API_KEY) {
      console.warn('Warning: Using fallback API key in browser environment');
    }

    const completion = await groq.chat.completions.create({
      messages: messages,
      model: "llama-3.1-70b-versatile",
      temperature: 0.7,
      max_tokens: 4000,
      top_p: 1,
      stream: false,
    });

    return completion.choices[0].message.content;
  } catch (error) {
    console.error('Error calling Groq API:', error);
    throw error;
  }
} 