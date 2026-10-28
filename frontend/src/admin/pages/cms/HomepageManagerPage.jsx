import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles,
  Table,
  X,
  Plus,
  Trash2,
  Edit,
  Eye,
  EyeOff,
  Layers,
  ArrowUp,
  ArrowDown,
  Check,
  CheckCircle2,
  Image as ImageIcon,
  ShieldCheck,
  Droplets,
  Zap,
  Leaf,
  Truck,
  Star,
  ExternalLink,
  Save,
  Sliders,
  Link as LinkIcon,
  ArrowRight,
  UploadCloud,
  RotateCcw,
  PhoneCall,
  Mail,
  Phone,
  MapPin,
  MessageSquare,
  Send
} from 'lucide-react';
import { useAdminStore } from '../../store/adminStore';
import { SideDrawer } from '../../components/common/SideDrawer';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import { triggerKapeeCelebration } from '../../components/common/Confetti';
import { CustomSelect } from '../../components/common/CustomSelect';
import { uploadImage } from '../../../api/homeApi';
import { SettingsCard, TextField } from '../../components/common/SettingsCard';
import { useSectionForm } from '../../lib/useSectionForm';
import { confirmDelete } from '../../../store/useConfirmStore';
import { getHeroSlides } from '../../../components/home/HeroCarousel';

const RATING_STARS_OPTIONS = [
  { value: 5, label: '⭐⭐⭐⭐⭐ (5 Stars)' },
  { value: 4, label: '⭐⭐⭐⭐ (4 Stars)' },
  { value: 3, label: '⭐⭐⭐ (3 Stars)' }
];

const ICON_OPTIONS = [
  { label: 'Sparkles (Magic / Clean)', value: 'Sparkles', icon: Sparkles },
  { label: 'ShieldCheck (Safety / Guarantee)', value: 'ShieldCheck', icon: ShieldCheck },
  { label: 'Droplets (Water / Liquid)', value: 'Droplets', icon: Droplets },
  { label: 'Zap (Instant Speed / Power)', value: 'Zap', icon: Zap },
  { label: 'Leaf (Eco / Natural)', value: 'Leaf', icon: Leaf },
  { label: 'Truck (Shipping / Delivery)', value: 'Truck', icon: Truck },
  { label: 'Star (Rating / Premium)', value: 'Star', icon: Star }
];

export const HomepageManagerPage = () => {
  const {
    heroBanner,
    updateHeroBanner,
    beforeAfterSettings,
    updateBeforeAfterSettings,
    addBeforeAfterItem,
    updateBeforeAfterItem,
    deleteBeforeAfterItem,
    comparisonTable,
    updateComparisonTable,
    addComparisonRow,
    updateComparisonRow,
    deleteComparisonRow,
    trustPillars,
    addTrustPillar,
    updateTrustPillar,
    deleteTrustPillar,
    howItWorksSteps,
    addHowItWorksStep,
    updateHowItWorksStep,
    deleteHowItWorksStep,
    howItWorksHeader,
    updateHowItWorksHeader,
    homepageSections,
    updateHomepageSection,
    trustSection,
    ugcSection,
    updateHomeContent,
    addToast
  } = useAdminStore();

  const [activeTab, setActiveTab] = useState('hero'); // 'hero' | 'trust' | 'beforeAfter' | 'howItWorks' | 'comparison' | 'ugc' | 'sections'

  // Wet. Wipe. Wow. Header Form State
  const [howItWorksHeaderForm, setHowItWorksHeaderForm] = useState({
    badge: howItWorksHeader?.badge || '',
    heading: howItWorksHeader?.heading || '',
    subheading: howItWorksHeader?.subheading || ''
  });

  React.useEffect(() => {
    if (howItWorksHeader) {
      setHowItWorksHeaderForm((prev) => ({
        ...prev,
        ...howItWorksHeader
      }));
    }
  }, [howItWorksHeader]);

  // Hero Banner Slides & Bottom Action Strip Form State
  const fileInputRef = useRef(null);
  // Slide whose image is being picked in the shared file input
  const uploadSlideIdRef = useRef(null);

  const [heroForm, setHeroForm] = useState({
    slides: getHeroSlides(heroBanner),
    slideInterval: heroBanner?.slideInterval || 5,
    showActionStrip: heroBanner?.showActionStrip !== false,
    ratingStars: heroBanner?.ratingStars || 5,
    ratingText: heroBanner?.ratingText || '',
    featureText: heroBanner?.featureText || '',
    primaryCtaText: heroBanner?.primaryCtaText || '',
    primaryCtaLink: heroBanner?.primaryCtaLink || '',
    secondaryCtaText: heroBanner?.secondaryCtaText || '',
    secondaryCtaLink: heroBanner?.secondaryCtaLink || ''
  });

  // Keep form in sync when store updates
  React.useEffect(() => {
    if (heroBanner) {
      setHeroForm((prev) => ({
        ...prev,
        ...heroBanner,
        slides: getHeroSlides(heroBanner)
      }));
    }
  }, [heroBanner]);

  const updateHeroSlide = (id, updates) =>
    setHeroForm((prev) => ({
      ...prev,
      slides: prev.slides.map((s) => (s.id === id ? { ...s, ...updates } : s))
    }));

  const addHeroSlide = () =>
    setHeroForm((prev) => ({
      ...prev,
      slides: [...prev.slides, { id: `slide-${Date.now()}`, image: '', link: '/shop', altText: '', active: true }]
    }));

  const deleteHeroSlide = (id) =>
    setHeroForm((prev) => ({ ...prev, slides: prev.slides.filter((s) => s.id !== id) }));

  const moveHeroSlide = (index, direction) =>
    setHeroForm((prev) => {
      const target = index + direction;
      if (target < 0 || target >= prev.slides.length) return prev;
      const slides = [...prev.slides];
      [slides[index], slides[target]] = [slides[target], slides[index]];
      return { ...prev, slides };
    });

  const pickSlideImage = (id) => {
    uploadSlideIdRef.current = id;
    fileInputRef.current?.click();
  };

  const handleImageFileSelect = (e) => {
    const file = e.target.files?.[0];
    const slideId = uploadSlideIdRef.current;
    if (!file || !slideId) return;

    if (!file.type.startsWith('image/')) {
      addToast({
        type: 'error',
        title: 'Invalid File',
        message: 'Please select a valid image file (PNG, JPG, WebP).'
      });
      return;
    }

    uploadImage(file)
      .then((url) => {
        updateHeroSlide(slideId, { image: url });
        addToast({
          type: 'success',
          title: 'Image Uploaded',
          message: `Uploaded "${file.name}" for hero banner. Click Save Changes to apply.`
        });
      })
      .catch((err) => addToast({ type: 'error', title: 'Upload Failed', message: err.message }));
    e.target.value = '';
  };

  const handleSaveHero = (e) => {
    if (e) e.preventDefault();
    updateHeroBanner(heroForm);
    triggerKapeeCelebration();
    addToast({
      type: 'success',
      title: 'Hero Settings Saved',
      message: 'Banner slides and bottom action strip updated on the homepage.'
    });
  };

  // ----------------- Real Transformations (Before/After) State & Handlers -----------------
  const [baDrawerOpen, setBaDrawerOpen] = useState(false);
  const [editingBa, setEditingBa] = useState(null);
  const [baHeaderForm, setBaHeaderForm] = useState({
    badge: beforeAfterSettings?.badge || '',
    heading: beforeAfterSettings?.heading || '',
    subheading: beforeAfterSettings?.subheading || '',
    beforeLabel: beforeAfterSettings?.beforeLabel || '',
    afterLabel: beforeAfterSettings?.afterLabel || '',
    dragHint: beforeAfterSettings?.dragHint || ''
  });
  const [baItemForm, setBaItemForm] = useState({
    surface: '',
    before: '',
    after: '',
    description: '',
    active: true
  });
  const baBeforeInputRef = useRef(null);
  const baAfterInputRef = useRef(null);

  React.useEffect(() => {
    if (beforeAfterSettings) {
      setBaHeaderForm({
        badge: beforeAfterSettings.badge || '',
        heading: beforeAfterSettings.heading || '',
        subheading: beforeAfterSettings.subheading || '',
        beforeLabel: beforeAfterSettings.beforeLabel || '',
        afterLabel: beforeAfterSettings.afterLabel || '',
        dragHint: beforeAfterSettings.dragHint || ''
      });
    }
  }, [beforeAfterSettings]);

  const handleOpenBaDrawer = (item = null) => {
    if (item) {
      setEditingBa(item);
      setBaItemForm({
        surface: item.surface || '',
        before: item.before || '',
        after: item.after || '',
        description: item.description || '',
        active: item.active !== false
      });
    } else {
      setEditingBa(null);
      setBaItemForm({
        surface: '',
        before: '',
        after: '',
        description: '',
        active: true
      });
    }
    setBaDrawerOpen(true);
  };

  const handleSaveBaItem = (e) => {
    if (e) e.preventDefault();
    if (!baItemForm.surface.trim()) {
      addToast({ type: 'error', title: 'Surface Name Required', message: 'Please enter a surface label (e.g. Tile Grout).' });
      return;
    }
    if (!baItemForm.before || !baItemForm.after) {
      addToast({ type: 'error', title: 'Images Missing', message: 'Both BEFORE and AFTER images are required.' });
      return;
    }

    if (editingBa) {
      updateBeforeAfterItem(editingBa.id, baItemForm);
      addToast({ type: 'success', title: 'Transformation Updated', message: `Saved changes to "${baItemForm.surface}".` });
    } else {
      addBeforeAfterItem(baItemForm);
      triggerKapeeCelebration();
      addToast({ type: 'success', title: 'Transformation Added', message: `Added "${baItemForm.surface}" to comparison slider.` });
    }
    setBaDrawerOpen(false);
  };

  const handleToggleBaItemActive = (id, currentActive) => {
    updateBeforeAfterItem(id, { active: !currentActive });
    addToast({
      type: 'info',
      title: !currentActive ? 'Item Activated' : 'Item Hidden',
      message: !currentActive ? 'Item is now visible on storefront.' : 'Item is now hidden from storefront.'
    });
  };

  const handleImageUploadForBa = (e, field) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      addToast({ type: 'error', title: 'Invalid File', message: 'Please select an image file.' });
      return;
    }

    uploadImage(file)
      .then((url) => {
        setBaItemForm((prev) => ({ ...prev, [field]: url }));
        addToast({ type: 'success', title: 'Image Uploaded', message: `Uploaded image for ${field.toUpperCase()}.` });
      })
      .catch((err) => addToast({ type: 'error', title: 'Upload Failed', message: err.message }));
    e.target.value = '';
  };

  const handleSaveBeforeAfter = () => {
    updateBeforeAfterSettings(baHeaderForm);
    updateComparisonTable(cmpHeaderForm);
    triggerKapeeCelebration();
    addToast({
      type: 'success',
      title: 'Transformations Saved',
      message: 'Headline copy and transformation slider settings saved to live storefront.'
    });
  };

  // Comparison Table Header & Column Titles Form
  const [cmpHeaderForm, setCmpHeaderForm] = useState({
    badge: comparisonTable?.badge || '',
    heading: comparisonTable?.heading || '',
    subheading: comparisonTable?.subheading || '',
    col1Title: comparisonTable?.col1Title || '',
    col2Title: comparisonTable?.col2Title || '',
    col3Title: comparisonTable?.col3Title || '',
    col4Title: comparisonTable?.col4Title || ''
  });

  React.useEffect(() => {
    if (comparisonTable) {
      setCmpHeaderForm({
        badge: comparisonTable.badge || '',
        heading: comparisonTable.heading || '',
        subheading: comparisonTable.subheading || '',
        col1Title: comparisonTable.col1Title || '',
        col2Title: comparisonTable.col2Title || '',
        col3Title: comparisonTable.col3Title || '',
        col4Title: comparisonTable.col4Title || ''
      });
    }
  }, [comparisonTable]);

  // Comparison Row Drawer State
  const [cmpDrawerOpen, setCmpDrawerOpen] = useState(false);
  const [editingCmpRow, setEditingCmpRow] = useState(null);
  const [cmpRowForm, setCmpRowForm] = useState({
    feature: '',
    kapee: '',
    sponge: '',
    spray: '',
    active: true
  });

  const handleOpenCmpDrawer = (row = null) => {
    if (row) {
      setEditingCmpRow(row);
      setCmpRowForm({
        feature: row.feature || '',
        kapee: row.kapee || '',
        sponge: row.sponge || '',
        spray: row.spray || '',
        active: row.active !== false
      });
    } else {
      setEditingCmpRow(null);
      setCmpRowForm({
        feature: '',
        kapee: '',
        sponge: '',
        spray: '',
        active: true
      });
    }
    setCmpDrawerOpen(true);
  };

  const handleSaveCmpRow = (e) => {
    if (e) e.preventDefault();
    if (!cmpRowForm.feature.trim()) {
      addToast({ type: 'error', title: 'Feature Required', message: 'Please enter a feature / benefit name.' });
      return;
    }
    if (editingCmpRow) {
      updateComparisonRow(editingCmpRow.id, cmpRowForm);
      addToast({ type: 'success', title: 'Row Updated', message: `Saved changes to "${cmpRowForm.feature}".` });
    } else {
      addComparisonRow(cmpRowForm);
      triggerKapeeCelebration();
      addToast({ type: 'success', title: 'Row Added', message: `Added "${cmpRowForm.feature}" to comparison table.` });
    }
    setCmpDrawerOpen(false);
  };

  const handleToggleCmpRowActive = (id, currentActive) => {
    updateComparisonRow(id, { active: !currentActive });
    addToast({
      type: 'info',
      title: !currentActive ? 'Row Activated' : 'Row Hidden',
      message: !currentActive ? 'Row is now visible in comparison table.' : 'Row is now hidden from storefront.'
    });
  };

  // ----------------- Section headers, best sellers, reviews & UGC -----------------
  const [trustHeaderForm, setTrustHeaderForm] = useSectionForm(trustSection);
  const [ugcForm, setUgcForm] = useSectionForm(ugcSection);
  const ugcInputRef = useRef(null);
  // Id of the photo being replaced (null = the upload adds a new photo)
  const ugcReplaceIdRef = useRef(null);

  const openUgcFilePicker = (replaceId = null) => {
    ugcReplaceIdRef.current = replaceId;
    ugcInputRef.current?.click();
  };

  const saveSection = (section, value, label) => {
    updateHomeContent(section, value);
    triggerKapeeCelebration();
    addToast({ type: 'success', title: `${label} Saved`, message: `${label} updated on the homepage.` });
  };

  const updateUgcImage = (id, updates) => {
    setUgcForm({
      ...ugcForm,
      images: (ugcForm.images || []).map((img) => (img.id === id ? { ...img, ...updates } : img))
    });
  };

  const handleUgcUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const replaceId = ugcReplaceIdRef.current;
    uploadImage(file)
      .then((url) => {
        setUgcForm((prev) => ({
          ...prev,
          images: replaceId
            ? (prev.images || []).map((img) => (img.id === replaceId ? { ...img, image: url } : img))
            : [...(prev.images || []), { id: `ugc-${Date.now()}`, image: url, link: '', alt: '', active: true }]
        }));
        addToast({
          type: 'success',
          title: replaceId ? 'Photo Changed' : 'Image Uploaded',
          message: 'Click Save Instagram Grid to publish it.'
        });
      })
      .catch((err) => addToast({ type: 'error', title: 'Upload Failed', message: err.message }));
    e.target.value = '';
  };

  // Whole Page Save: saves hero banner, before/after settings, etc. in 1 click
  const handleSaveWholePage = () => {
    updateHeroBanner(heroForm);
    updateBeforeAfterSettings(baHeaderForm);
    updateHowItWorksHeader(howItWorksHeaderForm);
    updateComparisonTable(cmpHeaderForm);
    updateHomeContent('trustSection', trustHeaderForm);
    updateHomeContent('ugcSection', ugcForm);
    triggerKapeeCelebration();
    addToast({
      type: 'success',
      title: 'Homepage CMS Saved',
      message: 'All homepage sections, hero banner, and "Wet. Wipe. Wow." steps saved successfully!'
    });
  };

  const handleSaveHowItWorksHeader = (e) => {
    if (e) e.preventDefault();
    updateHowItWorksHeader(howItWorksHeaderForm);
    triggerKapeeCelebration();
    addToast({
      type: 'success',
      title: 'Section Header Saved',
      message: 'Updated "Wet. Wipe. Wow." section heading and tagline.'
    });
  };

  const handleToggleStepActive = (id, currentActive) => {
    updateHowItWorksStep(id, { active: !currentActive });
    addToast({
      type: 'info',
      title: !currentActive ? 'Step Activated' : 'Step Hidden',
      message: !currentActive ? 'Step is now visible on homepage.' : 'Step is now hidden from storefront.'
    });
  };

  // Trust Pillar Drawer State
  const [trustDrawerOpen, setTrustDrawerOpen] = useState(false);
  const [editingTrust, setEditingTrust] = useState(null);
  const [trustForm, setTrustForm] = useState({
    title: '',
    desc: '',
    icon: 'Sparkles',
    active: true
  });

  // How It Works Drawer State
  const [stepDrawerOpen, setStepDrawerOpen] = useState(false);
  const [editingStep, setEditingStep] = useState(null);
  const [stepForm, setStepForm] = useState({
    step: 1,
    title: '',
    desc: '',
    active: true
  });

  // Deletion confirm modal
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null); // { type, id, title }

  // ----------------- Trust Pillars Handlers -----------------
  const handleOpenTrustDrawer = (pillar = null) => {
    if (pillar) {
      setEditingTrust(pillar);
      setTrustForm({
        title: pillar.title || '',
        desc: pillar.desc || '',
        icon: typeof pillar.icon === 'string' ? pillar.icon : 'Sparkles',
        active: pillar.active !== false
      });
    } else {
      setEditingTrust(null);
      setTrustForm({
        title: '',
        desc: '',
        icon: 'Sparkles',
        active: true
      });
    }
    setTrustDrawerOpen(true);
  };

  const handleSaveTrust = (e) => {
    e.preventDefault();
    if (!trustForm.title) {
      addToast({ type: 'error', title: 'Title Required', message: 'Please enter a card title.' });
      return;
    }

    if (editingTrust) {
      updateTrustPillar(editingTrust.id, trustForm);
      addToast({ type: 'success', title: 'Trust Card Updated', message: 'Saved changes to trust pillar.' });
    } else {
      addTrustPillar(trustForm);
      triggerKapeeCelebration();
      addToast({ type: 'success', title: 'Trust Card Added', message: 'Added new trust feature card.' });
    }
    setTrustDrawerOpen(false);
  };

  // ----------------- How It Works Steps Handlers -----------------
  const handleOpenStepDrawer = (stepItem = null) => {
    if (stepItem) {
      setEditingStep(stepItem);
      setStepForm({
        step: stepItem.step || 1,
        title: stepItem.title || '',
        desc: stepItem.desc || '',
        active: stepItem.active !== false
      });
    } else {
      setEditingStep(null);
      setStepForm({
        step: (howItWorksSteps || []).length + 1,
        title: '',
        desc: '',
        active: true
      });
    }
    setStepDrawerOpen(true);
  };

  const handleSaveStep = (e) => {
    e.preventDefault();
    if (!stepForm.title) {
      addToast({ type: 'error', title: 'Title Required', message: 'Please enter a step title.' });
      return;
    }

    if (editingStep) {
      updateHowItWorksStep(editingStep.id, stepForm);
      addToast({ type: 'success', title: 'Step Updated', message: 'Saved step changes.' });
    } else {
      addHowItWorksStep(stepForm);
      triggerKapeeCelebration();
      addToast({ type: 'success', title: 'Step Added', message: 'Added new step to How It Works.' });
    }
    setStepDrawerOpen(false);
  };

  // ----------------- Delete Execution -----------------
  const handleConfirmDelete = () => {
    if (!deleteTarget) return;
    if (deleteTarget.type === 'trust') {
      deleteTrustPillar(deleteTarget.id);
      addToast({ type: 'info', title: 'Card Removed', message: 'Trust pillar removed from homepage.' });
    } else if (deleteTarget.type === 'step') {
      deleteHowItWorksStep(deleteTarget.id);
      addToast({ type: 'info', title: 'Step Removed', message: 'Step removed from How It Works.' });
    } else if (deleteTarget.type === 'beforeAfter') {
      deleteBeforeAfterItem(deleteTarget.id);
      addToast({ type: 'info', title: 'Transformation Removed', message: 'Item removed from Before & After slider.' });
    } else if (deleteTarget.type === 'comparisonRow') {
      deleteComparisonRow(deleteTarget.id);
      addToast({ type: 'info', title: 'Row Removed', message: 'Row removed from Comparison Table.' });
    }
    setDeleteConfirmOpen(false);
    setDeleteTarget(null);
  };

  return (
    <div className="space-y-6 w-full">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-ink dark:text-stone-100">
            Homepage CMS
          </h1>
          <p className="text-xs sm:text-sm text-muted dark:text-stone-400 mt-1">
            Complete CRUD control over all sections, hero slides, trust pillars, and headlines on your storefront.
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <a
            href="/"
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl text-xs font-semibold border border-stone-300 dark:border-stone-700 hover:bg-stone-50 dark:hover:bg-stone-800 text-stone-700 dark:text-stone-200 transition-all"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">View Live Website</span>
          </a>

          <button
            type="button"
            onClick={handleSaveWholePage}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-emerald-deep hover:bg-emerald-800 text-white text-xs font-bold shadow-md hover:shadow-lg transition-all active:scale-95 shrink-0"
          >
            <Save className="w-4 h-4" />
            <span>Save Homepage</span>
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex border-b border-stone-200 dark:border-stone-800 gap-1 sm:gap-2 overflow-x-auto pb-0.5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {[
          { key: 'hero', label: 'Hero Banner & Action Strip', icon: Sparkles },
          { key: 'trust', label: `Why Choose KAPEE? (${(trustPillars || []).length})`, icon: ShieldCheck },
          { key: 'beforeAfter', label: `Transformations (${(beforeAfterSettings?.items || []).length})`, icon: Layers },
          { key: 'howItWorks', label: `Wet. Wipe. Wow. (${(howItWorksSteps || []).length})`, icon: CheckCircle2 },
          { key: 'comparison', label: `Comparison Table (${(comparisonTable?.rows || []).length})`, icon: Table },
          { key: 'ugc', label: `Instagram Grid (${(ugcSection?.images || []).length})`, icon: ImageIcon },
          { key: 'sections', label: 'Section Visibility', icon: Sliders }
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveTab(tab.key)}
              className={`pb-3 px-4 text-xs sm:text-sm font-semibold flex items-center gap-2 relative whitespace-nowrap transition-colors ${
                isActive
                  ? 'text-emerald-deep dark:text-emerald-400 font-bold'
                  : 'text-stone-500 hover:text-stone-800 dark:hover:text-stone-300'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
              {isActive && (
                <motion.div
                  layoutId="homeCmsTabPill"
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-deep dark:bg-emerald-400"
                />
              )}
            </button>
          );
        })}
      </div>

      {/* =========================================================
          TAB 1: HERO BANNER SLIDES & ACTION STRIP CRUD
         ========================================================= */}
      {activeTab === 'hero' && (
        <div className="space-y-6">
          {/* Form Settings Cards */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Card 1: Banner Slides (image + click destination for each) */}
            <div className="bg-white dark:bg-stone-900 rounded-2xl border border-stone-200/80 dark:border-stone-800 p-5 space-y-4 shadow-2xs">
              <div className="flex items-center justify-between gap-2 pb-3 border-b border-stone-100 dark:border-stone-800">
                <div className="flex items-center gap-2">
                  <ImageIcon className="w-4 h-4 text-emerald-deep dark:text-emerald-400" />
                  <h3 className="text-sm font-bold text-stone-900 dark:text-stone-100">
                    1. Hero Banner Slides ({heroForm.slides.length})
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={addHeroSlide}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-emerald-deep hover:bg-emerald-800 text-white text-xs font-semibold shadow-xs transition-all active:scale-95"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Banner</span>
                </button>
              </div>

              <input
                type="file"
                ref={fileInputRef}
                onChange={handleImageFileSelect}
                accept="image/*"
                className="hidden"
              />

              {heroForm.slides.length === 0 && (
                <p className="text-xs text-stone-400 text-center py-6">
                  No banners yet. Click Add Banner to add the first one.
                </p>
              )}

              <div className="space-y-3">
                {heroForm.slides.map((slide, index) => (
                  <div
                    key={slide.id}
                    className={`p-3.5 rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50/70 dark:bg-stone-800/40 space-y-3 ${slide.active === false ? 'opacity-60' : ''}`}
                  >
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => pickSlideImage(slide.id)}
                        title="Select / Upload Image"
                        className="w-24 h-16 rounded-lg overflow-hidden bg-white dark:bg-stone-800 border-2 border-dashed border-stone-200 dark:border-stone-700 hover:border-[#0A5C55] shrink-0 flex items-center justify-center"
                      >
                        {slide.image ? (
                          <img src={slide.image} alt="Banner Preview" className="w-full h-full object-cover" />
                        ) : (
                          <UploadCloud className="w-5 h-5 text-stone-400" />
                        )}
                      </button>

                      <div className="flex-1 min-w-0">
                        <span className="block text-xs font-bold text-stone-800 dark:text-stone-200">
                          Banner {index + 1}
                        </span>
                        <button
                          type="button"
                          onClick={() => pickSlideImage(slide.id)}
                          className="text-[11px] font-semibold text-emerald-deep dark:text-emerald-400 hover:underline"
                        >
                          {slide.image ? 'Change Image' : 'Select / Upload Image'}
                        </button>
                      </div>

                      <div className="flex items-center gap-0.5 shrink-0">
                        <button
                          type="button"
                          onClick={() => moveHeroSlide(index, -1)}
                          disabled={index === 0}
                          title="Move Up"
                          className="p-1.5 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-100 dark:hover:bg-stone-800 disabled:opacity-30 disabled:pointer-events-none"
                        >
                          <ArrowUp className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => moveHeroSlide(index, 1)}
                          disabled={index === heroForm.slides.length - 1}
                          title="Move Down"
                          className="p-1.5 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-100 dark:hover:bg-stone-800 disabled:opacity-30 disabled:pointer-events-none"
                        >
                          <ArrowDown className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => updateHeroSlide(slide.id, { active: slide.active === false })}
                          title={slide.active === false ? 'Show on website' : 'Hide from website'}
                          className="p-1.5 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-100 dark:hover:bg-stone-800"
                        >
                          {slide.active === false ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            confirmDelete({
                              title: 'Delete Banner?',
                              message: `Delete Banner ${index + 1}? Click Save Changes to apply.`,
                              onConfirm: () => deleteHeroSlide(slide.id)
                            })
                          }
                          title="Delete"
                          className="p-1.5 rounded-lg text-stone-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-semibold text-stone-600 dark:text-stone-400 mb-1">
                          Click Destination URL
                        </label>
                        <div className="relative">
                          <LinkIcon className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
                          <input
                            type="text"
                            value={slide.link || ''}
                            onChange={(e) => updateHeroSlide(slide.id, { link: e.target.value })}
                            placeholder="/shop or https://..."
                            className="w-full pl-8 pr-3 py-2 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-xs focus:ring-2 focus:ring-[#0A5C55] focus:outline-hidden"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-[11px] font-semibold text-stone-600 dark:text-stone-400 mb-1">
                          Alt / SEO Text
                        </label>
                        <input
                          type="text"
                          value={slide.altText || ''}
                          onChange={(e) => updateHeroSlide(slide.id, { altText: e.target.value })}
                          placeholder="KAPEE Magic Melamine Eraser Sponges"
                          className="w-full px-3 py-2 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-xs focus:ring-2 focus:ring-[#0A5C55] focus:outline-hidden"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="pt-1">
                <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1.5">
                  Auto-slide Every (seconds)
                </label>
                <input
                  type="number"
                  min={2}
                  max={30}
                  value={heroForm.slideInterval}
                  onChange={(e) => setHeroForm({ ...heroForm, slideInterval: Number(e.target.value) || 5 })}
                  className="w-32 px-3.5 py-2.5 rounded-xl border border-stone-300 dark:border-stone-700 bg-stone-50/50 dark:bg-stone-800 text-xs focus:ring-2 focus:ring-[#0A5C55] focus:outline-hidden"
                />
                <p className="text-[11px] text-stone-400 mt-1">
                  Internal pages start with / (e.g. /shop). Full https:// links open in a new tab.
                </p>
              </div>
            </div>

            {/* Card 2: Bottom Action & Trust Strip (Highlighted in User's Screenshot) */}
            <div className="bg-white dark:bg-stone-900 rounded-2xl border border-stone-200/80 dark:border-stone-800 p-5 space-y-4 shadow-2xs">
              <div className="flex items-center justify-between pb-3 border-b border-stone-100 dark:border-stone-800">
                <div className="flex items-center gap-2">
                  <Star className="w-4 h-4 text-gold" />
                  <h3 className="text-sm font-bold text-stone-900 dark:text-stone-100">
                    2. Bottom Trust & Rating Strip
                  </h3>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={heroForm.showActionStrip}
                    onChange={(e) => setHeroForm({ ...heroForm, showActionStrip: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-9 h-5 bg-stone-200 dark:bg-stone-700 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-stone-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#0A5C55]"></div>
                </label>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1.5">
                    Rating Stars (1 to 5)
                  </label>
                  <CustomSelect
                    value={heroForm.ratingStars}
                    onChange={(e) => setHeroForm({ ...heroForm, ratingStars: Number(e.target.value) })}
                    options={RATING_STARS_OPTIONS}
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1.5">
                    Rating Headline
                  </label>
                  <input
                    type="text"
                    value={heroForm.ratingText}
                    onChange={(e) => setHeroForm({ ...heroForm, ratingText: e.target.value })}
                    placeholder="4.9★ Rated by 50,000+ Indian Homes"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 dark:border-stone-700 bg-stone-50/50 dark:bg-stone-800 text-xs focus:ring-2 focus:ring-[#0A5C55] focus:outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1.5">
                  Feature / Guarantee Highlight Subtext
                </label>
                <input
                  type="text"
                  value={heroForm.featureText}
                  onChange={(e) => setHeroForm({ ...heroForm, featureText: e.target.value })}
                  placeholder="Tap Water Activation • 100% Chemical-Free"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 dark:border-stone-700 bg-stone-50/50 dark:bg-stone-800 text-xs focus:ring-2 focus:ring-[#0A5C55] focus:outline-hidden"
                />
              </div>

              {/* CTAs */}
              <div className="pt-2 border-t border-stone-100 dark:border-stone-800 space-y-3">
                <span className="text-xs font-bold text-stone-700 dark:text-stone-300 block">
                  Action Buttons (CTAs)
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-stone-600 dark:text-stone-400 mb-1">
                      Primary Button Text
                    </label>
                    <input
                      type="text"
                      value={heroForm.primaryCtaText}
                      onChange={(e) => setHeroForm({ ...heroForm, primaryCtaText: e.target.value })}
                      placeholder="Shop Magic Erasers"
                      className="w-full px-3 py-2 rounded-xl border border-stone-300 dark:border-stone-700 bg-stone-50/50 dark:bg-stone-800 text-xs focus:ring-2 focus:ring-[#0A5C55] focus:outline-hidden"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-stone-600 dark:text-stone-400 mb-1">
                      Primary Button Link
                    </label>
                    <input
                      type="text"
                      value={heroForm.primaryCtaLink}
                      onChange={(e) => setHeroForm({ ...heroForm, primaryCtaLink: e.target.value })}
                      placeholder="/shop"
                      className="w-full px-3 py-2 rounded-xl border border-stone-300 dark:border-stone-700 bg-stone-50/50 dark:bg-stone-800 text-xs focus:ring-2 focus:ring-[#0A5C55] focus:outline-hidden"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-stone-600 dark:text-stone-400 mb-1">
                      Secondary Button Text (Gold)
                    </label>
                    <input
                      type="text"
                      value={heroForm.secondaryCtaText}
                      onChange={(e) => setHeroForm({ ...heroForm, secondaryCtaText: e.target.value })}
                      placeholder="Shop All Products"
                      className="w-full px-3 py-2 rounded-xl border border-stone-300 dark:border-stone-700 bg-stone-50/50 dark:bg-stone-800 text-xs focus:ring-2 focus:ring-[#0A5C55] focus:outline-hidden"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-stone-600 dark:text-stone-400 mb-1">
                      Secondary Button Link
                    </label>
                    <input
                      type="text"
                      value={heroForm.secondaryCtaLink}
                      onChange={(e) => setHeroForm({ ...heroForm, secondaryCtaLink: e.target.value })}
                      placeholder="/shop"
                      className="w-full px-3 py-2 rounded-xl border border-stone-300 dark:border-stone-700 bg-stone-50/50 dark:bg-stone-800 text-xs focus:ring-2 focus:ring-[#0A5C55] focus:outline-hidden"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================
          TAB 2: REAL TRANSFORMATIONS (BEFORE / AFTER SLIDER) CRUD
         ========================================================= */}
      {activeTab === 'beforeAfter' && (
        <div className="space-y-6">
          {/* Section Copy Editor */}
          <div className="bg-white dark:bg-stone-900 rounded-2xl border border-stone-200/80 dark:border-stone-800 p-5 shadow-2xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-base font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-emerald-deep dark:text-emerald-400" />
                  <span>Section Headline & Subtitles</span>
                </h3>
                <p className="text-xs text-stone-500 mt-0.5">
                  Customize the badge label, main title, and description displayed above the comparison slider.
                </p>
              </div>

              <button
                type="button"
                data-add-ba-top-btn="true"
                onClick={() => handleOpenBaDrawer()}
                className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold bg-emerald-deep hover:bg-emerald-800 text-white shadow-md hover:shadow-lg transition-all active:scale-95 shrink-0 self-start sm:self-auto"
              >
                <Plus className="w-4 h-4" />
                <span>+ Add Transformation</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2 border-t border-stone-100 dark:border-stone-800">
              <div className="space-y-1">
                <label className="text-[11px] font-bold uppercase tracking-wider text-stone-600 dark:text-stone-400">
                  Badge Label
                </label>
                <input
                  type="text"
                  value={baHeaderForm.badge}
                  onChange={(e) => setBaHeaderForm({ ...baHeaderForm, badge: e.target.value })}
                  placeholder="See The Magic"
                  className="w-full px-3 py-2 rounded-xl border border-stone-300 dark:border-stone-700 bg-stone-50/50 dark:bg-stone-800 text-xs focus:ring-2 focus:ring-[#0A5C55] focus:outline-hidden"
                />
              </div>

              <div className="space-y-1 md:col-span-2">
                <label className="text-[11px] font-bold uppercase tracking-wider text-stone-600 dark:text-stone-400">
                  Main Section Heading
                </label>
                <input
                  type="text"
                  value={baHeaderForm.heading}
                  onChange={(e) => setBaHeaderForm({ ...baHeaderForm, heading: e.target.value })}
                  placeholder="Real Transformations with Just Water"
                  className="w-full px-3 py-2 rounded-xl border border-stone-300 dark:border-stone-700 bg-stone-50/50 dark:bg-stone-800 text-xs focus:ring-2 focus:ring-[#0A5C55] focus:outline-hidden font-serif font-bold text-sm"
                />
              </div>

              <div className="space-y-1 md:col-span-3">
                <label className="text-[11px] font-bold uppercase tracking-wider text-stone-600 dark:text-stone-400">
                  Subheading / Explainer Text
                </label>
                <input
                  type="text"
                  value={baHeaderForm.subheading}
                  onChange={(e) => setBaHeaderForm({ ...baHeaderForm, subheading: e.target.value })}
                  placeholder="Slide back and forth to inspect how micro-abrasive melamine wipes away years of grime in seconds."
                  className="w-full px-3 py-2 rounded-xl border border-stone-300 dark:border-stone-700 bg-stone-50/50 dark:bg-stone-800 text-xs focus:ring-2 focus:ring-[#0A5C55] focus:outline-hidden"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              <TextField
                label="Before Image Label"
                value={baHeaderForm.beforeLabel}
                onChange={(v) => setBaHeaderForm({ ...baHeaderForm, beforeLabel: v })}
                placeholder="BEFORE"
              />
              <TextField
                label="After Image Label"
                value={baHeaderForm.afterLabel}
                onChange={(v) => setBaHeaderForm({ ...baHeaderForm, afterLabel: v })}
                placeholder="AFTER (KAPEE)"
              />
              <TextField
                label="Drag Hint Below Slider"
                value={baHeaderForm.dragHint}
                onChange={(v) => setBaHeaderForm({ ...baHeaderForm, dragHint: v })}
                placeholder="Drag the golden slider left & right..."
              />
            </div>

            <div className="flex justify-end">
              <button
                type="button"
                onClick={handleSaveBeforeAfter}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-emerald-deep hover:bg-emerald-800 text-white shadow-xs transition-all active:scale-95"
              >
                Save Section Texts
              </button>
            </div>
          </div>

          {/* Transformation Cards List (CRUD) */}
          <div className="bg-white dark:bg-stone-900 rounded-2xl border border-stone-200/80 dark:border-stone-800 p-5 shadow-2xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-base font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2">
                  <Layers className="w-4 h-4 text-emerald-deep dark:text-emerald-400" />
                  <span>Transformation Comparison Cards ({(beforeAfterSettings?.items || []).length})</span>
                </h3>
                <p className="text-xs text-stone-500 mt-0.5">
                  Manage the surface categories, before/after photos, and stain removal captions.
                </p>
              </div>

              <button
                type="button"
                onClick={() => handleOpenBaDrawer()}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-emerald-deep hover:bg-emerald-800 text-white shadow-xs transition-all active:scale-95 self-start sm:self-auto"
              >
                <Plus className="w-4 h-4" />
                <span>Add Transformation</span>
              </button>
            </div>

            {/* Grid of cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              {(beforeAfterSettings?.items || []).map((it, idx) => (
                <div
                  key={it.id || idx}
                  className="rounded-2xl border border-stone-200 dark:border-stone-800 p-4 bg-stone-50/50 dark:bg-stone-850 space-y-3 hover:border-emerald-deep/40 transition-all flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded-lg bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 font-bold text-xs flex items-center justify-center">
                          {idx + 1}
                        </span>
                        <h4 className="font-bold text-sm text-stone-900 dark:text-stone-100">
                          {it.surface}
                        </h4>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleToggleBaItemActive(it.id, it.active !== false)}
                          className={`p-1.5 rounded-lg text-xs transition-colors ${
                            it.active !== false
                              ? 'text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/40'
                              : 'text-stone-400 hover:bg-stone-200 dark:hover:bg-stone-800'
                          }`}
                          title={it.active !== false ? 'Active (Click to hide)' : 'Hidden (Click to show)'}
                        >
                          {it.active !== false ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                        </button>
                        <button
                          type="button"
                          onClick={() => handleOpenBaDrawer(it)}
                          className="p-1.5 rounded-lg text-stone-500 hover:text-emerald-deep hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors dark:hover:text-emerald-300"
                          title="Edit"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setDeleteTarget({ type: 'beforeAfter', id: it.id, title: it.surface });
                            setDeleteConfirmOpen(true);
                          }}
                          className="p-1.5 rounded-lg text-stone-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* Before & After Image Thumbnails */}
                    <div className="grid grid-cols-2 gap-2">
                      <div className="relative rounded-xl overflow-hidden aspect-video bg-stone-200 dark:bg-stone-800 border border-stone-300 dark:border-stone-700">
                        <img src={it.before} alt="Before" className="w-full h-full object-cover" />
                        <span className="absolute bottom-1 left-1 px-1.5 py-0.5 rounded-md bg-stone-900/80 text-white text-[9px] font-bold">
                          BEFORE
                        </span>
                      </div>
                      <div className="relative rounded-xl overflow-hidden aspect-video bg-stone-200 dark:bg-stone-800 border border-stone-300 dark:border-stone-700">
                        <img src={it.after} alt="After" className="w-full h-full object-cover" />
                        <span className="absolute bottom-1 right-1 px-1.5 py-0.5 rounded-md bg-emerald-700 text-white text-[9px] font-bold">
                          AFTER
                        </span>
                      </div>
                    </div>

                    <p className="text-xs text-stone-500 italic">
                      "{it.description}"
                    </p>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-stone-200/60 dark:border-stone-800 text-[11px] text-stone-400">
                    <span>Status: <strong className={it.active !== false ? 'text-emerald-600' : 'text-stone-400'}>{it.active !== false ? 'Active' : 'Hidden'}</strong></span>
                    <button
                      type="button"
                      onClick={() => handleOpenBaDrawer(it)}
                      className="text-xs font-semibold text-emerald-deep dark:text-emerald-400 hover:underline"
                    >
                      Edit Details & Images →
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* =========================================================
          TAB: COMPARISON TABLE CRUD ("Why Choose KAPEE Over Ordinary Cleaners?")
         ========================================================= */}
      {activeTab === 'comparison' && (
        <div className="space-y-6">
          {/* Section Headlines & Column Titles */}
          <div className="bg-white dark:bg-stone-900 rounded-2xl border border-stone-200/80 dark:border-stone-800 p-5 shadow-2xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-base font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2">
                  <Table className="w-4 h-4 text-emerald-deep dark:text-emerald-400" />
                  <span>Section Headline & Column Titles</span>
                </h3>
                <p className="text-xs text-stone-500 mt-0.5">
                  Configure headings and column headers for the "Clear Science & Safety" comparison table.
                </p>
              </div>

              <button
                type="button"
                onClick={() => handleOpenCmpDrawer()}
                className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold bg-emerald-deep hover:bg-emerald-800 text-white shadow-md hover:shadow-lg transition-all active:scale-95 shrink-0 self-start sm:self-auto"
              >
                <Plus className="w-4 h-4" />
                <span>+ Add Comparison Row</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2 border-t border-stone-100 dark:border-stone-800">
              <div className="space-y-1">
                <label className="text-[11px] font-bold uppercase tracking-wider text-stone-600 dark:text-stone-400">
                  Badge Label
                </label>
                <input
                  type="text"
                  value={cmpHeaderForm.badge}
                  onChange={(e) => setCmpHeaderForm({ ...cmpHeaderForm, badge: e.target.value })}
                  placeholder="Clear Science & Safety"
                  className="w-full px-3 py-2 rounded-xl border border-stone-300 dark:border-stone-700 bg-stone-50/50 dark:bg-stone-800 text-xs focus:ring-2 focus:ring-[#0A5C55] focus:outline-hidden"
                />
              </div>

              <div className="space-y-1 md:col-span-2">
                <label className="text-[11px] font-bold uppercase tracking-wider text-stone-600 dark:text-stone-400">
                  Main Section Heading
                </label>
                <input
                  type="text"
                  value={cmpHeaderForm.heading}
                  onChange={(e) => setCmpHeaderForm({ ...cmpHeaderForm, heading: e.target.value })}
                  placeholder="Why Choose KAPEE Over Ordinary Cleaners?"
                  className="w-full px-3 py-2 rounded-xl border border-stone-300 dark:border-stone-700 bg-stone-50/50 dark:bg-stone-800 text-xs focus:ring-2 focus:ring-[#0A5C55] focus:outline-hidden font-serif font-bold text-sm"
                />
              </div>

              <div className="space-y-1 md:col-span-3">
                <label className="text-[11px] font-bold uppercase tracking-wider text-stone-600 dark:text-stone-400">
                  Subheading / Explainer Text
                </label>
                <input
                  type="text"
                  value={cmpHeaderForm.subheading}
                  onChange={(e) => setCmpHeaderForm({ ...cmpHeaderForm, subheading: e.target.value })}
                  placeholder="See how our German-grade melamine matrix outperforms generic kitchen sponges and harsh bathroom acids."
                  className="w-full px-3 py-2 rounded-xl border border-stone-300 dark:border-stone-700 bg-stone-50/50 dark:bg-stone-800 text-xs focus:ring-2 focus:ring-[#0A5C55] focus:outline-hidden"
                />
              </div>
            </div>

            {/* Column Titles */}
            <div className="pt-3 border-t border-stone-100 dark:border-stone-800 space-y-2">
              <span className="text-xs font-bold text-stone-700 dark:text-stone-300 block">
                Table Column Header Titles
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-stone-500 mb-1">
                    Column 1 (Feature)
                  </label>
                  <input
                    type="text"
                    value={cmpHeaderForm.col1Title}
                    onChange={(e) => setCmpHeaderForm({ ...cmpHeaderForm, col1Title: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 dark:border-stone-700 bg-stone-50/50 dark:bg-stone-800 text-xs focus:ring-2 focus:ring-[#0A5C55] focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400 mb-1">
                    Column 2 (KAPEE - Highlighted)
                  </label>
                  <input
                    type="text"
                    value={cmpHeaderForm.col2Title}
                    onChange={(e) => setCmpHeaderForm({ ...cmpHeaderForm, col2Title: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-emerald-300 dark:border-emerald-700 bg-emerald-50/50 dark:bg-emerald-950/30 text-xs font-bold text-emerald-800 dark:text-emerald-200 focus:ring-2 focus:ring-[#0A5C55] focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-stone-500 mb-1">
                    Column 3 (Sponge)
                  </label>
                  <input
                    type="text"
                    value={cmpHeaderForm.col3Title}
                    onChange={(e) => setCmpHeaderForm({ ...cmpHeaderForm, col3Title: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 dark:border-stone-700 bg-stone-50/50 dark:bg-stone-800 text-xs focus:ring-2 focus:ring-[#0A5C55] focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-stone-500 mb-1">
                    Column 4 (Chemical Spray)
                  </label>
                  <input
                    type="text"
                    value={cmpHeaderForm.col4Title}
                    onChange={(e) => setCmpHeaderForm({ ...cmpHeaderForm, col4Title: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 dark:border-stone-700 bg-stone-50/50 dark:bg-stone-800 text-xs focus:ring-2 focus:ring-[#0A5C55] focus:outline-hidden"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Comparison Rows List (CRUD) */}
          <div className="bg-white dark:bg-stone-900 rounded-2xl border border-stone-200/80 dark:border-stone-800 p-5 shadow-2xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-base font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2">
                  <Layers className="w-4 h-4 text-emerald-deep dark:text-emerald-400" />
                  <span>Comparison Rows ({(comparisonTable?.rows || []).length})</span>
                </h3>
                <p className="text-xs text-stone-500 mt-0.5">
                  Add, edit, reorder or toggle visibility for each feature comparison row.
                </p>
              </div>

              <button
                type="button"
                onClick={() => handleOpenCmpDrawer()}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-emerald-deep hover:bg-emerald-800 text-white shadow-xs transition-all active:scale-95 self-start sm:self-auto"
              >
                <Plus className="w-4 h-4" />
                <span>Add Comparison Row</span>
              </button>
            </div>

            <div className="space-y-3 pt-2">
              {(comparisonTable?.rows || []).map((row, idx) => (
                <div
                  key={row.id || idx}
                  className="rounded-2xl border border-stone-200 dark:border-stone-800 p-4 bg-stone-50/50 dark:bg-stone-850 hover:border-emerald-deep/40 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  <div className="space-y-2 flex-1">
                    <div className="flex items-center gap-2.5">
                      <span className="w-6 h-6 rounded-lg bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 font-bold text-xs flex items-center justify-center shrink-0">
                        {idx + 1}
                      </span>
                      <h4 className="font-bold text-sm text-stone-900 dark:text-stone-100">
                        {row.feature}
                      </h4>
                      {row.active === false && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-stone-200 text-stone-600 dark:bg-stone-800 dark:text-stone-400">
                          Hidden
                        </span>
                      )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs pt-1">
                      <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200/60 dark:border-emerald-800/40">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-300 block">
                          KAPEE
                        </span>
                        <p className="font-semibold text-emerald-900 dark:text-emerald-200 mt-0.5">
                          {row.kapee}
                        </p>
                      </div>

                      <div className="p-2 rounded-xl bg-stone-100 dark:bg-stone-800/60 border border-stone-200 dark:border-stone-700">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-stone-500 block">
                          Ordinary Sponge
                        </span>
                        <p className="text-stone-700 dark:text-stone-300 mt-0.5">
                          {row.sponge}
                        </p>
                      </div>

                      <div className="p-2 rounded-xl bg-stone-100 dark:bg-stone-800/60 border border-stone-200 dark:border-stone-700">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-stone-500 block">
                          Chemical Spray
                        </span>
                        <p className="text-stone-700 dark:text-stone-300 mt-0.5">
                          {row.spray}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 self-end md:self-center shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-stone-200 dark:border-stone-800">
                    <button
                      type="button"
                      onClick={() => handleToggleCmpRowActive(row.id, row.active !== false)}
                      className={`p-2 rounded-xl text-xs transition-colors ${
                        row.active !== false
                          ? 'text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/40'
                          : 'text-stone-400 hover:bg-stone-200 dark:hover:bg-stone-800'
                      }`}
                      title={row.active !== false ? 'Active (Click to hide)' : 'Hidden (Click to show)'}
                    >
                      {row.active !== false ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleOpenCmpDrawer(row)}
                      className="p-2 rounded-xl text-stone-500 hover:text-emerald-deep hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors dark:hover:text-emerald-300"
                      title="Edit Row"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setDeleteTarget({ type: 'comparisonRow', id: row.id, title: row.feature });
                        setDeleteConfirmOpen(true);
                      }}
                      className="p-2 rounded-xl text-stone-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                      title="Delete Row"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* =========================================================
          TAB 4: TRUST PILLARS ("Why Choose KAPEE?") CRUD
         ========================================================= */}
      {activeTab === 'trust' && (
        <div className="space-y-6">
          <SettingsCard
            title="Section Header"
            description="Badge, heading and subtitle above the trust cards."
            onSave={() => saveSection('trustSection', trustHeaderForm, 'Trust Section Header')}
            saveLabel="Save Section Header"
          >
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <TextField label="Gold Badge Text" value={trustHeaderForm.badge} onChange={(v) => setTrustHeaderForm({ ...trustHeaderForm, badge: v })} placeholder="The KAPEE Difference" />
              <TextField label="Main Headline" value={trustHeaderForm.heading} onChange={(v) => setTrustHeaderForm({ ...trustHeaderForm, heading: v })} placeholder="Why Choose KAPEE?" />
              <TextField label="Subtitle" value={trustHeaderForm.subheading} onChange={(v) => setTrustHeaderForm({ ...trustHeaderForm, subheading: v })} placeholder="Pure water-activated cleaning..." />
            </div>
          </SettingsCard>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-stone-900 p-5 rounded-2xl border border-stone-200/80 dark:border-stone-800 shadow-2xs">
            <div>
              <h2 className="text-base font-bold text-stone-900 dark:text-stone-100">
                "Why Choose KAPEE?" Trust Pillars
              </h2>
              <p className="text-xs text-stone-500 mt-0.5">
                The 5 house-shaped guarantee cards displayed right below the hero section.
              </p>
            </div>
            <button
              type="button"
              onClick={() => handleOpenTrustDrawer()}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-deep hover:bg-emerald-800 text-white text-xs font-semibold shadow-xs transition-all active:scale-95 shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>Add Trust Card</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {(trustPillars || []).map((pillar, idx) => (
              <div
                key={pillar.id}
                className="bg-white dark:bg-stone-900 rounded-2xl border border-stone-200/80 dark:border-stone-800 p-5 shadow-2xs space-y-3 flex flex-col justify-between"
              >
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="w-7 h-7 rounded-xl bg-gold/15 text-gold-dark font-bold text-xs flex items-center justify-center">
                      #{idx + 1}
                    </span>
                    <span className="text-[11px] font-mono text-stone-400">
                      Icon: {pillar.icon || 'Sparkles'}
                    </span>
                  </div>

                  <h3 className="font-bold text-sm text-stone-900 dark:text-stone-100">
                    {pillar.title}
                  </h3>
                  <p className="text-xs text-stone-600 dark:text-stone-400 leading-relaxed">
                    {pillar.desc}
                  </p>
                </div>

                <div className="pt-3 border-t border-stone-100 dark:border-stone-800 flex items-center justify-end gap-1">
                  <button
                    type="button"
                    onClick={() => handleOpenTrustDrawer(pillar)}
                    className="p-1.5 rounded-lg text-stone-500 hover:text-emerald-deep hover:bg-emerald-50 dark:hover:bg-emerald-950/40 transition-colors dark:hover:text-emerald-300"
                    title="Edit Card"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setDeleteTarget({ type: 'trust', id: pillar.id, title: pillar.title });
                      setDeleteConfirmOpen(true);
                    }}
                    className="p-1.5 rounded-lg text-stone-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors"
                    title="Delete Card"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* =========================================================
          TAB: "WET. WIPE. WOW." HOW IT WORKS STEPS CRUD
         ========================================================= */}
      {activeTab === 'howItWorks' && (
        <div className="space-y-6">
          {/* Section Header Settings Form */}
          <div className="bg-white dark:bg-stone-900 rounded-2xl border border-stone-200/80 dark:border-stone-800 p-5 space-y-4 shadow-2xs">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100 dark:border-stone-800">
              <div>
                <h3 className="text-sm font-bold text-stone-900 dark:text-stone-100 flex items-center gap-1.5">
                  <Edit className="w-4 h-4 text-emerald-deep dark:text-emerald-400" />
                  <span>Section Header & Title Settings</span>
                </h3>
                <p className="text-xs text-stone-500 mt-0.5">
                  Customize the headline, subtitle, and uppercase gold badge above the 3 cards.
                </p>
              </div>
              <button
                type="button"
                onClick={handleSaveHowItWorksHeader}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-emerald-deep hover:bg-emerald-800 text-white shadow-xs transition-all active:scale-95 shrink-0"
              >
                Save Section Header
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div className="space-y-1">
                <label className="font-semibold text-stone-700 dark:text-stone-300">Gold Badge Text</label>
                <input
                  type="text"
                  value={howItWorksHeaderForm.badge}
                  onChange={(e) => setHowItWorksHeaderForm({ ...howItWorksHeaderForm, badge: e.target.value })}
                  placeholder="EFFORTLESS CLEANING IN 3 EASY STEPS"
                  className="w-full px-3 py-2 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-stone-700 dark:text-stone-300">Main Headline</label>
                <input
                  type="text"
                  value={howItWorksHeaderForm.heading}
                  onChange={(e) => setHowItWorksHeaderForm({ ...howItWorksHeaderForm, heading: e.target.value })}
                  placeholder="Wet. Wipe. Wow."
                  className="w-full px-3 py-2 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl font-bold focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-stone-700 dark:text-stone-300">Subtitle / Tagline</label>
                <input
                  type="text"
                  value={howItWorksHeaderForm.subheading}
                  onChange={(e) => setHowItWorksHeaderForm({ ...howItWorksHeaderForm, subheading: e.target.value })}
                  placeholder="No gloves, no masks, and no noxious chemical fumes required."
                  className="w-full px-3 py-2 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>
          </div>

          {/* 3. Steps Management Header & Cards */}
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-stone-900 p-5 rounded-2xl border border-stone-200/80 dark:border-stone-800 shadow-2xs">
              <div>
                <h2 className="text-base font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2">
                  <span>Step Instruction Cards</span>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 text-xs font-semibold">
                    {(howItWorksSteps || []).length} steps
                  </span>
                </h2>
                <p className="text-xs text-stone-500 mt-0.5">
                  Click 'Edit' to change instructions, toggle visibility, or add new cleaning steps.
                </p>
              </div>
              <button
                type="button"
                onClick={() => handleOpenStepDrawer()}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-deep hover:bg-emerald-800 text-white text-xs font-semibold shadow-xs transition-all active:scale-95 shrink-0"
              >
                <Plus className="w-4 h-4" />
                <span>Add Step</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {(howItWorksSteps || []).map((stepItem, idx) => (
                <div
                  key={stepItem.id || idx}
                  className="bg-white dark:bg-stone-900 rounded-2xl border border-stone-200/80 dark:border-stone-800 p-6 shadow-2xs flex flex-col justify-between space-y-4"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-300 to-amber-500 text-emerald-950 font-bold text-base flex items-center justify-center shadow-xs">
                        {stepItem.step || idx + 1}
                      </div>

                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          stepItem.active !== false
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                            : 'bg-stone-100 text-stone-500 dark:bg-stone-800 dark:text-stone-400'
                        }`}
                      >
                        {stepItem.active !== false ? 'Active' : 'Hidden'}
                      </span>
                    </div>

                    <h3 className="font-serif font-bold text-base text-stone-900 dark:text-stone-100">
                      {stepItem.title}
                    </h3>
                    <p className="text-xs text-stone-600 dark:text-stone-400 leading-relaxed">
                      {stepItem.desc}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-stone-100 dark:border-stone-800 flex items-center justify-between">
                    <button
                      type="button"
                      onClick={() => handleToggleStepActive(stepItem.id, stepItem.active !== false)}
                      className={`text-xs font-semibold flex items-center gap-1 ${
                        stepItem.active !== false
                          ? 'text-emerald-600 hover:text-emerald-700 dark:hover:text-emerald-300'
                          : 'text-stone-400 hover:text-stone-600 dark:hover:text-stone-200'
                      }`}
                    >
                      {stepItem.active !== false ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                      <span>{stepItem.active !== false ? 'Visible' : 'Hidden'}</span>
                    </button>

                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => handleOpenStepDrawer(stepItem)}
                        className="p-1.5 rounded-lg text-stone-500 hover:text-emerald-deep hover:bg-emerald-50 dark:hover:bg-emerald-950/40 transition-colors dark:hover:text-emerald-300"
                        title="Edit Step"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setDeleteTarget({ type: 'step', id: stepItem.id, title: stepItem.title });
                          setDeleteConfirmOpen(true);
                        }}
                        className="p-1.5 rounded-lg text-stone-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors"
                        title="Delete Step"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* =========================================================
          TAB: INSTAGRAM COMMUNITY GRID (UGC)
         ========================================================= */}
      {activeTab === 'ugc' && (
        <SettingsCard
          title="Instagram Grid"
          description="Header texts and the photos shown in the #KapeeClean grid."
          onSave={() => saveSection('ugcSection', ugcForm, 'Instagram Grid')}
          saveLabel="Save Instagram Grid"
        >
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <TextField label="Badge Text" value={ugcForm.badge} onChange={(v) => setUgcForm({ ...ugcForm, badge: v })} placeholder="Community Gallery" />
            <TextField label="Main Headline" value={ugcForm.heading} onChange={(v) => setUgcForm({ ...ugcForm, heading: v })} placeholder="Tag #KapeeClean on Instagram" />
            <TextField label="Subtitle" value={ugcForm.subheading} onChange={(v) => setUgcForm({ ...ugcForm, subheading: v })} placeholder="Join thousands of Indian families..." />
          </div>

          <div className="flex items-center justify-between text-xs">
            <p className="font-semibold text-stone-700 dark:text-stone-300">Photos ({(ugcForm.images || []).length})</p>
            <button
              type="button"
              onClick={() => openUgcFilePicker()}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-deep hover:bg-emerald-800 text-white text-xs font-semibold shadow-xs transition-all active:scale-95"
            >
              <UploadCloud className="w-3.5 h-3.5" />
              <span>Upload Photo</span>
            </button>
            <input type="file" ref={ugcInputRef} onChange={handleUgcUpload} accept="image/*" className="hidden" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
            {(ugcForm.images || []).map((img) => (
              <div key={img.id} className="rounded-xl border border-stone-200 dark:border-stone-700 overflow-hidden">
                <button
                  type="button"
                  onClick={() => openUgcFilePicker(img.id)}
                  className="group relative block w-full h-36 cursor-pointer"
                  title="Click to change photo"
                >
                  <img src={img.image} alt={img.alt || ''} className="w-full h-full object-cover" />
                  <span className="absolute inset-0 bg-ink/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1.5 text-white text-xs font-semibold">
                    <UploadCloud className="w-4 h-4" />
                    Change Photo
                  </span>
                </button>
                <div className="p-3 space-y-2">
                  <TextField label="Instagram / Click Link" value={img.link} onChange={(v) => updateUgcImage(img.id, { link: v })} placeholder="https://instagram.com/p/..." />
                  <TextField label="Alt Text" value={img.alt} onChange={(v) => updateUgcImage(img.id, { alt: v })} placeholder="KAPEE clean community" />
                  <div className="flex items-center justify-between pt-1">
                    <button
                      type="button"
                      onClick={() => updateUgcImage(img.id, { active: img.active === false })}
                      className={`font-semibold flex items-center gap-1 ${img.active !== false ? 'text-emerald-600' : 'text-stone-400'}`}
                    >
                      {img.active !== false ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                      <span>{img.active !== false ? 'Visible' : 'Hidden'}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => confirmDelete({ title: 'Remove Photo?', message: 'Remove this customer photo?', onConfirm: () => setUgcForm({ ...ugcForm, images: (ugcForm.images || []).filter((i) => i.id !== img.id) }) })}
                      className="p-1.5 rounded-lg text-stone-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors"
                      title="Remove Photo"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </SettingsCard>
      )}

      {/* =========================================================
          TAB 4: SECTION VISIBILITY TOGGLES
         ========================================================= */}
      {activeTab === 'sections' && (
        <div className="bg-white dark:bg-stone-900 rounded-2xl border border-stone-200/80 dark:border-stone-800 p-4 sm:p-6 space-y-5 shadow-2xs max-w-3xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-base font-bold text-stone-900 dark:text-stone-100">
                Homepage Section Visibility
              </h2>
              <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">
                Turn any section of your public homepage ON or OFF. Changes are saved instantly.
              </p>
            </div>
            <span className="self-start sm:self-auto px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 whitespace-nowrap">
              {(homepageSections || []).filter((sec) => sec.active !== false).length} / {(homepageSections || []).length} visible
            </span>
          </div>

          {(homepageSections || []).length === 0 ? (
            <p className="py-10 text-center text-xs text-stone-500 dark:text-stone-400 border border-dashed border-stone-200 dark:border-stone-700 rounded-xl">
              No homepage sections found.
            </p>
          ) : (
            <div className="divide-y divide-stone-200 dark:divide-stone-800 border border-stone-200 dark:border-stone-800 rounded-xl overflow-hidden text-xs">
              {homepageSections.map((sec, idx) => {
                const visible = sec.active !== false;
                return (
                  <div
                    key={sec.id}
                    className="p-3 sm:p-4 flex items-center justify-between gap-3 bg-white dark:bg-stone-900 hover:bg-stone-50/60 dark:hover:bg-stone-800/40 transition-colors"
                  >
                    <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                      <span className="w-6 shrink-0 text-stone-400 font-mono text-[11px]">#{idx + 1}</span>
                      <div className="min-w-0">
                        <p className={`font-bold text-sm truncate ${visible ? 'text-stone-800 dark:text-stone-200' : 'text-stone-400 dark:text-stone-500 line-through'}`}>
                          {sec.name}
                        </p>
                        <p className={`text-[11px] font-semibold ${visible ? 'text-emerald-700 dark:text-emerald-400' : 'text-stone-400'}`}>
                          {visible ? 'Visible on homepage' : 'Hidden from homepage'}
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      role="switch"
                      aria-checked={visible}
                      aria-label={`${visible ? 'Hide' : 'Show'} ${sec.name}`}
                      onClick={() => {
                        updateHomepageSection(sec.id, { active: !visible });
                        addToast({
                          type: 'info',
                          title: 'Section Visibility Updated',
                          message: `${sec.name} is now ${!visible ? 'Visible' : 'Hidden'} on the storefront.`
                        });
                      }}
                      className={`relative shrink-0 w-11 h-6 rounded-full transition-colors cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 ${
                        visible ? 'bg-emerald-600' : 'bg-stone-300 dark:bg-stone-700'
                      }`}
                    >
                      <span
                        className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${
                          visible ? 'translate-x-5' : ''
                        }`}
                      />
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}


      {/* =========================================================
          SIDE DRAWER: TRUST PILLAR CARD
         ========================================================= */}
      <SideDrawer
        isOpen={trustDrawerOpen}
        onClose={() => setTrustDrawerOpen(false)}
        title={editingTrust ? 'Edit Trust Pillar' : 'Add New Trust Pillar'}
        subtitle="Manage the 'Why Choose KAPEE?' value guarantee cards"
        footer={
          <div className="flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={() => setTrustDrawerOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-stone-500"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSaveTrust}
              className="px-5 py-2 text-xs font-semibold bg-emerald-deep text-white rounded-xl shadow-xs"
            >
              Save Card
            </button>
          </div>
        }
      >
        <div className="space-y-4 text-xs">
          <div className="space-y-1">
            <label className="font-semibold text-stone-700 dark:text-stone-300">Card Title *</label>
            <input
              type="text"
              value={trustForm.title}
              onChange={(e) => setTrustForm({ ...trustForm, title: e.target.value })}
              placeholder="e.g. Water-Only Clean"
              className="w-full px-3 py-2 bg-stone-50 dark:bg-stone-800 border rounded-xl"
            />
          </div>

          <div className="space-y-1">
            <label className="font-semibold text-stone-700 dark:text-stone-300">Description *</label>
            <textarea
              rows={3}
              value={trustForm.desc}
              onChange={(e) => setTrustForm({ ...trustForm, desc: e.target.value })}
              placeholder="Zero chemicals or bleach. Safe around kids and pets."
              className="w-full px-3 py-2 bg-stone-50 dark:bg-stone-800 border rounded-xl"
            />
          </div>

          <div className="space-y-1">
            <label className="font-semibold text-stone-700 dark:text-stone-300">Icon</label>
            <CustomSelect
              value={trustForm.icon}
              onChange={(e) => setTrustForm({ ...trustForm, icon: e.target.value })}
              options={ICON_OPTIONS}
            />
          </div>
        </div>
      </SideDrawer>

      {/* =========================================================
          SIDE DRAWER: HOW IT WORKS STEP
         ========================================================= */}
      <SideDrawer
        isOpen={stepDrawerOpen}
        onClose={() => setStepDrawerOpen(false)}
        title={editingStep ? 'Edit Step' : 'Add New Step'}
        subtitle="Manage 'Wet. Wipe. Wow.' instructions"
        footer={
          <div className="flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={() => setStepDrawerOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-stone-500"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSaveStep}
              className="px-5 py-2 text-xs font-semibold bg-emerald-deep text-white rounded-xl shadow-xs"
            >
              Save Step
            </button>
          </div>
        }
      >
        <div className="space-y-4 text-xs">
          <div className="space-y-1">
            <label className="font-semibold text-stone-700 dark:text-stone-300">Step Number</label>
            <input
              type="number"
              value={stepForm.step}
              onChange={(e) => setStepForm({ ...stepForm, step: Number(e.target.value) })}
              className="w-full px-3 py-2 bg-stone-50 dark:bg-stone-800 border rounded-xl"
            />
          </div>

          <div className="space-y-1">
            <label className="font-semibold text-stone-700 dark:text-stone-300">Step Title *</label>
            <input
              type="text"
              value={stepForm.title}
              onChange={(e) => setStepForm({ ...stepForm, title: e.target.value })}
              placeholder="e.g. 1. Wet with Water"
              className="w-full px-3 py-2 bg-stone-50 dark:bg-stone-800 border rounded-xl"
            />
          </div>

          <div className="space-y-1">
            <label className="font-semibold text-stone-700 dark:text-stone-300">Step Description *</label>
            <textarea
              rows={3}
              value={stepForm.desc}
              onChange={(e) => setStepForm({ ...stepForm, desc: e.target.value })}
              placeholder="Hold the sponge under tap water until damp. Gently compress flat between your open palms..."
              className="w-full px-3 py-2 bg-stone-50 dark:bg-stone-800 border rounded-xl"
            />
          </div>
        </div>
      </SideDrawer>

      {/* Transformation Item Edit/Create Drawer */}
      <SideDrawer
        isOpen={baDrawerOpen}
        onClose={() => setBaDrawerOpen(false)}
        title={editingBa ? `Edit Transformation: ${baItemForm.surface}` : 'Add Transformation Card'}
        footer={
          <div className="flex items-center justify-end gap-2 w-full">
            <button
              type="button"
              onClick={() => setBaDrawerOpen(false)}
              className="px-4 py-2 text-xs font-medium text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSaveBaItem}
              className="px-5 py-2 text-xs font-semibold bg-emerald-deep text-white rounded-xl shadow-xs hover:bg-emerald-800"
            >
              {editingBa ? 'Update Transformation' : 'Add Transformation'}
            </button>
          </div>
        }
      >
        <div className="space-y-5 text-xs">
          <div className="space-y-1">
            <label className="font-semibold text-stone-700 dark:text-stone-300">Surface Category Name *</label>
            <input
              type="text"
              value={baItemForm.surface}
              onChange={(e) => setBaItemForm({ ...baItemForm, surface: e.target.value })}
              placeholder="e.g. Tile Grout & Soap Scum"
              className="w-full px-3 py-2 bg-stone-50 dark:bg-stone-800 border rounded-xl"
            />
          </div>

          <div className="space-y-1">
            <label className="font-semibold text-stone-700 dark:text-stone-300">Stain Proof Description *</label>
            <textarea
              rows={2}
              value={baItemForm.description}
              onChange={(e) => setBaItemForm({ ...baItemForm, description: e.target.value })}
              placeholder="e.g. Bathroom tile yellowing and hard water stains wiped away in 30 seconds."
              className="w-full px-3 py-2 bg-stone-50 dark:bg-stone-800 border rounded-xl"
            />
          </div>

          {/* BEFORE Image Upload & Preview */}
          <div className="p-3.5 bg-stone-50 dark:bg-stone-800/50 rounded-2xl border space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="font-bold text-stone-800 dark:text-stone-200">1. BEFORE Image (Dirty Surface)</span>
              <input
                ref={baBeforeInputRef}
                type="file"
                accept="image/*"
                onChange={(e) => handleImageUploadForBa(e, 'before')}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => baBeforeInputRef.current?.click()}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-deep hover:bg-emerald-800 text-white text-xs font-semibold shadow-xs transition-all active:scale-95"
              >
                <UploadCloud className="w-3.5 h-3.5" />
                <span>{baItemForm.before ? 'Change Image' : 'Select Image from Device'}</span>
              </button>
            </div>

            {baItemForm.before && (
              <div className="relative rounded-xl overflow-hidden aspect-video bg-stone-200 dark:bg-stone-800 border">
                <img src={baItemForm.before} alt="Before preview" className="w-full h-full object-cover" />
              </div>
            )}
            <p className="text-[11px] text-stone-400">
              Select dirty surface photo from your computer
            </p>
          </div>

          {/* AFTER Image Upload & Preview */}
          <div className="p-3.5 bg-stone-50 dark:bg-stone-800/50 rounded-2xl border space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="font-bold text-stone-800 dark:text-stone-200">2. AFTER Image (KAPEE Clean)</span>
              <input
                ref={baAfterInputRef}
                type="file"
                accept="image/*"
                onChange={(e) => handleImageUploadForBa(e, 'after')}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => baAfterInputRef.current?.click()}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-deep hover:bg-emerald-800 text-white text-xs font-semibold shadow-xs transition-all active:scale-95"
              >
                <UploadCloud className="w-3.5 h-3.5" />
                <span>{baItemForm.after ? 'Change Image' : 'Select Image from Device'}</span>
              </button>
            </div>

            {baItemForm.after && (
              <div className="relative rounded-xl overflow-hidden aspect-video bg-stone-200 dark:bg-stone-800 border">
                <img src={baItemForm.after} alt="After preview" className="w-full h-full object-cover" />
              </div>
            )}
            <p className="text-[11px] text-stone-400">
              Select cleaned surface photo from your computer
            </p>
          </div>

          <div className="flex items-center justify-between pt-2">
            <span className="font-semibold text-stone-700 dark:text-stone-300">Visible on Storefront</span>
            <input
              type="checkbox"
              checked={baItemForm.active}
              onChange={(e) => setBaItemForm({ ...baItemForm, active: e.target.checked })}
              className="w-4 h-4 accent-emerald-deep rounded"
            />
          </div>
        </div>
      </SideDrawer>


      {/* Comparison Row Drawer */}
      <SideDrawer
        isOpen={cmpDrawerOpen}
        onClose={() => setCmpDrawerOpen(false)}
        title={editingCmpRow ? 'Edit Comparison Row' : 'Add Comparison Row'}
        subtitle="Manage the feature title and outcomes across KAPEE, regular sponge, and chemical sprays."
        footer={
          <div className="flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={() => setCmpDrawerOpen(false)}
              className="px-4 py-2 rounded-xl border border-stone-300 dark:border-stone-700 text-xs font-semibold hover:bg-stone-100 dark:hover:bg-stone-800"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSaveCmpRow}
              className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-emerald-deep hover:bg-emerald-800 text-white text-xs font-bold shadow-xs transition-all active:scale-95"
            >
              <Save className="w-4 h-4" />
              <span>{editingCmpRow ? 'Save Row Changes' : 'Add Row'}</span>
            </button>
          </div>
        }
      >
        <div className="space-y-4 text-xs">
          <div>
            <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
              Feature / Benefit Description <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={cmpRowForm.feature}
              onChange={(e) => setCmpRowForm({ ...cmpRowForm, feature: e.target.value })}
              placeholder="e.g. Cleans with 100% Plain Water"
              className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 dark:border-stone-700 bg-stone-50/50 dark:bg-stone-800 focus:ring-2 focus:ring-[#0A5C55] focus:outline-hidden font-medium"
            />
          </div>

          <div className="p-3.5 rounded-xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 space-y-1">
            <label className="block text-xs font-bold text-emerald-900 dark:text-emerald-200">
              ✨ KAPEE Eraser Advantage <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={cmpRowForm.kapee}
              onChange={(e) => setCmpRowForm({ ...cmpRowForm, kapee: e.target.value })}
              placeholder="e.g. Yes (0% Chemicals)"
              className="w-full px-3.5 py-2.5 rounded-xl border border-emerald-300 dark:border-emerald-700 bg-white dark:bg-stone-850 text-xs font-semibold text-emerald-900 dark:text-emerald-200 focus:ring-2 focus:ring-[#0A5C55] focus:outline-hidden"
            />
            <p className="text-[10px] text-emerald-700 dark:text-emerald-400">
              This will be highlighted with a green checkmark in the comparison column.
            </p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
              Ordinary Yellow/Green Sponge Behavior
            </label>
            <input
              type="text"
              value={cmpRowForm.sponge}
              onChange={(e) => setCmpRowForm({ ...cmpRowForm, sponge: e.target.value })}
              placeholder="e.g. Requires heavy dish soap"
              className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 dark:border-stone-700 bg-stone-50/50 dark:bg-stone-800 focus:ring-2 focus:ring-[#0A5C55] focus:outline-hidden"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
              Corrosive Chemical Sprays Result / Risk
            </label>
            <input
              type="text"
              value={cmpRowForm.spray}
              onChange={(e) => setCmpRowForm({ ...cmpRowForm, spray: e.target.value })}
              placeholder="e.g. Toxic chemical solvents / Fumes"
              className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 dark:border-stone-700 bg-stone-50/50 dark:bg-stone-800 focus:ring-2 focus:ring-[#0A5C55] focus:outline-hidden"
            />
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-stone-200 dark:border-stone-800">
            <span className="font-semibold text-stone-700 dark:text-stone-300">Visible on Storefront</span>
            <input
              type="checkbox"
              checked={cmpRowForm.active}
              onChange={(e) => setCmpRowForm({ ...cmpRowForm, active: e.target.checked })}
              className="w-4 h-4 accent-emerald-deep rounded"
            />
          </div>
        </div>
      </SideDrawer>

      {/* Delete Confirmation Modal */}
      <ConfirmDialog
        isOpen={deleteConfirmOpen}
        onClose={() => {
          setDeleteConfirmOpen(false);
          setDeleteTarget(null);
        }}
        title="Delete Item"
        message={`Are you sure you want to delete "${deleteTarget?.title}"? This item will no longer appear on your public website.`}
        confirmText="Delete"
        danger
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
};
