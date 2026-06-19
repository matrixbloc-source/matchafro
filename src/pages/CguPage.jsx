import { useEffect } from 'react';

const section = { marginBottom: 36 };
const h2 = { fontSize: 18, fontWeight: 800, color: '#0F0F0F', marginBottom: 12, fontFamily: 'Inter, sans-serif' };
const p = { fontSize: 14, color: '#374151', lineHeight: 1.8, marginBottom: 10, fontFamily: 'Inter, sans-serif' };
const ul = { paddingLeft: 22, marginBottom: 10 };
const li = { fontSize: 14, color: '#374151', lineHeight: 1.8, marginBottom: 6, fontFamily: 'Inter, sans-serif' };

export default function CguPage() {
  useEffect(() => { document.title = 'Conditions Générales d\'Utilisation — MatchAfro'; }, []);

  return (
    <div style={{ maxWidth: 780, margin: '0 auto', padding: 'clamp(40px,6vw,80px) 24px' }}>
      <div style={{ marginBottom: 40 }}>
        <p style={{ fontSize: 12, fontWeight: 700, color: '#D97706', textTransform: 'uppercase', letterSpacing: 2, marginBottom: 12 }}>Legal</p>
        <h1 style={{ fontSize: 'clamp(28px,4vw,40px)', fontWeight: 900, color: '#0F0F0F', marginBottom: 12, fontFamily: "'DM Serif Display', Georgia, serif", fontStyle: 'italic' }}>
          Conditions Générales d'Utilisation
        </h1>
        <p style={{ fontSize: 14, color: '#9CA3AF' }}>Dernière mise à jour : 17 juin 2026</p>
      </div>

      <div style={section}>
        <h2 style={h2}>1. Présentation de la plateforme</h2>
        <p style={p}>MatchAfro est une marketplace en ligne mettant en relation des particulières avec des professionnels de la beauté afro (coiffure, tresses, maquillage, soins capillaires, etc.). La plateforme est éditée par MatchAfro SAS, société en cours d'immatriculation au Registre du Commerce et des Sociétés (RCS) de Paris.</p>
        <p style={p}>L'accès et l'utilisation de la plateforme MatchAfro (ci-après « la Plateforme ») impliquent l'acceptation pleine et entière des présentes Conditions Générales d'Utilisation (CGU).</p>
      </div>

      <div style={section}>
        <h2 style={h2}>2. Définitions</h2>
        <ul style={ul}>
          <li style={li}><strong>Utilisateur</strong> : toute personne accédant à la Plateforme, qu'elle soit cliente ou professionnelle.</li>
          <li style={li}><strong>Cliente</strong> : utilisatrice recherchant des prestations de beauté afro.</li>
          <li style={li}><strong>Professionnel(le)</strong> : expert(e) en beauté afro inscrit(e) sur la Plateforme proposant ses services.</li>
          <li style={li}><strong>Prestation</strong> : service de beauté proposé par un(e) Professionnel(le) via la Plateforme.</li>
          <li style={li}><strong>Réservation</strong> : prise de rendez-vous effectuée par une Cliente auprès d'un(e) Professionnel(le).</li>
          <li style={li}><strong>Profil Fondateur</strong> : statut spécial accordé aux 50 premiers professionnels inscrits sur la Plateforme.</li>
        </ul>
      </div>

      <div style={section}>
        <h2 style={h2}>3. Inscription et compte</h2>
        <p style={p}>L'inscription est gratuite pour les clientes. L'inscription en tant que professionnel(le) est soumise à une vérification manuelle par l'équipe MatchAfro.</p>
        <p style={p}>Pour s'inscrire, le professionnel doit :</p>
        <ul style={ul}>
          <li style={li}>Fournir des informations exactes, complètes et à jour.</li>
          <li style={li}>Justifier de ses qualifications et de son exercice légal de l'activité.</li>
          <li style={li}>Accepter les présentes CGU et la politique de confidentialité.</li>
        </ul>
        <p style={p}>MatchAfro se réserve le droit de suspendre ou supprimer tout compte ne respectant pas ces conditions.</p>
      </div>

      <div style={section}>
        <h2 style={h2}>4. Utilisation de la Plateforme</h2>
        <p style={p}>L'utilisateur s'engage à :</p>
        <ul style={ul}>
          <li style={li}>Ne pas utiliser la Plateforme à des fins illégales ou frauduleuses.</li>
          <li style={li}>Respecter les droits des autres utilisateurs et des professionnels.</li>
          <li style={li}>Ne pas diffuser de contenu offensant, discriminatoire ou portant atteinte aux droits de tiers.</li>
          <li style={li}>Ne pas tenter de contourner les systèmes de sécurité de la Plateforme.</li>
          <li style={li}>Ne pas utiliser la Plateforme pour effectuer des transactions en dehors de celle-ci afin d'éviter toute commission.</li>
        </ul>
      </div>

      <div style={section}>
        <h2 style={h2}>5. Réservations et annulations</h2>
        <p style={p}>Les réservations effectuées via MatchAfro constituent un engagement ferme entre la Cliente et le/la Professionnel(le). En cas d'annulation :</p>
        <ul style={ul}>
          <li style={li}>Annulation plus de 24h avant le rendez-vous : annulation sans frais.</li>
          <li style={li}>Annulation moins de 24h avant le rendez-vous : le/la professionnel(le) peut retenir un acompte (à préciser dans ses conditions).</li>
          <li style={li}>Absence injustifiée : le/la professionnel(le) peut signaler le comportement à MatchAfro.</li>
        </ul>
      </div>

      <div style={section}>
        <h2 style={h2}>6. Avis et évaluations</h2>
        <p style={p}>Les clientes peuvent laisser des avis suite à une prestation effectuée. Ces avis doivent être :</p>
        <ul style={ul}>
          <li style={li}>Sincères et basés sur une expérience réelle.</li>
          <li style={li}>Rédigés de manière respectueuse.</li>
          <li style={li}>Exempts de tout propos diffamatoire ou dénigrant.</li>
        </ul>
        <p style={p}>MatchAfro se réserve le droit de supprimer tout avis ne respectant pas ces critères.</p>
      </div>

      <div style={section}>
        <h2 style={h2}>7. Propriété intellectuelle</h2>
        <p style={p}>L'ensemble des contenus présents sur la Plateforme (logo, design, textes, fonctionnalités) est protégé par le droit de la propriété intellectuelle et appartient à MatchAfro SAS, sauf mention contraire. Toute reproduction, même partielle, est interdite sans autorisation écrite préalable.</p>
      </div>

      <div style={section}>
        <h2 style={h2}>8. Responsabilité</h2>
        <p style={p}>MatchAfro agit en tant qu'intermédiaire et n'est pas partie au contrat de prestation entre les Clientes et les Professionnels. MatchAfro ne peut être tenu responsable :</p>
        <ul style={ul}>
          <li style={li}>De la qualité des prestations réalisées par les professionnels.</li>
          <li style={li}>Des préjudices résultant d'une annulation de rendez-vous.</li>
          <li style={li}>Des interruptions de service pour maintenance ou cas de force majeure.</li>
        </ul>
      </div>

      <div style={section}>
        <h2 style={h2}>9. Modification des CGU</h2>
        <p style={p}>MatchAfro se réserve le droit de modifier les présentes CGU à tout moment. Les utilisateurs seront informés de toute modification substantielle par notification sur la Plateforme ou par email. La poursuite de l'utilisation de la Plateforme après notification vaut acceptation des nouvelles CGU.</p>
      </div>

      <div style={section}>
        <h2 style={h2}>10. Droit applicable et juridiction</h2>
        <p style={p}>Les présentes CGU sont régies par le droit français. En cas de litige, et à défaut de résolution amiable, les tribunaux de Paris seront compétents.</p>
      </div>

      <div style={{ background: '#FFFBEB', border: '1px solid #FDE68A', borderRadius: 16, padding: '20px 24px', marginTop: 48 }}>
        <p style={{ fontSize: 13, color: '#92400E', lineHeight: 1.7, fontFamily: 'Inter, sans-serif' }}>
          <strong>Des questions ?</strong> Contactez-nous à <a href="mailto:legal@matchafro.fr" style={{ color: '#D97706' }}>legal@matchafro.fr</a> ou via notre{' '}
          <a href="/contact" style={{ color: '#D97706' }}>formulaire de contact</a>.
        </p>
      </div>
    </div>
  );
}
