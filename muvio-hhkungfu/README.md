# HHKUNGFU cho Muvio / Nuvio

Đây là **Stremio Addon** riêng cho Muvio/Nuvio Android. Phần CloudStream `.cs3` trong repository gốc vẫn được giữ nguyên.

## Deploy bằng Vercel

1. Đưa repository này lên GitHub.
2. Import repository vào Vercel.
3. Chọn **Root Directory = `muvio-hhkungfu`**.
4. Deploy.
5. Kiểm tra `https://TEN-MIEN-CUA-BAN.vercel.app/manifest.json`.
6. Trong Muvio: **Hồ sơ → Addon → Thêm addon** và nhập URL `/manifest.json`.

Addon cung cấp catalog, metadata và stream theo Stremio Addon Protocol.

### Lưu ý về stream

Addon ưu tiên URL trực tiếp `.m3u8/.mp4/.webm/.mkv`. Nếu server HHKUNGFU chỉ cung cấp iframe/player mà không lộ URL media trực tiếp, bản này sẽ trả `externalUrl` làm phương án dự phòng; khi đó cần thêm extractor riêng cho server đó.
