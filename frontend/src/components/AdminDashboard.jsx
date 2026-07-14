import React, { useState, useEffect } from 'react';
import { useMootCourt } from '../context/MootCourtContext';
import { 
  Users, 
  UserCheck, 
  UserX, 
  Shield, 
  Search, 
  Settings, 
  RotateCcw,
  AlertCircle
} from 'lucide-react';

const AdminDashboard = () => {
  const { currentUserId } = useMootCourt();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('all'); // 'all', 'admin', 'user'
  const [statusFilter, setStatusFilter] = useState('all'); // 'all', 'active', 'inactive'
  
  const fetchUsers = async () => {
    if (!currentUserId) return;
    setLoading(true);
    setErrorMsg('');
    try {
      const response = await fetch('/admin/users', {
        headers: {
          'X-User-Id': currentUserId
        }
      });
      const data = await response.json();
      if (response.ok && data.success) {
        setUsers(data.users);
      } else {
        setErrorMsg(data.detail || 'Failed to fetch user list.');
      }
    } catch (err) {
      console.error(err);
      setErrorMsg('Server connection failed. Could not load database.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [currentUserId]);

  const handleToggleStatus = async (targetUser) => {
    const newStatus = targetUser.is_active === 1 ? 0 : 1;
    try {
      const response = await fetch(`/admin/users/${targetUser.id}/status`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-User-Id': currentUserId
        },
        body: JSON.stringify({ is_active: newStatus })
      });
      const data = await response.json();
      if (response.ok && data.success) {
        setUsers(users.map(u => u.id === targetUser.id ? { ...u, is_active: newStatus } : u));
      } else {
        alert(data.detail || 'Failed to update user status.');
      }
    } catch (err) {
      console.error(err);
      alert('Error updating user status.');
    }
  };

  const handleToggleAdmin = async (targetUser) => {
    if (targetUser.id === currentUserId) {
      alert("Error: You cannot revoke admin permissions from your own account.");
      return;
    }
    const newAdminVal = targetUser.is_admin === 1 ? 0 : 1;
    try {
      const response = await fetch(`/admin/users/${targetUser.id}/admin`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-User-Id': currentUserId
        },
        body: JSON.stringify({ is_admin: newAdminVal })
      });
      const data = await response.json();
      if (response.ok && data.success) {
        setUsers(users.map(u => u.id === targetUser.id ? { ...u, is_admin: newAdminVal } : u));
      } else {
        alert(data.detail || 'Failed to update admin permissions.');
      }
    } catch (err) {
      console.error(err);
      alert('Error updating admin permissions.');
    }
  };

  // Stats calculation
  const totalUsers = users.length;
  const activeUsers = users.filter(u => u.is_active === 1).length;
  const inactiveUsers = users.filter(u => u.is_active === 0).length;
  const adminUsers = users.filter(u => u.is_admin === 1).length;

  // Filter list
  const filteredUsers = users.filter(u => {
    const matchesSearch = 
      u.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (u.full_name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (u.college || '').toLowerCase().includes(searchQuery.toLowerCase());
      
    const matchesRole = 
      roleFilter === 'all' || 
      (roleFilter === 'admin' && u.is_admin === 1) || 
      (roleFilter === 'user' && u.is_admin === 0);

    const matchesStatus = 
      statusFilter === 'all' || 
      (statusFilter === 'active' && u.is_active === 1) || 
      (statusFilter === 'inactive' && u.is_active === 0);

    return matchesSearch && matchesRole && matchesStatus;
  });

  return (
    <div style={{
      padding: '24px 32px',
      background: '#040810',
      minHeight: 'calc(100vh - 70px)',
      color: '#ffffff',
      fontFamily: 'var(--font-sans)',
      overflowY: 'auto'
    }} className="animate-fade-in">
      
      {/* Header Info */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.6rem', fontWeight: '700', margin: '0 0 4px 0' }}>
            ⚙️ Administrator Console
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.82rem', margin: 0 }}>
            Manage user accounts, check registrations, and toggle access parameters.
          </p>
        </div>
        
        <button 
          onClick={fetchUsers} 
          className="btn btn-secondary"
          style={{ padding: '8px 16px', display: 'flex', alignItems: 'center', gap: '8px' }}
        >
          <RotateCcw size={14} /> Refresh List
        </button>
      </div>

      {errorMsg && (
        <div className="glass-panel" style={{ padding: '16px', borderLeft: '4px solid var(--color-danger)', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <AlertCircle color="var(--color-danger)" size={18} />
          <span style={{ fontSize: '0.85rem', color: 'var(--color-danger)' }}>{errorMsg}</span>
        </div>
      )}

      {/* Statistics Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap: '20px',
        marginBottom: '24px'
      }}>
        {/* Card 1: Total */}
        <div className="glass-panel" style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ padding: '10px', borderRadius: '8px', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-glass)', color: '#ffffff' }}>
            <Users size={20} />
          </div>
          <div>
            <h4 style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Total Registered</h4>
            <div style={{ fontSize: '1.4rem', fontWeight: '700', color: '#ffffff', marginTop: '2px' }}>{totalUsers}</div>
          </div>
        </div>

        {/* Card 2: Active */}
        <div className="glass-panel" style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ padding: '10px', borderRadius: '8px', background: 'rgba(16, 185, 129, 0.08)', border: '1px solid rgba(16, 185, 129, 0.2)', color: 'var(--color-success)' }}>
            <UserCheck size={20} />
          </div>
          <div>
            <h4 style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Active Accounts</h4>
            <div style={{ fontSize: '1.4rem', fontWeight: '700', color: 'var(--color-success)', marginTop: '2px' }}>{activeUsers}</div>
          </div>
        </div>

        {/* Card 3: Deactivated */}
        <div className="glass-panel" style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ padding: '10px', borderRadius: '8px', background: 'rgba(239, 68, 68, 0.08)', border: '1px solid rgba(239, 68, 68, 0.2)', color: 'var(--color-danger)' }}>
            <UserX size={20} />
          </div>
          <div>
            <h4 style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Deactivated</h4>
            <div style={{ fontSize: '1.4rem', fontWeight: '700', color: 'var(--color-danger)', marginTop: '2px' }}>{inactiveUsers}</div>
          </div>
        </div>

        {/* Card 4: Admins */}
        <div className="glass-panel" style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ padding: '10px', borderRadius: '8px', background: 'rgba(212, 175, 55, 0.08)', border: '1px solid rgba(212, 175, 55, 0.2)', color: 'var(--color-gold)' }}>
            <Shield size={20} />
          </div>
          <div>
            <h4 style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Administrators</h4>
            <div style={{ fontSize: '1.4rem', fontWeight: '700', color: 'var(--color-gold)', marginTop: '2px' }}>{adminUsers}</div>
          </div>
        </div>
      </div>

      {/* Main Ledger Table */}
      <div className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        
        {/* Search & Filter bar */}
        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
          {/* Search box */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            background: 'rgba(255,255,255,0.02)',
            border: '1px solid var(--border-glass)',
            borderRadius: '8px',
            padding: '8px 16px',
            flex: 1,
            minWidth: '240px'
          }}>
            <Search size={16} color="var(--text-muted)" />
            <input
              type="text"
              placeholder="Search by name, username, or college..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                background: 'transparent',
                border: 'none',
                outline: 'none',
                color: '#ffffff',
                fontSize: '0.85rem',
                width: '100%'
              }}
            />
          </div>

          {/* Role Filter */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Role:</span>
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              style={{
                background: '#07101f',
                border: '1px solid var(--border-glass)',
                borderRadius: '8px',
                padding: '8px 12px',
                color: '#ffffff',
                fontSize: '0.82rem',
                outline: 'none',
                cursor: 'pointer'
              }}
            >
              <option value="all">All Roles</option>
              <option value="admin">Administrators</option>
              <option value="user">Standard Users</option>
            </select>
          </div>

          {/* Status Filter */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              style={{
                background: '#07101f',
                border: '1px solid var(--border-glass)',
                borderRadius: '8px',
                padding: '8px 12px',
                color: '#ffffff',
                fontSize: '0.82rem',
                outline: 'none',
                cursor: 'pointer'
              }}
            >
              <option value="all">All Statuses</option>
              <option value="active">Active</option>
              <option value="inactive">Deactivated</option>
            </select>
          </div>
        </div>

        {/* Ledger Table */}
        <div style={{ overflowX: 'auto', border: '1px solid var(--border-glass)', borderRadius: '8px' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.82rem' }}>
            <thead>
              <tr style={{ background: 'rgba(255,255,255,0.02)', borderBottom: '1.5px solid var(--border-glass)' }}>
                <th style={{ padding: '14px 16px', color: 'var(--color-gold)', fontWeight: '700' }}>Advocate / Name</th>
                <th style={{ padding: '14px 16px', color: 'var(--color-gold)', fontWeight: '700' }}>Username</th>
                <th style={{ padding: '14px 16px', color: 'var(--color-gold)', fontWeight: '700' }}>Institution & Course</th>
                <th style={{ padding: '14px 16px', color: 'var(--color-gold)', fontWeight: '700' }}>Registered On</th>
                <th style={{ padding: '14px 16px', color: 'var(--color-gold)', fontWeight: '700' }}>Role</th>
                <th style={{ padding: '14px 16px', color: 'var(--color-gold)', fontWeight: '700' }}>Status</th>
                <th style={{ padding: '14px 16px', color: 'var(--color-gold)', fontWeight: '700', textAlign: 'center' }}>Admin Controls</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
                    Loading database records...
                  </td>
                </tr>
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
                    No advocates match the query filters.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => (
                  <tr key={user.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)', transition: 'all 0.1s' }} className="table-row-hover">
                    {/* Name */}
                    <td style={{ padding: '14px 16px', fontWeight: '700', color: '#ffffff' }}>
                      {user.full_name || 'Anonymous Advocate'}
                    </td>
                    
                    {/* Username */}
                    <td style={{ padding: '14px 16px', color: 'rgba(255,255,255,0.7)' }}>
                      @{user.username}
                    </td>

                    {/* Institution */}
                    <td style={{ padding: '14px 16px', color: 'var(--text-secondary)' }}>
                      <div style={{ fontWeight: '500' }}>{user.college || 'N/A'}</div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '1px' }}>{user.course || 'N/A'}</div>
                    </td>

                    {/* Timestamp */}
                    <td style={{ padding: '14px 16px', color: 'var(--text-muted)' }}>
                      {user.created_at ? new Date(user.created_at).toLocaleDateString(undefined, {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      }) : 'N/A'}
                    </td>

                    {/* Role */}
                    <td style={{ padding: '14px 16px' }}>
                      {user.is_admin === 1 ? (
                        <span style={{ fontSize: '0.68rem', padding: '3px 8px', borderRadius: '4px', background: 'rgba(212, 175, 55, 0.08)', color: 'var(--color-gold)', border: '1px solid rgba(212, 175, 55, 0.2)', fontWeight: '700' }}>
                          🔑 Admin
                        </span>
                      ) : (
                        <span style={{ fontSize: '0.68rem', padding: '3px 8px', borderRadius: '4px', background: 'rgba(255,255,255,0.03)', color: 'rgba(255,255,255,0.6)', border: '1px solid rgba(255,255,255,0.06)' }}>
                          Advocate
                        </span>
                      )}
                    </td>

                    {/* Status */}
                    <td style={{ padding: '14px 16px' }}>
                      {user.is_active === 1 ? (
                        <span style={{ fontSize: '0.68rem', padding: '3px 8px', borderRadius: '4px', background: 'rgba(16, 185, 129, 0.08)', color: 'var(--color-success)', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
                          Active
                        </span>
                      ) : (
                        <span style={{ fontSize: '0.68rem', padding: '3px 8px', borderRadius: '4px', background: 'rgba(239, 68, 68, 0.08)', color: 'var(--color-danger)', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
                          Deactivated
                        </span>
                      )}
                    </td>

                    {/* Actions */}
                    <td style={{ padding: '14px 16px' }}>
                      <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                        {/* Toggle Active Button */}
                        <button
                          onClick={() => handleToggleStatus(user)}
                          style={{
                            padding: '4px 10px',
                            fontSize: '0.72rem',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            border: 'none',
                            fontWeight: '600',
                            background: user.is_active === 1 ? 'rgba(239, 68, 68, 0.12)' : 'rgba(16, 185, 129, 0.12)',
                            color: user.is_active === 1 ? 'var(--color-danger)' : 'var(--color-success)',
                            transition: 'all 0.1s'
                          }}
                        >
                          {user.is_active === 1 ? 'Deactivate' : 'Activate'}
                        </button>

                        {/* Toggle Admin Button */}
                        <button
                          onClick={() => handleToggleAdmin(user)}
                          disabled={user.id === currentUserId}
                          style={{
                            padding: '4px 10px',
                            fontSize: '0.72rem',
                            borderRadius: '4px',
                            cursor: user.id === currentUserId ? 'not-allowed' : 'pointer',
                            border: 'none',
                            fontWeight: '600',
                            background: user.is_admin === 1 ? 'rgba(255,255,255,0.05)' : 'rgba(212, 175, 55, 0.08)',
                            color: user.is_admin === 1 ? 'rgba(255,255,255,0.6)' : 'var(--color-gold)',
                            opacity: user.id === currentUserId ? 0.5 : 1,
                            transition: 'all 0.1s'
                          }}
                        >
                          {user.is_admin === 1 ? 'Remove Admin' : 'Make Admin'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};

export default AdminDashboard;
