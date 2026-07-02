import { useState, useEffect } from 'react';
import { Creator, Holding } from '../types';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

interface Props {
  creator: Creator;
  tradeType: 'buy' | 'sell';
  balance: number;
  holding?: Holding;
  onTrade: (creatorId: number, quantity: number, price: number, type: 'buy' | 'sell', orderType: 'market' | 'limit') => void;
  onClose: () => void;
  onSwitchType: (type: 'buy' | 'sell') => void;
}

type OrderType  = 'market' | 'limit';
type InputMode  = 'qty' | 'amount';

function ChartTip({ active, payload, label }: { active?: boolean; payload?: Array<{value:number}>; label?: string }) {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: 'var(--raised)', border: '1px solid var(--line)', borderRadius: 10, padding: '7px 12px', fontSize: 12, color: 'var(--t1)' }}>
      <div style={{ color: 'var(--t2)', marginBottom: 2 }}>{label}</div>
      <div style={{ fontWeight: 700, fontVariantNumeric: 'tabular-nums' }}>{payload[0].value.toLocaleString()} 🌽</div>
    </div>
  );
}

export default function TradeModal({ creator, tradeType, balance, holding, onTrade, onClose, onSwitchType }: Props) {
  const [orderType, setOrderType]   = useState<OrderType>('market');
  const [inputMode, setInputMode]   = useState<InputMode>('qty');
  const [quantity,  setQuantity]    = useState(1);
  const [limitPrice, setLimitPrice] = useState(creator.price);
  const [amountStr, setAmountStr]   = useState('');
  const [error,     setError]       = useState<string | null>(null);

  const isBuy       = tradeType === 'buy';
  const execPrice   = orderType === 'market' ? creator.price : limitPrice;
  const maxBuy      = Math.floor(balance / execPrice);
  const maxSell     = holding?.quantity ?? 0;
  const max         = isBuy ? maxBuy : maxSell;

  // Derived quantity when amount mode is active
  const derivedQty  = inputMode === 'amount'
    ? Math.floor((parseFloat(amountStr) || 0) / execPrice)
    : quantity;
  const finalQty    = Math.min(derivedQty, max);
  const total       = finalQty * execPrice;

  const isUp        = creator.change >= 0;
  const color       = isUp ? 'var(--up)' : 'var(--down)';
  const hexColor    = isUp ? '#F04452' : '#3182F6';
  const actionColor = isBuy ? 'var(--up)' : 'var(--down)';

  const pnlOnSell = holding ? (execPrice - holding.avgBuyPrice) * finalQty : 0;
  const pnlPct    = holding && holding.avgBuyPrice > 0 ? ((execPrice - holding.avgBuyPrice) / holding.avgBuyPrice) * 100 : 0;

  useEffect(() => {
    setQuantity(1); setAmountStr(''); setError(null);
    setLimitPrice(creator.price);
  }, [tradeType, creator.id]);

  useEffect(() => {
    setLimitPrice(creator.price);
  }, [creator.price]);

  // qty input handler
  const handleQty = (val: string) => {
    const n = parseInt(val, 10);
    if (isNaN(n) || n < 0) { setQuantity(0); return; }
    setQuantity(Math.min(n, max));
  };

  // amount input handler — just store raw string, derive qty
  const handleAmount = (val: string) => {
    const clean = val.replace(/[^0-9]/g, '');
    setAmountStr(clean);
  };

  const setPercent = (pct: number) => {
    if (inputMode === 'qty') {
      setQuantity(Math.max(1, Math.floor(max * pct / 100)));
    } else {
      const maxAmt = isBuy ? balance : maxSell * execPrice;
      setAmountStr(String(Math.floor(maxAmt * pct / 100)));
    }
  };

  const handleTrade = () => {
    setError(null);
    if (finalQty <= 0)                          { setError('수량 또는 금액을 입력해주세요.'); return; }
    if (isBuy  && total > balance)              { setError('잔액이 부족합니다.'); return; }
    if (!isBuy && finalQty > maxSell)           { setError('보유 수량이 부족합니다.'); return; }
    onTrade(creator.id, finalQty, execPrice, tradeType, orderType);
    setQuantity(1); setAmountStr('');
  };

  const disabled = finalQty <= 0 || (isBuy && total > balance) || (!isBuy && finalQty > maxSell);
  const chartData = creator.history.slice(-14).map((d, i) => ({ ...d, lbl: i % 4 === 0 ? d.date : '' }));
  const minP  = Math.min(...chartData.map(d => d.price));
  const maxP  = Math.max(...chartData.map(d => d.price));

  const inputStyle = {
    flex: 1, background: 'var(--raised)', border: '1px solid var(--line)', borderRadius: 10,
    padding: '10px 16px', fontWeight: 700, fontSize: 16, color: 'var(--t1)', outline: 'none',
    fontVariantNumeric: 'tabular-nums' as const, width: '100%',
  };

  const focusBorder = (e: React.FocusEvent<HTMLInputElement>) => (e.currentTarget.style.borderColor = 'var(--blue)');
  const blurBorder  = (e: React.FocusEvent<HTMLInputElement>) => (e.currentTarget.style.borderColor = 'var(--line)');

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 50, display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}>
      <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(8px)' }} onClick={onClose} />

      <div className="fade-in" style={{
        position: 'relative', background: 'var(--surface)', borderRadius: '24px 24px 0 0',
        width: '100%', maxWidth: 600, maxHeight: '92vh', overflowY: 'auto',
        boxShadow: '0 -8px 40px rgba(0,0,0,0.12)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', padding: '12px 24px 0' }}>
          <div style={{ width: 36, height: 4, background: 'var(--raised)', borderRadius: 99 }} />
          <button
            onClick={onClose}
            style={{ position: 'absolute', right: 16, top: '50%', transform: 'translateY(-50%)', width: 32, height: 32, borderRadius: '50%', background: 'var(--raised)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--t2)', fontSize: 18, lineHeight: 1 }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'var(--line)'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'var(--raised)'; }}
          >✕</button>
        </div>

        {/* Header */}
        <div style={{ padding: '16px 24px 0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{ fontSize: 32 }}>{creator.emoji}</span>
            <div>
              <div style={{ fontWeight: 800, fontSize: 18, color: 'var(--t1)', letterSpacing: '-0.5px' }}>{creator.name}</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 2 }}>
                <span style={{ fontSize: 12, color: 'var(--t2)' }}>{creator.category}</span>
                <span style={{ fontSize: 13, fontWeight: 700, color }}>
                  {isUp ? '▲' : '▼'} {Math.abs(creator.change).toFixed(2)}%
                </span>
              </div>
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 11, color: 'var(--t3)', marginBottom: 2 }}>현재가</div>
            <div style={{ fontSize: 20, fontWeight: 800, color: 'var(--t1)', fontVariantNumeric: 'tabular-nums' }}>
              {creator.price.toLocaleString()} 🌽
            </div>
          </div>
        </div>

        <div style={{ padding: '16px 24px 32px', display: 'flex', flexDirection: 'column', gap: 14 }}>

          {/* 14-day chart */}
          <div style={{ height: 110 }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 4, right: 4, left: -16, bottom: 0 }}>
                <defs>
                  <linearGradient id="modalGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%"   stopColor={hexColor} stopOpacity={0.18} />
                    <stop offset="100%" stopColor={hexColor} stopOpacity={0}    />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="2 4" stroke="var(--chart-grid)" vertical={false} />
                <XAxis dataKey="lbl" tick={{ fill: 'var(--t3)', fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: 'var(--t3)', fontSize: 10 }} axisLine={false} tickLine={false} width={52}
                  domain={[minP * 0.97, maxP * 1.02]} tickFormatter={v => v.toLocaleString()} />
                <Tooltip content={<ChartTip />} />
                <Area type="monotone" dataKey="price" stroke={color} strokeWidth={2} fill="url(#modalGrad)"
                  dot={false} activeDot={{ r: 4, fill: hexColor, stroke: 'var(--surface)', strokeWidth: 2 }} isAnimationActive={false} />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Creator stats */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 8 }}>
            {[
              { label: '팔로워',   val: `${(creator.followers/1000).toFixed(0)}K` },
              { label: '시청자수', val: creator.viewers.toLocaleString()           },
              { label: 'IPO 가격', val: `${creator.ipoPrice.toLocaleString()} 🌽`  },
            ].map(s => (
              <div key={s.label} style={{ background: 'var(--raised)', borderRadius: 12, padding: '10px 14px', textAlign: 'center' }}>
                <div style={{ fontSize: 11, color: 'var(--t2)', marginBottom: 4 }}>{s.label}</div>
                <div style={{ fontWeight: 700, fontSize: 13, color: 'var(--t1)', fontVariantNumeric: 'tabular-nums' }}>{s.val}</div>
              </div>
            ))}
          </div>

          {/* Buy / Sell toggle */}
          <div style={{ display: 'flex', background: 'var(--raised)', borderRadius: 14, padding: 4, gap: 4 }}>
            {(['buy','sell'] as const).map(t => (
              <button key={t} onClick={() => onSwitchType(t)} style={{
                flex: 1, padding: '10px 0', borderRadius: 10, border: 'none', cursor: 'pointer',
                fontWeight: 700, fontSize: 14,
                background: tradeType === t ? (t === 'buy' ? 'var(--up)' : 'var(--down)') : 'transparent',
                color: tradeType === t ? '#fff' : 'var(--t2)',
                transition: 'background .15s, color .15s',
              }}>
                {t === 'buy' ? '매수' : '매도'}
              </button>
            ))}
          </div>

          {/* ── 주문 유형 (시장가 / 지정가) ── */}
          <div>
            <div style={{ fontSize: 12, color: 'var(--t2)', marginBottom: 8 }}>주문 유형</div>
            <div style={{ display: 'flex', background: 'var(--raised)', borderRadius: 12, padding: 3, gap: 3 }}>
              {([
                { key: 'market', label: '시장가', desc: '즉시 체결' },
                { key: 'limit',  label: '지정가', desc: '가격 지정' },
              ] as { key: OrderType; label: string; desc: string }[]).map(o => (
                <button key={o.key} onClick={() => setOrderType(o.key)} style={{
                  flex: 1, padding: '8px 0', borderRadius: 9, border: 'none', cursor: 'pointer',
                  background: orderType === o.key ? 'var(--surface)' : 'transparent',
                  boxShadow: orderType === o.key ? '0 1px 4px rgba(0,0,0,0.15)' : 'none',
                  transition: 'background .15s, box-shadow .15s',
                }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: orderType === o.key ? 'var(--t1)' : 'var(--t3)' }}>{o.label}</div>
                  <div style={{ fontSize: 10, color: orderType === o.key ? 'var(--blue)' : 'var(--t3)', marginTop: 1 }}>{o.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* 지정가 입력 */}
          {orderType === 'limit' && (
            <div className="fade-in">
              <div style={{ fontSize: 12, color: 'var(--t2)', marginBottom: 8 }}>지정 가격 <span style={{ color: 'var(--t3)' }}>(🌽 강냉이)</span></div>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <button
                  onClick={() => setLimitPrice(p => Math.max(1, p - 100))}
                  style={{ width: 42, height: 42, borderRadius: 10, background: 'var(--raised)', border: '1px solid var(--line)', color: 'var(--t1)', fontSize: 18, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}
                >−</button>
                <input
                  type="number" value={limitPrice}
                  onChange={e => setLimitPrice(Math.max(1, parseInt(e.target.value) || 0))}
                  onFocus={focusBorder} onBlur={blurBorder}
                  style={{ ...inputStyle, textAlign: 'center' }}
                />
                <button
                  onClick={() => setLimitPrice(p => p + 100)}
                  style={{ width: 42, height: 42, borderRadius: 10, background: 'var(--raised)', border: '1px solid var(--line)', color: 'var(--t1)', fontSize: 18, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}
                >+</button>
              </div>
              <div style={{ display: 'flex', gap: 6, marginTop: 6 }}>
                {[-5,-1,+1,+5].map(pct => (
                  <button key={pct} onClick={() => setLimitPrice(p => Math.max(1, Math.round(p * (1 + pct/100))))}
                    style={{ flex: 1, padding: '6px 0', borderRadius: 8, background: 'var(--raised)', border: '1px solid var(--line)', color: pct < 0 ? 'var(--down)' : 'var(--up)', fontSize: 11, fontWeight: 700, cursor: 'pointer' }}>
                    {pct > 0 ? '+' : ''}{pct}%
                  </button>
                ))}
                <button onClick={() => setLimitPrice(creator.price)}
                  style={{ flex: 1, padding: '6px 0', borderRadius: 8, background: 'var(--raised)', border: '1px solid var(--line)', color: 'var(--blue)', fontSize: 11, fontWeight: 700, cursor: 'pointer' }}>
                  현재가
                </button>
              </div>
            </div>
          )}

          {/* ── 입력 모드 전환 (수량 / 금액) ── */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
              <div style={{ fontSize: 12, color: 'var(--t2)' }}>
                {inputMode === 'qty' ? '수량' : '금액 (🌽)'}
              </div>
              <div style={{ display: 'flex', background: 'var(--raised)', borderRadius: 8, padding: 2, gap: 2 }}>
                {([
                  { key: 'qty',    label: '수량' },
                  { key: 'amount', label: '금액' },
                ] as { key: InputMode; label: string }[]).map(m => (
                  <button key={m.key} onClick={() => { setInputMode(m.key); setAmountStr(''); setQuantity(1); }}
                    style={{ padding: '3px 10px', borderRadius: 6, border: 'none', cursor: 'pointer', fontSize: 11, fontWeight: 700,
                      background: inputMode === m.key ? 'var(--surface)' : 'transparent',
                      color: inputMode === m.key ? 'var(--t1)' : 'var(--t3)',
                      boxShadow: inputMode === m.key ? '0 1px 3px rgba(0,0,0,0.12)' : 'none',
                      transition: 'all .12s',
                    }}>
                    {m.label}
                  </button>
                ))}
              </div>
            </div>

            {inputMode === 'qty' ? (
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <button
                  onClick={() => setQuantity(q => Math.max(1, q - 1))}
                  style={{ width: 42, height: 42, borderRadius: 10, background: 'var(--raised)', border: '1px solid var(--line)', color: 'var(--t1)', fontSize: 20, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}
                >−</button>
                <input type="number" min={0} max={max} value={quantity}
                  onChange={e => handleQty(e.target.value)}
                  onFocus={focusBorder} onBlur={blurBorder}
                  style={{ ...inputStyle, textAlign: 'center' }}
                />
                <button
                  onClick={() => setQuantity(q => Math.min(max, q + 1))}
                  style={{ width: 42, height: 42, borderRadius: 10, background: 'var(--raised)', border: '1px solid var(--line)', color: 'var(--t1)', fontSize: 20, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}
                >+</button>
              </div>
            ) : (
              <div style={{ position: 'relative' }}>
                <input
                  type="text" inputMode="numeric" placeholder="0"
                  value={amountStr ? parseInt(amountStr).toLocaleString() : ''}
                  onChange={e => handleAmount(e.target.value.replace(/,/g, ''))}
                  onFocus={focusBorder} onBlur={blurBorder}
                  style={{ ...inputStyle, paddingRight: 48 }}
                />
                <span style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', fontSize: 16, pointerEvents: 'none' }}>🌽</span>
                {amountStr && (
                  <div style={{ fontSize: 11, color: 'var(--t3)', marginTop: 5 }}>
                    ≈ {finalQty}주 ({(finalQty * execPrice).toLocaleString()} 🌽)
                  </div>
                )}
              </div>
            )}
          </div>

          {/* 잔액 / 보유 수량 */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: 13, color: 'var(--t2)' }}>{isBuy ? '보유 잔액' : '보유 수량'}</span>
            <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--t1)', fontVariantNumeric: 'tabular-nums' }}>
              {isBuy ? `${balance.toLocaleString()} 🌽` : `${maxSell}주`}
            </span>
          </div>

          {/* Quick % buttons */}
          <div style={{ display: 'flex', gap: 6 }}>
            {[10, 25, 50, 100].map(pct => (
              <button key={pct} onClick={() => setPercent(pct)}
                style={{ flex: 1, padding: '8px 0', borderRadius: 10, background: 'var(--raised)', border: '1px solid var(--line)', color: 'var(--t2)', fontSize: 12, fontWeight: 600, cursor: 'pointer', transition: 'background .12s, color .12s' }}
                onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.background = 'var(--blue)'; el.style.color = '#fff'; el.style.borderColor = 'var(--blue)'; }}
                onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.background = 'var(--raised)'; el.style.color = 'var(--t2)'; el.style.borderColor = 'var(--line)'; }}
              >
                {pct === 100 ? '최대' : `${pct}%`}
              </button>
            ))}
          </div>

          {/* Order summary */}
          <div style={{ background: 'var(--raised)', borderRadius: 14, padding: '16px 18px', border: '1px solid var(--line)', display: 'flex', flexDirection: 'column', gap: 10 }}>
            {[
              { label: '주문 유형', val: orderType === 'market' ? '시장가' : `지정가 (${limitPrice.toLocaleString()} 🌽)` },
              { label: '주문 수량', val: `${finalQty}주` },
              { label: '주문 단가', val: `${execPrice.toLocaleString()} 🌽` },
            ].map(r => (
              <div key={r.label} style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontSize: 13, color: 'var(--t2)' }}>{r.label}</span>
                <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--t1)', fontVariantNumeric: 'tabular-nums' }}>{r.val}</span>
              </div>
            ))}
            <div style={{ borderTop: '1px solid var(--line)', paddingTop: 10, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--t1)' }}>{isBuy ? '총 매수금액' : '총 매도금액'}</span>
              <span style={{ fontSize: 16, fontWeight: 800, color: actionColor, fontVariantNumeric: 'tabular-nums' }}>
                {isBuy ? '−' : '+'}{total.toLocaleString()} 🌽
              </span>
            </div>
            {!isBuy && holding && finalQty > 0 && (
              <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid var(--line)', paddingTop: 10 }}>
                <span style={{ fontSize: 13, color: 'var(--t2)' }}>예상 손익</span>
                <span style={{ fontSize: 13, fontWeight: 700, color: pnlOnSell >= 0 ? 'var(--up)' : 'var(--down)', fontVariantNumeric: 'tabular-nums' }}>
                  {pnlOnSell >= 0 ? '+' : ''}{pnlOnSell.toLocaleString()} 🌽
                  <span style={{ fontSize: 11, marginLeft: 4, opacity: 0.8 }}>({pnlOnSell >= 0 ? '+' : ''}{pnlPct.toFixed(2)}%)</span>
                </span>
              </div>
            )}
          </div>

          {/* Error */}
          {error && (
            <div style={{ background: 'rgba(240,68,82,0.1)', border: '1px solid rgba(240,68,82,0.25)', borderRadius: 10, padding: '10px 16px', fontSize: 13, color: 'var(--up)', fontWeight: 500 }}>
              {error}
            </div>
          )}

          {/* CTA */}
          <button onClick={handleTrade} disabled={disabled}
            style={{
              width: '100%', padding: '16px 0', borderRadius: 999, border: 'none',
              cursor: disabled ? 'not-allowed' : 'pointer',
              background: disabled ? 'var(--raised)' : (isBuy ? 'var(--up)' : 'var(--down)'),
              color: disabled ? 'var(--t3)' : '#fff',
              fontWeight: 800, fontSize: 16, opacity: disabled ? 0.6 : 1,
              boxShadow: disabled ? 'none' : (isBuy ? '0 4px 18px rgba(255,77,106,0.35)' : '0 4px 18px rgba(49,130,246,0.35)'),
              transition: 'opacity .15s, transform .1s',
            }}
            onMouseEnter={e => { if (!disabled) { const el = e.currentTarget as HTMLElement; el.style.opacity = '0.87'; el.style.transform = 'translateY(-1px)'; } }}
            onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.opacity = disabled ? '0.6' : '1'; el.style.transform = ''; }}
          >
            {orderType === 'market' ? '시장가 ' : '지정가 '}
            {isBuy ? `${finalQty}주 매수 주문` : `${finalQty}주 매도 주문`}
            <span style={{ fontSize: 13, fontWeight: 600, marginLeft: 8, opacity: 0.85 }}>({total.toLocaleString()} 🌽)</span>
          </button>
        </div>
      </div>
    </div>
  );
}
