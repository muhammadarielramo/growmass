import {
  loadProjectsFromStorage,
  saveProjectsToStorage,
  loadRecipesFromStorage,
  saveRecipesToStorage,
  INITIAL_SAMPLE_PROJECTS
} from "../utils/storage";
import { generateProjectStages } from "../utils/recipeCalculator";
import { DEFAULT_RECIPES } from "../data/defaultRecipes";

const ProjectContext = createContext(null);

export function ProjectProvider({ children }) {
  const [projects, setProjects] = useState(loadProjectsFromStorage);
  const [recipes, setRecipes] = useState(loadRecipesFromStorage);
  const [activeProjectId, setActiveProjectId] = useState(() => {
    const loaded = loadProjectsFromStorage();
    return loaded.length > 0 ? loaded[0].id : null;
  });

  useEffect(() => {
    saveProjectsToStorage(projects);
  }, [projects]);

  useEffect(() => {
    saveRecipesToStorage(recipes);
  }, [recipes]);

  const activeProject = useMemo(() => {
    return projects.find((p) => p.id === activeProjectId) || projects[0] || null;
  }, [projects, activeProjectId]);

  // Global aggregate statistics
  const globalStats = useMemo(() => {
    let totalProjects = projects.length;
    let activeProjectsCount = 0;
    let completedProjectsCount = 0;
    let totalInvestedWL = 0;
    let totalExpensesWL = 0;
    let totalRevenuesWL = 0;
    let totalNetProfitWL = 0;
    let totalActiveTimers = 0;

    projects.forEach((proj) => {
      if (proj.status === "completed") {
        completedProjectsCount++;
      } else if (proj.status !== "archived") {
        activeProjectsCount++;
      }

      // Ledger totals
      const projCap = (proj.ledger?.capital || []).reduce((sum, c) => sum + Number(c.amountWL || 0), 0);
      const projExp = (proj.ledger?.expenses || []).reduce((sum, e) => sum + Number(e.amountWL || 0), 0);
      const projRev = (proj.ledger?.revenues || []).reduce((sum, r) => sum + Number(r.amountWL || 0), 0);
      const projProfit = projRev - projExp;

      totalInvestedWL += projCap;
      totalExpensesWL += projExp;
      totalRevenuesWL += projRev;
      totalNetProfitWL += projProfit;
    });

    return {
      totalProjects,
      activeProjectsCount,
      completedProjectsCount,
      totalInvestedWL,
      totalExpensesWL,
      totalRevenuesWL,
      totalNetProfitWL
    };
  }, [projects]);

  // Project CRUD
  const createProject = (data) => {
    const recipe = data.recipe || DEFAULT_RECIPES.find((r) => r.id === data.recipeId) || DEFAULT_RECIPES[0];
    const newStages = data.stages || generateProjectStages(recipe, data.targetQuantity || 1000);

    const newProject = {
      id: `proj-${Date.now()}`,
      name: data.name || `${recipe.name} Mass x${data.targetQuantity || 1000}`,
      targetItem: recipe.name,
      targetQuantity: Number(data.targetQuantity || 1000),
      unit: data.unit || "Seeds",
      status: data.status || "not_started",
      worldName: data.worldName || "",
      storageWorld: data.storageWorld || "",
      notes: data.notes || "",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      recipe: recipe,
      stages: newStages,
      ledger: {
        capital: data.initialCapitalWL ? [{
          id: `cap-${Date.now()}`,
          date: new Date().toISOString().split("T")[0],
          note: "Modal Awal Projek",
          amountWL: Number(data.initialCapitalWL),
          currencySource: data.capitalSource || "WL"
        }] : [],
        expenses: [],
        revenues: []
      },
      timers: []
    };

    setProjects((prev) => [newProject, ...prev]);
    setActiveProjectId(newProject.id);
    return newProject;
  };

  const updateProject = (projectId, updates) => {
    setProjects((prev) =>
      prev.map((p) =>
        p.id === projectId
          ? {
              ...p,
              ...updates,
              updatedAt: new Date().toISOString()
            }
          : p
      )
    );
  };

  const deleteProject = (projectId) => {
    setProjects((prev) => {
      const filtered = prev.filter((p) => p.id !== projectId);
      if (activeProjectId === projectId) {
        setActiveProjectId(filtered.length > 0 ? filtered[0].id : null);
      }
      return filtered;
    });
  };

  // Stage Management
  const toggleStage = (projectId, stageId) => {
    setProjects((prev) =>
      prev.map((p) => {
        if (p.id !== projectId) return p;
        const newStages = p.stages.map((s) =>
          s.id === stageId ? { ...s, completed: !s.completed } : s
        );

        // Check if all stages are completed
        const allDone = newStages.every((s) => s.completed);
        const newStatus = allDone ? "completed" : p.status === "completed" ? "selling" : p.status;

        return {
          ...p,
          stages: newStages,
          status: newStatus,
          updatedAt: new Date().toISOString()
        };
      })
    );
  };

  const updateStage = (projectId, stageId, updates) => {
    setProjects((prev) =>
      prev.map((p) => {
        if (p.id !== projectId) return p;
        return {
          ...p,
          stages: p.stages.map((s) => (s.id === stageId ? { ...s, ...updates } : s)),
          updatedAt: new Date().toISOString()
        };
      })
    );
  };

  const addStage = (projectId, stageData) => {
    setProjects((prev) =>
      prev.map((p) => {
        if (p.id !== projectId) return p;
        const newStage = {
          id: `stage-${Date.now()}`,
          title: stageData.title || "Tahap Baru",
          description: stageData.description || "",
          completed: false,
          notes: ""
        };
        return {
          ...p,
          stages: [...p.stages, newStage],
          updatedAt: new Date().toISOString()
        };
      })
    );
  };

  const deleteStage = (projectId, stageId) => {
    setProjects((prev) =>
      prev.map((p) => {
        if (p.id !== projectId) return p;
        return {
          ...p,
          stages: p.stages.filter((s) => s.id !== stageId),
          updatedAt: new Date().toISOString()
        };
      })
    );
  };

  // Ledger Management
  const addLedgerEntry = (projectId, type, entryData) => {
    setProjects((prev) =>
      prev.map((p) => {
        if (p.id !== projectId) return p;
        const currentLedger = p.ledger || { capital: [], expenses: [], revenues: [] };
        const newEntry = {
          id: `${type.slice(0, 3)}-${Date.now()}`,
          date: entryData.date || new Date().toISOString().split("T")[0],
          amountWL: Number(entryData.amountWL || 0),
          note: entryData.note || "",
          category: entryData.category || "other",
          quantity: entryData.quantity ? Number(entryData.quantity) : null,
          unitPrice: entryData.unitPrice || "",
          currencySource: entryData.currencySource || "WL",
        };

        return {
          ...p,
          ledger: {
            ...currentLedger,
            [type]: [newEntry, ...(currentLedger[type] || [])]
          },
          updatedAt: new Date().toISOString()
        };
      })
    );
  };

  const updateLedgerEntry = (projectId, type, entryId, updates) => {
    setProjects((prev) =>
      prev.map((p) => {
        if (p.id !== projectId) return p;
        const currentLedger = p.ledger || { capital: [], expenses: [], revenues: [] };
        return {
          ...p,
          ledger: {
            ...currentLedger,
            [type]: (currentLedger[type] || []).map((e) =>
              e.id === entryId ? { ...e, ...updates } : e
            )
          },
          updatedAt: new Date().toISOString()
        };
      })
    );
  };

  const deleteLedgerEntry = (projectId, type, entryId) => {
    setProjects((prev) =>
      prev.map((p) => {
        if (p.id !== projectId) return p;
        const currentLedger = p.ledger || { capital: [], expenses: [], revenues: [] };
        return {
          ...p,
          ledger: {
            ...currentLedger,
            [type]: (currentLedger[type] || []).filter((e) => e.id !== entryId)
          },
          updatedAt: new Date().toISOString()
        };
      })
    );
  };

  // Material Purchases Management
  const addMaterial = (projectId, matData) => {
    setProjects((prev) =>
      prev.map((p) => {
        if (p.id !== projectId) return p;
        const currentMaterials = p.materials || [];
        const newMat = {
          id: `mat-${Date.now()}`,
          name: matData.name || "Bahan Baru",
          category: matData.category || "Bibit Dasar",
          branch: matData.branch || "-",
          quantity: Number(matData.quantity || 0),
          unit: matData.unit || "pcs",
          rateType: matData.rateType || "item_per_wl",
          rateDisplay: matData.rateDisplay || "-",
          totalWL: Number(matData.totalWL || 0),
          notes: matData.notes || ""
        };

        return {
          ...p,
          materials: [...currentMaterials, newMat],
          updatedAt: new Date().toISOString()
        };
      })
    );
  };

  const updateMaterial = (projectId, matId, updates) => {
    setProjects((prev) =>
      prev.map((p) => {
        if (p.id !== projectId) return p;
        const currentMaterials = p.materials || [];
        return {
          ...p,
          materials: currentMaterials.map((m) => (m.id === matId ? { ...m, ...updates } : m)),
          updatedAt: new Date().toISOString()
        };
      })
    );
  };

  const deleteMaterial = (projectId, matId) => {
    setProjects((prev) =>
      prev.map((p) => {
        if (p.id !== projectId) return p;
        const currentMaterials = p.materials || [];
        return {
          ...p,
          materials: currentMaterials.filter((m) => m.id !== matId),
          updatedAt: new Date().toISOString()
        };
      })
    );
  };

  // Recipe Management (Add / Edit / Delete / Reset)
  const addRecipe = (recipeData) => {
    const newRecipe = {
      id: `recipe-${Date.now()}`,
      name: recipeData.name?.trim() || "Custom Recipe",
      description: recipeData.description?.trim() || "",
      recipeA: recipeData.recipeA?.trim() || "",
      recipeB: recipeData.recipeB?.trim() || "",
      splices: Array.isArray(recipeData.splices) ? recipeData.splices : [],
      stages: Array.isArray(recipeData.stages) ? recipeData.stages : [],
      createdAt: new Date().toISOString()
    };
    setRecipes((prev) => [newRecipe, ...prev]);
    return newRecipe;
  };

  const updateRecipe = (recipeId, updates) => {
    setRecipes((prev) =>
      prev.map((r) =>
        r.id === recipeId
          ? {
              ...r,
              ...updates,
              updatedAt: new Date().toISOString()
            }
          : r
      )
    );
  };

  const deleteRecipe = (recipeId) => {
    setRecipes((prev) => prev.filter((r) => r.id !== recipeId));
  };

  const resetRecipes = () => {
    setRecipes(DEFAULT_RECIPES);
  };

  // Backup and Export
  const exportData = () => {
    const exportObject = {
      app: "Growmass",
      version: "1.0",
      exportDate: new Date().toISOString(),
      projects,
      recipes
    };
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(exportObject, null, 2));
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `growmass_backup_${new Date().toISOString().split("T")[0]}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const importData = (jsonData) => {
    try {
      let parsed = jsonData;
      if (typeof jsonData === "string") {
        parsed = JSON.parse(jsonData);
      }
      if (parsed.projects && Array.isArray(parsed.projects)) {
        setProjects(parsed.projects);
        if (parsed.projects.length > 0) {
          setActiveProjectId(parsed.projects[0].id);
        }
        if (parsed.recipes && Array.isArray(parsed.recipes)) {
          setRecipes(parsed.recipes);
        }
        return { success: true, message: `Berhasil mengimpor ${parsed.projects.length} projek!` };
      } else if (Array.isArray(parsed)) {
        setProjects(parsed);
        if (parsed.length > 0) {
          setActiveProjectId(parsed[0].id);
        }
        return { success: true, message: `Berhasil mengimpor ${parsed.length} projek!` };
      }
      return { success: false, message: "Format file JSON tidak valid." };
    } catch (err) {
      return { success: false, message: `Gagal membaca file: ${err.message}` };
    }
  };

  const resetToSample = () => {
    setProjects(INITIAL_SAMPLE_PROJECTS);
    setActiveProjectId(INITIAL_SAMPLE_PROJECTS[0].id);
  };

  const value = {
    projects,
    recipes,
    activeProjectId,
    activeProject,
    globalStats,
    setActiveProjectId,
    createProject,
    updateProject,
    deleteProject,
    toggleStage,
    updateStage,
    addStage,
    deleteStage,
    addLedgerEntry,
    updateLedgerEntry,
    deleteLedgerEntry,
    addMaterial,
    updateMaterial,
    deleteMaterial,
    addRecipe,
    updateRecipe,
    deleteRecipe,
    resetRecipes,
    exportData,
    importData,
    resetToSample
  };

  return (
    <ProjectContext.Provider value={value}>
      {children}
    </ProjectContext.Provider>
  );
}

export function useProjects() {
  const context = useContext(ProjectContext);
  if (!context) {
    throw new Error("useProjects must be used within a ProjectProvider");
  }
  return context;
}
