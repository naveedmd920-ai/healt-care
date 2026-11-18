import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  ChevronDown,
  MapPin,
  Stethoscope,
  CheckCircle2,
  Languages,
  ShieldCheck,
  Clock,
} from 'lucide-react';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';
import { SafeImage } from '../components/SafeImage';
import { useLanguage } from '../context/LanguageContext';
import { useAuth, getDashboardPathForRole } from '../context/AuthContext';
import { api, getApiErrorMessage } from '../services/api';
import { SupportedLanguage } from '../translations';

const HERO_IMAGE = '/src/assets/images/hero_rural_telemedicine_1795011401901.jpg';

const RURAL_CHALLENGES = [
  {
    num: '01',
    title: 'Long travel distances',
    desc: 'Villagers often travel 20–50 km to reach district clinics for routine consultations.',
  },
  {
    num: '02',
    title: 'Limited doctor availability',
    desc: 'Many rural primary centres face shortages of physicians and rotating schedules.',
  },
  {
    num: '03',
    title: 'High travel and wage loss',
    desc: 'Daily-wage earners lose a full day of income alongside transport and clinic fees.',
  },
  {
    num: '04',
    title: 'Specialist access gap',
    desc: 'Reaching pediatricians or gynecologists requires costly referrals to urban hospitals.',
  },
  {
    num: '05',
    title: 'Unverified health advice',
    desc: 'Families lack reliable, medically reviewed information for preventive care.',
  },
  {
    num: '06',
    title: 'Language barriers',
    desc: 'Medical portals built only in English exclude Telugu and Hindi speaking households.',
  },
  {
    num: '07',
    title: 'Mobility hurdles for elders',
    desc: 'Elderly and low-income patients struggle with physical queues and repeat follow-ups.',
  },
  {
    num: '08',
    title: 'Low-bandwidth realities',
    desc: 'Heavy interfaces fail on intermittent 3G/4G connections common in rural mandals.',
  },
];

const FAQS = [
  {
    q: 'How much does an online doctor consultation cost?',
    a: 'The proposed consultation fee is ₹100 per session, with a ₹35 direct operating cost model designed for rural affordability. During development, payments run in a clearly labelled simulation mode unless Razorpay credentials are configured.',
  },
  {
    q: 'Are the doctors shown on the platform real?',
    a: 'Initial demonstration doctors and hospitals in the directory are clearly labelled as Sample Demo Profiles. Newly registered doctors receive verified status only after an administrator reviews and approves their credentials.',
  },
  {
    q: 'Can elderly patients use the platform in Telugu or Hindi?',
    a: 'Yes. Switching between English, తెలుగు, and हिन्दी immediately translates navigation, dashboards, forms, and educational health articles, and saves your preference to your profile.',
  },
  {
    q: 'What happens if I need in-person hospital care?',
    a: 'Use the Nearby Hospital Finder powered by OpenStreetMap and Leaflet to search clinics by village or mandal, view available facilities, and open step-by-step directions.',
  },
];

export function LandingPage() {
  const { lang, t, setLanguage } = useLanguage();
  const { user } = useAuth();

  const [doctors, setDoctors] = useState<any[]>([]);
  const [hospitals, setHospitals] = useState<any[]>([]);
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  // Contact form state
  const [contactForm, setContactForm] = useState({
    name: '',
    emailOrPhone: '',
    village: '',
    message: '',
  });
  const [contactStatus, setContactStatus] = useState<{ type: 'success' | 'error'; text: string } | null>(
    null
  );
  const [submittingContact, setSubmittingContact] = useState(false);

  useEffect(() => {
    api
      .get('/doctors')
      .then((res) => setDoctors((res.data.doctors || []).slice(0, 3)))
      .catch(() => {});
    api
      .get('/hospitals')
      .then((res) => setHospitals((res.data.hospitals || []).slice(0, 3)))
      .catch(() => {});
  }, []);

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setContactStatus(null);
    setSubmittingContact(true);
    try {
      const res = await api.post('/contact', contactForm);
      setContactStatus({ type: 'success', text: res.data.message });
      setContactForm({ name: '', emailOrPhone: '', village: '', message: '' });
    } catch (err) {
      setContactStatus({ type: 'error', text: getApiErrorMessage(err) });
    } finally {
      setSubmittingContact(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAF9]">
      <Navbar />

      <main className="flex-1">
        {/* 2. HERO SECTION */}
        <section className="bg-white border-b border-emerald-950/10">
          <div className="max-w-[1200px] mx-auto px-4 sm:px-6 py-12 lg:py-16">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-stretch">
              <div className="lg:col-span-6 flex flex-col justify-center space-y-6">
                <div className="text-sm font-medium text-emerald-800">
                  <span>{t.tagline}</span>
                  <span className="mx-2 text-slate-400" aria-hidden="true">
                    ·
                  </span>
                  <span className="font-mono tabular-nums">{t.hero.feeHighlight}</span>
                </div>

                <h1 className="text-[clamp(2.15rem,4vw,3.35rem)] leading-[1.12] font-display font-bold tracking-tight text-slate-950 [text-wrap:balance]">
                  {t.hero.heading}
                </h1>

                <p className="text-base sm:text-lg text-slate-600 leading-relaxed max-w-xl">
                  {t.hero.subtitle}
                </p>

                <div className="flex flex-wrap items-center gap-3 pt-1">
                  <Link
                    to="/doctors"
                    className="inline-flex items-center gap-2 px-5 py-3 text-sm font-semibold text-white bg-emerald-700 hover:bg-emerald-800 rounded-lg transition-colors whitespace-nowrap shrink-0"
                  >
                    <Stethoscope className="w-4 h-4" />
                    <span>{t.hero.ctaPrimary}</span>
                  </Link>

                  <Link
                    to="/hospitals"
                    className="inline-flex items-center gap-2 px-5 py-3 text-sm font-semibold text-emerald-900 bg-emerald-50 hover:bg-emerald-100 border border-emerald-700/20 rounded-lg transition-colors whitespace-nowrap shrink-0"
                  >
                    <MapPin className="w-4 h-4" />
                    <span>{t.hero.ctaHospitals}</span>
                  </Link>

                  {user ? (
                    <Link
                      to={getDashboardPathForRole(user.role)}
                      className="inline-flex items-center gap-1.5 px-4 py-3 text-sm font-semibold text-slate-700 hover:text-emerald-800 underline underline-offset-4 whitespace-nowrap shrink-0"
                    >
                      <span>{t.nav.dashboard}</span>
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  ) : (
                    <div className="flex items-center gap-3 pl-1">
                      <Link
                        to="/login"
                        className="px-4 py-3 text-sm font-semibold text-slate-800 hover:text-emerald-800 border border-emerald-950/15 bg-white rounded-lg transition-colors whitespace-nowrap shrink-0"
                      >
                        {t.hero.ctaLogin}
                      </Link>
                      <Link
                        to="/register"
                        className="px-4 py-3 text-sm font-semibold text-amber-800 hover:text-amber-900 underline underline-offset-4 whitespace-nowrap shrink-0"
                      >
                        {t.hero.ctaRegister}
                      </Link>
                    </div>
                  )}
                </div>

                <p className="text-xs text-slate-500 pt-1">{t.hero.costTransparency}</p>
              </div>

              <div className="lg:col-span-6">
                <div className="h-full min-h-[280px] rounded-xl overflow-hidden border border-emerald-950/10 bg-emerald-950/5">
                  <SafeImage
                    src={HERO_IMAGE}
                    alt="Rural Indian family consulting a doctor via tablet in a sunlit village courtyard"
                    className="w-full h-full object-cover"
                    fallbackLabel="Rural Health Connect Telemedicine"
                  />
                </div>
              </div>
            </div>

            {/* 4-column key metrics strip below hero */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 pt-10 mt-10 border-t border-emerald-950/10">
              <div className="p-4 rounded-lg bg-[#F8FAF9] border border-emerald-950/10">
                <div className="text-2xl font-display font-bold text-emerald-800 font-mono tabular-nums">
                  ₹100
                </div>
                <div className="text-xs text-slate-600 mt-1">Proposed consultation fee per session</div>
              </div>
              <div className="p-4 rounded-lg bg-[#F8FAF9] border border-emerald-950/10">
                <div className="text-2xl font-display font-bold text-teal-800 font-mono tabular-nums">
                  ₹35
                </div>
                <div className="text-xs text-slate-600 mt-1">Direct operating cost per consultation</div>
              </div>
              <div className="p-4 rounded-lg bg-[#F8FAF9] border border-emerald-950/10">
                <div className="text-2xl font-display font-bold text-slate-900">3 Languages</div>
                <div className="text-xs text-slate-600 mt-1">English, తెలుగు, and हिन्दी interface</div>
              </div>
              <div className="p-4 rounded-lg bg-[#F8FAF9] border border-emerald-950/10">
                <div className="text-2xl font-display font-bold text-slate-900">3 Portals</div>
                <div className="text-xs text-slate-600 mt-1">Patient, Doctor, and Admin RBAC</div>
              </div>
            </div>
          </div>
        </section>

        {/* 3. PROBLEM STATEMENT */}
        <section className="max-w-[1200px] mx-auto px-4 sm:px-6 py-16">
          <div className="max-w-2xl mb-10">
            <h2 className="text-2xl sm:text-3xl font-display font-bold text-slate-950 tracking-tight [text-wrap:balance]">
              {t.sections.problemTitle}
            </h2>
            <p className="text-base text-slate-600 mt-2">{t.sections.problemSubtitle}</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-px bg-emerald-950/10 border border-emerald-950/10 rounded-xl overflow-hidden">
            {RURAL_CHALLENGES.map((item) => (
              <div key={item.num} className="bg-white p-6 space-y-2">
                <span className="text-xs font-mono tabular-nums font-semibold text-emerald-700">
                  {item.num}
                </span>
                <h3 className="text-base font-semibold text-slate-900">{item.title}</h3>
                <p className="text-sm text-slate-600 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* 4. PROJECT SOLUTION & 5. HOW IT WORKS */}
        <section id="how-it-works" className="bg-white border-y border-emerald-950/10 py-16">
          <div className="max-w-[1200px] mx-auto px-4 sm:px-6">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
              <div className="lg:col-span-5 space-y-4">
                <h2 className="text-2xl sm:text-3xl font-display font-bold text-slate-950 tracking-tight [text-wrap:balance]">
                  {t.sections.solutionTitle}
                </h2>
                <p className="text-base text-slate-600 leading-relaxed">
                  {t.sections.solutionSubtitle}
                </p>
                <div className="pt-2 space-y-2.5 text-sm text-slate-700">
                  <div className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-700 mt-0.5 shrink-0" />
                    <span>Duplicate-protected slot booking with transaction safety</span>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-700 mt-0.5 shrink-0" />
                    <span>Authorized doctor-patient consultation room via WebRTC signaling</span>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-700 mt-0.5 shrink-0" />
                    <span>OpenStreetMap hospital discovery with manual village search fallback</span>
                  </div>
                </div>
              </div>

              <div className="lg:col-span-7">
                <h3 className="text-sm font-semibold text-slate-900 mb-4">
                  {t.sections.howItWorksTitle}
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {[
                    {
                      step: '01. Choose Language & Register',
                      detail: 'Select English, Telugu, or Hindi and create your village profile in under a minute.',
                    },
                    {
                      step: '02. Pick a Doctor & Time Slot',
                      detail: 'Filter verified doctors by language, specialization, and available dates.',
                    },
                    {
                      step: '03. Confirm ₹100 Consultation',
                      detail: 'Complete simulated or configured gateway payment to lock your time slot.',
                    },
                    {
                      step: '04. Join Video Call & Save Notes',
                      detail: 'Consult online from home and review doctor notes or locate nearby hospitals.',
                    },
                  ].map((s) => (
                    <div
                      key={s.step}
                      className="p-5 rounded-xl bg-[#F8FAF9] border border-emerald-950/10 space-y-1.5"
                    >
                      <h4 className="text-sm font-semibold text-emerald-900">{s.step}</h4>
                      <p className="text-sm text-slate-600 leading-relaxed">{s.detail}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 6. MAIN FEATURES (Asymmetric Bento) */}
        <section className="max-w-[1200px] mx-auto px-4 sm:px-6 py-16">
          <div className="max-w-2xl mb-8">
            <h2 className="text-2xl sm:text-3xl font-display font-bold text-slate-950 tracking-tight">
              {t.sections.featuresTitle}
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2 p-6 rounded-xl bg-white border border-emerald-950/10 flex flex-col justify-between space-y-4">
              <div className="space-y-2">
                <div className="text-xs font-medium text-emerald-700">Telemedicine Workflow</div>
                <h3 className="text-xl font-display font-bold text-slate-900">
                  Real Slot Locking & Role-Protected Video Consultations
                </h3>
                <p className="text-sm text-slate-600 leading-relaxed max-w-xl">
                  Patients see real-time slot availability, doctors approve or complete consultations from
                  their schedule, and administrators verify practitioner credentials before profiles go live.
                </p>
              </div>
              <div>
                <Link
                  to="/doctors"
                  className="inline-flex items-center gap-1.5 text-sm font-semibold text-emerald-800 hover:underline"
                >
                  <span>Browse Doctor Directory</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>

            <div className="p-6 rounded-xl bg-emerald-900 text-white space-y-3">
              <ShieldCheck className="w-6 h-6 text-emerald-300" />
              <h3 className="text-lg font-display font-bold">Strict Verification & RBAC</h3>
              <p className="text-sm text-emerald-100 leading-relaxed">
                Patient medical notes stay private to the assigned doctor and patient. New doctor accounts
                remain pending until approved by an administrator.
              </p>
            </div>

            <div className="p-6 rounded-xl bg-white border border-emerald-950/10 space-y-2">
              <MapPin className="w-5 h-5 text-teal-700" />
              <h3 className="text-base font-semibold text-slate-900">Interactive Hospital Map</h3>
              <p className="text-sm text-slate-600">
                OpenStreetMap and Leaflet pins for rural PHCs, CHCs, and referral hospitals with manual
                village search.
              </p>
            </div>

            <div className="p-6 rounded-xl bg-white border border-emerald-950/10 space-y-2">
              <Languages className="w-5 h-5 text-teal-700" />
              <h3 className="text-base font-semibold text-slate-900">English, Telugu & Hindi</h3>
              <p className="text-sm text-slate-600">
                Full UI translation across public pages, forms, alerts, and health education articles.
              </p>
            </div>

            <div className="p-6 rounded-xl bg-white border border-emerald-950/10 space-y-2">
              <Clock className="w-5 h-5 text-amber-600" />
              <h3 className="text-base font-semibold text-slate-900">Preventive Health Library</h3>
              <p className="text-sm text-slate-600">
                7 reviewed categories covering nutrition, hygiene, maternal care, child vaccines, and
                senior wellness.
              </p>
            </div>
          </div>
        </section>

        {/* 7. DOCTOR CONSULTATION SECTION (Live DB preview) */}
        <section className="bg-white border-y border-emerald-950/10 py-16">
          <div className="max-w-[1200px] mx-auto px-4 sm:px-6">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
              <div>
                <h2 className="text-2xl sm:text-3xl font-display font-bold text-slate-950">
                  {t.sections.doctorsTitle}
                </h2>
                <p className="text-sm text-slate-600 mt-1">{t.sections.doctorsNote}</p>
              </div>
              <Link
                to="/doctors"
                className="text-sm font-semibold text-emerald-800 hover:underline whitespace-nowrap shrink-0"
              >
                View All Doctors →
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {doctors.map((doc) => (
                <div
                  key={doc.id}
                  className="rounded-xl border border-emerald-950/10 bg-[#F8FAF9] overflow-hidden flex flex-col justify-between"
                >
                  <div className="p-5 space-y-4">
                    <div className="flex items-center gap-4">
                      <SafeImage
                        src={doc.avatar_url}
                        alt={doc.full_name}
                        className="w-16 h-16 rounded-lg object-cover border border-emerald-950/10 shrink-0"
                      />
                      <div className="min-w-0">
                        <h3 className="text-base font-semibold text-slate-900 truncate">
                          {doc.full_name}
                        </h3>
                        <p className="text-xs text-slate-600 truncate">{doc.qualification}</p>
                        <div className="text-xs text-emerald-800 mt-1">
                          <span>{doc.specialization}</span>
                          <span className="mx-1.5" aria-hidden="true">
                            ·
                          </span>
                          <span className="tabular-nums">{doc.experience_years} yrs exp</span>
                        </div>
                      </div>
                    </div>

                    <p className="text-sm text-slate-600 line-clamp-2">{doc.bio}</p>

                    <div className="text-xs text-slate-500">
                      <span>{doc.languages_spoken}</span>
                      {doc.is_sample ? (
                        <>
                          <span className="mx-1.5" aria-hidden="true">
                            ·
                          </span>
                          <span className="text-amber-700 font-medium">{t.common.sampleLabel}</span>
                        </>
                      ) : null}
                    </div>
                  </div>

                  <div className="px-5 py-3.5 bg-white border-t border-emerald-950/10 flex items-center justify-between">
                    <span className="text-sm font-bold text-slate-900 font-mono tabular-nums">
                      ₹{doc.consultation_fee}
                    </span>
                    <Link
                      to={`/doctors/${doc.id}`}
                      className="px-3.5 py-1.5 text-xs font-semibold text-white bg-emerald-700 hover:bg-emerald-800 rounded-lg whitespace-nowrap shrink-0"
                    >
                      {t.dashboards.bookSlot}
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 8. NEARBY HOSPITAL SECTION */}
        <section className="max-w-[1200px] mx-auto px-4 sm:px-6 py-16">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
            <div>
              <h2 className="text-2xl sm:text-3xl font-display font-bold text-slate-950">
                {t.sections.hospitalsTitle}
              </h2>
              <p className="text-sm text-slate-600 mt-1">
                Search local PHCs, CHCs, and referral centres on an interactive OpenStreetMap view.
              </p>
            </div>
            <Link
              to="/hospitals"
              className="px-4 py-2 text-sm font-semibold text-emerald-900 bg-white border border-emerald-950/15 hover:border-emerald-700 rounded-lg whitespace-nowrap shrink-0"
            >
              Open Interactive Map →
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {hospitals.map((h) => (
              <div
                key={h.id}
                className="p-5 rounded-xl bg-white border border-emerald-950/10 space-y-2"
              >
                <div className="text-xs text-teal-800 font-medium">
                  <span>{h.category}</span>
                  <span className="mx-1.5" aria-hidden="true">
                    ·
                  </span>
                  <span>{h.village_town}</span>
                </div>
                <h3 className="text-base font-semibold text-slate-900">{h.name}</h3>
                <p className="text-sm text-slate-600">{h.address}</p>
                <p className="text-xs text-slate-500 pt-1">{h.facilities}</p>
              </div>
            ))}
          </div>
        </section>

        {/* 9. MULTILINGUAL SUPPORT & 10. HEALTHCARE BENEFITS */}
        <section className="bg-white border-y border-emerald-950/10 py-16">
          <div className="max-w-[1200px] mx-auto px-4 sm:px-6 grid grid-cols-1 lg:grid-cols-2 gap-10 items-start">
            <div className="p-6 rounded-xl bg-[#F8FAF9] border border-emerald-950/10 space-y-4">
              <h2 className="text-2xl font-display font-bold text-slate-950">
                {t.sections.multilingualTitle}
              </h2>
              <p className="text-sm text-slate-600">
                Try switching the platform language right now. Every menu, form, and article updates
                immediately.
              </p>
              <div className="flex flex-wrap gap-2">
                {(
                  [
                    { code: 'en', label: 'English' },
                    { code: 'te', label: 'తెలుగు (Telugu)' },
                    { code: 'hi', label: 'हिन्दी (Hindi)' },
                  ] as Array<{ code: SupportedLanguage; label: string }>
                ).map((item) => (
                  <button
                    key={item.code}
                    type="button"
                    onClick={() => setLanguage(item.code)}
                    className={`px-4 py-2 text-sm font-semibold rounded-lg border transition-colors cursor-pointer ${
                      lang === item.code
                        ? 'bg-emerald-700 text-white border-emerald-700'
                        : 'bg-white text-slate-800 border-emerald-950/15 hover:bg-emerald-50'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <h2 className="text-2xl font-display font-bold text-slate-950">
                {t.sections.benefitsTitle}
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                <div className="p-4 rounded-lg border border-emerald-950/10 bg-[#F8FAF9]">
                  <div className="font-semibold text-slate-900">Elderly & Mobility Support</div>
                  <p className="text-slate-600 mt-1">
                    Large readable controls and zero travel needed for routine medicine reviews.
                  </p>
                </div>
                <div className="p-4 rounded-lg border border-emerald-950/10 bg-[#F8FAF9]">
                  <div className="font-semibold text-slate-900">Women & Child Care</div>
                  <p className="text-slate-600 mt-1">
                    Direct access to maternal and pediatric guidance plus immunization reminders.
                  </p>
                </div>
                <div className="p-4 rounded-lg border border-emerald-950/10 bg-[#F8FAF9]">
                  <div className="font-semibold text-slate-900">Daily-Wage Savings</div>
                  <p className="text-slate-600 mt-1">
                    Schedule slots before or after work hours without sacrificing a day of income.
                  </p>
                </div>
                <div className="p-4 rounded-lg border border-emerald-950/10 bg-[#F8FAF9]">
                  <div className="font-semibold text-slate-900">Transparent ₹100 Fee</div>
                  <p className="text-slate-600 mt-1">
                    Predictable consultation pricing backed by a lean ₹35 operating model.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 11. FAQ & 12. CONTACT SECTION */}
        <section id="contact" className="max-w-[1200px] mx-auto px-4 sm:px-6 py-16">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
            <div className="lg:col-span-6 space-y-4">
              <h2 className="text-2xl font-display font-bold text-slate-950">
                {t.sections.faqTitle}
              </h2>
              <div className="divide-y divide-emerald-950/10 border border-emerald-950/10 rounded-xl bg-white">
                {FAQS.map((faq, idx) => {
                  const isOpen = openFaq === idx;
                  return (
                    <div key={faq.q} className="p-4">
                      <button
                        type="button"
                        onClick={() => setOpenFaq(isOpen ? null : idx)}
                        className="w-full flex items-center justify-between gap-4 text-left text-sm font-semibold text-slate-900 cursor-pointer"
                      >
                        <span>{faq.q}</span>
                        <ChevronDown
                          className={`w-4 h-4 shrink-0 text-slate-500 transition-transform ${
                            isOpen ? 'rotate-180' : ''
                          }`}
                        />
                      </button>
                      {isOpen && (
                        <p className="text-sm text-slate-600 mt-2.5 leading-relaxed">{faq.a}</p>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="lg:col-span-6">
              <div className="p-6 rounded-xl bg-white border border-emerald-950/10 space-y-4">
                <div>
                  <h2 className="text-2xl font-display font-bold text-slate-950">
                    {t.sections.contactTitle}
                  </h2>
                  <p className="text-sm text-slate-600 mt-1">
                    Team Elite · Sreenidhi Institute of Science and Technology (SNIST), Yamnampet,
                    Ghatkesar.
                  </p>
                </div>

                {contactStatus && (
                  <div
                    className={`p-3 rounded-lg text-sm border ${
                      contactStatus.type === 'success'
                        ? 'bg-emerald-50 text-emerald-900 border-emerald-200'
                        : 'bg-red-50 text-red-900 border-red-200'
                    }`}
                  >
                    {contactStatus.text}
                  </div>
                )}

                <form onSubmit={handleContactSubmit} className="space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1">
                        Your Name
                      </label>
                      <input
                        type="text"
                        required
                        value={contactForm.name}
                        onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                        placeholder="e.g. Ramesh Goud"
                        className="w-full px-3 py-2 text-sm rounded-lg border border-emerald-950/15 bg-[#F8FAF9]"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1">
                        Email or Phone
                      </label>
                      <input
                        type="text"
                        required
                        value={contactForm.emailOrPhone}
                        onChange={(e) =>
                          setContactForm({ ...contactForm, emailOrPhone: e.target.value })
                        }
                        placeholder="Phone or email"
                        className="w-full px-3 py-2 text-sm rounded-lg border border-emerald-950/15 bg-[#F8FAF9]"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">
                      Village / Town (Optional)
                    </label>
                    <input
                      type="text"
                      value={contactForm.village}
                      onChange={(e) => setContactForm({ ...contactForm, village: e.target.value })}
                      placeholder="e.g. Yamnampet, Ghatkesar"
                      className="w-full px-3 py-2 text-sm rounded-lg border border-emerald-950/15 bg-[#F8FAF9]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">Message</label>
                    <textarea
                      required
                      rows={3}
                      value={contactForm.message}
                      onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                      placeholder="How can our rural health coordinators assist you?"
                      className="w-full px-3 py-2 text-sm rounded-lg border border-emerald-950/15 bg-[#F8FAF9]"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={submittingContact}
                    className="px-5 py-2.5 text-sm font-semibold text-white bg-emerald-700 hover:bg-emerald-800 disabled:opacity-60 rounded-lg transition-colors cursor-pointer"
                  >
                    {submittingContact ? 'Sending...' : 'Send Inquiry'}
                  </button>
                </form>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
