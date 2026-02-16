import React, { useEffect, useMemo, useRef, useState } from "react";
import { FiMessageSquare, FiX, FiSend } from "react-icons/fi";

const QUICK_ACTIONS = [
  { label: "What is PSA?", value: "What is PSA in this system?" },
  {
    label: "Oxygen purity meaning",
    value: "What does oxygen purity mean in the dashboard?",
  },
  { label: "Low Purity alarm", value: "What does “Low Purity” alarm mean?" },
  { label: "Export report", value: "How do I export a report?" },
];

function makeSessionId() {
  // Stable per browser tab/device
  const key = "hos_session_id";
  const existing = localStorage.getItem(key);
  if (existing) return existing;
  const id = `${Date.now()}_${Math.random().toString(16).slice(2)}`;
  localStorage.setItem(key, id);
  return id;
}

export default function ChatWidget({ webhookUrl }) {
  const sessionId = useMemo(() => makeSessionId(), []);
  const [open, setOpen] = useState(false);
  const [toastVisible, setToastVisible] = useState(true);
  const [unread, setUnread] = useState(1);

  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);

  const [messages, setMessages] = useState([
    {
      id: "welcome",
      role: "assistant",
      text: "Welcome back! Ask me one of the dashboard FAQs (purity, alarms, PSA, reports, trends).",
      ts: Date.now(),
    },
  ]);

  const listRef = useRef(null);

  useEffect(() => {
    // auto-hide toast
    const t = setTimeout(() => setToastVisible(false), 5000);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    // scroll to bottom when messages change
    if (!listRef.current) return;
    listRef.current.scrollTop = listRef.current.scrollHeight;
  }, [messages, open]);

  const pushMessage = (role, text) => {
    setMessages((prev) => [
      ...prev,
      { id: `${Date.now()}_${Math.random()}`, role, text, ts: Date.now() },
    ]);
  };

  const send = async (text) => {
    const trimmed = (text ?? "").trim();
    if (!trimmed || !webhookUrl) return;

    pushMessage("user", trimmed);
    setSending(true);

    try {
      const res = await fetch(webhookUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId,
          action: "sendMessage",
          chatInput: trimmed,
          metadata: { source: "dashboard" }, // optional; shows in Chat Trigger output
        }),
      });

      const data = await res.json();

      const reply =
        data?.reply ??
        data?.output ??
        data?.[0]?.reply ??
        data?.[0]?.output ??
        "Sorry — no response was returned from the workflow.";
      pushMessage("assistant", reply);

      if (!open) setUnread((u) => u + 1);
    } catch (e) {
      pushMessage(
        "assistant",
        "Sorry — I couldn’t reach the chatbot workflow. Please check the webhook URL and workflow status.",
      );
    } finally {
      setSending(false);
    }
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    const text = input;
    setInput("");
    await send(text);
  };

  const openChat = () => {
    setOpen(true);
    setUnread(0);
    setToastVisible(false);
  };

  return (
    <>
      {toastVisible && !open && (
        <div className="chat-toast" role="status">
          <div className="chat-toast__icon">
            <FiMessageSquare />
          </div>
          <div className="chat-toast__text">
            <div className="chat-toast__title">Welcome back!</div>
            <div className="chat-toast__subtitle">
              Ask about the dashboard metrics & alarms.
            </div>
          </div>
          <button
            className="chat-toast__close"
            onClick={() => setToastVisible(false)}
            aria-label="Dismiss"
          >
            <FiX />
          </button>
        </div>
      )}

      {/* Floating launcher (bottom-right) */}
      <button
        className="chat-launcher"
        onClick={open ? () => setOpen(false) : openChat}
        aria-label="Open chatbot"
      >
        <FiMessageSquare />
        {unread > 0 && <span className="chat-badge">{unread}</span>}
      </button>

      {/* Chat panel */}
      {open && (
        <div
          className="chat-panel"
          role="dialog"
          aria-label="Dashboard chatbot"
        >
          <div className="chat-panel__header">
            <div className="chat-panel__title">
              <div className="chat-panel__name">
                Oxygen Dashboard Assistant
              </div>
            </div>
            <button
              className="chat-panel__close"
              onClick={() => setOpen(false)}
              aria-label="Close chatbot"
            >
              <FiX />
            </button>
          </div>
          <div className="chat-panel__quick">
            {QUICK_ACTIONS.map((a) => (
              <button
                key={a.label}
                className="chat-quick-btn"
                onClick={() => send(a.value)}
                disabled={sending}
              >
                {a.label}
              </button>
            ))}
          </div>

          <div className="chat-panel__messages" ref={listRef}>
            {messages.map((m) => (
              <div key={m.id} className={`chat-msg chat-msg--${m.role}`}>
                <div className="chat-bubble">{m.text}</div>
              </div>
            ))}
          </div>

          <form className="chat-panel__input" onSubmit={onSubmit}>
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask a question…"
              disabled={sending}
            />
            <button
              type="submit"
              disabled={sending || !input.trim()}
              aria-label="Send"
            >
              <FiSend />
            </button>
          </form>
        </div>
      )}
    </>
  );
}

