import { NextRequest, NextResponse } from 'next/server';

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

    // Helper untuk mengunggah file biner dengan Strategi Triple-Cloud Fallback (Pixeldrain, transfer.sh, Catbox)
    // Tanpa melakukan arrayBuffer conversion yang tidak efisien di serverless environment
    const uploadFileWithFallback = async (file: File, fieldName: string): Promise<string> => {
      const cleanFileName = encodeURIComponent(file.name.replace(/[^a-zA-Z0-9.]/g, '_') || 'file');

      console.log(`[Upload] Memulai pengunggahan untuk ${fieldName}: ${file.name} (${file.size} bytes)`);

      // 1. Opsi Utama: Pixeldrain (PUT - Raw Binary) -> Paling stabil, cepat, & andal untuk serverless environment
      try {
        console.log(`[Upload] Mencoba Pixeldrain PUT...`);
        const pixeldrainRes = await fetch(`https://pixeldrain.com/api/file/${cleanFileName}`, {
          method: 'PUT',
          body: file // Mengalirkan file (Blob/File) secara utuh langsung dari serverless Next.js
        });

        if (pixeldrainRes.ok) {
          const data = await pixeldrainRes.json();
          if (data.success && data.id) {
            const finalUrl = `https://pixeldrain.com/api/file/${data.id}`;
            console.log(`[Upload] Pixeldrain Sukses! URL: ${finalUrl}`);
            return finalUrl;
          }
        }
        console.warn(`[Upload] Pixeldrain merespons dengan status gagal: ${pixeldrainRes.status}`);
      } catch (err: any) {
        console.warn(`[Upload] Pixeldrain gagal, mencoba transfer.sh. Error: ${err.message}`);
      }

      // 2. Cadangan Pertama: transfer.sh (PUT - Raw Binary)
      try {
        console.log(`[Upload] Mencoba transfer.sh PUT...`);
        const fallbackRes = await fetch(`https://transfer.sh/${cleanFileName}`, {
          method: 'PUT',
          body: file,
          headers: {
            'Content-Type': file.type || 'application/octet-stream'
          }
        });

        if (fallbackRes.ok) {
          const directUrl = await fallbackRes.text();
          if (directUrl && directUrl.startsWith('http')) {
            const finalUrl = directUrl.trim();
            console.log(`[Upload] transfer.sh Sukses! URL: ${finalUrl}`);
            return finalUrl;
          }
        }
      } catch (fallbackErr: any) {
        console.warn(`[Upload] transfer.sh gagal, mencoba catbox.moe. Error: ${fallbackErr.message}`);
      }

      // 3. Cadangan Kedua: catbox.moe (POST - Multipart Form)
      try {
        console.log(`[Upload] Mencoba catbox.moe POST...`);
        const catboxFormData = new FormData();
        catboxFormData.append('reqtype', 'fileupload');
        catboxFormData.append('fileToUpload', file);

        const catboxRes = await fetch('https://catbox.moe/user/api.php', {
          method: 'POST',
          body: catboxFormData,
        });

        if (catboxRes.ok) {
          const fileUrl = await catboxRes.text();
          if (fileUrl && fileUrl.startsWith('http')) {
            const finalUrl = fileUrl.trim();
            console.log(`[Upload] catbox.moe Sukses! URL: ${finalUrl}`);
            return finalUrl;
          }
        }
      } catch (catboxErr: any) {
        console.error(`[Upload] Semua provider cloud upload gagal! Error: ${catboxErr.message}`);
      }

      throw new Error(`Gagal memproses berkas ${fieldName}. Silakan coba kompres ukurannya.`);
    };

    // 1. Unggah Gambar Karakter
    const imageFile = formData.get('image') as File | null;
    if (imageFile && imageFile.size > 0) {
      directCharUrl = await uploadFileWithFallback(imageFile, 'Gambar Karakter');
    }

    // 2. Unggah Video Referensi
    const motionFile = formData.get('video_reference') as File | null;
    if (motionFile && motionFile.size > 0) {
      directMotionUrl = await uploadFileWithFallback(motionFile, 'Video Referensi');
    }

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
      // Endpoint Video Reference resmi Magnific / Freepik
      apiEndpoint = 'https://api.magnific.com/v1/ai/reference-to-video/kling-v3-omni-std';
      payload = {
        image_url: directCharUrl,
        video_url: directMotionUrl,
        prompt: prompt,
        duration: 5
      };
    }

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
      return NextResponse.json({ error: `API Gagal: ${errorText}` }, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}