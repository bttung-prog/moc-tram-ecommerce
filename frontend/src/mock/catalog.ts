import type { Category, Origin, AgarwoodType, AgarwoodGrade } from '@/types';

export const categories: Category[] = [
  // Level 0 — top-level groups
  { id: 'cat-burn', name: 'Trầm hương đốt', slug: 'tram-huong-dot', parentId: null, icon: 'Flame' },
  { id: 'cat-bracelet', name: 'Vòng tay trầm hương', slug: 'vong-tay-tram-huong', parentId: null, icon: 'Gem' },
  { id: 'cat-tool', name: 'Dụng cụ thưởng trầm', slug: 'dung-cu-thuong-tram', parentId: null, icon: 'Sparkles' },

  // Subcategories — Trầm hương đốt
  { id: 'cat-nhang-nu', name: 'Nhang nụ', slug: 'nhang-nu', parentId: 'cat-burn' },
  { id: 'cat-nhang-vong', name: 'Nhang vòng', slug: 'nhang-vong', parentId: 'cat-burn' },
  { id: 'cat-nhang-tam', name: 'Nhang tăm', slug: 'nhang-tam', parentId: 'cat-burn' },
  { id: 'cat-bot-tram', name: 'Bột trầm', slug: 'bot-tram', parentId: 'cat-burn' },
  { id: 'cat-tram-mieng', name: 'Trầm miếng xông', slug: 'tram-mieng-xong', parentId: 'cat-burn' },

  // Subcategories — Vòng tay trầm hương
  { id: 'cat-vong-108', name: 'Chuỗi 108 hạt', slug: 'chuoi-108-hat', parentId: 'cat-bracelet' },
  { id: 'cat-vong-don', name: 'Vòng đơn hạt tròn', slug: 'vong-don-hat-tron', parentId: 'cat-bracelet' },
  { id: 'cat-vong-truc', name: 'Vòng trầm đốt trúc', slug: 'vong-tram-dot-truc', parentId: 'cat-bracelet' },

  // Subcategories — Dụng cụ thưởng trầm
  { id: 'cat-lu-xong', name: 'Lư xông gốm/đồng', slug: 'lu-xong', parentId: 'cat-tool' },
  { id: 'cat-thac-khoi', name: 'Thác khói trầm hương', slug: 'thac-khoi', parentId: 'cat-tool' },
];

export const origins: Origin[] = [
  { id: 'origin-hk', name: 'Hương Khê (Hà Tĩnh)', region: 'Bắc Trung Bộ' },
  { id: 'origin-ht', name: 'Hà Tĩnh', region: 'Bắc Trung Bộ' },
  { id: 'origin-qn', name: 'Quảng Nam', region: 'Nam Trung Bộ' },
  { id: 'origin-kh', name: 'Khánh Hòa', region: 'Nam Trung Bộ' },
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
