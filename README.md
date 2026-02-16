# 🎮 TU TIÊN GAME - Text-Based RPG

Game tu tiên (cultivation) text-based RPG chạy trên Next.js, triển khai trên Vercel.

## 📋 Tổng Quan

Game thiên về trải nghiệm cuộc đời tu tiên với hệ thống:
- **100 cảnh giới** từ Phàm Nhân đến Đế Tổ
- **Lựa chọn - Nhân quả - Cơ duyên** thông qua hệ thống sự kiện
- **Đột phá cảnh giới** với tỉ lệ thành công
- **Tâm ma & Thiên kiếp** từ cảnh giới cao
- **Boss battles** và random events
- Không auto-farm, người chơi phải ra quyết định

## 📊 Hệ Thống Chỉ Số

### Chỉ số nhân vật:
- **Tu vi** (EXP): Kinh nghiệm tu luyện, cần để đột phá
- **Căn cốt** (1-100): Ảnh hưởng tốc độ tu luyện
- **Ngộ tính** (1-100): Ảnh hưởng tỉ lệ đột phá thành công
- **Khí vận** (1-100): Ảnh hưởng sự kiện ngẫu nhiên
- **Tâm cảnh** (1-100): Ảnh hưởng khả năng vượt tâm ma
- **Linh thạch**: Tiền tệ trong game
- **Danh vọng**: Ảnh hưởng PvP (tương lai)

## 🎯 Core Gameplay

### 1. Tu Luyện (Cultivation)
```typescript
POST /api/cultivate
Body: {
  player: PlayerStats,
  duration: number // minutes (1-1440)
}

Returns: {
  tuViGain: number,
  randomEvents: RandomEvent[],
  updatedPlayer: PlayerStats
}
```

**Công thức tu vi gain:**
```
tuViPerMinute = baseSpeed * canCotMultiplier * tongMonBonus
baseSpeed = 10 * (1.3 ^ (realm / 5))
canCotMultiplier = 0.5 + (canCot / 50) // 0.5x - 2.5x
```

### 2. Đột Phá (Breakthrough)
```typescript
POST /api/breakthrough
Body: {
  player: PlayerStats,
  itemBonus?: number // Bonus từ đan dược
}

Returns: {
  success: boolean,
  tamMaEncountered: boolean,
  thienKiepEncountered: boolean,
  newRealm?: number,
  rewards?: {...},
  penalties?: {...}
}
```

**Yêu cầu đột phá:**
1. Tu vi đủ: `requiredTuVi = baseExp * (multiplier ^ indexInStage)`
2. Linh thạch đủ: `cost = 100 * (2.5 ^ (realm / 5))`
3. Vượt qua tâm ma (nếu có)
4. Vượt qua thiên kiếp (nếu có)

**Tỉ lệ thành công:**
```
finalRate = baseRate + ngoTinhBonus + khiVanBonus + itemBonus
baseRate: 100% -> 20% (giảm theo realm)
ngoTinhBonus: (ngoTinh - 50) * 0.2 // -10% to +10%
khiVanBonus: (khiVan - 50) * 0.15 // -7.5% to +7.5%
```

### 3. Tâm Ma (Inner Demon)
- Xuất hiện từ **Kim Đan** (realm 12+)
- Tỉ lệ xuất hiện tăng theo realm: `min(30%, (realm - 11) * 1.5%)`
- Tâm cảnh cao giảm tỉ lệ gặp tâm ma
- Thất bại → mất 15% tu vi + giảm tâm cảnh

### 4. Thiên Kiếp (Heavenly Tribulation)
- Xuất hiện từ **Độ Kiếp** (realm 42+)
- Số đợt thiên lôi: `floor((realm - 42) / 5) + 3` (3-14 đợt)
- Damage tăng theo cấp mũ
- Cần tâm cảnh và khí vận cao để vượt qua

### 5. Random Events
```typescript
GET /api/event?player={playerData}
// Returns random event phù hợp với realm

POST /api/event
Body: {
  player: PlayerStats,
  eventId: string,
  choiceId: string
}
// Resolve event choice
```

**20 sự kiện mẫu bao gồm:**
- Nhặt được cổ ngọc
- Gặp lão giả bí ẩn
- Bị truy sát
- Tâm ma khởi
- Bí cảnh mở ra
- Gặp đồng môn
- Cướp cơ duyên
- Và nhiều hơn...

### 6. Boss Battles
```typescript
GET /api/battle?player={playerData}
// Returns available bosses

POST /api/battle
Body: {
  player: PlayerStats,
  bossId: string
}
```

**5 boss mẫu:**
1. **Tà Tu Hắc Y Lão Quỷ** (Realm 15) - Hard
2. **Ngũ Sắc Kỳ Lân** (Realm 52) - Legendary
3. **Yêu Đế Huyết Nguyệt** (Realm 87) - Legendary
4. **Cổ Tiên Oan Hồn** (Realm 55) - Hard
5. **Ma Hoàng Vô Cực** (Realm 95) - Legendary

## 📁 Cấu Trúc File

```
tu-tien-game/
├── types.ts                    # TypeScript type definitions
├── game-constants.ts           # Công thức & constants
├── game-logic.ts              # Game logic handlers
├── realms-data.json           # 100 cảnh giới đầy đủ
├── events-data.json           # 20 sự kiện ngẫu nhiên
├── bosses-data.json           # 5 boss mẫu
└── api-routes/
    ├── cultivate.ts           # API tu luyện
    ├── breakthrough.ts        # API đột phá
    ├── event.ts              # API sự kiện
    └── battle.ts             # API chiến đấu
```

## 🚀 Cài Đặt & Sử Dụng

### 1. Copy files vào Next.js project:
```bash
# Copy vào Next.js 14+ App Router structure
app/
  api/
    cultivate/route.ts
    breakthrough/route.ts
    event/route.ts
    battle/route.ts
lib/
  game-logic.ts
  game-constants.ts
  types.ts
data/
  realms-data.json
  events-data.json
  bosses-data.json
```

### 2. Install dependencies:
```bash
npm install
```

### 3. Chạy dev server:
```bash
npm run dev
```

## 🎨 Frontend Integration

### Example: Tu luyện component
```typescript
'use client';

import { useState } from 'react';
import { PlayerStats } from '@/lib/types';

export function CultivationPanel({ player }: { player: PlayerStats }) {
  const [duration, setDuration] = useState(60);
  const [loading, setLoading] = useState(false);

  async function handleCultivate() {
    setLoading(true);
    
    const response = await fetch('/api/cultivate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ player, duration })
    });
    
    const data = await response.json();
    // Update player state
    
    setLoading(false);
  }

  return (
    <div className="cultivation-panel">
      <h2>Tu Luyện</h2>
      <input 
        type="range" 
        min="1" 
        max="1440" 
        value={duration}
        onChange={(e) => setDuration(Number(e.target.value))}
      />
      <p>{duration} phút</p>
      <button onClick={handleCultivate} disabled={loading}>
        Bắt đầu tu luyện
      </button>
    </div>
  );
}
```

## 📈 Progression System

### Realm Progression (100 cảnh giới):
```
0: Phàm Nhân (Mortal)
1-6: Luyện Khí (Qi Refining)
7-11: Trúc Cơ (Foundation Establishment)
12-16: Kim Đan (Golden Core)
17-21: Nguyên Anh (Nascent Soul)
22-26: Hóa Thần (Soul Formation)
27-31: Luyện Hư (Void Refinement)
32-36: Hợp Thể (Body Integration)
37-41: Đại Thừa (Mahayana)
42-46: Độ Kiếp (Tribulation Passing)
47-51: Phi Thăng (Ascension)
52-56: Chân Tiên (True Immortal)
57-61: Huyền Tiên (Profound Immortal)
62-66: Địa Tiên (Earth Immortal)
67-71: Thiên Tiên (Heaven Immortal)
72-76: Kim Tiên (Golden Immortal)
77-81: Thái Ất Kim Tiên (Taiyi Golden Immortal)
82-86: Chuẩn Đế (Quasi-Emperor)
87-91: Đại Đế (Great Emperor)
92-96: Tiên Đế (Immortal Emperor)
97-100: Đế Tổ (Ancestor Emperor)
```

### Mỗi giai đoạn có 5 tier:
1. Sơ Kỳ (Early Stage)
2. Trung Kỳ (Middle Stage)
3. Hậu Kỳ (Late Stage)
4. Đỉnh Phong (Peak)
5. Đại Viên Mãn (Great Perfection)

## 🎲 Hệ Thống RNG

### Khí vận ảnh hưởng:
- **Event trigger rate**: 10% + (khiVan / 5) → 10%-30%
- **Event outcome**: Roll + (khiVan modifier * 20)
- **Boss battle**: Minor luck factor
- **Breakthrough**: ±7.5% success rate

### Ngộ tính ảnh hưởng:
- **Breakthrough success**: ±10% rate
- **Event choices**: Unlock special options
- **Tâm ma resistance**: Combined with tamCanh

### Tâm cảnh ảnh hưởng:
- **Tâm ma resistance**: Major factor
- **Thiên kiếp survival**: 80%-100% multiplier
- **Event choices**: Unlock wisdom options

## 🔮 Mở Rộng Tương Lai

### PvP System (Planned)
```typescript
// /api/pvp endpoint structure
POST /api/pvp/challenge
POST /api/pvp/accept
GET /api/pvp/rankings

// Danh vọng sẽ ảnh hưởng matchmaking
// Có thể cướp tài nguyên từ người chơi khác
```

### Tông Môn System (Planned)
- Gia nhập hoặc tự lập tông môn
- Nhiệm vụ tông môn
- Cống hiến điểm
- Đổi tâm pháp, bảo vật

### Thêm Features:
- Chế tạo đan dược
- Pet/linh thú system
- Marriage/dual cultivation
- Realm wars
- Cổ tiên di tích dungeon

## 📝 Phong Cách Viết

**90% nghiêm túc**, khí chất tiên hiệp:
- "Thiên địa linh khí dồn dập đổ vào, ngươi cảm thấy cơ thể thăng hoa."
- "Đan điền rung chuyển, linh khí tụ lại. Cơ sở đã trúc!"

**10% hài hước** nhẹ nhàng đúng lúc:
- "Ba mươi sáu kế, tẩu vi thượng kế!" (Khi chạy trốn)
- "Lưu đắc thanh sơn tại, chẳng sợ không có củi đốt..." (Mất đồ nhưng sống)
- Tâm ma: "Ngươi tưởng mình mạnh lắm sao?" *Cười ma quái*

## 🛠️ Technical Stack

- **Framework**: Next.js 14+ (App Router)
- **Language**: TypeScript
- **Deployment**: Vercel
- **Database**: (Suggest) Vercel Postgres / Supabase
- **State**: React Context / Zustand / Redux
- **UI**: Tailwind CSS / Radix UI

## 📖 License

MIT License - Tự do sử dụng và chỉnh sửa

---

**Tác giả**: Claude
**Version**: 1.0.0
**Ngày tạo**: 2025-02-16
