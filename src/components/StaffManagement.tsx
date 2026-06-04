import React, { useState } from 'react';
import { Users, Plus, Search, Edit, Trash2, Shield, CheckCircle, XCircle } from 'lucide-react';

interface Staff {
  id: string;
  name: string;
  role: string;
  email: string;
  phone: string;
  status: 'active' | 'inactive';
  permissions: string[];
  joinDate: string;
}

interface StaffManagementProps {
  currentUser: any;
}

const PERMISSION_OPTIONS = [
  { key: 'pos_checkout', label: 'POS Checkout' },
  { key: 'inventory_write', label: 'Inventory Management' },
  { key: 'procurement_order', label: 'Purchase Orders' },
  { key: 'prescription_verify', label: 'Verify Prescriptions' },
  { key: 'inter_branch_transfer', label: 'Branch Transfers' },
  { key: 'security_admin', label: 'Admin Panel' }
];

export default function StaffManagement({ currentUser }: StaffManagementProps) {
  const [staff, setStaff] = useState<Staff[]>([
    {
      id: 'stf_001',
      name: 'Admin User',
      role: 'Administrator',
      email: 'admin@pharmax.com',
      phone: '555-0001',
      status: 'active',
      permissions: ['pos_checkout', 'inventory_write', 'procurement_order', 'prescription_verify', 'inter_branch_transfer', 'security_admin'],
      joinDate: '2026-01-01'
    }
  ]);

  const [searchQuery, setSearchQuery] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    role: 'Pharmacist',
    email: '',
    phone: '',
    permissions: [] as string[]
  });

  const handleAddStaff = () => {
    if (!formData.name || !formData.email) {
      alert('Please fill in required fields');
      return;
    }

    const newStaff: Staff = {
      id: `stf_${Date.now()}`,
      name: formData.name,
      role: formData.role,
      email: formData.email,
      phone: formData.phone,
      status: 'active',
      permissions: formData.permissions,
      joinDate: new Date().toISOString().split('T')[0]
    };

    setStaff([...staff, newStaff]);
    resetForm();
  };

  const handleTogglePermission = (permKey: string) => {
    setFormData(prev => ({
      ...prev,
      permissions: prev.permissions.includes(permKey)
        ? prev.permissions.filter(p => p !== permKey)
        : [...prev.permissions, permKey]
    }));
  };

  const handleDeleteStaff = (id: string) => {
    if (currentUser.userId === id) {
      alert('Cannot delete your own account');
      return;
    }
    if (confirm('Delete this staff member?')) {
      setStaff(staff.filter(s => s.id !== id));
    }
  };

  const handleToggleStatus = (id: string) => {
    setStaff(staff.map(s => 
      s.id === id ? { ...s, status: s.status === 'active' ? 'inactive' : 'active' } : s
    ));
  };

  const resetForm = () => {
    setFormData({
      name: '',
      role: 'Pharmacist',
      email: '',
      phone: '',
      permissions: []
    });
    setEditingId(null);
    setIsFormOpen(false);
  };

  const filteredStaff = staff.filter(s =>
    s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.email.includes(searchQuery) ||
    s.role.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="p-6 bg-gradient-to-br from-purple-50 to-purple-100 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-slate-900 mb-2 flex items-center gap-3">
            <Users className="w-8 h-8 text-purple-600" />
            Staff Management & Access Control
          </h1>
          <p className="text-slate-600">Manage pharmacy staff and assign permissions</p>
        </div>

        {/* Toolbar */}
        <div className="flex gap-4 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder="Search staff by name, email, or role..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-purple-600"
            />
          </div>
          <button
            onClick={() => setIsFormOpen(!isFormOpen)}
            className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-medium flex items-center gap-2"
          >
            <Plus className="w-5 h-5" /> Add Staff
          </button>
        </div>

        {/* Add/Edit Form */}
        {isFormOpen && (
          <div className="bg-white rounded-lg shadow-lg p-6 mb-6 border-l-4 border-purple-600">
            <h3 className="text-lg font-bold text-slate-900 mb-4">Add New Staff Member</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <input
                type="text"
                placeholder="Staff Name *"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600"
              />
              <select
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                className="px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600"
              >
                <option>Pharmacist</option>
                <option>Pharmacy Technician</option>
                <option>Cashier</option>
                <option>Stock Manager</option>
                <option>Manager</option>
              </select>
              <input
                type="email"
                placeholder="Email *"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600"
              />
              <input
                type="tel"
                placeholder="Phone"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600"
              />
            </div>

            <div className="mb-6">
              <h4 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
                <Shield className="w-4 h-4 text-purple-600" />
                Assign Permissions
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {PERMISSION_OPTIONS.map(perm => (
                  <label key={perm.key} className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg hover:bg-slate-100 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.permissions.includes(perm.key)}
                      onChange={() => handleTogglePermission(perm.key)}
                      className="w-4 h-4 rounded text-purple-600"
                    />
                    <span className="text-slate-700 font-medium">{perm.label}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleAddStaff}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-medium"
              >
                Add Staff Member
              </button>
              <button
                onClick={resetForm}
                className="px-4 py-2 bg-slate-300 text-slate-900 rounded-lg hover:bg-slate-400 font-medium"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Staff List */}
        <div className="overflow-x-auto bg-white rounded-lg shadow-lg">
          <table className="w-full">
            <thead>
              <tr className="bg-gradient-to-r from-purple-600 to-purple-700 text-white">
                <th className="px-6 py-4 text-left font-semibold">Name</th>
                <th className="px-6 py-4 text-left font-semibold">Role</th>
                <th className="px-6 py-4 text-left font-semibold">Email</th>
                <th className="px-6 py-4 text-left font-semibold">Status</th>
                <th className="px-6 py-4 text-left font-semibold">Permissions</th>
                <th className="px-6 py-4 text-left font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredStaff.map((member, idx) => (
                <tr key={member.id} className={`border-b ${idx % 2 === 0 ? 'bg-slate-50' : 'bg-white'} hover:bg-purple-50 transition`}>
                  <td className="px-6 py-4 font-semibold text-slate-900">{member.name}</td>
                  <td className="px-6 py-4 text-slate-700">{member.role}</td>
                  <td className="px-6 py-4 text-slate-700">{member.email}</td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => handleToggleStatus(member.id)}
                      className={`inline-flex items-center gap-1 px-3 py-1 rounded-full font-medium transition ${
                        member.status === 'active'
                          ? 'bg-green-100 text-green-700 hover:bg-green-200'
                          : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                      }`}
                    >
                      {member.status === 'active' ? (
                        <CheckCircle className="w-4 h-4" />
                      ) : (
                        <XCircle className="w-4 h-4" />
                      )}
                      {member.status}
                    </button>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-wrap gap-1">
                      {member.permissions.slice(0, 2).map(perm => (
                        <span key={perm} className="px-2 py-1 bg-purple-100 text-purple-700 rounded text-xs font-semibold">
                          {perm.split('_')[0]}
                        </span>
                      ))}
                      {member.permissions.length > 2 && (
                        <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded text-xs font-semibold">
                          +{member.permissions.length - 2}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {member.id !== currentUser.userId && (
                      <button
                        onClick={() => handleDeleteStaff(member.id)}
                        className="text-rose-600 hover:bg-rose-50 p-2 rounded transition"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredStaff.length === 0 && (
          <div className="text-center py-12 bg-white rounded-lg shadow">
            <Users className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-600">No staff members found</p>
          </div>
        )}
      </div>
    </div>
  );
}
