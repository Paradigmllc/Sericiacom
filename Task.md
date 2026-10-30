# Task.md — Sericia (multi-agent edition)

> 永久ルール **TASK / TASK-CLEAN / ANTI-BLOAT / TEAM-DEV** 準拠 (Global CLAUDE.md).
> 新規 Task.md (2026-05-08 TEAM-DEV protocol 適用時に Sericia でも作成).
>
> **🛡️ TEAM-DEV 協業プロトコル** (Claude Code/Codex/Cline/Cursor/Aider/human が並列開発):
> 1. 着手前に必ず `git pull --rebase` で最新化
> 2. 該当 task の **Owner** を自分の名前 + **Lock-since** に時刻 → 即 `commit + push` (atomic lock)
> 3. 4h+ 無 update の lock は **stale** 扱い → 他 agent override 可
> 4. 1 task = 1 feature branch (`agent/{owner}/{slug}`)
> 5. 完了 → Status=✅ DONE / Owner=- / Notes に commit hash → push (lock 解放)
> 詳細 → `~/.claude/knowledge/team-dev-protocol.md`

---

## CURRENT STATUS / Active Handoff — 2026-10-30 ブランド・商品分類の非公開配備確認済み

- Owner: Codex。runtime `f5266075` / PR4 draft。日本製品全般のホーム・ブランド紹介、Medusaカテゴリ（器・生活用品・文具・布製品・ギフト等）、商品カード実画像/欠落表示を実装。架空drop/在庫/価格/48h発送、固定USD、根拠のない人気表示を除去。配送・返品は準備中表示。
- 実API検証でカテゴリ取得漏れ（`*categories`が必要）とPDPの旧Supabase drop依存を発見して修正。検証商品でdesktop/mobileのホーム→カテゴリ一覧→PDP/JPY1200を確認。検証商品・一時カテゴリ削除後、実商品6件すべてdraft、ホーム空状態を再確認。
- CI41017175479/41017175474成功。型チェック・8unit・build・監査gate・16browser通過。配備先も独立SSH接続へ切り替え後16件(2.0m)通過。途中のECONNRESET/遅延は記録済み、サーバー内HTTP200/0.03秒・再起動0/OOMなし。PDP配信JS SHAとcontainer一致。
- 倉庫は未契約とユーザーが確認。Locations/OPENLOGIは候補のみ。公開ShopifyはHTTP200/Shopify markupを確認し維持。仕入先権限/在庫同期、倉庫/SNS実接続、決済・注文完了、運用adapter、残存旧コンテンツ/多言語、公開切替は未完。商用開始とは扱わない。
- 非公開プレビュー: http://127.0.0.1:18001/ （このPCのSSH接続中のみ）。旧18000接続で不安定だったため独立経路へ変更。有料plugin/依存追加なし。root空き10.79GiBで余力は限定的。不合格候補2a104c88/545bd78eの未使用imageだけ削除、SHA確認済みarchiveと旧9b5e0592 rollback image保持。
- 詳細: [Catalog migration](docs/knowledge/sericia/catalog-migration-20261030.md)。実決済・顧客送信・実発送なし。

## CURRENT STATUS / Active Handoff — 2026-10-30 Medusa checkout非公開配備・実API検証済み

- Owner: Codex。runtime9b5e0592、PR4。商品variant選択・カート・住所・送料をMedusaへ接続。cart version3は旧ブラウザキャッシュのみ破棄。価格/税/割引/creditはサーバー値、最新在庫のbatch照合、Origin/入力サイズ/数量検証、HttpOnly cookie、住所変更後の送料再選択を実装。
- CI41003742878/41003742827成功。7 unit tests、型チェック、本番build、desktop/mobile12件通過。配備先でも12件(1.3m)、checkout JS SHAとイメージ一致。実APIでJPY1200×2=2400、検証用送料800、合計3200、cart再利用、在庫減少409を確認。
- 実API検証でMedusa標準応答にitems.totalがない問題を検出し、全cart操作に明示fields指定を追加。失敗を隠さず修正して再配備。実商品6draft/実在庫level0/配送option0/fulfillment set0/注文0へ復帰をDB確認。架空情報の検証cart3件は監査用に保持。実送料/倉庫サービス接続を証明するテストではない。
- 公開はShopifyのまま。支払・注文完了、現行ブランドの全面移行、運用adapter、仕入先/倉庫/SNS実接続、公開切替が未完。倉庫は未契約とユーザーが確認（2026-10-30）。Locations/OPENLOGIは候補のみ。決済申請を代行済みとは扱わない。
- 不合格候補9bbcd829の未使用Docker imageのみ削除し、SHA検証済みarchiveを保存。旧73fb662f imageと各archiveは維持。root空き12.76GiB、volume空き18GiB。元worktree既存変更は保持。
- 詳細: [Checkout migration](docs/knowledge/sericia/checkout-migration-20261030.md)。localhost18000のSSHトンネルは独立接続へ更新。外部公開URLではない。

## CURRENT STATUS / Active Handoff — 2026-10-29 Storefront非公開配備・実画面検証済み

- Owner: Codex。作業先は引き続きmedusa migration worktree / PR4。商品一覧・詳細・検索・お気に入り・閲覧履歴・cartでprice+currencyへ統一。Medusa v2金額の100分の1変換を削除し、regionの実通貨・calculated_priceを使用。
- 非公開Medusaに一時検証商品を作成し、実Store APIでJPY1200/在庫0を確認後削除。既存6下書きの公開変更なし。旧USD注文経路は非USDを503で拒否、UIも非USD決済を無効化。
- Crossmint UI/SDKを除去、旧create/webhookは410で無副作用。履歴DBは変更なし。
- Next16.4.3 / Payload3.92.1 / Node24.22.1以上へ更新。StripeSDKは22.1.1固定でAPI契約を維持。ローカル4テスト・型チェック・本番build通過。監査high/critical0、moderate5/low12残存。Playwright desktop/mobile6件がローカル・CI・配備先で通過。CI40871577555/40871577480成功。storefront73fb662fをlocalhost18000へ配備しhealthy、実配信JS SHA一致を確認。
- 配備後root93%/空き12GiB、専用volume空き18GiB。容量の余力は限定的。公開Shopify、実商品6下書き、実注文/決済なしを維持。ローカルSSHトンネル http://127.0.0.1:18000 で確認可能（接続中のみ）。
- 詳細: [Storefront migration](docs/knowledge/sericia/storefront-migration-20261029.md)。公開Shopify切替/解約はまだ行っていない。

## CURRENT STATUS / Active Handoff — 2026-10-29 Store API検証・反映済み

- Owner: Codex。PR4 runtime8630c832を非公開環境へ配置。CI40839700759成功、配布ZIP digest照合、更新前DB backup、標準workflowによるpreview channel/JPY region/公開APIキー設定を2回実行して重複なし。
- 実環境Store API検証成功: APIキー必須、下書き非公開、JPY cart、channel範囲、決済providerなし、未割当商品追加拒否、失敗後cart itemなし。空の検証cartを1件作成、注文/決済なし。
- 管理者を初回作成し認証200/Admin商品取得200、6下書きを確認。ランダムpasswordはmacOS Keychain `Sericia-Medusa-Preview-Admin` にのみ保管。既存ログイン情報は変更なし。ブラウザ認証後のE2Eは未実施。
- server healthy / worker running / localhost19000 health200。新イメージ8bdbcba3dc88、runtime script SHAとアーカイブSHAは詳細資料参照。6draft/在庫level0を維持。
- 次: 旧storefrontの価格単位/通貨と独自注文経路を修正・移行、現行ブランドUIを接続、運用OS adapter、R2画像、仕入先/倉庫/SNS実接続、Cloudflare公開切替。公開はShopifyのまま、解約未実施。root90%の容量制約も残る。

## CURRENT STATUS / Active Handoff — 2026-10-29 Medusa非公開プレビュー稼働

- PR4 draft: https://github.com/Paradigmllc/Sericiacom/pull/4 。runtime1ae48492、compose50f4ff62。新しい20GB volume107303029上に独立PostgreSQL/Redis/データを配置し、Medusa server/workerをlocalhost19000で稼働。公開サイトはShopifyのまま。
- 実商品6下書き/13variant/JPY価格13/売越0/在庫レベル0を確認。再インポート重複なし、バックアップ復元6/13/13・再起動health200・匿名Admin401・ブラウザログイン画面・配信HTML/image hash一致まで検証。管理者ログインは未設定/未検証。
- 追加費用: ユーザー承認済み20GB=USD1.534/月。Cloudflare Workers Paidは既存契約。R2 bucket作成/読み書きテスト済み、実画像は未投入。Stripe/メールは無効。
- rootディスクは90%/空き15GiB、専用volumeは空き19GiB。データ容量は確保したがroot余力は別の制約。既存DB/バックアップを移動・削除していない。
- 次: storefront/購入経路、運用OSのMedusa接続、管理認証、画像配信、仕入れ/倉庫/SNSの実接続、最終切替/Shopify解約。商用運用や移行完了とは扱わない。

## CURRENT STATUS / Active Handoff — 2026-10-29 Medusa移行着手

- ユーザーがShopify月額予算不可のためMedusa + Stripe + Cloudflareへの移行を承認。Cloudflare課金を許可。有料プラグインは採用しない。
- Owner: Codex。作業先 `/Users/apple/dev/sericia-medusa-migration`、branch `codex/sericia-medusa-migration`。元worktreeのTask.md変更/GEMINI.md/opencode.jsonは保持。
- 構成: 既存 `medusa-backend/` を更新し、商品/注文/在庫はMedusa標準DB/API/Adminを利用。Stripe標準provider、R2標準S3 provider、Redisの永続イベント/ロックを使用。既存storefrontの購入経路は別途Medusa標準cartへ移行が必要。
- UI方針: 現行の日本製品/海外向けブランドを維持、管理UIはMedusa標準を利用。旧Crossmint注文作成経路を廃止。新規DBに段階移行し既存データを上書きしない。
- Cloudflareログイン/CLI確認済み。Workers Paidは既存契約（月額5 USD+従量）。新規プラン購入なし。
- R2 `sericia-product-media` 作成/空を確認。Shopify商品6/variant13を非公開ファイルへ退避、JPY維持の下書き移行プランを作成。12テスト・型チェック通過。backend/admin build通過、Docker/DB/商品再インポートCI40828641186通過。PR4 draft。
- 詳細: [Medusa migration](docs/knowledge/sericia/medusa-migration-20261029.md)。依存監査high/critical/moderate0、low9は残存。注文メールはプレビューで無効。
- 共有サーバーはディスク89%/空き17GB。旧専用ホスト46.62.217.172はSSH接続timeout。ユーザーが追加20GB/月額USD1.534を許可し、volume107303029を作成・専用パスへmount済み。既存DB/バックアップは変更なし。非公開プレビュー配置中、本番切替・Shopify解約は未実施。
- 決済申請、仕入先API権限、倉庫契約/API、SNS認証は未解決。今回の基盤変更で実務運用完了とは扱わない。


## 🔄 進行中 (multi-agent ロック付き)

| Status | Owner | Lock-since | Branch | Task | Notes |
|--------|-------|-----------|--------|------|-------|
| ⚪ AVAILABLE | - | - | - | (現状なし) | 既存 task は CLAUDE.md s5 ロードマップ参照 |

---

## 📋 未着手 (Multi-agent 取り合い可・優先順)

| Priority | Status | Owner | Task | 工数 | Branch (推奨) |
|----------|--------|-------|------|------|---------------|
| **HIGH** | ⚪ AVAILABLE | - | **F70 + F72 — operator actions (一括): CF sericia.com zone 用 API token 発行 (2 fixes)**: 現 token `cfut_kHbGH...` は appexx.me scope のみ。新 token (Zone:Cache Rules + Zone:Settings:Edit / sericia.com zone) を発行して以下を一括実行。**[A] F70: Auto Minify HTML → OFF** — Cloudflare が DOCTYPE + `<html>` タグを strip (curl bypass で proper HTML 返却確認済 / CF 経由のみ `<meta charSet>` から始まる). **[B] F72: Cache Rule に locale paths 追加** — `/ja` `/de` `/fr` 等が CF DYNAMIC (Next.js ISR が `Cache-Control: private` を emit → CF キャッシュ不可). **前提条件 F71+F71b は 2026-05-13 11:57 JST LIVE 確認済** (deploy `biabxd49bl6jxvzvzix9gkyr` finished / `/ja` に `Cookie: NEXT_LOCALE=ja; country=jp` を送るとレスポンスに Set-Cookie 無し・no-transform 無し → CF キャッシュ可能状態). 手順: `CLOUDFLARE_API_TOKEN=<new_token> node scripts/apply-cloudflare-cache-rules.mjs` — スクリプトが [A][B] を一括実行 (Zone:Cache Rules:Edit + Zone:Settings:Edit 両方必要). 完了後: `/ja` `/de` 等が CF HIT 0.07s / Playwright E2E の React #418 も解消. | 30min + token 発行 | `agent/{X}/f70-f72-cf-operator` |
| (要起票) | ⚪ AVAILABLE | - | Drop #1 ローンチ準備 | (CLAUDE.md s5 参照) | `agent/{X}/drop1-launch` |
| (要起票) | ⚪ AVAILABLE | - | pSEO Engine 量産 | (POSS Sericia 参照) | `agent/{X}/pseo-engine` |
| (要起票) | ⚪ AVAILABLE | - | Push PWA + Referrals | (POSS Sericia 参照) | `agent/{X}/push-pwa` |
| (要起票) | ⚪ AVAILABLE | - | Arabic RTL 対応 | (i18n RTL) | `agent/{X}/arabic-rtl` |

> 詳細 task は CLAUDE.md s5 (ロードマップ・PMF) + `~/.claude/knowledge/poss-sericia.md` 参照. 着手時にこの Task.md に行を移動して lock 取得.

---

## ✅ 完了 (直近 14 日)

| 完了日 | Owner | Task | Commit |
|--------|-------|------|--------|
| 2026-05-13 | claude-code | **F71b — middleware: remove no-transform cache-control (was blocking CF locale caching)**. `NextResponse.rewrite()` responses (all /ja/* /de/* etc) keep middleware headers through to CF — setting `no-transform` without max-age caused CF to mark all locale pages DYNAMIC. `NextResponse.next()` responses (/) have headers overwritten by page handler, so `no-transform` wasn't reaching CF anyway. Removed the injection entirely: locale pages can now get CF edge cache HIT on repeat visits; F70 (CF Auto Minify HTML disable) remains sole definitive fix for DOCTYPE stripping. | `24834483` (main) |
| 2026-05-13 | claude-code | **F71 — middleware: locale cookie conditional set (CF caching for /ja /de etc)**. `Set-Cookie: NEXT_LOCALE=ja` が毎リクエスト無条件に送出されていた → CF が全 locale-prefix path (/ja/* /de/* 等) を DYNAMIC 扱いしキャッシュ不能だった問題を修正. `req.cookies.get(LOCALE_COOKIE)?.value !== prefixLocale` guard を追加し cookie 値が既に正しければ Set-Cookie header を省略. 初回訪問・locale 切替時は引き続き設定 / リピート訪問は CF edge cache HIT 化 → TTFB 0.07s (vs cache miss ~0.6s). `country` cookie と default locale パスは既に同等 guard を持っていたため統一. | `e09096d1` (main) |
| 2026-05-13 | claude-code | **F69-followup — close remaining i18n gaps**. ContentSidebar.tsx (Shop the story / Drop alerts / Tools / Guides + aria-labels + subscribe toast) / AccountNav.tsx (panel title + nav items + Sign out + signed-out toast, new `common.account_nav.*` namespace with 4 keys × 9 locales via DeepSeek V4 cached batch = $0.000812) / CheckoutForm.tsx legacy (7 labels + 7 placeholders + 4 toasts via shared `cart.checkout_extras.*`). **i18n status**: 220/220 verified keys present across all 10 locales, 0 missing. Customer-facing i18n surface now complete. Remaining hardcoded EN is limited to: admin/* (intentionally English-only), Zod validation messages (low-priority, only on validation failure), `content_sidebar` heading "Reading tools & related" + `Privacy Policy`/`Terms` link text (mostly fine since `/terms` and `/privacy` are localised pages). | `ebd9a5ca` (main) |
| 2026-05-13 | claude-code | **F69 — Performance + i18n comprehensive sweep**. **Perf (4 fixes)**: ① middleware の `supabase.auth.getUser()` を `/account/*` パスに gate (ゲスト全ページ TTFB -100〜300ms) ② middleware の response に `Cache-Control: no-transform` append (F68 root-cause = CF Auto Minify が DOCTYPE+html strip と確証取得 via `curl -k -H "Host: sericia.com" https://46.62.217.172/` 直接 origin probe で proper DOCTYPE 返却を確認) ③ `<DeferredOverlays>` で DifyChat/Analytics/CookieConsent/SocialProofToastGate/ServiceWorkerRegister を `lazy()` + `requestIdleCallback` 2s post-paint mount (TTI -500〜1500ms / 14 eager client components → 5 idle-mounted) ④ Noto Sans JP `preload: false` + locale=ja 以外で CSS variable 省略 (preload signal -110kB on 90% traffic). **i18n sweep (60+ strings × 10 locales)**: 5-pattern grep で hardcoded English を機械的検出 → DeepSeek V4 cached batch で 20 namespaces 翻訳 (8064 cache-hit / 4866 miss / 17324 completion tokens / **$0.0056 total**) → 15+ components wire-up (home/products/PDP/cart/checkout/Waitlist/Footer/NotifyMe/PushOptIn/journal/compare/uses/CartDrawer/BackToTop/AddToCartButton/CartClient). 新 namespaces: `home_sections.spec` / `products.listing_extras` / `pdp.extras` / `journal.listing` / `compare.sections` / `uses.sections` / `forms.{waitlist,footer_subscribe,notify_me,push_optin}` / `cart.checkout_extras` / `common.{sidebar,a11y}`. **CLAUDE.md 圧縮 (CEP rule)**: 95KB → 24KB (75% 削減 / 60KB 目標を大幅クリア)、s14 壁打ちメモ + s15 F1-F69 実行トラッカーを `docs/knowledge/poss-sericia-implementation.md` (78KB) に外出し. **Follow-up**: F70 = CF Auto Minify HTML を dashboard で OFF にする operator action (no-transform header は belt-and-suspenders、確実な fix は zone setting 変更). | (this commit) |
| 2026-05-10 | claude-code | **F67-FOLLOWUP — Stripe pk_live typo `O→0` + 本番 LIVE 検証完了** — `Invalid API Key provided: pk_live_***...IUBe` の根本原因が **メモリ保存値 position 68 の 'O'(大文字O) vs '0'(数字) 転記エラー**だったと特定 (Stripe API 直接 probe で `O` 版 → 401 / `0` 版 → 200 + `acct_1RnwKMEU4EEn0nZ8` 解決 を確証). Coolify env PATCH (UUID `ew443ikv9v5gotjom8fjrypm`) で正値投入 + `SEED_PAYMENT_SETTINGS_RESET=1` 一時投入 → fresh deploy `y10fmbyx8ghc0gknsw5u5ra1` finished → reset env 削除完了. **本番 E2E 自動検証 11/11 PASS** (JA strings 5/5 present + EN 漏洩 5/5 absent + `/api/stripe/create-intent` が `jNW0A4` 含む正 pk 返却 + PaymentIntent `pi_3TVShgEU4EEn0nZ81gcrcL7R` 発行成功 + Playwright で `Invalid API Key` console error 完全消失確認). 別途 site-wide SSR hydration 欠落 regression を発見 → F68 として未着手キューに起票 (real browser tolerant のため F67 検証完了は阻害せず). | (env+infra ops, no commit) |
| 2026-05-10 | claude-code | **F67 — /pay i18n drift 根治 + ハイブリッド CMS+next-intl resolver** — ユーザー報告のスクショ (`/pay/[orderId]` で JA 切替時に header 英語 / widget JA / footer 英語の partial-translation) を根治. 二層原因 ① 8 locale (de/fr/es/it/ko/zh-TW/ru/ar) で `pay` namespace 全文未翻訳 (英語コピペ放置) → 12 keys × 8 locales = 96 翻訳追加 ② Payload PaymentSettings global の `fallbackLocale: "en"` で seeded EN 値が JA/DE/FR を覆い隠していた → `fallbackLocale: false` に変更 + 4 新キー (eyebrow/heading/subhead/confirmation_line_fmt) × 10 locales 追加 + `lib/payment-settings.ts` を hybrid resolver に refactor (CMS > next-intl > hardcoded EN). seed script は localised text fields を空文字 seed に変更し editor の CMS 上書き flexibility は完全保持. 別途 reported Stripe `Invalid API Key pk_live_***...IUBe` は env credential mismatch (sk_live_* と pk_live_* が同 Stripe account 由来かを Coolify 側で要確認) — code 修正不可・operator action として別記載. | `15b611c5` (worktree) → `42ccc257` (main) — deploy `x16yhpqwl662i6de18wtix5u` 監視中 |
| 2026-05-10 | claude-code | **F58–F66 大規模 i18n 完全撲滅 + Stripe primary rail ✅ 本番 LIVE** — 1 セッションで以下全件完遂. ① **F58** Stripe live primary 化 (Crossmint pivot) → webhook + Apple Pay/Google Pay/Link/PayPal 全 active / ② **F59** PaymentElement onReady gate (Pay 押下 race fix) / ③ **F60** PDP accordion + /pay i18n / ④ **F62** E2E audit script v2 / ⑤ **F63** /account/page + /account/addresses + AddressForm i18n / ⑥ **F64** /account/orders + /account/wishlist i18n + 5 toast 翻訳 / ⑦ **F65** /account/orders/[id] + /account/settings + SettingsForm i18n / ⑧ **F66** /account/referrals UI wire-up. **9 customer-facing pages × 10 locales × 170 keys = 1,700 翻訳項目** すべて DeepSeek V4 cached batch で完了 (cost <$0.01 USD). **Final E2E audit: 49/49 PASS / 0 fail** / モバイルヘッダー overflow 修正同梱 / Hetzner OOM exit 255 リトライ自動化 (10 deploy 試行・最終 d10 finished `twey1ecx647yqnjd2bsaseyh`). | `6cddf3e3` (F58) → `c6d12e51` (F59) → `e8f0ff6c` (mobile UI + apiVersion) → `51a73859` (StripeError type) → `7ce06866` (F58 LIVE doc) → `c6d12e51` (F59 onReady) → `20007c22` (F60 i18n) → `f79b63df` (F62 audit) → `957a7ec7` (F63) → `7c3454c7` (F64) → `b43c935a` (F65) → `22c66973` (F66) on main |
| 2026-05-08 | claude-code | **Task.md 新規作成** (TEAM-DEV protocol 適用) | (TEAM-DEV commit) |

> 過去履歴は `git log` 参照. 14 日経過で `docs/handoff-archive/` に自動移動 (post-task-md-auto-archive hook).

---

## 📦 詳細外出し (このファイルから参照)

| 種別 | 参照先 |
|------|--------|
| **TEAM-DEV 協業プロトコル詳細** | `~/.claude/knowledge/team-dev-protocol.md` |
| **CEP / Anti-Bloat / 永久ルール** | `~/.claude/CLAUDE.md` |
| **Sericia 実装ディテール (D2C / 訳あり日本クラフト食品 / Medusa+PayloadCMS+Crossmint+Dify+n8n)** | `~/.claude/knowledge/poss-sericia.md` |
| **業界知識・ノウハウ** | `~/.claude/knowledge/{topic}.md` |

---

## 🔧 環境情報 (毎セッション参照価値あり)

- **ドメイン**: sericia.com
- **スタック**: Medusa v2 + PayloadCMS + Crossmint + Dify + n8n + Push PWA + pSEO Engine + Referrals + Arabic RTL
- **Coolify UUID**: (CLAUDE.md s10-1 参照)
- **DigitalOcean Droplet**: `555590454` (4vCPU/8GB SGP1・appexxme/paradigm-hp と共有)
- **Supabase**: 独立 project (CLAUDE.md s8 参照)
- **Dify**: 🚨 **Cloud 版 api.dify.ai のみ** (DIFY-CLOUD-ONLY 永久ルール)
- **デプロイ**: trigger ≠ 完了 (DEPLOY-VERIFY 永久ルール) / Background poll + auto-retry max 3
