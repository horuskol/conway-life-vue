<template>
    <div class="flex flex-row h-full w-auto">
        <form style="width: 14rem" class="sticky left-0 p-4 bg-white">
            <label for="height" class="font-semibold">
                Number of rows
            </label>
            <input class="bg-white focus:outline-none focus:shadow-outline border border-gray-300 rounded-lg py-2 px-4 mt-2 mb-8 block w-full appearance-none leading-normal text-right" id="height" type="number" min="10" v-model="height"/>

            <label for="width" class="font-semibold">
                Number of columns
            </label>
            <input class="bg-white focus:outline-none focus:shadow-outline border border-gray-300 rounded-lg py-2 px-4 mt-2 mb-8 block w-full appearance-none leading-normal text-right" id="width" type="number" min="10" v-model="width"/>

            <label for="cellSize" class="font-semibold">
                Size of cells (px)
            </label>
            <input class="bg-white focus:outline-none focus:shadow-outline border border-gray-300 rounded-lg py-2 px-4 mt-2 mb-8 block w-full appearance-none leading-normal text-right" id="cellSize" type="number" min="10" v-model="cellSize"/>

            <label for="interval" class="font-semibold">
                Time interval between generations (ms)
            </label>
            <input class="bg-white focus:outline-none focus:shadow-outline border border-gray-300 rounded-lg py-2 px-4 mt-2 mb-8 block w-full appearance-none leading-normal text-right" id="interval" type="number" step="25" min="100" v-model="interval"/>

            <button class="block w-full my-2 py-2 px-4 bg-white hover:bg-gray-100 text-gray-800 font-semibold border border-gray-400 rounded shadow" v-if="state === STOPPED" type="button" @click.prevent="start">Start</button>
            <button class="block w-full my-2 py-2 px-4 bg-white hover:bg-gray-100 text-gray-800 font-semibold border border-gray-400 rounded shadow" v-if="state === RUNNING" type="button" @click.prevent="stop">Stop</button>

            <button class="block w-full my-2 py-2 px-4 bg-white hover:bg-gray-100 text-gray-800 font-semibold border border-gray-400 rounded shadow" type="button" @click.prevent="clear">Clear</button>
        </form>

        <div ref="canvas-container" :style="{width: width * cellSize}" class="m-4">
            <canvas ref="canvas" :width="width * cellSize" :height="height * cellSize" @click="canvasClicked"></canvas>
        </div>
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

            state: STOPPED,

            STOPPED,
            RUNNING
        }
    },

    methods: {
        drawGrid() {
            let context = this.$refs.canvas.getContext('2d');

            context.clearRect(0, 0, context.canvas.width, context.canvas.height);
            context.strokeStyle = '#cccccc';

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

            // fill the grid square but leave the grid outline
            context.fillRect(
                (x * this.cellSize) + 1,
                (y * this.cellSize) + 1,
                this.cellSize - 2,
                this.cellSize - 2
            );
        },

        canvasClicked(event) {
            this.toggleCell(
                Math.floor((event.pageX - event.target.offsetLeft) / this.cellSize),
                Math.floor((event.pageY - event.target.offsetTop) / this.cellSize),
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


                    // Basic Conway rules:
                    // - Live cell with two or three live neighbours will survive
                    // - Dead cell with three neighbours will become alive
                    // - Anything else is dead
                    for (let x = 0; x < this.width; x++) {
                        for (let y = 0; y < this.height; y++) {
                            switch (this.map[x][y]) {
                                case ALIVE:
                                    // Live cell with two or three live neighbours will survive
                                    if (neighbours[x][y] < 3 || neighbours[x][y] > 4) {
                                        Vue.set(this.map[x], y, DEAD);
                                    }
                                    break;

                                case DEAD:
                                    // Dead cell with three neighbours will become alive
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
                // delay redrawing the grid to prevent the canvas resize wiping it away again
                this.drawGrid();
                this.initialiseMap();
            });
        },

        width() {
            Vue.nextTick(() => {
                // delay redrawing the grid to prevent the canvas resize wiping it away again
                this.drawGrid();
                this.initialiseMap();
            });
        },

        cellSize() {
            Vue.nextTick(() => {
                // delay redrawing the grid to prevent the canvas resize wiping it away again
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

