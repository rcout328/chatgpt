import Groq from "groq-sdk";

const groq = new Groq({
  apiKey: "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", // Direct API key without using env variables
  dangerouslyAllowBrowser: true
});

export const callGroqApi = async (messages) => {
  try {
    const apiUrl = 'https://api.groq.com/openai/v1/chat/completions'; // Direct API URL without using env variables
    const apiKey = "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"; // Direct API key without using env variables

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'llama3-70b-8192',
        messages: messages,
        temperature: 0.7,
        max_tokens: 5000,
      }),
    });

    if (!response.ok) {
      throw new Error(`API request failed: ${response.statusText}`);
    }

    const data = await response.json();
    return data.choices[0].message.content;
  } catch (error) {
    console.error('Error calling GROQ API:', error);
    throw error;
  }
}; 