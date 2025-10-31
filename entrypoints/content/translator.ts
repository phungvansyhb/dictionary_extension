// Translation API service

import type { LanguageCode, PhoneticInfo } from './types';

/**
 * Dịch văn bản sử dụng Google Translate API
 * @param text - Văn bản cần dịch
 * @param targetLang - Ngôn ngữ đích
 * @returns Promise với văn bản đã dịch
 */
export async function translateText(
  text: string, 
  targetLang: LanguageCode = 'vi'
): Promise<string> {
  try {
    const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=${targetLang}&dt=t&q=${encodeURIComponent(text)}`;
    
    const response = await fetch(url);
    const data = await response.json();
    // Parse kết quả từ API
    if (data && data[0]) {
      return data[0].map((item: any) => item[0]).join('');
    }
    return 'Không thể dịch văn bản';
  } catch (error) {
    console.error('Translation error:', error);
    return 'Lỗi khi dịch văn bản';
  }
}

/**
 * Lấy phiên âm IPA và thông tin từ điển từ Free Dictionary API
 * @param word - Từ cần tra (tiếng Anh)
 * @returns Promise với thông tin phiên âm và nghĩa
 */
export async function getPhonetic(word: string): Promise<PhoneticInfo | null> {
  try {
    // Chỉ tra nếu là từ đơn (không có khoảng trắng)
    if (word.includes(' ')) {
      return null;
    }

    const url = `https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(word.toLowerCase())}`;
    
    const response = await fetch(url);
    if (!response.ok) {
      return null;
    }

    const data = await response.json();
    console.log('Phonetic API data:', data);
    if (data && data[0]) {
      const entry = data[0];
      
      // Lấy phiên âm (ưu tiên phiên âm có trong phonetics array)
      let phonetic = entry.phonetic;
      let audio = '';
      
      if (entry.phonetics && entry.phonetics.length > 0) {
        // Tìm phonetic có cả text và audio
        const phoneticWithAudio = entry.phonetics.find((p: any) => p.text && p.audio);
        if (phoneticWithAudio) {
          phonetic = phoneticWithAudio.text;
          audio = phoneticWithAudio.audio;
        } else if (entry.phonetics[0].text) {
          phonetic = entry.phonetics[0].text;
          audio = entry.phonetics[0].audio || '';
        }
      }

      // Parse meanings
      const meanings = entry.meanings?.map((m: any) => ({
        partOfSpeech: m.partOfSpeech,
        definitions: m.definitions?.slice(0, 2).map((d: any) => ({
          definition: d.definition,
          example: d.example
        })) || []
      }));

      return {
        word: entry.word,
        phonetic: phonetic || undefined,
        audio: audio || undefined,
        meanings: meanings || undefined
      };
    }
    
    return null;
  } catch (error) {
    console.error('Phonetic lookup error:', error);
    return null;
  }
}

/**
 * Kiểm tra xem text có phải là từ tiếng Anh đơn không
 */
export function isEnglishWord(text: string): boolean {
  // Chỉ chứa chữ cái, dấu gạch nối, apostrophe
  const englishWordPattern = /^[a-zA-Z]+([-'][a-zA-Z]+)*$/;
  return englishWordPattern.test(text.trim());
}
