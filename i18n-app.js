import Vue from 'vue'
import VueRouter from 'vue-router'
import Vuex from 'vuex'
import Promise from 'promise-polyfill'

import App from './i18n-app.vue'

import './i18n-app.less'

Vue.use(Vuex)
Vue.use(VueRouter)

const router = new VueRouter({
    mode: 'history'
})

const store = new Vuex.Store({
    state: {
        currentFile: '',
        langs: ['CN', 'EN', 'KR'],
        currentLang: 'CN',
        transferTo: [],
        originI18nData: null,
        i18nData: null,
        editing: false,
        apis: {
            baidu: '百度',
            youdao: '有道',
        },
        currentApi: 'baidu',
    },

    mutations: {
        currentFile(state, data){
            state.currentFile = data
        },
        langs(state, data){
            state.langs = data
        },
        currentLang(state, data){
            state.currentLang = data
        },
        transferTo(state, data){
            state.transferTo = data
        },
        originI18nData(state, data){
            state.originI18nData = data
        },
        i18nData(state, data){
            state.i18nData = data
        },
        editing(state, data){
            state.editing = data
        },
        currentApi(state, data){
            state.currentApi = data
        },
    },
})

new Vue({
    el: '#i18n-app',
    render: _h => _h(App),
    router,
    store,
})
