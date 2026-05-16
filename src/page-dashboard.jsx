// Dashboard
function DashboardPage({ onNav, onNewBeat, onOpenBeat }) {
  const I = window.Icons;
  const beats = window.DATA.BEATS;
  const total = beats.length;
  const published = beats.filter(b => b.status === 'published').length;
  const pending = beats.filter(b => b.status === 'pending').length;
  const draft = beats.filter(b => b.status === 'draft').length;

  const recent = [...beats].sort((a,b) => (b.modified||'').localeCompare(a.modified||'')).slice(0, 5);

  const stats = [
    { label:'Totalt beats', value: 832, sub:`Inkl. ${total} synlige i CRM`, color:'#fff', accent:'rgba(255,255,255,.1)', icon: <I.beat /> },
    { label:'Published',    value: 318, sub:'+12 denne måned', color:'var(--green)', accent:'var(--green-soft)', icon: <I.check /> },
    { label:'Pending',      value: 47,  sub:'I køen klar til release', color:'var(--yellow)', accent:'var(--yellow-soft)', icon: <I.clock /> },
    { label:'Draft',        value: 467, sub:'I produktion / arkiv', color:'var(--gray)', accent:'var(--gray-soft)', icon: <I.edit /> },
  ];

  return (
    <div>
      <window.PageHeader title="Dashboard" subtitle={`Velkommen tilbage · ${window.fmtDate(new Date().toISOString())}`}>
        <window.Btn icon={<I.queue />} onClick={() => onNav('queue')}>Publish Queue</window.Btn>
        <window.Btn kind="primary" icon={<I.plus />} onClick={onNewBeat}>Nyt Beat</window.Btn>
      </window.PageHeader>

      {/* Stat cards */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(4, 1fr)', gap:16, marginBottom:28 }}>
        {stats.map(s => (
          <div key={s.label} style={{
            background:'var(--bg-2)', border:'1px solid var(--border)', borderRadius:8,
            padding:'18px 20px', position:'relative', overflow:'hidden',
          }}>
            <div style={{
              position:'absolute', right:-10, top:-10, width:64, height:64, borderRadius:'50%',
              background:s.accent, filter:'blur(6px)'
            }}></div>
            <div style={{display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:12, position:'relative'}}>
              <span style={{fontSize:12, color:'var(--text-3)', fontWeight:600, letterSpacing:'.06em', textTransform:'uppercase'}}>{s.label}</span>
              <span style={{
                width:30, height:30, borderRadius:6, background:s.accent, color:s.color,
                display:'inline-flex', alignItems:'center', justifyContent:'center'
              }}>{React.cloneElement(s.icon, { width:16, height:16 })}</span>
            </div>
            <div style={{fontSize:36, fontWeight:700, lineHeight:1, letterSpacing:'-.03em', color:s.color, position:'relative'}}>{s.value}</div>
            <div style={{marginTop:8, fontSize:12, color:'var(--text-3)'}}>{s.sub}</div>
          </div>
        ))}
      </div>

      {/* Main grid */}
      <div style={{display:'grid', gridTemplateColumns:'1.4fr 1fr', gap:20}}>
        {/* Recent activity */}
        <window.Card title={null} pad={0} style={{padding:0}}>
          <div style={{padding:'20px 20px 14px', display:'flex', alignItems:'center', justifyContent:'space-between'}}>
            <h3 style={{margin:0, fontSize:13, fontWeight:600, color:'var(--text-3)', textTransform:'uppercase', letterSpacing:'.08em'}}>Seneste aktivitet</h3>
            <button onClick={() => onNav('beats')} style={{fontSize:13, color:'var(--blue)', display:'inline-flex', alignItems:'center', gap:4}}>
              Se alle <I.chevR width={14} height={14} />
            </button>
          </div>
          <div>
            {recent.map((b, i) => (
              <button key={b.id} onClick={() => onOpenBeat(b.id)} style={{
                display:'grid', gridTemplateColumns:'auto 1fr auto auto', gap:14,
                alignItems:'center', padding:'12px 20px', width:'100%', textAlign:'left',
                borderTop: '1px solid var(--border)',
                background:'transparent', transition:'background .12s'
              }}
                onMouseEnter={e => e.currentTarget.style.background='var(--bg-hover)'}
                onMouseLeave={e => e.currentTarget.style.background='transparent'}
              >
                <div style={{
                  width:38, height:38, borderRadius:6,
                  background:`linear-gradient(135deg, ${
                    b.status==='published'?'#1d3d2a, #0d2515':b.status==='pending'?'#3a2d10, #1a1505':'#222, #111'
                  })`,
                  display:'flex', alignItems:'center', justifyContent:'center', color:'#fff'
                }}>
                  <I.play width={14} height={14} />
                </div>
                <div style={{minWidth:0}}>
                  <div style={{fontWeight:600, fontSize:14, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis'}}>{b.title}</div>
                  <div style={{fontSize:12, color:'var(--text-3)', marginTop:2}}>
                    {window.getArtistName(b.artist)} · {b.bpm} BPM · {b.key}
                  </div>
                </div>
                <window.StatusPill status={b.status} size="sm" />
                <div style={{fontSize:12, color:'var(--text-3)', minWidth:90, textAlign:'right'}}>{window.fmtRelative(b.modified)}</div>
              </button>
            ))}
          </div>
        </window.Card>

        {/* Right column */}
        <div style={{display:'flex', flexDirection:'column', gap:20}}>
          <window.Card title="Publish countdown">
            <div style={{display:'flex', alignItems:'baseline', gap:10}}>
              <span style={{fontSize:42, fontWeight:700, letterSpacing:'-.03em'}} className="mono">04</span>
              <span style={{fontSize:14, color:'var(--text-3)'}}>t</span>
              <span style={{fontSize:42, fontWeight:700, letterSpacing:'-.03em'}} className="mono">12</span>
              <span style={{fontSize:14, color:'var(--text-3)'}}>m</span>
            </div>
            <div style={{marginTop:6, fontSize:13, color:'var(--text-3)'}}>Næste release: <span style={{color:'var(--text)', fontWeight:600}}>Got My Way</span></div>
            <div style={{display:'flex', gap:8, marginTop:14}}>
              <window.Btn kind="primary" size="sm" onClick={() => onNav('queue')}>Se kø</window.Btn>
              <window.Btn kind="secondary" size="sm">Pause auto-release</window.Btn>
            </div>
          </window.Card>

          <window.Card title="Top performers (30 dage)">
            <div style={{display:'flex', flexDirection:'column', gap:12}}>
              {[
                { title:'5 Am In Philly', artist:'Hunxho', views:142000 },
                { title:'All Along', artist:'Gunna', views:88200 },
                { title:'Off The Lot', artist:'Gunna', views:56700 },
              ].map((r, i) => (
                <div key={r.title} style={{display:'flex', alignItems:'center', gap:12}}>
                  <span style={{
                    width:22, height:22, borderRadius:4, background:'var(--bg-3)',
                    fontSize:12, fontWeight:700, color:'var(--text-3)',
                    display:'flex', alignItems:'center', justifyContent:'center'
                  }}>{i+1}</span>
                  <div style={{flex:1, minWidth:0}}>
                    <div style={{fontSize:13, fontWeight:600, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis'}}>{r.title}</div>
                    <div style={{fontSize:11, color:'var(--text-3)'}}>{r.artist}</div>
                  </div>
                  <div style={{fontSize:13, fontWeight:600, color:'var(--text-2)'}} className="mono">{(r.views/1000).toFixed(1)}k</div>
                  <I.eye width={14} height={14} style={{color:'var(--text-3)'}} />
                </div>
              ))}
            </div>
          </window.Card>
        </div>
      </div>
    </div>
  );
}

window.DashboardPage = DashboardPage;
