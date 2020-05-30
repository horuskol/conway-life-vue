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

            <label for="interval">
                interval
            </label>
            <input id="interval" type="text" v-model="interval"/>

            <button type="button" @click.prevent="start">Start</button>
            <button type="button" @click.prevent="stop">Stop</button>
            <button type="button" @click.prevent="clear">Clear</button>
        </form>

        <p>{{ state }}</p>

        <canvas ref="canvas" :width="width * cellSize" :height="height * cellSize" @click="canvasClicked"></canvas>
    </div>
</template>

<script>
import Vue from 'vue';

const ALIVE = 'alive';
const DEAD = 'dead';

const RUNNING = 'running';
const STOPPED = 'stopped';

export default {
    data() {
        return {
            height: 10,
            width: 10,
            cellSize: 40,

            map: [],

            timer: null,
            interval: 100,

            state: STOPPED
        }
    },

    methods: {
        drawGrid() {
            let context = this.$refs.canvas.getContext('2d');

            context.clearRect(0, 0, context.canvas.width, context.canvas.height);

            for (let x = 0; x < this.width; x++) {
                for (let y = 0; y < this.height; y++) {
                    context.strokeRect(
                        x * this.cellSize,
                        y * this.cellSize,
                        this.cellSize,
                        this.cellSize
                    );
                }
            }
        },

        drawCell(x, y, state) {
            let context = this.$refs.canvas.getContext('2d');

            switch (state) {
                case DEAD:
                    context.fillStyle = 'white';
                    break;

                case ALIVE:
                    context.fillStyle = 'black';
                    break;
            }

            context.fillRect(
                (x * this.cellSize) + 1,
                (y * this.cellSize) + 1,
                this.cellSize - 2,
                this.cellSize - 2
            );
        },

        canvasClicked(event) {
            this.toggleCell(
                Math.floor((event.clientX - event.target.offsetLeft) / this.cellSize),
                Math.floor((event.clientY - event.target.offsetTop) / this.cellSize),
            )
        },

        toggleCell(x, y) {
            switch (this.map[x][y]) {
                case DEAD:
                    Vue.set(this.map[x], y, ALIVE);
                    break;

                case ALIVE:
                    Vue.set(this.map[x], y, DEAD);
                    break;
            }

            this.drawCell(x, y, this.map[x][y]);
        },

        initialiseMap() {
            this.stop();

            for (let x = 0; x < this.width; x++) {
                Vue.set(this.map, x, []);
                for (let y = 0; y < this.height; y++) {
                    Vue.set(this.map[x], y, DEAD);
                }
            }
        },

        start() {
            this.state = RUNNING;

            if (!this.timer) {
                this.timer = setInterval(() => {
                    let neighbours = [];

                    for (let x = 0; x < this.width; x++) {
                        neighbours[x] = [];
                        for (let y = 0; y < this.height; y++) {
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

                    for (let x = 0; x < this.width; x++) {
                        for (let y = 0; y < this.height; y++) {
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

                            this.drawCell(x, y, this.map[x][y]);
                        }
                    }
                }, this.interval);
            }
        },

        stop() {
            this.state = STOPPED;
            clearInterval(this.timer);
            this.timer = null;
        },

        clear() {
            this.drawGrid();
            this.initialiseMap();
        }
    },

    watch: {
        height() {
            Vue.nextTick(() => {
                this.drawGrid();
                this.initialiseMap();
            });
        },

        width() {
            Vue.nextTick(() => {
                this.drawGrid();
                this.initialiseMap();
            });
        },

        cellSize() {
            Vue.nextTick(() => {
                this.drawGrid();
                this.initialiseMap();
            });
        },

        interval() {
            this.stop();
            this.start();
        }
    },

    mounted() {
        this.drawGrid();
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

