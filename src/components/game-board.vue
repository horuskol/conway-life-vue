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
          :class="{ alive: map[x][y] === 'alive' }"
          @click="toggleCell(x,y)"
      >
      </div>
    </div>
  </div>
</template>

<script>
    import Vue from 'vue';

    const ALIVE = 'alive';
    const DEAD = 'dead';

    export default {
        data() {
            return {
                height: 0,
                width: 0,
                cellSize: '40px',

                map: []
            }
        },

        methods: {
            toggleCell(x, y) {
                switch (this.map[x][y]) {
                    case DEAD:
                        Vue.set(this.map[x], y, ALIVE);
                        break;

                    case ALIVE:
                        Vue.set(this.map[x], y, DEAD);
                        break;
                }

                console.log(x, y, this.map[x][y]);
            },

            initialiseMap() {
                for (let x = 1; x <= this.width; x++) {
                    Vue.set(this.map, x, []);
                    for (let y = 1; y <= this.width; y++) {
                        Vue.set(this.map[x], y, DEAD);
                    }
                }
            }
        },

        watch: {
            height() {
                this.initialiseMap();

                console.log(this.map);
            },

            width() {
                this.initialiseMap();
            }
        },

        mounted() {
            this.height = 10;
            this.width = 10;
            this.initialiseMap();
        }
    };
</script>

<style>
  form {
    display: grid;
    grid-template-columns: 8rem 8rem;
    grid-gap: 0.5rem;
  }

  .alive {
    background-color: black;
  }
</style>

