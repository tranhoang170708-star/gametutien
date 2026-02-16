// ============================================
// TU TIÊN GAME - GAME LOGIC
// ============================================

import {
  PlayerStats,
  Realm,
  RandomEvent,
  Boss,
  TamMa,
  ThienKiep,
  EventOutcome,
  CultivationSession
} from './types';
import {
  calculateRequiredTuVi,
  calculateBreakthroughChance,
  calculateTamMaChance,
  calculateThienKiepDifficulty,
  calculateBreakthroughCost,
  calculateCultivationReward,
  calculateCultivationSpeed,
  calculateEventChance,
  calculateBreakthroughRewards,
  GAME_CONSTANTS
} from './game-constants';

// ============================================
// TU LUYỆN (CULTIVATION)
// ============================================

export function processCultivation(
  player: PlayerStats,
  duration: number, // minutes
  realms: Realm[]
): CultivationSession {
  const currentRealm = realms[player.currentRealm];
  
  // Tính tu vi gain
  const tuViPerMinute = calculateCultivationSpeed(
    player.currentRealm,
    player.canCot,
    player.tongMon ? 0.1 : 0 // 10% bonus nếu có tông môn
  );
  
  const totalTuViGain = tuViPerMinute * duration;
  
  // Tính linh thạch gain
  const linhThachGain = calculateCultivationReward(
    player.currentRealm,
    duration,
    player.khiVan
  );
  
  // Check random events
  const randomEvents: RandomEvent[] = [];
  const eventChance = calculateEventChance(player.khiVan);
  
  // Có thể có 0-2 events trong một cultivation session
  const numEventChecks = Math.floor(duration / 30); // Check every 30 minutes
  for (let i = 0; i < numEventChecks; i++) {
    if (Math.random() * 100 < eventChance) {
      // TODO: Load và filter events phù hợp
      // randomEvents.push(getRandomEvent(player.currentRealm));
    }
  }
  
  return {
    duration,
    tuViGain: totalTuViGain,
    randomEvents
  };
}

// ============================================
// ĐỘT PHÁ (BREAKTHROUGH)
// ============================================

export interface BreakthroughResult {
  success: boolean;
  tamMaEncountered: boolean;
  tamMaPassed?: boolean;
  thienKiepEncountered: boolean;
  thienKiepPassed?: boolean;
  newRealm?: number;
  rewards?: {
    tuVi: number;
    linhThach: number;
    danhVong: number;
  };
  penalties?: {
    tuVi: number;
    linhThach?: number;
    tamCanh?: number;
  };
  message: string;
  flavorText: string;
}

export function attemptBreakthrough(
  player: PlayerStats,
  nextRealm: Realm,
  itemBonus: number = 0
): BreakthroughResult {
  const currentRealm = player.currentRealm;
  
  // Check requirements
  if (player.tuVi < nextRealm.requirements.tuVi) {
    return {
      success: false,
      tamMaEncountered: false,
      thienKiepEncountered: false,
      message: 'Tu vi chưa đủ để đột phá!',
      flavorText: 'Cơ sở chưa vững, cưỡng ép đột phá chỉ có hại mà thôi.'
    };
  }
  
  if (player.linhThach < nextRealm.requirements.linhThach) {
    return {
      success: false,
      tamMaEncountered: false,
      thienKiepEncountered: false,
      message: 'Linh thạch không đủ!',
      flavorText: 'Đột phá cần nhiều linh dược hỗ trợ. Cần kiếm thêm linh thạch.'
    };
  }
  
  // Consume linh thạch
  const linhThachCost = nextRealm.requirements.linhThach;
  
  // Check Tâm Ma
  let tamMaEncountered = false;
  let tamMaPassed = false;
  
  if (currentRealm >= GAME_CONSTANTS.TAM_MA_APPEAR_FROM) {
    const tamMaChance = calculateTamMaChance(currentRealm, player.tamCanh);
    if (Math.random() * 100 < tamMaChance) {
      tamMaEncountered = true;
      // Tâm ma check
      const tamMaResistChance = 50 + (player.tamCanh - 50) * 0.5; // 25% - 75%
      tamMaPassed = Math.random() * 100 < tamMaResistChance;
      
      if (!tamMaPassed) {
        return {
          success: false,
          tamMaEncountered: true,
          tamMaPassed: false,
          thienKiepEncountered: false,
          penalties: {
            tuVi: Math.floor(player.tuVi * 0.15), // Mất 15% tu vi
            tamCanh: 10
          },
          message: 'Đột phá thất bại! Bị tâm ma xâm nhập!',
          flavorText: '\"Ngươi không xứng đáng...\" Giọng nói ma mị vang lên. Tâm trí ngươi rối loạn, tu vi tổn thất nghiêm trọng.'
        };
      }
    }
  }
  
  // Check Thiên Kiếp
  let thienKiepEncountered = false;
  let thienKiepPassed = false;
  
  if (nextRealm.requirements.thienKiep) {
    thienKiepEncountered = true;
    const kiepDifficulty = calculateThienKiepDifficulty(currentRealm);
    
    // Tính khả năng vượt kiếp dựa vào tu vi và tâm cảnh
    const kiepPassChance = 
      kiepDifficulty.survivability * 
      (0.8 + player.tamCanh / 500) * // Tâm cảnh ảnh hưởng 80%-100%
      (0.9 + player.khiVan / 1000); // Khí vận ảnh hưởng nhỏ
    
    thienKiepPassed = Math.random() * 100 < kiepPassChance;
    
    if (!thienKiepPassed) {
      return {
        success: false,
        tamMaEncountered,
        tamMaPassed,
        thienKiepEncountered: true,
        thienKiepPassed: false,
        penalties: {
          tuVi: Math.floor(player.tuVi * 0.2), // Mất 20% tu vi
          linhThach: Math.floor(linhThachCost * 0.5) // Mất một nửa linh thạch đã dùng
        },
        message: 'Thiên kiếp quá mạnh! Đột phá thất bại!',
        flavorText: `Trời đổ xuống ${kiepDifficulty.waves} đợt thiên lôi! Ngươi không thể chống đỡ, thân thể bị thiên lôi đánh nứt nẻ...`
      };
    }
  }
  
  // Calculate breakthrough success chance
  const successChance = calculateBreakthroughChance(
    currentRealm,
    player.ngoTinh,
    player.khiVan,
    itemBonus
  );
  
  const breakthroughSuccess = Math.random() * 100 < successChance;
  
  if (breakthroughSuccess) {
    const rewards = calculateBreakthroughRewards(currentRealm + 1);
    
    return {
      success: true,
      tamMaEncountered,
      tamMaPassed: tamMaEncountered ? tamMaPassed : undefined,
      thienKiepEncountered,
      thienKiepPassed: thienKiepEncountered ? thienKiepPassed : undefined,
      newRealm: currentRealm + 1,
      rewards,
      message: 'Đột phá thành công!',
      flavorText: nextRealm.successText
    };
  } else {
    return {
      success: false,
      tamMaEncountered,
      tamMaPassed: tamMaEncountered ? tamMaPassed : undefined,
      thienKiepEncountered,
      thienKiepPassed: thienKiepEncountered ? thienKiepPassed : undefined,
      penalties: {
        tuVi: Math.floor(player.tuVi * GAME_CONSTANTS.FAILED_BREAKTHROUGH_PENALTY),
        linhThach: linhThachCost
      },
      message: 'Đột phá thất bại!',
      flavorText: 'Cơ sở chưa vững, ngươi bị phản phệ. Tu vi tổn thất.'
    };
  }
}

// ============================================
// RANDOM EVENT HANDLING
// ============================================

export function triggerRandomEvent(
  event: RandomEvent,
  player: PlayerStats
): RandomEvent {
  // Filter choices based on player requirements
  const availableChoices = event.choices.filter(choice => {
    if (!choice.requirements) return true;
    
    if (choice.requirements.ngoTinh && player.ngoTinh < choice.requirements.ngoTinh) return false;
    if (choice.requirements.tamCanh && player.tamCanh < choice.requirements.tamCanh) return false;
    if (choice.requirements.khiVan && player.khiVan < choice.requirements.khiVan) return false;
    if (choice.requirements.linhThach && player.linhThach < choice.requirements.linhThach) return false;
    
    return true;
  });
  
  return {
    ...event,
    choices: availableChoices
  };
}

export function resolveEventChoice(
  choice: any,
  player: PlayerStats
): EventOutcome {
  // Calculate which outcome occurs based on probabilities and khiVan
  const khiVanModifier = (player.khiVan - 50) / 100; // -0.5 to +0.5
  
  let roll = Math.random() * 100;
  
  // Khí vận ảnh hưởng roll
  // Khí vận cao -> roll tăng -> dễ trúng outcome tốt hơn
  roll = roll + (khiVanModifier * 20); // +/- 10%
  roll = Math.max(0, Math.min(100, roll));
  
  let cumulative = 0;
  for (const outcome of choice.outcomes) {
    cumulative += outcome.probability;
    if (roll <= cumulative) {
      return outcome;
    }
  }
  
  // Fallback to last outcome
  return choice.outcomes[choice.outcomes.length - 1];
}

// ============================================
// BOSS BATTLE
// ============================================

export interface BattleResult {
  victory: boolean;
  rewards?: {
    tuVi: number;
    linhThach: number;
    danhVong: number;
    specialItems?: string[];
  };
  penalties?: {
    tuVi: number;
    linhThach: number;
    khiVan?: number;
  };
  message: string;
  flavorText: string;
}

export function battleBoss(
  player: PlayerStats,
  boss: Boss
): BattleResult {
  // Simple battle calculation
  // Player power = tuVi + (canCot * 100) + (ngoTinh * 50) + luck
  const playerPower = 
    player.tuVi / 1000 +
    player.canCot * 100 +
    player.ngoTinh * 50 +
    (Math.random() * player.khiVan * 10);
  
  const bossPower = boss.stats.power + (Math.random() * boss.stats.speed);
  
  const powerRatio = playerPower / bossPower;
  
  // Victory chance based on power ratio
  let victoryChance = 50;
  if (powerRatio > 1.5) victoryChance = 90;
  else if (powerRatio > 1.2) victoryChance = 75;
  else if (powerRatio > 1.0) victoryChance = 60;
  else if (powerRatio > 0.8) victoryChance = 40;
  else if (powerRatio > 0.6) victoryChance = 25;
  else victoryChance = 10;
  
  const victory = Math.random() * 100 < victoryChance;
  
  if (victory) {
    return {
      victory: true,
      rewards: boss.rewards,
      message: 'Chiến thắng!',
      flavorText: boss.defeatText
    };
  } else {
    return {
      victory: false,
      penalties: {
        tuVi: Math.floor(player.tuVi * 0.15),
        linhThach: Math.floor(player.linhThach * 0.1),
        khiVan: 5
      },
      message: 'Thất bại!',
      flavorText: boss.loseText
    };
  }
}

// ============================================
// PLAYER STATE UPDATE
// ============================================

export function updatePlayerStats(
  player: PlayerStats,
  changes: Partial<PlayerStats>
): PlayerStats {
  const updated = { ...player };
  
  // Apply changes
  Object.keys(changes).forEach(key => {
    const k = key as keyof PlayerStats;
    if (changes[k] !== undefined) {
      if (typeof updated[k] === 'number' && typeof changes[k] === 'number') {
        (updated[k] as number) = (updated[k] as number) + (changes[k] as number);
        
        // Clamp stats
        if (k === 'canCot' || k === 'ngoTinh' || k === 'khiVan' || k === 'tamCanh') {
          (updated[k] as number) = Math.max(
            GAME_CONSTANTS.MIN_STAT,
            Math.min(GAME_CONSTANTS.MAX_STAT, updated[k] as number)
          );
        }
        
        // Prevent negative values
        if (k === 'tuVi' || k === 'linhThach' || k === 'danhVong') {
          (updated[k] as number) = Math.max(0, updated[k] as number);
        }
      }
    }
  });
  
  return updated;
}

// ============================================
// SAVE/LOAD HELPERS
// ============================================

export function createNewPlayer(): PlayerStats {
  return {
    tuVi: 0,
    canCot: GAME_CONSTANTS.STARTING_CAN_COT,
    ngoTinh: GAME_CONSTANTS.STARTING_NGO_TINH,
    khiVan: GAME_CONSTANTS.STARTING_KHI_VAN,
    tamCanh: GAME_CONSTANTS.STARTING_TAM_CANH,
    linhThach: GAME_CONSTANTS.STARTING_LINH_THACH,
    danhVong: 0,
    currentRealm: 0
  };
}

export function canBreakthrough(
  player: PlayerStats,
  nextRealm: Realm
): { canBreak: boolean; reason?: string } {
  if (player.tuVi < nextRealm.requirements.tuVi) {
    return {
      canBreak: false,
      reason: `Cần ${nextRealm.requirements.tuVi.toLocaleString()} tu vi (hiện tại: ${player.tuVi.toLocaleString()})`
    };
  }
  
  if (player.linhThach < nextRealm.requirements.linhThach) {
    return {
      canBreak: false,
      reason: `Cần ${nextRealm.requirements.linhThach.toLocaleString()} linh thạch (hiện tại: ${player.linhThach.toLocaleString()})`
    };
  }
  
  return { canBreak: true };
}
