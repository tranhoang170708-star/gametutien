# 📦 TU TIÊN GAME - IMPLEMENTATION GUIDE

## 🎯 Bạn đã nhận được gì?

Một hệ thống game tu tiên hoàn chỉnh bao gồm:

### ✅ Core System Files
1. **types.ts** - Type definitions đầy đủ cho toàn bộ game
2. **game-constants.ts** - Công thức tính toán và hằng số
3. **game-logic.ts** - Logic xử lý game (cultivation, breakthrough, events, battles)

### ✅ Data Files  
4. **realms-data.json** - **100 cảnh giới đầy đủ** từ Phàm Nhân đến Đế Tổ
5. **events-data.json** - **20 sự kiện ngẫu nhiên** với multiple choices và outcomes
6. **bosses-data.json** - **5 boss mẫu** với difficulty khác nhau

### ✅ API Routes (Next.js 14+ App Router)
7. **api-routes/cultivate.ts** - POST endpoint cho tu luyện
8. **api-routes/breakthrough.ts** - POST/GET endpoints cho đột phá
9. **api-routes/event.ts** - GET/POST endpoints cho sự kiện
10. **api-routes/battle.ts** - GET/POST endpoints cho boss battles

### ✅ UI Component
11. **GameDashboard.tsx** - React component mẫu với UI đầy đủ

### ✅ Documentation
12. **README.md** - Documentation chi tiết
13. **package.json** - Dependencies mẫu
14. **IMPLEMENTATION_GUIDE.md** - File này

---

## 🚀 HƯỚNG DẪN TRIỂN KHAI NHANH

### Bước 1: Tạo Next.js Project

```bash
npx create-next-app@latest tu-tien-game --typescript --tailwind --app
cd tu-tien-game
```

### Bước 2: Copy Files vào đúng vị trí

```
tu-tien-game/
├── app/
│   ├── api/
│   │   ├── cultivate/
│   │   │   └── route.ts          ← Copy từ api-routes/cultivate.ts
│   │   ├── breakthrough/
│   │   │   └── route.ts          ← Copy từ api-routes/breakthrough.ts
│   │   ├── event/
│   │   │   └── route.ts          ← Copy từ api-routes/event.ts
│   │   └── battle/
│   │       └── route.ts          ← Copy từ api-routes/battle.ts
│   ├── page.tsx                   ← Tạo page với GameDashboard component
│   └── layout.tsx
├── components/
│   └── GameDashboard.tsx         ← Copy từ GameDashboard.tsx
├── lib/
│   ├── types.ts                  ← Copy từ types.ts
│   ├── game-constants.ts         ← Copy từ game-constants.ts
│   └── game-logic.ts             ← Copy từ game-logic.ts
├── data/
│   ├── realms-data.json          ← Copy từ realms-data.json
│   ├── events-data.json          ← Copy từ events-data.json
│   └── bosses-data.json          ← Copy từ bosses-data.json
└── package.json
```

### Bước 3: Update Import Paths

Trong các file API routes, update imports:
```typescript
// Thay đổi từ:
import { processCultivation } from '@/game-logic';

// Thành:
import { processCultivation } from '@/lib/game-logic';
```

### Bước 4: Tạo app/page.tsx

```typescript
import GameDashboard from '@/components/GameDashboard';

export default function Home() {
  return <GameDashboard />;
}
```

### Bước 5: Run Development Server

```bash
npm run dev
```

Truy cập http://localhost:3000 để xem game!

---

## 🗄️ DATABASE SETUP (Khuyên dùng)

Hiện tại game chưa có database persistence. Để lưu progress người chơi:

### Option 1: Vercel Postgres (Khuyên dùng)

```bash
npm install @vercel/postgres
```

```sql
CREATE TABLE players (
  id SERIAL PRIMARY KEY,
  user_id VARCHAR(255) UNIQUE NOT NULL,
  tu_vi BIGINT DEFAULT 0,
  can_cot INT DEFAULT 50,
  ngo_tinh INT DEFAULT 50,
  khi_van INT DEFAULT 50,
  tam_canh INT DEFAULT 50,
  linh_thach BIGINT DEFAULT 1000,
  danh_vong BIGINT DEFAULT 0,
  current_realm INT DEFAULT 0,
  tong_mon VARCHAR(255),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### Option 2: Supabase

```bash
npm install @supabase/supabase-js
```

Tương tự với schema trên.

### Option 3: localStorage (Simple, không secure)

Chỉ dùng cho demo hoặc single-player local.

---

## 🎨 CUSTOMIZATION

### Thêm Cảnh Giới Mới

Edit `data/realms-data.json` và thêm objects theo format:
```json
{
  "id": 101,
  "name": "Tên Cảnh Giới",
  "emoji": "🌟",
  "stage": "Stage Name",
  "tier": "Sơ Kỳ",
  "description": "Mô tả...",
  "requirements": {...},
  "breakthrough": {...},
  "possibleEvents": [...],
  "successText": "..."
}
```

### Thêm Sự Kiện Mới

Edit `data/events-data.json`:
```json
{
  "id": "event_id",
  "name": "Tên sự kiện",
  "description": "Mô tả...",
  "availableFrom": 10,
  "availableTo": 50,
  "triggerChance": 15,
  "khiVanModifier": 0.3,
  "choices": [...]
}
```

### Thêm Boss Mới

Edit `data/bosses-data.json`:
```json
{
  "id": "boss_id",
  "name": "Boss Name",
  "description": "...",
  "realm": 30,
  "difficulty": "hard",
  "stats": {...},
  "rewards": {...},
  "defeatText": "...",
  "loseText": "..."
}
```

### Chỉnh Công Thức

Edit `lib/game-constants.ts` để thay đổi:
- Tu vi requirements
- Breakthrough success rates
- Cultivation speed
- Linh thạch costs
- Và nhiều hơn...

---

## 🎮 FEATURES ĐÃ IMPLEMENT

### ✅ Hoàn thành:
- [x] 100 cảnh giới đầy đủ
- [x] Tu luyện system với công thức scaling
- [x] Đột phá system với tỉ lệ thành công
- [x] Tâm ma system (từ Kim Đan)
- [x] Thiên kiếp system (từ Độ Kiếp)
- [x] 20 sự kiện ngẫu nhiên với multiple outcomes
- [x] 5 boss battles
- [x] Stat system (căn cốt, ngộ tính, khí vận, tâm cảnh)
- [x] API routes đầy đủ
- [x] UI component mẫu
- [x] Comprehensive documentation

### 🚧 Cần Thêm:
- [ ] Database integration
- [ ] User authentication
- [ ] PvP system
- [ ] Tông môn system
- [ ] Đan dược crafting
- [ ] Pet/linh thú system
- [ ] Shop system
- [ ] Quest system
- [ ] Achievement system
- [ ] Leaderboards

---

## 📊 GAME BALANCE

Hiện tại game đã được balance cơ bản:

### Early Game (Realm 0-20):
- Success rates: 90-75%
- Tu vi requirements: Manageable
- Linh thạch costs: Low
- No tâm ma yet

### Mid Game (Realm 21-50):
- Success rates: 70-48%
- Tu vi requirements: Exponential growth
- Tâm ma appears
- Thiên kiếp starts at 42

### Late Game (Realm 51-80):
- Success rates: 45-35%
- Very high requirements
- Frequent tâm ma
- Dangerous thiên kiếp

### End Game (Realm 81-100):
- Success rates: 32-20%
- Astronomical requirements
- Almost guaranteed tâm ma
- Devastating thiên kiếp

**Tip**: Điều chỉnh các constants trong `game-constants.ts` nếu thấy quá khó/dễ.

---

## 🐛 DEBUGGING

### Common Issues:

1. **Import errors**
   - Check import paths match your folder structure
   - Use `@/` alias configured in `tsconfig.json`

2. **Type errors**
   - Ensure all imports from `@/lib/types` are correct
   - Check JSON data matches Type definitions

3. **API errors**
   - Check API route paths
   - Verify request body structure
   - Check response handling in frontend

4. **Game logic issues**
   - Console.log player stats
   - Verify calculation formulas
   - Check event probabilities

---

## 🚀 DEPLOYMENT

### Deploy to Vercel:

```bash
# Push to GitHub
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin YOUR_REPO_URL
git push -u origin main

# Deploy on Vercel
# 1. Import GitHub repository
# 2. Vercel auto-detects Next.js
# 3. Click Deploy
```

### Environment Variables (nếu dùng DB):

```env
DATABASE_URL=your_database_url
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_key
```

---

## 💡 NEXT STEPS

### Immediate:
1. Test tất cả API endpoints
2. Thêm error handling
3. Implement state management (Context/Zustand)
4. Thêm loading states và animations

### Short-term:
1. Thêm database integration
2. User authentication
3. Save/load game state
4. Thêm more events và bosses

### Long-term:
1. PvP system
2. Tông môn features
3. Multiplayer events
4. Mobile app version

---

## 📞 SUPPORT

Nếu gặp vấn đề:
1. Check README.md cho documentation chi tiết
2. Review code comments trong các files
3. Test từng API endpoint riêng lẻ
4. Check browser console cho errors

---

## 🎉 KẾT LUẬN

Bạn đã có một foundation vững chắc cho game tu tiên! 

**What works:**
- Complete 100-realm progression system
- Balanced game mechanics
- Functional API endpoints
- Sample UI component

**What you need to add:**
- Database persistence
- User accounts
- More content (events, bosses)
- UI polish

Chúc may mắn với project! 加油！ (Jiāyóu!)

---

**Created by**: Claude (Anthropic)
**Date**: 2025-02-16
**Version**: 1.0.0
