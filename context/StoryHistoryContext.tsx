import React, { createContext, useState, useCallback, useEffect, ReactNode } from 'react';
import { Story } from '../types';

const STORAGE_KEY = 'ai_storybook_history';

interface StoryHistoryContextType {
  stories: Story[];
  saveStory: (story: Story) => void;
  deleteStory: (storyId: string) => void;
  isStorySaved: (storyId: string) => boolean;
  getStory: (storyId: string) => Story | undefined;
}

export const StoryHistoryContext = createContext<StoryHistoryContextType | undefined>(undefined);

export const StoryHistoryProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [stories, setStories] = useState<Story[]>([]);

  useEffect(() => {
    try {
      const storedStories = localStorage.getItem(STORAGE_KEY);
      if (storedStories) {
        setStories(JSON.parse(storedStories));
      }
    } catch (error) {
      console.error("Failed to load stories from localStorage", error);
      setStories([]); // Reset to empty on error
    }
  }, []);

  const updateLocalStorage = (newStories: Story[]) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newStories));
    } catch (error) {
      console.error("Failed to save to localStorage", error);
    }
  };

  const saveStory = useCallback((story: Story) => {
    setStories(prevStories => {
      // Add new or update existing story
      const newStories = [story, ...prevStories.filter(s => s.id !== story.id)];
      updateLocalStorage(newStories);
      return newStories;
    });
  }, []);
  
  const deleteStory = useCallback((storyId: string) => {
    setStories(prevStories => {
      const newStories = prevStories.filter(s => s.id !== storyId);
      updateLocalStorage(newStories);
      return newStories;
    });
  }, []);

  const getStory = useCallback((storyId: string): Story | undefined => {
    return stories.find(s => s.id === storyId);
  }, [stories]);

  const isStorySaved = useCallback((storyId: string): boolean => {
    return stories.some(s => s.id === storyId);
  }, [stories]);

  const value = { stories, saveStory, deleteStory, getStory, isStorySaved };

  return (
    <StoryHistoryContext.Provider value={value}>
      {children}
    </StoryHistoryContext.Provider>
  );
};
