import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { phases } from '../data/phases';
import { labList } from '../data/labs';

interface ProgressState {
  completedLabIds: string[];
  completedPhaseIds: string[];
  quizScores: Record<string, number>;
  notes: Record<string, string>;
  bookmarks: string[];
  theme: 'light' | 'dark';
  search: string;
  onboarding: boolean;
  currentLabId: string | null;
  toggleTheme: () => void;
  setSearch: (s: string) => void;
  completeLab: (id: string) => void;
  setNote: (labId: string, note: string) => void;
  toggleBookmark: (labId: string) => void;
  recordQuizScore: (topic: string, score: number) => void;
  setOnboarding: (v: boolean) => void;
  setCurrentLab: (id: string | null) => void;
  getTotalLabs: () => number;
  getProgress: () => number;
  isCompleted: (id: string) => boolean;
  isBookmarked: (id: string) => boolean;
}

const totalLabs = labList.length;

export const useProgress = create<ProgressState>()(
  persist(
    (set, get) => ({
      completedLabIds: [],
      completedPhaseIds: [],
      quizScores: {},
      notes: {},
      bookmarks: [],
      theme: 'dark',
      search: '',
      onboarding: true,
      currentLabId: null,

      toggleTheme: () =>
        set((state) => ({ theme: state.theme === 'dark' ? 'light' : 'dark' })),

      setSearch: (s) => set({ search: s }),

      completeLab: (id) =>
        set((state) => {
          const completed = new Set([...state.completedLabIds, id]);
          const next = Array.from(completed);
          const phaseIds = new Set<string>();
          for (const labId of next) {
            const lab = labList.find((l) => l.id === labId);
            if (lab) phaseIds.add(lab.phaseId);
          }
          return {
            completedLabIds: next,
            completedPhaseIds: Array.from(phaseIds),
          };
        }),

      setNote: (labId, note) =>
        set((state) => ({
          notes: { ...state.notes, [labId]: note },
        })),

      toggleBookmark: (labId) =>
        set((state) => ({
          bookmarks: state.bookmarks.includes(labId)
            ? state.bookmarks.filter((b) => b !== labId)
            : [...state.bookmarks, labId],
        })),

      recordQuizScore: (topic, score) =>
        set((state) => ({
          quizScores: { ...state.quizScores, [topic]: Math.max(state.quizScores[topic] ?? 0, score) },
        })),

      setOnboarding: (v) => set({ onboarding: v }),

      setCurrentLab: (id) => set({ currentLabId: id }),

      getTotalLabs: () => totalLabs,

      getProgress: () => {
        const total = get().getTotalLabs() || 1;
        return Math.round((get().completedLabIds.length / total) * 100);
      },

      isCompleted: (id) => get().completedLabIds.includes(id),
      isBookmarked: (id) => get().bookmarks.includes(id),
    }),
    { name: 'ccna-lab-progress' }
  )
);

export const getPhaseById = (id: string) => phases.find((p) => p.id === id);
export const getLabById = (id: string) => labList.find((l) => l.id === id);
