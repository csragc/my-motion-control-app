'use client';

import { useState, useEffect } from 'react';

export default function Home() {
  const [apiKey, setApiKey] = useState('');
  const [characterImg, setCharacterImg] = useState<File | null>(null);
  const [motionVid, setMotionVid] = useState<File | null>(null);
  const [prompt, setPrompt] = useState('');
  const [model, setModel] = useState('kling-3-omni');
  
  const [loading, setLoading] = useState(false);
  const [statusText, setStatusText] = useState('');
  const [outputVideo, setOutputVideo] = useState('');

  // Ambil API key dari penyimpanan lokal browser saat web pertama dibuka
  useEffect(() => {
    const savedKey = localStorage.getItem('user_magnific_key');
    if (savedKey) setApiKey(savedKey);
  }, []);

  const saveApiKey = (key: string) => {
    setApiKey(key);
    localStorage.setItem('user_magnific_key', key);
  };

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!apiKey || !characterImg || !motionVid) {
      alert('Mohon lengkapi API Key, Gambar Karakter, dan Video Referensi!');
      return;
    }

    setLoading(true);
    setOutputVideo('');
    setStatusText('Mengunggah aset gerakan ke server...');

    try {
      const dataPayload = new FormData();
      dataPayload.append('image', characterImg);
      dataPayload.append('video_reference', motionVid);
      dataPayload.append('prompt', prompt);
      dataPayload.append('model', model);

      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'x-user-api-key': apiKey },
        body: dataPayload,
      });

      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Gagal membuat task.');

      const { task_id, model: activeModel } = result;
      setStatusText('Aset diterima! Magnific sedang memproses gerakan Anda...');

      // Mulai jalankan mekanisme Polling setiap 5 detik sekali
      const pollInterval = setInterval(async () => {
        try {
          const statusCheck = await fetch(`/api/status?task_id=${task_id}&model=${activeModel}`, {
            method: 'GET',
            headers: { 'x-user-api-key': apiKey },
          });
          const statusResult = await statusCheck.json();

          if (statusResult.status === 'completed' || statusResult.video_url) {
            setOutputVideo(statusResult.video_url);
            setLoading(false);
            setStatusText('');
            clearInterval(pollInterval);
          } else if (statusResult.status === 'failed') {
            throw new Error('Magnific gagal memproses video ini. Silakan coba aset lain.');
          } else {
            setStatusText(`AI Sedang Merender Video... (Status: ${statusResult.status || 'processing'})`);
          }
        } catch (pollError: any) {
          alert(pollError.message);
          setLoading(false);
          clearInterval(pollInterval);
        }
      }, 5000);

    } catch (err: any) {
      alert(err.message);
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 font-sans">
      {/* Header */}
      <header className="border-b border-slate-800 p-5 bg-slate-900/50 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-4">
          <h1 className="text-xl font-bold tracking-wider text-cyan-400">⚡ MOTION CONTROL INTERFACE</h1>
          <input
            type="password"
            placeholder="Masukkan API Key Magnific Anda..."
            value={apiKey}
            onChange={(e) => saveApiKey(e.target.value)}
            className="w-full sm:w-80 bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-cyan-500 transition-all text-center"
          />
        </div>
      </header>

      {/* Main Container */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 p-6">
        
        {/* Panel Kiri: Kontrol & Input */}
        <form onSubmit={handleGenerate} className="lg:col-span-5 space-y-6 bg-slate-900/40 p-6 rounded-2xl border border-slate-800/80">
          
          {/* Pilihan Model */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">Pilih AI Engine</label>
            <select 
              value={model} 
              onChange={(e) => setModel(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-sm focus:outline-none focus:border-cyan-500"
            >
              <option value="kling-3-omni">Kling 3.0 Omni (Motion Control)</option>
              <option value="kling-2.6-motion">Kling 2.6 Motion-V</option>
            </select>
          </div>

          {/* Upload Gambar Karakter */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">1. Gambar Karakter (Target)</label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setCharacterImg(e.target.files?.[0] || null)}
              className="w-full text-sm text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-cyan-950 file:text-cyan-400 hover:file:bg-cyan-900 cursor-pointer"
            />
          </div>

          {/* Upload Video Gerakan */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">2. Video Referensi Gerakan (Motion)</label>
            <input
              type="file"
              accept="video/*"
              onChange={(e) => setMotionVid(e.target.files?.[0] || null)}
              className="w-full text-sm text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-cyan-950 file:text-cyan-400 hover:file:bg-cyan-900 cursor-pointer"
            />
            <p className="text-[11px] text-amber-500 mt-1">*Disarankan ukuran video di bawah 4.5MB untuk akun gratis Vercel.</p>
          </div>

          {/* Prompt Tambahan */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">3. Prompt Teks Tambahan (Opsional)</label>
            <textarea
              placeholder="Deskripsikan latar belakang, detail pakaian, atau pencahayaan..."
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              rows={3}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-sm focus:outline-none focus:border-cyan-500 resize-none"
            />
          </div>

          {/* Tombol Eksekusi */}
          <button
            type="submit"
            disabled={loading}
            className={`w-full py-4 rounded-xl font-bold text-sm tracking-wider uppercase transition-all duration-300 ${
              loading 
                ? 'bg-slate-800 text-slate-500 cursor-not-allowed' 
                : 'bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 shadow-lg shadow-cyan-500/20'
            }`}
          >
            {loading ? 'Sedang Diproses...' : 'Mulai Jalankan Gerakan'}
          </button>
        </form>

        {/* Panel Kanan: Hasil Monitor */}
        <div className="lg:col-span-7 flex flex-col justify-center items-center bg-slate-900/20 rounded-2xl border border-dashed border-slate-800 min-h-[400px] p-6 relative overflow-hidden">
          {loading && (
            <div className="text-center space-y-4 z-10">
              <div className="w-12 h-12 border-4 border-cyan-400 border-t-transparent rounded-full animate-spin mx-auto"></div>
              <p className="text-sm font-medium text-cyan-300 tracking-wide animate-pulse">{statusText}</p>
            </div>
          )}

          {!loading && !outputVideo && (
            <div className="text-center text-slate-500 max-w-sm">
              <span className="text-4xl mb-3 block">🎬</span>
              <p className="text-sm">Hasil render video *motion control* akan muncul di panel ini secara otomatis.</p>
            </div>
          )}

          {outputVideo && (
            <div className="w-full space-y-4 animate-fade-in">
              <video 
                src={outputVideo} 
                controls 
                className="w-full rounded-xl border border-slate-800 shadow-2xl max-h-[500px] bg-black"
              />
              <a
                href={outputVideo}
                download="motion-control-output.mp4"
                target="_blank"
                rel="noreferrer"
                className="block text-center w-full bg-slate-800 hover:bg-slate-700 text-cyan-400 py-3 rounded-xl font-semibold text-sm border border-slate-700 transition-all"
              >
                📥 Unduh Hasil Video
              </a>
            </div>
          )}
        </div>

      </div>
    </main>
  );
}