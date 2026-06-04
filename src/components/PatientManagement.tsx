import React, { useState } from 'react';
import { User, Plus, Search, Edit, Trash2, Phone, Mail, Calendar, AlertCircle } from 'lucide-react';

interface Patient {
  id: string;
  name: string;
  phone: string;
  email: string;
  dateOfBirth: string;
  address: string;
  allergies: string[];
  prescriptions: string[];
}

interface PatientManagementProps {
  currentUser: any;
}

export default function PatientManagement({ currentUser }: PatientManagementProps) {
  const [patients, setPatients] = useState<Patient[]>([
    {
      id: 'pat_001',
      name: 'John Doe',
      phone: '555-1234',
      email: 'john@example.com',
      dateOfBirth: '1990-01-15',
      address: '123 Main St, City',
      allergies: ['Penicillin'],
      prescriptions: ['RX001', 'RX002']
    }
  ]);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    dateOfBirth: '',
    address: '',
    allergies: ''
  });

  const handleAddPatient = async () => {
    if (!formData.name || !formData.phone) {
      alert('Please fill in required fields');
      return;
    }

    const newPatient: Patient = {
      id: `pat_${Date.now()}`,
      name: formData.name,
      phone: formData.phone,
      email: formData.email,
      dateOfBirth: formData.dateOfBirth,
      address: formData.address,
      allergies: formData.allergies.split(',').map(a => a.trim()),
      prescriptions: []
    };

    setPatients([...patients, newPatient]);
    resetForm();
  };

  const handleDeletePatient = (id: string) => {
    if (confirm('Delete this patient?')) {
      setPatients(patients.filter(p => p.id !== id));
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      phone: '',
      email: '',
      dateOfBirth: '',
      address: '',
      allergies: ''
    });
    setEditingId(null);
    setIsFormOpen(false);
  };

  const filteredPatients = patients.filter(p =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.phone.includes(searchQuery)
  );

  return (
    <div className="p-6 bg-gradient-to-br from-blue-50 to-blue-100 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-slate-900 mb-2 flex items-center gap-3">
            <User className="w-8 h-8 text-blue-600" />
            Patient Management System
          </h1>
          <p className="text-slate-600">Manage patient profiles and medical history</p>
        </div>

        {/* Toolbar */}
        <div className="flex gap-4 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder="Search by name or phone..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-600"
            />
          </div>
          <button
            onClick={() => setIsFormOpen(!isFormOpen)}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium flex items-center gap-2"
          >
            <Plus className="w-5 h-5" /> Add Patient
          </button>
        </div>

        {/* Add/Edit Form */}
        {isFormOpen && (
          <div className="bg-white rounded-lg shadow-lg p-6 mb-6 border-l-4 border-blue-600">
            <h3 className="text-lg font-bold text-slate-900 mb-4">
              {editingId ? 'Edit Patient' : 'Add New Patient'}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                type="text"
                placeholder="Patient Name *"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
              <input
                type="tel"
                placeholder="Phone *"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
              <input
                type="email"
                placeholder="Email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
              <input
                type="date"
                placeholder="Date of Birth"
                value={formData.dateOfBirth}
                onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                className="px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
              <input
                type="text"
                placeholder="Address"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className="px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 md:col-span-2"
              />
              <input
                type="text"
                placeholder="Allergies (comma separated)"
                value={formData.allergies}
                onChange={(e) => setFormData({ ...formData, allergies: e.target.value })}
                className="px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 md:col-span-2"
              />
            </div>
            <div className="flex gap-3 mt-4">
              <button
                onClick={handleAddPatient}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
              >
                {editingId ? 'Update' : 'Add'} Patient
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

        {/* Patient List */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredPatients.map(patient => (
            <div key={patient.id} className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition">
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-start gap-3">
                  <div className="bg-blue-100 p-3 rounded-full">
                    <User className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-slate-900">{patient.name}</h3>
                    <p className="text-slate-600 text-sm">Patient ID: {patient.id}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleDeletePatient(patient.id)}
                    className="p-2 text-rose-600 hover:bg-rose-50 rounded-lg transition"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <div className="space-y-2 border-t pt-4">
                <div className="flex items-center gap-2 text-slate-700">
                  <Phone className="w-4 h-4 text-slate-400" />
                  <span>{patient.phone}</span>
                </div>
                <div className="flex items-center gap-2 text-slate-700">
                  <Mail className="w-4 h-4 text-slate-400" />
                  <span>{patient.email || 'N/A'}</span>
                </div>
                <div className="flex items-center gap-2 text-slate-700">
                  <Calendar className="w-4 h-4 text-slate-400" />
                  <span>{new Date(patient.dateOfBirth).toLocaleDateString()}</span>
                </div>
              </div>

              {patient.allergies.length > 0 && (
                <div className="mt-4 pt-4 border-t">
                  <div className="flex items-center gap-2 text-rose-600 font-semibold mb-2">
                    <AlertCircle className="w-4 h-4" />
                    Allergies
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {patient.allergies.map((allergy, idx) => (
                      <span key={idx} className="px-3 py-1 bg-rose-100 text-rose-700 rounded-full text-sm font-medium">
                        {allergy}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {filteredPatients.length === 0 && (
          <div className="text-center py-12 bg-white rounded-lg shadow">
            <User className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-600">No patients found</p>
          </div>
        )}
      </div>
    </div>
  );
}
