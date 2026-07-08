const { app, BrowserWindow } = require('electron');
const path = require('path');
const { spawn } = require('child_process');
const net = require('net');

let serverProcess;
let mainWindow;

// Find a free port
function getFreePort() {
  return new Promise((resolve, reject) => {
    const server = net.createServer();
    server.unref();
    server.on('error', reject);
    server.listen(0, '127.0.0.1', () => {
      const port = server.address().port;
      server.close(() => resolve(port));
    });
  });
}

// Wait for a port to be listening
function waitForPort(port, timeout = 15000) {
  return new Promise((resolve, reject) => {
    const start = Date.now();
    const interval = setInterval(() => {
      const socket = new net.Socket();
      socket.connect(port, '127.0.0.1', () => {
        socket.destroy();
        clearInterval(interval);
        resolve();
      });
      socket.on('error', () => {
        socket.destroy();
        if (Date.now() - start > timeout) {
          clearInterval(interval);
          reject(new Error('Timeout waiting for port ' + port));
        }
      });
    }, 200);
  });
}

async function startServerAndCreateWindow() {
  const port = await getFreePort();
  console.log(`Starting Next.js server on port ${port}...`);

  const isDev = !app.isPackaged;
  const serverPath = isDev
    ? path.join(__dirname, '.next', 'standalone', 'server.js')
    : path.join(process.resourcesPath, 'app', '.next', 'standalone', 'server.js');

  // Electron executable can run standard Node.js scripts when ELECTRON_RUN_AS_NODE=1
  serverProcess = spawn(process.execPath, [serverPath], {
    env: { 
      ...process.env, 
      ELECTRON_RUN_AS_NODE: '1', 
      PORT: port.toString(), 
      HOSTNAME: '127.0.0.1', 
      NODE_ENV: 'production' 
    },
    stdio: 'inherit'
  });

  try {
    await waitForPort(port);
    console.log(`Server is ready on port ${port}. Opening window...`);
    
    mainWindow = new BrowserWindow({
      width: 1200,
      height: 800,
      title: 'Vamus',
      autoHideMenuBar: true,
      webPreferences: {
        nodeIntegration: false,
        contextIsolation: true
      },
    });

    mainWindow.loadURL(`http://127.0.0.1:${port}`);

    mainWindow.on('closed', () => {
      mainWindow = null;
    });

  } catch (err) {
    console.error('Failed to start server:', err);
    app.quit();
  }
}

app.whenReady().then(() => {
  startServerAndCreateWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      startServerAndCreateWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('will-quit', () => {
  if (serverProcess) {
    serverProcess.kill();
  }
});
