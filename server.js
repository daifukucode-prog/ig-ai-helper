import "dotenv/config";
import express from "express";
import OpenAI from "openai";

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json({ limit: "2mb" }));
app.use(express.static("public"));

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

app.post("/api/generate", async (req, res) => {
  try {
    const {
      idea,
      tone = "明るめ",
      target = "一般",
      product = "",
      styleGuide = "",
      template = "日常",
      genImage = true
    } = req.body || {};

    if (!idea || typeof idea !== "string") {
      return res.status(400).json({ error: "idea が必要です" });
    }

    // テンプレに応じた指示（業務っぽさ）
    const templateRule = {
      "日常":
        "日常の共感・空気感を重視。押し付けない。読者が『行ってみたい/やってみたい』と思う1文を入れる。",
      "商品紹介":
        "商品の魅力→具体例→ベネフィット→軽いCTA（来店/保存/チェック）で構成。盛りすぎない。",
      "イベント告知":
        "日時/場所/参加メリット/対象/締切が分かる。保存したくなる要点整理。最後に行動喚起。",
      "採用":
        "仕事内容/魅力/求める人/応募方法を簡潔に。堅すぎず安心感。"
    }[template] || "読みやすく整理する。";

    const styleText = styleGuide
      ? `【文体ルール】\n${styleGuide}\n（このルールを最優先で守る）`
      : "【文体ルール】指定なし（読みやすい自然な日本語）";

    // 文章生成（JSONのみ）
    const textResp = await client.responses.create({
      model: "gpt-4.1-mini",
      input: [
        {
          role: "developer",
          content:
            "You create Instagram post assets. Output MUST be valid JSON (and only JSON)."
        },
        {
          role: "user",
          content: [
            "次の条件でインスタ投稿案を作成してください。",
            `【テンプレ】${template}`,
            `【テンプレ要件】${templateRule}`,
            `【ユーザー入力】${idea}`,
            `【トーン】${tone}`,
            `【想定ターゲット】${target}`,
            product ? `【商品/サービス名】${product}` : "",
            styleText,
            "",
            "出力はJSONのみ。形式：",
            "{",
            '  "caption": "日本語のキャプション(改行込みOK)",',
            '  "hashtags": ["#...","#..."],',
            '  "image_prompt": "画像生成AIに渡す日本語プロンプト(1つ)",',
            '  "alt_text": "画像の代替テキスト(日本語)",',
            '  "notes": "投稿のコツ/注意点(短く)"',
            "}"
          ].filter(Boolean).join("\n")
        }
      ],
      text: { format: { type: "json_object" } }
    });

    let postJson;
    try {
      postJson = JSON.parse(textResp.output_text);
    } catch {
      return res.status(500).json({
        error: "AIのJSON解析に失敗しました（もう一度実行して）",
        raw: textResp.output_text
      });
    }

    const imagePrompt = postJson.image_prompt || `Instagram用の魅力的な画像。テーマ: ${idea}`;

    // 画像生成（ON/OFF）
let dataUrl = null;

if (genImage) {
  const imgResp = await client.images.generate({
    model: "gpt-image-1",
    prompt: imagePrompt,
    size: "1024x1024"
  });

  const b64 = imgResp?.data?.[0]?.b64_json;
  dataUrl = b64 ? `data:image/png;base64,${b64}` : null;
}


    return res.json({
      caption: postJson.caption,
      hashtags: postJson.hashtags,
      notes: postJson.notes,
      alt_text: postJson.alt_text,
      image_prompt: imagePrompt,
      image_data_url: dataUrl,
      meta: { template, tone, target }
    });
  } catch (e) {
    return res.status(500).json({
      error: "サーバー側でエラー",
      message: e?.message || String(e)
    });
  }
});

app.listen(port, () => {
  console.log(`http://localhost:${port} で起動したよ`);
});
