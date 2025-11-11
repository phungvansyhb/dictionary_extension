// Storage service v2 - Sử dụng browser.storage.local để share data giữa content và extension pages

import type { SavedWord, LanguageCode, PhoneticInfo } from './types';
import { browser } from 'wxt/browser';

const STORAGE_KEY = 'saved_words';

/**
 * Lấy tất cả từ đã lưu
 */
async function getAllWords(): Promise<SavedWord[]> {
  try {
    const result = await browser.storage.local.get(STORAGE_KEY);
    return result[STORAGE_KEY] || [];
  } catch (error) {
    console.error('Error getting words:', error);
    return [];
  }
}

/**
 * Lưu tất cả từ
 */
async function setAllWords(words: SavedWord[]): Promise<void> {
  await browser.storage.local.set({ [STORAGE_KEY]: words });
}

/**
 * Lưu từ mới
 */
export async function saveWord(
  word: string,
  translation: string,
  targetLanguage: LanguageCode,
  phoneticInfo?: PhoneticInfo
): Promise<boolean> {
  try {
    console.log('💾 Saving word:', word);
    
    const words = await getAllWords();
    const normalizedWord = word.toLowerCase().trim();
    
    // Kiểm tra xem từ đã tồn tại chưa (cùng word và targetLanguage)
    const existingIndex = words.findIndex(
      w => w.word.toLowerCase() === normalizedWord && w.targetLanguage === targetLanguage
    );
    
    const wordData: SavedWord = {
      word: word.trim(),
      translation: translation.trim(),
      targetLanguage,
      savedAt: Date.now(),
      phonetic: phoneticInfo?.phonetic,
      meanings: phoneticInfo?.meanings
    };
    
    if (existingIndex >= 0) {
      // Cập nhật từ đã tồn tại
      console.log('📝 Updating existing word');
      words[existingIndex] = wordData;
    } else {
      // Thêm từ mới
      console.log('➕ Adding new word');
      words.unshift(wordData); // Thêm vào đầu array (mới nhất trước)
    }
    
    await setAllWords(words);
    console.log('✅ Word saved successfully!');
    return true;
  } catch (error) {
    console.error('❌ Error saving word:', error);
    return false;
  }
}

/**
 * Lấy tất cả từ đã lưu (sorted by savedAt desc)
 */
export async function getSavedWords(): Promise<SavedWord[]> {
  try {
    const words = await getAllWords();
    console.log('📚 Retrieved words:', words.length);
    
    // Sort by savedAt descending (newest first)
    return words.sort((a, b) => b.savedAt - a.savedAt);
  } catch (error) {
    console.error('❌ Error getting saved words:', error);
    return [];
  }
}

/**
 * Xóa từ
 */
export async function removeWord(word: string, targetLanguage: LanguageCode): Promise<void> {
  try {
    console.log('🗑️ Removing word:', word);
    
    const words = await getAllWords();
    const normalizedWord = word.toLowerCase().trim();
    
    const filteredWords = words.filter(
      w => !(w.word.toLowerCase() === normalizedWord && w.targetLanguage === targetLanguage)
    );
    
    await setAllWords(filteredWords);
    console.log('✅ Word removed successfully!');
  } catch (error) {
    console.error('❌ Error removing word:', error);
  }
}

/**
 * Xóa tất cả từ
 */
export async function clearAllWords(): Promise<void> {
  try {
    console.log('🗑️ Clearing all words...');
    await browser.storage.local.remove(STORAGE_KEY);
    console.log('✅ All words cleared!');
  } catch (error) {
    console.error('❌ Error clearing words:', error);
  }
}

/**
 * Tìm kiếm từ
 */
export async function searchWords(query: string): Promise<SavedWord[]> {
  try {
    const words = await getAllWords();
    const normalizedQuery = query.toLowerCase().trim();
    
    const filtered = words.filter(word => 
      word.word.toLowerCase().includes(normalizedQuery) ||
      word.translation.toLowerCase().includes(normalizedQuery)
    );
    
    return filtered.sort((a, b) => b.savedAt - a.savedAt);
  } catch (error) {
    console.error('❌ Error searching words:', error);
    return [];
  }
}

/**
 * Kiểm tra xem từ đã được lưu chưa
 */
export async function isWordSaved(word: string, targetLanguage: LanguageCode): Promise<boolean> {
  try {
    const words = await getAllWords();
    const normalizedWord = word.toLowerCase().trim();
    
    return words.some(
      w => w.word.toLowerCase() === normalizedWord && w.targetLanguage === targetLanguage
    );
  } catch (error) {
    console.error('❌ Error checking word:', error);
    return false;
  }
}

/**
 * Lấy số lượng từ đã lưu
 */
export async function getWordCount(): Promise<number> {
  try {
    const words = await getAllWords();
    return words.length;
  } catch (error) {
    console.error('❌ Error getting word count:', error);
    return 0;
  }
}
