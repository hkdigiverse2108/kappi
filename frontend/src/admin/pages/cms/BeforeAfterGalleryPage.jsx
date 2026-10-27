import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Layers,
  Plus,
  Trash2,
  Edit,
  Sparkles,
  ArrowRight,
  Sliders,
  Save
} from 'lucide-react';
import { useAdminStore } from '../../store/adminStore';
import { SideDrawer } from '../../components/common/SideDrawer';
import { triggerKapeeCelebration } from '../../components/common/Confetti';

export const BeforeAfterGalleryPage = () => {
  const { addToast } = useAdminStore();

  const [pairs, setPairs] = useState([
    {
      id: 'pair-1',
      title: 'Tile Grout & Hard Water Bathroom Stains',
      surface: 'Ceramic & Tiles',
      before: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=800&q=80',
      after: 'https://images.unsplash.com/photo-1620626011761-996317b8d101?auto=format&fit=crop&w=800&q=80',
      caption: 'Bathroom tile yellowing and hard water stains wiped away in 30 seconds.'
    },
    {
      id: 'pair-2',
      title: 'Dirty White Sneaker Soles & Mud Scuffs',
      surface: 'Sneakers & Rubber',
      before: 'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?auto=format&fit=crop&w=800&q=80',
      after: 'https://images.unsplash.com/photo-1560769629-975ec94e6a86?auto=format&fit=crop&w=800&q=80',
      caption: 'Mud scuffs and asphalt stains lifted effortlessly from rubber midsoles.'
    },
    {
      id: 'pair-3',
      title: 'Kitchen Counter Tadka Oil Splatters',
      surface: 'Kitchen Granite',
      before: 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=800&q=80',
      after: 'https://images.unsplash.com/photo-1556909212-d5b604d0c90d?auto=format&fit=crop&w=800&q=80',
      caption: 'Burnt tadka oil splatter removed without leaving sticky film.'
    }
  ]);

  // Live Slider Demo
  const [sliderPosition, setSliderPosition] = useState(50);
  const [previewPair, setPreviewPair] = useState(pairs[0]);

  // Drawer
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [pairForm, setPairForm] = useState({
    title: '',
    surface: 'Ceramic & Tiles',
    before: '/sink_clean.jpg',
    after: '/kitchen_clean.jpg',
    caption: ''
  });

  const handleSavePair = (e) => {
    e.preventDefault();
    if (!pairForm.title) return;
    setPairs([
      { id: `pair-${Date.now()}`, ...pairForm },
      ...pairs
    ]);
    triggerKapeeCelebration();
    addToast({ type: 'success', title: 'Pair Created', message: 'Added Before/After comparison pair.' });
    setDrawerOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-ink dark:text-stone-100">
            CMS: Before & After Gallery
          </h1>
          <p className="text-xs sm:text-sm text-muted dark:text-stone-400 mt-1">
            Visual proof showcases powering the storefront interactive drag-to-reveal slider.
          </p>
        </div>

        <div className="flex items-center gap-2.5 self-start sm:self-auto">
          <button
            type="button"
            onClick={() => {
              triggerKapeeCelebration();
              addToast({
                type: 'success',
                title: 'Gallery Saved',
                message: 'Before & After comparison showcase saved successfully.'
              });
            }}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-emerald-deep hover:bg-emerald-800 text-white shadow-md hover:shadow-lg transition-all active:scale-95 whitespace-nowrap"
          >
            <Save className="w-4 h-4" />
            <span>Save Gallery</span>
          </button>
          <button
            onClick={() => setDrawerOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-stone-100 hover:bg-stone-200 dark:bg-stone-800 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-200 border border-stone-200 dark:border-stone-700 transition-all active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Add Pair</span>
          </button>
        </div>
      </div>


      {/* Pairs Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {pairs.map((pair) => (
          <div
            key={pair.id}
            onClick={() => setPreviewPair(pair)}
            className={`p-4 rounded-2xl border bg-white dark:bg-stone-900 shadow-2xs space-y-3 cursor-pointer transition-all ${
              previewPair.id === pair.id ? 'border-emerald-deep ring-2 ring-emerald-500/20' : 'hover:border-stone-300'
            }`}
          >
            <div className="grid grid-cols-2 gap-2 h-28 rounded-xl overflow-hidden">
              <img src={pair.before} alt="" className="w-full h-full object-cover" />
              <img src={pair.after} alt="" className="w-full h-full object-cover" />
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-emerald-deep">{pair.surface}</span>
              <h4 className="font-bold text-xs text-ink dark:text-stone-100">{pair.title}</h4>
              <p className="text-[11px] text-stone-500 line-clamp-1">{pair.caption}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Drawer */}
      <SideDrawer
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        title="Add Comparison Pair"
        subtitle="Upload before and after images with surface tags"
        footer={
          <div className="flex justify-end gap-2">
            <button onClick={() => setDrawerOpen(false)} className="px-3 py-1.5 text-xs text-stone-500">Cancel</button>
            <button onClick={handleSavePair} className="px-4 py-1.5 text-xs font-semibold bg-emerald-deep text-white rounded-xl">Save Pair</button>
          </div>
        }
      >
        <div className="space-y-4 text-xs">
          <div className="space-y-1">
            <label className="font-semibold text-stone-700">Headline Title *</label>
            <input
              type="text"
              value={pairForm.title}
              onChange={(e) => setPairForm({ ...pairForm, title: e.target.value })}
              className="w-full px-3 py-2 border rounded-xl"
            />
          </div>
          <div className="space-y-1">
            <label className="font-semibold text-stone-700">Surface Category</label>
            <input
              type="text"
              value={pairForm.surface}
              onChange={(e) => setPairForm({ ...pairForm, surface: e.target.value })}
              className="w-full px-3 py-2 border rounded-xl"
            />
          </div>
          <div className="space-y-1">
            <label className="font-semibold text-stone-700">Description Caption</label>
            <textarea
              value={pairForm.caption}
              onChange={(e) => setPairForm({ ...pairForm, caption: e.target.value })}
              rows={2}
              className="w-full px-3 py-2 border rounded-xl"
            />
          </div>
        </div>
      </SideDrawer>
    </div>
  );
};
