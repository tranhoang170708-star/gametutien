// app/api/breakthrough/route.ts
// API endpoint để xử lý đột phá cảnh giới

import { NextRequest, NextResponse } from 'next/server';
import { attemptBreakthrough, updatePlayerStats } from '@/game-logic';
import realmsData from '@/data/realms-data.json';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { player, itemBonus = 0 } = body;
    
    // Validate input
    if (!player) {
      return NextResponse.json(
        { error: 'Missing player data' },
        { status: 400 }
      );
    }
    
    const nextRealmIndex = player.currentRealm + 1;
    
    if (nextRealmIndex >= realmsData.length) {
      return NextResponse.json(
        { error: 'Already at maximum realm!' },
        { status: 400 }
      );
    }
    
    const nextRealm = realmsData[nextRealmIndex];
    
    // Attempt breakthrough
    const result = attemptBreakthrough(player, nextRealm, itemBonus);
    
    // Update player stats based on result
    let updatedPlayer = { ...player };
    
    if (result.success) {
      // Success - update realm and add rewards
      updatedPlayer = updatePlayerStats(updatedPlayer, {
        currentRealm: 1, // Move to next realm
        tuVi: result.rewards!.tuVi,
        linhThach: result.rewards!.linhThach - nextRealm.requirements.linhThach, // Subtract cost, add reward
        danhVong: result.rewards!.danhVong
      });
      
      // Bonus tâm cảnh if passed tam ma
      if (result.tamMaPassed) {
        updatedPlayer = updatePlayerStats(updatedPlayer, {
          tamCanh: 5
        });
      }
      
      // Bonus if passed thien kiep
      if (result.thienKiepPassed) {
        updatedPlayer = updatePlayerStats(updatedPlayer, {
          tamCanh: 8,
          ngoTinh: 3
        });
      }
      
    } else {
      // Failure - apply penalties
      if (result.penalties) {
        updatedPlayer = updatePlayerStats(updatedPlayer, {
          tuVi: -result.penalties.tuVi,
          linhThach: result.penalties.linhThach ? -result.penalties.linhThach : -nextRealm.requirements.linhThach,
          tamCanh: result.penalties.tamCanh ? -result.penalties.tamCanh : 0
        });
      }
    }
    
    return NextResponse.json({
      success: result.success,
      result,
      updatedPlayer,
      message: result.message,
      flavorText: result.flavorText
    });
    
  } catch (error) {
    console.error('Breakthrough error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// GET endpoint để check xem có thể đột phá không
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
    const nextRealmIndex = player.currentRealm + 1;
    
    if (nextRealmIndex >= realmsData.length) {
      return NextResponse.json({
        canBreakthrough: false,
        reason: 'Đã đạt cảnh giới tối đa!'
      });
    }
    
    const nextRealm = realmsData[nextRealmIndex];
    
    // Check requirements
    const reasons = [];
    
    if (player.tuVi < nextRealm.requirements.tuVi) {
      reasons.push(`Tu vi chưa đủ: cần ${nextRealm.requirements.tuVi.toLocaleString()}, hiện có ${player.tuVi.toLocaleString()}`);
    }
    
    if (player.linhThach < nextRealm.requirements.linhThach) {
      reasons.push(`Linh thạch chưa đủ: cần ${nextRealm.requirements.linhThach.toLocaleString()}, hiện có ${player.linhThach.toLocaleString()}`);
    }
    
    return NextResponse.json({
      canBreakthrough: reasons.length === 0,
      nextRealm,
      reasons: reasons.length > 0 ? reasons : undefined,
      breakthroughChance: nextRealm.breakthrough.baseSuccessRate,
      tamMaChance: nextRealm.breakthrough.tamMaChance,
      hasThienKiep: nextRealm.requirements.thienKiep || false
    });
    
  } catch (error) {
    console.error('Breakthrough check error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
