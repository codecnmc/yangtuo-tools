<template>
  <div v-if="refresh">
    <!-- 使用动态组件 -->
    <component
      :is="tag"
      ref="drag"
      v-bind="$attrs"
      v-on="listeners"
      :class="{'d-flex':flex,'flex-wrap':flexWrap,'grid-container':grid}"
    >
      <div
        v-if="$slots.header"
        class="disabled-filter"
      >
        <slot name="header" />
      </div>
      <slot></slot>
      <div
        v-if="$slots.footer"
        class="disabled-filter"
      >
        <slot name="footer" />
      </div>
    </component>
  </div>
</template>
<script>
import Sortable from 'sortablejs'
export default {
  props: {
    // v-model绑定
    modelValue: {
      type: Object,
      default: () => {
        return {}
      }
    },
    // 自定义的tag组件
    tag: {
      type: String,
      default: 'div'
    },
    // 绑定到动态组件上的数据
    componentData: {
      type: Object,
      default: () => {
        return {
          on: {},
          attrs: {},
          props: {}
        }
      }
    },
    // 处理move事件 为了能拿到返回值
    move: {
      type: Function,
      default: () => true
    },
    flex: {
      type: Boolean,
      default: false
    },
    flexWrap: {
      type: Boolean,
      default: false
    },
    grid: {
      type: Boolean,
      default: false
    }
  },
  // 监听事件 映射回sortable配置上响应
  emits: [
    'update:modelValue',
    'endEvent',
    'chooseEvent',
    'unchooseEvent',
    'startEvent',
    'onSetEvent',
    'addEvent',
    'updateEvent',
    'sortEvent',
    'removeEvent',
    'filterEvent',
    'cloneEvent',
    'changeEvent'
  ],
  data() {
    return {
      // 用于重渲染的标志位
      refresh: true,
      // sortable实例
      sort: null,
      cache: JSON.stringify([])
    }
  },
  computed: {
    // 映射model数据的操作
    list: {
      get() {
        return this.modelValue
      },
      set(value) {
        this.$emit('update:modelValue', value)
      }
    },
    // :is 中 props和attrs 是直接写在标签上的 所以直接合并
    attrs() {
      let { attrs = {}, props = {} } = this.componentData
      return { ...attrs, ...props }
    },
    // v-on 形式上的事件映射 需要+on
    listeners() {
      return this.componentData && this.componentData.on
    },
    // 如果有header 则索引+1
    slotIndex() {
      return this.$slots.header ? 1 : 0
    }
  },
  watch: {
    // 监听数据变化 重新渲染数组
    list: {
      handler(nv, ov) {
        if (nv.length == JSON.parse(this.cache).length) return
        // 判断原实例是否存在并销毁
        this.sort && this.sort.destroy()
        // 重新渲染
        this.createSort()
        this.cache = JSON.stringify(nv)
      },
      deep: true
    }
  },
  mounted() {
    this.createSort()
  },
  methods: {
    // 处理索引
    handleIndex(evt) {
      if (evt.oldIndex !== null) evt.oldIndex -= this.slotIndex
      if (evt.newIndex !== null) evt.newIndex -= this.slotIndex
      if (evt.newDraggableIndex !== null) evt.newDraggableIndex -= this.slotIndex
      if (evt.oldDraggableIndex !== null) evt.oldDraggableIndex -= this.slotIndex
    },
    // 创建拖拽
    createSort() {
      this.refresh = false
      // 等到下一帧重渲染
      this.$nextTick(() => {
        this.refresh = true
        // 这次也要等待 不然dom还没生成出来
        requestAnimationFrame(() => {
          // console.log(this.$refs.drag);
          let dom = this.$refs.drag
          if (!dom) return new Error('未找到dom')
          // 为什么不用ref 因为只有正常标签下拿的的dom 其他拿的是组件数据 $el才能拿到dom 不如直接用id
          // 对外部事件进行emit调用
          this.sort = new Sortable(dom, {
            ...this.$attrs,
            filter: '.disabled-filter,' + this.$attrs.filter,
            setData: (/** DataTransfer */ dataTransfer, /** HTMLElement*/ dragEl) => {
              this.$emit('onSetEvent', dataTransfer, dragEl)
            },

            // 元素被选中
            onChoose: (/**Event*/ evt) => {
              this.handleIndex(evt)
              this.$emit('chooseEvent', evt)
            },

            // 元素未被选中的时候（从选中到未选中）
            onUnchoose: (/**Event*/ evt) => {
              this.handleIndex(evt)
              this.$emit('unchooseEvent', evt)
            },

            // 开始拖拽的时候
            onStart: (/**Event*/ evt) => {
              this.handleIndex(evt)
              this.$emit('startEvent', evt)
            },

            // 结束拖拽 处理数据源
            onEnd: (/**Event*/ evt) => {
              this.handleIndex(evt)
              let { oldIndex, newIndex, to, from } = evt
              const currentRow = this.list.splice(oldIndex, 1)[0]
              currentRow && this.list.splice(newIndex, 0, currentRow)
              // evt.clone && evt.clone.remove()
              this.createSort()
              // console.log(this.list)
              this.$emit('endEvent', evt)
            },

            // 元素从一个列表拖拽到另一个列表
            onAdd: (/**Event*/ evt) => {
              this.handleIndex(evt)

              this.$emit('addEvent', evt)
            },

            // 列表内元素顺序更新的时候触发
            onUpdate: (/**Event*/ evt) => {
              this.handleIndex(evt)

              this.$emit('updateEvent', evt)
            },

            // 列表的任何更改都会触发
            onSort: (/**Event*/ evt) => {
              this.handleIndex(evt)

              this.$emit('sortEvent', evt)
            },

            // 元素从列表中移除进入另一个列表
            onRemove: (/**Event*/ evt) => {
              let { oldIndex, newIndex, to, from } = evt
              const currentRow = this.list.splice(oldIndex, 1)[0]
              this.handleIndex(evt)
              this.$emit('removeEvent', evt)
            },

            // 试图拖拽一个filtered的元素
            onFilter: (/**Event*/ evt) => {
              this.handleIndex(evt)
              this.$emit('filterEvent', evt)
            },

            // 拖拽移动的时候 这个特别处理从props传入 因为要获取判定
            onMove: (/**Event*/ evt, /**Event*/ originalEvent) => {
              this.handleIndex(evt)
              let result = this.move(evt, originalEvent)
              // 去除经过头尾插槽的经过效果
              if (evt.related.classList.contains('disabled-filter')) {
                return false
              }
              return result
            },

            // clone一个元素的时候触发
            onClone: (/**Event*/ evt) => {
              this.handleIndex(evt)
              this.$emit('cloneEvent', evt)
            },

            // 拖拽元素改变位置的时候
            onChange: (/**Event*/ evt) => {
              this.handleIndex(evt)
              this.$emit('changeEvent', evt)
            }
          })
        })
      })
    }
  }
}
</script>