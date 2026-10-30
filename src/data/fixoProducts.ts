import { FixoProduct } from '../types/product';

export const FIXO_PRODUCTS: FixoProduct[] = [
  {
    id: 'cam',
    chapter: 'Ch 4',
    code: 'CAM',
    name: 'CAM 帳戶管理服務',
    category: '管理與安全',
    subtitle: '多租戶權限與企業級安全認證核心',
    description: 'Cloud Account Management (CAM) 提供完整的企業身分識別與存取管理，支援多因子認證 (MFA)、細緻化權限角色劃分，為整座 FiXo 雲端平台建立第一道最堅實的零信任防線。',
    badge: '身份與安全閘道',
    color: {
      primary: '#f59e0b',
      glow: 'rgba(245, 158, 11, 0.4)',
      border: 'border-amber-500/40',
      bg: 'bg-amber-500/10',
      text: 'text-amber-400'
    },
    building: {
      name: '認證總督府',
      symbol: '🏛️',
      x: 1200,
      y: 280,
      width: 140,
      height: 120,
      pos3D: { x: 0, y: 0, z: -28 }
    },
    features: [
      { name: '個人與組織資訊', desc: '集中管理多組織、團隊角色與個人聯絡資料，權責分明。' },
      { name: 'MFA 雙因素驗證', desc: '支援 Google Authenticator 等 TOTP 雙因子驗證，全面防範憑證盜用。' },
      { name: '安全憑證管理', desc: '自訂密碼輪替策略與複雜度檢查，強化存取密鑰的安全性。' },
      { name: '自動逾時防護', desc: '手冊規定閒置自動登出與節流保護機制，防止未授權端點留存。' }
    ],
    specs: [
      { label: '認證標準', value: 'TOTP / OIDC / SAML 2.0' },
      { label: '安全性等級', value: '企業級零信任 (Zero Trust)' },
      { label: '防護機制', value: '暴力破解阻擋 + 逾時節流' }
    ],
    manualSection: '手冊第 4 章：CAM 帳戶管理服務 (4.1~4.4)'
  },
  {
    id: 'vpc',
    chapter: 'Ch 5',
    code: 'VPC',
    name: 'VPC 虛擬私有網路',
    category: '網路與儲存',
    subtitle: '軟體定義的高隔離彈性雲端網路中樞',
    description: 'Virtual Private Cloud (VPC) 提供邏輯隔離的私有雲端虛擬網路空間。您可以自定義 IP 位址範圍、子網劃分、路由表設定，並藉由浮動 IP 與外部網路高速互通。',
    badge: '網路核心中樞',
    color: {
      primary: '#06b6d4',
      glow: 'rgba(6, 182, 212, 0.4)',
      border: 'border-cyan-500/40',
      bg: 'bg-cyan-500/10',
      text: 'text-cyan-400'
    },
    building: {
      name: '網路立體中樞',
      symbol: '🌐',
      x: 880,
      y: 620,
      width: 150,
      height: 130,
      pos3D: { x: -22, y: 0, z: -14 }
    },
    features: [
      { name: '私有子網劃分', desc: '靈活規劃多層次網路架構（公有子網、私有計算子網、資料庫隔離區）。' },
      { name: '虛擬路由器 (Router)', desc: '高效能軟體定義路由轉發，具備 SNAT/DNAT 閘道能力。' },
      { name: '浮動 IP 與網卡', desc: '動態綁定或解綁外部公網 IP (Floating IP) 與多彈性網卡 (Floating NIC)。' },
      { name: '對等連接 (Peering)', desc: '支援跨 VPC 內部私網互聯，低延遲且免經公網的高速數據打通。' }
    ],
    specs: [
      { label: '協定支援', value: 'IPv4 / IPv6 雙棧架構' },
      { label: '網路隔離', value: 'VxLAN / Geneve 租戶隔離' },
      { label: '頻寬吞吐', value: '100 Gbps 線速轉發支援' }
    ],
    manualSection: '手冊第 5 章：VPC 虛擬私有網路服務 (5.1~5.5)'
  },
  {
    id: 'fico',
    chapter: 'Ch 6',
    code: 'FiCo',
    name: 'FiCo 計算機服務',
    category: '基礎運算',
    subtitle: '頂級效能、彈性自訂之核心雲端運算基石',
    description: 'FiCo 是 FiXo 雲端平台的核心彈性計算引擎。提供多種規格的虛擬伺服器、雲磁碟掛載、跨可用區親和性群組、秒級快照與跨區域資料備份，支撐各類核心業務負載。',
    badge: '運算核心旗艦',
    color: {
      primary: '#3b82f6',
      glow: 'rgba(59, 130, 246, 0.4)',
      border: 'border-blue-500/40',
      bg: 'bg-blue-500/10',
      text: 'text-blue-400'
    },
    building: {
      name: '超算核心主塔',
      symbol: '⚡',
      x: 1200,
      y: 600,
      width: 160,
      height: 140,
      pos3D: { x: 0, y: 0, z: -14 }
    },
    features: [
      { name: '彈性虛擬機 (VM)', desc: '數十種 vCPU / RAM 規格即開即用，支援秒級部署與線上調整規格。' },
      { name: '自訂映像檔管理', desc: '支援官方預載 OS 映像檔、自訂 Golden Image 與跨區共用鏡像。' },
      { name: '伺服器群組與親和性', desc: '支援 Anti-affinity 拓樸規則，將實例分散部署在不同實體機保障高可用。' },
      { name: '磁碟快照與跨域備份', desc: '自動定時排程快照與跨地區 (Cross-Region) 異地容災備份。' }
    ],
    specs: [
      { label: '虛擬化技術', value: 'KVM / 企業級硬體虛擬化' },
      { label: 'SLA 保證', value: '99.95% 高可用性' },
      { label: '安全防護', value: '安全群組 (Security Group) + SSH 金鑰' }
    ],
    manualSection: '手冊第 6 章：FiCo 計算機服務 (6.1~6.10)'
  },
  {
    id: 'fibo',
    chapter: 'Ch 7',
    code: 'FiBo',
    name: 'FiBo 物件儲存服務',
    category: '網路與儲存',
    subtitle: '海量非結構化數據、相容 S3 之安全持久海港',
    description: 'FiBo (Fi Bucket Object Storage) 提供具備極高耐久性與無限水平擴展能力的物件儲存空間。全面相容 AWS S3 協定標準，輕鬆承載影音多媒體、備份歸檔及巨量訓練數據集。',
    badge: '巨量持久儲存',
    color: {
      primary: '#10b981',
      glow: 'rgba(16, 185, 129, 0.4)',
      border: 'border-emerald-500/40',
      bg: 'bg-emerald-500/10',
      text: 'text-emerald-400'
    },
    building: {
      name: '數據深水海港',
      symbol: '⚓',
      x: 1540,
      y: 620,
      width: 150,
      height: 130,
      pos3D: { x: 22, y: 0, z: -14 }
    },
    features: [
      { name: '儲存桶 (Bucket) 管理', desc: '直覺化建立與命名儲存桶，支援存取控制清單 (ACL) 與生命週期轉檔。' },
      { name: 'S3 金鑰對授權', desc: '配發專屬 Access Key 與 Secret Key，無縫對接開源工具及 SDK。' },
      { name: '多副本與資料耐久度', desc: '後端多節點分散式擦除碼 (Erasure Coding) 冗餘架構，確保數據零遺失。' },
      { name: '靜態網頁託管', desc: '支援透過儲存桶直接發佈靜態 HTML/SPA 網站與公開資產。' }
    ],
    specs: [
      { label: 'API 協定', value: 'AWS S3 RESTful API 相容' },
      { label: '資料耐久度', value: '99.999999999% (11 個 9)' },
      { label: '儲存容量', value: '無上限彈性擴展' }
    ],
    manualSection: '手冊第 7 章：FiBo 物件儲存服務 (7.1~7.2)'
  },
  {
    id: 'lbs',
    chapter: 'Ch 8',
    code: 'LBS',
    name: 'LBS 負載平衡服務',
    category: '基礎運算',
    subtitle: '自動化流量導流、第七層進階調度分流燈塔',
    description: 'Load Balancing Service (LBS) 將進入的流量自動分發至後端多個 FiCo 運算伺服器或容器叢集。具備第四層 (TCP/UDP) 與第七層 (HTTP/HTTPS) 進階轉發規則與健全檢查。',
    badge: '高併發流量指揮',
    color: {
      primary: '#8b5cf6',
      glow: 'rgba(139, 92, 246, 0.4)',
      border: 'border-purple-500/40',
      bg: 'bg-purple-500/10',
      text: 'text-purple-400'
    },
    building: {
      name: '智慧流量燈塔',
      symbol: '⚖️',
      x: 880,
      y: 960,
      width: 140,
      height: 130,
      pos3D: { x: -22, y: 0, z: 8 }
    },
    features: [
      { name: '進階負載平衡器', desc: '支援公網及私網專用負載平衡，輕鬆應對突發百萬流量峰值。' },
      { name: '智慧轉發政策 (Policy)', desc: '基於網域名稱 (Host)、URL 路徑及 HTTP Header 進行精準內容轉向。' },
      { name: '自動健康檢查', desc: '即時監測後端伺服器運作狀態，秒級自動旁路故障實例。' },
      { name: 'SSL 憑證卸載 (Offload)', desc: '集中終結 TLS 加密通訊，大幅釋放後端運算資源。' }
    ],
    specs: [
      { label: '調度層級', value: 'Layer 4 (TCP/UDP) & Layer 7 (HTTP/S)' },
      { label: '負載演算法', value: '輪詢 (RR)、加權、最小連接數' },
      { label: '容災切換', value: '主備自動秒級故障轉移' }
    ],
    manualSection: '手冊第 8 章：LBS 負載平衡服務 (8.1~8.2)'
  },
  {
    id: 'cis',
    chapter: 'Ch 9',
    code: 'CIS',
    name: 'CIS 容器基礎設施',
    category: '雲原生與數據',
    subtitle: '全託管 Kubernetes 與海神平台 (Poseidon)',
    description: 'Container Infrastructure Service (CIS) 整合了生產級 K8s 託管叢集與專為微服務打造的「海神平台 (Poseidon)」，協助開發者實現彈性伸縮、持續整合發佈的雲原生轉型。',
    badge: '雲原生微服務引擎',
    color: {
      primary: '#0ea5e9',
      glow: 'rgba(14, 165, 233, 0.4)',
      border: 'border-sky-500/40',
      bg: 'bg-sky-500/10',
      text: 'text-sky-400'
    },
    building: {
      name: '海神容器船塢',
      symbol: '🐳',
      x: 1200,
      y: 960,
      width: 160,
      height: 130,
      pos3D: { x: 0, y: 0, z: 8 }
    },
    features: [
      { name: 'Kubernetes 託管叢集', desc: '標準 CNCF 認證 K8s 環境，免去繁瑣的 Control Plane 維護負擔。' },
      { name: '海神平台 (Poseidon)', desc: '一站式容器可視化管理、工作負載 (Workload) 與服務目錄發布。' },
      { name: '水平彈性擴展 (HPA)', desc: '依 CPU/記憶體負載指標自動伸縮容器數量，靈活應對峰值流量。' },
      { name: '微服務治理與日誌', desc: '整合 Service Mesh 與集中式容器日誌收集，簡化排錯鏈條。' }
    ],
    specs: [
      { label: '標準相容', value: 'CNCF 認證標準 Kubernetes' },
      { label: '排程效率', value: '秒級 Pod 自動啟動與調度' },
      { label: '擴展性', value: '支援數百節點動態彈性叢集' }
    ],
    manualSection: '手冊第 9 章：CIS 容器基礎設施服務 (9.1~9.2)'
  },
  {
    id: 'kms',
    chapter: 'Ch 10',
    code: 'KMS',
    name: 'KMS 金鑰管理服務',
    category: '管理與安全',
    subtitle: '符合密碼學規範之集中化金鑰與憑證金庫',
    description: 'Key Management Service (KMS) 提供硬體安全模組 (HSM) 等級的密碼管理解決方案。集中託管非對稱/對稱密碼金鑰與伺服器 SSL 數位憑證，保護敏感商業機密不外洩。',
    badge: '密碼學保險箱',
    color: {
      primary: '#ec4899',
      glow: 'rgba(236, 72, 153, 0.4)',
      border: 'border-pink-500/40',
      bg: 'bg-pink-500/10',
      text: 'text-pink-400'
    },
    building: {
      name: '密鑰地下金庫',
      symbol: '🔐',
      x: 1540,
      y: 960,
      width: 140,
      height: 130,
      pos3D: { x: 22, y: 0, z: 8 }
    },
    features: [
      { name: '數位安全憑證管理', desc: '集中上傳、簽發與監控 SSL/TLS 伺服器憑證有效期限，避免過期斷線。' },
      { name: '非對稱式金鑰 (RSA/ECC)', desc: '提供公私鑰對產生與數位簽章驗證，符合現代密碼學高標準。' },
      { name: '對稱式金鑰 (AES-256)', desc: '用以加密雲磁碟、物件儲存及資料庫落盤數據 (Data-at-Rest Encryption)。' },
      { name: '金鑰生命週期與權限', desc: '支援金鑰輪替、停用及詳細的存取存查軌跡。' }
    ],
    specs: [
      { label: '加密演算法', value: 'AES-256, RSA 4096, ECC P-384' },
      { label: '安全標準', value: 'FIPS 140-2 Level 3 HSM 規範' },
      { label: '金鑰防護', value: '私鑰絕不出境，硬體隔離保護' }
    ],
    manualSection: '手冊第 10 章：KMS 金鑰管理服務 (10.1~10.3)'
  },
  {
    id: 'fiwo',
    chapter: 'Ch 11',
    code: 'FiWo',
    name: 'FiWo 桌面雲端服務',
    category: '基礎運算',
    subtitle: '高效協同、跨裝置隨時隨地辦公的 VDI 雲工作區',
    description: 'FiWo (Fi Workspace) 雲端桌面虛擬化服務，讓企業員工能隨時透過瀏覽器或瘦終端機 (Thin Client) 連入個人化高效能專屬工作站，資料不落地、協同更安心。',
    badge: '現代遠距辦公',
    color: {
      primary: '#f97316',
      glow: 'rgba(249, 115, 22, 0.4)',
      border: 'border-orange-500/40',
      bg: 'bg-orange-500/10',
      text: 'text-orange-400'
    },
    building: {
      name: '雲端未來工作站',
      symbol: '🖥️',
      x: 880,
      y: 1300,
      width: 140,
      height: 130,
      pos3D: { x: -22, y: 0, z: 26 }
    },
    features: [
      { name: '即開即用工作區 (Workspace)', desc: '數分鐘內完成 Windows / Linux 虛擬桌面開通與員工配發。' },
      { name: '超低延遲串流協定', desc: '針對 CAD 設計、影音剪輯或日常辦公進行畫面渲染與串流最佳化。' },
      { name: '資安防洩漏機制', desc: '可鎖定本機剪貼簿、USB 裝置重定向與外接隨身碟，杜絕機密洩漏。' },
      { name: '彈性休眠與計費', desc: '閒置自動進入省電待機狀態，大幅縮減企業 IT 辦公硬體持有成本。' }
    ],
    specs: [
      { label: '串流協定', value: '自研高效能遠距桌面傳輸協定' },
      { label: '作業系統', value: 'Windows 11 / 10 / Ubuntu Desktop' },
      { label: '終端支援', value: 'Web 網頁、Windows、macOS、平板' }
    ],
    manualSection: '手冊第 11 章：FiWo 桌面雲端服務 (11.1)'
  },
  {
    id: 'bds',
    chapter: 'Ch 12',
    code: 'BDS',
    name: 'BDS 大數據服務',
    category: '雲原生與數據',
    subtitle: '分散式資料管線、巨量運算叢集與智慧觀測台',
    description: 'Big Data Service (BDS) 專為海量資料處理、機器學習特徵萃取與即時串流分析而生。一鍵調度分散式運算叢集，支援常見大數據開源生態，快速萃取商業洞察。',
    badge: 'AI 與海量資料運算',
    color: {
      primary: '#6366f1',
      glow: 'rgba(99, 102, 241, 0.4)',
      border: 'border-indigo-500/40',
      bg: 'bg-indigo-500/10',
      text: 'text-indigo-400'
    },
    building: {
      name: '數據智慧觀測台',
      symbol: '📊',
      x: 1200,
      y: 1300,
      width: 160,
      height: 130,
      pos3D: { x: 0, y: 0, z: 26 }
    },
    features: [
      { name: '分散式運算叢集', desc: '彈性建立並擴展 Spark、Hadoop 等大數據節點，具備自動節點自我修復。' },
      { name: '非同步巨量任務調度', desc: '提供批次作業 (Batch Jobs) 排程、排隊隊列監控與日誌回溯。' },
      { name: '視覺化應用介面', desc: '透過手冊內建 Web Console 輕鬆執行資料探勘腳本與即時查詢。' },
      { name: '儲存與計算分離架構', desc: '與 FiBo 物件儲存深度整合，降低長期巨量冷熱資料保存費用。' }
    ],
    specs: [
      { label: '運算引擎', value: 'Apache Spark, Flink, Hadoop 整合' },
      { label: '擴展節點', value: '支援自適應動態彈性擴縮容' },
      { label: '架構特色', value: '存算分離 (Storage-Compute Separation)' }
    ],
    manualSection: '手冊第 12 章：BDS 大數據服務 (12.1~12.3)'
  },
  {
    id: 'meter',
    chapter: 'Ch 13',
    code: 'Meter',
    name: 'Meter 資源計量服務',
    category: '管理與安全',
    subtitle: '透明化用量、網路流量監控與全域稽核日誌',
    description: 'Meter 是企業落實雲端財務維運 (FinOps) 與合規審計的關鍵服務。精準記錄每一項運算、網路與儲存資源的動態消耗，提供視覺化成本報表與操作歷程記錄。',
    badge: 'FinOps 成本與稽核',
    color: {
      primary: '#14b8a6',
      glow: 'rgba(20, 184, 166, 0.4)',
      border: 'border-teal-500/40',
      bg: 'bg-teal-500/10',
      text: 'text-teal-400'
    },
    building: {
      name: '綠色計量觀測雷達',
      symbol: '📈',
      x: 1540,
      y: 1300,
      width: 140,
      height: 130,
      pos3D: { x: 22, y: 0, z: 26 }
    },
    features: [
      { name: '視覺化用量報表', desc: '依照日、月或帳單週期產出多維度資源統計圖表，成本花費一目了然。' },
      { name: '網路用量深度分析', desc: '精確監控公網流出量 (Egress)、內部跨區流量及頻寬峰值變化趨勢。' },
      { name: '全方位操作歷程日誌', desc: '詳實記載每一筆雲端資源的新增、修改、刪除事件與操作者 IP，滿足稽核。' },
      { name: '預警推播與額度警報', desc: '自訂預算上限與流量門檻告警，防止異常流量造成意外超支。' }
    ],
    specs: [
      { label: '計量精度', value: '分/小時/日多維度即時統計' },
      { label: '合規審計', value: '不可竄改的操作歷程審計日誌' },
      { label: '匯出格式', value: 'CSV / Excel / 報表 API 介接' }
    ],
    manualSection: '手冊第 13 章：Meter 資源計量服務 (13.1~13.3)'
  }
];

export const TOTAL_PRODUCTS_COUNT = FIXO_PRODUCTS.length;
