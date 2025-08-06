import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence, PanInfo } from "framer-motion";
import {
  generateStoryContent,
  generateImage,
  generateCharacterImage,
  generateImagePrompt,
} from "../services/geminiService";
import { Story, StoryParams } from "../types";
import Loader from "../components/Loader";
import SceneCard from "../components/SceneCard";
import { useTextToSpeech } from "../hooks/useTextToSpeech";
import { useStoryHistory } from "../hooks/useStoryHistory";
import {
  PlayIcon,
  PauseIcon,
  HeartIcon,
  HomeIcon,
  ArrowLeftIcon,
  ArrowRightIcon,
} from "../components/icons/Icons";

type LoadingState =
  | "idle"
  | "generating_text"
  | "generating_images"
  | "generating_characters"
  | "error"
  | "done"
  | "completed";

const cardVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? "100%" : "-100%",
    opacity: 0,
  }),
  center: {
    zIndex: 1,
    x: 0,
    opacity: 1,
  },
  exit: (direction: number) => ({
    zIndex: 0,
    x: direction < 0 ? "100%" : "-100%",
    opacity: 0,
  }),
};

const swipeConfidenceThreshold = 10000;

const StoryScreen: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { saveStory, isStorySaved } = useStoryHistory();

  const [story, setStory] = useState<Story | null>(
    location.state?.story || null
  );
  const [loadingState, setLoadingState] = useState<LoadingState>("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const [[currentSceneIndex, direction], setPage] = useState([0, 0]);
  const [isAutoPlaying, setIsAutoPlaying] = useState(false);

  const scenes = useMemo(() => story?.scenes || [], [story]);
  const activeScene = useMemo(
    () => scenes[currentSceneIndex],
    [scenes, currentSceneIndex]
  );

  const paginate = useCallback(
    (newDirection: number) => {
      if (
        !story ||
        (newDirection > 0 && currentSceneIndex >= story.scenes.length - 1) ||
        (newDirection < 0 && currentSceneIndex <= 0)
      ) {
        return;
      }
      setPage([currentSceneIndex + newDirection, newDirection]);
    },
    [currentSceneIndex, story]
  );

  const handleSpeechEnd = useCallback(() => {
    if (isAutoPlaying) {
      if (currentSceneIndex < (story?.scenes.length ?? 0) - 1) {
        paginate(1);
      } else {
        setIsAutoPlaying(false);
      }
    }
  }, [isAutoPlaying, currentSceneIndex, story, paginate]);

  const { speak, stop, isSpeaking } = useTextToSpeech(handleSpeechEnd);

  useEffect(() => {
    // When the scene changes, stop any speech from the previous scene
    stop();
    // If we're in autoplay mode, start speaking the new scene's text
    if (isAutoPlaying && activeScene) {
      speak(activeScene.text);
    }
  }, [currentSceneIndex, stop]); // Only depends on index and stop, not the whole activeScene object

  // This effect is now solely for starting autoplay on a new scene after pagination.
  useEffect(() => {
    if (isAutoPlaying && activeScene && !isSpeaking) {
      speak(activeScene.text);
    }
  }, [isAutoPlaying, activeScene, isSpeaking, speak]);

  useEffect(() => {
    const generateNewStory = async (params: StoryParams) => {
      try {
        setLoadingState("generating_text");
        const {
          title,
          scenes: rawScenes,
          characters: rawCharacters,
        } = await generateStoryContent(params);

        let initialStory: Story = {
          id: crypto.randomUUID(),
          title,
          params,
          scenes: rawScenes.map((s) => ({
            ...s,
            id: crypto.randomUUID(),
            imagePrompt: "",
            imageUrl: undefined,
            imageError: false,
          })),
          characters: rawCharacters.map((c) => ({
            ...c,
            imageUrl: undefined,
            imageError: false,
          })),
          createdAt: Date.now(),
        };
        setStory(initialStory);
        setPage([0, 0]);

        setLoadingState("generating_images");
        await Promise.all(
          initialStory.scenes.map(async (scene) => {
            try {
              const imagePrompt = await generateImagePrompt(scene.text);
              const imageUrl = await generateImage(imagePrompt);
              setStory((currentStory) =>
                currentStory
                  ? {
                      ...currentStory,
                      scenes: currentStory.scenes.map((s) =>
                        s.id === scene.id ? { ...s, imagePrompt, imageUrl } : s
                      ),
                    }
                  : null
              );
            } catch (err) {
              console.error(
                `Failed image generation for scene ${scene.id}:`,
                err
              );
              setStory((currentStory) =>
                currentStory
                  ? {
                      ...currentStory,
                      scenes: currentStory.scenes.map((s) =>
                        s.id === scene.id ? { ...s, imageError: true } : s
                      ),
                    }
                  : null
              );
            }
          })
        );

        setLoadingState("generating_characters");
        if (initialStory.characters?.length > 0) {
          await Promise.all(
            initialStory.characters.map(async (character) => {
              try {
                const imageUrl = await generateCharacterImage(
                  character.description
                );
                setStory((currentStory) =>
                  currentStory
                    ? {
                        ...currentStory,
                        characters: currentStory.characters.map((c) =>
                          c.name === character.name ? { ...c, imageUrl } : c
                        ),
                      }
                    : null
                );
              } catch (err) {
                console.error(
                  `Failed image for character ${character.name}:`,
                  err
                );
                setStory((currentStory) =>
                  currentStory
                    ? {
                        ...currentStory,
                        characters: currentStory.characters.map((c) =>
                          c.name === character.name
                            ? { ...c, imageError: true }
                            : c
                        ),
                      }
                    : null
                );
              }
            })
          );
        }

        setLoadingState("completed");
      } catch (err) {
        setErrorMessage(
          err instanceof Error ? err.message : "An unknown error occurred."
        );
        setLoadingState("error");
      }
    };

    if (location.state?.params && !story) {
      generateNewStory(location.state.params);
    } else if (story) {
      setPage([0, 0]);
      setLoadingState("done");
    } else {
      navigate("/");
    }
  }, [location.state, navigate, story]);

  useEffect(() => {
    if (loadingState === "completed" && story) {
      saveStory(story);
      const timer = setTimeout(() => setLoadingState("done"), 1500);
      return () => clearTimeout(timer);
    }
  }, [loadingState, story, saveStory]);

  const handlePlayPause = () => {
    if (isSpeaking) {
      // If it's speaking, stop it.
      stop();
      setIsAutoPlaying(false);
    } else {
      // If it's not speaking, start auto-play.
      setIsAutoPlaying(true);
      if (activeScene) {
        speak(activeScene.text);
      }
    }
  };

  const handleSave = () => {
    if (story && (loadingState === "done" || loadingState === "completed")) {
      saveStory(story);
    }
  };

  const handleDragEnd = (_: any, { offset, velocity }: PanInfo) => {
    const swipe = Math.abs(offset.x) * velocity.x;
    if (swipe < -swipeConfidenceThreshold) {
      paginate(1);
    } else if (swipe > swipeConfidenceThreshold) {
      paginate(-1);
    }
  };

  const getLoaderText = () => {
    switch (loadingState) {
      case "generating_text":
        return "Dreaming up a story...";
      case "generating_images":
        return "Painting the pictures...";
      case "generating_characters":
        return "Bringing characters to life...";
      case "completed":
        return "All done!";
      default:
        return "Getting things ready...";
    }
  };

  const renderContent = () => {
    if (loadingState !== "done" && loadingState !== "error") {
      return (
        <div className="flex flex-col items-center justify-center h-full">
          <Loader text={getLoaderText()} />
        </div>
      );
    }
    if (loadingState === "error") {
      return (
        <div className="p-8 text-center">
          <h2 className="text-2xl font-bold mb-4 text-red-600">Oh no!</h2>
          <p className="text-gray-700 bg-red-100 p-3 rounded-lg">
            {errorMessage}
          </p>
          <button
            onClick={() => navigate("/")}
            className="mt-6 px-6 py-2 bg-orange-500 text-white font-bold rounded-full shadow-md hover:bg-orange-600"
          >
            Start Over
          </button>
        </div>
      );
    }
    if (story) {
      return (
        <div className="w-full h-full flex flex-col">
          <header className="p-4 pr-20 flex justify-between items-center text-gray-700 flex-shrink-0">
            <button
              onClick={() => navigate("/")}
              className="p-2 rounded-full hover:bg-gray-200/50"
              aria-label="Go to Home"
            >
              <HomeIcon className="w-8 h-8" />
            </button>
            <h2 className="font-bold text-lg text-center truncate px-2 flex-grow">
              {story.title}
            </h2>
            <button
              onClick={handleSave}
              className={`p-2 rounded-full transition-colors duration-200 ${
                isStorySaved(story.id)
                  ? "text-red-500"
                  : "text-gray-400 hover:text-red-400"
              }`}
              aria-label="Save story"
            >
              <HeartIcon
                className="w-8 h-8"
                isFilled={isStorySaved(story.id)}
              />
            </button>
          </header>

          <main className="flex-grow relative overflow-hidden">
            <AnimatePresence initial={false} custom={direction}>
              <motion.div
                key={currentSceneIndex}
                className="absolute w-full h-full p-4 sm:p-6"
                custom={direction}
                variants={cardVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{
                  x: { type: "spring", stiffness: 350, damping: 35 },
                  opacity: { duration: 0.2 },
                }}
                drag="x"
                dragConstraints={{ left: 0, right: 0 }}
                dragElastic={0.2}
                onDragEnd={handleDragEnd}
              >
                {activeScene && <SceneCard scene={activeScene} />}
              </motion.div>
            </AnimatePresence>
          </main>

          <footer className="p-4 flex justify-around items-center w-full max-w-xs mx-auto flex-shrink-0 mb-2">
            <button
              onClick={() => paginate(-1)}
              disabled={currentSceneIndex <= 0}
              className="p-3 bg-white/60 rounded-full text-gray-700 backdrop-blur-md shadow-lg disabled:opacity-30 disabled:cursor-not-allowed hover:bg-white/90 transition-all"
              aria-label="Previous scene"
            >
              <ArrowLeftIcon className="w-7 h-7" />
            </button>
            <button
              onClick={handlePlayPause}
              className="p-3 bg-orange-500 rounded-full text-white shadow-xl transform hover:scale-110 transition-transform"
              aria-label={isSpeaking ? "Pause narration" : "Play narration"}
            >
              {isSpeaking ? (
                <PauseIcon className="w-10 h-10" />
              ) : (
                <PlayIcon className="w-10 h-10" />
              )}
            </button>
            <button
              onClick={() => paginate(1)}
              disabled={!story || currentSceneIndex >= story.scenes.length - 1}
              className="p-3 bg-white/60 rounded-full text-gray-700 backdrop-blur-md shadow-lg disabled:opacity-30 disabled:cursor-not-allowed hover:bg-white/90 transition-all"
              aria-label="Next scene"
            >
              <ArrowRightIcon className="w-7 h-7" />
            </button>
          </footer>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="w-full h-full flex items-center justify-center">
      {renderContent()}
    </div>
  );
};

export default StoryScreen;
