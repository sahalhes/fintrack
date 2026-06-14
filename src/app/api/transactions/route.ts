import { NextRequest, NextResponse } from 'next/server';
import { auth0, isAuth0Configured } from '@/lib/auth0';
import { deleteUserTransactions, getUserTransactions, saveUserTransactions } from '@/lib/transactions';

export const runtime = 'nodejs';

export async function GET() {
  if (!isAuth0Configured || !auth0 || !process.env.DATABASE_URL) {
    return NextResponse.json(
      { error: 'Cloud sync unavailable: Auth0 or database not configured' },
      { status: 503 }
    );
  }

  const session = await auth0.getSession();

  if (!session) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  const userId = session.user.sub;
  const transactions = await getUserTransactions(userId);
  return NextResponse.json({ transactions: transactions || [] });
}

export async function POST(request: NextRequest) {
  if (!isAuth0Configured || !auth0 || !process.env.DATABASE_URL) {
    return NextResponse.json(
      { error: 'Cloud sync unavailable: Auth0 or database not configured' },
      { status: 503 }
    );
  }

  const session = await auth0.getSession();

  if (!session) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  const MAX_BODY_SIZE = 1e6;
  const contentLength = request.headers.get('content-length');
  if (contentLength && parseInt(contentLength) > MAX_BODY_SIZE) {
    return NextResponse.json({ error: 'Request body too large' }, { status: 413 });
  }

  const userId = session.user.sub;
  const body = await request.json();

  await saveUserTransactions(userId, body.transactions || []);

  return NextResponse.json({ message: 'Transactions saved successfully' }, { status: 200 });
}

export async function DELETE() {
  if (!isAuth0Configured || !auth0 || !process.env.DATABASE_URL) {
    return NextResponse.json(
      { error: 'Cloud sync unavailable: Auth0 or database not configured' },
      { status: 503 }
    );
  }

  const session = await auth0.getSession();

  if (!session) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  await deleteUserTransactions(session.user.sub);
  return NextResponse.json({ message: 'Transactions deleted successfully' }, { status: 200 });
}
