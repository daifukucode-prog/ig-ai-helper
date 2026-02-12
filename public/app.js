const $ = (id) => document.getElementById(id);

let selectedTemplate = "日常";

function setStatus(msg) {
  $("status").textContent = msg;
}

function fillDemo() {
  $("idea").value =
    "新メニューの抹茶ラテを試作した！\n・苦味は控えめ\n・プリンと相性最高\n・落ち着く店内で作業もしやすい";
  $("tone").value = "おしゃれ";
  $("target").value = "20代女性";
  $("product").value = "〇〇カフェ";
  $("styleGuide").value =
    "語尾は『〜です/ます』。短文で読みやすく。絵文字は2〜3個まで。1行目に結論。";
}

function clearOutputs() {
  $("caption").textContent = "";
  $("hashtags").textContent = "";
  $("notes").textContent = "";
  $("imgPrompt").textContent = "";
  $("img").src = "";
  $("img").alt = "";
}

async function copyText(text) {
  await navigator.clipboard.writeText(text);
}

function getAllText() {
  const caption = $("caption").textContent.trim();
  const tags = $("hashtags").textContent.trim();
  const prompt = $("imgPrompt").textContent.trim();
  const notes = $("notes").textContent.trim();

  return [
    "【キャプション】",
    caption,
    "",
    "【ハッシュタグ】",
    tags,
    "",
    "【画像プロンプト】",
    prompt,
    "",
    "【メモ】",
    notes
  ].join("\n");
}

// テンプレ選択UI
$("templates").addEventListener("click", (e) => {
  const btn = e.target.closest("button[data-template]");
  if (!btn) return;

  selectedTemplate = btn.dataset.template;

  // 見た目の選択状態
  [...$("templates").querySelectorAll(".chip")].forEach((b) =>
    b.classList.toggle("active", b === btn)
  );

  setStatus(`テンプレ：${selectedTemplate}`);
});

// 例を入れる
$("demo").addEventListener("click", () => {
  fillDemo();
  setStatus("例を入れたよ！");
});

// 生成
$("go").addEventListener("click", async () => {
  setStatus("考え中…");
  clearOutputs();

  const idea = $("idea").value.trim();
  const tone = $("tone").value;
  const target = $("target").value;
  const product = $("product").value.trim();
  const styleGuide = $("styleGuide").value.trim();

  if (!idea) {
    setStatus("投稿したい内容を入れて〜");
    return;
  }

  try {
    const res = await fetch("/api/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        idea,
        tone,
        target,
        product,
        styleGuide,
        template: selectedTemplate,
        genImage: $("genImage").checked

      })
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data?.message || data?.error || "エラー");

    $("caption").textContent = data.caption || "";
    $("hashtags").textContent = (data.hashtags || []).join(" ");
    $("notes").textContent = data.notes || "";
    $("imgPrompt").textContent = data.image_prompt || "";
    if (data.image_data_url) {
      $("img").src = data.image_data_url;
      $("img").alt = data.alt_text || "生成画像";
    }

    setStatus("できた！");
  } catch (e) {
    setStatus(`失敗：${e.message}`);
  }
});

// コピー系
$("copyCaption").addEventListener("click", async () => {
  const t = $("caption").textContent.trim();
  if (!t) return setStatus("コピーするキャプションがない…");
  await copyText(t);
  setStatus("キャプションコピーした！");
});

$("copyTags").addEventListener("click", async () => {
  const t = $("hashtags").textContent.trim();
  if (!t) return setStatus("コピーするタグがない…");
  await copyText(t);
  setStatus("タグコピーした！");
});

$("copyPrompt").addEventListener("click", async () => {
  const t = $("imgPrompt").textContent.trim();
  if (!t) return setStatus("コピーするプロンプトがない…");
  await copyText(t);
  setStatus("画像プロンプトコピーした！");
});

$("copyAll").addEventListener("click", async () => {
  const t = getAllText();
  if (!t.trim()) return setStatus("コピーするものがない…");
  await copyText(t);
  setStatus("全部コピーした！");
});
