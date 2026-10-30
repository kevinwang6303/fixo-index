import { FixoProduct } from '../types/product';

export const FIXO_PRODUCTS: FixoProduct[] = [
  {
    id: 'cam',
    chapter: 'Ch 4',
    code: 'CAM',
    name: 'CAM 帳戶管理服務',
    category: '管理與安全',
    subtitle: '多租戶組織架構、身分認證與 TOTP MFA 安全防禦核心',
    description: '彙整自《FiXo User Portal Manual v5.4.1.0》第 4 章。座落於高軟中央主島北翼，為全平台登入、組織建檔、密碼強度稽核與多因素安全驗證（MFA）的第一道防線。',
    badge: '身分認證與零信任閘道',
    color: {
      primary: '#f59e0b',
      glow: 'rgba(245, 158, 11, 0.4)',
      border: 'border-amber-500/40',
      bg: 'bg-amber-500/10',
      text: 'text-amber-400'
    },
    building: {
      name: '高軟園區服務中樞',
      symbol: '🏛️',
      x: 1200,
      y: 280,
      width: 140,
      height: 120,
      pos3D: { x: -14.7, y: 0.65, z: -25.5 },
      hex: { q: 0, r: -2 }
    },
    story3D: '矗立於高軟中央主島北側迎賓大道，象徵進入鴻海高軟雲端研發聚落的數位身分驗證大門。展館頂部設有旋轉金黃認證光環與安全信標。',
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
    ],
    manualSection: '手冊第 4 章：CAM 帳戶管理服務 (4.1~4.4)'
  },
  {
    id: 'vpc',
    chapter: 'Ch 5',
    code: 'VPC',
    name: 'VPC 虛擬私有網路',
    category: '網路與儲存',
    subtitle: '軟體定義網路 (SDN)、子網隔離、浮動網卡與跨專案對等互連',
    description: '彙整自手冊第 5 章。位於亞灣西北六角島，掌控覆蓋整個高軟海灣的虛擬私有網路（CIDR 劃分、DHCP 位址池、主機路由 Host Routes、靜態路由、浮動 IP 批次釋放與浮動網卡 QoS）。',
    badge: '軟體定義網路中樞',
    color: {
      primary: '#06b6d4',
      glow: 'rgba(6, 182, 212, 0.4)',
      border: 'border-cyan-500/40',
      bg: 'bg-cyan-500/10',
      text: 'text-cyan-400'
    },
    building: {
      name: '亞灣跨海光纖中樞',
      symbol: '🌐',
      x: 880,
      y: 620,
      width: 150,
      height: 130,
      pos3D: { x: -22.1, y: 0.65, z: -12.8 },
      hex: { q: -1, r: -1 }
    },
    story3D: '位於西北方淺水海灣，由多條跨海拱橋與高軟主島及計算中心緊密互聯，外觀由高聳的藍色光纖網絡晶圓塔構成，照亮亞灣跨海通道。',
    highlights: [
      '主機路由 (Host Routes) vs 靜態路由 (Static Routes)：子網 DHCP 下發與路由器轉發分層治理',
      '浮動網卡允許地址對 (Allowed Address Pairs)：支援 Keepalived / VRRP 雙機熱備虛擬 IP (VIP)',
      '網路防刪保護：嚴禁在仍有運行中網卡、浮動 IP 或路由器接口時刪除網路'
    ],
    features: [
      { name: '子網規劃與主機路由下發', desc: '自訂 CIDR 網段、DHCP 位址分配池（Allocation Pools），並可透過 Host Routes 直接將路由推送至虛擬機 Routing Table。' },
      { name: '路由器外部閘道與靜態路由', desc: '串接公網閘道 IP 具備 SNAT 上網能力，支援自訂目的網段與下一跳 IP（Next Hop IP）將流量導向防火牆。' },
      { name: '浮動 IP 彈性綁定與批次釋放', desc: '獨立申請公網 IP，支援綁定至虛擬機通訊埠或 LBS VIP，提供單一與批次釋放（Batch Release）節省成本。' },
      { name: '浮動網卡與允許地址對', desc: '支援熱插拔次要網卡（Secondary NIC），配置 QoS 頻寬限速，並以 Allowed Address Pairs 解除防偽冒限制，支援 VRRP 高可用。' },
      { name: '跨專案對等連接 (VPC Peering)', desc: '在不同 VPC 路由器間建立低延遲內部私網直連通道，免繞經公網，保障資料傳輸安全。' }
    ],
    specs: [
      { label: '協定架構', value: 'IPv4 / IPv6 雙棧 / Geneve / VxLAN 租戶隔離' },
      { label: '路由支援', value: '子網主機路由 (Host Routes) + 路由器靜態路由' },
      { label: '高可用性', value: 'Allowed Address Pairs (Keepalived / VRRP)' }
    ],
    manualSection: '手冊第 5 章：VPC 虛擬私有網路服務 (5.1~5.5)'
  },
  {
    id: 'fico',
    chapter: 'Ch 6',
    code: 'FiCo',
    name: 'FiCo 計算機服務',
    category: '基礎運算',
    subtitle: '極致運算效能、在線磁碟擴展、反親和性群組與異地容災備份',
    description: '彙整自手冊第 6 章。座落於北側深水區的雙塔超算中心，提供全生命週期虛擬機管理（秒級建立、Resize Flavor、Console Log、VNC 網頁控制台 Send Ctrl+Alt+Del、磁碟排程快照與跨區域異地容災備份）。',
    badge: '運算核心旗艦基石',
    color: {
      primary: '#3b82f6',
      glow: 'rgba(59, 130, 246, 0.4)',
      border: 'border-blue-500/40',
      bg: 'bg-blue-500/10',
      text: 'text-blue-400'
    },
    building: {
      name: '鴻海高軟 AI 超算中心',
      symbol: '⚡',
      x: 1200,
      y: 600,
      width: 160,
      height: 140,
      pos3D: { x: 0.0, y: 0.65, z: -25.5 },
      hex: { q: 1, r: -2 }
    },
    story3D: '巍峨聳立於群島北側，雙子運算主塔散發著科技深藍輝光，專為高軟園區各項 AI 模型訓練、巨量資料計算與企業級核心資料庫提供澎湃動力。',
    highlights: [
      'VNC 控制台獨家支援「Send Ctrl+Alt+Del」與 SSH 私鑰上傳解密 Windows 預設密碼',
      '伺服器群組反親和性 (Anti-Affinity)：將關鍵節點強制分散於不同實體物理主機',
      '在線磁碟在線擴展 (Online Expansion) 與跨可用區 (Cross-Region) 異地容災備份'
    ],
    features: [
      { name: '彈性虛擬機生命週期管理', desc: '支援十數種 vCPU/RAM 規格、軟硬重啟（Soft/Hard Reboot）、線上變更規格（Resize）與 Cloud-init 初始化腳本。' },
      { name: '反親和性伺服器群組', desc: '配置拓樸隔離規則，將多台叢集主機嚴格分散排程至不同實體伺服器，消除單點物理故障風險。' },
      { name: '免客戶端 VNC 控制台與密碼解密', desc: '瀏覽器直連 Web Console，內建 Send Ctrl+Alt+Del 按鍵，並支援上傳 .pem 私鑰在前端安全解密 Windows 密碼。' },
      { name: '雲磁碟在線擴展與排程快照', desc: '持久性區塊儲存支援免關機在線擴容，支援定期排程快照自動化策略與秒級回滾還原。' },
      { name: '跨區域異地備份 (Cross-Region DR)', desc: '將雲磁碟備份異地同步傳輸至遠端可用區，即使本地機房發生重大天災仍可實現完整災難復原。' },
      { name: '安全群組虛擬防火牆', desc: '精細化入站與出站規則（Ingress/Egress），支援綁定 TCP/UDP/ICMP 連接埠與來源 IP/安全群組引用。' }
    ],
    specs: [
      { label: '虛擬化架構', value: 'KVM 硬體級虛擬化 / NUMA 效能優化' },
      { label: '容災規格', value: '伺服器反親和性 + 跨區域 (Cross-Region) 異地備份' },
      { label: '安全認證', value: 'SSH 4096 Keypair + 安全群組 (Security Group)' }
    ],
    manualSection: '手冊第 6 章：FiCo 計算機服務 (6.1~6.10)'
  },
  {
    id: 'fibo',
    chapter: 'Ch 7',
    code: 'FiBo',
    name: 'FiBo 物件儲存服務',
    category: '網路與儲存',
    subtitle: 'S3 相容協定、三級 ACL 存取控制、KMS 伺服器端加密與防自動登出大檔傳輸',
    description: '彙整自手冊第 7 章。位於東北側臨海深水海港，全面相容 AWS S3 API，支援三級 ACL、虛擬資料夾絕對路徑跳轉、KMS 對稱加密（SSE）、CORS 跨域規則、生命週期自動過期清理與防自動登出大檔傳輸保護。',
    badge: '海量資料湖持久海港',
    color: {
      primary: '#10b981',
      glow: 'rgba(16, 185, 129, 0.4)',
      border: 'border-emerald-500/40',
      bg: 'bg-emerald-500/10',
      text: 'text-emerald-400'
    },
    building: {
      name: '高雄港數據深水海港',
      symbol: '⚓',
      x: 1540,
      y: 620,
      width: 150,
      height: 130,
      pos3D: { x: 7.4, y: 0.65, z: -12.8 },
      hex: { q: 1, r: -1 }
    },
    story3D: '坐落在亞灣港灣最外圍的深水碼頭，外型如一艘揚帆待發的數據方舟，無縫對接全球 S3 儲存生態，承載高雄港海量多媒體與物聯網資料湖。',
    highlights: [
      '大檔上傳專利機制：勾選「上傳期間暫停自動登出機制」，徹底杜絕 30 分鐘超時中斷',
      '三級 ACL 控制：私有讀寫 (Private)、公有讀私有寫 (Public Read)、公有讀寫 (Public Read Write)',
      'KMS 伺服器端對稱加密 (SSE) + 跨儲存桶物件複製 (Cross-Bucket Copy)'
    ],
    features: [
      { name: 'S3 標準 API 與金鑰對授權', desc: '全面相容 AWS S3 RESTful 協定，支援配發 SecretId / SecretKey，無縫串接 AWS CLI、MinIO Client 與各式 SDK。' },
      { name: '三級存取控制清單 (ACL)', desc: '提供私有讀寫、公有讀/私有寫、公有讀寫權限劃分，刪除儲存桶具備防誤刪防護（必須先清空內容）。' },
      { name: '大檔防超時中斷上傳機制', desc: '上傳大檔案時可勾選暫停 30 分鐘自動登出防護，維持持續傳輸會話直到完畢，解決傳輸中斷痛點。' },
      { name: 'KMS 伺服器端加密 (SSE)', desc: '整合 KMS 對稱金鑰，資料落盤至磁碟時自動執行 AES 加密，讀取時透明解密，保障靜態資料安全。' },
      { name: '跨域資源共享 (CORS) 與生命週期', desc: '支援前端 Web 直傳存取標頭配置，並可自訂天數排程自動淘汰清理歷史過期日誌檔案。' }
    ],
    specs: [
      { label: '協定相容', value: 'AWS S3 RESTful API / AWS CLI / SDK' },
      { label: '資料耐久度', value: '99.999999999% (11 個 9) 擦除碼冗餘架構' },
      { label: '加密機制', value: 'KMS 對稱式 AES 伺服器端落盤加密 (SSE)' }
    ],
    manualSection: '手冊第 7 章：FiBo 物件儲存服務 (7.1~7.2)'
  },
  {
    id: 'lbs',
    chapter: 'Ch 8',
    code: 'LBS',
    name: 'LBS 負載平衡服務',
    category: '基礎運算',
    subtitle: '全代管 ALB 流量調度、微秒級逾時設定、主動健康檢查與第 7 層政策引擎',
    description: '彙整自手冊第 8 章。位於西南主航道岬角，指引海灣百萬級並發連線。具備虛擬 IP (VIP)、微秒級逾時控制、輪詢/最少連線/來源 IP 演算法、PING/TCP/HTTP 主動健康檢查與嚴格執行 REJECT > REDIRECT_URL > REDIRECT_POOL 的第 7 層政策引擎。',
    badge: '百萬併發智慧航標',
    color: {
      primary: '#8b5cf6',
      glow: 'rgba(139, 92, 246, 0.4)',
      border: 'border-purple-500/40',
      bg: 'bg-purple-500/10',
      text: 'text-purple-400'
    },
    building: {
      name: '高雄一港口航標燈塔',
      symbol: '⚖️',
      x: 880,
      y: 960,
      width: 140,
      height: 130,
      pos3D: { x: -14.7, y: 0.65, z: 0.0 },
      hex: { q: -1, r: 0 }
    },
    story3D: '矗立於亞灣一港口海防要塞，如同黑夜中的巨型航標燈塔，旋轉探照燈指引著來自全球網際網路的浩瀚流量，精準分流至各個後端運算島嶼。',
    highlights: [
      '第 7 層政策匹配優先級：REJECT（拒絕）> REDIRECT_TO_URL（轉向網址）> REDIRECT_TO_POOL（轉向伺服器池）',
      '三大逾時毫秒控制：前端閒置逾時 (50s)、後端連線逾時 (5s)、後端閒置逾時 (50s)',
      '多維度主動健康檢查：PING / TCP / HTTP 狀態碼探針，自動旁路 DOWN 節點'
    ],
    features: [
      { name: '進階負載平衡器實例 (ALB)', desc: '部署於私有子網指派專屬 VIP，可動態綁定或解綁外部公網浮動 IP，支援百萬併發連線調度。' },
      { name: '第 4/7 層多協定監聽器', desc: '支援 HTTP、HTTPS、TCP、UDP，具備連線數上限保護與微秒級（毫秒 ms）前端及後端連線/閒置逾時參數調校。' },
      { name: '三大分發演算法與動態權重', desc: '支援輪詢（ROUND_ROBIN）、最少連線數（LEAST_CONNECTIONS）與來源 IP 哈希（SOURCE_IP 會話保持），成員權重自訂。' },
      { name: '第 7 層智慧路由政策 (L7 Policy)', desc: '基於 Host 網域與 URL 路徑比對，依 REJECT > REDIRECT_URL > REDIRECT_POOL 嚴格順序執行流量轉發。' },
      { name: '主動式健康探測 (Health Monitor)', desc: '支援 HTTP 狀態碼與 /healthz 路徑探測，遇故障秒級自動剔除，恢復後自動無縫回歸服務。' }
    ],
    specs: [
      { label: '調度層級', value: 'Layer 4 (TCP/UDP) & Layer 7 (HTTP/HTTPS)' },
      { label: '政策引擎', value: 'REJECT > REDIRECT_URL > REDIRECT_POOL 優先級匹配' },
      { label: '逾時精度', value: '毫秒級 (Client 50s / Connect 5s / Member 50s)' }
    ],
    manualSection: '手冊第 8 章：LBS 負載平衡服務 (8.1~8.2)'
  },
  {
    id: 'cis',
    chapter: 'Ch 9',
    code: 'CIS',
    name: 'CIS 容器基礎設施',
    category: '雲原生與數據',
    subtitle: '全託管 Kubernetes 叢集、Master/Worker 節點組彈性擴縮與海神平台 (Poseidon)',
    description: '彙整自手冊第 9 章。位於東南臨海深水船塢，整合生產級標準 Kubernetes 託管叢集、動態 PVC 雲磁碟（CSI）、LBS 自動負載平衡、企業私有鏡像倉庫認證（Harbor）、Web Dashboard、Kubeconfig 下載與專為 AI/微服務打造的海神平台（Poseidon）。',
    badge: '雲原生海神容器艦隊',
    color: {
      primary: '#0ea5e9',
      glow: 'rgba(14, 165, 233, 0.4)',
      border: 'border-sky-500/40',
      bg: 'bg-sky-500/10',
      text: 'text-sky-400'
    },
    building: {
      name: '旅運中心海神容器碼頭',
      symbol: '🐳',
      x: 1200,
      y: 960,
      width: 160,
      height: 130,
      pos3D: { x: 14.7, y: 0.65, z: 0.0 },
      hex: { q: 1, r: 0 }
    },
    story3D: '毗鄰高雄港旅運中心，壯觀的海神龍門吊與藍白相間的貨櫃船塢在此裝載著無數微服務 Pod，隨時以秒級彈性擴縮應對突發高潮流量。',
    highlights: [
      'Master / Worker 節點組架構：控制平面全託管，工作節點支援無縫水平擴縮容（Scale Up/Down）',
      '企業私有 Harbor 鏡像倉庫認證：節點組層級一鍵配置帳密，免逐台設定 Docker Daemon',
      '海神平台 (Poseidon Platform)：一站式容器化與 AI 微服務視覺化治理'
    ],
    features: [
      { name: '生產級 Kubernetes 託管叢集', desc: '標準 CNCF 相容 K8s 環境，支援多節點 Master 高可用架構，自動整合 VPC 網路與自訂叢集 DNS。' },
      { name: '節點組彈性擴縮容 (Node Scaling)', desc: '支援在線秒級增減 Worker 節點數量，縮容時自動執行優雅驅逐（Drain）保障工作負載不中斷。' },
      { name: '企業私有鏡像倉庫整合', desc: '支援在節點組介面直接配置內部 Docker / Harbor 鏡像倉庫端點與認證帳密，免除逐台配置節點之苦。' },
      { name: '關聯資源透明化透視', desc: '整合底層 PVC 雲磁碟列表、快照備份卷與 Service Type: LoadBalancer 自動生成的 LBS 實例。' },
      { name: '多樣化存取與工具鏈', desc: '提供免安裝 Web Dashboard、Kubeconfig 一鍵下載，無縫整合本機 kubectl 與 CI/CD 自動化發布管線。' }
    ],
    specs: [
      { label: '叢集標準', value: 'CNCF 認證標準 Kubernetes + 海神 (Poseidon)' },
      { label: '儲存與網路', value: 'CSI 雲磁碟動態 PVC + CNI VPC 扁平網路' },
      { label: '映像認證', value: '節點組層級私有鏡像倉庫 (Harbor/Docker)' }
    ],
    manualSection: '手冊第 9 章：CIS 容器基礎設施服務 (9.1~9.2)'
  },
  {
    id: 'kms',
    chapter: 'Ch 10',
    code: 'KMS',
    name: 'KMS 金鑰管理服務',
    category: '管理與安全',
    subtitle: 'SSL/TLS 數位憑證管理、RSA 2048 非對稱金鑰與「使用中」防刪防禦機制',
    description: '彙整自手冊第 10 章。座落於南部地脈花崗岩金庫，提供企業級伺服器憑證管理（支援 .crt/.pem/.key、綁定 LBS HTTPS 卸載）、RSA 2048 位元非對稱金鑰對與 AES 對稱金鑰，具備嚴格的「使用中（In Use）嚴禁刪除」保護規則。',
    badge: '硬體級密碼學金庫',
    color: {
      primary: '#ec4899',
      glow: 'rgba(236, 72, 153, 0.4)',
      border: 'border-pink-500/40',
      bg: 'bg-pink-500/10',
      text: 'text-pink-400'
    },
    building: {
      name: '亞灣金融密鑰金庫',
      symbol: '🔐',
      x: 1540,
      y: 960,
      width: 140,
      height: 130,
      pos3D: { x: -7.4, y: 0.65, z: 12.8 },
      hex: { q: -1, r: 1 }
    },
    story3D: '構築於亞灣南部堅固的花崗岩地基之上，頂部旋轉懸浮著晶瑩剔透的粉紅防禦護盾，守護著全高軟園區最機密的數位憑證與加密密鑰。',
    highlights: [
      '「使用中（In Use）」防刪保護機制：被 LBS 監聽器引用的憑證嚴禁刪除，杜絕公網癱瘓',
      '雙軌非對稱金鑰建立：系統自動產生高強度 RSA 2048 位元金鑰，或由企業線下產出自訂上傳',
      '深層跨服務聯動：憑證直通 LBS 終端 TLS 握手，對稱金鑰直通 FiBo 靜態落盤加密'
    ],
    features: [
      { name: 'SSL/TLS 伺服器憑證全生命週期', desc: '集中管理與上傳標準 CRT/PEM/KEY 憑證檔案（含中繼 CA 證書鏈），到期日前發出預警通知。' },
      { name: '「使用中」嚴格防刪保護', desc: '凡被 LBS HTTPS 監聽器或雲端服務引用的憑證，自動鎖定為「使用中」，嚴禁刪除以防服務癱瘓。' },
      { name: 'RSA 2048 位元非對稱金鑰對', desc: '支援系統自動亂數生成或手動上傳公私鑰對，用於端到端 API 數位簽章與跨系統身分安全鑑別。' },
      { name: 'AES 對稱式加密金鑰', desc: '產出硬體級對稱密鑰，直接對接 FiBo 物件儲存實現落盤資料自動加密（SSE），確保機密資料零外洩。' }
    ],
    specs: [
      { label: '金鑰演算法', value: 'RSA 2048 位元 / AES-256 對稱加密' },
      { label: '憑證格式', value: 'X.509 PEM / CRT / PUB / KEY (含 CA Chain)' },
      { label: '防誤操作', value: '引用狀態自動標記「使用中 (In Use)」防刪除' }
    ],
    manualSection: '手冊第 10 章：KMS 金鑰管理服務 (10.1~10.3)'
  },
  {
    id: 'fiwo',
    chapter: 'Ch 11',
    code: 'FiWo',
    name: 'FiWo 桌面雲端服務',
    category: '基礎運算',
    subtitle: '企業級 VDI 虛擬桌面、雙浮動 IP 架構、外部企業 AD 網域整合與緊急控制台',
    description: '彙整自手冊第 11 章。座落於東部珊瑚沙洲，為企業提供集中化雲端桌面辦公空間（單一專案限額 1 組、控制台與 RDGW 雙浮動 IP、整合企業既有 Active Directory、FiWo Web/AD/RDGW 三大系統虛擬機與免網路直連緊急控制台）。',
    badge: '現代遠距 VDI 工作艙',
    color: {
      primary: '#f97316',
      glow: 'rgba(249, 115, 22, 0.4)',
      border: 'border-orange-500/40',
      bg: 'bg-orange-500/10',
      text: 'text-orange-400'
    },
    building: {
      name: '高軟雲端創新工作站',
      symbol: '🖥️',
      x: 880,
      y: 1300,
      width: 140,
      height: 130,
      pos3D: { x: 7.4, y: 0.65, z: 12.8 },
      hex: { q: 0, r: 1 }
    },
    story3D: '充滿現代科技感的流線型研發工作島，柔和的橙色光帶環繞著各個虛擬工作艙，象徵員工無論身處何地皆可一秒接入高軟雲端辦公室。',
    highlights: [
      '關鍵資源準備：單一專案限額 1 組工作區，需配置兩組獨立浮動 IP（控制台 IP / RDGW 遠端閘道 IP）',
      '企業級 AD 網域無縫接入：可沿用公司既有 Windows Server AD 網域與 GPO 群組安全性原則',
      '三大系統核心虛擬機（FiWo Web / AD / RDGW）專屬緊急 Web Console 直連排錯'
    ],
    features: [
      { name: '集中化工作區 (Workspace) 規劃', desc: '單一專案配發一組專屬工作區，配置控制台 IP 與 RDGW 閘道 IP，保障企業內部桌面安全隔離。' },
      { name: '企業 Active Directory (AD) 整合', desc: '支援平台自動部署 AD 網域，亦可直連企業現有 Windows Server AD，沿用員工現有帳號與 GPO 原則。' },
      { name: '三大系統核心虛擬機架構', desc: '包含 FiWo Web 前端門戶、FiWo AD 網域驗證中心與 FiWo RDGW 加密安全代理閘道，支撐完整 VDI 運作。' },
      { name: '免網路直連緊急控制台 (Web Console)', desc: '在網卡中斷或網路設定異常導致遠端中斷時，提供後台免網路直連控制台，快速重啟修復。' },
      { name: '多端點自適應遠距辦公', desc: '支援 Windows、Linux 虛擬桌面派發，完美支援網頁瀏覽器、平板或瘦客戶端（Thin Client）隨時登入。' }
    ],
    specs: [
      { label: '工作區配額', value: '單一專案嚴格隔離 1 組專屬工作區' },
      { label: '網路架構', value: '雙浮動 IP 雙軌代理 (Console IP + RDGW IP)' },
      { label: '身分驗證', value: '整合 Windows Server Active Directory / Kerberos' }
    ],
    manualSection: '手冊第 11 章：FiWo 桌面雲端服務 (11.1)'
  },
  {
    id: 'bds',
    chapter: 'Ch 12',
    code: 'BDS',
    name: 'BDS 大數據服務',
    category: '雲原生與數據',
    subtitle: 'HDP / CDH 叢集架構、HDFS 安全模式修復、節點在線上下線與 Kerberos 企業認證',
    description: '彙整自手冊第 12 章。座落於東南外海音浪島，支援 Hortonworks (HDP) 與 Cloudera (CDH) 大數據生態（HDFS、YARN、Hive、Spark、ZooKeeper），具備 HDFS 安全模式副本修復、優雅下線（Decommission）防資料遺失、Hive Metastore 備份、叢集防刪保護與 Kerberos 認證。',
    badge: '海量巨量資料中樞',
    color: {
      primary: '#6366f1',
      glow: 'rgba(99, 102, 241, 0.4)',
      border: 'border-indigo-500/40',
      bg: 'bg-indigo-500/10',
      text: 'text-indigo-400'
    },
    building: {
      name: '音浪大數據觀測站',
      symbol: '📊',
      x: 1200,
      y: 1300,
      width: 160,
      height: 130,
      pos3D: { x: 14.7, y: 0.65, z: 25.5 },
      hex: { q: 0, r: 2 }
    },
    story3D: '以高雄流行音樂中心「音浪塔」為靈感設計的大數據觀測台，六角波浪屋頂隨著巨量資料串流律動，全天候處理亞灣智慧城市與工業物聯網海量封包。',
    highlights: [
      '節點優雅下線（Decommission）：自動將 DataNode 資料區塊遷移複製至健康節點後方允許離線刪除',
      'HDFS 安全模式（Safe Mode）與元數據修復：自動檢測未達指定副本數區塊並安全解除鎖定',
      '核心叢集保護機制（Termination Protection）：設為保護狀態下嚴禁人為誤刪歷史巨量數據'
    ],
    features: [
      { name: '企業級大數據生態系開箱即用', desc: '全面支援 HDP 與 CDH 發行版，內建 HDFS 分散式儲存、YARN 資源調度、Hive 資料倉儲與 Spark 高速記憶體運算。' },
      { name: '節點在線上下線 (Decommission)', desc: '維護節點時先觸發優雅下線，HDFS 自動在背景遷移副本至其餘節點，確認安全後方可刪除，保證零資料遺失。' },
      { name: 'HDFS 安全模式檢測與修復', desc: '當叢集重啟或節點異常時自動進入 Safe Mode 保護唯讀狀態，提供副本缺損診斷與安全退出工具。' },
      { name: 'Hive Metastore 備份與元數據還原', desc: '支援定期排程備份 Hive Metastore 元數據資料庫，當發生損壞時可秒級一鍵回溯還原。' },
      { name: '叢集保護與安全認證', desc: '提供「設為保護」避免核心叢集遭誤刪，並全面整合 Kerberos 企業級 Principal 與 Keytab 安全認證機制。' }
    ],
    specs: [
      { label: '支援發行版', value: 'Hortonworks HDP / Cloudera CDH / Apache 生態' },
      { label: '安全認證', value: 'MIT Kerberos 企業級 Principal / Keytab 身分驗證' },
      { label: '高可用架構', value: 'HA NameNode + ResourceManager + ZooKeeper' }
    ],
    manualSection: '手冊第 12 章：BDS 大數據服務 (12.1~12.3)'
  },
  {
    id: 'meter',
    chapter: 'Ch 13',
    code: 'Meter',
    name: 'Meter 資源計量服務',
    category: '管理與安全',
    subtitle: '多維度資源統計、公私網流量雙軌分析、Excel/CSV 財務分攤與六大欄位審計日誌',
    description: '彙整自手冊第 13 章。位於東南角綠能島，落實企業 FinOps 成本治理與資安合規（統計 vCPU/RAM/磁碟/IP 時數、自訂財務月結區間、Excel/CSV 報表匯出、公網與私網流量雙軌圖表分析，以及滿足 ISO 27001 的六大核心欄位操作歷程審計日誌）。',
    badge: 'FinOps 與資安審計儀表板',
    color: {
      primary: '#14b8a6',
      glow: 'rgba(20, 184, 166, 0.4)',
      border: 'border-teal-500/40',
      bg: 'bg-teal-500/10',
      text: 'text-teal-400'
    },
    building: {
      name: '綠能港灣光伏計量站',
      symbol: '📈',
      x: 1540,
      y: 1300,
      width: 140,
      height: 130,
      pos3D: { x: 22.1, y: 0.65, z: 12.8 },
      hex: { q: 1, r: 1 }
    },
    story3D: '矗立於南端採光最佳的綠能浮島，屋頂鋪設大片太陽能光電陣列，中央旋轉的綠能計量雷達即時採集全園區每一千瓦電力與每一度雲端算力消耗。',
    highlights: [
      'FinOps 成本精算分攤：以小時計費精算 vCPU/RAM/磁碟/浮動 IP，支援一鍵匯出 Excel (.xlsx) 與 CSV',
      '公私網流量雙軌趨勢監控：分離呈現公網 Public Egress/Ingress 與內部私網傳輸量',
      'ISO 27001 六大核心欄位審計日誌：操作時間、帳號、來源 IP、服務、操作類型、結果與詳情'
    ],
    features: [
      { name: '跨產品多維度用量統計', desc: '精確統計 FiCo 規格時數（vCPU-Hours、RAM-Hours）、雲磁碟 GB-Hours、浮動 IP 與 K8s/BDS/FiWo 資源消耗。' },
      { name: '靈活會計週期與報表匯出', desc: '提供當月、上月與自訂結算日期區間，支援一鍵匯出 Excel (.xlsx) 與 CSV 檔案，無縫對接企業財務 ERP 系統。' },
      { name: '公網與私網流量雙軌分析', desc: '時間序列折線圖即時反應用量峰值，清晰區隔公網進出流量（Public Egress/Ingress）與內部私網流量，精準規劃頻寬。' },
      { name: '全域操作歷程審計 (Audit Log)', desc: '詳實記錄「時間、帳號、來源 IP、服務類型、操作類型、結果」六大欄位，滿足金融與資安合規稽核追溯。' },
      { name: '異常操作追蹤與警報關聯', desc: '支援依操作者 IP、資源 ID 與失敗事件過濾檢索，快速辨識未授權變更與安全風險。' }
    ],
    specs: [
      { label: '計量維度', value: 'vCPU-Hours / RAM-Hours / Disk GB-Hours / IP 時數' },
      { label: '審計欄位', value: '時間戳 / 帳號 / 來源 IP / 服務 / 操作行為 / 執行結果' },
      { label: '匯出相容', value: 'Microsoft Excel (.xlsx) / 標準 CSV / API 串接' }
    ],
    manualSection: '手冊第 13 章：Meter 資源計量服務 (13.1~13.3)'
  }
];

export const TOTAL_PRODUCTS_COUNT = FIXO_PRODUCTS.length;
