// Shared UI primitives
const { useState, useRef, useEffect, useMemo, useCallback } = React;
const I = window.Icons;

// ─────────── Buttons ───────────
function Btn({ kind = 'secondary', size = 'md', icon, iconRight, children, onClick, type, disabled, style, title }) {
  const base = uiStyles.btnBase;
  const sz = uiStyles['sz_' + size];
  const variant = uiStyles['k_' + kind];
  return (
    <button type={type || 'button'} title={title} disabled={disabled} onClick={onClick}
      style={{ ...base, ...sz, ...variant, ...(disabled ? uiStyles.btnDisabled : {}), ...style }}
      onMouseEnter={e => { if (!disabled) Object.assign(e.currentTarget.style, uiStyles['kH_' + kind] || {}); }}
      onMouseLeave={e => { if (!disabled) Object.assign(e.currentTarget.style, uiStyles['k_' + kind]); }}>
      {icon && <span style={{display:'inline-flex'}}>{React.cloneElement(icon, { width: size === 'sm' ? 14 : 16, height: size === 'sm' ? 14 : 16 })}</span>}
      <span>{children}</span>
      {iconRight && <span style={{display:'inline-flex'}}>{React.cloneElement(iconRight, { width: 16, height: 16 })}</span>}
    </button>
  );
}

// ─────────── Status pill ───────────
const STATUS_COLORS = {
  published: { bg: 'var(--green-soft)', fg: '#5ee090', dot: 'var(--green)' },
  pending:   { bg: 'var(--yellow-soft)', fg: '#f5b450', dot: 'var(--yellow)' },
  draft:     { bg: 'var(--gray-soft)',  fg: '#9a9a9a', dot: 'var(--gray)' },
};
const STATUS_LABEL = { published: 'Published', pending: 'Pending', draft: 'Draft' };

function StatusPill({ status, size = 'md' }) {
  const c = STATUS_COLORS[status] || STATUS_COLORS.draft;
  const pad = size === 'sm' ? '2px 8px' : '4px 10px';
  const fs = size === 'sm' ? 11 : 12;
  return (
    <span style={{ display:'inline-flex', alignItems:'center', gap:6, padding:pad, borderRadius:999, background:c.bg, color:c.fg, fontSize:fs, fontWeight:600, letterSpacing:'.01em', textTransform:'capitalize' }}>
      <span style={{ width:6, height:6, borderRadius:'50%', background:c.dot }}></span>
      {STATUS_LABEL[status] || status}
    </span>
  );
}

const CAT_COLORS = {
  high:   { bg:'rgba(232,72,85,.12)', fg:'#ec6d77', border:'rgba(232,72,85,.32)' },
  medium: { bg:'rgba(74,144,217,.12)', fg:'#7ab2ea', border:'rgba(74,144,217,.32)' },
  low:    { bg:'rgba(180,180,180,.08)', fg:'#8d8d8d', border:'rgba(180,180,180,.18)' },
};
const CAT_LABEL = { high:'High', medium:'Medium', low:'Low' };
function CategoryPill({ category, size = 'md' }) {
  if (!category) return <span style={{ fontSize:13, color:'var(--text-4)' }}>—</span>;
  const c = CAT_COLORS[category] || CAT_COLORS.low;
  return <span style={{ fontSize: size === 'sm' ? 12 : 13, color: c.fg, fontWeight:500 }}>{CAT_LABEL[category] || category}</span>;
}

// ─────────── Chip ───────────
function Chip({ children, onRemove, accent }) {
  return (
    <span style={{
      display:'inline-flex', alignItems:'center', gap:6,
      padding:'5px 10px 5px 12px', borderRadius:6,
      background: accent === 'blue' ? 'var(--blue-soft)' : '#222',
      color: accent === 'blue' ? '#9cc1ee' : '#dcdcdc',
      border:'1px solid ' + (accent === 'blue' ? 'rgba(74,144,217,.3)' : '#2f2f2f'),
      fontSize:13, fontWeight:500,
    }}>
      {children}
      {onRemove && (
        <button onClick={onRemove} style={{display:'inline-flex',padding:0,color:'inherit',opacity:.65}} onMouseEnter={e=>e.currentTarget.style.opacity=1} onMouseLeave={e=>e.currentTarget.style.opacity=.65}>
          <I.x width={12} height={12} />
        </button>
      )}
    </span>
  );
}

function AddChip({ onClick, label = '+ Tilføj' }) {
  return (
    <button onClick={onClick} style={{
      padding:'5px 10px', borderRadius:6, background:'transparent', border:'1px dashed #3a3a3a', color:'#7a7a7a', fontSize:13, fontWeight:500
    }} onMouseEnter={e=>{e.currentTarget.style.borderColor='#555';e.currentTarget.style.color='#bbb'}} onMouseLeave={e=>{e.currentTarget.style.borderColor='#3a3a3a';e.currentTarget.style.color='#7a7a7a'}}>{label}</button>
  );
}

// ─────────── Card ───────────
function Card({ title, action, children, pad = 20, style }) {
  return (
    <div style={{ background:'var(--bg-2)', border:'1px solid var(--border)', borderRadius:8, padding:pad, ...style }}>
      {(title || action) && (
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:14 }}>
          {title && <h3 style={{ margin:0, fontSize:13, fontWeight:600, color:'var(--text-3)', textTransform:'uppercase', letterSpacing:'.08em' }}>{title}</h3>}
          {action}
        </div>
      )}
      {children}
    </div>
  );
}

// ─────────── Input ───────────
function TextInput({ value, onChange, placeholder, icon, type='text', style, onKeyDown, fullWidth }) {
  const [focus, setFocus] = useState(false);
  return (
    <div style={{
      display:'flex', alignItems:'center', gap:8, padding:'0 12px',
      background:'var(--bg-1)', border:`1px solid ${focus ? 'var(--blue)' : 'var(--border-strong)'}`,
      borderRadius:6, height:38, transition:'border-color .15s', width: fullWidth ? '100%' : undefined, ...style
    }}>
      {icon && <span style={{color:'var(--text-3)', display:'inline-flex'}}>{React.cloneElement(icon, {width:16, height:16})}</span>}
      <input type={type} value={value} onChange={e=>onChange(e.target.value)} placeholder={placeholder} onFocus={()=>setFocus(true)} onBlur={()=>setFocus(false)} onKeyDown={onKeyDown}
        style={{ flex:1, background:'transparent', border:'none', outline:'none', color:'var(--text)', fontSize:14, minWidth:0 }} />
    </div>
  );
}

function Select({ value, onChange, options, placeholder, style }) {
  return (
    <div style={{ position:'relative', ...style }}>
      <select value={value} onChange={e=>onChange(e.target.value)} style={{
        width:'100%', appearance:'none', WebkitAppearance:'none',
        height:38, padding:'0 36px 0 12px',
        background:'var(--bg-1)', border:'1px solid var(--border-strong)', borderRadius:6,
        color:'var(--text)', fontSize:14, fontFamily:'inherit', cursor:'pointer'
      }}>
        {placeholder && <option value="">{placeholder}</option>}
        {options.map(o => typeof o === 'string' ? <option key={o} value={o}>{o}</option> : <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
      <span style={{position:'absolute', right:10, top:'50%', transform:'translateY(-50%)', color:'var(--text-3)', pointerEvents:'none'}}><I.chevDown width={14} height={14} /></span>
    </div>
  );
}

function Toggle({ checked, onChange, label, icon, color = 'var(--green)' }) {
  return (
    <button onClick={() => onChange(!checked)} style={{
      display:'inline-flex', alignItems:'center', gap:8,
      padding:'6px 12px', borderRadius:999,
      background: checked ? 'rgba(46,204,113,.12)' : '#1d1d1d',
      border:'1px solid ' + (checked ? 'rgba(46,204,113,.3)' : '#2c2c2c'),
      color: checked ? '#7fdba6' : '#7a7a7a',
      fontSize:13, fontWeight:600, transition:'all .15s',
    }}>
      {icon && React.cloneElement(icon, { width:14, height:14 })}
      <span>{label}</span>
      <span style={{ display:'inline-flex', color: checked ? color : '#555' }}>
        {checked ? <I.check width={12} height={12} /> : <I.x width={12} height={12} />}
      </span>
    </button>
  );
}

// ─────────── Layout helpers ───────────
function PageHeader({ title, subtitle, children }) {
  return (
    <div style={{ display:'flex', alignItems:'flex-end', justifyContent:'space-between', marginBottom:28, gap:24 }}>
      <div>
        <h1 style={{ margin:0, fontSize:28, fontWeight:700, letterSpacing:'-0.02em' }}>{title}</h1>
        {subtitle && <div style={{ marginTop:6, color:'var(--text-3)', fontSize:14 }}>{subtitle}</div>}
      </div>
      <div style={{ display:'flex', gap:10, alignItems:'center' }}>{children}</div>
    </div>
  );
}

// ─────────── Dropdown Menu (3-dot) ───────────
function DropdownMenu({ items, align = 'right', trigger }) {
  const [open, setOpen] = React.useState(false);
  const ref = React.useRef(null);

  React.useEffect(() => {
    if (!open) return;
    const onClick = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    const onKey = (e) => { if (e.key === 'Escape') setOpen(false); };
    document.addEventListener('mousedown', onClick);
    document.addEventListener('keydown', onKey);
    return () => { document.removeEventListener('mousedown', onClick); document.removeEventListener('keydown', onKey); };
  }, [open]);

  const I = window.Icons;
  return (
    <div ref={ref} style={{ position:'relative', display:'inline-block' }}>
      {trigger ? (
        React.cloneElement(trigger, { onClick: () => setOpen(o => !o) })
      ) : (
        <button onClick={() => setOpen(o => !o)} style={{
          width:38, height:38, borderRadius:6,
          border:'1px solid var(--border-strong)', color:'var(--text-2)', background: open ? 'var(--bg-hover)' : 'transparent',
          display:'inline-flex', alignItems:'center', justifyContent:'center'
        }}
          onMouseEnter={e => { if (!open) e.currentTarget.style.background='var(--bg-hover)'; }}
          onMouseLeave={e => { if (!open) e.currentTarget.style.background='transparent'; }}>
          <I.more width={18} height={18} />
        </button>
      )}
      {open && (
        <div style={{
          position:'absolute', top:'calc(100% + 6px)', [align]: 0,
          minWidth:180, padding:6,
          background:'var(--bg-2)', border:'1px solid var(--border-strong)', borderRadius:8,
          boxShadow:'0 16px 40px rgba(0,0,0,.5)',
          zIndex:60
        }}>
          {items.map((it, i) => (
            <button key={i} onClick={() => { setOpen(false); it.onClick && it.onClick(); }}
              disabled={it.disabled}
              style={{
                display:'flex', alignItems:'center', gap:10, padding:'9px 12px',
                width:'100%', textAlign:'left', borderRadius:5,
                color: it.disabled ? 'var(--text-4)' : (it.danger ? '#ec6d77' : 'var(--text)'),
                fontSize:14, fontWeight:500, background:'transparent',
                cursor: it.disabled ? 'not-allowed' : 'pointer'
              }}
              onMouseEnter={e => { if (!it.disabled) e.currentTarget.style.background = it.danger ? 'rgba(232,72,85,.08)' : 'var(--bg-hover)'; }}
              onMouseLeave={e => { if (!it.disabled) e.currentTarget.style.background = 'transparent'; }}>
              {it.icon && <span style={{display:'inline-flex'}}>{React.cloneElement(it.icon, { width:14, height:14 })}</span>}
              <span>{it.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ─────────── Styles ───────────
const uiStyles = {
  btnBase: { display:'inline-flex', alignItems:'center', justifyContent:'center', gap:8, borderRadius:6, fontWeight:600, fontSize:14, transition:'background .15s, border-color .15s, color .15s', whiteSpace:'nowrap' },
  sz_sm: { padding:'6px 12px', fontSize:13, height:30 },
  sz_md: { padding:'9px 16px', height:38 },
  sz_lg: { padding:'12px 22px', height:46, fontSize:15 },
  k_primary: { background:'var(--red)', color:'#fff', border:'1px solid var(--red)' },
  kH_primary: { background:'#f25966' },
  k_blue: { background:'var(--blue)', color:'#fff', border:'1px solid var(--blue)' },
  kH_blue: { background:'#5ba0e6' },
  k_secondary: { background:'transparent', color:'var(--text)', border:'1px solid var(--border-strong)' },
  kH_secondary: { background:'var(--bg-hover)', borderColor:'#444' },
  k_ghost: { background:'transparent', color:'var(--text-2)', border:'1px solid transparent' },
  kH_ghost: { background:'var(--bg-hover)', color:'var(--text)' },
  k_danger: { background:'transparent', color:'#ec6d77', border:'1px solid rgba(232,72,85,.4)' },
  kH_danger: { background:'rgba(232,72,85,.12)', borderColor:'var(--red)' },
  btnDisabled: { opacity:.4, cursor:'not-allowed' },
};

// Format helpers
function fmtNum(n) { return (n || 0).toLocaleString('da-DK'); }
function fmtDate(s) {
  if (!s) return '—';
  const d = new Date(s);
  return d.toLocaleDateString('da-DK', { day:'2-digit', month:'short', year:'numeric' });
}
function fmtRelative(s) {
  if (!s) return '—';
  const d = new Date(s);
  const diff = (Date.now() - d.getTime()) / 1000;
  if (diff < 60) return 'lige nu';
  if (diff < 3600) return Math.floor(diff/60) + ' min siden';
  if (diff < 86400) return Math.floor(diff/3600) + ' t siden';
  if (diff < 604800) return Math.floor(diff/86400) + ' dage siden';
  return fmtDate(s);
}
function getArtistName(id) {
  const a = window.DATA.ARTISTS.find(x => x.id === id);
  return a ? a.name : id;
}

// Indeterminate "processing" progress bar.
function ProgressBar({ height = 6, style }) {
  return (
    <div style={{ position:'relative', width:'100%', height, borderRadius:999, background:'var(--bg-3)', overflow:'hidden', ...style }}>
      <div style={{
        position:'absolute', top:0, bottom:0, width:'40%', left:'-40%', borderRadius:999,
        background:'linear-gradient(90deg, transparent, var(--blue), transparent)',
        animation:'bn-bar 1.1s linear infinite'
      }} />
    </div>
  );
}

// Hover tooltip (native title is unreliable here, esp. on disabled buttons).
function Tip({ label, children, style }) {
  const [show, setShow] = useState(false);
  return (
    <span
      onMouseEnter={() => setShow(true)}
      onMouseLeave={() => setShow(false)}
      style={{ position:'relative', display:'inline-flex', ...style }}>
      {children}
      {show && label && (
        <span style={{
          position:'absolute', right:'calc(100% + 6px)', top:'50%', transform:'translateY(-50%)',
          background:'var(--bg-1)', border:'1px solid var(--border-strong)', color:'var(--text)',
          fontSize:11, fontWeight:600, padding:'4px 8px', borderRadius:5, whiteSpace:'nowrap',
          pointerEvents:'none', zIndex:80, boxShadow:'0 6px 20px rgba(0,0,0,.45)'
        }}>{label}</span>
      )}
    </span>
  );
}

Object.assign(window, { Btn, StatusPill, CategoryPill, Chip, AddChip, Card, TextInput, Select, Toggle, PageHeader, ProgressBar, Tip, STATUS_COLORS, STATUS_LABEL, fmtNum, fmtDate, fmtRelative, getArtistName, uiStyles, DropdownMenu });
