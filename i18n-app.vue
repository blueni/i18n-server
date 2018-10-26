<template>
    <div class="i18n-app">
        <div class="lang-files">
            <ul>
                <li class="file-item"
                    v-for="(file, index) in files"
                    :key="index"
                    @click="changeFile(file)"
                    :class="{
                        active: file === currentFile,
                        modified: modifiedFiles.indexOf(file) >= 0
                    }"
                >
                    {{ file }}
                    <span @click.stop="apply2src(file)" class="replace-btn" v-if="modifiedFiles.indexOf(file) >= 0">应用</span>
                </li>
            </ul>
        </div>

        <div class="lang-data" ref="lang-data">
            <h4 class="current-file">{{ currentFile }}</h4>
            <i18n-list class="single-lang"
                :langs="langs"
                :transfer-to="transferTo"
                :transfer-api="currentApi"
                :list="i18nData"
                :origin-list="originI18nData"
                :default-lang="currentLang"
                v-if="i18nData"
            >
            </i18n-list>
        </div>

        <div class="operate-tools" :class="{active: toolFixed}">
            <div class="tool-pin" @click="toolFixed = !toolFixed">☞</div>
            <div class="tools-content">
                <div class="form-line">
                    <span class="form-label">参考语言：</span>
                    <select class="form-control" v-model="selectReferrerLang" @change="changeReferrerLang">
                        <option v-for="(lang, index) in langs" :key="index">
                            {{ lang }}
                        </option>
                    </select>
                </div>

                <div class="form-line">
                    <span class="form-label">翻译成：</span>
                    <label class="transfer-lang-list" v-if="lang !== currentLang" v-for="(lang, index) in langs" :key="index">
                        <input type="checkbox" :value="lang" name="transfer" @change="changeTransfer" v-model="transferLangs">
                        {{ lang }}
                    </label>
                </div>

                <div class="form-line">
                    <span class="form-label">翻译工具：</span>
                    <label class="transfer-api-list" v-for="(value, key) in apis" :key="key">
                        <input type="radio" :value="key" name="api" @change="$store.commit('currentApi', key)" v-model="selectedApi">
                        {{ value }}
                    </label>
                </div>

                <button class="save-btn"
                    @click="save"
                >
                    保存翻译
                </button>
            </div>
        </div>
    </div>
</template>

<script>
import I18nList from './i18n-list.vue'

function _deepInitData(data, target, clone){
    let isString = typeof data === 'string'
    let isArray = Array.isArray(data)
    if(isString){
        return clone ? data : (target || '')
    }
    if(isArray){
        target = Array.isArray(target) ? target : []
        data.forEach((item, index) => {
            target[index] = _deepInitData(item, target[index], clone)
        })
    }else{
        target = typeof target === 'object' ? target : {}
        for(let key in data){
            target[key] = _deepInitData(data[key], target[key], clone)
        }
    }
    return target
}

export default {
    name: 'i18n-app',

    components: { I18nList, },

    data(){
        return {
            files: [],
            modifiedFiles: [],
            toolFixed: false,
            selectReferrerLang: '',
            transferLangs: [],
            selectedApi: 'baidu',
        }
    },

    computed: {
        currentFile(){
            return this.$store.state.currentFile
        },
        originI18nData(){
            return this.$store.state.originI18nData
        },
        i18nData(){
            return this.$store.state.i18nData
        },
        editing(){
            return this.$store.state.editing
        },     
        langs(){
            return this.$store.state.langs
        },
        currentLang(){
            return this.$store.state.currentLang
        },
        transferTo(){
            return this.$store.state.transferTo
        },
        apis(){
            return this.$store.state.apis
        },
        currentApi(){
            return this.$store.state.currentApi
        },
    },
    
    mounted(){
        this.selectReferrerLang = this.currentLang
        this.transferLangs = this.langs.slice(0, 4).filter(v => v != this.currentLang)
        this.$store.commit('transferTo', this.transferLangs)
        this.selectedApi = this.currentApi

        this.getFiles()
            .then(() => {
                this.getFileContent(this.$route.query.file)
            })
    },

    methods: {

        getFiles(){
            return $.get('/lang-files').then(res => {
                this.modifiedFiles = res.filter(v => v.indexOf('.edit.js') >= 0)
                                        .map(v => v.replace('.edit', ''))
                this.files = res.filter(v => v.indexOf('.edit.js') < 0)
                                .sort()
            })
        },

        changeFile(file){
            if(this.editing){
                alert('当前文件已修改尚未保存，请先保存当前文件再切换！')
                return
            }
            this.getFileContent(file)
        },

        getFileContent(file){
            if(!file){
                return
            }
            let langs = this.langs
            let hasModifiedFile = this.modifiedFiles.indexOf(file) >= 0
            
            $.get(`/lang/${file.replace(/\.js$/, '')}`).then(res => {
                this.$store.commit('currentFile', file)
                let query = res ? { file } : {}
                this.$router.replace({ query })
                if(!res){
                    res = {}
                }
                langs.forEach(lang => {
                    if(lang === 'CN'){
                        return
                    }
                    res[lang] = _deepInitData(res.CN, res[lang])
                })
                this.$store.commit('originI18nData', res)
                if(!hasModifiedFile){
                    this.$store.commit('i18nData', _deepInitData(res, {}, true))
                    this.$refs['lang-data'].scrollTop = 0
                }
            })

            if(!hasModifiedFile){
                return
            }

            $.get(`/lang/${file.replace(/\.js$/, '.edit')}`).then(res => {
                if(!res){
                    res = {}
                }
                langs.forEach(lang => {
                    if(lang === 'CN'){
                        return
                    }
                    res[lang] = _deepInitData(res.CN, res[lang])
                })
                this.$store.commit('i18nData', res)
                this.$refs['lang-data'].scrollTop = 0
            })
        },

        changeReferrerLang(){
            let lang = this.selectReferrerLang
            this.$store.commit('currentLang', lang)
            this.$store.commit('transferTo', this.transferTo.slice().filter(v => v != lang))
            this.transferLangs = this.transferTo
        },

        changeTransfer(){
            let langs = this.transferLangs
            this.$store.commit('transferTo', langs)
        },

        save(){
            if(!this.editing){
                alert('当前文件没有变动，不用保存！')
                return
            }
            let file = this.currentFile
            if(this.modifiedFiles.indexOf(file) < 0){
                this.modifiedFiles.push(file)
            }
            let i18n = JSON.stringify(this.i18nData, null, 4)
            $.post(`/save/${file.replace(/\.js$/, '')}`, {i18n}).then(() => {
                this.$store.commit('editing', false)
                this.getFiles()
                alert('翻译保存成功！')
            })
        },

        apply2src(file){
            let flag = confirm('确定用修改过的翻译替换掉源代码吗？\n请小心操作！！！')
            if(!flag){
                return
            }
            $.get(`/apply/${file.replace(/\.js$/, '')}`).then(res => {
                console.log('res is:', res)      
                this.getFiles().then(() => {
                    if(this.currentFile === file){
                        this.getFileContent(file)
                    }
                })
                alert('已经成功将修改应用到源代码！')
            })
        },

    },
}
</script>
