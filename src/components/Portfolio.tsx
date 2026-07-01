import { Creator, Holding, Dividend, Order } from '../types';
import { ResponsiveContainer, LineChart, Line } from 'recharts';
import { calcDividendPerShare, calcAnnualYield } from '../data/creators';

interface Props {
  creators: Creator[];
  holdings: Holding[];
  balance: number;
  dividends: Dividend[];
  orders: Order[];
  onOpenTrade: (creator: Creator, type: 'buy' | 'sell') => void;
  onClaimDividend: () => void;
  onCancelOrder: (orderId: string) => void;
}

function Spark({ creator }: { creator: Creator }) {
  const color = creator.change >= 0 ? 'var(--up)' : 'var(--down)';
  return (
    <div style={{ width: 64, height: 28 }}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={creator.history.slice(-14)}>
          <Line type="monotone" dataKey="price" stroke={color} strokeWidth={1.5} dot={false} isAnimationActive={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}


export default function Portfolio({ creators, holdings, balance, dividends, orders, onOpenTrade, onClaimDividend, onCancelOrder }: Props) {

  const details = holdings.map(h => {
    const creator = creators.find(c => c.id === h.creatorId)!;
    const cur     = creator.price * h.quantity;
    const inv     = h.avgBuyPrice * h.quantity;
    const pnl     = cur - inv;
    const pct     = ((creator.price - h.avgBuyPrice) / h.avgBuyPrice) * 100;
    const weeklyDiv = calcDividendPerShare(creator) * h.quantity;
    const annualYield = calcAnnualYield(creator);
    return { ...h, creator, cur, inv, pnl, pct, weeklyDiv, annualYield };
  });

  const totalInv     = details.reduce((s, h) => s + h.inv, 0);
  const totalCur     = details.reduce((s, h) => s + h.cur, 0);
  const totalPnl     = totalCur - totalInv;
  const totalDiv     = dividends.reduce((s, d) => s + d.amount, 0);
  const totalAss     = balance + totalCur;
  const weeklyDivSum = details.reduce((s, h) => s + h.weeklyDiv, 0);

  const pnlSign  = totalPnl >= 0 ? '+' : '';

  const pendingOrders  = orders.filter(o => o.status === 'pending');
  const recentOrders   = orders.filter(o => o.status !== 'pending').slice(0, 10);

  return (
    <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

      {/* ── 히어로 자산 카드 (도네이터 VIP 카드 스타일) ── */}
      <div className="card-hero" style={{ padding: '28px 28px 24px', position: 'relative', overflow: 'hidden' }}>
        {/* 배경 데코 원 */}
        <div style={{ position: 'absolute', top: -30, right: -30, width: 160, height: 160, borderRadius: '50%', background: 'rgba(255,255,255,0.07)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: -20, right: 80, width: 100, height: 100, borderRadius: '50%', background: 'rgba(255,255,255,0.05)', pointerEvents: 'none' }} />

        <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.7)', fontWeight: 500, marginBottom: 6 }}>나의 누적 강냉이</div>
        <div style={{ fontSize: 38, fontWeight: 900, color: '#fff', fontVariantNumeric: 'tabular-nums', letterSpacing: '-1px', lineHeight: 1 }}>
          {totalAss.toLocaleString()} <span style={{ fontSize: 18 }}>🌽</span>
        </div>
        <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.65)', marginTop: 6 }}>
          총 {details.length}개 종목 보유
        </div>

        {/* 하단 통계 */}
        <div style={{ display: 'flex', gap: 0, marginTop: 20, background: 'rgba(255,255,255,0.12)', borderRadius: 14, overflow: 'hidden' }}>
          {[
            { label: '보유 현금',  val: balance.toLocaleString() },
            { label: '평가금액',   val: totalCur.toLocaleString() },
            { label: '평가손익',   val: `${pnlSign}${totalPnl.toLocaleString()}`, color: totalPnl >= 0 ? '#FFB3BE' : '#A8CFFF' },
          ].map((s, i) => (
            <div key={s.label} style={{ flex: 1, padding: '12px 14px', borderLeft: i > 0 ? '1px solid rgba(255,255,255,0.12)' : 'none' }}>
              <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.6)', marginBottom: 4, fontWeight: 500 }}>{s.label}</div>
              <div style={{ fontSize: 14, fontWeight: 800, color: s.color ?? '#fff', fontVariantNumeric: 'tabular-nums' }}>{s.val}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── 배당 수령 카드 ── */}
      {holdings.length > 0 && (
        <div className="card" style={{ padding: '18px 22px', display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{ width: 52, height: 52, borderRadius: 16, background: 'var(--purple-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 26, flexShrink: 0 }}>
            💰
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--t1)' }}>배당 수령 가능</div>
            <div style={{ fontSize: 12, color: 'var(--t2)', marginTop: 2 }}>크리에이터 후원 수익의 일부를 주주에게 배분합니다</div>
          </div>
          <div style={{ textAlign: 'right', marginRight: 12 }}>
            <div style={{ fontSize: 11, color: 'var(--t3)' }}>예상 수령액</div>
            <div style={{ fontSize: 17, fontWeight: 800, color: 'var(--blue)', fontVariantNumeric: 'tabular-nums', marginTop: 2 }}>
              +{weeklyDivSum.toLocaleString()} 🌽
            </div>
          </div>
          <button onClick={onClaimDividend} style={{
            background: 'var(--purple-grad)', color: '#fff',
            border: 'none', borderRadius: 999, padding: '11px 22px',
            fontSize: 14, fontWeight: 700, cursor: 'pointer', flexShrink: 0,
            boxShadow: '0 4px 14px rgba(123,102,255,0.35)',
            transition: 'opacity .15s, transform .1s',
          }}
            onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.opacity = '0.88'; el.style.transform = 'translateY(-1px)'; }}
            onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.opacity = '1'; el.style.transform = ''; }}
          >
            수령하기
          </button>
        </div>
      )}

      {/* ── 미체결 주문 ── */}
      {pendingOrders.length > 0 && (
        <div className="card" style={{ overflow: 'hidden' }}>
          <div style={{ padding: '18px 24px', borderBottom: '1px solid var(--line)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <div style={{ fontWeight: 800, fontSize: 16, color: 'var(--t1)' }}>미체결 주문</div>
              <div style={{ fontSize: 12, color: 'var(--t3)', marginTop: 3 }}>체결 대기 중 · {pendingOrders.length}건</div>
            </div>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--up)', display: 'inline-block', boxShadow: '0 0 0 4px rgba(240,68,82,0.2)', animation: 'pulse 1.5s infinite' }} />
          </div>
          {pendingOrders.map(o => {
            const isBuy   = o.type === 'buy';
            const isMkt   = o.orderType === 'market';
            const clr     = isBuy ? 'var(--up)' : 'var(--down)';
            const bgClr   = isBuy ? 'rgba(240,68,82,0.08)' : 'rgba(123,102,255,0.08)';
            const elapsed = Math.floor((Date.now() - o.timestamp.getTime()) / 1000);
            return (
              <div key={o.id} style={{ padding: '14px 24px', borderBottom: '1px solid var(--line)', display: 'flex', alignItems: 'center', gap: 14 }}>
                {/* 유형 뱃지 */}
                <div style={{ width: 48, height: 48, borderRadius: 14, background: bgClr, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <span style={{ fontSize: 10, fontWeight: 800, color: clr }}>{isBuy ? '매수' : '매도'}</span>
                  <span style={{ fontSize: 9, color: 'var(--t3)', marginTop: 2 }}>{isMkt ? '시장가' : '지정가'}</span>
                </div>
                {/* 크리에이터 */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--t1)' }}>
                    {o.creatorEmoji} {o.creatorName}
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--t3)', marginTop: 2 }}>
                    {isMkt ? '시장가' : `지정가 ${o.limitPrice.toLocaleString()} 🌽`} · {o.quantity}주 · {elapsed}초 전
                  </div>
                </div>
                {/* 금액 */}
                <div style={{ textAlign: 'right', marginRight: 12 }}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: clr, fontVariantNumeric: 'tabular-nums' }}>
                    {isBuy ? '−' : '+'}{(o.quantity * o.limitPrice).toLocaleString()} 🌽
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--t3)', marginTop: 2 }}>
                    {isMkt ? '⚡ 자동 체결 중' : '⏳ 조건 대기'}
                  </div>
                </div>
                {/* 취소 */}
                <button onClick={() => onCancelOrder(o.id)}
                  style={{ padding: '7px 14px', borderRadius: 9, border: '1px solid var(--line)', background: 'var(--raised)', color: 'var(--t2)', fontSize: 12, fontWeight: 700, cursor: 'pointer', flexShrink: 0, transition: 'background .12s' }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'var(--line)'; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'var(--raised)'; }}
                >
                  취소
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* ── 체결 완료 최근 주문 ── */}
      {recentOrders.length > 0 && (
        <div className="card" style={{ overflow: 'hidden' }}>
          <div style={{ padding: '16px 24px', borderBottom: '1px solid var(--line)' }}>
            <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--t1)' }}>최근 체결 주문</div>
          </div>
          {recentOrders.map(o => {
            const isBuy    = o.type === 'buy';
            const isFilled = o.status === 'filled';
            const clr      = isBuy ? 'var(--up)' : 'var(--down)';
            const stClr    = isFilled ? (isBuy ? 'var(--up)' : 'var(--down)') : 'var(--t3)';
            const stLabel  = isFilled ? '체결' : '취소';
            return (
              <div key={o.id} style={{ padding: '12px 24px', borderBottom: '1px solid var(--line)', display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontSize: 13, fontWeight: 700, color: clr }}>{isBuy ? '매수' : '매도'}</span>
                    <span style={{ fontSize: 12, color: 'var(--t2)' }}>{o.creatorEmoji} {o.creatorName} · {o.quantity}주</span>
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--t3)', marginTop: 2 }}>
                    {o.orderType === 'market' ? '시장가' : `지정가 ${o.limitPrice.toLocaleString()} 🌽`}
                    {isFilled && o.filledPrice ? ` → 체결가 ${o.filledPrice.toLocaleString()} 🌽` : ''}
                  </div>
                </div>
                <span style={{ fontSize: 11, fontWeight: 700, color: stClr, background: isFilled ? (isBuy ? 'rgba(240,68,82,0.08)' : 'rgba(123,102,255,0.08)') : 'var(--raised)', borderRadius: 6, padding: '3px 8px' }}>
                  {stLabel}
                </span>
              </div>
            );
          })}
        </div>
      )}

      {/* Holdings table */}
      <div className="card" style={{ overflow: 'hidden' }}>
        <div style={{ padding: '18px 24px', borderBottom: '1px solid var(--line)' }}>
          <div style={{ fontWeight: 800, fontSize: 16, color: 'var(--t1)' }}>보유 종목</div>
          <div style={{ fontSize: 12, color: 'var(--t3)', marginTop: 3 }}>{details.length}개 종목 보유 중</div>
        </div>

        {details.length === 0 ? (
          <div style={{ padding: '64px 0', textAlign: 'center' }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>🌽</div>
            <div style={{ color: 'var(--t2)', fontWeight: 600 }}>보유 중인 종목이 없습니다</div>
            <div style={{ color: 'var(--t3)', fontSize: 13, marginTop: 4 }}>시장 탭에서 크리에이터 주식을 매수해보세요</div>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--line)', background: 'var(--raised)' }}>
                  {['크리에이터','보유수량','평균매수가','현재가','평가금액','손익','주간배당','배당수익률','차트','거래'].map(h => (
                    <th key={h} style={{ padding: '10px 16px', fontSize: 11, color: 'var(--t2)', fontWeight: 600, textAlign: h === '크리에이터' ? 'left' : 'right', whiteSpace: 'nowrap' }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {details.map(h => {
                  const isGain = h.pnl >= 0;
                  const clr    = isGain ? 'var(--up)' : 'var(--down)';
                  const curClr = h.creator.change >= 0 ? 'var(--up)' : 'var(--down)';
                  return (
                    <tr key={h.creatorId}
                      style={{ borderBottom: '1px solid var(--line)', transition: 'background .12s', cursor: 'pointer' }}
                      onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'var(--hover-bg)'; }}
                      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = ''; }}
                    >
                      <td style={{ padding: '14px 16px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <span style={{ fontSize: 20 }}>{h.creator.emoji}</span>
                          <div>
                            <div style={{ fontWeight: 600, fontSize: 14, color: 'var(--t1)' }}>{h.creator.name}</div>
                            <div style={{ fontSize: 11, color: 'var(--t3)', marginTop: 1 }}>{h.creator.category}</div>
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: '14px 16px', textAlign: 'right', fontWeight: 700, fontSize: 14, color: 'var(--t1)', fontVariantNumeric: 'tabular-nums' }}>{h.quantity}주</td>
                      <td style={{ padding: '14px 16px', textAlign: 'right', fontSize: 13, color: 'var(--t2)', fontVariantNumeric: 'tabular-nums' }}>{h.avgBuyPrice.toLocaleString()}🌽</td>
                      <td style={{ padding: '14px 16px', textAlign: 'right', fontWeight: 700, fontSize: 14, color: curClr, fontVariantNumeric: 'tabular-nums' }}>{h.creator.price.toLocaleString()}🌽</td>
                      <td style={{ padding: '14px 16px', textAlign: 'right', fontWeight: 700, fontSize: 14, color: 'var(--t1)', fontVariantNumeric: 'tabular-nums' }}>{h.cur.toLocaleString()}🌽</td>
                      <td style={{ padding: '14px 16px', textAlign: 'right' }}>
                        <div style={{ fontWeight: 700, fontSize: 14, color: clr, fontVariantNumeric: 'tabular-nums' }}>{isGain ? '+' : ''}{h.pnl.toLocaleString()}</div>
                        <div style={{ fontSize: 11, color: clr, marginTop: 2 }}>{isGain ? '▲' : '▼'}{Math.abs(h.pct).toFixed(2)}%</div>
                      </td>
                      <td style={{ padding: '14px 16px', textAlign: 'right' }}>
                        <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--blue)', fontVariantNumeric: 'tabular-nums' }}>+{h.weeklyDiv.toLocaleString()}</div>
                        <div style={{ fontSize: 10, color: 'var(--t3)', marginTop: 2 }}>🌽/주</div>
                      </td>
                      <td style={{ padding: '14px 16px', textAlign: 'right' }}>
                        <div style={{ display: 'inline-block', background: 'rgba(123,102,255,0.1)', color: 'var(--blue)', borderRadius: 6, padding: '3px 8px', fontSize: 12, fontWeight: 700 }}>
                          {h.annualYield.toFixed(1)}%
                        </div>
                      </td>
                      <td style={{ padding: '14px 16px' }}><Spark creator={h.creator} /></td>
                      <td style={{ padding: '14px 16px' }}>
                        <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
                          <button onClick={() => onOpenTrade(h.creator, 'buy')}
                            style={{ background: 'var(--up)', color: '#fff', fontSize: 12, fontWeight: 700, padding: '5px 12px', borderRadius: 8, border: 'none', cursor: 'pointer' }}>매수</button>
                          <button onClick={() => onOpenTrade(h.creator, 'sell')}
                            style={{ background: 'var(--down)', color: '#fff', fontSize: 12, fontWeight: 700, padding: '5px 12px', borderRadius: 8, border: 'none', cursor: 'pointer' }}>매도</button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* 배당 누적 수익 요약 */}
      {dividends.length > 0 && (
        <div className="card" style={{ padding: '16px 20px', display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 0 }}>
          {[
            { label: '총 배당 수령액', value: `+${totalDiv.toLocaleString()} 🌽`, color: 'var(--blue)' },
            { label: '배당 발생 횟수',  value: `${dividends.length}회`,            color: 'var(--t1)'  },
            { label: '이번 주 예상',    value: `+${weeklyDivSum.toLocaleString()} 🌽`, color: 'var(--blue)' },
          ].map((s, i) => (
            <div key={s.label} style={{ padding: '4px 16px', borderLeft: i > 0 ? '1px solid var(--line)' : 'none', textAlign: i === 2 ? 'right' : i === 1 ? 'center' : 'left' }}>
              <div style={{ fontSize: 11, color: 'var(--t2)', marginBottom: 6 }}>{s.label}</div>
              <div style={{ fontSize: 16, fontWeight: 800, color: s.color, fontVariantNumeric: 'tabular-nums' }}>{s.value}</div>
            </div>
          ))}
        </div>
      )}

      {/* Dividend history */}
      <div className="card" style={{ overflow: 'hidden' }}>
        <div style={{ padding: '18px 24px', borderBottom: '1px solid var(--line)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontWeight: 800, fontSize: 16, color: 'var(--t1)' }}>배당금 수령 내역</div>
            <div style={{ fontSize: 12, color: 'var(--t3)', marginTop: 3 }}>
              크리에이터 후원 수익 → 강냉이 신규 발행 → 주주 배분
            </div>
          </div>
          <span style={{ fontSize: 24 }}>💰</span>
        </div>
        {dividends.length === 0 ? (
          <div style={{ padding: '32px 0', textAlign: 'center', color: 'var(--t2)', fontSize: 14 }}>아직 배당금 내역이 없습니다</div>
        ) : (
          <div>
            {dividends.slice(0, 20).map(d => (
              <div key={d.id}
                style={{ padding: '14px 24px', borderBottom: '1px solid var(--line)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', transition: 'background .12s' }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'var(--hover-bg)'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = ''; }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <span style={{ fontSize: 22 }}>{d.creatorEmoji}</span>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 14, color: 'var(--t1)' }}>{d.creatorName}</div>
                    <div style={{ fontSize: 11, color: 'var(--t3)', marginTop: 2 }}>
                      {d.timestamp.toLocaleDateString('ko-KR')} {d.timestamp.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: 10, color: 'var(--t3)', background: 'var(--raised)', borderRadius: 4, padding: '2px 6px' }}>신규 발행</span>
                  <div style={{ fontWeight: 700, fontSize: 15, color: 'var(--blue)', fontVariantNumeric: 'tabular-nums' }}>
                    +{d.amount.toLocaleString()} 🌽
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
