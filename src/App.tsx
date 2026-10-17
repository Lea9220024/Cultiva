import React from "react";
import { CultivaProvider, useCultiva } from "./context/CultivaContext";
import { Header } from "./components/common/Header";
import { Sidebar } from "./components/common/Sidebar";
import { BottomNav } from "./components/common/BottomNav";
import { QuickAddModal } from "./components/common/QuickAddModal";
import { GlobalSearchModal } from "./components/common/GlobalSearchModal";
import { OnboardingModal } from "./components/common/OnboardingModal";
import { PWAInstallBanner } from "./components/common/PWAInstallBanner";

import { DashboardView } from "./components/dashboard/DashboardView";
import { CropsView } from "./components/crops/CropsView";
import { TasksView } from "./components/tasks/TasksView";
import { DiaryView } from "./components/diary/DiaryView";
import { NutritionView } from "./components/nutrition/NutritionView";
import { EncyclopediaView } from "./components/encyclopedia/EncyclopediaView";
import { PhotoGalleryView } from "./components/photos/PhotoGalleryView";
import { CultivaAIView } from "./components/ai/CultivaAIView";
import { SettingsView } from "./components/settings/SettingsView";

const AppContent: React.FC = () => {
  const { currentTab } = useCultiva();

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 flex flex-col font-sans transition-colors duration-200">
      {/* Top Bar */}
      <Header />

      {/* Main Container */}
      <div className="flex-1 flex max-w-7xl w-full mx-auto">
        {/* Desktop Sidebar */}
        <Sidebar />

        {/* Dynamic Main Workspace */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-x-hidden min-h-[calc(100vh-4.5rem)] pb-24 md:pb-8">
          {currentTab === "dashboard" && <DashboardView />}
          {currentTab === "crops" && <CropsView />}
          {currentTab === "diary" && <DiaryView />}
          {currentTab === "nutrition" && <NutritionView />}
          {currentTab === "encyclopedia" && <EncyclopediaView />}
          {currentTab === "tasks" && <TasksView />}
          {currentTab === "photos" && <PhotoGalleryView />}
          {currentTab === "ai" && <CultivaAIView />}
          {currentTab === "settings" && <SettingsView />}
        </main>
      </div>

      {/* Mobile Bottom Navigation Bar */}
      <BottomNav />

      {/* Modals & PWA Banners */}
      <QuickAddModal />
      <GlobalSearchModal />
      <OnboardingModal />
      <PWAInstallBanner />
    </div>
  );
};

export default function App() {
  return (
    <CultivaProvider>
      <AppContent />
    </CultivaProvider>
  );
}
