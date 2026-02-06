import { app, BrowserWindow } from "electron";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function createWindow() {
  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      contextIsolation: true,
    },
  });

  if (!app.isPackaged) {
    // 開発
    win.loadURL("http://localhost:5173");
    win.webContents.openDevTools();
  } else {
    // 本番
    win.loadFile(path.join(app.getAppPath(), "dist/index.html"));
  }
}

app.whenReady().then(createWindow);

app.on("window-all-closed", () => {
    app.quit();
  });
