export interface ProductFeature {
  name: string;
  desc: string;
  icon?: string;
}

export interface ProductSpec {
  label: string;
  value: string;
}

export interface FixoProduct {
  id: string;
  chapter: string;
  code: string;
  name: string;
  category: '基礎運算' | '網路與儲存' | '雲原生與數據' | '管理與安全';
  subtitle: string;
  description: string;
  badge: string;
  color: {
    primary: string;
    glow: string;
    border: string;
    bg: string;
    text: string;
  };
  building: {
    name: string;
    symbol: string;
    x: number; // World coordinates
    y: number;
    width: number;
    height: number;
  };
  features: ProductFeature[];
  specs: ProductSpec[];
  manualSection: string;
}
