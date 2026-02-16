// ============================================
// TU TIÊN GAME - GAME CONSTANTS & FORMULAS
// ============================================

// ============================================
// CÔNG THỨC TÍNH TU VI CẦN CHO MỖI CẢNH GIỚI
// ============================================
// Sử dụng hàm mũ với scaling factor khác nhau cho từng đại cảnh giới

export const REALM_STAGES = {
  PHAM_NHAN: { start: 0, end: 0, baseExp: 0, multiplier: 1 },
  LUYEN_KHI: { start: 1, end: 6, baseExp: 100, multiplier: 1.5 },
  TRUC_CO: { start: 7, end: 11, baseExp: 1000, multiplier: 1.8 },
  KIM_DAN: { start: 12, end: 16, baseExp: 10000, multiplier: 2.0 },
  NGUYEN_ANH: { start: 17, end: 21, baseExp: 50000, multiplier: 2.2 },
  HOA_THAN: { start: 22, end: 26, baseExp: 200000, multiplier: 2.3 },
  LUYEN_HU: { start: 27, end: 31, baseExp: 800000, multiplier: 2.4 },
  HOP_THE: { start: 32, end: 36, baseExp: 3000000, multiplier: 2.5 },
  DAI_TUA: { start: 37, end: 41, baseExp: 10000000, multiplier: 2.6 },
  DO_KIEP: { start: 42, end: 46, baseExp: 35000000, multiplier: 2.7 },
  PHI_THANG: { start: 47, end: 51, baseExp: 100000000, multiplier: 2.8 },
  CHAN_TIEN: { start: 52, end: 56, baseExp: 300000000, multiplier: 3.0 },
  HUYEN_TIEN: { start: 57, end: 61, baseExp: 1000000000, multiplier: 3.2 },
  DIA_TIEN: { start: 62, end: 66, baseExp: 5000000000, multiplier: 3.4 },
  THIEN_TIEN: { start: 67, end: 71, baseExp: 20000000000, multiplier: 3.6 },
  KIM_TIEN: { start: 72, end: 76, baseExp: 100000000000, multiplier: 3.8 },
  THAI_AT_KIM_TIEN: { start: 77, end: 81, baseExp: 500000000000, multiplier: 4.0 },
  CHUAN_DE: { start: 82, end: 86, baseExp: 2000000000000, multiplier: 4.2 },
  DAI_DE: { start: 87, end: 91, baseExp: 10000000000000, multiplier: 4.4 },
  TIEN_DE: { start: 92, end: 96, baseExp: 50000000000000, multiplier: 4.6 },
  DE_TO: { start: 97, end: 100, baseExp: 250000000000000, multiplier: 5.0 },
};

/**
 * Tính tu vi cần thiết cho một cảnh giới
 * Formula: baseExp * (multiplier ^ (realm - stageStart))
 */
export function calculateRequiredTuVi(realmIndex: number): number {
  if (realmIndex === 0) return 0; // Phàm Nhân không cần tu vi
  
  // Tìm stage tương ứng
  for (const stage of Object.values(REALM_STAGES)) {
    if (realmIndex >= stage.start && realmIndex <= stage.end) {
      const indexInStage = realmIndex - stage.start;
      return Math.floor(stage.baseExp * Math.pow(stage.multiplier, indexInStage));
    }
  }
  
  return 0;
}

// ============================================
// CÔNG THỨC TÍNH TỈ LỆ ĐỘT PHÁ
// ============================================

/**
 * Base success rate giảm dần theo realm
 * Mortal realms: 90%
 * Cultivator realms (1-41): 85% -> 60%
 * Immortal realms (42-76): 60% -> 40%
 * Emperor realms (77-99): 40% -> 20%
 */
export function calculateBaseSuccessRate(realmIndex: number): number {
  if (realmIndex === 0) return 100; // Phàm Nhân -> Luyện Khí luôn thành công
  if (realmIndex <= 6) return 90;   // Luyện Khí
  if (realmIndex <= 11) return 85;  // Trúc Cơ
  if (realmIndex <= 16) return 80;  // Kim Đan
  if (realmIndex <= 21) return 75;  // Nguyên Anh
  if (realmIndex <= 26) return 70;  // Hóa Thần
  if (realmIndex <= 31) return 65;  // Luyện Hư
  if (realmIndex <= 36) return 60;  // Hợp Thể
  if (realmIndex <= 41) return 55;  // Đại Thừa
  if (realmIndex <= 46) return 50;  // Độ Kiếp
  if (realmIndex <= 51) return 48;  // Phi Thăng
  if (realmIndex <= 56) return 45;  // Chân Tiên
  if (realmIndex <= 61) return 42;  // Huyền Tiên
  if (realmIndex <= 66) return 40;  // Địa Tiên
  if (realmIndex <= 71) return 38;  // Thiên Tiên
  if (realmIndex <= 76) return 35;  // Kim Tiên
  if (realmIndex <= 81) return 32;  // Thái Ất Kim Tiên
  if (realmIndex <= 86) return 28;  // Chuẩn Đế
  if (realmIndex <= 91) return 25;  // Đại Đế
  if (realmIndex <= 96) return 22;  // Tiên Đế
  return 20;                        // Đế Tổ
}

/**
 * Tính tỉ lệ đột phá thực tế
 * = Base rate + (Ngộ tính modifier) + (Khí vận modifier) + (Item bonus)
 */
export function calculateBreakthroughChance(
  realmIndex: number,
  ngoTinh: number,
  khiVan: number,
  itemBonus: number = 0
): number {
  const baseRate = calculateBaseSuccessRate(realmIndex);
  const ngoTinhBonus = (ngoTinh - 50) * 0.2; // -10% to +10%
  const khiVanBonus = (khiVan - 50) * 0.15;  // -7.5% to +7.5%
  
  const finalRate = baseRate + ngoTinhBonus + khiVanBonus + itemBonus;
  
  return Math.max(5, Math.min(95, finalRate)); // Clamp giữa 5% và 95%
}

/**
 * Tính tỉ lệ gặp Tâm Ma
 * Xuất hiện từ Kim Đan (realm 12+)
 */
export function calculateTamMaChance(realmIndex: number, tamCanh: number): number {
  if (realmIndex < 12) return 0; // Chưa đủ realm
  
  const baseChance = Math.min(30, (realmIndex - 11) * 1.5); // 1.5% -> 30%
  const tamCanhReduction = (tamCanh - 50) * 0.2; // Tâm cảnh cao giảm tỉ lệ
  
  return Math.max(0, baseChance - tamCanhReduction);
}

/**
 * Tính damage của Thiên Kiếp
 * Xuất hiện từ Độ Kiếp (realm 42+)
 */
export function calculateThienKiepDifficulty(realmIndex: number): {
  waves: number;
  baseDamage: number;
  survivability: number;
} {
  if (realmIndex < 42) {
    return { waves: 0, baseDamage: 0, survivability: 100 };
  }
  
  const waveCount = Math.floor((realmIndex - 42) / 5) + 3; // 3-14 waves
  const baseDamage = 1000 * Math.pow(1.8, realmIndex - 42);
  const survivability = Math.max(20, 80 - (realmIndex - 42)); // 80% -> 20%
  
  return { waves: waveCount, baseDamage, survivability };
}

// ============================================
// HỆ THỐNG LINH THẠCH
// ============================================

/**
 * Tính linh thạch cần cho đột phá
 */
export function calculateBreakthroughCost(realmIndex: number): number {
  if (realmIndex === 0) return 0;
  return Math.floor(100 * Math.pow(2.5, realmIndex / 5));
}

/**
 * Tính linh thạch nhận được sau tu luyện
 */
export function calculateCultivationReward(
  realmIndex: number,
  duration: number, // minutes
  khiVan: number
): number {
  const baseReward = Math.floor(10 * Math.pow(1.5, realmIndex / 10) * duration);
  const khiVanMultiplier = 0.5 + (khiVan / 100); // 0.5x - 1.5x
  
  return Math.floor(baseReward * khiVanMultiplier);
}

// ============================================
// TỐC ĐỘ TU LUYỆN
// ============================================

/**
 * Tính tu vi gain per minute
 */
export function calculateCultivationSpeed(
  realmIndex: number,
  canCot: number,
  tongMonBonus: number = 0
): number {
  const baseSpeed = 10 * Math.pow(1.3, realmIndex / 5);
  const canCotMultiplier = 0.5 + (canCot / 50); // 0.5x - 2.5x
  
  return Math.floor(baseSpeed * canCotMultiplier * (1 + tongMonBonus));
}

// ============================================
// RANDOM EVENT CHANCES
// ============================================

/**
 * Tính tỉ lệ random event xảy ra
 */
export function calculateEventChance(khiVan: number): number {
  return 10 + (khiVan / 5); // 10% - 30% based on luck
}

// ============================================
// PHẦN THƯỞNG ĐỘT PHÁ THÀNH CÔNG
// ============================================

export function calculateBreakthroughRewards(realmIndex: number): {
  tuVi: number;
  linhThach: number;
  danhVong: number;
} {
  return {
    tuVi: Math.floor(calculateRequiredTuVi(realmIndex) * 0.1), // 10% của yêu cầu
    linhThach: Math.floor(calculateBreakthroughCost(realmIndex) * 2), // x2 cost
    danhVong: Math.floor(100 * Math.pow(1.5, realmIndex / 10))
  };
}

// ============================================
// TIER NAMES
// ============================================

export const TIER_NAMES = {
  0: "Sơ Kỳ",
  1: "Trung Kỳ",
  2: "Hậu Kỳ",
  3: "Đỉnh Phong",
  4: "Đại Viên Mãn"
};

// ============================================
// CONSTANTS
// ============================================

export const GAME_CONSTANTS = {
  MIN_STAT: 1,
  MAX_STAT: 100,
  STARTING_LINH_THACH: 1000,
  STARTING_CAN_COT: 50,
  STARTING_NGO_TINH: 50,
  STARTING_KHI_VAN: 50,
  STARTING_TAM_CANH: 50,
  
  // Tu luyện
  MIN_CULTIVATION_TIME: 1,      // minutes
  MAX_CULTIVATION_TIME: 1440,   // 24 hours
  
  // Đột phá
  BREAKTHROUGH_COOLDOWN: 60,     // minutes
  FAILED_BREAKTHROUGH_PENALTY: 0.1, // Mất 10% tu vi hiện tại
  
  // Tâm ma
  TAM_MA_APPEAR_FROM: 12,       // Kim Đan
  TAM_MA_PENALTY_REALM_DROP: true,
  
  // Thiên kiếp
  THIEN_KIEP_START_FROM: 42,    // Độ Kiếp
};
