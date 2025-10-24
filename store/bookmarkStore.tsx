import { create } from "zustand";
import { persist } from "zustand/middleware";

interface BookmarkStore {
    bookmarks: string[]; // store supplier IDs
    toggleBookmark: (id: string) => void;
    isBookmarked: (id: string) => boolean;
    clearBookmarks: () => void;
}

export const useBookmarkStore = create<BookmarkStore>()(
    persist(
        (set, get) => ({
            bookmarks: [],
            toggleBookmark: (id) => {
                const { bookmarks } = get();
                console.log(id, "id");

                if (bookmarks.includes(id)) {
                    set({ bookmarks: bookmarks.filter((x) => x !== id) });
                } else {
                    set({ bookmarks: [...bookmarks, id] });
                }
            },
            isBookmarked: (id) => get().bookmarks.includes(id),
            clearBookmarks: () => set({ bookmarks: [] }),
        }),
        {
            name: "bookmark-storage", // persisted in localStorage
        }
    )
);
