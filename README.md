# HHKUNGFU CloudStream Repository v7

This repository contains the HHKUNGFU CloudStream extension.

## v7 fixes
- Adds CloudStream `mainPage` entries so the provider Home screen is populated.
- Keeps the URL normalization fixes from v6 for absolute, relative and protocol-relative URLs.
- Rejects invalid `javascript:`, `data:`, `mailto:` and `tel:` URLs before network access.
- Normalizes HTML entities and whitespace in URLs.
- GitHub Actions publishes `HHKungfu.cs3`, `plugins.json`, and `repo.json` to the `builds` branch.

CloudStream repository URL:

`https://raw.githubusercontent.com/Volongtg/CloudStream/builds/repo.json`

## Muvio / Nuvio

Đã thêm `muvio-hhkungfu/` — Stremio Addon dành cho Muvio/Nuvio Android. Xem README bên trong thư mục này để triển khai.
