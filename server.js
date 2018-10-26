const path = require('path')
const fs = require('fs')
const qs = require('querystring')
const Koa = require('koa')
const Router = require('koa-router')
const static = require('koa-static')
const fg = require('fast-glob')
const koaBody = require('koa-body')
const request = require('request-promise')

const root = process.cwd()
const app = new Koa

app.use(koaBody({
    formLimit: '5mb',
    jsonLimit: '5mb',
    textLimit: '5mb',
}))

const router = new Router()

router.get('/lang-files', async (ctx, next) => {
    let ignoreFile = path.join(root, '.i18n-ignore')
    let content = ''
    try{
        content = fs.readFileSync(ignoreFile, 'utf-8')
    }catch(err){}
    let ignores = content.trim().split(/[\s\r\n\t]+/g)
    let files = await fg(['**/*.*', ...ignores.map(v => `!${v}`)], {
        cwd: root,
    })
    ctx.body = files
})

app.use(async (ctx, next) => {
    let url = ctx.url
    if(!url.startsWith('/lang/')){        
        return next()
    }
    
    let filePath = path.join(root, url.replace(/^\/lang/, ''))

    let file
    try{
        file = require(filePath)
        delete require.cache[require.resolve(filePath)]
    }catch(err){}

    ctx.body = file
})

app.use(async (ctx, next) => {
    let url = ctx.url
    if(!url.startsWith('/apply/')){        
        return next()
    }
    
    let filePath = path.join(root, url.replace(/^\/apply/, ''))
    await new Promise((resolve) => {
        fs.createReadStream(filePath + '.edit.js')
        .pipe(fs.createWriteStream(filePath + '.js'))
        .on('close', () => {
            fs.unlinkSync(filePath + '.edit.js')
            resolve()
        })
    })
    ctx.body = '...'
})

app.use(async (ctx, next) => {
    let url = ctx.url
    if(!url.startsWith('/transfer-api')){
        return next()
    }

    let query = ctx.request.query
    let transferApi = query.transfer_api
    delete query.transfer_api
    let apiUrl
    if(transferApi === 'baidu'){
        apiUrl = `https://fanyi.baidu.com/transapi`
    }else if(transferApi === 'youdao'){
        apiUrl = `http://fanyi.youdao.com/translate`
    }
    let res = await request(`${apiUrl}?${qs.stringify(query)}`)
    ctx.body = res
})

function createI18nContent(i18nData = {}){
    let res = ''
    let langs = Object.keys(i18nData)
    let len = langs.length
    if(!len){
        return res
    }
    let data = i18nData[langs[0]]
    function _getValue(lang, key){
        if(!i18nData[lang]){
            return ''
        }
        let res = i18nData[lang][key] || ''
        return res.replace(/'/g, '\\\'')
    }
    for(let key in data){
        langs.forEach((lang, index) => {
            if(index == 0){
                res += 
`
        ${lang}('${_getValue(lang, key)}')\
` 
            }else if(index == len - 1){
                res += 
`
        .${lang}('${_getValue(lang, key)}'),
` 
            }else{
                res += 
`
        .${lang}('${_getValue(lang, key)}')\
` 
            }
        })
    }
    return res
}

app.use(async (ctx, next) => {
    let url = ctx.url
    if(!url.startsWith('/save/')){        
        return next()
    }
    
    let filePath = path.join(root, url.replace(/^\/save/, '') + '.edit.js')
    let i18n = ctx.request.body.i18n
    let i18nData = JSON.parse(i18n)
    let flag = 5
    let reg = /[\u4e00-\u9fa5]/
    let content
    for(let key in (i18nData.CN || {})){
        if(reg.test(key)){
            flag--
        }
        if(!flag){
            break
        }
    }
    if(flag){
        content = `module.exports = ${i18n}`
    }else{
        content = 
`const i18nUtil = require('../i18n-util')

module.exports = i18nUtil((CN) => {
    return [
        ${createI18nContent(i18nData)}
    ]
})
`
    }
    fs.writeFileSync(filePath, content, 'utf-8')

    ctx.body = '...'
})

app.use(router.routes())
app.use(router.allowedMethods())

app.use(static(path.join(__dirname, 'i18n-dist')))

module.exports = function(){ 
    return new Promise((resolve) => {
        app.listen(1266, () => {
            console.log('I18n Service running at http://localhost:1266')
            resolve()
        })
    })
}
