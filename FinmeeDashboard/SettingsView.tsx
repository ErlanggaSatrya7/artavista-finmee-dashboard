// SettingsView.tsx
import * as React from 'react';
import { Settings, User, Bell, Shield, Globe, Save, ChevronRight } from 'lucide-react';
import { ISharedViewProps } from './types';

export const SettingsView: React.FC<ISharedViewProps> = ({ onAction }) => {
    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '18px', width: '100%' }}>

            {/* Page Header */}
            <div>
                <h2 style={PAGE_TITLE}>Pengaturan</h2>
                <p style={PAGE_SUBTITLE}>Kelola preferensi akun dan konfigurasi sistem dashboard</p>
            </div>

            {/* Settings Sections */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>

                {/* Profil Section */}
                <SettingsSection icon={<User size={18} color="#054CC7" />} title="Profil & Akun" subtitle="Kelola informasi profil dan detail akun">
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        <FieldGroup label="Nama Workspace">
                            <input
                                type="text"
                                defaultValue="Artavista Sales Hub"
                                style={INPUT_STYLE}
                            />
                        </FieldGroup>
                        <FieldGroup label="Email Administrator">
                            <input
                                type="email"
                                defaultValue="admin@artavista.com"
                                style={INPUT_STYLE}
                            />
                        </FieldGroup>
                        <FieldGroup label="Zona Waktu">
                            <select style={INPUT_STYLE}>
                                <option>Asia/Jakarta (WIB)</option>
                                <option>Asia/Makassar (WITA)</option>
                                <option>Asia/Jayapura (WIT)</option>
                            </select>
                        </FieldGroup>
                    </div>
                </SettingsSection>

                {/* Notifikasi Section */}
                <SettingsSection icon={<Bell size={18} color="#7C3AED" />} title="Notifikasi" subtitle="Atur preferensi pemberitahuan sistem">
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                        {[
                            { label: 'Transaksi baru masuk', sub: 'Notifikasi saat ada order baru' },
                            { label: 'Update status pembayaran', sub: 'Alert perubahan status transaksi' },
                            { label: 'Laporan mingguan', sub: 'Ringkasan performa setiap minggu' },
                        ].map(item => (
                            <ToggleRow key={item.label} label={item.label} sub={item.sub} />
                        ))}
                    </div>
                </SettingsSection>

                {/* Tampilan Section */}
                <SettingsSection icon={<Globe size={18} color="#059669" />} title="Tampilan & Bahasa" subtitle="Kustomisasi tampilan dashboard">
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        <FieldGroup label="Bahasa Antarmuka">
                            <select style={INPUT_STYLE}>
                                <option>Bahasa Indonesia</option>
                                <option>English</option>
                            </select>
                        </FieldGroup>
                        <FieldGroup label="Format Mata Uang">
                            <select style={INPUT_STYLE}>
                                <option>Rupiah (Rp)</option>
                                <option>US Dollar ($)</option>
                            </select>
                        </FieldGroup>
                    </div>
                </SettingsSection>

                {/* Keamanan Section */}
                <SettingsSection icon={<Shield size={18} color="#D97706" />} title="Keamanan" subtitle="Pengaturan akses dan keamanan sistem">
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        {[
                            { label: 'Ubah Password', action: 'CHANGE_PASSWORD' },
                            { label: 'Riwayat Login', action: 'VIEW_LOGIN_HISTORY' },
                            { label: 'Kelola Akses Role', action: 'MANAGE_ROLES' },
                        ].map(item => (
                            <button
                                key={item.action}
                                onClick={() => onAction(item.action)}
                                style={{
                                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                    background: '#F8FAFC', border: '1px solid #E2E8F0',
                                    borderRadius: '10px', padding: '13px 16px',
                                    cursor: 'pointer', fontFamily: 'inherit', width: '100%',
                                }}
                                onMouseEnter={e => (e.currentTarget.style.borderColor = '#C7D7F5')}
                                onMouseLeave={e => (e.currentTarget.style.borderColor = '#E2E8F0')}
                            >
                                <span style={{ fontSize: '13.5px', fontWeight: 600, color: '#334155', textAlign: 'left' }}>
                                    {item.label}
                                </span>
                                <ChevronRight size={16} color="#94A3B8" />
                            </button>
                        ))}
                    </div>
                </SettingsSection>

                {/* Save Button */}
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', paddingTop: '4px' }}>
                    <button style={{
                        background: '#F1F5F9', color: '#475569', border: 'none',
                        padding: '11px 22px', borderRadius: '10px', fontWeight: 600,
                        cursor: 'pointer', fontSize: '13px', fontFamily: 'inherit',
                    }}>
                        Reset
                    </button>
                    <button
                        onClick={() => onAction('SAVE_SETTINGS')}
                        style={{
                            background: '#054CC7', color: 'white', border: 'none',
                            padding: '11px 24px', borderRadius: '10px', fontWeight: 600,
                            cursor: 'pointer', fontSize: '13px', fontFamily: 'inherit',
                            display: 'flex', alignItems: 'center', gap: '7px',
                        }}
                    >
                        <Save size={15} /> Simpan Perubahan
                    </button>
                </div>
            </div>
        </div>
    );
};

/* ── STYLES ── */
const PAGE_TITLE: React.CSSProperties = {
    margin: '0 0 4px 0', fontSize: '20px', fontWeight: 800, color: '#1E293B', textAlign: 'left',
};
const PAGE_SUBTITLE: React.CSSProperties = {
    margin: 0, fontSize: '13px', color: '#64748B', textAlign: 'left',
};
const INPUT_STYLE: React.CSSProperties = {
    width: '100%', padding: '10px 13px',
    border: '1px solid #E2E8F0', borderRadius: '9px',
    fontSize: '13.5px', color: '#334155', outline: 'none',
    boxSizing: 'border-box', fontFamily: 'inherit',
    background: 'white', appearance: 'none' as any,
};

/* ── SUB COMPONENTS ── */
const SettingsSection = ({ icon, title, subtitle, children }: {
    icon: React.ReactNode; title: string; subtitle: string; children: React.ReactNode;
}) => (
    <div style={{
        background: 'white', borderRadius: '16px', padding: '22px 24px',
        boxShadow: '0 2px 12px rgba(0,0,0,0.04)', border: '1px solid #EEF2F9',
    }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '18px', paddingBottom: '16px', borderBottom: '1px solid #F0F4FB' }}>
            <div style={{ background: '#EEF2F9', padding: '9px', borderRadius: '10px', display: 'flex' }}>
                {icon}
            </div>
            <div>
                <h3 style={{ margin: '0 0 2px 0', fontSize: '15px', fontWeight: 700, color: '#1E293B', textAlign: 'left' }}>
                    {title}
                </h3>
                <p style={{ margin: 0, fontSize: '12px', color: '#94A3B8', textAlign: 'left' }}>{subtitle}</p>
            </div>
        </div>
        {children}
    </div>
);

const FieldGroup = ({ label, children }: { label: string; children: React.ReactNode }) => (
    <div>
        <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 600, color: '#475569', marginBottom: '7px', textAlign: 'left' }}>
            {label}
        </label>
        {children}
    </div>
);

const ToggleRow = ({ label, sub }: { label: string; sub: string }) => {
    const [enabled, setEnabled] = React.useState(true);
    return (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ flex: 1, paddingRight: '12px' }}>
                <p style={{ margin: '0 0 2px 0', fontSize: '13.5px', fontWeight: 600, color: '#334155', textAlign: 'left' }}>{label}</p>
                <p style={{ margin: 0, fontSize: '12px', color: '#94A3B8', textAlign: 'left' }}>{sub}</p>
            </div>
            <div
                onClick={() => setEnabled(!enabled)}
                style={{
                    width: '42px', height: '24px', borderRadius: '12px',
                    background: enabled ? '#054CC7' : '#CBD5E1',
                    cursor: 'pointer', position: 'relative', flexShrink: 0,
                    transition: 'background 0.2s',
                }}
            >
                <div style={{
                    position: 'absolute', top: '3px',
                    left: enabled ? '21px' : '3px',
                    width: '18px', height: '18px', borderRadius: '50%', background: 'white',
                    transition: 'left 0.2s', boxShadow: '0 1px 4px rgba(0,0,0,0.2)',
                }} />
            </div>
        </div>
    );
};