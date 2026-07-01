import { useState } from 'react';
import { Creator, Holding } from '../types';
import { PriceChart, Sparkline } from './PriceChart';

interface CreatorCardProps {
  creator: Creator;
  holding?: Holding;
  onBuy: (creator: Creator) => void;
  onSell: (creator: Creator) => void;
}

export default function CreatorCard({ creator, holding, onBuy, onSell }: CreatorCardProps) {
  const [expanded, setExpanded] = useState(false);
  const isGain = creator.change >= 0;
  const changeColor = isGain ? '#00c785' : '#ff4757';
  const changeArrow = isGain ? '▲' : '▼';
  const changeAbs = Math.abs(creator.change);

  const sparkColor = isGain ? '#00c785' : '#ff4757';

  return (
    <>
      {/* Table Row */}
      <tr
        className="border-b border-border-color hover:bg-bg-card2 cursor-pointer transition-colors duration-150"
        onClick={() => setExpanded(!expanded)}
      >
        <td className="py-3 px-3 text-text-secondary text-sm w-8">{creator.id}</td>
        <td className="py-3 px-3">
          <div className="flex items-center gap-2">
            <span className="text-xl">{creator.emoji}</span>
            <div>
              <div className="font-semibold text-sm text-text-primary">{creator.name}</div>
              <div className="text-xs text-text-muted">{creator.category}</div>
            </div>
          </div>
        </td>
        <td className="py-3 px-3 text-right">
          <div className="font-bold text-sm" style={{ color: changeColor }}>
            {creator.price.toLocaleString()}
          </div>
          <div className="text-xs text-text-secondary">🌽</div>
        </td>
        <td className="py-3 px-3 text-right">
          <span className="text-sm font-semibold" style={{ color: changeColor }}>
            {changeArrow} {changeAbs.toFixed(1)}%
          </span>
        </td>
        <td className="py-3 px-3 text-right text-text-secondary text-sm hidden md:table-cell">
          {creator.volume.toLocaleString()}
        </td>
        <td className="py-3 px-3 hidden lg:table-cell">
          <div className="w-24">
            <Sparkline data={creator.history.slice(-14)} color={sparkColor} height={36} />
          </div>
        </td>
        <td className="py-3 px-3 text-right hidden sm:table-cell">
          <div className="text-xs text-text-secondary">
            <span className="gain-text">{creator.high52w.toLocaleString()}</span>
            <span className="text-text-muted"> / </span>
            <span className="loss-text">{creator.low52w.toLocaleString()}</span>
          </div>
        </td>
        <td className="py-3 px-3 text-right">
          <button
            className="bg-accent hover:bg-accent-hover text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors duration-200"
            onClick={(e) => { e.stopPropagation(); onBuy(creator); }}
          >
            매수
          </button>
        </td>
      </tr>

      {/* Expanded Detail Row */}
      {expanded && (
        <tr className="border-b border-border-color">
          <td colSpan={8} className="p-0">
            <div className="bg-bg-card2 px-4 py-5 fade-in">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Chart */}
                <div className="lg:col-span-2">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-bold text-text-primary">
                      {creator.emoji} {creator.name} 주가 차트
                    </h3>
                    <span className="text-xs text-text-muted">최근 14일</span>
                  </div>
                  <PriceChart
                    data={creator.history}

                    ipoPrice={creator.ipoPrice}
                    isGain={isGain}
                  />
                  <div className="text-xs text-text-muted text-center mt-1">
                    점선: IPO 공모가 ({creator.ipoPrice.toLocaleString()}🌽)
                  </div>
                </div>

                {/* Stats */}
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-bg-card rounded-lg p-3">
                      <div className="text-xs text-text-secondary mb-1">현재가</div>
                      <div className="font-bold text-text-primary">{creator.price.toLocaleString()}🌽</div>
                    </div>
                    <div className="bg-bg-card rounded-lg p-3">
                      <div className="text-xs text-text-secondary mb-1">IPO 공모가</div>
                      <div className="font-bold text-text-primary">{creator.ipoPrice.toLocaleString()}🌽</div>
                    </div>
                    <div className="bg-bg-card rounded-lg p-3">
                      <div className="text-xs text-text-secondary mb-1">팔로워</div>
                      <div className="font-bold text-text-primary">{creator.followers.toLocaleString()}명</div>
                    </div>
                    <div className="bg-bg-card rounded-lg p-3">
                      <div className="text-xs text-text-secondary mb-1">시청자수</div>
                      <div className="font-bold text-text-primary">{creator.viewers.toLocaleString()}명</div>
                    </div>
                    <div className="bg-bg-card rounded-lg p-3">
                      <div className="text-xs text-text-secondary mb-1">월평균 도네이션</div>
                      <div className="font-bold text-text-primary text-xs">{creator.avgDonation.toLocaleString()}🌽</div>
                    </div>
                    <div className="bg-bg-card rounded-lg p-3">
                      <div className="text-xs text-text-secondary mb-1">시가총액</div>
                      <div className="font-bold text-text-primary text-xs">
                        {creator.marketCap >= 1e9
                          ? `${(creator.marketCap / 1e9).toFixed(1)}B`
                          : `${(creator.marketCap / 1e6).toFixed(0)}M`}🌽
                      </div>
                    </div>
                  </div>

                  {holding && (
                    <div className="bg-accent bg-opacity-10 border border-accent border-opacity-30 rounded-lg p-3">
                      <div className="text-xs text-accent font-semibold mb-2">내 보유 현황</div>
                      <div className="space-y-1 text-xs">
                        <div className="flex justify-between">
                          <span className="text-text-secondary">보유 수량</span>
                          <span className="text-text-primary font-semibold">{holding.quantity}주</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-text-secondary">평균 매수가</span>
                          <span className="text-text-primary font-semibold">{holding.avgBuyPrice.toLocaleString()}🌽</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-text-secondary">평가손익</span>
                          <span
                            className="font-bold"
                            style={{ color: creator.price >= holding.avgBuyPrice ? '#00c785' : '#ff4757' }}
                          >
                            {creator.price >= holding.avgBuyPrice ? '+' : ''}
                            {((creator.price - holding.avgBuyPrice) * holding.quantity).toLocaleString()}🌽
                          </span>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="flex gap-2">
                    <button
                      className="flex-1 bg-gain hover:opacity-90 text-white font-bold py-2 rounded-lg text-sm transition-opacity"
                      onClick={() => onBuy(creator)}
                    >
                      매수
                    </button>
                    {holding && (
                      <button
                        className="flex-1 bg-loss hover:opacity-90 text-white font-bold py-2 rounded-lg text-sm transition-opacity"
                        onClick={() => onSell(creator)}
                      >
                        매도
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </td>
        </tr>
      )}
    </>
  );
}
