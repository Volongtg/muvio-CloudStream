# Cài HHKUNGFU qua Repository CloudStream

## 1. Tạo repository GitHub
Tạo một repository **Public** mới trên GitHub, rồi upload toàn bộ nội dung của thư mục này.

> Không upload thêm một thư mục `CloudStream-main` lồng bên trong repository. `build.gradle`, `settings.gradle`, `gradlew` và `.github` phải nằm ở thư mục gốc repository.

## 2. Push code lên `main`
Sau khi upload xong, GitHub Actions sẽ tự chạy workflow `Build and publish HHKungfu CloudStream`.

Workflow sẽ:
- build `HHKungfu.cs3`
- tạo/cập nhật nhánh `builds`
- xuất `HHKungfu.cs3`, `plugins.json`, `repo.json`

## 3. Link repository để dán vào CloudStream
Sau khi workflow chạy **thành công**, dùng:

`https://raw.githubusercontent.com/USERNAME/REPOSITORY/builds/repo.json`

Ví dụ:

`https://raw.githubusercontent.com/Volongtg/CloudStream/builds/repo.json`

## 4. Trong CloudStream Android
Mở quản lý Extensions/Repositories → Add Repository → dán URL `repo.json`.

Sau đó chọn `HHKUNGFU` và Install.

## Lưu ý
Repository phải để **Public** để CloudStream có thể đọc file raw.
