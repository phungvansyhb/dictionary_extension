// Popup class để quản lý translation popup

import { translateText, getPhonetic, isEnglishWord } from './translator';
import { calculatePopupPosition, POPUP_STYLES } from './popup-utils';
import { getPopupTemplate, applyButtonEffects, applySelectEffects } from './popup-template';
import { saveWord, isWordSaved } from './storageService';
import type { LanguageCode, PhoneticInfo } from './types';
import { browser } from 'wxt/browser';

export class TranslationPopup {
  private popup: HTMLDivElement | null = null;
  private isTranslating = false;
  private currentAudioUrl: string | null = null;
  private currentWord: string = '';
  private currentTranslation: string = '';
  private currentPhoneticInfo: PhoneticInfo | null = null;

  /**
   * Tạo popup element
   */
  private createPopup(): HTMLDivElement {
    const div = document.createElement('div');
    div.id = 'text-selection-popup';
    div.style.cssText = POPUP_STYLES;
    div.innerHTML = getPopupTemplate();
    
    // Áp dụng effects
    applyButtonEffects(div);
    
    const select = div.querySelector('#target-language') as HTMLSelectElement;
    if (select) {
      applySelectEffects(select);
    }
    
    document.body.appendChild(div);
    return div;
  }

  /**
   * Setup event listeners cho popup
   */
  private setupEventListeners(): void {
    if (!this.popup) return;

    // Event: Copy bản dịch
    const copyBtn = this.popup.querySelector('#copy-translation-btn');
    copyBtn?.addEventListener('click', () => this.handleCopy());

    // Event: Lưu từ
    const saveBtn = this.popup.querySelector('#save-word-btn');
    saveBtn?.addEventListener('click', () => this.handleSaveWord());

    // Event: Xem từ đã lưu
    const viewSavedBtn = this.popup.querySelector('#view-saved-btn');
    viewSavedBtn?.addEventListener('click', () => this.handleViewSaved());

    // Event: Thay đổi ngôn ngữ đích
    const langSelect = this.popup.querySelector('#target-language') as HTMLSelectElement;
    langSelect?.addEventListener('change', () => this.handleLanguageChange());

    // Event: Play audio phát âm
    const playAudioBtn = this.popup.querySelector('#play-audio-btn');
    playAudioBtn?.addEventListener('click', () => this.handlePlayAudio());
  }

  /**
   * Handle copy button click
   */
  private handleCopy(): void {
    const translatedText = this.popup?.querySelector('#translated-text')?.textContent || '';
    if (translatedText && translatedText !== 'Đang dịch...') {
      navigator.clipboard.writeText(translatedText);
      
      const copyBtn = this.popup?.querySelector('#copy-translation-btn') as HTMLElement;
      if (copyBtn) {
        const originalHTML = copyBtn.innerHTML;
        copyBtn.innerHTML = '✓ Đã copy!';
        setTimeout(() => {
          copyBtn.innerHTML = originalHTML;
        }, 2000);
      }
    }
  }

  /**
   * Handle save word button click
   */
  private async handleSaveWord(): Promise<void> {
    if (!this.currentWord || !this.currentTranslation) return;

    const langSelect = this.popup?.querySelector('#target-language') as HTMLSelectElement;
    const targetLang = langSelect?.value as LanguageCode || 'vi';

    const success = await saveWord(
      this.currentWord,
      this.currentTranslation,
      targetLang,
      this.currentPhoneticInfo || undefined
    );

    const saveBtn = this.popup?.querySelector('#save-word-btn') as HTMLElement;
    if (saveBtn) {
      if (success) {
        const originalHTML = saveBtn.innerHTML;
        saveBtn.innerHTML = '<span style="margin-right: 6px; font-size: 16px;">✓</span> Đã lưu!';
        saveBtn.style.background = 'rgba(76, 175, 80, 0.6)';
        setTimeout(() => {
          saveBtn.innerHTML = originalHTML;
          saveBtn.style.background = 'rgba(255,255,255,0.25)';
        }, 2000);
      } else {
        const originalHTML = saveBtn.innerHTML;
        saveBtn.innerHTML = '<span style="margin-right: 6px;">❌</span> Lỗi!';
        setTimeout(() => {
          saveBtn.innerHTML = originalHTML;
        }, 2000);
      }
    }
  }

  /**
   * Handle view saved words button click - Mở trang mới để xem từ đã lưu
   */
  private async handleViewSaved(): Promise<void> {
    // Mở new tab page để xem từ đã lưu
    try {
      const extensionUrl = browser.runtime.getURL('');
      await browser.tabs.create({
        url: extensionUrl + 'newtab.html'
      });
    } catch (error) {
      console.error('Error opening saved words page:', error);
    }
  }

  /**
   * Handle language change
   */
  private async handleLanguageChange(): Promise<void> {
    const originalText = this.popup?.querySelector('#original-text')?.textContent || '';
    if (originalText) {
      const translatedDiv = this.popup?.querySelector('#translated-text');
      const langSelect = this.popup?.querySelector('#target-language') as HTMLSelectElement;
      
      if (translatedDiv && langSelect) {
        translatedDiv.textContent = 'Đang dịch...';
        const translation = await translateText(originalText, langSelect.value as LanguageCode);
        translatedDiv.textContent = translation;
      }
    }
  }

  /**
   * Handle play audio phát âm
   */
  private handlePlayAudio(): void {
    if (this.currentAudioUrl) {
      const audio = new Audio(this.currentAudioUrl);
      audio.play().catch(err => console.error('Audio play error:', err));
    }
  }

  /**
   * Hiển thị phiên âm IPA (nếu là từ tiếng Anh đơn)
   */
  private async displayPhonetic(text: string): Promise<void> {
    const phoneticSection = this.popup?.querySelector('#phonetic-section') as HTMLElement;
    
    if (!phoneticSection) return;

    // Kiểm tra xem có phải từ tiếng Anh đơn không
    if (!isEnglishWord(text)) {
      phoneticSection.style.display = 'none';
      this.currentPhoneticInfo = null;
      return;
    }

    // Lấy thông tin phiên âm
    const phoneticInfo = await getPhonetic(text);
    this.currentPhoneticInfo = phoneticInfo;
    
    if (!phoneticInfo || !phoneticInfo.phonetic) {
      phoneticSection.style.display = 'none';
      return;
    }

    // Hiển thị phiên âm
    phoneticSection.style.display = 'block';
    
    const phoneticText = phoneticSection.querySelector('#phonetic-text');
    if (phoneticText) {
      phoneticText.textContent = phoneticInfo.phonetic;
    }

    // Hiển thị từ loại nếu có
    const wordType = phoneticSection.querySelector('#word-type');
    if (wordType && phoneticInfo.meanings && phoneticInfo.meanings.length > 0) {
      const types = phoneticInfo.meanings.map(m => m.partOfSpeech).join(', ');
      wordType.textContent = `(${types})`;
    }

    // Hiển thị nút play audio nếu có
    const playAudioBtn = phoneticSection.querySelector('#play-audio-btn') as HTMLElement;
    if (playAudioBtn && phoneticInfo.audio) {
      this.currentAudioUrl = phoneticInfo.audio;
      playAudioBtn.style.display = 'block';
    } else if (playAudioBtn) {
      playAudioBtn.style.display = 'none';
      this.currentAudioUrl = null;
    }
  }

  /**
   * Hiển thị popup tại vị trí được chỉ định và dịch văn bản
   */
  async show(x: number, y: number, text: string): Promise<void> {
    // Tạo popup nếu chưa có
    if (!this.popup) {
      this.popup = this.createPopup();
      this.setupEventListeners();
    }

    // Lưu từ hiện tại
    this.currentWord = text;

    // Hiển thị popup
    this.popup.style.display = 'block';

    // Tính toán và set vị trí
    const position = calculatePopupPosition(x, y);
    this.popup.style.left = `${position.x}px`;
    this.popup.style.top = `${position.y}px`;

    // Cập nhật văn bản gốc
    const originalTextDiv = this.popup.querySelector('#original-text');
    if (originalTextDiv) {
      originalTextDiv.textContent = text;
    }

    // Hiển thị phiên âm IPA (nếu là từ tiếng Anh đơn)
    await this.displayPhonetic(text);

    // Dịch văn bản
    const translatedDiv = this.popup.querySelector('#translated-text');
    if (translatedDiv && !this.isTranslating) {
      this.isTranslating = true;
      translatedDiv.textContent = 'Đang dịch...';

      const langSelect = this.popup.querySelector('#target-language') as HTMLSelectElement;
      const targetLang = langSelect?.value as LanguageCode || 'vi';
      
      const translation = await translateText(text, targetLang);
      translatedDiv.textContent = translation;
      
      // Lưu bản dịch hiện tại
      this.currentTranslation = translation;

      this.isTranslating = false;
    }
  }

  /**
   * Ẩn popup
   */
  hide(): void {
    if (this.popup) {
      this.popup.style.display = 'none';
    }
  }

  /**
   * Kiểm tra xem element có nằm trong popup không
   */
  contains(element: Node): boolean {
    return this.popup ? this.popup.contains(element) : false;
  }

  /**
   * Kiểm tra popup có đang hiển thị không
   */
  isVisible(): boolean {
    return this.popup ? this.popup.style.display !== 'none' : false;
  }
}
