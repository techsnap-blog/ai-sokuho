# ロゴ画像の置き場所

ここに各AIの**公式ロゴ画像**を置くと、ビルド（`node scripts/build-site.mjs`）が自動で
サムネイル・一覧・AI詳細に反映する。**無ければ自動で頭文字チップにフォールバック**するので、
全部揃っていなくても壊れない。

## ルール

- **ファイル名 = そのAIのslug**（`data/services.json` の `slug`）。拡張子は `.svg` / `.png` / `.webp`。
  - 例：Cursor → `cursor.svg`、Suno → `suno.png`、ChatGPT → `chatgpt.svg`、Claude Code → `claude-code.svg`
- **公式アセットのみ**。AI生成で作ったロゴ・不正確な再現は使わない（商標・ブランドガイドライン。Spec 04 §94 / Spec 05 §81）。
- 正方形に近い画像が望ましい（`object-fit: contain` で表示）。背景透過推奨。

## slug一覧（このファイル名で置けば反映される）

chatgpt / claude / gemini / kimi / grok / perplexity /
claude-code / codex / cursor / github-copilot / windsurf /
midjourney / adobe-firefly / sora / veo / runway / kling /
suno / udio / elevenlabs

新しいAIが `services.json` に増えたら、その `slug` 名で追加する。
