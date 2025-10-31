// Storage service để quản lý từ đã lưu sử dụng IndexedDB

import type { SavedWord, LanguageCode, PhoneticInfo } from './types';

const DB_NAME = 'TranslationExtensionDB';
const DB_VERSION = 1;
const STORE_NAME = 'saved_words';

// Khởi tạo IndexedDB
function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      
      // Tạo object store nếu chưa tồn tại
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const objectStore = db.createObjectStore(STORE_NAME, { 
          keyPath: 'id',
          autoIncrement: true 
        });
        
        // Tạo indexes
        objectStore.createIndex('word', 'word', { unique: false });
        objectStore.createIndex('targetLanguage', 'targetLanguage', { unique: false });
        objectStore.createIndex('savedAt', 'savedAt', { unique: false });
        objectStore.createIndex('word_lang', ['word', 'targetLanguage'], { unique: false });
      }
    };
  });
}

/**
 * Lưu từ vào IndexedDB
 */
export async function saveWord(
  word: string,
  translation: string,
  targetLanguage: LanguageCode,
  phoneticInfo?: PhoneticInfo
): Promise<boolean> {
  try {
    const db = await openDatabase();
    
    // Chuẩn hóa word cho việc tìm kiếm
    const normalizedWord = word.toLowerCase().trim();
    
    // Kiểm tra xem từ đã tồn tại chưa
    const existing = await findWordByWordAndLang(db, normalizedWord, targetLanguage);
    
    const wordData: SavedWord & { id?: number } = {
      word: word.trim(), // Giữ nguyên case gốc
      translation: translation.trim(),
      targetLanguage,
      phonetic: phoneticInfo?.phonetic,
      meanings: phoneticInfo?.meanings,
      savedAt: Date.now()
    };
    
    const transaction = db.transaction([STORE_NAME], 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    
    if (existing) {
      // Cập nhật từ đã có
      wordData.id = existing.id;
      store.put(wordData);
    } else {
      // Thêm từ mới
      store.add(wordData);
    }
    
    return new Promise((resolve, reject) => {
      transaction.oncomplete = () => {
        db.close();
        console.log('Word saved successfully:', wordData);
        resolve(true);
      };
      transaction.onerror = () => {
        db.close();
        console.error('Transaction error:', transaction.error);
        reject(transaction.error);
      };
    });
  } catch (error) {
    console.error('Error saving word:', error);
    return false;
  }
}

/**
 * Tìm từ theo word và targetLanguage
 */
async function findWordByWordAndLang(
  db: IDBDatabase,
  word: string,
  targetLanguage: LanguageCode
): Promise<(SavedWord & { id: number }) | null> {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], 'readonly');
    const store = transaction.objectStore(STORE_NAME);
    const index = store.index('word_lang');
    const request = index.get([word.toLowerCase(), targetLanguage]);
    
    request.onsuccess = () => resolve(request.result || null);
    request.onerror = () => reject(request.error);
  });
}

/**
 * Lấy danh sách từ đã lưu (sắp xếp theo thời gian mới nhất)
 */
export async function getSavedWords(): Promise<SavedWord[]> {
  try {
    const db = await openDatabase();
    
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE_NAME], 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.getAll();
      
      request.onsuccess = () => {
        const words = request.result as SavedWord[];
        console.log('Retrieved words from IndexedDB:', words);
        
        // Sắp xếp theo thời gian mới nhất
        words.sort((a, b) => b.savedAt - a.savedAt);
        
        db.close();
        resolve(words);
      };
      
      request.onerror = () => {
        console.error('Error in getAll request:', request.error);
        db.close();
        reject(request.error);
      };
    });
  } catch (error) {
    console.error('Error getting saved words:', error);
    return [];
  }
}

/**
 * Xóa từ khỏi danh sách
 */
export async function removeWord(word: string, targetLanguage: LanguageCode): Promise<boolean> {
  try {
    const db = await openDatabase();
    const existing = await findWordByWordAndLang(db, word, targetLanguage);
    
    if (!existing) {
      db.close();
      return false;
    }
    
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE_NAME], 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.delete(existing.id);
      
      request.onsuccess = () => {
        db.close();
        resolve(true);
      };
      
      request.onerror = () => {
        db.close();
        reject(request.error);
      };
    });
  } catch (error) {
    console.error('Error removing word:', error);
    return false;
  }
}

/**
 * Kiểm tra từ đã được lưu chưa
 */
export async function isWordSaved(word: string, targetLanguage: LanguageCode): Promise<boolean> {
  try {
    const db = await openDatabase();
    const existing = await findWordByWordAndLang(db, word, targetLanguage);
    db.close();
    return existing !== null;
  } catch (error) {
    console.error('Error checking word:', error);
    return false;
  }
}

/**
 * Xóa tất cả từ đã lưu
 */
export async function clearAllWords(): Promise<boolean> {
  try {
    const db = await openDatabase();
    
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE_NAME], 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.clear();
      
      request.onsuccess = () => {
        db.close();
        resolve(true);
      };
      
      request.onerror = () => {
        db.close();
        reject(request.error);
      };
    });
  } catch (error) {
    console.error('Error clearing words:', error);
    return false;
  }
}

/**
 * Tìm kiếm từ
 */
export async function searchWords(query: string): Promise<SavedWord[]> {
  try {
    const allWords = await getSavedWords();
    const lowerQuery = query.toLowerCase();
    
    return allWords.filter(word => 
      word.word.toLowerCase().includes(lowerQuery) || 
      word.translation.toLowerCase().includes(lowerQuery)
    );
  } catch (error) {
    console.error('Error searching words:', error);
    return [];
  }
}

/**
 * Lấy số lượng từ đã lưu
 */
export async function getWordCount(): Promise<number> {
  try {
    const db = await openDatabase();
    
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE_NAME], 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.count();
      
      request.onsuccess = () => {
        console.log('Word count in IndexedDB:', request.result);
        db.close();
        resolve(request.result);
      };
      
      request.onerror = () => {
        db.close();
        reject(request.error);
      };
    });
  } catch (error) {
    console.error('Error getting word count:', error);
    return 0;
  }
}

/**
 * Debug: Log tất cả dữ liệu trong IndexedDB
 */
export async function debugDatabase(): Promise<void> {
  try {
    const db = await openDatabase();
    console.log('Database name:', db.name);
    console.log('Object stores:', Array.from(db.objectStoreNames));
    
    const transaction = db.transaction([STORE_NAME], 'readonly');
    const store = transaction.objectStore(STORE_NAME);
    
    console.log('Store name:', store.name);
    console.log('Key path:', store.keyPath);
    console.log('Indexes:', Array.from(store.indexNames));
    
    const countRequest = store.count();
    countRequest.onsuccess = () => {
      console.log('Total items:', countRequest.result);
    };
    
    const getAllRequest = store.getAll();
    getAllRequest.onsuccess = () => {
      console.log('All data:', getAllRequest.result);
    };
    
    transaction.oncomplete = () => {
      db.close();
    };
  } catch (error) {
    console.error('Debug error:', error);
  }
}
