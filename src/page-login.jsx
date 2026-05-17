// Login page — real Supabase email/password auth
function LoginPage({ onLogin }) {
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [error, setError] = React.useState('');
  const [submitting, setSubmitting] = React.useState(false);
  const I = window.Icons;

  const submit = async (e) => {
    e.preventDefault();
    if (submitting) return;
    setError('');
    if (!email.trim() || !password) {
      setError('Indtast email og adgangskode.');
      return;
    }
    setSubmitting(true);
    const { error: signInError } = await window.supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });
    setSubmitting(false);
    if (signInError) {
      setError(
        signInError.message === 'Invalid login credentials'
          ? 'Forkert email eller adgangskode.'
          : signInError.message || 'Login mislykkedes.'
      );
      return;
    }
    if (onLogin) onLogin();
  };

  return (
    <div style={{
      minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center',
      background:'radial-gradient(ellipse at top, #1a1a1a 0%, #0d0d0d 50%, #0d0d0d 100%)',
      padding:24, position:'relative', overflow:'hidden'
    }}>
      {/* subtle visual texture */}
      <div style={{
        position:'absolute', inset:0, opacity:.25,
        background: 'repeating-linear-gradient(90deg, transparent 0 2px, rgba(255,255,255,.02) 2px 3px)',
        maskImage:'radial-gradient(ellipse at center, black 0%, transparent 70%)',
        pointerEvents:'none'
      }}></div>

      <div style={{
        width:'100%', maxWidth:400, background:'var(--bg-2)',
        border:'1px solid var(--border)', borderRadius:12, padding:36,
        position:'relative', zIndex:1, boxShadow:'0 20px 60px rgba(0,0,0,.5)'
      }}>
        <div style={{display:'flex', alignItems:'center', gap:12, marginBottom:30}}>
          <div style={{
            width:44, height:44, borderRadius:10, background:'#5C6FC9',
            display:'flex', alignItems:'center', justifyContent:'center',
            fontWeight:800, color:'#fff', fontSize:22, boxShadow:'0 6px 20px rgba(92,111,201,.4)'
          }}>B</div>
          <div>
            <div style={{fontWeight:700, fontSize:20, letterSpacing:'-.01em'}}>Beat Manager</div>
            <div style={{fontSize:11, color:'var(--text-3)', letterSpacing:'.06em'}}>BOAT NOTE · ADMIN</div>
          </div>
        </div>

        <h1 style={{margin:'0 0 6px 0', fontSize:22, fontWeight:700, letterSpacing:'-.02em'}}>Log ind på din studio</h1>
        <p style={{margin:'0 0 28px 0', color:'var(--text-3)', fontSize:14}}>Velkommen tilbage.</p>

        <form onSubmit={submit}>
          <div style={{display:'flex', flexDirection:'column', gap:14}}>
            <div>
              <label style={{display:'block', fontSize:12, color:'var(--text-3)', marginBottom:6, fontWeight:500}}>Email</label>
              <window.TextInput value={email} onChange={setEmail} placeholder="navn@studio.dk" fullWidth />
            </div>
            <div>
              <label style={{display:'block', fontSize:12, color:'var(--text-3)', marginBottom:6, fontWeight:500}}>Adgangskode</label>
              <window.TextInput value={password} onChange={setPassword} type="password" placeholder="••••••••" fullWidth
                onKeyDown={(e) => { if (e.key === 'Enter') submit(e); }} />
            </div>

            {error && (
              <div style={{
                fontSize:13, color:'#ec6d77', background:'rgba(232,72,85,.10)',
                border:'1px solid rgba(232,72,85,.3)', borderRadius:6, padding:'10px 12px'
              }}>{error}</div>
            )}

            <window.Btn kind="primary" size="lg" type="submit" disabled={submitting}
              style={{width:'100%', marginTop:6}} iconRight={<I.arrowR />}>
              {submitting ? 'Logger ind…' : 'Log ind'}
            </window.Btn>
          </div>
        </form>

        <div style={{marginTop:24, paddingTop:20, borderTop:'1px solid var(--border)', fontSize:12, color:'var(--text-3)', textAlign:'center'}}>
          Privat instans · Single user
        </div>
      </div>
    </div>
  );
}

window.LoginPage = LoginPage;
