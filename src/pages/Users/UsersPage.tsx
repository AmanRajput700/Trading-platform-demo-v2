import React, { useState } from 'react';
import { 
  Users, 
  UserCheck, 
  UserX, 
  ShieldAlert, 
  Search, 
  Download, 
  Lock, 
  Unlock, 
  Coins, 
  TrendingUp, 
  TrendingDown, 
  CheckCircle2
} from 'lucide-react';
import { useTrading } from '../../context/TradingContext';
import { PageHeader } from '../../components/common/PageHeader';

export const UsersPage: React.FC = () => {
  const { 
    clientUsers, 
    toggleBlockUser, 
    userRole, 
    setCurrentPage, 
    addToast 
  } = useTrading();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTIVE' | 'BLOCKED'>('ALL');
  const [brokerFilter, setBrokerFilter] = useState<string>('ALL');

  // Permission Gate: Only Admin & SuperAdmin can access user management
  const canAccess = userRole === 'superadmin' || userRole === 'admin';

  if (!canAccess) {
    return (
      <div style={{ padding: 'var(--space-6)', maxWidth: 800, margin: '60px auto', textAlign: 'center' }}>
        <div className="surface-card" style={{ padding: '40px 24px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14 }}>
          <div style={{
            width: 56,
            height: 56,
            borderRadius: '50%',
            backgroundColor: 'var(--negative-bg)',
            color: 'var(--negative)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: '1px solid var(--negative-border)'
          }}>
            <ShieldAlert size={28} />
          </div>
          <h2 style={{ fontSize: 20, fontWeight: 700, margin: 0 }}>Restricted Administrator Zone</h2>
          <p style={{ fontSize: 13, color: 'var(--text-secondary)', maxWidth: 440, lineHeight: 1.5 }}>
            User management, risk control, and trader account suspension controls are reserved for <strong>Client Desk Admins</strong> and <strong>Superadmins</strong>.
          </p>
          <button
            onClick={() => setCurrentPage('dashboard')}
            className="btn btn-primary"
            style={{ marginTop: 8 }}
          >
            Return to Dashboard
          </button>
        </div>
      </div>
    );
  }

  // Filtered Users
  const filteredUsers = clientUsers.filter(user => {
    const matchesSearch = 
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.clientId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.broker.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === 'ALL' || user.status === statusFilter;
    const matchesBroker = brokerFilter === 'ALL' || user.broker.toLowerCase().includes(brokerFilter.toLowerCase());

    return matchesSearch && matchesStatus && matchesBroker;
  });

  // Aggregated Stats
  const totalUsers = clientUsers.length;
  const activeUsers = clientUsers.filter(u => u.status === 'ACTIVE').length;
  const blockedUsers = clientUsers.filter(u => u.status === 'BLOCKED').length;
  const totalAum = clientUsers.reduce((sum, u) => sum + u.balance, 0);
  const totalActivePositions = clientUsers.reduce((sum, u) => sum + u.openPositionsCount, 0);
  const totalClientPnl = clientUsers.reduce((sum, u) => sum + u.totalPnl, 0);

  const handleExportCsv = () => {
    const headers = 'Client ID,Name,Email,Phone,Broker,Balance,Positions,Total PnL,Status,Joined Date\n';
    const rows = clientUsers.map(u => 
      `"${u.clientId}","${u.name}","${u.email}","${u.phone}","${u.broker}",${u.balance},${u.openPositionsCount},${u.totalPnl},"${u.status}","${u.joinedDate}"`
    ).join('\n');

    const blob = new Blob([headers + rows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `AuraTrade_Client_Users_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);

    addToast({
      type: 'success',
      title: 'Client Database Exported',
      message: `Exported ${clientUsers.length} user records to CSV.`
    });
  };

  return (
    <div style={{ padding: 'var(--space-6)', maxWidth: 1280, margin: '0 auto', width: '100%', display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>
      {/* Page Header */}
      <PageHeader
        title="Client User Management"
        subtitle={`Administer ${totalUsers} registered trader accounts, manage broker accounts, and enforce risk suspension`}
        badge={{ text: userRole === 'superadmin' ? 'Superadmin Desk' : 'Client Admin Desk', variant: 'accent' }}
        actions={
          <div style={{ display: 'flex', gap: 8 }}>
            <button
              onClick={handleExportCsv}
              className="btn btn-secondary btn-sm"
              style={{ gap: 6 }}
            >
              <Download size={13} />
              <span>Export CSV</span>
            </button>
          </div>
        }
      />

      {/* Admin Statistics Row */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: 'var(--space-4)'
      }}>
        {/* Total Users */}
        <div className="surface-card" style={{ padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: 4 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>
              Total Traders
            </span>
            <Users size={16} style={{ color: 'var(--accent-primary)' }} />
          </div>
          <div className="mono" style={{ fontSize: 24, fontWeight: 800 }}>
            {totalUsers}
          </div>
          <div style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>
            Registered on Platform
          </div>
        </div>

        {/* Active Accounts */}
        <div className="surface-card" style={{ padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: 4 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>
              Active Traders
            </span>
            <UserCheck size={16} style={{ color: 'var(--positive)' }} />
          </div>
          <div className="mono text-positive" style={{ fontSize: 24, fontWeight: 800 }}>
            {activeUsers}
          </div>
          <div style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>
            {( (activeUsers / totalUsers) * 100 ).toFixed(0)}% Trading Permitted
          </div>
        </div>

        {/* Blocked Accounts */}
        <div className="surface-card" style={{ padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: 4 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>
              Suspended / Blocked
            </span>
            <UserX size={16} style={{ color: blockedUsers > 0 ? 'var(--negative)' : 'var(--text-tertiary)' }} />
          </div>
          <div className="mono text-negative" style={{ fontSize: 24, fontWeight: 800 }}>
            {blockedUsers}
          </div>
          <div style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>
            Orders Halt Enforced
          </div>
        </div>

        {/* Total Client Margin AUM */}
        <div className="surface-card" style={{ padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: 4 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>
              Client Total AUM
            </span>
            <Coins size={16} style={{ color: 'var(--accent-primary)' }} />
          </div>
          <div className="mono" style={{ fontSize: 22, fontWeight: 800 }}>
            ₹{(totalAum / 100000).toFixed(2)}L
          </div>
          <div style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>
            ₹{totalAum.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </div>
        </div>

        {/* Aggregate P&L */}
        <div className="surface-card" style={{ padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: 4 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>
              Aggregate Desk P&L
            </span>
            {totalClientPnl >= 0 ? <TrendingUp size={16} style={{ color: 'var(--positive)' }} /> : <TrendingDown size={16} style={{ color: 'var(--negative)' }} />}
          </div>
          <div className={`mono ${totalClientPnl >= 0 ? 'text-positive' : 'text-negative'}`} style={{ fontSize: 22, fontWeight: 800 }}>
            {totalClientPnl >= 0 ? '+' : ''}₹{totalClientPnl.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </div>
          <div style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>
            {totalActivePositions} Open Positions
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="surface-card" style={{ padding: '12px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flex: 1, minWidth: 260 }}>
          <div style={{ position: 'relative', width: '100%', maxWidth: 320 }}>
            <Search size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-tertiary)' }} />
            <input
              type="text"
              placeholder="Search by Name, Client ID, Email..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="input"
              style={{ paddingLeft: 32, height: 32, fontSize: 12, width: '100%' }}
            />
          </div>

          {/* Status Filter Tabs */}
          <div style={{ display: 'flex', gap: 4 }}>
            {(['ALL', 'ACTIVE', 'BLOCKED'] as const).map(st => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                style={{
                  padding: '4px 10px',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: 11,
                  fontWeight: statusFilter === st ? 700 : 500,
                  backgroundColor: statusFilter === st ? 'var(--text-primary)' : 'var(--bg-sunken)',
                  color: statusFilter === st ? '#FFFFFF' : 'var(--text-secondary)',
                  border: '1px solid var(--border-default)',
                  cursor: 'pointer'
                }}
              >
                {st === 'ALL' ? `All (${totalUsers})` : st === 'ACTIVE' ? `Active (${activeUsers})` : `Blocked (${blockedUsers})`}
              </button>
            ))}
          </div>
        </div>

        {/* Broker Filter Dropdown */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-secondary)' }}>BROKER:</span>
          <select
            value={brokerFilter}
            onChange={e => setBrokerFilter(e.target.value)}
            className="select"
            style={{ height: 32, fontSize: 11.5, minWidth: 140 }}
          >
            <option value="ALL">All Brokers</option>
            <option value="Zerodha">Zerodha Kite</option>
            <option value="Angel One">Angel One</option>
            <option value="Motilal Oswal">Motilal Oswal</option>
            <option value="Groww">Groww Invest</option>
            <option value="Upstox">Upstox Pro</option>
          </select>
        </div>
      </div>

      {/* Main Users Table */}
      <div className="surface-card" style={{ overflowX: 'auto' }}>
        <table className="data-table">
          <thead>
            <tr>
              <th>Trader / Client</th>
              <th>Client ID</th>
              <th>Linked Broker</th>
              <th className="text-right">Demat Balance (₹)</th>
              <th className="text-center">Positions</th>
              <th className="text-right">Total P&L (₹)</th>
              <th className="text-center">Status</th>
              <th>Last Active</th>
              <th className="text-right" style={{ paddingRight: 20 }}>Desk Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.length === 0 ? (
              <tr>
                <td colSpan={9} style={{ textAlign: 'center', padding: '36px', color: 'var(--text-secondary)' }}>
                  No trader clients match your filter criteria.
                </td>
              </tr>
            ) : (
              filteredUsers.map(user => {
                const isBlocked = user.status === 'BLOCKED';
                const isPnlPositive = user.totalPnl >= 0;

                return (
                  <tr key={user.id} style={{ backgroundColor: isBlocked ? 'rgba(235, 94, 85, 0.04)' : undefined }}>
                    {/* Name & Email with Avatar */}
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{
                          width: 32,
                          height: 32,
                          borderRadius: '50%',
                          backgroundColor: isBlocked ? 'var(--negative-bg)' : 'var(--bg-sunken)',
                          color: isBlocked ? 'var(--negative)' : 'var(--accent-primary)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontWeight: 700,
                          fontSize: 11,
                          border: isBlocked ? '1px solid var(--negative-border)' : '1px solid var(--border-default)'
                        }}>
                          {user.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                        </div>
                        <div>
                          <div style={{ fontWeight: 700, fontSize: 13 }}>{user.name}</div>
                          <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>{user.email}</div>
                        </div>
                      </div>
                    </td>

                    {/* Client ID */}
                    <td className="mono" style={{ fontWeight: 700, fontSize: 12 }}>
                      {user.clientId}
                    </td>

                    {/* Broker */}
                    <td>
                      <span className="badge badge-neutral" style={{ fontSize: 10 }}>
                        {user.broker}
                      </span>
                    </td>

                    {/* Balance */}
                    <td className="text-right mono" style={{ fontWeight: 700 }}>
                      ₹{user.balance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </td>

                    {/* Open Positions */}
                    <td className="text-center">
                      <span className={`badge ${user.openPositionsCount > 0 ? 'badge-accent' : 'badge-neutral'}`} style={{ fontSize: 10 }}>
                        {user.openPositionsCount} Open
                      </span>
                    </td>

                    {/* Total P&L */}
                    <td className={`text-right mono ${isPnlPositive ? 'text-positive' : 'text-negative'}`} style={{ fontWeight: 700 }}>
                      {isPnlPositive ? '+' : ''}₹{user.totalPnl.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </td>

                    {/* Status Badge */}
                    <td className="text-center">
                      <span className={`badge ${isBlocked ? 'badge-negative' : 'badge-positive'}`} style={{ fontSize: 10, display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                        {isBlocked ? <Lock size={10} /> : <CheckCircle2 size={10} />}
                        <span>{user.status}</span>
                      </span>
                    </td>

                    {/* Last Active */}
                    <td style={{ fontSize: 11, color: 'var(--text-secondary)' }}>
                      {user.lastActive}
                    </td>

                    {/* Action: Block / Unblock Button */}
                    <td className="text-right" style={{ paddingRight: 20 }}>
                      <button
                        onClick={() => toggleBlockUser(user.id)}
                        className={`btn btn-sm ${isBlocked ? 'btn-buy' : 'btn-sell'}`}
                        style={{
                          height: 26,
                          fontSize: 11,
                          fontWeight: 700,
                          padding: '0 10px',
                          gap: 4
                        }}
                        title={isBlocked ? `Unblock ${user.name} to allow trading` : `Suspend & block ${user.name} from placing orders`}
                      >
                        {isBlocked ? (
                          <>
                            <Unlock size={12} />
                            <span>Unblock</span>
                          </>
                        ) : (
                          <>
                            <Lock size={12} />
                            <span>Block User</span>
                          </>
                        )}
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
