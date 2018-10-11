<script>
import I18nTag from './i18n-tag.vue'

function getValue(data = {}, properties = ''){
    properties = properties.split('.')
    let field = properties.shift().replace(/\u0000/g, '.')
    let value = data[field]
    while(value && properties.length){
        field = properties.shift().replace(/\u0000/g, '.')
        value = value[field]
    }
    return value || ''
}

function setValue(data = {}, properties = '', target){
    properties = properties.split('.')
    let field = properties.shift().replace(/\u0000/g, '.')
    let last = data
    let value = data[field]
    while(value && properties.length){
        field = properties.shift().replace(/\u0000/g, '.')
        last = value
        value = value[field]
    }
    last[field] = target
}

export default {
    name: 'i18n-list',

    props: {
        originList: {
            type: [Array, Object],
            default: () => ({}),
        },

        list: {
            type: [Array, Object],
            default: () => ({}),
        },

        langs: {
            type: Array,
            default: () => [],
        },

        transferTo: {
            type: Array,
            default: () => [],
        },

        defaultLang: {
            type: String,
            default: 'CN',
        },

        transferApi: {
            type: String,
            default: 'baidu',
        },
    },

    render(_h){
        let originList = this.originList
        let list = this.list
        let langs = this.langs
        let defaultLang = this.defaultLang
        let transferTo = this.transferTo
        let transferApi = this.transferApi
        let childNodes = []

        let otherLangs = []
        let otherDatas = []
        transferTo.forEach(lang => {
            otherLangs.push(lang)
            otherDatas.push(list[lang])
        })

        const _createNode = (current, originCurrent, attr) => {
            let others = []
            let value, originValue
            let origin = { 
                current: originCurrent,
                others: [],
            }
            otherLangs.forEach(lang => {
                value = getValue(list[lang], attr)
                originValue = getValue(originList[lang], attr)
                others.push({
                    lang,
                    value,
                })
                origin.others.push({
                    lang,
                    value: originValue,
                })
            })
            return _h(I18nTag, {
                props: {
                    lang: defaultLang,
                    current,
                    others,
                    transferApi,
                    attr: `data${attr.split('.').map(v => '[' + v.replace(/\u0000/g, '.') + ']').join('')}`,
                    origin,
                },

                on: {
                    change: () => {
                        // this.$emit('change', others, attr)
                        others.forEach(item => {
                            setValue(list[item.lang], attr, item.value)
                        })
                        this.$store.commit('i18nData', list)
                    }
                }
            })
        }

        function _createTags(node, originNode, attr = ''){
            if(typeof node === 'string'){
                childNodes.push(_createNode(node, originNode, attr))
                return
            }
            if(Array.isArray(node)){
                for(let i=0;i<node.length;i++){
                    _createTags(node[i], originNode[i], `${attr ? attr + '.' : ''}${('' + i).replace(/\./g, '\u0000')}`)
                }
                return
            }
            for(let key in node){
                _createTags(node[key], originNode[key], `${attr ? attr + '.' : ''}${('' + key).replace(/\./g, '\u0000')}`)
            }
        }

        _createTags(list[defaultLang], originList[defaultLang])

        return _h('div', childNodes)
    },

}
</script>
