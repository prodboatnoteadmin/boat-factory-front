// Queue page — same look & feel as the Beats list (search + artist
// filter on top, identical row height & typography), plus queue-only
// controls: drag-reorder, move-to-#1, and remove (with confirm).

function QHead({ children }) {
  return <span style={{
    fontSize:11, fontWeight:700, color:'var(--text-3)',
    textTransform:'uppercase', letterSpacing:'.08em', whiteSpace:'nowrap'
  }}>{children}</span>;
}

function QSort({ label, col, sortBy, sortDir, setSort, align }) {
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

function PublishQueuePage({ onOpenBeat, queueIds, setQueueIds, pendingIds, setPendingIds, focusBeatId }) {
  const I = window.Icons;
  const [search, setSearch] = React.useState('');
  const [artistFilter, setArtistFilter] = React.useState('');
  const [draggingId, setDraggingId] = React.useState(null);
  const [dragOverId, setDragOverId] = React.useState(null);
  const [confirmRemove, setConfirmRemove] = React.useState(null);
  const [qShown, setQShown] = React.useState(20);
  const [highlightId, setHighlightId] = React.useState(null);
  const [sortBy, setSortBy] = React.useState('position');
  const [sortDir, setSortDir] = React.useState('asc');
  const setSort = (col) => {
    if (sortBy === col) setSortDir(d => (d === 'asc' ? 'desc' : 'asc'));
    else { setSortBy(col); setSortDir('asc'); }
  };
  const moreRef = React.useRef(null);

  // Same column metrics as the Beats list (40/2fr/1.2fr/70/80/70) plus
  // a position col, a drag handle, and two action buttons.
  const cols = '44px 28px minmax(220px, 2fr) minmax(140px, 1.2fr) 70px 80px 70px 76px 44px 44px 48px';
  const MIN_W = 904;

  const queueBeats = queueIds
    .map(id => window.DATA.BEATS.find(b => b.id === id))
    .filter(Boolean);

  const posOf = (id) => queueIds.indexOf(id);
  const visible = queueBeats
    .filter(b => {
      if (search && !b.title.toLowerCase().includes(search.toLowerCase())) return false;
      if (artistFilter && b.artist !== artistFilter) return false;
      return true;
    })
    .slice()
    .sort((a, b) => {
      let av, bv;
      if (sortBy === 'position') { av = posOf(a.id); bv = posOf(b.id); }
      else if (sortBy === 'artist') { av = window.getArtistName(a.artist); bv = window.getArtistName(b.artist); }
      else if (sortBy === 'category') { av = a.category || ''; bv = b.category || ''; }
      else { av = a[sortBy]; bv = b[sortBy]; }
      if (av < bv) return sortDir === 'asc' ? -1 : 1;
      if (av > bv) return sortDir === 'asc' ? 1 : -1;
      return 0;
    });

  // Infinite scroll: 20 at a time, load 20 more when the sentinel shows.
  React.useEffect(() => { setQShown(20); }, [search, artistFilter, sortBy, sortDir]);
  React.useEffect(() => {
    if (qShown >= visible.length) return;
    const el = moreRef.current;
    if (!el) return;
    const io = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) setQShown(s => Math.min(s + 20, visible.length));
    }, { rootMargin: '300px' });
    io.observe(el);
    return () => io.disconnect();
  }, [qShown, visible.length]);

  // When arriving from a beat ("Se i kø"), reveal + scroll to + highlight it.
  React.useEffect(() => {
    if (!focusBeatId) return;
    const idx = visible.findIndex(b => b.id === focusBeatId);
    if (idx === -1) return;
    setQShown(s => Math.max(s, idx + 1));
    setHighlightId(focusBeatId);
    const t1 = setTimeout(() => {
      const el = document.getElementById('q-' + focusBeatId);
      if (el) el.scrollIntoView({ block: 'center', behavior: 'smooth' });
    }, 150);
    const t2 = setTimeout(() => setHighlightId(null), 2800);
    return () => { clearTimeout(t1); clearTimeout(t2); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [focusBeatId]);

  const handleDragStart = (id) => setDraggingId(id);
  const handleDragOver = (e, id) => { e.preventDefault(); setDragOverId(id); };
  const handleDragEnd = () => { setDraggingId(null); setDragOverId(null); };
  const handleDrop = (e, targetId) => {
    e.preventDefault();
    if (!draggingId || draggingId === targetId) return handleDragEnd();
    const newList = [...queueIds];
    const fromIdx = newList.indexOf(draggingId);
    const toIdx = newList.indexOf(targetId);
    if (fromIdx === -1 || toIdx === -1) return handleDragEnd();
    const [moved] = newList.splice(fromIdx, 1);
    newList.splice(toIdx, 0, moved);
    setQueueIds(newList);
    handleDragEnd();
  };

  const removeFromQueue = (id) => {
    setQueueIds(queueIds.filter(qId => qId !== id));
    setPendingIds([id, ...pendingIds.filter(pId => pId !== id)]);
  };
  // Keep the user's scroll position when reordering.
  const keepScroll = (fn) => {
    const y = window.scrollY;
    fn();
    requestAnimationFrame(() => window.scrollTo(0, y));
  };
  const moveToTop = (id) => keepScroll(() => setQueueIds([id, ...queueIds.filter(qId => qId !== id)]));
  const moveToBottom = (id) => keepScroll(() => setQueueIds([...queueIds.filter(qId => qId !== id), id]));

  return (
    <div>
      <window.PageHeader title="Queue" subtitle={`${visible.length} af ${queueBeats.length} i køen`} />

      {/* Filter bar — identical to Beats */}
      <div style={{ display:'flex', gap:10, marginBottom:18, alignItems:'center', flexWrap:'wrap' }}>
        <div style={{flex:'1 1 300px', minWidth:240}}>
          <window.TextInput value={search} onChange={setSearch} placeholder="Søg efter sangnavn" icon={<I.search />} fullWidth />
        </div>
        <window.Select value={artistFilter} onChange={setArtistFilter} options={[
          { value:'', label:'Alle artister' },
          ...window.DATA.ARTISTS.map(a => ({ value:a.id, label:a.name }))
        ]} style={{width:180}} />
      </div>

      {/* Table — same shell, row height & typography as Beats */}
      <div style={{ background:'var(--bg-2)', border:'1px solid var(--border)', borderRadius:8, overflow:'hidden' }}>
        <div style={{ overflowX:'auto' }}>
          <div style={{
            display:'grid', gridTemplateColumns: cols, gap:16,
            alignItems:'center', padding:'14px 20px',
            borderBottom:'1px solid var(--border)', background:'var(--bg-1)', minWidth: MIN_W
          }}>
            <QSort label="#" col="position" sortBy={sortBy} sortDir={sortDir} setSort={setSort} />
            <QHead></QHead>
            <QSort label="Sangtitel" col="title" sortBy={sortBy} sortDir={sortDir} setSort={setSort} />
            <QSort label="Artist" col="artist" sortBy={sortBy} sortDir={sortDir} setSort={setSort} />
            <QSort label="BPM" col="bpm" sortBy={sortBy} sortDir={sortDir} setSort={setSort} />
            <QSort label="Key" col="key" sortBy={sortBy} sortDir={sortDir} setSort={setSort} />
            <QSort label="Årstal" col="year" sortBy={sortBy} sortDir={sortDir} setSort={setSort} />
            <QSort label="Rating" col="category" sortBy={sortBy} sortDir={sortDir} setSort={setSort} />
            <QHead></QHead>
            <QHead></QHead>
            <QHead></QHead>
          </div>

          {queueBeats.length === 0 && (
            <div style={{padding:'48px', textAlign:'center', color:'var(--text-3)', fontSize:14}}>Køen er tom.</div>
          )}
          {queueBeats.length > 0 && visible.length === 0 && (
            <div style={{padding:'48px', textAlign:'center', color:'var(--text-3)', fontSize:14}}>Ingen beats matcher filtrene.</div>
          )}

          {visible.slice(0, qShown).map((b, vIdx) => {
            const pos = queueIds.indexOf(b.id);
            const ytLink = window.getFirstYouTubeLink(b.id);
            const postedYt = !!ytLink || !!b.youtubeStatus;
            const isDragTarget = dragOverId === b.id && draggingId !== b.id;
            return (
              <div key={b.id}
                id={'q-' + b.id}
                draggable
                onDragStart={() => handleDragStart(b.id)}
                onDragOver={(e) => handleDragOver(e, b.id)}
                onDragEnd={handleDragEnd}
                onDrop={(e) => handleDrop(e, b.id)}
                onClick={() => onOpenBeat(b.id)}
                style={{
                  display:'grid', gridTemplateColumns: cols, gap:16,
                  alignItems:'center', padding:'14px 20px',
                  borderTop: vIdx === 0 ? 'none' : '1px solid var(--border)',
                  background: b.id === highlightId ? 'rgba(74,144,217,.20)' : (isDragTarget ? 'rgba(74,144,217,.08)' : 'transparent'),
                  opacity: draggingId === b.id ? 0.45 : 1,
                  transition:'background .12s', cursor:'pointer', color:'var(--text)',
                  minWidth: MIN_W
                }}
                onMouseEnter={e => { if (!isDragTarget && b.id !== highlightId) e.currentTarget.style.background='var(--bg-hover)'; }}
                onMouseLeave={e => { if (!isDragTarget) e.currentTarget.style.background = b.id === highlightId ? 'rgba(74,144,217,.20)' : 'transparent'; }}
              >
                <span className="mono" style={{ fontSize:13, fontWeight:700, color: pos < 3 ? 'var(--text)' : 'var(--text-3)' }}>#{pos + 1}</span>
                <span onClick={(e) => e.stopPropagation()} title="Træk for at omarrangere"
                  style={{ color:'var(--text-4)', cursor:'grab', display:'inline-flex' }}>
                  <I.drag width={15} height={15} />
                </span>
                <div style={{display:'flex', alignItems:'center', gap:10, minWidth:0}}>
                  <window.PlayCell beat={b} size={28} />
                  <span style={{fontWeight:600, fontSize:14, color:'var(--text)', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis'}}>{b.title}</span>
                  {b.status === 'processing' && <window.ProgressBar style={{ flex:'1 1 50px', minWidth:40, maxWidth:150 }} />}
                </div>
                <div style={{fontSize:13, color:'var(--text-2)', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis'}}>{window.getArtistName(b.artist)}</div>
                <div className="mono" style={{fontSize:13, color:'var(--text-2)'}}>{b.bpm}</div>
                <div className="mono" style={{fontSize:13, color:'var(--text-2)'}}>{b.key}</div>
                <div className="mono" style={{fontSize:13, color:'var(--text-3)'}}>{b.year}</div>
                <div style={{fontSize:13, color:'var(--text-2)'}}>{b.category ? (b.category.charAt(0).toUpperCase() + b.category.slice(1)) : ''}</div>
                <div onClick={(e) => e.stopPropagation()}>
                  <window.Tip label={pos === 0 ? 'Allerede #1' : 'Flyt til #1'}>
                    <button onClick={() => moveToTop(b.id)} disabled={pos === 0} style={{
                      width:28, height:28, borderRadius:5,
                      color: pos === 0 ? 'var(--text-4)' : 'var(--text-2)',
                      border:'1px solid var(--border-strong)', background:'transparent',
                      display:'inline-flex', alignItems:'center', justifyContent:'center',
                      cursor: pos === 0 ? 'not-allowed' : 'pointer'
                    }}
                      onMouseEnter={e=>{ if (pos!==0){ e.currentTarget.style.background='rgba(74,144,217,.12)'; e.currentTarget.style.color='#7ab2ea'; e.currentTarget.style.borderColor='rgba(74,144,217,.5)'; } }}
                      onMouseLeave={e=>{ e.currentTarget.style.background='transparent'; e.currentTarget.style.color=pos===0?'var(--text-4)':'var(--text-2)'; e.currentTarget.style.borderColor='var(--border-strong)'; }}>
                      <I.chevUp width={15} height={15} />
                    </button>
                  </window.Tip>
                </div>
                <div onClick={(e) => e.stopPropagation()}>
                  <window.Tip label={pos === queueIds.length - 1 ? 'Allerede nederst' : 'Flyt til bund'}>
                    <button onClick={() => moveToBottom(b.id)} disabled={pos === queueIds.length - 1} style={{
                      width:28, height:28, borderRadius:5,
                      color: pos === queueIds.length - 1 ? 'var(--text-4)' : 'var(--text-2)',
                      border:'1px solid var(--border-strong)', background:'transparent',
                      display:'inline-flex', alignItems:'center', justifyContent:'center',
                      cursor: pos === queueIds.length - 1 ? 'not-allowed' : 'pointer'
                    }}
                      onMouseEnter={e=>{ if (pos!==queueIds.length-1){ e.currentTarget.style.background='rgba(74,144,217,.12)'; e.currentTarget.style.color='#7ab2ea'; e.currentTarget.style.borderColor='rgba(74,144,217,.5)'; } }}
                      onMouseLeave={e=>{ e.currentTarget.style.background='transparent'; e.currentTarget.style.color=pos===queueIds.length-1?'var(--text-4)':'var(--text-2)'; e.currentTarget.style.borderColor='var(--border-strong)'; }}>
                      <I.chevDown width={15} height={15} />
                    </button>
                  </window.Tip>
                </div>
                <div onClick={(e) => e.stopPropagation()}>
                  <window.Tip label="Fjern fra kø">
                    <button onClick={() => setConfirmRemove(b.id)} style={{
                      width:28, height:28, borderRadius:5, color:'var(--text-3)',
                      border:'1px solid var(--border-strong)', background:'transparent',
                      display:'inline-flex', alignItems:'center', justifyContent:'center'
                    }}
                      onMouseEnter={e=>{e.currentTarget.style.background='rgba(232,72,85,.12)';e.currentTarget.style.color='#ec6d77';e.currentTarget.style.borderColor='rgba(232,72,85,.5)'}}
                      onMouseLeave={e=>{e.currentTarget.style.background='transparent';e.currentTarget.style.color='var(--text-3)';e.currentTarget.style.borderColor='var(--border-strong)'}}>
                      <I.x width={13} height={13} />
                    </button>
                  </window.Tip>
                </div>
              </div>
            );
          })}
          {qShown < visible.length && (
            <div ref={moreRef} style={{ padding:'18px', textAlign:'center', color:'var(--text-3)', fontSize:13 }}>
              Indlæser flere… ({qShown} / {visible.length})
            </div>
          )}
        </div>
      </div>

      {confirmRemove && (
        <window.ConfirmDialog
          title="Fjern fra køen?"
          message="Er du sikker på, at du vil fjerne dette beat fra køen? Det flyttes tilbage til Draft."
          onCancel={() => setConfirmRemove(null)}
          onConfirm={() => { removeFromQueue(confirmRemove); setConfirmRemove(null); }}
          confirmLabel="Fjern fra kø"
          danger
        />
      )}
    </div>
  );
}

function ConfirmDialog({ title, message, onConfirm, onCancel, confirmLabel = 'Bekræft', danger }) {
  React.useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onCancel(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onCancel]);

  return (
    <div style={{
      position:'fixed', inset:0, zIndex:200,
      display:'flex', alignItems:'center', justifyContent:'center',
      background:'rgba(0,0,0,.7)', backdropFilter:'blur(4px)', padding:20
    }} onClick={onCancel}>
      <div onClick={(e) => e.stopPropagation()} style={{
        background:'var(--bg-2)', border:'1px solid var(--border-strong)', borderRadius:12,
        padding:28, maxWidth:440, width:'100%',
        boxShadow:'0 30px 80px rgba(0,0,0,.6)'
      }}>
        <h2 style={{margin:'0 0 8px', fontSize:20, fontWeight:700, letterSpacing:'-.02em'}}>{title}</h2>
        <p style={{margin:'0 0 22px', fontSize:14, color:'var(--text-2)', lineHeight:1.5}}>{message}</p>
        <div style={{display:'flex', gap:10, justifyContent:'flex-end'}}>
          <window.Btn kind="secondary" onClick={onCancel}>Annuller</window.Btn>
          <window.Btn kind={danger ? 'primary' : 'blue'} onClick={onConfirm}>{confirmLabel}</window.Btn>
        </div>
      </div>
    </div>
  );
}

window.PublishQueuePage = PublishQueuePage;
window.ConfirmDialog = ConfirmDialog;
