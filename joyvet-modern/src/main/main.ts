import { app, BrowserWindow, ipcMain } from 'electron';
import path from 'path';
import { Sequelize, Transaction } from 'sequelize';
import { sequelize } from './database';

let mainWindow: BrowserWindow | null = null;
let sequelizeInstance: Sequelize | null = null;

const createWindow = () => {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js'),
    },
  });

  // Load the app
  const isDev = !app.isPackaged;
  if (isDev) {
    mainWindow.loadURL('http://localhost:3000');
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(path.join(__dirname, '../renderer/index.html'));
  }

  // Handle window closed
  mainWindow.on('closed', () => {
    mainWindow = null;
  });
};

const initializeDatabase = async () => {
  try {
    // Test connection
    await sequelize.authenticate();
    console.log('Database connected successfully');

    // Import and sync models
    await import('./models');
    await sequelize.sync();
    sequelizeInstance = sequelize;
  } catch (error) {
    console.error('Database initialization failed:', error);
  }
};

// IPC handlers
ipcMain.handle('database:query', async (event, sql: string, params: any[] = []) => {
  try {
    const [results] = await sequelize.query(sql, { replacements: params });
    return { success: true, data: results };
  } catch (error) {
    console.error('Database query error:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
});

ipcMain.handle('database:transaction', async (event, operations: Array<{ sql: string; params: any[] }>) => {
  try {
    const t = await sequelize.transaction();
    const results = [];

    for (const operation of operations) {
      const [result] = await sequelize.query(operation.sql, {
        replacements: operation.params,
        transaction: t
      });
      results.push(result);
    }

    await t.commit();
    return { success: true, data: results };
  } catch (error) {
    console.error('Database transaction error:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
});

// App event handlers
app.whenReady().then(async () => {
  await initializeDatabase();
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// Prevent new window creation
app.on('web-contents-created', (event, contents) => {
  contents.on('will-navigate', (event, navigationUrl) => {
    event.preventDefault();
    console.log('Prevented navigation to:', navigationUrl);
  });
});
