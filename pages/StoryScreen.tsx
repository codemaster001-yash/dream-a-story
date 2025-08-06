
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { generateStoryContent, generateImage, generateCharacterImage, generateImagePrompt } from '../services/geminiService';
import { Story, Scene, StoryParams, Character } from '../types';
import Loader from '../components/Loader';
import SceneCard from '../components/SceneCard';
import { useTextToSpeech } from '../hooks/useTextToSpeech';
import { useStoryHistory } from '../hooks/useStoryHistory';
import { PlayIcon, PauseIcon, HeartIcon, HomeIcon, ArrowLeftIcon, ArrowRightIcon } from '../components/icons/Icons';

type LoadingState = 'idle' | 'generating_text' | 'generating_images' | 'generating_characters' | 'error' | 'done' | 'completed';

const getCardAnimation = (index: number, currentIndex: number, total: number) => {
    const offset = index - currentIndex;
    if (offset < 0) return { x: "-120%", rotate: -20, scale: 1, zIndex: total - index, opacity: 0 };
    if (offset > 0) {
        const maxVisibleCards = 3;
        const isVisible = offset <= maxVisibleCards;
        const rotation = (offset * 5 * (index % 2 === 0 ? -1 : 1)); 
        return { x: 0, y: 0, scale: 1 - Math.min(offset, maxVisibleCards) * 0.05, rotate: isVisible ? rotation : 0, zIndex: total - index, opacity: isVisible ? 1 : 0 };
    }
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
      setCurrentSceneIndex(prev => (story && prev < story.scenes.length - 1) ? prev + 1 : prev);
  }, [story]);

  const goToPrevScene = useCallback(() => {
      setCurrentSceneIndex(prev => (prev > 0) ? prev - 1 : prev);
  }, []);

  const handleSpeechEnd = useCallback(() => {
    setTimeout(() => goToNextScene(), 500);
  }, [goToNextScene]);

  const { speak, stop, isSpeaking } = useTextToSpeech(handleSpeechEnd);

  const scenes = useMemo(() => story?.scenes || [], [story]);
  const activeScene = scenes[currentSceneIndex];

  useEffect(() => {
    stop();
  }, [currentSceneIndex, stop]);

  useEffect(() => {
    const generateNewStory = async (params: StoryParams) => {
      try {
        // --- PHASE 1: GENERATE STORY TEXT ---
        setLoadingState('generating_text');
        const { title, scenes: rawScenes, characters: rawCharacters } = await generateStoryContent(params);
        
        let initialStory: Story = {
            id: `${Date.now()}`,
            title,
            params,
            scenes: rawScenes.map((s, i) => ({ ...s, id: `${Date.now()}-s-${i}`, imagePrompt: '', imageUrl: undefined, imageError: false })),
            characters: rawCharacters.map((c, i) => ({...c, id: `${Date.now()}-c-${i}`, imageUrl: undefined, imageError: false})),
            createdAt: Date.now()
        };
        setStory(initialStory);
        setCurrentSceneIndex(0);
        
        // --- PHASE 2: GENERATE SCENE IMAGES PROGRESSIVELY ---
        setLoadingState('generating_images');
        for (const scene of initialStory.scenes) {
            try {
                const imagePrompt = await generateImagePrompt(scene.text);
                setStory(currentStory => {
                    if (!currentStory) return null;
                    const updatedScenes = currentStory.scenes.map(s => s.id === scene.id ? { ...s, imagePrompt } : s);
                    return { ...currentStory, scenes: updatedScenes };
                });

                const imageUrl = await generateImage(imagePrompt);
                setStory(currentStory => {
                    if (!currentStory) return null;
                    const updatedScenes = currentStory.scenes.map(s => s.id === scene.id ? { ...s, imageUrl } : s);
                    return { ...currentStory, scenes: updatedScenes };
                });
            } catch (err) {
                console.error(`Failed to generate image for scene ${scene.id}:`, err);
                setStory(currentStory => {
                    if (!currentStory) return null;
                    const updatedScenes = currentStory.scenes.map(s => s.id === scene.id ? { ...s, imageError: true } : s);
                    return { ...currentStory, scenes: updatedScenes };
                });
            }
        }
        
        // --- PHASE 3: GENERATE CHARACTER IMAGES PROGRESSIVELY ---
        setLoadingState('generating_characters');
        for (const character of initialStory.characters) {
            try {
                const imageUrl = await generateCharacterImage(character.description);
                setStory(currentStory => {
                    if (!currentStory) return null;
                    const updatedCharacters = currentStory.characters.map(c => c.name === character.name ? { ...c, imageUrl } : c);
                    return { ...currentStory, characters: updatedCharacters };
                });
            } catch (err) {
                console.error(`Failed to generate image for character ${character.name}:`, err);
                 setStory(currentStory => {
                    if (!currentStory) return null;
                    const updatedCharacters = currentStory.characters.map(c => c.name === character.name ? { ...c, imageError: true } : c);
                    return { ...currentStory, characters: updatedCharacters };
                });
            }
        }

        setLoadingState('completed');

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
  }, [location.state, navigate, story]);

  // Handle the 'completed' state to show a message and then switch to 'done'
  useEffect(() => {
      if (loadingState === 'completed') {
          const timer = setTimeout(() => {
              setLoadingState('done');
          }, 1500); // Show "complete" message for 1.5s
          return () => clearTimeout(timer);
      }
  }, [loadingState]);


  const handlePlayPause = () => {
    if (isSpeaking) stop();
    else if (activeScene) speak(activeScene.text);
  }

  const handleSave = () => {
    if (story && (loadingState === 'done' || loadingState === 'completed')) {
        saveStory(story);
    }
  }

  const getLoaderText = () => {
    switch(loadingState) {
        case 'generating_text': return 'Dreaming up a new story...';
        case 'generating_images': return 'Painting the scenes...';
        case 'generating_characters': return 'Creating the characters...';
        case 'completed': return 'Generation Complete!';
        default: return 'Getting things ready...';
    }
  }

  const renderContent = () => {
    if (loadingState !== 'done' && loadingState !== 'error') {
      return (
        <div className="flex flex-col items-center justify-center h-full">
            <Loader text={getLoaderText()} />
            {story && (
                <div className="w-64 h-96 rounded-2xl bg-white shadow-xl flex items-center justify-center p-4">
                    <p className="text-gray-600 text-center italic">{story.title || '...'}</p>
                </div>
            )}
        </div>
      );
    }
    if (loadingState === 'error') {
      return (
        <div className="p-8 text-center text-red-600">
          <h2 className="text-2xl font-bold mb-4">Oh no! Something went wrong.</h2>
          <p className="text-gray-700 bg-red-100 p-3 rounded-lg">{errorMessage}</p>
          <button onClick={() => navigate('/')} className="mt-6 px-6 py-2 bg-orange-500 text-white rounded-full">Try Again</button>
        </div>
      );
    }
    if (story) {
        return (
            <div className="w-full h-full flex flex-col">
              <div className="p-4 pr-20 flex justify-between items-center text-gray-700 flex-shrink-0">
                <button onClick={() => navigate('/')} className="p-2 rounded-full hover:bg-gray-200/50">
                  <HomeIcon className="w-8 h-8"/>
                </button>
                <h2 className="font-bold text-lg text-center truncate px-2 flex-grow">{story.title}</h2>
                <button onClick={handleSave} className={`p-2 rounded-full transition-colors duration-200 ${isStorySaved(story.id) ? 'text-red-500' : 'text-gray-400 hover:text-red-400'}`}>
                    <HeartIcon className="w-8 h-8" isFilled={isStorySaved(story.id)}/>
                </button>
              </div>
              <div className="flex-grow relative p-6">
                 {scenes.map((scene, index) => (
                     <motion.div
                         key={scene.id}
                         className="absolute w-full h-full touch-pan-y"
                         drag={index === currentSceneIndex ? 'x' : false}
                         dragConstraints={{ left: 0, right: 0 }}
                         dragElastic={0.2}
                         onDragEnd={(e, { offset, velocity }) => {
                             const swipePower = Math.abs(offset.x) * velocity.x;
                             if (swipePower < -10000) goToNextScene();
                             else if (swipePower > 10000) goToPrevScene();
                         }}
                         initial={false}
                         animate={getCardAnimation(index, currentSceneIndex, scenes.length)}
                         transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                     >
                         <SceneCard scene={scene} />
                     </motion.div>
                 ))}
              </div>
               <div className="p-4 flex justify-around items-center w-full max-w-xs mx-auto flex-shrink-0 mb-2">
                 <button onClick={goToPrevScene} disabled={currentSceneIndex <= 0} className="p-3 bg-white/60 rounded-full text-gray-700 backdrop-blur-md shadow-lg disabled:opacity-30 disabled:cursor-not-allowed hover:bg-white/90 transition-all">
                    <ArrowLeftIcon className="w-7 h-7" />
                 </button>
                 <button onClick={handlePlayPause} className="p-3 bg-orange-500 rounded-full text-white shadow-xl transform hover:scale-110 transition-transform">
                    {isSpeaking ? <PauseIcon className="w-10 h-10" /> : <PlayIcon className="w-10 h-10" />}
                 </button>
                 <button onClick={goToNextScene} disabled={!story || currentSceneIndex >= story.scenes.length - 1} className="p-3 bg-white/60 rounded-full text-gray-700 backdrop-blur-md shadow-lg disabled:opacity-30 disabled:cursor-not-allowed hover:bg-white/90 transition-all">
                    <ArrowRightIcon className="w-7 h-7" />
                 </button>
               </div>
            </div>
        );
    }
    return null;
  }

  return (
    <div className="w-full h-full flex items-center justify-center">
      {renderContent()}
    </div>
  );
};

export default StoryScreen;