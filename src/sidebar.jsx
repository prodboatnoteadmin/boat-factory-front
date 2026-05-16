// Sidebar navigation
const { useState: useStateSB } = React;

function Sidebar({ current, onNav, onLogout }) {
  const items = [
    { id: 'beats',     label: 'Beats',     icon: <window.Icons.beat /> },
    { id: 'queue',     label: 'Queue', icon: <window.Icons.queue /> },
    { id: 'artists',   label: 'Artists',   icon: <window.Icons.user /> },
  ];
  return (
    <aside style={{
      position:'fixed', left:0, top:0, bottom:0, width:240,
      background:'var(--bg-1)', borderRight:'1px solid var(--border)',
      display:'flex', flexDirection:'column', padding:'20px 14px', zIndex:10,
    }}>
      {/* logo */}
      <div style={{ display:'flex', alignItems:'center', gap:10, padding:'4px 10px 22px 10px', borderBottom:'1px solid var(--border)', marginBottom:18 }}>
        <div style={{
          width:34, height:34, borderRadius:8, background:'var(--red)',
          display:'flex', alignItems:'center', justifyContent:'center',
          fontWeight:800, color:'#fff', fontSize:18, letterSpacing:'-.02em',
          boxShadow:'0 4px 16px rgba(232,72,85,.35)'
        }}>B</div>
        <div style={{display:'flex', flexDirection:'column', lineHeight:1.1}}>
          <span style={{fontWeight:700, fontSize:17, letterSpacing:'-.01em'}}>Beat Manager</span>
        </div>
      </div>

      <nav style={{ display:'flex', flexDirection:'column', gap:2 }}>
        {items.map(it => {
          const active = current === it.id;
          return (
            <button key={it.id} onClick={() => onNav(it.id)}
              style={{
                display:'flex', alignItems:'center', gap:12,
                padding:'10px 12px', borderRadius:6,
                background: active ? 'var(--bg-hover)' : 'transparent',
                color: active ? 'var(--text)' : 'var(--text-2)',
                fontSize:14, fontWeight: active ? 600 : 500,
                position:'relative', textAlign:'left',
              }}
              onMouseEnter={e => { if (!active) e.currentTarget.style.background='var(--bg-2)' }}
              onMouseLeave={e => { if (!active) e.currentTarget.style.background='transparent' }}
            >
              {active && <span style={{position:'absolute', left:0, top:8, bottom:8, width:3, background:'var(--red)', borderRadius:'0 3px 3px 0'}}></span>}
              <span style={{display:'inline-flex', color: active ? 'var(--red)' : 'var(--text-3)'}}>
                {React.cloneElement(it.icon, { width:18, height:18 })}
              </span>
              <span>{it.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Spacer */}
      <div style={{flex:1}}></div>

      {/* User */}
      <div style={{
        display:'flex', alignItems:'center', gap:10, padding:'8px 10px', borderRadius:6,
      }}>
        <div style={{
          width:32, height:32, borderRadius:'50%',
          background:'linear-gradient(135deg, #4A90D9, #2E68A8)',
          display:'flex', alignItems:'center', justifyContent:'center', fontSize:13, fontWeight:700
        }}>BN</div>
        <div style={{flex:1, minWidth:0}}>
          <div style={{fontSize:13, fontWeight:600, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis'}}>Boat Note</div>
          <div style={{fontSize:11, color:'var(--text-3)'}}>Admin</div>
        </div>
        <button onClick={onLogout} title="Log ud" style={{padding:6, borderRadius:5, color:'var(--text-3)', display:'inline-flex'}}
          onMouseEnter={e=>{e.currentTarget.style.background='var(--bg-hover)';e.currentTarget.style.color='var(--text)'}}
          onMouseLeave={e=>{e.currentTarget.style.background='transparent';e.currentTarget.style.color='var(--text-3)'}}>
          <window.Icons.logout width={16} height={16} />
        </button>
      </div>
    </aside>
  );
}

window.Sidebar = Sidebar;
