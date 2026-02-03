# Web App Migration Spec (Current GAS + Spreadsheet Baseline)

## Purpose
- Summarize current spreadsheet/GAS implementation as baseline for migration to a standalone web app (with API/backend + DB).
- Capture data model, flows, and validation rules to keep behavior parity.

## Current System Overview
- Runtime: Google Apps Script (GAS) + Google Sheets as DB + Drive for file storage + Gmail/MailApp for notifications.
- Key GAS files: `コード.gs` (business logic), `WebApp.gs` (web app endpoints/auth), `invoice_split.html` (split invoice UI), `report.html` (mobile work-completion UI).
- Storage:
  - Google Sheets
    - 案件管理DB (case master)
    - 請求DB (invoice ledger)
    - 取引先マスタ (client master)
    - スタッフマスタ (staff master)
    - その他: 見積/テンプレートシート等（請求書テンプレート含む）
  - Google Drive
    - 請求書PDFを年月フォルダに保存（`getInvoiceArchiveFolder(invoiceDate)`).

## Data Model (Spreadsheet Columns)
Numbers below are 1-based column indices (Sheet UI). Internal code often uses 0-based indexes; both are noted where relevant.

### 案件管理DB (Case Sheet)
- A(1) 案件ID `caseId`
- B(2) ステータス `status` (determineStatusで自動判定)
- C(3) 取引先ID `clientId`
- D(4) 案件名 `caseName`
- G(7) 受注日 `orderDate`
- I(9) 作業完了予定日 `scheduledCompletionDate`
- J(10) 作業完了日 `workCompletionDate`
- K(11) 請求書発行日 `invoiceDate`
- L(12) 関連請求書No (複数をカンマ区切り)
- N(14) 失注日 `lostDate`
- O(15) 作業担当者ID `workStaffId`
- その他: メモ列などを既存レイアウトに準拠

### 請求DB (Invoice Sheet)
AppendRow形で挿入:
- 請求書No
- 請求日 (invoiceDate)
- 元案件ID配列(JSON文字列: `["caseId"]`)
- 取引先ID
- 取引先名
- 金額 (数値)
- PDFリンク (Drive URL)
- 入金ステータス (初期値: 未入金)
- 以降、入金日/備考など空欄で確保

### 取引先マスタ (Client Master)
- clientId, clientName, email, address ほか（`getClientDataById`, `getClientMasterData_WebApp`で参照）

### スタッフマスタ (Staff Master)
- staffId, name, email, notificationEmail (営業通知用), 役割 等

## Key Business Flows

### 1) 作業完了報告（スマホWebアプリ）
- UI: `report.html`
- Backend: `getUserCasesByEmail(email)` (WebApp.gs) + `submitWorkCompletion(caseId, completionDate)` (コード.gs)
- 表示条件: 担当=ログイン者, ステータス=「作業中」, 作業完了日未入力。
- 入力: dateピッカー（初期値=今日）。
- 処理: J列に完了日を書き込み → determineStatusでステータス更新（通常「作業完了」）。
- 成功後: 案件カードを一覧から除去、件数更新。

### 2) 分割請求書作成・送付
- UI: `invoice_split.html`。
- プレビュー: `previewSplitInvoices(caseId, invoiceDate, clientIdA, caseNameA, detailIdsA, clientIdB, caseNameB, detailIdsB)`
  - テンプレートシートをコピーしプレビュー用シートを生成。
  - PDF生成（Drive未保存）、Base64を返却。
  - 請求書Noを採番してレスポンスに含む。
- 送信: `sendSplitInvoiceEmails(...)`
  - プレビューと同じ情報で本番PDFを生成しDriveへ保存（年月フォルダ）。
  - 請求DBに2行追加（A/B）。
  - 案件管理DB: K列 請求書発行日、L列 関連請求書No、B列 ステータスをdetermineStatusで更新。
  - メール: 担当営業 notificationEmail 宛に2件PDF添付 + Driveリンクを本文に記載。
- バリデーション（フロント）:
  - 取引先A/B必須かつ異なる。
  - 案件名A/B必須。
  - 明細をA/Bとも1件以上割り当て。
- PDFプレビュー表示: Base64 → Blob → Object URL → 新規タブ。ポップアップブロック時はユーザに許可を促すアラートのみ（ダウンロードは行わない）。

### 3) ステータス自動判定（determineStatus）
- 作業完了日が存在すれば「作業完了」優先。
- 失注日があれば「失注」。
- 受注日 + 請求書発行日あり → 「請求済」。
- 受注日あり + 完了予定日あり → 「作業中/進行中」。
- 未受注時は見込み/提案系ステータス（既存実装に準拠）。

## API/関数一覧（現行GAS）
- 認証: `authenticateUser(email)`
- 案件取得（作業完了用）: `getUserCasesByEmail(email)`
- 作業完了報告: `submitWorkCompletion(caseId, completionDate)`
- 分割請求プレビュー: `previewSplitInvoices(...)`
- 分割請求送信: `sendSplitInvoiceEmails(...)`
- マスタ取得: `getClientDataById`, `getClientMasterData_WebApp`, `getStaffDataById`
- ユーティリティ: `getInvoiceArchiveFolder`, `generatePdfFromSheet`, `fillSplitInvoiceSheet`, `determineStatus`

## バリデーション要件まとめ
- 作業完了報告: completionDate必須。
- 分割請求: 取引先A/B必須・異なる、案件名A/B必須、各明細1件以上、プレビュー済みであること（送信前にlastPreviewResult必須）。

## メール送信仕様
- 送信元: Apps Script 権限でMailApp.sendEmail。
- 宛先: 担当営業の `notificationEmail`。
- 本文: 案件情報、請求書A/BのNo・請求先・案件名・請求額、各PDFのDrive URLを明記。
- 添付: 請求書A/BのPDF（Drive保存と同一内容）。

## Drive保存仕様
- フォルダ: 請求年月のフォルダ（存在しなければ作成）。
- ファイル名: `請求書【<取引先名>様】<案件名>_<請求書No>.pdf`

## 既知の入力フォーマット
- 日付: `YYYY-MM-DD`（UIから送信）、GAS側で `new Date()` に変換。
- 数値: 金額は数値型でDB保存（toLocaleStringで表示）。
- 請求書No: preview時に採番し、send時に再利用。

## 移行時の留意点（Webアプリ化）
- データベース移行: Sheets → RDB/NoSQLへマイグレーション時、上記カラムをスキーマ化する。
- PDF生成: 現行はテンプレートシート + GASでPDF化。新環境ではテンプレートエンジン（HTML→PDF等）やサーバサイドPDF生成サービスに置き換え。
- 認証/認可: 現行はメールアドレスベースの簡易認証。WebアプリではID基盤（OIDC/SSO）＋RBACを検討。
- ファイルストレージ: Drive API もしくは別ストレージ（S3/GCS）。Driveリンク相当をメール本文に残す。
- トランザクション: sendSplitInvoiceEmailsは「生成→保存→DB書込→メール送信」を一括で行う。移行後も一貫性確保（DBトランザクション or Saga）を検討。
- 非同期処理: PDF生成やメール送信はジョブキュー化を検討（ユーザー待ち時間短縮）。
- クライアントバリデーション: 現行の必須/整合チェックをフロントとAPI側双方で実装。

## テスト観点（現行踏襲用）
- 作業完了報告: 表示条件フィルタ、日付未入力エラー、報告後に一覧から消えること、ステータス更新/完了日書き込み。
- 分割請求: バリデーション（取引先同一禁止、明細不足、案件名未入力）、プレビュー生成成功、PDFタブ表示、ポップアップブロック時のアラート、送信後のDB書込/Drive保存/メール送付。
- メール内容: Driveリンクと請求情報が正しく反映されること。

## 参考ファイル
- ロジック: `コード.gs`, `WebApp.gs`
- フロント: `invoice_split.html`, `report.html`
- 仕様書類: `仕様書_Ver4.7_作業完了報告Webアプリ.md`, `仕様書_領収書発行機能*.md` など（既存ドキュメント）

---
この仕様は現行GAS+Spreadsheet版の挙動を漏れなく移行するためのベースラインです。追加で列詳細や他機能（見積、入金管理など）が必要な場合は追記してください。
