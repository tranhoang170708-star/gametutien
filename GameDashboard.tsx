'use client';

// components/GameDashboard.tsx
// Component chính cho game UI

import { useState, useEffect } from 'react';
import { PlayerStats, Realm } from '@/lib/types';
import realmsData from '@/data/realms-data.json';

export default function GameDashboard() {
  const [player, setPlayer] = useState<PlayerStats>({
    tuVi: 0,
    canCot: 50,
    ngoTinh: 50,
    khiVan: 50,
    tamCanh: 50,
    linhThach: 1000,
    danhVong: 0,
    currentRealm: 0
  });

  const [cultivating, setCultivating] = useState(false);
  const [message, setMessage] = useState('');
  const [cultivateDuration, setCultivateDuration] = useState(60);

  const currentRealm = realmsData[player.currentRealm] as Realm;
  const nextRealm = realmsData[player.currentRealm + 1] as Realm | undefined;

  // Tu luyện
  async function handleCultivate() {
    setCultivating(true);
    setMessage('Đang tu luyện...');

    try {
      const response = await fetch('/api/cultivate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ player, duration: cultivateDuration })
      });

      const data = await response.json();
      
      if (data.success) {
        setPlayer(data.updatedPlayer);
        setMessage(data.message);
      } else {
        setMessage('Tu luyện thất bại!');
      }
    } catch (error) {
      setMessage('Lỗi kết nối!');
    } finally {
      setCultivating(false);
    }
  }

  // Đột phá
  async function handleBreakthrough() {
    if (!nextRealm) {
      setMessage('Đã đạt cảnh giới tối đa!');
      return;
    }

    setMessage('Đang đột phá...');

    try {
      const response = await fetch('/api/breakthrough', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ player })
      });

      const data = await response.json();
      
      if (data.success) {
        setPlayer(data.updatedPlayer);
        setMessage(`✨ ${data.message}\n${data.flavorText}`);
      } else {
        setPlayer(data.updatedPlayer);
        setMessage(`❌ ${data.message}\n${data.flavorText}`);
      }
    } catch (error) {
      setMessage('Lỗi kết nối!');
    }
  }

  // Kiểm tra có thể đột phá
  const canBreakthrough = nextRealm && 
    player.tuVi >= nextRealm.requirements.tuVi &&
    player.linhThach >= nextRealm.requirements.linhThach;

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 text-white p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-2">🌟 Tu Tiên Chi Lộ 🌟</h1>
          <p className="text-gray-400">Text-based Cultivation RPG</p>
        </div>

        {/* Player Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Current Realm */}
          <div className="bg-gradient-to-br from-purple-900 to-purple-800 rounded-lg p-6 shadow-xl">
            <div className="text-center">
              <div className="text-5xl mb-2">{currentRealm.emoji}</div>
              <h2 className="text-2xl font-bold mb-1">{currentRealm.name}</h2>
              <p className="text-sm text-gray-300">{currentRealm.stage}</p>
              <p className="text-xs text-gray-400 mt-2">{currentRealm.description}</p>
            </div>
          </div>

          {/* Main Stats */}
          <div className="bg-slate-800 rounded-lg p-6 shadow-xl">
            <h3 className="text-xl font-bold mb-4">📊 Chỉ Số Chính</h3>
            <div className="space-y-2">
              <StatBar label="Tu Vi" value={player.tuVi} max={nextRealm?.requirements.tuVi || player.tuVi * 2} />
              <StatBar label="Linh Thạch" value={player.linhThach} max={nextRealm?.requirements.linhThach || player.linhThach * 2} />
              <StatBar label="Danh Vọng" value={player.danhVong} max={10000} color="yellow" />
            </div>
          </div>

          {/* Attributes */}
          <div className="bg-slate-800 rounded-lg p-6 shadow-xl">
            <h3 className="text-xl font-bold mb-4">✨ Thuộc Tính</h3>
            <div className="space-y-2">
              <StatBar label="Căn Cốt" value={player.canCot} max={100} color="green" />
              <StatBar label="Ngộ Tính" value={player.ngoTinh} max={100} color="blue" />
              <StatBar label="Khí Vận" value={player.khiVan} max={100} color="purple" />
              <StatBar label="Tâm Cảnh" value={player.tamCanh} max={100} color="pink" />
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Cultivation */}
          <div className="bg-slate-800 rounded-lg p-6 shadow-xl">
            <h3 className="text-xl font-bold mb-4">🧘 Tu Luyện</h3>
            <div className="mb-4">
              <label className="block text-sm mb-2">Thời gian: {cultivateDuration} phút</label>
              <input
                type="range"
                min="1"
                max="1440"
                value={cultivateDuration}
                onChange={(e) => setCultivateDuration(Number(e.target.value))}
                className="w-full"
                disabled={cultivating}
              />
              <div className="flex justify-between text-xs text-gray-400 mt-1">
                <span>1 phút</span>
                <span>24 giờ</span>
              </div>
            </div>
            <button
              onClick={handleCultivate}
              disabled={cultivating}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white font-bold py-3 px-4 rounded-lg transition"
            >
              {cultivating ? 'Đang tu luyện...' : 'Bắt đầu tu luyện'}
            </button>
          </div>

          {/* Breakthrough */}
          <div className="bg-slate-800 rounded-lg p-6 shadow-xl">
            <h3 className="text-xl font-bold mb-4">⚡ Đột Phá</h3>
            {nextRealm ? (
              <>
                <div className="mb-4 text-sm">
                  <p className="mb-2">
                    <span className="text-gray-400">Cảnh giới tiếp theo:</span>
                    <br />
                    <span className="text-xl font-bold">{nextRealm.emoji} {nextRealm.name}</span>
                  </p>
                  <div className="space-y-1 text-xs">
                    <p className={player.tuVi >= nextRealm.requirements.tuVi ? 'text-green-400' : 'text-red-400'}>
                      ✓ Tu vi: {nextRealm.requirements.tuVi.toLocaleString()}
                    </p>
                    <p className={player.linhThach >= nextRealm.requirements.linhThach ? 'text-green-400' : 'text-red-400'}>
                      ✓ Linh thạch: {nextRealm.requirements.linhThach.toLocaleString()}
                    </p>
                    <p className="text-yellow-400">
                      📊 Tỉ lệ thành công: ~{nextRealm.breakthrough.baseSuccessRate}%
                    </p>
                    {nextRealm.breakthrough.tamMaChance > 0 && (
                      <p className="text-purple-400">
                        😈 Tỉ lệ tâm ma: {nextRealm.breakthrough.tamMaChance}%
                      </p>
                    )}
                  </div>
                </div>
                <button
                  onClick={handleBreakthrough}
                  disabled={!canBreakthrough}
                  className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 text-white font-bold py-3 px-4 rounded-lg transition"
                >
                  {canBreakthrough ? 'Đột phá!' : 'Chưa đủ điều kiện'}
                </button>
              </>
            ) : (
              <p className="text-gray-400">Đã đạt cảnh giới tối đa!</p>
            )}
          </div>
        </div>

        {/* Message Box */}
        {message && (
          <div className="bg-slate-800 rounded-lg p-6 shadow-xl">
            <h3 className="text-xl font-bold mb-2">📜 Thông Báo</h3>
            <p className="text-gray-300 whitespace-pre-line">{message}</p>
          </div>
        )}
      </div>
    </div>
  );
}

// Helper component
function StatBar({ 
  label, 
  value, 
  max, 
  color = 'blue' 
}: { 
  label: string; 
  value: number; 
  max: number; 
  color?: string;
}) {
  const percentage = Math.min(100, (value / max) * 100);
  
  const colorClasses = {
    blue: 'bg-blue-500',
    green: 'bg-green-500',
    purple: 'bg-purple-500',
    pink: 'bg-pink-500',
    yellow: 'bg-yellow-500'
  };

  return (
    <div>
      <div className="flex justify-between text-sm mb-1">
        <span>{label}</span>
        <span>{value.toLocaleString()}</span>
      </div>
      <div className="w-full bg-gray-700 rounded-full h-2">
        <div
          className={`${colorClasses[color as keyof typeof colorClasses] || colorClasses.blue} h-2 rounded-full transition-all duration-300`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
