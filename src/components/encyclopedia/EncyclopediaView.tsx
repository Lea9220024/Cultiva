import React, { useState } from "react";
import {
  BookOpen,
  Search,
  Filter,
  Bookmark,
  Sparkles,
  ExternalLink,
  ChevronRight,
  CheckCircle2,
  Clock,
  Award,
  ArrowRight,
  ShieldCheck,
  X,
  Layers,
  GraduationCap,
  FileText,
} from "lucide-react";
import { useCultiva } from "../../context/CultivaContext";
import { ENCYCLOPEDIA_ARTICLES } from "../../data/encyclopediaData";
import { EncyclopediaArticle, ArticleLevel } from "../../types";

export const EncyclopediaView: React.FC = () => {
  const {
    activeCrop,
    learningProgress,
    markArticleAsRead,
    toggleFavoriteArticle,
    userPreferences,
    updateKnowledgeLevel,
  } = useCultiva();

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedLevel, setSelectedLevel] = useState<string>("todos");
  const [selectedCategory, setSelectedCategory] = useState<string>("todas");
  const [showOnlyFavorites, setShowOnlyFavorites] = useState(false);
  const [activeArticle, setActiveArticle] = useState<EncyclopediaArticle | null>(null);

  // Contextual "Learn while growing" recommendations based on active crop stage
  const contextualArticles = ENCYCLOPEDIA_ARTICLES.filter((art) => {
    if (!activeCrop?.stage) return false;
    return art.stageRelation?.some(
      (stg) => stg.toLowerCase() === activeCrop.stage.toLowerCase()
    );
  }).slice(0, 3);

  // Categories list
  const categories = [
    { id: "todas", label: "Todas las categorías", icon: "📚" },
    { id: "biologia", label: "Biología vegetal", icon: "🌱" },
    { id: "riego", label: "Agua y pH", icon: "💧" },
    { id: "nutricion", label: "Nutrición y EC", icon: "🧪" },
    { id: "sustratos", label: "Sustratos", icon: "🪴" },
    { id: "iluminacion", label: "Iluminación", icon: "💡" },
    { id: "ambiente", label: "Ambiente y VPD", icon: "🌡️" },
    { id: "desarrollo", label: "Podas y LST", icon: "🌿" },
    { id: "plagas", label: "Plagas y MIP", icon: "🐛" },
    { id: "etapas", label: "Cosecha y Curado", icon: "🌸" },
    { id: "legislacion", label: "Seguridad y Ley", icon: "📖" },
  ];

  // Filtered Articles
  const filteredArticles = ENCYCLOPEDIA_ARTICLES.filter((art) => {
    const matchesSearch =
      art.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      art.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
      art.tags?.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesLevel =
      selectedLevel === "todos" || art.level === selectedLevel;

    const matchesCategory =
      selectedCategory === "todas" || art.category === selectedCategory;

    const matchesFav =
      !showOnlyFavorites || learningProgress.favoriteArticleIds.includes(art.id);

    return matchesSearch && matchesLevel && matchesCategory && matchesFav;
  });

  const handleOpenArticle = (art: EncyclopediaArticle) => {
    setActiveArticle(art);
    markArticleAsRead(art.id);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* 1. Header Hero Card */}
      <div className="p-6 sm:p-8 rounded-[2rem] bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-50 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 flex items-center gap-1">
                <GraduationCap className="w-3.5 h-3.5" />
                <span>Enciclopedia Técnica</span>
              </span>
              <span className="text-xs text-zinc-400 font-mono">
                {learningProgress.readArticleIds.length} de {ENCYCLOPEDIA_ARTICLES.length} leídos
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-zinc-900 dark:text-zinc-100">
              Biblioteca de Conocimiento Botánico
            </h1>
            <p className="text-xs sm:text-sm text-zinc-500 max-w-2xl">
              Fisiología vegetal, control climático avanzado, nutrición iónica y bioseguridad, respaldados por fuentes científicas y agronómicas oficiales.
            </p>
          </div>

          {/* Level Switcher */}
          <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-zinc-100 dark:bg-zinc-800/80">
            {(["Principiante", "Intermedio", "Avanzado"] as ArticleLevel[]).map((lvl) => (
              <button
                key={lvl}
                onClick={() => updateKnowledgeLevel(lvl)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  userPreferences.knowledgeLevel === lvl
                    ? "bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 shadow-xs"
                    : "text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-300"
                }`}
              >
                {lvl}
              </button>
            ))}
          </div>
        </div>

        {/* Search and Filters Bar */}
        <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
            <input
              type="text"
              placeholder="Buscar temas (VPD, pH, EC, podas, trips, curado)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            {/* Level filter select */}
            <select
              value={selectedLevel}
              onChange={(e) => setSelectedLevel(e.target.value)}
              className="px-3 py-2.5 rounded-2xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-xs font-semibold text-zinc-700 dark:text-zinc-300 focus:outline-none"
            >
              <option value="todos">Todos los niveles</option>
              <option value="Principiante">Principiante</option>
              <option value="Intermedio">Intermedio</option>
              <option value="Avanzado">Avanzado</option>
            </select>

            {/* Favorite Filter Toggle */}
            <button
              onClick={() => setShowOnlyFavorites(!showOnlyFavorites)}
              className={`px-4 py-2.5 rounded-2xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer border ${
                showOnlyFavorites
                  ? "bg-amber-50 dark:bg-amber-950/60 border-amber-300 text-amber-700 dark:text-amber-300"
                  : "bg-zinc-50 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100"
              }`}
            >
              <Bookmark className={`w-3.5 h-3.5 ${showOnlyFavorites ? "fill-amber-500" : ""}`} />
              <span>Favoritos</span>
            </button>
          </div>
        </div>

        {/* Category Horizontal Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-medium shrink-0 flex items-center gap-1.5 transition-all cursor-pointer ${
                selectedCategory === cat.id
                  ? "bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 font-bold"
                  : "bg-zinc-100 dark:bg-zinc-800/80 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700"
              }`}
            >
              <span>{cat.icon}</span>
              <span>{cat.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* 2. Contextual "Learn While Growing" Suggestions */}
      {contextualArticles.length > 0 && selectedCategory === "todas" && !searchQuery && (
        <div className="p-6 rounded-[2rem] bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200/80 dark:border-emerald-800/40 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <h3 className="text-sm font-bold text-emerald-950 dark:text-emerald-100">
                Aprende mientras cultivas: Recomendaciones para etapa {activeCrop?.stage || "Vegetativo"}
              </h3>
            </div>
            <span className="text-[11px] font-mono text-emerald-700 dark:text-emerald-300">
              Cultivo actual: {activeCrop?.name}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {contextualArticles.map((art) => (
              <div
                key={art.id}
                onClick={() => handleOpenArticle(art)}
                className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-emerald-200/60 dark:border-emerald-800/40 shadow-xs hover:shadow-md transition-all cursor-pointer flex flex-col justify-between space-y-3"
              >
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono uppercase text-emerald-600 dark:text-emerald-400 font-bold">
                      {art.categoryLabel}
                    </span>
                    <span className="text-[10px] text-zinc-400 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {art.readTimeMinutes} min
                    </span>
                  </div>
                  <h4 className="text-xs font-bold text-zinc-900 dark:text-zinc-100 line-clamp-2">
                    {art.title}
                  </h4>
                  <p className="text-[11px] text-zinc-500 line-clamp-2">
                    {art.summary}
                  </p>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-zinc-100 dark:border-zinc-800 text-[11px] text-emerald-600 dark:text-emerald-400 font-bold">
                  <span>Leer ahora</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 3. Main Articles Bento Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredArticles.map((art) => {
          const isRead = learningProgress.readArticleIds.includes(art.id);
          const isFav = learningProgress.favoriteArticleIds.includes(art.id);

          return (
            <div
              key={art.id}
              className="p-6 rounded-[2rem] bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm flex flex-col justify-between space-y-4 hover:border-emerald-500/50 transition-all cursor-pointer group"
              onClick={() => handleOpenArticle(art)}
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-zinc-600 dark:text-zinc-400 flex items-center gap-1">
                    <span>{art.categoryIcon}</span>
                    <span>{art.categoryLabel}</span>
                  </span>

                  <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                    {isRead && (
                      <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 flex items-center gap-0.5">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Leído
                      </span>
                    )}
                    <button
                      onClick={() => toggleFavoriteArticle(art.id)}
                      className={`p-1.5 rounded-lg transition-colors ${
                        isFav
                          ? "text-amber-500 bg-amber-50 dark:bg-amber-950/60"
                          : "text-zinc-400 hover:text-zinc-600"
                      }`}
                    >
                      <Bookmark className={`w-4 h-4 ${isFav ? "fill-amber-500" : ""}`} />
                    </button>
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-md bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400">
                      {art.levelDifficulty}
                    </span>
                    <span className="text-[10px] text-zinc-400">
                      {art.readTimeMinutes} min de lectura
                    </span>
                  </div>
                  <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                    {art.title}
                  </h3>
                </div>

                <p className="text-xs text-zinc-500 dark:text-zinc-400 line-clamp-3 leading-relaxed">
                  {art.summary}
                </p>

                {/* Tags */}
                {art.tags && (
                  <div className="flex flex-wrap gap-1 pt-1">
                    {art.tags.slice(0, 3).map((tag) => (
                      <span
                        key={tag}
                        className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-zinc-50 dark:bg-zinc-800/80 text-zinc-400"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div className="pt-3 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between text-xs font-bold text-emerald-600 dark:text-emerald-400">
                <span>Ver artículo completo</span>
                <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          );
        })}
      </div>

      {filteredArticles.length === 0 && (
        <div className="text-center py-16 rounded-[2rem] bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs text-zinc-400 space-y-2">
          <BookOpen className="w-8 h-8 mx-auto text-zinc-300 dark:text-zinc-600" />
          <p>No se encontraron artículos con los filtros aplicados.</p>
        </div>
      )}

      {/* 4. Educational & Responsibility Disclaimer */}
      <div className="p-4 rounded-[1.5rem] bg-zinc-100 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700/80 text-[11px] text-zinc-500 flex items-start gap-2.5">
        <ShieldCheck className="w-4 h-4 shrink-0 text-emerald-600 dark:text-emerald-400 mt-0.5" />
        <p className="leading-relaxed">
          <strong>Aviso de Responsabilidad Educativa:</strong> La Enciclopedia de Cultiva reúne conocimientos botánicos y agronómicos con fines exclusivamente educativos y de registro personal de cultivos legales. Siempre consulta fuentes académicas y la normativa vigente en tu jurisdicción.
        </p>
      </div>

      {/* 5. ARTICLE READER MODAL */}
      {activeArticle && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/70 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-[2.5rem] max-w-3xl w-full p-6 sm:p-10 shadow-2xl space-y-6 my-8 max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-start justify-between gap-4 pb-4 border-b border-zinc-100 dark:border-zinc-800">
              <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                    <span>{activeArticle.categoryIcon}</span>
                    <span>{activeArticle.categoryLabel}</span>
                  </span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-zinc-100 dark:bg-zinc-800 text-zinc-500">
                    {activeArticle.levelDifficulty}
                  </span>
                  <span className="text-[10px] text-zinc-400">
                    ⏱️ {activeArticle.readTimeMinutes} min de lectura
                  </span>
                </div>
                <h2 className="text-xl sm:text-2xl font-bold text-zinc-900 dark:text-zinc-100 leading-tight">
                  {activeArticle.title}
                </h2>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => toggleFavoriteArticle(activeArticle.id)}
                  className={`p-2.5 rounded-full transition-colors cursor-pointer ${
                    learningProgress.favoriteArticleIds.includes(activeArticle.id)
                      ? "bg-amber-50 dark:bg-amber-950/60 text-amber-500"
                      : "bg-zinc-100 dark:bg-zinc-800 text-zinc-400 hover:text-zinc-600"
                  }`}
                >
                  <Bookmark
                    className={`w-5 h-5 ${
                      learningProgress.favoriteArticleIds.includes(activeArticle.id)
                        ? "fill-amber-500"
                        : ""
                    }`}
                  />
                </button>
                <button
                  onClick={() => setActiveArticle(null)}
                  className="p-2.5 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Definition Box */}
            <div className="p-5 rounded-[1.5rem] bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/60 space-y-1.5">
              <div className="text-[10px] font-mono uppercase font-bold text-emerald-700 dark:text-emerald-400">
                Definición y Concepto Clave
              </div>
              <p className="text-xs sm:text-sm text-emerald-950 dark:text-emerald-100 leading-relaxed font-medium">
                {activeArticle.definition}
              </p>
            </div>

            {/* Main Content */}
            <div className="prose dark:prose-invert max-w-none text-xs sm:text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed space-y-4 whitespace-pre-line">
              {activeArticle.content}
            </div>

            {/* Key Takeaways */}
            {activeArticle.keyTakeaways && activeArticle.keyTakeaways.length > 0 && (
              <div className="p-5 rounded-[1.5rem] bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700/80 space-y-3">
                <div className="flex items-center gap-2 text-xs font-bold text-zinc-900 dark:text-zinc-100">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  <span>Conclusiones y Reglas de Oro</span>
                </div>
                <ul className="space-y-2 text-xs text-zinc-600 dark:text-zinc-300">
                  {activeArticle.keyTakeaways.map((takeaway, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="text-emerald-600 font-bold">•</span>
                      <span>{takeaway}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Official Sources Citation Block */}
            {activeArticle.sources && activeArticle.sources.length > 0 && (
              <div className="p-5 rounded-[1.5rem] bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200/80 dark:border-zinc-700/70 space-y-3">
                <div className="flex items-center gap-2 text-xs font-bold text-zinc-700 dark:text-zinc-300">
                  <FileText className="w-4 h-4 text-zinc-500" />
                  <span>Fuentes y Referencias Científicas Consultadas</span>
                </div>

                <div className="space-y-2.5">
                  {activeArticle.sources.map((src) => (
                    <div
                      key={src.id}
                      className="p-3 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs"
                    >
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-zinc-800 dark:text-zinc-200">{src.title}</span>
                          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300">
                            {src.reliability}
                          </span>
                        </div>
                        <div className="text-[11px] text-zinc-400">
                          {src.publisher} • Consultado: {src.consultationDate}
                        </div>
                      </div>

                      {src.url && (
                        <a
                          href={src.url}
                          target="_blank"
                          rel="noreferrer"
                          className="text-emerald-600 dark:text-emerald-400 text-xs font-bold hover:underline flex items-center gap-1 shrink-0"
                        >
                          <span>Ver enlace</span>
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Next Recommended Content */}
            {activeArticle.nextContentId && (
              <div className="p-4 rounded-2xl bg-zinc-100 dark:bg-zinc-800/80 flex items-center justify-between gap-4">
                <div>
                  <div className="text-[10px] font-mono uppercase text-zinc-400 font-bold">
                    Siguiente lectura recomendada
                  </div>
                  <div className="text-xs font-bold text-zinc-800 dark:text-zinc-200">
                    {activeArticle.nextContentTitle}
                  </div>
                </div>

                <button
                  onClick={() => {
                    const nextArt = ENCYCLOPEDIA_ARTICLES.find(
                      (a) => a.id === activeArticle.nextContentId
                    );
                    if (nextArt) {
                      handleOpenArticle(nextArt);
                    }
                  }}
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer shrink-0"
                >
                  <span>Continuar</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
