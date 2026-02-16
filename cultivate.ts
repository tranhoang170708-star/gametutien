// app/api/cultivate/route.ts
// API endpoint để xử lý tu luyện

import { NextRequest, NextResponse } from 'next/server';
import { processCultivation, updatePlayerStats } from '@/game-logic';
import realmsData from '@/data/realms-data.json';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { player, duration } = body;
    
    // Validate input
    if (!player || !duration) {
      return NextResponse.json(
        { error: 'Missing player data or duration' },
        { status: 400 }
      );
    }
    
    if (duration < 1 || duration > 1440) {
      return NextResponse.json(
        { error: 'Duration must be between 1 and 1440 minutes' },
        { status: 400 }
      );
    }
    
    // Process cultivation
    const result = processCultivation(player, duration, realmsData);
    
    // Update player stats
    const updatedPlayer = updatePlayerStats(player, {
      tuVi: result.tuViGain
    });
    
    return NextResponse.json({
      success: true,
      result,
      updatedPlayer,
      message: `Tu luyện ${duration} phút hoàn thành. Tăng ${result.tuViGain.toLocaleString()} tu vi.`
    });
    
  } catch (error) {
    console.error('Cultivation error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
