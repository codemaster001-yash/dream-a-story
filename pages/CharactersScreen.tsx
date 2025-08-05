import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStoryHistory } from '../hooks/useStoryHistory';
import Header from '../components/Header';
import { Character } from '../types';

const CharacterCard: React.FC<{ character: Character; onClick: () => void }> = ({ character, onClick }) => {
    return (
        <div onClick={onClick} className="flex flex-col items-center text-center cursor-pointer group">
            <div className="w-24 h-24 rounded-full bg-orange-200 shadow-lg overflow-hidden transform group-hover:scale-110 transition-transform duration-300">
                {character.imageUrl ? (
                    <img src={character.imageUrl} alt={character.name} className="w-full h-full object-cover" />
                ) : (
                    <div className="w-full h-full flex items-center justify-center">
                        <div className="w-8 h-8 border-2 border-dashed rounded-full animate-spin border-orange-400"></div>
                    </div>
                )}
            </div>
            <h3 className="mt-3 font-bold text-gray-800">{character.name}</h3>
        </div>
    )
}

const CharactersScreen: React.FC = () => {
    const { stories } = useStoryHistory();
    const navigate = useNavigate();

    const uniqueCharacters = useMemo(() => {
        const allCharacters = stories.flatMap(story => story.characters || []);
        const characterMap = new Map<string, Character>();
        
        allCharacters.forEach(char => {
            if (!characterMap.has(char.name)) {
                characterMap.set(char.name, char);
            }
        });

        return Array.from(characterMap.values());
    }, [stories]);

    const handleCharacterClick = (character: Character) => {
        navigate('/history', { state: { characterFilter: character.name } });
    };

    return (
        <div className="p-6">
            <Header title="My Characters" subtitle="All the friends you've met" />

            {uniqueCharacters.length === 0 ? (
                <div className="text-center py-20">
                    <p className="text-gray-500">You haven't met any characters yet.</p>
                    <p className="text-sm text-gray-400 mt-2">Create a story to bring some to life!</p>
                    <button onClick={() => navigate('/')} className="mt-6 px-6 py-2 bg-orange-500 text-white font-bold rounded-full shadow-md hover:bg-orange-600">
                        Create a New Story
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-3 gap-y-8 gap-x-4">
                    {uniqueCharacters.map(char => (
                        <CharacterCard key={char.name} character={char} onClick={() => handleCharacterClick(char)} />
                    ))}
                </div>
            )}
        </div>
    );
};

export default CharactersScreen;
