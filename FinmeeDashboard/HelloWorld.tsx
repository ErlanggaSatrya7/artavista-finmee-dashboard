import * as React from 'react';
import {
  LayoutDashboard, CreditCard, PieChart as PieIcon, Settings, HelpCircle,
  LogOut, Search, Bell, Plus, MoreHorizontal, ArrowUpRight, ArrowDownLeft
} from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell
} from 'recharts';

// --- DATA DUMMY ---
const cashflowData = [
  { name: 'Jan', income: 400, expense: 240 },
  { name: 'Feb', income: 300, expense: 139 },
  { name: 'Mar', income: 200, expense: 980 },
  { name: 'Apr', income: 278, expense: 390 },
  { name: 'May', income: 189, expense: 480 },
  { name: 'Jun', income: 239, expense: 380 },
  { name: 'Jul', income: 349, expense: 430 },
];

const statsData = [
  { name: 'Salary', value: 191, color: '#4F46E5' },
  { name: 'Freelance', value: 127, color: '#06B6D4' },
  { name: 'Transfer', value: 106, color: '#F43F5E' },
];

const transactions = [
  { id: '1', name: 'Bank Transfer', date: 'Oct 28, 2025', type: 'Income', amount: '+ $17.00', icon: <ArrowUpRight size={16} /> },
  { id: '2', name: 'House Rent', date: 'Oct 27, 2025', type: 'Housing', amount: '- $900.00', icon: <ArrowDownLeft size={16} /> },
  { id: '3', name: 'Figma Subs', date: 'Oct 26, 2025', type: 'Entertainment', amount: '- $19.99', icon: <ArrowDownLeft size={16} /> },
];

export class FinmeeDashboardUI extends React.Component {
  public render(): React.ReactNode {
    return (
      <div className="finmee-container">

        {/* SIDEBAR */}
        <div className="finmee-sidebar">
          <h2 style={{ color: '#4F46E5', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
            <div style={{ background: '#4F46E5', color: 'white', padding: '5px', borderRadius: '8px' }}>F</div>
            Finmee
          </h2>
          <nav style={{ marginTop: '30px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div className="nav-item active" style={{ color: '#4F46E5', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '10px', background: '#EEF2FF', padding: '12px', borderRadius: '12px', cursor: 'pointer' }}>
              <LayoutDashboard size={20} /> Dashboard
            </div>
            {['Transaction', 'Analytics', 'Cards', 'Planning'].map((item, index) => (
              <div key={index} style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#8A8A98', padding: '12px', cursor: 'pointer' }}>
                <CreditCard size={20} /> {item}
              </div>
            ))}
          </nav>

          <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: '10px', color: '#8A8A98' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px', cursor: 'pointer' }}><Settings size={20} /> Setting</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px', cursor: 'pointer' }}><HelpCircle size={20} /> Help</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px', cursor: 'pointer', color: '#E11D48' }}><LogOut size={20} /> Log Out</div>
          </div>
        </div>

        {/* MAIN CONTENT */}
        <div className="finmee-main">

          {/* HEADER */}
          <div className="finmee-header">
            <div>
              <h1 style={{ margin: 0, fontSize: '24px' }}>Good Afternoon, Athena!</h1>
              <p style={{ margin: 0, color: '#8A8A98', fontSize: '14px' }}>Senang melihat Anda kembali di dashboard Artavista.</p>
            </div>
            <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', background: 'white', padding: '8px 15px', borderRadius: '20px', border: '1px solid #EFEFEF' }}>
                <Search size={16} color="#8A8A98" />
                <input type="text" placeholder="Search Anything..." style={{ border: 'none', outline: 'none', marginLeft: '10px' }} />
              </div>
              <Bell size={20} color="#8A8A98" style={{ cursor: 'pointer' }} />
              <button style={{ background: '#4F46E5', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '10px', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontWeight: '600' }}>
                Add Transaction <Plus size={18} />
              </button>
            </div>
          </div>

          <div className="finmee-dashboard-grid">

            {/* COLUMN LEFT & MIDDLE */}
            <div className="middle-column">
              <div className="summary-row">
                {[
                  { label: 'Total Balance', val: '$3,420.55', color: '#4F46E5' },
                  { label: 'Monthly Income', val: '$820.00', color: '#06B6D4' },
                  { label: 'Monthly Expenses', val: '$470.30', color: '#F43F5E' },
                  { label: 'Savings', val: '$320.00', color: '#F59E0B' }
                ].map((box, i) => (
                  <div key={i} className="summary-box finmee-card">
                    <p style={{ margin: 0, color: '#8A8A98', fontSize: '12px' }}>{box.label}</p>
                    <h3 style={{ margin: '5px 0', color: '#1E1E2D' }}>{box.val}</h3>
                    <span style={{ fontSize: '10px', color: '#10B981' }}>+2.5% vs last month</span>
                  </div>
                ))}
              </div>

              {/* CASHFLOW CHART */}
              <div className="finmee-card" style={{ marginBottom: '25px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
                  <h3 style={{ margin: 0 }}>Balance Cashflow</h3>
                  <select style={{ border: '1px solid #EFEFEF', borderRadius: '8px', padding: '5px' }}>
                    <option>Monthly</option>
                  </select>
                </div>
                <div style={{ width: '100%', height: 250 }}>
                  <ResponsiveContainer>
                    <AreaChart data={cashflowData}>
                      <defs>
                        <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#4F46E5" stopOpacity={0.1} />
                          <stop offset="95%" stopColor="#4F46E5" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F0F0F0" />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#8A8A98', fontSize: 12 }} />
                      <YAxis hide />
                      <Tooltip />
                      <Area type="monotone" dataKey="income" stroke="#4F46E5" fillOpacity={1} fill="url(#colorIncome)" strokeWidth={3} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* TRANSACTION TABLE */}
              <div className="finmee-card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h3 style={{ margin: 0 }}>Transaction History</h3>
                  <button style={{ background: 'none', border: 'none', color: '#4F46E5', fontWeight: '600', cursor: 'pointer' }}>See All</button>
                </div>
                <table className="transaction-table">
                  <thead>
                    <tr>
                      <th>Receiver</th>
                      <th>Type</th>
                      <th>Date</th>
                      <th>Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {transactions.map((t) => (
                      <tr key={t.id}>
                        <td style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <div style={{ background: '#F8F9FE', padding: '8px', borderRadius: '8px', color: '#4F46E5' }}>{t.icon}</div>
                          {t.name}
                        </td>
                        <td>{t.type}</td>
                        <td style={{ color: '#8A8A98' }}>{t.date}</td>
                        <td className={t.amount.includes('+') ? 'status-income' : 'status-expense'}>{t.amount}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* COLUMN RIGHT */}
            <div className="right-column">
              <div className="finmee-card" style={{ marginBottom: '25px', background: '#1E1E2D', color: 'white' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <p style={{ opacity: 0.7 }}>My Cards</p>
                  <Plus size={20} style={{ cursor: 'pointer' }} />
                </div>
                <div style={{ marginTop: '40px' }}>
                  <h4 style={{ letterSpacing: '4px', fontSize: '18px', margin: '10px 0' }}>**** **** **** 9678</h4>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '20px', opacity: 0.8, fontSize: '12px' }}>
                    <span>ATHENA LIU</span>
                    <span>02/26</span>
                  </div>
                </div>
              </div>

              <div className="finmee-card" style={{ marginBottom: '25px' }}>
                <h3 style={{ margin: 0 }}>Next Payment</h3>
                <div style={{ marginTop: '15px' }}>
                  {[{ n: 'Netflix', p: '$15.99' }, { n: 'Spotify', p: '$9.99' }].map((item, i) => (
                    <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid #F8F8F8' }}>
                      <span style={{ fontSize: '14px' }}>{item.n}</span>
                      <span style={{ fontWeight: '600' }}>{item.p}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="finmee-card">
                <h3>Statistics</h3>
                <div style={{ height: 200 }}>
                  <ResponsiveContainer>
                    <PieChart>
                      <Pie data={statsData} innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                        {statsData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                  <div style={{ textAlign: 'center', marginTop: '-120px' }}>
                    <h2 style={{ margin: 0 }}>$425</h2>
                    <p style={{ fontSize: '12px', color: '#8A8A98' }}>Total Income</p>
                  </div>
                </div>
                <div style={{ marginTop: '80px' }}>
                  {statsData.map((s, i) => (
                    <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '5px' }}>
                      <span><span style={{ color: s.color }}>●</span> {s.name}</span>
                      <span style={{ fontWeight: '600' }}>${s.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    );
  }
}