# LBS 負載平衡服務 (Load Balancing Service)

本文件彙整自《FiXo User Portal Manual v5.4.1.0》第 8 章，說明 FiXo 高可用流量調度架構、進階負載平衡器（ALB）、第 4/7 層流量轉發、健康監控及精細化路由政策。

---

## 🌟 3D 政策島（Heart Island）場景導覽
* **3D 展館地標**：⚖️ **高雄一港口航標燈塔**
* **六角島嶼座標**：Axial Hex `(q: -1, r: 0)` ｜ 3D 世界座標：`(-14.7, 0.65, 0.0)`
* **所屬聚落**：高雄軟體科技園區 · 西南航道海防岬角島
* **場景建築概念**：以高雄港一港口防波堤的紅白相間旋轉燈塔為主體，頂部射出旋轉探照紫光，象徵指引全網海量突發併發連線，精準分流至各個後端虛擬機伺服器池。
* **探索互動方式**：探索員小人自中央島西側拱橋前往燈塔基座，靠近信標即可開啟對話框，檢視第 7 層政策優先級匹配規則（REJECT > REDIRECT_URL > REDIRECT_POOL）、三大逾時毫秒控制與主動式健康檢查。

---

## 1. 產品定位與架構全覽

LBS（Load Balancing Service）提供全代管的流量負載平衡與分發能力，支援跨多台虛擬機（FiCo 實例）分散流量負載，具備自動故障隔離、第 7 層智慧路由轉發、SSL/TLS 卸載加速及高可用性容災機制。

```mermaid
flowchart TD
    Client([外部連線請求 / 網際網路]) --> FIP[浮動 IP Floating IP]
    FIP --> ALB[進階負載平衡器 ALB\n虛擬服務 IP (VIP)]
    ALB --> L4[第 4 層監聽器\nTCP / UDP]
    ALB --> L7[第 7 層監聽器\nHTTP / HTTPS (KMS 憑證)]
    L7 --> Policy{L7 政策匹配 Policy\n1. REJECT\n2. REDIRECT_TO_URL\n3. REDIRECT_TO_POOL}
    Policy -->|轉向 Pool A| PoolA[後端伺服器池 A\nROUND_ROBIN 輪詢]
    Policy -->|轉向 Pool B| PoolB[後端伺服器池 B\nLEAST_CONNECTIONS]
    L4 --> PoolA
    PoolA --> VM1[虛擬機實例 1\nHealth Monitor 正常]
    PoolA --> VM2[虛擬機實例 2\nHealth Monitor 正常]
    PoolB --> VM3[虛擬機實例 3\nHealth Monitor 正常]
```

---

## 2. 進階負載平衡器實例 (ALB)

### 2.1 核心屬性與網路配置
* **網路依賴**：需部署於指定的 VPC 租戶子網或企業專有網路中。
* **VIP（Virtual IP 虛擬服務位址）**：
  * 作為負載平衡器在內部私網的統一存取端點。
  * 支援由系統於子網內動態指派，亦支援**手動指定特定固定 VIP**。
* **彈性公網入口**：透過「關聯浮動 IP」快速賦予負載平衡器公網對外服務能力；在進行架構切換時可隨時「解關聯浮動 IP」。

---

## 3. 監聽器深度管理 (Listener)

### 3.1 協定與參數設定
監聽器負責監聽來自用戶端指定通訊埠的連線請求：
* **支援協定**：`HTTP`、`HTTPS`（需關聯 KMS 伺服器憑證完成 SSL Offloading）、`TCP`、`UDP`。
* **最大連線數限制（Connection Limit）**：防範異常連線暴增拖垮後端。
* **三大微秒級逾時設定（以毫秒 ms 為單位）**：
  * **前端閒置逾時（Client Data Timeout）**：用戶端傳輸間隔的最大容忍時間，**預設為 50,000 ms（50 秒）**。
  * **後端連線逾時（Member Connect Timeout）**：負載平衡器與後端成員建立 TCP 握手的最長時限，**預設為 5,000 ms（5 秒）**。
  * **後端閒置逾時（Member Data Timeout）**：後端成員處理資料傳輸的最大等待時間，**預設為 50,000 ms（50 秒）**。

---

## 4. 後端伺服器池 (Pool) 與健康檢查 (Health Monitor)

### 4.1 流量分發演算法 (Algorithm)
* **輪詢（ROUND_ROBIN）**：請求均勻輪流分配至各個健康成員，適合後端規格一致的無狀態服務。
* **最少連線數（LEAST_CONNECTIONS）**：優先分派給當前活動連線數最少的伺服器，適合連線保持時間較長之動態交易。
* **來源 IP 哈希（SOURCE_IP）**：依用戶端來源 IP 計算 Hash 值分配，保證同一來源的請求始終導向同一後端（Session 黏性保持）。

### 4.2 成員權重配置 (Member Weight)
* 可動態加入多台 FiCo 虛擬機私有 IP 與對應服務 Port。
* 支援自訂 **權重比例（Weight）**，效能較高的主機可設定較高權重以承載更多併發請求。

### 4.3 主動式健康檢查 (Health Monitor)
負載平衡器持續向後端成員探測健康狀態，自動剔除異常主機：
* **探測協定**：支援 `PING`、`TCP` 連接埠握手、`HTTP` 應用層探針。
* **檢查間隔（Check Interval）**：探測週期秒數。
* **逾時時限（Timeout）**：單次探測等待響應的最長時間。
* **最大重試次數（Max Retries）**：連續失敗達指定門檻即將該成員標記為 DOWN，停止分發流量；恢復後自動轉為 UP。
* **HTTP 進階探針**：可指定檢查的 URL 路徑（如 `/healthz`）與預期回傳的 HTTP 狀態碼（例如 `200`、`200-204`）。

---

## 5. 第 7 層轉發政策 (Policy) 與規則 (Rule)

進階負載平衡器具備強大的第 7 層內容感知路由能力，可根據 HTTP 請求特徵精準分流。

### 5.1 政策動作與優先匹配順序
系統嚴格依據下列層級執行匹配流程：
1. **動作類型優先順序（固化規則）**：
   * 第一優先：**拒絕連線（REJECT）**，直接丟棄或拒絕特定黑名單流量。
   * 第二優先：**導向網址（REDIRECT_TO_URL）**，常用於 HTTP 自動跳轉 HTTPS 或轉址至外部頁面。
   * 第三優先：**導向後端池（REDIRECT_TO_POOL）**，將符合特徵的業務分流至專屬伺服器群。
2. **同動作類型之順序調整**：
   * 若多筆政策具有相同動作，使用者可透過 **「設定政策順序」** 進行由上而下的優先順序排序，命中的第一筆政策即刻生效。

### 5.2 轉發規則維度與比對方式 (Rule Criteria)
每條政策下可關聯多個比對規則：
* **比對維度（Type）**：
  * `HOST_NAME`：依請求域名分流（如 `api.example.com` 導向 API 池，`static.example.com` 導向靜態池）。
  * `PATH`：依請求 URL 路徑分流（如 `/api/*` 或 `/images/*`）。
  * `FILE_TYPE`：依檔案副檔名（如 `.jpg`、`.css`）分流。
  * `HEADER`：檢查自訂 HTTP Request Header。
  * `COOKIE`：檢查特定用戶端 Cookie 值。
* **比對方式（Comparison Operator）**：
  * `EQUAL_TO`（精確相符）
  * `REGEX`（正規表達式）
  * `STARTS_WITH`（前綴開頭）
  * `ENDS_WITH`（後綴結尾）
  * `CONTAINS`（包含子字串）
* **反向匹配（Invert）**：勾選後將條件取反（例如：不等於或不包含）。
