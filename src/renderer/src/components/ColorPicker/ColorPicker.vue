<template>
  <v-menu>
    <template v-slot:activator="{ props }">
      <div
        class="d-flex"
        v-bind="$attrs"
      >
        <span class="mr-2"> {{label}}</span>
        <div
          v-bind="props"
          class="color-picker"
        >
          <div
            class="color"
            :style="{backgroundColor:color}"
          ></div>
        </div>
      </div>
    </template>
    <v-sheet>
      <v-color-picker
        v-model="setColor"
        @click.stop
      ></v-color-picker>
    </v-sheet>
  </v-menu>

</template>

<script>
export default {
  props: ['color', 'label'],
  computed: {
    setColor: {
      get() {
        return this.color
      },
      set(val) {
        this.$emit('update:color', val)
      }
    }
  }
}
</script>

<style>
.color-picker {
  border: 1px solid #eee;
  width: 24px;
  height: 24px;
  background: url('./src/mask.png') repeat;
}
.color {
  width: 100%;
  height: 100%;
}
</style>