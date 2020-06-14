import './app.css';

import Vue from 'vue';

import GameBoard from './components/game-board';

Vue.component('game-board', GameBoard);

var app = new Vue({
    el: '#app'
});
