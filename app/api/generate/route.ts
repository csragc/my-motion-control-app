import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    // Mengambil API Key dari Custom Header yang dikirim oleh sisi Client (Browser)
    const apiKey = req.headers.get('x-user-api-key');
    if (!apiKey) {
      return NextResponse.json({ error: 'API Key wajib disertakan!' }, { status: 400 });
    }

    const formData = await req.formData();
    const model = (formData.get('model') as string) || 'kling-3-omni';

    // Tentukan endpoint Freepik/Magnific berdasarkan jenis model yang dipilih
    let apiEndpoint = 'https://api.freepik.com/v1/ai/video-generator';
    if (model === 'upscale') {
      apiEndpoint = 'https://api.freepik.com/v1/ai/image-upscaler';
    } else if (model === 'text-to-image') {
      apiEndpoint = 'https://api.freepik.com/v1/ai/text-to-image';
    }

    // Salin payload asli dari client untuk diteruskan ke API eksternal
    const payload = new FormData();
    for (const [key, value] of formData.entries()) {
      payload.append(key, value);
    }

    // Mengirimkan request ke server resmi Freepik/Magnific
    const response = await fetch(apiEndpoint, {
      method: 'POST',
      headers: {
        'x-freepik-api-key': apiKey,
        // Content-Type sengaja dikosongkan agar Fetch API menentukan boundary multipart/form-data otomatis
      },
      body: payload,
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