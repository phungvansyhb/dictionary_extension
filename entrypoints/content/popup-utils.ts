// Utility functions cho popup positioning và styling

import type { PopupPosition } from './types';

/**
 * Tính toán vị trí tối ưu cho popup
 * @param x - Tọa độ X của chuột (pageX)
 * @param y - Tọa độ Y của chuột (pageY)
 * @returns Vị trí cuối cùng cho popup
 */
export function calculatePopupPosition(x: number, y: number): PopupPosition {
  const popupWidth = 320;
  const popupHeight = 450;
  
  // Lấy kích thước viewport và scroll position
  const viewportWidth = window.innerWidth;
  const viewportHeight = window.innerHeight;
  const scrollX = window.pageXOffset || document.documentElement.scrollLeft;
  const scrollY = window.pageYOffset || document.documentElement.scrollTop;
  
  // Tính toán vị trí hiển thị (x, y là pageX, pageY - đã bao gồm scroll)
  let finalX = x;
  let finalY = y + 10; // Hiển thị dưới con trỏ 10px
  
  // Kiểm tra nếu popup vượt quá cạnh phải của viewport
  if (finalX + popupWidth > scrollX + viewportWidth) {
    finalX = scrollX + viewportWidth - popupWidth - 10;
  }
  
  // Kiểm tra nếu popup vượt quá cạnh dưới của viewport
  if (finalY + popupHeight > scrollY + viewportHeight) {
    // Hiển thị phía trên con trỏ thay vì phía dưới
    finalY = y - popupHeight - 10;
    
    // Nếu vẫn bị tràn lên trên, điều chỉnh lại
    if (finalY < scrollY) {
      finalY = scrollY + 10;
    }
  }
  
  // Đảm bảo không bị âm hoặc quá nhỏ
  finalX = Math.max(10, finalX);
  finalY = Math.max(10, finalY);
  
  return { x: finalX, y: finalY };
}

/**
 * CSS styles cho popup container
 */
export const POPUP_STYLES = `
  position: absolute;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: none;
  border-radius: 12px;
  padding: 16px;
  box-shadow: 0 10px 25px rgba(0,0,0,0.3);
  z-index: 999999;
  display: none;
  font-family: 'Segoe UI', Arial, sans-serif;
  font-size: 14px;
  color: white;
  min-width: 300px;
  max-width: 500px;
  transition: all 0.3s ease;
`;
