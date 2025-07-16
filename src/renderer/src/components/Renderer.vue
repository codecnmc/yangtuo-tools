<script>
import {
  h,
  defineComponent,
  ref,
  nextTick,
  useAttrs,
  watch,
  computed,
  useSlots,
  onMounted,
  toRefs,
  getCurrentInstance
} from 'vue'
import Sortable from 'sortablejs'
export default defineComponent({
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
  setup(props, { emit }) {
    // 处理props和model
    let { tag, componentData, move } = props
    let { modelValue } = toRefs(props)
    let sort = ref(null)
    let refresh = ref(true)
    // 计算列表数据
    const list = computed({
      get() {
        return modelValue.value
      },
      set(value) {
        emit('update:modelValue', value)
      }
    })
    // 获取$attrs的数据
    const attrs = useAttrs()
    const slots = useSlots()
    // 计算增加的索引
    const slotIndex = computed(() => {
      return slots.header ? 1 : 0
    })
    const handleIndex = (evt) => {
      if (evt.oldIndex !== null) evt.oldIndex -= slotIndex.value
      if (evt.newIndex !== null) evt.newIndex -= slotIndex.value
      if (evt.newDraggableIndex !== null) evt.newDraggableIndex -= slotIndex.value
      if (evt.oldDraggableIndex !== null) evt.oldDraggableIndex -= slotIndex.value
    }
    // 渲染拖拽事件
    const createSort = () => {
      sort.value && sort.value.destroy()
      refresh.value = false
      nextTick(() => {
        refresh.value = true
        requestAnimationFrame(() => {
          sort.value = new Sortable(document.querySelector('#custom-draggable'), {
            ...attrs.value,
            filter: '.disabled-filter,' + attrs.filter,
            setData: (/** DataTransfer */ dataTransfer, /** HTMLElement*/ dragEl) => {
              emit('onSetEvent', dataTransfer, dragEl)
            },

            // 元素被选中
            onChoose: (/**Event*/ evt) => {
              handleIndex(evt)
              emit('chooseEvent', evt)
            },

            // 元素未被选中的时候（从选中到未选中）
            onUnchoose: (/**Event*/ evt) => {
              handleIndex(evt)
              emit('unchooseEvent', evt)
            },

            // 开始拖拽的时候
            onStart: (/**Event*/ evt) => {
              handleIndex(evt)
              emit('startEvent', evt)
            },

            // 结束拖拽
            onEnd: (/**Event*/ evt) => {
              handleIndex(evt)
              let { oldIndex, newIndex } = evt
              const currentRow = list.value.splice(oldIndex, 1)[0]
              list.value.splice(newIndex, 0, currentRow)
              emit('endEvent', evt)
            },

            // 元素从一个列表拖拽到另一个列表
            onAdd: (/**Event*/ evt) => {
              handleIndex(evt)
              emit('addEvent', evt)
            },

            // 列表内元素顺序更新的时候触发
            onUpdate: (/**Event*/ evt) => {
              handleIndex(evt)
              emit('updateEvent', evt)
            },

            // 列表的任何更改都会触发
            onSort: (/**Event*/ evt) => {
              handleIndex(evt)
              emit('sortEvent', evt)
            },

            // 元素从列表中移除进入另一个列表
            onRemove: (/**Event*/ evt) => {
              handleIndex(evt)
              emit('removeEvent', evt)
            },

            // 试图拖拽一个filtered的元素
            onFilter: (/**Event*/ evt) => {
              handleIndex(evt)
              emit('filterEvent', evt)
            },

            // 拖拽移动的时候
            onMove: (/**Event*/ evt, /**Event*/ originalEvent) => {
              handleIndex(evt)
              let result = move(evt, originalEvent)
              // 去除经过头尾插槽的经过效果
              if (evt.related.classList.contains('disabled-filter')) {
                return false
              }
              return result
            },

            // clone一个元素的时候触发
            onClone: (/**Event*/ evt) => {
              handleIndex(evt)
              emit('cloneEvent', evt)
            },

            // 拖拽元素改变位置的时候
            onChange: (/**Event*/ evt) => {
              handleIndex(evt)
              emit('changeEvent', evt)
            }
          })
        })
      })
    }

    // 监听变动
    watch(
      list,
      () => {
        createSort()
      },
      {
        deep: true
      }
    )

    onMounted(() => {
      createSort()
    })

    // 获取外部tag是不是注册的组件 这里有坑
    const transformComponent = () => {
      // 获取用户输入的带-的标签转换为驼峰
      let components = getCurrentInstance().appContext.components
      // 首字母大写
      let tagName = tag.replace(/-(\w)/g, (_, letter) => letter.toUpperCase())
      // 可能是多个斜杠
      let getName = tagName.charAt(0).toUpperCase() + tagName.slice(1)
      if (!components[getName]) {
        console.error(`组件${getName}不存在`)
        return tag
      }
      return components[getName]
    }
    return () => {
      // 处理渲染数据
      return refresh.value
        ? h(
            transformComponent(),
            {
              id: 'custom-draggable',
              ...(componentData.attrs || {}),
              ...(componentData.props || {}),
              ...(componentData.on || {})
            },
            [
              // 具名插槽header,
              slots.header ? h('div', { class: 'disabled-filter' }, slots.header()) : null,
              // 插槽渲染
              slots.default(),
              slots.footer ? h('div', { class: 'disabled-filter' }, slots.footer()) : null
            ]
          )
        : h('div')
    }
  }
})
</script>