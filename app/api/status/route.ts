import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  try {
    const apiKey = req.headers.get('x-user-api-key');
    const { searchParams } = new URL(req.url);
    const taskId = searchParams.get('task_id');
    const model = searchParams.get('model') || 'kling-3-omni';

    if (!apiKey || !taskId) {
      return NextResponse.json({ error: 'Parameter tidak lengkap.' }, { status: 400 });
    }

    // Tentukan endpoint status berdasarkan jenis model
    let statusEndpoint = `https://api.freepik.com/v1/ai/video-generator/tasks/${taskId}`;
    if (model === 'upscale') {
      statusEndpoint = `https://api.freepik.com/v1/ai/image-upscaler/tasks/${taskId}`;
    } else if (model === 'text-to-image') {
      statusEndpoint = `https://api.freepik.com/v1/ai/text-to-image/tasks/${taskId}`;
    }

    const response = await fetch(statusEndpoint, {
      method: 'GET',
      headers: {
        'x-freepik-api-key': apiKey,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      return NextResponse.json({ error: `Gagal sinkronisasi: ${errorText}` }, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}