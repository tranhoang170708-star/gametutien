// app/api/battle/route.ts
// API endpoint để xử lý chiến đấu với boss

import { NextRequest, NextResponse } from 'next/server';
import { battleBoss, updatePlayerStats } from '@/game-logic';
import bossesData from '@/data/bosses-data.json';

// GET - Lấy danh sách boss khả dụng
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const playerData = searchParams.get('player');
    
    if (!playerData) {
      return NextResponse.json(
        { error: 'Missing player data' },
        { status: 400 }
      );
    }
    
    const player = JSON.parse(playerData);
    
    // Filter bosses available for current realm
    // Bosses available from -5 to +10 realms
    const availableBosses = bossesData.filter(boss => 
      boss.realm >= player.currentRealm - 5 &&
      boss.realm <= player.currentRealm + 10
    );
    
    return NextResponse.json({
      bosses: availableBosses,
      currentRealm: player.currentRealm
    });
    
  } catch (error) {
    console.error('Boss list error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST - Chiến đấu với boss
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { player, bossId } = body;
    
    if (!player || !bossId) {
      return NextResponse.json(
        { error: 'Missing player data or boss ID' },
        { status: 400 }
      );
    }
    
    // Find boss
    const boss = bossesData.find(b => b.id === bossId);
    if (!boss) {
      return NextResponse.json(
        { error: 'Boss not found' },
        { status: 404 }
      );
    }
    
    // Battle!
    const result = battleBoss(player, boss);
    
    // Update player stats
    let updatedPlayer = { ...player };
    
    if (result.victory) {
      updatedPlayer = updatePlayerStats(updatedPlayer, {
        tuVi: result.rewards!.tuVi,
        linhThach: result.rewards!.linhThach,
        danhVong: result.rewards!.danhVong
      });
    } else {
      updatedPlayer = updatePlayerStats(updatedPlayer, {
        tuVi: -result.penalties!.tuVi,
        linhThach: -result.penalties!.linhThach,
        khiVan: result.penalties!.khiVan ? -result.penalties!.khiVan : 0
      });
    }
    
    return NextResponse.json({
      success: result.victory,
      result,
      updatedPlayer,
      specialItems: result.victory ? result.rewards?.specialItems : undefined
    });
    
  } catch (error) {
    console.error('Battle error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
