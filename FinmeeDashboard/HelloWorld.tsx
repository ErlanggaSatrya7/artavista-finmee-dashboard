import * as React from 'react';
import {
  LayoutDashboard, ShoppingCart, Package, Users, Settings,
  Calendar, BarChart2,
  ChevronLeft, ChevronRight, Bell, Search, Menu, X
} from 'lucide-react';
import { LOGO_BASE64 } from './images';

import { ISalesData, IProductData, ICustomerData, IScheduleData } from './types';
import { DashboardView }     from './DashboardView';
import { TransactionsView }  from './TransactionsView';
import { ProductsView }      from './ProductsView';
import { CustomersView }     from './CustomersView';
import { ScheduleView }      from './ScheduleView';
import { ReportsView }       from './ReportsView';
import { SettingsView }      from './SettingsView';

// ─── Types ──────────────────────────────────────────────────
export interface IArtavistaDashboardUIProps {
  userName?: string;
  totalTask?: string;
  userRole?: string;
  contents?: ISalesData[];
  products?: IProductData[];
  customers?: ICustomerData[];
  schedules?: IScheduleData[];
  triggerAction?: (actionName: string, recordId?: string) => void;
  logoSrc?: string;
  bannerSrc?: string;
}

export interface IArtavistaDashboardUIState {
  activeMenu: string;
  isCollapsed: boolean;
  containerWidth: number;
  isMobileMenuOpen: boolean;
}

// ─── Breakpoints ────────────────────────────────────────────
const BP = { MOBILE: 640, TABLET: 900 };

// Sidebar widths
const SW = { full: 220, collapsed: 60 };

// ─── Menu Definition ─────────────────────────────────────────
const MENU_ITEMS = (isAdmin: boolean) => [
  { id: 'Dashboard',    label: 'Dashboard',       icon: LayoutDashboard },
  { id: 'Transactions', label: 'Transaksi',        icon: ShoppingCart    },
  { id: 'Schedule',     label: 'Jadwal Proyek',    icon: Calendar        },
  { id: 'Products',     label: 'Produk & Layanan', icon: Package         },
  { id: 'Customers',    label: 'Klien',            icon: Users           },
  ...(isAdmin ? [{ id: 'Reports', label: 'Laporan', icon: BarChart2 }] : []),
  { id: 'Settings',     label: 'Pengaturan',       icon: Settings        },
];

// ════════════════════════════════════════════════════════════
export class ArtavistaDashboardUI extends React.Component<IArtavistaDashboardUIProps, IArtavistaDashboardUIState> {
  private containerRef = React.createRef<HTMLDivElement>();
  private resizeObserver: ResizeObserver | null = null;

  constructor(props: IArtavistaDashboardUIProps) {
    super(props);
    this.state = {
      activeMenu: 'Dashboard',
      isCollapsed: false,
      containerWidth: 1200,
      isMobileMenuOpen: false,
    };
  }

  componentDidMount() {
    this.resizeObserver = new ResizeObserver(entries => {
      for (const entry of entries) {
        const w = entry.contentRect.width;
        this.setState({ containerWidth: w });
        // auto-collapse sidebar on tablet
        if (w < BP.TABLET && w >= BP.MOBILE) this.setState({ isCollapsed: true });
        if (w >= BP.TABLET) this.setState({ isCollapsed: false });
      }
    });
    if (this.containerRef.current) {
      this.resizeObserver.observe(this.containerRef.current);
    }
  }

  componentWillUnmount() {
    this.resizeObserver?.disconnect();
  }

  render() {
    const { userName, totalTask, userRole, contents, products, customers, schedules, triggerAction, logoSrc } = this.props;
    const { activeMenu, isCollapsed, containerWidth, isMobileMenuOpen } = this.state;

    const isMobile = containerWidth < BP.MOBILE;
    const isTablet = containerWidth >= BP.MOBILE && containerWidth < BP.TABLET;
    const isAdmin = !userRole || userRole.toLowerCase() === 'admin';
    const menus = MENU_ITEMS(isAdmin);

    const sidebarWidth = isMobile ? SW.full
      : isCollapsed ? SW.collapsed : SW.full;
    const collapsed = !isMobile && isCollapsed;

    const logoSrc_ = logoSrc || LOGO_BASE64;

    const navigate = (menu: string) => {
      this.setState({ activeMenu: menu, isMobileMenuOpen: false });
    };

    const handleAction = (actionName: string, recordId?: string) => {
      if (triggerAction) triggerAction(actionName, recordId);
    };

    const sharedProps = { navigate, onAction: handleAction, userRole: userRole || 'Admin' };

    // Decide what content to render
    const renderContent = () => {
      const c = contents || [];
      const p = products || [];
      const cu = customers || [];
      const sc = schedules || [];
      const isEmpty = c.length === 0;

      switch (activeMenu) {
        case 'Transactions': return <TransactionsView {...sharedProps} contents={c} isEmpty={isEmpty} isMobile={isMobile} />;
        case 'Schedule':     return <ScheduleView     {...sharedProps} schedules={sc} isMobile={isMobile} />;
        case 'Products':     return <ProductsView     {...sharedProps} products={p} isEmpty={p.length === 0} isMobile={isMobile} />;
        case 'Customers':    return <CustomersView    {...sharedProps} customers={cu} isEmpty={cu.length === 0} isMobile={isMobile} />;
        case 'Reports':      return isAdmin ? <ReportsView {...sharedProps} contents={c} products={p} customers={cu} isMobile={isMobile} /> : null;
        case 'Settings':     return <SettingsView     {...sharedProps} />;
        default: return (
          <DashboardView
            {...sharedProps}
            contents={c} customers={cu} schedules={sc}
            totalTask={totalTask || '0'} isEmpty={isEmpty}
            isMobile={isMobile} isTablet={isTablet}
          />
        );
      }
    };

    return (
      <div
        ref={this.containerRef}
        style={{
          position: 'relative', display: 'flex', flexDirection: 'row',
          width: '100%', height: '100%', minHeight: '100vh',
          background: '#EEF2FB',
          fontFamily: "'Inter', system-ui, -apple-system, sans-serif",
          overflow: 'hidden', boxSizing: 'border-box',
        }}
      >
        {/* ── Mobile Overlay ── */}
        {isMobile && isMobileMenuOpen && (
          <div
            onClick={() => this.setState({ isMobileMenuOpen: false })}
            style={{ position: 'absolute', inset: 0, background: 'rgba(5,20,60,0.5)', zIndex: 90, backdropFilter: 'blur(3px)' }}
          />
        )}

        {/* ═══════════════ SIDEBAR ═══════════════ */}
        <aside style={{
          position: isMobile ? 'absolute' : 'relative',
          left: isMobile ? (isMobileMenuOpen ? '0' : `-${SW.full + 10}px`) : '0',
          top: 0, bottom: 0,
          width: `${sidebarWidth}px`, flexShrink: 0,
          background: 'linear-gradient(160deg, #054CC7 0%, #0341A8 100%)',
          display: 'flex', flexDirection: 'column',
          padding: collapsed ? '24px 10px' : '24px 16px',
          transition: 'left 0.3s ease, width 0.3s ease, padding 0.3s ease',
          zIndex: 100, overflow: 'hidden',
          boxShadow: isMobile && isMobileMenuOpen
            ? `${SW.full}px 0 60px rgba(5,76,199,0.25)`
            : '4px 0 16px rgba(5,76,199,0.15)',
        }}>

          {/* Logo */}
          <div style={{
            display: 'flex', alignItems: 'center',
            justifyContent: collapsed ? 'center' : 'space-between',
            height: '58px', flexShrink: 0, marginBottom: '8px',
            paddingBottom: '16px', borderBottom: '1px solid rgba(255,255,255,0.12)',
          }}>
            {collapsed ? (
              <div onClick={() => this.setState({ activeMenu: 'Dashboard' })} style={{
                background: '#17C3CC', width: '38px', height: '38px', borderRadius: '10px',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontWeight: 800, fontSize: '18px', color: 'white', cursor: 'pointer',
                boxShadow: '0 4px 12px rgba(23,195,204,0.4)',
              }}>A</div>
            ) : (
              <>
                <img
                  src={logoSrc_} alt="Artavista"
                  onClick={() => this.setState({ activeMenu: 'Dashboard' })}
                  style={{ height: '36px', width: 'auto', objectFit: 'contain', cursor: 'pointer', flexShrink: 0, display: 'block' }}
                />
                {isMobile && (
                  <button onClick={() => this.setState({ isMobileMenuOpen: false })}
                    style={{ background: 'rgba(255,255,255,0.15)', border: 'none', borderRadius: '8px', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', cursor: 'pointer', flexShrink: 0 }}>
                    <X size={17} />
                  </button>
                )}
              </>
            )}
          </div>

          {/* Nav Items */}
          <nav style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden', marginTop: '8px' }}>
            {menus.map(menu => {
              const isActive = activeMenu === menu.id;
              const Icon = menu.icon;
              return (
                <button
                  key={menu.id}
                  onClick={() => navigate(menu.id)}
                  title={collapsed ? menu.label : undefined}
                  style={{
                    display: 'flex', alignItems: 'center',
                    gap: collapsed ? '0' : '12px',
                    justifyContent: collapsed ? 'center' : 'flex-start',
                    width: '100%', padding: collapsed ? '12px' : '11px 14px',
                    marginBottom: '3px', borderRadius: '12px',
                    background: isActive ? 'rgba(255,255,255,0.15)' : 'transparent',
                    border: isActive ? '1px solid rgba(255,255,255,0.2)' : '1px solid transparent',
                    color: isActive ? 'white' : 'rgba(255,255,255,0.65)',
                    cursor: 'pointer', textAlign: 'left', fontFamily: 'inherit',
                    fontSize: '13.5px', fontWeight: isActive ? 700 : 500,
                    transition: 'all 0.15s', boxSizing: 'border-box',
                    whiteSpace: 'nowrap', overflow: 'hidden',
                  }}
                  onMouseEnter={e => { if (!isActive) (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.08)'; }}
                  onMouseLeave={e => { if (!isActive) (e.currentTarget as HTMLButtonElement).style.background = 'transparent'; }}
                >
                  <Icon size={18} style={{ flexShrink: 0 }} />
                  {!collapsed && <span>{menu.label}</span>}
                  {/* Badges contoh: notif proyek urgent */}
                  {!collapsed && menu.id === 'Schedule' && (schedules || []).filter(s => {
                    const d = s.deadline ? new Date(s.deadline) : null;
                    if (!d) return false;
                    const diff = Math.ceil((d.getTime() - Date.now()) / 86400000);
                    return diff >= 0 && diff <= 3 && s.status !== 'Selesai';
                  }).length > 0 && (
                    <span style={{
                      marginLeft: 'auto', background: '#EF4444', color: 'white',
                      borderRadius: '10px', padding: '1px 7px', fontSize: '10px', fontWeight: 700,
                    }}>
                      {(schedules || []).filter(s => {
                        const d = s.deadline ? new Date(s.deadline) : null;
                        if (!d) return false;
                        const diff = Math.ceil((d.getTime() - Date.now()) / 86400000);
                        return diff >= 0 && diff <= 3 && s.status !== 'Selesai';
                      }).length}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Collapse / User Info */}
          <div style={{ flexShrink: 0, paddingTop: '12px', borderTop: '1px solid rgba(255,255,255,0.12)' }}>
            {/* User info (expanded only) */}
            {!collapsed && !isMobile && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 14px', background: 'rgba(255,255,255,0.08)', borderRadius: '12px', marginBottom: '10px' }}>
                <div style={{ width: '32px', height: '32px', borderRadius: '9px', background: 'linear-gradient(135deg, #17C3CC, #7C3AED)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontWeight: 700, color: 'white', fontSize: '13px' }}>
                  {(userName || 'A')[0].toUpperCase()}
                </div>
                <div style={{ minWidth: 0 }}>
                  <p style={{ margin: 0, fontSize: '12.5px', fontWeight: 700, color: 'white', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', textAlign: 'left' }}>{userName || 'Admin'}</p>
                  <p style={{ margin: 0, fontSize: '10.5px', color: 'rgba(255,255,255,0.55)', textAlign: 'left' }}>{userRole || 'Admin'}</p>
                </div>
              </div>
            )}
            {/* Collapse button (desktop only) */}
            {!isMobile && (
              <button
                onClick={() => this.setState({ isCollapsed: !isCollapsed })}
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: collapsed ? 'center' : 'flex-start',
                  gap: '8px', width: '100%', padding: '10px 14px',
                  background: 'rgba(255,255,255,0.08)', border: 'none', borderRadius: '12px',
                  color: 'rgba(255,255,255,0.7)', cursor: 'pointer', fontFamily: 'inherit', fontSize: '12.5px',
                  transition: 'background 0.15s',
                }}
                onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.15)')}
                onMouseLeave={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.08)')}
              >
                {collapsed ? <ChevronRight size={16} /> : <><ChevronLeft size={16} /><span>Tutup</span></>}
              </button>
            )}
          </div>
        </aside>

        {/* ═══════════════ MAIN AREA ═══════════════ */}
        <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', overflow: 'auto' }}>

          {/* Top Bar */}
          <header style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: isMobile ? '14px 16px' : '16px 24px',
            background: 'white', borderBottom: '1px solid #EEF2F9',
            boxShadow: '0 1px 4px rgba(0,0,0,0.04)', flexShrink: 0,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
              {isMobile && (
                <button onClick={() => this.setState({ isMobileMenuOpen: true })}
                  style={{ background: '#F1F5F9', border: 'none', borderRadius: '10px', padding: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', color: '#475569' }}>
                  <Menu size={20} />
                </button>
              )}
              <h1 style={{ margin: 0, fontSize: isMobile ? '16px' : '18px', fontWeight: 800, color: '#1E293B', textAlign: 'left' }}>
                {menus.find(m => m.id === activeMenu)?.label || 'Dashboard'}
              </h1>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              {!isMobile && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '10px', padding: '8px 14px' }}>
                  <Search size={14} color="#94A3B8" />
                  <input type="text" placeholder="Cari..." style={{ border: 'none', outline: 'none', background: 'transparent', fontSize: '13px', color: '#334155', width: '140px', fontFamily: 'inherit' }} />
                </div>
              )}
              <button style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '10px', padding: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', position: 'relative' }}>
                <Bell size={18} color="#64748B" />
              </button>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'linear-gradient(135deg, #054CC7, #17C3CC)', borderRadius: '10px', padding: '7px 12px', cursor: 'pointer' }}>
                <div style={{ width: '22px', height: '22px', borderRadius: '6px', background: 'rgba(255,255,255,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: 800, color: 'white' }}>
                  {(userName || 'A')[0].toUpperCase()}
                </div>
                {!isMobile && <span style={{ fontSize: '13px', fontWeight: 600, color: 'white' }}>{userName || 'Admin'}</span>}
              </div>
            </div>
          </header>

          {/* Page Content */}
          <main style={{ flex: 1, padding: isMobile ? '16px' : '24px', overflowY: 'auto' }}>
            {renderContent()}
          </main>
        </div>
      </div>
    );
  }
}