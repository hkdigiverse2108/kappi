import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  Megaphone,
  Mail,
  Send,
  Trash2,
  Clock,
  Download,
  Save,
  Search,
  Filter,
  Eye,
  Phone,
  MessageSquare,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  ExternalLink,
  X
} from 'lucide-react';
import { useAdminStore } from '../store/adminStore';
import { StatusBadge } from '../components/common/StatusBadge';
import { SideDrawer } from '../components/common/SideDrawer';
import { ConfirmDialog } from '../components/common/ConfirmDialog';
import { triggerKapeeCelebration } from '../components/common/Confetti';
import { WhatsAppIcon } from '../../components/common/WhatsAppIcon';
import { CustomSelect } from '../components/common/CustomSelect';
import { confirmDelete } from '../../store/useConfirmStore';

const ENQUIRY_STATUS_OPTIONS = [
  { value: 'New', label: '● New' },
  { value: 'In Progress', label: '● In Progress' },
  { value: 'Resolved', label: '● Resolved' }
];

export const MarketingPage = () => {
  const {
    subscribers,
    deleteSubscriber,
    enquiries,
    updateEnquiryStatus,
    deleteEnquiry,
    addToast
  } = useAdminStore();

  const [activeTab, setActiveTab] = useState('enquiries'); // default to 'enquiries' as requested

  // Enquiries Table Search & Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All'); // 'All' | 'New' | 'In Progress' | 'Resolved'

  // Selected enquiry for detail drawer
  const [detailEnquiry, setDetailEnquiry] = useState(null);

  // Selected enquiry for reply modal
  const [replyEnquiry, setReplyEnquiry] = useState(null);
  const [replySubject, setReplySubject] = useState('');
  const [replyText, setReplyText] = useState('');

  // Delete enquiry target
  const [deleteTarget, setDeleteTarget] = useState(null);

  // Compute status counts
  const enquiriesList = enquiries || [];
  const countAll = enquiriesList.length;
  const countNew = enquiriesList.filter((e) => e.status === 'New').length;
  const countInProgress = enquiriesList.filter((e) => e.status === 'In Progress').length;
  const countResolved = enquiriesList.filter((e) => e.status === 'Resolved').length;

  // Filtered enquiries
  const filteredEnquiries = useMemo(() => {
    return enquiriesList.filter((e) => {
      const matchesStatus = statusFilter === 'All' || e.status === statusFilter;
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        (e.name && e.name.toLowerCase().includes(q)) ||
        (e.email && e.email.toLowerCase().includes(q)) ||
        (e.phone && e.phone.toLowerCase().includes(q)) ||
        (e.subject && e.subject.toLowerCase().includes(q)) ||
        (e.message && e.message.toLowerCase().includes(q));

      return matchesStatus && matchesSearch;
    });
  }, [enquiriesList, statusFilter, searchQuery]);

  const handleOpenReply = (enquiry) => {
    setReplyEnquiry(enquiry);
    setReplySubject(`Re: ${enquiry.subject || 'Your Inquiry to KAPEE Enterprise'}`);
    setReplyText(`Dear ${enquiry.name || 'Customer'},\n\nThank you for contacting KAPEE Enterprise. Regarding your query:\n\n`);
  };

  const handleSendEnquiryReply = () => {
    if (!replyEnquiry || !replyText.trim()) return;
    updateEnquiryStatus(replyEnquiry.id, 'Resolved');
    triggerKapeeCelebration();
    addToast({
      type: 'success',
      title: 'Reply Sent',
      message: `Sent email response to ${replyEnquiry.name || replyEnquiry.email} and marked as Resolved.`
    });
    setReplyEnquiry(null);
    setReplyText('');
    setReplySubject('');
    if (detailEnquiry?.id === replyEnquiry.id) {
      setDetailEnquiry({ ...detailEnquiry, status: 'Resolved' });
    }
  };

  const handleConfirmDelete = () => {
    if (!deleteTarget) return;
    deleteEnquiry(deleteTarget.id);
    addToast({
      type: 'info',
      title: 'Enquiry Deleted',
      message: `Removed inquiry from ${deleteTarget.name}.`
    });
    if (detailEnquiry?.id === deleteTarget.id) {
      setDetailEnquiry(null);
    }
    setDeleteTarget(null);
  };

  const handleStatusChange = (id, newStatus) => {
    updateEnquiryStatus(id, newStatus);
    addToast({
      type: 'info',
      title: 'Status Updated',
      message: `Enquiry marked as "${newStatus}".`
    });
    if (detailEnquiry?.id === id) {
      setDetailEnquiry((prev) => (prev ? { ...prev, status: newStatus } : null));
    }
  };

  // Helper to format WhatsApp phone url
  const getWhatsAppLink = (phone, name) => {
    if (!phone) return null;
    const cleanPhone = phone.replace(/[^0-9]/g, '');
    const phoneWithCode = cleanPhone.length === 10 ? `91${cleanPhone}` : cleanPhone;
    const message = encodeURIComponent(`Hello ${name || 'there'}, thank you for contacting KAPEE Enterprise support.`);
    return `https://wa.me/${phoneWithCode}?text=${message}`;
  };

  return (
    <div className="space-y-6 w-full">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-ink dark:text-stone-100 flex items-center gap-2.5">
            <Megaphone className="w-7 h-7 text-emerald-deep dark:text-emerald-400" />
            <span>Inquiries</span>
          </h1>
          <p className="text-xs sm:text-sm text-muted dark:text-stone-400 mt-1">
            Real-time customer inquiries from the Contact Us page, email notifications, and audience newsletter subscribers.
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            triggerKapeeCelebration();
            addToast({
              type: 'success',
              title: 'Marketing Saved',
              message: 'Audience communication settings updated.'
            });
          }}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold bg-emerald-deep hover:bg-emerald-800 text-white shadow-md hover:shadow-lg transition-all active:scale-95 whitespace-nowrap self-start sm:self-auto"
        >
          <Save className="w-4 h-4" />
          <span>Save Settings</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-stone-200 dark:border-stone-800 overflow-x-auto">
        {[
          { key: 'enquiries', label: `Customer Enquiries Inbox (${countAll})`, badge: countNew > 0 ? `${countNew} New` : null },
          { key: 'subscribers', label: `Newsletter Subscribers (${subscribers.length})` }
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`pb-3 px-4 text-xs sm:text-sm font-semibold whitespace-nowrap relative transition-colors flex items-center gap-2 ${
              activeTab === tab.key
                ? 'text-emerald-deep dark:text-emerald-300'
                : 'text-stone-500 hover:text-stone-800'
            }`}
          >
            <span>{tab.label}</span>
            {tab.badge && (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500 text-white animate-pulse">
                {tab.badge}
              </span>
            )}
            {activeTab === tab.key && (
              <motion.div
                layoutId="marketingTabPill"
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-deep dark:bg-emerald-400"
              />
            )}
          </button>
        ))}
      </div>

      {/* Tab 1: Customer Enquiries Table View */}
      {activeTab === 'enquiries' && (
        <div className="space-y-4">
          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-4 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-2xs">
              <span className="text-[10px] uppercase font-bold tracking-wider text-muted dark:text-stone-400">Total Inquiries</span>
              <div className="text-2xl font-serif font-extrabold text-ink dark:text-stone-100 mt-1">{countAll}</div>
              <span className="text-[11px] text-muted">From Contact Us Page</span>
            </div>
            <div className="p-4 rounded-2xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/60 shadow-2xs">
              <span className="text-[10px] uppercase font-bold tracking-wider text-amber-700 dark:text-amber-400">New / Unread</span>
              <div className="text-2xl font-serif font-extrabold text-amber-700 dark:text-amber-300 mt-1">{countNew}</div>
              <span className="text-[11px] text-amber-600 dark:text-amber-400">Needs immediate reply</span>
            </div>
            <div className="p-4 rounded-2xl bg-blue-50/70 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900/60 shadow-2xs">
              <span className="text-[10px] uppercase font-bold tracking-wider text-blue-700 dark:text-blue-400">In Progress</span>
              <div className="text-2xl font-serif font-extrabold text-blue-700 dark:text-blue-300 mt-1">{countInProgress}</div>
              <span className="text-[11px] text-blue-600 dark:text-blue-400">Under support review</span>
            </div>
            <div className="p-4 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/60 shadow-2xs">
              <span className="text-[10px] uppercase font-bold tracking-wider text-emerald-700 dark:text-emerald-400">Resolved</span>
              <div className="text-2xl font-serif font-extrabold text-emerald-700 dark:text-emerald-300 mt-1">{countResolved}</div>
              <span className="text-[11px] text-emerald-600 dark:text-emerald-400">Customer notified</span>
            </div>
          </div>

          {/* Table Container Card */}
          <div className="bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800 shadow-2xs overflow-hidden">
            {/* Table Controls Header: Search & Filter Tabs */}
            <div className="p-4 border-b border-stone-200 dark:border-stone-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              {/* Search Bar */}
              <div className="relative flex-1 max-w-md">
                <Search className="w-4 h-4 absolute left-3 top-2.5 text-stone-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by customer name, email, phone, topic, or message..."
                  className="w-full pl-9 pr-8 py-2 rounded-xl text-xs bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-ink dark:text-stone-100 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-emerald-deep"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="absolute right-2.5 top-2.5 text-stone-400 hover:text-stone-600"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Status Filter Pills */}
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-[11px] font-semibold text-stone-500 mr-1 hidden lg:inline">Filter:</span>
                {[
                  { key: 'All', label: 'All', count: countAll },
                  { key: 'New', label: 'New', count: countNew },
                  { key: 'In Progress', label: 'In Progress', count: countInProgress },
                  { key: 'Resolved', label: 'Resolved', count: countResolved }
                ].map((f) => (
                  <button
                    key={f.key}
                    type="button"
                    onClick={() => setStatusFilter(f.key)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 ${
                      statusFilter === f.key
                        ? 'bg-emerald-deep text-white shadow-xs'
                        : 'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 hover:bg-stone-200 dark:hover:bg-stone-700'
                    }`}
                  >
                    <span>{f.label}</span>
                    <span
                      className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                        statusFilter === f.key
                          ? 'bg-white/20 text-white'
                          : 'bg-stone-200/80 dark:bg-stone-700 text-stone-600 dark:text-stone-400'
                      }`}
                    >
                      {f.count}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Table View */}
            {filteredEnquiries.length === 0 ? (
              <div className="py-16 text-center space-y-3">
                <MessageSquare className="w-10 h-10 text-stone-300 dark:text-stone-600 mx-auto" />
                <p className="text-sm font-semibold text-stone-700 dark:text-stone-300">
                  No inquiries found
                </p>
                <p className="text-xs text-muted max-w-sm mx-auto">
                  {searchQuery || statusFilter !== 'All'
                    ? 'No messages matched your search query or filter. Try clearing filters.'
                    : 'Customer messages submitted via the Contact Us page will automatically appear here in real-time.'}
                </p>
                {(searchQuery || statusFilter !== 'All') && (
                  <button
                    type="button"
                    onClick={() => {
                      setSearchQuery('');
                      setStatusFilter('All');
                    }}
                    className="text-xs font-bold text-emerald-deep dark:text-emerald-400 hover:underline"
                  >
                    Clear All Filters
                  </button>
                )}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead className="bg-stone-50 dark:bg-stone-800/80 text-stone-500 dark:text-stone-400 uppercase text-[10px] tracking-wider font-bold border-b border-stone-200 dark:border-stone-800">
                    <tr>
                      <th className="py-3.5 px-4">Customer</th>
                      <th className="py-3.5 px-4">Subject & Inquiry</th>
                      <th className="py-3.5 px-4 whitespace-nowrap">Received</th>
                      <th className="py-3.5 px-4 whitespace-nowrap">Status</th>
                      <th className="py-3.5 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100 dark:divide-stone-800/70">
                    {filteredEnquiries.map((e) => {
                      const waLink = getWhatsAppLink(e.phone, e.name);
                      const isNew = e.status === 'New';

                      return (
                        <tr
                          key={e.id}
                          className={`hover:bg-stone-50/70 dark:hover:bg-stone-800/40 transition-colors ${
                            isNew ? 'bg-amber-50/20 dark:bg-amber-950/10' : ''
                          }`}
                        >
                          {/* 1. Customer Column */}
                          <td className="py-3.5 px-4 align-top">
                            <div className="flex items-start gap-3">
                              <div
                                className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs shrink-0 mt-0.5 ${
                                  isNew
                                    ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/60 dark:text-amber-300 ring-2 ring-amber-400/30'
                                    : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                                }`}
                              >
                                {e.name?.charAt(0)?.toUpperCase() || 'C'}
                              </div>
                              <div className="space-y-0.5 min-w-0">
                                <div className="font-bold text-ink dark:text-stone-100 truncate flex items-center gap-1.5">
                                  <span>{e.name || 'Anonymous'}</span>
                                  {isNew && (
                                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-ping inline-block" />
                                  )}
                                </div>
                                {e.email && (
                                  <a
                                    href={`mailto:${e.email}`}
                                    className="text-muted dark:text-stone-400 hover:text-emerald-deep dark:hover:text-emerald-400 flex items-center gap-1 text-[11px] truncate"
                                    title={`Email ${e.email}`}
                                  >
                                    <Mail className="w-3 h-3 shrink-0" />
                                    <span className="truncate">{e.email}</span>
                                  </a>
                                )}
                                {e.phone && e.phone !== 'N/A' && (
                                  <div className="flex items-center gap-1.5 text-[11px] text-muted dark:text-stone-400">
                                    <Phone className="w-3 h-3 shrink-0" />
                                    <span>{e.phone}</span>
                                    {waLink && (
                                      <a
                                        href={waLink}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="text-[#25D366] hover:opacity-80 inline-flex items-center"
                                        title="Chat on WhatsApp"
                                      >
                                        <WhatsAppIcon className="w-3 h-3" />
                                      </a>
                                    )}
                                  </div>
                                )}
                              </div>
                            </div>
                          </td>

                          {/* 2. Subject & Message Column */}
                          <td className="py-3.5 px-4 align-top max-w-md">
                            <div className="space-y-1">
                              <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60">
                                {e.subject || 'General Inquiry'}
                              </span>
                              <p className="text-stone-700 dark:text-stone-200 line-clamp-2 leading-relaxed">
                                {e.message}
                              </p>
                              {e.message && e.message.length > 80 && (
                                <button
                                  type="button"
                                  onClick={() => setDetailEnquiry(e)}
                                  className="text-[11px] font-semibold text-emerald-deep dark:text-emerald-400 hover:underline inline-block pt-0.5"
                                >
                                  Read full message →
                                </button>
                              )}
                            </div>
                          </td>

                          {/* 3. Received Date Column */}
                          <td className="py-3.5 px-4 align-top whitespace-nowrap text-stone-500 dark:text-stone-400">
                            <div className="flex items-center gap-1.5 text-[11px]">
                              <Clock className="w-3 h-3 text-stone-400" />
                              <span>{e.date || 'Recent'}</span>
                            </div>
                          </td>

                          {/* 4. Status Column with Quick Dropdown */}
                          <td className="py-3.5 px-4 align-top whitespace-nowrap min-w-[140px]">
                            <CustomSelect
                              size="sm"
                              value={e.status || 'New'}
                              onChange={(ev) => handleStatusChange(e.id, ev.target.value)}
                              options={ENQUIRY_STATUS_OPTIONS}
                              className={
                                e.status === 'New'
                                  ? '!bg-amber-50 !text-amber-800 !border-amber-300 dark:!bg-amber-950/50 dark:!text-amber-300 dark:!border-amber-800 font-bold'
                                  : e.status === 'In Progress'
                                  ? '!bg-blue-50 !text-blue-800 !border-blue-300 dark:!bg-blue-950/50 dark:!text-blue-300 dark:!border-blue-800 font-bold'
                                  : '!bg-emerald-50 !text-emerald-800 !border-emerald-300 dark:!bg-emerald-950/50 dark:!text-emerald-300 dark:!border-emerald-800 font-bold'
                              }
                            />
                          </td>

                          {/* 5. Actions Column */}
                          <td className="py-3.5 px-4 align-top text-right whitespace-nowrap">
                            <div className="flex items-center justify-end gap-1.5">
                              {/* View Details Button */}
                              <button
                                type="button"
                                onClick={() => setDetailEnquiry(e)}
                                className="p-1.5 rounded-lg border border-stone-300 dark:border-stone-700 hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-600 dark:text-stone-300 transition-colors"
                                title="View Details"
                              >
                                <Eye className="w-3.5 h-3.5" />
                              </button>

                              {/* Direct Reply Email Button */}
                              <button
                                type="button"
                                onClick={() => handleOpenReply(e)}
                                className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-emerald-deep hover:bg-emerald-800 text-white font-semibold text-[11px] shadow-2xs transition-all active:scale-95"
                                title="Send Email Reply"
                              >
                                <Send className="w-3 h-3" />
                                <span className="hidden md:inline">Reply</span>
                              </button>

                              {/* WhatsApp Chat Button */}
                              {waLink && (
                                <a
                                  href={waLink}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="p-1.5 rounded-lg border border-[#25D366]/40 text-[#25D366] hover:bg-[#25D366]/10 transition-colors"
                                  title="WhatsApp Chat"
                                >
                                  <WhatsAppIcon className="w-3.5 h-3.5" />
                                </a>
                              )}

                              {/* Delete Button */}
                              <button
                                type="button"
                                onClick={() => setDeleteTarget(e)}
                                className="p-1.5 rounded-lg border border-red-200 dark:border-red-900/60 hover:bg-red-50 dark:hover:bg-red-950/40 text-red-600 dark:text-red-400 transition-colors"
                                title="Delete Inquiry"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab 2: Subscribers Table */}
      {activeTab === 'subscribers' && (
        <div className="bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800 overflow-hidden shadow-2xs">
          <div className="p-4 border-b border-stone-200 dark:border-stone-800 flex justify-between items-center text-xs">
            <div>
              <span className="font-bold text-stone-800 dark:text-stone-200">Newsletter Audience List</span>
              <p className="text-[11px] text-muted dark:text-stone-400">
                Customers who opted in via footer or promotions.
              </p>
            </div>
            <button
              onClick={() => addToast({ type: 'info', title: 'Export Ready', message: 'Downloading subscribers CSV.' })}
              className="flex items-center gap-1 px-3 py-1.5 rounded-xl border border-stone-300 dark:border-stone-700 text-stone-600 dark:text-stone-300 hover:bg-stone-50 dark:hover:bg-stone-800 font-semibold"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export CSV</span>
            </button>
          </div>
          <table className="w-full text-left text-xs">
            <thead className="bg-stone-50 dark:bg-stone-800/80 text-stone-500 uppercase font-semibold text-[10px] tracking-wider">
              <tr>
                <th className="p-3.5">Email Address</th>
                <th className="p-3.5">Opt-in Source</th>
                <th className="p-3.5">Joined Date</th>
                <th className="p-3.5">Status</th>
                <th className="p-3.5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 dark:divide-stone-800">
              {subscribers.map((s) => (
                <tr key={s.id} className="hover:bg-stone-50/50 dark:hover:bg-stone-800/40">
                  <td className="p-3.5 font-bold text-stone-800 dark:text-stone-200">{s.email}</td>
                  <td className="p-3.5 text-stone-500 dark:text-stone-400">{s.source}</td>
                  <td className="p-3.5 text-stone-400">{s.date}</td>
                  <td className="p-3.5"><StatusBadge status={s.status} /></td>
                  <td className="p-3.5 text-right">
                    <button
                      onClick={() =>
                        confirmDelete({
                          title: 'Remove Subscriber?',
                          message: `Remove ${s.email} from the newsletter list?`,
                          onConfirm: () => {
                            deleteSubscriber(s.id);
                            addToast({ type: 'info', title: 'Removed', message: `Removed subscriber ${s.email}` });
                          }
                        })
                      }
                      className="text-stone-400 hover:text-rose-600 p-1"
                      title="Remove subscriber"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Inquiry Detail SideDrawer */}
      <SideDrawer
        isOpen={Boolean(detailEnquiry)}
        onClose={() => setDetailEnquiry(null)}
        title={detailEnquiry ? `Inquiry from ${detailEnquiry.name}` : 'Customer Inquiry'}
      >
        {detailEnquiry && (
          <div className="space-y-5 text-xs">
            {/* Customer Header Card */}
            <div className="p-4 rounded-xl bg-stone-50 dark:bg-stone-800/60 border border-stone-200 dark:border-stone-700 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-9 h-9 rounded-full bg-emerald-deep text-white flex items-center justify-center font-bold text-sm">
                    {detailEnquiry.name?.charAt(0) || 'C'}
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-ink dark:text-stone-100">{detailEnquiry.name}</h3>
                    <p className="text-[11px] text-muted dark:text-stone-400">Received: {detailEnquiry.date || 'Recent'}</p>
                  </div>
                </div>
                <StatusBadge status={detailEnquiry.status} />
              </div>

              <div className="pt-2 border-t border-stone-200 dark:border-stone-700 grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
                {detailEnquiry.email && (
                  <div>
                    <span className="text-stone-400 block">Email Address:</span>
                    <a href={`mailto:${detailEnquiry.email}`} className="font-semibold text-emerald-deep dark:text-emerald-400 hover:underline">
                      {detailEnquiry.email}
                    </a>
                  </div>
                )}
                {detailEnquiry.phone && (
                  <div>
                    <span className="text-stone-400 block">Phone Number:</span>
                    <a href={`tel:${detailEnquiry.phone}`} className="font-semibold text-stone-700 dark:text-stone-300">
                      {detailEnquiry.phone}
                    </a>
                  </div>
                )}
              </div>
            </div>

            {/* Subject & Full Message */}
            <div className="space-y-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-stone-500">Inquiry Topic:</span>
              <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-200 font-bold border border-emerald-200 dark:border-emerald-900">
                {detailEnquiry.subject || 'General Inquiry'}
              </div>
            </div>

            <div className="space-y-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-stone-500">Full Message:</span>
              <div className="p-4 rounded-xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 text-stone-800 dark:text-stone-200 leading-relaxed whitespace-pre-line text-sm">
                "{detailEnquiry.message}"
              </div>
            </div>

            {/* Change Status */}
            <div className="space-y-1.5 pt-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-stone-500">Update Status:</span>
              <div className="flex gap-2">
                {['New', 'In Progress', 'Resolved'].map((st) => (
                  <button
                    key={st}
                    type="button"
                    onClick={() => handleStatusChange(detailEnquiry.id, st)}
                    className={`flex-1 py-2 rounded-xl text-xs font-bold border transition-all ${
                      detailEnquiry.status === st
                        ? 'bg-emerald-deep text-white border-emerald-deep'
                        : 'border-stone-200 dark:border-stone-700 text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800'
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>
            </div>

            {/* Drawer Actions */}
            <div className="pt-4 border-t border-stone-200 dark:border-stone-700 flex items-center justify-between gap-2">
              <button
                type="button"
                onClick={() => setDeleteTarget(detailEnquiry)}
                className="px-3 py-2 rounded-xl text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 text-xs font-semibold flex items-center gap-1"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete</span>
              </button>

              <div className="flex items-center gap-2">
                {getWhatsAppLink(detailEnquiry.phone, detailEnquiry.name) && (
                  <a
                    href={getWhatsAppLink(detailEnquiry.phone, detailEnquiry.name)}
                    target="_blank"
                    rel="noreferrer"
                    className="px-3 py-2 rounded-xl border border-[#25D366] text-[#25D366] hover:bg-[#25D366]/10 font-bold text-xs flex items-center gap-1"
                  >
                    <WhatsAppIcon className="w-3.5 h-3.5" />
                    <span>WhatsApp</span>
                  </a>
                )}
                <button
                  type="button"
                  onClick={() => {
                    handleOpenReply(detailEnquiry);
                  }}
                  className="px-4 py-2 rounded-xl bg-emerald-deep hover:bg-emerald-800 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Compose Email Reply</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </SideDrawer>

      {/* Reply Modal */}
      {replyEnquiry && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/50 backdrop-blur-xs"
          onClick={(e) => {
            if (e.target === e.currentTarget) setReplyEnquiry(null);
          }}
        >
          <div className="bg-white dark:bg-stone-900 rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl border border-stone-200 dark:border-stone-800 animate-in fade-in zoom-in-95">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-serif font-bold text-base text-ink dark:text-stone-100 flex items-center gap-2">
                  <Send className="w-4 h-4 text-emerald-deep dark:text-emerald-400" />
                  <span>Reply to {replyEnquiry.name}</span>
                </h3>
                <p className="text-[11px] text-muted dark:text-stone-400 mt-0.5">
                  Recipient: <span className="font-semibold text-stone-700 dark:text-stone-300">{replyEnquiry.email}</span>
                </p>
              </div>
              <button
                type="button"
                onClick={() => setReplyEnquiry(null)}
                className="p-1 rounded-lg text-stone-400 hover:text-stone-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-3 rounded-xl bg-stone-50 dark:bg-stone-800/60 border border-stone-200 dark:border-stone-700 text-xs">
              <span className="font-bold text-stone-700 dark:text-stone-300 block mb-1">Customer's Query:</span>
              <p className="italic text-stone-600 dark:text-stone-400 line-clamp-3">"{replyEnquiry.message}"</p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                Email Subject
              </label>
              <input
                type="text"
                value={replySubject}
                onChange={(e) => setReplySubject(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-stone-200 dark:border-stone-700 rounded-xl bg-stone-50 dark:bg-stone-800 text-ink dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-emerald-deep"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                Response Message
              </label>
              <textarea
                rows={6}
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                placeholder="Type your response from KAPEE Customer Happiness team..."
                className="w-full px-3 py-2 text-xs border border-stone-200 dark:border-stone-700 rounded-xl bg-stone-50 dark:bg-stone-800 text-ink dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-emerald-deep leading-relaxed"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-stone-200 dark:border-stone-800">
              <button
                type="button"
                onClick={() => setReplyEnquiry(null)}
                className="px-4 py-2 text-xs font-semibold text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800 rounded-xl"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSendEnquiryReply}
                className="flex items-center gap-1.5 px-5 py-2 text-xs font-bold bg-emerald-deep hover:bg-emerald-800 text-white rounded-xl shadow-md transition-all active:scale-95"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Send Response & Resolve</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmDialog
        isOpen={Boolean(deleteTarget)}
        title="Delete Inquiry?"
        message={`Are you sure you want to permanently delete this customer inquiry from ${deleteTarget?.name}?`}
        confirmText="Delete Inquiry"
        cancelText="Cancel"
        variant="danger"
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
};

export default MarketingPage;
