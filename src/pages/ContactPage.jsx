import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

const labelStyle = { display: 'block', fontSize: 11, fontWeight: 700, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: 6, fontFamily: 'Inter, sans-serif' };
const inputStyle = { display: 'block', width: '100%', border: '1.5px solid #E5E7EB', borderRadius: 12, padding: '12px 14px', fontSize: 14, color: '#111', background: '#fff', fontFamily: 'Inter, sans-serif', boxSizing: 'border-box' };

const TOPICS = [
  'Problème technique',
  'Question sur une réservation',
  'Devenir professionnel',
  'Signaler un contenu',
  'Partenariat / Presse',
  'Autre',
];

const FAQ = [
  {
    q: 'Comment devenir professionnel sur MatchAfro ?',
    a: 'Rendez-vous sur la page "Devenir Professionnel" et suivez les 5 étapes d\'inscription. Votre profil sera vérifié sous 48h.',
  },
  {
    q: 'Comment annuler une réservation ?',
    a: 'Depuis votre profil client, retrouvez la réservation concernée et cliquez sur "Annuler". Vous pouvez annuler gratuitement jusqu\'à 24h avant le rendez-vous.',
  },
  {
    q: 'Qu\'est-ce que l\'Offre Fondateur ?',
    a: 'Les 50 premiers professionnels inscrits obtiennent un abonnement Premium à vie, un badge "Fondateur", et une mise en avant permanente sur la plateforme.',
  },
  {
    q: 'Mes données sont-elles sécurisées ?',
    a: 'Oui. Toutes les données sont chiffrées (HTTPS) et hébergées en Europe. Consultez notre Politique de Confidentialité pour plus de détails.',
  },
];

function FaqItem({ q, a }) {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ borderBottom: '1px solid #F3F4F6' }}>
      <button
        onClick={() => setOpen(v => !v)}
        aria-expanded={open}
        style={{
          width: '100%', textAlign: 'left', padding: '16px 0', background: 'none', border: 'none',
          cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12,
          fontFamily: 'Inter, sans-serif',
        }}
      >
        <span style={{ fontSize: 14, fontWeight: 600, color: '#111' }}>{q}</span>
        <span style={{ fontSize: 18, color: '#D97706', flexShrink: 0, transition: 'transform 0.2s', transform: open ? 'rotate(45deg)' : 'none' }}>+</span>
      </button>
      {open && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          style={{ paddingBottom: 16 }}
        >
          <p style={{ fontSize: 14, color: '#6B7280', lineHeight: 1.7, fontFamily: 'Inter, sans-serif' }}>{a}</p>
        </motion.div>
      )}
    </div>
  );
}

export default function ContactPage() {
  const [form, setForm] = useState({ name: '', email: '', topic: '', message: '' });
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => { document.title = 'Contact — MatchAfro'; }, []);

  function handleSubmit(e) {
    e.preventDefault();
    if (!form.name.trim() || !form.email.trim() || !form.message.trim()) {
      setError('Veuillez remplir tous les champs obligatoires.');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      setError('Adresse email invalide.');
      return;
    }
    setError('');
    setSubmitted(true);
  }

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', padding: 'clamp(40px,6vw,80px) 24px' }}>

      {/* Header */}
      <div style={{ maxWidth: 580, marginBottom: 56 }}>
        <p style={{ fontSize: 12, fontWeight: 700, color: '#D97706', textTransform: 'uppercase', letterSpacing: 2, marginBottom: 12 }}>Support</p>
        <h1 style={{ fontSize: 'clamp(28px,4vw,42px)', fontWeight: 900, color: '#0F0F0F', marginBottom: 14, fontFamily: "'DM Serif Display', Georgia, serif", fontStyle: 'italic', lineHeight: 1.2 }}>
          Comment pouvons-nous vous aider ?
        </h1>
        <p style={{ fontSize: 15, color: '#6B7280', lineHeight: 1.7, fontFamily: 'Inter, sans-serif' }}>
          Notre équipe répond généralement sous 24 à 48h. Pour les urgences, privilégiez WhatsApp.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: 48, alignItems: 'start' }}>

        {/* Formulaire */}
        <div>
          {submitted ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              style={{ background: '#ECFDF5', border: '1.5px solid #6EE7B7', borderRadius: 20, padding: '40px 32px', textAlign: 'center' }}
            >
              <div style={{ fontSize: 48, marginBottom: 16 }}>✅</div>
              <h2 style={{ fontSize: 20, fontWeight: 800, color: '#065F46', marginBottom: 10, fontFamily: 'Inter, sans-serif' }}>Message envoyé !</h2>
              <p style={{ fontSize: 14, color: '#047857', lineHeight: 1.7, fontFamily: 'Inter, sans-serif' }}>
                Merci <strong>{form.name.split(' ')[0]}</strong>, nous vous répondrons à <strong>{form.email}</strong> dans les 24–48h.
              </p>
            </motion.div>
          ) : (
            <form onSubmit={handleSubmit} noValidate aria-label="Formulaire de contact"
              style={{ background: '#fff', border: '1.5px solid #E5E7EB', borderRadius: 20, padding: '32px 28px', boxShadow: '0 4px 24px rgba(0,0,0,0.05)' }}
            >
              <h2 style={{ fontSize: 17, fontWeight: 800, color: '#0F0F0F', marginBottom: 24, fontFamily: 'Inter, sans-serif' }}>Nous contacter</h2>

              {error && (
                <div role="alert" style={{ background: '#FEF2F2', border: '1px solid #FCA5A5', borderRadius: 10, padding: '10px 14px', marginBottom: 18, fontSize: 13, color: '#DC2626', fontFamily: 'Inter, sans-serif' }}>
                  {error}
                </div>
              )}

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
                <div>
                  <label htmlFor="contact-name" style={labelStyle}>Nom *</label>
                  <input id="contact-name" type="text" required aria-required="true"
                    value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                    placeholder="Votre nom" style={inputStyle} />
                </div>
                <div>
                  <label htmlFor="contact-email" style={labelStyle}>Email *</label>
                  <input id="contact-email" type="email" required aria-required="true"
                    value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                    placeholder="votre@email.fr" style={inputStyle} />
                </div>
              </div>

              <div style={{ marginBottom: 14 }}>
                <label htmlFor="contact-topic" style={labelStyle}>Sujet</label>
                <select id="contact-topic" value={form.topic} onChange={e => setForm(f => ({ ...f, topic: e.target.value }))}
                  style={{ ...inputStyle, appearance: 'none' }}>
                  <option value="">Choisir un sujet...</option>
                  {TOPICS.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>

              <div style={{ marginBottom: 22 }}>
                <label htmlFor="contact-message" style={labelStyle}>Message *</label>
                <textarea id="contact-message" required aria-required="true" rows={5}
                  value={form.message} onChange={e => setForm(f => ({ ...f, message: e.target.value }))}
                  placeholder="Décrivez votre demande en détail..."
                  style={{ ...inputStyle, resize: 'vertical', minHeight: 120 }}
                />
              </div>

              <button type="submit" className="btn-primary"
                style={{ width: '100%', borderRadius: 14, padding: '14px', fontSize: 15, fontWeight: 700 }}>
                Envoyer le message
              </button>

              <p style={{ fontSize: 11, color: '#9CA3AF', textAlign: 'center', marginTop: 14, lineHeight: 1.5, fontFamily: 'Inter, sans-serif' }}>
                En soumettant ce formulaire, vous acceptez notre{' '}
                <a href="/confidentialite" style={{ color: '#D97706' }}>Politique de Confidentialité</a>.
              </p>
            </form>
          )}
        </div>

        {/* Sidebar infos + FAQ */}
        <div>
          {/* Canaux de contact */}
          <div style={{ marginBottom: 40 }}>
            <h2 style={{ fontSize: 16, fontWeight: 800, color: '#0F0F0F', marginBottom: 20, fontFamily: 'Inter, sans-serif' }}>Autres façons de nous contacter</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {[
                { icon: '📧', label: 'Email général', value: 'contact@matchafro.fr', href: 'mailto:contact@matchafro.fr' },
                { icon: '⚖️', label: 'Questions légales', value: 'legal@matchafro.fr', href: 'mailto:legal@matchafro.fr' },
                { icon: '🔒', label: 'Données personnelles', value: 'privacy@matchafro.fr', href: 'mailto:privacy@matchafro.fr' },
              ].map(item => (
                <a key={item.label} href={item.href}
                  style={{ display: 'flex', alignItems: 'center', gap: 14, background: '#F9FAFB', border: '1px solid #E5E7EB', borderRadius: 14, padding: '14px 18px', textDecoration: 'none', transition: 'border-color 0.2s' }}
                  onMouseEnter={e => e.currentTarget.style.borderColor = '#D97706'}
                  onMouseLeave={e => e.currentTarget.style.borderColor = '#E5E7EB'}
                >
                  <span style={{ fontSize: 24 }}>{item.icon}</span>
                  <div>
                    <p style={{ fontSize: 11, fontWeight: 700, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: 1, fontFamily: 'Inter, sans-serif', marginBottom: 2 }}>{item.label}</p>
                    <p style={{ fontSize: 13, fontWeight: 600, color: '#D97706', fontFamily: 'Inter, sans-serif' }}>{item.value}</p>
                  </div>
                </a>
              ))}
            </div>
          </div>

          {/* Horaires */}
          <div style={{ background: '#FFFBEB', border: '1px solid #FDE68A', borderRadius: 16, padding: '18px 22px', marginBottom: 40 }}>
            <p style={{ fontSize: 13, fontWeight: 700, color: '#92400E', marginBottom: 8, fontFamily: 'Inter, sans-serif' }}>⏰ Horaires de support</p>
            <p style={{ fontSize: 13, color: '#92400E', lineHeight: 1.7, fontFamily: 'Inter, sans-serif' }}>
              Lundi – Vendredi : 9h00 – 18h00<br />
              Samedi : 10h00 – 14h00<br />
              Dimanche : fermé
            </p>
          </div>

          {/* FAQ */}
          <div>
            <h2 style={{ fontSize: 16, fontWeight: 800, color: '#0F0F0F', marginBottom: 4, fontFamily: 'Inter, sans-serif' }}>Questions fréquentes</h2>
            <p style={{ fontSize: 13, color: '#9CA3AF', marginBottom: 20, fontFamily: 'Inter, sans-serif' }}>Vous trouverez peut-être votre réponse ici.</p>
            {FAQ.map(item => <FaqItem key={item.q} q={item.q} a={item.a} />)}
          </div>
        </div>
      </div>
    </div>
  );
}
