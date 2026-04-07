import { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";

// ─── Supabase ─────────────────────────────────────────────────────────────────
const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_KEY
);

// ─── Helpers ──────────────────────────────────────────────────────────────────
const uid     = () => Math.random().toString(36).slice(2,10);
const ini     = (n) => n.split(" ").slice(0,2).map(w=>w[0]).join("").toUpperCase();
const fmtDate = (iso) => new Date(iso).toLocaleDateString("en-GB",{day:"2-digit",month:"short",year:"numeric"});
const fmtFull = (iso) => new Date(iso).toLocaleString("en-GB",{day:"2-digit",month:"short",year:"numeric",hour:"2-digit",minute:"2-digit"});

const DEPTS = [
  "General","Resource","Process","Management System",
  "Biochemistry","Immunology","Haematology","Urinalysis",
  "Microbiology","Molecular Diagnostic"
];

const DEPT_COLOURS = {
  "General":             { bg:"rgba(0,123,255,.1)",   border:"rgba(0,123,255,.35)",  text:"#007BFF" },
  "Resource":            { bg:"rgba(112,128,144,.12)",border:"rgba(112,128,144,.4)", text:"#4a6070" },
  "Process":             { bg:"rgba(0,51,102,.12)",   border:"rgba(0,51,102,.35)",   text:"#003366" },
  "Management System":   { bg:"rgba(23,162,184,.1)",  border:"rgba(23,162,184,.35)", text:"#0d7a8f" },
  "Biochemistry":        { bg:"rgba(255,193,7,.1)",   border:"rgba(255,193,7,.35)",  text:"#856404" },
  "Immunology":          { bg:"rgba(111,66,193,.1)",  border:"rgba(111,66,193,.35)", text:"#6f42c1" },
  "Haematology":         { bg:"rgba(220,53,69,.1)",   border:"rgba(220,53,69,.35)",  text:"#dc3545" },
  "Urinalysis":          { bg:"rgba(255,133,27,.1)",  border:"rgba(255,133,27,.35)", text:"#c96000" },
  "Microbiology":        { bg:"rgba(40,167,69,.1)",   border:"rgba(40,167,69,.35)",  text:"#28a745" },
  "Molecular Diagnostic":{ bg:"rgba(0,86,179,.1)",    border:"rgba(0,86,179,.35)",   text:"#0056b3" },
};
const ds = (d) => DEPT_COLOURS[d] || { bg:"rgba(108,117,125,.1)", border:"rgba(108,117,125,.35)", text:"#6c757d" };

// ─── CSS ──────────────────────────────────────────────────────────────────────
const css = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Space+Mono:wght@400;700&display=swap');
  *,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
  :root{
    --navy:#003366;--navy2:#002244;
    --accent:#007BFF;--accent2:#0056b3;
    --slate:#708090;--bg:#F8F9FA;--card:#ffffff;
    --red:#dc3545;--green:#28a745;--gold:#856404;
    --text:#212529;--muted:#6c757d;--border:#dee2e6;
  }
  body{font-family:'Inter',sans-serif;background:var(--bg);color:var(--text);min-height:100vh;}
  .lw{min-height:100vh;display:flex;align-items:center;justify-content:center;
    background:linear-gradient(135deg,#003366 0%,#002244 60%,#004080 100%);}
  .lc{width:100%;max-width:400px;background:#fff;border-radius:16px;padding:40px 36px;
    box-shadow:0 20px 60px rgba(0,0,0,0.3);}
  .lm{width:56px;height:56px;border-radius:14px;background:linear-gradient(135deg,var(--navy),var(--accent));
    display:flex;align-items:center;justify-content:center;
    font-family:'Space Mono',monospace;font-size:18px;font-weight:700;color:#fff;margin:0 auto 16px;}
  .lt{font-size:22px;font-weight:700;text-align:center;color:var(--navy);}
  .ls{font-size:12px;color:var(--muted);text-align:center;margin-top:4px;margin-bottom:28px;}
  .err{background:#fff5f5;border:1px solid #f5c6cb;color:var(--red);border-radius:8px;padding:10px 14px;font-size:12px;margin-bottom:14px;}
  .hdr{background:var(--navy);border-bottom:3px solid var(--accent);padding:0 28px;
    display:flex;align-items:center;justify-content:space-between;height:64px;
    position:sticky;top:0;z-index:100;box-shadow:0 2px 12px rgba(0,0,0,0.2);}
  .logo{display:flex;align-items:center;gap:12px;}
  .logom{width:38px;height:38px;border-radius:10px;background:linear-gradient(135deg,var(--accent),var(--accent2));
    display:flex;align-items:center;justify-content:center;
    font-family:'Space Mono',monospace;font-size:13px;font-weight:700;color:#fff;}
  .logon{font-size:15px;font-weight:700;color:#fff;}
  .logos{font-size:10px;color:rgba(255,255,255,0.5);}
  .hr{display:flex;align-items:center;gap:10px;}
  .upill{display:flex;align-items:center;gap:8px;background:rgba(255,255,255,.1);
    border:1px solid rgba(255,255,255,.2);border-radius:999px;padding:5px 14px 5px 5px;}
  .uname{font-size:13px;font-weight:500;color:#fff;}
  .rb{font-size:9px;font-weight:700;letter-spacing:.7px;text-transform:uppercase;padding:2px 8px;border-radius:999px;}
  .rb.superadmin{background:rgba(220,53,69,.3);color:#ff8a94;border:1px solid rgba(220,53,69,.5);}
  .rb.admin{background:rgba(255,193,7,.2);color:#ffc107;border:1px solid rgba(255,193,7,.4);}
  .rb.staff{background:rgba(0,123,255,.25);color:#7ec8ff;border:1px solid rgba(0,123,255,.45);}
  .logoutbtn{background:none;border:none;color:rgba(255,255,255,.5);cursor:pointer;font-size:17px;}
  .logoutbtn:hover{color:var(--red);}
  .dept-tabs{background:#fff;border-bottom:2px solid var(--border);padding:0 28px;
    display:flex;gap:2px;overflow-x:auto;scrollbar-width:none;box-shadow:0 1px 4px rgba(0,0,0,.05);}
  .dept-tabs::-webkit-scrollbar{display:none;}
  .dept-tab{padding:12px 16px;font-size:12px;font-weight:600;color:var(--muted);cursor:pointer;
    border-bottom:3px solid transparent;margin-bottom:-2px;white-space:nowrap;transition:all .18s;
    background:none;border-top:none;border-left:none;border-right:none;font-family:'Inter',sans-serif;}
  .dept-tab:hover{color:var(--navy);}
  .dept-tab.active{color:var(--accent);border-bottom-color:var(--accent);}
  .pg{max-width:1100px;margin:0 auto;padding:28px 24px;}
  .topbar{display:flex;align-items:center;gap:12px;margin-bottom:22px;flex-wrap:wrap;}
  .sw{flex:1;min-width:200px;position:relative;}
  .sw input{width:100%;background:#fff;border:1px solid var(--border);border-radius:8px;
    padding:9px 12px 9px 36px;font-size:13px;color:var(--text);font-family:'Inter',sans-serif;
    outline:none;transition:all .18s;box-shadow:0 1px 3px rgba(0,0,0,.06);}
  .sw input:focus{border-color:var(--accent);box-shadow:0 0 0 3px rgba(0,123,255,.12);}
  .si{position:absolute;left:11px;top:50%;transform:translateY(-50%);color:var(--muted);font-size:13px;}
  .btn{display:inline-flex;align-items:center;gap:6px;padding:9px 18px;border-radius:8px;
    font-size:13px;font-weight:600;cursor:pointer;border:none;transition:all .18s;
    font-family:'Inter',sans-serif;white-space:nowrap;}
  .bp{background:var(--accent);color:#fff;}
  .bp:hover{background:var(--accent2);transform:translateY(-1px);box-shadow:0 4px 12px rgba(0,123,255,.3);}
  .bg{background:#fff;border:1px solid var(--border);color:var(--text);}
  .bg:hover{background:var(--bg);}
  .bd{background:#fff5f5;border:1px solid #f5c6cb;color:var(--red);}
  .bd:hover{background:#ffe0e3;}
  .ba{background:#f0fff4;border:1px solid #b2dfdb;color:var(--green);}
  .ba:hover{background:#d4edda;}
  .be{background:#fffbf0;border:1px solid #ffeeba;color:var(--gold);}
  .be:hover{background:#fff3cd;}
  .bsa{background:linear-gradient(135deg,var(--navy),var(--accent));color:#fff;}
  .bsa:hover{filter:brightness(1.1);transform:translateY(-1px);}
  .btn:disabled{opacity:.4;cursor:not-allowed;transform:none!important;box-shadow:none!important;}
  .sm{padding:5px 12px;font-size:11px;border-radius:6px;}
  .icon-btn{width:30px;height:30px;border-radius:7px;display:inline-flex;align-items:center;
    justify-content:center;cursor:pointer;border:1px solid var(--border);font-size:13px;
    transition:all .18s;background:#fff;font-family:'Inter',sans-serif;}
  .av{border-radius:50%;background:linear-gradient(135deg,var(--navy),var(--accent));
    display:flex;align-items:center;justify-content:center;font-weight:700;color:#fff;flex-shrink:0;}
  .av28{width:28px;height:28px;font-size:11px;}
  .av22{width:22px;height:22px;font-size:9px;}
  .avg{background:linear-gradient(135deg,var(--green),#1a7a3a)!important;}
  .sop-row{background:#fff;border:1px solid var(--border);border-radius:10px;
    transition:all .2s;margin-bottom:5px;box-shadow:0 1px 4px rgba(0,0,0,.04);}
  .sop-row:hover{border-color:var(--accent);box-shadow:0 3px 12px rgba(0,123,255,.1);}
  .sop-row.acked{border-color:#b2dfdb;opacity:.75;}
  .sop-title-row{display:flex;align-items:center;gap:8px;flex-wrap:wrap;}
  .stitle{font-size:13px;font-weight:600;line-height:1.35;color:var(--text);}
  .stitle.dim{color:var(--muted);}
  .tag{font-size:10px;font-weight:700;letter-spacing:.4px;text-transform:uppercase;
    padding:2px 8px;border-radius:999px;white-space:nowrap;}
  .tv{background:#fff8e1;color:var(--gold);border:1px solid #ffeeba;}
  .tok{background:#d4edda;color:#155724;border:1px solid #b2dfdb;}
  .sop-sub{display:flex;align-items:center;gap:8px;margin-top:3px;flex-wrap:wrap;}
  .muted11{font-size:11px;color:var(--muted);}
  .sop-actions{padding:10px 14px 10px 6px;display:flex;align-items:center;gap:6px;white-space:nowrap;}
  .ack-area{background:#f8f9fa;border-radius:0 0 10px 10px;border:1px solid var(--border);border-top:none;}
  .ack-inner{padding:14px 16px;}
  .ack-lbl{font-size:10px;font-weight:700;letter-spacing:.8px;text-transform:uppercase;color:var(--muted);margin-bottom:10px;}
  .ack-list{display:flex;flex-direction:column;gap:4px;}
  .ack-list-row{display:flex;align-items:center;gap:10px;background:#fff;border:1px solid var(--border);
    border-radius:7px;padding:7px 12px;}
  .ack-list-num{font-size:10px;font-weight:700;color:var(--muted);width:20px;flex-shrink:0;}
  .ack-list-name{font-size:12px;font-weight:600;color:var(--text);flex:1;}
  .ack-list-date{font-size:11px;color:var(--muted);}
  .no-acks{font-size:12px;color:var(--muted);font-style:italic;}
  .rdiv{display:flex;align-items:center;gap:10px;margin:10px 0 6px;}
  .rdline{flex:1;height:1px;background:#b2dfdb;}
  .rdlbl{font-size:10px;font-weight:700;letter-spacing:.7px;text-transform:uppercase;color:#28a745;white-space:nowrap;}
  .inp,.sel,.ta{width:100%;background:#fff;border:1px solid var(--border);border-radius:8px;
    padding:9px 13px;font-size:13px;color:var(--text);font-family:'Inter',sans-serif;outline:none;transition:all .18s;}
  .inp:focus,.sel:focus,.ta:focus{border-color:var(--accent);box-shadow:0 0 0 3px rgba(0,123,255,.1);}
  .sel option{background:#fff;}
  .ta{resize:vertical;min-height:70px;}
  .lbl{font-size:11px;font-weight:600;color:var(--slate);letter-spacing:.4px;text-transform:uppercase;margin-bottom:5px;display:block;}
  .fld{margin-bottom:14px;}
  .g2{display:grid;grid-template-columns:1fr 1fr;gap:12px;}
  .ov{position:fixed;inset:0;background:rgba(0,0,0,.4);backdrop-filter:blur(3px);
    z-index:200;display:flex;align-items:center;justify-content:center;padding:18px;animation:fi .18s;}
  .mo{background:#fff;border-radius:16px;box-shadow:0 20px 60px rgba(0,0,0,.2);
    padding:28px;width:100%;max-width:520px;max-height:92vh;overflow-y:auto;animation:su .22s;}
  .mttl{font-size:16px;font-weight:700;margin-bottom:20px;
    display:flex;align-items:center;justify-content:space-between;color:var(--navy);}
  .cbtn{background:none;border:none;color:var(--muted);cursor:pointer;font-size:22px;line-height:1;}
  .cbtn:hover{color:var(--red);}
  .warn-box{background:#fff8e1;border:1px solid #ffeeba;color:var(--gold);
    border-radius:8px;padding:10px 14px;font-size:12px;margin-bottom:14px;line-height:1.55;}
  .staff-row{display:flex;align-items:center;gap:12px;background:#fff;border:1px solid var(--border);
    border-radius:8px;padding:10px 14px;margin-bottom:6px;box-shadow:0 1px 3px rgba(0,0,0,.04);}
  .staff-info{flex:1;min-width:0;}
  .staff-name{font-size:13px;font-weight:600;color:var(--text);}
  .staff-id{font-size:11px;color:var(--muted);margin-top:2px;}
  .sec-card{background:#fff;border:1px solid var(--border);border-radius:12px;padding:22px;box-shadow:0 1px 4px rgba(0,0,0,.05);}
  .sec-ttl{font-size:14px;font-weight:700;color:var(--navy);margin-bottom:16px;
    display:flex;align-items:center;justify-content:space-between;padding-bottom:12px;border-bottom:1px solid var(--border);}
  .loading{display:flex;height:100vh;align-items:center;justify-content:center;
    font-family:'Inter',sans-serif;color:var(--accent);font-size:13px;flex-direction:column;gap:12px;}
  .spinner{width:32px;height:32px;border:3px solid #e9ecef;border-top-color:var(--accent);
    border-radius:50%;animation:spin .8s linear infinite;}
  .empty{text-align:center;padding:48px 0;color:var(--muted);font-size:13px;}
  @keyframes fi{from{opacity:0}to{opacity:1}}
  @keyframes su{from{transform:translateY(12px);opacity:0}to{transform:translateY(0);opacity:1}}
  @keyframes spin{to{transform:rotate(360deg)}}
`;

// ─── App ──────────────────────────────────────────────────────────────────────
export default function App() {
  const [user,       setUser]       = useState(null);
  const [users,      setUsers]      = useState([]);
  const [sops,       setSops]       = useState([]);
  const [reads,      setReads]      = useState([]);
  const [ready,      setReady]      = useState(false);
  const [activeDept, setActiveDept] = useState("All");
  const [search,     setSearch]     = useState("");
  const [addSopOpen,  setAddSopOpen]  = useState(false);
  const [editSop,     setEditSop]     = useState(null);
  const [addUserOpen, setAddUserOpen] = useState(false);
  const [delSop,      setDelSop]      = useState(null);
  const [showStaff,   setShowStaff]   = useState(false);

useEffect(() => {
  (async () => {
    const [{ data: u }, { data: s }, { data: r }] = await Promise.all([
      supabase.from("users").select("*"),
      supabase.from("sops").select("*"),
      supabase.from("reads").select("*"),   // ← this one line was missing
    ]);
    setUsers(u || []);
    setSops(s || []);
    setReads(r || []);
    setReady(true);
  })();
}, []);


  // Real-time: reads (acknowledgements)
  const readsSub = supabase.channel("reads-changes")
    .on("postgres_changes", { event: "*", schema: "public", table: "reads" }, (payload) => {
      if (payload.eventType === "INSERT") {
        setReads(prev => [...prev, payload.new]);
      }
      if (payload.eventType === "DELETE") {
        setReads(prev => prev.filter(r => r.id !== payload.old.id));
      }
    })
    .subscribe();

  // Real-time: sops
  const sopsSub = supabase.channel("sops-changes")
    .on("postgres_changes", { event: "*", schema: "public", table: "sops" }, (payload) => {
      if (payload.eventType === "INSERT") {
        setSops(prev => [...prev, payload.new]);
      }
      if (payload.eventType === "UPDATE") {
        setSops(prev => prev.map(s => s.id === payload.new.id ? payload.new : s));
      }
      if (payload.eventType === "DELETE") {
        setSops(prev => prev.filter(s => s.id !== payload.old.id));
      }
    })
    .subscribe();

  // Real-time: users
  const usersSub = supabase.channel("users-changes")
    .on("postgres_changes", { event: "*", schema: "public", table: "users" }, (payload) => {
      if (payload.eventType === "INSERT") {
        setUsers(prev => [...prev, payload.new]);
      }
      if (payload.eventType === "DELETE") {
        setUsers(prev => prev.filter(u => u.id !== payload.old.id));
      }
    })
    .subscribe();

  // Cleanup on unmount
  return () => {
    supabase.removeChannel(readsSub);
    supabase.removeChannel(sopsSub);
    supabase.removeChannel(usersSub);
  };
}, []);

const handleLogin = async (loginId, pass) => {
    const { data } = await supabase.from("users").select("*")
      .eq("login_id", loginId.toLowerCase().trim()).eq("password", pass).single();
    return data || null;
  };

  const handleAddUser = async (f) => {
    const newUser = { id: uid(), name: f.name, login_id: f.loginId, role: f.role, password: f.password };
    await supabase.from("users").insert(newUser);
    setUsers(prev => [...prev, newUser]);
    setAddUserOpen(false);
  };

  const handleRemoveUser = async (id) => {
    await supabase.from("users").delete().eq("id", id);
    setUsers(prev => prev.filter(u => u.id !== id));
  };

  const handleAddSop = async (f) => {
    const newSop = { id: uid(), title: f.title, version: f.version, department: f.department,
      description: f.description, url: f.url,
      uploaded_at: new Date().toISOString(), uploaded_by: user.name, version_hash: uid() };
    await supabase.from("sops").insert(newSop);
    setSops(prev => [...prev, newSop]);
    setAddSopOpen(false);
  };

  const handleEditSop = async (f) => {
    const orig = sops.find(s => s.id === f.id);
    const versionChanged = f.version !== orig.version;
    const updated = { ...orig, title: f.title, version: f.version, department: f.department,
      description: f.description, url: f.url,
      version_hash: versionChanged ? uid() : orig.version_hash };
    await supabase.from("sops").update(updated).eq("id", f.id);
    if (versionChanged) {
      await supabase.from("reads").delete().eq("sop_id", f.id);
      setReads(prev => prev.filter(r => r.sop_id !== f.id));
    }
    setSops(prev => prev.map(s => s.id === f.id ? updated : s));
    setEditSop(null);
  };

  const handleDelete = async (sop) => {
    await supabase.from("reads").delete().eq("sop_id", sop.id);
    await supabase.from("sops").delete().eq("id", sop.id);
    setSops(prev => prev.filter(s => s.id !== sop.id));
    setReads(prev => prev.filter(r => r.sop_id !== sop.id));
    setDelSop(null);
  };

  const handleDeduplicateReads = async () => {
    const seen = {};
    const toDelete = [];
    [...reads]
      .sort((a, b) => new Date(a.read_at) - new Date(b.read_at))
      .forEach(r => {
        const key = `${r.user_id}_${r.sop_id}_${r.version_hash}`;
        if (seen[key]) {
          toDelete.push(r.id);
        } else {
          seen[key] = true;
        }
      });

    if (toDelete.length === 0) {
      alert("✅ No duplicates found!");
      return;
    }

    const { error } = await supabase.from("reads").delete().in("id", toDelete);
    if (error) {
      alert("Failed to remove duplicates: " + error.message);
      return;
    }
    setReads(prev => prev.filter(r => !toDelete.includes(r.id)));
    alert(`✅ Removed ${toDelete.length} duplicate record${toDelete.length !== 1 ? "s" : ""}.`);
  };

const acknowledge = async (sop) => {
    const already = reads.find(r => r.sop_id === sop.id && r.version_hash === sop.version_hash && r.user_id === user.id);
    if (already) return;
    const newRead = { sop_id: sop.id, version_hash: sop.version_hash,
      user_id: user.id, user_name: user.name, read_at: new Date().toISOString() };
    const { data, error } = await supabase.from("reads").insert(newRead).select().single();
    if (error) {
      console.error("Insert failed:", error);
      alert("Failed to save acknowledgement. Please try again.");
      return;
    }
    if (data) {
      setReads(prev => [...prev, data]);
    }
  };  // ← this closing brace was missing
  

  const hasRead = (sop) => reads.some(r => r.sop_id === sop.id && r.version_hash === sop.version_hash && r.user_id === user?.id);
  const getAcks = (sop) => reads.filter(r => r.sop_id === sop.id && r.version_hash === sop.version_hash);

  const canManageSops  = user?.role === "admin" || user?.role === "superadmin";
  const canManageUsers = user?.role === "superadmin";

  if (!ready) return (
    <div className="loading">
      <style>{css}</style>
      <div className="spinner"/>
      <span>Loading SOP Portal…</span>
    </div>
  );

  if (!user) return <Login onLogin={handleLogin} setUser={setUser} />;

  const q          = search.toLowerCase();
  const filtered   = sops.filter(s => !q || s.title.toLowerCase().includes(q) || s.department.toLowerCase().includes(q));
  const depts      = [...new Set(sops.map(s => s.department))].sort();
  const tabDepts   = ["All", ...depts];
  const shown      = activeDept === "All" ? filtered : filtered.filter(s => s.department === activeDept);
  const shownDepts = [...new Set(shown.map(s => s.department))].sort();

  return (
    <>
      <style>{css}</style>
      <header className="hdr">
        <div className="logo">
          <div className="logom">GL</div>
          <div><div className="logon">Gnosis Laboratories</div><div className="logos">SOP Document Portal</div></div>
        </div>
        <div className="hr">
          {canManageUsers && (
            <button className="btn bd sm" onClick={handleDeduplicateReads}>
              🧹 Remove Duplicates
            </button>
          )}
          {canManageUsers && (
            <button className={`btn sm ${showStaff ? "bp" : "bsa"}`} onClick={() => setShowStaff(s => !s)}>
              {showStaff ? "📋 Back to SOPs" : "👥 Staff List"}
            </button>
          )}
          {canManageUsers && (
            <button className="btn bg sm" style={{color:"#fff",borderColor:"rgba(255,255,255,.3)"}} onClick={() => setAddUserOpen(true)}>👤 Add Staff</button>
          )}
          {canManageSops && (
            <button className="btn bg sm" style={{color:"#fff",borderColor:"rgba(255,255,255,.3)"}} onClick={() => setAddSopOpen(true)}>➕ Add SOP</button>
          )}
          <div className="upill">
            <div className="av av28">{ini(user.name)}</div>
            <span className="uname">{user.name}</span>
            <span className={`rb ${user.role}`}>{user.role}</span>
            <button className="logoutbtn" onClick={() => setUser(null)} title="Logout">⏻</button>
          </div>
        </div>
      </header>

      {!showStaff && (
        <div className="dept-tabs">
          {tabDepts.map(d => (
            <button key={d} className={`dept-tab${activeDept === d ? " active" : ""}`}
              onClick={() => setActiveDept(d)}>{d}</button>
          ))}
        </div>
      )}

      <div className="pg">
        {showStaff ? (
          <div className="sec-card">
            <div className="sec-ttl">
              <span>👥 Staff Account List</span>
              <span style={{fontSize:12,color:"var(--muted)",fontWeight:400}}>
                {users.filter(u => u.role !== "superadmin").length} accounts
              </span>
            </div>
            {users.filter(u => u.role !== "superadmin")
              .sort((a,b) => a.name.localeCompare(b.name))
              .map(u => (
                <div key={u.id} className="staff-row">
                  <div className="av av28">{ini(u.name)}</div>
                  <div className="staff-info">
                    <div className="staff-name">{u.name}</div>
                    <div className="staff-id">ID: <strong>{u.login_id}</strong> · <span className={`rb ${u.role}`}>{u.role}</span></div>
                  </div>
                  <button className="btn bd sm" onClick={() => handleRemoveUser(u.id)}>🗑 Remove</button>
                </div>
              ))}
          </div>
        ) : (
          <>
            <div className="topbar">
              <div className="sw">
                <span className="si">🔍</span>
                <input placeholder="Search SOPs…" value={search} onChange={e => setSearch(e.target.value)} />
              </div>
              <span className="muted11">{shown.length} document{shown.length !== 1 ? "s" : ""}</span>
            </div>
            {shownDepts.length === 0 && <div className="empty">No SOPs found.</div>}
            {shownDepts.map(dept => {
              const style  = ds(dept);
              const all    = shown.filter(s => s.department === dept);
              const unread = all.filter(s => !hasRead(s)).sort((a,b) => new Date(b.uploaded_at)-new Date(a.uploaded_at));
              const read   = all.filter(s =>  hasRead(s)).sort((a,b) => new Date(b.uploaded_at)-new Date(a.uploaded_at));
              return (
                <div key={dept} style={{marginBottom:28}}>
                  <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:12}}>
                    <div style={{fontSize:11,fontWeight:700,letterSpacing:.5,textTransform:"uppercase",
                      padding:"4px 13px",borderRadius:999,whiteSpace:"nowrap",
                      background:style.bg,border:`1px solid ${style.border}`,color:style.text}}>{dept}</div>
                    <span style={{fontSize:12,color:"var(--muted)"}}>{all.length} doc{all.length!==1?"s":""}</span>
                    <div style={{flex:1,height:1,background:"var(--border)"}}/>
                  </div>
                  {unread.map(sop => (
                    <SopRow key={sop.id} sop={sop} acks={getAcks(sop)} user={user}
                      myAck={getAcks(sop).find(r => r.user_id === user.id)}
                      onAck={acknowledge} onEdit={setEditSop} onDelete={setDelSop} canManage={canManageSops} />
                  ))}
                  {unread.length > 0 && read.length > 0 && (
                    <div className="rdiv"><div className="rdline"/><div className="rdlbl">✓ Acknowledged by me</div><div className="rdline"/></div>
                  )}
                  {read.map(sop => (
                    <SopRow key={sop.id} sop={sop} acks={getAcks(sop)} user={user}
                      myAck={getAcks(sop).find(r => r.user_id === user.id)}
                      onAck={acknowledge} onEdit={setEditSop} onDelete={setDelSop} canManage={canManageSops} isAcked />
                  ))}
                </div>
              );
            })}
          </>
        )}
      </div>

      {addSopOpen  && <SopModal onSave={handleAddSop} onClose={() => setAddSopOpen(false)} />}
      {editSop     && <SopModal sop={editSop} onSave={handleEditSop} onClose={() => setEditSop(null)} />}
      {addUserOpen && <UserModal onAdd={handleAddUser} onClose={() => setAddUserOpen(false)} />}
      {delSop && (
        <div className="ov">
          <div className="mo" style={{maxWidth:360}}>
            <div style={{textAlign:"center",padding:"6px 0 4px"}}>
              <div style={{fontSize:36,marginBottom:12}}>🗑️</div>
              <div style={{fontWeight:700,fontSize:15,marginBottom:8,color:"var(--navy)"}}>Delete this SOP?</div>
              <div style={{fontSize:12,color:"var(--muted)",marginBottom:20,lineHeight:1.65}}>
                <strong>{delSop.title}</strong><br/>All acknowledgement records will be permanently removed.
              </div>
              <div style={{display:"flex",gap:10,justifyContent:"center"}}>
                <button className="btn bg" onClick={() => setDelSop(null)}>Cancel</button>
                <button className="btn bd" onClick={() => handleDelete(delSop)}>Delete</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

// ─── SOP Row ──────────────────────────────────────────────────────────────────
function SopRow({ sop, acks, user, myAck, onAck, onEdit, onDelete, isAcked, canManage }) {
  const [open, setOpen] = useState(false);
  const sortedAcks = [...acks].sort((a,b) => a.user_name.localeCompare(b.user_name));
  return (
    <div style={{marginBottom:5}}>
      <div className={`sop-row${isAcked ? " acked" : ""}`}
        style={{display:"flex",alignItems:"center",borderRadius:open?"10px 10px 0 0":"10px",borderBottom:open?"none":""}}>
        <div style={{padding:"12px 4px 12px 14px",cursor:"pointer",color:"var(--muted)",fontSize:11,
          transition:"transform .2s",transform:open?"rotate(90deg)":"rotate(0deg)",flexShrink:0}}
          onClick={() => setOpen(o => !o)}>▶</div>
        <div style={{flex:1,minWidth:0,padding:"12px 10px 12px 6px",cursor:"pointer"}} onClick={() => setOpen(o => !o)}>
          <div className="sop-title-row">
            {isAcked && <span style={{fontSize:13}}>✅</span>}
            <span className={`stitle${isAcked ? " dim" : ""}`}>{sop.title}</span>
            <span className="tag tv">{sop.version}</span>
            {isAcked && <span className="tag tok">Acknowledged</span>}
          </div>
          <div className="sop-sub">
            <span className="muted11">Uploaded {fmtDate(sop.uploaded_at)}</span>
            <span className="muted11">·</span>
            <span className="muted11">{sop.uploaded_by}</span>
            <span className="muted11">·</span>
            <span className="muted11">👥 {acks.length} ack{acks.length !== 1 ? "s" : ""}</span>
          </div>
        </div>
        <div className="sop-actions">
          {sop.url
            ? <button className="btn bg sm" onClick={e => { e.stopPropagation(); window.open(sop.url,"_blank","noopener,noreferrer"); }}>📎 Open</button>
            : <span className="btn bg sm" style={{opacity:.35,cursor:"default",pointerEvents:"none"}}>📎 No link</span>
          }
          {!myAck
            ? <button className="btn ba sm" onClick={e => { e.stopPropagation(); onAck(sop); }}>✓ Acknowledge</button>
            : <span className="btn" style={{background:"#d4edda",border:"1px solid #b2dfdb",color:"#155724",fontSize:11,padding:"5px 12px",borderRadius:6,cursor:"default"}}>✅ Done</span>
          }
          {canManage && <>
            <button className="icon-btn be" style={{background:"#fffbf0",borderColor:"#ffeeba",color:"#856404"}}
              onClick={e => { e.stopPropagation(); onEdit(sop); }} title="Edit">✏️</button>
            <button className="icon-btn bd" style={{background:"#fff5f5",borderColor:"#f5c6cb",color:"var(--red)"}}
              onClick={e => { e.stopPropagation(); onDelete(sop); }} title="Delete">🗑️</button>
          </>}
        </div>
      </div>
      {open && (
        <div className="ack-area">
          <div className="ack-inner">
            {sop.description && <p style={{fontSize:12,color:"var(--muted)",marginBottom:12,lineHeight:1.65}}>{sop.description}</p>}
            <div className="ack-lbl">Who has acknowledged ({sortedAcks.length})</div>
            {sortedAcks.length === 0
              ? <div className="no-acks">No one has acknowledged this document yet.</div>
              : <div className="ack-list">
                  {sortedAcks.map((a, i) => (
                    <div key={i} className="ack-list-row">
                      <span className="ack-list-num">{i+1}.</span>
                      <div className="av av22 avg">{ini(a.user_name)}</div>
                      <span className="ack-list-name">{a.user_name}</span>
                      <span className="ack-list-date">{fmtDate(a.read_at)}</span>
                    </div>
                  ))}
                </div>
            }
            {myAck && <p style={{fontSize:11,color:"var(--green)",marginTop:10}}>✅ You acknowledged on {fmtFull(myAck.read_at)}</p>}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── SOP Modal ────────────────────────────────────────────────────────────────
function SopModal({ sop, onSave, onClose }) {
  const isEdit = !!sop;
  const [f, setF] = useState(sop
    ? { id:sop.id, title:sop.title, version:sop.version, department:sop.department, description:sop.description||"", url:sop.url||"" }
    : { title:"", version:"v1.0", department:"", description:"", url:"" }
  );
  const set = (k, v) => setF(p => ({ ...p, [k]: v }));
  const versionChanged = isEdit && f.version !== sop.version;
  return (
    <div className="ov" onClick={onClose}>
      <div className="mo" onClick={e => e.stopPropagation()}>
        <div className="mttl">
          <span>{isEdit ? "✏️ Edit SOP" : "➕ Add New SOP"}</span>
          <button className="cbtn" onClick={onClose}>×</button>
        </div>
        {versionChanged && (
          <div className="warn-box">
            ⚠️ Version changed from <strong>{sop.version}</strong> to <strong>{f.version}</strong> — this will reset all acknowledgements.
          </div>
        )}
        <div className="fld"><label className="lbl">Document Title *</label>
          <input className="inp" placeholder="e.g. TP-QC-001 Internal QC Procedure" value={f.title} onChange={e => set("title", e.target.value)} /></div>
        <div className="g2">
          <div className="fld"><label className="lbl">Version *</label>
            <input className="inp" placeholder="v1.0" value={f.version} onChange={e => set("version", e.target.value)} /></div>
          <div className="fld"><label className="lbl">Department *</label>
            <select className="sel" value={f.department} onChange={e => set("department", e.target.value)}>
              <option value="">Select…</option>
              {DEPTS.map(d => <option key={d}>{d}</option>)}
            </select></div>
        </div>
        <div className="fld"><label className="lbl">Document URL</label>
          <input className="inp" placeholder="https://drive.google.com/…" value={f.url} onChange={e => set("url", e.target.value)} /></div>
        <div className="fld"><label className="lbl">Description</label>
          <textarea className="ta" placeholder="Brief scope and purpose of this SOP…" value={f.description} onChange={e => set("description", e.target.value)} /></div>
        <div style={{display:"flex",gap:10,justifyContent:"flex-end",marginTop:6}}>
          <button className="btn bg" onClick={onClose}>Cancel</button>
          <button className="btn bp" onClick={() => onSave(f)} disabled={!f.title || !f.version || !f.department}>
            {isEdit ? "Save Changes" : "Add SOP"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── User Modal ───────────────────────────────────────────────────────────────
function UserModal({ onAdd, onClose }) {
  const [f, setF] = useState({ name:"", loginId:"", password:"", role:"staff" });
  const set = (k, v) => setF(p => ({ ...p, [k]: v }));
  return (
    <div className="ov" onClick={onClose}>
      <div className="mo" style={{maxWidth:420}} onClick={e => e.stopPropagation()}>
        <div className="mttl"><span>👤 Add Staff Member</span><button className="cbtn" onClick={onClose}>×</button></div>
        <div className="fld"><label className="lbl">Full Name *</label>
          <input className="inp" placeholder="Full name" value={f.name} onChange={e => set("name", e.target.value)} /></div>
        <div className="g2">
          <div className="fld"><label className="lbl">Login ID *</label>
            <input className="inp" placeholder="e.g. lee001" value={f.loginId} onChange={e => set("loginId", e.target.value)} /></div>
          <div className="fld"><label className="lbl">Password *</label>
            <input className="inp" placeholder="Password" value={f.password} onChange={e => set("password", e.target.value)} /></div>
        </div>
        <div className="fld"><label className="lbl">Role</label>
          <select className="sel" value={f.role} onChange={e => set("role", e.target.value)}>
            <option value="staff">Staff</option>
            <option value="admin">Admin</option>
          </select></div>
        <div style={{display:"flex",gap:10,justifyContent:"flex-end",marginTop:6}}>
          <button className="btn bg" onClick={onClose}>Cancel</button>
          <button className="btn bp" onClick={() => onAdd(f)} disabled={!f.name || !f.loginId || !f.password}>Add Member</button>
        </div>
      </div>
    </div>
  );
}

// ─── Login ────────────────────────────────────────────────────────────────────
function Login({ onLogin, setUser }) {
  const [loginId, setLoginId] = useState("");
  const [pass,    setPass]    = useState("");
  const [err,     setErr]     = useState("");
  const [loading, setLoading] = useState(false);
  const go = async () => {
    if (!loginId || !pass) return;
    setLoading(true); setErr("");
    const u = await onLogin(loginId, pass);
    if (u) setUser(u);
    else   setErr("Invalid ID or password.");
    setLoading(false);
  };
  return (
    <div className="lw">
      <style>{css}</style>
      <div className="lc">
        <div className="lm">GL</div>
        <div className="lt">SOP Portal</div>
        <div className="ls">Gnosis Laboratories · Document Acknowledgement System</div>
        {err && <div className="err">⚠️ {err}</div>}
        <div className="fld"><label className="lbl">Staff ID</label>
          <input className="inp" placeholder="Enter your ID" value={loginId}
            onChange={e => setLoginId(e.target.value)} onKeyDown={e => e.key === "Enter" && go()} /></div>
        <div className="fld"><label className="lbl">Password</label>
          <input className="inp" type="password" placeholder="••••••••" value={pass}
            onChange={e => setPass(e.target.value)} onKeyDown={e => e.key === "Enter" && go()} /></div>
        <button className="btn bp" style={{width:"100%",justifyContent:"center",marginTop:6}}
          onClick={go} disabled={loading}>{loading ? "Signing in…" : "Sign In →"}</button>
      </div>
    </div>
  );
}
