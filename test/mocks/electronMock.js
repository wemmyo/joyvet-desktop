module.exports = {
  remote: {
    app: {
      getPath: () => '/tmp/test',
      quit: jest.fn(),
    },
    dialog: {
      showOpenDialogSync: jest.fn(() => ['/tmp/test.db']),
      showSaveDialogSync: jest.fn(() => '/tmp/test.db'),
    },
  },
  app: {
    getPath: () => '/tmp/test',
    quit: jest.fn(),
  },
  dialog: {
    showOpenDialogSync: jest.fn(() => ['/tmp/test.db']),
    showSaveDialogSync: jest.fn(() => '/tmp/test.db'),
  },
  ipcMain: { handle: jest.fn(), on: jest.fn() },
  ipcRenderer: { invoke: jest.fn(), on: jest.fn(), send: jest.fn() },
  contextBridge: { exposeInMainWorld: jest.fn() },
};
