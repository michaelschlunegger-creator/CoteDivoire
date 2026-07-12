"use client";

import { FormEvent, useEffect, useRef, useState } from "react";

type Message = { role: "bot" | "user"; text: string; links?: { label: string; href: string }[] };
const prompts = ["Where is the event?", "What are the technical themes?", "How do I register?", "Show my agenda"];

export function EventConcierge() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { role: "bot", text: "Welcome! I’m your West African Transform Margin event concierge. Ask me about the programme, registration, travel, resources or your personal agenda." },
  ]);
  const endRef = useRef<HTMLDivElement>(null);
  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages, open]);

  async function ask(text: string) {
    const question = text.trim();
    if (!question || busy) return;
    setMessages((m) => [...m, { role: "user", text: question }]);
    setInput(""); setBusy(true);
    try {
      const response = await fetch("/api/assistant", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ question }) });
      const data = await response.json() as { answer?: string; links?: { label: string; href: string }[] };
      setMessages((m) => [...m, { role: "bot", text: data.answer || "I couldn’t find that yet. Please use the feedback page to contact the event team.", links: data.links }]);
    } catch {
      setMessages((m) => [...m, { role: "bot", text: "I’m temporarily offline. The event pages and downloads are still available." }]);
    } finally { setBusy(false); }
  }

  function submit(e: FormEvent) { e.preventDefault(); void ask(input); }
  return (
    <div className="concierge-wrap">
      {open && <section className="concierge" aria-label="Event concierge">
        <div className="concierge-head">
          <div className="concierge-avatar">✦</div><div><strong>Event Concierge</strong><span><i /> Online · English</span></div>
          <button onClick={() => setOpen(false)} aria-label="Close concierge">×</button>
        </div>
        <div className="concierge-messages">
          {messages.map((m, i) => <div key={i} className={`message ${m.role}`}><p>{m.text}</p>{m.links?.map(l => <a key={l.href} href={l.href}>{l.label} →</a>)}</div>)}
          {messages.length === 1 && <div className="quick-prompts">{prompts.map(p => <button key={p} onClick={() => void ask(p)}>{p}</button>)}</div>}
          {busy && <div className="typing"><i /><i /><i /></div>}
          <div ref={endRef} />
        </div>
        <form className="concierge-input" onSubmit={submit}><input value={input} onChange={e => setInput(e.target.value)} placeholder="Ask about the event…" aria-label="Ask the event concierge" /><button aria-label="Send" disabled={busy}>↑</button></form>
        <small className="concierge-note">Answers are based on published event information.</small>
      </section>}
      <button className="concierge-launcher" onClick={() => setOpen(v => !v)} aria-label="Open event concierge"><span>✦</span><b>{open ? "Close" : "Ask the concierge"}</b></button>
    </div>
  );
}
