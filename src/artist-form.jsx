// Artist form modal — for editing core artist data (name + 4 social links) or creating new
function ArtistFormModal({ open, artistId, onClose, onSave }) {
  const I = window.Icons;
  const existing = artistId ? window.DATA.ARTISTS.find(a => a.id === artistId) : null;

  const [form, setForm] = React.useState({
    name: existing?.name || '',
    tiktok: existing?.tiktok || '',
    youtube: existing?.youtube || '',
    spotify: existing?.spotify || '',
    instagram: existing?.instagram || '',
  });

  React.useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  React.useEffect(() => {
    if (open) {
      setForm({
        name: existing?.name || '',
        tiktok: existing?.tiktok || '',
        youtube: existing?.youtube || '',
        spotify: existing?.spotify || '',
        instagram: existing?.instagram || '',
      });
    }
  }, [open, artistId]);

  if (!open) return null;

  const set = (k, v) => setForm({ ...form, [k]: v });

  return (
    <div style={{
      position:'fixed', inset:0, zIndex:100, display:'flex',
      alignItems:'flex-start', justifyContent:'center',
      background:'rgba(0,0,0,.65)', backdropFilter:'blur(4px)', padding:'60px 20px 20px',
      overflow:'auto'
    }} onClick={onClose}>
      <div style={{
        background:'var(--bg-2)', border:'1px solid var(--border-strong)', borderRadius:12,
        width:'100%', maxWidth:520, padding:0, overflow:'hidden',
        boxShadow:'0 30px 80px rgba(0,0,0,.6)'
      }} onClick={(e) => e.stopPropagation()}>
        {/* header */}
        <div style={{display:'flex', alignItems:'center', justifyContent:'space-between', padding:'20px 24px', borderBottom:'1px solid var(--border)'}}>
          <div>
            <h2 style={{margin:0, fontSize:20, fontWeight:700, letterSpacing:'-.02em'}}>{existing ? 'Rediger artist' : 'Ny artist'}</h2>
            <p style={{margin:'4px 0 0', fontSize:13, color:'var(--text-3)'}}>Navn og 4 sociale links. Tags, keywords og noter redigeres direkte på artist-siden.</p>
          </div>
          <button onClick={onClose} style={{padding:8, borderRadius:6, color:'var(--text-3)'}}
            onMouseEnter={e=>{e.currentTarget.style.background='var(--bg-hover)';e.currentTarget.style.color='var(--text)'}}
            onMouseLeave={e=>{e.currentTarget.style.background='transparent';e.currentTarget.style.color='var(--text-3)'}}>
            <I.x width={18} height={18} />
          </button>
        </div>

        {/* body */}
        <div style={{padding:'24px', display:'flex', flexDirection:'column', gap:18}}>
          {/* Avatar preview */}
          {form.name.trim() && (
            <div style={{ display:'flex', alignItems:'center', gap:14, padding:14, background:'var(--bg-1)', borderRadius:8, border:'1px solid var(--border)' }}>
              <window.ArtistAvatar id={artistId || form.name} name={form.name} size={48} />
              <div>
                <div style={{fontSize:11, color:'var(--text-3)', letterSpacing:'.06em', textTransform:'uppercase'}}>Preview</div>
                <div style={{fontSize:18, fontWeight:700, letterSpacing:'-.01em', marginTop:2}}>{form.name}</div>
              </div>
            </div>
          )}

          <div>
            <label style={{display:'block', fontSize:12, color:'var(--text-3)', marginBottom:6, fontWeight:600}}>Navn <span style={{color:'var(--red)'}}>*</span></label>
            <window.TextInput value={form.name} onChange={(v) => set('name', v)} placeholder="Gunna" fullWidth />
          </div>

          <div>
            <div style={{fontSize:12, color:'var(--text-3)', marginBottom:10, fontWeight:600, letterSpacing:'.02em', textTransform:'uppercase'}}>Sociale links</div>
            <div style={{display:'flex', flexDirection:'column', gap:10}}>
              <SocialField icon={<I.tt />} label="TikTok" prefix="@" placeholder="brugernavn" value={form.tiktok} onChange={(v) => set('tiktok', v)} color="#fff" />
              <SocialField icon={<I.yt />} label="YouTube" prefix="@" placeholder="kanal" value={form.youtube} onChange={(v) => set('youtube', v.replace(/^@/, ''))} color="#ff2a2a" />
              <SocialField icon={<I.sp />} label="Spotify" placeholder="artist-id" value={form.spotify} onChange={(v) => set('spotify', v)} color="#1DB954" />
              <SocialField icon={<I.ig />} label="Instagram" prefix="@" placeholder="brugernavn" value={form.instagram} onChange={(v) => set('instagram', v)} color="#e1306c" />
            </div>
          </div>
        </div>

        {/* footer */}
        <div style={{display:'flex', justifyContent:'flex-end', gap:10, padding:'16px 24px', borderTop:'1px solid var(--border)', background:'var(--bg-1)'}}>
          <window.Btn kind="secondary" onClick={onClose}>Annuller</window.Btn>
          <window.Btn kind="blue" icon={<I.check />} disabled={!form.name.trim()} onClick={() => onSave(form)}>{existing ? 'Gem ændringer' : 'Opret artist'}</window.Btn>
        </div>
      </div>
    </div>
  );
}

function SocialField({ icon, label, prefix, placeholder, value, onChange, color }) {
  const [focus, setFocus] = React.useState(false);
  return (
    <div style={{
      display:'flex', alignItems:'center', gap:10, padding:'0 12px',
      background:'var(--bg-1)', border:`1px solid ${focus ? 'var(--blue)' : 'var(--border-strong)'}`,
      borderRadius:6, height:42, transition:'border-color .15s'
    }}>
      <span style={{ width:26, height:26, borderRadius:5, background:'var(--bg-3)', color, display:'inline-flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
        {React.cloneElement(icon, { width:14, height:14 })}
      </span>
      <span style={{ fontSize:12, color:'var(--text-3)', fontWeight:600, minWidth:60 }}>{label}</span>
      {prefix && <span style={{ fontSize:14, color:'var(--text-4)' }}>{prefix}</span>}
      <input value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} onFocus={() => setFocus(true)} onBlur={() => setFocus(false)}
        style={{ flex:1, background:'transparent', border:'none', outline:'none', color:'var(--text)', fontSize:14, minWidth:0 }} />
    </div>
  );
}

window.ArtistFormModal = ArtistFormModal;
