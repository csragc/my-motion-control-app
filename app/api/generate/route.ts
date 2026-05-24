import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const apiKey = req.headers.get('x-user-api-key');
    if (!apiKey) {
      return NextResponse.json({ error: 'API Key Magnific wajib diisi!' }, { status: 400 });
    }

    const formData = await req.formData();
    const model = (formData.get('model') as string) || 'kling-3-omni';

    // Siapkan FormData baru khusus untuk dilempar ke API Magnific
    const magnificPayload = new FormData();
    
    // Teruskan semua input berkas & teks dari frontend
    for (const [key, value] of formData.entries()) {
      if (key !== 'model') {
        magnificPayload.append(key, value);
      }
    }

    // Panggil API resmi Magnific (Sesuaikan endpoint berdasarkan model)
    const response = await fetch(`https://api.magnific.com/v1/ai/${model}`, {
      method: 'POST',
      headers: {
        'x-magnific-api-key': apiKey,
      },
      body: magnificPayload,
    });

    if (!response.ok) {
      const errorText = await response.text();
      return NextResponse.json({ error: `Magnific Error: ${errorText}` }, { status: response.status });
    }

    const data = await response.json();
    
    // Kembalikan task_id dan model ke browser user untuk di-polling
    return NextResponse.json({ task_id: data.task_id, model });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}