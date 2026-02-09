# 次期Webアプリ移行方針設計書 (System Design Document)

本ドキュメントは、[WEB_APP_SPEC.md](file:///c:/Users/r-tar/OneDrive/%E3%83%87%E3%82%B9%E3%82%AF%E3%83%88%E3%83%83%E3%83%97/git/anken-tool/WEB_APP_SPEC.md) に基づき、現行のGoogle Apps Script (GAS) + Spreadsheet システムから、RDB + Web API 構成のWebアプリケーションへ移行するための要件定義および設計方針をまとめたものです。

## 1. 前提と制約の整理

### 現行システムへの依存と役割
*   **GAS (Google Apps Script)**: バックエンドロジック全般（ビジネスロジック、DB操作、メール送信、PDF生成）を担当。
*   **Google Sheets**: リレーショナルデータベース（RDB）の代替。案件管理、請求管理、マスタデータの保存場所。
*   **Google Drive**: 証憑（請求書PDF）のファイルストレージ。
*   **Gmail/MailApp**: 通知および請求書送付のメールゲートウェイ。

### 採用技術スタック
*   **Frontend/Backend Framework**: **Next.js** (App Router)
*   **Database & Auth**: **Supabase** (PostgreSQL, Supabase Auth)
*   **Hosting**: **Vercel**
*   **Styling**: **Tailwind CSS**
*   **UI Components**: **shadcn/ui** (Radix UI base)
*   **Icons**: **Lucide React**
*   **Layout**: **react-resizable-panels**

### 認証方式の現状と移行方針
*   **現状**: メールアドレスの一致による簡易チェック（パスワードレス、セキュリティ低）。
*   **機能要件**: ユーザー（スタッフ）の識別、ロール（営業/作業担当）による機能制限。
*   **Webアプリ移行後**: **Supabase Auth** を採用。Email/Password認証またはMagic Link認証を使用し、Row Level Security (RLS) でデータアクセスを制御する。

## 2. 主要ユースケース

### UC-01: 作業完了報告
*   **アクター**: 作業担当スタッフ
*   **前提**: ログイン済みで、自分担当の「作業中」ステータスの案件が存在する。
*   **入力**: 案件ID、作業完了日（デフォルト：当日）
*   **処理**:
    1.  完了日の保存。
    2.  ステータス自動判定ロジックの実行（「作業中」→「作業完了」）。
*   **成功条件**: DB上の案件ステータスが更新され、一覧から該当案件が消える（フィルタ条件により）。
*   **失敗条件**: 未来日付（要件によるが通常は不可）、DB更新失敗。

### UC-02: 分割請求書作成・送付
*   **アクター**: 営業担当/管理者
*   **前提**: 請求対象の案件が存在し、請求内容をA/Bの2通に分割する必要がある。
*   **入力**:
    *   対象案件ID
    *   請求日
    *   請求書A情報（取引先、案件名、対象明細リスト）
    *   請求書B情報（取引先、案件名、対象明細リスト）
*   **処理**:
    1.  **プレビュー**: PDF生成（一時保存/メモリ展開）、請求書No採番。
    2.  **送信**: 本番PDF生成・保存、請求データ登録（2件）、案件ステータス更新、メール送信。
*   **出力**: 生成されたPDFのプレビューURL（またはBase64）、送信完了通知。
*   **成功条件**: A/B両方のPDFがストレージに保存され、メールが送信され、DBに請求記録が残ること。
*   **失敗条件**: 取引先重複、明細未選択、ストレージ保存失敗、メール送信エラー。

## 3. UI/UXデザインとレイアウト策定

直近の実装協議により、以下の3ペイン構成を採用します。デスクトップでの作業効率を重視した「アプリライク」な操作感を目指します。

### 3.1. 画面レイアウト (3-Pane Resizable Layout)
`react-resizable-panels` を使用し、ユーザーが自由に領域幅を調整可能な構成とします。

1.  **左サイドバー (Navigation)**
    *   **役割**: アプリケーション全体のナビゲーション。
    *   **項目**: ダッシュボード、案件一覧、作業完了報告、請求書管理、ユーザー設定。
    *   **挙動**: 幅調整可能 (Min 15% - Max 30%)、折りたたみ可能。
2.  **メインコンテンツ (Center Main)**
    *   **役割**: 各業務機能の操作画面（一覧、フォーム、プレビュー等）。
    *   **機能**: 右側アシスタントパネルの表示/非表示トグルボタンを配置。
    *   **挙動**: 可変幅 (Min 30%)。
3.  **右アシスタントパネル (Assistant Panel)**
    *   **役割**: AIアシスタント、ヘルプ、またはコンテキストに応じたサブ情報の表示。
    *   **挙動**: 幅調整可能 (Min 15% - Max 40%)、デフォルト表示/非表示切り替え可能。
    *   **実装**: `AssistPanel` コンポーネントとして分離。

### 3.2. デザインシステム
*   **ベーステーマ**: `shadcn/ui` を採用し、モダンで一貫性のあるデザインを短期間で構築。
*   **アイコン**: `lucide-react` による統一されたアイコンセット。
*   **インタラクション**: 即時応答性を重視し、Client Components を適切に配置してリッチなUIを実現。

## 4. データモデル草案 (Supabase/PostgreSQL)

Spreadsheetのシート構造を正規化し、Supabase上のPostgreSQLスキーマ (`schema.sql`) として実装済みです。
RLS (Row Level Security) により、ログインユーザーに応じたアクセス制御を行います。
※ `CaseDetails` は分割請求機能（明細配分）のため必須です。
※ UUID (`uuid-ossp`) をプライマリキーとして採用。

### Tables

#### `clients` (取引先マスタ)
| Column | Type | Key | Note |
| :--- | :--- | :--- | :--- |
| `id` | UUID | PK | `default uuid_generate_v4()` |
| `name` | TEXT | | 取引先名 |
| `email` | TEXT | | 請求書送付先 |
| `address` | TEXT | | 住所 |
| `created_at` | TIMESTAMP | | |

#### `staffs` (スタッフマスタ)
| Column | Type | Key | Note |
| :--- | :--- | :--- | :--- |
| `id` | UUID | PK | `default uuid_generate_v4()` |
| `name` | TEXT | | 氏名 |
| `email` | TEXT | UQ | ログインID兼用 |
| `notification_email` | TEXT | | 通知用 |
| `role` | TEXT | | Check: 'admin', 'sales', 'worker' |

#### `cases` (案件管理)
| Column | Type | Key | Note |
| :--- | :--- | :--- | :--- |
| `id` | UUID | PK | `default uuid_generate_v4()` |
| `client_id` | UUID | FK | -> clients.id |
| `staff_id` | UUID | FK | -> staffs.id |
| `name` | TEXT | | 案件名 |
| `status` | TEXT | | Default: '受注前' |
| `order_date` | DATE | | 受注日 |
| `scheduled_completion_date` | DATE | | 完了予定日 |
| `work_completion_date` | DATE | | 作業完了日 |
| `invoice_issue_date` | DATE | | 請求書発行日 |
| `lost_date` | DATE | | 失注日 |
| `memo` | TEXT | | |
| `created_at` | TIMESTAMP | | |
| `updated_at` | TIMESTAMP | | |

#### `case_details` (案件明細)
*案件:明細 = 1:N*
| Column | Type | Key | Note |
| :--- | :--- | :--- | :--- |
| `id` | UUID | PK | `default uuid_generate_v4()` |
| `case_id` | UUID | FK | -> cases.id (Cascade Delete) |
| `item_name` | TEXT | | 品目名 |
| `unit_price` | NUMERIC | | Default: 0 |
| `quantity` | NUMERIC | | Default: 1 |
| `amount` | NUMERIC | | Generated (unit_price * quantity) |

#### `invoices` (請求)
| Column | Type | Key | Note |
| :--- | :--- | :--- | :--- |
| `id` | UUID | PK | `default uuid_generate_v4()` |
| `invoice_no` | TEXT | UQ | 請求書番号 |
| `client_id` | UUID | FK | 請求先 |
| `issue_date` | DATE | | Default: current_date |
| `total_amount` | NUMERIC | | Default: 0 |
| `pdf_url` | TEXT | | ストレージURL |
| `payment_status` | TEXT | | Default: '未入金' |
| `source_case_ids` | JSONB | | 元案件ID配列 |

#### `invoice_items` (請求明細)
*請求書と案件明細の紐付け中間テーブル*
| Column | Type | Key | Note |
| :--- | :--- | :--- | :--- |
| `id` | UUID | PK | `default uuid_generate_v4()` |
| `invoice_id` | UUID | FK | -> invoices.id (Cascade Delete) |
| `case_detail_id` | UUID | FK | -> case_details.id |
| `amount` | NUMERIC | | 請求時固定金額 |

## 5. API設計草案

RESTful API を基本とします。

### Auth
*   `POST /api/auth/login`: ログイン (Token発行)
*   `GET /api/auth/me`: 自身の情報取得

### Cases
*   `GET /api/cases`: 案件一覧取得
    *   Query: `staffId`, `status`(作業中など)
*   `GET /api/cases/{id}`: 案件詳細取得
*   `PATCH /api/cases/{id}/completion`: 作業完了報告
    *   Req: `{ workCompletionDate: "YYYY-MM-DD" }`
    *   Val: 日付形式, 担当者一致チェック

### Invoices (Split)
*   `POST /api/invoices/preview-split`: 分割請求プレビュー作成
    *   Req: `{ caseId, invoiceDate, splitA: { clientData, items... }, splitB: { ... } }`
    *   Res: `{ previewId, pdfBase64A, pdfBase64B, invoiceNoA, invoiceNoB }`
*   `POST /api/invoices/submit-split`: 分割請求確定・送信
    *   Req: `{ previewId, ... }` (プレビュー時のIDで確定指示、またはパラメータ再送)
    *   Res: `{ success: true, createdInvoiceIds: [...] }`

### Masters
*   `GET /api/clients`: 取引先一覧
*   `GET /api/staffs`: スタッフ一覧

## 6. バリデーション・業務ルール一覧

### 共通
*   **日付形式**: ISO 8601 (YYYY-MM-DD) 準拠。
*   **ID存在確認**: 参照するIDはDBに存在すること。

### 作業完了報告
*   `workCompletionDate`: 必須。
*   権限: リクエストユーザが当該案件の `workStaffId` と一致すること。

### 分割請求
*   **取引先差異**: 請求書Aと請求書Bの `clientId` は必須かつ **異なる** こと。
*   **案件名**: A/Bともに必須。
*   **明細配分**: 元案件の明細データを、AとBそれぞれに **少なくとも1件以上** 割り当てること。（明細のロスト/二重計上禁止）
*   **合計金額整合**: (オプション) AとBの合計が元案件の合計と一致するかチェック（要件によるが推奨）。
*   **プレビュー必須**: 送信(`submit-split`)前に必ずプレビューAPIを通過していること（または同等の検証を行うこと）。

### ステータス判定 (determineStatus)
*   DBトリガーまたはService層で実装。
*   優先順位:
    1.  `lostDate` あり → **失注**
    2.  `invoice_issue_date` あり (OR 請求レコード紐付き) → **請求済**
    3.  `work_completion_date` あり → **作業完了**
    4.  `order_date` あり → **作業中** (完了予定日が過ぎていれば「遅延」扱いの検討も)
    5.  その他 → **受注前/見込み**

## 7. 非機能要件の初期整理

*   **可用性**:
    *   **Vercel** (Frontend/API) + **Supabase** (DB) の構成により、高い可用性とスケーラビリティを確保。
*   **監査・ログ**:
    *   「誰が」「いつ」「作業完了/請求発行」したかの操作ログを保存。
    *   メール送信ログ（送信日時、宛先、成否）。
*   **通知方式**:
    *   システムメール送信（SendGrid/SES等）。
    *   MailAppの代替として、信頼性の高いメール配信サービスの選定が必要。
*   **非同期処理 (Job Queue)**:
    *   PDF生成とメール送信は時間がかかるため、APIレスポンスと切り離して非同期実行（リクエスト受領→即レスポンス→バックグラウンド処理）を推奨。
    *   特に「分割請求送信」はトランザクションが重いため、Worker利用を検討。

## 8. 移行計画の論点

*   **データ移行 (Migration)**
    *   SpreadsheetデータをCSVエクスポートし、RDBへインポートするスクリプトが必要。
    *   既存の `caseId` 等のID体系を維持するか、新ID(UUID等)に振り直して旧IDをカラムに保持するか決定が必要。
*   **PDF生成の代替**
    *   現状: Spreadsheetテンプレート + GAS。
    *   移行後: 以下のいずれかへ切り替え。
        1.  HTML/CSS + Headless Browser (Puppeteer/Playwright)。
        2.  PDF生成ライブラリ (pdfmake, React-PDF)。
        3.  SaaS (Formの帳票サービス等)。
    *   品質担保のため 1. のHeadless Browser方式が現行レイアウト再現性が高い。
*   **Driveリンクの代替**
    *   S3/GCS等の署名付きURL、あるいは永続的な公開URL（推測困難なID付与）の発行。メール本文への記載用。
*   **トランザクション整合性**
    *   GASでは比較的ルーズだったが、Webアプリでは「PDF保存」「DBコミット」「メール送信」の原子性（Atomicity）が必要。
    *   メール送信失敗時にDBをロールバックするか、リトライ可能な構成(Sagaパターン)にするか。

## 9. テスト観点リスト

### 機能テスト
*   [ ] **作業完了報告**:
    *   担当案件のみ表示されるか。
    *   完了日入力後、ステータスが正しく更新されるか。
    *   一覧から消えるか（フィルタ動作）。
*   [ ] **分割請求**:
    *   プレビューPDFは正しく生成されるか（レイアウト崩れなし）。
    *   A/Bそれぞれの取引先・金額・明細が正しいか。
    *   送信処理後、請求テーブルに2レコード作成されるか。
    *   元案件のステータスが「請求済」になるか。

### バリデーション＆異常系
*   [ ] 未来の作業完了日（要件次第）。
*   [ ] 分割請求で同一取引先を選択した場合のエラー。
*   [ ] 明細を片方に寄せた場合（空の請求書）のエラー。
*   [ ] PDF生成タイムアウト時のハンドリング。

### インテグレーション
*   [ ] **メール通知**:
    *   担当営業にメールが届くか。
    *   メール内のリンクからPDFが開けるか（権限設定確認）。
    *   請求情報は本文とPDFで一致しているか。
*   [ ] **ステータス遷移**:
    *   作業用→作業完了→請求済 のフローが通るか。
