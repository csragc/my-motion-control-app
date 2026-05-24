import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const apiKey = req.headers.get('x-user-api-key');
    if (!apiKey) {
      return NextResponse.json({ error: 'API Key wajib disertakan!' }, { status: 400 });
    }

    const body = await req.json();
    const model = body.model || 'kling-3-omni';

    // Tentukan endpoint resmi berdasarkan model yang dipilih
    let apiEndpoint = '';
    let payload: any = {};

    if (model === 'upscale') {
      apiEndpoint = 'https://api.magnific.com/v1/ai/image-upscaler';
      payload = {
        image: body.image_url,
        creativity: body.creativity || 4,
        resemblance: body.resemblance || 7,
        scale_factor: body.scale_factor + "x",
        prompt: body.prompt || ''
      };
    } else if (model === 'text-to-image') {
      apiEndpoint = 'https://api.magnific.com/v1/ai/text-to-image';
      payload = {
        prompt: body.prompt,
        model: 'mystic'
      };
    } else {
      // Pemrosesan Model Video Reference (Kling 3 Omni standard)
      apiEndpoint = 'https://api.magnific.com/v1/ai/reference-to-video/kling-v3-omni-std';
      payload = {
        image_url: body.image_url,
        video_url: body.video_url,
        prompt: body.prompt || '',
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