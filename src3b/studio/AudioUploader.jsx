import React, { useState, useRef } from 'react';
import { base44 } from '@/api/base44Client';
import { Upload, Music, X, Play, Pause } from 'lucide-react';

const ASSET_TYPES = ['music', 'sfx', 'beat_loop', 'one_shot', 'ambient', 'uploaded'];
const CATEGORIES = ['percussion', 'bass', 'melody', 'fx', 'ambient', 'vocal', 'custom'];

export default function AudioUploader({ onAssetUploaded }) {
  const [uploads, setUploads] = useState([]);
  const [dragging, setDragging] = useState(false);
  const [playingId, setPlayingId] = useState(null);
  const audioRefs = useRef({});
  const fileInputRef = useRef();

  const processFiles = (files) => {
    Array.from(files).forEach(file => {
      if (!file.type.startsWith('audio/')) return;
      const tempId = Date.now() + Math.random();
      const url = URL.createObjectURL(file);
      setUploads(prev => [...prev, {
        tempId, file, url, name: file.name.replace(/\.[^.]+$/, ''),
        asset_type: 'uploaded', category: 'custom',
        status: 'pending', progress: 0
      }]);
    });
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    processFiles(e.dataTransfer.files);
  };

  const handleUploadOne = async (tempId) => {
    const item = uploads.find(u => u.tempId === tempId);
    if (!item) return;

    setUploads(prev => prev.map(u => u.tempId === tempId ? { ...u, status: 'uploading' } : u));
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file: item.file });
      const asset = await base44.entities.AudioAsset.create({
        name: item.name,
        file_url,
        asset_type: item.asset_type,
        category: item.category,
        source: 'user_upload',
        license: 'user_owned',
        is_public: false,
      });
      setUploads(prev => prev.map(u => u.tempId === tempId ? { ...u, status: 'done', asset } : u));
      onAssetUploaded?.(asset);
    } catch (e) {
      setUploads(prev => prev.map(u => u.tempId === tempId ? { ...u, status: 'error' } : u));
    }
  };

  const togglePlay = (tempId, url) => {
    if (playingId === tempId) {
      audioRefs.current[tempId]?.pause();
      setPlayingId(null);
    } else {
      if (playingId && audioRefs.current[playingId]) {
        audioRefs.current[playingId].pause();
      }
      if (!audioRefs.current[tempId]) {
        audioRefs.current[tempId] = new Audio(url);
        audioRefs.current[tempId].onended = () => setPlayingId(null);
      }
      audioRefs.current[tempId].play();
      setPlayingId(tempId);
    }
  };

  const removeUpload = (tempId) => {
    if (audioRefs.current[tempId]) {
      audioRefs.current[tempId].pause();
      delete audioRefs.current[tempId];
    }
    setUploads(prev => prev.filter(u => u.tempId !== tempId));
    if (playingId === tempId) setPlayingId(null);
  };

  const STATUS_COLORS = { pending: '#64748b', uploading: '#fbbf24', done: '#00d4aa', error: '#ef4444' };

  return (
    <div className="space-y-3">
      {/* Drop zone */}
      <div
        onDragOver={e => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className="border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all"
        style={{ borderColor: dragging ? '#00d4aa' : '#1e293b', background: dragging ? '#00d4aa08' : 'transparent' }}
      >
        <Upload size={24} className="mx-auto mb-2" style={{ color: dragging ? '#00d4aa' : '#334155' }} />
        <p className="text-xs font-bold" style={{ color: dragging ? '#00d4aa' : '#64748b' }}>
          Drop audio files here or click to browse
        </p>
        <p className="text-[10px] text-[#334155] mt-1">MP3, WAV, OGG, M4A supported</p>
        <input ref={fileInputRef} type="file" accept="audio/*" multiple className="hidden"
          onChange={e => processFiles(e.target.files)} />
      </div>

      {/* Upload queue */}
      {uploads.length > 0 && (
        <div className="space-y-1.5 max-h-56 overflow-y-auto">
          {uploads.map(item => (
            <div key={item.tempId}
              className="flex items-center gap-2 p-2 rounded-xl border"
              style={{ borderColor: `${STATUS_COLORS[item.status]}30`, background: '#0a0f1e' }}>
              <button onClick={() => togglePlay(item.tempId, item.url)}
                className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
                style={{ background: `${STATUS_COLORS[item.status]}20`, color: STATUS_COLORS[item.status] }}>
                {playingId === item.tempId ? <Pause size={12} /> : <Play size={12} />}
              </button>
              <Music size={12} style={{ color: STATUS_COLORS[item.status] }} className="shrink-0" />
              <div className="flex-1 min-w-0">
                <input
                  value={item.name}
                  onChange={e => setUploads(prev => prev.map(u => u.tempId === item.tempId ? { ...u, name: e.target.value } : u))}
                  className="bg-transparent text-xs font-medium text-[#f1f5f9] w-full outline-none border-b border-transparent focus:border-[#1e293b]"
                />
                <div className="flex gap-2 mt-0.5">
                  <select value={item.asset_type} onChange={e => setUploads(prev => prev.map(u => u.tempId === item.tempId ? { ...u, asset_type: e.target.value } : u))}
                    className="text-[9px] bg-transparent text-[#475569] outline-none">
                    {ASSET_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                  <select value={item.category} onChange={e => setUploads(prev => prev.map(u => u.tempId === item.tempId ? { ...u, category: e.target.value } : u))}
                    className="text-[9px] bg-transparent text-[#475569] outline-none">
                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>
              <span className="text-[9px] font-bold" style={{ color: STATUS_COLORS[item.status] }}>
                {item.status === 'uploading' ? '...' : item.status}
              </span>
              {item.status === 'pending' && (
                <button onClick={() => handleUploadOne(item.tempId)}
                  className="px-2 py-1 rounded text-[9px] font-bold bg-[#00d4aa]/20 text-[#00d4aa] hover:bg-[#00d4aa]/30 transition-colors">
                  Save
                </button>
              )}
              <button onClick={() => removeUpload(item.tempId)} className="text-[#334155] hover:text-[#ef4444] transition-colors">
                <X size={12} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}