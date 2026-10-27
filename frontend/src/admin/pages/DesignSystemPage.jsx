import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Sparkles,
  Leaf,
  Layers,
  Palette,
  CheckCircle,
  AlertTriangle,
  XCircle,
  Info,
  TrendingUp,
  ShoppingBag,
  IndianRupee,
  ArrowRight,
  Sun,
  Moon,
  Copy,
  Check,
  Search,
  Save
} from 'lucide-react';
import { StatusBadge } from '../components/common/StatusBadge';
import { useAdminStore } from '../store/adminStore';
import { triggerKapeeCelebration } from '../components/common/Confetti';
import { CustomSelect } from '../components/common/CustomSelect';

export const DesignSystemPage = () => {
  const { darkMode, toggleTheme, addToast } = useAdminStore();
  const [copiedHex, setCopiedHex] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedTableRow, setSelectedTableRow] = useState(1);
  const [demoToggle, setDemoToggle] = useState(true);
  const [demoCheckbox, setDemoCheckbox] = useState(true);
  const [demoRadio, setDemoRadio] = useState('standard');

  const copyToClipboard = (text) => {
    navigator.clipboard?.writeText(text);
    setCopiedHex(text);
    setTimeout(() => setCopiedHex(null), 1800);
  };

  const emeraldScale = [
    { step: '50', hex: '#EAF4F2' },
    { step: '100', hex: '#CFE6E2' },
    { step: '200', hex: '#A0CDC5' },
    { step: '300', hex: '#6FB2A7' },
    { step: '400', hex: '#3D968A' },
    { step: '500', hex: '#0F7A6F' },
    { step: '600', hex: '#0A5C55' },
    { step: '700', hex: '#074B45' },
    { step: '800', hex: '#04403B' },
    { step: '900', hex: '#032E2A' },
    { step: '950', hex: '#021F1C' },
  ];

  const goldScale = [
    { step: '50', hex: '#FDF8E8' },
    { step: '100', hex: '#F8EBC0' },
    { step: '200', hex: '#F1DB93' },
    { step: '300', hex: '#EBCB6B' },
    { step: '400', hex: '#DDB04A' },
    { step: '500', hex: '#C8962E' },
    { step: '600', hex: '#A87820' },
    { step: '700', hex: '#8F6414' },
    { step: '800', hex: '#6B4A0E' },
    { step: '900', hex: '#4A3309' },
  ];

  const chartColors = [
    { name: 'Emerald', hex: '#0A5C55', role: 'Current Period Revenue / Primary Metric' },
    { name: 'Gold', hex: '#C8962E', role: 'Previous Period Benchmark / Secondary' },
    { name: 'Mint Teal', hex: '#3D968A', role: 'Fulfillment & Dispatched' },
    { name: 'Light Gold', hex: '#EBCB6B', role: 'AOV & Basket Size' },
    { name: 'Blue', hex: '#2563EB', role: 'Prepaid Digital Volume' },
    { name: 'Violet', hex: '#7C5CBF', role: 'Repeat Customers' },
    { name: 'Coral', hex: '#E4572E', role: 'RTO / Return Risk' },
    { name: 'Slate', hex: '#8A9A97', role: 'Base Grid / Neutral Line' },
  ];

  const orderStatuses = [
    'Pending',
    'Confirmed',
    'Packed',
    'Shipped',
    'Out for delivery',
    'Delivered',
    'Cancelled',
    'RTO/Returned',
    'Refunded',
    'Failed'
  ];

  const reviewStatuses = ['Pending', 'Approved', 'Rejected', 'Spam'];

  return (
    <div className="space-y-10 pb-16 max-w-7xl mx-auto">
      {/* Header Banner */}
      <div className="p-8 rounded-3xl bg-gradient-to-r from-[#032E2A] via-[#04403B] to-[#0A5C55] text-white relative overflow-hidden shadow-lg border border-white/10">
        <div className="absolute top-0 right-0 w-80 h-80 bg-[#C8962E]/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/15 text-xs font-semibold text-[#EBCB6B]">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Super Admin Exclusive</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-serif font-bold tracking-tight">
              KAPEE Luxury Eco-Clean Design System
            </h1>
            <p className="text-sm text-[#CFE6E2] max-w-2xl leading-relaxed">
              Standardized tokens, 60-30-10 color rule enforcement (~60% warm ivory/white surfaces, ~30% deep emerald base, ~10% metallic gold accents), WCAG 4.5:1 compliant contrast, and responsive dark mode.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => {
                triggerKapeeCelebration();
                addToast({
                  type: 'success',
                  title: 'Design System Saved',
                  message: 'Theme tokens, 60-30-10 palette rules, and typography saved.'
                });
              }}
              className="px-4 py-2.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-md hover:shadow-lg transition-all active:scale-95 flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              <span>Save System</span>
            </button>
            <button
              type="button"
              onClick={toggleTheme}
              className="btn-gold px-4 py-2.5 text-xs flex items-center gap-2"
            >
              {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              <span>Switch to {darkMode ? 'Light' : 'Dark'} Mode</span>
            </button>
          </div>
        </div>
      </div>

      {/* 60-30-10 Visual Distribution Guide */}
      <div className="card-kui p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-serif font-bold text-ink dark:text-stone-100 flex items-center gap-2">
            <Layers className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            The 60-30-10 Rule Architecture
          </h2>
          <span className="text-xs font-semibold text-muted px-2.5 py-1 rounded-lg bg-surface-2">
            Visual Weight Ratio
          </span>
        </div>

        <div className="h-6 w-full rounded-xl overflow-hidden flex shadow-inner">
          <div className="w-[60%] bg-[#FBF8F1] dark:bg-[#061412] border-r border-[#E7E0CE] dark:border-[#1C3A35] flex items-center justify-center text-[11px] font-bold text-[#0E1F1D] dark:text-[#EAF3F1]">
            60% Warm Ivory Canvas & Surfaces
          </div>
          <div className="w-[30%] bg-[#0A5C55] dark:bg-[#1FA394] border-r border-[#074B45] flex items-center justify-center text-[11px] font-bold text-white">
            30% Deep Emerald Structure
          </div>
          <div className="w-[10%] bg-[#C8962E] dark:bg-[#EBCB6B] flex items-center justify-center text-[11px] font-bold text-[#04403B]">
            10% Gold
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs pt-2">
          <div className="p-3 rounded-xl bg-surface-2 border border-border">
            <p className="font-bold text-text mb-1">60% Canvas & White Space</p>
            <p className="text-muted leading-relaxed">
              Warm Ivory (<code className="text-emerald-700 dark:text-emerald-300">#FBF8F1</code>), pure white cards, data tables, and modal backgrounds for airy readability.
            </p>
          </div>
          <div className="p-3 rounded-xl bg-surface-tint border border-border">
            <p className="font-bold text-primary-deep dark:text-emerald-300 mb-1">30% Emerald Brand Structure</p>
            <p className="text-muted leading-relaxed">
              Sidebar gradient, navigation headers, primary CTA buttons, active state accents, and brand badges.
            </p>
          </div>
          <div className="p-3 rounded-xl bg-[#FDF8E8] dark:bg-[#112A26] border border-[#F1DB93]/60 dark:border-[#C8962E]/40">
            <p className="font-bold text-[#8F6414] dark:text-[#EBCB6B] mb-1">10% Metallic Gold Highlights</p>
            <p className="text-muted leading-relaxed">
              Active sidebar glow bars, focus rings (<code className="text-[#8F6414] dark:text-[#EBCB6B]">rgba(200,150,46,.45)</code>), key metrics, and celebration pulses. Never dominant.
            </p>
          </div>
        </div>
      </div>

      {/* Brand Scales: Emerald & Gold */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-serif font-bold text-ink dark:text-stone-100 flex items-center gap-2">
            <Palette className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            1) Brand Color Scales (Tailwind & CSS Tokens)
          </h2>
          <span className="text-xs text-muted">Click any swatch to copy HEX</span>
        </div>

        {/* Emerald Scale */}
        <div className="card-kui p-5 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-bold text-text">Emerald Spectrum (Base)</span>
            <span className="text-xs text-muted">50 to 950</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-11 gap-2">
            {emeraldScale.map((item) => (
              <button
                key={item.step}
                type="button"
                onClick={() => copyToClipboard(item.hex)}
                className="group p-2.5 rounded-xl border border-border text-left transition-all hover:scale-105 hover:shadow-md flex flex-col justify-between h-24"
                style={{ backgroundColor: item.hex }}
              >
                <div className="flex items-center justify-between w-full">
                  <span
                    className={`text-xs font-bold ${
                      parseInt(item.step, 10) >= 400 ? 'text-white' : 'text-[#032E2A]'
                    }`}
                  >
                    {item.step}
                  </span>
                  {copiedHex === item.hex ? (
                    <Check className="w-3.5 h-3.5 text-white" />
                  ) : (
                    <Copy className="w-3 h-3 opacity-0 group-hover:opacity-80 transition-opacity" />
                  )}
                </div>
                <span
                  className={`text-[10px] font-mono tracking-tight ${
                    parseInt(item.step, 10) >= 400 ? 'text-white/90' : 'text-[#032E2A]/90'
                  }`}
                >
                  {item.hex}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Gold Scale */}
        <div className="card-kui p-5 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-bold text-text">Metallic Gold Spectrum (Accents & Highlights)</span>
            <span className="text-xs text-muted">50 to 900</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-5 md:grid-cols-5 lg:grid-cols-10 gap-2">
            {goldScale.map((item) => (
              <button
                key={item.step}
                type="button"
                onClick={() => copyToClipboard(item.hex)}
                className="group p-2.5 rounded-xl border border-border text-left transition-all hover:scale-105 hover:shadow-md flex flex-col justify-between h-24"
                style={{ backgroundColor: item.hex }}
              >
                <div className="flex items-center justify-between w-full">
                  <span
                    className={`text-xs font-bold ${
                      parseInt(item.step, 10) >= 600 ? 'text-white' : 'text-[#04403B]'
                    }`}
                  >
                    {item.step}
                  </span>
                  {copiedHex === item.hex ? (
                    <Check className="w-3.5 h-3.5 text-white" />
                  ) : (
                    <Copy className="w-3 h-3 opacity-0 group-hover:opacity-80 transition-opacity" />
                  )}
                </div>
                <span
                  className={`text-[10px] font-mono tracking-tight ${
                    parseInt(item.step, 10) >= 600 ? 'text-white/90' : 'text-[#04403B]/90'
                  }`}
                >
                  {item.hex}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Brand Gradients */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div
            className="p-6 rounded-2xl text-white shadow-md flex items-center justify-between border border-white/10"
            style={{ background: 'linear-gradient(160deg, #032E2A 0%, #04403B 45%, #0A5C55 100%)' }}
          >
            <div>
              <p className="text-xs text-[#EBCB6B] uppercase font-bold tracking-wider">Emerald Gradient</p>
              <h3 className="text-lg font-serif font-bold mt-1">Sidebar & Hero Cards</h3>
              <p className="text-xs text-white/70 font-mono mt-1">160deg, #032E2A 0%, #04403B 45%, #0A5C55 100%</p>
            </div>
            <Leaf className="w-8 h-8 text-[#EBCB6B] opacity-80" />
          </div>

          <div
            className="p-6 rounded-2xl text-[#04403B] shadow-md flex items-center justify-between border border-white/30"
            style={{ background: 'linear-gradient(135deg, #8F6414 0%, #EBCB6B 45%, #C8962E 100%)' }}
          >
            <div>
              <p className="text-xs text-[#04403B]/70 uppercase font-bold tracking-wider">Gold Gradient</p>
              <h3 className="text-lg font-serif font-bold mt-1">Primary CTA Accents & Glow Rings</h3>
              <p className="text-xs text-[#04403B]/80 font-mono mt-1">135deg, #8F6414 0%, #EBCB6B 45%, #C8962E 100%</p>
            </div>
            <Sparkles className="w-8 h-8 text-[#04403B] opacity-80" />
          </div>
        </div>
      </div>

      {/* Semantic Color Tokens */}
      <div className="space-y-4">
        <h2 className="text-xl font-serif font-bold text-ink dark:text-stone-100">
          2) Semantic States (Text / Soft BG / Border)
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 rounded-2xl bg-[#E3F4EB] dark:bg-[rgba(30,142,90,0.2)] border border-[#BFE3CF] dark:border-[rgba(30,142,90,0.35)]">
            <div className="flex items-center gap-2 text-[#1E8E5A] dark:text-[#34D399] font-bold text-sm mb-1">
              <CheckCircle className="w-4 h-4" />
              Success
            </div>
            <p className="text-xs text-stone-700 dark:text-stone-300">
              #1E8E5A text / #E3F4EB bg / #BFE3CF border
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-[#FDF1D6] dark:bg-[rgba(217,142,4,0.2)] border border-[#F3D58E] dark:border-[rgba(217,142,4,0.35)]">
            <div className="flex items-center gap-2 text-[#D98E04] dark:text-[#FBBF24] font-bold text-sm mb-1">
              <AlertTriangle className="w-4 h-4" />
              Warning
            </div>
            <p className="text-xs text-stone-700 dark:text-stone-300">
              #D98E04 text / #FDF1D6 bg / #F3D58E border
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-[#FBE4E1] dark:bg-[rgba(192,57,43,0.2)] border border-[#F1B8B1] dark:border-[rgba(192,57,43,0.35)]">
            <div className="flex items-center gap-2 text-[#C0392B] dark:text-[#F87171] font-bold text-sm mb-1">
              <XCircle className="w-4 h-4" />
              Error
            </div>
            <p className="text-xs text-stone-700 dark:text-stone-300">
              #C0392B text / #FBE4E1 bg / #F1B8B1 border
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-[#E4ECFD] dark:bg-[rgba(37,99,235,0.2)] border border-[#BBCDF8] dark:border-[rgba(37,99,235,0.35)]">
            <div className="flex items-center gap-2 text-[#2563EB] dark:text-[#60A5FA] font-bold text-sm mb-1">
              <Info className="w-4 h-4" />
              Info
            </div>
            <p className="text-xs text-stone-700 dark:text-stone-300">
              #2563EB text / #E4ECFD bg / #BBCDF8 border
            </p>
          </div>
        </div>
      </div>

      {/* Status Badges Section */}
      <div className="space-y-4">
        <h2 className="text-xl font-serif font-bold text-ink dark:text-stone-100">
          3) Order, Shipment & Review Status Badges
        </h2>
        <div className="card-kui p-6 space-y-6">
          <div>
            <p className="text-xs uppercase font-bold text-muted tracking-wider mb-3">
              Order & Courier Pipeline Badges (Colored dot + soft tint bg + label, rounded-full)
            </p>
            <div className="flex flex-wrap items-center gap-2.5">
              {orderStatuses.map((st) => (
                <StatusBadge key={st} status={st} />
              ))}
            </div>
          </div>

          <div className="pt-4 border-t border-border">
            <p className="text-xs uppercase font-bold text-muted tracking-wider mb-3">
              Customer UGC / Review Moderation Badges
            </p>
            <div className="flex flex-wrap items-center gap-2.5">
              {reviewStatuses.map((st) => (
                <StatusBadge key={st} status={st} />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Button Design System */}
      <div className="space-y-4">
        <h2 className="text-xl font-serif font-bold text-ink dark:text-stone-100">
          4) Buttons & CTA Hierarchy
        </h2>
        <div className="card-kui p-6 space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Primary Button */}
            <div className="space-y-2">
              <p className="text-xs font-bold text-muted">Primary CTA (Emerald gradient + gold glow hover)</p>
              <button
                type="button"
                onClick={() => {
                  triggerKapeeCelebration();
                  addToast({ type: 'success', title: 'Primary Clicked', message: 'Action successfully dispatched.' });
                }}
                className="btn-primary w-full"
              >
                <span>Save Changes</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            {/* Gold CTA */}
            <div className="space-y-2">
              <p className="text-xs font-bold text-muted">Gold CTA (Publish, Create Shipment, Payout)</p>
              <button
                type="button"
                onClick={() => {
                  triggerKapeeCelebration();
                  addToast({ type: 'success', title: 'Shipment Generated', message: 'Tracking AWB generated in gold state.' });
                }}
                className="btn-gold w-full"
              >
                <Sparkles className="w-4 h-4" />
                <span>Create Shipment</span>
              </button>
            </div>

            {/* Secondary Button */}
            <div className="space-y-2">
              <p className="text-xs font-bold text-muted">Secondary (White/Surface bg + emerald text)</p>
              <button type="button" className="btn-secondary w-full">
                <span>Export CSV</span>
              </button>
            </div>

            {/* Ghost Button */}
            <div className="space-y-2">
              <p className="text-xs font-bold text-muted">Ghost (Text only with soft tint hover)</p>
              <button type="button" className="btn-ghost w-full">
                <span>View Documentation</span>
              </button>
            </div>

            {/* Destructive Button */}
            <div className="space-y-2">
              <p className="text-xs font-bold text-muted">Destructive (Error red with soft hover)</p>
              <button type="button" className="btn-destructive w-full">
                <span>Delete Product</span>
              </button>
            </div>

            {/* Disabled State */}
            <div className="space-y-2">
              <p className="text-xs font-bold text-muted">Disabled State (45% opacity constraint)</p>
              <button type="button" disabled className="btn-primary w-full">
                <span>Action Disabled</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Form Controls, Inputs & Selects */}
      <div className="space-y-4">
        <h2 className="text-xl font-serif font-bold text-ink dark:text-stone-100">
          5) Inputs, Selects & Form Controls
        </h2>
        <div className="card-kui p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Standard Input with Gold Focus Ring */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-text-2">
                Standard Input (Focus = Emerald border + Gold ring)
              </label>
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
                <input
                  type="text"
                  placeholder="Search products or orders..."
                  className="input-kui w-full pl-9"
                  defaultValue="KAPEE Magic Eraser 10-Pack"
                />
              </div>
            </div>

            {/* Select Dropdown */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-text-2">
                KAPEE Themed Select Component
              </label>
              <CustomSelect
                value="Active / Published"
                options={[
                  { value: 'Active / Published', label: 'Active / Published' },
                  { value: 'Draft Mode', label: 'Draft Mode' },
                  { value: 'Archived', label: 'Archived' }
                ]}
              />
            </div>

            {/* Error Input */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-semantic-error-text">
                Input Error State
              </label>
              <input
                type="text"
                className="input-kui w-full border-semantic-error-border focus:border-semantic-error-text focus:ring-red-400/30"
                defaultValue="invalid_sku_#000"
              />
              <p className="text-[11px] text-semantic-error-text mt-1">
                SKU format must match KAPEE-CAT-000 syntax.
              </p>
            </div>
          </div>

          {/* Toggles, Checkboxes and Radios */}
          <div className="pt-4 border-t border-border flex flex-wrap items-center gap-8 text-xs font-semibold text-text-2">
            {/* Switch Toggle */}
            <div className="flex items-center gap-3">
              <span>Status Toggle:</span>
              <button
                type="button"
                onClick={() => setDemoToggle(!demoToggle)}
                className={`w-12 h-6 rounded-full transition-colors relative p-0.5 ${
                  demoToggle ? 'bg-[#0A5C55] dark:bg-[#1FA394]' : 'bg-stone-300 dark:bg-stone-700'
                }`}
              >
                <motion.div
                  animate={{ x: demoToggle ? 24 : 2 }}
                  className="w-5 h-5 rounded-full bg-white shadow-md flex items-center justify-center"
                >
                  {demoToggle && <div className="w-1.5 h-1.5 rounded-full bg-[#C8962E]" />}
                </motion.div>
              </button>
              <span className="text-text">{demoToggle ? 'Enabled' : 'Disabled'}</span>
            </div>

            {/* Checkbox */}
            <label className="flex items-center gap-2.5 cursor-pointer">
              <input
                type="checkbox"
                checked={demoCheckbox}
                onChange={(e) => setDemoCheckbox(e.target.checked)}
                className="w-4 h-4 rounded text-primary focus:ring-gold border-border cursor-pointer accent-[#0A5C55]"
              />
              <span>Auto-dispatch courier notification</span>
            </label>

            {/* Radio Buttons */}
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="radio"
                  name="demoRadio"
                  checked={demoRadio === 'standard'}
                  onChange={() => setDemoRadio('standard')}
                  className="accent-[#0A5C55]"
                />
                <span>Standard Delivery</span>
              </label>
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="radio"
                  name="demoRadio"
                  checked={demoRadio === 'express'}
                  onChange={() => setDemoRadio('express')}
                  className="accent-[#0A5C55]"
                />
                <span>Express (Gold Priority)</span>
              </label>
            </div>
          </div>
        </div>
      </div>

      {/* Cards & Hero Card */}
      <div className="space-y-4">
        <h2 className="text-xl font-serif font-bold text-ink dark:text-stone-100">
          6) KPI Cards & Hero Card
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {/* Hero KPI Card */}
          <div
            className="rounded-2xl p-6 text-white shadow-md relative overflow-hidden flex flex-col justify-between"
            style={{ background: 'linear-gradient(160deg, #032E2A 0%, #04403B 45%, #0A5C55 100%)' }}
          >
            <div className="absolute top-2 right-2 w-24 h-24 bg-[#EBCB6B]/15 rounded-full blur-xl pointer-events-none" />
            <div className="flex items-center justify-between relative z-10">
              <span className="text-xs uppercase font-bold text-[#EBCB6B] tracking-wider">
                Hero KPI (Dashboard First Card)
              </span>
              <div className="w-10 h-10 rounded-xl bg-white/10 backdrop-blur-md flex items-center justify-center text-[#EBCB6B]">
                <Sparkles className="w-5 h-5" />
              </div>
            </div>

            <div className="my-4 relative z-10">
              <h3 className="text-3xl font-serif font-bold text-white">₹2,84,500</h3>
              <p className="text-xs text-white/70 mt-1">Gross Revenue Run-Rate</p>
            </div>

            <div className="flex items-center justify-between text-xs pt-3 border-t border-white/10 relative z-10">
              <span className="inline-flex items-center gap-1 text-[#EBCB6B] font-semibold">
                <TrendingUp className="w-3.5 h-3.5" />
                +18.4% vs last period
              </span>
              <span className="text-white/60">Real-time sync</span>
            </div>
          </div>

          {/* Standard KPI Card (Tint Chip) */}
          <div className="card-kui p-6 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-muted">Total Orders Placed</span>
              <div className="w-10 h-10 rounded-xl bg-[#EAF4F2] dark:bg-[#0F332D] text-[#0A5C55] dark:text-[#1FA394] flex items-center justify-center">
                <ShoppingBag className="w-5 h-5" />
              </div>
            </div>

            <div className="my-4">
              <h3 className="text-3xl font-serif font-bold text-text">1,482</h3>
              <p className="text-xs text-muted mt-1">Average basket 2.4 items</p>
            </div>

            <div className="flex items-center justify-between text-xs pt-3 border-t border-border">
              <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-semibold">
                <TrendingUp className="w-3.5 h-3.5" />
                +12.6%
              </span>
              <span className="text-subtle">94% dispatched</span>
            </div>
          </div>

          {/* Standard KPI Card (Gold Chip) */}
          <div className="card-kui p-6 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-muted">Average Order Value (AOV)</span>
              <div className="w-10 h-10 rounded-xl bg-[#FDF8E8] dark:bg-[#112A26] text-[#8F6414] dark:text-[#EBCB6B] flex items-center justify-center">
                <IndianRupee className="w-5 h-5" />
              </div>
            </div>

            <div className="my-4">
              <h3 className="text-3xl font-serif font-bold text-text">₹680</h3>
              <p className="text-xs text-muted mt-1">Bundles driving +₹140 lift</p>
            </div>

            <div className="flex items-center justify-between text-xs pt-3 border-t border-border">
              <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-semibold">
                <TrendingUp className="w-3.5 h-3.5" />
                +6.2%
              </span>
              <span className="text-subtle">Target ₹750</span>
            </div>
          </div>
        </div>
      </div>

      {/* Chart Color Palette & Preview */}
      <div className="space-y-4">
        <h2 className="text-xl font-serif font-bold text-ink dark:text-stone-100">
          7) Chart Color Palette (Recharts Palette in exact order)
        </h2>
        <div className="card-kui p-6 space-y-6">
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
            {chartColors.map((c, i) => (
              <div key={c.hex} className="p-3 rounded-xl border border-border text-center space-y-2">
                <div className="w-full h-8 rounded-lg shadow-xs" style={{ backgroundColor: c.hex }} />
                <div>
                  <p className="text-[11px] font-bold text-text truncate">
                    {i + 1}. {c.name}
                  </p>
                  <p className="text-[10px] font-mono text-muted">{c.hex}</p>
                </div>
              </div>
            ))}
          </div>

          {/* SVG Chart Preview */}
          <div className="p-4 rounded-xl bg-surface-2 border border-border space-y-3">
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-4">
                <span className="flex items-center gap-1.5 text-text font-semibold">
                  <span className="w-3 h-1 bg-[#0A5C55] rounded-full" />
                  Current Period (Solid Emerald)
                </span>
                <span className="flex items-center gap-1.5 text-text font-semibold">
                  <span className="w-3 h-0.5 border-t-2 border-dashed border-[#C8962E]" />
                  Previous Period (Dashed Gold)
                </span>
              </div>
              <span className="text-muted font-mono">Dashed grid lines: var(--border)</span>
            </div>

            {/* Simulated Chart Visual */}
            <div className="h-44 w-full relative flex items-end pt-4 pb-2 border-b border-dashed border-border">
              <svg className="w-full h-full overflow-visible" viewBox="0 0 500 120" preserveAspectRatio="none">
                <defs>
                  <linearGradient id="emeraldFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#0A5C55" stopOpacity="0.25" />
                    <stop offset="100%" stopColor="#0A5C55" stopOpacity="0.0" />
                  </linearGradient>
                </defs>

                {/* Grid Lines */}
                <line x1="0" y1="30" x2="500" y2="30" stroke="var(--border)" strokeDasharray="3 3" />
                <line x1="0" y1="60" x2="500" y2="60" stroke="var(--border)" strokeDasharray="3 3" />
                <line x1="0" y1="90" x2="500" y2="90" stroke="var(--border)" strokeDasharray="3 3" />

                {/* Previous Period Gold Line (Dashed) */}
                <path
                  d="M0,90 Q125,75 250,55 T500,35"
                  fill="none"
                  stroke="#C8962E"
                  strokeWidth="2"
                  strokeDasharray="4 4"
                />

                {/* Current Period Emerald Area Fill */}
                <path
                  d="M0,105 Q125,85 250,40 T500,15 L500,120 L0,120 Z"
                  fill="url(#emeraldFill)"
                />

                {/* Current Period Solid Line */}
                <path
                  d="M0,105 Q125,85 250,40 T500,15"
                  fill="none"
                  stroke="#0A5C55"
                  strokeWidth="2.5"
                />

                {/* Gold Crosshair & Dot at peak */}
                <line x1="250" y1="0" x2="250" y2="120" stroke="#EBCB6B" strokeWidth="1" strokeDasharray="2 2" />
                <circle cx="250" cy="40" r="4.5" fill="#C8962E" stroke="#FFFFFF" strokeWidth="1.5" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Tables Showcase */}
      <div className="space-y-4">
        <h2 className="text-xl font-serif font-bold text-ink dark:text-stone-100">
          8) Table Hierarchy (Sticky header, surface-2, row hover tint & selection)
        </h2>
        <div className="card-kui overflow-hidden">
          <div className="overflow-x-auto">
            <table className="table-kui w-full text-left text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="py-3 px-4">Order ID</th>
                  <th className="py-3 px-4">Customer</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Payment</th>
                  <th className="py-3 px-4 text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {[
                  { id: 'ORD-9842', name: 'Aarav Patel', status: 'Delivered', method: 'UPI Prepaid', amt: '₹1,240' },
                  { id: 'ORD-9841', name: 'Priya Sharma', status: 'Out for delivery', method: 'COD', amt: '₹680' },
                  { id: 'ORD-9840', name: 'Rohan Mehta', status: 'Shipped', method: 'Card', amt: '₹2,490' },
                  { id: 'ORD-9839', name: 'Neha Joshi', status: 'Packed', method: 'UPI Prepaid', amt: '₹450' },
                ].map((row, idx) => {
                  const isSelected = selectedTableRow === idx;
                  return (
                    <tr
                      key={row.id}
                      onClick={() => setSelectedTableRow(idx)}
                      className={`cursor-pointer transition-colors ${
                        isSelected ? 'selected' : ''
                      }`}
                    >
                      <td className="py-3.5 px-4 font-mono font-semibold text-primary-deep dark:text-emerald-300">
                        {row.id}
                      </td>
                      <td className="py-3.5 px-4 font-medium text-text">{row.name}</td>
                      <td className="py-3.5 px-4">
                        <StatusBadge status={row.status} />
                      </td>
                      <td className="py-3.5 px-4 text-xs text-muted">{row.method}</td>
                      <td className="py-3.5 px-4 font-bold text-right text-text">{row.amt}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <div className="p-3 bg-surface-2 border-t border-border text-xs text-muted flex items-center justify-between">
            <span>Selected Row: Emerald-50 background + 3px solid Emerald bar</span>
            <span className="font-semibold text-primary">Row {selectedTableRow + 1} active</span>
          </div>
        </div>
      </div>

      {/* Tabs & Navigation Components */}
      <div className="space-y-4">
        <h2 className="text-xl font-serif font-bold text-ink dark:text-stone-100">
          9) Tabs with Gold Gradient Sliding Underline
        </h2>
        <div className="card-kui p-6 space-y-4">
          <div className="flex border-b border-border gap-8">
            {['overview', 'analytics', 'audit-log', 'security'].map((tab) => {
              const active = activeTab === tab;
              return (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setActiveTab(tab)}
                  className={`pb-3 text-sm font-semibold capitalize relative transition-colors ${
                    active ? 'text-[#04403B] dark:text-[#EAF3F1]' : 'text-muted hover:text-text'
                  }`}
                >
                  {tab.replace('-', ' ')}
                  {active && (
                    <motion.div
                      layoutId="tabUnderline"
                      className="absolute bottom-0 left-0 right-0 h-0.5"
                      style={{ background: 'linear-gradient(135deg, #8F6414 0%, #EBCB6B 45%, #C8962E 100%)' }}
                    />
                  )}
                </button>
              );
            })}
          </div>
          <p className="text-xs text-muted">
            Active tab label in Emerald-800 (<code className="text-primary-deep">#04403B</code>) or light text in dark mode, with a metallic gold gradient underline.
          </p>
        </div>
      </div>

      {/* Toast Notification Previews */}
      <div className="space-y-4">
        <h2 className="text-xl font-serif font-bold text-ink dark:text-stone-100">
          10) Toast Notifications (Surface bg + 4px colored indicator bar)
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <button
            type="button"
            onClick={() => {
              triggerKapeeCelebration();
              addToast({
                type: 'success',
                title: 'Operation Completed',
                message: 'All inventory quantities synced with warehouse.'
              });
            }}
            className="card-kui p-4 text-left border-l-4 border-l-[#1E8E5A] hover:shadow-md transition-all"
          >
            <div className="flex items-center gap-1.5 text-xs font-bold text-[#1E8E5A]">
              <Sparkles className="w-3.5 h-3.5 text-[#C8962E]" />
              <span>Success Toast (with Gold Sparkle)</span>
            </div>
            <p className="text-xs text-muted mt-1">Click to trigger interactive toast</p>
          </button>

          <button
            type="button"
            onClick={() =>
              addToast({
                type: 'warning',
                title: 'Low Stock Alert',
                message: 'KAPEE Magic Eraser 20-Pack is below threshold (18 units).'
              })
            }
            className="card-kui p-4 text-left border-l-4 border-l-[#D98E04] hover:shadow-md transition-all"
          >
            <div className="text-xs font-bold text-[#D98E04]">Warning Toast</div>
            <p className="text-xs text-muted mt-1">Click to trigger interactive toast</p>
          </button>

          <button
            type="button"
            onClick={() =>
              addToast({
                type: 'error',
                title: 'Payment Gateway Error',
                message: 'Razorpay webhook rejected invalid signature.'
              })
            }
            className="card-kui p-4 text-left border-l-4 border-l-[#C0392B] hover:shadow-md transition-all"
          >
            <div className="text-xs font-bold text-[#C0392B]">Error Toast</div>
            <p className="text-xs text-muted mt-1">Click to trigger interactive toast</p>
          </button>

          <button
            type="button"
            onClick={() =>
              addToast({
                type: 'info',
                title: 'Courier Update',
                message: 'Bluedart tracking status received for 42 parcels.'
              })
            }
            className="card-kui p-4 text-left border-l-4 border-l-[#2563EB] hover:shadow-md transition-all"
          >
            <div className="text-xs font-bold text-[#2563EB]">Info Toast</div>
            <p className="text-xs text-muted mt-1">Click to trigger interactive toast</p>
          </button>
        </div>
      </div>
    </div>
  );
};
