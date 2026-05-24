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

    const response = await fetch(`https://api.magnific.com/v1/ai/${model}/${taskId}`, {
      method: 'GET',
      headers: {
        'x-magnific-api-key': apiKey,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      return NextResponse.json({ error: `Gagal sinkronisasi: ${errorText}` }, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json(data); // Mengembalikan status 'processing', 'completed', atau 'failed'
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}