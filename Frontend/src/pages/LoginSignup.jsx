/**
 * LoginSignup.jsx
 *
 * Full authentication page with:
 *   - Login / Sign-up tabs
 *   - Google OAuth (requires GOOGLE_CLIENT_ID configured in App.jsx)
 *   - Forgot Password → OTP verify → Reset password (inline 3-step flow)
 */

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';
import { useAuth } from '../context/AuthContext';
import useScrollAnimation from '../hooks/useScrollAnimation';
import './LoginSignup.css';

// ─────────────────────────────────────────────────────────────────────────── //
//  Sub-flows                                                                  //
// ─────────────────────────────────────────────────────────────────────────── //

/** Step 1 — enter email to request OTP */
function ForgotStep1({ onNext, onBack }) {
  const { requestOtp } = useAuth();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await requestOtp(email);
      onNext(email);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-form-wrapper">
      <h2 className="auth-title">Forgot Password</h2>
      <p className="auth-subtitle">Enter your email and we'll send you a 6-digit code.</p>
      <form onSubmit={handleSubmit} className="auth-form">
        <div className="auth-field">
          <label htmlFor="fp-email">Email Address</label>
          <input
            id="fp-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            required
          />
        </div>
        {error && <p className="auth-error">{error}</p>}
        <button type="submit" className="auth-btn-primary" disabled={loading}>
          {loading ? 'Sending…' : 'Send OTP'}
        </button>
        <button type="button" className="auth-link-btn" onClick={onBack}>
          ← Back to login
        </button>
      </form>
    </div>
  );
}

/** Step 2 — enter the OTP received in email */
function ForgotStep2({ email, onNext, onBack }) {
  const { verifyOtp } = useAuth();
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const resetToken = await verifyOtp(email, otp);
      onNext(resetToken);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-form-wrapper">
      <h2 className="auth-title">Enter OTP</h2>
      <p className="auth-subtitle">
        A 6-digit code was sent to <strong>{email}</strong>. It expires in 10 minutes.
      </p>
      <form onSubmit={handleSubmit} className="auth-form">
        <div className="auth-field">
          <label htmlFor="otp-input">One-Time Password</label>
          <input
            id="otp-input"
            type="text"
            inputMode="numeric"
            maxLength={6}
            value={otp}
            onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
            placeholder="123456"
            className="otp-input"
            required
          />
        </div>
        {error && <p className="auth-error">{error}</p>}
        <button type="submit" className="auth-btn-primary" disabled={loading || otp.length !== 6}>
          {loading ? 'Verifying…' : 'Verify OTP'}
        </button>
        <button type="button" className="auth-link-btn" onClick={onBack}>
          ← Change email
        </button>
      </form>
    </div>
  );
}

/** Step 3 — set new password */
function ForgotStep3({ resetToken, onDone }) {
  const { resetPassword } = useAuth();
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (password !== confirm) {
      setError('Passwords do not match.');
      return;
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }
    setLoading(true);
    try {
      await resetPassword(resetToken, password);
      setSuccess(true);
      setTimeout(onDone, 2000);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="auth-form-wrapper success-wrapper">
        <div className="success-icon">✓</div>
        <h2 className="auth-title">Password Reset!</h2>
        <p className="auth-subtitle">Redirecting you to login…</p>
      </div>
    );
  }

  return (
    <div className="auth-form-wrapper">
      <h2 className="auth-title">New Password</h2>
      <p className="auth-subtitle">Choose a strong password for your account.</p>
      <form onSubmit={handleSubmit} className="auth-form">
        <div className="auth-field">
          <label htmlFor="new-pass">New Password</label>
          <input
            id="new-pass"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Min. 8 characters"
            required
          />
        </div>
        <div className="auth-field">
          <label htmlFor="confirm-pass">Confirm Password</label>
          <input
            id="confirm-pass"
            type="password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            placeholder="Repeat password"
            required
          />
        </div>
        {error && <p className="auth-error">{error}</p>}
        <button type="submit" className="auth-btn-primary" disabled={loading}>
          {loading ? 'Resetting…' : 'Reset Password'}
        </button>
      </form>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────── //
//  Forgot Password wrapper (manages steps 1-3)                              //
// ─────────────────────────────────────────────────────────────────────────── //

function ForgotPassword({ onBack }) {
  const [step, setStep] = useState(1);
  const [forgotEmail, setForgotEmail] = useState('');
  const [resetToken, setResetToken] = useState('');

  return (
    <>
      {step === 1 && (
        <ForgotStep1
          onNext={(email) => { setForgotEmail(email); setStep(2); }}
          onBack={onBack}
        />
      )}
      {step === 2 && (
        <ForgotStep2
          email={forgotEmail}
          onNext={(token) => { setResetToken(token); setStep(3); }}
          onBack={() => setStep(1)}
        />
      )}
      {step === 3 && (
        <ForgotStep3
          resetToken={resetToken}
          onDone={onBack}
        />
      )}
    </>
  );
}

// ─────────────────────────────────────────────────────────────────────────── //
//  Main Login / Signup page                                                   //
// ─────────────────────────────────────────────────────────────────────────── //

export default function LoginSignup() {
  const navigate = useNavigate();
  const { login, signup, googleLogin } = useAuth();

  const [tab, setTab] = useState('login'); // 'login' | 'signup'
  const [showForgot, setShowForgot] = useState(false);

  // Shared form state
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const pageRef = useScrollAnimation();

  const clearForm = () => {
    setName(''); setEmail(''); setPassword(''); setError('');
  };

  // ------------------------------------------------------------------ //
  //  Email / Password submit                                            //
  // ------------------------------------------------------------------ //
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      let loggedInUser;
      if (tab === 'login') {
        loggedInUser = await login(email, password);
      } else {
        if (!name.trim()) { setError('Full name is required.'); setLoading(false); return; }
        loggedInUser = await signup(name, email, password);
      }
      navigate(loggedInUser?.is_admin ? '/admin' : '/dashboard');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // ------------------------------------------------------------------ //
  //  Google OAuth success                                               //
  // ------------------------------------------------------------------ //
  const handleGoogleSuccess = async (response) => {
    setError('');
    try {
      const loggedInUser = await googleLogin(response.credential);
      navigate(loggedInUser?.is_admin ? '/admin' : '/dashboard');
    } catch (err) {
      setError(err.message);
    }
  };

  const handleGoogleError = () => {
    setError('Google sign-in failed. Please try again.');
  };

  // ------------------------------------------------------------------ //
  //  Render forgot-password flow                                        //
  // ------------------------------------------------------------------ //
  if (showForgot) {
    return (
      <div className="auth-page" ref={pageRef}>
        <div className="auth-bg-orbs">
          <div className="orb orb-1" />
          <div className="orb orb-2" />
          <div className="orb orb-3" />
        </div>
        <div className="auth-card animate">
          <div className="auth-card-header">
            <div className="auth-logo">
              <span className="logo-icon">⟳</span>
              <span className="logo-text">SkillOrbit</span>
            </div>
          </div>
          <ForgotPassword onBack={() => { setShowForgot(false); clearForm(); }} />
        </div>
      </div>
    );
  }

  // ------------------------------------------------------------------ //
  //  Main login/signup render                                           //
  // ------------------------------------------------------------------ //
  return (
    <div className="auth-page" ref={pageRef}>
      {/* Animated background orbs */}
      <div className="auth-bg-orbs">
        <div className="orb orb-1" />
        <div className="orb orb-2" />
        <div className="orb orb-3" />
      </div>

      <div className="auth-card animate">
        {/* Logo */}
        <div className="auth-card-header">
          <div className="auth-logo">
            <span className="logo-icon">◎</span>
            <span className="logo-text">SkillOrbit</span>
          </div>
          <p className="auth-card-tagline">
            {tab === 'login' ? 'Welcome back. Keep orbiting.' : 'Join the orbit. Start learning.'}
          </p>
        </div>

        {/* Tabs */}
        <div className="auth-tabs" role="tablist">
          <button
            role="tab"
            id="tab-login"
            aria-selected={tab === 'login'}
            className={`auth-tab ${tab === 'login' ? 'active' : ''}`}
            onClick={() => { setTab('login'); clearForm(); }}
          >
            Login
          </button>
          <button
            role="tab"
            id="tab-signup"
            aria-selected={tab === 'signup'}
            className={`auth-tab ${tab === 'signup' ? 'active' : ''}`}
            onClick={() => { setTab('signup'); clearForm(); }}
          >
            Sign Up
          </button>
          <div className={`auth-tab-indicator ${tab === 'signup' ? 'right' : ''}`} />
        </div>

        {/* Google OAuth button */}
        <div className="google-btn-wrapper">
          <GoogleLogin
            onSuccess={handleGoogleSuccess}
            onError={handleGoogleError}
            useOneTap={false}
            text={tab === 'login' ? 'signin_with' : 'signup_with'}
            shape="rectangular"
            theme="filled_black"
            size="large"
            width="100%"
          />
        </div>

        <div className="auth-divider">
          <span>or continue with email</span>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="auth-form" noValidate>
          {tab === 'signup' && (
            <div className="auth-field">
              <label htmlFor="auth-name">Full Name</label>
              <input
                id="auth-name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Jane Doe"
                autoComplete="name"
              />
            </div>
          )}

          <div className="auth-field">
            <label htmlFor="auth-email">Email Address</label>
            <input
              id="auth-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              autoComplete="email"
              required
            />
          </div>

          <div className="auth-field">
            <div className="auth-field-row">
              <label htmlFor="auth-password">Password</label>
              {tab === 'login' && (
                <button
                  type="button"
                  className="auth-forgot-link"
                  id="btn-forgot-password"
                  onClick={() => setShowForgot(true)}
                >
                  Forgot password?
                </button>
              )}
            </div>
            <input
              id="auth-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={tab === 'signup' ? 'Min. 8 characters' : '••••••••'}
              autoComplete={tab === 'login' ? 'current-password' : 'new-password'}
              required
            />
          </div>

          {error && <p className="auth-error" role="alert">{error}</p>}

          <button
            id="btn-auth-submit"
            type="submit"
            className="auth-btn-primary"
            disabled={loading}
          >
            {loading
              ? (tab === 'login' ? 'Signing in…' : 'Creating account…')
              : (tab === 'login' ? 'Sign In' : 'Create Account')}
          </button>
        </form>

        <p className="auth-switch-text">
          {tab === 'login' ? "Don't have an account? " : 'Already have an account? '}
          <button
            type="button"
            className="auth-link-btn inline"
            onClick={() => { setTab(tab === 'login' ? 'signup' : 'login'); clearForm(); }}
          >
            {tab === 'login' ? 'Sign up' : 'Log in'}
          </button>
        </p>
      </div>
    </div>
  );
}
