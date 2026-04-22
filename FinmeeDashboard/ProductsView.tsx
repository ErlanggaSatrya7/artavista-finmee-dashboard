import * as React from 'react';
import { Package, Search, ArrowRight, Star } from 'lucide-react';
import { IProductData, ISharedViewProps } from './types';

interface IProductsViewProps extends ISharedViewProps {
    products: IProductData[];
    isEmpty: boolean;
    isMobile?: boolean;
}

export const ProductsView: React.FC<IProductsViewProps> = ({
    products, isEmpty, onAction, navigate, isMobile
}) => {
    const [searchTerm, setSearchTerm] = React.useState('');

    const filtered = products.filter(p =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (p.category || '').toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '18px', width: '100%' }}>

            {/* Page Header */}
            <div style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', justifyContent: 'space-between', alignItems: isMobile ? 'flex-start' : 'center', gap: '12px' }}>
                <div>
                    <h2 style={PAGE_TITLE}>Katalog Produk</h2>
                    <p style={PAGE_SUBTITLE}>
                        {products.length > 0
                            ? `${products.length} produk tersedia dalam sistem`
                            : 'Kelola produk dan layanan yang ditawarkan Artavista'}
                    </p>
                </div>
                <button onClick={() => onAction('ADD_PRODUCT')} style={PRIMARY_BTN}>
                    + Tambah Produk
                </button>
            </div>

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
                    placeholder="Cari nama produk atau kategori..."
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
                        icon={<Package size={52} color="#CBD5E1" />}
                        title="Belum Ada Produk Terdaftar"
                        desc="Tambahkan produk atau layanan pertama Anda untuk mulai mengelola katalog Artavista"
                        action={{ label: 'Tambah Produk Sekarang', onClick: () => onAction('ADD_PRODUCT') }}
                    />
                </div>
            ) : filtered.length === 0 ? (
                <div style={CARD_STYLE}>
                    <EmptyState
                        icon={<Search size={48} color="#CBD5E1" />}
                        title={`Tidak ada produk untuk "${searchTerm}"`}
                        desc="Coba kata kunci yang berbeda"
                    />
                </div>
            ) : (
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fill, minmax(240px, 1fr))',
                    gap: '14px',
                }}>
                    {filtered.map((product, i) => (
                        <ProductCard key={product.id || i} product={product} onAction={onAction} />
                    ))}
                </div>
            )}
        </div>
    );
};

/* ── SHARED STYLES ── */
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

/* ── PRODUCT CARD ── */
const CATEGORY_COLORS: Record<string, { bg: string; color: string }> = {
    'foto': { bg: '#EEF4FF', color: '#054CC7' },
    'video': { bg: '#F3F0FF', color: '#7C3AED' },
    'desain': { bg: '#ECFDF5', color: '#059669' },
    'branding': { bg: '#FFFBEB', color: '#D97706' },
    'web': { bg: '#FFF0F5', color: '#BE185D' },
};

const getCategoryStyle = (cat: string = '') => {
    const key = Object.keys(CATEGORY_COLORS).find(k => cat.toLowerCase().includes(k));
    return key ? CATEGORY_COLORS[key] : { bg: '#F1F5F9', color: '#475569' };
};

const ProductCard = ({ product, onAction }: { product: IProductData; onAction: (a: string, id?: string) => void }) => {
    const catStyle = getCategoryStyle(product.category);
    const initials = product.name.split(' ').slice(0, 2).map((w: string) => w[0]).join('').toUpperCase();

    return (
        <div
            onClick={() => onAction('VIEW_PRODUCT', product.id)}
            style={{
                background: 'white', borderRadius: '14px', padding: '18px',
                boxShadow: '0 2px 10px rgba(0,0,0,0.04)', border: '1px solid #EEF2F9',
                cursor: 'pointer', transition: 'transform 0.2s, box-shadow 0.2s',
                display: 'flex', flexDirection: 'column', gap: '12px',
            }}
            onMouseEnter={e => {
                (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-2px)';
                (e.currentTarget as HTMLDivElement).style.boxShadow = '0 8px 24px rgba(5,76,199,0.1)';
            }}
            onMouseLeave={e => {
                (e.currentTarget as HTMLDivElement).style.transform = 'none';
                (e.currentTarget as HTMLDivElement).style.boxShadow = '0 2px 10px rgba(0,0,0,0.04)';
            }}
        >
            {/* Top: Avatar + Category */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{
                    width: '46px', height: '46px', borderRadius: '12px',
                    background: `linear-gradient(135deg, ${catStyle.color}22, ${catStyle.color}44)`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '14px', fontWeight: 800, color: catStyle.color,
                }}>
                    {initials}
                </div>
                {product.category && (
                    <span style={{
                        background: catStyle.bg, color: catStyle.color,
                        padding: '3px 10px', borderRadius: '20px',
                        fontSize: '10.5px', fontWeight: 700,
                    }}>
                        {product.category}
                    </span>
                )}
            </div>

            {/* Name & Description */}
            <div>
                <h4 style={{ margin: '0 0 4px 0', fontSize: '14.5px', fontWeight: 700, color: '#1E293B', textAlign: 'left' }}>
                    {product.name}
                </h4>
                {product.description && (
                    <p style={{
                        margin: 0, fontSize: '12px', color: '#64748B', textAlign: 'left',
                        overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical' as any, lineHeight: 1.5,
                    }}>
                        {product.description}
                    </p>
                )}
            </div>

            {/* Price + Rating */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #F0F4FB', paddingTop: '10px' }}>
                <span style={{ fontSize: '15px', fontWeight: 800, color: '#054CC7', textAlign: 'left' }}>
                    {product.price ? `Rp ${Number(product.price).toLocaleString('id-ID')}` : 'Hubungi Kami'}
                </span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                    <Star size={12} color="#F59E0B" fill="#F59E0B" />
                    <span style={{ fontSize: '11.5px', fontWeight: 700, color: '#64748B' }}>4.8</span>
                </div>
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