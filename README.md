# IG AI Helper（Instagram投稿AI生成アプリ）

Instagramに投稿する **キャプション案** と **ハッシュタグ案** を、入力内容に合わせてAIが自動生成するWebアプリです。  
SNS運用の「ネタ出し・文章作成」の時間を短縮し、投稿クオリティのブレを減らすことを目的に作りました。

---

## ✅ できること

- 投稿したい内容（例：新商品紹介、イベント告知、日常投稿など）を入力
- AIが以下を生成
  - キャプション（投稿本文）
  - ハッシュタグ案（複数）

---

## 🌐 公開URL

- Render：`https://ig-ai-helper.onrender.com/`

※他端末からもアクセス可能で、公開動作を確認済みです。

---

## 🧩 構成（ざっくり）

- **フロント**：HTML / JavaScript（fetchでAPI呼び出し）
- **バックエンド**：Node.js / Express（`/api/generate` を提供）
- **AI**：OpenAI API
- **デプロイ**：Render（環境変数でAPIキー管理）

---

## 🚀 ローカルでの起動方法

### 1) インストール
```bash
npm install
