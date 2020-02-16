import { menubar } from 'menubar';
import * as path from 'path';
import * as url from 'url';

const args = process.argv.slice(1),
    serve = args.some(val => val === '--serve');
const mb = menubar({
  browserWindow: {
    height: 600,
    resizable: false,
    width: 320,
    webPreferences: {
      allowRunningInsecureContent: (serve) ? true : false,
      nodeIntegration: true
    }
  },
  index: false
});

mb.on('ready', (): void => {
  mb.showWindow();

  if (serve) {
    require('electron-reload')(__dirname, {
      electron: require(`${__dirname}/node_modules/electron`)
    });
    mb.window.loadURL('http://localhost:4200');
  } else {
    mb.window.loadURL(url.format({
      pathname: path.join(__dirname, 'dist/index.html'),
      protocol: 'file:',
      slashes: true
    }));
  }

  if (serve) {
    mb.window.webContents.openDevTools();
  }
  // your app code here
});
