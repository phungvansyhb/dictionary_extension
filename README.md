Trong lập trình tiện ích mở rộng (browser extension), có nhiều **context** khác nhau, mỗi context đại diện cho một môi trường thực thi riêng biệt với các quyền và khả năng khác nhau. Dưới đây là các context phổ biến:

***

### 🧠 **1. Background Context**

*   Là nơi chạy các tác vụ nền như lắng nghe sự kiện, xử lý logic, giao tiếp với API.
*   Có thể là **background script** hoặc **service worker** (tùy thuộc vào manifest v2 hay v3).
*   Không có giao diện người dùng.

***

### 🌐 **2. Content Script Context**

*   Được inject vào trang web người dùng đang truy cập.
*   Có thể truy cập DOM của trang web nhưng bị giới hạn quyền truy cập vào các API của extension.
*   Dùng để tương tác trực tiếp với nội dung trang (ví dụ: lấy dữ liệu, thay đổi giao diện).

***

### 🪟 **3. Popup Context**

*   Là giao diện hiển thị khi người dùng nhấn vào biểu tượng extension trên thanh công cụ.
*   Có thể giao tiếp với background thông qua `message passing`.
*   Chạy trong một môi trường riêng biệt, không truy cập trực tiếp vào DOM của trang web.

***

### ⚙️ **4. Options Page Context**

*   Là trang cấu hình cho extension.
*   Có thể lưu và đọc dữ liệu từ `chrome.storage`.

***

### 🧩 **5. Devtools, Sidebar, New Tab, Side Panel Contexts**

*   Các context đặc biệt tùy thuộc vào loại extension và trình duyệt.
*   Ví dụ: một extension có thể thêm tab mới vào DevTools hoặc tạo giao diện bên cạnh trang web.

***

### 🔒 **Sandbox Context**

*   Một trang HTML cô lập, không chia sẻ context với các phần khác của extension.
*   Dùng để chạy mã không tin cậy hoặc xử lý dữ liệu nhạy cảm.

***

### 🔄 **Giao tiếp giữa các context**

*   Các context không thể truy cập trực tiếp lẫn nhau.
*   Dùng **message passing** (`chrome.runtime.sendMessage`, `chrome.runtime.onMessage`) hoặc **port** để giao tiếp.


