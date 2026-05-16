// Artist detail — read-only stamdata, 2x2 hashtag grid, inline add
function ArtistDetailPage({ artistId, onBack, onNav, onOpenBeat, onEditArtist }) {
  const I = window.Icons;
  const artist = window.DATA.ARTISTS.find(a => a.id === artistId) || window.DATA.ARTISTS[0];
  const artistBeats = window.DATA.BEATS.filter(b => b.artist === artist.id);

  const [aTags, setATags] = React.useState(artist.aTags || []);
  const [bTags, setBTags] = React.useState(artist.bTags || []);
  const [cTags, setCTags] = React.useState(artist.cTags || []);
  const [hashtags, setHashtags] = React.useState(artist.artistHashtags || []);
  const [ytKw, setYtKw] = React.useState(artist.youtubeKeywords || '');
  const [savingKw, setSavingKw] = React.useState(false);
  const [kwSaved, setKwSaved] = React.useState(false);
  const ytKwRef = React.useRef(null);

  // Grow the keywords field so the whole text is visible.
  React.useEffect(() => {
    const ta = ytKwRef.current;
    if (ta) { ta.style.height = 'auto'; ta.style.height = ta.scrollHeight + 'px'; }
  }, [ytKw]);

  const kwDirty = ytKw !== (artist.youtubeKeywords || '');
  const saveKeywords = async () => {
    if (savingKw) return;
    setSavingKw(true);
    try {
      await window.DB.updateArtistKeywords(artist.id, ytKw);
      artist.youtubeKeywords = ytKw; // keep in-memory data in sync
      setKwSaved(true);
      setTimeout(() => setKwSaved(false), 2000);
    } catch (e) {
      alert('Kunne ikke gemme YouTube keywords: ' + e.message);
    } finally {
      setSavingKw(false);
    }
  };

  // Tag groups auto-save to Supabase on every add/remove.
  const persistTags = (column, next) => {
    window.DB.updateArtistTags(artist.id, { [column]: next })
      .catch(e => alert('Kunne ikke gemme tags: ' + e.message));
  };

  return (
    <div>
      {/* Back */}
      <button onClick={onBack} style={{
        display:'inline-flex', alignItems:'center', gap:6, marginBottom:16,
        fontSize:13, color:'var(--text-3)', padding:'4px 0'
      }}
        onMouseEnter={e=>e.currentTarget.style.color='var(--text)'}
        onMouseLeave={e=>e.currentTarget.style.color='var(--text-3)'}>
        <I.chevL width={15} height={15} /> Tilbage
      </button>

      {/* Header — read only */}
      <div style={{
        display:'flex', alignItems:'center', justifyContent:'space-between', gap:24, marginBottom:24,
        paddingBottom:24, borderBottom:'1px solid var(--border)'
      }}>
        <div style={{display:'flex', alignItems:'center', gap:20}}>
          <window.ArtistAvatar id={artist.id} name={artist.name} size={80} />
          <div>
            <h1 style={{margin:'0 0 6px 0', fontSize:36, fontWeight:700, letterSpacing:'-.03em'}}>{artist.name}</h1>
            <div style={{fontSize:14, color:'var(--text-3)'}}>{artist.beatsCount} beats</div>
          </div>
        </div>
        <window.DropdownMenu items={[
          { label:'Rediger stamdata', icon:<I.edit />, onClick: () => onEditArtist && onEditArtist(artist.id) },
        ]} />
      </div>

      {/* Profile links — read only */}
      <div style={{ marginBottom:24 }}>
        <div style={{display:'flex', gap:10, flexWrap:'wrap'}}>
          {artist.tiktok && <ProfileLink icon={<I.tt />} label="TikTok" handle={'@' + artist.tiktok} color="#fff" />}
          {artist.youtube && <ProfileLink icon={<I.yt />} label="YouTube" handle={artist.youtube} color="#ff2a2a" />}
          {artist.spotify && <ProfileLink icon={<I.sp />} label="Spotify" handle={artist.spotify} color="#1DB954" />}
          {artist.instagram && <ProfileLink icon={<I.ig />} label="Instagram" handle={'@' + artist.instagram} color="#e1306c" />}
        </div>
      </div>

      {/* 2x2 hashtag grid */}
      <div style={{
        display:'grid', gridTemplateColumns:'1fr 1fr', gap:16, marginBottom:16
      }}>
        <InlineTagGroup
          title="TikTok Artist Hashtags"
          subtitle="Hovedtags når denne artist tagges på TikTok"
          tags={hashtags}
          onAdd={(t) => { const next = [...hashtags, '#' + t.replace(/^#+/, '')]; setHashtags(next); artist.artistHashtags = next; persistTags('tiktok_artist_hashtag', next); }}
          onRemove={(t) => { const next = hashtags.filter(x => x !== t); setHashtags(next); artist.artistHashtags = next; persistTags('tiktok_artist_hashtag', next); }}
          accent="blue"
          placeholder="hashtag (uden #)"
        />
        <InlineTagGroup
          title="TikTok A-Tags"
          subtitle="Primære søgeord — bruges først"
          tags={aTags}
          onAdd={(t) => { const next = [...aTags, t.replace(/^#+/, '')]; setATags(next); artist.aTags = next; persistTags('tiktok_a_tags', next); }}
          onRemove={(t) => { const next = aTags.filter(x => x !== t); setATags(next); artist.aTags = next; persistTags('tiktok_a_tags', next); }}
          accent="blue"
          placeholder="a-tag…"
        />
        <InlineTagGroup
          title="TikTok B-Tags"
          subtitle="Sekundære søgeord"
          tags={bTags}
          onAdd={(t) => { const next = [...bTags, t.replace(/^#+/, '')]; setBTags(next); artist.bTags = next; persistTags('tiktok_b_tags', next); }}
          onRemove={(t) => { const next = bTags.filter(x => x !== t); setBTags(next); artist.bTags = next; persistTags('tiktok_b_tags', next); }}
          accent="blue"
          placeholder="b-tag…"
        />
        <InlineTagGroup
          title="TikTok C-Tags"
          subtitle="Mood & teksturer — broader reach"
          tags={cTags}
          onAdd={(t) => { const next = [...cTags, t.replace(/^#+/, '')]; setCTags(next); artist.cTags = next; persistTags('tiktok_c_tags', next); }}
          onRemove={(t) => { const next = cTags.filter(x => x !== t); setCTags(next); artist.cTags = next; persistTags('tiktok_c_tags', next); }}
          accent="blue"
          placeholder="c-tag…"
        />
      </div>

      {/* YouTube keywords — full width */}
      <window.Card title="YouTube Keywords" style={{marginBottom:16}}
        action={
          <window.Btn kind="blue" size="sm"
            icon={kwSaved ? <I.check /> : undefined}
            disabled={savingKw || (!kwDirty && !kwSaved)}
            onClick={saveKeywords}>
            {kwSaved ? 'Gemt!' : (savingKw ? 'Gemmer…' : 'Gem')}
          </window.Btn>
        }
      >
        <div style={{fontSize:12, color:'var(--text-3)', marginTop:-6, marginBottom:14}}>Komma-separeret. Tilføjes til alle uploads under denne artist.</div>
        <textarea ref={ytKwRef} value={ytKw} onChange={e => setYtKw(e.target.value)} spellCheck={false} placeholder="gunna type beat, dripseason, melodic trap, atlanta…" style={{
          width:'100%', minHeight:120, padding:14,
          background:'var(--bg-1)', border:'1px solid var(--border-strong)', borderRadius:6,
          color:'var(--text)', fontSize:14, lineHeight:1.55, fontFamily:'inherit',
          resize:'vertical', outline:'none', overflow:'hidden', display:'block'
        }} />
      </window.Card>
    </div>
  );
}

function InlineTagGroup({ title, subtitle, tags, onAdd, onRemove, accent, placeholder }) {
  const [text, setText] = React.useState('');

  const submit = () => {
    const t = text.trim();
    if (!t) return;
    onAdd(t);
    setText('');
  };

  return (
    <window.Card title={title}>
      <div style={{fontSize:12, color:'var(--text-3)', marginTop:-6, marginBottom:14}}>{subtitle}</div>
      <div style={{display:'flex', flexWrap:'wrap', gap:8, minHeight:34}}>
        {tags.length === 0 && <span style={{fontSize:13, color:'var(--text-4)', alignSelf:'center'}}>Ingen tags endnu</span>}
        {tags.map(t => <window.Chip key={t} accent={accent} onRemove={() => onRemove(t)}>{t}</window.Chip>)}
      </div>
      <div style={{
        marginTop:14, display:'flex', gap:8, alignItems:'center', padding:6,
        background:'var(--bg-1)', border:'1px solid var(--border-strong)', borderRadius:6
      }}>
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); submit(); } }}
          placeholder={placeholder}
          style={{flex:1, background:'transparent', border:'none', outline:'none', color:'var(--text)', fontSize:14, padding:'6px 8px'}}
        />
        <button onClick={submit} disabled={!text.trim()} style={{
          padding:'6px 12px', borderRadius:4, fontSize:13, fontWeight:600,
          background: text.trim() ? 'var(--blue)' : 'transparent',
          color: text.trim() ? '#fff' : 'var(--text-4)',
          border:'1px solid ' + (text.trim() ? 'var(--blue)' : 'transparent'),
          cursor: text.trim() ? 'pointer' : 'not-allowed'
        }}>Tilføj</button>
      </div>
    </window.Card>
  );
}

function ProfileLink({ icon, label, handle, color }) {
  return (
    <a href="#" style={{
      display:'flex', alignItems:'center', gap:12, padding:'12px 16px',
      background:'var(--bg-1)', border:'1px solid var(--border-strong)', borderRadius:8,
      minWidth:200, transition:'all .15s'
    }}
      onMouseEnter={e=>{e.currentTarget.style.background='var(--bg-3)';e.currentTarget.style.borderColor='#444'}}
      onMouseLeave={e=>{e.currentTarget.style.background='var(--bg-1)';e.currentTarget.style.borderColor='var(--border-strong)'}}>
      <span style={{
        width:34, height:34, borderRadius:6, background:'var(--bg-2)', color,
        display:'inline-flex', alignItems:'center', justifyContent:'center'
      }}>{React.cloneElement(icon, { width:18, height:18 })}</span>
      <div style={{flex:1, minWidth:0}}>
        <div style={{fontSize:11, color:'var(--text-3)', letterSpacing:'.06em', textTransform:'uppercase'}}>{label}</div>
        <div style={{fontSize:14, fontWeight:600, color:'var(--text)', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis'}}>{handle}</div>
      </div>
      <window.Icons.ext width={14} height={14} style={{color:'var(--text-3)'}} />
    </a>
  );
}

window.ArtistDetailPage = ArtistDetailPage;
