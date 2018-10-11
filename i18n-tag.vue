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
            <span class="auto-transfer" @click="autoTransfer(item)">自动翻译</span>
            <textarea @change="changeText" type="text" v-model="item.value"></textarea>
        </div>
    </dd>
</template>

<script>
export default {
    name: 'i18n-tag',

    data(){
        return {
            baidulangMap: {
                CN: 'zh',
                EN: 'en',
                KR: 'kor',
            },

            youdaoLangMap: {
                CN: 'ZH_CN',
                EN: 'EN',
                KR: 'KR',
            },
        }
    },

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
            if(transferApi === 'baidu'){
                this.baiduTransfer(target)
            }else if(transferApi === 'youdao'){
                this.youdaoTransfer(target)
            }
        },

        baiduTransfer(target){
            let from = this.baidulangMap[this.lang]
            let to = this.baidulangMap[target.lang]
            let query = this.current
            let transfer_api = this.transferApi
            $.get('/transfer-api', {
                from,
                to,
                query,
                transfer_api,
            }).then(res => {
                res = JSON.parse(res)
                target.value = res.data[0].dst
                this.$store.commit('editing', true)
                this.$emit('change', this.others)
                this.$forceUpdate()
            })            
        },

        youdaoTransfer(target){
            let youdaoLangMap = this.youdaoLangMap
            let doctype = 'json'
            let type = `${youdaoLangMap[this.lang]}2${youdaoLangMap[target.lang]}`
            let i = this.current
            let transfer_api = this.transferApi
            $.get('/transfer-api', {
                doctype,
                type,
                i,
                transfer_api,
            }).then(res => {
                res = JSON.parse(res)
                target.value = res.translateResult[0][0].tgt
                this.$store.commit('editing', true)
                this.$emit('change', this.others)
                this.$forceUpdate()
            })     
        },
    },

}
</script>
