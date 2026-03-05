import { storage } from "./storage";
import { useState, useEffect, useRef } from "react";

// ── Brand tokens ──────────────────────────────────────────────────────
const GOLD   = "#A07820";
const DARK   = "#2C1F0E";
const CREAM  = "#2C1F0E";
const MUTED  = "rgba(80,50,20,0.55)";
const PANEL  = "rgba(160,120,32,0.07)";
const BORDER = "rgba(160,120,32,0.2)";

const PALETTE = [
  { name: "Gold",    color: "#C9A84C" },
  { name: "Teal",    color: "#4A9D8F" },
  { name: "Blue",    color: "#4A7B9D" },
  { name: "Rose",    color: "#9D4A6B" },
  { name: "Sage",    color: "#6B9D4A" },
  { name: "Dusk",    color: "#7B6B9D" },
];

// ── SPA Dashboard seed data ───────────────────────────────────────────
const SPA_SEED = {
  id: "spa-launch-dashboard",
  name: "The Personal Branding SPA",
  emoji: "✨",
  color: "#C9A84C",
  sub: "Launch Action Plan",
  sections: [
    {
      id: "spa-build",
      name: "SPA Build",
      emoji: "🏗️",
      tasks: [
        { id: "b1", text: "Create Circle community — 'The Personal Branding SPA'", done: false },
        { id: "b2", text: "Connect custom domain: members.thepersonalbrandingspa.com", done: false },
        { id: "b3", text: "Configure brand colours, logo and cover image in Circle", done: false },
        { id: "b4", text: "Create all 11 SPA Spaces in Circle", done: false },
        { id: "b5", text: "Set up 3 membership tiers: Free Discovery / SPA Member / Premium", done: false },
        { id: "b6", text: "Set Space access permissions per tier", done: false },
        { id: "b7", text: "Upload custom cover images for each of the 11 Spaces", done: false },
        { id: "b8", text: "Write Space descriptions for all 11 rooms", done: false },
        { id: "b9", text: "Connect Stripe payment integration", done: false },
        { id: "b10", text: "Update WordPress 'Members' button to link to Circle", done: false },
        { id: "b11", text: "Set Entry / Reception as default landing Space", done: false },
        { id: "b12", text: "Test full member journey: sign-up → login → first Space", done: false },
      ]
    },
    {
      id: "spa-content",
      name: "Content Creation",
      emoji: "✨",
      tasks: [
        { id: "c1", text: "Record SPA welcome video for Entry / Reception", done: false },
        { id: "c2", text: "Write and upload SPA Orientation Guide", done: false },
        { id: "c3", text: "Create pinned 'Start Here' post in Entry / Reception", done: false },
        { id: "c4", text: "Write welcome post for every Space (all 11 rooms)", done: false },
        { id: "c5", text: "Create first Sparkle identity prompt for Sparkle Wing", done: false },
        { id: "c6", text: "Prepare first weekly Spark prompt for Sparks Lounge", done: false },
        { id: "c7", text: "Upload Sparkle Blueprint to Sparks Lounge", done: false },
        { id: "c8", text: "Create first confidence drill for Sparkle Gym", done: false },
        { id: "c9", text: "Write first purpose reflection prompt for Faith Gym", done: false },
        { id: "c10", text: "Upload Me Map tool to Positioning Studio", done: false },
        { id: "c11", text: "Create member introduction thread in Central Foyer", done: false },
        { id: "c12", text: "Set up onboarding email sequence", done: false },
        { id: "c13", text: "Upload Sparkle philosophy to Foundation Collection", done: false },
        { id: "c14", text: "Create first Amplify Wing visibility strategy post", done: false },
      ]
    },
    {
      id: "spa-launch",
      name: "Launch Milestones",
      emoji: "🚀",
      tasks: [
        { id: "l1", text: "Finalise SPA Ecosystem & Experience Guide 2026", done: false },
        { id: "l2", text: "Finalise Circle Architecture Plan", done: false },
        { id: "l3", text: "Complete Circle build — all 11 Spaces live and tested", done: false },
        { id: "l4", text: "Soft launch: invite founding members", done: false },
        { id: "l5", text: "Publish launch announcement on LinkedIn", done: false },
        { id: "l6", text: "Send launch email to existing Words That Deliver audience", done: false },
        { id: "l7", text: "Go live: open Free Discovery access", done: false },
        { id: "l8", text: "Host first Monthly SPA Gathering in Central Foyer", done: false },
        { id: "l9", text: "Schedule first Sparkle Injection session (Positioning Studio)", done: false },
        { id: "l10", text: "Announce Sparkle Watercooler community officially open", done: false },
      ]
    }
  ]
};

// ── Utility ───────────────────────────────────────────────────────────
function uid() { return Math.random().toString(36).slice(2, 9); }

function getPct(tasks) {
  if (!tasks.length) return 0;
  return Math.round((tasks.filter(t => t.done).length / tasks.length) * 100);
}

// ── Ring SVG ──────────────────────────────────────────────────────────
function Ring({ value, size = 60, stroke = 4, color = GOLD }) {
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ - (value / 100) * circ;
  return (
    <svg width={size} height={size} style={{ transform: "rotate(-90deg)", display: "block" }}>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="rgba(160,120,32,0.15)" strokeWidth={stroke}/>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth={stroke}
        strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round"
        style={{ transition: "stroke-dashoffset 0.6s cubic-bezier(0.4,0,0.2,1)" }}/>
    </svg>
  );
}

// ── Task row ──────────────────────────────────────────────────────────
function TaskRow({ task, accent, onToggle, onEdit, onDelete }) {
  const [hover, setHover] = useState(false);
  const [editing, setEditing] = useState(false);
  const [val, setVal] = useState(task.text);
  const inputRef = useRef();

  function commitEdit() {
    if (val.trim()) onEdit(val.trim());
    setEditing(false);
  }

  if (editing) {
    return (
      <div style={{ display: "flex", gap: 10, padding: "8px 14px", alignItems: "center" }}>
        <input
          ref={inputRef}
          value={val}
          onChange={e => setVal(e.target.value)}
          onKeyDown={e => { if (e.key === "Enter") commitEdit(); if (e.key === "Escape") setEditing(false); }}
          autoFocus
          style={{
            flex: 1, background: "rgba(160,120,32,0.08)", border: `1px solid ${accent}`,
            borderRadius: 5, padding: "7px 12px", color: CREAM, fontFamily: "Arial, sans-serif",
            fontSize: 25, outline: "none",
          }}
        />
        <Btn onClick={commitEdit} accent={accent} small>Save</Btn>
        <Btn onClick={() => setEditing(false)} ghost small>Cancel</Btn>
      </div>
    );
  }

  return (
    <div onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}
      style={{
        display: "flex", alignItems: "flex-start", gap: 12, padding: "10px 14px",
        borderRadius: 6, background: hover ? "rgba(160,120,32,0.06)" : "transparent",
        transition: "background 0.15s", cursor: "default",
      }}>
      {/* Checkbox */}
      <div onClick={onToggle} style={{
        width: 20, height: 20, flexShrink: 0, borderRadius: 4, marginTop: 2, cursor: "pointer",
        border: `1.5px solid ${task.done ? accent : "rgba(160,120,32,0.3)"}`,
        background: task.done ? accent : "transparent",
        display: "flex", alignItems: "center", justifyContent: "center",
        transition: "all 0.2s",
      }}>
        {task.done && (
          <svg width="11" height="8" viewBox="0 0 11 8" fill="none">
            <path d="M1 3.5L4 6.5L10 1" stroke="#FDF6E8" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        )}
      </div>
      {/* Text */}
      <span onClick={onToggle} style={{
        flex: 1, fontSize: 25, fontFamily: "Arial, sans-serif", lineHeight: 1.55, cursor: "pointer",
        color: task.done ? MUTED : CREAM,
        textDecoration: task.done ? "line-through" : "none",
        transition: "color 0.2s",
      }}>{task.text}</span>
      {/* Actions (visible on hover) */}
      {hover && (
        <div style={{ display: "flex", gap: 4, flexShrink: 0 }}>
          <IconBtn title="Edit" onClick={() => setEditing(true)}>✏️</IconBtn>
          <IconBtn title="Delete" onClick={onDelete}>🗑️</IconBtn>
        </div>
      )}
    </div>
  );
}

// ── Small button components ───────────────────────────────────────────
function Btn({ children, onClick, accent = GOLD, ghost = false, small = false, danger = false }) {
  const [hover, setHover] = useState(false);
  const bg = danger
    ? (hover ? "#c0392b" : "rgba(192,57,43,0.15)")
    : ghost
    ? (hover ? "rgba(160,120,32,0.10)" : "transparent")
    : (hover ? accent : `${accent}22`);
  const col = danger ? (hover ? "#fff" : "#e74c3c") : ghost ? MUTED : accent;
  return (
    <button onClick={onClick} onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}
      style={{
        background: bg, border: `1px solid ${danger ? "rgba(192,57,43,0.4)" : ghost ? "rgba(160,120,32,0.2)" : `${accent}44`}`,
        borderRadius: 5, padding: small ? "5px 12px" : "8px 18px",
        color: col, fontFamily: "Arial, sans-serif", fontSize: small ? 12 : 13,
        cursor: "pointer", transition: "all 0.15s", whiteSpace: "nowrap",
      }}>
      {children}
    </button>
  );
}

function IconBtn({ children, onClick, title }) {
  const [hover, setHover] = useState(false);
  return (
    <button onClick={onClick} title={title}
      onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}
      style={{
        background: hover ? "rgba(160,120,32,0.10)" : "transparent",
        border: "none", borderRadius: 4, padding: "3px 6px",
        cursor: "pointer", fontSize: 17, lineHeight: 1, transition: "background 0.15s",
      }}>
      {children}
    </button>
  );
}

// ── Section block inside a dashboard ─────────────────────────────────
function SectionBlock({ section, accent, onToggle, onEditTask, onDeleteTask, onAddTask, onEditSection, onDeleteSection }) {
  const [adding, setAdding] = useState(false);
  const [newTask, setNewTask] = useState("");
  const [collapsed, setCollapsed] = useState(false);
  const p = getPct(section.tasks);
  const done = section.tasks.filter(t => t.done);
  const pending = section.tasks.filter(t => !t.done);

  function addTask() {
    if (newTask.trim()) { onAddTask(newTask.trim()); setNewTask(""); setAdding(false); }
  }

  return (
    <div style={{ marginBottom: 20 }}>
      {/* Section header */}
      <div style={{
        display: "flex", alignItems: "center", gap: 10,
        padding: "14px 18px", background: PANEL,
        border: `1px solid ${BORDER}`, borderRadius: collapsed ? 8 : "8px 8px 0 0",
        cursor: "pointer",
      }} onClick={() => setCollapsed(c => !c)}>
        <div style={{ fontSize: 25, lineHeight: 1 }}>{section.emoji || "📋"}</div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 17, fontWeight: "bold", color: CREAM, fontFamily: "Arial" }}>{section.name}</div>
          <div style={{ fontSize: 25, color: MUTED, fontFamily: "Arial", marginTop: 2 }}>
            {done.length}/{section.tasks.length} complete
          </div>
        </div>
        {/* Mini ring */}
        <div style={{ position: "relative", width: 36, height: 36 }}>
          <Ring value={p} size={36} stroke={3} color={accent}/>
          <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 17, fontFamily: "Arial", fontWeight: "bold", color: accent }}>{p}%</div>
        </div>
        <div onClick={e => { e.stopPropagation(); onEditSection(); }} style={{ cursor: "pointer", fontSize: 25, opacity: 0.5, padding: "2px 4px" }} title="Edit section">✏️</div>
        <div onClick={e => { e.stopPropagation(); onDeleteSection(); }} style={{ cursor: "pointer", fontSize: 25, opacity: 0.5, padding: "2px 4px" }} title="Delete section">🗑️</div>
        <div style={{ fontSize: 20, color: MUTED, marginLeft: 2 }}>{collapsed ? "▼" : "▲"}</div>
      </div>

      {!collapsed && (
        <div style={{ border: `1px solid ${BORDER}`, borderTop: "none", borderRadius: "0 0 8px 8px", overflow: "hidden" }}>
          {/* Pending tasks */}
          {pending.map(task => (
            <TaskRow key={task.id} task={task} accent={accent}
              onToggle={() => onToggle(task.id)}
              onEdit={text => onEditTask(task.id, text)}
              onDelete={() => onDeleteTask(task.id)}/>
          ))}
          {done.length > 0 && pending.length > 0 && (
            <div style={{ margin: "0 18px", borderTop: "1px solid rgba(255,255,255,0.04)" }}/>
          )}
          {done.map(task => (
            <TaskRow key={task.id} task={task} accent={accent}
              onToggle={() => onToggle(task.id)}
              onEdit={text => onEditTask(task.id, text)}
              onDelete={() => onDeleteTask(task.id)}/>
          ))}

          {/* Add task row */}
          <div style={{ padding: adding ? "8px 14px 12px" : "6px 14px 10px" }}>
            {adding ? (
              <div style={{ display: "flex", gap: 8 }}>
                <input value={newTask} onChange={e => setNewTask(e.target.value)}
                  onKeyDown={e => { if (e.key === "Enter") addTask(); if (e.key === "Escape") setAdding(false); }}
                  autoFocus placeholder="Type a task and press Enter…"
                  style={{
                    flex: 1, background: "rgba(160,120,32,0.06)", border: `1px solid ${accent}44`,
                    borderRadius: 5, padding: "7px 12px", color: CREAM, fontFamily: "Arial",
                    fontSize: 17, outline: "none",
                  }}/>
                <Btn onClick={addTask} accent={accent} small>Add</Btn>
                <Btn onClick={() => setAdding(false)} ghost small>Cancel</Btn>
              </div>
            ) : (
              <button onClick={() => setAdding(true)} style={{
                background: "none", border: "none", color: MUTED, fontFamily: "Arial",
                fontSize: 20, cursor: "pointer", padding: "4px 6px", letterSpacing: 0.5,
              }}>+ Add task</button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Modal ─────────────────────────────────────────────────────────────
function Modal({ title, onClose, children }) {
  return (
    <div style={{
      position: "fixed", inset: 0, background: "rgba(44,31,14,0.6)", zIndex: 100,
      display: "flex", alignItems: "center", justifyContent: "center", padding: 20,
    }} onClick={onClose}>
      <div onClick={e => e.stopPropagation()} style={{
        background: "#FFF8EC", border: `1px solid ${BORDER}`,
        borderRadius: 12, padding: "32px 28px", width: "100%", maxWidth: 480,
        boxShadow: "0 24px 60px rgba(0,0,0,0.5)",
      }}>
        <div style={{ fontSize: 25, color: CREAM, marginBottom: 24, fontFamily: "Georgia, serif" }}>{title}</div>
        {children}
      </div>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <div style={{ marginBottom: 18 }}>
      <div style={{ fontSize: 25, letterSpacing: 3, color: MUTED, fontFamily: "Arial", marginBottom: 8 }}>{label}</div>
      {children}
    </div>
  );
}

function TextInput({ value, onChange, placeholder, autoFocus }) {
  return (
    <input value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} autoFocus={autoFocus}
      style={{
        width: "100%", boxSizing: "border-box",
        background: "rgba(160,120,32,0.06)", border: `1px solid rgba(201,168,76,0.2)`,
        borderRadius: 6, padding: "10px 14px", color: CREAM, fontFamily: "Arial",
        fontSize: 25, outline: "none",
      }}/>
  );
}

// ── Main app ──────────────────────────────────────────────────────────
export default function DashboardBuilder() {
  const [dashboards, setDashboards] = useState([]);
  const [activeDashId, setActiveDashId] = useState(null);
  const [loaded, setLoaded] = useState(false);
  const [saving, setSaving] = useState(false);
  const [userName, setUserName] = useState("");
  const [nameInput, setNameInput] = useState("");
  const [activity, setActivity] = useState([]); // { who, action, time }

  // Modals
  const [showNewDash, setShowNewDash] = useState(false);
  const [showNewSection, setShowNewSection] = useState(false);
  const [editDash, setEditDash] = useState(null);       // dashboard id
  const [editSection, setEditSection] = useState(null); // { dashId, sectionId }
  const [confirmDelete, setConfirmDelete] = useState(null); // { type, dashId, sectionId? }

  // Form state
  const [form, setForm] = useState({ name: "", emoji: "✨", color: GOLD, sub: "" });
  const [sectionForm, setSectionForm] = useState({ name: "", emoji: "📋" });

  // ── Persistence ──
  useEffect(() => {
    async function load() {
      try {
        const r = await storage.get("spa-builder-shared-v1", true);
        if (r && r.value) {
          const data = JSON.parse(r.value);
          setDashboards(data.dashboards || []);
          setActiveDashId(data.activeDashId || null);
          setActivity(data.activity || []);
        } else {
          // First time ever — seed with the SPA dashboard
          setDashboards([SPA_SEED]);
          setActiveDashId(SPA_SEED.id);
        }
        const nameR = await storage.get("spa-builder-username");
        if (nameR && nameR.value) setUserName(nameR.value);
      } catch {
        setDashboards([SPA_SEED]);
        setActiveDashId(SPA_SEED.id);
      }
      setLoaded(true);
    }
    load();
    // Poll for team updates every 15s
    const interval = setInterval(async () => {
      try {
        const r = await storage.get("spa-builder-shared-v1", true);
        if (r && r.value) {
          const data = JSON.parse(r.value);
          setDashboards(data.dashboards || []);
          setActivity(data.activity || []);
        }
      } catch {}
    }, 15000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!loaded) return;
    setSaving(true);
    const t = setTimeout(async () => {
      try {
        await storage.set("spa-builder-shared-v1", JSON.stringify({ dashboards, activeDashId, activity }), true);
      } catch {}
      setSaving(false);
    }, 500);
    return () => clearTimeout(t);
  }, [dashboards, activeDashId, activity, loaded]);

  function logActivity(action) {
    const who = userName || "Someone";
    const entry = { who, action, time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) };
    setActivity(prev => [entry, ...prev].slice(0, 20));
  }

  async function saveName() {
    if (!nameInput.trim()) return;
    const n = nameInput.trim();
    setUserName(n);
    try { await storage.set("spa-builder-username", n); } catch {}
  }

  // ── Dashboard CRUD ──
  function createDashboard() {
    if (!form.name.trim()) return;
    const d = { id: uid(), name: form.name.trim(), emoji: form.emoji, color: form.color, sub: form.sub.trim(), sections: [] };
    setDashboards(prev => [...prev, d]);
    setActiveDashId(d.id);
    setShowNewDash(false);
    setForm({ name: "", emoji: "✨", color: GOLD, sub: "" });
    logActivity(`created dashboard "${d.name}"`);
  }

  function saveEditDash() {
    if (!form.name.trim()) return;
    setDashboards(prev => prev.map(d => d.id === editDash ? { ...d, name: form.name.trim(), emoji: form.emoji, color: form.color, sub: form.sub.trim() } : d));
    logActivity(`edited dashboard "${form.name.trim()}"`);
    setEditDash(null);
  }

  function deleteDashboard(id) {
    const name = dashboards.find(d => d.id === id)?.name;
    setDashboards(prev => prev.filter(d => d.id !== id));
    if (activeDashId === id) setActiveDashId(dashboards.find(d => d.id !== id)?.id || null);
    logActivity(`deleted dashboard "${name}"`);
    setConfirmDelete(null);
  }

  // ── Section CRUD ──
  function createSection() {
    if (!sectionForm.name.trim()) return;
    const s = { id: uid(), name: sectionForm.name.trim(), emoji: sectionForm.emoji, tasks: [] };
    setDashboards(prev => prev.map(d => d.id === activeDashId ? { ...d, sections: [...d.sections, s] } : d));
    logActivity(`added section "${s.name}" to "${activeDash?.name}"`);
    setShowNewSection(false);
    setSectionForm({ name: "", emoji: "📋" });
  }

  function saveEditSection() {
    if (!sectionForm.name.trim()) return;
    const { dashId, sectionId } = editSection;
    setDashboards(prev => prev.map(d => d.id === dashId
      ? { ...d, sections: d.sections.map(s => s.id === sectionId ? { ...s, name: sectionForm.name.trim(), emoji: sectionForm.emoji } : s) }
      : d));
    logActivity(`edited section "${sectionForm.name.trim()}"`);
    setEditSection(null);
  }

  function deleteSection(dashId, sectionId) {
    const sec = dashboards.find(d=>d.id===dashId)?.sections.find(s=>s.id===sectionId);
    setDashboards(prev => prev.map(d => d.id === dashId
      ? { ...d, sections: d.sections.filter(s => s.id !== sectionId) }
      : d));
    logActivity(`deleted section "${sec?.name}"`);
    setConfirmDelete(null);
  }

  // ── Task CRUD ──
  function toggleTask(dashId, sectionId, taskId) {
    let taskText = "";
    setDashboards(prev => prev.map(d => d.id === dashId
      ? { ...d, sections: d.sections.map(s => s.id === sectionId
          ? { ...s, tasks: s.tasks.map(t => {
              if (t.id === taskId) { taskText = t.text; return { ...t, done: !t.done }; }
              return t;
            }) }
          : s) }
      : d));
    logActivity(`checked off "${taskText}"`);
  }

  function addTask(dashId, sectionId, text) {
    setDashboards(prev => prev.map(d => d.id === dashId
      ? { ...d, sections: d.sections.map(s => s.id === sectionId
          ? { ...s, tasks: [...s.tasks, { id: uid(), text, done: false }] }
          : s) }
      : d));
    logActivity(`added task "${text}"`);
  }

  function editTask(dashId, sectionId, taskId, text) {
    setDashboards(prev => prev.map(d => d.id === dashId
      ? { ...d, sections: d.sections.map(s => s.id === sectionId
          ? { ...s, tasks: s.tasks.map(t => t.id === taskId ? { ...t, text } : t) }
          : s) }
      : d));
    logActivity(`edited a task`);
  }

  function deleteTask(dashId, sectionId, taskId) {
    let taskText = "";
    setDashboards(prev => prev.map(d => d.id === dashId
      ? { ...d, sections: d.sections.map(s => s.id === sectionId
          ? { ...s, tasks: s.tasks.filter(t => { if (t.id === taskId) { taskText = t.text; return false; } return true; }) }
          : s) }
      : d));
    logActivity(`deleted task "${taskText}"`);
  }

  const activeDash = dashboards.find(d => d.id === activeDashId);
  const allActiveTasks = activeDash ? activeDash.sections.flatMap(s => s.tasks) : [];
  const overallPct = getPct(allActiveTasks);

  // ── EMOJIS for picker ──
  const EMOJIS = ["✨","🚀","🏗️","💎","🎯","🌟","📋","🧬","💡","🎨","📣","🏋️","🌿","🔮","🦋","⚡","🌙","🏆"];

  function EmojiPicker({ value, onChange }) {
    return (
      <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
        {EMOJIS.map(e => (
          <button key={e} onClick={() => onChange(e)} style={{
            width: 36, height: 36, borderRadius: 6, border: `1px solid ${e === value ? GOLD : "rgba(160,120,32,0.2)"}`,
            background: e === value ? "rgba(201,168,76,0.15)" : "rgba(160,120,32,0.05)",
            fontSize: 25, cursor: "pointer", transition: "all 0.15s",
          }}>{e}</button>
        ))}
      </div>
    );
  }

  // ── RENDER ────────────────────────────────────────────────────────

  // Name gate — shown once per device until they enter their name
  if (loaded && !userName) {
    return (
      <div style={{ minHeight: "100vh", background: "#FDF6E8", fontFamily: "Georgia, serif", color: "#2C1F0E", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ position: "fixed", inset: 0, pointerEvents: "none", background: `radial-gradient(ellipse 55% 45% at 10% 5%, rgba(160,120,32,0.12) 0%, transparent 100%)` }}/>
        <div style={{ position: "relative", textAlign: "center", maxWidth: 400, padding: 32 }}>
          <div style={{ fontSize: 44, marginBottom: 20 }}>✨</div>
          <div style={{ fontSize: 17, letterSpacing: 4, color: GOLD, fontFamily: "Arial", opacity: 0.7, marginBottom: 10 }}>WORDS THAT DELIVER</div>
          <h1 style={{ fontSize: 29, fontWeight: "normal", margin: "0 0 8px", color: CREAM }}>The Personal Branding SPA</h1>
          <p style={{ fontSize: 25, color: GOLD, fontStyle: "italic", margin: "0 0 36px" }}>Dashboard Builder</p>
          <p style={{ fontSize: 25, color: MUTED, fontFamily: "Arial", lineHeight: 1.7, margin: "0 0 28px" }}>
            Who's working today? Your name helps the team see who's making progress.
          </p>
          <input value={nameInput} onChange={e => setNameInput(e.target.value)}
            onKeyDown={e => e.key === "Enter" && saveName()}
            placeholder="Your name…" autoFocus
            style={{
              width: "100%", boxSizing: "border-box", background: "rgba(160,120,32,0.06)",
              border: `1px solid rgba(201,168,76,0.3)`, borderRadius: 8, padding: "12px 16px",
              color: CREAM, fontFamily: "Arial", fontSize: 19, outline: "none", marginBottom: 14,
              textAlign: "center",
            }}/>
          <Btn onClick={saveName} accent={GOLD}>Enter the SPA →</Btn>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: "#FDF6E8", fontFamily: "Georgia, serif", color: "#2C1F0E" }}>

      {/* Ambient */}
      <div style={{
        position: "fixed", inset: 0, pointerEvents: "none",
        background: `radial-gradient(ellipse 55% 45% at 10% 5%, rgba(160,120,32,0.10) 0%, transparent 100%),
                     radial-gradient(ellipse 45% 35% at 90% 90%, rgba(74,123,157,0.05) 0%, transparent 100%)`,
      }}/>

      <div style={{ position: "relative", display: "flex", minHeight: "100vh" }}>

        {/* ── SIDEBAR ─────────────────────────────────────────────── */}
        <div style={{
          width: 240, flexShrink: 0, borderRight: "1px solid rgba(160,120,32,0.2)",
          padding: "36px 0 24px", display: "flex", flexDirection: "column",
          background: "rgba(160,120,32,0.06)",
        }}>
          <div style={{ padding: "0 20px 24px" }}>
            <div style={{ fontSize: 17, letterSpacing: 4, color: GOLD, fontFamily: "Arial", opacity: 0.7, marginBottom: 6 }}>
              WORDS THAT DELIVER
            </div>
            <div style={{ fontSize: 19, color: CREAM }}>Dashboard Builder</div>
          </div>

          <div style={{ flex: 1, overflowY: "auto", padding: "0 12px" }}>
            {dashboards.length === 0 && (
              <div style={{ padding: "16px 8px", fontSize: 20, color: MUTED, fontFamily: "Arial", lineHeight: 1.6 }}>
                No dashboards yet. Create your first one below.
              </div>
            )}
            {dashboards.map(d => {
              const allT = d.sections.flatMap(s => s.tasks);
              const p = getPct(allT);
              const isActive = d.id === activeDashId;
              return (
                <div key={d.id} onClick={() => setActiveDashId(d.id)} style={{
                  padding: "10px 12px", borderRadius: 7, marginBottom: 4, cursor: "pointer",
                  background: isActive ? "rgba(201,168,76,0.1)" : "transparent",
                  border: `1px solid ${isActive ? "rgba(201,168,76,0.3)" : "transparent"}`,
                  transition: "all 0.15s",
                }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ fontSize: 16 }}>{d.emoji}</span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 17, color: isActive ? GOLD : CREAM, fontFamily: "Arial", fontWeight: isActive ? "bold" : "normal",
                        whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                        {d.name}
                      </div>
                      <div style={{ fontSize: 25, color: MUTED, fontFamily: "Arial", marginTop: 2 }}>
                        {allT.filter(t=>t.done).length}/{allT.length} · {p}%
                      </div>
                    </div>
                  </div>
                  {/* Progress bar */}
                  <div style={{ marginTop: 8, height: 2, background: "rgba(160,120,32,0.08)", borderRadius: 2, overflow: "hidden" }}>
                    <div style={{ height: "100%", width: `${p}%`, background: d.color, borderRadius: 2, transition: "width 0.5s ease" }}/>
                  </div>
                </div>
              );
            })}
          </div>

          <div style={{ padding: "16px 12px 0" }}>
            <button onClick={() => { setForm({ name: "", emoji: "✨", color: GOLD, sub: "" }); setShowNewDash(true); }}
              style={{
                width: "100%", padding: "10px", borderRadius: 7,
                background: "rgba(160,120,32,0.12)", border: `1px solid rgba(201,168,76,0.25)`,
                color: GOLD, fontFamily: "Arial", fontSize: 20, cursor: "pointer",
                transition: "all 0.15s", letterSpacing: 0.5,
              }}>
              + New Dashboard
            </button>
          </div>

          {/* Who am I + activity */}
          <div style={{ padding: "16px 16px 0" }}>
            <div style={{ fontSize: 25, color: MUTED, fontFamily: "Arial", letterSpacing: 1, marginBottom: 6 }}>
              SIGNED IN AS
            </div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
              <div style={{ fontSize: 17, color: GOLD, fontFamily: "Arial" }}>✦ {userName}</div>
              <button onClick={() => setUserName("")} style={{ background: "none", border: "none", color: MUTED, fontSize: 25, cursor: "pointer", fontFamily: "Arial" }}>
                Switch
              </button>
            </div>
            {activity.length > 0 && (
              <>
                <div style={{ fontSize: 25, color: MUTED, fontFamily: "Arial", letterSpacing: 1, marginBottom: 8 }}>RECENT ACTIVITY</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  {activity.slice(0, 5).map((a, i) => (
                    <div key={i} style={{ fontSize: 19, fontFamily: "Arial", color: MUTED, lineHeight: 1.5 }}>
                      <span style={{ color: "rgba(201,168,76,0.7)" }}>{a.who}</span> {a.action}
                      <span style={{ opacity: 0.5, marginLeft: 4 }}>· {a.time}</span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>

          <div style={{ padding: "16px 16px 0", fontSize: 25, color: MUTED, fontFamily: "Arial", letterSpacing: 1 }}>
            {saving ? "SAVING…" : loaded ? "SHARED · SAVED ✓" : "LOADING…"}
          </div>
        </div>

        {/* ── MAIN AREA ────────────────────────────────────────────── */}
        <div style={{ flex: 1, overflowY: "auto", padding: "40px 36px 80px" }}>

          {!activeDash ? (
            // Empty state
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "60vh", gap: 16 }}>
              <div style={{ fontSize: 48 }}>✨</div>
              <div style={{ fontSize: 27, color: CREAM, fontStyle: "italic" }}>Your dashboards live here</div>
              <div style={{ fontSize: 25, color: MUTED, fontFamily: "Arial", textAlign: "center", maxWidth: 320, lineHeight: 1.7 }}>
                Create a new dashboard for any project, campaign or initiative — then build it out with sections and tasks.
              </div>
              <button onClick={() => { setForm({ name: "", emoji: "✨", color: GOLD, sub: "" }); setShowNewDash(true); }}
                style={{
                  marginTop: 8, padding: "12px 28px", borderRadius: 8,
                  background: "rgba(201,168,76,0.12)", border: `1px solid rgba(201,168,76,0.35)`,
                  color: GOLD, fontFamily: "Arial", fontSize: 25, cursor: "pointer",
                }}>
                + Create your first dashboard
              </button>
            </div>
          ) : (
            <>
              {/* Dashboard header */}
              <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 36, gap: 20 }}>
                <div>
                  <div style={{ fontSize: 19, letterSpacing: 4, color: activeDash.color, fontFamily: "Arial", opacity: 0.8, marginBottom: 8 }}>
                    {activeDash.sub ? activeDash.sub.toUpperCase() : "ACTION DASHBOARD"}
                  </div>
                  <h1 style={{ margin: 0, fontSize: "clamp(22px, 3vw, 32px)", fontWeight: "normal", color: CREAM, lineHeight: 1.2 }}>
                    {activeDash.emoji} {activeDash.name}
                  </h1>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 12, flexShrink: 0 }}>
                  {/* Overall ring */}
                  <div>
                    <div style={{ position: "relative", width: 64, height: 64 }}>
                      <Ring value={overallPct} size={64} stroke={5} color={activeDash.color}/>
                      <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center",
                        fontSize: 20, fontFamily: "Arial", fontWeight: "bold", color: activeDash.color }}>
                        {overallPct}%
                      </div>
                    </div>
                    <div style={{ fontSize: 17, color: MUTED, fontFamily: "Arial", textAlign: "center", marginTop: 4 }}>
                      {allActiveTasks.filter(t=>t.done).length}/{allActiveTasks.length}
                    </div>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                    <Btn onClick={() => { setForm({ name: activeDash.name, emoji: activeDash.emoji, color: activeDash.color, sub: activeDash.sub || "" }); setEditDash(activeDash.id); }} accent={activeDash.color} small>Edit</Btn>
                    <Btn onClick={() => setConfirmDelete({ type: "dashboard", dashId: activeDash.id })} danger small>Delete</Btn>
                  </div>
                </div>
              </div>

              {/* Sections */}
              {activeDash.sections.length === 0 ? (
                <div style={{ textAlign: "center", padding: "48px 0", color: MUTED, fontFamily: "Arial", fontSize: 25, lineHeight: 1.7 }}>
                  This dashboard has no sections yet.<br/>Add a section to start building your action list.
                </div>
              ) : (
                activeDash.sections.map(sec => (
                  <SectionBlock key={sec.id} section={sec} accent={activeDash.color}
                    onToggle={taskId => toggleTask(activeDash.id, sec.id, taskId)}
                    onAddTask={text => addTask(activeDash.id, sec.id, text)}
                    onEditTask={(taskId, text) => editTask(activeDash.id, sec.id, taskId, text)}
                    onDeleteTask={taskId => deleteTask(activeDash.id, sec.id, taskId)}
                    onEditSection={() => { setSectionForm({ name: sec.name, emoji: sec.emoji || "📋" }); setEditSection({ dashId: activeDash.id, sectionId: sec.id }); }}
                    onDeleteSection={() => setConfirmDelete({ type: "section", dashId: activeDash.id, sectionId: sec.id })}
                  />
                ))
              )}

              {/* Add section button */}
              <button onClick={() => { setSectionForm({ name: "", emoji: "📋" }); setShowNewSection(true); }}
                style={{
                  marginTop: 8, padding: "12px 20px", borderRadius: 8, width: "100%",
                  background: "rgba(160,120,32,0.04)", border: `1px dashed rgba(201,168,76,0.2)`,
                  color: MUTED, fontFamily: "Arial", fontSize: 17, cursor: "pointer",
                  transition: "all 0.15s",
                }}>
                + Add section
              </button>
            </>
          )}

          {/* Footer */}
          <div style={{ textAlign: "center", marginTop: 60, fontSize: 25, color: MUTED, fontFamily: "Arial", letterSpacing: 2 }}>
            REVEAL &nbsp;•&nbsp; REFINE &nbsp;•&nbsp; RADIATE &nbsp;•&nbsp; SPARKLE &nbsp;•&nbsp; POSITION &nbsp;•&nbsp; AMPLIFY
          </div>
        </div>
      </div>

      {/* ── MODAL: New Dashboard ─────────────────────────────────── */}
      {(showNewDash || editDash) && (
        <Modal title={editDash ? "Edit Dashboard" : "New Dashboard"} onClose={() => { setShowNewDash(false); setEditDash(null); }}>
          <Field label="NAME">
            <TextInput value={form.name} onChange={v => setForm(f => ({...f, name: v}))} placeholder="e.g. Circle Launch Plan" autoFocus/>
          </Field>
          <Field label="SUBTITLE (optional)">
            <TextInput value={form.sub} onChange={v => setForm(f => ({...f, sub: v}))} placeholder="e.g. Platform Setup"/>
          </Field>
          <Field label="ICON">
            <EmojiPicker value={form.emoji} onChange={v => setForm(f => ({...f, emoji: v}))}/>
          </Field>
          <Field label="ACCENT COLOUR">
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {PALETTE.map(p => (
                <button key={p.color} onClick={() => setForm(f => ({...f, color: p.color}))} title={p.name}
                  style={{
                    width: 32, height: 32, borderRadius: "50%", background: p.color, cursor: "pointer",
                    border: `2px solid ${form.color === p.color ? "#fff" : "transparent"}`,
                    transition: "border 0.15s",
                  }}/>
              ))}
            </div>
          </Field>
          <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 8 }}>
            <Btn onClick={() => { setShowNewDash(false); setEditDash(null); }} ghost>Cancel</Btn>
            <Btn onClick={editDash ? saveEditDash : createDashboard} accent={form.color}>
              {editDash ? "Save Changes" : "Create Dashboard"}
            </Btn>
          </div>
        </Modal>
      )}

      {/* ── MODAL: New / Edit Section ────────────────────────────── */}
      {(showNewSection || editSection) && (
        <Modal title={editSection ? "Edit Section" : "New Section"} onClose={() => { setShowNewSection(false); setEditSection(null); }}>
          <Field label="SECTION NAME">
            <TextInput value={sectionForm.name} onChange={v => setSectionForm(f => ({...f, name: v}))} placeholder="e.g. Platform Setup" autoFocus/>
          </Field>
          <Field label="ICON">
            <EmojiPicker value={sectionForm.emoji} onChange={v => setSectionForm(f => ({...f, emoji: v}))}/>
          </Field>
          <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 8 }}>
            <Btn onClick={() => { setShowNewSection(false); setEditSection(null); }} ghost>Cancel</Btn>
            <Btn onClick={editSection ? saveEditSection : createSection} accent={activeDash?.color || GOLD}>
              {editSection ? "Save Changes" : "Add Section"}
            </Btn>
          </div>
        </Modal>
      )}

      {/* ── MODAL: Confirm Delete ─────────────────────────────────── */}
      {confirmDelete && (
        <Modal title="Are you sure?" onClose={() => setConfirmDelete(null)}>
          <p style={{ fontFamily: "Arial", fontSize: 25, color: MUTED, lineHeight: 1.6, margin: "0 0 24px" }}>
            {confirmDelete.type === "dashboard"
              ? "This will permanently delete the dashboard and all its sections and tasks."
              : "This will permanently delete the section and all its tasks."}
          </p>
          <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
            <Btn onClick={() => setConfirmDelete(null)} ghost>Cancel</Btn>
            <Btn danger onClick={() =>
              confirmDelete.type === "dashboard"
                ? deleteDashboard(confirmDelete.dashId)
                : deleteSection(confirmDelete.dashId, confirmDelete.sectionId)
            }>
              Delete
            </Btn>
          </div>
        </Modal>
      )}
    </div>
  );
}

