# Content Script Structure

Cấu trúc thư mục cho translation extension content script.

## 📁 File Organization

```
content/
├── types.ts           # TypeScript types và interfaces
├── translator.ts      # Translation API service
├── popup-template.ts  # HTML templates và UI effects
├── popup-utils.ts     # Utility functions (positioning, styling)
└── popup.ts          # TranslationPopup class (main logic)
```

## 📄 File Descriptions

### `types.ts`
- Định nghĩa TypeScript types và interfaces
- `TranslationResult`, `PopupPosition`, `LanguageCode`

### `translator.ts`
- Service để gọi Google Translate API
- Function `translateText()` - dịch văn bản

### `popup-template.ts`
- HTML template cho popup UI
- Functions để apply hover effects
- Icon imports (switch, copy, sound)

### `popup-utils.ts`
- Utility functions cho positioning
- `calculatePopupPosition()` - tính toán vị trí popup thông minh
- `POPUP_STYLES` - CSS constants

### `popup.ts`
- **TranslationPopup class** - quản lý toàn bộ popup lifecycle
- Methods:
  - `show()` - hiển thị popup và dịch text
  - `hide()` - ẩn popup
  - `contains()` - kiểm tra element có trong popup
  - `isVisible()` - kiểm tra trạng thái hiển thị

## 🎯 Main Entry Point

File `content.ts` ở thư mục cha import và sử dụng `TranslationPopup` class.

## 🔄 How It Works

1. User select text → `mouseup` event
2. Create `TranslationPopup` instance
3. Call `popup.show(x, y, selectedText)`
4. Popup tự động:
   - Tính toán vị trí tối ưu
   - Hiển thị UI
   - Gọi API dịch
   - Cập nhật kết quả

## 🛠️ Benefits of This Structure

✅ **Separation of Concerns** - mỗi file có trách nhiệm riêng
✅ **Maintainability** - dễ sửa và nâng cấp
✅ **Testability** - dễ viết unit tests
✅ **Reusability** - có thể tái sử dụng components
✅ **Type Safety** - TypeScript types riêng biệt
