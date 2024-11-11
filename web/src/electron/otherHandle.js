import { BrowserWindow, ipcMain, shell } from 'electron'
import { saveClientConfig, getClientConfig } from './storage'

export const bindOtherHandleEvent = () => {
  // 处理缩放事件
  ;['minimize', 'maximize', 'unmaximize', 'close', 'destroy'].forEach(item => {
    ipcMain.on(item, event => {
      const webContents = event.sender
      const win = BrowserWindow.fromWebContents(webContents)
      win[item]()
    })
  })

  // 使用默认浏览器打开指定url
  ipcMain.on('openUrl', (event, url) => {
    shell.openPath(url)
  })

  // 保存客户端配置
  ipcMain.handle('saveClientConfig', async (event, config) => {
    const res = await saveClientConfig(config)
    return res
  })

  // 获取客户端配置
  ipcMain.handle('getClientConfig', () => {
    return getClientConfig()
  })
}
