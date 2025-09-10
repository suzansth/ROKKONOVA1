import { app, BrowserWindow } from "electron";
import path from "path";
import { fileURLToPath } from "url";

// __dirname と __filename を ESM で定義（1回だけ）
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// server.js を読み込む
import(path.join(__dirname, "server.js"))
  .then(() => console.log("server.js loaded"))
  .catch(err => console.error("Failed to load server.js:", err));

function createWindow() {
  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: true,
    },
  });

  if (!app.isPackaged) {
    // 開発モード
    win.loadURL("http://localhost:5173");
  } else {
    // 本番ビルド
    win.loadFile(path.join(app.getAppPath(), "dist/index.html"));
    //win.webContents.openDevTools();
  }
}

app.whenReady().then(() => {
  createWindow();
  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});
