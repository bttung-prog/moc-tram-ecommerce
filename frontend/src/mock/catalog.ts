import type { Category, Origin, AgarwoodType, AgarwoodGrade } from '@/types';

export const categories: Category[] = [
  // Level 0 — top-level groups
  { id: 'cat-burn', name: 'Trầm hương đốt', slug: 'tram-huong-dot', parentId: null, icon: 'Flame' },
  { id: 'cat-tool', name: 'Dụng cụ thưởng trầm', slug: 'dung-cu-thuong-tram', parentId: null, icon: 'Ornament' },
  { id: 'cat-zen', name: 'Không gian Thiền & Trà', slug: 'khong-gian-thien-tra', parentId: null, icon: 'Flower2' },

  // Subcategories — Trầm hương đốt
  { id: 'cat-nhang-nu', name: 'Nhang nụ', slug: 'nhang-nu', parentId: 'cat-burn' },
  { id: 'cat-nhang-vong', name: 'Nhang vòng', slug: 'nhang-vong', parentId: 'cat-burn' },
  { id: 'cat-nhang-tam', name: 'Nhang tăm', slug: 'nhang-tam', parentId: 'cat-burn' },
  { id: 'cat-bot-tram', name: 'Bột trầm', slug: 'bot-tram', parentId: 'cat-burn' },
  { id: 'cat-tram-mieng', name: 'Trầm miếng xông', slug: 'tram-mieng-xong', parentId: 'cat-burn' },

  // Subcategories — Dụng cụ thưởng trầm
  { id: 'cat-lu-xong', name: 'Lư xông gốm/đồng', slug: 'lu-xong', parentId: 'cat-tool' },
  { id: 'cat-thac-khoi', name: 'Thác khói trầm hương', slug: 'thac-khoi', parentId: 'cat-tool' },
  { id: 'cat-may-xong', name: 'Máy xông trầm điện', slug: 'may-xong-tram', parentId: 'cat-tool' },

  // Subcategories — Không gian Thiền & Trà
  { id: 'cat-bo-doan', name: 'Bồ đoàn / Tọa cụ', slug: 'bo-doan', parentId: 'cat-zen' },
  { id: 'cat-qua-tra', name: 'Bộ dụng cụ pha trà', slug: 'bo-dung-cu-pha-tra', parentId: 'cat-zen' },
  { id: 'cat-chuoi-tram', name: 'Chuỗi hạt trầm hương', slug: 'chuoi-hat-tram-huong', parentId: 'cat-zen' },
];

export const origins: Origin[] = [
  { id: 'origin-kh', name: 'Khánh Hòa', region: 'Nam Trung Bộ' },
  { id: 'origin-qn', name: 'Quảng Nam', region: 'Nam Trung Bộ' },
];

export const agarwoodTypes: AgarwoodType[] = [
  { id: 'type-natural', name: 'Trầm tự nhiên' },
  { id: 'type-cultivated', name: 'Trầm trồng' },
  { id: 'type-ky-nam', name: 'Kỳ nam' },
  { id: 'type-pressed', name: 'Trầm nén' },
];

export const agarwoodGrades: AgarwoodGrade[] = [
  { id: 'grade-1', name: 'Cấp 1 — Siêu phẩm', level: 1 },
  { id: 'grade-2', name: 'Cấp 2 — Thượng hạng', level: 2 },
  { id: 'grade-3', name: 'Cấp 3 — Tiêu chuẩn', level: 3 },
  { id: 'grade-4', name: 'Cấp 4 — Phổ thông', level: 4 },
];
