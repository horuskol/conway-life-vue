<template>
  <div>
      <form>
        <label for="height">
          height
        </label>
        <input id="height" type="text" v-model="height"/>

        <label for="width">
          width
        </label>
        <input id="width" type="text" v-model="width"/>

        <label for="cellSize">
          cellSize
        </label>
        <input id="cellSize" type="text" v-model="cellSize"/>
      </form>

    <div v-for="x in (width * 1)" style="display: inline-block">
      <div
          v-for="y in (height * 1)"
          style="border: 1px solid gray"
          :style="{ height: cellSize, width: cellSize }"
      >
      </div>
    </div>
  </div>
</template>

<script>
    export default {
        data() {
            return {
                height: 10,
                width: 10,
                cellSize: '40px',
            }
        }
    };
</script>

<style>
  form {
    display: grid;
    grid-template-columns: 8rem 8rem;
    grid-gap: 0.5rem;
  }
</style>

