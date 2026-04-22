#### 📋 目次

| # | セクション |
|---|-----------|
| 1 | [<a id="cm-1"></a>事前準備](#cm-1) |
| 2 | [<a id="cm-2"></a>APIキー取得手順](#cm-2) |
| 3 | [<a id="cm-3"></a>環境変数の設定](#cm-3) |
| 4 | [<a id="cm-4"></a>Webhook設定（Option B Bridge）](#cm-4) |
| 5 | [<a id="cm-5"></a>Sandbox → Production移行（8ステップ playbook）](#cm-5) |
| 6 | [<a id="cm-6"></a>トラブルシューティング](#cm-6) |

---

## <a id="cm-1"></a>1. 事前準備

Sericia は **Crossmint Headless Checkout（Fiat-only モード）** を採用。買い手は普通のクレカ決済 UI で購入し、Sericia の財布には USDC で入金される。サプライヤー支払い時のみ Tria / RedotPay で日本円に変換する。

**必要なもの**:
- Crossmint アカウント（https://www.crossmint.com/signup）
- 収益先の USDC ウォレット（Polygon もしくは Solana チェーン推奨。Phantom / MetaMask いずれも可）
- Medusa 管理画面の Admin API Token（`https://api.sericia.com/app` から発行）

---

## <a id="cm-2"></a>2. APIキー取得手順

1. https://staging.crossmint.com/console にログイン
2. **Projects → New Project**「Sericia」作成（Environment: `staging`）
3. **Integrate → API Keys** でクライアントサイド用のキーを発行:
   - `NEXT_PUBLIC_CROSSMINT_CLIENT_ID` → `CrossmintPayButton` 用
   - Scope: `payments:fiat.checkout`
4. **Webhooks → Create Signing Secret** を発行:
   - `CROSSMINT_WEBHOOK_SECRET` → サーバー側 HMAC 検証に使用
   - Events: `order.succeeded`, `order.failed`

---

## <a id="cm-3"></a>3. 環境変数の設定

Coolify 管理画面でそれぞれのアプリに設定する。storefront と medusa-backend で**変数名が微妙に異なる点に注意**（ストアフロント側は `CROSSMINT_SERVER_API_KEY`、Medusa 側は `CROSSMINT_API_KEY` — サービス毎の別スコープキーを想定した仕様）:

**storefront (em2luzsfjoxb77jo3rxl4c9c)**:
```bash
NEXT_PUBLIC_CROSSMINT_CLIENT_ID=ck_xxx       # クライアントサイド用（iframeロード）
CROSSMINT_SERVER_API_KEY=sk_xxx              # サーバーサイド /api/pay/create 用
CROSSMINT_ENV=production                     # staging | production（未設定時は production）
CROSSMINT_WEBHOOK_SECRET=whsec_xxx           # Option B Bridge 用 HMAC 検証
```

**medusa-backend (wl8ke5lf6rxjoepi058qv89u)**:
```bash
CROSSMINT_API_KEY=sk_xxx                     # 将来の拡張用（現行 webhook では未使用）
CROSSMINT_WEBHOOK_SECRET=whsec_xxx           # Primary webhook HMAC 検証（storefront と同値）
RESEND_API_KEY=re_xxx
```

⚠️ `CROSSMINT_WEBHOOK_SECRET` は **storefront と medusa-backend で必ず同値** にすること。同じ raw body を HMAC 検証するため異なると片方で 401 になる。

---

## <a id="cm-4"></a>4. Webhook設定（Option B Bridge）

**URL**: `https://api.sericia.com/webhooks/crossmint`（Medusa側のハンドラ）

**バックアップパス**: `https://sericia.com/api/crossmint-webhook`（storefrontがMedusaへ転送）

Crossmint コンソールで両方を登録しておくと、片方が落ちても他方が受ける。

**署名検証**:
```
signature = HMAC-SHA256(CROSSMINT_WEBHOOK_SECRET, raw_body)
```
`x-crossmint-signature` ヘッダと突合し、一致しないリクエストは401で拒否する（実装済み: `medusa-backend/src/api/webhooks/crossmint/route.ts`）。

**フロー**:
1. 顧客が `CrossmintPayButton` でクレカ入力 → Crossmint がカード処理
2. Crossmint が USDC を Sericia ウォレットに送金
3. Crossmint が `order.succeeded` webhook を発火
4. Medusa が受信 → HMAC検証 → `orderModule.createOrders()` でオーダー作成
5. `inventoryModule.adjustInventory(variantId, -qty)` で在庫減算
6. Resend で注文確認メール送信

---

## <a id="cm-5"></a>5. Sandbox → Production移行

> **この節は順番に全てクリアした上で移行すること**。途中スキップ厳禁。ロールバック（§5.7）まで読んでから作業開始すること。

### 5.1 前提チェックリスト（移行GO判定）

本番切替前に以下を**全て**✓してからでないと §5.2 に進まない。一つでも未完了なら待つ。

- [ ] Sandbox で `order.succeeded` webhook を **5件以上**受信し、Medusa の `order` テーブル＋ `sericia_orders` の両方に反映されている（単にCrossmint側で成功、ではなく Bridge 最後まで通っていること）
- [ ] Sandbox で `order.failed` を **1件以上**受信し、401 にならず 200 で終了することを確認（HMAC 検証経路の生存確認）
- [ ] Crossmint KYC 書類一式（法人登記簿 / 代表者ID / 住所証明 / 銀行口座）を事前にPDF化してDropbox等に用意
- [ ] 受取ウォレットのチェーンを確定（**推奨: Polygon** — 手数料0.01USDC未満、Tria/RedotPay両対応。Solanaは Tria 未対応のため非推奨）
- [ ] 本番ウォレットのシードフレーズを **物理紙＋金庫** で保管済み（ホットウォレットキーと混在禁止）
- [ ] storefront / medusa-backend の Coolify 環境変数を現状バックアップ（ロールバック用）

### 5.2 Crossmint コンソール切替

1. https://www.crossmint.com/console（**staging ではなく本番URL**）にログイン
2. **Settings → Verification** で KYC 書類を提出 → 通常 1〜3 営業日で Approved
3. Approved 後、**Project → Switch to Production** を有効化
4. **Integrate → API Keys** で本番キーを新規発行：
   - `NEXT_PUBLIC_CROSSMINT_CLIENT_ID` → `ck_production_xxx`（Scope: `payments:fiat.checkout`）
   - `CROSSMINT_SERVER_API_KEY` → `sk_production_xxx`（Scope: `orders.create`, `orders.read`）
5. **Webhooks → Create Signing Secret** で本番署名シークレットを**新規発行**（Sandbox のものは絶対に流用しない）:
   - `CROSSMINT_WEBHOOK_SECRET` → `whsec_production_xxx`
   - Events: `order.succeeded`, `order.failed`
6. **Settings → Wallets** で本番 USDC 受取アドレスを登録（§5.1 で決めたチェーン）

⚠️ **Sandbox キーは削除せずに保持**すること。ロールバック時に使用する。

### 5.3 環境変数差し替え（Coolify 2アプリ）

⚠️ 両アプリを**同一セッション内で連続して**差し替えること。片方だけ本番だと HMAC 検証が不一致で全決済が 401 になる。

**storefront (em2luzsfjoxb77jo3rxl4c9c)** — 4変数:
```bash
NEXT_PUBLIC_CROSSMINT_CLIENT_ID=ck_production_xxx      # §5.2 step 4 で発行
CROSSMINT_SERVER_API_KEY=sk_production_xxx             # §5.2 step 4 で発行
CROSSMINT_ENV=production                               # staging → production
CROSSMINT_WEBHOOK_SECRET=whsec_production_xxx          # §5.2 step 5 で発行
```

**medusa-backend (wl8ke5lf6rxjoepi058qv89u)** — 2変数:
```bash
CROSSMINT_API_KEY=sk_production_xxx                    # storefront の SERVER_API_KEY と同値
CROSSMINT_WEBHOOK_SECRET=whsec_production_xxx          # storefront と完全一致必須
```

変更後、両アプリを **Restart**（Rebuild ではなく Restart で十分。コードは未変更）。

### 5.4 コード有効化（concierge mailto → 本番iframe）

**これが最重要手順**。現行 `components/CrossmintPayment.tsx` は Phase 1 の concierge モード（`mailto:` ボタン）で動いている。本番では実際のCrossmint決済UIに差し戻す必要がある。

**差分の要点**（詳細は別コミットで実施）:
```tsx
// Before (Phase 1 concierge):
<a href={`mailto:orders@sericia.com?subject=Order ${orderId}&body=...`}>
  お支払い手続きへ
</a>

// After (Phase 2 production):
import { CrossmintPaymentElement } from "@crossmint/client-sdk-react-ui";

<CrossmintPaymentElement
  clientId={process.env.NEXT_PUBLIC_CROSSMINT_CLIENT_ID!}
  environment={process.env.NEXT_PUBLIC_CROSSMINT_ENV ?? "production"}
  orderId={crossmintOrderId}  // /api/pay/create のレスポンス
  paymentMethod="fiat"
  onEvent={(e) => {
    if (e.type === "payment:process.succeeded") router.push(`/orders/${orderId}/thanks`);
  }}
/>
```

`/api/pay/create` は既に Crossmint にオーダー事前登録済みなので、`crossmintOrderId` を返すよう整備するだけで iframe が起動する。

### 5.5 Webhook URL 再登録

Crossmint コンソール **Webhooks** で以下を**両方**登録（Primary が落ちても Backup が受ける冗長化設計）:

| 種別 | URL | Events |
|------|-----|--------|
| Primary | `https://api.sericia.com/webhooks/crossmint` | `order.succeeded`, `order.failed` |
| Backup | `https://sericia.com/api/crossmint-webhook` | `order.succeeded`, `order.failed` |

登録後、Crossmint の **Send Test Event** ボタンで疎通確認（200 OK が両方で返ることを確認）。

### 5.6 スモークテスト（$1 ライブテスト）

本番公開前に**自分の本物のクレカ**で $1 相当の商品を購入し、end-to-end で以下を全て確認:

- [ ] `CrossmintPaymentElement` が iframe で表示される（mailto ボタンが残っていない）
- [ ] クレカ入力 → 決済成功画面まで遷移
- [ ] Crossmint Console に order が Completed 表示
- [ ] 本番ウォレットに USDC が着金
- [ ] `order.succeeded` webhook が Primary 経由で Medusa に到達（Coolify logs で確認）
- [ ] `sericia_orders` に行が入り `status='paid'` になっている（Supabase）
- [ ] 該当商品の `inventory_quantity` が -1 されている（Medusa Admin）
- [ ] 注文確認メールが Resend 経由で届く
- [ ] Slack `#all-paradigm` に `order_created` 通知が入る

**1件でも NG なら §5.7 ロールバックして原因調査。絶対に公開しない。**

### 5.7 ロールバック手順（5分で戻す）

本番で異常が出たら即座に Sandbox に戻す。手順:

1. Coolify storefront の `CROSSMINT_ENV=staging` に戻す
2. 4つの本番キー (`NEXT_PUBLIC_CROSSMINT_CLIENT_ID` / `CROSSMINT_SERVER_API_KEY` / `CROSSMINT_WEBHOOK_SECRET` / medusa側 `CROSSMINT_API_KEY`) を §5.1 でバックアップした Sandbox 値に戻す
3. `CrossmintPayment.tsx` を git revert で concierge mailto 版に戻す → push → 自動デプロイ
4. storefront / medusa-backend 両方を Restart
5. Slack `#all-paradigm` に `🚨 Crossmint 本番ロールバック実施 — 原因: {...}` を投稿

### 5.8 サインオフゲート（一般公開判断）

スモークテスト（§5.6）1件成功だけで一般公開しない。以下を満たしてから SNS・SEO等で流入を開始:

- [ ] $1 テスト注文を **3件連続成功**（自分1件 + チームメンバー2件など）
- [ ] 3件全てで §5.6 の10項目チェックが全て通過
- [ ] 3件目から 24時間放置して不整合（Webhook遅延 / 在庫ズレ / メール遅延）が発生しないことを確認
- [ ] Sentry / Coolify logs で Crossmint 関連のエラーが0件

全てクリアしたら Drop #1 の SNS 告知を開始。

---

## <a id="cm-6"></a>6. トラブルシューティング

| 症状 | 原因 | 対処 |
|------|------|------|
| Webhook 401 | HMAC 不一致 | `CROSSMINT_WEBHOOK_SECRET` が storefront/medusa 両方で同じか確認 |
| `CrossmintPayButton` 表示されない | `NEXT_PUBLIC_CROSSMINT_CLIENT_ID` 未設定 | Coolify 環境変数を再確認し再デプロイ |
| オーダーが Medusa に入らない | Webhook URL 間違い | Crossmint ログで delivery status 確認 → リトライ送信 |
| USDC が届かない | ウォレットチェーン不一致 | Polygon/Solana/Base いずれか選択時の受取アドレス確認 |
| 本番切替後もmailtoボタンのまま | `CrossmintPayment.tsx` の差し戻し忘れ（§5.4 未実施） | コンポーネントを`<CrossmintPaymentElement>`版に差し替えて再デプロイ |
| 本番切替後にSandboxキーで決済試行 | `CROSSMINT_ENV=staging` のまま放置 | storefront の環境変数で `production` に修正＆Restart |
| 決済成功するが在庫減らない | Webhook Primary が 200 を返しているが Medusa subscriber が未発火 | `medusa-backend/src/subscribers/order-placed.ts` のログで受信確認。Backup URL経由の場合は storefront → Medusa の転送経路も確認 |
| 紹介報酬が `issued` に flip しない | ship ルート (`/api/orders/[id]/ship` または `/admin/orders/[id]/update`) の非同期 try/catch でサイレント失敗 | Coolify storefront logs で `[referrals/flip]` / `[orders/ship] referral flip failed` を grep。`sericia_referral_redemptions` を直接SQLで更新して復旧 |
| 本番で二重課金の疑い | `(code_id, order_id)` unique 制約があるので二重紹介登録は不可、だが Crossmint 側の二重決済は可能性あり | Crossmint Console の order detail で duplicate charge 確認 → カスタマーサポート申請 + Stripe 側 refund 実施 |
