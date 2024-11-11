import exampleData from 'simple-mind-map/example/exampleData'
import { simpleDeepClone } from 'simple-mind-map/src/utils/index'
import Vue from 'vue'
import vuexStore from '@/store'

const SIMPLE_MIND_MAP_DATA = 'SIMPLE_MIND_MAP_DATA'
const SIMPLE_MIND_MAP_LANG = 'SIMPLE_MIND_MAP_LANG'
const SIMPLE_MIND_MAP_LOCAL_CONFIG = 'SIMPLE_MIND_MAP_LOCAL_CONFIG'
const SIMPLE_MIND_MAP_CONFIG = 'SIMPLE_MIND_MAP_CONFIG'

let mindMapData = null

/**
 * @Author: 王林
 * @Date: 2021-08-02 22:36:48
 * @Desc: 克隆思维导图数据，去除激活状态
 */
const copyMindMapTreeData = (tree, root) => {
  if (!root) return null
  tree.data = simpleDeepClone(root.data)
  // tree.data.isActive = false
  tree.children = []
  if (root.children && root.children.length > 0) {
    root.children.forEach((item, index) => {
      tree.children[index] = copyMindMapTreeData({}, item)
    })
  }
  return tree
}

/**
 * @Author: 王林
 * @Date: 2021-08-01 10:10:49
 * @Desc: 获取缓存的思维导图数据
 */
export const getData = () => {
  if (window.takeOverApp) {
    mindMapData = window.takeOverAppMethods.getMindMapData()
    return mindMapData
  }
  if (vuexStore.state.isHandleLocalFile) {
    return Vue.prototype.getCurrentData()
  }
  let store = localStorage.getItem(SIMPLE_MIND_MAP_DATA)
  if (store === null) {
    return simpleDeepClone(exampleData)
  } else {
    try {
      let parsedData = JSON.parse(store)
      if (window.IS_ELECTRON) {
        return simpleDeepClone(exampleData)
        let { root, ...rest } = parsedData
        return {
          ...rest,
          root: simpleDeepClone(exampleData).root
        }
      } else {
        return parsedData
      } 
    } catch (error) {
      return simpleDeepClone(exampleData)
    }
  }
}

/**
 * @Author: 王林
 * @Date: 2021-08-01 10:14:28
 * @Desc: 存储思维导图数据
 */
export const storeData = data => {
  try {
    if (window.IS_ELECTRON) {
      return
    }
    let originData = null
    if (window.takeOverApp) {
      originData = mindMapData
    } else {
      originData = getData()
    }
    originData.root = copyMindMapTreeData({}, data)
    if (window.takeOverApp) {
      mindMapData = originData
      window.takeOverAppMethods.saveMindMapData(originData)
      return
    }
    Vue.prototype.$bus.$emit('write_local_file', originData)
    if (vuexStore.state.isHandleLocalFile) {
      return
    }
    let dataStr = JSON.stringify(originData)
    localStorage.setItem(SIMPLE_MIND_MAP_DATA, dataStr)
  } catch (error) {
    console.log(error)
  }
}

/**
 * @Author: 王林
 * @Date: 2021-08-01 10:24:56
 * @Desc: 存储思维导图配置数据
 */
export const storeConfig = config => {
  try {
    if (window.IS_ELECTRON) {
      if (!config.config) return
      let dataStr = JSON.stringify(config.config)
      localStorage.setItem(SIMPLE_MIND_MAP_CONFIG, dataStr)
      return
    }
    let originData = null
    if (window.takeOverApp) {
      originData = mindMapData
    } else {
      originData = getData()
    }
    originData = {
      ...originData,
      ...config
    }
    if (window.takeOverApp) {
      mindMapData = originData
      window.takeOverAppMethods.saveMindMapData(originData)
      return
    }
    Vue.prototype.$bus.$emit('write_local_file', originData)
    if (vuexStore.state.isHandleLocalFile) {
      return
    }
    let dataStr = JSON.stringify(originData)
    localStorage.setItem(SIMPLE_MIND_MAP_DATA, dataStr)
  } catch (error) {
    console.log(error)
  }
}

export const getConfig = () => {
  let config = localStorage.getItem(SIMPLE_MIND_MAP_CONFIG)
  if (config === null) {
    return {}
  } else {
    try {
      let parsedData = JSON.parse(config)
      return parsedData
    } catch (error) {
      return {}
    }
  }
}

/**
 * javascript comment
 * @Author: 王林
 * @Date: 2022-11-05 14:36:50
 * @Desc: 存储语言
 */
export const storeLang = lang => {
  if (window.takeOverApp) {
    window.takeOverAppMethods.saveLanguage(lang)
    return
  }
  localStorage.setItem(SIMPLE_MIND_MAP_LANG, lang)
}

/**
 * javascript comment
 * @Author: 王林
 * @Date: 2022-11-05 14:37:36
 * @Desc: 获取存储的语言
 */
export const getLang = () => {
  if (window.takeOverApp) {
    return window.takeOverAppMethods.getLanguage() || 'zh'
  }
  let lang = localStorage.getItem(SIMPLE_MIND_MAP_LANG)
  if (lang) {
    return lang
  }
  storeLang('zh')
  return 'zh'
}

/**
 * javascript comment
 * @Author: 王林25
 * @Date: 2022-11-14 18:57:31
 * @Desc: 存储本地配置
 */
export const storeLocalConfig = config => {
  if (window.takeOverApp) {
    return window.takeOverAppMethods.saveLocalConfig(config)
  }
  localStorage.setItem(SIMPLE_MIND_MAP_LOCAL_CONFIG, JSON.stringify(config))
}

/**
 * javascript comment
 * @Author: 王林25
 * @Date: 2022-11-14 18:57:37
 * @Desc: 获取本地配置
 */
export const getLocalConfig = () => {
  if (window.takeOverApp) {
    return window.takeOverAppMethods.getLocalConfig()
  }
  let config = localStorage.getItem(SIMPLE_MIND_MAP_LOCAL_CONFIG)
  if (config) {
    return JSON.parse(config)
  }
  return null
}
