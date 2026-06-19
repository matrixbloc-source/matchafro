/**
 * CompletionModal — MatchAfro Phase 2
 * Déclenché quand le pro clique "Terminer RDV".
 * Oblige l'upload d'une photo avant de clôturer la prestation.
 */

import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '../context/AppContext.jsx';
import { validatePhotoFile } from '../lib/storage.js';
import { formatTimeDisplay } from '../lib/smartTimeEngine.js';

const EASE = [0.22, 1, 0.36, 1];

export default function CompletionModal({ booking, onClose }) {
  const { completeBookingWithPhoto } = useApp();

  const [file,       setFile]       = useState(null);
  const [preview,    setPreview]     = useState(null);
  const [uploading,  setUploading]   = useState(false);
  const [error,      setError]       = useState(null);
  const [done,       setDone]        = useState(false);
  const inputRef = useRef(null);

  function pickFile(e) {
    const f = e.target.files?.[0];
    if (!f) return;
    const err = validatePhotoFile(f);
    if (err) { setError(err); return; }
    setError(null);
    setFile(f);
    setPreview(URL.createObjectURL(f));
  }

  function dropFile(e) {
    e.preventDefault();
    const f = e.dataTransfer.files?.[0];
    if (!f) return;
    const err = validatePhotoFile(f);
    if (err) { setError(err); return; }
    setError(null);
    setFile(f);
    setPreview(URL.createObjectURL(f));
  }

  async function handleSubmit() {
    if (!file || uploading) return;
    setUploading(true);
    setError(null);
    const result = await completeBookingWithPhoto(booking.id, file);
    setUploading(false);
    if (result.error) { setError(result.error); return; }
    setDone(true);
    setTimeout(onClose, 2200);
  }

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      onClick={onClose}
      style={{ position: 'fixed', inset: 0, background: 'rgba(11,11,12,0.72)', backdropFilter: 'blur(8px)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}
    >
      <motion.div
        initial={{ scale: 0.94, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.94, y: 20 }}
        transition={{ duration: 0.32, ease: EASE }}
        onClick={e => e.stopPropagation()}
        style={{ background: '#fff', borderRadius: 24, padding: 28, maxWidth: 420, width: '100%', boxShadow: '0 40px 80px rgba(0,0,0,0.28)' }}
      >
        {done ? (
          <div style={{ textAlign: 'center', padding: '12px 0' }}>
            <div style={{ fontSize: 52, marginBottom: 14 }}>✅</div>
            <p style={{ fontSize: 17, fontWeight: 800, color: '#059669', margin: '0 0 6px', fontFamily: 'Inter, sans-serif' }}>Prestation clôturée !</p>
            <p style={{ fontSize: 13, color: '#6B7280', fontFamily: 'Inter, sans-serif' }}>La photo a été ajoutée à votre galerie.</p>
          </div>
        ) : (
          <>
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 20 }}>
              <div>
                <p style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', color: '#9A5F2F', margin: '0 0 4px', fontFamily: 'Inter, sans-serif' }}>
                  Fin de prestation
                </p>
                <h2 style={{ fontSize: 18, fontWeight: 900, color: '#0B0B0C', margin: 0, fontFamily: 'Inter, sans-serif' }}>
                  {booking.clientName}
                </h2>
                <p style={{ fontSize: 13, color: '#8B6D5A', margin: '3px 0 0', fontFamily: 'Inter, sans-serif' }}>
                  {booking.service} · {formatTimeDisplay(booking.startTime)}
                </p>
              </div>
              <button onClick={onClose} style={{ background: '#F4F1EC', border: 'none', borderRadius: 8, width: 34, height: 34, cursor: 'pointer', fontSize: 15, color: '#0B0B0C', flexShrink: 0 }}>✕</button>
            </div>

            {/* Zone photo */}
            <div
              onDragOver={e => e.preventDefault()}
              onDrop={dropFile}
              onClick={() => !file && inputRef.current?.click()}
              style={{
                border: `2px dashed ${file ? '#C9863A' : '#E8D7C2'}`,
                borderRadius: 16,
                background: file ? '#FFFCF8' : '#FAF7F1',
                cursor: file ? 'default' : 'pointer',
                overflow: 'hidden',
                marginBottom: 14,
                transition: 'all 0.2s',
                minHeight: 180,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {preview ? (
                <div style={{ position: 'relative', width: '100%' }}>
                  <img src={preview} alt="Aperçu" style={{ width: '100%', maxHeight: 220, objectFit: 'cover', display: 'block', borderRadius: 14 }} />
                  <button
                    onClick={e => { e.stopPropagation(); setFile(null); setPreview(null); }}
                    style={{ position: 'absolute', top: 8, right: 8, background: 'rgba(11,11,12,0.7)', border: 'none', borderRadius: 20, color: '#fff', width: 28, height: 28, cursor: 'pointer', fontSize: 14, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                  >✕</button>
                </div>
              ) : (
                <div style={{ textAlign: 'center', padding: 24 }}>
                  <div style={{ fontSize: 36, marginBottom: 10 }}>📸</div>
                  <p style={{ fontSize: 14, fontWeight: 700, color: '#0B0B0C', margin: '0 0 4px', fontFamily: 'Inter, sans-serif' }}>
                    Ajouter une photo du résultat
                  </p>
                  <p style={{ fontSize: 12, color: '#9CA3AF', margin: 0, fontFamily: 'Inter, sans-serif' }}>
                    Obligatoire · JPG, PNG, WEBP · max 10 Mo
                  </p>
                </div>
              )}
            </div>

            <input ref={inputRef} type="file" accept="image/*" capture="environment" onChange={pickFile} style={{ display: 'none' }} />

            {!file && (
              <button
                onClick={() => inputRef.current?.click()}
                style={{ width: '100%', padding: '11px', border: '1.5px solid #E8D7C2', borderRadius: 12, background: '#FAF7F1', fontSize: 13, fontWeight: 700, color: '#6B4A35', cursor: 'pointer', marginBottom: 10, fontFamily: 'Inter, sans-serif', transition: 'all 0.2s' }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = '#C9863A'; e.currentTarget.style.background = '#FFF5EB'; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = '#E8D7C2'; e.currentTarget.style.background = '#FAF7F1'; }}
              >
                📷 Choisir une photo
              </button>
            )}

            {error && (
              <p style={{ fontSize: 12, color: '#DC2626', background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 8, padding: '8px 12px', margin: '0 0 10px', fontFamily: 'Inter, sans-serif' }}>
                {error}
              </p>
            )}

            <button
              onClick={handleSubmit}
              disabled={!file || uploading}
              style={{
                width: '100%', padding: '13px', borderRadius: 12, border: 'none', cursor: file && !uploading ? 'pointer' : 'not-allowed',
                background: file && !uploading ? 'linear-gradient(135deg, #C9863A, #8A4F26)' : '#E5E7EB',
                color: file && !uploading ? '#fff' : '#9CA3AF',
                fontSize: 14, fontWeight: 800, fontFamily: 'Inter, sans-serif',
                transition: 'all 0.2s',
                boxShadow: file && !uploading ? '0 8px 24px rgba(137,79,38,0.28)' : 'none',
              }}
            >
              {uploading ? '⏳ Upload en cours…' : file ? '✓ Clôturer la prestation' : 'Ajoutez une photo pour continuer'}
            </button>

            <p style={{ textAlign: 'center', fontSize: 11, color: '#A38B7D', margin: '10px 0 0', fontFamily: 'Inter, sans-serif' }}>
              La photo sera ajoutée à votre galerie publique.
            </p>
          </>
        )}
      </motion.div>
    </motion.div>
  );
}
