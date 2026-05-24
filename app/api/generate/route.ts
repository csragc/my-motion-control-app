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

    const uploadFileWithFallback = async (file: File, fieldName: string): Promise<string> => {
      const buffer = Buffer.from(await file.arrayBuffer());

      // 1. Opsi Unggahan Utama: tmpfiles.org
      try {
        const primaryFormData = new FormData();
        primaryFormData.append('file', file);

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
        console.warn("tmpfiles.org gagal, mencoba transfer.sh...", primaryErr);
      }

      // 2. Opsi Cadangan Pertama: transfer.sh (Menggunakan raw binary PUT)
      try {
        const cleanFileName = file.name.replace(/[^a-zA-Z0-9.]/g, '_') || 'file';
        const fallbackRes = await fetch(`https://transfer.sh/${cleanFileName}`, {
          method: 'PUT',
          body: buffer,
          headers: {
            'Content-Type': file.type || 'application/octet-stream'
          }
        });

        if (fallbackRes.ok) {
          const directUrl = await fallbackRes.text();
          if (directUrl && directUrl.startsWith('http')) {
            return directUrl.trim();
          }
        }
      } catch (fallbackErr) {
        console.warn("transfer.sh gagal, mencoba catbox.moe...", fallbackErr);
      }

      // 3. Opsi Cadangan Kedua: catbox.moe
      try {
        const catboxFormData = new FormData();
        catboxFormData.append('reqtype', 'fileupload');
        const blob = new Blob([buffer], { type: file.type });
        catboxFormData.append('fileToUpload', blob, file.name);

        const catboxRes = await fetch('https://catbox.moe/user/api.php', {
          method: 'POST',
          body: catboxFormData,
        });

        if (catboxRes.ok) {
          const fileUrl = await catboxRes.text();
          if (fileUrl && fileUrl.startsWith('http')) {
            return fileUrl.trim();
          }
        }
      } catch (catboxErr) {
        console.error("Semua cloud storage cadangan gagal:", catboxErr);
      }

      throw new Error(`Gagal memproses ${fieldName}. Coba ganti berkas atau kompres ukurannya.`);
    };

    const imageFile = formData.get('image') as File | null;
    if (imageFile && imageFile.size > 0) {
      directCharUrl = await uploadFileWithFallback(imageFile, 'Gambar Karakter');
    }

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