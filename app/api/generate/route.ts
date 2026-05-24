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

    // Helper untuk mengunggah file biner dengan Strategi Dual-Cloud Fallback (tmpfiles.org & transfer.sh)
    const uploadFileWithFallback = async (file: File, fieldName: string): Promise<string> => {
      const buffer = Buffer.from(await file.arrayBuffer());

      // 1. Coba Unggah Primer (tmpfiles.org)
      try {
        const primaryFormData = new FormData();
        const blob = new Blob([buffer], { type: file.type });
        primaryFormData.append('file', blob, file.name);

        const uploadRes = await fetch('https://tmpfiles.org/api/v1/upload', {
          method: 'POST',
          body: primaryFormData,
        });

        if (uploadRes.ok) {
          const uploadData = await uploadRes.json();
          const rawUrl = uploadData.data?.url;
          if (rawUrl) {
            return rawUrl.replace('tmpfiles.org/', 'tmpfiles.org/dl/');
          }
        }
      } catch (primaryErr) {
        // Lanjut ke opsi cadangan
      }

      // 2. Coba Unggah Cadangan / Fallback (transfer.sh) - Lebih stabil karena biner murni PUT
      try {
        const cleanFileName = file.name.replace(/[^a-zA-Z0-9.]/g, '_');
        const fallbackRes = await fetch(`https://transfer.sh/${cleanFileName}`, {
          method: 'PUT',
          body: buffer,
          headers: {
            'Content-Type': file.type
          }
        });

        if (fallbackRes.ok) {
          const directUrl = await fallbackRes.text();
          if (directUrl && directUrl.startsWith('http')) {
            return directUrl.trim();
          }
        }
      } catch (fallbackErr) {
        // Abaikan
      }

      throw new Error(`Gagal memproses ${fieldName}. Silakan coba berkas lain atau kurangi ukurannya.`);
    };

    // 1. Proses Unggah Gambar Karakter
    const imageFile = formData.get('image') as File | null;
    if (imageFile && imageFile.size > 0) {
      directCharUrl = await uploadFileWithFallback(imageFile, 'Gambar Karakter');
    }

    // 2. Proses Unggah Video Referensi
    const motionFile = formData.get('video_reference') as File | null;
    if (motionFile && motionFile.size > 0) {
      directMotionUrl = await uploadFileWithFallback(motionFile, 'Video Referensi');
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
      return NextResponse.json({ error: `API Gagal: ${errorText}` }, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}