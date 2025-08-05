import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { generateStoryContent, generateImage, generateCharacterImage } from '../services/geminiService';
import { Story, Scene, StoryParams } from '../types';
import Loader from '../components/Loader';
import SceneCard from '../components/SceneCard';
import { useTextToSpeech } from '../hooks/useTextToSpeech';
import { useStoryHistory } from '../hooks/useStoryHistory';
import { PlayIcon, PauseIcon, HeartIcon, HomeIcon, ArrowLeftIcon, ArrowRightIcon } from '../components/icons/Icons';

type LoadingState = 'idle' | 'generating_text' | 'generating_images' | 'generating_characters' | 'error' | 'done';

const getCardAnimation = (index: number, currentIndex: number, total: number) => {
    const offset = index - currentIndex;

    if (offset < 0) { // Card has been swiped away to the left
        return { x: "-120%", rotate: -20, scale: 1, zIndex: total - index, opacity: 0 };
    }
     if (offset > 0) { // Cards underneath the current one
        const maxVisibleCards = 3;
        const isVisible = offset <= maxVisibleCards;
        // zig-zag rotation
        const rotation = (offset * 5 * (index % 2 === 0 ? -1 : 1)); 
        return {
            x: 0,
            y: 0, // No vertical offset
            scale: 1 - Math.min(offset, maxVisibleCards) * 0.05,
            rotate: isVisible ? rotation : 0,
            zIndex: total - index,
            opacity: isVisible ? 1 : 0,
        };
     }
     // The current, active card
    return { x: 0, y: 0, rotate: 0, scale: 1, zIndex: total + 1, opacity: 1 };
};


const StoryScreen: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { saveStory, isStorySaved } = useStoryHistory();

  const [story, setStory] = useState<Story | null>(location.state?.story || null);
  const [loadingState, setLoadingState] = useState<LoadingState>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [currentSceneIndex, setCurrentSceneIndex] = useState(0);
  
  const goToNextScene = useCallback(() => {
      setCurrentSceneIndex(prev => {
          if (story && prev < story.scenes.length - 1) {
              return prev + 1;
          }
          return prev;
      });
  }, [story]);

  const goToPrevScene = useCallback(() => {
      setCurrentSceneIndex(prev => {
          if (prev > 0) {
              return prev - 1;
          }
          return prev;
      });
  }, []);

  const handleSpeechEnd = useCallback(() => {
    // Add a small delay for a natural pause before turning the page
    setTimeout(() => {
        goToNextScene();
    }, 500);
  }, [goToNextScene]);

  const { speak, stop, isSpeaking } = useTextToSpeech(handleSpeechEnd);

  const scenes = useMemo(() => story?.scenes || [], [story]);
  const activeScene = scenes[currentSceneIndex];

  useEffect(() => {
    // Stop speech when scene changes manually
    stop();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentSceneIndex]);


  useEffect(() => {
    const generateNewStory = async (params: StoryParams) => {
      try {
        setLoadingState('generating_text');
        const { title, scenes: rawScenes, characters: rawCharacters } = await generateStoryContent(params);
        
        const scenesWithIds = rawScenes.map((s, i) => ({ ...s, id: `${Date.now()}-${i}`, imageUrl: undefined }));
        
        let newStory: Story = {
            id: `${Date.now()}`,
            title,
            params,
            scenes: scenesWithIds,
            characters: rawCharacters.map(c => ({...c, imageUrl: undefined})),
            createdAt: Date.now()
        };
        setStory(newStory);
        setCurrentSceneIndex(0);
        
        setLoadingState('generating_images');
        const imagePromises = newStory.scenes.map(scene => generateImage(scene.imagePrompt));
        const imageUrls = await Promise.all(imagePromises);

        newStory = {
            ...newStory,
            scenes: newStory.scenes.map((scene, i) => ({ ...scene, imageUrl: imageUrls[i] }))
        };
        setStory(newStory);

        setLoadingState('generating_characters');
        const characterImagePromises = newStory.characters.map(char => generateCharacterImage(char.description));
        const characterImageUrls = await Promise.all(characterImagePromises);
        
        newStory = {
            ...newStory,
            characters: newStory.characters.map((char, i) => ({ ...char, imageUrl: characterImageUrls[i] }))
        }
        setStory(newStory);

        setLoadingState('done');

      } catch (err) {
        setErrorMessage(err instanceof Error ? err.message : 'An unknown error occurred.');
        setLoadingState('error');
      }
    };
    
    if (location.state?.params && !story) {
      generateNewStory(location.state.params);
    } else if (story) {
        setCurrentSceneIndex(0);
        setLoadingState('done');
    } else {
      navigate('/');
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.state, navigate]);

  const handlePlayPause = () => {
    if (isSpeaking) {
        stop();
    } else if (activeScene){
        speak(activeScene.text);
    }
  }

  const handleSave = () => {
    if (story && loadingState === 'done') {
        saveStory(story);
    }
  }

  const getLoaderText = () => {
    switch(loadingState) {
        case 'generating_text':
            return 'Dreaming up a new story...';
        case 'generating_images':
            return 'Painting the scenes...';
        case 'generating_characters':
            return 'Creating the characters...';
        default:
            return 'Getting things ready...';
    }
  }

  const renderContent = () => {
    if (loadingState !== 'done' && loadingState !== 'error') {
      return <Loader text={getLoaderText()} />;
    }
    if (loadingState === 'error') {
      return (
        <div className="p-8 text-center text-red-600">
          <h2 className="text-2xl font-bold mb-4">Oh no!</h2>
          <p>{errorMessage}</p>
          <button onClick={() => navigate('/')} className="mt-6 px-6 py-2 bg-orange-500 text-white rounded-full">Try Again</button>
        </div>
      );
    }
    if (loadingState === 'done' && story) {
        return (
            <div className="w-full h-full flex flex-col">
              <div className="p-4 flex justify-between items-center text-gray-700 flex-shrink-0">
                <button onClick={() => navigate('/')} className="p-2 rounded-full hover:bg-gray-200/50">
                  <HomeIcon className="w-8 h-8"/>
                </button>
                <h2 className="font-bold text-lg text-center truncate px-2 flex-grow">{story.title}</h2>
                <button onClick={handleSave} className={`p-2 rounded-full transition-colors duration-200 ${isStorySaved(story.id) ? 'text-red-500' : 'text-gray-400 hover:text-red-400'}`}>
                    <HeartIcon className="w-8 h-8" isFilled={isStorySaved(story.id)}/>
                </button>
              </div>
              <div className="flex-grow relative">
                 {scenes.map((scene, index) => {
                     const isCurrent = index === currentSceneIndex;
                     return (
                         <motion.div
                             key={scene.id}
                             className="absolute w-full h-full"
                             drag={isCurrent ? 'x' : false}
                             dragConstraints={{ left: 0, right: 0 }}
                             dragElastic={0.2}
                             onDragEnd={(e, { offset, velocity }) => {
                                 const swipePower = Math.abs(offset.x) * velocity.x;
                                 if (swipePower < -10000) {
                                     goToNextScene();
                                 } else if (swipePower > 10000) {
                                     goToPrevScene();
                                 }
                             }}
                             initial={false}
                             animate={getCardAnimation(index, currentSceneIndex, scenes.length)}
                             transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                         >
                             <SceneCard scene={scene} />
                         </motion.div>
                     )
                 })}
              </div>
               <div className="p-4 flex justify-around items-center w-full max-w-xs mx-auto flex-shrink-0 mb-2">
                 <button 
                    onClick={goToPrevScene} 
                    disabled={currentSceneIndex <= 0}
                    className="p-3 bg-white/80 rounded-full shadow-lg backdrop-blur-sm transform hover:scale-105 transition-transform disabled:opacity-30 disabled:cursor-not-allowed"
                    aria-label="Previous scene"
                 >
                    <ArrowLeftIcon className="text-orange-500 w-8 h-8" />
                 </button>
                 <button onClick={handlePlayPause} className="p-3 bg-white/80 rounded-full shadow-lg backdrop-blur-sm transform hover:scale-105 transition-transform">
                    {isSpeaking ? <PauseIcon className="text-orange-500 w-12 h-12" /> : <PlayIcon className="text-orange-500 w-12 h-12" />}
                 </button>
                 <button 
                    onClick={goToNextScene} 
                    disabled={currentSceneIndex >= scenes.length - 1}
                    className="p-3 bg-white/80 rounded-full shadow-lg backdrop-blur-sm transform hover:scale-105 transition-transform disabled:opacity-30 disabled:cursor-not-allowed"
                    aria-label="Next scene"
                 >
                    <ArrowRightIcon className="text-orange-500 w-8 h-8" />
                 </button>
               </div>
            </div>
        );
    }
    return null;
  };

  return (
    <div className="h-full w-full flex flex-col justify-center items-center overflow-hidden">
        {renderContent()}
    </div>
  );
};

export default StoryScreen;