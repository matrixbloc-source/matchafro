import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '../context/AppContext.jsx';
import { uploadPhoto, deletePhoto, validatePhotoFile, MAX_PHOTOS, MAX_BYTES } from '../lib/storage.js';
import { PAYS, getRegions, getDepts, getVilles, getArrs, hasArrs } from '../data/locations.js';
import { supabase, isSupabaseEnabled } from '../lib/supabase.js';

const STEPS = ['Identité', 'Localisation', 'Services', 'Photos', 'Confirmation'];

const CATEGORIES_LIST = [
  { id: 'tresses',    label: 'Tresses africaines',   icon: '🌿' },
  { id: 'knotless',  label: 'Knotless braids',       icon: '✨' },
  { id: 'vanilles',  label: 'Vanilles & twists',     icon: '🌀' },
  { id: 'locks',     label: 'Locks & dreadlocks',    icon: '🔒' },
  { id: 'perruques', label: 'Perruques & wigs',      icon: '💫' },
  { id: 'barber',    label: 'Barbier',                icon: '✂️' },
  { id: 'maquillage',label: 'Maquillage',             icon: '💄' },
  { id: 'onglerie',  label: 'Onglerie',               icon: '💅' },
];

function StepDots({ current }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: 36 }}>
      {STEPS.map((s, i) => (
        <div key={s} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{
            width: 30, height: 30, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 12, fontWeight: 700,
            background: i < current ? '#059669' : i === current ? '#D97706' : '#E5E7EB',
            color: i <= current ? '#fff' : '#9CA3AF',
            transition: 'all 0.3s',
          }}>
            {i < current ? '✓' : i + 1}
          </div>
          {i < STEPS.length - 1 && (
            <div style={{ width: 32, height: 2, background: i < current ? '#059669' : '#E5E7EB', borderRadius: 1, transition: 'background 0.3s' }} />
          )}
        </div>
      ))}
    </div>
  );
}

/* ─── Step 1 : Identité ────────────────────────────── */
function StepIdentite({ data, set, auth, setAuth }) {
  const pwdMismatch = auth.password && auth.confirmPassword && auth.password !== auth.confirmPassword;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <Row>
        <Field label="Prénom & Nom *" value={data.name} onChange={v => set('name', v)} placeholder="Amina Koné" />
        <Field label="Nom du salon" value={data.salonName} onChange={v => set('salonName', v)} placeholder="Salon Amina" />
      </Row>
      <Field label="Description courte *" value={data.description} onChange={v => set('description', v)} placeholder="Spécialisée en tresses africaines et knotless depuis 8 ans..." type="textarea" />
      <Row>
        <Field label="Téléphone *" value={data.phone} onChange={v => set('phone', v)} placeholder="+33 6 12 34 56 78" />
        <Field label="WhatsApp" value={data.whatsapp} onChange={v => set('whatsapp', v)} placeholder="+33 6 12 34 56 78" />
      </Row>
      <Row>
        <Field label="Instagram" value={data.instagram} onChange={v => set('instagram', v)} placeholder="@aminakone_beaute" />
        <Field label="Email *" value={data.email} onChange={v => set('email', v)} placeholder="contact@aminakone.fr" type="email" />
      </Row>

      {/* Mot de passe du compte */}
      <div style={{ background: '#F9FAFB', borderRadius: 14, padding: '16px', border: '1.5px solid #E5E7EB' }}>
        <p style={{ ...label12, marginBottom: 12 }}>Mot de passe du compte *</p>
        <Row>
          <Field label="Mot de passe *" value={auth.password} onChange={v => setAuth(a => ({ ...a, password: v }))} placeholder="6 caractères minimum" type="password" />
          <Field label="Confirmer *" value={auth.confirmPassword} onChange={v => setAuth(a => ({ ...a, confirmPassword: v }))} placeholder="••••••••" type="password" />
        </Row>
        {pwdMismatch && (
          <p style={{ fontSize: 12, color: '#DC2626', marginTop: 6, fontFamily: 'Inter, sans-serif' }}>
            Les mots de passe ne correspondent pas.
          </p>
        )}
        {auth.password && auth.password.length < 6 && (
          <p style={{ fontSize: 12, color: '#D97706', marginTop: 6, fontFamily: 'Inter, sans-serif' }}>
            Minimum 6 caractères.
          </p>
        )}
      </div>

      <div>
        <label style={label12}>Catégories *</label>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 8 }}>
          {CATEGORIES_LIST.map(c => {
            const active = (data.categories || []).includes(c.id);
            return (
              <button
                key={c.id}
                type="button"
                onClick={() => {
                  const cats = data.categories || [];
                  set('categories', active ? cats.filter(x => x !== c.id) : [...cats, c.id]);
                }}
                style={{
                  padding: '8px 14px', borderRadius: 20, border: `1.5px solid ${active ? '#D97706' : '#E5E7EB'}`,
                  background: active ? '#FFFBEB' : '#fff', color: active ? '#92400E' : '#374151',
                  fontSize: 13, fontWeight: active ? 700 : 400, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6,
                  transition: 'all 0.15s', fontFamily: 'Inter, sans-serif',
                }}
              >
                {c.icon} {c.label}
              </button>
            );
          })}
        </div>
      </div>

      <label style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 13, color: '#374151', cursor: 'pointer' }}>
        <input type="checkbox" checked={!!data.homeService} onChange={e => set('homeService', e.target.checked)}
          style={{ width: 16, height: 16, accentColor: '#D97706' }} />
        Je propose les déplacements à domicile
      </label>
    </div>
  );
}

/* ─── Step 2 : Localisation ──────────────────────── */
function StepLocalisation({ data, set }) {
  const regions    = getRegions(data.pays_id || 'FR');
  const depts      = getDepts(data.region_id || '');
  const villes     = getVilles(data.dept_id || '');
  const arrs       = getArrs(data.ville_id || '');
  const showArr    = hasArrs(data.ville_id || '');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div>
        <label style={label12}>Pays *</label>
        <select value={data.pays_id || 'FR'} onChange={e => { set('pays_id', e.target.value); set('region_id',''); set('dept_id',''); set('ville_id',''); set('arr_id',''); }} style={selectStyle}>
          <optgroup label="🇫🇷 France métropolitaine">
            {PAYS.filter(p => p.group === 'France').map(p => <option key={p.id} value={p.id}>{p.flag} {p.name}</option>)}
          </optgroup>
          <optgroup label="🌊 France d'Outre-mer">
            {PAYS.filter(p => p.group === 'Outre-mer').map(p => <option key={p.id} value={p.id}>{p.flag} {p.name}</option>)}
          </optgroup>
          <optgroup label="🌍 Afrique francophone">
            {PAYS.filter(p => p.group === 'Afrique').map(p => <option key={p.id} value={p.id}>{p.flag} {p.name}</option>)}
          </optgroup>
        </select>
      </div>

      {regions.length > 0 && (
        <Select label="Région *" value={data.region_id || ''} onChange={v => { set('region_id', v); set('dept_id',''); set('ville_id',''); set('arr_id',''); }}
          options={regions} />
      )}
      {depts.length > 0 && (
        <Select label="Département *" value={data.dept_id || ''} onChange={v => { set('dept_id', v); set('ville_id',''); set('arr_id',''); }}
          options={depts} />
      )}
      {villes.length > 0 && (
        <Select label="Ville *" value={data.ville_id || ''} onChange={v => { set('ville_id', v); set('arr_id',''); }}
          options={villes} />
      )}
      {showArr && arrs.length > 0 && (
        <Select label="Arrondissement *" value={data.arr_id || ''} onChange={v => set('arr_id', v)}
          options={arrs} />
      )}

      <Field label="Adresse précise *" value={data.address} onChange={v => set('address', v)} placeholder="12 rue des Lilas, 75018 Paris" />
      <Field label="Ville (nom libre)" value={data.city} onChange={v => set('city', v)} placeholder="Paris 18e" />
    </div>
  );
}

/* ─── Step 3 : Services ──────────────────────────── */
function StepServices({ data, set }) {
  const services = data.services || [];

  function addService() {
    set('services', [...services, { id: Date.now().toString(), name: '', duration: 60, price: '' }]);
  }

  function updateService(id, field, value) {
    set('services', services.map(s => s.id === id ? { ...s, [field]: value } : s));
  }

  function removeService(id) {
    set('services', services.filter(s => s.id !== id));
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {services.map((s, i) => (
        <div key={s.id} style={{ background: '#F9FAFB', borderRadius: 14, padding: 16, border: '1.5px solid #E5E7EB', position: 'relative' }}>
          <button onClick={() => removeService(s.id)} style={{ position: 'absolute', top: 10, right: 10, background: 'none', border: 'none', fontSize: 16, cursor: 'pointer', color: '#9CA3AF' }}>✕</button>
          <p style={{ fontSize: 12, fontWeight: 700, color: '#9CA3AF', marginBottom: 10 }}>PRESTATION {i + 1}</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <Field label="Nom de la prestation *" value={s.name} onChange={v => updateService(s.id, 'name', v)} placeholder="Tresses box braids" />
            <Row>
              <div>
                <label style={label12}>Durée (min) *</label>
                <select value={s.duration} onChange={e => updateService(s.id, 'duration', Number(e.target.value))} style={selectStyle}>
                  {[30, 60, 90, 120, 150, 180, 240, 300, 360].map(d => (
                    <option key={d} value={d}>{d < 60 ? `${d} min` : `${d/60}h${d%60 > 0 ? d%60 : ''}`}</option>
                  ))}
                </select>
              </div>
              <Field label="Prix (€) *" value={s.price} onChange={v => updateService(s.id, 'price', v)} placeholder="80" type="number" />
            </Row>
          </div>
        </div>
      ))}

      <button onClick={addService} style={{ border: '2px dashed #E5E7EB', borderRadius: 14, padding: '14px', background: 'none', cursor: 'pointer', fontSize: 14, color: '#9CA3AF', fontWeight: 600, fontFamily: 'Inter, sans-serif' }}>
        + Ajouter une prestation
      </button>

      <div style={{ background: '#FFFBEB', borderRadius: 12, padding: '12px 14px', fontSize: 12, color: '#92400E', border: '1px solid #FDE68A' }}>
        💡 Ajoutez au minimum 1 prestation avec son tarif. Vous pourrez modifier vos prix à tout moment depuis votre tableau de bord.
      </div>
    </div>
  );
}

/* ─── Step 4 : Photos ───────────────────────────── */

function PhotoCard({ f, onRemove }) {
  return (
    <div style={{ position: 'relative', borderRadius: 12, overflow: 'hidden', aspectRatio: '1', background: '#F3F4F6', boxShadow: '0 1px 6px rgba(0,0,0,0.08)' }}>
      <img src={f.previewUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />

      {/* Barre de progression upload */}
      {f.status === 'uploading' && (
        <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.55)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
          <div style={{ width: '76%', height: 6, background: 'rgba(255,255,255,0.2)', borderRadius: 3, overflow: 'hidden' }}>
            <div style={{ height: '100%', background: '#F59E0B', borderRadius: 3, width: `${f.progress}%`, transition: 'width 0.25s ease' }} />
          </div>
          <span style={{ fontSize: 11, color: '#fff', fontWeight: 700 }}>{f.progress}%</span>
        </div>
      )}

      {/* Badge succès */}
      {f.status === 'done' && (
        <div style={{ position: 'absolute', top: 6, left: 6, width: 22, height: 22, borderRadius: '50%', background: '#059669', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, color: '#fff', fontWeight: 900 }}>✓</div>
      )}

      {/* Overlay erreur */}
      {f.status === 'error' && (
        <div style={{ position: 'absolute', inset: 0, background: 'rgba(220,38,38,0.82)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 5, padding: 8 }}>
          <span style={{ fontSize: 20 }}>⚠️</span>
          <span style={{ fontSize: 9, color: '#fff', textAlign: 'center', fontWeight: 700, lineHeight: 1.4 }}>{f.errorMsg}</span>
        </div>
      )}

      {/* Bouton supprimer */}
      {f.status !== 'uploading' && (
        <button
          type="button"
          onClick={onRemove}
          aria-label="Supprimer cette photo"
          style={{ position: 'absolute', top: 6, right: 6, width: 24, height: 24, borderRadius: '50%', background: 'rgba(0,0,0,0.65)', border: 'none', color: '#fff', cursor: 'pointer', fontSize: 13, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Inter, sans-serif' }}
        >✕</button>
      )}
    </div>
  );
}

function StepPhotos({ data, set, proId }) {
  const [files, setFiles]     = useState([]);
  const [isDragging, setDrag] = useState(false);
  const inputRef              = useRef(null);
  const doneRef               = useRef([]); // { id, url, path }[]

  // Restaure les photos déjà uploadées si l'utilisateur revient sur cette étape
  useEffect(() => {
    if ((data.photos || []).length > 0 && files.length === 0) {
      const restored = data.photos.map(url => {
        const id = Math.random().toString(36).slice(2);
        doneRef.current.push({ id, url, path: null });
        return { id, previewUrl: url, status: 'done', uploadedUrl: url, progress: 100, errorMsg: null };
      });
      setFiles(restored);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  async function handleFileList(list) {
    const available = MAX_PHOTOS - files.length;
    if (available <= 0) return;

    const entries = [...list].slice(0, available).map(file => {
      const err = validatePhotoFile(file);
      return {
        id:         Math.random().toString(36).slice(2),
        previewUrl: URL.createObjectURL(file),
        file,
        status:     err ? 'error' : 'pending',
        errorMsg:   err,
        uploadedUrl: null,
        progress:    0,
      };
    });

    setFiles(prev => [...prev, ...entries]);

    // Upload séquentiel pour ne pas saturer la connexion
    for (const e of entries.filter(x => x.status === 'pending')) {
      await uploadOne(e);
    }
  }

  async function uploadOne(entry) {
    // Passer en état "uploading" avec barre animée
    setFiles(prev => prev.map(f => f.id === entry.id ? { ...f, status: 'uploading', progress: 6 } : f));

    let prog = 6;
    const tick = setInterval(() => {
      prog = Math.min(prog + 13, 88);
      setFiles(prev => prev.map(f =>
        f.id === entry.id && f.status === 'uploading' ? { ...f, progress: prog } : f
      ));
    }, 280);

    const result = await uploadPhoto(proId, entry.id, entry.file);
    clearInterval(tick);

    let uploadedUrl;
    if (result.devMode) {
      // Pas de Supabase Storage → blob URL pour prévisualisation locale
      uploadedUrl = entry.previewUrl;
    } else if (result.error) {
      setFiles(prev => prev.map(f =>
        f.id === entry.id ? { ...f, status: 'error', errorMsg: result.error, progress: 0 } : f
      ));
      return;
    } else {
      uploadedUrl = result.url;
    }

    doneRef.current = [
      ...doneRef.current.filter(x => x.id !== entry.id),
      { id: entry.id, url: uploadedUrl, path: result.path },
    ];
    setFiles(prev => prev.map(f =>
      f.id === entry.id ? { ...f, status: 'done', uploadedUrl, progress: 100 } : f
    ));
    set('photos', doneRef.current.map(x => x.url));
  }

  function removeFile(id) {
    const f    = files.find(x => x.id === id);
    const done = doneRef.current.find(x => x.id === id);

    if (f?.previewUrl?.startsWith('blob:')) URL.revokeObjectURL(f.previewUrl);
    if (done?.path) deletePhoto(done.path); // fire-and-forget

    doneRef.current = doneRef.current.filter(x => x.id !== id);
    setFiles(prev => prev.filter(f => f.id !== id));
    set('photos', doneRef.current.map(x => x.url));
  }

  const countDone     = files.filter(f => f.status === 'done').length;
  const countUploading = files.filter(f => f.status === 'uploading').length;
  const countErrors   = files.filter(f => f.status === 'error').length;
  const canAdd        = files.length < MAX_PHOTOS;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

      {/* Zone drag & drop / bouton */}
      {canAdd && (
        <div
          role="button"
          tabIndex={0}
          aria-label="Zone d'upload de photos"
          onDragOver={e => { e.preventDefault(); setDrag(true); }}
          onDragLeave={() => setDrag(false)}
          onDrop={e => { e.preventDefault(); setDrag(false); handleFileList(e.dataTransfer.files); }}
          onClick={() => inputRef.current?.click()}
          onKeyDown={e => e.key === 'Enter' && inputRef.current?.click()}
          style={{
            border: `2px dashed ${isDragging ? '#D97706' : '#E5E7EB'}`,
            borderRadius: 16, padding: '32px 20px', textAlign: 'center',
            cursor: 'pointer', transition: 'all 0.2s',
            background: isDragging ? '#FFFBEB' : '#FAFAFA',
            userSelect: 'none',
          }}
        >
          <div style={{ fontSize: 44, marginBottom: 10 }}>📸</div>
          <p style={{ fontWeight: 800, fontSize: 16, color: '#111', marginBottom: 6 }}>
            Glissez vos photos ici
          </p>
          <p style={{ fontSize: 13, color: '#9CA3AF', marginBottom: 16 }}>
            ou sélectionnez depuis votre{' '}
            <strong style={{ color: '#D97706' }}>téléphone ou ordinateur</strong>
          </p>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 7, background: '#D97706', color: '#fff', borderRadius: 10, padding: '10px 22px', fontSize: 14, fontWeight: 700, boxShadow: '0 2px 10px rgba(217,119,6,0.35)' }}>
            📂 Choisir des photos
          </span>
          <p style={{ fontSize: 11, color: '#B0B7C0', marginTop: 14 }}>
            JPG · PNG · WEBP · max {MAX_BYTES / 1024 / 1024} Mo · {MAX_PHOTOS - files.length} place(s) restante(s)
          </p>
        </div>
      )}

      {!canAdd && (
        <div style={{ background: '#ECFDF5', borderRadius: 12, padding: '12px 16px', fontSize: 13, color: '#065F46', border: '1px solid #6EE7B7', textAlign: 'center', fontWeight: 700 }}>
          ✓ Limite de {MAX_PHOTOS} photos atteinte
        </div>
      )}

      {/* Input fichier caché */}
      <input
        ref={inputRef}
        type="file"
        multiple
        accept="image/*"
        style={{ display: 'none' }}
        onChange={e => { handleFileList(e.target.files); e.target.value = ''; }}
      />

      {/* Barre de statut globale */}
      {files.length > 0 && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#F9FAFB', borderRadius: 10, padding: '10px 14px', fontSize: 12, border: '1px solid #F3F4F6' }}>
          <span style={{ color: '#6B7280' }}>
            {countDone} / {files.length - countErrors} photo{(files.length - countErrors) !== 1 ? 's' : ''} prête{countDone !== 1 ? 's' : ''}
          </span>
          {countUploading > 0 && <span style={{ color: '#D97706', fontWeight: 700 }}>⏳ Upload en cours...</span>}
          {countUploading === 0 && countDone > 0 && countErrors === 0 && <span style={{ color: '#059669', fontWeight: 700 }}>✓ Toutes les photos sont prêtes</span>}
          {countErrors > 0 && <span style={{ color: '#DC2626', fontWeight: 600 }}>{countErrors} erreur(s)</span>}
        </div>
      )}

      {/* Grille */}
      {files.length > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
          {files.map(f => (
            <PhotoCard key={f.id} f={f} onRemove={() => removeFile(f.id)} />
          ))}
        </div>
      )}

      {/* Conseil */}
      {files.length === 0 && (
        <div style={{ background: '#FFFBEB', borderRadius: 12, padding: '12px 14px', fontSize: 12, color: '#92400E', border: '1px solid #FDE68A' }}>
          💡 Des photos de qualité augmentent vos réservations de 3×. Ajoutez des photos de vos réalisations, de votre salon et de votre espace de travail.
        </div>
      )}
    </div>
  );
}

/* ─── Step 5 : Confirmation ─────────────────────── */
function StepConfirmation({ data, founderCount, founderLimit }) {
  const slotsLeft = founderLimit - founderCount;
  const willBeFounder = founderCount < founderLimit;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {willBeFounder && (
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
          style={{ background: 'linear-gradient(135deg, #1a1a1a, #2d2d2d)', borderRadius: 16, padding: 20, textAlign: 'center' }}>
          <div style={{ fontSize: 36, marginBottom: 8 }}>🌟</div>
          <p style={{ color: '#D97706', fontWeight: 800, fontSize: 16, marginBottom: 6 }}>Vous devenez Fondatrice !</p>
          <p style={{ color: '#e0e0e0', fontSize: 13 }}>Il reste {slotsLeft} places sur {founderLimit}. Vous bénéficiez de l'accès gratuit à vie à MatchAfro et du badge Fondateur.</p>
        </motion.div>
      )}

      <div style={{ background: '#F9FAFB', borderRadius: 14, padding: 16, border: '1px solid #E5E7EB', fontSize: 13, color: '#374151' }}>
        <p style={{ fontWeight: 700, marginBottom: 12, fontSize: 14 }}>Récapitulatif de votre profil</p>
        <Row2>
          <Info label="Nom" value={data.name} />
          <Info label="Salon" value={data.salonName || '—'} />
        </Row2>
        <Row2>
          <Info label="Email" value={data.email} />
          <Info label="Téléphone" value={data.phone} />
        </Row2>
        <Info label="Catégories" value={(data.categories || []).map(c => CATEGORIES_LIST.find(x=>x.id===c)?.label).filter(Boolean).join(', ')} />
        <Info label="Prestations" value={`${(data.services||[]).length} prestation(s)`} />
        <Info label="Photos" value={`${(data.photos||[]).length} photo(s)`} />
        <Info label="Déplacements domicile" value={data.homeService ? 'Oui' : 'Non'} />
      </div>

      <div style={{ fontSize: 11, color: '#9CA3AF', lineHeight: 1.6 }}>
        En soumettant ce formulaire, vous acceptez les conditions générales de MatchAfro. Votre profil sera vérifié par notre équipe sous 24h.
      </div>
    </div>
  );
}

/* ─── Page principale ──────────────────────────── */
export default function BecomeProPage() {
  const navigate = useNavigate();
  const { registerPro, founderCount, founderLimit } = useApp();

  useEffect(() => {
    document.title = 'Devenir professionnel | MatchAfro';
    return () => { document.title = 'MatchAfro — La beauté afro à portée de main'; };
  }, []);

  // Pré-générer l'ID pro pour que l'upload Storage utilise le bon chemin avant inscription
  const [proId] = useState(() => 'pro_' + Math.random().toString(36).slice(2, 11));

  const [step, setStep] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const [createdSlug, setCreatedSlug] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [auth, setAuth] = useState({ password: '', confirmPassword: '' });
  const [data, setData] = useState({
    name: '', salonName: '', description: '', phone: '', whatsapp: '', instagram: '', email: '',
    pays_id: 'FR', region_id: '', dept_id: '', ville_id: '', arr_id: '', address: '', city: '',
    categories: [], homeService: false, services: [], photos: [],
  });

  function set(key, value) {
    setData(d => ({ ...d, [key]: value }));
  }

  function canNext() {
    if (step === 0) return data.name.trim() && data.email.trim() && data.phone.trim() && data.categories.length > 0 && data.description.trim()
      && auth.password.length >= 6 && auth.password === auth.confirmPassword;
    if (step === 1) return data.address.trim();
    if (step === 2) return (data.services || []).length > 0 && (data.services || []).every(s => s.name && s.price);
    if (step === 3) return (data.photos || []).length >= 1;
    return true;
  }

  async function handleSubmit() {
    setSubmitting(true);
    setSubmitError('');

    if (isSupabaseEnabled && supabase) {
      const { error: authErr } = await supabase.auth.signUp({
        email: data.email.trim().toLowerCase(),
        password: auth.password,
      });

      if (authErr) {
        const msg = authErr.message || '';
        if (msg.toLowerCase().includes('already registered') || msg.toLowerCase().includes('user_already_exists')) {
          setSubmitError('Un compte existe déjà avec cet email. Connectez-vous via "Espace pro" en haut de page.');
        } else {
          setSubmitError(msg || 'Erreur lors de la création du compte. Réessayez.');
        }
        setSubmitting(false);
        return;
      }
    }

    const pro = registerPro({
      ...data,
      gradient: 'linear-gradient(135deg, #D97706, #F59E0B)',
      initials: data.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase(),
    }, proId);
    setCreatedSlug(pro.slug);
    setSubmitting(false);
    setSubmitted(true);
  }

  if (submitted) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#F9FAFB', padding: 20 }}>
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} style={{ background: '#fff', borderRadius: 24, padding: 40, maxWidth: 460, width: '100%', textAlign: 'center', boxShadow: '0 8px 40px rgba(0,0,0,0.08)' }}>
          <div style={{ fontSize: 60, marginBottom: 16 }}>🎉</div>
          <h2 style={{ fontSize: 24, fontWeight: 800, color: '#0F0F0F', marginBottom: 12 }}>Bienvenue sur MatchAfro !</h2>
          <p style={{ color: '#6B7280', fontSize: 14, marginBottom: 28 }}>Votre profil a été soumis. Notre équipe le validera sous 24h. En attendant, découvrez votre page publique.</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <button onClick={() => navigate(`/pro/${createdSlug}`)} className="btn-primary" style={{ borderRadius: 14, padding: '13px' }}>
              Voir mon profil
            </button>
            <button onClick={() => navigate('/dashboard')} style={{ ...ghostBtn, borderRadius: 14, padding: '13px' }}>
              Accéder à mon tableau de bord
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  const stepComponents = [
    <StepIdentite data={data} set={set} auth={auth} setAuth={setAuth} />,
    <StepLocalisation data={data} set={set} />,
    <StepServices data={data} set={set} />,
    <StepPhotos data={data} set={set} proId={proId} />,
    <StepConfirmation data={data} founderCount={founderCount} founderLimit={founderLimit} />,
  ];

  return (
    <div style={{ minHeight: '100vh', background: '#F9FAFB' }}>
      {/* Hero */}
      <div style={{ background: 'linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)', padding: '60px 20px 40px', textAlign: 'center' }}>
        <p style={{ color: '#D97706', fontSize: 12, fontWeight: 700, letterSpacing: 3, marginBottom: 12 }}>DEVENIR PROFESSIONNEL</p>
        <h1 style={{ fontSize: 'clamp(28px,5vw,48px)', fontWeight: 900, color: '#fff', marginBottom: 12 }}>
          Rejoignez la plateforme<br />
          <span style={{ background: 'linear-gradient(135deg, #D97706, #F59E0B)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>n°1 de la beauté afro</span>
        </h1>
        <p style={{ color: '#9CA3AF', fontSize: 14 }}>Inscription gratuite · Profil vérifié · Réservations automatiques</p>
      </div>

      {/* Form */}
      <div style={{ maxWidth: 640, margin: '0 auto', padding: '32px 20px 80px' }}>
        <StepDots current={step} />

        <div style={{ background: '#fff', borderRadius: 24, padding: '28px 24px', boxShadow: '0 4px 24px rgba(0,0,0,0.06)', border: '1px solid #F3F4F6' }}>
          <h2 style={{ fontSize: 18, fontWeight: 800, color: '#0F0F0F', marginBottom: 6 }}>{STEPS[step]}</h2>
          <p style={{ fontSize: 13, color: '#9CA3AF', marginBottom: 24 }}>Étape {step + 1} sur {STEPS.length}</p>

          <AnimatePresence mode="wait">
            <motion.div key={step} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.2 }}>
              {stepComponents[step]}
            </motion.div>
          </AnimatePresence>

          <div style={{ display: 'flex', gap: 12, marginTop: 28 }}>
            {step > 0 && (
              <button onClick={() => setStep(s => s - 1)} style={{ ...ghostBtn, flex: 1, borderRadius: 14, padding: '12px' }}>
                ← Précédent
              </button>
            )}
            {step < STEPS.length - 1 ? (
              <button
                onClick={() => setStep(s => s + 1)}
                disabled={!canNext()}
                className="btn-primary"
                style={{ flex: 2, borderRadius: 14, padding: '12px', opacity: canNext() ? 1 : 0.4 }}
              >
                Suivant →
              </button>
            ) : (
              <div style={{ flex: 2, display: 'flex', flexDirection: 'column', gap: 10 }}>
                {submitError && (
                  <div style={{ background: '#FEF2F2', border: '1px solid #FCA5A5', borderRadius: 10, padding: '10px 14px', fontSize: 13, color: '#991B1B', fontFamily: 'Inter, sans-serif', fontWeight: 500 }}>
                    ⚠ {submitError}
                  </div>
                )}
                <button onClick={handleSubmit} disabled={submitting} className="btn-primary" style={{ borderRadius: 14, padding: '12px', opacity: submitting ? 0.65 : 1, cursor: submitting ? 'not-allowed' : 'pointer' }}>
                  {submitting ? '⏳ Création du compte…' : '🚀 Créer mon profil'}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── Helpers UI ──────────────────────────────────── */
function Field({ label, value, onChange, placeholder, type = 'text' }) {
  // Stable ID : on utilise le label slug (pas de hook, composant pur)
  const id = `field-${label.replace(/[^a-z0-9]/gi, '-').toLowerCase()}`;
  const required = label.endsWith('*');
  return (
    <div style={{ flex: 1 }}>
      <label htmlFor={id} style={label12}>{label}</label>
      {type === 'textarea' ? (
        <textarea
          id={id} value={value} onChange={e => onChange(e.target.value)}
          placeholder={placeholder} rows={3} required={required}
          aria-required={required}
          style={{ ...inputStyle, resize: 'vertical' }}
        />
      ) : (
        <input
          id={id} type={type} value={value} onChange={e => onChange(e.target.value)}
          placeholder={placeholder} required={required}
          aria-required={required}
          style={inputStyle}
        />
      )}
    </div>
  );
}

function Row({ children }) {
  return <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>{children}</div>;
}

function Row2({ children }) {
  return <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 8 }}>{children}</div>;
}

function Info({ label, value }) {
  return (
    <div style={{ flex: 1, minWidth: 120, marginBottom: 4 }}>
      <span style={{ fontSize: 11, fontWeight: 700, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: 1 }}>{label}</span>
      <p style={{ fontSize: 13, color: '#111', fontWeight: 500, marginTop: 1 }}>{value || '—'}</p>
    </div>
  );
}

function Select({ label, value, onChange, options }) {
  const id = `select-${label.replace(/[^a-z0-9]/gi, '-').toLowerCase()}`;
  return (
    <div>
      <label htmlFor={id} style={label12}>{label}</label>
      <select id={id} value={value} onChange={e => onChange(e.target.value)} style={selectStyle} aria-required={label.endsWith('*')}>
        <option value="">Sélectionner...</option>
        {options.map(o => <option key={o.id} value={o.id}>{o.name}</option>)}
      </select>
    </div>
  );
}

const label12 = { display: 'block', fontSize: 11, fontWeight: 700, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: 5 };
const inputStyle = { display: 'block', width: '100%', border: '1.5px solid #E5E7EB', borderRadius: 10, padding: '11px 12px', fontSize: 14, color: '#111', background: '#fff', fontFamily: 'Inter, sans-serif', boxSizing: 'border-box' };
const selectStyle = { display: 'block', width: '100%', border: '1.5px solid #E5E7EB', borderRadius: 10, padding: '11px 12px', fontSize: 14, color: '#111', background: '#fff', fontFamily: 'Inter, sans-serif', appearance: 'none' };
const ghostBtn = { background: '#F9FAFB', border: '1.5px solid #E5E7EB', cursor: 'pointer', fontSize: 14, fontWeight: 600, color: '#374151', fontFamily: 'Inter, sans-serif' };
const primaryBtnSmall = { background: '#D97706', color: '#fff', border: 'none', borderRadius: 10, padding: '11px 16px', fontSize: 14, fontWeight: 700, cursor: 'pointer', fontFamily: 'Inter, sans-serif', whiteSpace: 'nowrap' };
