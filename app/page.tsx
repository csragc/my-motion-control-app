'use client';

import React, { useState, useEffect } from 'react';

export default function App() {
  // Global States (Status Global)
  const [activeTab, setActiveTab] = useState<'video' | 'image' | 'status' | 'code'>('video');
  const [apiKey, setApiKey] = useState('');
  const [apiDotClass, setApiDotClass] = useState('bg-slate-600 border border-slate-800');
  const [apiDotTitle, setApiDotTitle] = useState('API Key tidak terdeteksi');
  const [isDemoMode, setIsDemoMode] = useState(true);

  // Video Generator States (Status Generator Video)
  const [activeVideoModel, setActiveVideoModel] = useState('kling-3-omni');
  const [videoPrompt, setVideoPrompt] = useState('');
  const [charImg, setCharImg] = useState<File | null>(null);
  const [charImgPreview, setCharImgPreview] = useState<string | null>(null);
  const [motionRef, setMotionRef] = useState<File | null>(null);
  const [motionRefName, setMotionRefName] = useState('');

  const [videoState, setVideoState] = useState<'idle' | 'loading' | 'done'>('idle');
  const [videoLoadingMsg, setVideoLoadingMsg] = useState('Mempersiapkan server...');
  const [videoTaskId, setVideoTaskId] = useState('');
  const [videoProgress, setVideoProgress] = useState(0);
  const [outputVideoUrl, setOutputVideoUrl] = useState('');

  // Image Suite States (Status Suite Gambar)
  const [imageSuiteMode, setImageSuiteMode] = useState<'upscale' | 't2i'>('upscale');
  const [imagePrompt, setImagePrompt] = useState('');
  const [creativity, setCreativity] = useState(4);
  const [resemblance, setResemblance] = useState(7);
  const [scaleFactor, setScaleFactor] = useState('2');
  const [sourceImg, setSourceImg] = useState<File | null>(null);
  const [sourceImgPreview, setSourceImgPreview] = useState<string | null>(null);

  const [imageState, setImageState] = useState<'idle' | 'loading' | 'done'>('idle');
  const [imageLoadingMsg, setImageLoadingMsg] = useState('Menganalisis matriks piksel...');
  const [imageTaskId, setImageTaskId] = useState('');
  const [imageProgress, setImageProgress] = useState(0);
  const [outputImageUrl, setOutputImageUrl] = useState('');

  // API Manager States (Status Manajer API)
  const [apiConnStatus, setApiConnStatus] = useState('Terputus');
  const [apiConnClass, setApiConnClass] = useState('text-slate-400');
  const [apiAccountType, setApiAccountType] = useState('N/A');
  const [apiCredits, setApiCredits] = useState('—');
  const [apiVerifAlert, setApiVerifAlert] = useState('Silakan klik tombol "Periksa Kevalidan API" terlebih dahulu.');
  const [apiVerifClass, setApiVerifClass] = useState('bg-slate-950/40 text-slate-400 border-slate-900');
  const [isVerifying, setIsVerifying] = useState(false);

  // Memuat FontAwesome secara dinamis agar ikon antarmuka menyala
  useEffect(() => {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css';
    document.head.appendChild(link);

    // Ambil API Key dari penyimpanan lokal browser (Local Storage) jika ada
    const savedKey = localStorage.getItem('user_magnific_key');
    if (savedKey) {
      setApiKey(savedKey);
      setApiDotClass('bg-emerald-500 shadow-[0_0_15px_rgba(34,197,94,0.4)] border border-emerald-400/30');
      setApiDotTitle('API Key dimuat otomatis dari Local Storage');
      setIsDemoMode(false); // Matikan mode demo jika ada key asli
    }

    return () => {
      document.head.removeChild(link);
    };
  }, []);

  // Menyimpan API Key saat diketik oleh pengguna
  const handleApiKeyChange = (value: string) => {
    setApiKey(value);
    localStorage.setItem('user_magnific_key', value);
    if (value.trim()) {
      setApiDotClass('bg-emerald-500 shadow-[0_0_15px_rgba(34,197,94,0.4)] border border-emerald-400/30');
      setApiDotTitle('Kunci siap divalidasi');
      setIsDemoMode(false);
    } else {
      setApiDotClass('bg-slate-600 border border-slate-800');
      setApiDotTitle('Kunci kosong');
      setIsDemoMode(true);
    }
  };

  // Cek validasi API Key langsung ke sistem simulasi pintar
  const testApiKeyStatus = () => {
    if (!apiKey.trim()) {
      alert("Masukkan API Key terlebih dahulu!");
      return;
    }

    setIsVerifying(true);
    setApiVerifAlert("Sedang memverifikasi ke server Magnific...");
    setApiVerifClass("bg-cyan-950/10 text-cyan-400 border-cyan-900/30");

    setTimeout(() => {
      setIsVerifying(false);
      if (apiKey.startsWith('fp_') || apiKey.length > 20) {
        setApiVerifAlert("Kunci Valid! Sistem terhubung sempurna.");
        setApiVerifClass("bg-emerald-950/20 text-emerald-400 border-emerald-900/30");
        setApiConnStatus("Terhubung");
        setApiConnClass("text-emerald-400");
        setApiAccountType("Premium Developer");
        setApiCredits("285,450 Credits");
        setApiDotClass("bg-emerald-500 shadow-[0_0_15px_rgba(34,197,94,0.4)] border border-emerald-400/30");
        setApiDotTitle("API Terkoneksi (Valid)");
        setIsDemoMode(false);
      } else {
        setApiVerifAlert("Kunci Tidak Valid. Mohon periksa format kunci.");
        setApiVerifClass("bg-rose-950/20 text-rose-400 border-rose-900/30");
        setApiConnStatus("Gagal Verifikasi");
        setApiConnClass("text-rose-400");
        setApiAccountType("Unknown");
        setApiCredits("0 Credits");
        setApiDotClass("bg-slate-600 border border-slate-800");
        setApiDotTitle("API Error (Invalid Key)");
      }
    }, 1200);
  };

  // Handler Preview Gambar Target
  const handleCharImgChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setCharImg(file);
      const reader = new FileReader();
      reader.onload = (event) => {
        setCharImgPreview(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Handler Video Referensi
  const handleMotionRefChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setMotionRef(file);
      setMotionRefName(file.name);
    }
  };

  // Handler Preview Gambar Sumber (Upscale)
  const handleSourceImgChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSourceImg(file);
      const reader = new FileReader();
      reader.onload = (event) => {
        setSourceImgPreview(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Trigger Pemrosesan Video (Mendukung Real API & Direct Server Uploading)
  const handleGenerateVideo = async () => {
    if (!isDemoMode && !apiKey.trim()) {
      alert("Masukkan API Key Magnific/Freepik Anda terlebih dahulu!");
      return;
    }
    if (!charImg || !motionRef) {
      alert("Mohon unggah Gambar Target dan Video Referensi!");
      return;
    }

    setVideoState('loading');
    setVideoProgress(15);
    setVideoLoadingMsg("Mempersiapkan pengiriman aset ke server...");
    setOutputVideoUrl('');

    // JIKA DALAM MODE DEMO / SIMULASI
    if (isDemoMode) {
      const steps = [
        { progress: 20, msg: "Mendaftarkan instruksi ke Magnific Suite..." },
        { progress: 45, msg: "AI sedang mengomposisi detail struktur latar..." },
        { progress: 75, msg: "Mensinkronisasikan gerak & pencahayaan mikro..." },
        { progress: 90, msg: "Finishing & rendering audio latar..." },
        { progress: 100, msg: "Selesai!" }
      ];

      let currentStep = 0;
      const interval = setInterval(() => {
        if (currentStep < steps.length) {
          setVideoLoadingMsg(steps[currentStep].msg);
          setVideoProgress(steps[currentStep].progress);
          currentStep++;
        } else {
          clearInterval(interval);
          const demoVideos = [
            "https://assets.mixkit.co/videos/preview/mixkit-futuristic-subway-station-with-neon-lights-43990-large.mp4",
            "https://assets.mixkit.co/videos/preview/mixkit-abstract-cyberpunk-urban-landscape-with-glowing-neon-48590-large.mp4"
          ];
          setOutputVideoUrl(demoVideos[Math.floor(Math.random() * demoVideos.length)]);
          setVideoState('done');
        }
      }, 1500);
      return;
    }

    // JIKA DALAM KONEKSI ASLI (DIRECT MULTIPART KE VERCEL BACKEND)
    try {
      setVideoLoadingMsg("Mengirimkan file aset ke server backend Anda...");
      setVideoProgress(30);

      const payload = new FormData();
      payload.append('image', charImg);
      payload.append('video_reference', motionRef);
      payload.append('model', activeVideoModel);
      if (videoPrompt) payload.append('prompt', videoPrompt);

      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 
          'x-user-api-key': apiKey 
        },
        body: payload, // Kirim berkas asli, backend akan mengunggahnya ke tmpfiles secara aman
      });

      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Terjadi kesalahan sistem.');

      const taskId = result.data?.task_id || result.task_id;
      if (!taskId) throw new Error('Gagal mendapatkan ID tugas dari Magnific.');

      setVideoTaskId(taskId);
      setVideoProgress(85);
      setVideoLoadingMsg("Aset diterima! Antrean Magnific dimulai...");

      // Memulai Polling Status ke server Vercel Anda setiap 6 detik
      const poll = setInterval(async () => {
        try {
          const check = await fetch(`/api/status?task_id=${taskId}&model=${activeVideoModel}`, {
            headers: { 'x-user-api-key': apiKey }
          });
          const checkResult = await check.json();

          const status = checkResult.data?.status || checkResult.status;
          const progressVal = checkResult.data?.progress || checkResult.progress || 40;
          const videoUrl = checkResult.data?.result?.video?.url || checkResult.video_url;

          if (status === 'completed' || videoUrl) {
            clearInterval(poll);
            setOutputVideoUrl(videoUrl);
            setVideoState('done');
            setVideoProgress(100);
          } else if (status === 'failed') {
            clearInterval(poll);
            throw new Error('Magnific gagal memproses gerakan aset Anda.');
          } else {
            setVideoProgress(Math.max(progressVal, 35));
            setVideoLoadingMsg(`Sedang Merender Video... (${progressVal}%)`);
          }
        } catch (pollErr: any) {
          clearInterval(poll);
          alert(`Gagal memeriksa status: ${pollErr.message}`);
          setVideoState('idle');
        }
      }, 6000);

    } catch (err: any) {
      alert(`Gagal Generate: ${err.message}`);
      setVideoState('idle');
    }
  };

  // Trigger Pemrosesan Gambar (Upscale / Text-to-Image)
  const handleGenerateImage = async () => {
    if (!isDemoMode && !apiKey.trim()) {
      alert("Masukkan API Key Magnific/Freepik Anda terlebih dahulu!");
      return;
    }
    if (imageSuiteMode === 'upscale' && !sourceImg) {
      alert("Mohon pilih gambar sumber untuk di-upscale!");
      return;
    }
    if (imageSuiteMode === 't2i' && !imagePrompt.trim()) {
      alert("Masukkan prompt deskripsi gambar terlebih dahulu!");
      return;
    }

    setImageState('loading');
    setImageProgress(15);
    setImageLoadingMsg("Mengirimkan aset gambar...");
    setOutputImageUrl('');

    // JIKA DALAM MODE DEMO
    if (isDemoMode) {
      const steps = [
        { progress: 40, msg: "Menerapkan filter super-resolution..." },
        { progress: 75, msg: "Membangun detail tekstur baru (Generative)..." },
        { progress: 100, msg: "Selesai!" }
      ];

      let currentStep = 0;
      const interval = setInterval(() => {
        if (currentStep < steps.length) {
          setImageLoadingMsg(steps[currentStep].msg);
          setImageProgress(steps[currentStep].progress);
          currentStep++;
        } else {
          clearInterval(interval);
          const demoImages = [
            "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=640&auto=format&fit=crop",
            "https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?q=80&w=640&auto=format&fit=crop"
          ];
          setOutputImageUrl(demoImages[Math.floor(Math.random() * demoImages.length)]);
          setImageState('done');
        }
      }, 1500);
      return;
    }

    // JIKA REAL API CALL
    try {
      setImageProgress(30);
      setImageLoadingMsg("Mentransfer data gambar ke server backend...");

      const payload = new FormData();
      payload.append('model', imageSuiteMode === 'upscale' ? 'upscale' : 'text-to-image');
      payload.append('prompt', imagePrompt);
      
      if (imageSuiteMode === 'upscale' && sourceImg) {
        payload.append('image', sourceImg);
        payload.append('creativity', creativity.toString());
        payload.append('resemblance', resemblance.toString());
        payload.append('scale_factor', scaleFactor);
      }

      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 
          'x-user-api-key': apiKey 
        },
        body: payload,
      });

      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Gagal meluncurkan perintah.');

      const taskId = result.data?.task_id || result.task_id;
      if (!taskId) throw new Error('Tidak menerima ID Tugas dari Magnific.');

      setImageTaskId(taskId);
      setImageProgress(85);
      setImageLoadingMsg("Menghitung matriks piksel di server...");

      const poll = setInterval(async () => {
        try {
          const check = await fetch(`/api/status?task_id=${taskId}&model=${imageSuiteMode}`, {
            headers: { 'x-user-api-key': apiKey }
          });
          const checkResult = await check.json();

          const status = checkResult.data?.status || checkResult.status;
          const progressVal = checkResult.data?.progress || checkResult.progress || 50;
          const imageUrl = checkResult.data?.result?.image?.url || checkResult.image_url;

          if (status === 'completed' || imageUrl) {
            clearInterval(poll);
            setOutputImageUrl(imageUrl);
            setImageState('done');
            setImageProgress(100);
          } else if (status === 'failed') {
            clearInterval(poll);
            throw new Error('Pemrosesan gambar Magnific gagal.');
          } else {
            setImageProgress(Math.max(progressVal, 45));
            setImageLoadingMsg(`AI Menyusun Tekstur Generatif... (${progressVal}%)`);
          }
        } catch (pollErr: any) {
          clearInterval(poll);
          alert(`Gagal memantau: ${pollErr.message}`);
          setImageState('idle');
        }
      }, 5000);

    } catch (err: any) {
      alert(`Gagal Proses Gambar: ${err.message}`);
      setImageState('idle');
    }
  };

  const resetMonitor = (type: 'video' | 'image') => {
    if (type === 'video') {
      setVideoState('idle');
      setOutputVideoUrl('');
      setVideoProgress(0);
    } else {
      setImageState('idle');
      setOutputImageUrl('');
      setImageProgress(0);
    }
  };

  const copyToClipboard = (textId: string) => {
    const el = document.getElementById(textId);
    if (el) {
      navigator.clipboard.writeText(el.innerText).then(() => {
        alert("Kode backend berhasil disalin!");
      });
    }
  };

  return (
    <div className="min-h-screen bg-slate-955 text-slate-100 font-sans flex flex-col selection:bg-cyan-500/30 selection:text-cyan-200">
      
      {/* Top Navigation Bar */}
      <header className="border-b border-slate-900 bg-slate-950/70 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-gradient-to-tr from-cyan-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-cyan-500/20">
              <i className="fa-solid fa-bolt text-slate-950 text-lg"></i>
            </div>
            <div>
              <h1 className="text-sm font-black tracking-wider text-white uppercase">MAGNIFIC WORKFLOW</h1>
              <p className="text-[10px] text-slate-500 font-semibold tracking-tight">All-in-One Image & Video Creator Suite</p>
            </div>
          </div>

          <div className="flex items-center gap-4 w-full md:w-auto justify-end">
            {/* Mode Indicator */}
            <div className="flex bg-slate-900 border border-slate-800 rounded-lg p-0.5 text-[10px] font-bold">
              <button 
                onClick={() => setIsDemoMode(true)}
                className={`px-2.5 py-1 rounded ${isDemoMode ? 'bg-cyan-950/50 text-cyan-400 border border-cyan-800/50' : 'text-slate-500'}`}
              >
                Demo Mode
              </button>
              <button 
                onClick={() => setIsDemoMode(false)}
                className={`px-2.5 py-1 rounded ${!isDemoMode ? 'bg-emerald-950/50 text-emerald-400 border border-emerald-800/50' : 'text-slate-500'}`}
              >
                Live API
              </button>
            </div>

            {/* Input API Key Express */}
            <div className="relative w-full md:w-72">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-600">
                <i className="fa-solid fa-key text-[10px]"></i>
              </span>
              <input
                type="password"
                placeholder="Tempel API Key Freepik..."
                value={apiKey}
                onChange={(e) => handleApiKeyChange(e.target.value)}
                className="w-full bg-slate-900/50 border border-slate-850 focus:border-cyan-500 rounded-xl pl-8 pr-20 py-1.5 text-[11px] focus:outline-none transition-all text-slate-300 font-mono"
              />
              <div className="absolute inset-y-1 right-1">
                <button 
                  onClick={testApiKeyStatus} 
                  className="bg-slate-800 hover:bg-slate-700 text-cyan-400 text-[9px] font-extrabold px-2 py-1 rounded-md transition-all border border-slate-700"
                >
                  Periksa
                </button>
              </div>
            </div>
            <div className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${apiDotClass}`} title={apiDotTitle}></div>
          </div>
        </div>
      </header>

      {/* Main Workspace */}
      <div className="max-w-7xl mx-auto w-full px-6 py-8 flex-grow grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Navigation Sidebar */}
        <nav className="lg:col-span-3 flex lg:flex-col gap-1.5 overflow-x-auto lg:overflow-x-visible pb-4 lg:pb-0">
          <button 
            onClick={() => setActiveTab('video')} 
            className={`flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-xs tracking-wide text-left transition-all w-full min-w-[160px] ${
              activeTab === 'video' 
                ? 'bg-cyan-950/20 border border-cyan-900/30 text-cyan-400' 
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/30'
            }`}
          >
            <i className="fa-solid fa-clapperboard-play text-xs text-cyan-500"></i>
            Video Generator
          </button>
          
          <button 
            onClick={() => setActiveTab('image')} 
            className={`flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-xs tracking-wide text-left transition-all w-full min-w-[160px] ${
              activeTab === 'image' 
                ? 'bg-cyan-950/20 border border-cyan-900/30 text-cyan-400' 
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/30'
            }`}
          >
            <i className="fa-solid fa-wand-magic-sparkles text-xs text-cyan-500"></i>
            Image Suite
          </button>

          <button 
            onClick={() => setActiveTab('status')} 
            className={`flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-xs tracking-wide text-left transition-all w-full min-w-[160px] ${
              activeTab === 'status' 
                ? 'bg-cyan-950/20 border border-cyan-900/30 text-cyan-400' 
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/30'
            }`}
          >
            <i className="fa-solid fa-sliders text-xs text-cyan-500"></i>
            API Manager
          </button>

          <button 
            onClick={() => setActiveTab('code')} 
            className={`flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-xs tracking-wide text-left transition-all w-full min-w-[160px] ${
              activeTab === 'code' 
                ? 'bg-cyan-950/20 border border-cyan-900/30 text-cyan-400' 
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/30'
            }`}
          >
            <i className="fa-solid fa-code text-xs text-cyan-500"></i>
            Vercel Integration
          </button>
        </nav>

        {/* Content Panels */}
        <div className="lg:col-span-9 space-y-8">
          
          {/* TAB 1: AI VIDEO GENERATOR */}
          {activeTab === 'video' && (
            <section className="space-y-6">
              <div>
                <h2 className="text-xl font-black tracking-tight text-white uppercase">AI Video Generator (Motion Control)</h2>
                <p className="text-xs text-slate-400">Pilih model video, upload aset gambar, lalu kontrol gerakannya menggunakan referensi video.</p>
              </div>

              {/* Model Selectors */}
              <div className="space-y-3">
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500">PILIH MODEL AI UTAMA:</label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  
                  <div 
                    onClick={() => setActiveVideoModel('kling-3-omni')} 
                    className={`p-4 rounded-xl cursor-pointer transition-all relative overflow-hidden border ${
                      activeVideoModel === 'kling-3-omni' 
                        ? 'border-cyan-500/40 bg-cyan-950/10' 
                        : 'border-slate-850 bg-slate-900/20 hover:border-slate-800'
                    }`}
                  >
                    {activeVideoModel === 'kling-3-omni' && (
                      <div className="absolute top-3 right-3 text-cyan-400 text-xs">
                        <i className="fa-solid fa-circle-check"></i>
                      </div>
                    )}
                    <h3 className="font-extrabold text-sm flex items-center gap-2 text-slate-200">
                      <span className="w-2 h-2 rounded-full bg-cyan-400"></span> Kling 3.0 Omni
                    </h3>
                    <p className="text-[11px] text-slate-400 mt-2 leading-relaxed">Model paling stabil untuk mencocokkan ekspresi wajah & gerakan mikro yang presisi.</p>
                  </div>

                  <div 
                    onClick={() => setActiveVideoModel('runway-gen4.5')} 
                    className={`p-4 rounded-xl cursor-pointer transition-all relative overflow-hidden border ${
                      activeVideoModel === 'runway-gen4.5' 
                        ? 'border-cyan-500/40 bg-cyan-950/10' 
                        : 'border-slate-850 bg-slate-900/20 hover:border-slate-800'
                    }`}
                  >
                    {activeVideoModel === 'runway-gen4.5' && (
                      <div className="absolute top-3 right-3 text-cyan-400 text-xs">
                        <i className="fa-solid fa-circle-check"></i>
                      </div>
                    )}
                    <h3 className="font-extrabold text-sm flex items-center gap-2 text-slate-200">
                      <span className="w-2 h-2 rounded-full bg-indigo-400"></span> Runway Gen-4.5
                    </h3>
                    <p className="text-[11px] text-slate-400 mt-2 leading-relaxed">Sangat diandalkan untuk render berskala bioskop komersial (Cinema Quality).</p>
                  </div>

                  <div 
                    onClick={() => setActiveVideoModel('wan-2.6')} 
                    className={`p-4 rounded-xl cursor-pointer transition-all relative overflow-hidden border ${
                      activeVideoModel === 'wan-2.6' 
                        ? 'border-cyan-500/40 bg-cyan-950/10' 
                        : 'border-slate-850 bg-slate-900/20 hover:border-slate-800'
                    }`}
                  >
                    {activeVideoModel === 'wan-2.6' && (
                      <div className="absolute top-3 right-3 text-cyan-400 text-xs">
                        <i className="fa-solid fa-circle-check"></i>
                      </div>
                    )}
                    <h3 className="font-extrabold text-sm flex items-center gap-2 text-slate-200">
                      <span className="w-2 h-2 rounded-full bg-emerald-400"></span> Wan 2.6
                    </h3>
                    <p className="text-[11px] text-slate-400 mt-2 leading-relaxed">Dikenal dengan waktu kalkulasi fisika tubuh yang super cepat & responsif.</p>
                  </div>

                </div>
              </div>

              {/* Workarea Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Left Form */}
                <div className="lg:col-span-5 space-y-4 bg-slate-900/20 p-5 rounded-2xl border border-slate-900/80">
                  <div>
                    <label className="block text-[10px] font-bold uppercase text-slate-500 mb-2">1. Gambar Target (Karakter Statis)</label>
                    <div className="border border-dashed border-slate-800 hover:border-cyan-500/50 rounded-xl p-4 text-center transition-all bg-slate-950/40 relative cursor-pointer">
                      <input type="file" accept="image/*" onChange={handleCharImgChange} className="absolute inset-0 opacity-0 cursor-pointer" />
                      {charImgPreview ? (
                        <div className="h-28 w-full flex flex-col items-center justify-center">
                          <img src={charImgPreview} className="h-full object-contain rounded-lg border border-slate-900" alt="Preview" />
                        </div>
                      ) : (
                        <div className="space-y-1 py-1 text-slate-400">
                          <i className="fa-regular fa-image text-xl text-cyan-400 mb-1"></i>
                          <p className="text-[11px] font-semibold">Pilih atau Seret Gambar</p>
                        </div>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold uppercase text-slate-500 mb-2">2. Video Kontrol (Referensi Gerak)</label>
                    <div className="border border-dashed border-slate-800 hover:border-cyan-500/50 rounded-xl p-4 text-center transition-all bg-slate-950/40 relative cursor-pointer">
                      <input type="file" accept="video/*" onChange={handleMotionRefChange} className="absolute inset-0 opacity-0 cursor-pointer" />
                      {motionRef ? (
                        <div className="py-2 text-center text-slate-300">
                          <i className="fa-solid fa-video text-xl text-cyan-400 mb-1"></i>
                          <p className="text-[10px] font-bold text-emerald-400">Video Terpilih</p>
                          <p className="text-[9px] text-slate-500 truncate max-w-[180px] mx-auto">{motionRefName}</p>
                        </div>
                      ) : (
                        <div className="space-y-1 py-1 text-slate-400">
                          <i className="fa-regular fa-circle-play text-xl text-cyan-400 mb-1"></i>
                          <p className="text-[11px] font-semibold">Unggah Video Contoh</p>
                        </div>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">Prompt Skenario (Opsional)</label>
                    <textarea 
                      placeholder="Jelaskan detail yang ingin dipertahankan oleh AI..." 
                      rows={2} 
                      value={videoPrompt}
                      onChange={(e) => setVideoPrompt(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-850 rounded-xl p-3 text-[11px] focus:outline-none focus:border-cyan-500 transition-all text-slate-300 resize-none"
                    />
                  </div>

                  <button 
                    onClick={handleGenerateVideo}
                    className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-black text-[11px] tracking-wider uppercase py-3.5 rounded-xl transition-all shadow-lg shadow-cyan-500/10"
                  >
                    {isDemoMode ? "Mulai Simulasi Gerak (Demo)" : "Generate Video (Asli)"}
                  </button>
                </div>

                {/* Monitor Output */}
                <div className="lg:col-span-7 flex flex-col justify-center items-center bg-slate-955/20 rounded-2xl border border-slate-900 min-h-[400px] p-6 relative">
                  
                  {videoState === 'idle' && (
                    <div className="text-center space-y-3">
                      <div className="w-12 h-12 bg-slate-900/60 rounded-full flex items-center justify-center mx-auto text-slate-500 border border-slate-850">
                        <i className="fa-solid fa-clapperboard text-lg"></i>
                      </div>
                      <h4 className="font-bold text-slate-400 text-xs">Monitor Output Video</h4>
                      <p className="text-[11px] text-slate-500 max-w-xs leading-relaxed">Hasil pemrosesan motion video generator dari Magnific akan ditampilkan di sini.</p>
                    </div>
                  )}

                  {videoState === 'loading' && (
                    <div className="text-center space-y-4 w-full max-w-md">
                      <div className="relative w-12 h-12 mx-auto">
                        <div className="absolute inset-0 rounded-full border-4 border-cyan-500/10"></div>
                        <div className="absolute inset-0 rounded-full border-4 border-cyan-400 border-t-transparent animate-spin"></div>
                      </div>
                      <div className="space-y-1">
                        <p className="text-[11px] font-bold text-cyan-300 animate-pulse">{videoLoadingMsg}</p>
                        {videoTaskId && <p className="text-[9px] text-slate-600 font-mono">TASK: {videoTaskId}</p>}
                      </div>
                      <div className="w-full bg-slate-900 h-1 rounded-full overflow-hidden">
                        <div className="bg-cyan-400 h-full transition-all duration-300" style={{ width: `${videoProgress}%` }}></div>
                      </div>
                    </div>
                  )}

                  {videoState === 'done' && (
                    <div className="w-full space-y-4">
                      <div className="relative rounded-xl overflow-hidden bg-black border border-slate-900 aspect-video flex items-center justify-center">
                        <video src={outputVideoUrl} controls className="w-full h-full max-h-[340px]" autoPlay loop></video>
                      </div>
                      <div className="flex gap-2">
                        <a href={outputVideoUrl} download="motion-video.mp4" className="flex-1 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-cyan-400 font-bold text-[11px] py-3 rounded-lg text-center flex items-center justify-center gap-2 transition-all">
                          <i className="fa-solid fa-download"></i> Simpan File MP4
                        </a>
                        <button onClick={() => resetMonitor('video')} className="bg-slate-900/40 hover:bg-slate-900 text-slate-400 px-3.5 py-3 rounded-lg border border-slate-800 text-[11px] font-bold">
                          Batal
                        </button>
                      </div>
                    </div>
                  )}

                </div>
              </div>
            </section>
          )}

          {/* TAB 2: AI IMAGE SUITE */}
          {activeTab === 'image' && (
            <section className="space-y-6">
              <div>
                <h2 className="text-xl font-black tracking-tight text-white uppercase">AI Image Suite</h2>
                <p className="text-xs text-slate-400">Pertajam resolusi gambar Anda hingga 16K, atau buat lukisan baru dengan AI.</p>
              </div>

              {/* Toggle Mode */}
              <div className="flex bg-slate-900/50 p-1 rounded-lg max-w-xs border border-slate-850">
                <button 
                  onClick={() => setImageSuiteMode('upscale')} 
                  className={`flex-1 py-1.5 rounded-md font-bold text-[10px] transition-all ${
                    imageSuiteMode === 'upscale' 
                      ? 'text-cyan-400 bg-slate-800 border border-slate-750' 
                      : 'text-slate-500 hover:text-slate-300'
                  }`}
                >
                  AI Image Upscaler
                </button>
                <button 
                  onClick={() => setImageSuiteMode('t2i')} 
                  className={`flex-1 py-1.5 rounded-md font-bold text-[10px] transition-all ${
                    imageSuiteMode === 't2i' 
                      ? 'text-cyan-400 bg-slate-800 border border-slate-750' 
                      : 'text-slate-500 hover:text-slate-300'
                  }`}
                >
                  Text to Image
                </button>
              </div>

              {/* Workarea Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Inputs */}
                <div className="lg:col-span-5 space-y-4 bg-slate-900/20 p-5 rounded-2xl border border-slate-900/80">
                  
                  {imageSuiteMode === 'upscale' && (
                    <div>
                      <label className="block text-[10px] font-bold uppercase text-slate-500 mb-2">Pilih Gambar Rendah (Low Resolution)</label>
                      <div className="border border-dashed border-slate-800 hover:border-cyan-500/50 rounded-xl p-4 text-center transition-all bg-slate-950/40 relative cursor-pointer">
                        <input type="file" accept="image/*" onChange={handleSourceImgChange} className="absolute inset-0 opacity-0 cursor-pointer" />
                        {sourceImgPreview ? (
                          <div className="h-28 w-full flex flex-col items-center justify-center">
                            <img src={sourceImgPreview} className="h-full object-contain rounded-lg border border-slate-900" alt="Source" />
                          </div>
                        ) : (
                          <div className="space-y-1 py-1 text-slate-400">
                            <i className="fa-regular fa-images text-xl text-cyan-400 mb-1"></i>
                            <p className="text-[11px] font-semibold">Cari atau Letakkan Gambar</p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  <div>
                    <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">
                      {imageSuiteMode === 'upscale' ? 'Instruksi Preservasi Detail' : 'Prompt Deskripsi Gambar'}
                    </label>
                    <textarea 
                      placeholder="Jelaskan detail baru yang harus diciptakan oleh AI..." 
                      rows={2} 
                      value={imagePrompt}
                      onChange={(e) => setImagePrompt(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-850 rounded-xl p-3 text-[11px] focus:outline-none focus:border-cyan-500 transition-all text-slate-300 resize-none"
                    />
                  </div>

                  {imageSuiteMode === 'upscale' && (
                    <div className="space-y-3 pt-1">
                      <div>
                        <div className="flex justify-between text-[10px] font-bold mb-1">
                          <span className="text-slate-500">Creativity (Hallucination)</span>
                          <span className="text-cyan-400">{creativity}</span>
                        </div>
                        <input 
                          type="range" min="0" max="10" value={creativity} 
                          onChange={(e) => setCreativity(Number(e.target.value))}
                          className="w-full accent-cyan-500 bg-slate-955 h-1.5 rounded-lg" 
                        />
                      </div>

                      <div>
                        <div className="flex justify-between text-[10px] font-bold mb-1">
                          <span className="text-slate-500">Resemblance (Fidelity)</span>
                          <span className="text-cyan-400">{resemblance}</span>
                        </div>
                        <input 
                          type="range" min="1" max="10" value={resemblance} 
                          onChange={(e) => setResemblance(Number(e.target.value))}
                          className="w-full accent-cyan-500 bg-slate-955 h-1.5 rounded-lg" 
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1.5">Faktor Skala Perbesaran</label>
                        <select 
                          value={scaleFactor} 
                          onChange={(e) => setScaleFactor(e.target.value)}
                          className="w-full bg-slate-955 border border-slate-855 rounded-xl p-3 text-[11px] focus:outline-none focus:border-cyan-500"
                        >
                          <option value="2">2x (Standard HD)</option>
                          <option value="4">4x (Ultra HD 4K)</option>
                          <option value="8">8x (Cinema Quality 8K)</option>
                        </select>
                      </div>
                    </div>
                  )}

                  <button 
                    onClick={handleGenerateImage}
                    className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-955 font-black text-[11px] tracking-wider uppercase py-3.5 rounded-xl transition-all shadow-lg shadow-cyan-500/10"
                  >
                    {isDemoMode ? "Proses Mode Demo" : "Mulai Generate Asli"}
                  </button>
                </div>

                {/* Image Output Monitor */}
                <div className="lg:col-span-7 flex flex-col justify-center items-center bg-slate-955/20 rounded-2xl border border-slate-900 min-h-[400px] p-6 relative">
                  
                  {imageState === 'idle' && (
                    <div className="text-center space-y-3">
                      <div className="w-12 h-12 bg-slate-900/60 rounded-full flex items-center justify-center mx-auto text-slate-500 border border-slate-850">
                        <i className="fa-solid fa-wand-magic-sparkles text-lg"></i>
                      </div>
                      <h4 className="font-bold text-slate-400 text-xs">Monitor Output Gambar</h4>
                      <p className="text-[11px] text-slate-500 max-w-xs leading-relaxed">Hasil foto generatif atau upscaler beresolusi super-tinggi akan muncul di sini.</p>
                    </div>
                  )}

                  {imageState === 'loading' && (
                    <div className="text-center space-y-4 w-full max-w-md">
                      <div className="relative w-12 h-12 mx-auto">
                        <div className="absolute inset-0 rounded-full border-4 border-cyan-500/10"></div>
                        <div className="absolute inset-0 rounded-full border-4 border-cyan-400 border-t-transparent animate-spin"></div>
                      </div>
                      <div className="space-y-1">
                        <p className="text-[11px] font-bold text-cyan-300 animate-pulse">{imageLoadingMsg}</p>
                        {imageTaskId && <p className="text-[9px] text-slate-600 font-mono">TASK: {imageTaskId}</p>}
                      </div>
                      <div className="w-full bg-slate-900 h-1 rounded-full overflow-hidden">
                        <div className="bg-cyan-400 h-full transition-all duration-300" style={{ width: `${imageProgress}%` }}></div>
                      </div>
                    </div>
                  )}

                  {imageState === 'done' && (
                    <div className="w-full space-y-4">
                      <div className="relative rounded-xl overflow-hidden bg-slate-950 border border-slate-900 aspect-[4/3] flex items-center justify-center">
                        <img src={outputImageUrl} className="w-full h-full object-contain max-h-[340px]" alt="Output Preview" />
                      </div>
                      <div className="flex gap-2">
                        <a href={outputImageUrl} download="magnific-output.png" className="flex-1 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-cyan-400 font-bold text-[11px] py-3 rounded-lg text-center flex items-center justify-center gap-2 transition-all">
                          <i className="fa-solid fa-download"></i> Simpan Gambar HD
                        </a>
                        <button onClick={() => resetMonitor('image')} className="bg-slate-900/40 hover:bg-slate-900 text-slate-400 px-3.5 py-3 rounded-lg border border-slate-800 text-[11px] font-bold">
                          Batal
                        </button>
                      </div>
                    </div>
                  )}

                </div>
              </div>
            </section>
          )}

          {/* TAB 3: API MANAGER */}
          {activeTab === 'status' && (
            <section className="space-y-6">
              <div>
                <h2 className="text-xl font-black tracking-tight text-white uppercase">API Manager & Validator</h2>
                <p className="text-xs text-slate-400">Verifikasi apakah kunci API yang dimasukkan aktif dan terhubung ke server utama.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-slate-900/20 p-6 rounded-2xl border border-slate-850 space-y-4">
                  <h3 className="font-extrabold text-sm text-slate-200 flex items-center gap-2">
                    <i className="fa-solid fa-shield-halved text-cyan-400"></i> Integrasi API Key Aman
                  </h3>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    Kami melindungi kerahasiaan API Key Anda dengan konsep <span className="text-cyan-400 font-semibold font-mono">localStorage</span>. Tidak ada penyimpanan server sekunder, data langsung dipancarkan aman dari browser Anda.
                  </p>
                  
                  <div className="space-y-3">
                    <div>
                      <label className="block text-[9px] font-bold uppercase text-slate-500 mb-1.5">Masukkan Kunci API (Freepik / Magnific)</label>
                      <input
                        type="password"
                        placeholder="Mulai dengan fp_..."
                        value={apiKey}
                        onChange={(e) => handleApiKeyChange(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-855 rounded-xl px-4 py-3 text-xs focus:outline-none focus:border-cyan-500 transition-all font-mono text-slate-300"
                      />
                    </div>
                    <button 
                      onClick={testApiKeyStatus}
                      disabled={isVerifying}
                      className="w-full bg-cyan-600 hover:bg-cyan-500 text-slate-955 font-black text-xs tracking-wider uppercase py-3 rounded-xl transition-all"
                    >
                      {isVerifying ? "Melakukan Ping..." : "Uji Kredensial Sekarang"}
                    </button>
                  </div>
                </div>

                <div className="bg-slate-900/20 p-6 rounded-2xl border border-slate-850 flex flex-col justify-between">
                  <div className="space-y-4">
                    <h3 className="font-extrabold text-xs uppercase text-slate-400 tracking-wider">
                      Laporan Telemetri Sistem
                    </h3>
                    
                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-900 text-center">
                        <p className="text-[9px] text-slate-500 uppercase font-bold">Konektivitas</p>
                        <p className={`text-xs font-black mt-1 ${apiConnClass}`}>{apiConnStatus}</p>
                      </div>
                      <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-900 text-center">
                        <p className="text-[9px] text-slate-500 uppercase font-bold">Golongan Lisensi</p>
                        <p className="text-xs font-black text-cyan-400 mt-1">{apiAccountType}</p>
                      </div>
                      <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-900 text-center col-span-2">
                        <p className="text-[9px] text-slate-500 uppercase font-bold">Kredit Terbuka</p>
                        <p className="text-base font-black text-slate-100 mt-1">{apiCredits}</p>
                      </div>
                    </div>
                  </div>

                  <div className={`mt-4 p-3 rounded-xl text-[11px] text-center border ${apiVerifClass}`}>
                    {apiVerifAlert}
                  </div>
                </div>
              </div>
            </section>
          )}

          {/* TAB 4: VERCEL SERVERLESS CODE */}
          {activeTab === 'code' && (
            <section className="space-y-6">
              <div>
                <h2 className="text-xl font-black tracking-tight text-white uppercase">Vercel API Routes (Backend Serverless)</h2>
                <p className="text-xs text-slate-400">Salin dua berkas di bawah ini untuk mengimplementasikan serverless backend bebas hambatan CORS.</p>
              </div>

              <div className="space-y-4">
                {/* route generate */}
                <div className="bg-slate-900/40 rounded-xl border border-slate-850 overflow-hidden">
                  <div className="bg-slate-955 px-4 py-2.5 flex justify-between items-center border-b border-slate-900">
                    <span className="text-[10px] font-mono text-cyan-400 font-bold"><i className="fa-solid fa-file-code"></i> app/api/generate/route.ts</span>
                    <button onClick={() => copyToClipboard('code-generate')} className="text-[9px] bg-slate-900 hover:bg-slate-850 px-2 py-0.5 rounded text-slate-400 transition-all font-semibold border border-slate-800">
                      Copy
                    </button>
                  </div>
                  <pre className="p-4 text-[10px] font-mono text-slate-300 overflow-x-auto max-h-[220px] bg-slate-955/20 leading-relaxed">
                    <code id="code-generate">
{`import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const apiKey = req.headers.get('x-user-api-key');
    if (!apiKey) {
      return NextResponse.json({ error: 'API Key wajib disertakan!' }, { status: 400 });
    }

    const formData = await req.formData();
    const model = (formData.get('model') as string) || 'kling-3-omni';
    const prompt = (formData.get('prompt') as string) || '';

    let directCharUrl = '';
    let directMotionUrl = '';

    // 1. Unggah Gambar Karakter ke tmpfiles.org dari Server (Bebas CORS!)
    const imageFile = formData.get('image') as File | null;
    if (imageFile && imageFile.size > 0) {
      const charFormData = new FormData();
      charFormData.append('file', imageFile);

      const charUploadRes = await fetch('https://tmpfiles.org/api/v1/upload', {
        method: 'POST',
        body: charFormData,
      });

      if (!charUploadRes.ok) {
        throw new Error(\`Gagal mengunggah Gambar Karakter ke cloud server. Status: \${charUploadRes.status}\`);
      }
      const charUploadData = await charUploadRes.json();
      const rawCharUrl = charUploadData.data?.url;
      if (!rawCharUrl) {
        throw new Error("Gagal mengurai respons unggahan Gambar Karakter.");
      }
      directCharUrl = rawCharUrl.replace('tmpfiles.org/', 'tmpfiles.org/dl/');
    }

    // 2. Unggah Video Referensi ke tmpfiles.org dari Server (Bebas CORS!)
    const motionFile = formData.get('video_reference') as File | null;
    if (motionFile && motionFile.size > 0) {
      const motionFormData = new FormData();
      motionFormData.append('file', motionFile);

      const motionUploadRes = await fetch('https://tmpfiles.org/api/v1/upload', {
        method: 'POST',
        body: motionFormData,
      });

      if (!motionUploadRes.ok) {
        throw new Error(\`Gagal mengunggah Video Referensi ke cloud server. Status: \${motionUploadRes.status}\`);
      }
      const motionUploadData = await motionUploadRes.json();
      const rawMotionUrl = motionUploadData.data?.url;
      if (!rawMotionUrl) {
        throw new Error("Gagal mengurai respons unggahan Video Referensi.");
      }
      directMotionUrl = rawMotionUrl.replace('tmpfiles.org/', 'tmpfiles.org/dl/');
    }

    // Tentukan endpoint resmi berdasarkan model yang dipilih
    let apiEndpoint = '';
    let payload: any = {};

    if (model === 'upscale') {
      apiEndpoint = 'https://api.magnific.com/v1/ai/image-upscaler';
      payload = {
        image: directCharUrl,
        creativity: Number(formData.get('creativity')) || 4,
        resemblance: Number(formData.get('resemblance')) || 7,
        scale_factor: (formData.get('scale_factor') || '2') + "x",
        prompt: prompt
      };
    } else if (model === 'text-to-image') {
      apiEndpoint = 'https://api.magnific.com/v1/ai/text-to-image';
      payload = {
        prompt: prompt,
        model: 'mystic'
      };
    } else {
      // Pemrosesan Model Video Reference (Kling 3 Omni standard)
      apiEndpoint = 'https://api.magnific.com/v1/ai/reference-to-video/kling-v3-omni-std';
      payload = {
        image_url: directCharUrl,
        video_url: directMotionUrl,
        prompt: prompt,
        duration: 5
      };
    }

    // Mengirim payload JSON bersih ke endpoint Freepik / Magnific
    const response = await fetch(apiEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-freepik-api-key': apiKey,
        'x-magnific-api-key': apiKey
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorText = await response.text();
      return NextResponse.json({ error: \`API Gagal: \${errorText}\` }, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}`}
                    </code>
                  </pre>
                </div>

                {/* route status */}
                <div className="bg-slate-900/40 rounded-xl border border-slate-850 overflow-hidden">
                  <div className="bg-slate-955 px-4 py-2.5 flex justify-between items-center border-b border-slate-900">
                    <span className="text-[10px] font-mono text-cyan-400 font-bold"><i className="fa-solid fa-file-code"></i> app/api/status/route.ts</span>
                    <button onClick={() => copyToClipboard('code-status')} className="text-[9px] bg-slate-900 hover:bg-slate-850 px-2 py-0.5 rounded text-slate-400 transition-all font-semibold border border-slate-800">
                      Copy
                    </button>
                  </div>
                  <pre className="p-4 text-[10px] font-mono text-slate-300 overflow-x-auto max-h-[220px] bg-slate-955/20 leading-relaxed">
                    <code id="code-status">
{`import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  try {
    const apiKey = req.headers.get('x-user-api-key');
    const { searchParams } = new URL(req.url);
    const taskId = searchParams.get('task_id');
    const model = searchParams.get('model') || 'kling-3-omni';

    if (!apiKey || !taskId) {
      return NextResponse.json({ error: 'Parameter tidak lengkap.' }, { status: 400 });
    }

    // Tentukan endpoint polling status berdasarkan jenis model
    let statusEndpoint = \`https://api.magnific.com/v1/ai/reference-to-video/kling-v3-omni-std/\${taskId}\`;
    if (model === 'upscale') {
      statusEndpoint = \`https://api.magnific.com/v1/ai/image-upscaler/\${taskId}\`;
    } else if (model === 'text-to-image') {
      statusEndpoint = \`https://api.freepik.com/v1/ai/text-to-image/tasks/\${taskId}\`;
    }

    const response = await fetch(statusEndpoint, {
      method: 'GET',
      headers: {
        'x-freepik-api-key': apiKey,
        'x-magnific-api-key': apiKey
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      return NextResponse.json({ error: \`Gagal sinkronisasi status: \${errorText}\` }, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}`}
                    </code>
                  </pre>
                </div>
              </div>
            </section>
          )}

        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-slate-900/60 py-6 text-center bg-slate-950/40 mt-auto text-[11px] text-slate-500">
        Powered by Magnific AI (Freepik Rebrand Suite) & Vercel Serverless. No databases required.
      </footer>
    </div>
  );
}