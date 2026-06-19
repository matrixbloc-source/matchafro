import { useEffect } from 'react';

const section = { marginBottom: 36 };
const h2 = { fontSize: 18, fontWeight: 800, color: '#0F0F0F', marginBottom: 12, fontFamily: 'Inter, sans-serif' };
const p = { fontSize: 14, color: '#374151', lineHeight: 1.8, marginBottom: 10, fontFamily: 'Inter, sans-serif' };
const ul = { paddingLeft: 22, marginBottom: 10 };
const li = { fontSize: 14, color: '#374151', lineHeight: 1.8, marginBottom: 6, fontFamily: 'Inter, sans-serif' };

export default function ConfidentialitePage() {
  useEffect(() => { document.title = 'Politique de Confidentialité — MatchAfro'; }, []);

  return (
    <div style={{ maxWidth: 780, margin: '0 auto', padding: 'clamp(40px,6vw,80px) 24px' }}>
      <div style={{ marginBottom: 40 }}>
        <p style={{ fontSize: 12, fontWeight: 700, color: '#D97706', textTransform: 'uppercase', letterSpacing: 2, marginBottom: 12 }}>Legal</p>
        <h1 style={{ fontSize: 'clamp(28px,4vw,40px)', fontWeight: 900, color: '#0F0F0F', marginBottom: 12, fontFamily: "'DM Serif Display', Georgia, serif", fontStyle: 'italic' }}>
          Politique de Confidentialité
        </h1>
        <p style={{ fontSize: 14, color: '#9CA3AF' }}>Dernière mise à jour : 17 juin 2026</p>
      </div>

      <div style={section}>
        <h2 style={h2}>1. Responsable du traitement</h2>
        <p style={p}>MatchAfro SAS, société en cours d'immatriculation, est responsable du traitement de vos données personnelles. Pour toute question relative à la protection de vos données, vous pouvez nous contacter à : <a href="mailto:privacy@matchafro.fr" style={{ color: '#D97706' }}>privacy@matchafro.fr</a></p>
      </div>

      <div style={section}>
        <h2 style={h2}>2. Données collectées</h2>
        <p style={p}>Nous collectons les données suivantes :</p>
        <ul style={ul}>
          <li style={li}><strong>Données d'inscription</strong> : nom, prénom, adresse email, numéro de téléphone.</li>
          <li style={li}><strong>Données de profil professionnel</strong> : spécialités, localisation, photos, tarifs, disponibilités.</li>
          <li style={li}><strong>Données de réservation</strong> : date, heure, prestation choisie, coordonnées.</li>
          <li style={li}><strong>Données de navigation</strong> : adresse IP, type de navigateur, pages visitées (via cookies analytiques).</li>
          <li style={li}><strong>Avis et évaluations</strong> : contenu textuel et note attribuée.</li>
        </ul>
      </div>

      <div style={section}>
        <h2 style={h2}>3. Finalités du traitement</h2>
        <p style={p}>Vos données sont utilisées pour :</p>
        <ul style={ul}>
          <li style={li}>Fournir et améliorer nos services de mise en relation.</li>
          <li style={li}>Gérer les réservations et les communications entre clientes et professionnels.</li>
          <li style={li}>Assurer la sécurité de la Plateforme et prévenir les fraudes.</li>
          <li style={li}>Envoyer des communications transactionnelles (confirmations de réservation, rappels).</li>
          <li style={li}>Envoyer notre newsletter (avec votre consentement explicite).</li>
          <li style={li}>Respecter nos obligations légales et réglementaires.</li>
        </ul>
      </div>

      <div style={section}>
        <h2 style={h2}>4. Base légale des traitements</h2>
        <ul style={ul}>
          <li style={li}><strong>Exécution du contrat</strong> : traitement nécessaire à la fourniture du service.</li>
          <li style={li}><strong>Intérêt légitime</strong> : amélioration de la Plateforme, sécurité, lutte contre la fraude.</li>
          <li style={li}><strong>Consentement</strong> : newsletter, cookies non essentiels.</li>
          <li style={li}><strong>Obligation légale</strong> : conservation des données comptables et fiscales.</li>
        </ul>
      </div>

      <div style={section}>
        <h2 style={h2}>5. Conservation des données</h2>
        <p style={p}>Vos données sont conservées pendant :</p>
        <ul style={ul}>
          <li style={li}><strong>Compte actif</strong> : pendant toute la durée de la relation contractuelle.</li>
          <li style={li}><strong>Après suppression du compte</strong> : 3 ans maximum pour les données de navigation, 5 ans pour les données de transaction (obligation légale).</li>
          <li style={li}><strong>Newsletter</strong> : jusqu'à désinscription.</li>
        </ul>
      </div>

      <div style={section}>
        <h2 style={h2}>6. Partage des données</h2>
        <p style={p}>Nous ne vendons jamais vos données personnelles. Nous partageons uniquement les informations nécessaires avec :</p>
        <ul style={ul}>
          <li style={li}><strong>Prestataires techniques</strong> : hébergement (Vercel), base de données (Supabase), envoi d'emails.</li>
          <li style={li}><strong>Autorités légales</strong> : sur demande légalement fondée.</li>
        </ul>
        <p style={p}>Les données des clientes partagées avec les professionnels sont limitées aux informations nécessaires à l'exécution de la réservation (nom, téléphone, email).</p>
      </div>

      <div style={section}>
        <h2 style={h2}>7. Vos droits</h2>
        <p style={p}>Conformément au RGPD et à la loi Informatique et Libertés, vous disposez des droits suivants :</p>
        <ul style={ul}>
          <li style={li}><strong>Droit d'accès</strong> : obtenir une copie de vos données.</li>
          <li style={li}><strong>Droit de rectification</strong> : corriger des données inexactes.</li>
          <li style={li}><strong>Droit à l'effacement</strong> : demander la suppression de vos données.</li>
          <li style={li}><strong>Droit à la portabilité</strong> : recevoir vos données dans un format lisible.</li>
          <li style={li}><strong>Droit d'opposition</strong> : vous opposer à certains traitements.</li>
          <li style={li}><strong>Droit à la limitation</strong> : restreindre temporairement un traitement.</li>
        </ul>
        <p style={p}>Pour exercer vos droits, contactez : <a href="mailto:privacy@matchafro.fr" style={{ color: '#D97706' }}>privacy@matchafro.fr</a>. Vous pouvez également introduire une réclamation auprès de la <a href="https://www.cnil.fr" target="_blank" rel="noopener noreferrer" style={{ color: '#D97706' }}>CNIL</a>.</p>
      </div>

      <div style={section}>
        <h2 style={h2}>8. Cookies</h2>
        <p style={p}>Nous utilisons des cookies pour le bon fonctionnement de la Plateforme :</p>
        <ul style={ul}>
          <li style={li}><strong>Cookies essentiels</strong> : nécessaires au fonctionnement (session, authentification). Durée : session.</li>
          <li style={li}><strong>Cookies analytiques</strong> : mesure d'audience anonymisée. Durée : 13 mois. Nécessitent votre consentement.</li>
        </ul>
        <p style={p}>Vous pouvez gérer vos préférences cookies à tout moment depuis les paramètres de votre navigateur.</p>
      </div>

      <div style={section}>
        <h2 style={h2}>9. Sécurité</h2>
        <p style={p}>Nous mettons en œuvre des mesures techniques et organisationnelles appropriées pour protéger vos données contre tout accès non autorisé, perte, destruction ou altération : chiffrement HTTPS, contrôle d'accès, politique de mots de passe, sauvegardes régulières.</p>
      </div>

      <div style={{ background: '#FFFBEB', border: '1px solid #FDE68A', borderRadius: 16, padding: '20px 24px', marginTop: 48 }}>
        <p style={{ fontSize: 13, color: '#92400E', lineHeight: 1.7, fontFamily: 'Inter, sans-serif' }}>
          <strong>Contact DPO :</strong> Pour toute question relative à vos données personnelles :{' '}
          <a href="mailto:privacy@matchafro.fr" style={{ color: '#D97706' }}>privacy@matchafro.fr</a>
        </p>
      </div>
    </div>
  );
}
