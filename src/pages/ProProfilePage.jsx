import { useEffect, useMemo, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '../context/AppContext.jsx';
import BookingCalendar from '../components/BookingCalendar.jsx';
import SmartTimeBadge from '../components/smarttime/SmartTimeBadge.jsx';
import ReliabilityScore from '../components/smarttime/ReliabilityScore.jsx';
import ClientValidationBanner from '../components/ClientValidationBanner.jsx';

const FALLBACK_PHOTOS = [
  '/profile-fallbacks/hero-salon.png',
  '/profile-fallbacks/braids-detail.png',
  '/profile-fallbacks/salon-station.png',
  '/profile-fallbacks/curl-finish.png',
];

const CATEGORY_LABELS = {
  tresses: 'Tresses',
  knotless: 'Knotless',
  vanilles: 'Vanilles',
  locks: 'Locks',
  perruques: 'Perruques',
  barber: 'Barber',
  maquillage: 'Maquillage',
  onglerie: 'Onglerie',
};

const EASE = [0.22, 1, 0.36, 1];
const STAR = '★';

const reveal = {
  hidden: { opacity: 0, y: 26 },
  show: { opacity: 1, y: 0, transition: { duration: 0.58, ease: EASE } },
};

function Stars({ rating, size = 15 }) {
  return (
    <span className="profileStars" style={{ fontSize: size }}>
      {[1, 2, 3, 4, 5].map(i => (
        <span key={i} style={{ color: i <= Math.round(rating) ? '#F5B041' : 'rgba(255,255,255,0.35)' }}>{STAR}</span>
      ))}
    </span>
  );
}

function InlineStars({ rating }) {
  return (
    <span className="inlineStars">
      {[1, 2, 3, 4, 5].map(i => (
        <span key={i} style={{ color: i <= Math.round(rating) ? '#C9863A' : '#E5E7EB' }}>{STAR}</span>
      ))}
    </span>
  );
}

function Badge({ children, tone = 'gold' }) {
  return <span className={`profileBadge profileBadge--${tone}`}>{children}</span>;
}

function formatDuration(minutes) {
  if (!minutes) return 'Durée sur demande';
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  return `${hours}h${rest ? String(rest).padStart(2, '0') : ''}`;
}

function getWhatsappHref(phone) {
  const digits = (phone || '').replace(/\D/g, '');
  return digits ? `https://wa.me/${digits}` : null;
}

function getAvailabilityLabel(pro) {
  const openDays = Object.keys(pro.availability || {}).length;
  if (openDays >= 5) return 'Disponible cette semaine';
  if (openDays > 0) return `${openDays} jours ouverts`;
  return 'Sur demande';
}

function getPhotoSet(pro) {
  const uploaded = (pro.photos || []).filter(Boolean);
  if (uploaded.length >= 3) return uploaded;
  return [...uploaded, ...FALLBACK_PHOTOS].slice(0, 9);
}

function getCategoryText(pro) {
  return (pro.categories || [])
    .map(category => CATEGORY_LABELS[category] || category)
    .slice(0, 3)
    .join(' · ');
}

function Section({ id, eyebrow, title, children, className = '' }) {
  return (
    <motion.section
      id={id}
      className={`profileSection ${className}`}
      variants={reveal}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: '-80px' }}
    >
      {eyebrow && <p className="profileEyebrow">{eyebrow}</p>}
      <h2>{title}</h2>
      {children}
    </motion.section>
  );
}

/* ─── Activité du jour (public, sans noms clients) ──────────────── */
function DayActivitySection({ proId, getDayActivity }) {
  const slots = getDayActivity(proId);
  if (slots.length === 0) return null;

  const phaseIcon  = { done: '✓', active: '🔥', upcoming: '⏳' };
  const phaseLabel = { done: 'Terminé', active: 'En cours', upcoming: 'À venir' };
  const phaseColor = { done: '#059669', active: '#D97706', upcoming: '#6B7280' };
  const phaseBg    = { done: '#ECFDF5', active: '#FFFBEB', upcoming: '#F9FAFB' };
  const phaseBorder = { done: '#6EE7B7', active: '#FDE68A', upcoming: '#E5E7EB' };

  const activeCount   = slots.filter(s => s.phase === 'active').length;
  const upcomingCount = slots.filter(s => s.phase === 'upcoming').length;
  const doneCount     = slots.filter(s => s.phase === 'done').length;

  return (
    <motion.div
      variants={{ hidden: { opacity: 0, y: 22 }, show: { opacity: 1, y: 0, transition: { duration: 0.52, ease: [0.22,1,0.36,1] } } }}
      initial="hidden" whileInView="show" viewport={{ once: true, margin: '-60px' }}
      style={{ background: '#fff', border: '1px solid #E8D7C2', borderRadius: 16, overflow: 'hidden', marginBottom: 28 }}
    >
      {/* Header */}
      <div style={{ background: '#0B0B0C', padding: '16px 22px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
        <div>
          <p style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.14em', color: 'rgba(255,255,255,0.45)', margin: '0 0 2px', fontFamily: 'Inter, sans-serif' }}>
            Aujourd'hui
          </p>
          <p style={{ fontSize: 15, fontWeight: 800, color: '#fff', margin: 0, fontFamily: 'Inter, sans-serif' }}>
            Activité en direct
          </p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          {activeCount > 0 && (
            <span style={{ fontSize: 11, fontWeight: 700, background: 'rgba(217,119,6,0.18)', color: '#FDE68A', border: '1px solid rgba(217,119,6,0.3)', borderRadius: 20, padding: '3px 10px', fontFamily: 'Inter, sans-serif' }}>
              🔥 {activeCount} en cours
            </span>
          )}
          {upcomingCount > 0 && (
            <span style={{ fontSize: 11, fontWeight: 700, background: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.65)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 20, padding: '3px 10px', fontFamily: 'Inter, sans-serif' }}>
              ⏳ {upcomingCount} à venir
            </span>
          )}
          {doneCount > 0 && (
            <span style={{ fontSize: 11, fontWeight: 700, background: 'rgba(5,150,105,0.18)', color: '#6EE7B7', border: '1px solid rgba(5,150,105,0.3)', borderRadius: 20, padding: '3px 10px', fontFamily: 'Inter, sans-serif' }}>
              ✓ {doneCount} terminé{doneCount > 1 ? 's' : ''}
            </span>
          )}
        </div>
      </div>

      {/* Slots */}
      <div style={{ padding: '14px 22px', display: 'flex', flexDirection: 'column', gap: 8 }}>
        {slots.map(slot => (
          <motion.div
            key={slot.id}
            initial={{ opacity: 0, x: -8 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.28 }}
            style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '9px 14px', background: phaseBg[slot.phase], border: `1px solid ${phaseBorder[slot.phase]}`, borderRadius: 10 }}
          >
            <span style={{ fontSize: 16, flexShrink: 0 }}>{phaseIcon[slot.phase]}</span>
            <span style={{ fontSize: 15, fontWeight: 800, color: phaseColor[slot.phase], minWidth: 46, fontFamily: 'Inter, sans-serif' }}>
              {slot.time}
            </span>
            <span style={{ flex: 1, fontSize: 13, color: '#4C3A30', fontFamily: 'Inter, sans-serif', fontWeight: 600 }}>
              {slot.service}
            </span>
            {slot.delayMinutes > 0 && (
              <span style={{ fontSize: 11, fontWeight: 700, color: '#D97706', background: '#FFFBEB', border: '1px solid #FDE68A', borderRadius: 6, padding: '2px 7px', fontFamily: 'Inter, sans-serif' }}>
                +{slot.delayMinutes} min
              </span>
            )}
            <span style={{ fontSize: 11, fontWeight: 700, color: phaseColor[slot.phase], fontFamily: 'Inter, sans-serif' }}>
              {phaseLabel[slot.phase]}
            </span>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}

/* ─── Statistiques de ponctualité (sidebar) ──────────────────────── */
function PunctualityStatsCard({ stats }) {
  const { onTimePercent, avgDelayMin, totalDone, cancelledThisMonth } = stats;
  if (totalDone === 0) return null;

  const items = [
    { label: 'à l\'heure', value: `${onTimePercent}%`, color: onTimePercent >= 95 ? '#059669' : onTimePercent >= 80 ? '#D97706' : '#DC2626' },
    { label: 'retard moyen', value: avgDelayMin > 0 ? `${avgDelayMin} min` : '0 min', color: '#6B4A35' },
    { label: 'prestations réalisées', value: totalDone, color: '#0B0B0C' },
    { label: 'annulation ce mois', value: cancelledThisMonth, color: cancelledThisMonth === 0 ? '#059669' : '#DC2626' },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
      transition={{ duration: 0.42, ease: [0.22,1,0.36,1] }}
      style={{ background: '#fff', border: '1px solid #E8D7C2', borderRadius: 16, overflow: 'hidden' }}
    >
      <div style={{ background: '#FAF7F1', borderBottom: '1px solid #E8D7C2', padding: '12px 18px' }}>
        <p style={{ fontSize: 11, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.12em', color: '#9A5F2F', margin: 0, fontFamily: 'Inter, sans-serif' }}>
          📊 Ponctualité
        </p>
      </div>
      <div style={{ padding: '14px 18px', display: 'flex', flexDirection: 'column', gap: 10 }}>
        {items.map(item => (
          <div key={item.label} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
            <span style={{ fontSize: 12, color: '#8B6D5A', fontFamily: 'Inter, sans-serif', fontWeight: 600 }}>{item.label}</span>
            <span style={{ fontSize: 15, fontWeight: 900, color: item.color, fontFamily: 'Inter, sans-serif' }}>{item.value}</span>
          </div>
        ))}
      </div>
    </motion.div>
  );
}

export default function ProProfilePage() {
  const { slug } = useParams();
  const {
    pros, bookings, getProReviews, avgRating, addReview, incrementViews, proDelays,
    getPunctualityStats, getDayActivity,
  } = useApp();

  const pro = pros.find(p => p.slug === slug);
  const reviews = pro ? getProReviews(pro.id) : [];
  const rating = pro ? avgRating(pro.id) : 0;
  const currentDelay = pro ? (proDelays?.[pro.id] ?? 0) : 0;
  const gallery = useMemo(() => (pro ? getPhotoSet(pro) : FALLBACK_PHOTOS), [pro]);

  const recentPhotoUrls = useMemo(() => {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
    return new Set(
      (bookings || [])
        .filter(b => b.proId === pro?.id && b.completionPhotoUrl && b.date >= thirtyDaysAgo)
        .map(b => b.completionPhotoUrl)
    );
  }, [bookings, pro?.id]);
  const coverPhoto = gallery[0];
  const avatarPhoto = (pro?.photos || []).filter(Boolean)[1] || null;
  const proBookings = pro ? (bookings || []).filter(b => b.proId === pro.id) : [];
  const minPrice = pro?.services?.length
    ? Math.min(...pro.services.map(s => Number(s.price) || 0).filter(Boolean))
    : null;
  const whatsappHref = getWhatsappHref(pro?.whatsapp || pro?.phone);

  const [lightbox, setLightbox] = useState(null);
  const [reviewText, setReviewText] = useState('');
  const [reviewStars, setReviewStars] = useState(5);
  const [reviewName, setReviewName] = useState('');
  const [reviewSent, setReviewSent] = useState(false);

  useEffect(() => {
    if (pro) {
      document.title = `${pro.name} - ${pro.city || 'MatchAfro'} | MatchAfro`;
      incrementViews?.(pro.id);
    }
    return () => { document.title = 'MatchAfro'; };
  }, [pro?.id]);

  if (!pro) {
    return (
      <main className="profileMissing">
        <div>
          <p className="profileMissingIcon">?</p>
          <h1>Profil introuvable</h1>
          <p>Ce professionnel n'existe pas ou a été supprimé.</p>
          <Link to="/">Retour à l'accueil</Link>
        </div>
      </main>
    );
  }

  function scrollToBooking() {
    document.getElementById('reservation')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  function submitReview() {
    if (!reviewText.trim() || !reviewName.trim()) return;
    addReview({ proId: pro.id, author: reviewName.trim(), rating: reviewStars, comment: reviewText.trim() });
    setReviewSent(true);
    setReviewText('');
    setReviewName('');
    setReviewStars(5);
  }

  return (
    <main className="premiumProfile">
      <style>{PROFILE_CSS}</style>

      <section className="profileHero">
        <motion.img
          className="profileHeroImage"
          src={coverPhoto}
          alt=""
          initial={{ scale: 1.05 }}
          animate={{ scale: 1.12 }}
          transition={{ duration: 18, repeat: Infinity, repeatType: 'mirror', ease: 'easeInOut' }}
        />
        <div className="profileHeroShade" />

        <div className="profileHeroTop">
          <Link to="/#vedettes" className="profileBackLink">Retour aux professionnels</Link>
          <SmartTimeBadge delayMinutes={currentDelay} size="sm" />
        </div>

        <div className="profileHeroContent">
          <motion.div
            className="profileIdentity"
            initial={{ opacity: 0, y: 26 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.72, ease: EASE }}
          >
            <div className="profileAvatar" style={{ background: pro.gradient || '#C9863A' }}>
              {avatarPhoto
                ? <img src={avatarPhoto} alt={`Portrait de ${pro.name}`} />
                : <span>{pro.initials || pro.name?.[0]}</span>}
            </div>
            <div>
              <div className="profileBadges">
                {pro.verified && <Badge tone="green">Vérifié</Badge>}
                {pro.founder && <Badge>Fondateur #{pro.founderNumber}</Badge>}
                {pro.homeService && <Badge tone="copper">À domicile</Badge>}
              </div>
              <h1>{pro.name}</h1>
              <p className="profileHeroMeta">
                {pro.city || 'France'}{getCategoryText(pro) ? ` · ${getCategoryText(pro)}` : ''}
              </p>
              <div className="profileHeroRating">
                <Stars rating={rating} size={16} />
                <strong>{rating.toFixed(1)}</strong>
                <span>{reviews.length} avis</span>
              </div>
            </div>
          </motion.div>

          <div className="profileHeroActions">
            <button onClick={scrollToBooking} className="profilePrimaryBtn">Réserver maintenant</button>
            {whatsappHref && (
              <a href={whatsappHref} target="_blank" rel="noreferrer" className="profileWhatsAppBtn">
                WhatsApp
              </a>
            )}
          </div>
        </div>
      </section>

      <section className="profileProofBand">
        <div className="profileProofGrid">
          <div>
            <strong>{proBookings.length}</strong>
            <span>réservations</span>
          </div>
          <div>
            <strong>{reviews.length}</strong>
            <span>avis clients</span>
          </div>
          <div>
            <strong>{minPrice ? `${minPrice}€` : 'Sur devis'}</strong>
            <span>prix d'entrée</span>
          </div>
          <div>
            <strong>Moins de 2h</strong>
            <span>temps de réponse</span>
          </div>
          <div>
            <strong>{getAvailabilityLabel(pro)}</strong>
            <span>disponibilités</span>
          </div>
        </div>
      </section>

      <section className="profileGallerySection" id="galerie">
        <div className="profileWideHeader">
          <div>
            <p className="profileEyebrow">Réalisations</p>
            <h2>Une galerie qui parle avant les mots.</h2>
          </div>
          <button onClick={() => setLightbox(0)} className="profileGhostBtn">Voir en plein écran</button>
        </div>

        <div className="profileMasonry">
          {gallery.slice(0, 8).map((photo, index) => (
            <motion.button
              key={`${photo}-${index}`}
              className={`profileMasonryItem profileMasonryItem--${index % 4}${recentPhotoUrls.has(photo) ? ' profileMasonryItem--recent' : ''}`}
              onClick={() => setLightbox(index)}
              initial={{ opacity: 0, y: 22 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.52, delay: index * 0.04, ease: EASE }}
              whileHover={{ y: -4 }}
            >
              <img src={photo} alt={`Réalisation ${index + 1} de ${pro.name}`} />
              <span>Voir</span>
            </motion.button>
          ))}
        </div>
      </section>

      <div className="profileContentGrid">
        <div className="profileMainColumn">

          <ClientValidationBanner pro={pro} />

          <DayActivitySection proId={pro.id} getDayActivity={getDayActivity} />

          <Section id="a-propos" eyebrow="Signature" title={`L'univers de ${pro.name.split(' ')[0]}`}>
            <p className="profileDescription">
              {pro.description || 'Une professionnelle MatchAfro sélectionnée pour son savoir-faire, son sens du détail et sa capacité à créer une expérience rassurante dès le premier rendez-vous.'}
            </p>
            <div className="profileSoftFacts">
              <span>{pro.address || pro.city || 'Adresse communiquée après réservation'}</span>
              <span>{pro.homeService ? 'Déplacement possible' : 'Accueil sur place'}</span>
              <span>{pro.services?.length || 0} prestations</span>
            </div>
          </Section>

          <Section id="services" eyebrow="Prestations" title="Choisir son moment beauté">
            <div className="profileServices">
              {(pro.services || []).map(service => (
                <motion.div
                  key={service.id}
                  className="profileServiceCard"
                  whileHover={{ y: -3 }}
                  transition={{ duration: 0.18 }}
                >
                  <div>
                    <h3>{service.name}</h3>
                    <p>{formatDuration(service.duration)}</p>
                  </div>
                  <div className="profileServicePrice">
                    <strong>{service.price}€</strong>
                    <button onClick={scrollToBooking}>Réserver</button>
                  </div>
                </motion.div>
              ))}
              {(!pro.services || pro.services.length === 0) && (
                <p className="profileEmptyText">Les prestations seront bientôt disponibles.</p>
              )}
            </div>
          </Section>

          <Section id="reservation" eyebrow="Agenda" title="Réserver en quelques secondes" className="profileBookingSection">
            <BookingCalendar pro={pro} clientMode />
          </Section>

          <Section id="avis" eyebrow="Avis clients" title="Ce que les clientes ressentent">
            <div className="profileReviewsIntro">
              <div>
                <strong>{rating.toFixed(1)}</strong>
                <InlineStars rating={rating} />
                <span>{reviews.length} avis vérifiés et retours d'expérience</span>
              </div>
              <Badge tone="green">Profil de confiance</Badge>
            </div>

            <div className="profileReviewsList">
              {reviews.length === 0 && (
                <p className="profileEmptyText">Aucun avis pour le moment.</p>
              )}
              {reviews.map(review => (
                <motion.article
                  key={review.id}
                  className="profileReviewCard"
                  whileHover={{ y: -3 }}
                  transition={{ duration: 0.18 }}
                >
                  <div>
                    <strong>{review.author}</strong>
                    <InlineStars rating={review.rating} />
                  </div>
                  <p>{review.comment}</p>
                  <span>{new Date(review.createdAt).toLocaleDateString('fr-FR')}</span>
                </motion.article>
              ))}
            </div>

            {reviewSent ? (
              <div className="profileReviewSuccess">Merci, votre avis a été publié.</div>
            ) : (
              <div className="profileReviewForm">
                <h3>Laisser un avis</h3>
                <div className="profileRatingPicker" aria-label="Votre note">
                  {[1, 2, 3, 4, 5].map(star => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setReviewStars(star)}
                      aria-label={`${star} étoile${star > 1 ? 's' : ''}`}
                      aria-pressed={star <= reviewStars}
                    >
                      <span style={{ color: star <= reviewStars ? '#C9863A' : '#D1D5DB' }}>{STAR}</span>
                    </button>
                  ))}
                </div>
                <label htmlFor="review-name">Votre prénom</label>
                <input id="review-name" value={reviewName} onChange={e => setReviewName(e.target.value)} placeholder="Mariama" />
                <label htmlFor="review-comment">Votre expérience</label>
                <textarea id="review-comment" value={reviewText} onChange={e => setReviewText(e.target.value)} rows={4} placeholder="Partagez ce qui vous a plu..." />
                <button onClick={submitReview} disabled={!reviewText.trim() || !reviewName.trim()} className="profilePrimaryBtn">
                  Publier l'avis
                </button>
              </div>
            )}
          </Section>
        </div>

        <aside className="profileSidePanel">
          <div className="profileReserveBox">
            <img src={coverPhoto} alt="" />
            <div>
              <p>À partir de</p>
              <strong>{minPrice ? `${minPrice}€` : 'Sur devis'}</strong>
              <span>{pro.city || 'France'} · {rating.toFixed(1)} / 5</span>
            </div>
            <button onClick={scrollToBooking} className="profilePrimaryBtn">Réserver</button>
            {whatsappHref && <a href={whatsappHref} target="_blank" rel="noreferrer" className="profileWhatsAppBtn">WhatsApp</a>}
          </div>
          <ReliabilityScore proId={pro.id} />
          <PunctualityStatsCard stats={getPunctualityStats(pro.id)} />
        </aside>
      </div>

      <AnimatePresence>
        {lightbox !== null && (
          <motion.div
            className="profileLightbox"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setLightbox(null)}
          >
            <button className="profileLightboxClose" onClick={() => setLightbox(null)} aria-label="Fermer la galerie">×</button>
            <button
              className="profileLightboxNav profileLightboxNav--prev"
              onClick={event => { event.stopPropagation(); setLightbox((lightbox - 1 + gallery.length) % gallery.length); }}
              aria-label="Photo précédente"
            >
              ‹
            </button>
            <motion.img
              key={gallery[lightbox]}
              src={gallery[lightbox]}
              alt={`Réalisation ${lightbox + 1} de ${pro.name}`}
              initial={{ scale: 0.96, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.96, opacity: 0 }}
              onClick={event => event.stopPropagation()}
            />
            <button
              className="profileLightboxNav profileLightboxNav--next"
              onClick={event => { event.stopPropagation(); setLightbox((lightbox + 1) % gallery.length); }}
              aria-label="Photo suivante"
            >
              ›
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="profileMobileBar">
        {whatsappHref && <a href={whatsappHref} target="_blank" rel="noreferrer">WhatsApp</a>}
        <button onClick={scrollToBooking}>Réserver</button>
      </div>
    </main>
  );
}

const PROFILE_CSS = `
  .premiumProfile {
    min-height: 100vh;
    background: #FAF7F1;
    color: #0B0B0C;
  }

  .profileHero {
    position: relative;
    min-height: 640px;
    overflow: hidden;
    background: #0B0B0C;
  }

  .profileHeroImage {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .profileHeroShade {
    position: absolute;
    inset: 0;
    background:
      linear-gradient(90deg, rgba(11,11,12,0.88) 0%, rgba(11,11,12,0.58) 42%, rgba(11,11,12,0.18) 100%),
      linear-gradient(0deg, rgba(11,11,12,0.78) 0%, rgba(11,11,12,0.05) 44%, rgba(11,11,12,0.25) 100%);
  }

  .profileHeroTop {
    position: relative;
    z-index: 2;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
    width: min(1480px, calc(100% - 48px));
    margin: 0 auto;
    padding-top: 96px;
  }

  .profileBackLink {
    color: rgba(255,255,255,0.76);
    font-size: 13px;
    font-weight: 700;
    text-decoration: none;
  }

  .profileHeroContent {
    position: relative;
    z-index: 2;
    width: min(1480px, calc(100% - 48px));
    min-height: 456px;
    margin: 0 auto;
    padding: 92px 0 54px;
    display: flex;
    align-items: flex-end;
    justify-content: space-between;
    gap: 36px;
  }

  .profileIdentity {
    display: flex;
    align-items: flex-end;
    gap: 22px;
    max-width: 840px;
  }

  .profileAvatar {
    width: 132px;
    height: 132px;
    border-radius: 50%;
    border: 3px solid rgba(255,255,255,0.86);
    box-shadow: 0 18px 60px rgba(0,0,0,0.34);
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;
    flex-shrink: 0;
  }

  .profileAvatar img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .profileAvatar span {
    color: #fff;
    font-size: 36px;
    font-weight: 900;
  }

  .profileBadges,
  .profileHeroRating,
  .profileSoftFacts {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 8px;
  }

  .profileBadge {
    display: inline-flex;
    align-items: center;
    min-height: 26px;
    padding: 4px 10px;
    border-radius: 8px;
    font-size: 11px;
    font-weight: 800;
    color: #2E1A08;
    background: #F4C16F;
    border: 1px solid rgba(255,255,255,0.22);
  }

  .profileBadge--green {
    color: #063F2B;
    background: #BCE7D1;
  }

  .profileBadge--copper {
    color: #fff;
    background: #A7542A;
  }

  .profileIdentity h1 {
    color: #fff;
    font-size: 64px;
    line-height: 1;
    margin: 12px 0 12px;
    font-weight: 900;
    letter-spacing: 0;
  }

  .profileHeroMeta {
    color: rgba(255,255,255,0.78);
    font-size: 17px;
    margin: 0 0 12px;
    font-weight: 600;
  }

  .profileHeroRating {
    color: rgba(255,255,255,0.78);
    font-size: 14px;
  }

  .profileHeroRating strong {
    color: #fff;
    font-size: 15px;
  }

  .profileStars,
  .inlineStars {
    display: inline-flex;
    gap: 2px;
    letter-spacing: 0;
  }

  .profileHeroActions {
    display: flex;
    flex-direction: column;
    gap: 10px;
    min-width: 230px;
  }

  .profilePrimaryBtn,
  .profileWhatsAppBtn,
  .profileGhostBtn {
    border-radius: 8px;
    min-height: 48px;
    padding: 13px 18px;
    border: none;
    cursor: pointer;
    font-family: Inter, sans-serif;
    font-size: 14px;
    font-weight: 850;
    text-decoration: none;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    transition: transform 0.2s ease, box-shadow 0.2s ease, background 0.2s ease;
  }

  .profilePrimaryBtn {
    background: linear-gradient(135deg, #C9863A, #8A4F26);
    color: #fff;
    box-shadow: 0 16px 34px rgba(137, 79, 38, 0.32);
  }

  .profilePrimaryBtn:hover,
  .profileWhatsAppBtn:hover,
  .profileGhostBtn:hover {
    transform: translateY(-2px);
  }

  .profilePrimaryBtn:disabled {
    cursor: default;
    opacity: 0.5;
    transform: none;
  }

  .profileWhatsAppBtn {
    color: #05391F;
    background: #D7F8E4;
  }

  .profileProofBand {
    background: #0B0B0C;
    border-top: 1px solid rgba(255,255,255,0.08);
    border-bottom: 1px solid rgba(255,255,255,0.08);
  }

  .profileProofGrid {
    width: min(1480px, calc(100% - 48px));
    margin: 0 auto;
    display: grid;
    grid-template-columns: repeat(5, 1fr);
  }

  .profileProofGrid div {
    min-height: 110px;
    padding: 24px 18px;
    border-left: 1px solid rgba(255,255,255,0.08);
    display: flex;
    flex-direction: column;
    justify-content: center;
  }

  .profileProofGrid div:last-child {
    border-right: 1px solid rgba(255,255,255,0.08);
  }

  .profileProofGrid strong {
    color: #F4C16F;
    font-size: 24px;
    line-height: 1.1;
    margin-bottom: 6px;
  }

  .profileProofGrid span {
    color: rgba(255,255,255,0.58);
    font-size: 12px;
    font-weight: 700;
    text-transform: uppercase;
  }

  .profileGallerySection {
    width: min(1480px, calc(100% - 48px));
    margin: 0 auto;
    padding: 58px 0 48px;
  }

  .profileWideHeader {
    display: flex;
    align-items: flex-end;
    justify-content: space-between;
    gap: 24px;
    margin-bottom: 24px;
  }

  .profileEyebrow {
    color: #9A5F2F;
    font-size: 12px;
    font-weight: 900;
    text-transform: uppercase;
    margin: 0 0 8px;
    letter-spacing: 0;
  }

  .profileWideHeader h2,
  .profileSection h2 {
    font-size: 36px;
    line-height: 1.14;
    color: #0B0B0C;
    margin: 0;
    font-weight: 900;
    letter-spacing: 0;
  }

  .profileGhostBtn {
    color: #0B0B0C;
    background: #fff;
    border: 1px solid #E8D7C2;
  }

  .profileMasonry {
    columns: 4 240px;
    column-gap: 14px;
  }

  .profileMasonryItem {
    position: relative;
    width: 100%;
    margin: 0 0 14px;
    padding: 0;
    break-inside: avoid;
    overflow: hidden;
    border: none;
    border-radius: 8px;
    background: #111;
    cursor: pointer;
    box-shadow: 0 18px 44px rgba(44,24,10,0.12);
  }

  .profileMasonryItem::after {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(0deg, rgba(11,11,12,0.38), transparent 54%);
    opacity: 0;
    transition: opacity 0.22s ease;
  }

  .profileMasonryItem:hover::after,
  .profileMasonryItem:hover span {
    opacity: 1;
  }

  .profileMasonryItem img {
    width: 100%;
    height: 100%;
    display: block;
    object-fit: cover;
    transition: transform 0.8s ease;
  }

  .profileMasonryItem:hover img {
    transform: scale(1.05);
  }

  .profileMasonryItem span {
    position: absolute;
    left: 12px;
    bottom: 12px;
    z-index: 2;
    color: #fff;
    background: rgba(255,255,255,0.18);
    border: 1px solid rgba(255,255,255,0.24);
    backdrop-filter: blur(10px);
    border-radius: 8px;
    padding: 7px 10px;
    font-size: 12px;
    font-weight: 800;
    opacity: 0;
    transition: opacity 0.22s ease;
  }

  .profileMasonryItem--0,
  .profileMasonryItem--3 {
    aspect-ratio: 4 / 5;
  }

  .profileMasonryItem--1 {
    aspect-ratio: 1 / 1;
  }

  .profileMasonryItem--2 {
    aspect-ratio: 3 / 4;
  }

  .profileContentGrid {
    width: min(1480px, calc(100% - 48px));
    margin: 0 auto;
    padding: 16px 0 92px;
    display: grid;
    grid-template-columns: minmax(0, 1fr) 360px;
    gap: 34px;
    align-items: start;
  }

  .profileMainColumn {
    min-width: 0;
  }

  .profileSection {
    padding: 42px 0;
    border-top: 1px solid #E8D7C2;
  }

  .profileDescription {
    color: #3C3028;
    font-size: 18px;
    line-height: 1.8;
    max-width: 860px;
    margin: 18px 0 18px;
  }

  .profileSoftFacts {
    gap: 10px;
  }

  .profileSoftFacts span {
    background: #fff;
    border: 1px solid #E8D7C2;
    color: #6B4A35;
    padding: 9px 12px;
    border-radius: 8px;
    font-size: 13px;
    font-weight: 750;
  }

  .profileServices {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 12px;
    margin-top: 22px;
  }

  .profileServiceCard,
  .profileReviewCard,
  .profileReviewForm,
  .profileReserveBox {
    background: #fff;
    border: 1px solid #E8D7C2;
    border-radius: 8px;
    box-shadow: 0 18px 44px rgba(44,24,10,0.08);
  }

  .profileServiceCard {
    min-height: 118px;
    padding: 18px;
    display: flex;
    justify-content: space-between;
    gap: 16px;
  }

  .profileServiceCard h3 {
    color: #0B0B0C;
    font-size: 17px;
    margin: 0 0 8px;
  }

  .profileServiceCard p {
    color: #8B6D5A;
    font-size: 13px;
    margin: 0;
    font-weight: 700;
  }

  .profileServicePrice {
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    justify-content: space-between;
    gap: 12px;
    flex-shrink: 0;
  }

  .profileServicePrice strong {
    font-size: 22px;
    color: #9A5F2F;
  }

  .profileServicePrice button {
    border: none;
    border-radius: 8px;
    background: #0B0B0C;
    color: #fff;
    min-height: 38px;
    padding: 8px 12px;
    font-size: 12px;
    font-weight: 850;
    cursor: pointer;
  }

  .profileBookingSection > div:last-child {
    margin-top: 22px;
  }

  .profileReviewsIntro {
    margin-top: 22px;
    background: #0B0B0C;
    color: #fff;
    border-radius: 8px;
    padding: 22px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 18px;
  }

  .profileReviewsIntro div {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 12px;
  }

  .profileReviewsIntro strong {
    font-size: 38px;
    color: #F4C16F;
  }

  .profileReviewsIntro span {
    color: rgba(255,255,255,0.72);
    font-size: 13px;
    font-weight: 700;
  }

  .profileReviewsList {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 12px;
    margin-top: 12px;
  }

  .profileReviewCard {
    padding: 18px;
  }

  .profileReviewCard div {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
  }

  .profileReviewCard strong {
    font-size: 14px;
    color: #0B0B0C;
  }

  .profileReviewCard p {
    color: #4C3A30;
    font-size: 14px;
    line-height: 1.7;
    margin: 14px 0 12px;
  }

  .profileReviewCard > span {
    color: #A38B7D;
    font-size: 12px;
    font-weight: 700;
  }

  .profileReviewForm {
    margin-top: 14px;
    padding: 22px;
    display: grid;
    gap: 10px;
  }

  .profileReviewForm h3 {
    margin: 0 0 2px;
    font-size: 18px;
  }

  .profileReviewForm label {
    color: #6B4A35;
    font-size: 12px;
    font-weight: 850;
    text-transform: uppercase;
  }

  .profileReviewForm input,
  .profileReviewForm textarea {
    width: 100%;
    border: 1.5px solid #E8D7C2;
    border-radius: 8px;
    background: #FFFCF8;
    padding: 12px;
    color: #0B0B0C;
    font-size: 14px;
    resize: vertical;
  }

  .profileRatingPicker {
    display: flex;
    gap: 2px;
  }

  .profileRatingPicker button {
    width: 42px;
    height: 42px;
    border: none;
    background: transparent;
    cursor: pointer;
    font-size: 28px;
  }

  .profileReviewSuccess,
  .profileEmptyText {
    margin-top: 14px;
    background: #fff;
    border: 1px solid #E8D7C2;
    border-radius: 8px;
    padding: 18px;
    color: #6B4A35;
    font-weight: 750;
  }

  .profileSidePanel {
    position: sticky;
    top: 96px;
    display: flex;
    flex-direction: column;
    gap: 14px;
  }

  .profileReserveBox {
    overflow: hidden;
  }

  .profileReserveBox img {
    width: 100%;
    aspect-ratio: 16 / 10;
    object-fit: cover;
    display: block;
  }

  .profileReserveBox div {
    padding: 18px;
  }

  .profileReserveBox p {
    margin: 0;
    color: #8B6D5A;
    font-size: 12px;
    font-weight: 850;
    text-transform: uppercase;
  }

  .profileReserveBox strong {
    display: block;
    margin-top: 4px;
    font-size: 34px;
    color: #0B0B0C;
  }

  .profileReserveBox span {
    display: block;
    margin-top: 4px;
    color: #7B5C48;
    font-size: 13px;
    font-weight: 700;
  }

  .profileReserveBox .profilePrimaryBtn,
  .profileReserveBox .profileWhatsAppBtn {
    margin: 0 18px 12px;
    width: calc(100% - 36px);
  }

  .profileLightbox {
    position: fixed;
    inset: 0;
    z-index: 1000;
    background: rgba(8, 7, 6, 0.94);
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 32px;
  }

  .profileLightbox img {
    max-width: min(1100px, 84vw);
    max-height: 86vh;
    border-radius: 8px;
    object-fit: contain;
    box-shadow: 0 30px 80px rgba(0,0,0,0.46);
  }

  .profileLightboxClose,
  .profileLightboxNav {
    position: absolute;
    border: 1px solid rgba(255,255,255,0.18);
    background: rgba(255,255,255,0.1);
    color: #fff;
    cursor: pointer;
    backdrop-filter: blur(12px);
  }

  .profileLightboxClose {
    top: 22px;
    right: 22px;
    width: 46px;
    height: 46px;
    border-radius: 50%;
    font-size: 26px;
  }

  .profileLightboxNav {
    top: 50%;
    width: 52px;
    height: 68px;
    transform: translateY(-50%);
    border-radius: 8px;
    font-size: 42px;
  }

  .profileLightboxNav--prev {
    left: 24px;
  }

  .profileLightboxNav--next {
    right: 24px;
  }

  .profileMobileBar {
    display: none;
  }

  .profileMissing {
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 24px;
    background: #FAF7F1;
    text-align: center;
  }

  .profileMissingIcon {
    width: 72px;
    height: 72px;
    border-radius: 50%;
    margin: 0 auto 18px;
    background: #0B0B0C;
    color: #F4C16F;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 32px;
    font-weight: 900;
  }

  .profileMissing h1 {
    font-size: 30px;
    margin: 0 0 8px;
  }

  .profileMissing p {
    color: #6B4A35;
    margin: 0 0 18px;
  }

  .profileMissing a {
    color: #9A5F2F;
    font-weight: 850;
  }

  @media (max-width: 1100px) {
    .profileHeroContent {
      align-items: flex-start;
      flex-direction: column;
      justify-content: flex-end;
    }

    .profileHeroActions {
      flex-direction: row;
      width: 100%;
    }

    .profileHeroActions > * {
      flex: 1;
    }

    .profileProofGrid {
      grid-template-columns: repeat(3, 1fr);
    }

    .profileContentGrid {
      grid-template-columns: 1fr;
    }

    .profileSidePanel {
      position: static;
      order: -1;
    }
  }

  @media (max-width: 760px) {
    .profileHero {
      min-height: 560px;
    }

    .profileHeroTop,
    .profileHeroContent,
    .profileGallerySection,
    .profileContentGrid,
    .profileProofGrid {
      width: min(1480px, calc(100% - 28px));
    }

    .profileHeroTop {
      padding-top: 82px;
    }

    .profileHeroContent {
      min-height: 432px;
      padding: 56px 0 34px;
      gap: 24px;
    }

    .profileIdentity {
      align-items: center;
      gap: 14px;
    }

    .profileAvatar {
      width: 88px;
      height: 88px;
    }

    .profileAvatar span {
      font-size: 26px;
    }

    .profileIdentity h1 {
      font-size: 40px;
      margin: 10px 0 8px;
    }

    .profileHeroMeta {
      font-size: 14px;
    }

    .profileHeroActions {
      display: none;
    }

    .profileProofGrid {
      grid-template-columns: repeat(2, 1fr);
    }

    .profileProofGrid div {
      min-height: 92px;
      padding: 18px 12px;
    }

    .profileProofGrid strong {
      font-size: 20px;
    }

    .profileWideHeader {
      align-items: flex-start;
      flex-direction: column;
    }

    .profileWideHeader h2,
    .profileSection h2 {
      font-size: 28px;
    }

    .profileMasonry {
      columns: 2 150px;
      column-gap: 10px;
    }

    .profileMasonryItem {
      margin-bottom: 10px;
    }

    .profileServices,
    .profileReviewsList {
      grid-template-columns: 1fr;
    }

    .profileServiceCard {
      min-height: 112px;
    }

    .profileReviewsIntro {
      align-items: flex-start;
      flex-direction: column;
    }

    .profileDescription {
      font-size: 16px;
    }

    .profileLightbox {
      padding: 18px;
    }

    .profileLightbox img {
      max-width: 92vw;
      max-height: 78vh;
    }

    .profileLightboxNav {
      display: none;
    }

    .profileMobileBar {
      position: fixed;
      left: 0;
      right: 0;
      bottom: 0;
      z-index: 80;
      display: grid;
      grid-template-columns: 1fr 1.2fr;
      gap: 10px;
      padding: 12px 14px;
      background: rgba(250,247,241,0.94);
      backdrop-filter: blur(18px);
      border-top: 1px solid #E8D7C2;
    }

    .profileMobileBar a,
    .profileMobileBar button {
      min-height: 48px;
      border-radius: 8px;
      border: none;
      display: flex;
      align-items: center;
      justify-content: center;
      text-decoration: none;
      font-weight: 900;
      font-size: 14px;
      font-family: Inter, sans-serif;
    }

    .profileMobileBar a {
      color: #063F2B;
      background: #D7F8E4;
    }

    .profileMobileBar button {
      color: #fff;
      background: linear-gradient(135deg, #C9863A, #8A4F26);
    }
  }

  @media (max-width: 480px) {
    .profileIdentity {
      align-items: flex-start;
      flex-direction: column;
    }

    .profileIdentity h1 {
      font-size: 34px;
    }

    .profileProofGrid {
      grid-template-columns: 1fr;
    }

    .profileServiceCard {
      flex-direction: column;
    }

    .profileServicePrice {
      align-items: flex-start;
      flex-direction: row;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .profileHeroImage,
    .profileMasonryItem img {
      transition: none !important;
      animation: none !important;
    }
  }

  /* ── Phase 2 : Galerie — badge "Récent" sur les premières photos ── */
  .profileMasonryItem--recent::before {
    content: '✦ Récent';
    position: absolute;
    top: 10px;
    left: 10px;
    z-index: 3;
    background: linear-gradient(135deg, #C9863A, #8A4F26);
    color: #fff;
    font-size: 10px;
    font-weight: 800;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    padding: 4px 8px;
    border-radius: 6px;
    box-shadow: 0 4px 12px rgba(137,79,38,0.4);
  }

  /* ── Proof band — amélioration typographique ── */
  .profileProofBand {
    background: linear-gradient(135deg, #0B0B0C 0%, #1C1410 100%);
  }

  /* ── Section réservation — encadré enrichi ── */
  .profileBookingSection {
    position: relative;
  }

  .profileBookingSection::before {
    content: '';
    position: absolute;
    inset: 0;
    border-radius: 20px;
    background: linear-gradient(135deg, rgba(201,134,58,0.04), rgba(138,79,38,0.02));
    pointer-events: none;
  }

  /* ── Formulaire d'avis — style premium ── */
  .profileReviewForm input:focus,
  .profileReviewForm textarea:focus {
    outline: none;
    border-color: #C9863A;
    box-shadow: 0 0 0 3px rgba(201,134,58,0.12);
  }

  /* ── Service card — hover enrichi ── */
  .profileServiceCard {
    transition: transform 0.22s ease, box-shadow 0.22s ease, border-color 0.22s ease;
  }

  .profileServiceCard:hover {
    border-color: #C9863A !important;
    box-shadow: 0 12px 32px rgba(137,79,38,0.12) !important;
  }

  /* ── Review card — hover doré ── */
  .profileReviewCard {
    transition: transform 0.22s ease, box-shadow 0.22s ease;
  }

  .profileReviewCard:hover {
    box-shadow: 0 12px 32px rgba(137,79,38,0.10) !important;
  }
`;
