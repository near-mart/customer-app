import { create } from "zustand";
import { persist } from "zustand/middleware";

interface BookmarkStore {
    bookmarks: string[];
    addBookmark: (supplier_id: string) => void;
    removeBookmark: (supplier_id: string) => void;
    isBookmarked: (id: string) => boolean;
    clearBookmarks: () => void;
}

export const useBookmarkStore = create<BookmarkStore>()(
    persist(
        (set, get) => ({
            bookmarks: [],

            addBookmark: (supplier_id) =>
                set((state) => ({
                    bookmarks: [...state.bookmarks, supplier_id],
                })),

            removeBookmark: (supplier_id) =>
                set((state) => ({
                    bookmarks: state.bookmarks.filter((id) => id !== supplier_id),
                })),

            isBookmarked: (id) => get().bookmarks.includes(id),

            clearBookmarks: () => set({ bookmarks: [] }),
        }),
        {
            name: "bookmark-storage", // persisted locally
        }
    )
);
