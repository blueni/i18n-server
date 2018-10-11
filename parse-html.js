const reg = /(>\s*?[^><]+?<)/g

module.exports = function parseHTML(html = '', sourceLang, ...targetLangs){
    if(!sourceLang){
        throw `必须指定代码源语言类型`
    }
    targetLangs.filter(v => !!v)
    if(!targetLangs[0]){
        throw `至少指定一种目标语言`
    }
    
}
