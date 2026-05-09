# ALTERNATIVE RACING

シンプルな1ページのトップページです。

## 現在のリポジトリ状態

- `index.html` はリポジトリ直下にあります。
- `.nojekyll` はリポジトリ直下にあります。
- GitHub Pages用のデプロイ設定は `.github/workflows/pages.yml` にあります。
- `main` ブランチに push されると、GitHub Actions で GitHub Pages へ公開します。

## GitHub remote を設定して公開する手順

既存のGitHubリポジトリは `ozo33333-alt/alternative-racing-site` です。

1. ターミナルでこのリポジトリのフォルダを開きます。

   ```bash
   cd /workspace/alternative-racing-site
   ```

2. GitHub remote を設定します。

   ```bash
   git remote add origin https://github.com/ozo33333-alt/alternative-racing-site.git
   ```

3. `main` ブランチをGitHubへ push します。

   ```bash
   git push -u origin main
   ```

4. GitHubでこのリポジトリを開きます。
5. **Settings** を開きます。
6. 左メニューの **Pages** を開きます。
7. **Source** を **GitHub Actions** にします。
8. 上メニューの **Actions** を開きます。
9. **Deploy GitHub Pages** が緑のチェックになるまで待ちます。
10. 公開URLを開きます。

## 開くべきURL

```text
https://ozo33333-alt.github.io/alternative-racing-site/
```

## 手元のブラウザで確認する方法

1. `index.html` をダブルクリックします。
2. ブラウザでトップページが表示されます。
