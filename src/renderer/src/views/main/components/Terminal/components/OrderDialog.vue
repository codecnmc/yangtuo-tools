<template>
  <v-dialog
    v-model="visible"
    width="450px"
  >
    <v-card>
      <v-card-title>启动顺序调整（下次启动生效）</v-card-title>
      <v-card-text>
        <div class="shells">
          <draggable
            handle=".mdi-drag"
            v-model="form"
          >
            <div
              v-for="item,index in form"
              :key="index"
              class="py-2"
            >
              <v-icon class="cursor-pointer">mdi-drag</v-icon>
              <span>{{item.name}}</span>
            </div>
          </draggable>
        </div>
        <v-card-actions class="d-flex justify-end">
          <v-btn
            flat
            :loading="loading"
            @click="visible = false"
          >关闭</v-btn>
          <v-btn
            color="primary"
            class="ml-4"
            @click="submit"
            :loading="loading"
          >提交</v-btn>
        </v-card-actions>
      </v-card-text>
    </v-card>
  </v-dialog>
</template>

<script>
import Draggable from '@renderer/components/Draggable.vue'
export default {
  inject: ['message', 'invoke', 'api'],
  components: { Draggable },
  data() {
    return {
      // 对话框显示
      visible: false,
      // 提交加载状态显示
      loading: false,
      // 当前表单数据
      form: []
    }
  },
  computed: {
    shells() {
      return this.$store.shells
    }
  },
  methods: {
    // 打开调整启动顺序对话框
    open() {
      this.visible = true
      this.form = JSON.parse(JSON.stringify(this.shells))
    },
    // 提交调整启动顺序
    async submit() {
      this.loading = true
      this.form = this.form.map((item, index) => {
        return {
          ...item,
          order: index + 1
        }
      })
      let res = await this.invoke(this.api.SHELL.EDIT_SHELL, this.form, {
        immediately: false,
        order: false
      })
      this.message({ type: res.status ? 'success' : 'error', message: res.message })
      if (res.status) {
        // this.$store.getShellList()
        this.visible = false
      }
      this.loading = false
    }
  }
}
</script>

<style lang="scss" scoped>
.shells {
  max-height: 50vh;
  overflow: auto;
}
</style>