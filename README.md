# LifeFit Counter

LifeFitに入館したあと、ボタンを1回タップして来店を記録する個人用Webアプリです。

## GitHub Pagesで公開
1. GitHubで `lifefit-counter` などのリポジトリを作成。
2. このフォルダのファイルをすべてリポジトリ直下にアップロード。
3. Settings → Pages → Deploy from a branch を選択。
4. Branch を `main`、Folder を `/(root)` にして Save。
5. 公開URLをiPhoneのSafariで開く。
6. Safariの共有ボタン →「ホーム画面に追加」→「追加」。

## 注意
- 来店記録はブラウザ内の localStorage に保存されます。
- ブラウザのデータを消すと記録が消える場合があります。
- 別端末・別ブラウザとは自動同期しません。
- 入館成功は自動検知しません。入館後に手動で1タップします。
