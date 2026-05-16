// Beats list — table only, no status, checkbox bulk action
function BeatsPage({ onOpenBeat, onNewBeat, onAddToQueue }) {
  const I = window.Icons;
  const [search, setSearch] = React.useState('');
  const [artistFilter, setArtistFilter] = React.useState('');
  const [sortBy, setSortBy] = React.useState('modified');
  const [sortDir, setSortDir] = React.useState('desc');
  const [selected, setSelected] = React.useState(new Set());

  const filtered = React.useMemo(() => {
    let arr = window.DATA.BEATS.filter(b => {
      if (search && !b.title.toLowerCase().includes(search.toLowerCase())) return false;
      if (artistFilter && b.artist !== artistFilter) return false;
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
  }, [search, artistFilter, sortBy, sortDir]);

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
      <window.PageHeader title="Beats" subtitle={`${filtered.length} af ${window.DATA.BEATS.length} beats vist`}>
        <window.Btn kind="primary" icon={<I.plus />} onClick={onNewBeat}>Nyt Beat</window.Btn>
      </window.PageHeader>

      {/* Filter bar */}
      <div style={{ display:'flex', gap:10, marginBottom:18, alignItems:'center', flexWrap:'wrap' }}>
        <div style={{flex:'1 1 300px', minWidth:240}}>
          <window.TextInput value={search} onChange={setSearch} placeholder="Søg songtitle…" icon={<I.search />} fullWidth />
        </div>
        <window.Select value={artistFilter} onChange={setArtistFilter} options={[
          { value:'', label:'Alle artists' },
          ...window.DATA.ARTISTS.map(a => ({ value:a.id, label:a.name }))
        ]} style={{width:180}} />
      </div>

      {/* Table */}
      <div style={{ background:'var(--bg-2)', border:'1px solid var(--border)', borderRadius:8, overflow:'hidden', marginBottom: selected.size ? 90 : 0 }}>
        <div style={{ overflowX:'auto' }}>
        <div style={{
          display:'grid',
          gridTemplateColumns:'40px minmax(220px, 2fr) minmax(140px, 1.2fr) 70px 80px 70px 120px',
          gap:16,
          alignItems:'center', padding:'14px 20px', borderBottom:'1px solid var(--border)', background:'var(--bg-1)',
          minWidth: 820
        }}>
          <CheckBox checked={allChecked} indeterminate={someChecked} onChange={toggleAll} />
          <SortHead label="Sangtitel" col="title" sortBy={sortBy} sortDir={sortDir} setSort={setSort} />
          <SortHead label="Artist" col="artist" sortBy={sortBy} sortDir={sortDir} setSort={setSort} />
          <SortHead label="BPM" col="bpm" sortBy={sortBy} sortDir={sortDir} setSort={setSort} />
          <SortHead label="Key" col="key" sortBy={sortBy} sortDir={sortDir} setSort={setSort} />
          <SortHead label="Årstal" col="year" sortBy={sortBy} sortDir={sortDir} setSort={setSort} />
          <SortHead label="Udgivet" col="udgivet" sortBy={sortBy} sortDir={sortDir} setSort={setSort} align="right" />
        </div>
        {filtered.length === 0 && (
          <div style={{padding:'48px', textAlign:'center', color:'var(--text-3)', fontSize:14}}>Ingen beats matcher filtrene.</div>
        )}
        {filtered.map((b, idx) => {
          const checked = selected.has(b.id);
          const published = window.getLatestPublishDate(b.id);
          return (
            <div key={b.id} onClick={() => onOpenBeat(b.id)} style={{
              display:'grid',
              gridTemplateColumns:'40px minmax(220px, 2fr) minmax(140px, 1.2fr) 70px 80px 70px 120px',
              gap:16,
              alignItems:'center', padding:'14px 20px',
              borderTop: idx === 0 ? 'none' : '1px solid var(--border)',
              background: checked ? 'rgba(74,144,217,.06)' : 'transparent',
              transition:'background .12s', cursor:'pointer', color:'var(--text)',
              minWidth: 820
            }}
              onMouseEnter={e => { if (!checked) e.currentTarget.style.background='var(--bg-hover)'; }}
              onMouseLeave={e => { if (!checked) e.currentTarget.style.background='transparent'; }}
            >
              <div onClick={(e) => e.stopPropagation()}>
                <CheckBox checked={checked} onChange={() => toggle(b.id)} />
              </div>
              <div style={{display:'flex', alignItems:'center', gap:12, minWidth:0}}>
                <div style={{
                  width:32, height:32, borderRadius:4, flexShrink:0,
                  background:'linear-gradient(135deg, #2b2b2b, #161616)',
                  display:'flex', alignItems:'center', justifyContent:'center'
                }}>
                  <I.play width={12} height={12} />
                </div>
                <div style={{fontWeight:600, fontSize:14, minWidth:0, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis'}}>{b.title}</div>
              </div>
              <div style={{fontSize:13, color:'var(--text-2)'}}>{window.getArtistName(b.artist)}</div>
              <div className="mono" style={{fontSize:13, color:'var(--text-2)'}}>{b.bpm}</div>
              <div className="mono" style={{fontSize:13, color:'var(--text-2)'}}>{b.key}</div>
              <div className="mono" style={{fontSize:13, color:'var(--text-3)'}}>{b.year}</div>
              <div style={{fontSize:12, color: published ? 'var(--text-2)' : 'var(--text-4)', textAlign:'right'}}>
                {published ? window.fmtDate(published) : '—'}
              </div>
            </div>
          );
        })}
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
