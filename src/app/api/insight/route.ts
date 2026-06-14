import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';

type InsightSummary = {
  totalIncome: number;
  totalExpense: number;
  net: number;
  topCategories: Array<{ category: string; amount: number }>;
  recentTransactions: Array<{ category: string; type: string; amount: number; date: string }>;
};

function readSummary(body: unknown): InsightSummary | null {
  if (!body || typeof body !== 'object') return null;
  const candidate = body as Partial<InsightSummary>;

  if (
    typeof candidate.totalIncome !== 'number' ||
    typeof candidate.totalExpense !== 'number' ||
    typeof candidate.net !== 'number' ||
    !Array.isArray(candidate.topCategories) ||
    !Array.isArray(candidate.recentTransactions)
  ) {
    return null;
  }

  return candidate as InsightSummary;
}

export async function GET() {
  return NextResponse.json(
    { error: 'Use POST with a transaction summary.' },
    { status: 405 }
  );
}

export async function POST(request: NextRequest) {
  if (!process.env.OPENROUTER_API_KEY) {
    return NextResponse.json({
      error: 'OPENROUTER_API_KEY is not configured',
    }, { status: 503 });
  }

  const body = await request.json().catch(() => null);
  const summary = readSummary(body?.summary ?? body);

  if (!summary) {
    return NextResponse.json({ error: 'Invalid summary payload' }, { status: 400 });
  }

  const model = process.env.OPENROUTER_MODEL || 'openrouter/free';
  const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': process.env.APP_BASE_URL || process.env.AUTH0_BASE_URL || 'http://localhost:3001',
      'X-Title': 'FinTrack Insight',
    },
    body: JSON.stringify({
      model,
      messages: [
        {
          role: 'system',
          content: 'You are a concise personal finance assistant. Give practical, friendly, direct insights based on the user\'s transaction summary. Keep the response short and simple. Focus on where money is spent and 2 to 4 improvements.',
        },
        {
          role: 'user',
          content: `Analyze this spending summary and suggest improvements:\n${JSON.stringify(summary, null, 2)}`,
        },
      ],
      temperature: 0.4,
      max_tokens: 300,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text().catch(() => '');
    return NextResponse.json(
      {
        error: errorText || 'OpenRouter request failed',
      },
      { status: 502 }
    );
  }

  const data = await response.json();
  const insight = data?.choices?.[0]?.message?.content?.trim() || 'No insight returned.';

  return NextResponse.json({ insight });
}
