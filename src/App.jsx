import { useState, useEffect } from "react";

// ─── Storage ──────────────────────────────────────────────────────────────────
const store = {
  get(k)    { try { return JSON.parse(localStorage.getItem(k)); } catch { return null; } },
  set(k, v) { localStorage.setItem(k, JSON.stringify(v)); },
};

// ─── Seeds ────────────────────────────────────────────────────────────────────
const SEED_USERS = [
  { id:"u1", name:"Superadmin",                loginId:"gnosislab", role:"superadmin", password:"gnosis720325" },
  { id:"u2", name:"Admin",                     loginId:"hqlab2",    role:"admin",      password:"admin123"     },
  { id:"u3", name:"Lee Ket Siong",             loginId:"lee001",    role:"staff",      password:"staff123"     },
  { id:"u4", name:"Sivhesangari",              loginId:"siv001",    role:"staff",      password:"staff123"     },
  { id:"u5", name:"Erzawati Binti Abdul Sani", loginId:"erza001",   role:"staff",      password:"staff123"     },
];

const SEED_SOPS = [
  { id:"s1", title:"TP-QC-001 Internal Quality Control Procedure", version:"v2.1", department:"Haematology",  uploadedAt:"2025-03-01T08:00:00Z", uploadedBy:"Admin", url:"", description:"Covers IQC including Levey-Jennings charts and Westgard rules for all analysers.", version_hash:"h001" },
  { id:"s2", title:"TP-MB-007 Urine Culture Processing",           version:"v1.0", department:"Microbiology", uploadedAt:"2025-01-20T08:00:00Z", uploadedBy:"Admin", url:"", description:"Specimen plating, incubation, and colony identification workflow.", version_hash:"h003" },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────
const uid     = () => Math.random().toString(36).slice(2,10);
const ini     = (n) => n.split(" ").slice(0,2).map(w=>w[0]).join("").toUpperCase();
const fmtDate = (iso) => new Date(iso).toLocaleDateString("en-GB",{day:"2-digit",month:"short",year:"numeric"});
const fmtFull = (iso) => new Date(iso).toLocaleString("en-GB",{day:"2-digit",month:"short",year:"numeric",hour:"2-digit",minute:"2-digit"});
const readKey = (sop) => `${sop.id}_${sop.version_hash}`;

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
    --navy:#003366;--navy2:#002244;--navy3:#001833;
    --accent:#007BFF;--accent2:#0056b3;
    --slate:#708090;--bg:#F8F9FA;--card:#ffffff;
    --red:#dc3545;--green:#28a745;--gold:#856404;
    --text:#212529;--muted:#6c757d;--border:#dee2e6;
  }
  body{font-family:'Inter',sans-serif;background:var(--bg);color:var(--text);min-height:100vh;}

  /* Login */
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

  /* Header */
  .hdr{background:var(--navy);border-bottom:3px solid var(--accent);
    padding:0 28px;display:flex;align-items:center;justify-content:space-between;
    height:64px;position:sticky;top:0;z-index:100;box-shadow:0 2px 12px rgba(0,0,0,0.2);}
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

  /* Dept Tabs */
  .dept-tabs{background:#fff;border-bottom:2px solid var(--border);padding:0 28px;
    display:flex;gap:2px;overflow-x:auto;scrollbar-width:none;box-shadow:0 1px 4px rgba(0,0,0,.05);}
  .dept-tabs::-webkit-scrollbar{display:none;}
  .dept-tab{padding:12px 16px;font-size:12px;font-weight:600;color:var(--muted);cursor:pointer;
    border-bottom:3px solid transparent;margin-bottom:-2px;white-space:nowrap;transition:all .18s;
    background:none;border-top:none;border-left:none;border-right:none;font-family:'Inter',sans-serif;}
  .dept-tab:hover{color:var(--navy);}
  .dept-tab.active{color:var(--accent);border-bottom-color:var(--accent);}

  /* Layout */
  .pg{max-width:1100px;margin:0 auto;padding:28px 24px;}
  .topbar{display:flex;align-items:center;gap:12px;margin-bottom:22px;flex-wrap:wrap;}
  .sw{flex:1;min-width:200px;position:relative;}
  .sw input{width:100%;background:#fff;border:1px solid var(--border);border-radius:8px;
    padding:9px 12px 9px 36px;font-size:13px;color:var(--text);font-family:'Inter',sans-serif;
    outline:none;transition:all .18s;box-shadow:0 1px 3px rgba(0,0,0,.06);}
  .sw input:focus{border-color:var(--accent);box-shadow:0 0 0 3px rgba(0,123,255,.12);}
  .si{position:absolute;left:11px;top:50%;transform:translateY(-50%);color:var(--muted);font-size:13px;}

  /* Buttons */
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

  /* Avatar */
  .av{border-radius:50%;background:linear-gradient(135deg,var(--navy),var(--accent));
    display:flex;align-items:center;justify-content:center;font-weight:700;color:#fff;flex-shrink:0;}
  .av28{width:28px;height:28px;font-size:11px;}
  .av22{width:22px;height:22px;font-size:9px;}
  .avg{background:linear-gradient(135deg,var(--green),#1a7a3a)!important;}

  /* SOP Row */
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

  /* Ack area */
  .ack-area{background:#f8f9fa;border-radius:0 0 10px 10px;border:1px solid var(--border);border-top:none;}
  .ack-inner{padding:14px 16px;}
  .ack-lbl{font-size:10px;font-weight:700;letter-spacing:.8px;text-transform:uppercase;
    color:var(--muted);margin-bottom:10px;}
  .ack-list{display:flex;flex-direction:column;gap:4px;}
  .ack-list-row{display:flex;align-items:center;gap:10px;background:#fff;border:1px solid var(--border);
    border-radius:7px;padding:7px 12px;}
  .ack-list-num{font-size:10px;font-weight:700;color:var(--muted);width:20px;flex-shrink:0;}
  .ack-list-name{font-size:12px;font-weight:600;color:var(--text);flex:1;}
  .ack-list-date{font-size:11px;color:var(--muted);}
  .no-acks{font-size:12px;color:var(--muted);font-style:italic;}

  .rdiv{display:flex;align-items:center;gap:10px;margin:10px 0 6px;}
  .rdline{flex:1;height:1px;background:#b2dfdb;}
  .rdlbl{font-size:10px;font-weight:700;letter-spacing:.7px;text-transform:uppercase;
    color:#28a745;white-space:nowrap;}

  /* Form */
  .inp,.sel,.ta{width:100%;background:#fff;border:1px solid var(--border);border-radius:8px;
    padding:9px 13px;font-size:13px;color:var(--text);font-family:'Inter',sans-serif;
    outline:none;transition:all .18s;}
  .inp:focus,.sel:focus,.ta:focus{border-color:var(--accent);box-shadow:0 0 0 3px rgba(0,123,255,.1);}
  .sel option{background:#fff;}
  .ta{resize:vertical;min-height:70px;}
  .lbl{font-size:11px;font-weight:600;color:var(--slate);letter-spacing:.4px;
    text-transform:uppercase;margin-bottom:5px;display:block;}
  .fld{margin-bottom:14px;}
  .g2{display:grid;grid-template-columns:1fr 1fr;gap:12px;}

  /* Modal */
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

  /* Staff list */
  .staff-row{display:flex;align-items:center;gap:12px;background:#fff;border:1px solid var(--border);
    border-radius:8px;padding:10px 14px;margin-bottom:6px;box-shadow:0 1px 3px rgba(0,0,0,.04);}
  .staff-info{flex:1;min-width:0;}
  .staff-name{font-size:13px;font-weight:600;color:var(--text);}
  .staff-id{font-size:11px;color:var(--muted);margin-top:2px;}
  .sec-card{background:#fff;border:1px solid var(--border);border-radius:12px;padding:22px;
    box-shadow:0 1px 4px rgba(0,0,0,.05);}
  .sec-ttl{font-size:14px;font-weight:700;color:var(--navy);margin-bottom:16px;
    display:flex;align-items:center;justify-content:space-between;padding-bottom:12px;
    border-bottom:1px solid var(--border);}

  .empty{text-align:center;padding:48px 0;color:var(--muted);font-size:13px;}
  @keyframes fi{from{opacity:0}to{opacity:1}}
  @keyframes su{from{transform:translateY(12px);opacity:0}to{transform:translateY(0);opacity:1}}
`;

// ─── App ──────────────────────────────────────────────────────────────────────
export default function App() {
  const [user,       setUser]       = useState(null);
  const [users,      setUsers]      = useState([]);
  const [sops,       setSops]       = useState([]);
  const [reads,      setReads]      = useState({});
  const [ready,      setReady]      = useState(false);
  const [activeDept, setActiveDept] = useState("All");
  const [search,     setSearch]     = useState("");
  const [addSopOpen,  setAddSopOpen]  = useState(false);
  const [editSop,     setEditSop]     = useState(null);
  const [addUserOpen, setAddUserOpen] = useState(false);
  const [delSop,      setDelSop]      = useState(null);
  const [showStaff,   setShowStaff]   = useState(false);

  useEffect(() => {
    let u = store.get("sop_users"); if (!u) { u = SEED_USERS; store.set("sop_users", u); }
    let s = store.get("sop_docs");  if (!s) { s = SEED_SOPS;  store.set("sop_docs",  s); }
    let r = store.get("sop_reads"); if (!r) { r = {};          store.set("sop_reads", r); }
    setUsers(u); setSops(s); setReads(r); setReady(true);
  }, []);

  const saveUsers = u => { setUsers(u); store.set("sop_users", u); };
  const saveSops  = s => { setSops(s);  store.set("sop_docs",  s); };
  const saveReads = r => { setReads(r); store.set("sop_reads", r); };

  const acknowledge = sop => {
    const k = readKey(sop), list = reads[k] || [];
    if (list.find(r => r.userId === user.id)) return;
    saveReads({ ...reads, [k]: [...list, { userId:user.id, userName:user.name, readAt:new Date().toISOString() }] });
  };

  const hasRead = sop => (reads[readKey(sop)] || []).some(r => r.userId === user?.id);
  const getAcks = sop =>  reads[readKey(sop)] || [];

  const handleAddSop = data => {
    saveSops([...sops, { id:uid(), ...data, uploadedAt:new Date().toISOString(), uploadedBy:user.name, version_hash:uid() }]);
    setAddSopOpen(false);
  };

  const handleEditSop = data => {
    saveSops(sops.map(s => s.id === data.id
      ? { ...s, ...data, version_hash: data.version !== s.version ? uid() : s.version_hash }
      : s
    ));
    setEditSop(null);
  };

  const handleDelete = sop => {
    const cr = { ...reads };
    Object.keys(cr).filter(k => k.startsWith(sop.id + "_")).forEach(k => delete cr[k]);
    saveSops(sops.filter(s => s.id !== sop.id));
    saveReads(cr);
    setDelSop(null);
  };

  const handleRemoveUser = id_ => saveUsers(users.filter(u => u.id !== id_));

  const canManageSops  = user?.role === "admin" || user?.role === "superadmin";
  const canManageUsers = user?.role === "superadmin";

  if (!ready) return <div style={{display:"flex",height:"100vh",alignItems:"center",justifyContent:"center",fontFamily:"Inter,sans-serif",color:"#007BFF",fontSize:13}}>Loading…</div>;
  if (!user)  return <Login users={users} onLogin={setUser} />;

  const q        = search.toLowerCase();
  const filtered = sops.filter(s => !q || s.title.toLowerCase().includes(q) || s.department.toLowerCase().includes(q));
  const depts    = [...new Set(sops.map(s => s.department))].sort();
  const tabDepts = ["All", ...depts];
  const shown    = activeDept === "All" ? filtered : filtered.filter(s => s.department === activeDept);
  const shownDepts = [...new Set(shown.map(s => s.department))].sort();

  return (
    <>
      <style>{css}</style>

      {/* Header */}
      <header className="hdr">
        <div className="logo">
          <div className="logom">GL</div>
          <div>
            <div className="logon">Gnosis Laboratories</div>
            <div className="logos">SOP Document Portal</div>
          </div>
        </div>
        <div className="hr">
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

      {/* Dept Tabs — hidden on staff view */}
      {!showStaff && (
        <div className="dept-tabs">
          {tabDepts.map(d => (
            <button key={d} className={`dept-tab${activeDept === d ? " active" : ""}`}
              onClick={() => setActiveDept(d)}>{d}</button>
          ))}
        </div>
      )}

      {/* Page */}
      <div className="pg">

        {/* Staff List View */}
        {showStaff ? (
          <div className="sec-card">
            <div className="sec-ttl">
              <span>👥 Staff Account List</span>
              <span style={{fontSize:12,color:"var(--muted)",fontWeight:400}}>
                {users.filter(u => u.role !== "superadmin").length} accounts
              </span>
            </div>
            {users.filter(u => u.role !== "superadmin").sort((a,b) => a.name.localeCompare(b.name)).map(u => (
              <div key={u.id} className="staff-row">
                <div className="av av28">{ini(u.name)}</div>
                <div className="staff-info">
                  <div className="staff-name">{u.name}</div>
                  <div className="staff-id">ID: <strong>{u.loginId}</strong> · <span className={`rb ${u.role}`}>{u.role}</span></div>
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
              const unread = all.filter(s => !hasRead(s)).sort((a,b) => new Date(b.uploadedAt)-new Date(a.uploadedAt));
              const read   = all.filter(s =>  hasRead(s)).sort((a,b) => new Date(b.uploadedAt)-new Date(a.uploadedAt));
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
                      myAck={getAcks(sop).find(r => r.userId === user.id)}
                      onAck={acknowledge} onEdit={setEditSop} onDelete={setDelSop}
                      canManage={canManageSops} />
                  ))}
                  {unread.length > 0 && read.length > 0 && (
                    <div className="rdiv"><div className="rdline"/><div className="rdlbl">✓ Acknowledged by me</div><div className="rdline"/></div>
                  )}
                  {read.map(sop => (
                    <SopRow key={sop.id} sop={sop} acks={getAcks(sop)} user={user}
                      myAck={getAcks(sop).find(r => r.userId === user.id)}
                      onAck={acknowledge} onEdit={setEditSop} onDelete={setDelSop}
                      canManage={canManageSops} isAcked />
                  ))}
                </div>
              );
            })}
          </>
        )}
      </div>

      {/* Modals */}
      {addSopOpen  && <SopModal onSave={handleAddSop} onClose={() => setAddSopOpen(false)} />}
      {editSop     && <SopModal sop={editSop} onSave={handleEditSop} onClose={() => setEditSop(null)} />}
      {addUserOpen && <UserModal onAdd={u => { saveUsers([...users, { id:uid(), ...u }]); setAddUserOpen(false); }} onClose={() => setAddUserOpen(false)} />}

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
  const sortedAcks = [...acks].sort((a,b) => a.userName.localeCompare(b.userName));

  return (
    <div style={{marginBottom:5}}>
      <div className={`sop-row${isAcked ? " acked" : ""}`}
        style={{display:"flex",alignItems:"center",borderRadius:open?"10px 10px 0 0":"10px",borderBottom:open?"none":""}}>

        <div style={{padding:"12px 4px 12px 14px",cursor:"pointer",color:"var(--muted)",fontSize:11,
          transition:"transform .2s",transform:open?"rotate(90deg)":"rotate(0deg)",flexShrink:0}}
          onClick={() => setOpen(o => !o)}>▶</div>

        <div style={{flex:1,minWidth:0,padding:"12px 10px 12px 6px",cursor:"pointer"}}
          onClick={() => setOpen(o => !o)}>
          <div className="sop-title-row">
            {isAcked && <span style={{fontSize:13}}>✅</span>}
            <span className={`stitle${isAcked ? " dim" : ""}`}>{sop.title}</span>
            <span className="tag tv">{sop.version}</span>
            {isAcked && <span className="tag tok">Acknowledged</span>}
          </div>
          <div className="sop-sub">
            <span className="muted11">Uploaded {fmtDate(sop.uploadedAt)}</span>
            <span className="muted11">·</span>
            <span className="muted11">{sop.uploadedBy}</span>
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
                      <div className="av av22 avg">{ini(a.userName)}</div>
                      <span className="ack-list-name">{a.userName}</span>
                      <span className="ack-list-date">{fmtDate(a.readAt)}</span>
                    </div>
                  ))}
                </div>
            }
            {myAck && <p style={{fontSize:11,color:"var(--green)",marginTop:10}}>✅ You acknowledged on {fmtFull(myAck.readAt)}</p>}
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
  const [f, setF] = useState({ name:"", loginId:"", password:"staff123", role:"staff" });
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
          <div className="fld"><label className="lbl">Password</label>
            <input className="inp" value={f.password} onChange={e => set("password", e.target.value)} /></div>
        </div>
        <div className="fld"><label className="lbl">Role</label>
          <select className="sel" value={f.role} onChange={e => set("role", e.target.value)}>
            <option value="staff">Staff</option>
            <option value="admin">Admin</option>
          </select></div>
        <div style={{display:"flex",gap:10,justifyContent:"flex-end",marginTop:6}}>
          <button className="btn bg" onClick={onClose}>Cancel</button>
          <button className="btn bp" onClick={() => onAdd(f)} disabled={!f.name || !f.loginId}>Add Member</button>
        </div>
      </div>
    </div>
  );
}

// ─── Login ────────────────────────────────────────────────────────────────────
function Login({ users, onLogin }) {
  const [loginId, setLoginId] = useState("");
  const [pass,    setPass]    = useState("");
  const [err,     setErr]     = useState("");
  const go = () => {
    const u = users.find(u => u.loginId.toLowerCase() === loginId.toLowerCase().trim() && u.password === pass);
    u ? onLogin(u) : setErr("Invalid ID or password.");
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
        <button className="btn bp" style={{width:"100%",justifyContent:"center",marginTop:6}} onClick={go}>Sign In →</button>
      </div>
    </div>
  );
}
