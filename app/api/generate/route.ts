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

    // 1. Unggah Gambar Karakter ke tmpfiles.org dari Server (Bebas CORS!)
    const imageFile = formData.get('image') as File | null;
    if (imageFile && imageFile.size > 0) {
      const charFormData = new FormData();
      const buffer = Buffer.from(await imageFile.arrayBuffer());
      const blob = new Blob([buffer], { type: imageFile.type });
      charFormData.append('file', blob, imageFile.name);

      const charUploadRes = await fetch('https://tmpfiles.org/api/v1/upload', {
        method: 'POST',
        body: charFormData,
      });

      if (!charUploadRes.ok) {
        throw new Error(`Gagal mengunggah Gambar Karakter ke cloud server. Status: ${charUploadRes.status}`);
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
      const buffer = Buffer.from(await motionFile.arrayBuffer());
      const blob = new Blob([buffer], { type: motionFile.type });
      motionFormData.append('file', blob, motionFile.name);

      const motionUploadRes = await fetch('https://tmpfiles.org/api/v1/upload', {
        method: 'POST',
        body: motionFormData,
      });

      if (!motionUploadRes.ok) {
        throw new Error(`Gagal mengunggah Video Referensi ke cloud server. Status: ${motionUploadRes.status}`);
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
      return NextResponse.json({ error: `API Gagal: ${errorText}` }, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
