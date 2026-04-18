import React, { useEffect, useMemo, useRef, useState } from "react";
import { FiMessageSquare, FiX, FiSend } from "react-icons/fi";

const QUICK_ACTIONS = [
  { label: "What is PSA?", value: "__FAQ_PSA__", display: "What is PSA?" },
  {
    label: "Oxygen purity meaning",
    value: "__FAQ_OXYGEN_PURITY__",
    display: "What does oxygen purity mean in the dashboard?",
  },
  {
    label: "Low Purity alarm",
    value: "__FAQ_LOW_PURITY_ALARM__",
    display: 'What does Low Purity alarm mean?',
  },
  {
    label: "Export report",
    value: "__HELP_EXPORT_REPORT__",
    display: "How do I export a report?",
  },
];

function makeSessionId() {
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
      text: "Welcome back! Ask me about dashboard metrics, alarms, PSA, purity, or reports.",
      ts: Date.now(),
    },
  ]);

  const listRef = useRef(null);

  useEffect(() => {
    const t = setTimeout(() => setToastVisible(false), 5000);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    if (!listRef.current) return;
    listRef.current.scrollTop = listRef.current.scrollHeight;
  }, [messages, open]);

  const pushMessage = (role, text) => {
    setMessages((prev) => [
      ...prev,
      { id: `${Date.now()}_${Math.random()}`, role, text, ts: Date.now() },
    ]);
  };

  const send = async (text, displayText = null) => {
    const trimmed = (text ?? "").trim();

    if (!trimmed || sending) return;

    if (!webhookUrl) {
      pushMessage(
        "assistant",
        "Chatbot webhook URL is missing. Please check the REACT_APP_N8N_CHAT_WEBHOOK value in your .env file."
      );
      return;
    }

    pushMessage("user", displayText || trimmed);
    setSending(true);

    try {
      const res = await fetch(webhookUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: trimmed,
          sessionId,
          source: "dashboard",
        }),
      });

      let data = null;
      try {
        data = await res.json();
      } catch {
        data = null;
      }

      if (!res.ok) {
        const errorMessage =
          data?.message ||
          data?.error ||
          `Workflow request failed with status ${res.status}.`;
        throw new Error(errorMessage);
      }

      const reply =
        data?.reply ??
        data?.output ??
        data?.[0]?.reply ??
        data?.[0]?.output ??
        "Sorry — the workflow returned no reply.";

      pushMessage("assistant", reply);

      if (!open) {
        setUnread((u) => u + 1);
      }
    } catch (error) {
      pushMessage(
        "assistant",
        error?.message ||
          "Sorry — I couldn’t reach the chatbot workflow. Please check the webhook URL, CORS, and workflow status."
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
              Ask about dashboard metrics and alarms.
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

      <button
        className="chat-launcher"
        onClick={open ? () => setOpen(false) : openChat}
        aria-label="Open chatbot"
      >
        <FiMessageSquare />
        {unread > 0 && <span className="chat-badge">{unread}</span>}
      </button>

      {open && (
        <div className="chat-panel" role="dialog" aria-label="Dashboard chatbot">
          <div className="chat-panel__header">
            <div className="chat-panel__title">
              <div className="chat-panel__name">Hospital Oxygen Dashboard Assistant</div>
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
                onClick={() => send(a.value, a.display)}                
                disabled={sending}
                type="button"
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
              placeholder="Ask a question..."
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