"use client";

export default function AgentChatInterface() {
  return (
    <div className="w-full h-screen">
      <iframe
        src="http://127.0.0.1:7860/?__theme=dark"
        className="w-full h-full"
        title="AI Agent Interface"
        style={{ 
          border: 'none',
          background: 'transparent'
        }}
      />
    </div>
  );
} 