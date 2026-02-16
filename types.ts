// ============================================
// TU TIÊN GAME - TYPE DEFINITIONS
// ============================================

export interface PlayerStats {
  tuVi: number;              // Tu vi (EXP)
  canCot: number;            // Căn cốt (1-100) - ảnh hưởng tốc độ tu luyện
  ngoTinh: number;           // Ngộ tính (1-100) - ảnh hưởng tỉ lệ đột phá
  khiVan: number;            // Khí vận (1-100) - ảnh hưởng sự kiện random
  tamCanh: number;           // Tâm cảnh (1-100) - ảnh hưởng vượt tâm ma
  linhThach: number;         // Linh thạch (tiền tệ)
  danhVong: number;          // Danh vọng
  currentRealm: number;      // Index của cảnh giới hiện tại (0-99)
  tongMon?: string;          // Tên tông môn (nếu có)
}

export interface Realm {
  id: number;                // 0-99
  name: string;              // Tên cảnh giới
  emoji: string;             // Icon
  description: string;       // Mô tả khí chất (2-3 câu)
  
  // Yêu cầu đột phá
  requirements: {
    tuVi: number;           // Tu vi cần thiết
    linhThach: number;      // Linh thạch cần thiết
    coduyen?: string;       // Cơ duyên đặc biệt (nếu có)
    bossRequired?: string;  // Boss cần đánh bại
    thienKiep?: boolean;    // Có thiên kiếp không
  };
  
  // Thông số đột phá
  breakthrough: {
    baseSuccessRate: number;      // Tỉ lệ thành công cơ bản (%)
    tamMaChance: number;          // Tỉ lệ gặp tâm ma (%)
    failureRisks: string[];       // Rủi ro khi thất bại
    rewardOnSuccess: {
      tuVi: number;
      linhThach: number;
      danhVong: number;
    };
  };
  
  // Sự kiện có thể xảy ra
  possibleEvents: string[];       // Array of event IDs
  
  // Flavor text
  successText: string;            // Text khi đột phá thành công
  
  // Phân loại
  stage: string;                  // "Phàm Nhân", "Luyện Khí", "Trúc Cơ"...
  tier: string;                   // "Sơ Kỳ", "Trung Kỳ", "Hậu Kỳ", "Đỉnh Phong", "Đại Viên Mãn"
}

export interface RandomEvent {
  id: string;
  name: string;
  description: string;
  availableFrom: number;          // Từ realm nào (index)
  availableTo: number;            // Đến realm nào
  triggerChance: number;          // Tỉ lệ xuất hiện (%)
  khiVanModifier: number;         // Khí vận ảnh hưởng thế nào
  
  choices: EventChoice[];
}

export interface EventChoice {
  id: string;
  text: string;
  requirements?: {
    ngoTinh?: number;
    tamCanh?: number;
    khiVan?: number;
    linhThach?: number;
  };
  
  outcomes: EventOutcome[];       // Các kết quả có thể (dựa vào luck)
}

export interface EventOutcome {
  probability: number;            // Xác suất (%)
  description: string;
  effects: {
    tuVi?: number;
    canCot?: number;
    ngoTinh?: number;
    khiVan?: number;
    tamCanh?: number;
    linhThach?: number;
    danhVong?: number;
    specialReward?: string;
  };
  flavor: string;
}

export interface Boss {
  id: string;
  name: string;
  description: string;
  realm: number;                  // Xuất hiện ở realm nào
  difficulty: "easy" | "medium" | "hard" | "legendary";
  
  stats: {
    power: number;
    defense: number;
    speed: number;
  };
  
  rewards: {
    tuVi: number;
    linhThach: number;
    danhVong: number;
    specialItems?: string[];
  };
  
  defeatText: string;
  loseText: string;
}

export interface TamMa {
  id: string;
  name: string;
  description: string;
  minRealm: number;               // Xuất hiện từ realm nào
  difficulty: number;             // 1-10
  
  challenge: {
    text: string;
    tamCanhRequired: number;
    choices: TamMaChoice[];
  };
}

export interface TamMaChoice {
  text: string;
  successChance: number;          // Base %
  tamCanhModifier: number;        // Tâm cảnh ảnh hưởng
  
  onSuccess: {
    description: string;
    tamCanhGain: number;
    bonusReward?: string;
  };
  
  onFailure: {
    description: string;
    tuViLoss: number;
    tamCanhLoss: number;
    realmDrop?: boolean;          // Có bị tụt cảnh giới không
  };
}

export interface ThienKiep {
  name: string;
  realm: number;
  waves: number;                  // Số đợt thiên lôi
  description: string;
  
  difficulty: {
    baseDamage: number;
    damageMultiplier: number;
    survivability: number;        // % cần để sống sót
  };
  
  rewards: {
    tuVi: number;
    tamCanh: number;
    specialBonus?: string;
  };
}

export interface GameAction {
  type: "cultivate" | "breakthrough" | "event" | "battle" | "shop";
  data: any;
}

export interface CultivationSession {
  duration: number;               // Thời gian tu luyện (phút)
  tuViGain: number;              // Tu vi nhận được
  randomEvents: RandomEvent[];    // Sự kiện xảy ra
}
