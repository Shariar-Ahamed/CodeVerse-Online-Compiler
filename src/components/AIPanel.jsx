import React, { useState, useEffect, useRef } from 'react';

function CodeBlock({ code, language }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="my-3 border border-slate-700/50 rounded-xl overflow-hidden bg-slate-950 shadow-lg font-mono flex flex-col relative z-20">
      {/* CodeBlock Header */}
      <div className="flex justify-between items-center px-4 py-1.5 bg-[#0e1320] border-b border-slate-800 text-[10px] text-slate-400 select-none">
        <span className="uppercase font-bold tracking-wider text-indigo-400">
          {language || 'code'}
        </span>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1 hover:text-white transition-colors duration-150 cursor-pointer focus:outline-none bg-transparent border-none p-0 text-inherit font-inherit"
        >
          <i className={`fas ${copied ? 'fa-check text-emerald-400' : 'fa-copy'}`}></i>
          <span>{copied ? 'Copied!' : 'Copy'}</span>
        </button>
      </div>
      
      {/* Code Text */}
      <pre className="p-3 overflow-x-auto text-[11px] text-slate-300 leading-relaxed text-left whitespace-pre select-text">
        <code>{code}</code>
      </pre>
    </div>
  );
}

export default function AIPanel({
  onClose,
  activeCode,
  activeLanguage,
  initialContextPrompt,
  clearInitialContextPrompt,
  isHome = false
}) {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: isHome
        ? "Hello! I am **CodeVerse AI** (powered by Llama 3.3 70B). Ask me any coding or development questions right here!"
        : "Hello! I am **CodeVerse AI** (powered by Llama 3.3 70B). Ask me any questions about your code, or click one of the quick actions below to analyze your active workspace."
    }
  ]);
  const [input, setInput] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const messageContainerRef = useRef(null);
  const textareaRef = useRef(null);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Auto-scroll to bottom of chat
  useEffect(() => {
    if (messageContainerRef.current) {
      messageContainerRef.current.scrollTop = messageContainerRef.current.scrollHeight;
    }
  }, [messages, isGenerating]);

  // Handle auto-trigger if opened from One-Click Debugger
  useEffect(() => {
    if (initialContextPrompt) {
      handleSendPrompt(initialContextPrompt);
      if (clearInitialContextPrompt) {
        clearInitialContextPrompt();
      }
    }
  }, [initialContextPrompt]);

  const handleSendPrompt = async (textToSend) => {
    const promptText = textToSend || input;
    if (!promptText.trim() || isGenerating) return;

    if (!textToSend) {
      setInput('');
      if (textareaRef.current) {
        textareaRef.current.style.height = '34px';
      }
    }

    const userMessage = { role: 'user', content: promptText };
    setMessages((prev) => [...prev, userMessage]);
    setIsGenerating(true);

    try {
      const apiKey = import.meta.env.VITE_GROQ_API_KEY;
      if (!apiKey) {
        throw new Error("Groq API Key not found. Please verify VITE_GROQ_API_KEY is configured in your environment.");
      }

      // Map chat history to Groq payload format
      const apiMessages = [
        {
          role: 'system',
          content: `You are CodeVerse AI, an expert programming assistant. You help developers write, optimize, and debug their code.
Your style is professional, direct, and helpful. 
Respond in clean markdown format. When providing code fixes or optimized versions, ALWAYS use complete, copyable markdown code blocks with appropriate syntax highlighting tags (e.g. \`\`\`cpp or \`\`\`python). Keep code comments descriptive.`
        },
        ...messages.map(m => ({ role: m.role, content: m.content })),
        userMessage
      ];

      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: 'llama-3.3-70b-versatile',
          messages: apiMessages,
          temperature: 0.5,
          max_tokens: 1024
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error?.message || `HTTP ${response.status} Error`);
      }

      const data = await response.json();
      const aiReply = data.choices?.[0]?.message?.content || "Sorry, I received an empty response from the AI model.";
      
      setMessages((prev) => [...prev, { role: 'assistant', content: aiReply }]);
    } catch (err) {
      console.error("Groq AI Error:", err);
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: `❌ **AI Connection Failed**: ${err.message || 'Unknown network error. Please try again.'}`
        }
      ]);
    } finally {
      setIsGenerating(false);
      setTimeout(() => {
        if (textareaRef.current) {
          textareaRef.current.focus();
        }
      }, 50);
    }
  };

  const triggerQuickAction = (actionType) => {
    if (!activeCode || !activeCode.trim()) {
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: "⚠️ **No active code found**: Please write some code in your editor workspace first!" }
      ]);
      return;
    }

    let prompt = '';
    if (actionType === 'explain') {
      prompt = `Explain what this ${activeLanguage} code does line-by-line:\n\`\`\`${activeLanguage}\n${activeCode}\n\`\`\``;
    } else if (actionType === 'optimize') {
      prompt = `Optimize this ${activeLanguage} code for time and memory efficiency. Show the optimized version and describe what was changed:\n\`\`\`${activeLanguage}\n${activeCode}\n\`\`\``;
    } else if (actionType === 'tests') {
      prompt = `Generate a set of 3-4 standard input/output test cases to validate this ${activeLanguage} code:\n\`\`\`${activeLanguage}\n${activeCode}\n\`\`\``;
    }

    handleSendPrompt(prompt);
  };

  // Helper to parse markdown-like bold and code formatting simply
  const renderMessageContent = (content) => {
    const tokens = [];
    const lines = content.split('\n');
    let insideCodeBlock = false;
    let codeBlockLanguage = '';
    let codeBlockLines = [];

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      
      if (line.trim().startsWith('```')) {
        if (insideCodeBlock) {
          // End of code block
          tokens.push({
            type: 'code',
            language: codeBlockLanguage,
            code: codeBlockLines.join('\n')
          });
          insideCodeBlock = false;
          codeBlockLines = [];
        } else {
          // Start of code block
          insideCodeBlock = true;
          codeBlockLanguage = line.trim().slice(3).trim();
        }
      } else if (insideCodeBlock) {
        codeBlockLines.push(line);
      } else {
        tokens.push({
          type: 'text',
          text: line
        });
      }
    }

    if (insideCodeBlock && codeBlockLines.length > 0) {
      tokens.push({
        type: 'code',
        language: codeBlockLanguage,
        code: codeBlockLines.join('\n')
      });
    }

    return tokens.map((token, idx) => {
      if (token.type === 'code') {
        return (
          <CodeBlock 
            key={idx} 
            code={token.code} 
            language={token.language} 
          />
        );
      }

      let formatted = token.text;
      // Bold converter
      formatted = formatted.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
      // Inline code converter
      formatted = formatted.replace(/`(.*?)`/g, '<code class="bg-indigo-500/10 px-1.5 py-0.5 rounded text-[10px] text-indigo-400 font-mono font-bold">$1</code>');

      if (!formatted.trim()) return null;

      return (
        <p
          key={idx}
          className="text-[12px] leading-relaxed last:mb-0 mb-1.5 text-inherit"
          dangerouslySetInnerHTML={{ __html: formatted }}
        />
      );
    });
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      if (!isMobile) {
        e.preventDefault();
        handleSendPrompt();
      }
    }
  };

  const handleTextareaChange = (e) => {
    setInput(e.target.value);
    const textarea = e.target;
    if (!e.target.value) {
      textarea.style.height = '34px';
    } else {
      textarea.style.height = '34px'; // Reset
      textarea.style.height = `${Math.min(textarea.scrollHeight, 120)}px`;
    }
  };

  return (
    <div className={`w-full h-full glass-panel shadow-2xl flex flex-col relative z-30 transition-all duration-300 overflow-hidden ${isHome ? 'rounded-2xl rounded-br-none' : 'rounded-2xl'}`}>
      {/* Side Glow Effects */}
      <div className="absolute top-0 right-0 w-24 h-24 rounded-full bg-indigo-500/5 blur-2xl pointer-events-none z-0"></div>
      <div className="absolute bottom-0 left-0 w-24 h-24 rounded-full bg-cyan-500/5 blur-2xl pointer-events-none z-0"></div>

      {/* Header */}
      <div className="h-14 border-b border-[var(--border-color)]/50 flex items-center justify-between px-4 bg-black/10 relative z-10 flex-shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 text-xs animate-pulse">
            <i className="fas fa-brain text-emerald-400"></i>
          </div>
          <span className="text-xs font-bold text-[var(--text-primary)] tracking-wide">CodeVerse AI Assistant</span>
        </div>
        <button
          onClick={onClose}
          className="w-7 h-7 rounded-lg border border-[var(--border-color)]/60 flex items-center justify-center text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-[var(--border-color)] hover:bg-[var(--bg-tertiary)]/50 transition-all duration-200 cursor-pointer"
        >
          <i className="fas fa-times text-xs"></i>
        </button>
      </div>

      {/* Quick Action Widgets */}
      {!isHome && (
        <div className="p-3 border-b border-[var(--border-color)] bg-[var(--bg-secondary)]/30 flex gap-2 overflow-x-auto relative z-10 scrollbar-thin flex-shrink-0">
          <button
            onClick={() => triggerQuickAction('explain')}
            className="flex-shrink-0 px-2.5 py-1.5 rounded-lg border border-indigo-500/20 bg-indigo-500/5 hover:bg-indigo-500/10 hover:border-indigo-500/40 text-[10px] font-bold text-indigo-400 flex items-center gap-1 transition-all duration-200 cursor-pointer"
          >
            <i className="fas fa-book-open"></i>
            <span>Explain Code</span>
          </button>
          <button
            onClick={() => triggerQuickAction('optimize')}
            className="flex-shrink-0 px-2.5 py-1.5 rounded-lg border border-cyan-500/20 bg-cyan-500/5 hover:bg-cyan-500/10 hover:border-cyan-500/40 text-[10px] font-bold text-cyan-400 flex items-center gap-1 transition-all duration-200 cursor-pointer"
          >
            <i className="fas fa-bolt"></i>
            <span>Optimize</span>
          </button>
          <button
            onClick={() => triggerQuickAction('tests')}
            className="flex-shrink-0 px-2.5 py-1.5 rounded-lg border border-purple-500/20 bg-purple-500/5 hover:bg-purple-500/10 hover:border-purple-500/40 text-[10px] font-bold text-purple-400 flex items-center gap-1 transition-all duration-200 cursor-pointer"
          >
            <i className="fas fa-vial"></i>
            <span>Generate Tests</span>
          </button>
        </div>
      )}

      {/* Messages Scroll Area */}
      <div
        ref={messageContainerRef}
        className="flex-grow p-4 overflow-y-auto flex flex-col gap-2.5 scrollbar-thin relative z-10"
      >
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`max-w-[82%] rounded-2xl px-3.5 py-1.5 flex flex-col text-left transition-all duration-200 ${
              msg.role === 'user'
                ? 'self-end bg-indigo-600 text-white rounded-tr-none shadow-sm shadow-indigo-600/5 border border-indigo-500/10'
                : 'self-start bg-[var(--bg-primary)] text-[var(--text-primary)] rounded-tl-none border border-[var(--border-color)]/40 shadow-sm'
            }`}
          >
            <div className="break-words text-[12px] leading-relaxed">
              {renderMessageContent(msg.content)}
            </div>
          </div>
        ))}

        {isGenerating && (
          <div className="self-start max-w-[80%] rounded-2xl rounded-bl-none p-3 bg-[var(--bg-primary)] text-[var(--text-secondary)] border border-[var(--border-color)]/40 flex items-center gap-2">
            <div className="flex gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-bounce delay-75"></span>
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-bounce delay-150"></span>
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-bounce delay-300"></span>
            </div>
            <span className="text-[10px] font-mono">Llama is thinking...</span>
          </div>
        )}
      </div>

      {/* Input Form Bar */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSendPrompt();
        }}
        className="p-3 border-t border-[var(--border-color)]/50 bg-black/20 flex gap-2 items-end relative z-10 flex-shrink-0"
      >
        <textarea
          ref={textareaRef}
          value={input}
          onChange={handleTextareaChange}
          onKeyDown={handleKeyDown}
          placeholder={isMobile ? "Ask CodeVerse AI..." : "Ask CodeVerse AI... (Shift + Enter for new line)"}
          disabled={isGenerating}
          rows={1}
          className="flex-grow px-3 py-2 rounded-xl text-xs bg-[var(--bg-primary)] border border-[var(--border-color)]/40 focus:outline-none focus:border-indigo-500/40 focus:ring-1 focus:ring-indigo-500/30 text-[var(--text-primary)] placeholder-[var(--text-muted)] transition-all duration-200 resize-none h-[34px] min-h-[34px] max-h-[120px] overflow-y-auto scrollbar-none py-2"
        />
        {isGenerating ? (
          <div className="w-8 h-8 rounded-xl border border-indigo-500/30 bg-indigo-500/5 flex items-center justify-center animate-pulse shrink-0">
            <i className="fas fa-circle-notch fa-spin text-indigo-400 text-xs"></i>
          </div>
        ) : (
          <button
            type="submit"
            disabled={!input.trim()}
            className={`w-8 h-8 rounded-xl flex items-center justify-center transition-all duration-200 cursor-pointer shrink-0 ${
              !input.trim()
                ? 'bg-[var(--bg-primary)] opacity-40 text-[var(--text-muted)] border border-[var(--border-color)]/30 cursor-not-allowed'
                : 'bg-blue-500 hover:bg-blue-400 text-white border border-blue-400/20 shadow-[0_0_12px_rgba(59,130,246,0.7)] hover:shadow-[0_0_20px_rgba(59,130,246,0.95)] hover:scale-105 active:scale-95'
            }`}
          >
            <i className="fas fa-paper-plane text-xs text-white drop-shadow-[0_0_3px_rgba(255,255,255,0.8)]"></i>
          </button>
        )}
      </form>
    </div>
  );
}
