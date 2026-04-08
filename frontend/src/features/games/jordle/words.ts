import allWordsData from './dictionary_words_all.json';
import curatedTargetsData from './dictionary_words_targets.json';

export const JORDLE_ANSWERS = curatedTargetsData.words as readonly string[];
export const JORDLE_GUESSES = allWordsData.words as readonly string[];
