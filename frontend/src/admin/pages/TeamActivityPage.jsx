import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  ShieldCheck,
  Plus,
  Trash2,
  Edit,
  UserCheck,
  Clock,
  Download,
  Check,
  X,
  Mail,
  Phone
} from 'lucide-react';
import { useAdminStore } from '../store/adminStore';
import { StatusBadge } from '../components/common/StatusBadge';
import { SideDrawer } from '../components/common/SideDrawer';
import { triggerKapeeCelebration } from '../components/common/Confetti';
import { CustomSelect } from '../components/common/CustomSelect';
import { confirmDelete } from '../../store/useConfirmStore';
import { downloadCSV, csvDate } from '../lib/csv';

const ROLE_OPTIONS = [
  { value: 'Admin', label: 'Admin (Full Access)' },
  { value: 'Manager', label: 'Manager (Operations)' },
  { value: 'Support', label: 'Support (Helpdesk)' },
  { value: 'Viewer', label: 'Viewer (Read-only)' }
];

export const TeamActivityPage = () => {
  const { users, addUser, updateUser, deleteUser, activityLogs, addToast } = useAdminStore();
  const [activeTab, setActiveTab] = useState('users'); // 'users' | 'roles' | 'audit'

  // User Drawer
  const [userDrawerOpen, setUserDrawerOpen] = useState(false);
  const [userForm, setUserForm] = useState({
    name: '',
    email: '',
    role: 'Manager',
    phone: '+91 98000 00000',
    status: 'Active',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80'
  });

  const rolesMatrix = [
    { module: 'Dashboard Metrics', superAdmin: true, admin: true, manager: true, support: true, viewer: true },
    { module: 'Orders (View & Manage)', superAdmin: true, admin: true, manager: true, support: true, viewer: true },
    { module: 'Order Status Changes & Shipments', superAdmin: true, admin: true, manager: true, support: true, viewer: false },
    { module: 'Products & Price Editing', superAdmin: true, admin: true, manager: true, support: false, viewer: false },
    { module: 'Coupons & Milestones', superAdmin: true, admin: true, manager: true, support: false, viewer: false },
    { module: 'Review Moderation & Replies', superAdmin: true, admin: true, manager: true, support: true, viewer: false },
    { module: 'Delivery & Payment API Keys', superAdmin: true, admin: true, manager: false, support: false, viewer: false },
    { module: 'Team Permissions & Invites', superAdmin: true, admin: false, manager: false, support: false, viewer: false },
  ];

  const handleSaveUser = (e) => {
    e.preventDefault();
    if (!userForm.name || !userForm.email) return;
    addUser(userForm);
    triggerKapeeCelebration();
    addToast({ type: 'success', title: 'Admin Invited', message: `Sent invitation to ${userForm.email}.` });
    setUserDrawerOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-ink dark:text-stone-100">
            Team Access & Audit Logs
          </h1>
          <p className="text-xs sm:text-sm text-muted dark:text-stone-400 mt-1">
            Manage teammate privileges, enforce role matrices, and review security activity history.
          </p>
        </div>

        {activeTab === 'users' && (
          <button
            onClick={() => setUserDrawerOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-emerald-deep text-white hover:bg-emerald-800 shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>Invite Team Member</span>
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex border-b border-stone-200 dark:border-stone-800">
        {[
          { key: 'users', label: `Admin Users (${users.length})` },
          { key: 'roles', label: 'Roles & Permissions Matrix' },
          { key: 'audit', label: `Activity Audit Trail (${activityLogs.length})` }
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`pb-3 px-4 text-xs sm:text-sm font-semibold relative transition-colors ${
              activeTab === tab.key
                ? 'text-emerald-deep dark:text-emerald-300'
                : 'text-stone-500 hover:text-stone-800 dark:hover:text-stone-100'
            }`}
          >
            <span>{tab.label}</span>
            {activeTab === tab.key && (
              <motion.div
                layoutId="teamTabPill"
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-deep dark:bg-emerald-400"
              />
            )}
          </button>
        ))}
      </div>

      {/* Tab 1: Users */}
      {activeTab === 'users' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {users.map((u) => (
            <div
              key={u.id}
              className="bg-white dark:bg-stone-900 rounded-2xl border p-5 shadow-2xs space-y-4 flex flex-col justify-between"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <img src={u.avatar} alt="" className="w-11 h-11 rounded-xl object-cover ring-1 ring-emerald-500/20" />
                  <div>
                    <h3 className="font-bold text-sm text-stone-900 dark:text-stone-100">{u.name}</h3>
                    <p className="text-xs text-stone-400">{u.email}</p>
                    <span className="inline-block mt-1 px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 font-bold text-[10px]">
                      {u.role}
                    </span>
                  </div>
                </div>
                <StatusBadge status={u.status} />
              </div>

              <div className="pt-3 border-t flex items-center justify-between text-xs text-stone-400">
                <span>Last login: {u.lastLogin || 'Just now'}</span>
                {u.role !== 'Super Admin' && (
                  <button
                    onClick={() =>
                      confirmDelete({
                        title: 'Remove Team Member?',
                        message: `Remove ${u.name} from the team? They will lose admin access.`,
                        onConfirm: () => {
                          deleteUser(u.id);
                          addToast({ type: 'info', title: 'User Deactivated', message: `Revoked access for ${u.name}.` });
                        }
                      })
                    }
                    className="text-stone-400 hover:text-rose-600"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Tab 2: Permissions Matrix */}
      {activeTab === 'roles' && (
        <div className="bg-white dark:bg-stone-900 rounded-2xl border overflow-hidden shadow-2xs">
          <table className="w-full text-left text-xs">
            <thead className="bg-stone-50 dark:bg-stone-800 text-stone-600 dark:text-stone-300 font-bold uppercase">
              <tr>
                <th className="p-3.5">System Module</th>
                <th className="p-3.5 text-center">Super Admin</th>
                <th className="p-3.5 text-center">Admin</th>
                <th className="p-3.5 text-center">Manager</th>
                <th className="p-3.5 text-center">Support</th>
                <th className="p-3.5 text-center">Viewer</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 dark:divide-stone-800">
              {rolesMatrix.map((row, idx) => (
                <tr key={idx} className="hover:bg-stone-50/50 dark:hover:bg-stone-800/40">
                  <td className="p-3.5 font-semibold text-stone-800 dark:text-stone-200">{row.module}</td>
                  <td className="p-3.5 text-center">{row.superAdmin ? <Check className="w-4 h-4 text-emerald-600 mx-auto" /> : <X className="w-4 h-4 text-stone-300 dark:text-stone-600 mx-auto" />}</td>
                  <td className="p-3.5 text-center">{row.admin ? <Check className="w-4 h-4 text-emerald-600 mx-auto" /> : <X className="w-4 h-4 text-stone-300 dark:text-stone-600 mx-auto" />}</td>
                  <td className="p-3.5 text-center">{row.manager ? <Check className="w-4 h-4 text-emerald-600 mx-auto" /> : <X className="w-4 h-4 text-stone-300 dark:text-stone-600 mx-auto" />}</td>
                  <td className="p-3.5 text-center">{row.support ? <Check className="w-4 h-4 text-emerald-600 mx-auto" /> : <X className="w-4 h-4 text-stone-300 dark:text-stone-600 mx-auto" />}</td>
                  <td className="p-3.5 text-center">{row.viewer ? <Check className="w-4 h-4 text-emerald-600 mx-auto" /> : <X className="w-4 h-4 text-stone-300 dark:text-stone-600 mx-auto" />}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Tab 3: Activity Audit Log */}
      {activeTab === 'audit' && (
        <div className="bg-white dark:bg-stone-900 rounded-2xl border overflow-hidden shadow-2xs">
          <div className="p-4 border-b flex items-center justify-between text-xs">
            <span className="font-bold text-stone-800 dark:text-stone-200">Security Audit Trail</span>
            <button
              onClick={() =>
                downloadCSV(
                  'kapee-audit-log',
                  [
                    { header: 'Date & Time', value: (log) => csvDate(log.timestamp) },
                    { header: 'User', value: (log) => log.user },
                    { header: 'Role', value: (log) => log.role },
                    { header: 'Action', value: (log) => log.action },
                    { header: 'Details', value: (log) => log.details }
                  ],
                  activityLogs
                )
              }
              disabled={!activityLogs.length}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-stone-600 dark:text-stone-300 hover:bg-stone-50 dark:hover:bg-stone-800 font-semibold"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export Audit Log</span>
            </button>
          </div>

          <div className="divide-y divide-stone-100 dark:divide-stone-800 text-xs">
            {activityLogs.map((log) => (
              <div key={log.id} className="p-4 flex items-center justify-between hover:bg-stone-50/50 dark:hover:bg-stone-800/40">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-stone-900 dark:text-stone-100">{log.user}</span>
                    <span className="text-[10px] text-stone-400">({log.role})</span>
                    <span className="px-2 py-0.5 rounded-md bg-stone-100 dark:bg-stone-800 text-emerald-deep dark:text-emerald-300 font-semibold text-[10px]">
                      {log.action}
                    </span>
                  </div>
                  <p className="text-stone-600 dark:text-stone-300">{log.details}</p>
                </div>
                <span className="text-[11px] text-stone-400 whitespace-nowrap">
                  {new Date(log.timestamp).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Invite Drawer */}
      <SideDrawer
        isOpen={userDrawerOpen}
        onClose={() => setUserDrawerOpen(false)}
        title="Invite Admin Teammate"
        subtitle="Provision workspace access with custom role restrictions"
        footer={
          <div className="flex justify-end gap-2">
            <button onClick={() => setUserDrawerOpen(false)} className="px-3 py-1.5 text-xs text-stone-500">Cancel</button>
            <button onClick={handleSaveUser} className="px-4 py-1.5 text-xs font-semibold bg-emerald-deep text-white rounded-xl">Send Invite</button>
          </div>
        }
      >
        <div className="space-y-4 text-xs">
          <div className="space-y-1">
            <label className="font-semibold text-stone-700 dark:text-stone-300">Teammate Full Name *</label>
            <input
              type="text"
              value={userForm.name}
              onChange={(e) => setUserForm({ ...userForm, name: e.target.value })}
              className="w-full px-3 py-2 border rounded-xl"
            />
          </div>
          <div className="space-y-1">
            <label className="font-semibold text-stone-700 dark:text-stone-300">Email Address *</label>
            <input
              type="email"
              value={userForm.email}
              onChange={(e) => setUserForm({ ...userForm, email: e.target.value })}
              className="w-full px-3 py-2 border rounded-xl"
            />
          </div>
          <div className="space-y-1">
            <label className="font-semibold text-stone-700 dark:text-stone-300">Role</label>
            <CustomSelect
              value={userForm.role}
              onChange={(e) => setUserForm({ ...userForm, role: e.target.value })}
              options={ROLE_OPTIONS}
            />
          </div>
        </div>
      </SideDrawer>
    </div>
  );
};
