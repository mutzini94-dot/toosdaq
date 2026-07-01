import { Transaction, Dividend } from '../types';

interface Props {
  transactions: Transaction[];
  dividends: Dividend[];
}

function TypeBadge({ type }: { type: 'buy' | 'sell' | 'dividend' }) {
  const styles = {
    buy:      { bg: 'rgba(240,68,82,0.12)',   color: 'var(--up)',   label: '매수' },
    sell:     { bg: 'rgba(123,102,255,0.12)',  color: 'var(--down)', label: '매도' },
    dividend: { bg: 'rgba(123,102,255,0.12)',  color: 'var(--blue)', label: '배당' },
  };
  const s = styles[type];
  return (
    <span style={{ background: s.bg, color: s.color, borderRadius: 999, fontSize: 11, fontWeight: 700, padding: '3px 10px', whiteSpace: 'nowrap' }}>
      {s.label}
    </span>
  );
}

function StatCard({ label, value, color }: { label: string; value: string; color?: string }) {
  return (
    <div className="card" style={{ padding: '18px 20px' }}>
      <div style={{ fontSize: 12, color: 'var(--t2)', marginBottom: 8 }}>{label}</div>
      <div style={{ fontSize: 20, fontWeight: 800, color: color ?? 'var(--t1)', fontVariantNumeric: 'tabular-nums', letterSpacing: '-0.5px' }}>
        {value}
      </div>
    </div>
  );
}

export default function TransactionHistory({ transactions, dividends }: Props) {
  const all = [
    ...transactions.map(t => ({ ...t, kind: 'tx'  as const })),
    ...dividends.map(d => ({ ...d, kind: 'div' as const, type: 'dividend' as const })),
  ].sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

  const totalBought = transactions.filter(t => t.type === 'buy').reduce((s, t) => s + t.total, 0);
  const totalSold   = transactions.filter(t => t.type === 'sell').reduce((s, t) => s + t.total, 0);
  const totalDiv    = dividends.reduce((s, d) => s + d.amount, 0);

  const fmt = (d: Date) =>
    `${d.getFullYear()}.${String(d.getMonth()+1).padStart(2,'0')}.${String(d.getDate()).padStart(2,'0')} ${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}`;

  return (
    <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>

      {/* Summary */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
        <StatCard label="총 매수금액" value={`${totalBought.toLocaleString()} 🌽`} color="var(--up)"   />
        <StatCard label="총 매도금액" value={`${totalSold.toLocaleString()} 🌽`}   color="var(--down)" />
        <StatCard label="총 배당금"   value={`${totalDiv.toLocaleString()} 🌽`}    color="var(--blue)" />
      </div>

      {/* Table */}
      <div className="card" style={{ overflow: 'hidden' }}>
        <div style={{ padding: '18px 24px', borderBottom: '1px solid var(--line)' }}>
          <div style={{ fontWeight: 800, fontSize: 16, color: 'var(--t1)' }}>전체 거래내역</div>
          <div style={{ fontSize: 12, color: 'var(--t3)', marginTop: 3 }}>총 {all.length}건</div>
        </div>

        {all.length === 0 ? (
          <div style={{ padding: '64px 0', textAlign: 'center' }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>📋</div>
            <div style={{ color: 'var(--t2)', fontWeight: 600 }}>거래 내역이 없습니다</div>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--line)', background: 'var(--raised)' }}>
                  {[
                    { label: '일시',      align: 'left'  },
                    { label: '구분',      align: 'left'  },
                    { label: '크리에이터', align: 'left'  },
                    { label: '단가',      align: 'right' },
                    { label: '수량',      align: 'right' },
                    { label: '금액',      align: 'right' },
                  ].map(h => (
                    <th key={h.label} style={{ padding: '10px 16px', fontSize: 11, color: 'var(--t2)', fontWeight: 600, textAlign: h.align as 'left'|'right', whiteSpace: 'nowrap' }}>
                      {h.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {all.map(entry => {
                  if (entry.kind === 'div') {
                    return (
                      <tr
                        key={entry.id}
                        style={{ borderBottom: '1px solid var(--line)', transition: 'background .12s' }}
                        onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'var(--hover-bg)'; }}
                        onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = ''; }}
                      >
                        <td style={{ padding: '14px 16px', fontSize: 12, color: 'var(--t3)', whiteSpace: 'nowrap' }}>{fmt(entry.timestamp)}</td>
                        <td style={{ padding: '14px 16px' }}><TypeBadge type="dividend" /></td>
                        <td style={{ padding: '14px 16px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <span style={{ fontSize: 18 }}>{entry.creatorEmoji}</span>
                            <span style={{ fontWeight: 600, fontSize: 14, color: 'var(--t1)' }}>{entry.creatorName}</span>
                          </div>
                        </td>
                        <td style={{ padding: '14px 16px', textAlign: 'right', fontSize: 13, color: 'var(--t3)' }}>—</td>
                        <td style={{ padding: '14px 16px', textAlign: 'right', fontSize: 13, color: 'var(--t3)' }}>—</td>
                        <td style={{ padding: '14px 16px', textAlign: 'right', fontWeight: 700, fontSize: 14, color: 'var(--blue)', fontVariantNumeric: 'tabular-nums' }}>
                          +{entry.amount.toLocaleString()} 🌽
                        </td>
                      </tr>
                    );
                  }

                  const tx = entry as Transaction & { kind: 'tx' };
                  const isBuy = tx.type === 'buy';
                  const amtColor = isBuy ? 'var(--up)' : 'var(--down)';
                  return (
                    <tr
                      key={tx.id}
                      style={{ borderBottom: '1px solid var(--line)', transition: 'background .12s' }}
                      onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'var(--hover-bg)'; }}
                      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = ''; }}
                    >
                      <td style={{ padding: '14px 16px', fontSize: 12, color: 'var(--t3)', whiteSpace: 'nowrap' }}>{fmt(tx.timestamp)}</td>
                      <td style={{ padding: '14px 16px' }}><TypeBadge type={tx.type} /></td>
                      <td style={{ padding: '14px 16px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <span style={{ fontSize: 18 }}>{tx.creatorEmoji}</span>
                          <span style={{ fontWeight: 600, fontSize: 14, color: 'var(--t1)' }}>{tx.creatorName}</span>
                        </div>
                      </td>
                      <td style={{ padding: '14px 16px', textAlign: 'right', fontSize: 13, color: 'var(--t2)', fontVariantNumeric: 'tabular-nums' }}>
                        {tx.price.toLocaleString()} 🌽
                      </td>
                      <td style={{ padding: '14px 16px', textAlign: 'right', fontSize: 13, color: 'var(--t2)', fontVariantNumeric: 'tabular-nums' }}>
                        {tx.quantity}주
                      </td>
                      <td style={{ padding: '14px 16px', textAlign: 'right', fontWeight: 700, fontSize: 14, color: amtColor, fontVariantNumeric: 'tabular-nums' }}>
                        {isBuy ? '-' : '+'}{tx.total.toLocaleString()} 🌽
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
