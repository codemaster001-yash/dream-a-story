import React, { useMemo, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useStoryHistory } from "../hooks/useStoryHistory";
import Header from "../components/Header";
import { Story } from "../types";
import { TrashIcon, SparklesIcon } from "../components/icons/Icons";

const StoryHistoryCard: React.FC<{
  story: Story;
  onClick: () => void;
  onDelete: (e: React.MouseEvent) => void;
}> = ({ story, onClick, onDelete }) => {
  const firstImage = story.scenes?.[0]?.imageUrl;
  return (
    <div
      onClick={onClick}
      className="bg-white rounded-2xl shadow-lg overflow-hidden cursor-pointer transform hover:scale-105 transition-transform duration-300 flex flex-col relative group aspect-square"
    >
      {firstImage ? (
        <img
          src={firstImage}
          alt={story.title}
          className="absolute inset-0 w-full h-full object-cover z-0"
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center bg-orange-100">
          <SparklesIcon className="w-12 h-12 text-orange-300" />
        </div>
      )}

      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/40 to-transparent z-10"></div>

      <button
        onClick={onDelete}
        className="absolute top-2 right-2 p-1.5 bg-white/60 rounded-full text-red-500 backdrop-blur-sm opacity-0 group-hover:opacity-100 hover:bg-white/90 transition-all duration-200 z-20"
        aria-label="Delete story"
      >
        <TrashIcon />
      </button>

      <div className="relative z-20 flex flex-col justify-end h-full p-4 text-white">
        <h3 className="font-bold text-base line-clamp-3 leading-tight drop-shadow-md">
          {story.title}
        </h3>
        <div className="flex justify-between items-center mt-2 text-xs">
          <p className="capitalize truncate opacity-90 drop-shadow">
            {new Date(story.createdAt).toLocaleDateString()}
          </p>
          <span className="bg-white/30 backdrop-blur-sm font-semibold px-2 py-0.5 rounded-full">
            {story.params.language}
          </span>
        </div>
      </div>
    </div>
  );
};

const HistoryScreen: React.FC = () => {
  const { stories, deleteStory } = useStoryHistory();
  const navigate = useNavigate();
  const location = useLocation();

  const characterFilter = location.state?.characterFilter;

  const filteredStories = useMemo(() => {
    let sortedStories = [...stories].sort((a, b) => b.createdAt - a.createdAt);
    if (characterFilter) {
      return sortedStories.filter((story) =>
        story.characters?.some((c) => c.name === characterFilter)
      );
    }
    return sortedStories;
  }, [stories, characterFilter]);

  const handleStoryClick = (story: Story) => {
    navigate("/story", { state: { story } });
  };

  const handleDeleteClick = useCallback(
    (e: React.MouseEvent, storyId: string) => {
      e.stopPropagation(); // Prevent card click event from firing
      if (
        window.confirm("Are you sure you want to delete this story forever?")
      ) {
        deleteStory(storyId);
      }
    },
    [deleteStory]
  );

  const clearFilter = () => {
    navigate("/history", { replace: true, state: {} });
  };

  return (
    <div className="p-6">
      <Header
        title="My Storybook"
        subtitle={
          characterFilter
            ? `Stories featuring ${characterFilter}`
            : "Revisit your favorite tales"
        }
      />

      {characterFilter && (
        <div className="text-center mb-4">
          <button
            onClick={clearFilter}
            className="px-4 py-2 bg-orange-100 text-orange-700 text-sm font-semibold rounded-full hover:bg-orange-200 transition-colors"
          >
            Show All Stories
          </button>
        </div>
      )}

      {filteredStories.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-gray-500">
            {characterFilter
              ? "No stories found for this character."
              : "You haven't created any stories yet."}
          </p>
          <button
            onClick={() => navigate("/")}
            className="mt-4 px-6 py-2 bg-orange-500 text-white font-bold rounded-full shadow-md hover:bg-orange-600"
          >
            Create a New Story
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 pb-4">
          {filteredStories.map((story) => (
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
