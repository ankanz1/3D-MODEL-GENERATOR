import { NextResponse } from "next/server";
import { cookies } from 'next/headers';

interface HistoryItem {
  id: string;
  modelType: string;
  keywords: string[];
  prompt: string;
  modelUrl?: string;
  downloadUrl?: string;
  timestamp: string;
}

const HISTORY_COOKIE = 'search_history';
const MAX_HISTORY_ITEMS = 50;

export async function GET() {
  try {
    const cookieStore = cookies();
    const historyCookie = cookieStore.get(HISTORY_COOKIE);
    
    if (!historyCookie) {
      return NextResponse.json([]);
    }

    const history: HistoryItem[] = JSON.parse(decodeURIComponent(historyCookie.value));
    return NextResponse.json(history);
  } catch (error) {
    console.error('Error fetching history:', error);
    return NextResponse.json({ error: 'Failed to fetch history' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const cookieStore = cookies();
    const historyCookie = cookieStore.get(HISTORY_COOKIE);
    
    const newItem: HistoryItem = await request.json();
    newItem.id = crypto.randomUUID();
    
    let history: HistoryItem[] = [];
    if (historyCookie) {
      history = JSON.parse(decodeURIComponent(historyCookie.value));
    }

    // Add new item to the beginning of the array
    history.unshift(newItem);

    // Keep only the most recent items
    if (history.length > MAX_HISTORY_ITEMS) {
      history = history.slice(0, MAX_HISTORY_ITEMS);
    }

    // Save updated history
    cookieStore.set(HISTORY_COOKIE, encodeURIComponent(JSON.stringify(history)), {
      maxAge: 30 * 24 * 60 * 60, // 30 days
      path: '/',
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
    });

    return NextResponse.json(newItem);
  } catch (error) {
    console.error('Error saving history:', error);
    return NextResponse.json({ error: 'Failed to save history' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const cookieStore = cookies();
    const historyCookie = cookieStore.get(HISTORY_COOKIE);
    
    if (!historyCookie) {
      return NextResponse.json({ error: 'No history found' }, { status: 404 });
    }

    const updatedItem: HistoryItem = await request.json();
    let history: HistoryItem[] = JSON.parse(decodeURIComponent(historyCookie.value));

    // Find and update the item
    const index = history.findIndex(item => item.id === updatedItem.id);
    if (index === -1) {
      return NextResponse.json({ error: 'Item not found' }, { status: 404 });
    }

    history[index] = { ...history[index], ...updatedItem };

    // Save updated history
    cookieStore.set(HISTORY_COOKIE, encodeURIComponent(JSON.stringify(history)), {
      maxAge: 30 * 24 * 60 * 60, // 30 days
      path: '/',
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
    });

    return NextResponse.json(updatedItem);
  } catch (error) {
    console.error('Error updating history:', error);
    return NextResponse.json({ error: 'Failed to update history' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const cookieStore = cookies();
    const historyCookie = cookieStore.get(HISTORY_COOKIE);
    
    if (!historyCookie) {
      return NextResponse.json({ error: 'No history found' }, { status: 404 });
    }

    const { id } = await request.json();
    let history: HistoryItem[] = JSON.parse(decodeURIComponent(historyCookie.value));

    // Remove the item
    history = history.filter(item => item.id !== id);

    // Save updated history
    cookieStore.set(HISTORY_COOKIE, encodeURIComponent(JSON.stringify(history)), {
      maxAge: 30 * 24 * 60 * 60, // 30 days
      path: '/',
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting history:', error);
    return NextResponse.json({ error: 'Failed to delete history' }, { status: 500 });
  }
} 