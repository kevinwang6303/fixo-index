import { FixoProduct } from '../types/product';

export const FIXO_PRODUCTS: FixoProduct[] = [
  {
    id: 'cam',
    chapter: 'Ch 4',
    code: 'CAM',
    name: 'CAM 帳戶管理服務',
    category: '管理與安全',
    subtitle: '多租戶組織架構、身分認證與 TOTP MFA 安全防禦氣閘',
    description: '彙整自《FiXo User Portal Manual v5.4.1.0》第 4 章。座落於太空梭前艙對接入境氣閘口，為全艦身分登入、組織建檔、密碼強度稽核與多因素安全驗證（MFA）的第一道防禦線。',
    badge: '身分認證與零信任氣閘',
    color: {
      primary: '#f59e0b',
      glow: 'rgba(245, 158, 11, 0.45)',
      border: 'border-amber-500/40',
      bg: 'bg-amber-500/10',
      text: 'text-amber-400'
    },
    building: {
      name: '[MOD-01] 身分驗證氣閘艙',
      symbol: '🚪',
      x: 1200,
      y: 320,
      width: 180,
      height: 135,
      pos3D: { x: -14.7, y: 0.65, z: -25.5 },
      hex: { q: 0, r: -2 }
    },
    manualSection: '手冊第 4 章：CAM 帳戶管理服務 (4.1~4.4)',
    markdownFile: '01_CAM_帳戶管理服務.md',
    story3D: '太空梭最前端的對接入境氣閘艙，裝備全息生物辨識與 TOTP 動態密鑰檢驗台，守護艦載核心網路的第一道門禁。',
    highlights: [
      '四大管理面板：個人頭像/狀態、基本資訊、公司/費用代碼（Cost Code）、虛擬機管理人',
      'TOTP 多因素驗證（MFA）：支援 Google Authenticator，提供離線緊急備用碼（Backup Codes）',
      '全域安全合規：變更即刻同步審計軌跡，支援強制密碼複雜度與歷史不可重複策略'
    ],
    features: [
      { name: '個人與組織層級建檔', desc: '精確維護跨部門層級、公司法人代碼、費用歸屬代碼（Cost Code）與直屬主管聯絡通訊。' },
      { name: '虛擬機管理人通報機制', desc: '指派專案內雲端資源主要技術負責人，供資安緊急事件與維運自動化告警即時通報。' },
      { name: 'TOTP 多因素雙重驗證 (MFA)', desc: '支援掃描專屬 QR Code 綁定驗證器，輸入 6 位數動態碼並配發離線緊急備用碼，有效杜絕帳密外洩入侵。' },
      { name: '自主安全憑證與密碼管理', desc: '提供線上自主修改密碼作業，符合高強度密碼規範與防暴力猜測節流保護。' }
    ],
    specs: [
      { label: '認證標準', value: 'RFC 6238 TOTP / OIDC / SAML 2.0' },
      { label: '安全等級', value: '企業級零信任 (Zero Trust) 身分驗證' },
      { label: '防護機制', value: '30分鐘自動登出 + 30秒暴力節流 + 備用碼' }
    ]
  },
  {
    id: 'fico',
    chapter: 'Ch 6',
    code: 'FiCo',
    name: 'FiCo 計算機服務',
    category: '基礎運算',
    subtitle: '星艦躍遷超算核心、多規格 vCPU/GPU 虛擬主機算力引擎',
    description: '彙整自《FiXo User Portal Manual v5.4.1.0》第 6 章。星艦動力中樞的超算曲率核心艙，掌控全艦運算實例（VM）、雲磁碟掛載、主備親和性反分散高可用，支撐星際航行各類複雜運算。',
    badge: '星艦曲率超算核心',
    color: {
      primary: '#3b82f6',
      glow: 'rgba(59, 130, 246, 0.45)',
      border: 'border-blue-500/40',
      bg: 'bg-blue-500/10',
      text: 'text-blue-400'
    },
    building: {
      name: '[MOD-03] AI 躍遷超算核心艙',
      symbol: '⚛️',
      x: 1200,
      y: 560,
      width: 190,
      height: 140,
      pos3D: { x: 0, y: 1.0, z: -2.5 },
      hex: { q: 0, r: 0 }
    },
    manualSection: '手冊第 6 章：FiCo 計算機服務 (6.1~6.10)',
    markdownFile: '03_FiCo_計算機服務.md',
    story3D: '位於太空梭中央動力機房的藍光量子曲率反應核心，提供強悍算力與秒級快照容災能力。',
    highlights: [
      '多規格 VM 實例：涵蓋通用型、運算型、高記憶體型與 GPU 加速型實例',
      '反親和性高可用（Anti-affinity）：強制同組實例分散於不同實體伺服器節點，抵禦單點故障',
      '雲磁碟與秒級快照：支援熱插拔 Volume 擴展、定時一致性快照備份與跨區域映像檔複製'
    ],
    features: [
      { name: '多規格彈性 VM 即開即用', desc: '自訂 vCPU、記憶體與啟動磁碟，支援 Linux/Windows 主流作業系統映像檔。' },
      { name: '雲磁碟掛載與熱擴容', desc: '高效能分散式區塊儲存，支援線上擴容無須重啟，提供極致 IOPS。' },
      { name: '伺服器群組親和性調度', desc: '支援 Anti-affinity 拓樸規則，將關鍵主從資料庫實例自動分散至不同宿主機。' },
      { name: '自動快照排程與異地容災', desc: '定時排程快照與跨區域（Cross-Region）複製，守護企業核心系統零中斷。' }
    ],
    specs: [
      { label: '虛擬化核心', value: 'KVM / 企業級硬體虛擬化直通' },
      { label: 'SLA 保證', value: '99.95% 連續高可用服務承諾' },
      { label: '網路吞吐', value: '單機支援最高 40 Gbps 彈性虛擬網卡' }
    ]
  },
  {
    id: 'vpc',
    chapter: 'Ch 5',
    code: 'VPC',
    name: 'VPC 虛擬私有網路',
    category: '網路與儲存',
    subtitle: '星際光纖網絡通訊、自訂子網、浮動 IP 與安全群組中樞',
    description: '彙整自《FiXo User Portal Manual v5.4.1.0》第 5 章。位於太空梭左舷通信機艙，構建邏輯隔離的星際私有雲網，配置 CIDR 子網、軟體定義虛擬路由器、Floating IP 與安全群組防火牆。',
    badge: '星際通訊網路樞紐',
    color: {
      primary: '#06b6d4',
      glow: 'rgba(6, 182, 212, 0.45)',
      border: 'border-cyan-500/40',
      bg: 'bg-cyan-500/10',
      text: 'text-cyan-400'
    },
    building: {
      name: '[MOD-02] 星際光纖通訊艙',
      symbol: '🛰️',
      x: 800,
      y: 640,
      width: 180,
      height: 135,
      pos3D: { x: -28.5, y: 0.65, z: -10.5 },
      hex: { q: -2, r: 0 }
    },
    manualSection: '手冊第 5 章：VPC 虛擬私有網路服務 (5.1~5.5)',
    markdownFile: '02_VPC_虛擬私有網路服務.md',
    story3D: '左舷通訊高塔佈署了多頻段微波通訊天線與量子光纖交換機，連繫艦內外每一處子網與外部星際數據網。',
    highlights: [
      '彈性子網劃分：自訂 IPv4/IPv6 CIDR，公有子網、私有計算子網與隔離資料庫區層次分明',
      '軟體定義虛擬路由器（Router）：具備高效能 SNAT/DNAT 閘道與靜態路由自訂能力',
      '彈性網卡與浮動 IP：支援熱綁定外部 Public IP 與跨子網多 NIC 架構'
    ],
    features: [
      { name: '多層次私有子網劃分', desc: '以 CIDR 規格自訂各安全層級子網路，實現前後端架構完全隔離。' },
      { name: '高效能虛擬路由器', desc: '內建自動化 NAT 閘道轉發，免去實體路由器設備配置維護成本。' },
      { name: '浮動 IP (Floating IP)', desc: '支援將彈性公網 IP 秒級切換綁定至任意伺服器，實現無感切換維護。' },
      { name: '安全群組雙向防火牆', desc: '依協定、埠號與來源 IP 設定狀態檢驗式（Stateful）防火牆規則。' }
    ],
    specs: [
      { label: '協定相容', value: 'IPv4 / IPv6 雙棧網路協定' },
      { label: '租戶隔離', value: 'VxLAN / Geneve 硬體封裝隔離' },
      { label: '線速頻寬', value: '100 Gbps 星際主幹交換吞吐' }
    ]
  },
  {
    id: 'fibo',
    chapter: 'Ch 7',
    code: 'FiBo',
    name: 'FiBo 物件儲存服務',
    category: '網路與儲存',
    subtitle: '深空海量持久數據存儲、相容 S3 協定之星際貨物艙',
    description: '彙整自《FiXo User Portal Manual v5.4.1.0》第 7 章。位於太空梭右舷深空儲存貨艙，提供 11 個 9 極致耐久性與無限水平擴展能力的 S3 物件儲存空間，安心容納全艦日誌、多媒體與航行數據。',
    badge: '深空海量數據貨艙',
    color: {
      primary: '#10b981',
      glow: 'rgba(16, 185, 129, 0.45)',
      border: 'border-emerald-500/40',
      bg: 'bg-emerald-500/10',
      text: 'text-emerald-400'
    },
    building: {
      name: '[MOD-04] 深空海量數據貨艙',
      symbol: '📦',
      x: 1600,
      y: 640,
      width: 180,
      height: 135,
      pos3D: { x: 28.5, y: 0.65, z: -10.5 },
      hex: { q: 2, r: -2 }
    },
    manualSection: '手冊第 7 章：FiBo 物件儲存服務 (7.1~7.2)',
    markdownFile: '04_FiBo_物件儲存服務.md',
    story3D: '右舷龐大的深空數據貨艙，內建蜂巢式多副本固態矩陣與擦除碼陣列，承載著海量星圖檔案與歷年航程日誌。',
    highlights: [
      '完整相容 AWS S3 API：既有 AWS SDK、CLI 與開源生態工具零成本平移對接',
      '極致耐久度架構：擦除碼（Erasure Coding）多節點跨機架備份，防範節點故障',
      '細緻 ACL 與靜態網頁託管：靈活控制物件公開或私有存取，支援自訂網頁首頁發布'
    ],
    features: [
      { name: '儲存桶 (Bucket) 空間管理', desc: '自訂命名空間、存取控制清單 (ACL) 與物件過期生命週期規則。' },
      { name: 'S3 金鑰對授權金庫', desc: '發放獨立 Access Key 與 Secret Key，保障遠端程式化呼叫安全性。' },
      { name: '分散式擦除碼冗餘', desc: '底層自動將數據分片儲存於多個實體機架，保障資料 100% 完整性。' },
      { name: '靜態網站與資產託管', desc: '直接透過儲存桶發佈 HTML、CSS、JS 靜態網頁或公開 CDN 靜態資源。' }
    ],
    specs: [
      { label: 'API 協定', value: 'AWS S3 RESTful API 100% 相容' },
      { label: '資料耐久度', value: '99.999999999% (11 個 9)' },
      { label: '擴充能力', value: '無上限彈性擴展 PB 級容量' }
    ]
  },
  {
    id: 'lbs',
    chapter: 'Ch 8',
    code: 'LBS',
    name: 'LBS 負載平衡服務',
    category: '基礎運算',
    subtitle: '姿態推進動態平衡、L4/L7 智慧流量分流與容災導航艙',
    description: '彙整自《FiXo User Portal Manual v5.4.1.0》第 8 章。位於左側發動機群前方的姿態導流艙，自動調度全艦進出通訊流量，支援 Layer 4 (TCP/UDP) 與 Layer 7 (HTTP/HTTPS) 進階導流策略。',
    badge: '姿態平衡與流量導流',
    color: {
      primary: '#8b5cf6',
      glow: 'rgba(139, 92, 246, 0.45)',
      border: 'border-purple-500/40',
      bg: 'bg-purple-500/10',
      text: 'text-purple-400'
    },
    building: {
      name: '[MOD-05] 姿態導流與平衡艙',
      symbol: '⚖️',
      x: 800,
      y: 960,
      width: 180,
      height: 135,
      pos3D: { x: -26.5, y: 0.65, z: 12.5 },
      hex: { q: -2, r: 1 }
    },
    manualSection: '手冊第 8 章：LBS 負載平衡服務 (8.1~8.2)',
    markdownFile: '05_LBS_負載平衡服務.md',
    story3D: '精密儀表不斷指示著進出星艦的百萬級並發數據流，透過動態負載平衡維持系統姿態平穩。',
    highlights: [
      'Layer 4 / Layer 7 全面支援：精確處理 TCP/UDP 傳輸與 HTTP/HTTPS 網址路徑進階轉發',
      '健全檢查（Health Check）：即時監控後端實例狀態，秒級剔除異常節點保障平穩運行',
      'SSL/TLS 憑證集中卸載：於負載平衡器端終結加密傳輸，釋放後端運算主機效能'
    ],
    features: [
      { name: '公私網雙向負載平衡器', desc: '應對外部公網巨量請求或艦內各子網間的微服務內部負載調度。' },
      { name: '智慧轉發政策 (L7 Policy)', desc: '基於域名 (Host)、請求路徑及 Header 規則導航至指定伺服器群。' },
      { name: '毫秒級自動健康探測', desc: '透過 TCP/HTTP 探測自動偵測故障伺服器，自動繞行健康節點。' },
      { name: 'SSL 憑證卸載 (Offload)', desc: '支援集中綁定 KMS 憑證，降低後端 VM 的密碼學加解密負擔。' }
    ],
    specs: [
      { label: '調度層級', value: 'Layer 4 (TCP/UDP) + Layer 7 (HTTP/HTTPS)' },
      { label: '負載演算法', value: '輪詢 (Round Robin)、加權、最小連線數' },
      { label: '容災能力', value: '主備高可用秒級自動故障切換' }
    ]
  },
  {
    id: 'cis',
    chapter: 'Ch 9',
    code: 'CIS',
    name: 'CIS 容器基礎設施',
    category: '雲原生與數據',
    subtitle: '全託管 Kubernetes 叢集與海神號微服務彈性發射船塢',
    description: '彙整自《FiXo User Portal Manual v5.4.1.0》第 9 章。太空梭中後腹部的星艦容器船塢，配置 CNCF 認證標準 Kubernetes 託管叢集與專屬「海神平台 (Poseidon)」，支撐全艦微服務彈性調度。',
    badge: '星艦容器發射船塢',
    color: {
      primary: '#0ea5e9',
      glow: 'rgba(14, 165, 233, 0.45)',
      border: 'border-sky-500/40',
      bg: 'bg-sky-500/10',
      text: 'text-sky-400'
    },
    building: {
      name: '[MOD-06] 星艦容器發射船塢',
      symbol: '🚀',
      x: 1200,
      y: 1100,
      width: 190,
      height: 140,
      pos3D: { x: 0, y: 0.8, z: 12.5 },
      hex: { q: 0, r: 1 }
    },
    manualSection: '手冊第 9 章：CIS 容器基礎設施服務 (9.1~9.2)',
    markdownFile: '06_CIS_容器基礎設施服務.md',
    story3D: '巨大加壓船塢內，數百組容器 Pod 隨時待命發射，具備自動水平擴展與秒級自我修復特性。',
    highlights: [
      '標準 CNCF 託管 K8s：完全由 FiXo 平台自動維護 Control Plane，告別手動維運負擔',
      '海神平台（Poseidon）整合：可視化 Deployment、StatefulSet、Ingress 與 ConfigMap 操作介面',
      '自動水平擴展（HPA）：依據 CPU/記憶體負載指標自動伸縮容器數量，靈活應對峰值業務'
    ],
    features: [
      { name: 'K8s 託管叢集秒級交付', desc: '一鍵建立生產級高可用 K8s 節點叢集，支援節點自動擴容。' },
      { name: '海神號微服務視覺化主控台', desc: '提供開箱即用的工作負載 (Workload) 部署與服務目錄發布面板。' },
      { name: '自動水平彈性伸縮 (HPA)', desc: '在業務高併發時自動增補 Pod 實例，流量退去後自動縮減節約資源。' },
      { name: '集中式容器日誌與監控', desc: '深度整合日誌採集與 Prometheus 指標監控，排錯一覽無餘。' }
    ],
    specs: [
      { label: '叢集規範', value: 'CNCF 官方認證 Kubernetes 標準' },
      { label: '調度速度', value: 'Pod 秒級快速啟動與健康自癒' },
      { label: '節點擴展', value: '支援數百台實體算力節點彈性伸縮' }
    ]
  },
  {
    id: 'kms',
    chapter: 'Ch 10',
    code: 'KMS',
    name: 'KMS 金鑰管理服務',
    category: '管理與安全',
    subtitle: '量子密碼學金庫、硬體加密模組 (HSM) 與憑證防禦核心',
    description: '彙整自《FiXo User Portal Manual v5.4.1.0》第 10 章。位於右舷防護裝甲深處的量子密鑰金庫，符合 FIPS 140-2 密碼學規範，集中保管全艦對稱金鑰、非對稱密鑰與 TLS 伺服器數位憑證。',
    badge: '量子密鑰防禦金庫',
    color: {
      primary: '#ec4899',
      glow: 'rgba(236, 72, 153, 0.45)',
      border: 'border-pink-500/40',
      bg: 'bg-pink-500/10',
      text: 'text-pink-400'
    },
    building: {
      name: '[MOD-07] 量子密鑰防禦金庫',
      symbol: '🔐',
      x: 1600,
      y: 960,
      width: 180,
      height: 135,
      pos3D: { x: 26.5, y: 0.65, z: 12.5 },
      hex: { q: 2, r: 0 }
    },
    manualSection: '手冊第 10 章：KMS 金鑰管理服務 (10.1~10.3)',
    markdownFile: '07_KMS_金鑰管理服務.md',
    story3D: '厚重的重裝甲防護艙門後，旋轉著散發粉紅防禦輝光的硬體安全模組（HSM），私鑰絕不出境。',
    highlights: [
      '伺服器憑證生命週期：集中建立、簽發、檢視有效期限與一鍵部署至 LBS 負載平衡器',
      '非對稱金鑰（RSA / ECC）：支援公私鑰對自主產製與數位簽章驗證，符合現代高強度密碼學標準',
      '對稱金鑰落盤加密（AES-256）：保護雲磁碟、物件儲存桶及機密資料庫免於硬體遺失外洩'
    ],
    features: [
      { name: 'SSL/TLS 憑證集中管理', desc: '防範數位憑證到期風險，提供即時狀態告警與一鍵自動更新。' },
      { name: '非對稱公私鑰管理 (RSA/ECC)', desc: '支援 2048/4096 位元 RSA 及高效 ECC 橢圓曲線演算法。' },
      { name: '對稱落盤加密金鑰 (AES-256)', desc: '對雲端磁碟與 S3 物件進行透明加解密，保障極致隱私。' },
      { name: '金鑰審計與存取歷程', desc: '每一次加解密調用皆留下不可竄改的稽核軌跡，合規透明。' }
    ],
    specs: [
      { label: '硬體標準', value: '符合 FIPS 140-2 Level 3 HSM 規範' },
      { label: '加密演算法', value: 'AES-GCM 256, RSA 4096, ECC P-384' },
      { label: '防護機制', value: '私鑰不出境、硬體防竄改物理隔離' }
    ]
  },
  {
    id: 'fiwo',
    chapter: 'Ch 11',
    code: 'FiWo',
    name: 'FiWo 桌面雲端服務',
    category: '基礎運算',
    subtitle: '零重力軌道虛擬工作站、VDI 串流辦公與跨端協同實驗室',
    description: '彙整自《FiXo User Portal Manual v5.4.1.0》第 11 章。座落於太空梭尾部工作艙，提供零重力環境下的雲端桌面虛擬化（VDI）服務，各研究員只需透過瀏覽器即可登入高規格 Windows/Linux 專屬工作站。',
    badge: '零重力軌道工作站',
    color: {
      primary: '#f97316',
      glow: 'rgba(249, 115, 22, 0.45)',
      border: 'border-orange-500/40',
      bg: 'bg-orange-500/10',
      text: 'text-orange-400'
    },
    building: {
      name: '[MOD-08] 零重力軌道工作站',
      symbol: '💻',
      x: 800,
      y: 1320,
      width: 180,
      height: 135,
      pos3D: { x: -14.7, y: 0.65, z: 27.5 },
      hex: { q: -1, r: 2 }
    },
    manualSection: '手冊第 11 章：FiWo 桌面雲端服務 (11.1)',
    markdownFile: '08_FiWo_桌面雲端服務.md',
    story3D: '明亮通透的軌道工作艙，懸浮著各類全息螢幕，研究員正在此處進行星艦航行軌道計算與程式開發。',
    highlights: [
      '秒級開通雲端桌面：數分鐘內即可完成員工專屬虛擬桌面分配，立即投入高效辦公',
      '低延遲串流協定：針對專業繪圖設計、文書處理與視訊會議進行畫面動態編解碼最佳化',
      '資料不落地資安防護：限制本機 USB 外接存取與剪貼簿外洩，杜絕商業與技術機密外流'
    ],
    features: [
      { name: '秒級即開即用虛擬工作區', desc: '隨時依任務規格開通 Windows 11 或 Ubuntu Linux 高效能桌面。' },
      { name: '超低延遲星際畫面串流', desc: '自研高壓縮傳輸協定，在低頻寬環境下依然保有 60 FPS 流暢度。' },
      { name: '機密資料不落地安全機制', desc: '嚴格控管剪貼簿、印表機與 USB 儲存裝置重定向，保護智慧財產權。' },
      { name: '自動休眠與智慧節能', desc: '閒置離線時自動休眠節省算力開銷，喚醒時瞬間恢復工作進度。' }
    ],
    specs: [
      { label: '串流延遲', value: '< 25 ms 極低延遲串流' },
      { label: '系統支援', value: 'Windows 11 / 10 / Ubuntu Desktop' },
      { label: '終端支援', value: 'Web 瀏覽器、macOS、Windows、平板跨端' }
    ]
  },
  {
    id: 'bds',
    chapter: 'Ch 12',
    code: 'BDS',
    name: 'BDS 大數據服務',
    category: '雲原生與數據',
    subtitle: '深空數據觀測天幕、分散式巨量分析與即時串流運算艙',
    description: '彙整自《FiXo User Portal Manual v5.4.1.0》第 12 章。位於星艦尾部推進器上方的深空數據觀測天幕，整合 Apache Spark 與 Hadoop 分散式叢集，具備強大非同步作業排程與星圖巨量分析能力。',
    badge: '深空數據觀測天幕',
    color: {
      primary: '#6366f1',
      glow: 'rgba(99, 102, 241, 0.45)',
      border: 'border-indigo-500/40',
      bg: 'bg-indigo-500/10',
      text: 'text-indigo-400'
    },
    building: {
      name: '[MOD-09] 深空數據觀測天幕',
      symbol: '🔭',
      x: 1200,
      y: 1400,
      width: 190,
      height: 140,
      pos3D: { x: 0, y: 0.8, z: 28.5 },
      hex: { q: 0, r: 2 }
    },
    manualSection: '手冊第 12 章：BDS 大數據服務 (12.1~12.3)',
    markdownFile: '09_BDS_大數據服務.md',
    story3D: '巨大全景穹頂直接面向無垠深空，數百個計算節點正日以繼夜分析著宇宙背景輻射與星際數據流。',
    highlights: [
      '一鍵部署大數據叢集：快速啟用具備自動故障自癒能力的 Spark、Hadoop 與 Flink 計算叢集',
      '非同步巨量任務調度：手冊提供直覺的 Web UI，監控批次任務隊列進度與節點資源配置',
      '存算分離架構：計算節點隨需彈性伸縮，資料安全持久保存於 FiBo 物件儲存中'
    ],
    features: [
      { name: '分散式大數據運算叢集', desc: '彈性調度大規模分析節點，支援巨量平行運算與分散式特徵萃取。' },
      { name: '非同步批次任務排程', desc: '提交 Spark / Hadoop 任務，即時追蹤執行日誌與運算資源消耗圖表。' },
      { name: '視覺化資料探勘介面', desc: '提供互動式 Web 分析主控台，直覺查詢星際海量數據與資料管線。' },
      { name: '存算分離極致彈性', desc: '計算資源可依需求隨開隨關，底層對接 FiBo S3 儲存桶，成本最優化。' }
    ],
    specs: [
      { label: '運算引擎', value: 'Apache Spark, Flink, Hadoop MapReduce' },
      { label: '節點擴展', value: '百節點無感彈性擴充與動態容錯' },
      { label: '架構模式', value: '現代存算分離（Compute-Storage Decoupled）' }
    ]
  },
  {
    id: 'meter',
    chapter: 'Ch 13',
    code: 'Meter',
    name: 'Meter 資源計量服務',
    category: '管理與安全',
    subtitle: '光伏矩陣計量遙測艙、雲端財務 FinOps 與全域稽核審計中樞',
    description: '彙整自《FiXo User Portal Manual v5.4.1.0》第 13 章。座落於太空梭右後能源轉換機艙，監測光伏太陽能矩陣與全艦各艙室算力、網路、儲存之即時消耗，產出透明化用量分析與合規稽核軌跡。',
    badge: '光伏矩陣計量遙測艙',
    color: {
      primary: '#14b8a6',
      glow: 'rgba(20, 184, 166, 0.45)',
      border: 'border-teal-500/40',
      bg: 'bg-teal-500/10',
      text: 'text-teal-400'
    },
    building: {
      name: '[MOD-10] 光伏矩陣計量艙',
      symbol: '⚡',
      x: 1600,
      y: 1320,
      width: 180,
      height: 135,
      pos3D: { x: 14.7, y: 0.65, z: 27.5 },
      hex: { q: 1, r: 1 }
    },
    manualSection: '手冊第 13 章：Meter 資源計量服務 (13.1~13.3)',
    markdownFile: '10_Meter_資源計量服務.md',
    story3D: '巨大全息能量流圖表正即時更新全艦每一個艙室的用電與算力指標，協助指揮官進行財務最佳化。',
    highlights: [
      '多維度用量統計分析：依照日/月/自訂週期產生計算實例、雲磁碟與公網 Egress 流量圖表',
      '全域操作歷程日誌：詳實記載每一次資源建立、重啟、刪除與登入事件，滿足企業資安審計',
      '預警門檻與異常推播：設定預算上限或流量異常閥值，主動推播告警防範意外超額花費'
    ],
    features: [
      { name: '即時視覺化用量圖表', desc: '圖形化呈現 vCPU 時數、儲存容量與網路頻寬峰值變化趨勢。' },
      { name: '深度網路流量分析', desc: '精準統計對外公網流出量 (Egress) 及跨區域內網傳輸，成本精確歸戶。' },
      { name: '不可竄改操作歷程日誌', desc: '追蹤每筆操作的時間戳記、來源 IP、使用者帳號與變更內容。' },
      { name: '智慧預算門檻預警', desc: '當月度累計費用達到警戒水位時，第一時間自動發送通知提醒。' }
    ],
    specs: [
      { label: '計量頻率', value: '分級/每小時多維度即時採樣' },
      { label: '審計防護', value: '不可竄改的 WORM 合規操作軌跡' },
      { label: '報表匯出', value: '支援 CSV / Excel 與 RESTful API 整合' }
    ]
  }
];

export const TOTAL_PRODUCTS_COUNT = FIXO_PRODUCTS.length;
