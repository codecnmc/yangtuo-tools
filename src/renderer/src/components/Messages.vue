<template>
  <v-snackbar-queue
    v-model="messages"
    :timeout="1500"
    location="top center"
    position="fixed"
    content-class="snack"
  >
    <template #text="{item}">
      <div class="d-flex align-center">
        <v-icon>{{item.type=="info"?"mdi-information":item.type=="success"?"mdi-check-circle":"mdi-alert-circle"}}</v-icon>
        <div
          class="mx-2"
          style="max-width:300px;word-break:break-all"
        >{{item.message}}</div>
      </div>
    </template>
  </v-snackbar-queue>
</template>

<script>
export default {
  props: ['modelValue'],
  model: {
    event: 'update:modelValue',
    trigger: 'change'
  },
  computed: {
    messages: {
      get() {
        return this.modelValue
      },
      set(value) {
        this.$emit('update:modelValue', value)
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.snack {
  transform: translateX(-25%);
}
</style>