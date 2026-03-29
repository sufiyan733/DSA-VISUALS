'use client'
import { useSignUp } from '@clerk/nextjs'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function SignUpPage() {
  const { signUp, setActive, isLoaded } = useSignUp()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [code, setCode] = useState('')
  const [stage, setStage] = useState('form') // 'form' | 'verify'
  const [error, setError] = useState('')
  const router = useRouter()

  const handleSignUp = async (e) => {
    e.preventDefault()
    if (!isLoaded) return
    try {
      await signUp.create({ emailAddress: email, password })
      await signUp.prepareEmailAddressVerification({ strategy: 'email_code' })
      setStage('verify')
    } catch (err) {
      setError(err.errors?.[0]?.message || 'Sign up failed')
    }
  }

  const handleVerify = async (e) => {
    e.preventDefault()
    try {
      const result = await signUp.attemptEmailAddressVerification({ code })
      if (result.status === 'complete') {
        await setActive({ session: result.createdSessionId })
        router.push('/')
      }
    } catch (err) {
      setError(err.errors?.[0]?.message || 'Verification failed')
    }
  }

  return (
    <div style={{ maxWidth: 400, margin: '100px auto', padding: 24 }}>
      <h1>Sign Up</h1>
      {stage === 'form' ? (
        <form onSubmit={handleSignUp}>
          <input placeholder="Email" value={email}
            onChange={e => setEmail(e.target.value)} style={{ display:'block', width:'100%', marginBottom:12, padding:8 }} />
          <input type="password" placeholder="Password" value={password}
            onChange={e => setPassword(e.target.value)} style={{ display:'block', width:'100%', marginBottom:12, padding:8 }} />
          {error && <p style={{ color: 'red' }}>{error}</p>}
          <button type="submit" style={{ width:'100%', padding:10 }}>Create Account</button>
        </form>
      ) : (
        <form onSubmit={handleVerify}>
          <p>Check your email for a verification code.</p>
          <input placeholder="Verification code" value={code}
            onChange={e => setCode(e.target.value)} style={{ display:'block', width:'100%', marginBottom:12, padding:8 }} />
          {error && <p style={{ color: 'red' }}>{error}</p>}
          <button type="submit" style={{ width:'100%', padding:10 }}>Verify</button>
        </form>
      )}
    </div>
  )
}