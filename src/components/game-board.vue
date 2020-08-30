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

            <button class="block w-full my-2 py-2 px-4 bg-white hover:bg-gray-100 text-gray-800 font-semibold border border-gray-400 rounded shadow" v-if="state !== RUNNING" type="button" @click.prevent="start">Start</button>
            <button class="block w-full my-2 py-2 px-4 bg-white hover:bg-gray-100 text-gray-800 font-semibold border border-gray-400 rounded shadow" v-if="state === RUNNING" type="button" @click.prevent="stop">Stop</button>

            <button class="block w-full my-2 py-2 px-4 bg-white hover:bg-gray-100 text-gray-800 font-semibold border border-gray-400 rounded shadow" type="button" @click.prevent="clear">Clear</button>
            <button class="block w-full my-2 py-2 px-4 bg-white hover:bg-gray-100 text-gray-800 font-semibold border border-gray-400 rounded shadow" type="button" @click.prevent="random">Random</button>
        </form>

        <div ref="canvas-container" :style="{width: width * cellSize}" class="m-4">
            <canvas ref="canvas" :width="width * cellSize" :height="height * cellSize" @mousedown="startSelectingCells" @mouseup="endSelectingCells" @mousemove="setCell"></canvas>
        </div>
    </div>
</template>

<script>
import Vue from 'vue';

const ALIVE = 'alive';
const DEAD = 'dead';

const RUNNING = 'running';
const STOPPED = 'stopped';
const PAUSED = 'paused';


// loads the selected url and converts it to a PNG with the specified height and width
// this is because when we copy the alive/dead images in the grid using the original SVGs, it gets really slow
// this way, we get the advantage of sizing the SVG to match the cellSize,
// but with a speed advantage when copying hundreds of them in the map.
function loadImage(url, height, width) {
    return new Promise((resolve, reject) => {
        let image = new Image();

        image.onload = () => {
            let png = new Image();
            let cnv = document.createElement('canvas');
            let ctx = cnv.getContext('2d');

            ctx.drawImage(image, 0, 0, height, width);
            png.src = cnv.toDataURL();
            resolve(png);
        }
        image.onerror = reject;

        image.src = url;
    });
}

export default {
    data() {
        return {
            height: 40,
            width: 40,
            cellSize: 20,

            map: [],

            timer: null,
            interval: 100,

            state: STOPPED,

            STOPPED,
            RUNNING,

            cellAction: null,

            images: {}
        }
    },

    methods: {
        drawCell(x, y, state) {
            let context = this.$refs.canvas.getContext('2d');

            context.drawImage(this.images[state], (x * this.cellSize), (y * this.cellSize));
        },

        startSelectingCells(event) {
            this.pause();

            const x = Math.floor((event.pageX - event.target.offsetLeft) / this.cellSize);
            const y = Math.floor((event.pageY - event.target.offsetTop) / this.cellSize);

            switch (this.map[x][y]) {
                case DEAD:
                    this.map[x][y] = ALIVE;
                    this.cellAction = ALIVE;
                    break;

                case ALIVE:
                    this.map[x][y] = DEAD;
                    this.cellAction = DEAD;
                    break;
            }

            this.drawCell(x, y, this.map[x][y]);
        },

        setCell(event) {
            if (this.cellAction) {
                const x = Math.floor((event.pageX - event.target.offsetLeft) / this.cellSize);
                const y = Math.floor((event.pageY - event.target.offsetTop) / this.cellSize);

                this.map[x][y] = this.cellAction;
                this.drawCell(x, y, this.map[x][y]);
            }
        },

        endSelectingCells(event) {
            this.cellAction = null;

            this.resume();
        },

        initialiseMap() {
            const oldMap = this.map;
            this.map = [];

            for (let x = 0; x < this.width; x++) {
                Vue.set(this.map, x, []);

                for (let y = 0; y < this.height; y++) {
                    if (typeof oldMap[x] === 'undefined' || typeof oldMap[x][y] === 'undefined') {
                        Vue.set(this.map[x], y, DEAD);
                    } else {
                        Vue.set(this.map[x], y, oldMap[x][y]);
                    }
                    this.drawCell(x, y, this.map[x][y]);
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

        pause() {
            if (this.state === RUNNING) {
                this.state = PAUSED;
                clearInterval(this.timer);
                this.timer = null;
            }
        },

        resume() {
            if (this.state === PAUSED) {
                this.start();
            }
        },

        clear() {
            this.stop();
            this.map = [];
            this.initialiseMap();
        },

        random() {
            this.stop();
            this.clear();

            const start = Date.now();

            for (let x = 0; x < this.width; x++) {
                for (let y = 0; y < this.height; y++) {
                    Vue.set(this.map[x], y, DEAD);

                    if (Math.floor(Math.random() * 2) === 1) {
                        Vue.set(this.map[x], y, ALIVE);
                    }

                    this.drawCell(x, y, this.map[x][y]);
                }
            }
        }
    },

    watch: {
        height() {
            this.pause();
            Vue.nextTick(() => {
                // delay redrawing the grid to prevent the canvas resize wiping it away again
                this.initialiseMap();
                this.resume();
            });
        },

        width() {
            this.pause();
            Vue.nextTick(() => {
                // delay redrawing the grid to prevent the canvas resize wiping it away again
                this.initialiseMap();
                this.resume();
            });
        },

async cellSize() {
    this.pause();

    this.images = {
        'alive': await loadImage("./img/alive.svg", this.cellSize, this.cellSize),
        'dead': await loadImage("./img/dead.svg", this.cellSize, this.cellSize),
    }

    Vue.nextTick(() => {
        // delay redrawing the grid to prevent the canvas resize wiping it away again
        this.initialiseMap();
        this.resume();
    });
},

        interval() {
            this.pause();
            this.resume();
        }
    },

    async mounted() {
        this.images = {
            'alive': await loadImage("./img/alive.svg", this.cellSize, this.cellSize),
            'dead': await loadImage("./img/dead.svg", this.cellSize, this.cellSize),
        }

        this.initialiseMap();
    }
};
</script>

