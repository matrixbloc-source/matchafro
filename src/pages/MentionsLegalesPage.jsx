import { useEffect } from 'react';

const section = { marginBottom: 32 };
const h2 = { fontSize: 18, fontWeight: 800, color: '#0F0F0F', marginBottom: 12, fontFamily: 'Inter, sans-serif' };
const p = { fontSize: 14, color: '#374151', lineHeight: 1.8, marginBottom: 8, fontFamily: 'Inter, sans-serif' };
const strong = { fontWeight: 700, color: '#111' };

export default function MentionsLegalesPage() {
  useEffect(() => { document.title = 'Mentions Légales — MatchAfro'; }, []);

  return (
    <div style={{ maxWidth: 780, margin: '0 auto', padding: 'clamp(40px,6vw,80px) 24px' }}>
      <div style={{ marginBottom: 40 }}>
        <p style={{ fontSize: 12, fontWeight: 700, color: '#D97706', textTransform: 'uppercase', letterSpacing: 2, marginBottom: 12 }}>Legal</p>
        <h1 style={{ fontSize: 'clamp(28px,4vw,40px)', fontWeight: 900, color: '#0F0F0F', marginBottom: 12, fontFamily: "'DM Serif Display', Georgia, serif", fontStyle: 'italic' }}>
          Mentions Légales
        </h1>
        <p style={{ fontSize: 14, color: '#9CA3AF' }}>Dernière mise à jour : 17 juin 2026</p>
      </div>

      <div style={section}>
        <h2 style={h2}>Éditeur du site</h2>
        <p style={p}><span style={strong}>Raison sociale :</span> MatchAfro SAS</p>
        <p style={p}><span style={strong}>Forme juridique :</span> Société par Actions Simplifiée (SAS) en cours d'immatriculation</p>
        <p style={p}><span style={strong}>Siège social :</span> Paris, France</p>
        <p style={p}><span style={strong}>Email :</span> <a href="mailto:contact@matchafro.fr" style={{ color: '#D97706' }}>contact@matchafro.fr</a></p>
        <p style={p}><span style={strong}>Directeur de la publication :</span> Le représentant légal de MatchAfro SAS</p>
      </div>

      <div style={section}>
        <h2 style={h2}>Hébergement</h2>
        <p style={p}><span style={strong}>Hébergeur :</span> Vercel Inc.</p>
        <p style={p}><span style={strong}>Adresse :</span> 340 Pine Street, Suite 701, San Francisco, CA 94104, États-Unis</p>
        <p style={p}><span style={strong}>Site web :</span> <a href="https://vercel.com" target="_blank" rel="noopener noreferrer" style={{ color: '#D97706' }}>vercel.com</a></p>
      </div>

      <div style={section}>
        <h2 style={h2}>Base de données</h2>
        <p style={p}><span style={strong}>Prestataire :</span> Supabase Inc.</p>
        <p style={p}><span style={strong}>Adresse :</span> 970 Toa Payoh North, #07-04, Singapour 318992</p>
        <p style={p}><span style={strong}>Données hébergées :</span> Serveurs localisés dans l'Union Européenne (Frankfurt, AWS eu-central-1)</p>
      </div>

      <div style={section}>
        <h2 style={h2}>Propriété intellectuelle</h2>
        <p style={p}>L'ensemble des éléments constituant le site MatchAfro (logo, design, textes, photos, fonctionnalités, code source) est protégé par les lois françaises et internationales relatives à la propriété intellectuelle.</p>
        <p style={p}>Toute reproduction, représentation, modification ou adaptation de tout ou partie des éléments du site, sans l'autorisation écrite préalable de MatchAfro SAS, est strictement interdite et constituerait une contrefaçon sanctionnée par les articles L.335-2 et suivants du Code de la Propriété Intellectuelle.</p>
      </div>

      <div style={section}>
        <h2 style={h2}>Données personnelles</h2>
        <p style={p}>Le traitement des données personnelles est décrit dans notre <a href="/confidentialite" style={{ color: '#D97706' }}>Politique de Confidentialité</a>. Conformément au RGPD (Règlement UE 2016/679) et à la loi Informatique et Libertés du 6 janvier 1978 modifiée, vous disposez de droits sur vos données personnelles.</p>
        <p style={p}>Pour exercer vos droits : <a href="mailto:privacy@matchafro.fr" style={{ color: '#D97706' }}>privacy@matchafro.fr</a></p>
        <p style={p}>Autorité de contrôle : <a href="https://www.cnil.fr" target="_blank" rel="noopener noreferrer" style={{ color: '#D97706' }}>Commission Nationale de l'Informatique et des Libertés (CNIL)</a>, 3 Place de Fontenoy, TSA 80715, 75334 Paris Cedex 07.</p>
      </div>

      <div style={section}>
        <h2 style={h2}>Cookies</h2>
        <p style={p}>Le site utilise des cookies pour son fonctionnement. Pour plus d'informations, consultez notre <a href="/confidentialite" style={{ color: '#D97706' }}>Politique de Confidentialité</a>, section 8.</p>
      </div>

      <div style={section}>
        <h2 style={h2}>Limitation de responsabilité</h2>
        <p style={p}>MatchAfro SAS s'efforce de maintenir à jour les informations diffusées sur ce site, mais ne peut garantir l'exactitude, la complétude ou l'actualité des informations diffusées. MatchAfro SAS décline toute responsabilité pour tout dommage résultant d'une intrusion frauduleuse d'un tiers ou d'un problème technique indépendant de sa volonté.</p>
      </div>

      <div style={section}>
        <h2 style={h2}>Droit applicable</h2>
        <p style={p}>Les présentes mentions légales sont régies par le droit français. En cas de litige, les tribunaux français seront seuls compétents.</p>
      </div>

      <div style={{ background: '#F9FAFB', border: '1px solid #E5E7EB', borderRadius: 16, padding: '20px 24px', marginTop: 48 }}>
        <p style={{ fontSize: 13, color: '#6B7280', lineHeight: 1.7, fontFamily: 'Inter, sans-serif' }}>
          Pour toute question : <a href="/contact" style={{ color: '#D97706' }}>formulaire de contact</a> ou <a href="mailto:contact@matchafro.fr" style={{ color: '#D97706' }}>contact@matchafro.fr</a>
        </p>
      </div>
    </div>
  );
}
