// Main content script entry point

import { TranslationPopup } from './popup';

export default defineContentScript({
  matches: ['<all_urls>'],
  main() {
    console.log('Translation extension is ready!');

    const popup = new TranslationPopup();

    // Lắng nghe sự kiện mouseup để kiểm tra text selection
    document.addEventListener('mouseup', (e: MouseEvent) => {
      // Bỏ qua nếu click vào popup
      if (popup.contains(e.target as Node)) {
        return;
      }

      // Đợi một chút để selection hoàn tất
      setTimeout(() => {
        const selection = window.getSelection();
        const selectedText = selection?.toString().trim();

        if (selectedText && selectedText.length > 0) {
          // Có text được chọn - hiển thị popup và dịch
          popup.show(e.pageX, e.pageY, selectedText);
        } else {
          // Không có text - ẩn popup
          popup.hide();
        }
      }, 10);
    });

    // Ẩn popup khi click vào chỗ khác
    document.addEventListener('mousedown', (e: MouseEvent) => {
      if (!popup.contains(e.target as Node)) {
        // Kiểm tra xem có đang select text không
        setTimeout(() => {
          const selection = window.getSelection();
          const selectedText = selection?.toString().trim();
          if (!selectedText) {
            popup.hide();
          }
        }, 10);
      }
    });

    // Ẩn popup khi scroll
    document.addEventListener('scroll', () => {
      popup.hide();
    });

    // Ẩn popup khi nhấn ESC
    document.addEventListener('keydown', (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        popup.hide();
      }
    });
  },
});
