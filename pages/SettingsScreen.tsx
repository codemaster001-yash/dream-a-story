import React, { useState, useEffect } from 'react';
import Header from '../components/Header';

const VOICE_STORAGE_KEY = 'selected_voice_uri';

const SettingsScreen: React.FC = () => {
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [selectedVoiceURI, setSelectedVoiceURI] = useState<string | null>(localStorage.getItem(VOICE_STORAGE_KEY));
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    const loadAndValidateVoices = () => {
        const voiceList = window.speechSynthesis.getVoices();
        if (voiceList.length === 0) return;

        setVoices(voiceList);

        // Validate the currently selected voice from localStorage.
        const currentURI = localStorage.getItem(VOICE_STORAGE_KEY);
        const voiceExists = voiceList.some(v => v.voiceURI === currentURI);

        // If the saved voice is not in the list or no voice is stored, set a sensible default.
        if (!voiceExists) {
            const defaultVoice = voiceList.find(v => v.default) || voiceList[0];
            if (defaultVoice) {
                setSelectedVoiceURI(defaultVoice.voiceURI);
            }
        } else {
            setSelectedVoiceURI(currentURI);
        }
    };

    // Voices might load asynchronously.
    if (window.speechSynthesis.getVoices().length > 0) {
        loadAndValidateVoices();
    } else {
        window.speechSynthesis.onvoiceschanged = loadAndValidateVoices;
    }
    
    return () => {
        window.speechSynthesis.onvoiceschanged = null;
    }
  }, []);

  const handleVoiceChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedVoiceURI(event.target.value);
  };

  const handleSave = () => {
    if (selectedVoiceURI) {
      localStorage.setItem(VOICE_STORAGE_KEY, selectedVoiceURI);
      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 2000); // Show "Saved!" message for 2 seconds
    }
  };

  return (
    <div className="p-6">
      <Header title="Settings" subtitle="Customize your experience" />

      <div className="space-y-8 mt-4">
        <div className="bg-white p-6 rounded-2xl shadow-md">
            <h3 className="text-lg font-bold text-gray-700">Narration Voice</h3>
            <p className="text-sm text-gray-500 mt-1">Choose a voice for the read-aloud feature.</p>
            {voices.length > 0 ? (
                <div className="mt-4 space-y-4">
                    <select 
                        value={selectedVoiceURI || ''} 
                        onChange={handleVoiceChange}
                        className="w-full p-3 border border-gray-300 rounded-lg bg-gray-50 focus:ring-2 focus:ring-orange-400 focus:outline-none text-black"
                    >
                        <option value="" disabled>Select a voice</option>
                        {voices.map(voice => (
                            <option key={voice.voiceURI} value={voice.voiceURI}>
                                {`${voice.name} (${voice.lang})`}
                            </option>
                        ))}
                    </select>
                    <button 
                        onClick={handleSave}
                        className={`w-full p-3 font-bold rounded-lg transition-colors text-white ${isSaved ? 'bg-green-500' : 'bg-orange-500 hover:bg-orange-600'}`}
                    >
                       {isSaved ? 'Saved!' : 'Save Voice'}
                    </button>
                </div>
            ) : (
                <p className="mt-4 text-gray-500">Loading voices or none available in this browser.</p>
            )}
        </div>
        
        <div className="bg-white p-6 rounded-2xl shadow-md">
            <h3 className="text-lg font-bold text-gray-700">API Key</h3>
             <p className="text-sm text-gray-500 mt-1">
                The Gemini API key is configured in the application's environment. For security, it cannot be changed from this screen.
            </p>
        </div>
      </div>
    </div>
  );
};

export default SettingsScreen;