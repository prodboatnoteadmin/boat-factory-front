// Artists list page
function SortTh({ label, col, sortBy, sortDir, setSort, align }) {
  const I = window.Icons;
  const active = sortBy === col;
  return (
    <button onClick={() => setSort(col)} style={{
      display:'inline-flex', alignItems:'center', gap:5,
      fontSize:11, fontWeight:700, color: active ? 'var(--text)' : 'var(--text-3)',
      textTransform:'uppercase', letterSpacing:'.08em', padding:0,
      background:'transparent', cursor:'pointer', whiteSpace:'nowrap',
      justifyContent: align === 'right' ? 'flex-end' : 'flex-start', width:'100%'
    }}>
      <span>{label}</span>
      <span style={{display:'inline-flex', opacity: active ? 1 : .4}}>
        {active && sortDir === 'asc' ? <I.chevUp width={12} height={12} /> : <I.chevDown width={12} height={12} />}
      </span>
    </button>
  );
}

function ArtistsPage({ onOpenArtist, onNewArtist }) {
  const I = window.Icons;
  const [search, setSearch] = React.useState('');
  const [view, setView] = React.useState('list'); // gallery | list
  const [sortBy, setSortBy] = React.useState('name'); // name | count
  const [sortDir, setSortDir] = React.useState('asc');
  const setSort = (c) => {
    if (sortBy === c) setSortDir(d => (d === 'asc' ? 'desc' : 'asc'));
    else { setSortBy(c); setSortDir('asc'); }
  };

  // Show every artist (incl. newly created ones with 0 beats yet).
  const filtered = window.DATA.ARTISTS.filter(a => a.name.toLowerCase().includes(search.toLowerCase()));
  const sorted = [...filtered].sort((a, b) => {
    const av = sortBy === 'count' ? a.beatsCount : a.name.toLowerCase();
    const bv = sortBy === 'count' ? b.beatsCount : b.name.toLowerCase();
    if (av < bv) return sortDir === 'asc' ? -1 : 1;
    if (av > bv) return sortDir === 'asc' ? 1 : -1;
    return 0;
  });

  return (
    <div>
      <window.PageHeader title="Artister" subtitle={`${filtered.length} artister · ${window.DATA.BEATS.length} beats samlet`}>
        <window.Btn icon={<I.plus />} onClick={onNewArtist}>Ny artist</window.Btn>
      </window.PageHeader>

      <div style={{ display:'flex', gap:10, marginBottom:18, alignItems:'center', flexWrap:'wrap' }}>
        <div style={{flex:'1 1 300px', minWidth:240}}>
          <window.TextInput value={search} onChange={setSearch} placeholder="Søg artist…" icon={<I.search />} fullWidth />
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
            <SortTh label="Navn" col="name" sortBy={sortBy} sortDir={sortDir} setSort={setSort} />
            <SortTh label="Antal beats" col="count" sortBy={sortBy} sortDir={sortDir} setSort={setSort} align="right" />
          </div>
          {filtered.length === 0 && (
            <div style={{padding:'48px', textAlign:'center', color:'var(--text-3)', fontSize:14}}>Ingen artister matcher søgningen.</div>
          )}
          {sorted.map((a, idx) => (
            <div key={a.id} onClick={() => onOpenArtist(a.id)} style={{
              display:'grid', gridTemplateColumns:'minmax(220px, 2fr) 160px', gap:16,
              alignItems:'center', padding:'14px 20px',
              borderTop: idx === 0 ? 'none' : '1px solid var(--border)',
              cursor:'pointer', color:'var(--text)', transition:'background .12s'
            }}
              onMouseEnter={e => e.currentTarget.style.background='var(--bg-hover)'}
              onMouseLeave={e => e.currentTarget.style.background='transparent'}
            >
              <div style={{display:'flex', alignItems:'center', gap:12, minWidth:0}}>
                <ArtistAvatar id={a.id} name={a.name} size={32} />
                <span style={{fontWeight:600, fontSize:14, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis'}}>{a.name}</span>
              </div>
              <span className="mono" style={{fontSize:13, color:'var(--text-2)', textAlign:'right'}}>{a.beatsCount}</span>
            </div>
          ))}
        </div>
      ) : (
        <div style={{
          display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(240px, 1fr))', gap:16
        }}>
          {sorted.map(a => (
            <button key={a.id} onClick={() => onOpenArtist(a.id)} style={{
              display:'flex', flexDirection:'column', textAlign:'left',
              background:'var(--bg-2)', border:'1px solid var(--border)', borderRadius:10,
              padding:20, transition:'all .15s', cursor:'pointer'
            }}
              onMouseEnter={e => { e.currentTarget.style.borderColor='var(--border-strong)'; e.currentTarget.style.background='var(--bg-3)'; e.currentTarget.style.transform='translateY(-2px)' }}
              onMouseLeave={e => { e.currentTarget.style.borderColor='var(--border)'; e.currentTarget.style.background='var(--bg-2)'; e.currentTarget.style.transform='translateY(0)' }}
            >
              <div style={{display:'flex', alignItems:'center', gap:14, marginBottom:16}}>
                <ArtistAvatar id={a.id} name={a.name} size={52} />
                <div style={{minWidth:0, flex:1}}>
                  <div style={{fontWeight:700, fontSize:17, letterSpacing:'-.01em', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis'}}>{a.name}</div>
                  <div style={{fontSize:12, color:'var(--text-3)', marginTop:2}}>{a.beatsCount} beats</div>
                </div>
              </div>
              <div style={{ display:'flex', gap:6, alignItems:'center' }}>
                {a.tiktok && <SocialIcon icon={<I.tt />} label="TikTok" />}
                {a.youtube && <SocialIcon icon={<I.yt />} label="YouTube" />}
                {a.spotify && <SocialIcon icon={<I.sp />} label="Spotify" />}
                {a.instagram && <SocialIcon icon={<I.ig />} label="Instagram" />}
              </div>
              {/* tiny beats indicator bar */}
              <div style={{marginTop:18, paddingTop:14, borderTop:'1px solid var(--border)', display:'flex', justifyContent:'space-between', alignItems:'center'}}>
                <span style={{ fontSize:11, color:'var(--text-3)', letterSpacing:'.06em', textTransform:'uppercase' }}>Aktive beats</span>
                <span style={{display:'inline-flex', alignItems:'center', gap:5, fontSize:13, color:'var(--text-2)', fontWeight:600}}>
                  {a.beatsCount} <I.chevR width={14} height={14} style={{opacity:.5}} />
                </span>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function ArtistAvatar({ id, name, size = 40 }) {
  // Deterministic gradient per id
  const palettes = [
    ['#e84855','#7a1d24'],['#4A90D9','#1e3f64'],['#2ECC71','#0f4d2a'],
    ['#a855f7','#3d1f5c'],['#f39c12','#62390a'],['#06b6d4','#0a3d4a'],
  ];
  const idx = (id || '').split('').reduce((s,c) => s + c.charCodeAt(0), 0) % palettes.length;
  const [from, to] = palettes[idx];
  const initials = (name || '?').split(' ').map(s => s[0]).join('').slice(0,2).toUpperCase();
  return (
    <div style={{
      width:size, height:size, borderRadius:'50%',
      background:`linear-gradient(135deg, ${from}, ${to})`,
      display:'flex', alignItems:'center', justifyContent:'center',
      fontSize: size * 0.4, fontWeight:700, color:'#fff',
      letterSpacing:'-.02em', flexShrink:0
    }}>{initials}</div>
  );
}

function SocialIcon({ icon, label, small }) {
  const s = small ? 26 : 30;
  return (
    <span title={label} style={{
      width:s, height:s, borderRadius:6, background:'var(--bg-1)',
      border:'1px solid var(--border)', color:'var(--text-3)',
      display:'inline-flex', alignItems:'center', justifyContent:'center'
    }}>{React.cloneElement(icon, { width: small ? 12 : 14, height: small ? 12 : 14 })}</span>
  );
}

window.ArtistsPage = ArtistsPage;
window.ArtistAvatar = ArtistAvatar;
window.SocialIcon = SocialIcon;
