import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, X } from 'lucide-react';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';
import { SafeImage } from '../components/SafeImage';
import { useLanguage } from '../context/LanguageContext';
import { api, getApiErrorMessage } from '../services/api';

export function DoctorDiscoveryPage() {
  const { t } = useLanguage();
  const [doctors, setDoctors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [search, setSearch] = useState('');
  const [specialization, setSpecialization] = useState('all');
  const [language, setLanguage] = useState('all');
  const [day, setDay] = useState('all');
  const [maxFee, setMaxFee] = useState('');
  const [sort, setSort] = useState('fee_asc');
  const [previewDoc, setPreviewDoc] = useState<any>(null);

  const fetchDoctors = async () => {
    setLoading(true);
    setError('');
    try {
      const params: Record<string, string> = { sort };
      if (search.trim()) params.search = search.trim();
      if (specialization !== 'all') params.specialization = specialization;
      if (language !== 'all') params.language = language;
      if (day !== 'all') params.day = day;
      if (maxFee.trim()) params.maxFee = maxFee.trim();

      const res = await api.get('/doctors', { params });
      setDoctors(res.data.doctors || []);
    } catch (err) {
      setError(getApiErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchDoctors();
    }, 200);
    return () => clearTimeout(timer);
  }, [search, specialization, language, day, maxFee, sort]);

  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAF9]">
      <Navbar />
      <main className="flex-1 max-w-[1200px] w-full mx-auto px-4 sm:px-6 py-10 space-y-8">
        <div className="space-y-2">
          <h1 className="text-3xl font-display font-bold text-slate-950">{t.discovery.title}</h1>
          <p className="text-sm text-slate-600 max-w-2xl">{t.sections.doctorsNote}</p>
        </div>

        {/* Search & Filter Controls */}
        <div className="bg-white border border-emerald-950/10 rounded-xl p-4 sm:p-5 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
            <div className="md:col-span-4 relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={t.discovery.searchPlaceholder}
                className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-emerald-950/15 bg-[#F8FAF9]"
              />
            </div>

            <select
              value={specialization}
              onChange={(e) => setSpecialization(e.target.value)}
              className="md:col-span-2 px-3 py-2 text-sm rounded-lg border border-emerald-950/15 bg-[#F8FAF9]"
            >
              <option value="all">{t.discovery.allSpecializations}</option>
              <option value="General Physician">General Physician</option>
              <option value="Pediatrician">Pediatrician</option>
              <option value="Gynecologist">Gynecologist</option>
              <option value="Preventive Care">Preventive Care</option>
            </select>

            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="md:col-span-2 px-3 py-2 text-sm rounded-lg border border-emerald-950/15 bg-[#F8FAF9]"
            >
              <option value="all">{t.discovery.allLanguages}</option>
              <option value="english">English</option>
              <option value="telugu">Telugu</option>
              <option value="hindi">Hindi</option>
            </select>

            <select
              value={day}
              onChange={(e) => setDay(e.target.value)}
              className="md:col-span-2 px-3 py-2 text-sm rounded-lg border border-emerald-950/15 bg-[#F8FAF9]"
            >
              <option value="all">{t.discovery.anyDay}</option>
              {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map(
                (d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                )
              )}
            </select>

            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="md:col-span-2 px-3 py-2 text-sm rounded-lg border border-emerald-950/15 bg-[#F8FAF9]"
            >
              <option value="fee_asc">{t.discovery.sortFeeLow}</option>
              <option value="fee_desc">{t.discovery.sortFeeHigh}</option>
              <option value="experience_desc">{t.discovery.sortExp}</option>
            </select>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
            <div className="flex items-center gap-2 text-xs text-slate-600">
              <label htmlFor="maxFee">{t.discovery.maxFeeLabel}:</label>
              <input
                id="maxFee"
                type="number"
                value={maxFee}
                onChange={(e) => setMaxFee(e.target.value)}
                placeholder="e.g. 150"
                className="w-24 px-2.5 py-1.5 text-xs rounded-md border border-emerald-950/15 bg-[#F8FAF9]"
              />
            </div>

            <div className="flex items-center gap-3">
              <span className="text-xs text-slate-500 font-mono tabular-nums">
                {doctors.length} {doctors.length === 1 ? 'doctor' : 'doctors'}
              </span>
              <button
                type="button"
                onClick={() => {
                  setSearch('');
                  setSpecialization('all');
                  setLanguage('all');
                  setDay('all');
                  setMaxFee('');
                  setSort('fee_asc');
                }}
                className="px-3 py-1.5 text-xs font-medium text-slate-600 hover:text-slate-900 border border-emerald-950/10 rounded-lg cursor-pointer"
              >
                {t.discovery.reset}
              </button>
            </div>
          </div>
        </div>

        {error && (
          <div className="p-4 rounded-lg bg-red-50 border border-red-200 text-sm text-red-800 flex items-center justify-between">
            <span>{error}</span>
            <button
              type="button"
              onClick={fetchDoctors}
              className="text-xs font-semibold underline cursor-pointer"
            >
              Retry
            </button>
          </div>
        )}

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-64 rounded-xl bg-white border border-emerald-950/10 animate-pulse"
              />
            ))}
          </div>
        ) : doctors.length === 0 ? (
          <div className="bg-white border border-emerald-950/10 rounded-xl p-10 text-center space-y-3">
            <p className="text-sm text-slate-600">{t.common.noData}</p>
            <button
              type="button"
              onClick={() => {
                setSearch('');
                setSpecialization('all');
                setLanguage('all');
                setDay('all');
                setMaxFee('');
              }}
              className="px-4 py-2 text-xs font-semibold text-emerald-800 border border-emerald-700/20 rounded-lg cursor-pointer"
            >
              {t.discovery.reset}
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {doctors.map((doc) => (
              <article
                key={doc.id}
                className="bg-white border border-emerald-950/10 rounded-xl overflow-hidden flex flex-col justify-between"
              >
                <div className="p-5 space-y-4">
                  <div className="flex items-start gap-4">
                    <SafeImage
                      src={doc.avatar_url}
                      alt={doc.full_name}
                      className="w-16 h-16 rounded-lg object-cover border border-emerald-950/10 shrink-0"
                    />
                    <div className="min-w-0">
                      <h2 className="text-base font-semibold text-slate-900 truncate">
                        {doc.full_name}
                      </h2>
                      <p className="text-xs text-slate-600 truncate">{doc.qualification}</p>
                      <div className="text-xs text-emerald-800 mt-1">
                        <span>{doc.specialization}</span>
                        <span className="mx-1.5" aria-hidden="true">
                          ·
                        </span>
                        <span className="tabular-nums">{doc.experience_years} yrs</span>
                      </div>
                    </div>
                  </div>

                  <p className="text-sm text-slate-600 line-clamp-3">{doc.bio}</p>

                  <div className="space-y-1 text-xs text-slate-500">
                    <div>Languages: {doc.languages_spoken}</div>
                    <div>
                      Status:{' '}
                      <span className="text-emerald-800 font-medium">
                        {doc.verification_status === 'verified'
                          ? doc.is_sample
                            ? 'Verified Sample Profile'
                            : 'Admin Verified'
                          : 'Pending Verification'}
                      </span>
                    </div>
                    <div>
                      Available:{' '}
                      {(doc.availability || []).map((a: any) => a.day_of_week.slice(0, 3)).join(' · ') ||
                        'By schedule'}
                    </div>
                  </div>
                </div>

                <div className="px-5 py-3.5 bg-[#F8FAF9] border-t border-emerald-950/10 flex items-center justify-between gap-2">
                  <div>
                    <span className="text-base font-bold text-slate-900 font-mono tabular-nums">
                      ₹{doc.consultation_fee}
                    </span>
                    <span className="text-xs text-slate-500 ml-1">{t.common.feePerSession}</span>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => setPreviewDoc(doc)}
                      className="px-3 py-2 text-xs font-medium text-slate-700 bg-white border border-emerald-950/15 hover:border-emerald-700 rounded-lg cursor-pointer"
                    >
                      {t.discovery.quickView}
                    </button>
                    <Link
                      to={`/doctors/${doc.id}`}
                      className="px-3.5 py-2 text-xs font-semibold text-white bg-emerald-700 hover:bg-emerald-800 rounded-lg whitespace-nowrap shrink-0"
                    >
                      {t.discovery.viewAndBook}
                    </Link>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </main>

      {/* Quick Doctor Profile Modal */}
      {previewDoc && (
        <div className="fixed inset-0 z-50 bg-slate-950/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl border border-emerald-950/10 max-w-lg w-full p-6 space-y-4">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-3.5">
                <SafeImage
                  src={previewDoc.avatar_url}
                  alt={previewDoc.full_name}
                  className="w-16 h-16 rounded-lg object-cover border border-emerald-950/10 shrink-0"
                />
                <div>
                  <h2 className="text-lg font-display font-bold text-slate-950">
                    {previewDoc.full_name}
                  </h2>
                  <p className="text-xs text-slate-600">{previewDoc.qualification}</p>
                  <p className="text-xs font-medium text-emerald-800 mt-0.5">
                    {previewDoc.specialization} · {previewDoc.experience_years} yrs experience
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setPreviewDoc(null)}
                className="p-2 rounded-lg text-slate-500 hover:bg-slate-100 cursor-pointer"
                aria-label="Close modal"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-sm text-slate-700 leading-relaxed">{previewDoc.bio}</p>

            <div className="p-3.5 rounded-lg bg-[#F8FAF9] border border-emerald-950/10 text-xs space-y-1.5 text-slate-700">
              <div>
                <strong>Clinic Desk:</strong> {previewDoc.clinic_location || 'Telemedicine'}
              </div>
              <div>
                <strong>Languages Spoken:</strong> {previewDoc.languages_spoken}
              </div>
              <div>
                <strong>Consultation Fee:</strong>{' '}
                <span className="font-mono font-bold">₹{previewDoc.consultation_fee}</span>
              </div>
              <div>
                <strong>Weekly Hours:</strong>{' '}
                {(previewDoc.availability || [])
                  .map((a: any) => `${a.day_of_week.slice(0, 3)} (${a.start_time}-${a.end_time})`)
                  .join(', ') || 'See booking page'}
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setPreviewDoc(null)}
                className="px-4 py-2 text-xs font-medium text-slate-700 border border-emerald-950/15 rounded-lg cursor-pointer"
              >
                {t.common.close}
              </button>
              <Link
                to={`/doctors/${previewDoc.id}`}
                className="px-4 py-2 text-xs font-semibold text-white bg-emerald-700 hover:bg-emerald-800 rounded-lg"
              >
                {t.dashboards.bookSlot}
              </Link>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
