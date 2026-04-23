import * as React from 'react';
import { DollarSign, ShoppingCart, Users, Target, TrendingUp, Package, ArrowRight, Calendar, AlertTriangle } from 'lucide-react';
import { BANNER_BASE64 } from './images';
import { ISalesData, ICustomerData, IScheduleData, ISharedViewProps } from './types';

export interface IDashboardViewProps extends ISharedViewProps {
    contents: ISalesData[];
    customers: ICustomerData[];
    schedules?: IScheduleData[];
    totalTask: string;
    isEmpty: boolean;
    bannerSrc?: string;
    isMobile?: boolean;
    isTablet?: boolean;
}

// ─── [MAINTENANCE NOTE]: FUNGSI HELPERS UTILITY ─────────────────────────────
// Fungsi ini mengubah string tanggal dari SharePoint (DD/MM/YYYY) menjadi tipe Date
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

// Fungsi menghitung sisa hari dari hari ini ke tanggal deadline
const daysUntil = (str: string): number | null => {
    const d = parseDate(str);
    if (!d) return null;
    const t = new Date(); t.setHours(0, 0, 0, 0); d.setHours(0, 0, 0, 0);
    return Math.ceil((d.getTime() - t.getTime()) / 86400000);
};

// Fungsi membersihkan format uang (misal "Rp 15.000.000" jadi angka murni 15000000)
// Penting agar data tipe Text dari SharePoint bisa dihitung matematikanya.
const parseAmount = (val: string | number | undefined): number => {
    if (!val) return 0;
    const cleaned = String(val).replace(/[Rp\s.,\u00A0]/g, '');
    return parseFloat(cleaned) || 0;
};

// Fungsi untuk merapikan angka kembali menjadi format teks Rupiah singkatan (M, jt, rb)
const formatRp = (val: number): string => {
    if (val >= 1_000_000_000) return `Rp ${(val / 1_000_000_000).toFixed(1)}M`;
    if (val >= 1_000_000) return `Rp ${(val / 1_000_000).toFixed(1)}jt`;
    if (val >= 1_000) return `Rp ${(val / 1_000).toFixed(0)}rb`;
    return `Rp ${val}`;
};
// ────────────────────────────────────────────────────────────────────────────


export const DashboardView: React.FC<IDashboardViewProps> = ({
    contents, customers, schedules = [], totalTask, isEmpty, navigate, onAction, isMobile, isTablet
}) => {
    // ─── [MAINTENANCE NOTE]: KALKULASI STATISTIK DASAR ──────────────────────
    const uniqueClients = customers.length;
    const orderCount = contents.length;
    const activeProjects = schedules.filter(s => s.status === 'Proses').length;

    let paidCount = 0;
    contents.forEach(c => {
        const s = c.status.toLowerCase();
        if (['paid', 'lunas', 'success', 'selesai'].includes(s)) paidCount++;
    });
    const paidPct = orderCount === 0 ? 0 : Math.round((paidCount / orderCount) * 100);
    const pendingPct = 100 - paidPct;

    // Filter jadwal untuk mengambil 3 deadline yang paling mepet (dan belum selesai)
    const upcomingDeadlines = [...schedules]
        .filter(s => s.status !== 'Selesai')
        .sort((a, b) => {
            const da = parseDate(a.deadline)?.getTime() ?? Infinity;
            const db = parseDate(b.deadline)?.getTime() ?? Infinity;
            return da - db;
        })
        .slice(0, 3);
    // ────────────────────────────────────────────────────────────────────────


    // ─── [MAINTENANCE NOTE]: LOGIKA HITUNG OMZET & TARGET ───────────────────
    // 1. Menghitung total omzet SEPANJANG WAKTU
    const totalOmzet = contents.reduce((sum, c) => sum + parseAmount(c.amount), 0);

    const now = new Date();

    // 2. Menghitung omzet HANYA PADA BULAN INI (berdasarkan TanggalOrder)
    const currMonthRevenue = contents.filter(c => {
        const d = parseDate(c.date);
        return d && d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    }).reduce((s, c) => s + parseAmount(c.amount), 0);

    // 3. Menghitung omzet HANYA PADA BULAN LALU (untuk perbandingan M-o-M)
    const prevMonthRevenue = contents.filter(c => {
        const d = parseDate(c.date);
        const prev = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        return d && d.getMonth() === prev.getMonth() && d.getFullYear() === prev.getFullYear();
    }).reduce((s, c) => s + parseAmount(c.amount), 0);

    // 4. PENGATURAN TARGET BULANAN
    // UBAH ANGKA DI BAWAH INI UNTUK MENGGANTI TARGET OMZET BULANAN PERUSAHAAN
    const TARGET_BULANAN = 50000000; // Contoh: Rp 50.000.000

    // Menghitung persentase tercapainya target bulan ini (maksimal 100%)
    const targetPct = Math.min(Math.round((currMonthRevenue / TARGET_BULANAN) * 100), 100);

    // Menghitung kenaikan/penurunan dari bulan lalu
    const momChange = prevMonthRevenue === 0 ? 0
        : Math.round(((currMonthRevenue - prevMonthRevenue) / prevMonthRevenue) * 100);
    // ────────────────────────────────────────────────────────────────────────

    const isNarrow = isMobile || isTablet;

    return (
        <div style={{ display: 'flex', flexDirection: isNarrow ? 'column' : 'row', gap: '20px', width: '100%' }}>

            {/* ══ KOLOM KIRI ══ */}
            <div style={{ flex: '1 1 0%', minWidth: 0, display: 'flex', flexDirection: 'column', gap: '16px' }}>

                {/* Hero Banner */}
                <div style={{
                    background: 'linear-gradient(125deg, #054CC7 0%, #17C3CC 100%)',
                    borderRadius: '18px', overflow: 'hidden',
                    minHeight: isMobile ? '140px' : '180px',
                    position: 'relative', boxShadow: '0 8px 30px rgba(5,76,199,0.22)',
                    display: 'flex', alignItems: 'stretch',
                }}>
                    <div style={{
                        padding: isMobile ? '22px 20px' : '26px 30px',
                        flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center',
                        zIndex: 2, maxWidth: isMobile ? '100%' : 'calc(100% - 220px)',
                    }}>
                        <h2 style={{
                            margin: '0 0 10px 0', fontSize: isMobile ? '20px' : '26px',
                            fontWeight: 800, color: 'white', letterSpacing: '-0.5px',
                            lineHeight: 1.2, textAlign: 'left',
                        }}>Performance<br />Sales Dashboard</h2>
                        <p style={{
                            margin: 0, color: 'rgba(255,255,255,0.85)',
                            fontSize: isMobile ? '12px' : '13px', lineHeight: 1.65, textAlign: 'left',
                        }}>
                            Pantau metrik pendapatan bulanan dan performa layanan Artavista secara real-time.
                        </p>
                    </div>
                    {!isMobile && (
                        <img src={BANNER_BASE64} alt="Banner"
                            style={{
                                position: 'absolute', right: 0, bottom: 0,
                                height: '100%', width: 'auto', maxWidth: '55%',
                                objectFit: 'contain', objectPosition: 'right bottom', zIndex: 1,
                            }}
                        />
                    )}
                    <div style={{ position: 'absolute', right: isMobile ? '-20px' : '180px', top: '-30px', width: '120px', height: '120px', borderRadius: '50%', background: 'rgba(255,255,255,0.06)' }} />
                    <div style={{ position: 'absolute', right: isMobile ? '20px' : '220px', bottom: '-40px', width: '100px', height: '100px', borderRadius: '50%', background: 'rgba(255,255,255,0.05)' }} />
                </div>

                {/* Metric Cards — 4 kartu */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '12px' }}>
                    <MetricCard title="Total Omzet" value={formatRp(totalOmzet)} sub="Pendapatan keseluruhan" icon={<DollarSign size={16} color="#054CC7" />} color="#054CC7" bg="#EEF4FF" />
                    <MetricCard title="Pesanan Masuk" value={String(orderCount)} sub="Total transaksi" icon={<ShoppingCart size={16} color="#7C3AED" />} color="#7C3AED" bg="#F3F0FF" />
                    <MetricCard title="Klien Aktif" value={String(uniqueClients)} sub="Customer terdaftar" icon={<Users size={16} color="#059669" />} color="#059669" bg="#ECFDF5" />
                    <MetricCard title="Proyek Aktif" value={String(activeProjects)} sub="Sedang dikerjakan" icon={<Calendar size={16} color="#D97706" />} color="#D97706" bg="#FFFBEB" />
                </div>

                {/* Transaksi Terkini */}
                <div style={CARD_STYLE}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                        <div>
                            <h3 style={SECTION_TITLE}>Transaksi Terkini</h3>
                            <p style={SECTION_SUB}>{orderCount > 0 ? `${orderCount} transaksi tercatat` : 'Belum ada transaksi'}</p>
                        </div>
                        <button onClick={() => navigate('Transactions')} style={LINK_BTN}>
                            Lihat Semua <ArrowRight size={12} />
                        </button>
                    </div>
                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', minWidth: '360px', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
                            <thead>
                                <tr style={{ borderBottom: '2px solid #F0F4FB' }}>
                                    {['Layanan / Produk', 'Klien', 'Status'].map((h, i) => (
                                        <th key={h} style={{ paddingBottom: '10px', color: '#94A3B8', fontSize: '10.5px', textTransform: 'uppercase', letterSpacing: '0.6px', textAlign: i === 2 ? 'right' : 'left', fontWeight: 700 }}>{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {!isEmpty ? contents.slice(0, 6).map((s, i) => (
                                    <tr key={i} onClick={() => onAction('VIEW_TRANSACTION', s.id)}
                                        style={{ borderBottom: '1px solid #F7F9FC', cursor: 'pointer' }}
                                        onMouseEnter={e => (e.currentTarget as HTMLTableRowElement).style.background = '#FAFCFF'}
                                        onMouseLeave={e => (e.currentTarget as HTMLTableRowElement).style.background = 'transparent'}
                                    >
                                        <td style={{ padding: '12px 12px 12px 0', fontWeight: 600, color: '#1E293B' }}>{s.title}</td>
                                        <td style={{ padding: '12px', color: '#64748B' }}>{s.platform}</td>
                                        <td style={{ padding: '12px 0', textAlign: 'right' }}><StatusBadge status={s.status} /></td>
                                    </tr>
                                )) : (
                                    <tr><td colSpan={3}>
                                        <EmptyState icon={<ShoppingCart size={36} color="#CBD5E1" />} title="Belum Ada Transaksi" desc="Transaksi yang masuk akan tampil di sini" />
                                    </td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* ══ KOLOM KANAN ══ */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', flexShrink: 0, width: isNarrow ? '100%' : '234px' }}>

                {/* Target Bulanan (Sudah Terkoneksi dengan Kalkulasi Dinamis) */}
                <div style={CARD_STYLE}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '14px' }}>
                        <div>
                            <p style={CARD_LABEL}>Target Bulanan</p>
                            <div style={{ fontSize: '32px', fontWeight: 800, color: '#0F172A', lineHeight: 1, marginTop: '4px' }}>{targetPct}%</div>
                        </div>
                        <div style={{ background: '#EEF4FF', padding: '8px', borderRadius: '10px' }}>
                            <Target size={18} color="#054CC7" />
                        </div>
                    </div>
                    <div style={{ height: '6px', background: '#F0F4FB', borderRadius: '10px', overflow: 'hidden' }}>
                        <div style={{ width: `${targetPct}%`, height: '100%', background: 'linear-gradient(90deg, #054CC7, #17C3CC)', borderRadius: '10px' }} />
                    </div>
                    <p style={{ margin: '8px 0 0 0', fontSize: '11px', color: '#64748B', textAlign: 'left' }}>
                        <span style={{ color: momChange >= 0 ? '#054CC7' : '#DC2626', fontWeight: 700 }}>
                            {momChange >= 0 ? '+' : ''}{momChange}%
                        </span> dari bulan lalu
                    </p>
                </div>

                {/* Status Pembayaran */}
                <div style={CARD_STYLE}>
                    <p style={{ ...CARD_LABEL, marginBottom: '14px' }}>Status Pembayaran</p>
                    <PieChart orderCount={orderCount} paidPct={paidPct} pendingPct={pendingPct} />
                </div>

                {/* Deadline Terdekat */}
                <div style={CARD_STYLE}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                        <p style={CARD_LABEL}>Deadline Terdekat</p>
                        <button onClick={() => navigate('Schedule')} style={LINK_BTN}>Jadwal <ArrowRight size={11} /></button>
                    </div>
                    {upcomingDeadlines.length === 0 ? (
                        <p style={{ fontSize: '12px', color: '#94A3B8', textAlign: 'left', margin: 0, padding: '8px 0' }}>
                            {schedules.length === 0 ? 'Belum ada jadwal proyek' : '✅ Semua proyek selesai!'}
                        </p>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            {upcomingDeadlines.map((sc, i) => {
                                const days = daysUntil(sc.deadline);
                                const isUrgent = days !== null && days <= 3;
                                return (
                                    <div key={i} onClick={() => onAction('VIEW_SCHEDULE', sc.id)}
                                        style={{
                                            background: isUrgent ? '#FFF5F5' : '#F8FAFC',
                                            border: `1px solid ${isUrgent ? '#FEE2E2' : '#EEF2F9'}`,
                                            borderRadius: '9px', padding: '9px 11px', cursor: 'pointer',
                                        }}
                                    >
                                        <p style={{
                                            margin: '0 0 3px 0', fontSize: '12px', fontWeight: 700,
                                            color: '#1E293B', textAlign: 'left',
                                            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                                        }}>{sc.title}</p>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <span style={{ fontSize: '11px', color: '#94A3B8' }}>{sc.clientName !== '-' ? sc.clientName : 'No client'}</span>
                                            <span style={{ fontSize: '10.5px', fontWeight: 700, color: isUrgent ? '#DC2626' : '#64748B', display: 'flex', alignItems: 'center', gap: '3px' }}>
                                                {isUrgent && <AlertTriangle size={10} />}
                                                {days === null ? '-' : days === 0 ? 'Hari ini!' : days < 0 ? `${Math.abs(days)}h lalu` : `${days}h lagi`}
                                            </span>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* Akses Cepat */}
                <div style={CARD_STYLE}>
                    <p style={{ ...CARD_LABEL, marginBottom: '12px' }}>Akses Cepat</p>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {[
                            { label: 'Lihat Transaksi', menu: 'Transactions', icon: <ShoppingCart size={14} color="#054CC7" />, bg: '#EEF4FF', color: '#054CC7' },
                            { label: 'Jadwal Proyek', menu: 'Schedule', icon: <Calendar size={14} color="#7C3AED" />, bg: '#F3F0FF', color: '#7C3AED' },
                            { label: 'Data Produk', menu: 'Products', icon: <Package size={14} color="#059669" />, bg: '#ECFDF5', color: '#059669' },
                            { label: 'Laporan & Analitik', menu: 'Reports', icon: <TrendingUp size={14} color="#D97706" />, bg: '#FFFBEB', color: '#D97706' },
                        ].map(item => (
                            <button key={item.menu} onClick={() => navigate(item.menu)}
                                style={{
                                    display: 'flex', alignItems: 'center', gap: '10px',
                                    background: item.bg, border: `1px solid ${item.color}22`,
                                    borderRadius: '10px', padding: '9px 12px',
                                    cursor: 'pointer', fontFamily: 'inherit', width: '100%',
                                    transition: 'transform 0.15s',
                                }}
                                onMouseEnter={e => (e.currentTarget.style.transform = 'translateX(2px)')}
                                onMouseLeave={e => (e.currentTarget.style.transform = 'none')}
                            >
                                <span style={{ flexShrink: 0 }}>{item.icon}</span>
                                <span style={{ fontSize: '12.5px', fontWeight: 600, color: '#1E293B', textAlign: 'left' }}>{item.label}</span>
                                <ArrowRight size={11} color="#94A3B8" style={{ marginLeft: 'auto', flexShrink: 0 }} />
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

// ─── [MAINTENANCE NOTE]: SHARED STYLES & SUB-COMPONENTS ─────────────────────
// Bagian di bawah ini hanya mengatur gaya visual (CSS in JS) dan komponen kecil
const CARD_STYLE: React.CSSProperties = {
    background: 'white', padding: '20px', borderRadius: '16px',
    boxShadow: '0 2px 12px rgba(0,0,0,0.04)', border: '1px solid #EEF2F9',
};
const CARD_LABEL: React.CSSProperties = { margin: 0, fontSize: '13px', fontWeight: 700, color: '#475569', textAlign: 'left' };
const SECTION_TITLE: React.CSSProperties = { margin: '0 0 2px 0', color: '#1E293B', fontSize: '15px', fontWeight: 700, textAlign: 'left' };
const SECTION_SUB: React.CSSProperties = { margin: 0, color: '#94A3B8', fontSize: '12px', textAlign: 'left' };
const LINK_BTN: React.CSSProperties = {
    background: '#EEF4FF', border: '1px solid #C7D7F5', color: '#054CC7',
    padding: '6px 12px', borderRadius: '8px', fontWeight: 600, cursor: 'pointer',
    fontSize: '12px', fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: '4px', whiteSpace: 'nowrap',
};

const MetricCard = ({ title, value, sub, icon, color, bg }: {
    title: string; value: string; sub: string; icon: React.ReactNode; color: string; bg: string;
}) => (
    <div
        style={{ background: 'white', padding: '16px 18px', borderRadius: '14px', boxShadow: '0 2px 12px rgba(0,0,0,0.04)', border: '1px solid #EEF2F9', transition: 'transform 0.2s, box-shadow 0.2s', cursor: 'default' }}
        onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-2px)'; (e.currentTarget as HTMLDivElement).style.boxShadow = '0 6px 20px rgba(5,76,199,0.1)'; }}
        onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.transform = 'none'; (e.currentTarget as HTMLDivElement).style.boxShadow = '0 2px 12px rgba(0,0,0,0.04)'; }}
    >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
            <span style={{ fontSize: '11px', fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.6px', textAlign: 'left' }}>{title}</span>
            <div style={{ background: bg, padding: '6px', borderRadius: '8px', display: 'flex', flexShrink: 0 }}>{icon}</div>
        </div>
        <div style={{ fontSize: '26px', fontWeight: 800, color: '#0F172A', textAlign: 'left', marginBottom: '4px' }}>{value}</div>
        <p style={{ margin: 0, fontSize: '11px', color: '#94A3B8', textAlign: 'left' }}>{sub}</p>
    </div>
);

const StatusBadge = ({ status }: { status: string }) => {
    let bg = '#F1F5F9', color = '#64748B';
    const s = status.toLowerCase();
    if (['paid', 'lunas', 'success', 'selesai'].includes(s)) { bg = '#DCFCE7'; color = '#15803D'; }
    else if (['proses', 'pending'].includes(s)) { bg = '#FEF3C7'; color = '#B45309'; }
    else if (['cancelled', 'failed', 'gagal', 'batal'].includes(s)) { bg = '#FEE2E2'; color = '#B91C1C'; }
    return <span style={{ background: bg, color, padding: '3px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: 700, whiteSpace: 'nowrap' }}>{status}</span>;
};

const EmptyState = ({ icon, title, desc }: { icon: React.ReactNode; title: string; desc?: string }) => (
    <div style={{ padding: '30px 0', textAlign: 'center' }}>
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '10px' }}>{icon}</div>
        <h4 style={{ margin: '0 0 4px 0', color: '#475569', fontSize: '14px', fontWeight: 700, textAlign: 'center' }}>{title}</h4>
        {desc && <p style={{ margin: 0, color: '#94A3B8', fontSize: '12px', textAlign: 'center' }}>{desc}</p>}
    </div>
);

const PieChart = ({ orderCount, paidPct, pendingPct }: { orderCount: number; paidPct: number; pendingPct: number }) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
        <div style={{ width: '72px', height: '72px', position: 'relative', flexShrink: 0 }}>
            <svg viewBox="0 0 36 36" style={{ width: '100%', height: '100%', transform: 'rotate(-90deg)' }}>
                <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#EEF2F9" strokeWidth="4" />
                <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#10B981" strokeWidth="4" strokeDasharray={`${paidPct}, 100`} />
            </svg>
            <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ fontSize: '15px', fontWeight: 800, color: '#0F172A' }}>{orderCount}</span>
            </div>
        </div>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <BarStat label="Lunas" pct={paidPct} color="#10B981" />
            <BarStat label="Pending" pct={pendingPct} color="#F59E0B" />
        </div>
    </div>
);

const BarStat = ({ label, pct, color }: { label: string; pct: number; color: string }) => (
    <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
            <span style={{ fontSize: '11px', color: '#64748B', textAlign: 'left' }}>{label}</span>
            <span style={{ fontSize: '11px', fontWeight: 700, color }}>{pct}%</span>
        </div>
        <div style={{ height: '5px', background: '#F0F4FB', borderRadius: '6px', overflow: 'hidden' }}>
            <div style={{ width: `${pct}%`, height: '100%', background: color, borderRadius: '6px' }} />
        </div>
    </div>
);