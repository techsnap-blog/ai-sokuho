# public/ — 公開領域（allowlist）

**このフォルダの中身だけが公開リポジトリ（GitHub Pages）へ同期される。**
それ以外（`data/` `scripts/` `docs/` `CLAUDE.md` `.github/` など）は一切公開されない。

## 鉄則

- 秘密情報（APIキー・トークン・`.env`・Deploy key）をこの下に置かない。
- 収集した生データ（Raw Data / Observation / Event / Evidence Package）、内部スコア（Importance / Rising Score）、
  コストログ、AI Service Registry はここに置かない。それらは Spec 02 §33/§52/§60/§74 により **非公開**。
- ここに置くのは「読者に見せて良い最終成果物」だけ：生成済みの記事HTML・カテゴリ/個別AIページ・
  画像・CSS/JS・`sitemap.xml` / `robots.txt` / PWA manifest など。

`scripts/check-public-safe.mjs` がこの領域に秘密や非公開パスが混入していないか機械チェックする。
公開前に必ず通す。
