# Sericia — プロジェクトコンテキスト

## 📊 進捗ダッシュボード（目次）

| 進捗 | # | セクション | 状態メモ |
|------|---|-----------|---------|
| ★★★★☆ | 1 | [🎯 事業概要](#s1) | 設計確定 |
| ★★★☆☆ | 2 | [🏆 競合・差別化](#s2) | Bokksu/Misfits Market比較済み |
| ★★★★☆ | 3 | [💰 ビジネスモデル](#s3) | 利益率・価格設計確定 |
| ★★☆☆☆ | 4 | [📊 財務KPI](#s4) | 粗利試算あり、目標KPI未設定 |
| ★★★☆☆ | 5 | [📈 ロードマップ](#s5) | Phase 1〜3定義済み |
| ☆☆☆☆☆ | 6 | [⚖️ 法的リスク](#s6) | 未着手 |
| ★★★★☆ | 7 | [🗺️ プロダクト設計](#s7) | Medusa v2+Next.js確定 |
| ★★★☆☆ | 8 | [⚙️ 技術設計](#s8) | スタック確定・デプロイ設定中 |
| ★★★☆☆ | 9 | [📣 GTM・集客](#s9) | Reddit戦略・SNS設計済み |
| ★★☆☆☆ | 10 | [🖥️ 運用](#s10) | 環境変数未設定 |
| ★★★★☆ | 11 | [💴 経費・収益シミュ](#s11) | 利益率計算済み |
| ★★☆☆☆ | 12 | [🌐 ドメイン・商標](#s12) | sericia.com取得予定 |
| ★☆☆☆☆ | 13 | [📚 リソース一覧](#s13) | 未整備 |
| ★★★★☆ | 14 | [🧠 壁打ち詳細メモ](#s14) | 仕入れTier/EMS最適化/非採用/Phase戦略 |

⚠️ **要強化**: 6(法的) / 10(運用) / 13(リソース)

---

## <a id="s1"></a>1. 🎯 事業概要

**一行定義**: 日本の訳あり/規格外クラフト食品を「Wabi-sabi Premium」に文脈変換して海外に限定ドロップ販売する情報非対称アービトラージ事業

**ブランド**: Sericia（シルクロード東端の古称 → 日本×東洋希少品の文脈）

**参照設計書**: `~/.claude/knowledge/business-idea-303-japan-craft-food.md`（全詳細）

**情報非対称の構造**:
```
日本側: 訳あり = 値引き・廃棄対象
西洋側: Irregular = Natural = Artisan = プレミアム
円安:   日本仕入れ価格が欧米比で1/5〜1/10
```

**採用モデル**: Supreme型限定ドロップ（在庫希少性×FOMO設計）

---

## <a id="s2"></a>2. 🏆 競合・差別化

| 競合 | 弱点 | Sericiaの差別化 |
|-----|------|--------------|
| Bokksu ($40M+ ARR) | 固定Box・高コスト | 限定ドロップ・在庫リスクゼロ |
| Misfits Market | 米国内物流のみ | 日本直送・円安活用 |
| Amazon JP直接購入 | 英語UI・送料複雑 | キュレーション×ストーリー |

**モート**: Amazon USに存在しない商品のみ扱う → 情報優位性がそのままモートになる

---

## <a id="s3"></a>3. 💰 ビジネスモデル

### 価格設計（確定）

```
商品単価:  $58〜65（商品ごと）
送料:      $18（USA / EU / AU）
送料無料:  $200以上で無料
目標利益率: S tier 80%+ / SS tier 85%+
```

### 決済スタック（確定）

| ツール | 役割 |
|-------|-----|
| Crossmint | クレカ→USDC変換（2.5%のみ） |
| Tria / RedotPay | USDC→Visaデビット即時変換 |

### キャッシュサイクル

```
顧客決済(Crossmint) → USDC着金(数分) → Visaデビット → 仕入れ即日
立替不要・キャッシュサイクルほぼゼロ
```

### 利益率実績（¥155/$・Crossmint 2.5%込み）

| 購入パターン | 利益率 | Tier |
|------------|-------|------|
| 1個 + 送料$18 | 80.6% | S |
| 4個 + 送料無料 | 83.0% | S |
| 5個 + 送料無料 | 85.1% | SS |

---

## <a id="s4"></a>4. 📊 財務KPI

### 粗利試算

| フェーズ | 月販売数 | 月粗利 |
|---------|---------|------|
| Phase 1 | 20件 | ~$1,200 |
| Phase 2 | 100件 | ~$6,000 |
| Phase 3 | 500件 | ~$30,000 |

### 固定費（月額）

| コスト | 金額 |
|-------|------|
| Hetzner CPX22（Medusa） | €9.49 |
| EMS実費（変動） | 販売数×¥1,750〜¥3,100 |
| Crossmint手数料 | 売上×2.5% |
| **合計固定費** | **~¥1,500/月** |

---

## <a id="s5"></a>5. 📈 ロードマップ

| フェーズ | 期間 | 目標 | 主な施策 |
|---------|------|------|---------|
| Phase 1 | 0〜3ヶ月 | 月20件 | LP構築・Drop #1・Reddit集客 |
| Phase 2 | 3〜12ヶ月 | 月100件 | BASE直接交渉・n8n自動化・SNS拡大 |
| Phase 3 | 12ヶ月〜 | 月500件+ | FC委託・商社化・正規品ライン追加 |

---

## <a id="s6"></a>6. ⚖️ 法的リスク

> ⚠️ 要整備

- 食品輸出規制（植物性・乾燥品は原則問題なし）
- 各国通関（USA/EU/AU/CA の食品輸入基準確認要）
- 転売規制（KURADASHI等の利用規約確認済み）
- 古物商許可（不要・食品のため）

---

## <a id="s7"></a>7. 🗺️ プロダクト設計

### フォルダ構成（予定）

```
sericiacom/
├── CLAUDE.md                    ← このファイル
├── medusa-backend/              ← Medusa v2（Hetzner CPX22）
│   ├── medusa-config.ts
│   └── src/api/crossmint-webhook/
└── storefront/                  ← Next.js（Cloudflare Pages or Coolify）
    ├── app/
    │   ├── page.tsx             ← ドロップLP
    │   └── api/webhook/         ← Crossmint Webhook
    └── components/
        └── CrossmintButton.tsx
```

### Drop #1 ラインナップ（確定）

```
「Irregular Japan Box」$95
  規格外煎茶    100g  仕入れ¥400〜648
  訳あり味噌    200g  仕入れ¥600
  規格外椎茸     50g  仕入れ¥500
総重量: 約450g / EMS: ¥2,150
```

---

## <a id="s8"></a>8. ⚙️ 技術設計

### スタック（確定）

| ツール | 役割 | 場所 |
|-------|-----|------|
| Medusa v2 | バックエンド・Admin・在庫管理 | Hetzner CPX22 |
| Medusa Admin | ドロップ管理・注文一覧（内蔵） | 同上 |
| Next.js | ストアフロント | Coolify or CF Pages |
| Crossmint | 顧客決済（クレカ→USDC） | 外部SaaS |
| PostgreSQL | 注文・商品DB | Hetzner（Docker） |
| Redis | キュー | Hetzner（Docker） |
| Coolify | サーバー管理UI | Hetzner CPX22 |

### インフラ（確定）

```
Hetzner CPX22: 2vCPU / 4GB RAM / €9.49/月
  IP: 46.62.217.172
  Firewall ID: 10867883 (sericia-fw)
  ポート: 22/80/443/8000(Coolify)/9000(Medusa)
```

### Crossmint × Medusa 統合（Option B: Webhookブリッジ）

```
Crossmint決済完了
→ POST /api/webhook/crossmint
→ Medusa Admin API で注文作成
→ 在庫 -1
→ Resend でメール送信
```

### 環境変数（実値はreference_api_keys.md参照）

```
DATABASE_URL=postgres://medusa:***@h128il6uh7sxdkb5s3w0vuz7:5432/medusa
REDIS_URL=redis://default:***@yau9i5yafa98tc8dm8ag5kmp:6379/0
JWT_SECRET=（Medusa生成時に設定）
COOKIE_SECRET=（同上）
CROSSMINT_API_KEY=（Crossmint dashboard取得）
RESEND_API_KEY=（Coolify設定済み・共通）
```

### Coolify構築済みリソース（2026-04-21）

| リソース | UUID | 状態 |
|---------|------|------|
| Server (This Machine) | `s2d9yizjphbvw93sg21l7wly` | ✅ reachable |
| Project sericia | `qnry7poqtz364qhgupfq4c0k` | ✅ 作成済み |
| PostgreSQL | `h128il6uh7sxdkb5s3w0vuz7` | ✅ instant_deploy |
| Redis | `yau9i5yafa98tc8dm8ag5kmp` | ✅ instant_deploy |
| Medusa Backend | 未構築 | 次回: ソースコードscaffold→GitHub push→Coolifyでデプロイ |
| Next.js Storefront | 未構築 | Medusa後 |

---

## <a id="s9"></a>9. 📣 GTM・集客

### Phase 1 集客（Reddit主軸）

| チャネル | 戦略 |
|---------|-----|
| r/JapaneseFood | 開封レビュー投稿・コメント誘導 |
| r/mildlyinteresting | 「変な形の野菜」系Wabi-sabiコンテンツ |
| r/Frugal | 「廃棄寸前を救った食品」切り口 |
| r/foodlossreduction | フードロス削減角度 |
| TikTok | 開封動画・日本農家紹介 |
| Instagram | Wabi-sabi美学ビジュアル |

### pSEO戦略（Phase 2〜）

```
/blog/wabi-sabi-food-japan
/blog/irregular-matcha-guide
/blog/japanese-artisan-miso
→ GEO（AI検索）最適化：TL;DR先出し・自社統計必須
```

---

## <a id="s10"></a>10. 🖥️ 運用

### 環境変数実値（Coolify設定）

> 設定後にここに記録する（APIキーは reference_api_keys.md 参照）

### 仕入れ自動化パイプライン

```
n8n cron(週次):
  Layer 1: KURADASHI/Otameshi スクレイピング
  Layer 2: BASE個人店 底値参照
  Layer 3: Amazon US 在庫チェック（不在のみ通過）
  → DeepSeek V3（$0.014/1M Context Caching）
  → Slack承認 → LP自動掲載
```

---

## <a id="s11"></a>11. 💴 経費・収益シミュ

→ 詳細は `~/.claude/knowledge/business-idea-303-japan-craft-food.md` s10/s10-2 参照

**Phase 1 目標**: 月20件 × $78平均 × 80.6% = **月粗利 ~$1,258**

---

## <a id="s12"></a>12. 🌐 ドメイン・商標

| 項目 | 状態 | 値 |
|-----|------|---|
| ドメイン | 取得予定 | sericia.com |
| Cloudflare Zone | 未設定 | — |
| SNS @sericia | 未取得 | Instagram / TikTok / X |
| GitHub | 作成済み | Paradigmllc/sericiacom |

---

## <a id="s13"></a>13. 📚 リソース一覧

| ツール | 用途 | URL |
|-------|-----|-----|
| Medusa.js | ヘッドレスコマース | https://medusajs.com |
| Crossmint | Web3決済 | https://crossmint.com |
| KURADASHI | 訳あり食品仕入れ | https://kuradashi.jp |
| BASE | 個人店底値参照 | https://thebase.in |
| Hetzner | サーバー | https://console.hetzner.cloud |
| Coolify | デプロイ管理 | http://46.62.217.172:8000 |

---

## <a id="s14"></a>14. 🧠 壁打ち詳細メモ（設計決定の根拠）

> 全詳細は `~/.claude/knowledge/business-idea-303-japan-craft-food.md` (941行)
> このセクションは「なぜそう決めたか」を他のエンジニア・将来の自分が読んで再現できる形で残したもの

### 14-1. 情報非対称アービトラージの構造

```
日本側: 訳あり = 値引き・廃棄対象
西洋側: Irregular = Natural = Artisan = プレミアム
円安:   日本仕入れ価格が欧米比で1/5〜1/10
────────────────────────────────
= 同じ物が「文脈変換」だけで5〜10倍の価格差
```

**英語フレーミング変換表**:
| 訳あり(日本語) | 英語プレミアム |
|-------------|------------|
| ラベル不備 | "Unlabeled Batch / Direct from Kura" |
| 規格外サイズ | "Artisan Irregular, Hand-selected" |
| 在庫過多 | "Limited Reserve, This Season Only" |
| 廃業前在庫 | "Final Vintage, Brewery Closing 2025" |
| 発酵過多 | "Extra-aged, Umami Intensified" |

### 14-2. 仕入れ先Tierマップ

| Tier | サイト | 特徴 | 取得方法 |
|------|-------|-----|---------|
| **S** | KURADASHI | フードロス特化・訳あり整理済み | Playwright |
| **S** | Otameshi | 訳あり・お試し専門 | Playwright |
| **A** | 楽天ふるさと納税 | **公式API** | Rakuten API ✅ |
| **A** | ふるさとチョイス | 最大規模80万点 | Playwright |
| **B** | 食べチョク / ポケマル | 農家直販 | Playwright |
| **底値参照** | BASE個人店 | KURADASHI比30-40%安いケースあり | Playwright |
| **スポット** | ジモティー | 無料〜格安 | 手動週1確認 |

⚠️ **KURADASHI神話の修正**: 常に最安ではない。コモディティ品（定番静岡茶等）はBASE個人店 < Amazon < KURADASHIのケースあり。**商品ごとに3サイト比較して最安値源泉を選択**する。

### 14-3. BASE個人店 送料無料閾値の最適化ロジック

```javascript
// 各店舗ページから送料条件を自動抽出→最適発注数を算出
function calcOptimalOrder(unitPrice, shippingFee, freeThreshold = 3000) {
  if (freeThreshold === null) {
    return { qty: 1, totalCogs: unitPrice + shippingFee };
  }
  const qty = Math.ceil(freeThreshold / unitPrice);
  return { qty, totalCogs: unitPrice * qty, unitCogs: unitPrice };
}
// 例: 煎茶¥648 × 5個 = ¥3,240（¥3,000超 → 送料¥0）
// → 実質単価 ¥648 / EMS ¥1,750 / $95販売 → 利益率 83.7%
```

**実証例（お茶の荻野園）**: 単品購入78.5% → 5個まとめ買い送料無料で**81.2%**（Tier A→S）

### 14-4. EMSブラケット × 購入数の構造的優位性

```
EMS重量ブラケット（100g商品+梱包材 ≈170g/個）:
  1個(170g)  → ≤250g → ¥1,750
  2個(340g)  → ≤500g → ¥2,150
  3個(510g)  → ≤1kg  → ¥3,100
  4個(680g)  → ≤1kg  → ¥3,100  ← 3個と送料同額！
  5個(850g)  → ≤1kg  → ¥3,100  ← さらに有利

→ "$200以上で送料無料" = 実質4個購入誘導
→ AOV自然増 + 1個あたり送料負担↓ + 利益率↑ の3点同時解決
```

### 14-5. n8n自動収集パイプライン（3層構造）

```
週次cron:
  [Layer 1: メイン訳あり品収集]
    Playwright → KURADASHI全商品 / Otameshi新着
    Rakuten API / Yahoo Shopping API

  [Layer 2: 底値参照（BASE個人店）]
    Playwright → BASE キーワード検索
    → calcOptimalOrder() で最適発注数・実質COGS算出

  [Layer 3: Amazon USフィルター（必須）]
    PA-API → Amazon US 同商品検索
    → 見つかった = 輸出優位性なし → スキップ
    → 見つからない = パイプライン続行 ✅

      ↓ DeepSeek V3（Context Caching 90%OFF・$0.014/1M）
      ↓ 英語説明+侘び寂びストーリー生成
      ↓ スコアリング（軽量×高単価×ストーリー×AmazonUS不在×利益率）
      ↓ 上位10件 → Slack承認 → Next.js LP自動掲載
```

### 14-6. 商品利益率ティア早見表

| Tier | 利益率 | 典型商品 | 条件 |
|------|-------|---------|------|
| 🥇 SS | 85%+ | 山椒+七味+出汁粉末キット / 昆布パウダー / 黒にんにく100g | 総重量≤250g & 仕入≤¥500 |
| 🥈 S | 80-85% | 抹茶粉末 / 乾燥椎茸 / 一味唐辛子 | 軽量×プレミアム |
| 🥉 A | 75-80% | 煎茶葉 / 梅干し乾燥型 / 番茶 | 中量定番 |
| B | 70-75% | 現行Drop#1（煎茶+味噌+椎茸） / 味噌300g | 重め |
| ❌ OUT | <70% | 酒類 / 液体醤油 / 生鮮 / 動物性だし | 構造的不可 |

> **重量削減 > 仕入れ値削減**。送料固定コスト削減のほうが値引き交渉より利益率インパクトが大きい。

### 14-7. 決済・キャッシュフロー設計

```
顧客: クレカ/Apple Pay (摩擦ゼロ)
  ↓ Crossmint (2.5%手数料のみ)
USDC着金(数分)
  ↓ Tria/RedotPay Visaデビット(即時)
  ↓
仕入れ(Visa加盟店なら即日)

キャッシュサイクル: ほぼ0分 / クレカ不要 / 立替初回¥2〜3万のみ
```

**Stripe/Shopifyを採用しない理由**:
- Stripe: 7日ローリング入金 → キャッシュフロー問題
- Shopify: Crossmint(外部決済)に2%追加手数料
- Crossmint: 2.5%のみ・チャージバック低減・グローバル対応

**Crossmint審査タイムライン**: Sandbox即日 / 本番(物理商品)1週間前後 → Sandbox開発と審査を並行

### 14-8. Medusa採用の根拠（スクラッチから転換）

スクラッチ比 **工数▲2.5日削減**。Admin・在庫・注文管理がゼロコストで付属。

| ツール | 役割 | 工数 |
|-------|-----|-----|
| Medusa v2 | 商品・在庫・注文管理バックエンド | 1日 |
| Medusa Admin | ドロップ管理・注文一覧・在庫更新（内蔵） | 0日 |
| Next.js | ストアフロント（Medusa starter流用） | 0.5日 |
| Crossmint Button | 顧客決済 | 0.5日 |

**Crossmint × Medusa 統合はOption B（Webhookブリッジ）採用**:
- AbstractPaymentProvider実装（Option A）は工数+2日で割に合わない
- Crossmint決済はMedusa外で完結 → 複雑さゼロ
- Medusaは「Admin/在庫管理専用」として割り切る

```
[顧客] → Crossmint決済完了
       → POST /api/orders/crossmint-webhook (Next.js)
       → Medusa Admin APIで注文手動作成
       → 在庫 -1
       → Supabaseにミラー（バックアップ）
       → Resendで発送メール
```

### 14-9. 対象国Tier

| Tier | 国 | 理由 |
|-----|---|-----|
| **即日開始** | 米国・カナダ・UK・シンガポール | 英語圏・小ロット通関実績豊富 |
| **3ヶ月後** | オーストラリア・香港・台湾 | 実績積んでから |
| **検討** | UAE等中東 | 醤油除外セット限定 |
| **永久除外** | EU・韓国 | EU農薬基準 / 韓国福島規制 |

**FDA Prior Notice（米国）の運用実態**: 建前は事前通知必要だが、B2C小パッケージ（個人消費量）は実務上ほぼスルー。止められても返送 or 廃棄（初回は罰金なし）。植物性・乾燥・密封品限定でリスク最小化。

### 14-10. 賞味期限の輸出可否ルール

EMS発送〜顧客手元まで最短10〜20日。残存期限が短い商品は輸出不可。

| 商品カテゴリ | 最低残存期限 |
|------------|-----------|
| 抹茶・山椒・粉末類 | 3ヶ月以上 |
| 乾燥椎茸・昆布 / 煎茶葉 / 味噌密封 | 4ヶ月以上 |
| 梅干し | 6ヶ月以上 |

→ セカンダリー残り1〜2ヶ月品は輸出不可。残り3〜6ヶ月品を厳選する。

### 14-11. フェーズ別モデル進化

```
Phase 1: 転売屋 (0〜3ヶ月・月50件)
  KURADASHIで買って海外で売る（手動・小規模）

Phase 2: バイヤー (3〜12ヶ月・月300件)
  販売実績を武器にKURADASHI出品者へ直接コンタクト
  「次の余剰品が出たら優先連絡を」
  n8n: 生産者リスト自動収集 + DeepSeek V3 個別化メール

Phase 3: 商社 (1年後〜)
  複数メーカーと継続契約・優先仕入れ確保
  訳あり品から通常品の輸出代理まで拡大
  廃業メーカー在庫競売（Yahoo官公庁オークション）定期監視
```

**Phase 2 直接交渉のWin-Win構造**:
```
KURADASHI経由: 定価¥1,000 → 販売¥400 → 生産者取り分 ¥200〜280
直接取引:     定価¥1,000 → こちら買取¥350 → 生産者取り分 ¥350
→ 生産者: PF手数料節約(Win) / こちら: 仕入れ30-50%削減(Win)
```

⚠️ **PF上での直接取引勧誘はNG（BANリスク）** → KURADASHIで実購入→購入後に公式サイト/SNS経由で「継続取引の相談」として連絡する。

### 14-12. 非採用アイデアと理由（重要）

| アイデア | 非採用理由 |
|---------|-----------|
| マーケットプレイス型 | 生産者自走不可→ポータル化→モートゼロ |
| サブスクBox型 | 安定供給不要・選べない不満・チャーン |
| 問い合わせ形式 | バイパスされて収益なし |
| 生産者直取引(初期) | 交渉コスト高・即日開始不可（Phase 2送り） |
| Shopify | Crossmint追加手数料2%・¥100K/月損失 |
| Stripe | 7日入金待ち・キャッシュフロー問題 |
| EU市場 | 農薬基準・VAT・GDPR・複雑度高 |
| 酒類・ワイン | EMS禁止+FedEx15kg¥22,000+各国規制→最大40% |
| 重量液体（醤油大瓶） | EMS制限→60%以下 |
| 野菜・果物 / 生鮮 | 鮮度+検疫 |
| 鰹節・動物性だし | 検疫リスク |
| セカンダリー以降格安 | フードバンク行き（非営利）=購入不可 |
| FC(初期) | 月50件未満は自己発送で十分 |

### 14-13. 成功モデル参照

| 企業 | 学び |
|-----|-----|
| Bokksu ($40M+ ARR) | キュレーション=商品。だが**固定Boxは採用せずドロップ型に** |
| Misfits Market ($1.1B) | 規格外=プレミアム先行事例 |
| Natural Wine | 「濁り=無濾過=本物」で高単価化（侘び寂びと同構造） |
| Supreme | ドロップ型FOMO設計（安定供給不要・在庫リスクゼロ） |

**採用モデル**: キュレーションBox型ではなく**限定ドロップ型**
- 理由: 安定供給不要・FOMO自然発生・在庫リスクゼロ・選べない不満なし

### 14-14. Phase 1 Week別タスク

```
Week 1:
  ✅ Crossmint Sandbox作成
  ✅ 特商法ページ + Privacy Policy（Termly.io自動生成）
  ✅ Next.js LP + Crossmint埋め込み
  ✅ Coolifyデプロイ

Week 2:
  ✅ KURADASHI等で商品実物確認・仕入れ値確定
  ✅ 英語商品ページ・ストーリーライティング
  ✅ Reddit / Steepster / TeaChat 3コミュ投稿
  ✅ 無料サンプル5名告知（Zappos型リーチ）

Month 1-3:
  ✅ 初回ドロップ: 12ユニット限定 $95
  ✅ EMS自己発送で学習
  ✅ 売り切れ→メーリングリスト構築
  ✅ 2回目ドロップ告知
```

**初回ドロップ告知テンプレ**:
```
"Japan's artisan breweries are closing.
Their 'irregular' batches were going to waste.

I'm sourcing them directly and shipping worldwide.
150-year-old miso, hand-packed tea,
label-imperfect soy sauce —
everything Western artisan shops charge 3x for.

First drop: 12 units only. $95.
Ships within 14 days from Japan.

[Link]"

+ "Sending 5 free samples to the first 5 people who DM me their address"
→ 無料サンプル→レビュー→次ドロップ売り切れ
```
