'use client'
import { useState, useEffect } from 'react'
import { useSignIn, useSignUp } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'
import { PremiumLogo } from '@/app/page'

export default function AuthModal({mode, onClose}) {
  const [tab, setTab] = useState(mode);
  const [focusField, setFocusField] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [stage, setStage] = useState('form'); // 'form' | 'verify'
  const [code, setCode] = useState('');

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const { signIn, setActive: setActiveSignIn, isLoaded: signInLoaded } = useSignIn();
  const { signUp, setActive: setActiveSignUp, isLoaded: signUpLoaded } = useSignUp();
  const router = useRouter();

  useEffect(() => {
    const h = e => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', h);
    return () => document.removeEventListener('keydown', h);
  }, [onClose]);

const handleSubmit = async () => {
  console.log('1. fired', { tab, email, password, signInLoaded, signUpLoaded });
  setError('');
  setLoading(true);
  try {
    if (tab === 'signin') {
      console.log('2. signin path, loaded:', signInLoaded);
      if (!signInLoaded) { console.log('STOPPED - signIn not loaded'); setLoading(false); return; }
      console.log('3. calling signIn.create');
      const result = await signIn.create({ identifier: email, password });
      console.log('4. result:', result.status);
      if (result.status === 'complete') {
        await setActiveSignIn({ session: result.createdSessionId });
        onClose();
        router.refresh();
      }
    } else {
      console.log('2. signup path, loaded:', signUpLoaded);
      if (!signUpLoaded) { console.log('STOPPED - signUp not loaded'); setLoading(false); return; }
      console.log('3. calling signUp.create');
      const result = await signUp.create({ emailAddress: email, password, firstName: name });
      console.log('4. signUp.create done:', result.status);
      console.log('5. preparing verification');
      await signUp.prepareEmailAddressVerification({ strategy: 'email_code' });
      console.log('6. done, setting stage to verify');
      setStage('verify');
    }
  } catch (err) {
    console.error('CAUGHT ERROR:', err);
    console.error('err.errors:', err?.errors);
    console.error('err.message:', err?.message);
    setError(err?.errors?.[0]?.message || err?.message || 'Something went wrong');
  } finally {
    console.log('7. finally');
    setLoading(false);
  }
};

  const handleVerify = async () => {
    setError('');
    setLoading(true);
    try {
      const result = await signUp.attemptEmailAddressVerification({ code });
      if (result.status === 'complete') {
        await setActiveSignUp({ session: result.createdSessionId });
        onClose();
        router.refresh();
      }
    } catch (err) {
      setError(err.errors?.[0]?.message || 'Invalid code');
    } finally {
      setLoading(false);
    }
  };

  const inp = (field) => ({
    width: '100%',
    background: focusField === field ? 'rgba(129,140,248,.07)' : 'rgba(255,255,255,.03)',
    border: `1px solid ${focusField === field ? 'rgba(129,140,248,.5)' : 'rgba(255,255,255,.09)'}`,
    borderRadius: '12px', padding: '13px 16px', color: '#e2e8f0', fontSize: '13px', outline: 'none',
    fontFamily: "'DM Sans',sans-serif", boxSizing: 'border-box', transition: 'all .22s',
    boxShadow: focusField === field ? '0 0 0 3px rgba(99,102,241,.12),inset 0 1px 0 rgba(255,255,255,.04)' : 'inset 0 1px 0 rgba(255,255,255,.02)',
  });

  return (
    <div onClick={onClose} style={{position:'fixed',inset:0,zIndex:500,background:'rgba(2,6,14,.94)',backdropFilter:'blur(32px) saturate(160%)',display:'flex',alignItems:'center',justifyContent:'center',padding:'20px',animation:'fadeInScale .28s cubic-bezier(.16,1,.3,1)'}}>
      <div onClick={e => e.stopPropagation()} style={{position:'relative',width:'100%',maxWidth:'420px',animation:'modalSlideUp .38s cubic-bezier(.16,1,.3,1)'}}>
        <div style={{position:'absolute',inset:'-2px',borderRadius:'26px',background:'linear-gradient(135deg,rgba(99,102,241,.35),rgba(167,139,250,.25),rgba(34,211,238,.2),rgba(99,102,241,.35))',backgroundSize:'300% 300%',animation:'borderSpin 5s linear infinite',zIndex:0}}/>
        <div style={{position:'relative',zIndex:1,background:'linear-gradient(155deg,#0b0b24 0%,#060614 55%,#080820 100%)',borderRadius:'24px',padding:'36px',boxShadow:'0 60px 100px rgba(0,0,0,.7),0 0 0 1px rgba(129,140,248,.08),inset 0 1px 0 rgba(255,255,255,.07)'}}>
          <div style={{position:'absolute',top:0,left:'50%',transform:'translateX(-50%)',width:'60%',height:'2px',background:'linear-gradient(to right,transparent,rgba(129,140,248,.6) 30%,rgba(167,139,250,.7) 50%,rgba(129,140,248,.6) 70%,transparent)',borderRadius:'999px'}}/>
          <div style={{position:'absolute',top:'-40px',left:'-40px',width:'180px',height:'180px',borderRadius:'50%',background:'radial-gradient(circle,rgba(99,102,241,.12),transparent 70%)',pointerEvents:'none',filter:'blur(20px)'}}/>
          <div style={{position:'absolute',bottom:'-40px',right:'-40px',width:'160px',height:'160px',borderRadius:'50%',background:'radial-gradient(circle,rgba(34,211,238,.08),transparent 70%)',pointerEvents:'none',filter:'blur(20px)'}}/>
          <button onClick={onClose} style={{position:'absolute',top:'16px',right:'16px',background:'rgba(255,255,255,.05)',border:'1px solid rgba(255,255,255,.09)',borderRadius:'10px',color:'#475569',fontSize:'14px',cursor:'pointer',padding:'7px 10px',lineHeight:1,transition:'all .2s',zIndex:2}}
            onMouseEnter={e=>{e.currentTarget.style.color='#94a3b8';e.currentTarget.style.background='rgba(255,255,255,.09)';}}
            onMouseLeave={e=>{e.currentTarget.style.color='#475569';e.currentTarget.style.background='rgba(255,255,255,.05)';}}>✕</button>
          <div style={{display:'flex',justifyContent:'center',marginBottom:'28px'}}><PremiumLogo/></div>
          <div style={{textAlign:'center',marginBottom:'24px'}}>
            <h3 style={{fontSize:'20px',fontWeight:900,color:'#f1f5f9',letterSpacing:'-.02em',marginBottom:'6px',fontFamily:"'Space Mono',monospace"}}>
              {stage === 'verify' ? 'Check your email' : tab === 'signin' ? 'Welcome back' : 'Join the grind'}
            </h3>
            <p style={{fontSize:'12px',color:'#475569'}}>
              {stage === 'verify' ? `We sent a code to ${email}` : tab === 'signin' ? 'Continue your DSA journey' : 'Get started'}
            </p>
          </div>

          {/* Tab switcher — hidden during verify */}
          {stage === 'form' && (
            <div style={{display:'flex',gap:'3px',padding:'4px',borderRadius:'14px',background:'rgba(255,255,255,.03)',border:'1px solid rgba(255,255,255,.07)',marginBottom:'24px',position:'relative'}}>
              <div style={{position:'absolute',top:'4px',left:tab==='signin'?'4px':'calc(50% + 1.5px)',width:'calc(50% - 5.5px)',bottom:'4px',borderRadius:'11px',background:'rgba(99,102,241,.22)',border:'1px solid rgba(129,140,248,.38)',transition:'left .28s cubic-bezier(.16,1,.3,1)',boxShadow:'0 2px 16px rgba(99,102,241,.3)'}}/>
              {[['signin','Sign In'],['signup','Sign Up']].map(([id,label]) => (
                <button key={id} onClick={() => { setTab(id); setError(''); setStage('form'); }}
                  style={{flex:1,padding:'10px',borderRadius:'11px',background:'transparent',border:'none',color:tab===id?'#a5b4fc':'#4b5563',fontSize:'13px',fontWeight:700,cursor:'pointer',fontFamily:"'DM Sans',sans-serif",transition:'color .2s',position:'relative',zIndex:1}}>{label}</button>
              ))}
            </div>
          )}

          {/* Verify stage */}
          {stage === 'verify' ? (
            <div style={{display:'flex',flexDirection:'column',gap:'14px',marginBottom:'20px'}}>
              <div>
                <label style={{display:'block',fontSize:'11px',fontWeight:600,color:'#4b5563',letterSpacing:'.06em',textTransform:'uppercase',marginBottom:'7px'}}>Verification Code</label>
                <input placeholder="Enter 6-digit code" value={code} onChange={e => setCode(e.target.value)}
                  style={inp('code')} onFocus={() => setFocusField('code')} onBlur={() => setFocusField(null)}/>
              </div>
              {error && <p style={{color:'#f87171',fontSize:'12px',textAlign:'center'}}>{error}</p>}
              <button onClick={handleVerify} disabled={loading}
                style={{width:'100%',padding:'15px',borderRadius:'14px',background:loading?'rgba(79,70,229,.6)':'linear-gradient(135deg,#4f46e5,#7c3aed)',border:'none',color:'#fff',fontSize:'14px',fontWeight:700,cursor:loading?'not-allowed':'pointer',fontFamily:"'DM Sans',sans-serif",boxShadow:loading?'none':'0 6px 28px rgba(99,102,241,.42)'}}>
                {loading ? 'Verifying...' : 'Verify Email →'}
              </button>
            </div>
          ) : (
            /* Normal form */
            <>
              <div style={{display:'flex',flexDirection:'column',gap:'14px',marginBottom:'20px'}}>
                {tab === 'signup' && (
                  <div>
                    <label style={{display:'block',fontSize:'11px',fontWeight:600,color:'#4b5563',letterSpacing:'.06em',textTransform:'uppercase',marginBottom:'7px'}}>Full Name</label>
                    <input placeholder="Ada Lovelace" value={name} onChange={e => setName(e.target.value)}
                      style={inp('name')} onFocus={() => setFocusField('name')} onBlur={() => setFocusField(null)}/>
                  </div>
                )}
                <div>
                  <label style={{display:'block',fontSize:'11px',fontWeight:600,color:'#4b5563',letterSpacing:'.06em',textTransform:'uppercase',marginBottom:'7px'}}>Email</label>
                  <input type="email" placeholder="you@example.com" value={email} onChange={e => setEmail(e.target.value)}
                    style={inp('email')} onFocus={() => setFocusField('email')} onBlur={() => setFocusField(null)}/>
                </div>
                <div>
                  <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'7px'}}>
                    <label style={{fontSize:'11px',fontWeight:600,color:'#4b5563',letterSpacing:'.06em',textTransform:'uppercase'}}>Password</label>
                    {tab === 'signin' && <button style={{background:'none',border:'none',color:'#6366f1',fontSize:'10px',cursor:'pointer',fontFamily:"'DM Sans',sans-serif",padding:0,fontWeight:600}}>Forgot?</button>}
                  </div>
                  <input type="password" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)}
                    style={inp('pw')} onFocus={() => setFocusField('pw')} onBlur={() => setFocusField(null)}/>
                </div>
              </div>
              {error && <p style={{color:'#f87171',fontSize:'12px',textAlign:'center',marginBottom:'12px'}}>{error}</p>}
              <button onClick={handleSubmit} disabled={loading}
                style={{width:'100%',padding:'15px',borderRadius:'14px',background:loading?'rgba(79,70,229,.6)':'linear-gradient(135deg,#4f46e5,#7c3aed)',border:'none',color:'#fff',fontSize:'14px',fontWeight:700,cursor:loading?'not-allowed':'pointer',fontFamily:"'DM Sans',sans-serif",transition:'all .25s',boxShadow:loading?'none':'0 6px 28px rgba(99,102,241,.42)',position:'relative',overflow:'hidden',letterSpacing:'.02em'}}>
                {loading ? (
                  <span style={{display:'flex',alignItems:'center',justifyContent:'center',gap:'10px'}}>
                    <span style={{width:'14px',height:'14px',border:'2px solid rgba(255,255,255,.3)',borderTopColor:'#fff',borderRadius:'50%',display:'inline-block',animation:'spinLoader .7s linear infinite'}}/>
                    Authenticating...
                  </span>
                ) : (tab === 'signin' ? 'Sign In →' : 'Create Account →')}
              </button>
              <div style={{display:'flex',alignItems:'center',gap:'12px',margin:'20px 0'}}>
                <div style={{flex:1,height:'1px',background:'rgba(255,255,255,.06)'}}/><span style={{fontSize:'10px',color:'#1e293b',letterSpacing:'.08em',fontFamily:"'Space Mono',monospace"}}>OR</span><div style={{flex:1,height:'1px',background:'rgba(255,255,255,.06)'}}/>
              </div>
              <button style={{width:'100%',padding:'13px',borderRadius:'13px',background:'rgba(255,255,255,.04)',border:'1px solid rgba(255,255,255,.09)',color:'#94a3b8',fontSize:'13px',fontWeight:600,cursor:'pointer',fontFamily:"'DM Sans',sans-serif",display:'flex',alignItems:'center',justifyContent:'center',gap:'10px',transition:'all .22s'}}
                onMouseEnter={e=>{e.currentTarget.style.background='rgba(255,255,255,.08)';e.currentTarget.style.borderColor='rgba(255,255,255,.15)';e.currentTarget.style.color='#cbd5e1';}}
                onMouseLeave={e=>{e.currentTarget.style.background='rgba(255,255,255,.04)';e.currentTarget.style.borderColor='rgba(255,255,255,.09)';e.currentTarget.style.color='#94a3b8';}}>
                <svg width="16" height="16" viewBox="0 0 24 24"><path fill="#4285F4" d="M23.745 12.27c0-.79-.07-1.54-.19-2.27h-11.3v4.51h6.47c-.29 1.48-1.14 2.73-2.4 3.58v3h3.86c2.26-2.09 3.56-5.17 3.56-8.82z"/><path fill="#34A853" d="M12.255 24c3.24 0 5.95-1.08 7.93-2.91l-3.86-3c-1.08.72-2.45 1.16-4.07 1.16-3.13 0-5.78-2.11-6.73-4.96h-3.98v3.09C3.515 21.3 7.615 24 12.255 24z"/><path fill="#FBBC05" d="M5.525 14.29c-.25-.72-.38-1.49-.38-2.29s.14-1.57.38-2.29V6.62h-3.98a11.86 11.86 0 000 10.76l3.98-3.09z"/><path fill="#EA4335" d="M12.255 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C18.205 1.19 15.495 0 12.255 0c-4.64 0-8.74 2.7-10.71 6.62l3.98 3.09c.95-2.85 3.6-4.96 6.73-4.96z"/></svg>
                Continue with Google
              </button>
              <p style={{textAlign:'center',fontSize:'11px',color:'#1e293b',marginTop:'18px'}}>
                {tab === 'signin' ? "Don't have an account? " : 'Already have an account? '}
                <button onClick={() => { setTab(tab === 'signin' ? 'signup' : 'signin'); setError(''); }}
                  style={{background:'none',border:'none',color:'#818cf8',fontSize:'11px',cursor:'pointer',fontWeight:700,padding:0,fontFamily:"'DM Sans',sans-serif"}}
                  onMouseEnter={e=>e.target.style.color='#c084fc'} onMouseLeave={e=>e.target.style.color='#818cf8'}>
                  {tab === 'signin' ? 'Sign Up →' : 'Sign In →'}
                </button>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}