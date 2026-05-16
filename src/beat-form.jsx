// Beat form modal (create / edit)
function BeatFormModal({ open, beatId, onClose, onSave }) {
  const I = window.Icons;
  const existing = beatId ? window.DATA.BEATS.find(b => b.id === beatId) : null;

  const buildForm = (b) => ({
    title: b?.title || '',
    artist: b?.artist || '',
    coArtists: b?.coArtists ? [...b.coArtists] : [],
    year: b?.year || new Date().getFullYear(),
    bpm: b?.bpm ?? '',
    key: b?.key || '',
    collab: b?.collab || '',
    coCollabs: b?.coCollabs ? [...b.coCollabs] : [],
    category: b?.category || '',
    status: b?.status || 'draft',
    beatstars: b?.beatstars || '',
    youtube: b?.youtube || '',
    fileName: b?.fileName || '',
    filePath: b?.filePath || '',
    notes: b?.notes || '',
  });

  const [form, setForm] = React.useState(() => buildForm(existing));

  // Re-fill the form every time the modal opens (or a different beat
  // is selected) — otherwise editing shows the previous/empty values.
  React.useEffect(() => {
    if (open) setForm(buildForm(existing));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, beatId]);

  React.useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  if (!open) return null;

  const set = (k, v) => setForm({ ...form, [k]: v });

  return (
    <div style={{
      position:'fixed', inset:0, zIndex:100, display:'flex',
      alignItems:'flex-start', justifyContent:'center',
      background:'rgba(0,0,0,.65)', backdropFilter:'blur(4px)', padding:'40px 20px',
      overflow:'auto'
    }} onClick={onClose}>
      <div style={{
        background:'var(--bg-2)', border:'1px solid var(--border-strong)', borderRadius:12,
        width:'100%', maxWidth:760, padding:0, overflow:'hidden',
        boxShadow:'0 30px 80px rgba(0,0,0,.6)'
      }} onClick={(e) => e.stopPropagation()}>
        {/* header */}
        <div style={{display:'flex', alignItems:'center', justifyContent:'space-between', padding:'20px 24px', borderBottom:'1px solid var(--border)'}}>
          <div>
            <h2 style={{margin:0, fontSize:20, fontWeight:700, letterSpacing:'-.02em'}}>{existing ? 'Rediger beat' : 'Nyt beat'}</h2>
            <p style={{margin:'4px 0 0', fontSize:13, color:'var(--text-3)'}}>{existing ? `Ændringer gemmes på "${existing.title}"` : 'Tilføj et nyt beat til biblioteket'}</p>
          </div>
          <button onClick={onClose} style={{padding:8, borderRadius:6, color:'var(--text-3)'}}
            onMouseEnter={e=>{e.currentTarget.style.background='var(--bg-hover)';e.currentTarget.style.color='var(--text)'}}
            onMouseLeave={e=>{e.currentTarget.style.background='transparent';e.currentTarget.style.color='var(--text-3)'}}>
            <I.x width={18} height={18} />
          </button>
        </div>

        {/* body */}
        <div style={{padding:'24px', maxHeight:'70vh', overflow:'auto'}}>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16 }}>
            <Field label="Navn" required>
              <window.TextInput value={form.title} onChange={(v) => set('title', v)} placeholder="Skriv navnet på beatet" fullWidth />
            </Field>
            <Field label="Artist" required>
              <window.Select value={form.artist} onChange={(v) => set('artist', v)}
                options={window.DATA.ARTISTS.map(a => ({ value:a.id, label:a.name }))} />
            </Field>

            <Field label="Co-Artists">
              <ChipInput values={form.coArtists} onChange={(v) => set('coArtists', v)} placeholder="Skriv co-artists navn + Enter" />
            </Field>
            <Field label="Årstal">
              <window.TextInput value={form.year} onChange={(v) => set('year', v)} fullWidth />
            </Field>

            <Field label="BPM">
              <window.TextInput value={form.bpm} onChange={(v) => set('bpm', v)} placeholder="Skriv beatets BPM" type="number" fullWidth />
            </Field>
            <Field label="Key">
              <window.Select value={form.key} onChange={(v) => set('key', v)} placeholder="Vælg key" options={window.DATA.KEYS} />
            </Field>

            <Field label="Collab">
              <window.TextInput value={form.collab} onChange={(v) => set('collab', v)} placeholder="Skriv primær collab" fullWidth />
            </Field>
            <Field label="Co-Collabs">
              <ChipInput values={form.coCollabs} onChange={(v) => set('coCollabs', v)} placeholder="Skriv co-collabs navn + Enter" />
            </Field>

            <Field label="Collab folder">
              <CollabFolderInput value={form.filePath} onChange={(v) => set('filePath', v)} />
            </Field>
            <Field label="Beatstars link" required>
              <window.TextInput value={form.beatstars} onChange={(v) => set('beatstars', v)} placeholder="Skriv linket til beatet på Beatstars" fullWidth />
            </Field>

            <Field label="Filnavn" required>
              <window.TextInput value={form.fileName} onChange={(v) => set('fileName', v)} placeholder="Skriv det præcise filnavn (fx. beat.mp3)" fullWidth />
            </Field>
          </div>
        </div>

        {/* footer */}
        <div style={{display:'flex', justifyContent:'flex-end', gap:10, padding:'16px 24px', borderTop:'1px solid var(--border)', background:'var(--bg-1)'}}>
          <window.Btn kind="secondary" onClick={onClose}>Annuller</window.Btn>
          <window.Btn kind="blue" icon={<I.check />}
            disabled={!form.title.trim() || !form.artist || !form.beatstars.trim() || !form.fileName.trim()}
            onClick={() => onSave(form)}>Gem</window.Btn>
        </div>
      </div>
    </div>
  );
}

function CollabFolderInput({ value, onChange }) {
  const [focus, setFocus] = React.useState(false);
  return (
    <div style={{
      display:'flex', alignItems:'center', gap:2, padding:'0 4px 0 12px',
      background:'var(--bg-1)', border:`1px solid ${focus ? 'var(--blue)' : 'var(--border-strong)'}`,
      borderRadius:6, height:38, transition:'border-color .15s', overflow:'hidden'
    }}>
      <span style={{ fontSize:14, color:'var(--text-3)', whiteSpace:'nowrap', fontFamily:'JetBrains Mono, monospace' }}>@Boatnote x @</span>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => setFocus(true)}
        onBlur={() => setFocus(false)}
        placeholder="Skriv navn"
        style={{ flex:1, background:'transparent', border:'none', outline:'none', color:'var(--text)', fontSize:14, minWidth:80, padding:'0 2px', fontFamily:'JetBrains Mono, monospace' }} />
      <span style={{ fontSize:14, color:'var(--text-3)', whiteSpace:'nowrap', fontFamily:'JetBrains Mono, monospace', paddingRight:8 }}>{' Beats'}</span>
    </div>
  );
}

function Field({ label, required, full, children }) {
  return (
    <div style={{ gridColumn: full ? '1 / -1' : 'auto' }}>
      <label style={{display:'block', fontSize:12, color:'var(--text-3)', marginBottom:6, fontWeight:600, letterSpacing:'.02em'}}>
        {label}{required && <span style={{color:'var(--red)'}}> *</span>}
      </label>
      {children}
    </div>
  );
}

function ChipInput({ values, onChange, placeholder }) {
  const [text, setText] = React.useState('');
  return (
    <div style={{
      display:'flex', flexWrap:'wrap', gap:6, padding:6,
      background:'var(--bg-1)', border:'1px solid var(--border-strong)', borderRadius:6, minHeight:38
    }}>
      {values.map(v => <window.Chip key={v} onRemove={() => onChange(values.filter(x => x !== v))}>{v}</window.Chip>)}
      <input value={text} onChange={(e) => setText(e.target.value)} placeholder={placeholder}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && text.trim()) { e.preventDefault(); onChange([...values, text.trim()]); setText(''); }
          if (e.key === 'Backspace' && !text && values.length) onChange(values.slice(0, -1));
        }}
        style={{ flex:1, minWidth:120, background:'transparent', border:'none', outline:'none', color:'var(--text)', fontSize:14, padding:'4px 6px' }} />
    </div>
  );
}

window.BeatFormModal = BeatFormModal;
