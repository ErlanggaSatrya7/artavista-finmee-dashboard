import * as React from 'react';
import {
    Calendar as CalendarIcon, List, ChevronLeft, ChevronRight,
    Plus, Clock, CheckCircle, AlertTriangle, RefreshCw, User, ArrowRight
} from 'lucide-react';
import { IScheduleData, ISharedViewProps } from './types';

// ─── Helpers ───────────────────────────────────────────────
const MONTHS_ID = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
const DAYS_ID = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];

const parseDate = (str: string): Date | null => {
    if (!str || str === '-') return null;
    const d = new Date(str);
    if (!isNaN(d.getTime())) return d;
    // dd/mm/yyyy
    const p = str.split('/');
    if (p.length === 3) {
        const d2 = new Date(`${p[2]}-${p[1].padStart(2, '0')}-${p[0].padStart(2, '0')}`);
        if (!isNaN(d2.getTime())) return d2;
    }
    return null;
};

const daysUntil = (dateStr: string): number | null => {
    const d = parseDate(dateStr);
    if (!d) return null;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    d.setHours(0, 0, 0, 0);
    return Math.ceil((d.getTime() - today.getTime()) / 86400000);
};

const getStatusStyle = (status: string): { bg: string; color: string; label: string } => {
    switch (status) {
        case 'Proses':       return { bg: '#EEF4FF', color: '#054CC7', label: 'Proses' };
        case 'Selesai':      return { bg: '#DCFCE7', color: '#15803D', label: 'Selesai' };
        case 'Revisi':       return { bg: '#FEF3C7', color: '#B45309', label: 'Revisi' };
        case 'Belum Mulai':  return { bg: '#F1F5F9', color: '#64748B', label: 'Belum Mulai' };
        default:             return { bg: '#F1F5F9', color: '#64748B', label: status || 'Belum Mulai' };
    }
};

const getDeadlineStyle = (days: number | null): { color: string; label: string } => {
    if (days === null)  return { color: '#94A3B8', label: '-' };
    if (days < 0)       return { color: '#DC2626', label: `${Math.abs(days)} hari lalu` };
    if (days === 0)     return { color: '#DC2626', label: 'Hari ini!' };
    if (days <= 3)      return { color: '#D97706', label: `${days} hari lagi` };
    return                     { color: '#059669', label: `${days} hari lagi` };
};

const formatDate = (str: string): string => {
    const d = parseDate(str);
    if (!d) return str || '-';
    return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
};

// ─── Props ─────────────────────────────────────────────────
type ViewMode = 'list' | 'calendar';
type FilterStatus = 'Semua' | 'Proses' | 'Belum Mulai' | 'Selesai' | 'Revisi';

interface IScheduleViewProps extends ISharedViewProps {
    schedules: IScheduleData[];
    isMobile?: boolean;
}

// ════════════════════════════════════════════════════════════
//  MAIN COMPONENT
// ════════════════════════════════════════════════════════════
export const ScheduleView: React.FC<IScheduleViewProps> = ({
    schedules, onAction, navigate, isMobile
}) => {
    const [viewMode, setViewMode] = React.useState<ViewMode>('list');
    const [filterStatus, setFilterStatus] = React.useState<FilterStatus>('Semua');
    const [calDate, setCalDate] = React.useState(new Date());

    const filtered = filterStatus === 'Semua'
        ? schedules
        : schedules.filter(s => s.status === filterStatus);

    const counts: Record<string, number> = {
        'Semua': schedules.length,
        'Proses': schedules.filter(s => s.status === 'Proses').length,
        'Belum Mulai': schedules.filter(s => s.status === 'Belum Mulai').length,
        'Selesai': schedules.filter(s => s.status === 'Selesai').length,
        'Revisi': schedules.filter(s => s.status === 'Revisi').length,
    };

    const activeCount = counts['Proses'];
    const urgentCount = schedules.filter(s => {
        const d = daysUntil(s.deadline);
        return d !== null && d <= 3 && s.status !== 'Selesai';
    }).length;

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', width: '100%' }}>

            {/* ── Page Header ── */}
            <div style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', justifyContent: 'space-between', alignItems: isMobile ? 'flex-start' : 'center', gap: '12px' }}>
                <div>
                    <h2 style={PAGE_TITLE}>Jadwal Proyek</h2>
                    <p style={PAGE_SUBTITLE}>
                        {schedules.length > 0
                            ? `${activeCount} proyek berjalan${urgentCount > 0 ? ` · ${urgentCount} mendekati deadline` : ''}`
                            : 'Kelola jadwal dan timeline pengerjaan proyek Artavista'}
                    </p>
                </div>
                <div style={{ display: 'flex', gap: '8px', flexShrink: 0, alignItems: 'center' }}>
                    {/* View Toggle */}
                    <div style={{ display: 'flex', background: '#F1F5F9', borderRadius: '10px', padding: '3px', gap: '2px' }}>
                        <ToggleBtn active={viewMode === 'list'} onClick={() => setViewMode('list')}>
                            <List size={13} />
                            {!isMobile && <span>List</span>}
                        </ToggleBtn>
                        <ToggleBtn active={viewMode === 'calendar'} onClick={() => setViewMode('calendar')}>
                            <CalendarIcon size={13} />
                            {!isMobile && <span>Kalender</span>}
                        </ToggleBtn>
                    </div>
                    <button onClick={() => onAction('ADD_SCHEDULE')} style={PRIMARY_BTN}>
                        <Plus size={14} /> {isMobile ? '' : 'Tambah Proyek'}
                    </button>
                </div>
            </div>

            {/* ── Filter Tabs (list view only) ── */}
            {viewMode === 'list' && (
                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                    {(['Semua', 'Proses', 'Belum Mulai', 'Revisi', 'Selesai'] as FilterStatus[]).map(st => {
                        const style = getStatusStyle(st);
                        const isActive = filterStatus === st;
                        return (
                            <button
                                key={st}
                                onClick={() => setFilterStatus(st)}
                                style={{
                                    padding: '6px 14px', borderRadius: '20px', cursor: 'pointer',
                                    border: isActive ? 'none' : '1px solid #E2E8F0',
                                    background: isActive ? style.bg : 'white',
                                    color: isActive ? style.color : '#64748B',
                                    fontSize: '12px', fontWeight: 600, fontFamily: 'inherit',
                                    display: 'flex', alignItems: 'center', gap: '4px',
                                }}
                            >
                                {st}
                                {counts[st] > 0 && (
                                    <span style={{
                                        background: isActive ? style.color + '22' : '#F1F5F9',
                                        color: isActive ? style.color : '#94A3B8',
                                        borderRadius: '10px', padding: '0 6px', fontSize: '10px', fontWeight: 700,
                                    }}>{counts[st]}</span>
                                )}
                            </button>
                        );
                    })}
                </div>
            )}

            {/* ── Content ── */}
            {viewMode === 'list'
                ? <ListView schedules={filtered} isEmpty={schedules.length === 0} onAction={onAction} isMobile={isMobile} />
                : <CalendarView schedules={schedules} calDate={calDate} setCalDate={setCalDate} onAction={onAction} isMobile={isMobile} />
            }
        </div>
    );
};

// ════════════════════════════════════════════════════════════
//  LIST VIEW
// ════════════════════════════════════════════════════════════
const ListView = ({ schedules, isEmpty, onAction, isMobile }: {
    schedules: IScheduleData[]; isEmpty: boolean;
    onAction: (a: string, id?: string) => void; isMobile?: boolean;
}) => {
    if (isEmpty) {
        return (
            <div style={CARD_STYLE}>
                <EmptyState
                    icon={<CalendarIcon size={52} color="#CBD5E1" />}
                    title="Belum Ada Jadwal Proyek"
                    desc="Tambahkan proyek pertama untuk mulai pantau progress dan deadline tim Artavista"
                    action={{ label: 'Tambah Proyek Sekarang', onClick: () => onAction('ADD_SCHEDULE') }}
                />
            </div>
        );
    }
    if (schedules.length === 0) {
        return (
            <div style={CARD_STYLE}>
                <EmptyState
                    icon={<CheckCircle size={48} color="#10B981" />}
                    title="Tidak ada proyek di kategori ini"
                    desc="Coba pilih filter status yang berbeda"
                />
            </div>
        );
    }

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {schedules.map((item, i) => (
                <ProjectCard key={item.id || i} item={item} onAction={onAction} isMobile={isMobile} />
            ))}
        </div>
    );
};

// ── Project Card ──────────────────────────────────────────
const ProjectCard = ({ item, onAction, isMobile }: {
    item: IScheduleData; onAction: (a: string, id?: string) => void; isMobile?: boolean;
}) => {
    const statusStyle = getStatusStyle(item.status);
    const days = daysUntil(item.deadline);
    const deadlineStyle = getDeadlineStyle(days);
    const isUrgent = days !== null && days <= 3 && item.status !== 'Selesai';

    const StatusIcon = item.status === 'Selesai' ? CheckCircle
        : item.status === 'Revisi' ? RefreshCw
        : item.status === 'Proses' ? Clock
        : AlertTriangle;

    return (
        <div
            onClick={() => onAction('VIEW_SCHEDULE', item.id)}
            style={{
                background: 'white', borderRadius: '14px',
                padding: isMobile ? '14px' : '18px 20px',
                boxShadow: isUrgent ? '0 2px 12px rgba(220,38,38,0.08)' : '0 2px 10px rgba(0,0,0,0.04)',
                border: isUrgent ? '1px solid #FEE2E2' : '1px solid #EEF2F9',
                cursor: 'pointer', transition: 'border-color 0.2s, box-shadow 0.2s',
            }}
            onMouseEnter={e => {
                (e.currentTarget as HTMLDivElement).style.borderColor = isUrgent ? '#FCA5A5' : '#C7D7F5';
                (e.currentTarget as HTMLDivElement).style.boxShadow = '0 4px 16px rgba(5,76,199,0.1)';
            }}
            onMouseLeave={e => {
                (e.currentTarget as HTMLDivElement).style.borderColor = isUrgent ? '#FEE2E2' : '#EEF2F9';
                (e.currentTarget as HTMLDivElement).style.boxShadow = isUrgent ? '0 2px 12px rgba(220,38,38,0.08)' : '0 2px 10px rgba(0,0,0,0.04)';
            }}
        >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px', marginBottom: '12px' }}>
                {/* Left: icon + title */}
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', flex: 1, minWidth: 0 }}>
                    <div style={{
                        background: statusStyle.bg, borderRadius: '9px', padding: '8px',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                    }}>
                        <StatusIcon size={15} color={statusStyle.color} />
                    </div>
                    <div style={{ minWidth: 0 }}>
                        <h4 style={{
                            margin: '0 0 3px 0', fontSize: '14px', fontWeight: 700,
                            color: '#1E293B', textAlign: 'left',
                            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                        }}>{item.title}</h4>
                        <p style={{ margin: 0, fontSize: '12px', color: '#64748B', textAlign: 'left' }}>
                            {item.clientName !== '-' ? `👥 ${item.clientName}` : ''}
                            {item.pic && item.pic !== '-' ? ` · 👤 ${item.pic}` : ''}
                        </p>
                    </div>
                </div>
                {/* Right: status badge */}
                <span style={{
                    background: statusStyle.bg, color: statusStyle.color,
                    padding: '4px 12px', borderRadius: '20px',
                    fontSize: '11px', fontWeight: 700, whiteSpace: 'nowrap', flexShrink: 0,
                }}>{statusStyle.label}</span>
            </div>

            {/* Progress Bar */}
            <div style={{ marginBottom: '10px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                    <span style={{ fontSize: '11.5px', color: '#94A3B8', textAlign: 'left' }}>Progress</span>
                    <span style={{ fontSize: '11.5px', fontWeight: 700, color: item.progress >= 100 ? '#059669' : '#054CC7' }}>
                        {item.progress}%
                    </span>
                </div>
                <div style={{ height: '6px', background: '#F0F4FB', borderRadius: '6px', overflow: 'hidden' }}>
                    <div style={{
                        width: `${item.progress}%`, height: '100%', borderRadius: '6px',
                        background: item.progress >= 100
                            ? 'linear-gradient(90deg, #059669, #34D399)'
                            : 'linear-gradient(90deg, #054CC7, #17C3CC)',
                        transition: 'width 0.5s ease',
                    }} />
                </div>
            </div>

            {/* Deadline */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '11.5px', color: '#94A3B8', textAlign: 'left' }}>
                    📅 Deadline: <strong style={{ color: '#475569' }}>{formatDate(item.deadline)}</strong>
                </span>
                <span style={{
                    fontSize: '11px', fontWeight: 700, color: deadlineStyle.color,
                    background: deadlineStyle.color + '15', padding: '3px 8px', borderRadius: '6px',
                }}>
                    {deadlineStyle.label}
                </span>
            </div>
        </div>
    );
};

// ════════════════════════════════════════════════════════════
//  CALENDAR VIEW
// ════════════════════════════════════════════════════════════
const CalendarView = ({ schedules, calDate, setCalDate, onAction, isMobile }: {
    schedules: IScheduleData[];
    calDate: Date; setCalDate: (d: Date) => void;
    onAction: (a: string, id?: string) => void; isMobile?: boolean;
}) => {
    const [selectedDay, setSelectedDay] = React.useState<number | null>(null);

    const year = calDate.getFullYear();
    const month = calDate.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const today = new Date();

    // Map deadline day → schedules[]
    const byDay: Record<number, IScheduleData[]> = {};
    schedules.forEach(sc => {
        const d = parseDate(sc.deadline);
        if (d && d.getFullYear() === year && d.getMonth() === month) {
            const day = d.getDate();
            if (!byDay[day]) byDay[day] = [];
            byDay[day].push(sc);
        }
    });

    // Build 42-cell grid
    const cells: (number | null)[] = Array(42).fill(null);
    for (let d = 1; d <= daysInMonth; d++) cells[firstDay + d - 1] = d;

    const isToday = (d: number) =>
        today.getFullYear() === year && today.getMonth() === month && today.getDate() === d;

    const selectedSchedules = selectedDay ? (byDay[selectedDay] || []) : [];

    return (
        <div style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', gap: '14px' }}>

            {/* Calendar Card */}
            <div style={{ ...CARD_STYLE, flex: 1 }}>
                {/* Month Navigation */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                    <button style={NAV_BTN} onClick={() => setCalDate(new Date(year, month - 1, 1))}>
                        <ChevronLeft size={16} />
                    </button>
                    <span style={{ fontSize: '15px', fontWeight: 700, color: '#1E293B' }}>
                        {MONTHS_ID[month]} {year}
                    </span>
                    <button style={NAV_BTN} onClick={() => setCalDate(new Date(year, month + 1, 1))}>
                        <ChevronRight size={16} />
                    </button>
                </div>

                {/* Day Headers */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '2px', marginBottom: '6px' }}>
                    {DAYS_ID.map(d => (
                        <div key={d} style={{ textAlign: 'center', fontSize: '11px', fontWeight: 700, color: '#94A3B8', padding: '4px 0' }}>
                            {d}
                        </div>
                    ))}
                </div>

                {/* Day Cells */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '3px' }}>
                    {cells.map((day, i) => {
                        if (day === null) return <div key={i} style={{ minHeight: isMobile ? '40px' : '50px' }} />;

                        const daySchs = byDay[day] || [];
                        const todayCell = isToday(day);
                        const isSelected = selectedDay === day;
                        const hasUrgent = daySchs.some(s => {
                            const dl = daysUntil(s.deadline);
                            return dl !== null && dl <= 3 && s.status !== 'Selesai';
                        });

                        return (
                            <div
                                key={i}
                                onClick={() => setSelectedDay(day === selectedDay ? null : day)}
                                style={{
                                    minHeight: isMobile ? '40px' : '54px',
                                    padding: '4px',
                                    background: isSelected ? '#EEF4FF' : todayCell ? '#F0F9FF' : 'white',
                                    borderRadius: '8px',
                                    border: isSelected ? '1.5px solid #054CC7' : todayCell ? '1.5px solid #17C3CC' : '1px solid #F0F4FB',
                                    cursor: daySchs.length > 0 ? 'pointer' : 'default',
                                    transition: 'all 0.15s',
                                    position: 'relative',
                                }}
                            >
                                {/* Day Number */}
                                <div style={{
                                    fontSize: '11.5px', fontWeight: todayCell ? 800 : 500,
                                    color: todayCell ? '#054CC7' : '#475569',
                                    textAlign: 'left', marginBottom: '2px',
                                }}>
                                    {day}
                                </div>

                                {/* Deadline Badges */}
                                {!isMobile && daySchs.slice(0, 2).map((sc, j) => {
                                    const st = getStatusStyle(sc.status);
                                    return (
                                        <div key={j} style={{
                                            fontSize: '8.5px', fontWeight: 600,
                                            background: st.bg, color: st.color,
                                            borderRadius: '3px', padding: '1px 3px',
                                            marginBottom: '1px',
                                            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                                        }}>{sc.title}</div>
                                    );
                                })}

                                {/* Mobile: show dots instead */}
                                {isMobile && daySchs.length > 0 && (
                                    <div style={{ display: 'flex', gap: '2px', flexWrap: 'wrap' }}>
                                        {daySchs.slice(0, 3).map((sc, j) => {
                                            const st = getStatusStyle(sc.status);
                                            return <div key={j} style={{ width: '6px', height: '6px', borderRadius: '50%', background: st.color }} />;
                                        })}
                                    </div>
                                )}

                                {/* +more */}
                                {!isMobile && daySchs.length > 2 && (
                                    <div style={{ fontSize: '8px', color: '#94A3B8', fontWeight: 600 }}>+{daySchs.length - 2} lagi</div>
                                )}

                                {/* Urgent dot */}
                                {hasUrgent && (
                                    <div style={{
                                        position: 'absolute', top: '4px', right: '4px',
                                        width: '6px', height: '6px', borderRadius: '50%', background: '#DC2626',
                                    }} />
                                )}
                            </div>
                        );
                    })}
                </div>

                {/* Legend */}
                <div style={{ display: 'flex', gap: '12px', marginTop: '14px', flexWrap: 'wrap' }}>
                    {[
                        { color: '#054CC7', label: 'Proses' },
                        { color: '#D97706', label: 'Revisi' },
                        { color: '#059669', label: 'Selesai' },
                        { color: '#DC2626', label: 'Deadline Dekat' },
                    ].map(l => (
                        <div key={l.label} style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                            <div style={{ width: '8px', height: '8px', borderRadius: '2px', background: l.color }} />
                            <span style={{ fontSize: '11px', color: '#94A3B8' }}>{l.label}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Side Panel: Detail per Hari */}
            <div style={{ width: isMobile ? '100%' : '240px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {/* Month Summary */}
                <div style={CARD_STYLE}>
                    <p style={{ margin: '0 0 12px 0', fontSize: '13px', fontWeight: 700, color: '#475569', textAlign: 'left' }}>
                        Ringkasan {MONTHS_ID[month]}
                    </p>
                    {[
                        { label: 'Total Deadline', value: Object.values(byDay).reduce((a, b) => a + b.length, 0) },
                        { label: 'Mendesak (≤3 hari)', value: schedules.filter(s => { const d = daysUntil(s.deadline); return d !== null && d <= 3 && s.status !== 'Selesai'; }).length },
                        { label: 'Selesai Bulan Ini', value: (byDay ? Object.values(byDay).flat().filter(s => s.status === 'Selesai').length : 0) },
                    ].map(r => (
                        <div key={r.label} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                            <span style={{ fontSize: '12px', color: '#64748B', textAlign: 'left' }}>{r.label}</span>
                            <span style={{ fontSize: '13px', fontWeight: 700, color: '#1E293B' }}>{r.value}</span>
                        </div>
                    ))}
                </div>

                {/* Selected Day Detail */}
                {selectedDay && (
                    <div style={CARD_STYLE}>
                        <p style={{ margin: '0 0 12px 0', fontSize: '13px', fontWeight: 700, color: '#475569', textAlign: 'left' }}>
                            📅 {selectedDay} {MONTHS_ID[month]}
                        </p>
                        {selectedSchedules.length === 0 ? (
                            <p style={{ fontSize: '12px', color: '#94A3B8', textAlign: 'left', margin: 0 }}>Tidak ada deadline di hari ini</p>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                {selectedSchedules.map((sc, i) => {
                                    const st = getStatusStyle(sc.status);
                                    return (
                                        <div
                                            key={i}
                                            onClick={() => onAction('VIEW_SCHEDULE', sc.id)}
                                            style={{
                                                background: st.bg, borderRadius: '9px', padding: '10px 12px',
                                                cursor: 'pointer',
                                            }}
                                        >
                                            <p style={{ margin: '0 0 3px 0', fontSize: '12.5px', fontWeight: 700, color: '#1E293B', textAlign: 'left' }}>
                                                {sc.title}
                                            </p>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                <span style={{ fontSize: '11px', color: '#64748B' }}>{sc.clientName}</span>
                                                <span style={{ fontSize: '11px', fontWeight: 700, color: st.color }}>{st.label}</span>
                                            </div>
                                            <div style={{ marginTop: '6px', height: '4px', background: 'rgba(255,255,255,0.6)', borderRadius: '4px', overflow: 'hidden' }}>
                                                <div style={{ width: `${sc.progress}%`, height: '100%', background: st.color, borderRadius: '4px' }} />
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

// ─── Shared Styles ──────────────────────────────────────────
const CARD_STYLE: React.CSSProperties = {
    background: 'white', borderRadius: '16px', padding: '18px 20px',
    boxShadow: '0 2px 12px rgba(0,0,0,0.04)', border: '1px solid #EEF2F9',
};
const PAGE_TITLE: React.CSSProperties = {
    margin: '0 0 4px 0', fontSize: '20px', fontWeight: 800, color: '#1E293B', textAlign: 'left',
};
const PAGE_SUBTITLE: React.CSSProperties = {
    margin: 0, fontSize: '13px', color: '#64748B', textAlign: 'left',
};
const PRIMARY_BTN: React.CSSProperties = {
    background: '#054CC7', color: 'white', border: 'none',
    padding: '9px 16px', borderRadius: '10px', fontWeight: 600,
    cursor: 'pointer', fontSize: '13px', fontFamily: 'inherit',
    display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0,
};
const NAV_BTN: React.CSSProperties = {
    background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '8px',
    padding: '6px 8px', cursor: 'pointer', display: 'flex', alignItems: 'center',
    fontFamily: 'inherit',
};

// ─── Toggle Button ──────────────────────────────────────────
const ToggleBtn = ({ active, onClick, children }: {
    active: boolean; onClick: () => void; children: React.ReactNode;
}) => (
    <button
        onClick={onClick}
        style={{
            padding: '6px 12px', borderRadius: '8px', border: 'none',
            background: active ? 'white' : 'transparent',
            color: active ? '#054CC7' : '#64748B',
            fontWeight: active ? 700 : 500, fontSize: '12px',
            cursor: 'pointer', fontFamily: 'inherit',
            boxShadow: active ? '0 1px 4px rgba(0,0,0,0.08)' : 'none',
            display: 'flex', alignItems: 'center', gap: '4px',
            transition: 'all 0.15s',
        }}
    >
        {children}
    </button>
);

// ─── Empty State ────────────────────────────────────────────
const EmptyState = ({ icon, title, desc, action }: {
    icon: React.ReactNode; title: string; desc?: string;
    action?: { label: string; onClick: () => void };
}) => (
    <div style={{ padding: '48px 20px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
        {icon}
        <h4 style={{ margin: '8px 0 0 0', color: '#475569', fontSize: '15px', fontWeight: 700, textAlign: 'center' }}>{title}</h4>
        {desc && <p style={{ margin: 0, color: '#94A3B8', fontSize: '13px', textAlign: 'center', maxWidth: '300px' }}>{desc}</p>}
        {action && (
            <button onClick={action.onClick} style={{ ...PRIMARY_BTN, marginTop: '12px' }}>
                {action.label} <ArrowRight size={14} />
            </button>
        )}
    </div>
);
