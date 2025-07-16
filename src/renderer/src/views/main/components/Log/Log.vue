<!--
 * @Date: 2025-06-12 22:37:10
 * @LastEditors: 羊驼
 * @LastEditTime: 2025-07-01 16:24:44
 * @FilePath: \electron-shell-manager\src\renderer\src\components\Log.vue
 * @Description: 日志管理
-->
<template>
  <div>
    <!-- <v-tabs v-model="tab">
      <v-tab :value="1">日志分析</v-tab>
      <v-tab :value="2">启动日志</v-tab>
      <v-tab :value="3">历史日志</v-tab>
    </v-tabs> -->
    <v-data-table-server
      v-model:items-per-page="page_size"
      v-model:page="current_page"
      :headers="headers"
      :items="logs"
      :items-length="total"
      :loading="loading"
      fixed-header
      style="max-height:90vh"
      item-value="name"
      @update:options="getLogList"
      no-data-text="暂无数据"
      :items-per-page="page_size"
      :items-per-page-options="sizeItems"
      :page-text="`第${current_page}页 ${page_size*current_page}/${total}`"
      items-per-page-text="每页数量"
    >
    </v-data-table-server>
  </div>
</template>
<script>
import moment from 'moment'
export default {
  inject: ['invoke', 'api'],
  data() {
    return {
      logs: [],
      headers: [
        {
          title: '日志类型',
          value: 'type'
        },
        {
          title: '日志级别',
          value: 'level'
        },
        {
          title: '日志详情',
          value: 'content'
        },
        {
          title: '时间',
          value: 'createdAt'
        }
      ],
      loading: false,
      current_page: 1,
      page_size: 10,
      sizeItems: [
        { value: 10, title: '10' },
        { value: 25, title: '25' },
        { value: 50, title: '50' },
        { value: 100, title: '100' }
      ],
      total: 0
    }
  },
  mounted() {
    this.getLogList()
  },
  methods: {
    async getLogList() {
      let res = await this.invoke(this.api.LOG.GET_LOG_LIST, {
        current_page: this.current_page,
        page_size: this.page_size
      })
      if (res.status) {
        this.logs = res.data.rows.map((x) => {
          return {
            ...x,
            createdAt: moment(x.createdAt).format('MM-DD HH:mm:ss')
          }
        })
        this.total = res.data.count
      }
    }
  }
}
</script>

<style lang="scss" scoped>
</style>