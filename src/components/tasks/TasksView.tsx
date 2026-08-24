import React, { useState } from "react";
import {
  CalendarCheck,
  Plus,
  CheckCircle2,
  Circle,
  Calendar as CalendarIcon,
  Clock,
  Repeat,
  AlertCircle,
  Trash2,
  Filter,
} from "lucide-react";
import { useCultiva } from "../../context/CultivaContext";
import { Priority, Tarea } from "../../types";

export const TasksView: React.FC = () => {
  const {
    activeCrop,
    activeCropTasks,
    activeCropPlants,
    toggleTarea,
    deleteTarea,
    setIsQuickAddOpen,
  } = useCultiva();

  const [viewMode, setViewMode] = useState<"list" | "calendar">("list");
  const [priorityFilter, setPriorityFilter] = useState<string>("todas");
  const [statusFilter, setStatusFilter] = useState<"todas" | "pendientes" | "completadas">("pendientes");

  const filteredTasks = activeCropTasks.filter((t) => {
    if (statusFilter === "pendientes" && t.completed) return false;
    if (statusFilter === "completadas" && !t.completed) return false;
    if (priorityFilter !== "todas" && t.priority !== priorityFilter) return false;
    return true;
  });

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2.5">
            <CalendarCheck className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
            Tareas y Calendario
          </h1>
          <p className="text-xs sm:text-sm text-zinc-500">
            Organiza rutinas de riego, aplicaciones, podas y mantenimiento periódico
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => setIsQuickAddOpen(true)}
            className="flex items-center space-x-1.5 px-4 py-2 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md shadow-emerald-600/20 active:scale-95 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>+ Programar Tarea</span>
          </button>
        </div>
      </div>

      {/* Filter and Status Card */}
      <div className="p-4 rounded-[2rem] bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-3">
        {/* Status Filter buttons */}
        <div className="flex bg-zinc-100 dark:bg-zinc-800 p-1 rounded-full w-full sm:w-auto">
          {[
            { id: "pendientes", label: "Pendientes" },
            { id: "completadas", label: "Completadas" },
            { id: "todas", label: "Todas" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setStatusFilter(tab.id as any)}
              className={`flex-1 sm:flex-none px-3.5 py-1.5 rounded-full text-xs font-bold transition-all ${
                statusFilter === tab.id
                  ? "bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 shadow-2xs"
                  : "text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Priority Filter */}
        <select
          value={priorityFilter}
          onChange={(e) => setPriorityFilter(e.target.value)}
          className="w-full sm:w-auto px-3.5 py-1.5 text-xs rounded-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-800 dark:text-zinc-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 font-medium"
        >
          <option value="todas">Todas las prioridades</option>
          <option value="alta">Prioridad Alta</option>
          <option value="media">Prioridad Media</option>
          <option value="baja">Prioridad Baja</option>
        </select>
      </div>

      {/* Task List */}
      <div className="space-y-3">
        {filteredTasks.length === 0 ? (
          <div className="p-12 text-center rounded-[2rem] bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 space-y-3">
            <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto" />
            <p className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">
              ¡Todo al día! No hay tareas pendientes en esta categoría
            </p>
            <button
              onClick={() => setIsQuickAddOpen(true)}
              className="text-xs text-emerald-600 font-bold hover:underline"
            >
              + Agregar una nueva tarea
            </button>
          </div>
        ) : (
          filteredTasks.map((task) => {
            const plantObj = activeCropPlants.find((p) => p.id === task.plantaId);

            return (
              <div
                key={task.id}
                className={`p-5 rounded-[2rem] bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-2xs transition-all flex items-start justify-between gap-4 ${
                  task.completed ? "opacity-60 bg-zinc-50/50 dark:bg-zinc-900/40" : ""
                }`}
              >
                <div className="flex items-start space-x-3.5">
                  <button
                    onClick={() => toggleTarea(task.id)}
                    className="mt-0.5 text-emerald-600 dark:text-emerald-400 hover:scale-110 active:scale-95 transition-transform shrink-0"
                  >
                    {task.completed ? (
                      <CheckCircle2 className="w-5 h-5 fill-emerald-100 dark:fill-emerald-950/60" />
                    ) : (
                      <Circle className="w-5 h-5 text-zinc-400 hover:text-emerald-600" />
                    )}
                  </button>

                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className={`text-sm font-bold ${
                          task.completed
                            ? "line-through text-zinc-400"
                            : "text-zinc-900 dark:text-zinc-100"
                        }`}
                      >
                        {task.title}
                      </span>

                      {/* Priority Pill */}
                      <span
                        className={`text-[10px] uppercase font-mono font-bold px-2 py-0.5 rounded-full ${
                          task.priority === "alta"
                            ? "bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-400"
                            : task.priority === "media"
                            ? "bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400"
                            : "bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400"
                        }`}
                      >
                        {task.priority}
                      </span>

                      {task.recurring && (
                        <span className="flex items-center gap-1 text-[10px] font-mono text-teal-600 dark:text-teal-400 bg-teal-50 dark:bg-teal-950/40 px-2 py-0.5 rounded-full">
                          <Repeat className="w-3 h-3" />
                          <span>{task.recurring}</span>
                        </span>
                      )}
                    </div>

                    {task.description && (
                      <p className="text-xs text-zinc-500 leading-relaxed">
                        {task.description}
                      </p>
                    )}

                    <div className="flex flex-wrap items-center gap-3 text-xs text-zinc-400 pt-1 font-mono">
                      <span className="flex items-center gap-1">
                        <CalendarIcon className="w-3.5 h-3.5 text-zinc-400" />
                        <span>{task.date}</span>
                      </span>

                      {plantObj && (
                        <span>🌱 Para: {plantObj.name}</span>
                      )}
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => deleteTarea(task.id)}
                  className="p-1.5 text-zinc-400 hover:text-rose-600 rounded-full hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors shrink-0"
                  title="Eliminar tarea"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
