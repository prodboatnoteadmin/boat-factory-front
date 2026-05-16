// Main app — router + layout shell (Supabase-backed)
const { useState: useStateApp, useEffect: useEffectApp, useRef: useRefApp } = React;

function App() {
  const [route, setRoute] = useStateApp({ page: 'beats', beatId: null, artistId: null });
  const [modalOpen, setModalOpen] = useStateApp(false);
  const [modalBeatId, setModalBeatId] = useStateApp(null);
  const [artistModalOpen, setArtistModalOpen] = useStateApp(false);
  const [artistModalId, setArtistModalId] = useStateApp(null);
  const [busy, setBusy] = useStateApp(false);

  // Queue + pending state — derived from persisted Supabase data
  const [queueIds, setQueueIds] = useStateApp(() =>
    window.DATA.BEATS
      .filter(b => b.status === 'pending' && b.queuePosition)
      .sort((a, b) => a.queuePosition - b.queuePosition)
      .map(b => b.id)
  );
  const [pendingIds, setPendingIds] = useStateApp(() =>
    window.DATA.BEATS.filter(b => b.status === 'pending' && !b.queuePosition).map(b => b.id)
  );

  // Persist queue ordering whenever it changes (skip the initial mount).
  const firstQueueRun = useRefApp(true);
  useEffectApp(() => {
    if (firstQueueRun.current) { firstQueueRun.current = false; return; }
    window.DB.persistQueue(queueIds, pendingIds)
      .catch(e => alert('Kunne ikke gemme køen: ' + e.message));
  }, [queueIds, pendingIds]);

  // Toast for bulk add
  const [toast, setToast] = useStateApp(null);
  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  // route helpers + a simple history stack powering the "Tilbage" button
  const [history, setHistory] = useStateApp([]);
  const go = (next) => { setHistory([...history, route]); setRoute(next); };
  const goBack = () => {
    if (history.length === 0) { setRoute({ page: 'beats', beatId: null, artistId: null }); return; }
    setRoute(history[history.length - 1]);
    setHistory(history.slice(0, -1));
  };
  const nav = (page) => go({ page, beatId: null, artistId: null });
  const openBeat = (id) => go({ page: 'beat-detail', beatId: id, artistId: null });
  const openArtist = (id) => go({ page: 'artist-detail', beatId: null, artistId: id });
  const openNewBeat = () => { setModalBeatId(null); setModalOpen(true); };
  const openEditBeat = (id) => { setModalBeatId(id); setModalOpen(true); };
  const openNewArtist = () => { setArtistModalId(null); setArtistModalOpen(true); };
  const openEditArtist = (id) => { setArtistModalId(id); setArtistModalOpen(true); };

  const refresh = () => (window.__refreshData ? window.__refreshData() : Promise.resolve());

  const handleBulkAddToQueue = (ids) => {
    const toAdd = ids.filter(id => !queueIds.includes(id));
    // Add to TOP of queue
    setQueueIds([...toAdd, ...queueIds]);
    // Remove from pending if present
    setPendingIds(pendingIds.filter(id => !toAdd.includes(id)));
    showToast(`${toAdd.length} ${toAdd.length === 1 ? 'beat tilføjet' : 'beats tilføjet'} øverst i køen`);
  };

  const saveBeat = async (form) => {
    if (busy) return;
    setBusy(true);
    try {
      if (modalBeatId) await window.DB.updateBeat(modalBeatId, form);
      else await window.DB.createBeat(form);
      setModalOpen(false);
      await refresh();
    } catch (e) {
      alert('Kunne ikke gemme beat: ' + e.message);
    } finally {
      setBusy(false);
    }
  };

  const saveArtist = async (form) => {
    if (busy) return;
    setBusy(true);
    try {
      if (artistModalId) await window.DB.updateArtist(artistModalId, form);
      else await window.DB.createArtist(form);
      setArtistModalOpen(false);
      await refresh();
    } catch (e) {
      alert('Kunne ikke gemme artist: ' + e.message);
    } finally {
      setBusy(false);
    }
  };

  const deleteBeat = async (id) => {
    if (!confirm('Slet dette beat permanent?')) return;
    try {
      await window.DB.deleteBeat(id);
      nav('beats');
      await refresh();
    } catch (e) {
      alert('Kunne ikke slette beat: ' + e.message);
    }
  };

  let pageEl;
  switch (route.page) {
    case 'beats':
      pageEl = <window.BeatsPage onOpenBeat={openBeat} onNewBeat={openNewBeat} onAddToQueue={handleBulkAddToQueue} />;
      break;
    case 'beat-detail':
      pageEl = <window.BeatDetailPage beatId={route.beatId} onBack={goBack} onNav={nav}
                  onOpenArtist={openArtist} onEdit={() => openEditBeat(route.beatId)}
                  onDelete={() => deleteBeat(route.beatId)}
                  queueIds={queueIds}
                  onAddToQueue={(id) => handleBulkAddToQueue([id])} />;
      break;
    case 'artists':
      pageEl = <window.ArtistsPage onOpenArtist={openArtist} onNewArtist={openNewArtist} />;
      break;
    case 'artist-detail':
      pageEl = <window.ArtistDetailPage artistId={route.artistId} onBack={goBack} onNav={nav} onOpenBeat={openBeat} onEditArtist={openEditArtist} />;
      break;
    case 'queue':
      pageEl = <window.PublishQueuePage onOpenBeat={openBeat}
                  queueIds={queueIds} setQueueIds={setQueueIds}
                  pendingIds={pendingIds} setPendingIds={setPendingIds} />;
      break;
    default:
      pageEl = <div>404</div>;
  }

  // Map detail pages back to their parent for sidebar highlighting
  const sidebarActive = ({
    'beat-detail': 'beats',
    'artist-detail': 'artists',
  })[route.page] || route.page;

  return (
    <>
      <window.Sidebar current={sidebarActive} onNav={nav}
        onLogout={() => window.__signOut && window.__signOut()} />
      <main style={{
        marginLeft:240, minHeight:'100vh',
        padding:'32px 40px 60px',
        background:'var(--bg-0)',
      }}>
        <div style={{ maxWidth: 1320, margin:'0 auto' }}>
          {pageEl}
        </div>
      </main>
      <window.BeatFormModal open={modalOpen} beatId={modalBeatId} onClose={() => setModalOpen(false)} onSave={saveBeat} />
      <window.ArtistFormModal open={artistModalOpen} artistId={artistModalId} onClose={() => setArtistModalOpen(false)} onSave={saveArtist} />
      {toast && (
        <div style={{
          position:'fixed', bottom:24, left:'50%', transform:'translateX(-50%)',
          padding:'14px 22px', borderRadius:8,
          background:'var(--bg-2)', border:'1px solid var(--border-strong)',
          color:'var(--text)', fontSize:14, fontWeight:600,
          display:'flex', alignItems:'center', gap:10,
          boxShadow:'0 20px 60px rgba(0,0,0,.5), 0 0 0 1px rgba(46,204,113,.25)',
          zIndex:300
        }}>
          <window.Icons.check width={16} height={16} style={{color:'var(--green)'}} />
          {toast}
        </div>
      )}
    </>
  );
}

window.App = App;
