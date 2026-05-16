// Entry point. Order matters: globals first (puts React/ReactDOM/supabase
// on window), then the prototype component files (they self-register on
// window), then the Supabase data layer, then the app shell.
import './globals';
import './icons.jsx';
import './ui.jsx';
import './sidebar.jsx';
import './page-login.jsx';
import './page-dashboard.jsx';
import './page-beats.jsx';
import './page-beat-detail.jsx';
import './page-artists.jsx';
import './page-artist-detail.jsx';
import './page-publish-queue.jsx';
import './beat-form.jsx';
import './artist-form.jsx';
import './data.jsx';
import './app.jsx';
import { supabase, supabaseConfigured } from './supabaseClient';

const React = window.React;
const { createRoot } = window.ReactDOM;

const screenWrap = {
  minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
  background: 'radial-gradient(ellipse at top, #1a1a1a 0%, #0d0d0d 50%, #0d0d0d 100%)',
  padding: 24, textAlign: 'center',
};
const card = {
  maxWidth: 460, background: 'var(--bg-2)', border: '1px solid var(--border)',
  borderRadius: 12, padding: 32, boxShadow: '0 20px 60px rgba(0,0,0,.5)',
};

function Splash({ text }) {
  return (
    <div style={screenWrap}>
      <div style={{ color: 'var(--text-3)', fontSize: 14 }}>{text}</div>
    </div>
  );
}

function ConfigScreen() {
  return (
    <div style={screenWrap}>
      <div style={card}>
        <h1 style={{ margin: '0 0 10px', fontSize: 20, fontWeight: 700 }}>Supabase mangler konfiguration</h1>
        <p style={{ margin: '0 0 14px', color: 'var(--text-2)', fontSize: 14, lineHeight: 1.6 }}>
          Sæt <code>VITE_SUPABASE_URL</code> og <code>VITE_SUPABASE_ANON_KEY</code> i
          en <code>.env.local</code> fil (lokalt) eller som environment variables i Netlify.
          Find dem i Supabase: Project Settings → API.
        </p>
        <p style={{ margin: 0, color: 'var(--text-4)', fontSize: 12 }}>
          Brug <strong>anon / public</strong> nøglen — aldrig service_role nøglen i en browser.
        </p>
      </div>
    </div>
  );
}

function DataErrorScreen({ error, onRetry }) {
  return (
    <div style={screenWrap}>
      <div style={card}>
        <h1 style={{ margin: '0 0 10px', fontSize: 20, fontWeight: 700, color: '#ec6d77' }}>
          Kunne ikke hente data
        </h1>
        <p style={{ margin: '0 0 16px', color: 'var(--text-2)', fontSize: 14, lineHeight: 1.6 }}>
          {String(error && error.message || error)}
        </p>
        <p style={{ margin: '0 0 18px', color: 'var(--text-4)', fontSize: 12, lineHeight: 1.6 }}>
          Har du kørt <code>supabase_setup.sql</code> i Supabase SQL Editor? Det opretter
          tabellerne <code>artists</code>, <code>beats</code> og <code>jobs</code>.
        </p>
        <window.Btn kind="blue" onClick={onRetry}>Prøv igen</window.Btn>
      </div>
    </div>
  );
}

function Root() {
  const [session, setSession] = React.useState(undefined); // undefined = checking
  const [dataState, setDataState] = React.useState('idle'); // idle | loading | ready | error
  const [dataError, setDataError] = React.useState(null);
  const [nonce, setNonce] = React.useState(0);

  // keep these fresh every render so app.jsx can call them
  window.__refreshData = async () => { await window.loadData(); setNonce(n => n + 1); };
  window.__signOut = async () => { await supabase.auth.signOut(); };

  React.useEffect(() => {
    let active = true;
    supabase.auth.getSession().then(({ data }) => { if (active) setSession(data.session ?? null); });
    const { data: sub } = supabase.auth.onAuthStateChange((_event, s) => {
      setSession(s ?? null);
    });
    return () => { active = false; sub.subscription.unsubscribe(); };
  }, []);

  React.useEffect(() => {
    if (session) {
      setDataState('loading');
      window.loadData()
        .then(() => setDataState('ready'))
        .catch((e) => { setDataError(e); setDataState('error'); });
    } else {
      setDataState('idle');
    }
  }, [session]);

  if (!supabaseConfigured) return <ConfigScreen />;
  if (session === undefined) return <Splash text="Indlæser…" />;
  if (!session) return <window.LoginPage onLogin={() => {}} />;
  if (dataState === 'error') {
    return <DataErrorScreen error={dataError} onRetry={() => {
      setDataState('loading');
      window.loadData().then(() => setDataState('ready')).catch((e) => { setDataError(e); setDataState('error'); });
    }} />;
  }
  if (dataState !== 'ready') return <Splash text="Henter dine beats…" />;
  return <window.App key={nonce} />;
}

createRoot(document.getElementById('root')).render(<Root />);
