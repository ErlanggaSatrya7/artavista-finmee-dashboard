import * as React from 'react';
import { ShoppingCart, Search, Filter, ArrowRight } from 'lucide-react';
import { ISalesData, ISharedViewProps } from './types';

interface ITransactionsViewProps extends ISharedViewProps {
    contents: ISalesData[];
    isEmpty: boolean;
    isMobile?: boolean;
}

export const TransactionsView: React.FC<ITransactionsViewProps> = ({
    contents, isEmpty, onAction, navigate, isMobile
}) => {
    const [searchTerm, setSearchTerm] = React.useState('');

    const filtered = contents.filter(c =>
        c.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.platform.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.status.toLowerCase().includes(searchTerm.toLowerCase())
    );

    let paidCount = 0, pendingCount = 0, cancelCount = 0;
    contents.forEach(c => {
        const s = c.status.toLowerCase();
        if (s === 'paid' || s === 'lunas' || s === 'success' || s === 'selesai') paidCount++;
        else if (s === 'proses' || s === 'pending') pendingCount++;
        else if (s === 'cancelled' || s === 'failed' || s === 'gagal') cancelCount++;
    });

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '18px', width: '100%' }}>

            {/* Page Header */}
            <div style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', justifyContent: 'space-between', alignItems: isMobile ? 'flex-start' : 'center', gap: '12px' }}>
                <div>
                    <h2 style={PAGE_TITLE}>Riwayat Transaksi</h2>
                    <p style={PAGE_SUBTITLE}>
                        {contents.length > 0
                            ? `${contents.length} transaksi berhasil dimuat dari Power Apps`
                            : 'Kelola dan pantau semua transaksi penjualan Artavista'}
                    </p>
                </div>
                <button
                    onClick={() => onAction('ADD_TRANSACTION')}
                    style={PRIMARY_BTN}
                >
                    + Tambah Transaksi
                </button>
            </div>

            {/* Summary Cards */}
            {!isEmpty && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(110px, 1fr))', gap: '12px' }}>
                    <SummaryCard label="Lunas" value={paidCount} color="#059669" bg="#ECFDF5" />
                    <SummaryCard label="Pending" value={pendingCount} color="#D97706" bg="#FFFBEB" />
                    <SummaryCard label="Batal" value={cancelCount} color="#DC2626" bg="#FEF2F2" />
                    <SummaryCard label="Total" value={contents.length} color="#054CC7" bg="#EEF4FF" />
                </div>
            )}

            {/* Search + Table */}
            <div style={CARD_STYLE}>
                {/* Search Bar */}
                <div style={{
                    display: 'flex', gap: '10px', marginBottom: '16px',
                    flexDirection: isMobile ? 'column' : 'row',
                }}>
                    <div style={{
                        flex: 1, display: 'flex', alignItems: 'center', gap: '8px',
                        background: '#F8FAFC', border: '1px solid #E2E8F0',
                        borderRadius: '10px', padding: '10px 14px',
                    }}>
                        <Search size={14} color="#94A3B8" />
                        <input
                            type="text"
                            placeholder="Cari transaksi, klien, atau status..."
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                            style={{
                                border: 'none', outline: 'none', background: 'transparent',
                                fontSize: '13px', color: '#334155', flex: 1, fontFamily: 'inherit',
                            }}
                        />
                    </div>
                    <button style={{
                        display: 'flex', alignItems: 'center', gap: '6px',
                        background: '#F8FAFC', border: '1px solid #E2E8F0',
                        borderRadius: '10px', padding: '10px 16px',
                        color: '#64748B', cursor: 'pointer', fontSize: '13px',
                        fontFamily: 'inherit', whiteSpace: 'nowrap',
                    }}>
                        <Filter size={14} /> Filter
                    </button>
                </div>

                {/* Table */}
                <div style={{ overflowX: 'auto' }}>
                    {isEmpty ? (
                        <EmptyState
                            icon={<ShoppingCart size={48} color="#CBD5E1" />}
                            title="Belum Ada Transaksi"
                            desc="Data transaksi dari Power Apps akan muncul di sini secara otomatis"
                            action={{ label: 'Tambah Transaksi Pertama', onClick: () => onAction('ADD_TRANSACTION') }}
                        />
                    ) : filtered.length === 0 ? (
                        <EmptyState
                            icon={<Search size={48} color="#CBD5E1" />}
                            title={`Tidak ada hasil untuk "${searchTerm}"`}
                            desc="Coba kata kunci yang berbeda"
                        />
                    ) : (
                        <table style={{ width: '100%', minWidth: '500px', borderCollapse: 'collapse', fontSize: '13px' }}>
                            <thead>
                                <tr style={{ background: '#F8FAFC', borderRadius: '8px' }}>
                                    {['#', 'Layanan / Produk', 'Klien', 'Tanggal', 'Status'].map((h, i) => (
                                        <th key={h} style={{
                                            padding: '10px 14px',
                                            color: '#64748B', fontSize: '11px', fontWeight: 700,
                                            textTransform: 'uppercase', letterSpacing: '0.5px',
                                            textAlign: i > 3 ? 'right' : 'left',
                                            borderBottom: '2px solid #EEF2F9',
                                        }}>{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {filtered.map((item, i) => (
                                    <tr
                                        key={item.id || i}
                                        onClick={() => onAction('VIEW_TRANSACTION', item.id)}
                                        style={{ borderBottom: '1px solid #F7F9FC', cursor: 'pointer', transition: 'background 0.15s' }}
                                        onMouseEnter={e => (e.currentTarget as HTMLTableRowElement).style.background = '#FAFCFF'}
                                        onMouseLeave={e => (e.currentTarget as HTMLTableRowElement).style.background = 'transparent'}
                                    >
                                        <td style={{ padding: '13px 14px', color: '#94A3B8', fontSize: '12px', fontWeight: 600 }}>
                                            {String(i + 1).padStart(2, '0')}
                                        </td>
                                        <td style={{ padding: '13px 14px', fontWeight: 600, color: '#1E293B', textAlign: 'left' }}>
                                            {item.title}
                                        </td>
                                        <td style={{ padding: '13px 14px', color: '#64748B', textAlign: 'left' }}>
                                            {item.platform}
                                        </td>
                                        <td style={{ padding: '13px 14px', color: '#94A3B8', fontSize: '12px', textAlign: 'left' }}>
                                            {item.date || '—'}
                                        </td>
                                        <td style={{ padding: '13px 14px', textAlign: 'right' }}>
                                            <StatusBadge status={item.status} />
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>
        </div>
    );
};

/* ── SHARED STYLES ── */
const CARD_STYLE: React.CSSProperties = {
    background: 'white',
    borderRadius: '16px',
    padding: '20px',
    boxShadow: '0 2px 12px rgba(0,0,0,0.04)',
    border: '1px solid #EEF2F9',
};

const PAGE_TITLE: React.CSSProperties = {
    margin: '0 0 4px 0', fontSize: '20px', fontWeight: 800, color: '#1E293B', textAlign: 'left',
};
const PAGE_SUBTITLE: React.CSSProperties = {
    margin: 0, fontSize: '13px', color: '#64748B', textAlign: 'left',
};
const PRIMARY_BTN: React.CSSProperties = {
    background: '#054CC7', color: 'white', border: 'none',
    padding: '10px 18px', borderRadius: '10px', fontWeight: 600,
    cursor: 'pointer', fontSize: '13px', fontFamily: 'inherit',
    whiteSpace: 'nowrap', flexShrink: 0,
};

/* ── SUB COMPONENTS ── */
const SummaryCard = ({ label, value, color, bg }: { label: string; value: number; color: string; bg: string }) => (
    <div style={{
        background: 'white', borderRadius: '12px', padding: '14px 16px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.04)', border: '1px solid #EEF2F9',
    }}>
        <div style={{ fontSize: '22px', fontWeight: 800, color, textAlign: 'left' }}>{value}</div>
        <div style={{ fontSize: '11.5px', color: '#64748B', fontWeight: 600, textAlign: 'left', marginTop: '3px' }}>{label}</div>
        <div style={{ height: '3px', background: bg, borderRadius: '3px', marginTop: '8px', overflow: 'hidden' }}>
            <div style={{ width: '100%', height: '100%', background: color, borderRadius: '3px', opacity: 0.7 }} />
        </div>
    </div>
);

const StatusBadge = ({ status }: { status: string }) => {
    let bg = '#F1F5F9', color = '#64748B';
    const s = status.toLowerCase();
    if (['paid', 'lunas', 'success', 'selesai'].includes(s)) { bg = '#DCFCE7'; color = '#15803D'; }
    else if (['proses', 'pending'].includes(s)) { bg = '#FEF3C7'; color = '#B45309'; }
    else if (['cancelled', 'failed', 'gagal'].includes(s)) { bg = '#FEE2E2'; color = '#B91C1C'; }
    return (
        <span style={{ background: bg, color, padding: '3px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: 700, whiteSpace: 'nowrap' }}>
            {status}
        </span>
    );
};

const EmptyState = ({ icon, title, desc, action }: {
    icon: React.ReactNode; title: string; desc?: string;
    action?: { label: string; onClick: () => void };
}) => (
    <div style={{ padding: '48px 20px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
        {icon}
        <h4 style={{ margin: '8px 0 0 0', color: '#475569', fontSize: '15px', fontWeight: 700, textAlign: 'center' }}>{title}</h4>
        {desc && <p style={{ margin: 0, color: '#94A3B8', fontSize: '13px', textAlign: 'center', maxWidth: '280px' }}>{desc}</p>}
        {action && (
            <button
                onClick={action.onClick}
                style={{ ...PRIMARY_BTN, marginTop: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}
            >
                {action.label} <ArrowRight size={14} />
            </button>
        )}
    </div>
);