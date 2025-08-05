import React, { useMemo, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useStoryHistory } from '../hooks/useStoryHistory';
import Header from '../components/Header';
import { Story } from '../types';
import { TrashIcon } from '../components/icons/Icons';

const StoryHistoryCard: React.FC<{ story: Story; onClick: () => void; onDelete: (e: React.MouseEvent) => void; }> = ({ story, onClick, onDelete }) => {
    const firstSceneWithImage = story.scenes.find(s => s.imageUrl);
    return (
        <div onClick={onClick} className="bg-white rounded-2xl shadow-lg overflow-hidden cursor-pointer transform hover:scale-105 transition-transform duration-300 flex flex-col relative group">
            <div className="h-40 bg-orange-100 relative">
                {firstSceneWithImage && <img src={firstSceneWithImage.imageUrl} alt={story.title} className="w-full h-full object-cover" />}
                 <span className="absolute top-2 right-2 text-xs bg-black/50 text-white font-semibold px-2 py-1 rounded-full">{story.params.language}</span>
            </div>
            <div className="p-3 flex flex-col flex-grow">
                <h3 className="font-bold text-gray-800 truncate text-base">{story.title}</h3>
                <p className="text-sm text-gray-500 capitalize flex-grow">{story.params.theme}</p>
                <p className="text-xs text-gray-400 mt-2 self-start">{new Date(story.createdAt).toLocaleDateString()}</p>
            </div>
            <button 
                onClick={onDelete} 
                className="absolute top-2 left-2 p-1.5 bg-white/50 rounded-full text-red-500 backdrop-blur-sm opacity-0 group-hover:opacity-100 hover:bg-white transition-all duration-200"
                aria-label="Delete story"
            >
                <TrashIcon />
            </button>
        </div>
    );
};

const HistoryScreen: React.FC = () => {
  const { stories, deleteStory } = useStoryHistory();
  const navigate = useNavigate();
  const location = useLocation();

  const characterFilter = location.state?.characterFilter;

  const filteredStories = useMemo(() => {
    if (characterFilter) {
      return stories.filter(story => story.characters?.some(c => c.name === characterFilter));
    }
    return stories;
  }, [stories, characterFilter]);

  const handleStoryClick = (story: Story) => {
    navigate('/story', { state: { story } });
  };

  const handleDeleteClick = useCallback((e: React.MouseEvent, storyId: string) => {
      e.stopPropagation(); // Prevent card click event from firing
      if(window.confirm('Are you sure you want to delete this story forever?')) {
        deleteStory(storyId);
      }
  }, [deleteStory]);

  const clearFilter = () => {
    navigate('/history', { replace: true, state: {} });
  }

  return (
    <div className="p-6">
      <Header title="My Storybook" subtitle={characterFilter ? `Stories featuring ${characterFilter}` : "Revisit your favorite tales"} />
      
      {characterFilter && (
        <div className="text-center mb-4">
          <button onClick={clearFilter} className="px-4 py-2 bg-orange-100 text-orange-700 text-sm font-semibold rounded-full hover:bg-orange-200 transition-colors">
            Show All Stories
          </button>
        </div>
      )}

      {filteredStories.length === 0 ? (
        <div className="text-center py-20">
            <p className="text-gray-500">{characterFilter ? "No stories found for this character." : "You haven't created any stories yet."}</p>
            <button onClick={() => navigate('/')} className="mt-4 px-6 py-2 bg-orange-500 text-white font-bold rounded-full shadow-md hover:bg-orange-600">
                Create a New Story
            </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 pb-4">
          {filteredStories.map(story => (
            <StoryHistoryCard 
                key={story.id} 
                story={story} 
                onClick={() => handleStoryClick(story)}
                onDelete={(e) => handleDeleteClick(e, story.id)} 
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default HistoryScreen;