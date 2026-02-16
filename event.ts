// app/api/event/route.ts
// API endpoint để xử lý random events

import { NextRequest, NextResponse } from 'next/server';
import { triggerRandomEvent, resolveEventChoice, updatePlayerStats } from '@/game-logic';
import eventsData from '@/data/events-data.json';

// GET - Lấy random event phù hợp với player
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
    
    // Filter events available for current realm
    const availableEvents = eventsData.filter(event => 
      player.currentRealm >= event.availableFrom &&
      player.currentRealm <= event.availableTo
    );
    
    if (availableEvents.length === 0) {
      return NextResponse.json({
        hasEvent: false,
        message: 'Không có sự kiện nào khả dụng'
      });
    }
    
    // Weight events by khiVan and trigger chance
    const weightedEvents = availableEvents.map(event => ({
      ...event,
      weight: event.triggerChance * (1 + event.khiVanModifier * ((player.khiVan - 50) / 50))
    }));
    
    // Random select
    const totalWeight = weightedEvents.reduce((sum, e) => sum + e.weight, 0);
    let random = Math.random() * totalWeight;
    
    let selectedEvent = weightedEvents[0];
    for (const event of weightedEvents) {
      random -= event.weight;
      if (random <= 0) {
        selectedEvent = event;
        break;
      }
    }
    
    // Prepare event with available choices
    const preparedEvent = triggerRandomEvent(selectedEvent, player);
    
    return NextResponse.json({
      hasEvent: true,
      event: preparedEvent
    });
    
  } catch (error) {
    console.error('Event fetch error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST - Resolve event choice
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { player, eventId, choiceId } = body;
    
    if (!player || !eventId || !choiceId) {
      return NextResponse.json(
        { error: 'Missing required data' },
        { status: 400 }
      );
    }
    
    // Find event
    const event = eventsData.find(e => e.id === eventId);
    if (!event) {
      return NextResponse.json(
        { error: 'Event not found' },
        { status: 404 }
      );
    }
    
    // Find choice
    const choice = event.choices.find(c => c.id === choiceId);
    if (!choice) {
      return NextResponse.json(
        { error: 'Choice not found' },
        { status: 404 }
      );
    }
    
    // Check requirements
    if (choice.requirements) {
      const reqs = choice.requirements;
      if (reqs.ngoTinh && player.ngoTinh < reqs.ngoTinh) {
        return NextResponse.json(
          { error: `Cần ngộ tính >= ${reqs.ngoTinh}` },
          { status: 400 }
        );
      }
      if (reqs.tamCanh && player.tamCanh < reqs.tamCanh) {
        return NextResponse.json(
          { error: `Cần tâm cảnh >= ${reqs.tamCanh}` },
          { status: 400 }
        );
      }
      if (reqs.khiVan && player.khiVan < reqs.khiVan) {
        return NextResponse.json(
          { error: `Cần khí vận >= ${reqs.khiVan}` },
          { status: 400 }
        );
      }
      if (reqs.linhThach && player.linhThach < reqs.linhThach) {
        return NextResponse.json(
          { error: `Cần linh thạch >= ${reqs.linhThach}` },
          { status: 400 }
        );
      }
    }
    
    // Resolve choice
    const outcome = resolveEventChoice(choice, player);
    
    // Apply effects
    let updatedPlayer = { ...player };
    
    if (outcome.effects) {
      updatedPlayer = updatePlayerStats(updatedPlayer, {
        tuVi: outcome.effects.tuVi || 0,
        canCot: outcome.effects.canCot || 0,
        ngoTinh: outcome.effects.ngoTinh || 0,
        khiVan: outcome.effects.khiVan || 0,
        tamCanh: outcome.effects.tamCanh || 0,
        linhThach: outcome.effects.linhThach || 0,
        danhVong: outcome.effects.danhVong || 0
      });
    }
    
    return NextResponse.json({
      success: true,
      outcome,
      updatedPlayer,
      specialReward: outcome.effects.specialReward
    });
    
  } catch (error) {
    console.error('Event resolution error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
