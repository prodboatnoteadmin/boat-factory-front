// Collabs — derived from the beats' primary "collab" field (NOT
// co-collabs). Same look as the Artists page, but read-only (no
// "create new"). Clicking one opens a detail view that reuses the
// Beats list scoped to that collab.

function CollabsPage({ onOpenCollab }) {
  const I = window.Icons;
  const [search, setSearch] = React.useState('');
  const [view, setView] = React.useState('gallery'); // gallery | list

  const collabs = React.useMemo(() => {
    const map = {};
    window.DATA.BEATS.forEach(b => {
      const c = (b.collab || '').trim();
      if (c) map[c] = (map[c] || 0) + 1;
    });
    return Object.keys(map)
      .sort((a, b) => a.localeCompare(b))
      .map(name => ({ name, count: map[name] }));
  }, []);

  const filtered = collabs.filter(c => c.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div>
      <window.PageHeader title="Collabs" subtitle={`${filtered.length} collabs`} />

      <div style={{ display:'flex', gap:10, marginBottom:18, alignItems:'center', flexWrap:'wrap' }}>
        <div style={{flex:'1 1 300px', minWidth:240}}>
          <window.TextInput value={search} onChange={setSearch} placeholder="Søg collab…" icon={<I.search />} fullWidth />
        </div>
        <window.Select value={view} onChange={setView} options={[
          { value:'gallery', label:'Galleri' },
          { value:'list', label:'Liste' },
        ]} style={{width:140}} />
      </div>

      {view === 'list' ? (
        <div style={{ background:'var(--bg-2)', border:'1px solid var(--border)', borderRadius:8, overflow:'hidden' }}>
          <div style={{
            display:'grid', gridTemplateColumns:'minmax(220px, 2fr) 160px', gap:16,
            alignItems:'center', padding:'14px 20px', borderBottom:'1px solid var(--border)', background:'var(--bg-1)'
          }}>
            <span style={{fontSize:11, fontWeight:700, color:'var(--text-3)', textTransform:'uppercase', letterSpacing:'.08em'}}>Navn</span>
            <span style={{fontSize:11, fontWeight:700, color:'var(--text-3)', textTransform:'uppercase', letterSpacing:'.08em', textAlign:'right'}}>Antal beats</span>
          </div>
          {filtered.length === 0 && (
            <div style={{padding:'48px', textAlign:'center', color:'var(--text-3)', fontSize:14}}>Ingen collabs matcher søgningen.</div>
          )}
          {filtered.map((c, idx) => (
            <div key={c.name} onClick={() => onOpenCollab(c.name)} style={{
              display:'grid', gridTemplateColumns:'minmax(220px, 2fr) 160px', gap:16,
              alignItems:'center', padding:'14px 20px',
              borderTop: idx === 0 ? 'none' : '1px solid var(--border)',
              cursor:'pointer', color:'var(--text)', transition:'background .12s'
            }}
              onMouseEnter={e => e.currentTarget.style.background='var(--bg-hover)'}
              onMouseLeave={e => e.currentTarget.style.background='transparent'}
            >
              <div style={{display:'flex', alignItems:'center', gap:12, minWidth:0}}>
                <window.ArtistAvatar id={c.name} name={c.name} size={32} />
                <span style={{fontWeight:600, fontSize:14, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis'}}>{c.name}</span>
              </div>
              <span className="mono" style={{fontSize:13, color:'var(--text-2)', textAlign:'right'}}>{c.count}</span>
            </div>
          ))}
        </div>
      ) : (
        <div style={{
          display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(240px, 1fr))', gap:16
        }}>
          {filtered.map(c => (
            <button key={c.name} onClick={() => onOpenCollab(c.name)} style={{
              display:'flex', flexDirection:'column', textAlign:'left',
              background:'var(--bg-2)', border:'1px solid var(--border)', borderRadius:10,
              padding:20, transition:'all .15s', cursor:'pointer'
            }}
              onMouseEnter={e => { e.currentTarget.style.borderColor='var(--border-strong)'; e.currentTarget.style.background='var(--bg-3)'; e.currentTarget.style.transform='translateY(-2px)'; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor='var(--border)'; e.currentTarget.style.background='var(--bg-2)'; e.currentTarget.style.transform='translateY(0)'; }}
            >
              <div style={{display:'flex', alignItems:'center', gap:14, marginBottom:16}}>
                <window.ArtistAvatar id={c.name} name={c.name} size={52} />
                <div style={{minWidth:0, flex:1}}>
                  <div style={{fontWeight:700, fontSize:17, letterSpacing:'-.01em', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis'}}>{c.name}</div>
                  <div style={{fontSize:12, color:'var(--text-3)', marginTop:2}}>{c.count} beats</div>
                </div>
              </div>
              <div style={{marginTop:18, paddingTop:14, borderTop:'1px solid var(--border)', display:'flex', justifyContent:'space-between', alignItems:'center'}}>
                <span style={{ fontSize:11, color:'var(--text-3)', letterSpacing:'.06em', textTransform:'uppercase' }}>Aktive beats</span>
                <span style={{display:'inline-flex', alignItems:'center', gap:5, fontSize:13, color:'var(--text-2)', fontWeight:600}}>
                  {c.count} <I.chevR width={14} height={14} style={{opacity:.5}} />
                </span>
              </div>
            </button>
          ))}
          {filtered.length === 0 && (
            <div style={{padding:'48px', color:'var(--text-3)', fontSize:14}}>Ingen collabs matcher søgningen.</div>
          )}
        </div>
      )}
    </div>
  );
}

function CollabDetailPage({ collab, onBack, onOpenBeat, onAddToQueue }) {
  const I = window.Icons;
  const count = window.DATA.BEATS.filter(b => (b.collab || '').trim() === collab).length;

  return (
    <div>
      <button onClick={onBack} style={{
        display:'inline-flex', alignItems:'center', gap:6, marginBottom:16,
        fontSize:13, color:'var(--text-3)', padding:'4px 0'
      }}
        onMouseEnter={e=>e.currentTarget.style.color='var(--text)'}
        onMouseLeave={e=>e.currentTarget.style.color='var(--text-3)'}>
        <I.chevL width={15} height={15} /> Tilbage
      </button>

      <div style={{
        display:'flex', alignItems:'center', gap:20, marginBottom:24,
        paddingBottom:24, borderBottom:'1px solid var(--border)'
      }}>
        <window.ArtistAvatar id={collab} name={collab} size={80} />
        <div>
          <h1 style={{margin:'0 0 6px 0', fontSize:36, fontWeight:700, letterSpacing:'-.03em'}}>{collab}</h1>
          <div style={{fontSize:14, color:'var(--text-3)'}}>{count} beats</div>
        </div>
      </div>

      <window.BeatsPage collab={collab} embedded onOpenBeat={onOpenBeat} onAddToQueue={onAddToQueue} />
    </div>
  );
}

window.CollabsPage = CollabsPage;
window.CollabDetailPage = CollabDetailPage;
