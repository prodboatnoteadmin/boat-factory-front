// Queue page — side-by-side queue + pending, always visible, both scrollable
function PublishQueuePage({ onOpenBeat, queueIds, setQueueIds, pendingIds, setPendingIds }) {
  const I = window.Icons;

  const queueBeats = queueIds.map(id => window.DATA.BEATS.find(b => b.id === id)).filter(Boolean);
  const pendingBeats = pendingIds.map(id => window.DATA.BEATS.find(b => b.id === id)).filter(Boolean);

  const [draggingId, setDraggingId] = React.useState(null);
  const [dragOverId, setDragOverId] = React.useState(null);
  const [confirmDelete, setConfirmDelete] = React.useState(null); // for permanent delete from pending

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

  // Move from queue → top of pending. No confirm.
  const removeFromQueue = (id) => {
    setQueueIds(queueIds.filter(qId => qId !== id));
    setPendingIds([id, ...pendingIds.filter(pId => pId !== id)]);
  };

  // Move from pending → top of queue.
  const addToQueue = (id) => {
    setPendingIds(pendingIds.filter(pId => pId !== id));
    setQueueIds([id, ...queueIds.filter(qId => qId !== id)]);
  };

  // Delete from pending entirely. Confirm.
  const deletePending = () => {
    if (!confirmDelete) return;
    setPendingIds(pendingIds.filter(id => id !== confirmDelete));
    setConfirmDelete(null);
  };

  return (
    <div>
      <window.PageHeader title="Queue" subtitle="Drag-and-drop for at omarrangere køen.">
      </window.PageHeader>

      <QueuePanel
        title="Pending queue"
        count={queueBeats.length}
        beats={queueBeats}
        isQueue
        draggingId={draggingId}
        dragOverId={dragOverId}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
        onDrop={handleDrop}
        onOpenBeat={onOpenBeat}
        onAction={removeFromQueue}
        emptyText="Køen er tom."
        subtitle="Render-jobbet processeres oppefra og ned. Fjern → flyt til Draft."
        maxRowsBeforeScroll={null}
      />

      {confirmDelete && (
        <window.ConfirmDialog
          title="Slet beat permanent fra Draft?"
          message="Beatet fjernes fra draft-status. Stamdata på beatet bevares, men det vil ikke længere være planlagt til udgivelse."
          onCancel={() => setConfirmDelete(null)}
          onConfirm={deletePending}
          confirmLabel="Slet permanent"
          danger
        />
      )}
    </div>
  );
}

function QueuePanel({ title, subtitle, count, beats, isQueue, isPending, draggingId, dragOverId, onDragStart, onDragOver, onDragEnd, onDrop, onOpenBeat, onAction, onSecondaryAction, emptyText, maxRowsBeforeScroll }) {
  const I = window.Icons;

  // Both panels share IDENTICAL columns. First col holds # for queue / "Tilføj til kø" button for draft.
  const cols = '120px 26px minmax(180px, 2fr) minmax(140px, 1.2fr) 56px 64px 70px 76px 36px 48px';

  // Each row ≈ 50px tall (10px padding + 30px content + border).
  const ROW_HEIGHT = 50;
  const scrollHeight = maxRowsBeforeScroll ? (maxRowsBeforeScroll * ROW_HEIGHT) : `calc(100vh - 240px)`;

  return (
    <div style={{
      background:'var(--bg-2)', border:'1px solid var(--border)', borderRadius:8,
      display:'flex', flexDirection:'column', overflow:'hidden',
    }}>
      {/* Panel header */}
      <div style={{
        padding:'16px 20px 14px', borderBottom:'1px solid var(--border)', background:'var(--bg-1)',
        display:'flex', alignItems:'center', justifyContent:'space-between', flexShrink:0
      }}>
        <div>
          <div style={{ display:'flex', alignItems:'baseline', gap:10 }}>
            <h3 style={{margin:0, fontSize:13, fontWeight:700, color:'var(--text)', textTransform:'uppercase', letterSpacing:'.08em'}}>{title}</h3>
            <span className="mono" style={{ fontSize:13, fontWeight:700, color: isQueue ? 'var(--blue)' : 'var(--text-3)' }}>{count}</span>
          </div>
          <p style={{margin:'4px 0 0', fontSize:12, color:'var(--text-3)'}}>{subtitle}</p>
        </div>
      </div>

      {/* Column headers */}
      {beats.length > 0 && (
        <div style={{ overflowX:'auto', flexShrink:0, borderBottom:'1px solid var(--border)' }}>
          <div style={{
            display:'grid', gridTemplateColumns: cols, gap:10,
            alignItems:'center', padding:'10px 20px',
            background:'var(--bg-2)', minWidth: 840
          }}>
            <HeadCell>{isQueue ? '#' : ''}</HeadCell>
            <HeadCell></HeadCell>
            <HeadCell>Sangtitel</HeadCell>
            <HeadCell>Artist</HeadCell>
            <HeadCell>Årstal</HeadCell>
            <HeadCell>BPM</HeadCell>
            <HeadCell>Key</HeadCell>
            <HeadCell>Rating</HeadCell>
            <HeadCell title="Tidligere YouTube-upload">YT</HeadCell>
            <HeadCell></HeadCell>
          </div>
        </div>
      )}

      {/* Rows — scrollable */}
      <div style={{ overflowY:'auto', flex: maxRowsBeforeScroll ? '0 0 auto' : '1 1 auto', maxHeight: scrollHeight }}>
        {beats.length === 0 && (
          <div style={{padding:'48px 20px', textAlign:'center', color:'var(--text-3)', fontSize:14}}>
            {emptyText}
          </div>
        )}
        {beats.map((b, i) => (
          <QueueRow key={b.id}
            beat={b}
            index={i}
            cols={cols}
            isQueue={isQueue}
            isPending={isPending}
            draggingId={draggingId}
            dragOverId={dragOverId}
            onDragStart={onDragStart}
            onDragOver={onDragOver}
            onDragEnd={onDragEnd}
            onDrop={onDrop}
            onOpen={onOpenBeat}
            onAction={onAction}
            onSecondaryAction={onSecondaryAction}
          />
        ))}
      </div>
    </div>
  );
}

function HeadCell({ children, title }) {
  return <span title={title} style={{
    fontSize:11, fontWeight:700, color:'var(--text-3)',
    letterSpacing:'.08em', textTransform:'uppercase'
  }}>{children}</span>;
}

function QueueRow({ beat, index, cols, isQueue, isPending, draggingId, dragOverId, onDragStart, onDragOver, onDragEnd, onDrop, onOpen, onAction, onSecondaryAction }) {
  const I = window.Icons;
  const youtubeLink = window.getFirstYouTubeLink(beat.id);
  const previouslyPosted = !!youtubeLink;

  return (
    <div style={{ overflowX:'auto' }}>
      <div
        draggable={isQueue}
        onDragStart={isQueue ? () => onDragStart(beat.id) : undefined}
        onDragOver={isQueue ? (e) => onDragOver(e, beat.id) : undefined}
        onDragEnd={isQueue ? onDragEnd : undefined}
        onDrop={isQueue ? (e) => onDrop(e, beat.id) : undefined}
        style={{
          display:'grid', gridTemplateColumns: cols, gap:10,
          alignItems:'center', padding:'10px 20px',
          borderBottom:'1px solid var(--border)',
          background: dragOverId === beat.id && draggingId !== beat.id ? 'rgba(74,144,217,.08)' : 'transparent',
          opacity: draggingId === beat.id ? 0.45 : 1,
          transition:'background .12s', minWidth:840
        }}>
        {isQueue ? (
          <span className="mono" style={{ fontSize:13, fontWeight:700, color: index < 3 ? 'var(--text)' : 'var(--text-3)' }}>#{index+1}</span>
        ) : (
          <button onClick={() => onAction(beat.id)} title="Læg øverst i Pending queue" style={{
            height:30, borderRadius:5, fontSize:12, fontWeight:600,
            background:'var(--blue)', color:'#fff', border:'1px solid var(--blue)',
            display:'inline-flex', alignItems:'center', justifyContent:'center', gap:5,
            padding:'0 10px', width:'100%'
          }}
            onMouseEnter={e => e.currentTarget.style.background='#5ba0e6'}
            onMouseLeave={e => e.currentTarget.style.background='var(--blue)'}>
            <I.plus width={11} height={11} />Tilføj til kø
          </button>
        )}
        {isQueue ? (
          <span style={{ color:'var(--text-4)', cursor:'grab', display:'inline-flex' }}><I.drag width={14} height={14} /></span>
        ) : <span></span>}
        <button onClick={() => onOpen(beat.id)} style={{textAlign:'left', minWidth:0, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis'}}>
          <span style={{fontWeight:600, fontSize:13, color:'var(--text)'}}
            onMouseEnter={(e)=>e.target.style.color='var(--blue)'}
            onMouseLeave={(e)=>e.target.style.color='var(--text)'}>{beat.title}</span>
        </button>
        <span style={{fontSize:12, color:'var(--text-2)', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis'}}>{window.getArtistName(beat.artist)}</span>
        <span className="mono" style={{fontSize:12, color:'var(--text-3)'}}>{beat.year}</span>
        <span className="mono" style={{fontSize:12, color:'var(--text-2)'}}>{beat.bpm}</span>
        <span className="mono" style={{fontSize:12, color:'var(--text-2)'}}>{beat.key}</span>
        <span><window.CategoryPill category={beat.category} size="sm" /></span>
        <YTIndicator previouslyPosted={previouslyPosted} />
        {isQueue ? (
          <button onClick={() => onAction(beat.id)} title="Fjern fra kø (→ Draft)" style={{
            width:28, height:28, borderRadius:5, color:'var(--text-3)',
            border:'1px solid var(--border-strong)', background:'transparent',
            display:'inline-flex', alignItems:'center', justifyContent:'center'
          }}
            onMouseEnter={e=>{e.currentTarget.style.background='rgba(232,72,85,.12)';e.currentTarget.style.color='#ec6d77';e.currentTarget.style.borderColor='rgba(232,72,85,.5)'}}
            onMouseLeave={e=>{e.currentTarget.style.background='transparent';e.currentTarget.style.color='var(--text-3)';e.currentTarget.style.borderColor='var(--border-strong)'}}>
            <I.x width={12} height={12} />
          </button>
        ) : (
          <button onClick={() => onSecondaryAction(beat.id)} title="Slet permanent" style={{
            width:28, height:28, borderRadius:5, color:'var(--text-3)',
            border:'1px solid var(--border-strong)', background:'transparent',
            display:'inline-flex', alignItems:'center', justifyContent:'center'
          }}
            onMouseEnter={e=>{e.currentTarget.style.background='rgba(232,72,85,.12)';e.currentTarget.style.color='#ec6d77';e.currentTarget.style.borderColor='rgba(232,72,85,.5)'}}
            onMouseLeave={e=>{e.currentTarget.style.background='transparent';e.currentTarget.style.color='var(--text-3)';e.currentTarget.style.borderColor='var(--border-strong)'}}>
            <I.trash width={12} height={12} />
          </button>
        )}
      </div>
    </div>
  );
}

function YTIndicator({ previouslyPosted }) {
  if (previouslyPosted) {
    return (
      <span title="Tidligere postet på YouTube" style={{
        display:'inline-flex', alignItems:'center', justifyContent:'center',
        width:24, height:24, borderRadius:5, background:'rgba(255,42,42,.12)', color:'#ff5252',
        border:'1px solid rgba(255,42,42,.3)'
      }}>
        <window.Icons.yt width={12} height={12} />
      </span>
    );
  }
  return (
    <span title="Aldrig postet på YouTube" style={{
      display:'inline-flex', alignItems:'center', justifyContent:'center',
      width:24, height:24, borderRadius:5, background:'transparent', color:'var(--text-4)',
      border:'1px dashed var(--border-strong)', fontSize:11, fontWeight:700
    }}>—</span>
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
        <div style={{
          width:48, height:48, borderRadius:'50%',
          background: danger ? 'rgba(232,72,85,.12)' : 'rgba(74,144,217,.12)',
          color: danger ? '#ec6d77' : 'var(--blue)',
          display:'flex', alignItems:'center', justifyContent:'center', marginBottom:18
        }}>
          {danger ? <window.Icons.trash width={22} height={22} /> : <window.Icons.check width={22} height={22} />}
        </div>
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
