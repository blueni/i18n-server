<template>
    <dd class="i18n-tag" :class="{modified: hasModified}">
        <div class="current-lang" :class="{modified: current !== origin.current}">
            <span>{{ current }}</span>
            <code class="data-attr">{{ attr }}</code>
        </div>
        
        <div class="i18n-other"
            v-for="(item, index) in others"
            :key="index"
            :class="{modified: item.value !== origin.others[index].value}"
        >
            <span class="lang">{{ item.lang }}：</span>
            <span v-if="hasTransferApi(item.lang)" class="auto-transfer" @click="autoTransfer(item)">自动翻译</span>
            <textarea @change="changeText" type="text" v-model="item.value"></textarea>
        </div>
    </dd>
</template>

<script>
import { baiduLangMap, youdaoLangMap, makeQuery} from './lang-config'
export default {
    name: 'i18n-tag',

    props: {
        lang: String,
        current: String,

        others: {
            type: [Array],
            default: () => []
        },

        attr: String,
        transferApi: {
            type: String,
            default: 'youdao',
        },

        origin: {
            type: Object,
            default: () => ({}),
        },
    },

    computed: {
        hasModified(){
            let origin = this.origin
            let others = this.others
            let originOthers = origin.others
            if(origin.current !== this.current){
                return true
            }
            for(let i=0;i<others.length;i++){
                if(others[i].value !== originOthers[i].value){
                    return true
                }
            }
            return false
        },
    },

    methods: {
        changeText(){
            this.$store.commit('editing', true)
            this.$emit('change', this.others)
        },

        autoTransfer(target){
            let transferApi = this.transferApi
            let obj = makeQuery(this.lang, target.lang, this.current, transferApi)
            $.get('/transfer-api', obj.query).then(res => {
                res = JSON.parse(res)
                target.value = obj.rule(res)
                this.$store.commit('editing', true)
                this.$emit('change', this.others)
                this.$forceUpdate()
            })
        },

        hasTransferApi(lang){
            return this.transferApi === 'baidu' ? baiduLangMap[lang] : youdaoLangMap[lang]
        },
        
    },

}
</script>
