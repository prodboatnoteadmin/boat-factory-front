// Beat detail page — stamdata + jobs history + queue status
function BeatDetailPage({ beatId, onBack, onNav, onOpenArtist, onEdit, onDelete, queueIds = [], onAddToQueue }) {
  const I = window.Icons;
  const beat = window.DATA.BEATS.find(b => b.id === beatId) || window.DATA.BEATS[0];
  const artist = window.DATA.ARTISTS.find(a => a.id === beat.artist);
  const [desc, setDesc] = React.useState(() => buildYouTubeDescription(beat));
  const [copied, setCopied] = React.useState(false);
  const descRef = React.useRef(null);
  const coArtists = beat.coArtists || []; // read-only here; edit via the beat form
  const [coCollabs, setCoCollabs] = React.useState(beat.coCollabs || []);
  const [collab, setCollab] = React.useState(beat.collab || '');
  const [manualYt, setManualYt] = React.useState('');
  const [savedManualYt, setSavedManualYt] = React.useState(null);

  const jobs = window.getBeatJobs(beat.id);
  const detectedYt = window.getFirstYouTubeLink(beat.id);
  const youtubeLink = savedManualYt || detectedYt;
  const queuePosition = queueIds.indexOf(beat.id);
  const inQueue = queuePosition !== -1;

  const logoBtn = (disabled) => ({
    display:'inline-flex', alignItems:'center', gap:8,
    padding:'8px 14px', borderRadius:6,
    border:'1px solid var(--border-strong)', background:'var(--bg-1)',
    color: disabled ? 'var(--text-4)' : 'var(--text)',
    fontSize:13, fontWeight:600,
    cursor: disabled ? 'not-allowed' : 'pointer',
    opacity: disabled ? 0.5 : 1,
  });

  // Rebuild the description when switching to another beat.
  React.useEffect(() => {
    setDesc(buildYouTubeDescription(beat));
  }, [beat.id]);

  // Grow the textarea so the whole description is visible (no scroll).
  React.useEffect(() => {
    const ta = descRef.current;
    if (ta) { ta.style.height = 'auto'; ta.style.height = ta.scrollHeight + 'px'; }
  }, [desc]);

  const copyDescription = async () => {
    try {
      await navigator.clipboard.writeText(desc);
    } catch (e) {
      const ta = descRef.current;
      if (ta) { ta.focus(); ta.select(); document.execCommand('copy'); ta.setSelectionRange(0, 0); }
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
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

      {/* Header */}
      <div style={{
        display:'flex', alignItems:'flex-start', justifyContent:'space-between', gap:24, marginBottom:28,
        paddingBottom:24, borderBottom:'1px solid var(--border)'
      }}>
        <div style={{minWidth:0, flex:1}}>
          <div style={{display:'flex', alignItems:'center', gap:20, minWidth:0}}>
            <button onClick={() => onOpenArtist(beat.artist)} style={{
              display:'inline-flex', alignItems:'center', gap:12, padding:0,
              background:'transparent', textAlign:'left', flexShrink:0
            }}>
              <window.ArtistAvatar id={beat.artist} name={artist?.name || beat.artist} size={48} />
              <div>
                <div style={{fontSize:11, color:'var(--text-3)', letterSpacing:'.06em', textTransform:'uppercase', marginBottom:2, fontWeight:600}}>Artist</div>
                <div style={{fontSize:18, fontWeight:700, color:'var(--text)', letterSpacing:'-.01em'}}
                  onMouseEnter={e => e.currentTarget.style.color='var(--blue)'}
                  onMouseLeave={e => e.currentTarget.style.color='var(--text)'}>
                  {artist?.name || beat.artist}
                </div>
              </div>
            </button>

            <div style={{width:1, alignSelf:'stretch', background:'var(--border)', flexShrink:0}}></div>

            <h1 style={{
              margin:0, fontSize:34, fontWeight:700, letterSpacing:'-.03em', lineHeight:1.1,
              minWidth:0, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis'
            }}>{beat.title}</h1>
          </div>
          {coArtists.length > 0 && (
            <div style={{marginTop:14, display:'flex', alignItems:'center', gap:8, flexWrap:'wrap'}}>
              <span style={{fontSize:11, color:'var(--text-3)', letterSpacing:'.06em', textTransform:'uppercase', fontWeight:600}}>Co-artists:</span>
              {coArtists.map(n => <window.Chip key={n}>{n}</window.Chip>)}
            </div>
          )}
        </div>

        <div style={{display:'flex', gap:8, alignItems:'center'}}>
          {inQueue ? (
            <window.Btn kind="secondary" icon={<I.check />} onClick={() => onNav('queue')}>I kø #{queuePosition + 1}</window.Btn>
          ) : (
            <window.Btn kind="primary" icon={<I.plus />} onClick={() => onAddToQueue && onAddToQueue(beat.id)}>Tilføj til kø</window.Btn>
          )}
          <window.DropdownMenu items={[
            { label:'Rediger', icon:<I.edit />, onClick: onEdit },
            { label:'Slet beat', icon:<I.trash />, danger: true, onClick: onDelete },
          ]} />
        </div>
      </div>

      {/* Video (2/3) + Info & Collab stacked to the right */}
      <div style={{ display:'grid', gridTemplateColumns:'2fr 1fr', gap:24, marginBottom:24, alignItems:'start' }}>
        <div>
          {(() => {
            const vid = youtubeLink ? ytVideoId(youtubeLink) : null;
            if (vid) {
              return (
                <div style={{
                  position:'relative', borderRadius:10, overflow:'hidden',
                  aspectRatio:'16/9', background:'#000',
                  border:'1px solid var(--border)',
                }}>
                  <iframe
                    src={`https://www.youtube.com/embed/${vid}`}
                    title={`${beat.title} · ${window.getArtistName(beat.artist)}`}
                    style={{ position:'absolute', inset:0, width:'100%', height:'100%', border:0 }}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowFullScreen
                    referrerPolicy="strict-origin-when-cross-origin"
                  />
                </div>
              );
            }
            if (youtubeLink) {
              return (
                <div style={{
                  borderRadius:10, border:'1px solid var(--border)', background:'var(--bg-1)',
                  padding:'22px 24px', display:'flex', alignItems:'center', justifyContent:'space-between', gap:16
                }}>
                  <div style={{ fontSize:14, color:'var(--text-2)' }}>
                    Linket kunne ikke indlejres som YouTube-video.
                  </div>
                  <a href={youtubeLink} target="_blank" rel="noopener noreferrer" style={{ fontSize:13, color:'var(--blue)', display:'inline-flex', alignItems:'center', gap:6, flexShrink:0 }}>
                    Åbn link <I.ext width={12} height={12} />
                  </a>
                </div>
              );
            }
            return <YouTubePlaceholder beat={beat} inQueue={inQueue} queuePosition={queuePosition} hasJobs={jobs.length > 0} onNav={onNav} />;
          })()}

          {/* Logo-links */}
          <div style={{ display:'flex', alignItems:'center', gap:12, marginTop:14 }}>
            {beat.beatstars ? (
              <a href={beat.beatstars} target="_blank" rel="noopener noreferrer" title="Åbn på BeatStars" style={logoBtn(false)}>
                <I.bs width={16} height={16} style={{ color:'#E5384F' }} /> BeatStars <I.ext width={12} height={12} />
              </a>
            ) : (
              <span title="Intet BeatStars-link" style={logoBtn(true)}>
                <I.bs width={16} height={16} /> BeatStars
              </span>
            )}
            {youtubeLink ? (
              <a href={youtubeLink} target="_blank" rel="noopener noreferrer" title="Åbn på YouTube" style={logoBtn(false)}>
                <I.yt width={16} height={16} style={{ color:'#ff2a2a' }} /> YouTube <I.ext width={12} height={12} />
              </a>
            ) : (
              <span title="Intet YouTube-link" style={logoBtn(true)}>
                <I.yt width={16} height={16} /> YouTube
              </span>
            )}
          </div>
        </div>

        <div style={{ display:'flex', flexDirection:'column', gap:24 }}>
          <window.Card title="Links">
            <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
              <LinkLine icon={<I.bs />} color="#E5384F" label="BeatStars" href={beat.beatstars} />
              <LinkLine icon={<I.yt />} color="#ff2a2a" label="YouTube" href={youtubeLink} />
              <LinkLine icon={<I.yt />} color="#ff2a2a" label="YouTube Studio"
                href={(() => { const v = youtubeLink ? ytVideoId(youtubeLink) : null; return v ? `https://studio.youtube.com/video/${v}/edit` : null; })()} />
            </div>
          </window.Card>
          <window.Card title="Info">
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:'14px 18px' }}>
              <Stat label="BPM" value={beat.bpm} mono />
              <Stat label="Key" value={beat.key} mono />
              <Stat label="Year" value={beat.year} mono />
            </div>
          </window.Card>

          <window.Card title="Collab">
            <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
              <div>
                <div style={{fontSize:11, color:'var(--text-3)', marginBottom:6, letterSpacing:'.06em', textTransform:'uppercase'}}>Primær collab</div>
                {collab
                  ? <window.Chip accent="blue">{collab}</window.Chip>
                  : <span style={{fontSize:13, color:'var(--text-3)'}}>Ingen collab</span>}
              </div>
              <div>
                <div style={{fontSize:11, color:'var(--text-3)', marginBottom:6, letterSpacing:'.06em', textTransform:'uppercase'}}>Co-Collabs</div>
                <div style={{display:'flex', flexWrap:'wrap', gap:8}}>
                  {coCollabs.length === 0 && <span style={{fontSize:13, color:'var(--text-3)'}}>Ingen co-collabs</span>}
                  {coCollabs.map(n => <window.Chip key={n}>{n}</window.Chip>)}
                </div>
              </div>
            </div>
          </window.Card>
        </div>
      </div>

      {/* Udgivelses-historik — between Info and YouTube beskrivelse */}
      <div style={{ marginBottom:24 }}>
        <UdgivelsesListe
          beat={beat}
          jobs={jobs}
          inQueue={inQueue}
          queuePosition={queuePosition}
          onNav={onNav}
          manualYt={manualYt}
          setManualYt={setManualYt}
          savedManualYt={savedManualYt}
          setSavedManualYt={setSavedManualYt}
          hasDetectedYt={!!detectedYt}
        />
      </div>

      {/* YouTube description (from template) */}
      <window.Card title="YouTube beskrivelse" style={{marginBottom:24}}
        action={
          <window.Btn kind="secondary" size="sm"
            icon={copied ? <I.check /> : undefined}
            onClick={copyDescription}>
            {copied ? 'Kopieret!' : 'Copy'}
          </window.Btn>
        }
      >
        <textarea
          ref={descRef}
          value={desc}
          readOnly
          spellCheck={false}
          style={{
            width:'100%', minHeight:160, padding:14,
            background:'var(--bg-1)', border:'1px solid var(--border-strong)', borderRadius:6,
            color:'var(--text-3)', fontSize:13, lineHeight:1.55,
            fontFamily:'JetBrains Mono, monospace',
            resize:'vertical', outline:'none', overflow:'hidden', display:'block',
            cursor:'default'
          }}
        />
      </window.Card>
    </div>
  );
}

function YouTubePlaceholder({ beat, inQueue, queuePosition, hasJobs, onNav }) {
  const I = window.Icons;
  // Determine state message
  let badge, headline, sub;
  if (inQueue) {
    badge = { label:'I KØ', bg:'rgba(243,156,18,.95)' };
    headline = `Beat er nummer #${queuePosition + 1} i køen`;
    sub = 'Render-jobbet køres automatisk og YouTube-videoen vises her bagefter.';
  } else if (hasJobs) {
    badge = { label:'IKKE UDGIVET', bg:'rgba(120,120,120,.75)' };
    headline = 'Ingen YouTube-link fra tidligere jobs';
    sub = 'Send beatet i kø igen for at få en ny YouTube-render.';
  } else {
    badge = { label:'IKKE UDGIVET', bg:'rgba(120,120,120,.75)' };
    headline = 'Endnu ikke udgivet på YouTube';
    sub = 'Tilføj beatet til køen for at få det rendet og uploadet.';
  }

  return (
    <div style={{
      position:'relative', borderRadius:10, overflow:'hidden',
      aspectRatio:'16/9',
      border:'1px dashed var(--border-strong)',
      background:'var(--bg-1)',
      display:'flex', alignItems:'center', justifyContent:'center',
      color:'var(--text-2)'
    }}>
      {/* Diagonal hash background pattern */}
      <div style={{
        position:'absolute', inset:0,
        background:'repeating-linear-gradient(45deg, transparent 0 12px, rgba(255,255,255,.018) 12px 13px)',
        pointerEvents:'none'
      }}></div>

      {/* faux YT bar */}
      <div style={{
        position:'absolute', top:14, left:16, right:16, display:'flex', alignItems:'center', justifyContent:'space-between'
      }}>
        <div style={{ display:'flex', alignItems:'center', gap:10 }}>
          <div style={{
            padding:'4px 10px', borderRadius:4, background: badge.bg,
            fontSize:10, fontWeight:800, letterSpacing:'.1em', color:'#0d0d0d'
          }}>{badge.label}</div>
          <span style={{ fontSize:12, color:'var(--text-3)' }}>{beat.title} · {window.getArtistName(beat.artist)}</span>
        </div>
        <span style={{ fontSize:11, color:'var(--text-4)', fontFamily:'JetBrains Mono, monospace' }}>YouTube · video pending</span>
      </div>

      {/* Center content */}
      <div style={{ textAlign:'center', maxWidth:420, padding:'30px 24px', position:'relative' }}>
        <div style={{
          width:72, height:72, borderRadius:'50%',
          background:'rgba(232,72,85,.1)', color:'var(--red)',
          display:'inline-flex', alignItems:'center', justifyContent:'center', marginBottom:18,
          border:'1px solid rgba(232,72,85,.25)'
        }}>
          <I.yt width={32} height={32} />
        </div>
        <div style={{ fontSize:16, fontWeight:600, color:'var(--text)', marginBottom:6, letterSpacing:'-.01em' }}>{headline}</div>
        <div style={{ fontSize:13, color:'var(--text-3)', marginBottom:20, lineHeight:1.5 }}>{sub}</div>
        {!inQueue && (
          <window.Btn kind="blue" size="sm" icon={<I.plus />} onClick={() => onNav('queue')}>Tilføj til kø</window.Btn>
        )}
        {inQueue && (
          <window.Btn kind="secondary" size="sm" onClick={() => onNav('queue')}>Se kø-status</window.Btn>
        )}
      </div>

      {/* Tiny waveform stub */}
      <div style={{
        position:'absolute', bottom:14, left:16, right:16,
        display:'flex', alignItems:'flex-end', justifyContent:'center', gap:2, height:18, opacity:.3
      }}>
        {Array.from({length:50}).map((_,i) => (
          <div key={i} style={{ width:2, background:'var(--text-3)', height: 4 + 14 * Math.abs(Math.sin(i*0.6)), borderRadius:1 }}></div>
        ))}
      </div>
    </div>
  );
}

function Stat({ label, value, mono }) {
  return (
    <div>
      <div style={{ fontSize:11, color:'var(--text-3)', letterSpacing:'.06em', textTransform:'uppercase', marginBottom:4 }}>{label}</div>
      <div style={{ fontSize:22, fontWeight:600, color:'var(--text)', fontFamily: mono ? 'JetBrains Mono, monospace' : 'inherit', letterSpacing: mono ? '-.02em' : 'normal' }}>{value}</div>
    </div>
  );
}

function UdgivelsesListe({ beat, jobs, inQueue, queuePosition, onNav, manualYt, setManualYt, savedManualYt, setSavedManualYt, hasDetectedYt }) {
  const I = window.Icons;
  const [expanded, setExpanded] = React.useState(null);
  const showManualInput = !hasDetectedYt && !savedManualYt;

  const saveManual = () => {
    const v = manualYt.trim();
    if (!v) return;
    setSavedManualYt(v);
    setManualYt('');
  };

  return (
    <div style={{ background:'var(--bg-2)', border:'1px solid var(--border)', borderRadius:8 }}>
      <div style={{padding:'18px 20px 14px', display:'flex', alignItems:'center', justifyContent:'space-between', borderBottom:'1px solid var(--border)'}}>
        <div>
          <h3 style={{margin:0, fontSize:13, fontWeight:600, color:'var(--text-3)', textTransform:'uppercase', letterSpacing:'.08em'}}>Udgivelses-historik</h3>
          <p style={{margin:'4px 0 0', fontSize:12, color:'var(--text-3)'}}>
            {jobs.length} {jobs.length === 1 ? 'job' : 'jobs'} udført{inQueue ? ' · I kø lige nu' : ''}
          </p>
        </div>
      </div>

      {/* Queue entry first if applicable */}
      {inQueue && (
        <div style={{
          display:'grid', gridTemplateColumns:'120px 1fr auto',
          alignItems:'center', padding:'16px 20px',
          borderBottom: (jobs.length || showManualInput || savedManualYt) ? '1px solid var(--border)' : 'none',
          background:'rgba(243,156,18,.05)'
        }}>
          <div style={{ display:'flex', alignItems:'center', gap:10 }}>
            <span style={{ display:'inline-flex', width:8, height:8, borderRadius:'50%', background:'var(--yellow)', boxShadow:'0 0 0 4px rgba(243,156,18,.15)' }}></span>
            <span style={{fontSize:13, fontWeight:600, color:'#f5b450'}}>I KØ</span>
          </div>
          <div>
            <div style={{ fontSize:14, fontWeight:600 }}>Position #{queuePosition + 1}</div>
            <div style={{ fontSize:12, color:'var(--text-3)', marginTop:2 }}>Venter på render</div>
          </div>
          <window.Btn size="sm" onClick={() => onNav('queue')}>Se i kø</window.Btn>
        </div>
      )}

      {/* Manually saved YT link entry */}
      {savedManualYt && (
        <div style={{
          display:'grid', gridTemplateColumns:'120px 1fr auto',
          alignItems:'center', padding:'16px 20px',
          borderBottom: jobs.length ? '1px solid var(--border)' : 'none',
          background:'rgba(74,144,217,.04)'
        }}>
          <div style={{ display:'flex', alignItems:'center', gap:10 }}>
            <span style={{ display:'inline-flex', width:8, height:8, borderRadius:'50%', background:'var(--blue)', boxShadow:'0 0 0 4px rgba(74,144,217,.15)' }}></span>
            <span style={{fontSize:13, fontWeight:600, color:'#7ab2ea'}}>MANUEL</span>
          </div>
          <div style={{minWidth:0}}>
            <div style={{ fontSize:14, fontWeight:600 }}>Manuelt tilføjet YouTube-link</div>
            <a href={savedManualYt} target="_blank" rel="noopener" style={{ fontSize:12, color:'var(--blue)', fontFamily:'JetBrains Mono, monospace', wordBreak:'break-all' }}>{savedManualYt.replace(/^https?:\/\//, '')}</a>
          </div>
          <button onClick={() => setSavedManualYt(null)} title="Fjern manuelt link" style={{
            width:34, height:34, borderRadius:6, color:'var(--text-3)',
            border:'1px solid var(--border-strong)', background:'transparent',
            display:'inline-flex', alignItems:'center', justifyContent:'center'
          }}
            onMouseEnter={e=>{e.currentTarget.style.background='rgba(232,72,85,.12)';e.currentTarget.style.color='#ec6d77';e.currentTarget.style.borderColor='rgba(232,72,85,.5)'}}
            onMouseLeave={e=>{e.currentTarget.style.background='transparent';e.currentTarget.style.color='var(--text-3)';e.currentTarget.style.borderColor='var(--border-strong)'}}>
            <I.x width={14} height={14} />
          </button>
        </div>
      )}

      {/* Jobs */}
      {jobs.length === 0 && !inQueue && !savedManualYt && !showManualInput && (
        <div style={{ padding:'40px 20px', textAlign:'center', color:'var(--text-3)', fontSize:14 }}>
          Dette beat er endnu ikke kørt gennem nogen jobs.
        </div>
      )}
      {jobs.map((job, idx) => (
        <JobRow key={job.id} job={job} expanded={expanded === job.id} onToggle={() => setExpanded(expanded === job.id ? null : job.id)} isLast={idx === jobs.length - 1 && !showManualInput} />
      ))}

      {/* Manual YouTube URL input — at bottom */}
      {showManualInput && (
        <div style={{ padding:'16px 20px', borderTop: (inQueue || jobs.length) ? '1px solid var(--border)' : 'none', background:'var(--bg-1)' }}>
          <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:8 }}>
            <span style={{
              width:26, height:26, borderRadius:5, background:'rgba(255,42,42,.12)', color:'#ff5252',
              display:'inline-flex', alignItems:'center', justifyContent:'center', flexShrink:0
            }}><I.yt width={14} height={14} /></span>
            <div style={{ flex:1 }}>
              <div style={{ fontSize:13, fontWeight:600 }}>Tilføj YouTube-link manuelt</div>
              <div style={{ fontSize:12, color:'var(--text-3)', marginTop:2 }}>Hvis beatet allerede er uploadet uden om render-motoren, kan du indsætte URL'en her.</div>
            </div>
          </div>
          <div style={{
            display:'flex', alignItems:'center', gap:8, padding:6,
            background:'var(--bg-2)', border:'1px solid var(--border-strong)', borderRadius:6
          }}>
            <input
              value={manualYt}
              onChange={(e) => setManualYt(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); saveManual(); } }}
              placeholder="https://youtube.com/watch?v=…"
              style={{flex:1, background:'transparent', border:'none', outline:'none', color:'var(--text)', fontSize:14, padding:'6px 8px', fontFamily:'JetBrains Mono, monospace'}}
            />
            <button onClick={saveManual} disabled={!manualYt.trim()} style={{
              padding:'7px 14px', borderRadius:5, fontSize:13, fontWeight:600,
              background: manualYt.trim() ? 'var(--blue)' : 'transparent',
              color: manualYt.trim() ? '#fff' : 'var(--text-4)',
              border:'1px solid ' + (manualYt.trim() ? 'var(--blue)' : 'transparent'),
              cursor: manualYt.trim() ? 'pointer' : 'not-allowed',
              display:'inline-flex', alignItems:'center', gap:6
            }}>
              <I.check width={13} height={13} />Gem
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function JobRow({ job, expanded, onToggle, isLast }) {
  const I = window.Icons;
  const success = job.status === 'success';
  return (
    <div style={{ borderBottom: isLast ? 'none' : '1px solid var(--border)' }}>
      <button onClick={onToggle} style={{
        display:'grid', gridTemplateColumns:'120px 1fr auto auto auto', gap:14,
        alignItems:'center', padding:'14px 20px', width:'100%', textAlign:'left',
        background:'transparent', color:'var(--text)', transition:'background .12s'
      }}
        onMouseEnter={e => e.currentTarget.style.background='var(--bg-hover)'}
        onMouseLeave={e => e.currentTarget.style.background='transparent'}
      >
        <div style={{ display:'flex', alignItems:'center', gap:10 }}>
          <span style={{
            display:'inline-flex', width:8, height:8, borderRadius:'50%',
            background: success ? 'var(--green)' : 'var(--red)',
            boxShadow: success ? '0 0 0 4px rgba(46,204,113,.15)' : '0 0 0 4px rgba(232,72,85,.15)'
          }}></span>
          <span style={{ fontSize:13, fontWeight:600, color: success ? '#5ee090' : '#ec6d77' }}>
            {success ? 'SUCCESS' : 'FAILURE'}
          </span>
        </div>
        <div style={{ display:'flex', flexDirection:'column' }}>
          <span style={{ fontSize:14, fontWeight:600 }}>{window.fmtDate(job.completedAt)}</span>
          <span style={{ fontSize:12, color:'var(--text-3)', marginTop:2 }}>
            {new Date(job.completedAt).toLocaleTimeString('da-DK', {hour:'2-digit', minute:'2-digit'})} · {window.fmtRelative(job.completedAt)}
          </span>
        </div>
        <div style={{ display:'flex', gap:6 }}>
          {job.youtubeLink && <PlatformDot icon={<I.yt />} color="#ff2a2a" title="YouTube uploaded" />}
          {job.tiktokLink && <PlatformDot icon={<I.tt />} color="#fff" title="TikTok uploaded" />}
          {!job.youtubeLink && !job.tiktokLink && <span style={{fontSize:12, color:'var(--text-4)'}}>—</span>}
        </div>
        <span style={{ fontSize:12, color:'var(--text-3)' }} className="mono">{job.id.toUpperCase()}</span>
        <span style={{ display:'inline-flex', color:'var(--text-3)', transform: expanded ? 'rotate(180deg)' : 'rotate(0)', transition:'transform .15s' }}>
          <I.chevDown width={16} height={16} />
        </span>
      </button>

      {expanded && (
        <div style={{ padding:'4px 20px 18px', display:'grid', gridTemplateColumns:'1fr 1fr', gap:18 }}>
          {/* files */}
          <div style={{ background:'var(--bg-1)', borderRadius:6, padding:14, border:'1px solid var(--border)' }}>
            <div style={{ fontSize:11, color:'var(--text-3)', letterSpacing:'.06em', textTransform:'uppercase', fontWeight:600, marginBottom:10 }}>Filer</div>
            {success ? (
              <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
                <FileItem label="Full" name={job.files.full} />
                <FileItem label="Short" name={job.files.short} />
                <FileItem label="Thumbnail" name={job.files.thumbnail} />
              </div>
            ) : (
              <div style={{ fontSize:13, color:'#ec6d77', display:'flex', gap:8 }}>
                <I.x width={14} height={14} style={{flexShrink:0, marginTop:2}} />
                <span>{job.errorReason || 'Job fejlede uden detaljer'}</span>
              </div>
            )}
          </div>
          {/* links */}
          <div style={{ background:'var(--bg-1)', borderRadius:6, padding:14, border:'1px solid var(--border)' }}>
            <div style={{ fontSize:11, color:'var(--text-3)', letterSpacing:'.06em', textTransform:'uppercase', fontWeight:600, marginBottom:10 }}>Links</div>
            <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
              <LinkRow icon={<I.yt />} color="#ff2a2a" label="YouTube" link={job.youtubeLink} />
              <LinkRow icon={<I.tt />} color="#fff" label="TikTok" link={job.tiktokLink} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function PlatformDot({ icon, color, title }) {
  return (
    <span title={title} style={{
      width:24, height:24, borderRadius:5, background:'var(--bg-3)', color,
      display:'inline-flex', alignItems:'center', justifyContent:'center'
    }}>{React.cloneElement(icon, { width:12, height:12 })}</span>
  );
}

function FileItem({ label, name }) {
  return (
    <div style={{ display:'flex', alignItems:'center', gap:10 }}>
      <span style={{
        fontSize:10, fontWeight:700, color:'var(--text-3)',
        background:'var(--bg-3)', padding:'2px 6px', borderRadius:3,
        letterSpacing:'.06em', minWidth:54, textAlign:'center'
      }}>{label.toUpperCase()}</span>
      <span style={{ fontSize:12, fontFamily:'JetBrains Mono, monospace', color:'var(--text-2)', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', flex:1 }}>{name}</span>
    </div>
  );
}

function LinkLine({ icon, color, label, href }) {
  if (!href) {
    return (
      <div title="Intet link" style={{ display:'flex', alignItems:'center', gap:10, opacity:.45, cursor:'not-allowed' }}>
        <span style={{ display:'inline-flex', color }}>{React.cloneElement(icon, { width:15, height:15 })}</span>
        <span style={{ fontSize:13, fontWeight:600, color:'var(--text-4)' }}>{label}</span>
        <span style={{ fontSize:12, color:'var(--text-4)', flex:1, textAlign:'right' }}>Intet link</span>
      </div>
    );
  }
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" style={{ display:'flex', alignItems:'center', gap:10 }}>
      <span style={{ display:'inline-flex', color }}>{React.cloneElement(icon, { width:15, height:15 })}</span>
      <span style={{ fontSize:13, fontWeight:600 }}>{label}</span>
      <span style={{ fontSize:12, color:'var(--blue)', fontFamily:'JetBrains Mono, monospace', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', flex:1, textAlign:'right' }}>{href.replace(/^https?:\/\//, '')}</span>
      <window.Icons.ext width={12} height={12} style={{color:'var(--text-3)'}} />
    </a>
  );
}

function LinkRow({ icon, label, color, link }) {
  if (!link) return (
    <div style={{ display:'flex', alignItems:'center', gap:10, opacity:.4 }}>
      <span style={{ display:'inline-flex', color }}>{React.cloneElement(icon, { width:14, height:14 })}</span>
      <span style={{ fontSize:13, color:'var(--text-3)' }}>{label} — ikke uploaded</span>
    </div>
  );
  return (
    <a href={link} target="_blank" rel="noopener" style={{ display:'flex', alignItems:'center', gap:10 }}>
      <span style={{ display:'inline-flex', color }}>{React.cloneElement(icon, { width:14, height:14 })}</span>
      <span style={{ fontSize:13, fontWeight:600 }}>{label}</span>
      <span style={{ fontSize:12, color:'var(--blue)', fontFamily:'JetBrains Mono, monospace', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', flex:1 }}>{link.replace(/^https?:\/\//, '')}</span>
      <window.Icons.ext width={12} height={12} style={{color:'var(--text-3)'}} />
    </a>
  );
}

// Extract the 11-char video id from any common YouTube URL form
// (watch?v=, youtu.be/, /embed/, /shorts/, /live/).
function ytVideoId(url) {
  if (!url) return null;
  const s = String(url).trim();
  try {
    const u = new URL(s);
    const host = u.hostname.replace(/^www\./, '');
    if (host === 'youtu.be') {
      const id = u.pathname.split('/').filter(Boolean)[0];
      return /^[A-Za-z0-9_-]{11}$/.test(id || '') ? id : null;
    }
    if (host.endsWith('youtube.com') || host.endsWith('youtube-nocookie.com')) {
      const v = u.searchParams.get('v');
      if (v && /^[A-Za-z0-9_-]{11}$/.test(v)) return v;
      const parts = u.pathname.split('/').filter(Boolean);
      const i = parts.findIndex((p) => p === 'embed' || p === 'shorts' || p === 'v' || p === 'live');
      if (i !== -1 && parts[i + 1] && /^[A-Za-z0-9_-]{11}$/.test(parts[i + 1])) return parts[i + 1];
    }
  } catch (_e) {
    const m = s.match(/(?:v=|youtu\.be\/|embed\/|shorts\/|live\/)([A-Za-z0-9_-]{11})/);
    if (m) return m[1];
  }
  return null;
}

// Build the YouTube description from the Boat Note template, filling
// [ ] placeholders from the beat/artist. "[FREE]" stays literal.
function buildYouTubeDescription(beat) {
  const artist = window.DATA.ARTISTS.find(a => a.id === beat.artist);
  const artistName = window.getArtistName(beat.artist) || '';
  const norm = artistName.toLowerCase().replace(/[^a-z0-9]+/g, '');
  const collab = (beat.collab || '').trim();
  const year = beat.year || '';
  const bpm = beat.bpm || '';
  const key = beat.key || '';
  const beatstars = beat.beatstars || '';
  const songTitle = beat.title || '';
  const creditLine = collab ? `(Prod. Boat Note x ${collab})` : '(Prod. Boat Note)';
  const titleCollab = collab ? ` ${collab}` : '';

  const tagBits = [];
  if (artist) {
    if (artist.youtubeKeywords) tagBits.push(artist.youtubeKeywords);
    tagBits.push(...(artist.aTags || []), ...(artist.bTags || []), ...(artist.cTags || []));
  }
  const artisttag = tagBits.filter(Boolean).join(', ');

  return `💰 Purchase/Download: ${beatstars} | Buy 2 Get 1 Free
❗Add 3 beats to cart to activate discount
Free for non profit use only. Must give credit ${creditLine}

Bpm: ${bpm}
Key: ${key}

${'Instagram:'.padEnd(11)} https://www.instagram.com/prodboatnote/
${'Email:'.padEnd(11)} prodboatnote@gmail.com
${'Beat Store:'.padEnd(11)} https://boatnote.beatstars.com/

This Beat is FREE for non-profit use ONLY. Any Use of my beats "Including leased beats" REQUIRE CREDIT IN THE TITLE (Prod. by Boat Note). There are NO Exceptions.
The free version of this beat is NOT available for streaming services such as Spotify or Apple Music Etc.

All feedback is appreciated. Like the video if you enjoyed.

[FREE] ${artistName} Type Beat ${year} - '${songTitle}' | Prod. Boat Note${titleCollab}

Ignore Tags
${artisttag}

#${norm}typebeat #${norm}typebeat${year} #${norm} #${norm}beats #free${norm}typebeat #free${norm}typebeats`;
}

window.ytVideoId = ytVideoId;
window.BeatDetailPage = BeatDetailPage;
