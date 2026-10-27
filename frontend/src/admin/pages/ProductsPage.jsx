import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Package,
  Plus,
  LayoutGrid,
  List,
  Edit,
  Trash2,
  Copy,
  Star,
  CheckCircle,
  AlertTriangle,
  Layers,
  Tag,
  Boxes,
  ArrowUpDown,
  Sparkles,
  ExternalLink,
  ChevronRight,
  UploadCloud,
  Check,
  X,
  Save,
  HelpCircle,
  ShieldCheck,
  FileText,
  Sliders,
  Droplets,
  Truck,
  RotateCcw,
  CreditCard,
  Zap,
  Leaf,
  Heart,
  Eye,
  Flame,
  RefreshCw,
  SlidersHorizontal,
  ShoppingBag,
  ChevronUp,
  ChevronDown,
  Image as ImageIcon
} from 'lucide-react';
import { useAdminStore } from '../store/adminStore';
import { DataTable } from '../components/common/DataTable';
import { StatusBadge } from '../components/common/StatusBadge';
import { SideDrawer } from '../components/common/SideDrawer';
import { ConfirmDialog } from '../components/common/ConfirmDialog';
import { triggerKapeeCelebration } from '../components/common/Confetti';
import { CustomSelect } from '../components/common/CustomSelect';
import { PRODUCT_BADGES, productBadgeList } from '../lib/productBadges';
import { confirmDelete } from '../../store/useConfirmStore';

export const ICON_OPTIONS = [
  { value: 'Droplets', label: 'Droplets (Water / Liquid)' },
  { value: 'Sparkles', label: 'Sparkles (Micro-Foam / Shine)' },
  { value: 'ShieldCheck', label: 'Shield Check (Safe / Tested)' },
  { value: 'Truck', label: 'Truck (Free / Express Delivery)' },
  { value: 'RotateCcw', label: 'Rotate Arrow (7-Day Return)' },
  { value: 'CreditCard', label: 'Credit Card (COD Available)' },
  { value: 'Zap', label: 'Zap (Instant Cleaning Action)' },
  { value: 'Leaf', label: 'Leaf (100% Chemical-Free / Eco)' },
  { value: 'Heart', label: 'Heart (Gentle / Safe for Pets)' },
  { value: 'RefreshCw', label: 'Refresh (Reusable / Washable)' },
  { value: 'Eye', label: 'Eye (Streak-Free Polish)' },
  { value: 'Flame', label: 'Flame (Stove / Tadka Degreaser)' }
];

export const renderLucideIcon = (name, className = 'w-4 h-4') => {
  switch (name) {
    case 'Droplets': return <Droplets className={className} />;
    case 'Sparkles': return <Sparkles className={className} />;
    case 'ShieldCheck': return <ShieldCheck className={className} />;
    case 'Truck': return <Truck className={className} />;
    case 'RotateCcw': return <RotateCcw className={className} />;
    case 'CreditCard': return <CreditCard className={className} />;
    case 'Zap': return <Zap className={className} />;
    case 'Leaf': return <Leaf className={className} />;
    case 'Heart': return <Heart className={className} />;
    case 'RefreshCw': return <RefreshCw className={className} />;
    case 'Eye': return <Eye className={className} />;
    case 'Flame': return <Flame className={className} />;
    default: return <Sparkles className={className} />;
  }
};

export const defaultProductFeatureBadges = [
  { id: 'fb-1', icon: 'Droplets', title: '100% Water-Activated', subtitle: 'Zero Detergents or Soap' },
  { id: 'fb-2', icon: 'Sparkles', title: 'German Micro-Foam', subtitle: 'Lifts Deep Nano-Grooves' },
  { id: 'fb-3', icon: 'ShieldCheck', title: 'Chemical-Free & Safe', subtitle: 'Safe Around Kids & Pets' }
];

export const defaultProductTrustBadges = [
  { id: 'tb-1', icon: 'Truck', text: 'Free Ship ₹499+' },
  { id: 'tb-2', icon: 'RotateCcw', text: '7-Day Return' },
  { id: 'tb-3', icon: 'ShieldCheck', text: 'Chemical Free' },
  { id: 'tb-4', icon: 'CreditCard', text: 'COD Available' }
];

export const defaultProductBeforeAfter = [
  {
    id: 'ba-1',
    surface: 'Tile Grout & Soap Scum',
    before: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=800&q=80',
    after: 'https://images.unsplash.com/photo-1620626011761-996317b8d101?auto=format&fit=crop&w=800&q=80',
    description: 'Bathroom tile yellowing and hard water stains wiped away in 30 seconds.'
  }
];

export const defaultProductHowToUse = {
  headline: '4 Simple Steps to Sparkling Clean:',
  steps: [
    { id: 's-1', title: 'Wet with clean water', desc: 'Hold under tap water for 3 seconds. Zero soap or detergents needed.' },
    { id: 's-2', title: 'Gently squeeze excess water', desc: 'Press flat between palms. Do not twist or wring like a dish rag.' },
    { id: 's-3', title: 'Lightly wipe stains', desc: 'Wipe across tiles, faucets, sneaker midsoles, or walls with gentle pressure.' },
    { id: 's-4', title: 'Rinse & air dry', desc: 'Rinse away dirt under running water and let dry for your next cleaning job.' }
  ],
  proTip: 'Can be cut with regular scissors into small blocks for hard-to-reach faucet corners or window tracks!'
};

export const defaultProductWhereToUse = {
  safeSurfaces: [
    { id: 'safe-1', label: 'Kitchen', desc: 'Gas stove grease, oily backsplashes, sink basins, burnt cookware bottoms.' },
    { id: 'safe-2', label: 'Bathroom', desc: 'Hard water limescale on taps/showers, soap scum on glass partitions, tile grout.' },
    { id: 'safe-3', label: 'Home & Footwear', desc: 'White sneaker midsoles, crayon/pencil wall marks, light switchboards.' }
  ],
  cautionSurfaces: [
    { id: 'caut-1', text: 'High-gloss car exterior body paint (micro-abrasion can dull polished clear coats).' },
    { id: 'caut-2', text: 'Delicate camera lenses, eyeglasses, or computer/phone screens.' },
    { id: 'caut-3', text: 'Directly on human or pet skin, or raw unvarnished wooden surfaces.' }
  ]
};

export const defaultProductSpecifications = [
  { id: 'spec-1', label: 'Material Grade', value: '100% German Melamine Resin' },
  { id: 'spec-2', label: 'Dimensions (Per Piece)', value: '100mm × 60mm × 20mm' },
  { id: 'spec-3', label: 'Cleaning Technology', value: 'Water-Activated Nano-Abrasion' },
  { id: 'spec-4', label: 'Shelf Life & Storage', value: 'Unlimited (Store Dry & Cool)' }
];

export const defaultProductEcoNote = '100% chemical-free, biodegradable paper packaging, safe around babies & pets.';

export const ProductsPage = () => {
  const {
    products,
    addProduct,
    updateProduct,
    deleteProduct,
    categories,
    addCategory,
    updateCategory,
    deleteCategory,
    addToast
  } = useAdminStore();

  const [viewMode, setViewMode] = useState('table'); // 'table' | 'grid'
  
  // Product Drawer State
  const [productDrawerOpen, setProductDrawerOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [productForm, setProductForm] = useState({
    title: '',
    subtitle: '',
    badges: ['New Launch'],
    basePrice: 199,
    baseMrp: 399,
    stock: 50,
    status: 'Active',
    images: ['/products/magic_eraser.jpg'],
    variants: [
      { id: 'v1', name: 'Pack of 1', price: 149, mrp: 299, pieces: 1, bestValue: false },
      { id: 'v2', name: 'Pack of 3', price: 349, mrp: 799, pieces: 3, bestValue: false },
      { id: 'v3', name: 'Pack of 5', price: 499, mrp: 1299, pieces: 5, bestValue: true }
    ],
    howToUse: defaultProductHowToUse,
    whereToUse: defaultProductWhereToUse,
    specifications: defaultProductSpecifications,
    ecoNote: defaultProductEcoNote
  });

  // Delete dialog
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState({ type: 'product', item: null });

  const defaultProductBeforeAfter = [
    {
      id: 'pba-1',
      surface: 'Tile Grout & Soap Scum',
      before: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=800&q=80',
      after: 'https://images.unsplash.com/photo-1620626011761-996317b8d101?auto=format&fit=crop&w=800&q=80',
      description: 'Bathroom tile yellowing and hard water stains wiped away in 30 seconds.'
    },
    {
      id: 'pba-2',
      surface: 'Dirty White Sneaker Soles',
      before: 'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?auto=format&fit=crop&w=800&q=80',
      after: 'https://images.unsplash.com/photo-1560769629-975ec94e6a86?auto=format&fit=crop&w=800&q=80',
      description: 'Mud scuffs and asphalt stains lifted effortlessly from rubber midsoles.'
    }
  ];

  const handleOpenProductDrawer = (product = null) => {
    if (product) {
      setEditingProduct(product);
      setProductForm({
        title: product.title,
        subtitle: product.subtitle || '',
        badges: productBadgeList(product),
        basePrice: product.basePrice,
        baseMrp: product.baseMrp,
        stock: product.stock,
        status: product.status || 'Active',
        // Editing shows exactly what is saved for this product (no template content filled in)
        category: product.category || '',
        qualityBadge: product.qualityBadge || '',
        viewingCount: product.viewingCount || 0,
        soldIn24h: product.soldIn24h || 0,
        videoUrl: product.videoUrl || '',
        images: product.images || [],
        variants: product.variants || [],
        featureBadges: product.featureBadges || [],
        trustBadges: product.trustBadges || [],
        beforeAfter: product.beforeAfter || [],
        howToUse: (product.howToUse && (product.howToUse.steps || product.howToUse.headline))
          ? product.howToUse
          : (Array.isArray(product.howToUse) && product.howToUse.length
              ? { headline: '', steps: product.howToUse.map((s, idx) => ({ id: `s-${idx}`, title: s.title || `Step ${idx+1}`, desc: s.desc || '' })), proTip: '' }
              : { headline: '', steps: [], proTip: '' }),
        whereToUse: product.whereToUse?.safeSurfaces ? product.whereToUse : { safeSurfaces: [], cautionSurfaces: [] },
        specifications: Array.isArray(product.specifications) && product.specifications.length
          ? product.specifications
          : (product.specs
              ? Object.entries(product.specs).map(([label, value], idx) => ({ id: `spec-${idx}`, label, value }))
              : []),
        ecoNote: product.ecoNote || '',
        frequentlyBoughtTogetherIds: product.frequentlyBoughtTogetherIds || [],
        youMayAlsoLikeIds: product.youMayAlsoLikeIds || []
      });
    } else {
      setEditingProduct(null);
      setProductForm({
        title: '',
        subtitle: '',
        badges: ['New Launch'],
        basePrice: 199,
        baseMrp: 399,
        stock: 50,
        status: 'Active',
        images: ['/products/magic_eraser.jpg'],
        variants: [
          { id: 'v1', name: 'Pack of 3', price: 349, mrp: 799, pieces: 3, bestValue: false },
          { id: 'v2', name: 'Pack of 5', price: 499, mrp: 1299, pieces: 5, bestValue: true }
        ],
        featureBadges: defaultProductFeatureBadges,
        trustBadges: defaultProductTrustBadges,
        beforeAfter: defaultProductBeforeAfter,
        howToUse: defaultProductHowToUse,
        whereToUse: defaultProductWhereToUse,
        specifications: defaultProductSpecifications,
        ecoNote: defaultProductEcoNote,
        frequentlyBoughtTogetherIds: [],
        youMayAlsoLikeIds: []
      });
    }
    setProductDrawerOpen(true);
  };

  const handleAddVariant = () => {
    const list = productForm.variants || [];
    const maxPieces = list.length > 0 ? Math.max(...list.map((v) => Number(v.pieces) || 1)) : 1;
    const nextPieces = maxPieces >= 10 ? maxPieces + 5 : (maxPieces >= 5 ? 10 : (maxPieces >= 3 ? 5 : 3));
    const newVariant = {
      id: `v-${Date.now()}`,
      name: `Pack of ${nextPieces}`,
      pieces: nextPieces,
      price: nextPieces === 10 ? 899 : (nextPieces === 5 ? 499 : 349),
      mrp: nextPieces === 10 ? 1999 : (nextPieces === 5 ? 1299 : 799),
      bestValue: false
    };
    setProductForm({
      ...productForm,
      variants: [...list, newVariant]
    });
    addToast({ type: 'success', title: 'Pack Tier Added', message: `Added "${newVariant.name}". Customize price and units.` });
  };

  const handleUpdateVariant = (index, field, value) => {
    const list = [...(productForm.variants || [])];
    list[index] = {
      ...list[index],
      [field]: field === 'bestValue' ? value : (field === 'name' ? value : (Number(value) || 0))
    };
    setProductForm({ ...productForm, variants: list });
  };

  const handleRemoveVariant = (index) =>
    confirmDelete({
      title: 'Delete Pack Option?',
      message: 'Delete this pack option from the product?',
      onConfirm: () => {
        const list = productForm.variants || [];
        if (list.length <= 1) {
          addToast({ type: 'warning', title: 'Cannot Delete', message: 'At least one pack tier is required.' });
          return;
        }
        const removedName = list[index]?.name || 'Pack';
        const updated = list.filter((_, i) => i !== index);
        setProductForm({ ...productForm, variants: updated });
        addToast({ type: 'info', title: 'Pack Removed', message: `Removed ${removedName}.` });
      }
    });

  // Feature Highlights Handlers (Image 1 - 3 Badges)
  const handleUpdateFeatureBadge = (index, field, value) => {
    const list = [...(productForm.featureBadges || defaultProductFeatureBadges)];
    list[index] = { ...list[index], [field]: value };
    setProductForm({ ...productForm, featureBadges: list });
  };

  // Multiple Product Images Handlers
  const handleUploadMultipleImages = (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    let loadedCount = 0;
    const newImages = [];
    files.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        newImages.push(event.target.result);
        loadedCount++;
        if (loadedCount === files.length) {
          const currentImages = productForm.images || [];
          setProductForm({
            ...productForm,
            images: [...currentImages, ...newImages]
          });
          addToast({
            type: 'success',
            title: 'Images Uploaded',
            message: `Added ${files.length} new product image${files.length > 1 ? 's' : ''}.`
          });
        }
      };
      reader.readAsDataURL(file);
    });
    e.target.value = '';
  };

  const handleRemoveImage = (index) =>
    confirmDelete({
      title: 'Delete Photo?',
      message: 'Delete this photo from the product gallery?',
      onConfirm: () => {
        const current = productForm.images || [];
        if (current.length <= 1) {
          addToast({
            type: 'warning',
            title: 'Cannot Delete',
            message: 'Product must have at least one image.'
          });
          return;
        }
        const updated = current.filter((_, i) => i !== index);
        setProductForm({ ...productForm, images: updated });
        addToast({
          type: 'info',
          title: 'Image Removed',
          message: `Removed image #${index + 1}.`
        });
      }
    });

  const handleSetPrimaryImage = (index) => {
    if (index === 0) return;
    const current = [...(productForm.images || [])];
    const [chosen] = current.splice(index, 1);
    current.unshift(chosen);
    setProductForm({ ...productForm, images: current });
    addToast({
      type: 'success',
      title: 'Primary Image Updated',
      message: 'Set as the main cover photo for this product.'
    });
  };

  const handleMoveImage = (index, direction) => {
    const current = [...(productForm.images || [])];
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= current.length) return;
    const temp = current[index];
    current[index] = current[targetIndex];
    current[targetIndex] = temp;
    setProductForm({ ...productForm, images: current });
  };

  const handleReplaceImage = (index, e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const current = [...(productForm.images || [])];
      current[index] = event.target.result;
      setProductForm({ ...productForm, images: current });
      addToast({
        type: 'success',
        title: 'Image Replaced',
        message: `Replaced image #${index + 1}.`
      });
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  // Trust Badges Handlers (Image 2 - 4 Badges)
  const handleUpdateTrustBadge = (index, field, value) => {
    const list = [...(productForm.trustBadges || defaultProductTrustBadges)];
    list[index] = { ...list[index], [field]: value };
    setProductForm({ ...productForm, trustBadges: list });
  };

  // Single Before & After Handlers (Image 3 - 1 per product)
  const handleUpdateProductBeforeAfterSingle = (field, value) => {
    const list = productForm.beforeAfter || [];
    const current = list.length ? { ...list[0] } : { id: `pba-${Date.now()}`, surface: '', before: '', after: '', description: '' };
    current[field] = value;
    // Only the first proof is edited here; any others saved earlier are kept
    setProductForm({ ...productForm, beforeAfter: [current, ...list.slice(1)] });
  };

  const handleUploadProductBeforeAfterSingleImage = (e, type) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      handleUpdateProductBeforeAfterSingle(type, event.target.result);
      addToast({
        type: 'success',
        title: 'Image Uploaded',
        message: `Updated ${type.toUpperCase()} image for this product.`
      });
    };
    reader.readAsDataURL(file);
  };

  // How to Use Handlers
  const handleUpdateHowToUseHeadline = (headline) => {
    setProductForm({
      ...productForm,
      howToUse: { ...(productForm.howToUse || defaultProductHowToUse), headline }
    });
  };

  const handleUpdateHowToUseProTip = (proTip) => {
    setProductForm({
      ...productForm,
      howToUse: { ...(productForm.howToUse || defaultProductHowToUse), proTip }
    });
  };

  const handleAddHowToUseStep = () => {
    const currentSteps = productForm.howToUse?.steps || [];
    const newStep = {
      id: `s-${Date.now()}`,
      title: `Step ${currentSteps.length + 1}`,
      desc: ''
    };
    setProductForm({
      ...productForm,
      howToUse: {
        ...(productForm.howToUse || defaultProductHowToUse),
        steps: [...currentSteps, newStep]
      }
    });
    addToast({ type: 'success', title: 'Step Added', message: `Added step #${currentSteps.length + 1}.` });
  };

  const handleUpdateHowToUseStep = (index, field, value) => {
    const currentSteps = [...(productForm.howToUse?.steps || [])];
    currentSteps[index] = { ...currentSteps[index], [field]: value };
    setProductForm({
      ...productForm,
      howToUse: {
        ...(productForm.howToUse || defaultProductHowToUse),
        steps: currentSteps
      }
    });
  };

  const handleRemoveHowToUseStep = (index) =>
    confirmDelete({
      title: 'Delete Step?',
      message: 'Delete this How to Use step?',
      onConfirm: () => {
        const currentSteps = [...(productForm.howToUse?.steps || [])];
        if (currentSteps.length <= 1) {
          addToast({ type: 'warning', title: 'Cannot Delete', message: 'At least one step is required.' });
          return;
        }
        const updated = currentSteps.filter((_, i) => i !== index);
        setProductForm({
          ...productForm,
          howToUse: {
            ...(productForm.howToUse || defaultProductHowToUse),
            steps: updated
          }
        });
        addToast({ type: 'info', title: 'Step Removed', message: `Removed step #${index + 1}.` });
      }
    });

  // Where to Use & Caution Handlers
  const handleAddSafeSurface = () => {
    const safeSurfaces = productForm.whereToUse?.safeSurfaces || [];
    const newItem = {
      id: `safe-${Date.now()}`,
      label: 'New Surface',
      desc: 'Removes stains and grime easily.'
    };
    setProductForm({
      ...productForm,
      whereToUse: {
        ...(productForm.whereToUse || defaultProductWhereToUse),
        safeSurfaces: [...safeSurfaces, newItem]
      }
    });
    addToast({ type: 'success', title: 'Safe Surface Added', message: 'Added new recommended surface.' });
  };

  const handleUpdateSafeSurface = (index, field, value) => {
    const safeSurfaces = [...(productForm.whereToUse?.safeSurfaces || [])];
    safeSurfaces[index] = { ...safeSurfaces[index], [field]: value };
    setProductForm({
      ...productForm,
      whereToUse: {
        ...(productForm.whereToUse || defaultProductWhereToUse),
        safeSurfaces
      }
    });
  };

  const handleRemoveSafeSurface = (index) =>
    confirmDelete({
      title: 'Delete Surface?',
      message: 'Delete this safe surface?',
      onConfirm: () => {
        const safeSurfaces = [...(productForm.whereToUse?.safeSurfaces || [])];
        if (safeSurfaces.length <= 1) {
          addToast({ type: 'warning', title: 'Cannot Delete', message: 'At least one safe surface is required.' });
          return;
        }
        const updated = safeSurfaces.filter((_, i) => i !== index);
        setProductForm({
          ...productForm,
          whereToUse: {
            ...(productForm.whereToUse || defaultProductWhereToUse),
            safeSurfaces: updated
          }
        });
        addToast({ type: 'info', title: 'Surface Removed', message: 'Removed safe surface.' });
      }
    });

  const handleAddCautionSurface = () => {
    const cautionSurfaces = productForm.whereToUse?.cautionSurfaces || [];
    const newItem = {
      id: `caut-${Date.now()}`,
      text: 'Do not use on delicate surface.'
    };
    setProductForm({
      ...productForm,
      whereToUse: {
        ...(productForm.whereToUse || defaultProductWhereToUse),
        cautionSurfaces: [...cautionSurfaces, newItem]
      }
    });
    addToast({ type: 'success', title: 'Caution Added', message: 'Added caution restriction.' });
  };

  const handleUpdateCautionSurface = (index, text) => {
    const cautionSurfaces = [...(productForm.whereToUse?.cautionSurfaces || [])];
    cautionSurfaces[index] = { ...cautionSurfaces[index], text };
    setProductForm({
      ...productForm,
      whereToUse: {
        ...(productForm.whereToUse || defaultProductWhereToUse),
        cautionSurfaces
      }
    });
  };

  const handleRemoveCautionSurface = (index) =>
    confirmDelete({
      title: 'Delete Surface?',
      message: 'Delete this caution surface?',
      onConfirm: () => {
        const cautionSurfaces = [...(productForm.whereToUse?.cautionSurfaces || [])];
        if (cautionSurfaces.length <= 1) {
          addToast({ type: 'warning', title: 'Cannot Delete', message: 'At least one caution item is required.' });
          return;
        }
        const updated = cautionSurfaces.filter((_, i) => i !== index);
        setProductForm({
          ...productForm,
          whereToUse: {
            ...(productForm.whereToUse || defaultProductWhereToUse),
            cautionSurfaces: updated
          }
        });
        addToast({ type: 'info', title: 'Caution Removed', message: 'Removed caution item.' });
      }
    });

  // Specifications Handlers
  const handleAddSpecification = () => {
    const specs = productForm.specifications || [];
    const newItem = {
      id: `spec-${Date.now()}`,
      label: 'New Specification',
      value: 'Specification Detail'
    };
    setProductForm({
      ...productForm,
      specifications: [...specs, newItem]
    });
    addToast({ type: 'success', title: 'Specification Added', message: 'Added new technical specification.' });
  };

  const handleUpdateSpecification = (index, field, value) => {
    const specs = [...(productForm.specifications || [])];
    specs[index] = { ...specs[index], [field]: value };
    setProductForm({
      ...productForm,
      specifications: specs
    });
  };

  const handleRemoveSpecification = (index) =>
    confirmDelete({
      title: 'Delete Specification?',
      message: 'Delete this specification row?',
      onConfirm: () => {
        const specs = [...(productForm.specifications || [])];
        if (specs.length <= 1) {
          addToast({ type: 'warning', title: 'Cannot Delete', message: 'At least one specification is required.' });
          return;
        }
        const updated = specs.filter((_, i) => i !== index);
        setProductForm({
          ...productForm,
          specifications: updated
        });
        addToast({ type: 'info', title: 'Specification Removed', message: 'Removed specification item.' });
      }
    });

  const handleUpdateEcoNote = (ecoNote) => {
    setProductForm({
      ...productForm,
      ecoNote
    });
  };

  const handleSaveProduct = (e) => {
    e.preventDefault();
    if (!productForm.title) {
      addToast({ type: 'error', title: 'Title required', message: 'Please enter a product title.' });
      return;
    }

    const data = productForm;

    if (editingProduct) {
      updateProduct(editingProduct.id, data);
      addToast({ type: 'success', title: 'Product Updated', message: `Saved changes to "${productForm.title}".` });
    } else {
      addProduct(data);
      triggerKapeeCelebration();
      addToast({ type: 'success', title: 'Product Published', message: `Created "${productForm.title}".` });
    }
    setProductDrawerOpen(false);
  };

  // Product Table columns
  const productColumns = [
    {
      header: 'Product',
      accessor: 'title',
      cell: (row) => (
        <div className="flex items-center gap-3">
          <img
            src={row.images?.[0] || '/products/magic_eraser.jpg'}
            alt=""
            className="w-11 h-11 rounded-xl object-cover border border-stone-200/80 dark:border-stone-700 shrink-0"
          />
          <div>
            <p className="font-bold text-ink dark:text-stone-100 text-xs">
              {row.title}
            </p>
            {row.badge && (
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300">
                  {row.badge}
                </span>
              </div>
            )}
          </div>
        </div>
      )
    },
    {
      header: 'Price / MRP',
      accessor: 'basePrice',
      cell: (row) => (
        <div>
          <span className="font-bold text-ink dark:text-stone-100">
            ₹{row.basePrice}
          </span>
          <span className="text-[11px] text-stone-400 line-through ml-1.5">
            ₹{row.baseMrp}
          </span>
          <p className="text-[10px] text-emerald-600 font-semibold">
            {Math.round(((row.baseMrp - row.basePrice) / row.baseMrp) * 100)}% OFF
          </p>
        </div>
      )
    },
    {
      header: 'Rating',
      accessor: 'rating',
      cell: (row) => (
        <div className="flex items-center gap-1 text-xs">
          <Star className="w-3.5 h-3.5 text-gold fill-gold" />
          <span className="font-bold">{row.reviewCount ? row.rating : '—'}</span>
          <span className="text-[10px] text-stone-400">({row.reviewCount || 0})</span>
        </div>
      )
    },
    {
      header: 'Status',
      cell: () => <StatusBadge status="Active" />
    },
    {
      header: 'Actions',
      disableRowClick: true,
      cell: (row) => (
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => handleOpenProductDrawer(row)}
            className="p-1.5 rounded-lg text-stone-500 hover:text-emerald-deep hover:bg-emerald-50 dark:hover:bg-emerald-950/40"
            title="Edit product"
          >
            <Edit className="w-4 h-4" />
          </button>
          <button
            onClick={() => {
              const dup = { ...row, title: `${row.title} (Copy)` };
              delete dup.id;
              addProduct(dup);
              addToast({ type: 'success', title: 'Product Duplicated', message: `Copied ${row.title}.` });
            }}
            className="p-1.5 rounded-lg text-stone-400 hover:text-ink hover:bg-stone-100 dark:hover:bg-stone-800"
            title="Duplicate product"
          >
            <Copy className="w-4 h-4" />
          </button>
          <button
            onClick={() => {
              setDeleteTarget({ type: 'product', item: row });
              setDeleteConfirmOpen(true);
            }}
            className="p-1.5 rounded-lg text-stone-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40"
            title="Delete product"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      )
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-ink dark:text-stone-100">
            Products
          </h1>
          <p className="text-xs sm:text-sm text-muted dark:text-stone-400 mt-1">
            Manage single SKUs, presentation details, and dynamic pack pricing tiers.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <div className="flex items-center bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 p-1 rounded-xl shadow-xs">
            <button
              type="button"
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-lg text-xs transition-colors ${viewMode === 'table' ? 'bg-emerald-deep text-white' : 'text-stone-400'}`}
            >
              <List className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-lg text-xs transition-colors ${viewMode === 'grid' ? 'bg-emerald-deep text-white' : 'text-stone-400'}`}
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
          </div>

          <button
            type="button"
            onClick={() => {
              triggerKapeeCelebration();
              addToast({
                type: 'success',
                title: 'Products Saved',
                message: 'Product catalog, pricing tiers, and stock counts saved.'
              });
            }}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-emerald-deep hover:bg-emerald-800 text-white shadow-md hover:shadow-lg transition-all active:scale-95 whitespace-nowrap"
          >
            <Save className="w-4 h-4" />
            <span>Save Catalog</span>
          </button>

          <button
            type="button"
            onClick={() => handleOpenProductDrawer()}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-stone-100 hover:bg-stone-200 dark:bg-stone-800 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-200 border border-stone-200 dark:border-stone-700 transition-all active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Add Product</span>
          </button>
        </div>
      </div>

      {/* Main Products Content */}
      {viewMode === 'table' ? (
        <DataTable
          columns={productColumns}
          data={products}
          searchPlaceholder="Search product by title, badge..."
          onRowClick={(row) => handleOpenProductDrawer(row)}
          bulkActions={(selectedIds, clear) => (
            <button
              onClick={() =>
                confirmDelete({
                  title: 'Delete Selected Products?',
                  message: `Delete ${selectedIds.length} selected products? This cannot be undone.`,
                  onConfirm: () => {
                    selectedIds.forEach((id) => deleteProduct(id));
                    addToast({ type: 'info', title: 'Products Removed', message: `Deleted ${selectedIds.length} items.` });
                    clear();
                  }
                })
              }
              className="px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold"
            >
              Delete Selected
            </button>
          )}
        />
      ) : (
          /* Grid View */
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {products.map((p) => (
              <div
                key={p.id}
                onClick={() => handleOpenProductDrawer(p)}
                className="bg-white dark:bg-stone-900 rounded-2xl border border-stone-200/80 dark:border-stone-800 overflow-hidden shadow-xs hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between"
              >
                <div>
                  <div className="h-44 bg-stone-100 dark:bg-stone-800 relative overflow-hidden">
                    <img
                      src={p.images?.[0] || '/products/magic_eraser.jpg'}
                      alt={p.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    {p.badge && (
                      <span className="absolute top-2.5 left-2.5 px-2.5 py-1 rounded-full bg-emerald-deep text-white text-[10px] font-bold shadow-md">
                        {p.badge}
                      </span>
                    )}
                  </div>
                  <div className="p-4 space-y-2">
                    <h3 className="font-serif font-bold text-sm text-ink dark:text-stone-100 line-clamp-1">
                      {p.title}
                    </h3>
                    <div className="flex items-center justify-between text-xs pt-1">
                      <div>
                        <span className="font-bold text-emerald-deep dark:text-emerald-400">
                          ₹{p.basePrice}
                        </span>
                        <span className="text-[11px] text-stone-400 line-through ml-1.5">
                          ₹{p.baseMrp}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="px-4 py-2.5 border-t border-stone-100 dark:border-stone-800 flex justify-end gap-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleOpenProductDrawer(p);
                    }}
                    className="p-1 rounded text-stone-400 hover:text-emerald-deep"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setDeleteTarget({ type: 'product', item: p });
                      setDeleteConfirmOpen(true);
                    }}
                    className="p-1 rounded text-stone-400 hover:text-rose-600"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

      {/* Product Create / Edit Side Drawer */}
      <SideDrawer
        isOpen={productDrawerOpen}
        onClose={() => setProductDrawerOpen(false)}
        title={editingProduct ? `Edit: ${editingProduct.title}` : 'Add New Product'}
        subtitle="Manage SKU information, pricing tiers, and presentation details"
        width="max-w-2xl"
        footer={
          <div className="flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={() => setProductDrawerOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-stone-500 hover:text-stone-800"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSaveProduct}
              className="px-4 py-2 text-xs font-semibold bg-emerald-deep hover:bg-emerald-800 text-white rounded-xl shadow-sm"
            >
              Save & Publish Product
            </button>
          </div>
        }
      >
        <div className="space-y-6 text-xs">
          {/* Section: Basic Info */}
          <div className="space-y-3">
            <h4 className="font-serif font-bold text-sm text-ink dark:text-stone-100 border-b pb-1">
              Basic Product Information
            </h4>
            <div className="space-y-1">
              <label className="font-semibold text-stone-700 dark:text-stone-300">Product Title *</label>
              <input
                type="text"
                value={productForm.title}
                onChange={(e) => setProductForm({ ...productForm, title: e.target.value })}
                placeholder="e.g. KAPEE Ultra Magic Eraser (Pack of 5)"
                className="w-full px-3 py-2 bg-stone-50 dark:bg-stone-800 border rounded-xl"
              />
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-stone-700 dark:text-stone-300">Subtitle / Tagline</label>
              <input
                type="text"
                value={productForm.subtitle}
                onChange={(e) => setProductForm({ ...productForm, subtitle: e.target.value })}
                placeholder="Micro-abrasive melamine foam that removes stains with just plain water"
                className="w-full px-3 py-2 bg-stone-50 dark:bg-stone-800 border rounded-xl"
              />
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-stone-700 dark:text-stone-300">Badge</label>
              <CustomSelect
                multiple
                value={productForm.badges || []}
                onChange={(e) => setProductForm({ ...productForm, badges: e.target.value })}
                placeholder="No Badge"
                options={PRODUCT_BADGES}
              />
            </div>

            <div className="grid grid-cols-1 gap-3">
              <div className="space-y-1">
                <label className="font-semibold text-stone-700 dark:text-stone-300">Quality Badge</label>
                <input
                  type="text"
                  value={productForm.qualityBadge || ''}
                  onChange={(e) => setProductForm({ ...productForm, qualityBadge: e.target.value })}
                  placeholder="e.g. 100% Quality Tested • German Melamine"
                  className="w-full px-3 py-2 bg-stone-50 dark:bg-stone-800 border rounded-xl"
                />
                <p className="text-[10px] text-stone-400">Green pill above the title. Leave empty to hide.</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="font-semibold text-stone-700 dark:text-stone-300">"People viewing now" count</label>
                <input
                  type="number"
                  min={0}
                  value={productForm.viewingCount ?? ''}
                  onChange={(e) => setProductForm({ ...productForm, viewingCount: e.target.value === '' ? 0 : Number(e.target.value) })}
                  placeholder="0 = hidden"
                  className="w-full px-3 py-2 bg-stone-50 dark:bg-stone-800 border rounded-xl"
                />
              </div>
              <div className="space-y-1">
                <label className="font-semibold text-stone-700 dark:text-stone-300">"Sold in last 24h" count</label>
                <input
                  type="number"
                  min={0}
                  value={productForm.soldIn24h ?? ''}
                  onChange={(e) => setProductForm({ ...productForm, soldIn24h: e.target.value === '' ? 0 : Number(e.target.value) })}
                  placeholder="0 = hidden"
                  className="w-full px-3 py-2 bg-stone-50 dark:bg-stone-800 border rounded-xl"
                />
              </div>
            </div>

          </div>

          {/* ========================================================
              SECTION: PRODUCT GALLERY IMAGES (Multiple Photos)
             ======================================================== */}
          <div className="space-y-3 pt-2">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-stone-200 dark:border-stone-800 pb-2">
              <div>
                <h4 className="font-serif font-bold text-sm text-ink dark:text-stone-100 flex items-center gap-1.5">
                  <ImageIcon className="w-4 h-4 text-emerald-deep dark:text-emerald-400" />
                  <span>Product Gallery Images ({(productForm.images || []).length})</span>
                </h4>
                <p className="text-[11px] text-muted dark:text-stone-400">
                  Upload multiple product photos for storefront carousel, thumbnails, and zoom view.
                </p>
              </div>

              <label className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-emerald-deep hover:bg-emerald-800 text-white cursor-pointer transition-all shadow-xs active:scale-95 shrink-0">
                <UploadCloud className="w-3.5 h-3.5" />
                <span>+ Upload Multiple Images</span>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleUploadMultipleImages}
                  className="hidden"
                />
              </label>
            </div>

            {/* Images Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 pt-1">
              {(productForm.images || []).map((img, idx) => (
                <div
                  key={idx}
                  className={`group relative rounded-2xl overflow-hidden border bg-white dark:bg-stone-900 transition-all ${
                    idx === 0
                      ? 'border-emerald-500 ring-2 ring-emerald-500/30 shadow-xs'
                      : 'border-stone-200 dark:border-stone-700 hover:border-stone-400'
                  }`}
                >
                  {/* Aspect Square Image Box */}
                  <div className="aspect-square w-full bg-stone-100 dark:bg-stone-800 overflow-hidden relative">
                    <img
                      src={img}
                      alt={`Product Photo ${idx + 1}`}
                      className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-300"
                    />

                    {/* Primary Badge */}
                    {idx === 0 && (
                      <span className="absolute top-2 left-2 z-10 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-deep text-white shadow-md flex items-center gap-1">
                        <Star className="w-2.5 h-2.5 fill-amber-300 text-amber-300" />
                        Main Photo
                      </span>
                    )}

                    {/* Action Overlay */}
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-2">
                      <div className="flex items-center justify-between">
                        {idx !== 0 ? (
                          <button
                            type="button"
                            onClick={() => handleSetPrimaryImage(idx)}
                            className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-white text-stone-900 shadow hover:bg-emerald-50 hover:text-emerald-deep transition-all"
                            title="Set as main photo"
                          >
                            Set Main
                          </button>
                        ) : (
                          <span />
                        )}

                        <button
                          type="button"
                          onClick={() => handleRemoveImage(idx)}
                          className="w-6 h-6 rounded-md bg-rose-600 text-white flex items-center justify-center shadow hover:bg-rose-700 transition-all"
                          title="Delete photo"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {/* Reorder and Replace Controls */}
                      <div className="flex items-center justify-between gap-1 pt-1 border-t border-white/20">
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            disabled={idx === 0}
                            onClick={() => handleMoveImage(idx, -1)}
                            className="w-6 h-6 rounded bg-white/90 disabled:opacity-30 text-stone-800 flex items-center justify-center hover:bg-white text-xs font-bold"
                            title="Move left"
                          >
                            ←
                          </button>
                          <button
                            type="button"
                            disabled={idx === (productForm.images || []).length - 1}
                            onClick={() => handleMoveImage(idx, 1)}
                            className="w-6 h-6 rounded bg-white/90 disabled:opacity-30 text-stone-800 flex items-center justify-center hover:bg-white text-xs font-bold"
                            title="Move right"
                          >
                            →
                          </button>
                        </div>

                        <label
                          className="px-1.5 py-1 rounded bg-white/90 text-stone-800 text-[10px] font-semibold cursor-pointer hover:bg-white transition-all flex items-center gap-1"
                          title="Replace photo"
                        >
                          <UploadCloud className="w-3 h-3" />
                          <span>Replace</span>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => handleReplaceImage(idx, e)}
                            className="hidden"
                          />
                        </label>
                      </div>
                    </div>
                  </div>

                  {/* Caption underneath */}
                  <div className="p-2 flex items-center justify-between text-[11px] font-medium text-stone-600 dark:text-stone-300">
                    <span>Photo #{idx + 1}</span>
                    {idx === 0 && <span className="text-[10px] text-emerald-deep dark:text-emerald-400 font-bold">Cover</span>}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Section: Base Pricing */}
          <div className="space-y-3">
            <h4 className="font-serif font-bold text-sm text-ink dark:text-stone-100 border-b pb-1">
              Base Pricing
            </h4>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="font-semibold text-stone-700 dark:text-stone-300">Base Price (₹) *</label>
                <input
                  type="number"
                  value={productForm.basePrice}
                  onChange={(e) => setProductForm({ ...productForm, basePrice: e.target.value })}
                  className="w-full px-3 py-2 bg-stone-50 dark:bg-stone-800 border rounded-xl"
                />
              </div>
              <div className="space-y-1">
                <label className="font-semibold text-stone-700 dark:text-stone-300">Base MRP (₹)</label>
                <input
                  type="number"
                  value={productForm.baseMrp}
                  onChange={(e) => setProductForm({ ...productForm, baseMrp: e.target.value })}
                  className="w-full px-3 py-2 bg-stone-50 dark:bg-stone-800 border rounded-xl"
                />
              </div>
            </div>
          </div>

          {/* Section: Product Pack Options (Dynamic Add / Edit / Remove) */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between border-b border-stone-200 dark:border-stone-800 pb-2">
              <div>
                <h4 className="font-serif font-bold text-sm text-ink dark:text-stone-100">
                  Packs & Multi-buys
                </h4>
                <p className="text-[11px] text-muted dark:text-stone-400">
                  Configure custom pack sizes, bundle discounts, and per-piece rates.
                </p>
              </div>
              <button
                type="button"
                onClick={handleAddVariant}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/60 dark:hover:bg-emerald-900/60 text-emerald-deep dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 transition-all shadow-xs active:scale-95"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Pack Option</span>
              </button>
            </div>

            <div className="space-y-3">
              {(productForm.variants || []).map((v, idx) => {
                const perPiece = Math.round((Number(v.price) || 0) / (Number(v.pieces) || 1));
                return (
                  <div
                    key={v.id || idx}
                    className="p-3.5 bg-stone-50/80 dark:bg-stone-800/50 rounded-2xl border border-stone-200/90 dark:border-stone-700/80 space-y-3 transition-all hover:border-emerald-300 dark:hover:border-emerald-700"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-300 text-[11px] font-bold flex items-center justify-center">
                          {idx + 1}
                        </span>
                        <span className="text-xs font-bold text-stone-700 dark:text-stone-200">
                          Tier #{idx + 1}
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-3">
                        <label className="flex items-center gap-1.5 text-xs text-stone-600 dark:text-stone-300 cursor-pointer select-none">
                          <input
                            type="checkbox"
                            checked={!!v.bestValue}
                            onChange={(e) => handleUpdateVariant(idx, 'bestValue', e.target.checked)}
                            className="rounded border-stone-300 text-emerald-600 focus:ring-emerald-500"
                          />
                          <span className="font-semibold text-[11px]">Best Value Badge</span>
                        </label>

                        {(productForm.variants || []).length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveVariant(idx)}
                            className="p-1 rounded-lg text-stone-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                            title="Delete this pack"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                      <div className="space-y-1">
                        <label className="text-[11px] font-medium text-stone-500 dark:text-stone-400">Pack Name</label>
                        <input
                          type="text"
                          value={v.name || ''}
                          onChange={(e) => handleUpdateVariant(idx, 'name', e.target.value)}
                          placeholder="e.g. Pack of 3"
                          className="w-full px-2.5 py-1.5 text-xs bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 rounded-lg focus:outline-none focus:border-emerald-500"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[11px] font-medium text-stone-500 dark:text-stone-400">Pieces / Units</label>
                        <input
                          type="number"
                          min="1"
                          value={v.pieces || 1}
                          onChange={(e) => handleUpdateVariant(idx, 'pieces', Math.max(1, Number(e.target.value) || 1))}
                          className="w-full px-2.5 py-1.5 text-xs bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 rounded-lg focus:outline-none focus:border-emerald-500"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[11px] font-medium text-stone-500 dark:text-stone-400">Selling Price (₹)</label>
                        <input
                          type="number"
                          min="0"
                          value={v.price || 0}
                          onChange={(e) => handleUpdateVariant(idx, 'price', Number(e.target.value) || 0)}
                          className="w-full px-2.5 py-1.5 text-xs bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 rounded-lg focus:outline-none focus:border-emerald-500"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[11px] font-medium text-stone-500 dark:text-stone-400">MRP (₹)</label>
                        <input
                          type="number"
                          min="0"
                          value={v.mrp || 0}
                          onChange={(e) => handleUpdateVariant(idx, 'mrp', Number(e.target.value) || 0)}
                          className="w-full px-2.5 py-1.5 text-xs bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 rounded-lg focus:outline-none focus:border-emerald-500"
                        />
                      </div>
                    </div>

                  </div>
                );
              })}
            </div>
          </div>

          {/* ========================================================
              SECTION: TRUST & DELIVERY BADGES (Image 2 - 4 Badges)
             ======================================================== */}
          <div className="space-y-4 pt-4 border-t border-stone-200 dark:border-stone-800">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-serif font-bold text-sm text-ink dark:text-stone-100 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-deep dark:text-emerald-400" />
                  <span>Trust & Delivery Strip (4 Badges)</span>
                </h4>
                <p className="text-[11px] text-muted dark:text-stone-400">
                  The 4 reassurance badges displayed under the delivery pincode checker on this product's page.
                </p>
              </div>
              <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                4 Badges
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
              {(productForm.trustBadges || defaultProductTrustBadges).slice(0, 4).map((badge, idx) => (
                <div
                  key={badge.id || idx}
                  className="p-3 bg-stone-50/80 dark:bg-stone-800/50 rounded-2xl border border-stone-200/90 dark:border-stone-700/80 space-y-2"
                >
                  <div className="flex items-center justify-between pb-1 border-b border-stone-200/60 dark:border-stone-700/60">
                    <span className="text-[11px] font-bold text-stone-700 dark:text-stone-300">
                      Badge {idx + 1}
                    </span>
                    <div className="w-6 h-6 rounded-lg bg-emerald-100 dark:bg-emerald-950/60 flex items-center justify-center text-emerald-deep dark:text-emerald-400 shadow-2xs">
                      {renderLucideIcon(badge.icon, 'w-3 h-3')}
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-semibold text-stone-500 dark:text-stone-400 uppercase tracking-wider">Icon</label>
                    <CustomSelect
                      value={badge.icon || 'Truck'}
                      onChange={(val) => handleUpdateTrustBadge(idx, 'icon', val)}
                      options={ICON_OPTIONS}
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-semibold text-stone-500 dark:text-stone-400 uppercase tracking-wider">Badge Text *</label>
                    <input
                      type="text"
                      value={badge.text || ''}
                      onChange={(e) => handleUpdateTrustBadge(idx, 'text', e.target.value)}
                      placeholder="e.g. Free Ship ₹499+"
                      className="w-full px-2.5 py-1.5 text-xs bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 rounded-lg focus:outline-none focus:border-emerald-500 font-medium"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ========================================================
              SECTION: BEFORE & AFTER TRANSFORMATION (Image 3 - 1 Per Product)
             ======================================================== */}
          {(() => {
            const singleBa = (productForm.beforeAfter && productForm.beforeAfter.length)
              ? productForm.beforeAfter[0]
              : { surface: '', before: '', after: '', description: '' };
            return (
              <div className="space-y-4 pt-4 border-t border-stone-200 dark:border-stone-800">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-serif font-bold text-sm text-ink dark:text-stone-100 flex items-center gap-1.5">
                      <Sliders className="w-4 h-4 text-emerald-deep dark:text-emerald-400" />
                      <span>Before & After Transformation (1 Per Product)</span>
                    </h4>
                    <p className="text-[11px] text-muted dark:text-stone-400">
                      Configure the single interactive before/after split slider for this specific product.
                    </p>
                  </div>
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
                    1 Proof Per Product
                  </span>
                </div>

                <div className="p-4 bg-stone-50/80 dark:bg-stone-800/50 rounded-2xl border border-stone-200/90 dark:border-stone-700/80 space-y-3">
                  <div className="space-y-2.5">
                    <div className="space-y-1">
                      <label className="text-[11px] font-medium text-stone-500 dark:text-stone-400">Surface / Stain Name *</label>
                      <input
                        type="text"
                        value={singleBa.surface || ''}
                        onChange={(e) => handleUpdateProductBeforeAfterSingle('surface', e.target.value)}
                        placeholder="e.g. Tile Grout & Soap Scum"
                        className="w-full px-2.5 py-1.5 text-xs bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 rounded-lg focus:outline-none focus:border-emerald-500 font-medium"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[11px] font-medium text-stone-500 dark:text-stone-400">Proof Description</label>
                      <textarea
                        rows={2}
                        value={singleBa.description || ''}
                        onChange={(e) => handleUpdateProductBeforeAfterSingle('description', e.target.value)}
                        placeholder="e.g. Bathroom tile yellowing and hard water stains wiped away in 30 seconds."
                        className="w-full px-2.5 py-1.5 text-xs bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 rounded-lg focus:outline-none focus:border-emerald-500"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                      {/* BEFORE */}
                      <div className="p-3 bg-white dark:bg-stone-900 rounded-xl border border-stone-200 dark:border-stone-700 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] font-bold text-rose-600 dark:text-rose-400">1. BEFORE (Dirty Surface)</span>
                          <label className="cursor-pointer text-[10px] font-semibold text-emerald-deep dark:text-emerald-400 hover:underline flex items-center gap-1 px-2 py-1 rounded bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700">
                            <UploadCloud className="w-3 h-3" />
                            <span>{singleBa.before ? 'Change Image' : 'Select Image'}</span>
                            <input
                              type="file"
                              accept="image/*"
                              onChange={(e) => handleUploadProductBeforeAfterSingleImage(e, 'before')}
                              className="hidden"
                            />
                          </label>
                        </div>
                        {singleBa.before && (
                          <div className="relative aspect-video rounded-lg overflow-hidden bg-stone-100 border border-stone-200 dark:border-stone-700">
                            <img src={singleBa.before} alt="Before preview" className="w-full h-full object-cover" />
                          </div>
                        )}
                      </div>

                      {/* AFTER */}
                      <div className="p-3 bg-white dark:bg-stone-900 rounded-xl border border-stone-200 dark:border-stone-700 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400">2. AFTER (KAPEE Clean)</span>
                          <label className="cursor-pointer text-[10px] font-semibold text-emerald-deep dark:text-emerald-400 hover:underline flex items-center gap-1 px-2 py-1 rounded bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700">
                            <UploadCloud className="w-3 h-3" />
                            <span>{singleBa.after ? 'Change Image' : 'Select Image'}</span>
                            <input
                              type="file"
                              accept="image/*"
                              onChange={(e) => handleUploadProductBeforeAfterSingleImage(e, 'after')}
                              className="hidden"
                            />
                          </label>
                        </div>
                        {singleBa.after && (
                          <div className="relative aspect-video rounded-lg overflow-hidden bg-stone-100 border border-stone-200 dark:border-stone-700">
                            <img src={singleBa.after} alt="After preview" className="w-full h-full object-cover" />
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })()}

          {/* ========================================================
              SECTION: KEY FEATURE HIGHLIGHTS (Image 1 - 3 Badges)
             ======================================================== */}
          <div className="space-y-4 pt-4 border-t border-stone-200 dark:border-stone-800">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-serif font-bold text-sm text-ink dark:text-stone-100 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-emerald-deep dark:text-emerald-400" />
                  <span>Feature Highlights (3 Badges)</span>
                </h4>
                <p className="text-[11px] text-muted dark:text-stone-400">
                  The 3 circle-icon badges displayed under Effectively Cleaning on this product's page.
                </p>
              </div>
              <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                3 Badges
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {(productForm.featureBadges || defaultProductFeatureBadges).slice(0, 3).map((badge, idx) => (
                <div
                  key={badge.id || idx}
                  className="p-3.5 bg-stone-50/80 dark:bg-stone-800/50 rounded-2xl border border-stone-200/90 dark:border-stone-700/80 space-y-2.5"
                >
                  <div className="flex items-center justify-between pb-1.5 border-b border-stone-200/60 dark:border-stone-700/60">
                    <span className="text-[11px] font-bold text-stone-700 dark:text-stone-300">
                      Badge {idx + 1}
                    </span>
                    <div className="w-7 h-7 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 flex items-center justify-center text-emerald-deep dark:text-emerald-400 shadow-2xs">
                      {renderLucideIcon(badge.icon, 'w-3.5 h-3.5')}
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-semibold text-stone-500 dark:text-stone-400 uppercase tracking-wider">Icon</label>
                    <CustomSelect
                      value={badge.icon || 'Droplets'}
                      onChange={(val) => handleUpdateFeatureBadge(idx, 'icon', val)}
                      options={ICON_OPTIONS}
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-semibold text-stone-500 dark:text-stone-400 uppercase tracking-wider">Title *</label>
                    <input
                      type="text"
                      value={badge.title || ''}
                      onChange={(e) => handleUpdateFeatureBadge(idx, 'title', e.target.value)}
                      placeholder="e.g. 100% Water-Activated"
                      className="w-full px-2.5 py-1.5 text-xs bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 rounded-lg focus:outline-none focus:border-emerald-500 font-medium"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-semibold text-stone-500 dark:text-stone-400 uppercase tracking-wider">Subtitle</label>
                    <input
                      type="text"
                      value={badge.subtitle || ''}
                      onChange={(e) => handleUpdateFeatureBadge(idx, 'subtitle', e.target.value)}
                      placeholder="e.g. Zero Detergents or Soap"
                      className="w-full px-2.5 py-1.5 text-xs bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 rounded-lg focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Section: 1. How to Use (Steps & Tips) */}
          <div className="space-y-4 pt-4 border-t border-stone-200 dark:border-stone-800">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-serif font-bold text-sm text-ink dark:text-stone-100 flex items-center gap-1.5">
                  <HelpCircle className="w-4 h-4 text-emerald-deep dark:text-emerald-400" />
                  <span>How to Use (Product Accordion)</span>
                </h4>
                <p className="text-[11px] text-muted dark:text-stone-400">
                  Configure the step-by-step cleaning directions and pro tips displayed on the product page.
                </p>
              </div>
              <button
                type="button"
                onClick={handleAddHowToUseStep}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/60 dark:hover:bg-emerald-900/60 text-emerald-deep dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 transition-all shadow-xs active:scale-95"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Step</span>
              </button>
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-medium text-stone-500 dark:text-stone-400">Steps Section Headline</label>
              <input
                type="text"
                value={productForm.howToUse?.headline || ''}
                onChange={(e) => handleUpdateHowToUseHeadline(e.target.value)}
                placeholder="e.g. 4 Simple Steps to Sparkling Clean:"
                className="w-full px-2.5 py-1.5 text-xs bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 rounded-lg focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div className="space-y-3">
              {(productForm.howToUse?.steps || []).map((step, idx) => (
                <div
                  key={step.id || idx}
                  className="p-3 bg-stone-50/80 dark:bg-stone-800/50 rounded-2xl border border-stone-200/90 dark:border-stone-700/80 space-y-2.5 transition-all hover:border-emerald-300"
                >
                  <div className="flex items-center justify-between gap-2 border-b border-stone-200/60 dark:border-stone-700/60 pb-2">
                    <div className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-300 text-[11px] font-bold flex items-center justify-center">
                        {idx + 1}
                      </span>
                      <span className="text-xs font-bold text-stone-700 dark:text-stone-200">
                        Step #{idx + 1}
                      </span>
                    </div>

                    {(productForm.howToUse?.steps || []).length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveHowToUseStep(idx)}
                        className="p-1 rounded-lg text-stone-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                        title="Remove step"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                  <div className="space-y-2">
                    <div className="space-y-1">
                      <label className="text-[10px] font-medium text-stone-500 dark:text-stone-400">Step Title *</label>
                      <input
                        type="text"
                        value={step.title || ''}
                        onChange={(e) => handleUpdateHowToUseStep(idx, 'title', e.target.value)}
                        placeholder="e.g. Wet with clean water"
                        className="w-full px-2.5 py-1.5 text-xs bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 rounded-lg focus:outline-none focus:border-emerald-500"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-medium text-stone-500 dark:text-stone-400">Step Description *</label>
                      <textarea
                        rows={2}
                        value={step.desc || ''}
                        onChange={(e) => handleUpdateHowToUseStep(idx, 'desc', e.target.value)}
                        placeholder="e.g. Hold under tap water for 3 seconds. Zero soap or detergents needed."
                        className="w-full px-2.5 py-1.5 text-xs bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 rounded-lg focus:outline-none focus:border-emerald-500"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="space-y-1 pt-1">
              <label className="text-[11px] font-medium text-stone-500 dark:text-stone-400">💡 Pro Tip Highlight</label>
              <textarea
                rows={2}
                value={productForm.howToUse?.proTip || ''}
                onChange={(e) => handleUpdateHowToUseProTip(e.target.value)}
                placeholder="e.g. Can be cut with regular scissors into small blocks for hard-to-reach faucet corners or window tracks!"
                className="w-full px-2.5 py-1.5 text-xs bg-emerald-50/50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 rounded-lg focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          {/* Section: 2. Where to Use & Caution */}
          <div className="space-y-4 pt-4 border-t border-stone-200 dark:border-stone-800">
            <div>
              <h4 className="font-serif font-bold text-sm text-ink dark:text-stone-100 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-deep dark:text-emerald-400" />
                <span>Where to Use & Caution</span>
              </h4>
              <p className="text-[11px] text-muted dark:text-stone-400">
                Define the safe recommended surfaces checklist and surfaces requiring caution.
              </p>
            </div>

            {/* Safe Surfaces */}
            <div className="space-y-3 p-3.5 bg-emerald-50/40 dark:bg-emerald-950/20 rounded-2xl border border-emerald-200/80 dark:border-emerald-800/60">
              <div className="flex items-center justify-between">
                <span className="font-bold text-xs text-emerald-800 dark:text-emerald-300 flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Safe & Recommended Surfaces</span>
                </span>
                <button
                  type="button"
                  onClick={handleAddSafeSurface}
                  className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-white dark:bg-stone-900 text-emerald-deep dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 shadow-2xs hover:bg-emerald-50"
                >
                  <Plus className="w-3 h-3" />
                  <span>Add Surface</span>
                </button>
              </div>

              <div className="space-y-2.5">
                {(productForm.whereToUse?.safeSurfaces || []).map((safe, idx) => (
                  <div key={safe.id || idx} className="p-2.5 bg-white dark:bg-stone-900 rounded-xl border border-emerald-100 dark:border-stone-700 space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <input
                        type="text"
                        value={safe.label || ''}
                        onChange={(e) => handleUpdateSafeSurface(idx, 'label', e.target.value)}
                        placeholder="Surface (e.g. Kitchen)"
                        className="w-1/2 px-2 py-1 text-xs font-semibold bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-lg focus:outline-none focus:border-emerald-500"
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveSafeSurface(idx)}
                        className="p-1 rounded text-stone-400 hover:text-rose-600 hover:bg-rose-50"
                        title="Remove surface"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                    <input
                      type="text"
                      value={safe.desc || ''}
                      onChange={(e) => handleUpdateSafeSurface(idx, 'desc', e.target.value)}
                      placeholder="Description (e.g. Gas stove grease, oily backsplashes...)"
                      className="w-full px-2 py-1 text-xs bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-lg focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Caution Surfaces */}
            <div className="space-y-3 p-3.5 bg-rose-50/40 dark:bg-rose-950/20 rounded-2xl border border-rose-200/80 dark:border-rose-800/60">
              <div className="flex items-center justify-between">
                <span className="font-bold text-xs text-rose-800 dark:text-rose-300 flex items-center gap-1.5">
                  <X className="w-3.5 h-3.5 text-rose-600" />
                  <span>Caution — Do NOT Use On</span>
                </span>
                <button
                  type="button"
                  onClick={handleAddCautionSurface}
                  className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-white dark:bg-stone-900 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800 shadow-2xs hover:bg-rose-50"
                >
                  <Plus className="w-3 h-3" />
                  <span>Add Caution Item</span>
                </button>
              </div>

              <div className="space-y-2">
                {(productForm.whereToUse?.cautionSurfaces || []).map((caut, idx) => (
                  <div key={caut.id || idx} className="flex items-center gap-2 p-2 bg-white dark:bg-stone-900 rounded-xl border border-rose-100 dark:border-stone-700">
                    <input
                      type="text"
                      value={caut.text || ''}
                      onChange={(e) => handleUpdateCautionSurface(idx, e.target.value)}
                      placeholder="e.g. High-gloss car exterior body paint"
                      className="flex-1 px-2 py-1 text-xs bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-lg focus:outline-none focus:border-rose-500"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveCautionSurface(idx)}
                      className="p-1 rounded text-stone-400 hover:text-rose-600 hover:bg-rose-50 shrink-0"
                      title="Remove caution"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Section: 3. Specifications & Eco-Safety */}
          <div className="space-y-4 pt-4 border-t border-stone-200 dark:border-stone-800">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-serif font-bold text-sm text-ink dark:text-stone-100 flex items-center gap-1.5">
                  <FileText className="w-4 h-4 text-emerald-deep dark:text-emerald-400" />
                  <span>Specifications & Eco-Safety</span>
                </h4>
                <p className="text-[11px] text-muted dark:text-stone-400">
                  Key-value material and dimensional attributes + eco-friendly certification note.
                </p>
              </div>
              <button
                type="button"
                onClick={handleAddSpecification}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/60 dark:hover:bg-emerald-900/60 text-emerald-deep dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 transition-all shadow-xs active:scale-95"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Specification</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {(productForm.specifications || []).map((spec, idx) => (
                <div
                  key={spec.id || idx}
                  className="p-2.5 bg-stone-50/80 dark:bg-stone-800/50 rounded-xl border border-stone-200/90 dark:border-stone-700/80 space-y-1.5"
                >
                  <div className="flex items-center justify-between gap-1">
                    <input
                      type="text"
                      value={spec.label || ''}
                      onChange={(e) => handleUpdateSpecification(idx, 'label', e.target.value)}
                      placeholder="Label (e.g. Material Grade)"
                      className="w-full px-2 py-1 text-[11px] font-semibold text-stone-600 dark:text-stone-300 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 rounded-md focus:outline-none focus:border-emerald-500"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveSpecification(idx)}
                      className="p-1 rounded text-stone-400 hover:text-rose-600 shrink-0"
                      title="Remove spec"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                  <input
                    type="text"
                    value={spec.value || ''}
                    onChange={(e) => handleUpdateSpecification(idx, 'value', e.target.value)}
                    placeholder="Value (e.g. 100% German Melamine Resin)"
                    className="w-full px-2 py-1 text-xs font-bold text-stone-800 dark:text-stone-100 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 rounded-md focus:outline-none focus:border-emerald-500"
                  />
                </div>
              ))}
            </div>

            <div className="space-y-1 pt-1">
              <label className="text-[11px] font-medium text-stone-500 dark:text-stone-400">🛡️ Eco-Friendly & Safety Note</label>
              <textarea
                rows={2}
                value={productForm.ecoNote || ''}
                onChange={(e) => handleUpdateEcoNote(e.target.value)}
                placeholder="e.g. 100% chemical-free, biodegradable paper packaging, safe around babies & pets."
                className="w-full px-2.5 py-1.5 text-xs bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 rounded-lg focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          {/* ========================================================
              SECTION: RELATED PRODUCTS (Frequently Bought Together + You May Also Like)
             ======================================================== */}
          {[
            {
              key: 'frequentlyBoughtTogetherIds',
              title: 'Frequently Bought Together',
              icon: ShoppingBag,
              hint: 'Products offered as a bundle with this one on its product page. Leave empty to hide this section.'
            },
            {
              key: 'youMayAlsoLikeIds',
              title: 'You May Also Like',
              icon: Sparkles,
              hint: 'Products suggested at the bottom of this product page. Leave empty to hide this section.'
            }
          ].map(({ key, title, icon: Icon, hint }) => {
            const selectedIds = productForm[key] || [];
            const otherProducts = products.filter((p) => p.id !== editingProduct?.id);
            const available = otherProducts.filter((p) => !selectedIds.includes(p.id));
            return (
              <div key={key} className="space-y-3 pt-2">
                <div className="border-b border-stone-200 dark:border-stone-800 pb-2">
                  <h4 className="font-serif font-bold text-sm text-ink dark:text-stone-100 flex items-center gap-1.5">
                    <Icon className="w-4 h-4 text-emerald-deep dark:text-emerald-400" />
                    <span>{title} ({selectedIds.length})</span>
                  </h4>
                  <p className="text-[11px] text-muted dark:text-stone-400">{hint}</p>
                </div>

                {selectedIds.length > 0 && (
                  <div className="space-y-2">
                    {selectedIds.map((id, idx) => {
                      const p = products.find((x) => x.id === id);
                      if (!p) return null;
                      const move = (dir) => {
                        const list = [...selectedIds];
                        [list[idx], list[idx + dir]] = [list[idx + dir], list[idx]];
                        setProductForm({ ...productForm, [key]: list });
                      };
                      return (
                        <div
                          key={id}
                          className="flex items-center gap-3 p-2 bg-stone-50/80 dark:bg-stone-800/50 rounded-xl border border-stone-200/90 dark:border-stone-700/80"
                        >
                          <img src={p.images?.[0]} alt="" className="w-10 h-10 rounded-lg object-cover border border-stone-200 dark:border-stone-700 shrink-0" />
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-stone-800 dark:text-stone-100 truncate">{p.title}</p>
                            <p className="text-[11px] text-stone-500">₹{p.basePrice}</p>
                          </div>
                          <button
                            type="button"
                            disabled={idx === 0}
                            onClick={() => move(-1)}
                            className="p-1 rounded text-stone-400 hover:text-ink disabled:opacity-30"
                            title="Move up"
                          >
                            <ChevronUp className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            disabled={idx === selectedIds.length - 1}
                            onClick={() => move(1)}
                            className="p-1 rounded text-stone-400 hover:text-ink disabled:opacity-30"
                            title="Move down"
                          >
                            <ChevronDown className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => confirmDelete({ title: 'Remove Product?', message: 'Remove this product from the list?', onConfirm: () => setProductForm({ ...productForm, [key]: selectedIds.filter((x) => x !== id) }) })}
                            className="p-1 rounded text-stone-400 hover:text-rose-600"
                            title="Remove"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}

                {available.length > 0 && (
                  <CustomSelect
                    value=""
                    onChange={(_, id) => id && setProductForm({ ...productForm, [key]: [...selectedIds, id] })}
                    options={available.map((p) => ({ value: p.id, label: p.title }))}
                    placeholder={`+ Add a product to ${title}`}
                  />
                )}
              </div>
            );
          })}
        </div>
      </SideDrawer>

      {/* Delete Confirmation Modal */}
      <ConfirmDialog
        isOpen={deleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
        title="Delete Item"
        message={`Are you sure you want to delete this item? It will be removed from storefront displays.`}
        onConfirm={() => {
          if (deleteTarget.item) {
            deleteProduct(deleteTarget.item.id);
            addToast({
              type: 'info',
              title: 'Item Deleted',
              message: `Deleted ${deleteTarget.item.title || 'item'}.`,
              onUndo: () => addProduct(deleteTarget.item)
            });
          }
        }}
      />
    </div>
  );
};
