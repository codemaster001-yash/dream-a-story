import { useContext } from 'react';
import { StoryHistoryContext } from '../context/StoryHistoryContext';

// This hook now acts as a simple pass-through to the context.
// This ensures that all components share the exact same state and functions.
export const useStoryHistory = () => {
  const context = useContext(StoryHistoryContext);
  if (context === undefined) {
      throw new Error('useStoryHistory must be used within a StoryHistoryProvider');
  }
  return context;
};
