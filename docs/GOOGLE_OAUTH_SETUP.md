#### 📋 目次

| # | セクション |
|---|------------|
| [1](#oauth-why) | Why Google OAuth（採用理由・CVR効果） |
| [2](#oauth-flow) | フロー全体像（コード目線） |
| [3](#oauth-console) | Google Cloud Console 設定（ユーザー作業） |
| [4](#oauth-supabase) | Supabase Dashboard 設定（ユーザー作業） |
| [5](#oauth-env) | Coolify env vars（必要なし・確認のみ） |
| [6](#oauth-verify) | 動作確認手順 |
| [7](#oauth-troubleshoot) | トラブルシューティング |
| [8](#oauth-security) | セキュリティ・運用メモ |

---

## <a id="oauth-why"></a>1. Why Google OAuth

**問題**: メール+パスワード登録は CVR 2〜4% まで落ちる。ゲストチェックアウト不可のECでは離脱率が急上昇。

**解決**: Google 1-tap サインインで登録摩擦をゼロに:
- パスワード入力不要 → 30秒以内に購入導線に戻れる
- Google プロフィールから `full_name` を自動取得 → 署名欄自動入力
- Google の 2FA がそのまま適用される → セキュリティ向上

**実測値（業界平均）**: OAuth 導入で登録 CVR が **1.5〜3倍** に跳ねる。Sericia のような「初回購入=アカウント作成」UX では特に効く。

---

## <a id="oauth-flow"></a>2. フロー全体像

```
1. User clicks "Continue with Google" ボタン (/login or /signup)
   → storefront/components/GoogleSignInButton.tsx
   → supa.auth.signInWithOAuth({ provider: "google", ... })

2. Supabase が accounts.google.com にリダイレクト
   → Google が Consent 画面表示 → User 承認

3. Google が Supabase の callback に戻す
   → https://<PROJECT>.supabase.co/auth/v1/callback?code=...

4. Supabase が intermediate セッションを作成 → 我々の /auth/callback にリダイレクト
   → storefront/app/auth/callback/route.ts

5. /auth/callback が exchangeCodeForSession(code) を実行
   → httpOnly セッションクッキー発行 → redirect back to /account (or ?next=)

6. auth.users への insert が sericia_handle_new_user() トリガーを発火
   → raw_user_meta_data.full_name (Google の name claim) から sericia_profiles 行を自動生成
   → country_code は NULL（後で account settings で補完）
```

**ポイント**: DB コード追加ゼロ / 新規 callback route 追加ゼロ。既存のマジックリンク用 `/auth/callback` が OAuth にもそのまま使える（どちらも `exchangeCodeForSession` で等価）。

---

## <a id="oauth-console"></a>3. Google Cloud Console 設定（ユーザー作業）

> **所要時間**: 10分 / **ログイン**: Paradigm の Google アカウント

### 3-1. プロジェクト作成

1. https://console.cloud.google.com/ にアクセス
2. 上部のプロジェクトセレクタ → 「新しいプロジェクト」
3. プロジェクト名: `sericia-oauth`（何でも可）→ 作成

### 3-2. OAuth 同意画面 設定

1. 左メニュー → 「APIs & Services」 → 「OAuth consent screen」
2. User Type: **External** を選択 → 作成
3. 入力:
   - App name: `Sericia`
   - User support email: （あなたの Gmail）
   - App logo: オプション（Sericia ロゴをアップロードすると Google 画面で表示される）
   - App domain:
     - Application home page: `https://sericia.com`
     - Application privacy policy link: `https://sericia.com/privacy`
     - Application terms of service link: `https://sericia.com/terms`
   - Authorized domains: `sericia.com` を追加
   - Developer contact: （あなたの Gmail）
4. 「Save and Continue」
5. Scopes 画面 → 「Save and Continue」（デフォルトの email/profile/openid で OK、追加不要）
6. Test users: 開発中のみ追加（Production 公開したら不要）
7. Summary → 「Back to Dashboard」

### 3-3. Publishing status を Production に

初期状態では「Testing」になっており、登録済み Test users 以外はログインできない。本番公開前に:

1. OAuth consent screen のトップで 「**Publish App**」 ボタンをクリック
2. 「Push to production」を確認 → 公開

> ⚠️ 「Verified」ステータスには Google の審査が必要（通常 2〜6週間）。ただし **未審査でも機能する**。審査中は Google 画面に「This app isn't verified」という警告が出るが、ユーザーが「Advanced → Go to sericia.com (unsafe)」をクリックすれば進める。初期は未審査で OK。100+ 新規登録が発生してから審査申請する

### 3-4. OAuth 2.0 Client ID 発行

1. 左メニュー → 「APIs & Services」 → 「Credentials」
2. 上部「+ CREATE CREDENTIALS」 → 「OAuth client ID」
3. Application type: **Web application**
4. Name: `Sericia Web`（識別用、何でも可）
5. Authorized JavaScript origins:
   ```
   https://sericia.com
   https://<YOUR_SUPABASE_PROJECT>.supabase.co
   http://localhost:3000
   ```
   > `<YOUR_SUPABASE_PROJECT>` は Supabase Dashboard → Settings → API の Project URL のサブドメイン部分
6. Authorized redirect URIs:
   ```
   https://<YOUR_SUPABASE_PROJECT>.supabase.co/auth/v1/callback
   ```
   > **これが最重要**。Supabase が OAuth を中継する URL。間違えると `redirect_uri_mismatch` エラーで Google 画面から戻れなくなる
7. 「Create」をクリック
8. モーダルで表示される **Client ID** と **Client Secret** を両方コピー（後で Supabase に貼る）

---

## <a id="oauth-supabase"></a>4. Supabase Dashboard 設定（ユーザー作業）

> **所要時間**: 2分

1. Supabase Dashboard (https://supabase.com/dashboard) にログイン → Sericia プロジェクト選択
2. 左メニュー → 「Authentication」 → 「Providers」
3. 「Google」を探して展開
4. 設定:
   - **Enable sign in with Google**: ON に切り替え
   - **Client ID (for OAuth)**: 3-4 でコピーした Client ID を貼り付け
   - **Client Secret (for OAuth)**: 3-4 でコピーした Client Secret を貼り付け
   - **Authorized Client IDs**: 空欄のまま（Web 以外の Client ID を使う場合のみ）
   - **Skip nonce checks**: OFF（デフォルト）
5. 「Save」をクリック

> Supabase は Client Secret を暗号化して保存する。平文での露出はない。

---

## <a id="oauth-env"></a>5. Coolify env vars（確認のみ・追加作業なし）

Google OAuth は **クライアント側（ブラウザ）のみで完結**するため、追加の env vars は**不要**。既存の以下が設定されていれば OK:

| Env var | 用途 |
|---------|------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase プロジェクト URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase 公開 anon key |
| `SUPABASE_SERVICE_ROLE_KEY` | サーバー側のみ（/auth/callback で使用） |

> ⚠️ Google Client ID / Secret を Coolify env に入れる必要は**ない**。すべて Supabase Dashboard 側で完結する

---

## <a id="oauth-verify"></a>6. 動作確認手順

### 6-1. ログインフロー確認

1. ブラウザのシークレットウィンドウで https://sericia.com/login にアクセス
2. 「Continue with Google」ボタン表示を確認
3. クリック → Google アカウント選択画面 → 承認
4. `https://sericia.com/account` にリダイレクトされ、ログイン済み状態になっていることを確認

### 6-2. 新規アカウント自動生成確認

1. Supabase Dashboard → 「Authentication」 → 「Users」
2. Google ログインしたユーザーが追加されていることを確認（Provider 列が `google`）
3. 「SQL Editor」で以下実行:
   ```sql
   SELECT id, email, full_name, country_code, created_at
   FROM sericia_profiles
   ORDER BY created_at DESC
   LIMIT 5;
   ```
4. Google ユーザーの `sericia_profiles` 行が自動生成されていること / `full_name` に Google 表示名が入っていることを確認
5. `country_code` は NULL のはず（OAuth は国を取得しない）→ これは仕様通り。account settings で後から補完できる

### 6-3. 既存アカウント統合確認

同じ email を持つ「メール+パスワード」アカウントが既にある状態で Google ログインすると、Supabase は**自動で同じ auth.users 行に identity を追加**する。別アカウントにはならない。

- 確認: Authentication → Users → 該当ユーザー → Identities タブに `email` と `google` が両方並んでいれば成功

---

## <a id="oauth-troubleshoot"></a>7. トラブルシューティング

### エラー: `redirect_uri_mismatch`

**症状**: Google 画面で「このアプリは Google の検証済みではありません」ではなく赤いエラー画面
**原因**: Google Cloud Console の Authorized redirect URIs に Supabase の callback URL が正しく登録されていない
**修正**:
- Supabase Dashboard → Settings → API で Project URL を確認
- Google Cloud Console → Credentials → Sericia Web クライアント → 編集
- Authorized redirect URIs に `https://<PROJECT>.supabase.co/auth/v1/callback` を追加（末尾スラッシュなし）

### エラー: `invalid_client`

**症状**: リダイレクト直後に `invalid_client` エラー
**原因**: Supabase Dashboard に貼った Client ID / Secret が間違っている
**修正**: Google Cloud Console で Client Secret を「Reset Secret」 → 新しいシークレットを Supabase に貼り直し

### Google 画面に「This app isn't verified」警告

**原因**: OAuth consent screen が Publishing status = Testing、または審査未完了
**対応**:
- Testing ステータス: Publishing status を Production に変更（3-3 参照）
- 未審査: ユーザーに「Advanced → Go to sericia.com (unsafe)」を案内。または Google 審査を申請（2〜6週間）

### ログイン後にセッションが保持されない

**原因**: `/auth/callback` route での `exchangeCodeForSession` 失敗
**確認**:
```bash
# Coolify logs で storefront コンテナの stdout を確認
ssh root@46.62.217.172 "docker logs <storefront_container> 2>&1 | grep -i auth"
```
`[auth.callback]` ログを確認。`[auth.callback] no code present` が出ている場合は redirect URL の `?code=...` が欠落している

---

## <a id="oauth-security"></a>8. セキュリティ・運用メモ

### Client Secret の管理

- Supabase Dashboard でのみ保存・暗号化
- git / Coolify env / メモリファイルには**絶対に書かない**
- 漏洩した場合は Google Cloud Console で「Reset Secret」して即座にローテート

### 本番 Verification 審査

100+ ユーザー獲得後に Google 審査を申請すると「This app isn't verified」警告が消える:

1. OAuth consent screen → 「Publish app」 + Verification 要求
2. Google がスコープ審査（通常 2〜4週間）
3. Privacy Policy / Terms URLs が実在し機能していることが審査要件
4. 審査通過後は警告画面なしで即ログイン可能 → CVR 向上

### スコープ追加（将来）

現在は email / profile / openid のみ取得。以下を追加する場合は再審査が必要:

| Scope | 用途 |
|-------|------|
| `https://www.googleapis.com/auth/calendar` | ユーザーのカレンダー読み書き |
| `https://www.googleapis.com/auth/contacts.readonly` | 連絡先取得 |

Sericia の EC 用途では追加スコープ不要。初期実装のままで十分。

### `access_type: "offline"` の意味

`storefront/components/GoogleSignInButton.tsx` で `access_type: "offline"` を指定しており、これにより **Google の refresh token** が発行される。効果:

- Supabase セッション cookie 期限切れ後も、refresh token で**自動再発行可能**
- ユーザーは Google 画面を再度踏まずに継続ログイン状態を維持
- 「Sign out」した時のみ明示的に無効化される

Netflix や Amazon と同じ「ほぼ永続ログイン」UX が実現できる。
