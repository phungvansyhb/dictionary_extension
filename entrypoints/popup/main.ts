// Popup main script để hiển thị danh sách từ đã lưu

import { getSavedWords, removeWord, clearAllWords, searchWords, debugDatabase } from '../content/storage';
import type { SavedWord } from '../content/types';

// Load và hiển thị danh sách từ
async function loadWords(): Promise<void> {
  console.log('Loading words...');
  const words = await getSavedWords();
  console.log('Loaded words:', words);
  displayWords(words);
  updateStats(words.length);
}

// Hiển thị danh sách từ
function displayWords(words: SavedWord[]): void {
  const wordList = document.getElementById('word-list');
  const emptyState = document.getElementById('empty-state');
  
  if (!wordList || !emptyState) return;
  
  if (words.length === 0) {
    wordList.style.display = 'none';
    emptyState.style.display = 'flex';
    return;
  }
  
  wordList.style.display = 'block';
  emptyState.style.display = 'none';
  
  wordList.innerHTML = words.map(word => createWordCard(word)).join('');
  
  // Add event listeners
  words.forEach((word, index) => {
    const deleteBtn = document.getElementById(`delete-${index}`);
    const playBtn = document.getElementById(`play-${index}`);
    
    deleteBtn?.addEventListener('click', () => deleteWord(word));
    playBtn?.addEventListener('click', () => speakWord(word.translation, word.targetLanguage));
  });
}

// Tạo HTML card cho từ
function createWordCard(word: SavedWord): string {
  const date = new Date(word.savedAt).toLocaleDateString('vi-VN');
  const time = new Date(word.savedAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
  
  const phoneticHTML = word.phonetic 
    ? `<div class="word-phonetic">${word.phonetic}</div>` 
    : '';
  
  const meaningsHTML = word.meanings && word.meanings.length > 0
    ? `
      <div class="word-meanings">
        ${word.meanings.slice(0, 2).map(m => `
          <div class="meaning-item">
            <span class="part-of-speech">${m.partOfSpeech}</span>: 
            ${m.definitions[0]?.definition || ''}
          </div>
        `).join('')}
      </div>
    `
    : '';
  
  return `
    <div class="word-card">
      <div class="word-header">
        <div class="word-title">
          <div class="word-text">${word.word}</div>
          ${phoneticHTML}
        </div>
        <div class="word-actions">
          <button id="play-${word.savedAt}" class="btn-small">🔊</button>
          <button id="delete-${word.savedAt}" class="btn-small btn-delete">🗑️</button>
        </div>
      </div>
      
      <div class="word-translation">
        → ${word.translation}
      </div>
      
      <div class="word-meta">
        <span>🌐 ${getLanguageName(word.targetLanguage)}</span>
        <span>📅 ${date} ${time}</span>
      </div>
      
      ${meaningsHTML}
    </div>
  `;
}

// Xóa từ
async function deleteWord(word: SavedWord): Promise<void> {
  if (!confirm(`Xóa từ "${word.word}"?`)) return;
  
  await removeWord(word.word, word.targetLanguage);
  loadWords();
}

// Đọc từ
function speakWord(text: string, lang: string): void {
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = lang;
  speechSynthesis.speak(utterance);
}

// Xóa tất cả
async function clearAll(): Promise<void> {
  if (!confirm('Xóa tất cả từ đã lưu? Hành động này không thể hoàn tác!')) return;
  
  await clearAllWords();
  loadWords();
}

// Cập nhật thống kê
function updateStats(count: number): void {
  const wordCount = document.getElementById('word-count');
  if (wordCount) {
    wordCount.textContent = `${count} từ`;
  }
}

// Lấy tên ngôn ngữ
function getLanguageName(code: string): string {
  const names: Record<string, string> = {
    'vi': 'Tiếng Việt',
    'en': 'English',
    'zh-CN': '中文',
    'ja': '日本語',
    'ko': '한국어',
    'fr': 'Français',
    'de': 'Deutsch',
    'es': 'Español',
    'ru': 'Русский',
    'th': 'ไทย'
  };
  return names[code] || code;
}

// Tìm kiếm từ
function setupSearch(): void {
  const searchInput = document.getElementById('search-input') as HTMLInputElement;
  if (!searchInput) return;
  
  searchInput.addEventListener('input', async (e) => {
    const query = (e.target as HTMLInputElement).value.toLowerCase();
    
    if (!query) {
      loadWords();
      return;
    }
    
    const filtered = await searchWords(query);
    displayWords(filtered);
  });
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  console.log('Popup loaded');
  
  // Debug database
  debugDatabase();
  
  loadWords();
  setupSearch();
  
  const clearBtn = document.getElementById('clear-all-btn');
  clearBtn?.addEventListener('click', clearAll);
});
