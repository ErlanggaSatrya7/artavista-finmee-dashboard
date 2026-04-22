import * as React from 'react';
import { Users, Search, ArrowRight, Mail, Phone } from 'lucide-react';
import { ICustomerData, ISharedViewProps } from './types';

interface ICustomersViewProps extends ISharedViewProps {
    customers: ICustomerData[];
    isEmpty: boolean;
    isMobile?: boolean;
}

export const CustomersView: React.FC<ICustomersViewProps> = ({
    customers, isEmpty, onAction, navigate, isMobile
}) => {
    const [searchTerm, setSearchTerm] = React.useState('');

    const filtered = customers.filter(c =>
        c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (c.email || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (c.phone || '').includes(searchTerm)
    );

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '18px', width: '100%' }}>

            {/* Page Header */}
            <div style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', justifyContent: 'space-between', alignItems: isMobile ? 'flex-start' : 'center', gap: '12px' }}>
                <div>
                    <h2 style={PAGE_TITLE}>Data Customer</h2>
                    <p style={PAGE_SUBTITLE}>
                        {customers.length > 0
                            ? `${customers.length} klien aktif terdaftar dalam sistem`
                            : 'Kelola dan pantau seluruh klien Artavista'}
                    </p>
                </div>
                <button onClick={() => onAction('ADD_CUSTOMER')} style={PRIMARY_BTN}>
                    + Tambah Customer
                </button>
            </div>

            {/* Stats Row */}
            {!isEmpty && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '12px' }}>
                    <StatCard label="Total Klien" value={customers.length} icon="👥" color="#054CC7" />
                    <StatCard label="Bulan Ini" value={Math.min(customers.length, 3)} icon="📈" color="#059669" />
                    <StatCard label="Repeat Order" value={Math.max(0, customers.length - 2)} icon="🔄" color="#7C3AED" />
                </div>
            )}

            {/* Search */}
            <div style={{
                display: 'flex', alignItems: 'center', gap: '8px',
                background: 'white', border: '1px solid #E2E8F0',
                borderRadius: '12px', padding: '11px 16px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
            }}>
                <Search size={15} color="#94A3B8" />
                <input
                    type="text"
                    placeholder="Cari nama, email, atau nomor telepon..."
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    style={{
                        border: 'none', outline: 'none', background: 'transparent',
                        fontSize: '13px', color: '#334155', flex: 1, fontFamily: 'inherit',
                    }}
                />
            </div>

            {/* Content */}
            {isEmpty ? (
                <div style={CARD_STYLE}>
                    <EmptyState
                        icon={<Users size={52} color="#CBD5E1" />}
                        title="Belum Ada Data Customer"
                        desc="Tambahkan klien pertama Anda atau sinkronkan data dari Power Apps untuk mulai mengelola customer"
                        action={{ label: 'Tambah Customer Pertama', onClick: () => onAction('ADD_CUSTOMER') }}
                    />
                </div>
            ) : filtered.length === 0 ? (
                <div style={CARD_STYLE}>
                    <EmptyState
                        icon={<Search size={48} color="#CBD5E1" />}
                        title={`Tidak ada customer untuk "${searchTerm}"`}
                        desc="Coba gunakan kata kunci yang berbeda"
                    />
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {filtered.map((cust, i) => (
                        <CustomerRow key={cust.id || i} customer={cust} index={i} onAction={onAction} isMobile={isMobile} />
                    ))}
                </div>
            )}
        </div>
    );
};

/* ── STYLES ── */
const CARD_STYLE: React.CSSProperties = {
    background: 'white', borderRadius: '16px', padding: '20px',
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
    padding: '10px 18px', borderRadius: '10px', fontWeight: 600,
    cursor: 'pointer', fontSize: '13px', fontFamily: 'inherit',
    whiteSpace: 'nowrap', flexShrink: 0,
};

/* ── GRADIENT COLORS for avatars ── */
const AVATAR_GRADIENTS = [
    'linear-gradient(135deg, #054CC7, #17C3CC)',
    'linear-gradient(135deg, #7C3AED, #C084FC)',
    'linear-gradient(135deg, #059669, #34D399)',
    'linear-gradient(135deg, #D97706, #FCD34D)',
    'linear-gradient(135deg, #BE185D, #F9A8D4)',
    'linear-gradient(135deg, #0284C7, #38BDF8)',
];

/* ── SUB COMPONENTS ── */
const StatCard = ({ label, value, icon, color }: { label: string; value: number; icon: string; color: string }) => (
    <div style={{
        background: 'white', borderRadius: '12px', padding: '14px 16px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.04)', border: '1px solid #EEF2F9',
        display: 'flex', alignItems: 'center', gap: '12px',
    }}>
        <span style={{ fontSize: '22px' }}>{icon}</span>
        <div>
            <div style={{ fontSize: '20px', fontWeight: 800, color, textAlign: 'left' }}>{value}</div>
            <div style={{ fontSize: '11px', color: '#94A3B8', fontWeight: 600, textAlign: 'left' }}>{label}</div>
        </div>
    </div>
);

const CustomerRow = ({ customer, index, onAction, isMobile }: {
    customer: ICustomerData; index: number;
    onAction: (a: string, id?: string) => void; isMobile?: boolean;
}) => {
    const gradient = AVATAR_GRADIENTS[index % AVATAR_GRADIENTS.length];
    const initials = customer.name.split(' ').slice(0, 2).map((w: string) => w[0]).join('').toUpperCase();

    return (
        <div
            onClick={() => onAction('VIEW_CUSTOMER', customer.id)}
            style={{
                background: 'white', borderRadius: '14px',
                padding: isMobile ? '14px 14px' : '16px 20px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.04)', border: '1px solid #EEF2F9',
                display: 'flex', alignItems: 'center', gap: '14px',
                cursor: 'pointer', transition: 'border-color 0.2s, box-shadow 0.2s',
            }}
            onMouseEnter={e => {
                (e.currentTarget as HTMLDivElement).style.borderColor = '#C7D7F5';
                (e.currentTarget as HTMLDivElement).style.boxShadow = '0 4px 16px rgba(5,76,199,0.08)';
            }}
            onMouseLeave={e => {
                (e.currentTarget as HTMLDivElement).style.borderColor = '#EEF2F9';
                (e.currentTarget as HTMLDivElement).style.boxShadow = '0 2px 8px rgba(0,0,0,0.04)';
            }}
        >
            {/* Avatar */}
            <div style={{
                width: '44px', height: '44px', borderRadius: '12px',
                background: gradient, color: 'white',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '15px', fontWeight: 700, flexShrink: 0,
            }}>
                {initials}
            </div>

            {/* Info */}
            <div style={{ flex: 1, minWidth: 0 }}>
                <h4 style={{
                    margin: '0 0 3px 0', fontSize: '14px', fontWeight: 700,
                    color: '#1E293B', textAlign: 'left',
                    overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                }}>
                    {customer.name}
                </h4>
                <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                    {customer.email && (
                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', color: '#64748B' }}>
                            <Mail size={11} color="#94A3B8" /> {customer.email}
                        </span>
                    )}
                    {customer.phone && (
                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', color: '#64748B' }}>
                            <Phone size={11} color="#94A3B8" /> {customer.phone}
                        </span>
                    )}
                </div>
            </div>

            {/* Status Badge */}
            <div style={{ flexShrink: 0, display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px' }}>
                <span style={{
                    background: '#ECFDF5', color: '#059669',
                    padding: '3px 10px', borderRadius: '20px',
                    fontSize: '11px', fontWeight: 700,
                }}>Aktif</span>
            </div>
        </div>
    );
};

const EmptyState = ({ icon, title, desc, action }: {
    icon: React.ReactNode; title: string; desc?: string;
    action?: { label: string; onClick: () => void };
}) => (
    <div style={{ padding: '48px 20px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
        {icon}
        <h4 style={{ margin: '8px 0 0 0', color: '#475569', fontSize: '15px', fontWeight: 700, textAlign: 'center' }}>{title}</h4>
        {desc && <p style={{ margin: 0, color: '#94A3B8', fontSize: '13px', textAlign: 'center', maxWidth: '300px' }}>{desc}</p>}
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