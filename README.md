# React&electronでデスクトップアプリ
元のReactのソースコードにelectron.js追加+package.json変更

## 実行前準備
必要なライブラリをインストール
```
npm install
```
distフォルダー作成
```
npm run build
```

## 実行方法
```
npm run dev
```
```
npx electron .
```
## windows用.exeビルド
```
npx electron-builder --win
```
## macOS用.dmgビルド
```
npx electron-builder --mac
```
