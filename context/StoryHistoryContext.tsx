
import React, { createContext, useState, useCallback, useEffect, ReactNode } from 'react';
import { Story } from '../types';
import { initDB, saveStoryDB, getAllStoriesDB, deleteStoryDB } from '../services/dbService';

interface StoryHistoryContextType {
  stories: Story[];
  saveStory: (story: Story) => Promise<void>;
  deleteStory: (storyId: string) => Promise<void>;
  isStorySaved: (storyId: string) => boolean;
  getStory: (storyId: string) => Story | undefined;
}

export const StoryHistoryContext = createContext<StoryHistoryContextType | undefined>(undefined);

export const StoryHistoryProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [stories, setStories] = useState<Story[]>([]);
  const [isDBInitialized, setIsDBInitialized] = useState(false);

  // Initialize the database on component mount.
  useEffect(() => {
    const initialize = async () => {
      try {
        await initDB();
        const loadedStories = await getAllStoriesDB();
        setStories(loadedStories);
        setIsDBInitialized(true);
      } catch (error) {
        console.error("Failed to initialize database and load stories:", error);
      }
    };
    initialize();
  }, []);

  const saveStory = useCallback(async (story: Story) => {
    if (!isDBInitialized) {
        console.error("Database not ready. Cannot save story.");
        return;
    }
    try {
      await saveStoryDB(story);
      // Update the local state to reflect the change immediately.
      setStories(prevStories => {
          const otherStories = prevStories.filter(s => s.id !== story.id);
          return [story, ...otherStories].sort((a,b) => b.createdAt - a.createdAt);
      });
    } catch (error) {
      console.error("Failed to save story to database:", error);
    }
  }, [isDBInitialized]);
  
  const deleteStory = useCallback(async (storyId: string) => {
    if (!isDBInitialized) {
        console.error("Database not ready. Cannot delete story.");
        return;
    }
    try {
        await deleteStoryDB(storyId);
        // Update the local state to reflect the deletion.
        setStories(prevStories => prevStories.filter(s => s.id !== storyId));
    } catch (error) {
        console.error("Failed to delete story from database:", error);
    }
  }, [isDBInitialized]);

  const getStory = useCallback((storyId: string): Story | undefined => {
    return stories.find(s => s.id === storyId);
  }, [stories]);

  const isStorySaved = useCallback((storyId:string): boolean => {
    return stories.some(s => s.id === storyId);
  }, [stories]);

  const value = { stories, saveStory, deleteStory, getStory, isStorySaved };

  return (
    <StoryHistoryContext.Provider value={value}>
      {children}
    </StoryHistoryContext.Provider>
  );
};
