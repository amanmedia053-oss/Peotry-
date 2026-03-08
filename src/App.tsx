/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Home, 
  BookOpen, 
  Brain, 
  Feather, 
  Wind, 
  Heart, 
  Pin, 
  History, 
  Smartphone, 
  Palette, 
  Languages, 
  Shield, 
  Info, 
  Settings, 
  Search, 
  ChevronRight, 
  ChevronLeft, 
  Copy, 
  Share2, 
  MessageCircle, 
  Facebook, 
  MoreVertical, 
  X, 
  Menu,
  Moon,
  Sun,
  Plus,
  Minus,
  ArrowRight,
  LogOut,
  Image as ImageIcon,
  Sparkles,
  Download,
  RefreshCw
} from 'lucide-react';
import { GoogleGenAI } from "@google/genai";
import { App as CapApp } from '@capacitor/app';
import { StatusBar, Style } from '@capacitor/status-bar';
import { Capacitor } from '@capacitor/core';
import { 
  Poem, 
  AppState, 
  Language, 
  AppColor, 
  ListDesign, 
  translations, 
  Category 
} from './types';

const CATEGORY_FILES: Record<Category, string> = {
  'لارښود': '/guide.json',
  'ارواپوهنه': '/psychology.json',
  'شعرونه': '/poetry.json',
  'ستړي آهونه': '/sad_sighs.json',
};

const COLORS: Record<AppColor, string> = {
  green: 'from-emerald-500 to-teal-700',
  blue: 'from-blue-500 to-indigo-700',
  purple: 'from-purple-500 to-violet-700',
  red: 'from-red-500 to-rose-700',
  orange: 'from-orange-500 to-amber-700',
  teal: 'from-teal-400 to-cyan-600',
  pink: 'from-pink-500 to-fuchsia-700',
  gold: 'from-yellow-400 to-orange-500',
  gray: 'from-gray-500 to-slate-700',
  black: 'from-gray-800 to-black',
};

const COLOR_HEX: Record<AppColor, string> = {
  green: '#10b981',
  blue: '#3b82f6',
  purple: '#a855f7',
  red: '#ef4444',
  orange: '#f97316',
  teal: '#14b8a6',
  pink: '#ec4899',
  gold: '#eab308',
  gray: '#6b7280',
  black: '#1f2937',
};

export default function App() {
  const [state, setState] = useState<AppState>(() => {
    const saved = localStorage.getItem('pashto_poetry_state');
    if (saved) return JSON.parse(saved);
    return {
      language: 'ps',
      themeColor: 'green',
      isDarkMode: false,
      favorites: [],
      pinned: [],
      history: [],
      onboardingComplete: false,
      listDesign: 'card',
    };
  });

  const [allPoems, setAllPoems] = useState<Poem[]>([]);
  const [currentScreen, setCurrentScreen] = useState<'splash' | 'onboarding' | 'home' | 'category' | 'detail' | 'swipe' | 'favorites' | 'pinned' | 'history' | 'settings' | 'about' | 'ai-image'>('splash');
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [selectedPoem, setSelectedPoem] = useState<Poem | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isExitModalOpen, setIsExitModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Capacitor Integration
  useEffect(() => {
    if (Capacitor.isNativePlatform()) {
      StatusBar.setOverlaysWebView({ overlay: true });
      StatusBar.setStyle({ style: state.isDarkMode ? Style.Dark : Style.Light });
    }
  }, [state.isDarkMode]);

  useEffect(() => {
    if (!Capacitor.isNativePlatform()) return;

    const backButtonListener = CapApp.addListener('backButton', () => {
      if (isSidebarOpen) {
        setIsSidebarOpen(false);
      } else if (isExitModalOpen) {
        setIsExitModalOpen(false);
      } else if (currentScreen === 'detail') {
        setCurrentScreen('category');
      } else if (currentScreen === 'onboarding') {
        // Do nothing or handle appropriately
      } else if (currentScreen !== 'home') {
        setCurrentScreen('home');
      } else {
        setIsExitModalOpen(true);
      }
    });

    return () => {
      backButtonListener.then(h => h.remove());
    };
  }, [isSidebarOpen, isExitModalOpen, currentScreen]);

  // Load all data on mount
  useEffect(() => {
    const loadData = async () => {
      try {
        const categories = Object.keys(CATEGORY_FILES) as Category[];
        const allData: Poem[] = [];
        
        for (const cat of categories) {
          const res = await fetch(CATEGORY_FILES[cat]);
          const data = await res.json();
          const mapped = data.map((item: any, index: number) => ({
            id: `${cat}-${index}`,
            category: cat,
            text: item.text,
            title: item.text.split('\n')[0].substring(0, 30) + '...' // Generate title from first line
          }));
          allData.push(...mapped);
        }
        setAllPoems(allData);
      } catch (err) {
        console.error("Failed to load poems:", err);
      }
    };
    loadData();
  }, []);

  useEffect(() => {
    localStorage.setItem('pashto_poetry_state', JSON.stringify(state));
  }, [state]);

  useEffect(() => {
    if (currentScreen === 'splash') {
      const timer = setTimeout(() => {
        setCurrentScreen(state.onboardingComplete ? 'home' : 'onboarding');
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [currentScreen, state.onboardingComplete]);

  const t = translations[state.language];

  const updateState = (updates: Partial<AppState>) => {
    setState(prev => ({ ...prev, ...updates }));
  };

  const toggleFavorite = (id: string) => {
    const favorites = state.favorites.includes(id)
      ? state.favorites.filter(fid => fid !== id)
      : [...state.favorites, id];
    updateState({ favorites });
  };

  const togglePin = (id: string) => {
    const pinned = state.pinned.includes(id)
      ? state.pinned.filter(pid => pid !== id)
      : [...state.pinned, id];
    updateState({ pinned });
  };

  const addToHistory = (id: string) => {
    if (!state.history.includes(id)) {
      updateState({ history: [id, ...state.history].slice(0, 50) });
    }
  };

  const handlePoemClick = (poem: Poem) => {
    setSelectedPoem(poem);
    addToHistory(poem.id);
    setCurrentScreen('detail');
  };

  const filteredPoems = useMemo(() => {
    let list = allPoems;
    if (selectedCategory) {
      list = list.filter(p => p.category === selectedCategory);
    }
    if (searchQuery) {
      list = list.filter(p => 
        p.title?.toLowerCase().includes(searchQuery.toLowerCase()) || 
        p.text.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    return list;
  }, [allPoems, selectedCategory, searchQuery]);

  const dailyPoem = useMemo(() => allPoems.length > 0 ? allPoems[Math.floor(Math.random() * allPoems.length)] : null, [allPoems]);

  const containerStyle = `min-h-screen ${state.isDarkMode ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'} font-sans transition-colors duration-300 overflow-x-hidden`;

  // --- Screens ---

  if (currentScreen === 'splash') {
    return (
      <div className={`flex flex-col items-center justify-center h-screen bg-gradient-to-br ${COLORS[state.themeColor]} text-white`}>
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ duration: 1, type: 'spring' }}
          className="bg-white/20 p-8 rounded-full backdrop-blur-md mb-6"
        >
          <Feather size={80} />
        </motion.div>
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="text-4xl font-bold tracking-wider"
        >
          {t.appName}
        </motion.h1>
        <motion.div
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ repeat: Infinity, duration: 2 }}
          className="mt-12 w-12 h-1 bg-white/50 rounded-full overflow-hidden"
        >
          <motion.div
            animate={{ x: [-50, 50] }}
            transition={{ repeat: Infinity, duration: 1.5, ease: 'linear' }}
            className="w-full h-full bg-white"
          />
        </motion.div>
      </div>
    );
  }

  if (currentScreen === 'onboarding') {
    return <OnboardingScreen t={t} themeColor={state.themeColor} onComplete={() => {
      updateState({ onboardingComplete: true });
      setCurrentScreen('home');
    }} />;
  }

  return (
    <div className={containerStyle} dir={state.language === 'en' ? 'ltr' : 'rtl'}>
      {/* Safe Area Top Spacer for Native */}
      <div className="h-[env(safe-area-inset-top)] bg-transparent w-full" />
      
      {/* Header */}
      <header className={`sticky top-[env(safe-area-inset-top)] z-40 backdrop-blur-md border-b ${state.isDarkMode ? 'bg-gray-900/80 border-gray-800' : 'bg-white/80 border-gray-200'} px-4 py-3 flex items-center justify-between`}>
        <button onClick={() => setIsSidebarOpen(true)} className="p-2 hover:bg-black/5 rounded-full transition-colors">
          <Menu size={24} />
        </button>
        <h1 className="text-xl font-bold bg-gradient-to-r from-emerald-500 to-teal-600 bg-clip-text text-transparent">
          {currentScreen === 'home' ? t.appName : 
           currentScreen === 'category' ? selectedCategory :
           currentScreen === 'favorites' ? t.favorites :
           currentScreen === 'pinned' ? t.pinned :
           currentScreen === 'history' ? t.history :
           currentScreen === 'settings' ? t.settings :
           currentScreen === 'about' ? t.aboutApp : 
           currentScreen === 'ai-image' ? 'AI Image Generator' : t.appName}
        </h1>
        <div className="flex items-center gap-2">
          <button 
            onClick={() => {
              if (currentScreen !== 'category') {
                setSelectedCategory(null);
                setCurrentScreen('category');
              }
            }} 
            className="p-2 hover:bg-black/5 rounded-full transition-colors"
          >
            <Search size={20} />
          </button>
          {currentScreen === 'home' && (
            <button onClick={() => setCurrentScreen('settings')} className="p-2 hover:bg-black/5 rounded-full transition-colors">
              <Settings size={20} />
            </button>
          )}
          {currentScreen !== 'home' && (
            <button onClick={() => setCurrentScreen('home')} className="p-2 hover:bg-black/5 rounded-full transition-colors">
              <Home size={20} />
            </button>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="pb-[calc(6rem+env(safe-area-inset-bottom))] p-4 max-w-2xl mx-auto">
        <AnimatePresence mode="wait">
          {currentScreen === 'home' && (
            <motion.div key="home" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              {/* Daily Writing */}
              {dailyPoem && (
                <section className="mb-8">
                  <h2 className="text-sm font-semibold opacity-60 mb-3 flex items-center gap-2">
                    <Smartphone size={16} /> {t.dailyWriting}
                  </h2>
                  <div 
                    onClick={() => handlePoemClick(dailyPoem)}
                    className={`p-6 rounded-3xl bg-gradient-to-br ${COLORS[state.themeColor]} text-white shadow-xl cursor-pointer transform transition-transform active:scale-95`}
                  >
                    <p className="text-xs opacity-80 mb-2">{new Date().toLocaleDateString(state.language === 'ps' ? 'ps-AF' : state.language === 'dr' ? 'fa-AF' : 'en-US')}</p>
                    <h3 className="text-2xl font-bold mb-3">{dailyPoem.title}</h3>
                    <p className="line-clamp-3 opacity-90 leading-relaxed italic">"{dailyPoem.text}"</p>
                  </div>
                </section>
              )}

              {/* Categories */}
              <section className="mb-8">
                <h2 className="text-sm font-semibold opacity-60 mb-4">{t.categories}</h2>
                <div className="grid grid-cols-2 gap-4">
                  <CategoryCard icon={<BookOpen />} label={t.guide} color="bg-emerald-500" onClick={() => { setSelectedCategory('لارښود'); setCurrentScreen('category'); }} />
                  <CategoryCard icon={<Brain />} label={t.psychology} color="bg-blue-500" onClick={() => { setSelectedCategory('ارواپوهنه'); setCurrentScreen('category'); }} />
                  <CategoryCard icon={<Feather />} label={t.poetry} color="bg-purple-500" onClick={() => { setSelectedCategory('شعرونه'); setCurrentScreen('category'); }} />
                  <CategoryCard icon={<Wind />} label={t.sadSighs} color="bg-rose-500" onClick={() => { setSelectedCategory('ستړي آهونه'); setCurrentScreen('category'); }} />
                </div>
              </section>

              {/* Quick Actions */}
              <section className="grid grid-cols-3 gap-4">
                <QuickAction icon={<Smartphone />} label="Swipe" onClick={() => setCurrentScreen('swipe')} />
                <QuickAction icon={<Heart />} label="Favs" onClick={() => setCurrentScreen('favorites')} />
                <QuickAction icon={<Pin />} label="Pins" onClick={() => setCurrentScreen('pinned')} />
              </section>
            </motion.div>
          )}

          {currentScreen === 'category' && (
            <motion.div key="category" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <div className="mb-6">
                <div className={`relative group transition-all duration-300 focus-within:scale-[1.02]`}>
                  <Search className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors duration-300 ${searchQuery ? 'text-emerald-500' : 'opacity-40'}`} size={20} />
                  <input 
                    type="text" 
                    placeholder={t.search} 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className={`w-full pl-12 pr-12 py-4 rounded-3xl border-2 transition-all duration-300 ${state.isDarkMode ? 'bg-gray-800 border-gray-700 focus:border-emerald-500/50' : 'bg-white border-gray-100 focus:border-emerald-500/50'} focus:outline-none shadow-sm focus:shadow-emerald-500/10`}
                  />
                  {searchQuery && (
                    <button 
                      onClick={() => setSearchQuery('')}
                      className="absolute right-4 top-1/2 -translate-y-1/2 p-1 hover:bg-black/5 rounded-full transition-colors"
                    >
                      <X size={16} className="opacity-40" />
                    </button>
                  )}
                </div>
              </div>
              
              <div className="flex gap-2 mb-6 overflow-x-auto pb-2 no-scrollbar">
                {(['simple', 'card', 'gradient', 'minimal', 'image'] as ListDesign[]).map(d => (
                  <button 
                    key={d}
                    onClick={() => updateState({ listDesign: d })}
                    className={`px-4 py-1.5 rounded-full text-xs whitespace-nowrap transition-colors ${state.listDesign === d ? `bg-gradient-to-r ${COLORS[state.themeColor]} text-white` : 'bg-black/5'}`}
                  >
                    {d.toUpperCase()}
                  </button>
                ))}
              </div>

              <div className="space-y-4">
                {filteredPoems.map(poem => (
                  <PoemListItem 
                    key={poem.id} 
                    poem={poem} 
                    design={state.listDesign} 
                    themeColor={state.themeColor}
                    isDarkMode={state.isDarkMode}
                    onClick={() => handlePoemClick(poem)} 
                  />
                ))}
              </div>
            </motion.div>
          )}

          {currentScreen === 'detail' && selectedPoem && (
            <DetailScreen 
              poem={selectedPoem} 
              t={t} 
              state={state} 
              toggleFavorite={toggleFavorite} 
              togglePin={togglePin} 
              onBack={() => setCurrentScreen('category')} 
            />
          )}

          {currentScreen === 'swipe' && (
            <SwipeScreen 
              poems={allPoems} 
              t={t} 
              state={state} 
              toggleFavorite={toggleFavorite} 
              togglePin={togglePin} 
              onClose={() => setCurrentScreen('home')} 
            />
          )}

          {currentScreen === 'favorites' && (
            <PoemListScreen 
              title={t.favorites} 
              poems={allPoems.filter(p => state.favorites.includes(p.id))} 
              state={state} 
              onPoemClick={handlePoemClick} 
            />
          )}

          {currentScreen === 'pinned' && (
            <PoemListScreen 
              title={t.pinned} 
              poems={allPoems.filter(p => state.pinned.includes(p.id))} 
              state={state} 
              onPoemClick={handlePoemClick} 
            />
          )}

          {currentScreen === 'history' && (
            <PoemListScreen 
              title={t.history} 
              poems={allPoems.filter(p => state.history.includes(p.id))} 
              state={state} 
              onPoemClick={handlePoemClick} 
            />
          )}

          {currentScreen === 'settings' && (
            <SettingsScreen 
              state={state} 
              updateState={updateState} 
              t={t} 
            />
          )}

          {currentScreen === 'about' && (
            <AboutScreen t={t} themeColor={state.themeColor} isDarkMode={state.isDarkMode} />
          )}

          {currentScreen === 'ai-image' && (
            <AIImageGenerator t={t} themeColor={state.themeColor} isDarkMode={state.isDarkMode} />
          )}
        </AnimatePresence>
      </main>

      {/* Bottom Navigation */}
      <nav className={`fixed bottom-0 left-0 right-0 z-40 border-t ${state.isDarkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'} px-6 pt-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] flex items-center justify-between`}>
        <NavButton active={currentScreen === 'home'} icon={<Home />} label={t.home} onClick={() => setCurrentScreen('home')} />
        <NavButton active={currentScreen === 'swipe'} icon={<Smartphone />} label="Swipe" onClick={() => setCurrentScreen('swipe')} />
        <NavButton active={currentScreen === 'favorites'} icon={<Heart />} label="Favs" onClick={() => setCurrentScreen('favorites')} />
        <NavButton active={currentScreen === 'settings'} icon={<Settings />} label="Set" onClick={() => setCurrentScreen('settings')} />
      </nav>

      {/* Sidebar / Drawer */}
      <AnimatePresence>
        {isSidebarOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }} 
              onClick={() => setIsSidebarOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
            />
            <motion.aside
              initial={{ x: state.language === 'en' ? -300 : 300 }}
              animate={{ x: 0 }}
              exit={{ x: state.language === 'en' ? -300 : 300 }}
              className={`fixed top-0 bottom-0 ${state.language === 'en' ? 'left-0' : 'right-0'} w-72 z-50 ${state.isDarkMode ? 'bg-gray-900' : 'bg-white'} shadow-2xl flex flex-col`}
            >
              <div className={`p-8 pt-[calc(2rem+env(safe-area-inset-top))] bg-gradient-to-br ${COLORS[state.themeColor]} text-white`}>
                <Feather size={48} className="mb-4" />
                <h2 className="text-2xl font-bold">{t.appName}</h2>
                <p className="text-xs opacity-70 mt-1">Version 1.0.0</p>
              </div>
              <div className="flex-1 overflow-y-auto p-4 space-y-1">
                <SidebarItem icon={<Home />} label={t.home} onClick={() => { setCurrentScreen('home'); setIsSidebarOpen(false); }} />
                <div className="h-px bg-black/5 my-2" />
                <SidebarItem icon={<BookOpen />} label={t.guide} onClick={() => { setSelectedCategory('لارښود'); setCurrentScreen('category'); setIsSidebarOpen(false); }} />
                <SidebarItem icon={<Brain />} label={t.psychology} onClick={() => { setSelectedCategory('ارواپوهنه'); setCurrentScreen('category'); setIsSidebarOpen(false); }} />
                <SidebarItem icon={<Feather />} label={t.poetry} onClick={() => { setSelectedCategory('شعرونه'); setCurrentScreen('category'); setIsSidebarOpen(false); }} />
                <SidebarItem icon={<Wind />} label={t.sadSighs} onClick={() => { setSelectedCategory('ستړي آهونه'); setCurrentScreen('category'); setIsSidebarOpen(false); }} />
                <div className="h-px bg-black/5 my-2" />
                <SidebarItem icon={<Heart />} label={t.favorites} onClick={() => { setCurrentScreen('favorites'); setIsSidebarOpen(false); }} />
                <SidebarItem icon={<Pin />} label={t.pinned} onClick={() => { setCurrentScreen('pinned'); setIsSidebarOpen(false); }} />
                <SidebarItem icon={<History />} label={t.history} onClick={() => { setCurrentScreen('history'); setIsSidebarOpen(false); }} />
                <SidebarItem icon={<Smartphone />} label={t.swipeReading} onClick={() => { setCurrentScreen('swipe'); setIsSidebarOpen(false); }} />
                <SidebarItem icon={<Sparkles />} label="AI Image Generator" onClick={() => { setCurrentScreen('ai-image'); setIsSidebarOpen(false); }} />
                <div className="h-px bg-black/5 my-2" />
                <SidebarItem icon={<Palette />} label={t.changeColor} onClick={() => { setCurrentScreen('settings'); setIsSidebarOpen(false); }} />
                <SidebarItem icon={<Languages />} label={t.changeLanguage} onClick={() => { setCurrentScreen('settings'); setIsSidebarOpen(false); }} />
                <SidebarItem icon={<Shield />} label={t.privacyPolicy} onClick={() => { setIsSidebarOpen(false); }} />
                <SidebarItem icon={<Info />} label={t.aboutApp} onClick={() => { setCurrentScreen('about'); setIsSidebarOpen(false); }} />
                <SidebarItem icon={<LogOut />} label="Exit" onClick={() => { setIsExitModalOpen(true); setIsSidebarOpen(false); }} />
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Exit Bottom Sheet */}
      <AnimatePresence>
        {isExitModalOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsExitModalOpen(false)} className="fixed inset-0 bg-black/40 z-50" />
            <motion.div 
              initial={{ y: 300 }} 
              animate={{ y: 0 }} 
              exit={{ y: 300 }}
              className={`fixed bottom-0 left-0 right-0 z-50 ${state.isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-t-3xl p-8 shadow-2xl`}
            >
              <div className="w-12 h-1.5 bg-black/10 rounded-full mx-auto mb-6" />
              <h3 className="text-xl font-bold text-center mb-8">{t.exitTitle}</h3>
              <div className="flex gap-4">
                <button 
                  onClick={() => window.close()}
                  className={`flex-1 py-4 rounded-2xl bg-rose-500 text-white font-bold transform active:scale-95 transition-transform`}
                >
                  {t.yes}
                </button>
                <button 
                  onClick={() => setIsExitModalOpen(false)}
                  className={`flex-1 py-4 rounded-2xl ${state.isDarkMode ? 'bg-gray-700' : 'bg-gray-100'} font-bold transform active:scale-95 transition-transform`}
                >
                  {t.no}
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

// --- Sub-components ---

function OnboardingScreen({ t, themeColor, onComplete }: { t: any, themeColor: AppColor, onComplete: () => void }) {
  const [page, setPage] = useState(0);
  const pages = [
    { title: t.onboarding1, icon: <Feather size={100} />, desc: "Welcome to the world of Pashto literature." },
    { title: t.onboarding2, icon: <BookOpen size={100} />, desc: "Read beautiful poems and insightful writings." },
    { title: t.onboarding3, icon: <Pin size={100} />, desc: "Save your favorites and pin important pieces." },
    { title: t.onboarding4, icon: <Smartphone size={100} />, desc: "Experience immersive reading with swipe system." },
  ];

  return (
    <div className={`h-screen bg-gradient-to-br ${COLORS[themeColor]} text-white flex flex-col p-8`}>
      <div className="flex justify-end">
        <button onClick={onComplete} className="px-4 py-2 bg-white/20 rounded-full text-sm backdrop-blur-md">{t.skip}</button>
      </div>
      <div className="flex-1 flex flex-col items-center justify-center text-center">
        <AnimatePresence mode="wait">
          <motion.div
            key={page}
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: -20 }}
            className="flex flex-col items-center"
          >
            <div className="mb-12 p-10 bg-white/10 rounded-full backdrop-blur-xl shadow-2xl">
              {pages[page].icon}
            </div>
            <h2 className="text-3xl font-bold mb-4">{pages[page].title}</h2>
            <p className="opacity-80 max-w-xs">{pages[page].desc}</p>
          </motion.div>
        </AnimatePresence>
      </div>
      <div className="flex items-center justify-between">
        <div className="flex gap-2">
          {pages.map((_, i) => (
            <div key={i} className={`h-2 rounded-full transition-all duration-300 ${i === page ? 'w-8 bg-white' : 'w-2 bg-white/30'}`} />
          ))}
        </div>
        <button 
          onClick={() => page < 3 ? setPage(page + 1) : onComplete()}
          className="px-8 py-4 bg-white text-emerald-700 rounded-2xl font-bold shadow-xl flex items-center gap-2 transform active:scale-95 transition-transform"
        >
          {page === 3 ? t.start : t.next}
          <ArrowRight size={20} />
        </button>
      </div>
    </div>
  );
}

function CategoryCard({ icon, label, color, onClick }: { icon: React.ReactNode, label: string, color: string, onClick: () => void }) {
  return (
    <motion.div 
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className={`${color} p-6 rounded-3xl text-white shadow-lg cursor-pointer flex flex-col items-center justify-center gap-3 aspect-square`}
    >
      <div className="p-3 bg-white/20 rounded-2xl backdrop-blur-md">
        {icon}
      </div>
      <span className="font-bold text-lg">{label}</span>
    </motion.div>
  );
}

function QuickAction({ icon, label, onClick }: { icon: React.ReactNode, label: string, onClick: () => void }) {
  return (
    <button 
      onClick={onClick}
      className="flex flex-col items-center gap-2 p-4 rounded-2xl bg-black/5 hover:bg-black/10 transition-colors"
    >
      <div className="text-emerald-500">{icon}</div>
      <span className="text-xs font-medium opacity-70">{label}</span>
    </button>
  );
}

interface PoemListItemProps {
  poem: Poem;
  design: ListDesign;
  themeColor: AppColor;
  isDarkMode: boolean;
  onClick: () => void;
}

const PoemListItem: React.FC<PoemListItemProps> = ({ poem, design, themeColor, isDarkMode, onClick }) => {
  if (design === 'simple') {
    return (
      <div onClick={onClick} className={`p-4 border-b ${isDarkMode ? 'border-gray-800' : 'border-gray-100'} flex items-center justify-between cursor-pointer active:bg-black/5`}>
        <div>
          <h4 className="font-bold">{poem.title}</h4>
        </div>
        <ChevronRight size={18} className="opacity-30" />
      </div>
    );
  }

  if (design === 'card') {
    return (
      <div onClick={onClick} className={`p-5 rounded-2xl shadow-sm border ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} cursor-pointer active:scale-[0.98] transition-transform`}>
        <h4 className="text-lg font-bold mb-1">{poem.title}</h4>
        <p className="text-sm opacity-70 line-clamp-2 leading-relaxed mb-3">{poem.text}</p>
        <div className="flex items-center justify-end">
          <span className={`text-[10px] px-2 py-0.5 rounded-full ${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>{poem.category}</span>
        </div>
      </div>
    );
  }

  if (design === 'gradient') {
    return (
      <div onClick={onClick} className={`p-5 rounded-2xl bg-gradient-to-r ${COLORS[themeColor]} text-white shadow-md cursor-pointer active:scale-[0.98] transition-transform`}>
        <h4 className="text-lg font-bold mb-1">{poem.title}</h4>
        <p className="text-sm opacity-90 line-clamp-2 italic mb-3">"{poem.text}"</p>
      </div>
    );
  }

  if (design === 'minimal') {
    return (
      <div onClick={onClick} className="py-4 flex gap-4 cursor-pointer group">
        <div className={`w-1 h-12 rounded-full bg-gradient-to-b ${COLORS[themeColor]} opacity-40 group-hover:opacity-100 transition-opacity`} />
        <div>
          <h4 className="font-bold text-lg">{poem.title}</h4>
          <p className="text-xs opacity-50">{poem.category}</p>
        </div>
      </div>
    );
  }

  return ( // image style (using seed)
    <div onClick={onClick} className="relative h-48 rounded-3xl overflow-hidden shadow-lg cursor-pointer group active:scale-[0.98] transition-transform">
      <img 
        src={`https://picsum.photos/seed/${poem.id}/400/300`} 
        alt="" 
        className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        referrerPolicy="no-referrer"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
      <div className="absolute bottom-0 left-0 right-0 p-5 text-white">
        <h4 className="text-xl font-bold">{poem.title}</h4>
      </div>
    </div>
  );
}

function DetailScreen({ poem, t, state, toggleFavorite, togglePin, onBack }: { poem: Poem, t: any, state: AppState, toggleFavorite: (id: string) => void, togglePin: (id: string) => void, onBack: () => void }) {
  const [textSize, setTextSize] = useState(20);

  const handleCopy = () => {
    navigator.clipboard.writeText(`${poem.title}\n\n${poem.text}`);
    alert('Copied to clipboard!');
  };

  const handleShare = (platform: string) => {
    const text = `${poem.title}\n\n${poem.text}`;
    const url = window.location.origin;
    
    if (platform === 'whatsapp') {
      window.open(`https://wa.me/?text=${encodeURIComponent(text)}`);
    } else if (platform === 'facebook') {
      window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}&quote=${encodeURIComponent(text)}`);
    } else {
      if (navigator.share) {
        navigator.share({ title: poem.title, text, url });
      } else {
        handleCopy();
      }
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="pb-12">
      <div className="h-[env(safe-area-inset-top)] w-full mb-4" />
      <div className="flex items-center justify-between mb-8">
        <button onClick={onBack} className="p-2 bg-black/5 rounded-full"><ChevronLeft size={20} /></button>
        <div className="flex gap-2">
          <button onClick={() => togglePin(poem.id)} className={`p-2 rounded-full ${state.pinned.includes(poem.id) ? 'bg-emerald-500 text-white' : 'bg-black/5'}`}><Pin size={20} /></button>
          <button onClick={() => toggleFavorite(poem.id)} className={`p-2 rounded-full ${state.favorites.includes(poem.id) ? 'bg-rose-500 text-white' : 'bg-black/5'}`}><Heart size={20} /></button>
        </div>
      </div>

      <div className={`p-8 rounded-[40px] ${state.isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow-xl mb-8`}>
        <div className="text-center mb-8">
          <span className={`text-[10px] uppercase tracking-widest font-bold px-3 py-1 rounded-full bg-gradient-to-r ${COLORS[state.themeColor]} text-white mb-4 inline-block`}>
            {poem.category}
          </span>
          <h2 className="text-3xl font-bold mb-2">{poem.title}</h2>
        </div>
        
        <div className="h-px bg-black/5 mb-8" />

        <div className="flex justify-center gap-4 mb-8">
          <button onClick={() => setTextSize(s => Math.min(s + 2, 40))} className="p-2 bg-black/5 rounded-lg"><Plus size={16} /></button>
          <span className="text-xs flex items-center opacity-40">Text Size</span>
          <button onClick={() => setTextSize(s => Math.max(s - 2, 12))} className="p-2 bg-black/5 rounded-lg"><Minus size={16} /></button>
        </div>

        <p 
          className="leading-loose text-center whitespace-pre-wrap italic"
          style={{ fontSize: `${textSize}px` }}
        >
          {poem.text}
        </p>

        <div className="mt-12 flex justify-center">
          <div className="w-12 h-1 bg-black/10 rounded-full" />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <ActionButton icon={<Copy />} label={t.copy} onClick={handleCopy} />
        <ActionButton icon={<Share2 />} label={t.share} onClick={() => handleShare('other')} />
        <ActionButton icon={<MessageCircle />} label={t.whatsapp} color="bg-green-500" onClick={() => handleShare('whatsapp')} />
        <ActionButton icon={<Facebook />} label={t.facebook} color="bg-blue-600" onClick={() => handleShare('facebook')} />
      </div>
    </motion.div>
  );
}

function ActionButton({ icon, label, color, onClick }: { icon: React.ReactNode, label: string, color?: string, onClick: () => void }) {
  return (
    <button 
      onClick={onClick}
      className={`flex items-center justify-center gap-3 py-4 rounded-2xl ${color || 'bg-black/5'} ${color ? 'text-white' : ''} font-bold transform active:scale-95 transition-transform`}
    >
      {icon}
      <span>{label}</span>
    </button>
  );
}

function SwipeScreen({ poems, t, state, toggleFavorite, togglePin, onClose }: { poems: Poem[], t: any, state: AppState, toggleFavorite: (id: string) => void, togglePin: (id: string) => void, onClose: () => void }) {
  const [index, setIndex] = useState(0);
  const [textSize, setTextSize] = useState(24);
  const [showMore, setShowMore] = useState(false);
  const randomPoems = useMemo(() => [...poems].sort(() => Math.random() - 0.5), [poems]);
  const poem = randomPoems[index];

  const bgGradients = [
    'from-emerald-600 to-teal-900',
    'from-blue-600 to-indigo-900',
    'from-purple-600 to-violet-900',
    'from-rose-600 to-pink-900',
    'from-amber-600 to-orange-900',
    'from-slate-700 to-gray-900',
  ];
  const bg = bgGradients[index % bgGradients.length];

  return (
    <div className={`fixed inset-0 z-50 bg-gradient-to-br ${bg} text-white flex flex-col`}>
      <div className="h-[env(safe-area-inset-top)] w-full" />
      <div className="p-6 flex items-center justify-between">
        <button onClick={onClose} className="p-2 bg-white/20 rounded-full backdrop-blur-md"><X size={24} /></button>
        <div className="flex items-center gap-2 bg-white/20 px-4 py-1.5 rounded-full backdrop-blur-md">
          <Smartphone size={16} />
          <span className="text-xs font-bold">Swipe Mode</span>
        </div>
      </div>

      <div className="flex-1 relative overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={index}
            initial={{ y: 300, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -300, opacity: 0 }}
            drag="y"
            dragConstraints={{ top: 0, bottom: 0 }}
            onDragEnd={(_, info) => {
              if (info.offset.y < -100) setIndex((index + 1) % randomPoems.length);
              if (info.offset.y > 100) setIndex((index - 1 + randomPoems.length) % randomPoems.length);
            }}
            className="absolute inset-0 flex flex-col items-center justify-center p-12 text-center"
          >
            <span className="text-xs uppercase tracking-[0.3em] opacity-60 mb-6">{poem.category}</span>
            <h2 className="text-4xl font-bold mb-8">{poem.title}</h2>
            <p 
              className="leading-relaxed italic whitespace-pre-wrap"
              style={{ fontSize: `${textSize}px` }}
            >
              "{poem.text}"
            </p>
          </motion.div>
        </AnimatePresence>

        {/* Right Side Buttons */}
        <div className="absolute right-6 bottom-32 flex flex-col gap-6">
          <SwipeAction icon={<Heart fill={state.favorites.includes(poem.id) ? 'currentColor' : 'none'} />} onClick={() => toggleFavorite(poem.id)} active={state.favorites.includes(poem.id)} activeColor="text-rose-500" />
          <SwipeAction icon={<Pin fill={state.pinned.includes(poem.id) ? 'currentColor' : 'none'} />} onClick={() => togglePin(poem.id)} active={state.pinned.includes(poem.id)} activeColor="text-emerald-500" />
          <SwipeAction icon={<Copy />} onClick={() => { navigator.clipboard.writeText(poem.text); alert('Copied!'); }} />
          <SwipeAction icon={<Share2 />} onClick={() => { if (navigator.share) navigator.share({ text: poem.text }); }} />
          <SwipeAction icon={<MoreVertical />} onClick={() => setShowMore(true)} />
        </div>
      </div>

      <div className="p-12 text-center opacity-40 text-xs animate-bounce">
        Swipe up for next
      </div>

      {/* More Options Modal */}
      <AnimatePresence>
        {showMore && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowMore(false)} className="fixed inset-0 bg-black/60 z-[60]" />
            <motion.div 
              initial={{ y: 300 }} animate={{ y: 0 }} exit={{ y: 300 }}
              className="fixed bottom-0 left-0 right-0 z-[60] bg-gray-900 rounded-t-3xl p-8"
            >
              <div className="w-12 h-1 bg-white/20 rounded-full mx-auto mb-8" />
              <div className="space-y-4">
                <button onClick={() => setTextSize(s => Math.min(s + 2, 40))} className="w-full py-4 bg-white/10 rounded-2xl flex items-center justify-center gap-3"><Plus /> Increase Text Size</button>
                <button onClick={() => setTextSize(s => Math.max(s - 2, 12))} className="w-full py-4 bg-white/10 rounded-2xl flex items-center justify-center gap-3"><Minus /> Decrease Text Size</button>
                <button onClick={() => setShowMore(false)} className="w-full py-4 bg-white/20 rounded-2xl font-bold mt-4">Close</button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

function SwipeAction({ icon, onClick, active, activeColor }: { icon: React.ReactNode, onClick: () => void, active?: boolean, activeColor?: string }) {
  return (
    <button 
      onClick={onClick}
      className={`p-4 rounded-full bg-white/10 backdrop-blur-md shadow-lg transform active:scale-90 transition-all ${active ? activeColor : 'text-white'}`}
    >
      {icon}
    </button>
  );
}

function PoemListScreen({ title, poems, state, onPoemClick }: { title: string, poems: Poem[], state: AppState, onPoemClick: (p: Poem) => void }) {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      {poems.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 opacity-30">
          <Feather size={64} className="mb-4" />
          <p>No items found</p>
        </div>
      ) : (
        <div className="space-y-4">
          {poems.map(poem => (
            <PoemListItem 
              key={poem.id} 
              poem={poem} 
              design={state.listDesign} 
              themeColor={state.themeColor}
              isDarkMode={state.isDarkMode}
              onClick={() => onPoemClick(poem)} 
            />
          ))}
        </div>
      )}
    </motion.div>
  );
}

function SettingsScreen({ state, updateState, t }: { state: AppState, updateState: (s: Partial<AppState>) => void, t: any }) {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-8">
      <section>
        <h3 className="text-sm font-bold opacity-50 mb-4 flex items-center gap-2"><Languages size={16} /> {t.changeLanguage}</h3>
        <div className="grid grid-cols-3 gap-3">
          {(['ps', 'dr', 'en'] as Language[]).map(lang => (
            <button 
              key={lang}
              onClick={() => updateState({ language: lang })}
              className={`py-3 rounded-2xl font-bold transition-all ${state.language === lang ? `bg-gradient-to-r ${COLORS[state.themeColor]} text-white shadow-lg` : 'bg-black/5'}`}
            >
              {lang === 'ps' ? 'پښتو' : lang === 'dr' ? 'دری' : 'English'}
            </button>
          ))}
        </div>
      </section>

      <section>
        <h3 className="text-sm font-bold opacity-50 mb-4 flex items-center gap-2"><Palette size={16} /> {t.changeColor}</h3>
        <div className="grid grid-cols-5 gap-4">
          {(Object.keys(COLORS) as AppColor[]).map(color => (
            <button 
              key={color}
              onClick={() => updateState({ themeColor: color })}
              className={`w-full aspect-square rounded-2xl bg-gradient-to-br ${COLORS[color]} shadow-md transform active:scale-90 transition-transform flex items-center justify-center`}
            >
              {state.themeColor === color && <div className="w-2 h-2 bg-white rounded-full" />}
            </button>
          ))}
        </div>
      </section>

      <section>
        <div className={`p-6 rounded-3xl ${state.isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow-sm flex items-center justify-between`}>
          <div className="flex items-center gap-4">
            <div className={`p-3 rounded-2xl ${state.isDarkMode ? 'bg-indigo-500/20 text-indigo-400' : 'bg-indigo-50 text-indigo-600'}`}>
              {state.isDarkMode ? <Moon size={24} /> : <Sun size={24} />}
            </div>
            <div>
              <h4 className="font-bold">{t.darkMode}</h4>
              <p className="text-xs opacity-50">Toggle dark/light theme</p>
            </div>
          </div>
          <button 
            onClick={() => updateState({ isDarkMode: !state.isDarkMode })}
            className={`w-14 h-8 rounded-full transition-colors relative ${state.isDarkMode ? 'bg-indigo-500' : 'bg-gray-200'}`}
          >
            <motion.div 
              animate={{ x: state.isDarkMode ? 24 : 4 }}
              className="absolute top-1 w-6 h-6 bg-white rounded-full shadow-sm"
            />
          </button>
        </div>
      </section>
    </motion.div>
  );
}

function AboutScreen({ t, themeColor, isDarkMode }: { t: any, themeColor: AppColor, isDarkMode: boolean }) {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-center py-12">
      <div className={`w-32 h-32 mx-auto mb-8 rounded-[40px] bg-gradient-to-br ${COLORS[themeColor]} flex items-center justify-center text-white shadow-2xl`}>
        <Feather size={64} />
      </div>
      <h2 className="text-3xl font-bold mb-2">{t.appName}</h2>
      <p className="text-sm opacity-50 mb-12">Version 1.0.0</p>
      
      <div className={`p-8 rounded-3xl ${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow-sm space-y-6`}>
        <div>
          <h4 className="text-xs font-bold opacity-40 uppercase tracking-widest mb-1">{t.developer}</h4>
          <p className="text-xl font-bold">عبيدالله غفاري</p>
        </div>
        <div>
          <h4 className="text-xs font-bold opacity-40 uppercase tracking-widest mb-1">{t.design}</h4>
          <p className="text-lg">Modern Material Design</p>
        </div>
        <div className="pt-6 border-t border-black/5 flex justify-center gap-6">
          <Facebook className="opacity-40 hover:opacity-100 cursor-pointer transition-opacity" />
          <MessageCircle className="opacity-40 hover:opacity-100 cursor-pointer transition-opacity" />
          <Smartphone className="opacity-40 hover:opacity-100 cursor-pointer transition-opacity" />
        </div>
      </div>
    </motion.div>
  );
}

function AIImageGenerator({ t, themeColor, isDarkMode }: { t: any, themeColor: AppColor, isDarkMode: boolean }) {
  const [prompt, setPrompt] = useState('');
  const [image, setImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateImage = async () => {
    if (!prompt.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });
      const response = await ai.models.generateContent({
        model: 'gemini-3.1-flash-image-preview',
        contents: {
          parts: [{ text: prompt }],
        },
        config: {
          imageConfig: {
            aspectRatio: "1:1",
            imageSize: "1K"
          }
        }
      });

      let foundImage = false;
      for (const part of response.candidates?.[0]?.content?.parts || []) {
        if (part.inlineData) {
          setImage(`data:image/png;base64,${part.inlineData.data}`);
          foundImage = true;
          break;
        }
      }
      if (!foundImage) throw new Error("No image generated");
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to generate image. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-6">
      <div className={`p-6 rounded-3xl ${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow-sm`}>
        <h3 className="text-lg font-bold mb-4 flex items-center gap-2"><Sparkles className="text-emerald-500" size={20} /> Create Poetry Art</h3>
        <p className="text-xs opacity-50 mb-6">Use AI to generate beautiful backgrounds or illustrations for your favorite poems.</p>
        
        <div className="space-y-4">
          <textarea 
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Describe the image (e.g., 'A peaceful sunset over Afghan mountains with a lone poet sitting on a rock')"
            className={`w-full p-4 rounded-2xl border ${isDarkMode ? 'bg-gray-900 border-gray-700' : 'bg-gray-50 border-gray-200'} focus:outline-none focus:ring-2 ring-emerald-500/50 h-32 resize-none`}
          />
          <button 
            onClick={generateImage}
            disabled={loading || !prompt.trim()}
            className={`w-full py-4 rounded-2xl bg-gradient-to-r ${COLORS[themeColor]} text-white font-bold shadow-lg flex items-center justify-center gap-2 disabled:opacity-50 transform active:scale-95 transition-all`}
          >
            {loading ? <RefreshCw className="animate-spin" /> : <Sparkles size={20} />}
            {loading ? 'Generating...' : 'Generate Image'}
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-500 text-sm text-center">
          {error}
        </div>
      )}

      {image && (
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className={`p-4 rounded-3xl ${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow-lg`}>
          <img src={image} alt="AI Generated" className="w-full aspect-square rounded-2xl object-cover mb-4" />
          <div className="flex gap-2">
            <button 
              onClick={() => {
                const link = document.createElement('a');
                link.href = image;
                link.download = `poetry-art-${Date.now()}.png`;
                link.click();
              }}
              className="flex-1 py-3 rounded-xl bg-black/5 flex items-center justify-center gap-2 text-sm font-bold"
            >
              <Download size={18} /> Download
            </button>
            <button 
              onClick={() => setImage(null)}
              className="px-4 py-3 rounded-xl bg-black/5 text-rose-500"
            >
              <X size={18} />
            </button>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}

function NavButton({ active, icon, label, onClick }: { active: boolean, icon: React.ReactNode, label: string, onClick: () => void }) {
  return (
    <button onClick={onClick} className={`flex flex-col items-center gap-1 transition-all ${active ? 'text-emerald-500 scale-110' : 'opacity-40 hover:opacity-70'}`}>
      {icon}
      <span className="text-[10px] font-bold">{label}</span>
    </button>
  );
}

function SidebarItem({ icon, label, onClick }: { icon: React.ReactNode, label: string, onClick: () => void }) {
  return (
    <button 
      onClick={onClick}
      className="w-full flex items-center gap-4 p-4 rounded-2xl hover:bg-black/5 transition-colors text-sm font-medium"
    >
      <span className="opacity-60">{icon}</span>
      <span>{label}</span>
    </button>
  );
}
