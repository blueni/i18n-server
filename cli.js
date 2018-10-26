#!/usr/bin/env node

const Bundler = require('parcel-bundler')
const opn = require('opn')
const server = require('./server')
let [, , env = 'production'] = process.argv

const isDevelopment = env.indexOf('dev') >= 0
const autoOpen = /open|start/.test(env)

;(async () => {
    process.chdir(__dirname)
    let bundler = new Bundler('index.html', {
        outDir: 'i18n-dist',
        production: !isDevelopment,
    })
    await bundler.bundle()
    await server()
    autoOpen && opn('http://localhost:1266')
})()
