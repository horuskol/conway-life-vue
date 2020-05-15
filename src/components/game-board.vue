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

        <button type="button" @click.prevent="start">Start</button>
        <button type="button" @click.prevent="stop">Stop</button>
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

                map: [],

                timer: null,
                interval: 100
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
            },

            initialiseMap() {
                this.stop();

                for (let x = 1; x <= this.width; x++) {
                    Vue.set(this.map, x, []);
                    for (let y = 1; y <= this.width; y++) {
                        Vue.set(this.map[x], y, DEAD);
                    }
                }
            },

            start() {
                if (!this.timer) {
                    this.timer = setInterval(() => {
                        let neighbours = [];

                        for (let x = 1; x <= this.width; x++) {
                            neighbours[x] = [];
                            for (let y = 1; y <= this.width; y++) {
                                neighbours[x][y] = (() => {
                                    let sum = 0;
                                    for (let dx = -1; dx <= 1; dx++) {
                                        for (let dy = -1; dy <= 1; dy++) {
                                            if (this.map[x + dx] && this.map[x + dx][y + dy]) {
                                                if (this.map[x + dx][y + dy] === ALIVE) {
                                                    sum++;
                                                }
                                            }
                                        }
                                    }

                                    return sum;
                                })();
                            }
                        }

                        for (let x = 1; x <= this.width; x++) {
                            for (let y = 1; y <= this.width; y++) {
                                switch (this.map[x][y]) {
                                    case ALIVE:
                                        if (neighbours[x][y] < 3 || neighbours[x][y] > 4) {
                                            Vue.set(this.map[x], y, DEAD);
                                        }
                                        break;

                                    case DEAD:
                                        if (neighbours[x][y] === 3) {
                                            Vue.set(this.map[x], y, ALIVE);
                                        }
                                }
                            }
                        }
                    }, this.interval);
                }
            },

            stop() {
                clearInterval(this.timer);
                this.timer = null;
            }
        },

        watch: {
            height() {
                this.initialiseMap();
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

