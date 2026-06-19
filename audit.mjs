import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';

const CHROME = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const BASE   = 'http://localhost:5173';
const DIR    = 'C:\\Users\\kasda\\OneDrive\\Desktop\\matchafro\\audit-screenshots';

fs.mkdirSync(DIR, { recursive: true });

let results = [];
let page, browser;

async function shot(name) {
  const file = path.join(DIR, `${String(results.length + 1).padStart(2,'0')}-${name}.png`);
  await page.screenshot({ path: file, fullPage: false });
  return file;
}

async function log(section, status, detail, file) {
  const entry = { section, status, detail, file };
  results.push(entry);
  console.log(`[${status}] ${section}: ${detail}`);
}

async function run() {
  browser = await chromium.launch({
    headless: true,
    executablePath: CHROME,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  page = await context.newPage();

  // ─── 1. ACCUEIL ─────────────────────────────────────────────────
  console.log('\n══ 1. ACCUEIL ══');
  await page.goto(BASE, { waitUntil: 'networkidle', timeout: 15000 });
  let f = await shot('home-accueil');
  await log('Accueil', 'INFO', 'Page chargée', f);

  // Vérifier sections visibles
  const heroText = await page.locator('h1').first().textContent().catch(() => null);
  await log('Hero', heroText ? 'OK' : 'FAIL', heroText ? `"${heroText.trim().slice(0,60)}"` : 'h1 introuvable', null);

  // Navbar
  const navLinks = await page.locator('nav a').count();
  await log('Navbar', navLinks > 0 ? 'OK' : 'WARN', `${navLinks} liens nav trouvés`, null);

  // Smart Calendar section
  await page.locator('#calendrier, [id*="calendrier"]').first().scrollIntoViewIfNeeded().catch(() => {});
  await page.waitForTimeout(1500);
  f = await shot('home-smart-calendar');

  const calendarVisible = await page.locator('[class*="sc-"], canvas, .smart-calendar').first().isVisible().catch(() => false);
  const calHeaderText = await page.locator('h1, h2').filter({ hasText: /Smart Calendar/i }).first().textContent().catch(() => null);
  await log('Smart Calendar', calHeaderText ? 'OK' : 'WARN', calHeaderText ? `Header: "${calHeaderText.trim()}"` : 'Header Smart Calendar non trouvé', f);

  // Vérifier pros count dans le calendar
  const prosCount = await page.locator('text=/\\d+ disponibles/i').first().textContent().catch(() => null);
  await log('SC Compteur pros', prosCount ? 'OK' : 'WARN', prosCount || 'Compteur pros non visible', null);

  // Sidebar recommendation card
  const sidebarCard = await page.locator('text=/Recommandation MatchAfro/i').isVisible().catch(() => false);
  await log('SC Sidebar rotation', sidebarCard ? 'OK' : 'WARN', sidebarCard ? 'Carte recommandation visible' : 'Carte recommandation non visible', null);

  // En rotation badge
  const enRotation = await page.locator('text=/En rotation/i').isVisible().catch(() => false);
  await log('SC Badge "En rotation"', enRotation ? 'OK' : 'WARN', enRotation ? 'Badge visible' : 'Badge "En rotation" absent', null);

  // Section Featured / Vedettes
  await page.locator('#vedettes, section').filter({ hasText: /vedettes|artisans/i }).first().scrollIntoViewIfNeeded().catch(() => {});
  await page.waitForTimeout(800);
  f = await shot('home-vedettes');
  const featuredCards = await page.locator('a[href*="/pro/"]').count();
  await log('Featured (vedettes)', featuredCards > 0 ? 'OK' : 'WARN', `${featuredCards} liens profil trouvés sur la home`, f);

  // Test lien profil
  if (featuredCards > 0) {
    const firstProLink = await page.locator('a[href*="/pro/"]').first().getAttribute('href');
    await log('Lien profil', 'INFO', `Premier lien: ${firstProLink}`, null);

    await page.goto(BASE + firstProLink, { waitUntil: 'networkidle', timeout: 10000 });
    f = await shot('pro-profile');
    const proName = await page.locator('h1, h2').first().textContent().catch(() => null);
    const bookingSection = await page.locator('text=/réserver|réservation|calendrier/i').first().isVisible().catch(() => false);
    await log('Page profil pro', proName ? 'OK' : 'FAIL', proName ? `Nom: "${proName.trim().slice(0,40)}"` : 'Nom pro absent', f);
    await log('Section réservation profil', bookingSection ? 'OK' : 'WARN', bookingSection ? 'Section réservation visible' : 'Section réservation non trouvée', null);
  }

  // ─── 2. COMPTE CLIENT ──────────────────────────────────────────
  console.log('\n══ 2. COMPTE CLIENT ══');
  await page.goto(BASE, { waitUntil: 'networkidle', timeout: 10000 });

  // Chercher bouton connexion client
  const clientLoginBtn = await page.locator('button, a').filter({ hasText: /connexion|mon compte|se connecter/i }).first();
  const clientLoginVisible = await clientLoginBtn.isVisible().catch(() => false);
  await log('Bouton connexion client', clientLoginVisible ? 'OK' : 'WARN', clientLoginVisible ? 'Bouton trouvé dans la nav' : 'Bouton connexion client non visible dans la nav', null);

  // Tester /mon-compte directement
  await page.goto(`${BASE}/mon-compte`, { waitUntil: 'networkidle', timeout: 10000 });
  f = await shot('client-mon-compte');
  const monCompteContent = await page.locator('body').textContent();
  const hasLoginForm = monCompteContent.includes('Connexion') || monCompteContent.includes('connexion') || monCompteContent.includes('email') || monCompteContent.includes('Email');
  const hasDashboard = monCompteContent.includes('Mes réservations') || monCompteContent.includes('Mon profil');
  await log('Page /mon-compte', 'INFO',
    hasDashboard ? 'Espace client chargé (connecté)' : hasLoginForm ? 'Formulaire connexion client visible' : 'Contenu indéterminé', f);

  // Test page reset-password
  await page.goto(`${BASE}/reset-password`, { waitUntil: 'networkidle', timeout: 10000 });
  const resetContent = await page.locator('body').textContent();
  await log('Page reset-password', resetContent.length > 50 ? 'OK' : 'WARN', 'Page accessible', null);

  // ─── 3. COMPTE PROFESSIONNEL ───────────────────────────────────
  console.log('\n══ 3. COMPTE PROFESSIONNEL ══');
  await page.goto(`${BASE}/devenir-professionnel`, { waitUntil: 'networkidle', timeout: 10000 });
  f = await shot('become-pro');
  const becomeProContent = await page.locator('body').textContent();
  const hasForm = becomeProContent.includes('nom') || becomeProContent.includes('Nom') || becomeProContent.includes('inscription');
  await log('Page devenir-professionnel', hasForm ? 'OK' : 'WARN', hasForm ? 'Formulaire inscription pro visible' : 'Formulaire absent', f);

  // Tester /dashboard (espace pro)
  await page.goto(`${BASE}/dashboard`, { waitUntil: 'networkidle', timeout: 10000 });
  f = await shot('pro-dashboard');
  const dashContent = await page.locator('body').textContent();
  const isLoginState = dashContent.includes('Connexion') || dashContent.includes('connecter') || dashContent.includes('email');
  const isDashState = dashContent.includes('tableau de bord') || dashContent.includes('Smart Time') || dashContent.includes('calendrier');
  await log('Page /dashboard', isLoginState || isDashState ? 'OK' : 'WARN',
    isDashState ? 'Dashboard pro chargé' : isLoginState ? 'Formulaire connexion pro visible' : 'État indéterminé', f);

  // ─── 4. RÉSERVATION ────────────────────────────────────────────
  console.log('\n══ 4. RÉSERVATION ══');
  await page.goto(`${BASE}/pro/amina-kone-paris`, { waitUntil: 'networkidle', timeout: 10000 });
  f = await shot('reservation-profil');

  // Vérifier présence booking calendar
  const bookingCalendar = await page.locator('text=/choisir|créneau|réserver|disponibilités/i').first().isVisible().catch(() => false);
  await log('Calendrier réservation (page pro)', bookingCalendar ? 'OK' : 'WARN', bookingCalendar ? 'Calendrier visible' : 'Aucun élément de réservation trouvé', f);

  // Tenter de cliquer un créneau
  const slots = await page.locator('[style*="cursor: pointer"], button').filter({ hasText: /09:|10:|11:|14:/i }).count();
  await log('Créneaux cliquables', slots > 0 ? 'OK' : 'WARN', `${slots} créneaux avec horaire trouvés`, null);

  // Scroll vers section réservation
  await page.evaluate(() => { document.getElementById('reservation')?.scrollIntoView(); });
  await page.waitForTimeout(1000);
  f = await shot('reservation-section');
  await log('Section #reservation', 'INFO', 'Screenshot section réservation', f);

  // ─── 5. ADMINISTRATION ─────────────────────────────────────────
  console.log('\n══ 5. ADMINISTRATION ══');
  await page.goto(`${BASE}/admin`, { waitUntil: 'networkidle', timeout: 10000 });
  f = await shot('admin-login');
  const adminContent = await page.locator('body').textContent();
  const hasAdminLogin = adminContent.includes('Admin') || adminContent.includes('admin');
  await log('Page /admin', hasAdminLogin ? 'OK' : 'FAIL', hasAdminLogin ? 'Page admin accessible' : 'Page admin inaccessible', f);

  // Login admin
  const pwdInput = page.locator('input[type="password"]');
  const hasPwdInput = await pwdInput.isVisible().catch(() => false);
  await log('Formulaire login admin', hasPwdInput ? 'OK' : 'WARN', hasPwdInput ? 'Champ mot de passe visible' : 'Champ absent (déjà connecté?)', null);

  if (hasPwdInput) {
    await pwdInput.fill('matchafro2025');
    await page.keyboard.press('Enter');
    await page.waitForTimeout(2000);
    f = await shot('admin-panel');
    const adminPanelContent = await page.locator('body').textContent();
    const isDashboard = adminPanelContent.includes('Statistiques') || adminPanelContent.includes('Professionnels') || adminPanelContent.includes('Fondateurs');
    await log('Admin auth + panel', isDashboard ? 'OK' : 'FAIL', isDashboard ? 'Dashboard admin chargé après login' : 'Login échoué ou panel vide', f);

    if (isDashboard) {
      // Vérifier les stats
      const statsVisible = await page.locator('text=/Pros inscrits|Vérifiés|Actifs/i').first().isVisible().catch(() => false);
      await log('Admin stats', statsVisible ? 'OK' : 'WARN', statsVisible ? 'Stats globales visibles' : 'Stats non trouvées', null);

      // Tester navigation sidebar
      const prosSidebarBtn = await page.locator('button').filter({ hasText: /Professionnels/i }).first();
      if (await prosSidebarBtn.isVisible().catch(() => false)) {
        await prosSidebarBtn.click();
        await page.waitForTimeout(800);
        f = await shot('admin-pros');
        const prosTable = await page.locator('table').isVisible().catch(() => false);
        await log('Admin section Professionnels', prosTable ? 'OK' : 'WARN', prosTable ? 'Tableau pros visible' : 'Tableau absent', f);

        // Vérifier colonne date inscription
        const dateCol = await page.locator('text=/Inscription/i').isVisible().catch(() => false);
        await log('Colonne date inscription', dateCol ? 'OK' : 'WARN', dateCol ? 'Colonne "Inscription" présente' : 'Colonne date inscription absente', null);
      }

      // Tester section notifications
      const notifBtn = await page.locator('button').filter({ hasText: /Notifications/i }).first();
      if (await notifBtn.isVisible().catch(() => false)) {
        await notifBtn.click();
        await page.waitForTimeout(800);
        f = await shot('admin-notifs');
        const notifContent = await page.locator('body').textContent();
        const hasNotifSection = notifContent.includes('Notification') || notifContent.includes('notification');
        await log('Admin notifications', hasNotifSection ? 'OK' : 'WARN', hasNotifSection ? 'Section notifications chargée' : 'Section notifications vide/absente', f);
      }

      // Tester section fondateurs
      const foundersBtn = await page.locator('button').filter({ hasText: /Fondateurs/i }).first();
      if (await foundersBtn.isVisible().catch(() => false)) {
        await foundersBtn.click();
        await page.waitForTimeout(800);
        f = await shot('admin-fondateurs');
        const progressBar = await page.locator('text=/places/i').first().isVisible().catch(() => false);
        await log('Admin fondateurs', progressBar ? 'OK' : 'WARN', progressBar ? 'Barre de progression fondateurs visible' : 'Section fondateurs vide', f);
      }
    }
  }

  // ─── TESTS ROUTES 404 & ERREURS ─────────────────────────────
  console.log('\n══ ROUTES & ERREURS ══');
  const routes404 = ['/inexistant', '/pro/pro-qui-nexiste-pas'];
  for (const r of routes404) {
    await page.goto(`${BASE}${r}`, { waitUntil: 'networkidle', timeout: 8000 });
    const content = await page.locator('body').textContent();
    const isHome = await page.url().includes(BASE);
    await log(`Route ${r}`, 'INFO', isHome ? 'Redirige vers home (fallback)' : `Contenu: "${content.slice(0,60)}"`, null);
  }

  // ─── RAPPORT FINAL ─────────────────────────────────────────────
  await browser.close();

  console.log('\n\n════════ RAPPORT ════════');
  const ok   = results.filter(r => r.status === 'OK').length;
  const warn = results.filter(r => r.status === 'WARN').length;
  const fail = results.filter(r => r.status === 'FAIL').length;
  const info = results.filter(r => r.status === 'INFO').length;
  console.log(`OK: ${ok} | WARN: ${warn} | FAIL: ${fail} | INFO: ${info}`);
  console.log(`Screenshots: ${DIR}`);

  fs.writeFileSync(
    'C:\\Users\\kasda\\OneDrive\\Desktop\\matchafro\\audit-results.json',
    JSON.stringify({ summary: { ok, warn, fail, info }, results }, null, 2)
  );
  console.log('Results saved to audit-results.json');
}

run().catch(e => { console.error('AUDIT ERROR:', e.message); process.exit(1); });
