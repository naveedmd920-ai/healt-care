import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';
import { useAuth, getDashboardPathForRole } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { api, getApiErrorMessage } from '../services/api';

const DEMO_ACCOUNTS = [
  { label: 'Patient Demo', email: 'patient@ruralhealth.demo', role: 'Patient' },
  { label: 'Doctor (Sample)', email: 'dr.ananya@ruralhealth.demo', role: 'Verified Sample' },
  { label: 'Doctor (Pending)', email: 'dr.kiran@ruralhealth.demo', role: 'Pending Approval' },
  { label: 'Administrator', email: 'admin@ruralhealth.demo', role: 'Admin RBAC' },
];

export function LoginPage() {
  const { login } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirectPath = searchParams.get('redirect');

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      const user = await login(email, password);
      if (redirectPath && redirectPath.startsWith('/')) {
        navigate(redirectPath, { replace: true });
      } else {
        navigate(getDashboardPathForRole(user.role), { replace: true });
      }
    } catch (err) {
      setError(getApiErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAF9]">
      <Navbar />
      <main className="flex-1 max-w-[1000px] w-full mx-auto px-4 sm:px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
          <div className="md:col-span-7 bg-white border border-emerald-950/10 rounded-xl p-6 sm:p-8 space-y-6">
            <div>
              <h1 className="text-2xl font-display font-bold text-slate-950">{t.auth.loginTitle}</h1>
              <p className="text-sm text-slate-600 mt-1">{t.auth.loginSubtitle}</p>
            </div>

            {error && (
              <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-sm text-red-800">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-800 mb-1">
                  {t.auth.email}
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full px-3.5 py-2.5 text-sm rounded-lg border border-emerald-950/15 bg-[#F8FAF9]"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-sm font-medium text-slate-800">{t.auth.password}</label>
                  <Link
                    to="/forgot-password"
                    className="text-xs font-medium text-emerald-800 hover:underline"
                  >
                    {t.auth.forgotLink}
                  </Link>
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-3.5 py-2.5 text-sm rounded-lg border border-emerald-950/15 bg-[#F8FAF9]"
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-2.5 px-4 text-sm font-semibold text-white bg-emerald-700 hover:bg-emerald-800 disabled:opacity-60 rounded-lg transition-colors cursor-pointer"
              >
                {submitting ? t.common.loading : t.auth.signInBtn}
              </button>
            </form>

            <p className="text-sm text-slate-600">
              New to Rural Health Connect?{' '}
              <Link
                to={redirectPath ? `/register?redirect=${encodeURIComponent(redirectPath)}` : '/register'}
                className="font-semibold text-emerald-800 hover:underline"
              >
                {t.auth.createAccountBtn}
              </Link>
            </p>
          </div>

          <aside className="md:col-span-5 bg-white border border-emerald-950/10 rounded-xl p-6 space-y-4">
            <h2 className="text-sm font-semibold text-slate-900">{t.auth.demoTitle}</h2>
            <p className="text-xs text-slate-600">
              Select any demonstration account below to pre-fill credentials for testing each role.
            </p>
            <div className="space-y-2">
              {DEMO_ACCOUNTS.map((acc) => (
                <button
                  key={acc.email}
                  type="button"
                  onClick={() => {
                    setEmail(acc.email);
                    setPassword('Demo@1234');
                  }}
                  className="w-full text-left p-3 rounded-lg border border-emerald-950/10 bg-[#F8FAF9] hover:border-emerald-700 transition-colors cursor-pointer"
                >
                  <div className="flex items-center justify-between text-xs font-semibold text-slate-900">
                    <span>{acc.label}</span>
                    <span className="text-emerald-800">{acc.role}</span>
                  </div>
                  <div className="text-xs font-mono text-slate-600 mt-0.5">{acc.email}</div>
                </button>
              ))}
            </div>
          </aside>
        </div>
      </main>
      <Footer />
    </div>
  );
}

export function RegisterPage() {
  const { register } = useAuth();
  const { lang, t } = useLanguage();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirectPath = searchParams.get('redirect');

  const [form, setForm] = useState({
    fullName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    age: '',
    gender: 'male',
    villageTown: '',
    district: 'Medchal-Malkajgiri',
    preferredLanguage: lang,
    role: 'patient',
    qualification: 'MBBS',
    specialization: 'General Physician',
    experienceYears: '3',
    registrationNumber: '',
    councilName: 'Telangana State Medical Council',
    consentAccepted: true,
  });

  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (form.password !== form.confirmPassword) {
      setError('Password and Confirm Password must match.');
      return;
    }
    if (!form.consentAccepted) {
      setError('Please accept the healthcare privacy and consent notice to continue.');
      return;
    }

    setSubmitting(true);
    try {
      const user = await register(form);
      if (redirectPath && redirectPath.startsWith('/') && user.role === 'patient') {
        navigate(redirectPath, { replace: true });
      } else {
        navigate(getDashboardPathForRole(user.role), { replace: true });
      }
    } catch (err) {
      setError(getApiErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  const passwordsMismatch =
    form.confirmPassword.length > 0 && form.password !== form.confirmPassword;

  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAF9]">
      <Navbar />
      <main className="flex-1 max-w-[760px] w-full mx-auto px-4 sm:px-6 py-10">
        <div className="bg-white border border-emerald-950/10 rounded-xl p-6 sm:p-8 space-y-6">
          <div>
            <h1 className="text-2xl font-display font-bold text-slate-950">{t.auth.registerTitle}</h1>
            <p className="text-sm text-slate-600 mt-1">{t.auth.registerSubtitle}</p>
          </div>

          {error && (
            <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-sm text-red-800">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  {t.auth.role}
                </label>
                <select
                  value={form.role}
                  onChange={(e) => setForm({ ...form, role: e.target.value })}
                  className="w-full px-3 py-2.5 text-sm rounded-lg border border-emerald-950/15 bg-[#F8FAF9]"
                >
                  <option value="patient">{t.auth.patient}</option>
                  <option value="doctor">{t.auth.doctor}</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  {t.auth.preferredLanguage}
                </label>
                <select
                  value={form.preferredLanguage}
                  onChange={(e) =>
                    setForm({ ...form, preferredLanguage: e.target.value as 'en' | 'te' | 'hi' })
                  }
                  className="w-full px-3 py-2.5 text-sm rounded-lg border border-emerald-950/15 bg-[#F8FAF9]"
                >
                  <option value="en">English</option>
                  <option value="te">తెలుగు</option>
                  <option value="hi">हिन्दी</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  {t.auth.fullName}
                </label>
                <input
                  type="text"
                  required
                  value={form.fullName}
                  onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                  className="w-full px-3 py-2.5 text-sm rounded-lg border border-emerald-950/15 bg-[#F8FAF9]"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  {t.auth.phone}
                </label>
                <input
                  type="tel"
                  required
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  placeholder="9848012345"
                  className="w-full px-3 py-2.5 text-sm rounded-lg border border-emerald-950/15 bg-[#F8FAF9]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">{t.auth.email}</label>
              <input
                type="email"
                required
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full px-3 py-2.5 text-sm rounded-lg border border-emerald-950/15 bg-[#F8FAF9]"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  {t.auth.password}
                </label>
                <input
                  type="password"
                  required
                  minLength={6}
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  className="w-full px-3 py-2.5 text-sm rounded-lg border border-emerald-950/15 bg-[#F8FAF9]"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  {t.auth.confirmPassword}
                </label>
                <input
                  type="password"
                  required
                  minLength={6}
                  value={form.confirmPassword}
                  onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
                  className={`w-full px-3 py-2.5 text-sm rounded-lg border bg-[#F8FAF9] ${
                    passwordsMismatch ? 'border-red-500' : 'border-emerald-950/15'
                  }`}
                />
                {passwordsMismatch && (
                  <p className="text-xs text-red-700 mt-1">Passwords do not match.</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">{t.auth.age}</label>
                <input
                  type="number"
                  required
                  min={1}
                  max={120}
                  value={form.age}
                  onChange={(e) => setForm({ ...form, age: e.target.value })}
                  className="w-full px-3 py-2.5 text-sm rounded-lg border border-emerald-950/15 bg-[#F8FAF9]"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  {t.auth.gender}
                </label>
                <select
                  value={form.gender}
                  onChange={(e) => setForm({ ...form, gender: e.target.value })}
                  className="w-full px-3 py-2.5 text-sm rounded-lg border border-emerald-950/15 bg-[#F8FAF9]"
                >
                  <option value="male">{t.auth.male}</option>
                  <option value="female">{t.auth.female}</option>
                  <option value="other">{t.auth.other}</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  {t.auth.villageTown}
                </label>
                <input
                  type="text"
                  required
                  value={form.villageTown}
                  onChange={(e) => setForm({ ...form, villageTown: e.target.value })}
                  placeholder="Yamnampet"
                  className="w-full px-3 py-2.5 text-sm rounded-lg border border-emerald-950/15 bg-[#F8FAF9]"
                />
              </div>
            </div>

            {form.role === 'doctor' && (
              <div className="p-4 rounded-lg bg-emerald-50/70 border border-emerald-700/20 space-y-3">
                <div className="text-xs font-semibold text-emerald-900">
                  Doctor Verification Details (Requires Admin Approval)
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <input
                    type="text"
                    required
                    value={form.qualification}
                    onChange={(e) => setForm({ ...form, qualification: e.target.value })}
                    placeholder="Qualification (e.g. MBBS, MD)"
                    className="px-3 py-2 text-sm rounded-lg border border-emerald-950/15 bg-white"
                  />
                  <input
                    type="text"
                    required
                    value={form.specialization}
                    onChange={(e) => setForm({ ...form, specialization: e.target.value })}
                    placeholder="Specialization"
                    className="px-3 py-2 text-sm rounded-lg border border-emerald-950/15 bg-white"
                  />
                  <input
                    type="text"
                    required
                    value={form.registrationNumber}
                    onChange={(e) => setForm({ ...form, registrationNumber: e.target.value })}
                    placeholder="Medical Council Registration No."
                    className="px-3 py-2 text-sm rounded-lg border border-emerald-950/15 bg-white"
                  />
                  <input
                    type="number"
                    min={0}
                    max={60}
                    value={form.experienceYears}
                    onChange={(e) => setForm({ ...form, experienceYears: e.target.value })}
                    placeholder="Years of experience"
                    className="px-3 py-2 text-sm rounded-lg border border-emerald-950/15 bg-white"
                  />
                </div>
              </div>
            )}

            <label className="flex items-start gap-2.5 text-xs text-slate-600 pt-1 cursor-pointer">
              <input
                type="checkbox"
                checked={form.consentAccepted}
                onChange={(e) => setForm({ ...form, consentAccepted: e.target.checked })}
                className="mt-0.5 accent-emerald-700"
              />
              <span>
                I consent to Rural Health Connect storing my registration and appointment details for
                telemedicine scheduling in accordance with applicable Indian healthcare privacy norms.
              </span>
            </label>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-2.5 px-4 text-sm font-semibold text-white bg-emerald-700 hover:bg-emerald-800 disabled:opacity-60 rounded-lg transition-colors cursor-pointer"
            >
              {submitting ? t.common.loading : t.auth.createAccountBtn}
            </button>
          </form>

          <p className="text-sm text-slate-600">
            Already registered?{' '}
            <Link
              to={redirectPath ? `/login?redirect=${encodeURIComponent(redirectPath)}` : '/login'}
              className="font-semibold text-emerald-800 hover:underline"
            >
              {t.auth.signInBtn}
            </Link>
          </p>
        </div>
      </main>
      <Footer />
    </div>
  );
}

export function ForgotPasswordPage() {
  const { t } = useLanguage();
  const [step, setStep] = useState<'request' | 'reset' | 'done'>('request');
  const [email, setEmail] = useState('');
  const [demoOtpNotice, setDemoOtpNotice] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRequestOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await api.post('/auth/forgot-password', { email });
      setDemoOtpNotice(`Development Demo OTP: ${res.data.demoOtp} (valid for 15 minutes)`);
      setStep('reset');
    } catch (err) {
      setError(getApiErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await api.post('/auth/reset-password', { email, otp, newPassword });
      setStep('done');
    } catch (err) {
      setError(getApiErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAF9]">
      <Navbar />
      <main className="flex-1 max-w-[520px] w-full mx-auto px-4 sm:px-6 py-12">
        <div className="bg-white border border-emerald-950/10 rounded-xl p-6 sm:p-8 space-y-5">
          <h1 className="text-2xl font-display font-bold text-slate-950">{t.auth.resetTitle}</h1>

          {error && (
            <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-sm text-red-800">
              {error}
            </div>
          )}

          {demoOtpNotice && step === 'reset' && (
            <div className="p-3 rounded-lg bg-amber-50 border border-amber-200 text-sm text-amber-900 font-mono">
              {demoOtpNotice}
            </div>
          )}

          {step === 'request' && (
            <form onSubmit={handleRequestOtp} className="space-y-4">
              <p className="text-sm text-slate-600">
                Enter your registered email address to generate a development verification OTP.
              </p>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full px-3.5 py-2.5 text-sm rounded-lg border border-emerald-950/15 bg-[#F8FAF9]"
              />
              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 text-sm font-semibold text-white bg-emerald-700 hover:bg-emerald-800 rounded-lg cursor-pointer"
              >
                {loading ? t.common.loading : 'Generate Demo OTP'}
              </button>
            </form>
          )}

          {step === 'reset' && (
            <form onSubmit={handleReset} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">OTP Code</label>
                <input
                  type="text"
                  required
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  placeholder="6-digit OTP"
                  className="w-full px-3.5 py-2.5 text-sm rounded-lg border border-emerald-950/15 bg-[#F8FAF9]"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  New Password
                </label>
                <input
                  type="password"
                  required
                  minLength={6}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Minimum 6 characters"
                  className="w-full px-3.5 py-2.5 text-sm rounded-lg border border-emerald-950/15 bg-[#F8FAF9]"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 text-sm font-semibold text-white bg-emerald-700 hover:bg-emerald-800 rounded-lg cursor-pointer"
              >
                {loading ? t.common.loading : 'Reset Password'}
              </button>
            </form>
          )}

          {step === 'done' && (
            <div className="space-y-4">
              <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-sm text-emerald-900">
                Password updated successfully. You can now sign in.
              </div>
              <Link
                to="/login"
                className="block w-full text-center py-2.5 text-sm font-semibold text-white bg-emerald-700 rounded-lg"
              >
                Go to Login
              </Link>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
