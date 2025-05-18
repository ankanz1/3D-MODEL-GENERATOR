import { NextResponse } from "next/server";
import { cookies } from 'next/headers';

// In-memory storage for demo purposes
// In a production app, you would use a database
let searchHistory: any[] = [];

export async function GET() {
  try {
    // Get history from cookies if available
    const cookieStore = cookies();
    const historyCookie = cookieStore.get('searchHistory');
    
    if (historyCookie) {
      try {
        searchHistory = JSON.parse(historyCookie.value);
      } catch (e) {
        console.error("Error parsing history cookie:", e);
        searchHistory = [];
      }
    }
    
    return NextResponse.json(searchHistory);
  } catch (error) {
    console.error("Error fetching history:", error);
    return NextResponse.json(
      { error: "Failed to fetch history" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json();
    
    // Add timestamp to the search
    const searchEntry = {
      ...data,
      id: crypto.randomUUID(), // Add unique ID
      timestamp: new Date().toISOString(),
    };

    // Add to the beginning of the array
    searchHistory.unshift(searchEntry);

    // Keep only the last 50 searches
    if (searchHistory.length > 50) {
      searchHistory = searchHistory.slice(0, 50);
    }

    // Save to cookies
    const cookieStore = cookies();
    cookieStore.set('searchHistory', JSON.stringify(searchHistory), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax', // Changed from 'strict' to 'lax' for better compatibility
      maxAge: 60 * 60 * 24 * 7, // 1 week
      path: '/', // Ensure cookie is available across all paths
    });

    return NextResponse.json(searchEntry);
  } catch (error) {
    console.error("Error saving history:", error);
    return NextResponse.json(
      { error: "Failed to save history" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const { id } = await request.json();
    
    // Remove the item from history
    searchHistory = searchHistory.filter(item => item.id !== id);
    
    // Update cookies
    const cookieStore = cookies();
    cookieStore.set('searchHistory', JSON.stringify(searchHistory), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax', // Changed from 'strict' to 'lax' for better compatibility
      maxAge: 60 * 60 * 24 * 7, // 1 week
      path: '/', // Ensure cookie is available across all paths
    });
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting history item:", error);
    return NextResponse.json(
      { error: "Failed to delete history item" },
      { status: 500 }
    );
  }
} 