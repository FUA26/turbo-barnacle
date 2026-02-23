# Panduan Instalasi Shared Data Table

## 1. Install Dependencies

Install semua dependensi yang diperlukan:

```bash
# Core dependencies
npm install @tanstack/react-table@^8.21.3

# Icons
npm install @tabler/icons-react@^3.36.0

# UI dependencies (Radix UI + utilities)
npm install cmdk@^1.1.1
npm install date-fns@^4.1.0
npm install react-day-picker@^9.12.0
npm install class-variance-authority@^0.7.1
npm install clsx@^2.1.1
npm install tailwind-merge@^3.4.0

# Radix UI primitives
npm install @radix-ui/react-slot
npm install @radix-ui/react-popover
npm install @radix-ui/react-select
npm install @radix-ui/react-separator
npm install @radix-ui/react-dropdown-menu
npm install @radix-ui/react-dialog

# Lucide icons (untuk beberapa icon di UI components)
npm install lucide-react@^0.560.0
```

Atau install sekaligus:

```bash
npm install \
  @tanstack/react-table \
  @tabler/icons-react \
  cmdk \
  date-fns \
  react-day-picker \
  class-variance-authority \
  clsx \
  tailwind-merge \
  @radix-ui/react-slot \
  @radix-ui/react-popover \
  @radix-ui/react-select \
  @radix-ui/react-separator \
  @radix-ui/react-dropdown-menu \
  @radix-ui/react-dialog \
  lucide-react
```

## 2. Copy File ke Proyek Anda

### Option A: Copy Seluruh Folder

Copy seluruh folder `shared-data-table` ke proyek Anda:

```bash
cp -r shared-data-table /path/to/your/project/components/
```

### Option B: Copy File Per File

Copy file-file berikut ke struktur proyek Anda:

```
your-project/
├── lib/
│   └── utils.ts                 # dari shared-data-table/lib/utils.ts
├── components/
│   ├── data-table/              # semua file dari shared-data-table/components/data-table/
│   │   ├── index.ts
│   │   ├── data-table.tsx
│   │   ├── data-table-action-bar.tsx
│   │   ├── data-table-column-header.tsx
│   │   ├── data-table-date-filter.tsx
│   │   ├── data-table-faceted-filter.tsx
│   │   ├── data-table-pagination.tsx
│   │   └── data-table-view-options.tsx
│   └── ui/                      # semua file dari shared-data-table/components/ui/
│       ├── table.tsx
│       ├── button.tsx
│       ├── input.tsx
│       ├── select.tsx
│       ├── badge.tsx
│       ├── separator.tsx
│       ├── popover.tsx
│       ├── command.tsx
│       ├── calendar.tsx
│       ├── dropdown-menu.tsx
│       └── dialog.tsx
```

## 3. Setup Tailwind CSS

Pastikan `tailwind-merge` dan `clsx` sudah terinstall. File `lib/utils.ts` sudah menyediakan helper function `cn()`:

```typescript
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```

## 4. Konfigurasi Import Path

Jika menggunakan `@/` alias, pastikan `tsconfig.json` sudah dikonfigurasi:

```json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./*"]
    }
  }
}
```

Atau sesuaikan import di setiap file komponen sesuai dengan struktur proyek Anda.

## 5. Update Import di Setiap File

Jika struktur folder Anda berbeda, update import path di file-file berikut:

### Di komponen data-table:

```typescript
// Sebelumnya:
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
// ...

// Sesuaikan menjadi (contoh untuk struktur relative):
import { cn } from "../../../lib/utils";
import { Button } from "../ui/button";
// ...
```

### Di komponen ui:

```typescript
// Sebelumnya:
import { cn } from "@/lib/utils";

// Sesuaikan menjadi:
import { cn } from "../../lib/utils";
```

## 6. Verifikasi Instalasi

Buat file test untuk memastikan semua komponen dapat di-import:

```typescript
// app/test-table/page.tsx
"use client";

import { DataTable } from "@/components/data-table";
import { DataTableColumnHeader } from "@/components/data-table";
import { DataTablePagination } from "@/components/data-table";

export default function TestTablePage() {
  // TODO: Implement table
  return <div>Table test</div>;
}
```

Jalankan dev server dan pastikan tidak ada error:

```bash
npm run dev
```

## Troubleshooting

### Error: Module not found

Pastikan semua dependencies sudah terinstall dan path import sudah sesuai dengan struktur proyek Anda.

### Error: Component tidak merender dengan benar

Pastikan Tailwind CSS sudah terkonfigurasi dengan benar dan base styles sudah di-import.

### Icon tidak muncul

Pastikan `@tabler/icons-react` dan `lucide-react` sudah terinstall.

## Catatan untuk Framework Lain

Komponen ini dibuat untuk Next.js 15+ dengan App Router. Untuk penggunaan di framework lain:

1. Komponen menggunakan `"use client"` directive - hapus untuk framework lain
2. Sesuaikan import path sesuai dengan framework
3. Pastikan CSS framework (Tailwind) sudah terkonfigurasi
