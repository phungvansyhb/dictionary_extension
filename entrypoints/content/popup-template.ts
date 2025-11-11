// HTML template cho popup

import switchIcon from '~/assets/switch.svg';
import saveIcon from '~/assets/save.svg';
import copyIcon from '~/assets/copy.svg';

/**
 * Tạo HTML template cho popup
 * @returns HTML string
 */
export function getPopupTemplate(): string {
  return `
    <div style="margin-bottom: 12px;">
      <!-- Header với title và language selector -->
      <div style="
        display: flex; 
        align-items: center; 
        justify-content: space-between; 
        margin-bottom: 12px;
        gap: 12px;
      ">
        <div style="font-weight: 600; font-size: 16px; display: flex; align-items: center; gap: 8px; white-space: nowrap;">
          🌐 Dịch văn bản
        </div>
        
        <!-- Ngôn ngữ đích - bên phải -->
        <div style="display: flex; 
            position: relative; 
            align-items: center; 
            gap: 6px; 
           ">
          <img src="${switchIcon}" alt="switch" style="
            position: absolute; 
            top: 50%; 
            left: 8px; 
            transform: translateY(-50%);
            width: 16px; 
            height: 16px;
            filter: brightness(0) invert(1);
            pointer-events: none;
          " />
          <select id="target-language" style="
            padding: 6px 10px;
            border-radius: 6px;
            border: none;
            background: rgba(255,255,255,0.2);
            color: white;
            font-size: 12px;
            cursor: pointer;
            outline: none;
            min-width: 120px;
            font-weight: 500;
            padding-left: 28px;
          ">
            <option value="vi" style="color:black">🇻🇳 Tiếng Việt</option>
            <option value="en" style="color:black">🇺🇸 English</option>
            <option value="zh-CN" style="color:black">🇨🇳 中文</option>
            <option value="ja" style="color:black">🇯🇵 日本語</option>
            <option value="ko" style="color:black">🇰🇷 한국어</option>
            <option value="fr" style="color:black">🇫🇷 Français</option>
            <option value="de" style="color:black">🇩🇪 Deutsch</option>
            <option value="es" style="color:black">🇪🇸 Español</option>
            <option value="ru" style="color:black">🇷🇺 Русский</option>
            <option value="th" style="color:black">🇹🇭 ไทย</option>
          </select>
        </div>
      </div>
      
      
      
      <!-- Văn bản gốc -->
      <div style="
        background: rgba(255,255,255,0.15);
        padding: 10px;
        border-radius: 8px;
        margin-bottom: 10px;
        max-height: 120px;
        overflow-y: auto;
      ">
        <div style="font-size: 11px; opacity: 0.8; margin-bottom: 4px;">Văn bản gốc:</div>
        <div id="original-text" style="font-size: 13px; line-height: 1.5;"></div>
      </div>

      <!-- Kết quả dịch -->
      <div style="
        background: rgba(255,255,255,0.95);
        color: #333;
        padding: 12px;
        border-radius: 8px;
        min-height: 50px;
        max-height: 150px;
        overflow-y: auto;
         margin-bottom: 10px;
      ">
        <div style="font-size: 11px; color: #666; margin-bottom: 4px;">Bản dịch:</div>
        <div id="translated-text" style="font-size: 14px; line-height: 1.6; font-weight: 500;">
          Đang dịch...
        </div>
      </div>

      <!-- Phiên âm IPA (ẩn mặc định, chỉ hiển thị cho từ tiếng Anh đơn) -->
      <div id="phonetic-section" style="
        display: none;
        background: rgba(255,255,255,0.1);
        padding: 8px 12px;
        border-radius: 8px;
        border-left: 3px solid rgba(255,255,255,0.4);
      ">
        <div style="display: flex; align-items: center; justify-content: space-between; gap: 8px;">
          <div>
            <div style="font-size: 11px; opacity: 0.8; margin-bottom: 2px;">Phiên âm:</div>
            <div id="phonetic-text" style="font-size: 15px; font-weight: 500; font-family: 'Segoe UI', Arial;">
              /həˈloʊ/
            </div>
          </div>
          <button id="play-audio-btn" style="
            padding: 6px 10px;
            border: none;
            border-radius: 6px;
            background: rgba(255,255,255,0.2);
            color: white;
            cursor: pointer;
            font-size: 18px;
            display: none;
            transition: all 0.2s;
          ">
            🔊
          </button>
        </div>
        <div id="word-type" style="
          font-size: 11px; 
          opacity: 0.7; 
          margin-top: 4px;
          font-style: italic;
        "></div>
      </div>
      
      
      <!-- Các nút action -->
      <div style="display: flex; gap: 8px; margin-top: 12px;">
        <button id="copy-translation-btn" style="
          display: inline-flex;
          align-items: center;
          flex: 1;
          padding: 10px;
          border: none;
          border-radius: 6px;
          background: rgba(255,255,255,0.25);
          color: white;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
          font-size: 13px;
        ">
          <img src="${copyIcon}" alt="copy" style="
            width: 16px; 
            height: 16px;
            filter: brightness(0) invert(1);
            pointer-events: none;
            margin-right: 6px;
          " />
          Copy
        </button>
        <button id="save-word-btn" style="
          display: inline-flex;
          align-items: center;
          flex: 1;
          padding: 10px;
          border: none;
          border-radius: 6px;
          background: rgba(255,255,255,0.25);
          color: white;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
          font-size: 13px;
        ">
           <img src="${saveIcon}" alt="save" style="
            width: 16px; 
            height: 16px;
            filter: brightness(0) invert(1);
            pointer-events: none;
            margin-right: 6px;
          " />
          Lưu từ
        </button>
      
      </div>
    </div>
  `;
}

/**
 * Áp dụng hover effects cho buttons
 */
export function applyButtonEffects(container: HTMLElement): void {
  const buttons = container.querySelectorAll('button');
  buttons.forEach(btn => {
    btn.addEventListener('mouseenter', () => {
      (btn as HTMLElement).style.background = 'rgba(255,255,255,0.35)';
      (btn as HTMLElement).style.transform = 'translateY(-2px)';
    });
    btn.addEventListener('mouseleave', () => {
      (btn as HTMLElement).style.background = 'rgba(255,255,255,0.25)';
      (btn as HTMLElement).style.transform = 'translateY(0)';
    });
  });
}

/**
 * Áp dụng hover effect cho select
 */
export function applySelectEffects(select: HTMLSelectElement): void {
  select.addEventListener('mouseenter', () => {
    select.style.background = 'rgba(255,255,255,0.3)';
  });
  select.addEventListener('mouseleave', () => {
    select.style.background = 'rgba(255,255,255,0.2)';
  });
}
