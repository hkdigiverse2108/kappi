import React, { useState } from 'react';
import { Layers, Plus, Trash2, Edit, ExternalLink, BookOpen, Save } from 'lucide-react';
import { useAdminStore } from '../../store/adminStore';
import { SideDrawer } from '../../components/common/SideDrawer';
import { triggerKapeeCelebration } from '../../components/common/Confetti';
import { confirmDelete } from '../../../store/useConfirmStore';

export const GuidesPage = () => {
  const { addToast } = useAdminStore();
  const [guides, setGuides] = useState([
    {
      id: 'g-1',
      title: 'How to Restore White Sneakers Without Washing in Machine',
      category: 'Shoe Care',
      readTime: '3 min read',
      author: 'Karan Patel',
      image: 'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?auto=format&fit=crop&w=600&q=80',
      published: true
    },
    {
      id: 'g-2',
      title: 'Removing Tough Hard Water Stains from Bathroom Glass & Taps',
      category: 'Bathroom',
      readTime: '4 min read',
      author: 'Neha Mehta',
      image: '/sink_clean.jpg',
      published: true
    },
    {
      id: 'g-3',
      title: 'Cleaning Kitchen Exhaust Chimneys and Grease Traps Chemical-Free',
      category: 'Kitchen',
      readTime: '5 min read',
      author: 'Amit Shah',
      image: '/kitchen_clean.jpg',
      published: true
    }
  ]);

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [guideForm, setGuideForm] = useState({
    title: '',
    category: 'Home Tips',
    readTime: '3 min read',
    author: 'KAPEE Team',
    image: '/products/magic_eraser.jpg'
  });

  const handleSaveGuide = (e) => {
    e.preventDefault();
    if (!guideForm.title) return;
    setGuides([
      { id: `g-${Date.now()}`, ...guideForm, published: true },
      ...guides
    ]);
    triggerKapeeCelebration();
    addToast({ type: 'success', title: 'Guide Published', message: `Added article "${guideForm.title}".` });
    setDrawerOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-ink dark:text-stone-100">
            CMS: Cleaning Guides & Blog
          </h1>
          <p className="text-xs sm:text-sm text-muted dark:text-stone-400 mt-1">
            SEO-optimized cleaning tutorial articles and stain-removal how-to guides.
          </p>
        </div>

        <div className="flex items-center gap-2.5 self-start sm:self-auto">
          <button
            type="button"
            onClick={() => {
              triggerKapeeCelebration();
              addToast({
                type: 'success',
                title: 'Guides Saved',
                message: 'All published guides and blog articles saved successfully.'
              });
            }}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-emerald-deep hover:bg-emerald-800 text-white shadow-md hover:shadow-lg transition-all active:scale-95 whitespace-nowrap"
          >
            <Save className="w-4 h-4" />
            <span>Save Guides</span>
          </button>
          <button
            onClick={() => setDrawerOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-stone-100 hover:bg-stone-200 dark:bg-stone-800 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-200 border border-stone-200 dark:border-stone-700 transition-all active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Write Guide</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {guides.map((g) => (
          <div
            key={g.id}
            className="bg-white dark:bg-stone-900 rounded-2xl border overflow-hidden shadow-2xs space-y-3 flex flex-col justify-between"
          >
            <div>
              <div className="h-40 bg-stone-100 dark:bg-stone-800 relative">
                <img src={g.image} alt="" className="w-full h-full object-cover" />
                <span className="absolute top-2.5 left-2.5 px-2.5 py-0.5 rounded-full bg-emerald-deep text-white text-[10px] font-bold">
                  {g.category}
                </span>
              </div>
              <div className="p-4 space-y-1">
                <h3 className="font-serif font-bold text-sm text-ink dark:text-stone-100 line-clamp-2">
                  {g.title}
                </h3>
                <p className="text-[11px] text-stone-400">By {g.author} • {g.readTime}</p>
              </div>
            </div>

            <div className="px-4 py-2.5 border-t flex items-center justify-between text-xs">
              <span className="text-emerald-deep dark:text-emerald-300 font-semibold">Published</span>
              <button
                onClick={() =>
                  confirmDelete({
                    title: 'Delete Guide?',
                    message: `Delete the guide "${g.title}"?`,
                    onConfirm: () => {
                      setGuides(guides.filter((item) => item.id !== g.id));
                      addToast({ type: 'info', title: 'Guide Removed', message: 'Article deleted.' });
                    }
                  })
                }
                className="text-stone-400 hover:text-rose-600"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      <SideDrawer
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        title="Write Cleaning Guide"
        subtitle="Publish stain tutorial to storefront /guides directory"
        footer={
          <div className="flex justify-end gap-2">
            <button onClick={() => setDrawerOpen(false)} className="px-3 py-1.5 text-xs text-stone-500">Cancel</button>
            <button onClick={handleSaveGuide} className="px-4 py-1.5 text-xs font-semibold bg-emerald-deep text-white rounded-xl">Publish Guide</button>
          </div>
        }
      >
        <div className="space-y-4 text-xs">
          <div className="space-y-1">
            <label className="font-semibold text-stone-700 dark:text-stone-300">Guide Headline *</label>
            <input
              type="text"
              value={guideForm.title}
              onChange={(e) => setGuideForm({ ...guideForm, title: e.target.value })}
              className="w-full px-3 py-2 border rounded-xl"
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="font-semibold text-stone-700 dark:text-stone-300">Category Tag</label>
              <input
                type="text"
                value={guideForm.category}
                onChange={(e) => setGuideForm({ ...guideForm, category: e.target.value })}
                className="w-full px-3 py-2 border rounded-xl"
              />
            </div>
            <div className="space-y-1">
              <label className="font-semibold text-stone-700 dark:text-stone-300">Author</label>
              <input
                type="text"
                value={guideForm.author}
                onChange={(e) => setGuideForm({ ...guideForm, author: e.target.value })}
                className="w-full px-3 py-2 border rounded-xl"
              />
            </div>
          </div>
        </div>
      </SideDrawer>
    </div>
  );
};
