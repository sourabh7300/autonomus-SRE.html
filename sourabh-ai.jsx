import React, { useState, useRef, useEffect } from "react";
import { Send, Trash2, Loader2 } from "lucide-react";

export default function SourabhAI() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const scrollRef = useRef(null);
  const textareaRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, loading]);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height =
        Math.min(textareaRef.current.scrollHeight, 160) + "px";
    }
  }, [input]);

  async function handleSend() {
    const text = input.trim();
    if (!text || loading) return;

    const nextMessages = [...messages, { role: "user", content: text }];
    setMessages(nextMessages);
    setInput("");
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-6",
          max_tokens: 1000,
          system:
            "You are Sourabh's personal assistant, running inside an app Sourabh built himself. Be direct, warm, and useful. No unnecessary preamble.",
          messages: nextMessages.map((m) => ({
            role: m.role,
            content: m.content,
          })),
        }),
      });

      const data = await response.json();
      const textBlock = (data.content || []).find((b) => b.type === "text");
      const reply = textBlock ? textBlock.text : "…no reply came through.";

      setMessages((prev) => [...prev, { role: "assistant", content: reply }]);
    } catch (e) {
      setError("Couldn't reach the model. Try sending that again.");
    } finally {
      setLoading(false);
    }
  }

  function handleKeyDown(e) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  function handleClear() {
    setMessages([]);
    setError(null);
  }

  return (
    <div style={styles.root}>
      <style>{`
        @import url('https://fonts.cdnfonts.com/css/iowan-old-style');
        .sa-scroll::-webkit-scrollbar { width: 8px; }
        .sa-scroll::-webkit-scrollbar-thumb { background: #333a46; border-radius: 4px; }
        .sa-scroll::-webkit-scrollbar-track { background: transparent; }
        .sa-textarea::placeholder { color: #6b7280; }
        .sa-textarea:focus { outline: none; }
        .sa-send:focus-visible, .sa-clear:focus-visible {
          outline: 2px solid #b8863b; outline-offset: 2px;
        }
        .sa-bubble-in {
          animation: sa-rise 0.25s ease-out;
        }
        @keyframes sa-rise {
          from { opacity: 0; transform: translateY(6px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .sa-dot {
          animation: sa-pulse 1.4s ease-in-out infinite;
        }
        @keyframes sa-pulse {
          0%, 100% { opacity: 0.35; }
          50% { opacity: 1; }
        }
        @media (prefers-reduced-motion: reduce) {
          .sa-bubble-in, .sa-dot { animation: none; }
        }
      `}</style>

      {/* header */}
      <header style={styles.header}>
        <div style={styles.headerLeft}>
          <div style={styles.seal}>SS</div>
          <div>
            <div style={styles.name}>Sourabh</div>
            <div style={styles.tagline}>personal instance · private</div>
          </div>
        </div>
        <button
          onClick={handleClear}
          className="sa-clear"
          style={styles.clearBtn}
          aria-label="Clear conversation"
        >
          <Trash2 size={13} strokeWidth={1.8} />
          <span>clear</span>
        </button>
      </header>

      {/* chat area */}
      <div ref={scrollRef} className="sa-scroll" style={styles.scrollArea}>
        {messages.length === 0 && !loading && (
          <div style={styles.empty}>
            <div style={styles.emptySeal}>SS</div>
            <div style={styles.emptyTitle}>This one's yours, Sourabh.</div>
            <div style={styles.emptySub}>
              Nothing logged yet — say something to open the ledger.
            </div>
          </div>
        )}

        {messages.map((m, i) => (
          <div
            key={i}
            className="sa-bubble-in"
            style={{
              ...styles.row,
              justifyContent: m.role === "user" ? "flex-end" : "flex-start",
            }}
          >
            {m.role === "assistant" && (
              <div style={styles.avatarSmall}>SS</div>
            )}
            <div
              style={{
                ...styles.bubble,
                ...(m.role === "user" ? styles.bubbleUser : styles.bubbleAI),
              }}
            >
              <div style={styles.bubbleMeta}>
                {m.role === "user" ? "SOURABH" : "ASSISTANT"} · #{String(i + 1).padStart(2, "0")}
              </div>
              <div style={styles.bubbleText}>{m.content}</div>
            </div>
          </div>
        ))}

        {loading && (
          <div style={{ ...styles.row, justifyContent: "flex-start" }}>
            <div style={styles.avatarSmall}>SS</div>
            <div style={{ ...styles.bubble, ...styles.bubbleAI }}>
              <div style={styles.bubbleMeta}>ASSISTANT · writing</div>
              <div style={styles.thinking}>
                <Loader2 size={13} className="sa-dot" />
                <span>thinking</span>
              </div>
            </div>
          </div>
        )}

        {error && <div style={styles.errorBox}>{error}</div>}
      </div>

      {/* input */}
      <div style={styles.inputBar}>
        <textarea
          ref={textareaRef}
          className="sa-textarea"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Write to your assistant…"
          rows={1}
          style={styles.textarea}
        />
        <button
          onClick={handleSend}
          className="sa-send"
          disabled={loading || !input.trim()}
          style={{
            ...styles.sendBtn,
            opacity: loading || !input.trim() ? 0.4 : 1,
            cursor: loading || !input.trim() ? "default" : "pointer",
          }}
          aria-label="Send message"
        >
          <Send size={15} strokeWidth={2} />
        </button>
      </div>
      <div style={styles.footNote}>enter to send · shift+enter for a new line</div>
    </div>
  );
}

const styles = {
  root: {
    display: "flex",
    flexDirection: "column",
    height: "640px",
    maxWidth: "560px",
    margin: "0 auto",
    background: "#15181D",
    border: "1px solid #2C313B",
    borderRadius: "10px",
    overflow: "hidden",
    fontFamily:
      "-apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif",
    color: "#ECE7DC",
  },
  header: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "14px 18px",
    borderBottom: "1px solid #2C313B",
    background: "#1A1E24",
    flexShrink: 0,
  },
  headerLeft: { display: "flex", alignItems: "center", gap: "12px" },
  seal: {
    width: "36px",
    height: "36px",
    borderRadius: "50%",
    border: "1.5px solid #B8863B",
    color: "#D8AE6C",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontFamily: "Georgia, 'Iowan Old Style', serif",
    fontSize: "13px",
    letterSpacing: "0.5px",
    flexShrink: 0,
  },
  name: {
    fontFamily: "Georgia, 'Iowan Old Style', serif",
    fontSize: "18px",
    lineHeight: 1.1,
  },
  tagline: {
    fontFamily: "ui-monospace, 'SF Mono', monospace",
    fontSize: "10.5px",
    color: "#7A8290",
    marginTop: "2px",
    letterSpacing: "0.3px",
  },
  clearBtn: {
    display: "flex",
    alignItems: "center",
    gap: "5px",
    background: "transparent",
    border: "1px solid #3A404C",
    color: "#9098A6",
    fontFamily: "ui-monospace, monospace",
    fontSize: "11px",
    padding: "6px 10px",
    borderRadius: "6px",
    cursor: "pointer",
  },
  scrollArea: {
    flex: 1,
    overflowY: "auto",
    padding: "20px 18px",
    display: "flex",
    flexDirection: "column",
    gap: "14px",
  },
  empty: {
    margin: "auto",
    textAlign: "center",
    color: "#7A8290",
    maxWidth: "260px",
  },
  emptySeal: {
    width: "48px",
    height: "48px",
    borderRadius: "50%",
    border: "1.5px solid #3A404C",
    color: "#565D6B",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontFamily: "Georgia, serif",
    fontSize: "16px",
    margin: "0 auto 14px",
  },
  emptyTitle: {
    fontFamily: "Georgia, 'Iowan Old Style', serif",
    fontSize: "16px",
    color: "#ECE7DC",
    marginBottom: "6px",
  },
  emptySub: {
    fontSize: "12.5px",
    lineHeight: 1.5,
  },
  row: { display: "flex", alignItems: "flex-end", gap: "8px" },
  avatarSmall: {
    width: "24px",
    height: "24px",
    borderRadius: "50%",
    border: "1px solid #B8863B",
    color: "#D8AE6C",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontFamily: "Georgia, serif",
    fontSize: "9px",
    flexShrink: 0,
  },
  bubble: {
    maxWidth: "78%",
    padding: "10px 13px",
    borderRadius: "10px",
    fontSize: "14px",
    lineHeight: 1.5,
  },
  bubbleUser: {
    background: "#2C2418",
    border: "1px solid #4A3B22",
    color: "#ECE7DC",
  },
  bubbleAI: {
    background: "#1D2128",
    border: "1px solid #2C313B",
    color: "#DCD9D0",
  },
  bubbleMeta: {
    fontFamily: "ui-monospace, monospace",
    fontSize: "9.5px",
    letterSpacing: "0.5px",
    color: "#6B7280",
    marginBottom: "4px",
  },
  bubbleText: { whiteSpace: "pre-wrap", wordBreak: "break-word" },
  thinking: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
    fontSize: "12.5px",
    color: "#8A92A0",
  },
  errorBox: {
    background: "#241A19",
    border: "1px solid #5A3330",
    color: "#D89A94",
    fontSize: "12.5px",
    padding: "10px 12px",
    borderRadius: "8px",
  },
  inputBar: {
    display: "flex",
    alignItems: "flex-end",
    gap: "8px",
    padding: "12px 14px",
    borderTop: "1px solid #2C313B",
    background: "#1A1E24",
    flexShrink: 0,
  },
  textarea: {
    flex: 1,
    resize: "none",
    background: "#20252C",
    border: "1px solid #333A46",
    borderRadius: "8px",
    padding: "9px 12px",
    color: "#ECE7DC",
    fontSize: "14px",
    fontFamily: "inherit",
    lineHeight: 1.4,
    maxHeight: "160px",
  },
  sendBtn: {
    width: "34px",
    height: "34px",
    borderRadius: "8px",
    border: "1px solid #B8863B",
    background: "#2C2418",
    color: "#D8AE6C",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  footNote: {
    textAlign: "center",
    fontFamily: "ui-monospace, monospace",
    fontSize: "10px",
    color: "#4E5563",
    padding: "0 0 10px",
    background: "#1A1E24",
  },
};
