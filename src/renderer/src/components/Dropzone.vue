<template>
  <div
    ref="zone"
    class="drop-zone"
    :class="{active}"
  >
    <v-icon class="mr-2">mdi-selection-drag</v-icon>拖拽文件到这里
  </div>
</template>

<script>
export default {
  emits: ['end'],
  data() {
    return {
      active: false
    }
  },
  mounted() {
    const dropZone = this.$refs.zone
    dropZone.addEventListener('dragover', this.dragover)
    dropZone.addEventListener('dragleave', this.dragleave)
    dropZone.addEventListener('drop', this.drop)
  },
  beforeUnmount() {
    const dropZone = this.$refs.zone
    dropZone.removeEventListener('dragover', this.dragover)
    dropZone.removeEventListener('dragleave', this.dragleave)
    dropZone.removeEventListener('drop', this.drop)
  },
  methods: {
    dragover(e) {
      e.preventDefault()
      this.active = true
    },
    dragleave(e) {
      e.preventDefault()
      this.active = false
    },
    async drop(e) {
      e.preventDefault()
      const files = e.dataTransfer.files
      let result = []
      for (let file of files) {
        const filePath = await window.getPathForFile(file)
        result.push({
          name: file.name,
          type: file.type,
          size: file.size,
          path: filePath
        })
      }
      this.$emit('end', result)
    }
  }
}
</script>

<style lang="scss" scoped>
.drop-zone {
  display: flex;
  justify-content: center;
  align-items: center;
  border-radius: 4px;
  border: 3px dotted #666;
  width: 100%;
  height: 100%;
  text-align: center;
  color: #666;
  font-size: 18px;
  pointer-events: all;
  cursor: grabbing;
}
.active {
  border: 3px dotted rgb(var(--v-theme-primary)) !important;
}
</style>