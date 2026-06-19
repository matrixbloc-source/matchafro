import { Routes, Route } from 'react-router-dom';
import { Component } from 'react';
import { AppProvider } from './context/AppContext.jsx';

class ErrorBoundary extends Component {
  constructor(props) { super(props); this.state = { error: null }; }
  static getDerivedStateFromError(e) { return { error: e }; }
  render() {
    if (this.state.error) {
      return (
        <div style={{ padding: 32, fontFamily: 'monospace', background: '#fff', minHeight: '100vh' }}>
          <h2 style={{ color: '#dc2626', marginBottom: 16 }}>Erreur React</h2>
          <pre style={{ background: '#fef2f2', padding: 16, borderRadius: 8, color: '#991b1b', fontSize: 13, whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
            {this.state.error.message}{'\n\n'}{this.state.error.stack}
          </pre>
          <button onClick={() => this.setState({ error: null })} style={{ marginTop: 16, padding: '8px 16px', background: '#dc2626', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer' }}>
            Réessayer
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
import Navbar from './components/Navbar.jsx';
import Footer from './components/Footer.jsx';
import Home from './pages/Home.jsx';
import BecomeProPage from './pages/BecomeProPage.jsx';
import ProProfilePage from './pages/ProProfilePage.jsx';
import DashboardPage from './pages/DashboardPage.jsx';
import AdminPage from './pages/AdminPage.jsx';
import CguPage from './pages/CguPage.jsx';
import ConfidentialitePage from './pages/ConfidentialitePage.jsx';
import MentionsLegalesPage from './pages/MentionsLegalesPage.jsx';
import ContactPage from './pages/ContactPage.jsx';
import CategoryPage from './pages/CategoryPage.jsx';
import ClientDashboardPage from './pages/ClientDashboardPage.jsx';
import ResetPasswordPage from './pages/ResetPasswordPage.jsx';

const GLOBAL_CSS = `
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  html { scroll-behavior: smooth; overflow-x: hidden; }
  body {
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
    background: #ffffff;
    color: #0F0F0F;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    overflow-x: hidden;
  }
  #root { overflow-x: hidden; }

  ::-webkit-scrollbar { width: 6px; }
  ::-webkit-scrollbar-track { background: #fff; }
  ::-webkit-scrollbar-thumb { background: #E5E7EB; border-radius: 99px; }
  ::-webkit-scrollbar-thumb:hover { background: #D1D5DB; }

  @keyframes marquee { 0% { transform: translateX(0); } 100% { transform: translateX(-50%); } }
  @keyframes fadeUp { from { opacity: 0; transform: translateY(24px); } to { opacity: 1; transform: translateY(0); } }
  @keyframes float { 0%, 100% { transform: translateY(0px); } 50% { transform: translateY(-12px); } }
  @keyframes shimmer { 0% { background-position: -200% center; } 100% { background-position: 200% center; } }
  @keyframes spin-slow { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
  @keyframes pulse-glow { 0%, 100% { box-shadow: 0 0 0 0 rgba(217,119,6,0.4); } 50% { box-shadow: 0 0 0 10px rgba(217,119,6,0); } }
  @keyframes count-in { from { opacity: 0; transform: translateY(16px) scale(0.9); } to { opacity: 1; transform: translateY(0) scale(1); } }
  @keyframes bar-fill { from { width: 0; } to { width: var(--bar-width, 76%); } }

  .btn-primary {
    display: inline-flex; align-items: center; justify-content: center; gap: 8px;
    background: linear-gradient(135deg, #D97706, #B45309);
    color: #fff; border: none; cursor: pointer;
    font-family: 'Inter', sans-serif; font-weight: 600;
    letter-spacing: 0.3px; text-decoration: none;
    transition: transform 0.22s ease, box-shadow 0.22s ease;
    box-shadow: 0 4px 20px rgba(217,119,6,0.28);
  }
  .btn-primary:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 32px rgba(217,119,6,0.42);
  }
  .btn-primary:active { transform: translateY(0); box-shadow: 0 2px 10px rgba(217,119,6,0.25); }
  @media (prefers-reduced-motion: reduce) {
    .btn-primary:hover { transform: none; }
  }

  .btn-secondary {
    display: inline-flex; align-items: center; justify-content: center; gap: 8px;
    background: transparent; color: #0F0F0F;
    border: 1.5px solid #E5E7EB; cursor: pointer;
    font-family: 'Inter', sans-serif; font-weight: 500;
    text-decoration: none;
    transition: border-color 0.2s, background 0.2s, color 0.2s;
  }
  .btn-secondary:hover { border-color: #D97706; color: #D97706; background: #FFFBEB; }

  .section-tag {
    display: inline-flex; align-items: center; gap: 6px;
    font-size: 11px; font-weight: 700; letter-spacing: 1.8px;
    text-transform: uppercase; color: #D97706;
    margin-bottom: 14px;
  }
  .section-tag::before {
    content: '';
    display: inline-block;
    width: 20px; height: 1.5px;
    background: #D97706;
  }

  .serif { font-family: 'DM Serif Display', 'Georgia', serif; }

  input, textarea, select { font-family: 'Inter', sans-serif; }
  /* Focus visible personnalisé — accessible clavier, discret souris */
  input:focus, textarea:focus, select:focus { outline: none; }
  input:focus-visible, textarea:focus-visible, select:focus-visible {
    outline: 2px solid #D97706;
    outline-offset: 2px;
    border-color: #D97706 !important;
  }
  button:focus { outline: none; }
  button:focus-visible {
    outline: 2px solid #D97706;
    outline-offset: 3px;
    border-radius: 4px;
  }
  a:focus { outline: none; }
  a:focus-visible {
    outline: 2px solid #D97706;
    outline-offset: 3px;
    border-radius: 4px;
  }
  .btn-primary:focus-visible, .btn-secondary:focus-visible {
    outline: 2px solid #D97706;
    outline-offset: 3px;
  }

  /* Respect prefers-reduced-motion */
  @media (prefers-reduced-motion: reduce) {
    *, *::before, *::after {
      animation-duration: 0.01ms !important;
      animation-iteration-count: 1 !important;
      transition-duration: 0.01ms !important;
    }
  }

  /* Skip-to-content (accessibilité clavier) */
  .skip-link {
    position: absolute; top: -40px; left: 8px;
    background: #D97706; color: #fff; font-weight: 700;
    padding: 8px 16px; border-radius: 0 0 8px 8px;
    text-decoration: none; font-size: 13px; z-index: 9999;
    transition: top 0.2s;
  }
  .skip-link:focus { top: 0; }

  @media (max-width: 768px) {
    .hide-mobile { display: none !important; }
    .mobile-stack { flex-direction: column !important; }
    .mobile-full { width: 100% !important; }
  }
  @media (min-width: 769px) {
    .hide-desktop { display: none !important; }
  }
`;

/* Pages qui n'ont pas de Navbar/Footer (layouts complets) */
const FULL_LAYOUT_PATHS = ['/dashboard', '/admin'];

function Layout({ children }) {
  return (
    <>
      <a href="#main-content" className="skip-link">Aller au contenu principal</a>
      <Navbar />
      <main id="main-content">{children}</main>
      <Footer />
    </>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
    <AppProvider>
      <style dangerouslySetInnerHTML={{ __html: GLOBAL_CSS }} />
      <Routes>
        {/* Pages avec layout complet (Navbar + Footer) */}
        <Route path="/" element={<Layout><Home /></Layout>} />
        <Route path="/devenir-professionnel" element={<Layout><BecomeProPage /></Layout>} />
        <Route path="/pro/:slug" element={<Layout><ProProfilePage /></Layout>} />
        <Route path="/categorie/:slug" element={<Layout><CategoryPage /></Layout>} />

        {/* Espace client */}
        <Route path="/mon-compte" element={<Layout><ClientDashboardPage /></Layout>} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />

        {/* Pages légales */}
        <Route path="/cgu" element={<Layout><CguPage /></Layout>} />
        <Route path="/confidentialite" element={<Layout><ConfidentialitePage /></Layout>} />
        <Route path="/mentions-legales" element={<Layout><MentionsLegalesPage /></Layout>} />
        <Route path="/contact" element={<Layout><ContactPage /></Layout>} />

        {/* Pages avec leur propre layout (no Navbar/Footer) */}
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/admin" element={<AdminPage />} />

        {/* Fallback */}
        <Route path="*" element={<Layout><Home /></Layout>} />
      </Routes>
    </AppProvider>
    </ErrorBoundary>
  );
}
