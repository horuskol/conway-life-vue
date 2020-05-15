<template>
  <div>
    <div v-for="x in width" style="display: inline-block">
      <div v-for="y in height" style="border: 1px solid gray" :style="{ height: cellSize, width: cellSize }"></div>
    </div>
  </div>
</template>

<script>
export default {
  data() {
      return {
          height: 10,
          width: 10,
          cellSize: '40px'
      }
  }
};
</script>
