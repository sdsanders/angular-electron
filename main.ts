import { Notification } from 'electron';
import { menubar } from 'menubar';
import * as ioHook from 'iohook';
import * as path from 'path';
import * as url from 'url';
import { Duration } from 'luxon';

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
const streak = {
  active: false,
  keys: 0,
  startTime: Date.now()
};

function handleKeyboardEvent(event) {
  if (!streak.active) {
    streak.active = true;
    streak.startTime = Date.now();
  }

  streak.keys++;
  mb.window.webContents.send('current-streak', streak.keys);
}
let minStreak = 10;
function handleMouseEvent(event) {
  if (!streak.active) { return };

  const duration = Duration.fromMillis(Date.now() - streak.startTime);

  if (streak.keys > minStreak) {
    const notification = new Notification({
      title: 'Streak broken!',
      body: `You typed ${streak.keys} keys during that streak, lasting ${duration.as('minutes').toFixed(2)} minutes`
    });

    notification.show();
  }

  streak.active = false;
  streak.keys = 0;
}

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

  ioHook.on('keyup', handleKeyboardEvent);

  ioHook.on('mousemove', handleMouseEvent);
  ioHook.on('mouseclick', handleMouseEvent);
  ioHook.on('mousedrag', handleMouseEvent);
  ioHook.on('mousewheel', handleMouseEvent);

  ioHook.start();
});
