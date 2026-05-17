// Beats list — table only, no status, checkbox bulk action
function BeatsPage({ onOpenBeat, onNewBeat, onAddToQueue, collab, embedded }) {
  const I = window.Icons;
  const [search, setSearch] = React.useState('');
  const [artistFilter, setArtistFilter] = React.useState('');
  const [statusFilter, setStatusFilter] = React.useState('');
  const [sortBy, setSortBy] = React.useState('title');
  const [sortDir, setSortDir] = React.useState('asc');
  const [selected, setSelected] = React.useState(new Set());
  const [shown, setShown] = React.useState(20);
  const moreRef = React.useRef(null);

  const filtered = React.useMemo(() => {
    let arr = window.DATA.BEATS.filter(b => {
      if (search && !b.title.toLowerCase().includes(search.toLowerCase())) return false;
      if (artistFilter && b.artist !== artistFilter) return false;
      if (statusFilter === 'queued' && b.status !== 'pending') return false;
      if (statusFilter === 'notqueued' && b.status === 'pending') return false;
      if (collab && b.collab !== collab) return false;
      return true;
    });
    arr.sort((a, b) => {
      let av, bv;
      if (sortBy === 'artist') { av = window.getArtistName(a.artist); bv = window.getArtistName(b.artist); }
      else if (sortBy === 'udgivet') {
        av = window.getLatestPublishDate(a.id) || '';
        bv = window.getLatestPublishDate(b.id) || '';
      }
      else { av = a[sortBy]; bv = b[sortBy]; }
      if (av < bv) return sortDir === 'asc' ? -1 : 1;
      if (av > bv) return sortDir === 'asc' ? 1 : -1;
      return 0;
    });
    return arr;
  }, [search, artistFilter, statusFilter, collab, sortBy, sortDir]);

  // Infinite scroll: 20 at a time, load 20 more when the sentinel shows.
  React.useEffect(() => { setShown(20); }, [search, artistFilter, statusFilter, collab, sortBy, sortDir]);
  React.useEffect(() => {
    if (shown >= filtered.length) return;
    const el = moreRef.current;
    if (!el) return;
    const io = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) setShown(s => Math.min(s + 20, filtered.length));
    }, { rootMargin: '300px' });
    io.observe(el);
    return () => io.disconnect();
  }, [shown, filtered.length]);

  const setSort = (col) => {
    if (sortBy === col) setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
    else { setSortBy(col); setSortDir('asc'); }
  };

  const toggle = (id) => {
    const n = new Set(selected);
    n.has(id) ? n.delete(id) : n.add(id);
    setSelected(n);
  };
  const toggleAll = () => {
    if (selected.size === filtered.length) setSelected(new Set());
    else setSelected(new Set(filtered.map(b => b.id)));
  };

  const allChecked = filtered.length > 0 && selected.size === filtered.length;
  const someChecked = selected.size > 0 && selected.size < filtered.length;

  return (
    <div>
      {!embedded && (
        <window.PageHeader title="Beats" subtitle={`${filtered.length} af ${window.DATA.BEATS.length} beats vist`}>
          <window.Btn kind="primary" icon={<I.plus />} onClick={onNewBeat}>Nyt Beat</window.Btn>
        </window.PageHeader>
      )}

      {/* Filter bar */}
      <div style={{ display:'flex', gap:10, marginBottom:18, alignItems:'center', flexWrap:'wrap' }}>
        <div style={{flex:'1 1 300px', minWidth:240}}>
          <window.TextInput value={search} onChange={setSearch} placeholder="Søg efter sangnavn" icon={<I.search />} fullWidth />
        </div>
        <window.Select value={statusFilter} onChange={setStatusFilter} options={[
          { value:'', label:'Vis alle' },
          { value:'notqueued', label:'Ikke i kø' },
          { value:'queued', label:'I kø' },
        ]} style={{width:160}} />
        {!embedded && (
          <window.Select value={artistFilter} onChange={setArtistFilter} options={[
            { value:'', label:'Alle artister' },
            ...window.DATA.ARTISTS.map(a => ({ value:a.id, label:a.name }))
          ]} style={{width:180}} />
        )}
      </div>

      {/* Table */}
      <div style={{ background:'var(--bg-2)', border:'1px solid var(--border)', borderRadius:8, overflow:'hidden', marginBottom: selected.size ? 90 : 0 }}>
        <div style={{ overflowX:'auto' }}>
        <div style={{
          display:'grid',
          gridTemplateColumns:'40px minmax(220px, 2fr) minmax(140px, 1.2fr) 70px 80px 70px 90px 120px',
          gap:16,
          alignItems:'center', padding:'14px 20px', borderBottom:'1px solid var(--border)', background:'var(--bg-1)',
          minWidth: 700
        }}>
          <CheckBox checked={allChecked} indeterminate={someChecked} onChange={toggleAll} />
          <SortHead label="Sangtitel" col="title" sortBy={sortBy} sortDir={sortDir} setSort={setSort} />
          <SortHead label="Artist" col="artist" sortBy={sortBy} sortDir={sortDir} setSort={setSort} />
          <SortHead label="BPM" col="bpm" sortBy={sortBy} sortDir={sortDir} setSort={setSort} />
          <SortHead label="Key" col="key" sortBy={sortBy} sortDir={sortDir} setSort={setSort} />
          <SortHead label="Årstal" col="year" sortBy={sortBy} sortDir={sortDir} setSort={setSort} />
          <SortHead label="Position" col="queuePosition" sortBy={sortBy} sortDir={sortDir} setSort={setSort} align="right" />
          <SortHead label="Udgivet på YouTube" col="udgivet" sortBy={sortBy} sortDir={sortDir} setSort={setSort} align="right" />
        </div>
        {filtered.length === 0 && (
          <div style={{padding:'48px', textAlign:'center', color:'var(--text-3)', fontSize:14}}>Ingen beats matcher filtrene.</div>
        )}
        {filtered.slice(0, shown).map((b, idx) => {
          const checked = selected.has(b.id);
          const published = window.getLatestPublishDate(b.id);
          return (
            <div key={b.id} onClick={() => onOpenBeat(b.id)} style={{
              display:'grid',
              gridTemplateColumns:'40px minmax(220px, 2fr) minmax(140px, 1.2fr) 70px 80px 70px 90px 120px',
              gap:16,
              alignItems:'center', padding:'14px 20px',
              borderTop: idx === 0 ? 'none' : '1px solid var(--border)',
              background: checked ? 'rgba(74,144,217,.06)' : 'transparent',
              transition:'background .12s', cursor:'pointer', color:'var(--text)',
              minWidth: 700
            }}
              onMouseEnter={e => { if (!checked) e.currentTarget.style.background='var(--bg-hover)'; }}
              onMouseLeave={e => { if (!checked) e.currentTarget.style.background='transparent'; }}
            >
              <div onClick={(e) => e.stopPropagation()}>
                <CheckBox checked={checked} onChange={() => toggle(b.id)} />
              </div>
              <div style={{display:'flex', alignItems:'center', gap:12, minWidth:0}}>
                <window.PlayCell beat={b} />
                <div style={{fontWeight:600, fontSize:14, minWidth:0, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis'}}>{b.title}</div>
                {b.status === 'processing' && <window.ProgressBar style={{ flex:'1 1 60px', minWidth:50, maxWidth:170, marginLeft:4 }} />}
              </div>
              <div style={{fontSize:13, color:'var(--text-2)'}}>{window.getArtistName(b.artist)}</div>
              <div className="mono" style={{fontSize:13, color:'var(--text-2)'}}>{b.bpm}</div>
              <div className="mono" style={{fontSize:13, color:'var(--text-2)'}}>{b.key}</div>
              <div className="mono" style={{fontSize:13, color:'var(--text-3)'}}>{b.year}</div>
              <div className="mono" style={{fontSize:13, color:'var(--text-2)', textAlign:'right'}}>{b.queuePosition ?? ''}</div>
              <div style={{fontSize:12, color: published ? 'var(--text-2)' : 'var(--text-4)', textAlign:'right'}}>
                {published ? window.fmtDate(published) : '—'}
              </div>
            </div>
          );
        })}
        {shown < filtered.length && (
          <div ref={moreRef} style={{ padding:'18px', textAlign:'center', color:'var(--text-3)', fontSize:13 }}>
            Indlæser flere… ({shown} / {filtered.length})
          </div>
        )}
        </div>
      </div>

      {/* Bulk action bar */}
      {selected.size > 0 && (
        <div style={{
          position:'fixed', bottom:24, left:'calc(50% + 120px)', transform:'translateX(-50%)',
          background:'var(--bg-2)', border:'1px solid var(--border-strong)', borderRadius:10,
          padding:'12px 16px 12px 20px',
          display:'flex', alignItems:'center', gap:18,
          boxShadow:'0 20px 60px rgba(0,0,0,.6), 0 0 0 1px rgba(74,144,217,.2)',
          zIndex:50, minWidth:380
        }}>
          <span style={{fontSize:14, fontWeight:600}}>
            <span className="mono" style={{color:'var(--blue)'}}>{selected.size}</span>
            <span style={{color:'var(--text-2)'}}> {selected.size === 1 ? 'beat' : 'beats'} valgt</span>
          </span>
          <div style={{flex:1}}></div>
          <button onClick={() => setSelected(new Set())} style={{ fontSize:13, color:'var(--text-3)', padding:'6px 12px', borderRadius:6 }}
            onMouseEnter={e=>{e.currentTarget.style.color='var(--text)';e.currentTarget.style.background='var(--bg-hover)'}}
            onMouseLeave={e=>{e.currentTarget.style.color='var(--text-3)';e.currentTarget.style.background='transparent'}}>
            Ryd valg
          </button>
          <window.Btn kind="blue" icon={<I.plus />} onClick={() => {
            onAddToQueue && onAddToQueue([...selected]);
            setSelected(new Set());
          }}>Add to Queue</window.Btn>
        </div>
      )}

    </div>
  );
}

function SortHead({ label, col, sortBy, sortDir, setSort, align }) {
  const I = window.Icons;
  const active = sortBy === col;
  return (
    <button onClick={() => setSort(col)} style={{
      display:'inline-flex', alignItems:'center', gap:5,
      fontSize:11, fontWeight:700, color: active ? 'var(--text)' : 'var(--text-3)',
      textTransform:'uppercase', letterSpacing:'.08em', padding:0,
      justifyContent: align === 'right' ? 'flex-end' : 'flex-start',
      width:'100%'
    }}>
      {align !== 'right' && <span>{label}</span>}
      {align === 'right' && <span>{label}</span>}
      <span style={{display:'inline-flex', opacity: active ? 1 : .4}}>
        {active && sortDir === 'asc' ? <I.chevUp width={12} height={12} /> : <I.chevDown width={12} height={12} />}
      </span>
    </button>
  );
}

function CheckBox({ checked, indeterminate, onChange }) {
  return (
    <button onClick={onChange} style={{
      width:18, height:18, borderRadius:4,
      background: (checked || indeterminate) ? 'var(--blue)' : 'transparent',
      border: '1.5px solid ' + ((checked || indeterminate) ? 'var(--blue)' : '#444'),
      display:'inline-flex', alignItems:'center', justifyContent:'center',
      color:'#fff', transition:'all .1s', flexShrink:0
    }}>
      {checked && <window.Icons.check width={12} height={12} />}
      {indeterminate && !checked && <span style={{width:8, height:2, background:'#fff', borderRadius:1}}></span>}
    </button>
  );
}

window.BeatsPage = BeatsPage;
