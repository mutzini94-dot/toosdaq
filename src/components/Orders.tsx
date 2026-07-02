import { Order } from '../types';

interface Props {
  orders: Order[];
  onCancelOrder: (orderId: string) => void;
}

function fmt(n: number) { return n.toLocaleString(); }

function timeAgo(d: Date) {
  const sec = Math.floor((Date.now() - new Date(d).getTime()) / 1000);
  if (sec < 60) return `${sec}초 전`;
  if (sec < 3600) return `${Math.floor(sec / 60)}분 전`;
  return `${Math.floor(sec / 3600)}시간 전`;
}

function OrderRow({ order, onCancel }: { order: Order; onCancel?: () => void }) {
  const isBuy = order.type === 'buy';
  const isPending = order.status === 'pending';
  const isFilled = order.status === 'filled';

  const statusColor = isPending ? 'var(--t2)' : isFilled ? 'var(--up)' : 'var(--t3)';
  const statusLabel = isPending ? '대기중' : isFilled ? '체결완료' : '취소됨';
  const typeColor   = isBuy ? 'var(--up)' : 'var(--down)';
  const typeBg      = isBuy ? 'rgba(255,77,106,0.1)' : 'rgba(49,130,246,0.1)';

  return (
    <div style={{
      background: 'var(--surface)',
      borderRadius: 18,
      padding: '18px 20px',
      display: 'flex',
      flexDirection: 'column',
      gap: 12,
      border: isPending ? '1.5px solid var(--purple-light)' : '1px solid var(--line)',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* 미체결 좌측 강조 바 */}
      {isPending && (
        <div style={{
          position: 'absolute', left: 0, top: 0, bottom: 0, width: 4,
          background: 'var(--purple-grad)', borderRadius: '18px 0 0 18px',
        }} />
      )}

      {/* 상단 행 */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: 28 }}>{order.creatorEmoji}</span>
          <div>
            <div style={{ fontWeight: 700, fontSize: 15, color: 'var(--t1)' }}>{order.creatorName}</div>
            <div style={{ fontSize: 12, color: 'var(--t2)', marginTop: 2 }}>
              {timeAgo(order.timestamp)}
            </div>
          </div>
        </div>

        {/* 상태 + 타입 뱃지 */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{
            background: typeBg, color: typeColor,
            borderRadius: 999, padding: '3px 10px',
            fontSize: 12, fontWeight: 800,
          }}>
            {isBuy ? '매수' : '매도'}
          </span>
          <span style={{
            background: 'var(--raised)', color: statusColor,
            borderRadius: 999, padding: '3px 10px',
            fontSize: 12, fontWeight: 700,
          }}>
            {isPending && <span style={{ display: 'inline-block', width: 6, height: 6, borderRadius: '50%', background: 'var(--blue)', marginRight: 5, animation: 'pulse 1.4s infinite' }} />}
            {statusLabel}
          </span>
        </div>
      </div>

      {/* 주문 정보 그리드 */}
      <div style={{
        background: 'var(--raised)', borderRadius: 12,
        padding: '14px 16px',
        display: 'grid', gridTemplateColumns: '1fr 1fr 1fr',
        gap: 12,
      }}>
        <div>
          <div style={{ fontSize: 11, color: 'var(--t3)', marginBottom: 4 }}>주문 유형</div>
          <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--t1)' }}>
            {order.orderType === 'market' ? '⚡ 시장가' : '📋 지정가'}
          </div>
        </div>
        <div>
          <div style={{ fontSize: 11, color: 'var(--t3)', marginBottom: 4 }}>수량</div>
          <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--t1)', fontVariantNumeric: 'tabular-nums' }}>
            {order.quantity}주
          </div>
        </div>
        <div>
          <div style={{ fontSize: 11, color: 'var(--t3)', marginBottom: 4 }}>
            {isFilled ? '체결 단가' : '주문 단가'}
          </div>
          <div style={{ fontSize: 13, fontWeight: 700, color: isFilled ? typeColor : 'var(--t1)', fontVariantNumeric: 'tabular-nums' }}>
            {fmt(isFilled && order.filledPrice ? order.filledPrice : order.limitPrice)} 🌽
          </div>
        </div>
        {isFilled && order.filledPrice && (
          <>
            <div style={{ gridColumn: '1 / -1', height: 1, background: 'var(--line)', margin: '4px 0' }} />
            <div style={{ gridColumn: '1 / 3' }}>
              <div style={{ fontSize: 11, color: 'var(--t3)', marginBottom: 4 }}>체결 총액</div>
              <div style={{ fontSize: 15, fontWeight: 800, color: typeColor, fontVariantNumeric: 'tabular-nums' }}>
                {isBuy ? '−' : '+'}{fmt(order.filledPrice * order.quantity)} 🌽
              </div>
            </div>
            <div>
              <div style={{ fontSize: 11, color: 'var(--t3)', marginBottom: 4 }}>체결 시각</div>
              <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--t2)' }}>
                {order.filledAt ? timeAgo(order.filledAt) : '-'}
              </div>
            </div>
          </>
        )}
      </div>

      {/* 취소 버튼 */}
      {isPending && onCancel && (
        <button
          onClick={onCancel}
          style={{
            width: '100%', padding: '11px 0',
            border: '1.5px solid var(--line)',
            background: 'var(--surface)', color: 'var(--t2)',
            borderRadius: 999, fontSize: 14, fontWeight: 700,
            cursor: 'pointer', transition: 'all .15s',
          }}
          onMouseEnter={e => {
            (e.currentTarget as HTMLElement).style.borderColor = 'var(--down)';
            (e.currentTarget as HTMLElement).style.color = 'var(--down)';
          }}
          onMouseLeave={e => {
            (e.currentTarget as HTMLElement).style.borderColor = 'var(--line)';
            (e.currentTarget as HTMLElement).style.color = 'var(--t2)';
          }}
        >
          주문 취소
        </button>
      )}
    </div>
  );
}

export default function Orders({ orders, onCancelOrder }: Props) {
  const pending  = orders.filter(o => o.status === 'pending');
  const filled   = orders.filter(o => o.status === 'filled').slice(0, 20);
  const cancelled = orders.filter(o => o.status === 'cancelled').slice(0, 10);

  return (
    <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

      {/* ── 미체결 주문 ── */}
      <section>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ fontWeight: 800, fontSize: 18, color: 'var(--t1)' }}>미체결 주문</div>
            {pending.length > 0 && (
              <span style={{
                background: 'var(--purple-grad)', color: '#fff',
                borderRadius: 999, padding: '2px 10px',
                fontSize: 12, fontWeight: 800,
              }}>{pending.length}</span>
            )}
          </div>
          {pending.length > 0 && (
            <div style={{ fontSize: 12, color: 'var(--t3)' }}>
              <span style={{ display: 'inline-block', width: 6, height: 6, borderRadius: '50%', background: 'var(--blue)', marginRight: 5, animation: 'pulse 1.4s infinite' }} />
              체결 대기중
            </div>
          )}
        </div>

        {pending.length === 0 ? (
          <div style={{
            background: 'var(--surface)', borderRadius: 18, padding: '40px 20px',
            textAlign: 'center', border: '1.5px dashed var(--line)',
          }}>
            <div style={{ fontSize: 36, marginBottom: 10 }}>📋</div>
            <div style={{ fontSize: 15, color: 'var(--t2)', fontWeight: 600 }}>미체결 주문 없음</div>
            <div style={{ fontSize: 13, color: 'var(--t3)', marginTop: 4 }}>시장 탭에서 매수/매도 주문을 넣어보세요</div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {pending.map(o => (
              <OrderRow key={o.id} order={o} onCancel={() => onCancelOrder(o.id)} />
            ))}
          </div>
        )}
      </section>

      {/* ── 체결 완료 ── */}
      {filled.length > 0 && (
        <section>
          <div style={{ fontWeight: 800, fontSize: 18, color: 'var(--t1)', marginBottom: 12 }}>
            체결 완료
            <span style={{ fontSize: 13, color: 'var(--t2)', fontWeight: 500, marginLeft: 8 }}>(최근 20건)</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {filled.map(o => <OrderRow key={o.id} order={o} />)}
          </div>
        </section>
      )}

      {/* ── 취소된 주문 ── */}
      {cancelled.length > 0 && (
        <section>
          <div style={{ fontWeight: 800, fontSize: 18, color: 'var(--t1)', marginBottom: 12 }}>
            취소된 주문
            <span style={{ fontSize: 13, color: 'var(--t2)', fontWeight: 500, marginLeft: 8 }}>(최근 10건)</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {cancelled.map(o => <OrderRow key={o.id} order={o} />)}
          </div>
        </section>
      )}
    </div>
  );
}
