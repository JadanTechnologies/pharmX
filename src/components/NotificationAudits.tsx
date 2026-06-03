import React, { useState } from 'react';
import { NotificationAlert, ActivityLog } from '../types';
import { 
  Bell, ShieldAlert, Logs, Calendar, User, Info, CheckCircle, 
  Lock, Key, Users, Settings, Plus, Trash2, Check, X, ShieldCheck, UserPlus
} from 'lucide-react';

interface NotificationAuditsProps {
  alerts: NotificationAlert[];
  auditLogs: ActivityLog[];
  roles?: any[];
  users?: any[];
  branches?: any[];
  currentUser?: any;
  onCreateRole?: (newRole: any) => void;
  onUpdateRolePermissions?: (roleKey: string, permissions: string[]) => void;
  onDeleteRole?: (roleKey: string) => void;
  onCreateUser?: (newUser: any) => void;
  onUpdateUserRole?: (userId: string, newRole: string) => void;
  onDeleteUser?: (userId: string) => void;
}

const PERMISSION_METADATA = [
  { key: 'pos_checkout', name: 'POS Checkout Submission', desc: 'Permits processing of retail customer drug carts, applying discounts, and submitting sales records.' },
  { key: 'inventory_write', name: 'Catalogue & Catalog Edit', desc: 'Allows cataloguing new drug units, category thresholds editing, and modifying pricing.' },
  { key: 'prescription_verify', name: 'RX Adjudication / Verification', desc: 'Gives rights to scan physician recipes, clinical signatures validation, and flagging status.' },
  { key: 'procurement_order', name: 'Procurement PO Issuance', desc: 'Grants ability to construct bulk purchase supply orders and credit inventory from partners.' },
  { key: 'inter_branch_transfer', name: 'Cross-Branch Transfers', desc: 'Allows relocation of safe-room pharmaceutical batches across other branch locations.' },
  { key: 'security_admin', name: 'Advanced Staff Security & Role Config', desc: 'Authorizes creation of custom security roles, permission tuning, and staff account creation.' }
];

export default function NotificationAudits({ 
  alerts, 
  auditLogs,
  roles = [],
  users = [],
  branches = [],
  currentUser,
  onCreateRole,
  onUpdateRolePermissions,
  onDeleteRole,
  onCreateUser,
  onUpdateUserRole,
  onDeleteUser
}: NotificationAuditsProps) {
  const [subTab, setSubTab] = useState<'audits' | 'permissions'>('audits');

  // Role Form State
  const [newRoleName, setNewRoleName] = useState('');
  const [newRoleDesc, setNewRoleDesc] = useState('');
  const [newRolePerms, setNewRolePerms] = useState<string[]>([]);
  const [roleFormError, setRoleFormError] = useState('');
  const [roleFormSuccess, setRoleFormSuccess] = useState('');

  // User Form State
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserName, setNewUserName] = useState('');
  const [newUserRole, setNewUserRole] = useState('cashier');
  const [newUserBranch, setNewUserBranch] = useState('branch_1');
  const [userFormError, setUserFormError] = useState('');
  const [userFormSuccess, setUserFormSuccess] = useState('');

  const isAdmin = currentUser?.role === 'admin' || currentUser?.permissions?.includes('security_admin');

  // Handle Role Creation
  const handleRoleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setRoleFormError('');
    setRoleFormSuccess('');

    if (!isAdmin) {
      setRoleFormError("Bypass Error: Action requires System Administrator authorization.");
      return;
    }

    if (!newRoleName.trim() || !newRoleDesc.trim()) {
      setRoleFormError("Name and description fields are mandatory.");
      return;
    }

    const key = newRoleName.trim().toLowerCase().replace(/[^a-z0-9]/g, '_');
    
    // Check duplication
    if (roles.some(r => r.key === key)) {
      setRoleFormError(`A role key '${key}' already exists. Please choose a distinct name.`);
      return;
    }

    const newRole = {
      key,
      name: newRoleName.trim(),
      description: newRoleDesc.trim(),
      isSystem: false,
      permissions: newRolePerms
    };

    if (onCreateRole) {
      onCreateRole(newRole);
      setNewRoleName('');
      setNewRoleDesc('');
      setNewRolePerms([]);
      setRoleFormSuccess(`Successfully created role '${newRole.name}'!`);
    }
  };

  // Toggle permission flag for a role edit
  const handlePermissionToggle = (roleKey: string, permKey: string) => {
    if (!isAdmin) return;
    const roleDef = roles.find(r => r.key === roleKey);
    if (!roleDef) return;

    let updatedPerms = [...roleDef.permissions];
    if (updatedPerms.includes(permKey)) {
      updatedPerms = updatedPerms.filter(p => p !== permKey);
    } else {
      updatedPerms.push(permKey);
    }

    if (onUpdateRolePermissions) {
      onUpdateRolePermissions(roleKey, updatedPerms);
    }
  };

  // Handle User Creation
  const handleUserSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setUserFormError('');
    setUserFormSuccess('');

    if (!isAdmin) {
      setUserFormError("Bypass Error: Action requires System Administrator authorization.");
      return;
    }

    if (!newUserEmail.trim() || !newUserName.trim()) {
      setUserFormError("Email and name fields are mandatory.");
      return;
    }

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(newUserEmail)) {
      setUserFormError("Please provide a valid email format.");
      return;
    }

    const normalizedEmail = newUserEmail.trim().toLowerCase();
    if (users.some(u => u.email.toLowerCase() === normalizedEmail)) {
      setUserFormError("A staff profile with this email address already exists.");
      return;
    }

    const matchedBranch = branches.find(b => b.id === newUserBranch);
    const branchCode = matchedBranch ? matchedBranch.code : 'CPB-01';

    const newUserObj = {
      id: `usr_${Date.now()}`,
      email: normalizedEmail,
      name: newUserName.trim(),
      role: newUserRole,
      branchId: newUserBranch,
      branchCode: branchCode
    };

    if (onCreateUser) {
      onCreateUser(newUserObj);
      setNewUserEmail('');
      setNewUserName('');
      setUserFormSuccess(`Onboarded new personnel '${newUserObj.name}' successfully!`);
    }
  };

  return (
    <div className="space-y-6" id="audits_view_root">
      
      {/* Tab Switcher Panel with gorgeous microinteractions */}
      <div className="bg-white rounded-xl border border-slate-150 p-3 h-14 flex items-center justify-between shadow-xs">
        <div className="flex gap-2">
          <button
            onClick={() => setSubTab('audits')}
            className={`px-4 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
              subTab === 'audits' 
                ? 'bg-emerald-900 text-white shadow-sm' 
                : 'text-slate-600 hover:bg-slate-100'
            }`}
            id="btn_subtab_logs"
          >
            <Logs className="w-3.5 h-3.5" /> 
            Compliance Trails Ledger
          </button>
          <button
            onClick={() => setSubTab('permissions')}
            className={`px-4 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
              subTab === 'permissions' 
                ? 'bg-emerald-900 text-white shadow-sm' 
                : 'text-slate-600 hover:bg-slate-100'
            }`}
            id="btn_subtab_perms"
          >
            <Lock className="w-3.5 h-3.5" /> 
            Roles & Staff Permissions Configurator
          </button>
        </div>

        {/* Info header tag */}
        <div className="hidden sm:flex items-center gap-2 text-[11px] text-slate-400 font-mono font-semibold">
          <Settings className="w-3.5 h-3.5 text-slate-400" />
          Operator Profile: <span className="font-extrabold text-slate-700">{currentUser?.name} ({currentUser?.role})</span>
        </div>
      </div>

      {subTab === 'audits' ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6" id="compliance_inner_view">
          
          {/* Expiry / Critical Alerts column */}
          <div className="lg:col-span-5 space-y-4">
            {/* Urgent notifications feed */}
            <div className="bg-white rounded-xl border border-slate-100 p-5 shadow-xs space-y-4">
              <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
                <Bell className="w-5 h-5 text-emerald-600 animate-pulse" /> Urgent Operations Alerts
              </h3>
              <p className="text-[11px] text-slate-400 leading-normal">
                Real-time notifications generated based on medication expiration, central stock depleted rates, or failed user checkout operations.
              </p>

              <div className="space-y-3" id="system_alerts_feed">
                {alerts.map(alert => {
                  const selectColor = alert.severity === 'danger' 
                    ? 'bg-rose-50 border-rose-100 text-rose-700' 
                    : alert.severity === 'warning' ? 'bg-amber-50 border-amber-100 text-amber-700' : 'bg-slate-50 border-slate-100 text-slate-700';

                  return (
                    <div key={alert.id} className={`p-3.5 border rounded-xl flex gap-3 ${selectColor}`}>
                      <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5" />
                      <div className="text-xs">
                        <span className="font-bold uppercase tracking-wider text-[9px] block mb-1">{alert.type.replace('_', ' ')}</span>
                        <p className="leading-relaxed text-[11px] font-medium">{alert.message}</p>
                        <span className="text-[9.5px] opacity-75 mt-1.5 block font-mono">Timestamp: {alert.date}</span>
                      </div>
                    </div>
                  );
                })}
                {alerts.length === 0 && (
                  <div className="p-8 text-center text-slate-400 text-xs text-balance">
                    <CheckCircle className="w-10 h-10 text-slate-200 mx-auto mb-2" />
                    All pharmacy operations running well. No low stock warnings or critical dates recorded.
                  </div>
                )}
              </div>
            </div>

            {/* Demo credentials guide */}
            <div className="bg-gradient-to-r from-teal-900 to-slate-900 rounded-xl p-5 text-white shadow-xs space-y-3">
              <div className="inline-flex items-center gap-1 bg-white/15 px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider">
                Onboarding credentials
              </div>
              <h4 className="text-xs font-extrabold">System Sandbox Profiles</h4>
              <p className="text-[10.5px] text-slate-350 leading-relaxed">
                Quickly simulation log in with any role to test custom interface parameters and permissions overlays:
              </p>

              <table className="w-full text-left text-[10px] font-mono border-collapse text-slate-300">
                <thead>
                  <tr className="border-b border-white/10 font-bold">
                    <th className="pb-1.5">Username</th>
                    <th className="pb-1.5">Default Role</th>
                    <th className="pb-1.5">Branch Code</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 font-semibold">
                  {users.map((item: any) => (
                    <tr key={item.id}>
                      <td className="py-1 text-white">{item.email}</td>
                      <td className="py-1 uppercase text-[9px] text-emerald-400">{item.role.replace(/_/g, ' ')}</td>
                      <td className="py-1">{item.branchCode || 'CPB-01'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <p className="text-[9.5px] text-slate-400 italic mt-1 leading-normal">
                * Sandbox passcode for all accounts is: <span className="text-emerald-300 font-bold font-mono">`admin123`</span> or <span className="text-emerald-300 font-bold font-mono">`pharmacy123`</span>.
              </p>
            </div>
          </div>

          {/* Audit Logs LEDGER */}
          <div className="lg:col-span-7 bg-white rounded-xl border border-slate-100 p-5 shadow-xs flex flex-col justify-between overflow-hidden min-h-[480px]" id="audit_log_ledger">
            <div className="space-y-3">
              <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
                <Logs className="w-5 h-5 text-emerald-600" /> Compliance Audit Trails Ledger
              </h3>
              <p className="text-[11px] text-slate-400 leading-normal">
                Permanent transaction trace. Logs checkout submissions, stock transfer updates, prescription verified status, and staff logins with trace IPs. Required for hospital pharmacopoeia standards.
              </p>

              {/* Ledger feed list */}
              <div className="divide-y divide-slate-100 max-h-[420px] overflow-y-auto pr-1" id="ledger_list_box">
                {auditLogs.map((log) => (
                  <div key={log.id} className="py-3 text-xs leading-relaxed space-y-1 hover:bg-slate-55/20 transition px-1 rounded">
                    <div className="flex justify-between items-start">
                      <span className="font-bold text-slate-800">{log.action.replace(/_/g, ' ')}</span>
                      <span className="text-[10px] text-slate-400 font-mono flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" /> {new Date(log.timestamp).toLocaleString()}
                      </span>
                    </div>
                    <p className="text-slate-600 text-[11px] font-medium leading-relaxed">"{log.details}"</p>
                    <div className="flex justify-between text-[9.5px] text-slate-400 font-mono uppercase font-semibold">
                      <span className="flex items-center gap-0.5"><User className="w-3 w-3 text-slate-400" /> Operator: {log.userEmail} ({log.role})</span>
                    </div>
                  </div>
                ))}
                {auditLogs.length === 0 && (
                  <div className="p-8 text-center text-slate-450 italic">
                    No compliance operations log exists. Trigger some actions in POS, Inventory, or login to generate logs.
                  </div>
                )}
              </div>
            </div>

            {/* Audit Disclaimer Footer */}
            <div className="border-t border-slate-50 pt-3 text-[10px] text-slate-400 leading-normal flex items-start gap-1.5 font-sans mt-4">
              <Info className="w-4 h-4 text-slate-350 shrink-0" />
              <p>
                Audit trails adhere to standard retail and hospital healthcare guidelines (HIPAA Compliant logging mock representation). Delete is disabled on audit trail database items.
              </p>
            </div>
          </div>

        </div>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 animate-fade-in" id="security_inner_view">
          
          {/* Admin bypass instructions notice */}
          {!isAdmin && (
            <div className="xl:col-span-12 bg-amber-50 border border-amber-200 rounded-xl p-4 flex gap-3 text-amber-900" id="read_only_warning">
              <ShieldAlert className="w-5 h-5 shrink-0 text-amber-700" />
              <div className="text-xs">
                <span className="font-extrabold uppercase">Read-Only Console</span>
                <p className="mt-0.5 font-medium leading-relaxed">
                  You are exploring the central security schema. Live updates, role mutations, or user insertions are restricted to administrators. Log in as <span className="font-bold">admin@pharmapos.com / admin123</span> to acquire full write credentials.
                </p>
              </div>
            </div>
          )}

          {/* LEFT: Roles Directory & Creator */}
          <div className="xl:col-span-7 space-y-6">
            
            {/* Creator Form */}
            <div className="bg-white rounded-xl border border-slate-100 p-5 shadow-xs space-y-4">
              <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
                <Key className="w-5 h-5 text-emerald-600" /> Catalog New Custom Role
              </h3>
              <p className="text-[11px] text-slate-401 leading-normal">
                Establish custom user responsibilities, such as "Intern" or "Clinical Director". Assign specific access criteria across POS, Inventory catalog, and cross-branch logistics.
              </p>

              <form onSubmit={handleRoleSubmit} className="space-y-4 text-xs">
                {roleFormError && (
                  <div className="p-3 rounded-lg bg-rose-50 border border-rose-100 text-rose-700 font-bold">
                    {roleFormError}
                  </div>
                )}
                {roleFormSuccess && (
                  <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-100 text-emerald-800 font-bold">
                    {roleFormSuccess}
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-slate-500 font-semibold mb-1">Role Title</label>
                    <input 
                      type="text" 
                      placeholder="e.g. Clinical Pharmacist Level 2" 
                      value={newRoleName}
                      onChange={(e) => setNewRoleName(e.target.value)}
                      disabled={!isAdmin}
                      className="w-full bg-slate-50 border border-slate-200 outline-hidden focus:border-emerald-500 rounded-lg px-3.5 py-2.5 text-slate-800 font-medium transition disabled:bg-slate-100 disabled:cursor-not-allowed"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-500 font-semibold mb-1">Short Mission / description</label>
                    <input 
                      type="text" 
                      placeholder="e.g. Can verify doctor recipes and request purchase orders" 
                      value={newRoleDesc}
                      disabled={!isAdmin}
                      onChange={(e) => setNewRoleDesc(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 outline-hidden focus:border-emerald-500 rounded-lg px-3.5 py-2.5 text-slate-800 font-medium transition disabled:bg-slate-100 disabled:cursor-not-allowed"
                    />
                  </div>
                </div>

                {/* Permissions checkboxes inside Role Editor */}
                <div className="space-y-2">
                  <span className="block text-slate-505 font-bold mb-1">Associate Functional Permissions</span>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {PERMISSION_METADATA.map((perm) => {
                      const isChecked = newRolePerms.includes(perm.key);
                      return (
                        <div 
                          key={perm.key}
                          onClick={() => {
                            if (!isAdmin) return;
                            if (isChecked) {
                              setNewRolePerms(newRolePerms.filter(p => p !== perm.key));
                            } else {
                              setNewRolePerms([...newRolePerms, perm.key]);
                            }
                          }}
                          className={`p-2.5 border rounded-lg cursor-pointer transition select-none flex items-start gap-2.5 text-left ${
                            isChecked 
                              ? 'bg-emerald-50/70 border-emerald-250 text-emerald-900' 
                              : 'bg-slate-50/50 border-slate-200 hover:bg-slate-50 text-slate-700'
                          } ${!isAdmin ? 'opacity-80 pointer-events-none' : ''}`}
                        >
                          <div className={`w-3.5 h-3.5 rounded mt-0.5 flex items-center justify-center border font-bold text-[9px] ${
                            isChecked ? 'bg-emerald-600 border-emerald-600 text-white' : 'bg-white border-slate-300'
                          }`}>
                            {isChecked && "✓"}
                          </div>
                          <div className="text-[10.5px]">
                            <span className="font-bold block leading-none">{perm.name}</span>
                            <span className="text-[9.2px] text-slate-450 block mt-1 leading-normal">{perm.desc}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    type="submit"
                    disabled={!isAdmin || !newRoleName || !newRoleDesc}
                    className="bg-emerald-600 text-white hover:bg-emerald-700 font-extrabold px-5 py-2.5 rounded-lg transition text-xs tracking-wider uppercase cursor-pointer flex items-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Plus className="w-4 h-4" /> Save New Role Security Profile
                  </button>
                </div>
              </form>
            </div>

            {/* Custom & System Roles Registry List */}
            <div className="bg-white rounded-xl border border-slate-100 p-5 shadow-xs space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-emerald-600" /> Active System Security Schema Profiles ({roles.length})
                </h3>
              </div>

              <div className="divide-y divide-slate-100 space-y-3.5">
                {roles.map((role) => (
                  <div key={role.key} className="pt-3.5 first:pt-0 space-y-2 text-xs">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-slate-800 text-xs">{role.name}</span>
                        <span className="text-[9px] font-mono select-none px-2 py-0.5 rounded uppercase font-bold tracking-wider bg-slate-50 border border-slate-200 text-slate-450">
                          {role.key}
                        </span>
                        {role.isSystem ? (
                          <span className="text-[8px] font-mono font-black border border-blue-200 bg-blue-50 text-blue-700 rounded px-1.5 py-0.5 uppercase tracking-wider">
                            🛡️ IMMUTABLE SYSTEM DEFAULT
                          </span>
                        ) : (
                          <span className="text-[8px] font-mono font-black border border-purple-200 bg-purple-50 text-purple-705 rounded px-1.5 py-0.5 uppercase tracking-wider">
                            ⚙️ CUSTOM ROLE
                          </span>
                        )}
                      </div>
                      
                      {!role.isSystem && isAdmin && onDeleteRole && (
                        <button
                          onClick={() => {
                            if (window.confirm(`Are you sure you want to permanently delete custom role '${role.name}'? Users with this role might lose authorization.`)) {
                              onDeleteRole(role.key);
                            }
                          }}
                          className="text-rose-600 hover:text-rose-800 p-1 rounded hover:bg-rose-50 cursor-pointer text-[10px] font-bold flex items-center gap-0.5 border border-transparent hover:border-rose-100 transition"
                          title="Purge custom profile database entries"
                        >
                          <Trash2 className="w-3.5 h-3.5" /> Purge Role
                        </button>
                      )}
                    </div>

                    <p className="text-slate-500 text-[11px] leading-relaxed">
                      {role.description}
                    </p>

                    {/* Permissions grid with checkboxes to toggle on and off */}
                    <div className="space-y-1.5 pt-1">
                      <span className="text-[10px] font-bold text-slate-400 block uppercase tracking-wider font-mono">Assigned Permissions Panel</span>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-1.5 pt-0.5">
                        {PERMISSION_METADATA.map((perm) => {
                          const isAssigned = role.permissions.includes(perm.key);
                          return (
                            <div 
                              key={perm.key}
                              onClick={() => {
                                if (!role.isSystem) {
                                  handlePermissionToggle(role.key, perm.key);
                                }
                              }}
                              className={`p-1.5 rounded-md border flex items-center justify-between text-[10px] font-semibold select-none ${
                                isAssigned 
                                  ? 'bg-emerald-50/30 border-emerald-100 text-emerald-800 font-bold' 
                                  : 'bg-slate-50/20 border-slate-100 text-slate-400 font-normal opacity-60'
                              } ${!role.isSystem && isAdmin ? 'cursor-pointer hover:border-emerald-300' : 'cursor-default'}`}
                            >
                              <span className="truncate">{perm.name.replace('Submission', '').replace('Catalog', '').replace('Verification', '').replace('Issuance', '')}</span>
                              <div className="shrink-0">
                                {isAssigned ? (
                                  <Check className="w-3 h-3 text-emerald-600 font-black" />
                                ) : (
                                  <X className="w-3 h-3 text-slate-300" />
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* RIGHT: Active Staff Directory Credentials database */}
          <div className="xl:col-span-5 space-y-6">
            
            {/* Create User/Staff member form */}
            <div className="bg-white rounded-xl border border-slate-100 p-5 shadow-xs space-y-4">
              <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-emerald-600" /> Onboard Staff Credentials Profile
              </h3>
              <p className="text-[11px] text-slate-400 leading-normal">
                Register a new pharmacy professional with direct access to this system console, matching their physical branch assignment.
              </p>

              <form onSubmit={handleUserSubmit} className="space-y-4 text-xs">
                {userFormError && (
                  <div className="p-3 rounded-lg bg-rose-50 border border-rose-100 text-rose-700 font-bold">
                    {userFormError}
                  </div>
                )}
                {userFormSuccess && (
                  <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-100 text-emerald-800 font-bold">
                    {userFormSuccess}
                  </div>
                )}

                <div className="space-y-3">
                  <div>
                    <label className="block text-slate-500 font-semibold mb-1">Corporate email address</label>
                    <input 
                      type="email" 
                      placeholder="e.g. jdoe@pharmacy.com" 
                      value={newUserEmail}
                      disabled={!isAdmin}
                      onChange={(e) => setNewUserEmail(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 outline-hidden focus:border-emerald-500 rounded-lg px-3.5 py-2.5 text-slate-880 font-medium transition disabled:bg-slate-100 disabled:cursor-not-allowed"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-500 font-semibold mb-1">Full Legal Name</label>
                    <input 
                      type="text" 
                      placeholder="e.g. John Doe, PharmD" 
                      value={newUserName}
                      disabled={!isAdmin}
                      onChange={(e) => setNewUserName(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 outline-hidden focus:border-emerald-500 rounded-lg px-3.5 py-2.5 text-slate-800 font-medium transition disabled:bg-slate-100 disabled:cursor-not-allowed"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-slate-500 font-semibold mb-1">Authority Role Assigned</label>
                      <select
                        value={newUserRole}
                        disabled={!isAdmin}
                        onChange={(e) => setNewUserRole(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 outline-hidden focus:border-emerald-500 rounded-lg p-2.5 text-slate-800 font-medium transition disabled:bg-slate-100 disabled:cursor-not-allowed"
                      >
                        {roles.map((r: any) => (
                          <option key={r.key} value={r.key}>{r.name}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-slate-500 font-semibold mb-1">Assigned Operational Branch</label>
                      <select
                        value={newUserBranch}
                        disabled={!isAdmin}
                        onChange={(e) => setNewUserBranch(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 outline-hidden focus:border-emerald-500 rounded-lg p-2.5 text-slate-800 font-medium transition disabled:bg-slate-100 disabled:cursor-not-allowed"
                      >
                        {branches.map((b: any) => (
                          <option key={b.id} value={b.id}>{b.name} ({b.code})</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    type="submit"
                    disabled={!isAdmin || !newUserEmail || !newUserName}
                    className="bg-emerald-600 text-white hover:bg-emerald-700 font-extrabold px-5 py-2.5 rounded-lg transition text-xs tracking-wider uppercase cursor-pointer flex items-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <UserPlus className="w-4 h-4" /> Save Staff Credentials
                  </button>
                </div>
              </form>
            </div>

            {/* List of active staff profiles connected to terminal */}
            <div className="bg-white rounded-xl border border-slate-100 p-5 shadow-xs space-y-4">
              <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
                <Users className="w-5 h-5 text-emerald-600" /> Authorized Staff Directory Logs ({users.length})
              </h3>
              <p className="text-[11px] text-slate-400 leading-normal">
                Manage operational active terminal login codes. You can live-override user roles below:
              </p>

              <div className="divide-y divide-slate-100" id="staff_terminal_directory">
                {users.map((profile: any) => {
                  const activeBranchName = branches.find(b => b.id === profile.branchId)?.name || 'Central Plaza';
                  return (
                    <div key={profile.id} className="py-3 flex flex-col justify-between md:flex-row gap-3 text-xs">
                      <div className="space-y-1">
                        <span className="font-extrabold text-slate-800 text-[12.5px] block">{profile.name}</span>
                        <span className="text-slate-400 font-mono block text-[10px]">{profile.email}</span>
                        <span className="text-[10px] text-slate-500 font-semibold flex items-center gap-1">
                          🏠 Branch: {activeBranchName} ({profile.branchCode || 'CPB-01'})
                        </span>
                      </div>

                      <div className="flex items-center gap-2 self-start md:self-center shrink-0">
                        {isAdmin ? (
                          <select
                            value={profile.role}
                            onChange={(e) => {
                              if (onUpdateUserRole) {
                                onUpdateUserRole(profile.id, e.target.value);
                              }
                            }}
                            className="bg-slate-50 border border-slate-200 rounded p-1.5 text-[10.5px] font-bold text-slate-700 cursor-pointer outline-hidden focus:border-emerald-500"
                          >
                            {roles.map((r: any) => (
                              <option key={r.key} value={r.key}>{r.name}</option>
                            ))}
                          </select>
                        ) : (
                          <span className="bg-emerald-50 text-emerald-900 border border-emerald-100 text-[10px] font-bold uppercase rounded px-2.5 py-1 tracking-wider">
                            {roles.find(r => r.key === profile.role)?.name || profile.role.replace(/_/g, ' ')}
                          </span>
                        )}

                        {isAdmin && onDeleteUser && profile.id !== currentUser?.id && (
                          <button
                            onClick={() => {
                              if (window.confirm(`Are you sure you want to de-authenticate and completely delete staff profile '${profile.name}'?`)) {
                                onDeleteUser(profile.id);
                              }
                            }}
                            className="text-rose-600 hover:text-rose-800 p-1.5 rounded hover:bg-rose-50 cursor-pointer border border-transparent hover:border-rose-100"
                            title="De-authenticate credentials"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

          </div>

        </div>
      )}

    </div>
  );
}
