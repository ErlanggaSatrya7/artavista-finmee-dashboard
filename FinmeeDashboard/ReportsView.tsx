import * as React from 'react';
import { TrendingUp, DollarSign, ShoppingCart, Award, ArrowUp, ArrowDown, Minus } from 'lucide-react';
import { ISalesData, IProductData, ICustomerData, ISharedViewProps } from './types';

interface IReportsViewProps extends ISharedViewProps {
    contents: ISalesData[];
    products: IProductData[];
    customers: ICustomerData[];
    isMobile?: boolean;
}

// ─── Helpers ────────────────────────────────────────────────
const parseAmount = (val: string | undefined): number => {
    if (!val) return 0;
    const cleaned = val.replace(/[Rp\s.,\u00A0]/g, '').replace(',', '');
    return parseFloat(cleaned) || 0;
};

const formatRp = (val: number): string => {
    if (val >= 1_000_000_000) return `Rp ${(val / 1_000_000_000).toFixed(1)}M`;
    if (val >= 1_000_000)     return `Rp ${(val / 1_000_000).toFixed(1)}jt`;
    if (val >= 1_000)         return `Rp ${(val / 1_000).toFixed(0)}rb`;
    return `Rp ${val}`;
};

const formatShortY = (val: number): string => {
    if (val >= 1_000_000) return `${(val / 1_000_000).toFixed(0)}jt`;
    if (val >= 1_000)     return `${(val / 1_000).toFixed(0)}rb`;
    return String(val);
};

const MONTHS_ID = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun',
    'Jul', 'Ags', 'Sep', 'Okt', 'Nov', 'Des'];

const parseDate = (str: string): Date | null => {
    if (!str || str === '-') return null;
    const d = new Date(str);
    if (!isNaN(d.getTime())) return d;
    const p = str.split('/');
    if (p.length === 3) {
        const d2 = new Date(`${p[2]}-${p[1].padStart(2, '0')}-${p[0].padStart(2, '0')}`);
        if (!isNaN(d2.getTime())) return d2;
    }
    return null;
};

// Get last N months data
const getMonthlyRevenue = (contents: ISalesData[], n = 6): { label: string; value: number }[] => {
    const now = new Date();
    const months = Array.from({ length: n }, (_, i) => {
        const d = new Date(now.getFullYear(), now.getMonth() - (n - 1 - i), 1);
        return { label: MONTHS_ID[d.getMonth()], year: d.getFullYear(), month: d.getMonth(), value: 0 };
    });
    contents.forEach(c => {
        const d = parseDate(c.date);
        if (!d) return;
        const m = months.find(x => x.year === d.getFullYear() && x.month === d.getMonth());
        if (m) m.value += parseAmount(c.amount);
    });
    return months;
};

// ════════════════════════════════════════════════════════════
//  MAIN COMPONENT
// ════════════════════════════════════════════════════════════
export const ReportsView: React.FC<IReportsViewProps> = ({
    contents, products, customers, onAction, navigate, isMobile, userRole
}) => {
    const [period, setPeriod] = React.useState<6 | 12>(6);

    // ── Compute Metrics ──────────────────────────────────────
    const totalOmzet = contents.reduce((sum, c) => sum + parseAmount(c.amount), 0);
    const lunasCount = contents.filter(c => {
        const s = c.status.toLowerCase();
        return s === 'lunas' || s === 'paid' || s === 'selesai' || s === 'success';
    }).length;
    const lunasRate = contents.length === 0 ? 0 : Math.round((lunasCount / contents.length) * 100);
    const avgDeal = contents.length === 0 ? 0 : totalOmzet / contents.length;

    // Prev month vs current month comparison
    const now = new Date();
    const currMonthRevenue = contents.filter(c => {
        const d = parseDate(c.date);
        return d && d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    }).reduce((s, c) => s + parseAmount(c.amount), 0);
    const prevMonthRevenue = contents.filter(c => {
        const d = parseDate(c.date);
        const prev = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        return d && d.getMonth() === prev.getMonth() && d.getFullYear() === prev.getFullYear();
    }).reduce((s, c) => s + parseAmount(c.amount), 0);
    const momChange = prevMonthRevenue === 0 ? null
        : Math.round(((currMonthRevenue - prevMonthRevenue) / prevMonthRevenue) * 100);

    // Monthly chart data
    const monthlyData = getMonthlyRevenue(contents, period);

    // Top Products (by sold count)
    const topProducts = [...products]
        .sort((a, b) => (parseInt(b.sold) || 0) - (parseInt(a.sold) || 0))
        .slice(0, 5);

    // Top Clients (by spent)
    const topClients = [...customers]
        .sort((a, b) => parseAmount(b.spent) - parseAmount(a.spent))
        .slice(0, 5);

    // Status distribution
    const statusDist = ['Lunas', 'Pending', 'Batal'].map(label => {
        const keywords: Record<string, string[]> = {
            'Lunas': ['lunas', 'paid', 'selesai', 'success'],
            'Pending': ['pending', 'proses'],
            'Batal': ['batal', 'cancelled', 'failed', 'gagal'],
        };
        const count = contents.filter(c => keywords[label].includes(c.status.toLowerCase())).length;
        return { label, count, pct: contents.length ? Math.round((count / contents.length) * 100) : 0 };
    });

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '18px', width: '100%' }}>

            {/* Page Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: isMobile ? 'flex-start' : 'center', flexDirection: isMobile ? 'column' : 'row', gap: '12px' }}>
                <div>
                    <h2 style={PAGE_TITLE}>Laporan & Analitik</h2>
                    <p style={PAGE_SUBTITLE}>
                        {contents.length > 0
                            ? `Analisis dari ${contents.length} transaksi yang tercatat`
                            : 'Ringkasan performa bisnis Artavista'}
                    </p>
                </div>
                {/* Period Toggle */}
                <div style={{ display: 'flex', background: '#F1F5F9', borderRadius: '10px', padding: '3px', gap: '2px', flexShrink: 0 }}>
                    {([6, 12] as const).map(p => (
                        <button key={p} onClick={() => setPeriod(p)} style={{
                            padding: '7px 16px', borderRadius: '8px', border: 'none',
                            background: period === p ? 'white' : 'transparent',
                            color: period === p ? '#054CC7' : '#64748B',
                            fontWeight: period === p ? 700 : 500, fontSize: '12.5px',
                            cursor: 'pointer', fontFamily: 'inherit',
                            boxShadow: period === p ? '0 1px 4px rgba(0,0,0,0.08)' : 'none',
                        }}>
                            {p} Bulan
                        </button>
                    ))}
                </div>
            </div>

            {/* ── Metric Cards ── */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '12px' }}>
                <MetricCard
                    label="Total Omzet" value={formatRp(totalOmzet)}
                    sub={momChange !== null
                        ? `${momChange >= 0 ? '+' : ''}${momChange}% vs bulan lalu`
                        : 'Semua transaksi'}
                    icon={<DollarSign size={16} color="#054CC7" />} bg="#EEF4FF"
                    trend={momChange}
                />
                <MetricCard
                    label="Omzet Bulan Ini" value={formatRp(currMonthRevenue)}
                    sub={`${MONTHS_ID[now.getMonth()]} ${now.getFullYear()}`}
                    icon={<TrendingUp size={16} color="#7C3AED" />} bg="#F3F0FF"
                    trend={momChange}
                />
                <MetricCard
                    label="Rata-rata / Deal" value={formatRp(avgDeal)}
                    sub={`dari ${contents.length} transaksi`}
                    icon={<ShoppingCart size={16} color="#059669" />} bg="#ECFDF5"
                />
                <MetricCard
                    label="Lunas Rate" value={`${lunasRate}%`}
                    sub={`${lunasCount} dari ${contents.length} transaksi`}
                    icon={<Award size={16} color="#D97706" />} bg="#FFFBEB"
                />
            </div>

            {/* ── Bar Chart ── */}
            <div style={CARD_STYLE}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                    <div>
                        <h3 style={{ margin: '0 0 3px 0', fontSize: '15px', fontWeight: 700, color: '#1E293B', textAlign: 'left' }}>
                            Grafik Pendapatan
                        </h3>
                        <p style={{ margin: 0, fontSize: '12px', color: '#94A3B8', textAlign: 'left' }}>
                            {period} bulan terakhir
                        </p>
                    </div>
                    {momChange !== null && (
                        <div style={{
                            display: 'flex', alignItems: 'center', gap: '4px',
                            background: momChange >= 0 ? '#DCFCE7' : '#FEE2E2',
                            color: momChange >= 0 ? '#15803D' : '#DC2626',
                            padding: '5px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: 700,
                        }}>
                            {momChange >= 0 ? <ArrowUp size={13} /> : <ArrowDown size={13} />}
                            {Math.abs(momChange)}% MoM
                        </div>
                    )}
                </div>
                <RevenueBarChart data={monthlyData} isMobile={isMobile} />
            </div>

            {/* ── Status Distribution ── */}
            <div style={CARD_STYLE}>
                <h3 style={{ margin: '0 0 14px 0', fontSize: '14px', fontWeight: 700, color: '#1E293B', textAlign: 'left' }}>
                    Distribusi Status Pembayaran
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {statusDist.map(sd => {
                        const colors: Record<string, { bar: string; text: string }> = {
                            'Lunas':   { bar: '#10B981', text: '#15803D' },
                            'Pending': { bar: '#F59E0B', text: '#B45309' },
                            'Batal':   { bar: '#EF4444', text: '#DC2626' },
                        };
                        const c = colors[sd.label] || { bar: '#94A3B8', text: '#64748B' };
                        return (
                            <div key={sd.label}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                                    <span style={{ fontSize: '13px', color: '#475569', fontWeight: 600, textAlign: 'left' }}>{sd.label}</span>
                                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                        <span style={{ fontSize: '13px', fontWeight: 700, color: c.text }}>{sd.pct}%</span>
                                        <span style={{ fontSize: '11px', color: '#94A3B8' }}>({sd.count} transaksi)</span>
                                    </div>
                                </div>
                                <div style={{ height: '8px', background: '#F0F4FB', borderRadius: '8px', overflow: 'hidden' }}>
                                    <div style={{ width: `${sd.pct}%`, height: '100%', background: c.bar, borderRadius: '8px', transition: 'width 0.5s' }} />
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* ── Bottom: Top Products + Top Clients ── */}
            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '14px' }}>

                {/* Top Products */}
                <div style={CARD_STYLE}>
                    <h3 style={{ margin: '0 0 14px 0', fontSize: '14px', fontWeight: 700, color: '#1E293B', textAlign: 'left' }}>
                        🏆 Top Layanan Terlaris
                    </h3>
                    {topProducts.length === 0 ? (
                        <p style={{ color: '#94A3B8', fontSize: '13px', textAlign: 'center', padding: '20px 0', margin: 0 }}>
                            Belum ada data produk
                        </p>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            {topProducts.map((p, i) => {
                                const maxSold = Math.max(...topProducts.map(x => parseInt(x.sold) || 0), 1);
                                const sold = parseInt(p.sold) || 0;
                                const RANK_COLORS = ['#F59E0B', '#94A3B8', '#CD7C2F', '#054CC7', '#7C3AED'];
                                return (
                                    <div key={p.id || i} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                        <div style={{
                                            width: '22px', height: '22px', borderRadius: '6px',
                                            background: `${RANK_COLORS[i]}22`, color: RANK_COLORS[i],
                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            fontSize: '11px', fontWeight: 800, flexShrink: 0,
                                        }}>{i + 1}</div>
                                        <div style={{ flex: 1, minWidth: 0 }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '3px' }}>
                                                <span style={{
                                                    fontSize: '12.5px', fontWeight: 600, color: '#1E293B', textAlign: 'left',
                                                    overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                                                }}>{p.name}</span>
                                                <span style={{ fontSize: '12px', fontWeight: 700, color: '#054CC7', flexShrink: 0, marginLeft: '6px' }}>
                                                    {sold}x
                                                </span>
                                            </div>
                                            <div style={{ height: '4px', background: '#F0F4FB', borderRadius: '4px', overflow: 'hidden' }}>
                                                <div style={{ width: `${(sold / maxSold) * 100}%`, height: '100%', background: RANK_COLORS[i], borderRadius: '4px' }} />
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* Top Clients */}
                <div style={CARD_STYLE}>
                    <h3 style={{ margin: '0 0 14px 0', fontSize: '14px', fontWeight: 700, color: '#1E293B', textAlign: 'left' }}>
                        👥 Top Klien Terbaik
                    </h3>
                    {topClients.length === 0 ? (
                        <p style={{ color: '#94A3B8', fontSize: '13px', textAlign: 'center', padding: '20px 0', margin: 0 }}>
                            Belum ada data klien
                        </p>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            {topClients.map((c, i) => {
                                const maxSpent = Math.max(...topClients.map(x => parseAmount(x.spent)), 1);
                                const spent = parseAmount(c.spent);
                                const GRAD = [
                                    'linear-gradient(135deg, #054CC7, #17C3CC)',
                                    'linear-gradient(135deg, #7C3AED, #C084FC)',
                                    'linear-gradient(135deg, #059669, #34D399)',
                                    'linear-gradient(135deg, #D97706, #FCD34D)',
                                    'linear-gradient(135deg, #BE185D, #F9A8D4)',
                                ];
                                const initials = c.name.split(' ').slice(0, 2).map((w: string) => w[0]).join('').toUpperCase();
                                return (
                                    <div key={c.id || i} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                        <div style={{
                                            width: '32px', height: '32px', borderRadius: '9px',
                                            background: GRAD[i % GRAD.length], color: 'white',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            fontSize: '12px', fontWeight: 700, flexShrink: 0,
                                        }}>{initials}</div>
                                        <div style={{ flex: 1, minWidth: 0 }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '3px' }}>
                                                <span style={{
                                                    fontSize: '12.5px', fontWeight: 600, color: '#1E293B', textAlign: 'left',
                                                    overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                                                }}>{c.name}</span>
                                                <span style={{ fontSize: '11.5px', fontWeight: 700, color: '#059669', flexShrink: 0, marginLeft: '6px' }}>
                                                    {formatRp(spent)}
                                                </span>
                                            </div>
                                            <div style={{ height: '4px', background: '#F0F4FB', borderRadius: '4px', overflow: 'hidden' }}>
                                                <div style={{ width: `${(spent / maxSpent) * 100}%`, height: '100%', background: 'linear-gradient(90deg, #054CC7, #17C3CC)', borderRadius: '4px' }} />
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

// ════════════════════════════════════════════════════════════
//  SVG BAR CHART
// ════════════════════════════════════════════════════════════
const RevenueBarChart = ({ data, isMobile }: { data: { label: string; value: number }[]; isMobile?: boolean }) => {
    const [hovered, setHovered] = React.useState<number | null>(null);

    const maxVal = Math.max(...data.map(d => d.value), 1);
    const chartH = isMobile ? 140 : 180;
    const barW = isMobile ? 28 : 36;
    const barGap = isMobile ? 6 : 14;
    const leftPad = isMobile ? 44 : 52;
    const topPad = 20;
    const bottomPad = 28;
    const rightPad = 12;
    const totalW = leftPad + data.length * (barW + barGap) + rightPad;
    const totalH = chartH + topPad + bottomPad;

    const yTicks = [0, 0.25, 0.5, 0.75, 1];

    return (
        <svg
            viewBox={`0 0 ${totalW} ${totalH}`}
            style={{ width: '100%', height: isMobile ? '200px' : '250px', overflow: 'visible' }}
            role="img" aria-label="Grafik pendapatan"
        >
            <defs>
                <linearGradient id="rptBarGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#054CC7" stopOpacity={0.95} />
                    <stop offset="100%" stopColor="#17C3CC" stopOpacity={0.7} />
                </linearGradient>
                <linearGradient id="rptBarGradHov" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#0341A8" />
                    <stop offset="100%" stopColor="#0EA5E9" />
                </linearGradient>
            </defs>

            {/* Grid lines + Y labels */}
            {yTicks.map((t, i) => {
                const y = topPad + (1 - t) * chartH;
                return (
                    <g key={i}>
                        <line x1={leftPad} y1={y} x2={totalW - rightPad} y2={y}
                            stroke={t === 0 ? '#CBD5E1' : '#F0F4FB'} strokeWidth={t === 0 ? 1.5 : 1} />
                        <text x={leftPad - 4} y={y + 4} textAnchor="end"
                            fontSize={isMobile ? 8 : 9} fill="#94A3B8">
                            {formatShortY(maxVal * t)}
                        </text>
                    </g>
                );
            })}

            {/* Bars */}
            {data.map((d, i) => {
                const barH = maxVal === 0 ? 0 : (d.value / maxVal) * chartH;
                const x = leftPad + i * (barW + barGap);
                const y = topPad + chartH - barH;
                const isHov = hovered === i;
                const isEmpty = d.value === 0;

                return (
                    <g key={i}>
                        {/* Empty placeholder bar */}
                        {isEmpty && (
                            <rect x={x} y={topPad} width={barW} height={chartH}
                                fill="#F8FAFC" rx={4} />
                        )}
                        {/* Actual bar */}
                        {!isEmpty && (
                            <rect
                                x={x} y={isHov ? y - 3 : y}
                                width={barW} height={isHov ? barH + 3 : barH}
                                fill={isHov ? 'url(#rptBarGradHov)' : 'url(#rptBarGrad)'}
                                rx={5}
                                style={{ cursor: 'pointer', transition: 'y 0.15s, height 0.15s' }}
                                onMouseEnter={() => setHovered(i)}
                                onMouseLeave={() => setHovered(null)}
                            />
                        )}

                        {/* Hover tooltip */}
                        {isHov && !isEmpty && (
                            <g>
                                <rect x={x - 8} y={y - 28} width={barW + 16} height={20}
                                    rx={5} fill="#1E293B" />
                                <text x={x + barW / 2} y={y - 14} textAnchor="middle"
                                    fontSize={9} fill="white" fontWeight={700}>
                                    {formatRp(d.value)}
                                </text>
                            </g>
                        )}

                        {/* X label */}
                        <text x={x + barW / 2} y={totalH - 8} textAnchor="middle"
                            fontSize={isMobile ? 8 : 10} fill="#94A3B8" fontWeight={500}>
                            {d.label}
                        </text>
                    </g>
                );
            })}
        </svg>
    );
};

// ─── Sub components ──────────────────────────────────────────
const MetricCard = ({ label, value, sub, icon, bg, trend }: {
    label: string; value: string; sub: string;
    icon: React.ReactNode; bg: string; trend?: number | null;
}) => (
    <div style={{
        background: 'white', borderRadius: '14px', padding: '16px 18px',
        boxShadow: '0 2px 12px rgba(0,0,0,0.04)', border: '1px solid #EEF2F9',
    }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
            <span style={{ fontSize: '11px', fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.5px', textAlign: 'left' }}>{label}</span>
            <div style={{ background: bg, padding: '6px', borderRadius: '8px', display: 'flex' }}>{icon}</div>
        </div>
        <div style={{ fontSize: '22px', fontWeight: 800, color: '#0F172A', textAlign: 'left', marginBottom: '3px' }}>{value}</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            {trend !== undefined && trend !== null && (
                trend > 0 ? <ArrowUp size={11} color="#059669" />
                : trend < 0 ? <ArrowDown size={11} color="#DC2626" />
                : <Minus size={11} color="#94A3B8" />
            )}
            <p style={{ margin: 0, fontSize: '11px', color: '#94A3B8', textAlign: 'left' }}>{sub}</p>
        </div>
    </div>
);

// ─── Shared Styles ────────────────────────────────────────────
const CARD_STYLE: React.CSSProperties = {
    background: 'white', borderRadius: '16px', padding: '20px 22px',
    boxShadow: '0 2px 12px rgba(0,0,0,0.04)', border: '1px solid #EEF2F9',
};
const PAGE_TITLE: React.CSSProperties = {
    margin: '0 0 4px 0', fontSize: '20px', fontWeight: 800, color: '#1E293B', textAlign: 'left',
};
const PAGE_SUBTITLE: React.CSSProperties = {
    margin: 0, fontSize: '13px', color: '#64748B', textAlign: 'left',
};
