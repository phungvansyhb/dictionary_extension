// Types và interfaces cho translation extension

export interface TranslationResult {
  translatedText: string;
  sourceLanguage?: string;
  targetLanguage: string;
}

export interface PopupPosition {
  x: number;
  y: number;
}

export interface PhoneticInfo {
  word: string;
  phonetic?: string;
  audio?: string;
  meanings?: DictionaryMeaning[];
}

export interface DictionaryMeaning {
  partOfSpeech: string;
  definitions: Array<{
    definition: string;
    example?: string;
  }>;
}

export interface SavedWord {
  word: string;
  phonetic?: string;
  translation: string;
  targetLanguage: LanguageCode;
  meanings?: DictionaryMeaning[];
  savedAt: number; // timestamp
}

export type LanguageCode = 'vi' | 'en' | 'zh-CN' | 'ja' | 'ko' | 'fr' | 'de' | 'es' | 'ru' | 'th';
