<!--
 * @Author: 羊驼
 * @Date: 2025-08-26 15:44:19
 * @LastEditors: 羊驼
 * @LastEditTime: 2025-08-27 15:01:03
 * @Description: file content0
-->
<template>
  <div class="search">
    <!-- 点击其他地方隐藏对话框 -->
    <div
      class="search-bg"
      @click="hide"
    ></div>
    <div
      class="search-input"
      v-if="refresh"
    >
      <v-autocomplete
        :items="tools"
        density="comfortable"
        :placeholder="$t('search_placeholder')"
        prepend-inner-icon="mdi-magnify"
        hide-details
        @keydown.esc="hide"
        theme="light"
        ref="searchInput"
        variant="solo"
        :no-data-text="$t('no_data_text')"
        rounded
        clearable
        item-title="displayName"
        autofocus
        menu
        return-object
        :disabled="loading"
        @update:modelValue="selectChange"
        :loading="loading"
      >
        <template v-slot:item="{ props, item }">
          <v-list-item
            v-bind="props"
            :subtitle="item.raw.name"
            :title="getTitle(item)"
          ></v-list-item>
        </template>
      </v-autocomplete>
    </div>
  </div>
</template>

<script>
export default {
  inject: ['api', 'on', 'invoke', 'remove'],
  data() {
    return {
      tools: [],
      refresh: true,
      loading: false,
      devTool: null
    }
  },
  mounted() {
    this.remove(api.SEARCH.SHOW, this.focus)
    this.on(api.SEARCH.SHOW, this.focus)
  },
  unmounted() {
    this.remove(api.SEARCH.SHOW, this.focus)
  },
  methods: {
    getTitle(item) {
      let title = item.raw.displayName
      if (this.devTool && this.devTool.name==item.raw.name) {
        title += `（${this.$t('development')}）`
        return title
      }
      return `${title}（${item.raw.enable?this.$t('enable'):this.$t('disabled')}）`
    },
    focus() {
      this.refresh = false
      this.$nextTick(async () => {
        let res = await this.invoke(api.TOOLS.GET_TOOLS_LIST)
        this.tools = res.data
        let dev = await this.invoke(api.TOOLS.TOOLS_DEV_STATUS)
        this.devTool = dev
        this.refresh = true
        this.$refs.searchInput && this.$refs.searchInput.focus()
      })
    },
    hide() {
      if (this.loading) return
      this.invoke(api.SEARCH.HIDE)
    },
    async selectChange(value) {
      if (!value) return
      this.loading = true
      await this.invoke(this.api.SEARCH.SELECT, value)
      this.loading = false
    }
  }
}
</script>

<style scoped>
.search {
  width: 100vw;
  height: 100vh;
  background-color: rgba(0, 0, 0, 0.1);
}
.search-bg {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  z-index: 999;
}
.search-input {
  position: fixed;
  top: 10vh;
  left: 50%;
  transform: translateX(-50%);
  width: 50vw;
  max-width: 500px;
  margin: 0 auto;
  z-index: 1000;
}
</style>