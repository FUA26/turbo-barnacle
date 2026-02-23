# Shared Data Table

Komponen data table yang dapat digunakan kembali (reusable) untuk Next.js 15+ dengan TanStack Table dan Shadcn UI.

## Fitur

- **Sorting** - Pengurutan data berdasarkan kolom
- **Filtering** - Filter data dengan faceted filter dan date filter
- **Pagination** - Pagination dengan kontrol lengkap
- **Column Visibility** - Toggle visibilitas kolom
- **Row Selection** - Pilihan baris dengan checkbox
- **Density Control** - Pengaturan tinggi baris (short, medium, tall, extra-tall)
- **Floating Action Bar** - Action bar melayang untuk baris yang dipilih
- **TypeScript** - Full type support

## Komponen

| Komponen                 | Deskripsi                                         |
| ------------------------ | ------------------------------------------------- |
| `DataTable`              | Komponen utama table                              |
| `DataTablePagination`    | Kontrol pagination                                |
| `DataTableColumnHeader`  | Header kolom dengan sorting dan visibility toggle |
| `DataTableFacetedFilter` | Filter dengan pilihan multiple                    |
| `DataTableDateFilter`    | Filter rentang tanggal                            |
| `DataTableViewOptions`   | Toggle visibilitas kolom                          |
| `DataTableActionBar`     | Action bar melayang untuk baris terpilih          |

## Instalasi

Lihat [INSTALL.md](./INSTALL.md) untuk panduan instalasi lengkap.

## Penggunaan

Lihat [USAGE.md](./USAGE.md) untuk contoh penggunaan.

## Struktur Folder

```
shared-data-table/
├── components/
│   ├── data-table/      # Komponen data table utama
│   └── ui/              # Komponen UI Shadcn yang diperlukan
├── lib/
│   └── utils.ts         # Utility functions (cn helper)
├── examples/            # Contoh penggunaan
├── README.md            # File ini
├── INSTALL.md           # Panduan instalasi
└── USAGE.md             # Contoh penggunaan
```

## Dependensi

```json
{
  "@tanstack/react-table": "^8.21.3",
  "@tabler/icons-react": "^3.36.0",
  "cmdk": "^1.1.1",
  "date-fns": "^4.1.0",
  "react-day-picker": "^9.12.0",
  "class-variance-authority": "^0.7.1",
  "clsx": "^2.1.1",
  "tailwind-merge": "^3.4.0"
}
```

## License

MIT
