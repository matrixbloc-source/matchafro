import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  applyDelayToBookings,
  addMinutes,
  formatTimeDisplay,
  currentTimeStr,
} from '../lib/smartTimeEngine.js';
import { supabase, isSupabaseEnabled } from '../lib/supabase.js';
import {
  proFromDB, proToDB,
  bookingFromDB, bookingToDB,
  reviewFromDB, reviewToDB,
  notifToDB,
  dbFetchPros, dbFetchBookings, dbFetchReviews, dbFetchNotifications, dbFetchProDelays,
  dbUpsertPro, dbDeletePro, dbIncrementViews,
  dbInsertBooking, dbCancelBooking, dbUpsertBookings, dbUpdateBooking,
  dbInsertReview,
  dbInsertNotifications, dbMarkNotifRead, dbMarkAllNotifsRead, dbDeleteOldDelayNotifs,
  dbUpsertProDelay, dbLogSmartTimeEvent,
} from '../lib/db.js';
import { uploadPhoto } from '../lib/storage.js';

const AppContext = createContext(null);
const FOUNDER_LIMIT = 50;

/* ─── Helpers ────────────────────────────────────────────────── */
export function slugify(str) {
  return str.toLowerCase()
    .normalize('NFD').replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
}

function uid() { return Math.random().toString(36).slice(2, 11); }
function now() { return new Date().toISOString(); }

/* ─── (données de démonstration supprimées — Supabase est la source) ── */
const _UNUSED = [
  {
    id: 'demo-1', slug: 'amina-kone-paris',
    name: 'Amina Koné', salonName: 'Studio Amina K.',
    phone: '+33 6 12 34 56 78', whatsapp: '+33 6 12 34 56 78',
    instagram: '@aminakone_beaute', email: 'amina@matchafro.fr',
    pays_id: 'FR', region_id: 'IDF', dept_id: '75', ville_id: 'paris', arr_id: 'paris-arr-18',
    city: 'Paris 18e', address: '12 rue du Mont-Cenis, 75018 Paris',
    description: "Spécialiste des tresses africaines depuis 10 ans. Box braids, knotless, cornrows... Je mets en valeur votre beauté naturelle avec des techniques soignées.",
    categories: ['tresses', 'knotless'],
    services: [
      { id: 's1', name: 'Box Braids', duration: 240, price: 80 },
      { id: 's2', name: 'Knotless Braids', duration: 300, price: 120 },
      { id: 's3', name: 'Cornrows simples', duration: 90, price: 40 },
      { id: 's4', name: 'Renouvellement', duration: 120, price: 50 },
    ],
    homeService: true, photos: [],
    gradient: 'linear-gradient(135deg, #F59E0B, #D97706)', initials: 'AK',
    verified: true, founder: true, founderNumber: 1,
    active: true, suspended: false, createdAt: '2024-01-15T10:00:00Z', views: 1247,
    lat: 48.8918, lng: 2.3498,
    availability: { 1:[{start:'09:00',end:'19:00'}], 2:[{start:'09:00',end:'19:00'}], 3:[{start:'09:00',end:'19:00'}], 4:[{start:'09:00',end:'19:00'}], 5:[{start:'09:00',end:'17:00'}], 6:[{start:'10:00',end:'16:00'}] },
    blockedDates: [],
  },
  {
    id: 'demo-2', slug: 'nadia-sow-lyon',
    name: 'Nadia Sow', salonName: '',
    phone: '+33 7 98 76 54 32', whatsapp: '+33 7 98 76 54 32',
    instagram: '@nadia_coiffure_lyon', email: 'nadia@matchafro.fr',
    pays_id: 'FR', region_id: 'ARA', dept_id: '69', ville_id: 'lyon', arr_id: 'lyon-arr-7',
    city: 'Lyon 7e', address: '45 avenue Jean Jaurès, 69007 Lyon',
    description: "Coiffeuse naturelle certifiée, spécialisée dans les locks, vanilles et soins capillaires profonds.",
    categories: ['locks', 'vanilles'],
    services: [
      { id: 's5', name: 'Locks installation', duration: 360, price: 150 },
      { id: 's6', name: 'Entretien locks', duration: 120, price: 60 },
      { id: 's7', name: 'Vanilles', duration: 180, price: 70 },
      { id: 's8', name: 'Soin capillaire profond', duration: 90, price: 45 },
    ],
    homeService: true, photos: [],
    gradient: 'linear-gradient(135deg, #8B5CF6, #6D28D9)', initials: 'NS',
    verified: true, founder: true, founderNumber: 2,
    active: true, suspended: false, createdAt: '2024-01-20T14:00:00Z', views: 834,
    lat: 45.7454, lng: 4.8338,
    availability: { 2:[{start:'10:00',end:'19:00'}], 3:[{start:'10:00',end:'19:00'}], 4:[{start:'10:00',end:'19:00'}], 5:[{start:'10:00',end:'19:00'}], 6:[{start:'09:00',end:'17:00'}] },
    blockedDates: [],
  },
  {
    id: 'demo-3', slug: 'fatou-diallo-marseille',
    name: 'Fatou Diallo', salonName: 'Fatou Beauty Studio',
    phone: '+33 6 55 44 33 22', whatsapp: '+33 6 55 44 33 22',
    instagram: '@fatoubeautystudio', email: 'fatou@matchafro.fr',
    pays_id: 'FR', region_id: 'PAC', dept_id: '13', ville_id: 'marseille', arr_id: 'marseille-arr-6',
    city: 'Marseille 6e', address: '8 rue Paradis, 13006 Marseille',
    description: "Maquilleuse professionnelle spécialisée maquillage afro, mariages et événements.",
    categories: ['maquillage'],
    services: [
      { id: 's9',  name: 'Maquillage mariage', duration: 120, price: 150 },
      { id: 's10', name: 'Maquillage soirée', duration: 60, price: 80 },
      { id: 's11', name: 'Maquillage naturel', duration: 45, price: 55 },
      { id: 's12', name: 'Formation maquillage', duration: 180, price: 120 },
    ],
    homeService: true, photos: [],
    gradient: 'linear-gradient(135deg, #EC4899, #BE185D)', initials: 'FD',
    verified: true, founder: true, founderNumber: 3,
    active: true, suspended: false, createdAt: '2024-02-01T09:00:00Z', views: 2108,
    lat: 43.2921, lng: 5.3745,
    availability: { 1:[{start:'09:00',end:'18:00'}], 2:[{start:'09:00',end:'18:00'}], 4:[{start:'09:00',end:'18:00'}], 5:[{start:'09:00',end:'18:00'}], 6:[{start:'10:00',end:'15:00'}] },
    blockedDates: [],
  },
  {
    id: 'demo-4', slug: 'sarah-mbaye-bordeaux',
    name: 'Sarah Mbaye', salonName: 'Nail Art by Sarah',
    phone: '+33 6 77 88 99 00', whatsapp: '+33 6 77 88 99 00',
    instagram: '@nailartbysarah', email: 'sarah@matchafro.fr',
    pays_id: 'FR', region_id: 'NAQ', dept_id: '33', ville_id: 'bordeaux', arr_id: null,
    city: 'Bordeaux', address: "22 cours de l'Intendance, 33000 Bordeaux",
    description: "Prothésiste ongulaire passionnée depuis 7 ans. Gel, résine, nail art 3D.",
    categories: ['onglerie'],
    services: [
      { id: 's13', name: 'Pose gel complète', duration: 120, price: 55 },
      { id: 's14', name: 'Remplissage gel', duration: 75, price: 40 },
      { id: 's15', name: 'Nail art (dégradé)', duration: 30, price: 20 },
      { id: 's16', name: 'Manucure russe', duration: 90, price: 45 },
    ],
    homeService: false, photos: [],
    gradient: 'linear-gradient(135deg, #10B981, #059669)', initials: 'SM',
    verified: true, founder: false, founderNumber: null,
    active: true, suspended: false, createdAt: '2024-02-15T11:00:00Z', views: 567,
    lat: 44.8378, lng: -0.5792,
    availability: { 2:[{start:'09:00',end:'18:00'}], 3:[{start:'09:00',end:'18:00'}], 4:[{start:'09:00',end:'18:00'}], 5:[{start:'09:00',end:'18:00'}], 6:[{start:'09:00',end:'18:00'}] },
    blockedDates: [],
  },
  {
    id: 'demo-5', slug: 'rokhaya-toure-lille',
    name: 'Rokhaya Touré', salonName: 'Chez Rokhaya',
    phone: '+33 6 23 45 67 89', whatsapp: '+33 6 23 45 67 89',
    instagram: '@rokhayacoiffure', email: 'rokhaya@matchafro.fr',
    pays_id: 'FR', region_id: 'HDF', dept_id: '59', ville_id: 'lille', arr_id: null,
    city: 'Lille', address: '14 rue Faidherbe, 59000 Lille',
    description: "Spécialiste perruques HD et extensions depuis 12 ans.",
    categories: ['perruques', 'tresses'],
    services: [
      { id: 's17', name: 'Installation perruque HD', duration: 120, price: 90 },
      { id: 's18', name: 'Extensions tissage', duration: 180, price: 140 },
      { id: 's19', name: 'Tresses feed-in', duration: 150, price: 85 },
      { id: 's20', name: 'Entretien & retouche', duration: 90, price: 50 },
    ],
    homeService: true, photos: [],
    gradient: 'linear-gradient(135deg, #6366F1, #4338CA)', initials: 'RT',
    verified: true, founder: true, founderNumber: 4,
    active: true, suspended: false, createdAt: '2024-03-01T08:00:00Z', views: 982,
    lat: 50.6292, lng: 3.0573,
    availability: { 1:[{start:'10:00',end:'19:00'}], 3:[{start:'10:00',end:'19:00'}], 4:[{start:'10:00',end:'19:00'}], 5:[{start:'10:00',end:'19:00'}], 6:[{start:'09:00',end:'16:00'}] },
    blockedDates: [],
  },
];

const _DEMO_BOOKINGS = [
  { id: 'b1', proId: 'demo-1', clientName: 'Mariama Traoré', clientPhone: '+33 6 11 22 33 44', clientEmail: 'mariama@email.fr', service: 'Box Braids', serviceId: 's1', date: '2025-07-15', startTime: '09:00', endTime: '13:00', status: 'completed', createdAt: '2025-07-01T10:00:00Z' },
  { id: 'b2', proId: 'demo-1', clientName: 'Sophie K.', clientPhone: '+33 7 55 66 77 88', clientEmail: 'sophie@email.fr', service: 'Knotless Braids', serviceId: 's2', date: '2025-07-18', startTime: '10:00', endTime: '15:00', status: 'confirmed', createdAt: '2025-07-02T14:00:00Z' },
  { id: 'b3', proId: 'demo-2', clientName: 'Aminata D.', clientPhone: '+33 6 99 88 77 66', clientEmail: 'aminata@email.fr', service: 'Locks installation', serviceId: 's5', date: '2025-07-20', startTime: '10:00', endTime: '16:00', status: 'scheduled', createdAt: '2025-07-05T09:00:00Z' },
];

const _DEMO_REVIEWS = [
  { id: 'r1', proId: 'demo-1', author: 'Mariama T.', rating: 5, comment: "Des tresses magnifiques ! Amina est très professionnelle et à l'écoute.", service: 'Box Braids', createdAt: '2025-06-10T10:00:00Z', verified: true },
  { id: 'r2', proId: 'demo-1', author: 'Sophie K.', rating: 5, comment: "Knotless parfaitement réalisés. Très doux, aucune traction.", service: 'Knotless Braids', createdAt: '2025-06-22T14:00:00Z', verified: true },
  { id: 'r3', proId: 'demo-1', author: 'Chidinma O.', rating: 4, comment: "Excellent travail, très soigné. Petite attente au début.", service: 'Cornrows', createdAt: '2025-07-02T09:00:00Z', verified: true },
  { id: 'r4', proId: 'demo-2', author: 'Fatoumata B.', rating: 5, comment: "Nadia est une vraie artiste. Mes locks sont impeccables.", service: 'Locks installation', createdAt: '2025-06-15T11:00:00Z', verified: true },
  { id: 'r5', proId: 'demo-3', author: 'Aicha M.', rating: 5, comment: "Fatou m'a sublimée pour mon mariage ! Merci infiniment !", service: 'Maquillage mariage', createdAt: '2025-05-20T15:00:00Z', verified: true },
  { id: 'r6', proId: 'demo-3', author: 'Bintou K.', rating: 5, comment: "Professionnelle, ponctuelle, talentueuse. Le maquillage a tenu toute la soirée.", service: 'Maquillage soirée', createdAt: '2025-06-28T18:00:00Z', verified: true },
];

/* ─── Provider ───────────────────────────────────────────────── */
export function AppProvider({ children }) {
  const load = (key, fallback) => {
    try { const s = localStorage.getItem(key); return s ? JSON.parse(s) : fallback; }
    catch { return fallback; }
  };

  /* State — Supabase est la seule source de vérité */
  const [pros,          setPros]         = useState([]);
  const [bookings,      setBookings]     = useState([]);
  const [reviews,       setReviews]      = useState([]);
  const [currentProId,  setCurrentProId] = useState(() => load('ma_current_pro', null));
  const [adminAuth,         setAdminAuth]         = useState(false);
  const [notifications,     setNotifications]     = useState(() => load('ma_notifications', []));
  const [adminNotifications, setAdminNotifications] = useState(() => load('ma_admin_notifs', []));
  const [proDelays,     setProDelays]     = useState(() => load('ma_pro_delays', {}));
  const [dbReady,       setDbReady]       = useState(false);
  const [pendingEmail,  setPendingEmail]  = useState(null);
  const [currentClient, setCurrentClient] = useState(() => {
    try { return JSON.parse(localStorage.getItem('ma_client') || 'null'); }
    catch { return null; }
  });

  /* Persist to localStorage on every change */
  useEffect(() => { localStorage.setItem('ma_pros',          JSON.stringify(pros));          }, [pros]);
  useEffect(() => { localStorage.setItem('ma_bookings',      JSON.stringify(bookings));      }, [bookings]);
  useEffect(() => { localStorage.setItem('ma_reviews',       JSON.stringify(reviews));       }, [reviews]);
  useEffect(() => { localStorage.setItem('ma_current_pro',   JSON.stringify(currentProId));  }, [currentProId]);
  useEffect(() => { localStorage.setItem('ma_notifications',  JSON.stringify(notifications));      }, [notifications]);
  useEffect(() => { localStorage.setItem('ma_pro_delays',    JSON.stringify(proDelays));          }, [proDelays]);
  useEffect(() => { localStorage.setItem('ma_client',        JSON.stringify(currentClient));       }, [currentClient]);
  useEffect(() => { localStorage.setItem('ma_admin_notifs',  JSON.stringify(adminNotifications)); }, [adminNotifications]);

  /* ── Supabase hydration — fetch direct, sans migration demo ─── */
  useEffect(() => {
    if (!isSupabaseEnabled || !supabase) { setDbReady(false); return; }

    async function hydrate() {
      try {
        const [prosData, booksData, revData, notifData, delayData] = await Promise.all([
          dbFetchPros(),
          dbFetchBookings(),
          dbFetchReviews(),
          dbFetchNotifications(),
          dbFetchProDelays(),
        ]);

        if (prosData)  setPros(prosData);
        if (booksData) setBookings(booksData);
        if (revData)   setReviews(revData);
        if (notifData) setNotifications(notifData);
        if (delayData) setProDelays(delayData);

        console.log('[db] Hydratation ✓', { pros: prosData?.length, bookings: booksData?.length });
        setDbReady(true);
      } catch (err) {
        console.error('[db] hydration error:', err);
        setDbReady(false);
      }
    }

    hydrate();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  /* ── Supabase Realtime — synchronisation temps réel ────────── */
  useEffect(() => {
    if (!isSupabaseEnabled || !supabase) return;

    const channel = supabase
      .channel('realtime-matchafro')
      /* Professionals */
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'professionals' },
        ({ new: r }) => setPros(prev => prev.some(p => p.id === r.id) ? prev : [...prev, proFromDB(r)])
      )
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'professionals' },
        ({ new: r }) => setPros(prev => prev.map(p => p.id === r.id ? proFromDB(r) : p))
      )
      .on('postgres_changes', { event: 'DELETE', schema: 'public', table: 'professionals' },
        ({ old: r }) => setPros(prev => prev.filter(p => p.id !== r.id))
      )
      /* Bookings */
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'bookings' },
        ({ new: r }) => setBookings(prev => prev.some(b => b.id === r.id) ? prev : [...prev, bookingFromDB(r)])
      )
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'bookings' },
        ({ new: r }) => setBookings(prev => prev.map(b => b.id === r.id ? bookingFromDB(r) : b))
      )
      /* Reviews */
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'reviews' },
        ({ new: r }) => setReviews(prev => prev.some(rv => rv.id === r.id) ? prev : [...prev, reviewFromDB(r)])
      )
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'reviews' },
        ({ new: r }) => setReviews(prev => prev.map(rv => rv.id === r.id ? reviewFromDB(r) : rv))
      )
      .subscribe(status => {
        if (status === 'SUBSCRIBED') console.log('[realtime] connecté ✓');
      });

    return () => supabase.removeChannel(channel);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  /* ── Supabase Auth — écoute la session ─────────────────────── */
  useEffect(() => {
    if (!isSupabaseEnabled || !supabase) return;

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user?.email) {
        setPendingEmail(session.user.email.toLowerCase());
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'PASSWORD_RECOVERY') return; // géré par ResetPasswordPage
      if ((event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') && session?.user?.email) {
        setPendingEmail(session.user.email.toLowerCase());
      } else if (event === 'SIGNED_OUT') {
        setCurrentProId(null);
        setCurrentClient(null);
        setPendingEmail(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  /* ── Résoudre l'email Auth : pro ou client ── */
  useEffect(() => {
    if (!pendingEmail || !pros.length) return;
    const email = pendingEmail;
    const found = pros.find(p => (p.email || '').toLowerCase() === email);
    if (found) {
      setCurrentProId(found.id);
      setCurrentClient(null);
    } else {
      const saved = JSON.parse(localStorage.getItem(`ma_client_${email}`) || '{}');
      setCurrentClient({ email, name: saved.name || '', phone: saved.phone || '' });
      setCurrentProId(null);
    }
    setPendingEmail(null);
  }, [pendingEmail, pros]); // eslint-disable-line react-hooks/exhaustive-deps

  /* ── Helper fire-and-forget ─────────────────────────────────── */
  function sync(fn) { fn().catch(e => console.error('[db]', e)); }

  /* ── Derived state ──────────────────────────────────────────── */
  const currentPro        = pros.find(p => p.id === currentProId) ?? null;
  const founderCount      = pros.filter(p => p.founder && !p.suspended).length;
  const founderSlotsLeft  = Math.max(0, FOUNDER_LIMIT - founderCount);

  /* ── Professional CRUD ── */
  function registerPro(data, overrideId = null) {
    const id       = overrideId || ('pro_' + uid());
    const baseSlug = slugify(`${data.name} ${data.city || 'france'}`);
    const existing = pros.filter(p => p.slug.startsWith(baseSlug));
    const slug     = existing.length > 0 ? `${baseSlug}-${existing.length + 1}` : baseSlug;
    const isFounder = founderCount < FOUNDER_LIMIT;

    const pro = {
      id, slug, ...data,
      gradient:      randomGradient(),
      initials:      data.name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2),
      verified:      false,
      founder:       isFounder,
      founderNumber: isFounder ? founderCount + 1 : null,
      active:        true, suspended: false,
      createdAt:     now(), views: 0,
      lat: null, lng: null,
      availability:  { 1:[{start:'09:00',end:'19:00'}], 2:[{start:'09:00',end:'19:00'}], 3:[{start:'09:00',end:'19:00'}], 4:[{start:'09:00',end:'19:00'}], 5:[{start:'09:00',end:'19:00'}] },
      blockedDates: [],
    };
    setPros(prev => [...prev, pro]);
    setCurrentProId(id);
    sync(() => dbUpsertPro(pro));
    setAdminNotifications(prev => [{
      id: 'an_' + uid(), type: 'new_pro', proId: id,
      proName: data.name, city: data.city || '', founder: isFounder,
      createdAt: now(), read: false,
    }, ...prev]);
    return pro;
  }

  function updatePro(id, updates) {
    const existing = pros.find(p => p.id === id);
    if (!existing) return;
    const merged = { ...existing, ...updates };
    setPros(prev => prev.map(p => p.id === id ? merged : p));
    sync(() => dbUpsertPro(merged));
  }

  function deletePro(id) {
    setPros(prev => prev.filter(p => p.id !== id));
    if (currentProId === id) setCurrentProId(null);
    sync(() => dbDeletePro(id));
  }

  function verifyPro(id)      { updatePro(id, { verified: true }); }
  function suspendPro(id)     { updatePro(id, { suspended: true, active: false }); }
  function reactivatePro(id)  { updatePro(id, { suspended: false, active: true }); }
  function grantFounder(id) {
    if (founderCount >= FOUNDER_LIMIT) return false;
    updatePro(id, { founder: true, founderNumber: founderCount + 1 });
    return true;
  }

  function incrementViews(proId) {
    setPros(prev => prev.map(p => p.id === proId ? { ...p, views: (p.views || 0) + 1 } : p));
    sync(() => dbIncrementViews(proId));
  }

  /* ── Lookups ── */
  const getProBySlug = useCallback(slug => pros.find(p => p.slug === slug) ?? null, [pros]);
  const getProById   = useCallback(id   => pros.find(p => p.id === id)     ?? null, [pros]);

  /* ── Bookings ── */
  function book(booking) {
    const b = { id: 'b_' + uid(), ...booking, status: 'confirmed', createdAt: now() };
    setBookings(prev => [...prev, b]);
    sync(() => dbInsertBooking(b));

    const targetPro = pros.find(p => p.id === booking.proId);
    const proName   = targetPro?.name || '';

    /* Notification admin */
    setAdminNotifications(prev => [{
      id: 'an_' + uid(), type: 'new_booking', bookingId: b.id,
      proId: booking.proId, proName,
      clientName: booking.clientName, service: booking.service, date: booking.date,
      createdAt: now(), read: false,
    }, ...prev]);

    /* Notification in-app pour le professionnel */
    const proNotif = {
      id:          'n_' + uid(),
      type:        'new_booking',
      proId:       booking.proId,
      bookingId:   b.id,
      date:        booking.date,
      clientName:  booking.clientName,
      message:     `Nouvelle réservation : ${booking.service} le ${booking.date} à ${booking.startTime}`,
      read:        false,
    };
    setNotifications(prev => [proNotif, ...prev]);
    sync(() => dbInsertNotifications([proNotif]));

    /* Email + SMS via Edge Function Supabase (fire-and-forget) */
    if (isSupabaseEnabled && supabase && targetPro) {
      supabase.functions
        .invoke('send-notification', { body: { type: 'new_booking', booking: b, pro: targetPro } })
        .catch(e => console.warn('[notify] Edge Function:', e.message));
    }

    return b;
  }

  function cancelBooking(id) {
    setBookings(prev => prev.map(b => b.id === id ? { ...b, status: 'cancelled' } : b));
    sync(() => dbCancelBooking(id));
  }

  function isSlotTaken(proId, date, startTime) {
    return bookings.some(b =>
      b.proId === proId && b.date === date && b.startTime === startTime && b.status !== 'cancelled'
    );
  }

  const getProBookings = useCallback(proId => bookings.filter(b => b.proId === proId), [bookings]);

  /* ── Reviews ── */
  function addReview(r) {
    const rev = { id: 'r_' + uid(), ...r, createdAt: now(), verified: false };
    setReviews(prev => [...prev, rev]);
    sync(() => dbInsertReview(rev));
    return rev;
  }

  const getProReviews = useCallback(proId => reviews.filter(r => r.proId === proId), [reviews]);

  function avgRating(proId) {
    const rv = getProReviews(proId);
    if (!rv.length) return 0;
    return rv.reduce((s, r) => s + r.rating, 0) / rv.length;
  }

  /* ── Admin ── */
  function loginAdmin(pwd) {
    if (pwd === (import.meta.env.VITE_ADMIN_PWD ?? 'matchafro2025')) {
      setAdminAuth(true); return true;
    }
    return false;
  }

  /* ── Auth pro : connexion par email ou téléphone ── */
  function loginPro(emailOrPhone) {
    function norm(s) { return (s || '').replace(/[\s\-\.\(\)]/g, '').toLowerCase(); }
    const val     = emailOrPhone.trim().toLowerCase();
    const normVal = norm(val);
    const found   = pros.find(p =>
      (p.email    || '').toLowerCase()  === val     ||
      norm(p.phone)                     === normVal ||
      norm(p.whatsapp)                  === normVal
    );
    if (found) {
      setCurrentProId(found.id);
      setCurrentClient(null);
      return { pro: found, error: null };
    }
    return {
      pro: null,
      error: 'Aucun professionnel trouvé avec cet email ou téléphone. Vérifiez vos informations ou créez un profil.',
    };
  }

  /* ── Auth pro : déconnexion ── */
  function logoutPro() {
    setCurrentProId(null);
    if (isSupabaseEnabled && supabase) supabase.auth.signOut();
  }

  /* ── Auth client : connexion (dev fallback sans Supabase) ── */
  function loginClient(email) {
    const e = email.trim().toLowerCase();
    const saved = JSON.parse(localStorage.getItem(`ma_client_${e}`) || '{}');
    setCurrentClient({ email: e, name: saved.name || '', phone: saved.phone || '' });
    setCurrentProId(null);
    return { email: e };
  }

  /* ── Auth client : déconnexion ── */
  function logoutClient() {
    setCurrentClient(null);
    if (isSupabaseEnabled && supabase) supabase.auth.signOut();
  }

  /* ── Auth client : mise à jour du profil ── */
  function updateClientProfile({ name, phone }) {
    setCurrentClient(prev => {
      if (!prev) return prev;
      const next = { ...prev, name: name ?? prev.name, phone: phone ?? prev.phone };
      localStorage.setItem(`ma_client_${prev.email}`, JSON.stringify({ name: next.name, phone: next.phone }));
      return next;
    });
  }

  /* ── Smart Time™ ── */

  function updateBookingStatus(bookingId, status, extra = {}) {
    setBookings(prev => prev.map(b => b.id === bookingId ? { ...b, status, ...extra } : b));
    sync(() => dbUpdateBooking(bookingId, { status, ...extra }));
  }

  /* ── Phase 2 : Fin de prestation avec photo ── */
  async function completeBookingWithPhoto(bookingId, photoFile) {
    const booking = bookings.find(b => b.id === bookingId);
    if (!booking) return { error: 'Réservation introuvable' };

    let photoUrl = null;
    if (photoFile) {
      const fileId = 'completion_' + bookingId;
      const result = await uploadPhoto(booking.proId, fileId, photoFile);
      if (result.error) return { error: result.error };
      photoUrl = result.url || URL.createObjectURL(photoFile);
    }

    const extra = { completionPhotoUrl: photoUrl };
    setBookings(prev => prev.map(b =>
      b.id === bookingId ? { ...b, status: 'completed', ...extra } : b
    ));
    sync(() => dbUpdateBooking(bookingId, { status: 'completed', ...extra }));

    if (photoUrl) {
      const pro = pros.find(p => p.id === booking.proId);
      if (pro) {
        const updatedPhotos = [photoUrl, ...(pro.photos || []).filter(Boolean)].slice(0, 20);
        updatePro(booking.proId, { photos: updatedPhotos });
      }
    }

    localStorage.setItem('ma_completed_booking_' + booking.proId, bookingId);
    return { error: null, photoUrl };
  }

  /* ── Phase 2 : Validation client après prestation ── */
  function submitClientValidation(bookingId, thumbsUp, comment) {
    const booking = bookings.find(b => b.id === bookingId);
    if (!booking) return;

    const validatedAt = now();
    const extra = {
      clientValidated:     true,
      clientValidatedAt:   validatedAt,
      clientThumbsUp:      thumbsUp,
      clientReviewComment: comment || null,
    };

    setBookings(prev => prev.map(b =>
      b.id === bookingId ? { ...b, ...extra } : b
    ));
    sync(() => dbUpdateBooking(bookingId, extra));

    const rev = {
      id:        'r_' + uid(),
      proId:     booking.proId,
      author:    booking.clientName,
      rating:    thumbsUp ? 5 : 2,
      comment:   comment || (thumbsUp ? '👍 Prestation validée par le client.' : '👎 Signalement client.'),
      service:   booking.service,
      verified:  true,
      bookingId,
      thumbsUp,
      createdAt: validatedAt,
    };
    setReviews(prev => [...prev, rev]);
    sync(() => dbInsertReview(rev));

    localStorage.removeItem('ma_completed_booking_' + booking.proId);
  }

  /* ── Phase 2 : Statistiques ponctualité (utilisées dans le profil public) ── */
  function getPunctualityStats(proId) {
    const proBookings = bookings.filter(b => b.proId === proId);
    const completed = proBookings.filter(b => b.status === 'completed');
    const total = completed.length;

    if (total === 0) return { onTimePercent: 100, avgDelayMin: 0, totalDone: 0, cancelledThisMonth: 0 };

    const lateOnes = completed.filter(b => (b.delayMinutes || 0) > 0);
    const onTimePercent = Math.round(((total - lateOnes.length) / total) * 100);
    const avgDelayMin = lateOnes.length > 0
      ? Math.round(lateOnes.reduce((s, b) => s + (b.delayMinutes || 0), 0) / lateOnes.length)
      : 0;

    const d = new Date();
    const thisMonthStart = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-01`;
    const cancelledThisMonth = proBookings.filter(b =>
      b.status === 'cancelled' && b.date >= thisMonthStart
    ).length;

    return { onTimePercent, avgDelayMin, totalDone: total, cancelledThisMonth };
  }

  /* ── Phase 2 : Activité du jour (données publiques, sans noms clients) ── */
  function getDayActivity(proId) {
    const todayStr = new Date().toISOString().slice(0, 10);
    const nowStr   = new Date().toTimeString().slice(0, 5);
    return bookings
      .filter(b => b.proId === proId && b.date === todayStr && b.status !== 'cancelled')
      .sort((a, b) => a.startTime.localeCompare(b.startTime))
      .map(b => {
        let phase;
        if (b.status === 'completed') phase = 'done';
        else if (b.startTime <= nowStr && b.endTime > nowStr) phase = 'active';
        else if (b.startTime > nowStr) phase = 'upcoming';
        else phase = 'done';
        return { id: b.id, time: b.startTime, service: b.service, status: b.status, phase, delayMinutes: b.delayMinutes || 0 };
      });
  }

  function applyProDelay(proId, delayMinutes) {
    const todayStr = new Date().toISOString().slice(0, 10);
    const refTime  = currentTimeStr();

    // Compute new bookings state (using current snapshot — acceptable for single-user)
    const updatedBookings = applyDelayToBookings(bookings, proId, todayStr, refTime, delayMinutes);
    setBookings(updatedBookings);

    const proBookings = updatedBookings.filter(b => b.proId === proId);
    sync(() => dbUpsertBookings(proBookings));

    if (delayMinutes > 0) {
      const affected = updatedBookings.filter(b =>
        b.proId === proId && b.date === todayStr &&
        b.status === 'late' && b.status !== 'cancelled'
      );
      if (affected.length > 0) {
        const newNotifs = affected.map(b => ({
          id:           'notif_' + uid(),
          type:         'delay',
          proId,
          bookingId:    b.id,
          date:         todayStr,
          clientName:   b.clientName,
          originalTime: formatTimeDisplay(b.estimatedStartTime ?? b.startTime),
          newTime:      formatTimeDisplay(b.startTime),
          delayMinutes,
          message:      `Votre RDV prévu à ${formatTimeDisplay(b.estimatedStartTime ?? b.startTime)} a été décalé à ${formatTimeDisplay(b.startTime)}.`,
          createdAt:    now(),
          read:         false,
        }));
        setNotifications(prev => {
          const withoutOld = prev.filter(n =>
            !(n.proId === proId && n.type === 'delay' && n.date === todayStr)
          );
          return [...withoutOld, ...newNotifs];
        });
        sync(() => dbDeleteOldDelayNotifs(proId, todayStr).then(() => dbInsertNotifications(newNotifs)));
      }
      sync(() => dbLogSmartTimeEvent(proId, 'delay_applied', delayMinutes, affected?.map(b => b.id) ?? [], todayStr, refTime));
    } else {
      setNotifications(prev => prev.filter(n =>
        !(n.proId === proId && n.type === 'delay' && n.date === todayStr)
      ));
      sync(() => dbDeleteOldDelayNotifs(proId, todayStr));
      sync(() => dbLogSmartTimeEvent(proId, 'delay_reset', 0, [], todayStr, refTime));
    }

    setProDelays(prev => ({ ...prev, [proId]: delayMinutes }));
    sync(() => dbUpsertProDelay(proId, delayMinutes));
  }

  function markClientLate(bookingId, lateMinutes) {
    const booking = bookings.find(b => b.id === bookingId);
    if (!booking) return;

    const estimatedArrival = addMinutes(currentTimeStr(), lateMinutes);
    const extra = {
      status: 'client_late',
      clientLateMinutes: lateMinutes,
      estimatedClientArrival: estimatedArrival,
    };
    const newNotif = {
      id:               'notif_' + uid(),
      type:             'client_late',
      proId:            booking.proId,
      bookingId,
      date:             booking.date,
      clientName:       booking.clientName,
      lateMinutes,
      estimatedArrival,
      message:          `⚠️ ${booking.clientName} sera en retard de ${lateMinutes} min. Arrivée estimée : ${formatTimeDisplay(estimatedArrival)}.`,
      createdAt:        now(),
      read:             false,
    };

    setBookings(prev => prev.map(b => b.id === bookingId ? { ...b, ...extra } : b));
    setNotifications(prev => [...prev, newNotif]);

    sync(() => dbUpdateBooking(bookingId, extra));
    sync(() => dbInsertNotifications([newNotif]));
  }

  function clearNotification(notifId) {
    setNotifications(prev => prev.map(n => n.id === notifId ? { ...n, read: true } : n));
    sync(() => dbMarkNotifRead(notifId));
  }

  function clearAllNotifications(proId) {
    setNotifications(prev => prev.map(n => n.proId === proId ? { ...n, read: true } : n));
    sync(() => dbMarkAllNotifsRead(proId));
  }

  const getProNotifications = useCallback(
    proId => notifications.filter(n => n.proId === proId && !n.read),
    [notifications]
  );

  const value = {
    pros, bookings, reviews,
    currentPro,
    currentClient,
    setCurrentPro:   setCurrentProId,
    isAdmin:         adminAuth, loginAdmin,
    loginPro, logoutPro,
    loginClient, logoutClient, updateClientProfile,
    founderCount, founderSlotsLeft, founderLimit: FOUNDER_LIMIT,
    dbReady, isSupabaseEnabled,
    registerPro, updatePro, deletePro,
    verifyPro, suspendPro, reactivatePro, grantFounder,
    incrementViews,
    getProBySlug, getProById,
    book, cancelBooking, isSlotTaken, getProBookings,
    addReview, getProReviews, avgRating,
    // Smart Time™
    notifications, proDelays,
    updateBookingStatus,
    applyProDelay,
    markClientLate,
    clearNotification, clearAllNotifications,
    getProNotifications,
    // Phase 2
    completeBookingWithPhoto,
    submitClientValidation,
    getPunctualityStats,
    getDayActivity,
    // Admin notifications
    adminNotifications,
    clearAdminNotif:     (id) => setAdminNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n)),
    clearAllAdminNotifs: ()   => setAdminNotifications(prev => prev.map(n => ({ ...n, read: true }))),
    unreadAdminCount:    adminNotifications.filter(n => !n.read).length,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp hors de AppProvider');
  return ctx;
}

/* ─── Helpers internes ────────────────────────────────────────── */
const GRADIENTS = [
  'linear-gradient(135deg,#F59E0B,#D97706)',
  'linear-gradient(135deg,#8B5CF6,#6D28D9)',
  'linear-gradient(135deg,#EC4899,#BE185D)',
  'linear-gradient(135deg,#10B981,#059669)',
  'linear-gradient(135deg,#6366F1,#4338CA)',
  'linear-gradient(135deg,#EF4444,#B91C1C)',
  'linear-gradient(135deg,#06B6D4,#0891B2)',
  'linear-gradient(135deg,#D97706,#92400E)',
];
function randomGradient() { return GRADIENTS[Math.floor(Math.random() * GRADIENTS.length)]; }
