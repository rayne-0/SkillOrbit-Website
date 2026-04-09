/**
 * AIMentor.jsx
 * Floating AI Mentor chatbot panel for the LecturePage.
 * Connects to the backend OpenAI proxy (with mock fallback).
 */
import React, { useState, useRef, useEffect, useCallback } from 'react';
import './AIMentor.css';

const API_BASE = 'http://localhost:8000';

const QUICK_ACTIONS = [
  { label: '📝 Quiz Me', message: 'Quiz me on this lesson topic' },
  { label: '💡 Explain This', message: 'Explain this lesson in simple terms' },
  { label: '🔍 Give a Hint', message: 'Give me a hint to understand this better' },
  { label: '🔗 Real-World Example', message: 'Give me a real-world example of this concept' },
];

const WELCOME_MSG = {
  id: 'welcome',
  role: 'assistant',
  content: "👋 Hi! I'm your **AI Mentor** for this lesson. I can explain concepts, quiz you, or give hints. What would you like to explore?",
};

/** Render simple markdown: **bold**, *italic*, numbered lists, bullet points */
function renderMarkdown(text) {
  const lines = text.split('\n');
  return lines.map((line, i) => {
    // Bold
    let parts = line.split(/(\*\*[^*]+\*\*)/g).map((part, j) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={j}>{part.slice(2, -2)}</strong>;
      }
      return part;
    });
    return (
      <span key={i}>
        {parts}
        {i < lines.length - 1 && <br />}
      </span>
    );
  });
}

export default function AIMentor({ lessonTitle = 'this lesson', lessonOverview = '' }) {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([WELCOME_MSG]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    if (open) {
      scrollToBottom();
      inputRef.current?.focus();
    }
  }, [open, messages, scrollToBottom]);

  const getTokens = () => {
    try {
      const s = localStorage.getItem('skillorbit_tokens');
      return s ? JSON.parse(s) : null;
    } catch { return null; }
  };

  const sendMessage = useCallback(async (text) => {
    const trimmed = text.trim();
    if (!trimmed || loading) return;

    const userMsg = { id: Date.now(), role: 'user', content: trimmed };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    const history = messages
      .filter(m => m.id !== 'welcome')
      .map(m => ({ role: m.role, content: m.content }));

    try {
      const tokens = getTokens();
      const headers = { 'Content-Type': 'application/json' };
      if (tokens?.access) headers['Authorization'] = `Bearer ${tokens.access}`;

      const res = await fetch(`${API_BASE}/api/chatbot/chat/`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          message: trimmed,
          lesson_title: lessonTitle,
          lesson_overview: lessonOverview,
          history,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setMessages(prev => [...prev, {
          id: Date.now() + 1,
          role: 'assistant',
          content: data.reply,
        }]);

        // Award XP for asking a question (silently)
        try {
          if (tokens?.access) {
            await fetch(`${API_BASE}/api/gamification/award/`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${tokens.access}` },
              body: JSON.stringify({ xp: 5, action: 'ai_question' }),
            });
          }
        } catch { /* silent */ }
      } else {
        throw new Error(data.error || 'Unknown error');
      }
    } catch (e) {
      setMessages(prev => [...prev, {
        id: Date.now() + 1,
        role: 'assistant',
        content: "Sorry, I'm having trouble connecting right now. Please try again in a moment! 🔄",
      }]);
    } finally {
      setLoading(false);
    }
  }, [messages, loading, lessonTitle, lessonOverview]);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  };

  return (
    <>
      {/* Floating toggle button */}
      <button
        className={`ai-mentor-toggle ${open ? 'open' : ''}`}
        onClick={() => setOpen(p => !p)}
        title={open ? 'Close AI Mentor' : 'Open AI Mentor'}
        aria-label="Toggle AI Mentor"
      >
        {open ? '✕' : '🤖'}
      </button>

      {/* Chat panel */}
      <div className={`ai-mentor-panel ${open ? 'open' : ''}`} role="dialog" aria-label="AI Mentor Chat">
        {/* Header */}
        <div className="ai-mentor-header">
          <div className="ai-mentor-avatar">🤖</div>
          <div className="ai-mentor-header-info">
            <div className="ai-mentor-header-name">SkillOrbit AI Mentor</div>
            <div className="ai-mentor-header-status">Online — Ready to help</div>
          </div>
          <div className="ai-mentor-context-pill" title={lessonTitle}>{lessonTitle}</div>
        </div>

        {/* Quick actions */}
        <div className="ai-mentor-quick-actions">
          {QUICK_ACTIONS.map(a => (
            <button
              key={a.label}
              className="ai-quick-btn"
              onClick={() => sendMessage(a.message)}
              disabled={loading}
            >
              {a.label}
            </button>
          ))}
        </div>

        {/* Messages */}
        <div className="ai-mentor-messages">
          {messages.map(msg => (
            <div key={msg.id} className={`ai-msg ${msg.role}`}>
              <div className="ai-msg-avatar">
                {msg.role === 'assistant' ? '🤖' : '👤'}
              </div>
              <div className="ai-msg-bubble">
                {renderMarkdown(msg.content)}
              </div>
            </div>
          ))}

          {loading && (
            <div className="ai-msg assistant">
              <div className="ai-msg-avatar">🤖</div>
              <div className="ai-msg-bubble">
                <div className="ai-typing-indicator">
                  <div className="ai-typing-dot" />
                  <div className="ai-typing-dot" />
                  <div className="ai-typing-dot" />
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="ai-mentor-input-row">
          <textarea
            ref={inputRef}
            className="ai-mentor-input"
            placeholder="Ask your AI mentor anything…"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            rows={1}
            disabled={loading}
          />
          <button
            className="ai-mentor-send"
            onClick={() => sendMessage(input)}
            disabled={loading || !input.trim()}
            aria-label="Send message"
          >
            ➤
          </button>
        </div>
      </div>
    </>
  );
}
