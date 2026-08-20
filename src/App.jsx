import React, { useState } from "react";
import { ThemeProvider } from "./context/ThemeContext";
import { CurrencyProvider } from "./context/CurrencyContext";
import { ProjectProvider, useProjects } from "./context/ProjectContext";
import { Header } from "./components/Header";
import { AnalyticsDashboard } from "./components/AnalyticsDashboard";
import { ProjectDetail } from "./components/ProjectDetail";
import { ProjectModal } from "./components/ProjectModal";
import { RecipeCatalog } from "./components/RecipeCatalog";
import { SettingsModal } from "./components/SettingsModal";
import { Layers, Heart, Sparkles, Shield } from "lucide-react";

function MainApp() {
  const { activeProjectId, setActiveProjectId, projects } = useProjects();
  const [isViewingDetail, setIsViewingDetail] = useState(false);

  // Modals state
  const [isNewProjectModalOpen, setIsNewProjectModalOpen] = useState(false);
  const [isCatalogModalOpen, setIsCatalogModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [presetForNewProject, setPresetForNewProject] = useState(null);

  const handleSelectProject = (projectId) => {
    setActiveProjectId(projectId);
    setIsViewingDetail(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleGoHome = () => {
    setIsViewingDetail(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleOpenNewProject = (presetRecipe = null) => {
    setPresetForNewProject(presetRecipe);
    setIsNewProjectModalOpen(true);
  };

  return (
    <div className="app-container">
      {/* Top Header */}
      <Header
        onOpenNewProject={() => handleOpenNewProject(null)}
        onOpenCatalog={() => setIsCatalogModalOpen(true)}
        onOpenSettings={() => setIsSettingsModalOpen(true)}
        onGoHome={handleGoHome}
        isViewingDetail={isViewingDetail}
      />

      {/* Main View Area */}
      <main className="main-content">
        {isViewingDetail && activeProjectId ? (
          <ProjectDetail onBack={handleGoHome} />
        ) : (
          <AnalyticsDashboard
            onSelectProject={handleSelectProject}
            onNewProject={() => handleOpenNewProject(null)}
            onOpenCatalog={() => setIsCatalogModalOpen(true)}
          />
        )}
      </main>

      {/* Project Creation Modal */}
      <ProjectModal
        isOpen={isNewProjectModalOpen}
        onClose={() => setIsNewProjectModalOpen(false)}
        presetRecipe={presetForNewProject}
      />

      {/* Recipe Catalog Modal */}
      <RecipeCatalog
        isOpen={isCatalogModalOpen}
        onClose={() => setIsCatalogModalOpen(false)}
        onStartProjectFromRecipe={(recipe) => {
          handleOpenNewProject(recipe);
        }}
      />

      {/* Global Settings & Exchange Rate Modal */}
      <SettingsModal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
      />

      {/* Footer */}
      <footer style={{
        marginTop: "auto",
        borderTop: "1px solid var(--border-subtle)",
        background: "var(--bg-glass)",
        padding: "20px 24px",
        fontSize: "12px",
        color: "var(--text-dim)"
      }}>
        <div style={{
          maxWidth: "1440px",
          margin: "0 auto",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "12px"
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <span style={{ fontWeight: "700", color: "var(--emerald-400)" }}>GROWMASS</span>
            <span>• Solusi Cerdas Manajemen Projek & Buku Kas Massing Growtopia</span>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            <span>Mendukung WL, DL, BGL & Rupiah (IDR)</span>
            <span>•</span>
            <span style={{ color: "var(--emerald-400)" }}>Data Tersimpan Otomatis (Local Storage)</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <CurrencyProvider>
        <ProjectProvider>
          <MainApp />
        </ProjectProvider>
      </CurrencyProvider>
    </ThemeProvider>
  );
}
