import { useState, useEffect } from "react";

// ─── Storage (localStorage) ───────────────────────────────────────────────────
const store = {
  get(k)    { try { return JSON.parse(localStorage.getItem(k)); } catch { return null; } },
  set(k, v) { localStorage.setItem(k, JSON.stringify(v)); },
};

// ─── Seeds ────────────────────────────────────────────────────────────────────
const SEED_USERS = [
  { id:"u1", name:"Admin",                    email:"hqlab2@gnosis-healthcare.com", role:"admin", password:"admin123" },
  { id:"u2", name:"Lee Ket Siong",             email:"lee@gnosis.lab",  role:"staff", password:"staff123" },
  { id:"u3", name:"Sivhesangari",              email:"siv@gnosis.lab",  role:"staff", password:"staff123" },
  { id:"u4", name:"Erzawati Binti Abdul Sani", email:"erza@gnosis.lab", role:"staff", password:"staff123" },
];
const SEED_SOPS = [
  { id:"s1", title:"TP-QC-001 Internal Quality Control Procedure",  version:"v2.1", department:"Quality",      uploadedAt:"2025-03-01T08:00:00Z", uploadedBy:"Admin", url:"", description:"Covers IQC including Levey-Jennings charts and Westgard rules for all analysers.", version_hash:"h001" },
  { id:"s2", title:"TP-BB-003 Blood Bank Crossmatch Procedure",     version:"v1.4", department:"Blood Bank",   uploadedAt:"2025-02-14T08:00:00Z", uploadedBy:"Admin", url:"", description:"Gel card crossmatch, AHG phase, and emergency release procedures.", version_hash:"h002" },
  { id:"s3", title:"TP-MB-007 Urine Culture Processing",            version:"v1.0", department:"Microbiology", uploadedAt:"2025-01-20T08:00:00Z", uploadedBy:"Admin", url:"", description:"Specimen plating, incubation, and colony identification workflow.", version_hash:"h003" },
  { id:"s4", title:"TP-BB-001 ABO & RhD Blood Grouping",            version:"v3.0", department:"Blood Bank",   uploadedAt:"2025-03-10T08:00:00Z", uploadedBy:"Admin", url:"", description:"Forward and reverse grouping using gel card method.", version_hash:"h004" },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────
const uid     = () => Math.random().toString(36).slice(2,10);
const ini     = (n) => n.split(" ").slice(0,2).map(w=>w[0]).join("").toUpperCase();
const fmtDate = (iso) => new Date(iso).toLocaleDateString("en-GB",{day:"2-digit",month:"short",year:"numeric"});
const fmtFull = (iso) => new Date(iso).toLocaleString("en-GB",{day:"2-digit",month:"short",year:"numeric",hour:"2-digit",minute:"2-digit"});
const readKey = (sop) => `${sop.id}_${sop.version_hash}`;

const DEPT_COLOURS = {
  "Quality":        { bg:"rgba(23,169,158,.14)", border:"rgba(23,169,158,.45)", text:"#20C5B9" },
  "Blood Bank":     { bg:"rgba(224,82,82,.13)",  border:"rgba(224,82,82,.45)",  text:"#E87878" },
  "Microbiology":   { bg:"rgba(156,99,255,.13)", border:"rgba(156,99,255,.45)", text:"#B990FF" },
  "Haematology":    { bg:"rgba(245,200,66,.13)", border:"rgba(245,200,66,.45)", text:"#F5C842" },
  "Chemistry":      { bg:"rgba(66,165,245,.13)", border:"rgba(66,165,245,.45)", text:"#64B5F6" },
  "Administration": { bg:"rgba(255,165,66,.13)", border:"rgba(255,165,66,.45)", text:"#FFB366" },
};
const ds    = (d) => DEPT_COLOURS[d] || { bg:"rgba(255,255,255,.07)", border:"rgba(255,255,255,.18)", text:"#aaa" };
const DEPTS = ["Quality","Blood Bank","Microbiology","Haematology","Chemistry","Administration","Other"];

// ─── CSS ──────────────────────────────────────────────────────────────────────
const css = `
  @import url('https://fonts.googleapis.com/css2?family=Sora:wght@300;400;500;600;700&family=Space+Mono:wght@400;700&display=swap');
  *,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
  :root{
    --navy:#0D1B2A;--navy2:#162540;--navy3:#0a1520;
    --teal:#17A99E;--teal2:#0F7A72;--tl:#20C5B9;
    --gold:#F5C842;--red:#E05252;--green:#2ECC71;
    --text:#E8EDF2;--muted:#7A8FA6;
    --card:rgba(22,37,64,0.88);--border:rgba(23,169,158,0.22);
  }
  body{font-family:'Sora',sans-serif;background:var(--navy);color:var(--text);min-height:100vh;}

  .lw{min-height:100vh;display:flex;align-items:center;justify-content:center;
    background:radial-gradient(ellipse at 30% 40%,rgba(23,169,158,.14) 0%,transparent 58%),var(--navy3);}
  .lc{width:100%;max-width:390px;background:var(--card);border:1px solid var(--border);border-radius:20px;padding:38px 32px;}
  .lm{width:52px;height:52px;border-radius:14px;background:linear-gradient(135deg,var(--teal),var(--teal2));
    display:flex;align-items:center;justify-content:center;
    font-family:'Space Mono',monospace;font-size:18px;font-weight:700;color:#fff;margin:0 auto 14px;}
  .lt{font-size:20px;font-weight:700;text-align:center;}
  .ls{font-size:11px;color:var(--muted);text-align:center;margin-top:4px;margin-bottom:26px;}
  .err{background:rgba(224,82,82,.13);border:1px solid rgba(224,82,82,.4);color:#E87878;border-radius:9px;padding:10px 14px;font-size:12px;margin-bottom:14px;}

  .hdr{background:linear-gradient(135deg,var(--navy2),var(--navy3));border-bottom:1px solid var(--border);
    padding:0 26px;display:flex;align-items:center;justify-content:space-between;
    height:62px;position:sticky;top:0;z-index:100;}
  .logo{display:flex;align-items:center;gap:11px;}
  .logom{width:36px;height:36px;border-radius:10px;background:linear-gradient(135deg,var(--teal),var(--teal2));
    display:flex;align-items:center;justify-content:center;
    font-family:'Space Mono',monospace;font-size:13px;font-weight:700;color:#fff;}
  .logon{font-size:14px;font-weight:600;}
  .logos{font-size:10px;color:var(--muted);}
  .hr{display:flex;align-items:center;gap:10px;}
  .upill{display:flex;align-items:center;gap:8px;background:rgba(23,169,158,.1);border:1px solid var(--border);border-radius:999px;padding:5px 12px 5px 5px;}
  .uname{font-size:13px;font-weight:500;}
  .rb{font-size:9px;font-weight:700;letter-spacing:.7px;text-transform:uppercase;padding:2px 7px;border-radius:999px;}
  .rb.admin{background:rgba(245,200,66,.2);color:var(--gold);border:1px solid rgba(245,200,66,.4);}
  .rb.staff{background:rgba(23,169,158,.2);color:var(--tl);border:1px solid var(--border);}
  .logoutbtn{background:none;border:none;color:var(--muted);cursor:pointer;font-size:17px;}
  .logoutbtn:hover{color:var(--red);}

  .pg{max-width:1080px;margin:0 auto;padding:28px 22px;}
  .topbar{display:flex;align-items:center;gap:12px;margin-bottom:26px;flex-wrap:wrap;}
  .sw{flex:1;min-width:180px;position:relative;}
  .sw input{width:100%;background:rgba(255,255,255,.05);border:1px solid var(--border);border-radius:9px;
    padding:9px 12px 9px 35px;font-size:13px;color:var(--text);font-family:'Sora',sans-serif;outline:none;transition:border .18s;}
  .sw input:focus{border-color:var(--teal);}
  .si{position:absolute;left:11px;top:50%;transform:translateY(-50%);color:var(--muted);font-size:13px;}

  .btn{display:inline-flex;align-items:center;gap:6px;padding:9px 17px;border-radius:9px;
    font-size:13px;font-weight:600;cursor:pointer;border:none;transition:all .18s;font-family:'Sora',sans-serif;white-space:nowrap;}
  .bp{background:linear-gradient(135deg,var(--teal),var(--teal2));color:#fff;}
  .bp:hover{filter:brightness(1.1);transform:translateY(-1px);}
  .bg{background:transparent;border:1px solid var(--border);color:var(--text);}
  .bg:hover{background:rgba(255,255,255,.05);}
  .bd{background:rgba(224,82,82,.12);border:1px solid rgba(224,82,82,.35);color:var(--red);}
  .bd:hover{background:rgba(224,82,82,.22);}
  .ba{background:rgba(46,204,113,.12);border:1px solid rgba(46,204,113,.38);color:var(--green);}
  .ba:hover{background:rgba(46,204,113,.22);}
  .be{background:rgba(245,200,66,.12);border:1px solid rgba(245,200,66,.38);color:var(--gold);}
  .be:hover{background:rgba(245,200,66,.22);}
  .btn:disabled{opacity:.38;cursor:not-allowed;transform:none!important;filter:none!important;}
  .sm{padding:5px 11px;font-size:11px;border-radius:7px;}
  .icon-btn{width:30px;height:30px;border-radius:7px;display:inline-flex;align-items:center;justify-content:center;
    cursor:pointer;border:none;font-size:14px;transition:all .18s;font-family:'Sora',sans-serif;}

  .av{border-radius:50%;background:linear-gradient(135deg,var(--teal),var(--gold));
    display:flex;align-items:center;justify-content:center;font-weight:700;color:#fff;flex-shrink:0;}
  .av28{width:28px;height:28px;font-size:11px;}
  .av22{width:22px;height:22px;font-size:9px;}
  .avg{background:linear-gradient(135deg,var(--green),#1a8f50)!important;}

  .dsec{margin-bottom:32px;}
  .dhdr{display:flex;align-items:center;gap:11px;margin-bottom:13px;}
  .dpill{font-size:11px;font-weight:700;letter-spacing:.5px;text-transform:uppercase;padding:4px 13px;border-radius:999px;white-space:nowrap;}
  .dcnt{font-size:12px;color:var(--muted);white-space:nowrap;}
  .dline{flex:1;height:1px;background:var(--border);}

  .sop-row{background:var(--card);border:1px solid var(--border);border-radius:12px;transition:border-color .2s;margin-bottom:6px;}
  .sop-row:hover{border-color:rgba(23,169,158,.45);}
  .sop-row.acked{border-color:rgba(46,204,113,.25);opacity:.78;}

  .sop-title-row{display:flex;align-items:center;gap:8px;flex-wrap:wrap;}
  .stitle{font-size:13px;font-weight:600;line-height:1.35;}
  .stitle.dim{color:var(--muted);}
  .tag{font-size:10px;font-weight:700;letter-spacing:.4px;text-transform:uppercase;padding:2px 8px;border-radius:999px;white-space:nowrap;}
  .tv{background:rgba(245,200,66,.1);color:var(--gold);border:1px solid rgba(245,200,66,.3);}
  .tok{background:rgba(46,204,113,.1);color:var(--green);border:1px solid rgba(46,204,113,.3);}
  .sop-sub{display:flex;align-items:center;gap:8px;margin-top:4px;flex-wrap:wrap;}
  .muted11{font-size:11px;color:var(--muted);}

  .sop-actions{padding:10px 14px 10px 6px;display:flex;align-items:center;gap:7px;white-space:nowrap;}

  .ack-area{background:rgba(13,27,42,.5);border-top:1px solid var(--border);border-radius:0 0 12px 12px;
    border:1px solid var(--border);border-top:none;}
  .ack-inner{padding:12px 16px 14px;}
  .ack-lbl{font-size:10px;font-weight:700;letter-spacing:.8px;text-transform:uppercase;color:var(--muted);margin-bottom:9px;}
  .ack-chips{display:flex;flex-wrap:wrap;gap:7px;}
  .ack-chip{display:flex;align-items:center;gap:6px;background:rgba(46,204,113,.07);
    border:1px solid rgba(46,204,113,.22);border-radius:999px;padding:4px 10px 4px 5px;font-size:11px;font-weight:500;}
  .ack-time{font-size:9px;color:var(--muted);}
  .no-acks{font-size:12px;color:var(--muted);font-style:italic;}

  .rdiv{display:flex;align-items:center;gap:10px;margin:8px 0 6px;}
  .rdline{flex:1;height:1px;background:rgba(46,204,113,.18);}
  .rdlbl{font-size:10px;font-weight:700;letter-spacing:.7px;text-transform:uppercase;color:rgba(46,204,113,.45);white-space:nowrap;}

  .inp,.sel,.ta{width:100%;background:rgba(255,255,255,.05);border:1px solid var(--border);border-radius:9px;
    padding:9px 13px;font-size:13px;color:var(--text);font-family:'Sora',sans-serif;outline:none;transition:border .18s;}
  .inp:focus,.sel:focus,.ta:focus{border-color:var(--teal);}
  .sel option{background:var(--navy2);}
  .ta{resize:vertical;min-height:70px;}
  .lbl{font-size:10px;font-weight:700;color:var(--muted);letter-spacing:.5px;text-transform:uppercase;margin-bottom:5px;display:block;}
  .fld{margin-bottom:13px;}
  .g2{display:grid;grid-template-columns:1fr 1fr;gap:12px;}

  .ov{position:fixed;inset:0;background:rgba(0,0,0,.62);backdrop-filter:blur(4px);
    z-index:200;display:flex;align-items:center;justify-content:center;padding:18px;animation:fi .18s;}
  .mo{background:var(--navy2);border:1px solid var(--border);border-radius:18px;
    padding:26px;width:100%;max-width:520px;max-height:92vh;overflow-y:auto;animation:su .22s;}
  .mttl{font-size:15px;font-weight:700;margin-bottom:18px;display:flex;align-items:center;justify-content:space-between;}
  .cbtn{background:none;border:none;color:var(--muted);cursor:pointer;font-size:22px;line-height:1;}
  .warn-box{background:rgba(245,200,66,.1);border:1px solid rgba(245,200,66,.3);color:var(--gold);
    border-radius:9px;padding:10px 14px;font-size:12px;margin-bottom:14px;line-height:1.55;}

  .empty{text-align:center;padding:38px 0;color:var(--muted);font-size:13px;}
  @keyframes fi{from{opacity:0}to{opacity:1}}
  @keyframes su{from{transform:translateY(15px);opacity:0}to{transform:translateY(0);opacity:1}}
`;

// ─── App ──────────────────────────────────────────────────────────────────────
export default function App() {
  const [user,  setUser]  = useState(null);
  const [users, setUsers] = useState([]);
  const [sops,  setSops]  = useState([]);
  const [reads, setReads] = useState({});
  const [ready, setReady] = useState(false);

  const [addSopOpen,  setAddSopOpen]  = useState(false);
  const [editSop,     setEditSop]     = useState(null);
  const [addUserOpen, setAddUserOpen] = useState(false);
  const [delSop,      setDelSop]      = useState(null);
  const [search,      setSearch]      = useState("");

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
    saveReads({ ...reads, [k]: [...list, { userId: user.id, userName: user.name, readAt: new Date().toISOString() }] });
  };

  const hasRead = sop => (reads[readKey(sop)] || []).some(r => r.userId === user?.id);
  const getAcks = sop =>  reads[readKey(sop)] || [];

  const handleAddSop = data => {
    saveSops([...sops, { id: uid(), ...data, uploadedAt: new Date().toISOString(), uploadedBy: user.name, version_hash: uid() }]);
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

  if (!ready) return <div style={{display:"flex",height:"100vh",alignItems:"center",justifyContent:"center",fontFamily:"Sora,sans-serif",color:"#17A99E",fontSize:13}}>Loading…</div>;
  if (!user)  return <Login users={users} onLogin={setUser} />;

  const q        = search.toLowerCase();
  const filtered = sops.filter(s => !q || s.title.toLowerCase().includes(q) || s.department.toLowerCase().includes(q));
  const depts    = [...new Set(filtered.map(s => s.department))].sort();

  return (
    <>
      <style>{css}</style>

      <header className="hdr">
        <div className="logo">
          <div className="logom">GL</div>
          <div><div className="logon">Gnosis Laboratories</div><div className="logos">SOP Document Portal</div></div>
        </div>
        <div className="hr">
          {user.role === "admin" && <>
            <button className="btn bg sm" onClick={() => setAddUserOpen(true)}>👤 Add Staff</button>
            <button className="btn bp sm" onClick={() => setAddSopOpen(true)}>➕ Add SOP</button>
          </>}
          <div className="upill">
            <div className="av av28">{ini(user.name)}</div>
            <span className="uname">{user.name}</span>
            <span className={`rb ${user.role}`}>{user.role}</span>
            <button className="logoutbtn" onClick={() => setUser(null)} title="Logout">⏻</button>
          </div>
        </div>
      </header>

      <div className="pg">
        <div className="topbar">
          <div className="sw">
            <span className="si">🔍</span>
            <input placeholder="Search SOPs or departments…" value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <span className="muted11">{filtered.length} document{filtered.length !== 1 ? "s" : ""}</span>
        </div>

        {depts.length === 0 && <div className="empty">No SOPs found.</div>}

        {depts.map(dept => {
          const style  = ds(dept);
          const all    = filtered.filter(s => s.department === dept);
          const unread = all.filter(s => !hasRead(s)).sort((a,b) => new Date(b.uploadedAt) - new Date(a.uploadedAt));
          const read   = all.filter(s =>  hasRead(s)).sort((a,b) => new Date(b.uploadedAt) - new Date(a.uploadedAt));
          return (
            <div key={dept} className="dsec">
              <div className="dhdr">
                <div className="dpill" style={{background:style.bg,border:`1px solid ${style.border}`,color:style.text}}>{dept}</div>
                <span className="dcnt">{all.length} document{all.length !== 1 ? "s" : ""}</span>
                <div className="dline" />
              </div>
              {unread.map(sop => (
                <SopRow key={sop.id} sop={sop} acks={getAcks(sop)} user={user}
                  myAck={getAcks(sop).find(r => r.userId === user.id)}
                  onAck={acknowledge} onEdit={setEditSop} onDelete={setDelSop} />
              ))}
              {unread.length > 0 && read.length > 0 && (
                <div className="rdiv"><div className="rdline"/><div className="rdlbl">✓ Acknowledged by me</div><div className="rdline"/></div>
              )}
              {read.map(sop => (
                <SopRow key={sop.id} sop={sop} acks={getAcks(sop)} user={user}
                  myAck={getAcks(sop).find(r => r.userId === user.id)}
                  onAck={acknowledge} onEdit={setEditSop} onDelete={setDelSop} isAcked />
              ))}
            </div>
          );
        })}
      </div>

      {addSopOpen  && <SopModal onSave={handleAddSop}   onClose={() => setAddSopOpen(false)} />}
      {editSop     && <SopModal sop={editSop} onSave={handleEditSop} onClose={() => setEditSop(null)} />}
      {addUserOpen && <UserModal onAdd={u => { saveUsers([...users, { id: uid(), ...u }]); setAddUserOpen(false); }} onClose={() => setAddUserOpen(false)} />}

      {delSop && (
        <div className="ov">
          <div className="mo" style={{maxWidth:360}}>
            <div style={{textAlign:"center",padding:"6px 0 4px"}}>
              <div style={{fontSize:36,marginBottom:12}}>🗑️</div>
              <div style={{fontWeight:700,fontSize:15,marginBottom:8}}>Delete this SOP?</div>
              <div style={{fontSize:12,color:"var(--muted)",marginBottom:20,lineHeight:1.65}}>
                <strong>{delSop.title}</strong><br />All acknowledgement records will be permanently removed.
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
function SopRow({ sop, acks, user, myAck, onAck, onEdit, onDelete, isAcked }) {
  const [open, setOpen] = useState(false);
  return (
    <div style={{marginBottom:6}}>
      <div className={`sop-row${isAcked ? " acked" : ""}`}
        style={{display:"flex",alignItems:"center",borderRadius:open?"12px 12px 0 0":"12px",borderBottom:open?"none":""}}>

        <div style={{padding:"13px 4px 13px 14px",cursor:"pointer",color:"var(--muted)",fontSize:11,
          transition:"transform .2s",transform:open?"rotate(90deg)":"rotate(0deg)",flexShrink:0}}
          onClick={() => setOpen(o => !o)}>▶</div>

        <div style={{flex:1,minWidth:0,padding:"13px 10px 13px 6px",cursor:"pointer"}} onClick={() => setOpen(o => !o)}>
          <div className="sop-title-row">
            {isAcked && <span style={{fontSize:13,opacity:.65}}>✅</span>}
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
            ? <button className="btn bg sm" onClick={e => { e.stopPropagation(); window.open(sop.url, "_blank", "noopener,noreferrer"); }} title="Open document">📎 Open</button>
            : <span className="btn bg sm" style={{opacity:.35,cursor:"default",pointerEvents:"none"}}>📎 No link</span>
          }
          {!myAck
            ? <button className="btn ba sm" onClick={e => { e.stopPropagation(); onAck(sop); }}>✓ Acknowledge</button>
            : <span className="btn" style={{background:"rgba(46,204,113,.08)",border:"1px solid rgba(46,204,113,.2)",color:"var(--green)",fontSize:11,padding:"5px 11px",borderRadius:7,cursor:"default"}}>✅ Done</span>
          }
          {user.role === "admin" && <>
            <button className="icon-btn be" style={{background:"rgba(245,200,66,.12)",border:"1px solid rgba(245,200,66,.35)",color:"var(--gold)"}}
              onClick={e => { e.stopPropagation(); onEdit(sop); }} title="Edit SOP">✏️</button>
            <button className="icon-btn bd" style={{background:"rgba(224,82,82,.12)",border:"1px solid rgba(224,82,82,.35)",color:"var(--red)"}}
              onClick={e => { e.stopPropagation(); onDelete(sop); }} title="Delete SOP">🗑️</button>
          </>}
        </div>
      </div>

      {open && (
        <div className="ack-area">
          <div className="ack-inner">
            {sop.description && <p style={{fontSize:12,color:"var(--muted)",marginBottom:12,lineHeight:1.65}}>{sop.description}</p>}
            <div className="ack-lbl">Who has acknowledged</div>
            {acks.length === 0
              ? <div className="no-acks">No one has acknowledged this document yet.</div>
              : <div className="ack-chips">
                  {acks.map((a, i) => (
                    <div key={i} className="ack-chip">
                      <div className="av av22 avg">{ini(a.userName)}</div>
                      <span>{a.userName}</span>
                      <span className="ack-time">{fmtDate(a.readAt)}</span>
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
            ⚠️ You changed the version from <strong>{sop.version}</strong> to <strong>{f.version}</strong>.
            Saving will <strong>reset all acknowledgements</strong> — staff will need to re-acknowledge.
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
  const [f, setF] = useState({ name:"", email:"", password:"staff123", role:"staff" });
  const set = (k, v) => setF(p => ({ ...p, [k]: v }));
  return (
    <div className="ov" onClick={onClose}>
      <div className="mo" style={{maxWidth:420}} onClick={e => e.stopPropagation()}>
        <div className="mttl"><span>👤 Add Staff Member</span><button className="cbtn" onClick={onClose}>×</button></div>
        <div className="fld"><label className="lbl">Full Name *</label>
          <input className="inp" placeholder="Full name" value={f.name} onChange={e => set("name", e.target.value)} /></div>
        <div className="fld"><label className="lbl">Email *</label>
          <input className="inp" type="email" placeholder="email@gnosis.lab" value={f.email} onChange={e => set("email", e.target.value)} /></div>
        <div className="g2">
          <div className="fld"><label className="lbl">Password</label>
            <input className="inp" value={f.password} onChange={e => set("password", e.target.value)} /></div>
          <div className="fld"><label className="lbl">Role</label>
            <select className="sel" value={f.role} onChange={e => set("role", e.target.value)}>
              <option value="staff">Staff</option>
              <option value="admin">Admin</option>
            </select></div>
        </div>
        <div style={{display:"flex",gap:10,justifyContent:"flex-end",marginTop:6}}>
          <button className="btn bg" onClick={onClose}>Cancel</button>
          <button className="btn bp" onClick={() => onAdd(f)} disabled={!f.name || !f.email}>Add Member</button>
        </div>
      </div>
    </div>
  );
}

// ─── Login ────────────────────────────────────────────────────────────────────
function Login({ users, onLogin }) {
  const [email, setEmail] = useState("");
  const [pass,  setPass]  = useState("");
  const [err,   setErr]   = useState("");
  const go = () => {
    const u = users.find(u => u.email.toLowerCase() === email.toLowerCase().trim() && u.password === pass);
    u ? onLogin(u) : setErr("Invalid email or password.");
  };
  return (
    <div className="lw">
      <style>{css}</style>
      <div className="lc">
        <div className="lm">GL</div>
        <div className="lt">SOP Portal</div>
        <div className="ls">Gnosis Laboratories · Document Acknowledgement System</div>
        {err && <div className="err">⚠️ {err}</div>}
        <div className="fld"><label className="lbl">Email</label>
          <input className="inp" type="email" placeholder="you@gnosis.lab" value={email}
            onChange={e => setEmail(e.target.value)} onKeyDown={e => e.key === "Enter" && go()} /></div>
        <div className="fld"><label className="lbl">Password</label>
          <input className="inp" type="password" placeholder="••••••••" value={pass}
            onChange={e => setPass(e.target.value)} onKeyDown={e => e.key === "Enter" && go()} /></div>
        <button className="btn bp" style={{width:"100%",justifyContent:"center",marginTop:6}} onClick={go}>Sign In →</button>

      </div>
    </div>
  );
}
