import allWordsData from './dictionary_words_all.json';
import shuffledWordsData from './dictionary_words_shuffled.json';

export const JORDLE_ANSWERS = shuffledWordsData.words as readonly string[];
export const JORDLE_GUESSES = allWordsData.words as readonly string[];
