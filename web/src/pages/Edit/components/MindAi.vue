<template>
  <el-dialog
    class="mindAiDialog"
    :title="$t('mindAi.title')"
    :visible.sync="dialogVisible"
    v-loading.fullscreen.lock="loading"
    :element-loading-text="loadingText"
    element-loading-spinner="el-icon-loading"
    element-loading-background="rgba(0, 0, 0, 0.8)"
    :width="isMobile ? '90%' : '50%'"
    :top="isMobile ? '20px' : '15vh'"
  >
    <div class="mindAiContainer" :class="{ isDark: isDark }">
      <div class="nameInputBox">
        <el-input 
          type="textarea"
          v-model="prompt"
          :placeholder="$t('mindAi.prompt')"
          @keydown.native.stop
        ></el-input>
      </div>
    </div>
    <span slot="footer" class="dialog-footer">
      <el-button @click="cancel">{{ $t('dialog.cancel') }}</el-button>
      <el-button type="primary" @click="confirm">{{
        $t('dialog.confirm')
      }}</el-button>
    </span>
  </el-dialog>
</template>

<script>
import { mapState, mapMutations } from 'vuex'
import { isMobile } from 'simple-mind-map/src/utils/index'
import { showLoading, hideLoading } from '@/utils/loading'
import markdown from 'simple-mind-map/src/parse/markdown.js'
import axios from 'axios'

/**
 * @Author: 王林
 * @Date: 2021-06-24 22:53:54
 * @Desc: 导出
 */
let md = null
export default {
  name: 'Export',
  data() {
    return {
      dialogVisible: false,
      exportType: 'smm',
      prompt: '',
      widthConfig: true,
      isTransparent: false,
      loading: false,
      loadingText: '',
      paddingX: 10,
      paddingY: 10,
      extraText: '',
      isMobile: isMobile()
    }
  },
  computed: {
    ...mapState({
      openNodeRichText: state => state.localConfig.openNodeRichText,
      isDark: state => state.localConfig.isDark,
    }),
  },
  created() {
    this.$bus.$on('showMindAi', this.handleShowMindAi)
  },
  beforeDestroy() {
    this.$bus.$off('showMindAi', this.handleShowMindAi)
  },
  methods: {
    ...mapMutations(['setExtraTextOnExport']),

    handleShowMindAi() {
      
      this.dialogVisible = true
    },

    onPaddingChange() {
      this.$bus.$emit('paddingChange', {
        exportPaddingX: Number(this.paddingX),
        exportPaddingY: Number(this.paddingY)
      })
    },

    /**
     * @Author: 王林
     * @Date: 2021-06-22 22:08:11
     * @Desc: 取消
     */
    cancel() {
      this.dialogVisible = false
    },

    /**
     * @Author: 王林
     * @Date: 2021-06-06 22:28:20
     * @Desc:  确定
     */
    async confirm() {
      showLoading()
      this.cancel()
      this.sparkAiGenMd()
    },

    /**
     * 星火AI生成markdown格式内容
     */
    sparkAiGenMd() {
      const url = process.env.VUE_APP_SPARK_URL;
      const header = {
        "Authorization": "Bearer " + process.env.VUE_APP_SPARK_KEY + ":" + process.env.VUE_APP_SPARK_SECRET
      };
      const data = this.getRequestData();
      axios.post(url, data, { headers: header })
        .then(response => {
          hideLoading()
          if (response.data.code == 0) {
            let content = response.data.choices[0].message.content
            let markdownContent = this.extractMarkdownContent(content)
            console.log(markdownContent)
            if (markdownContent != null) {
              let mindData = markdown.transformMarkdownTo(markdownContent)
              this.$bus.$emit('setData',mindData)
            }else {
              this.$notify.error({
                message: '生成失败'
              })
            }
          } else {
            this.$notify.error({
              message: response.data.message
            })
          }
        })
        .catch(error => {
          console.log(error)
          hideLoading()
          this.$notify.error({
            message: "网络异常"
          })
        });
    },

    getRequestData() {
      let content = `
        为${this.prompt}创建一个思维导图
        要求：
        1.使用markdown格式返回
        2.语言简洁
        3.通常有3个级别
      `
      const data = {
        "model": "lite", // 指定请求的模型
        "temperature": 0.5,
        "top_k": 4,
        "messages": [
          {
            "role": "user",
            "content": content
          }
        ],
      };

      return data;
    },
    
    /**
     * 提取Markdown内容
     */
    extractMarkdownContent(text) {
      const regex = /```(.*?)```/s
      const match = text.match(regex)
      if (match) {
        /**
         * 命中```
         * 例如```markdown # 主题商业分析 ```
         */
        return match[1].replace(/markdown/g, '')
      } else if (text.includes('#')) {
        /**
         * 没命中```，但存在#
         * 例如# 主题商业分析
         */
        return text
      }
      return null;
    }
  }
}
</script>

<style lang="less" scoped>
.mindAiContainer {
  &.isDark {
    .downloadTypeList {
      .downloadTypeItem {
        background-color: #363b3f;

        .info {
          .name {
            color: hsla(0, 0%, 100%, 0.9);
          }
        }
      }
    }
  }
}

.mindAiDialog {
  /deep/ .el-dialog__body {
    background-color: #f2f4f7;
  }

  .nameInputBox {
    margin-bottom: 10px;

    .name {
      margin-right: 10px;
    }

    .el-textarea {
      width: 100%;

      :deep(.el-textarea__inner) {
        height: 275px;
      }
    }
  }

  .paddingInputBox {
    display: flex;
    align-items: center;
    flex-wrap: wrap;

    .paddingInputGroup {
      margin-right: 12px;
      margin-bottom: 12px;

      &:last-of-type {
        margin-right: 0;
      }
    }

    .name {
      margin-right: 10px;
    }
  }

  .tip {
    margin-top: 10px;

    &.warning {
      color: #f56c6c;
    }
  }

  .downloadTypeList {
    display: flex;
    flex-wrap: wrap;
    .downloadTypeItem {
      width: 200px;
      height: 88px;
      padding: 22px;
      overflow: hidden;
      margin: 10px;
      border-radius: 11px;
      box-shadow: 0 0 20px 0 rgba(0, 0, 0, 0.02);
      background-color: #fff;
      display: flex;
      align-items: center;
      cursor: pointer;
      border: 2px solid transparent;

      &.active {
        border-color: #409eff;
      }

      .icon {
        font-size: 30px;
        margin-right: 10px;
        flex-shrink: 0;

        &.png {
          color: #ffc038;
        }

        &.pdf {
          color: #ff6c4d;
        }

        &.md {
          color: #2b2b2b;
        }

        &.json {
          color: #12c87e;
        }

        &.svg {
          color: #4380ff;
        }

        &.smm {
          color: #409eff;
        }

        &.xmind {
          color: #f55e5e;
        }

        &.txt {
          color: #70798e;
        }
      }

      .info {
        width: 100%;
        overflow: hidden;

        .name {
          color: #1a1a1a;
          font-size: 15px;
          margin-bottom: 5px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .desc {
          color: #999;
          font-size: 12px;
          display: -webkit-box; /* 必须设置display属性为-webkit-box */
          overflow: hidden; /* 超出部分隐藏 */
          text-overflow: ellipsis; /* 显示省略号 */
          -webkit-line-clamp: 2; /* 限制显示两行 */
          -webkit-box-orient: vertical; /* 垂直方向上的换行 */
        }
      }
    }
  }
}
</style>
