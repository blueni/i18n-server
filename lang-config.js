// 支持的语言列表
export const langs = [
    'CN',
    'EN',
    'KR',
    'JP',
    'RU',
    'PT',
    'FR',
    'VN',
]

// 百度翻译支持语言
export const baiduLangMap = {
    CN: 'zh',
    EN: 'en',
    KR: 'kor',
    JP: 'jp',
    RU: 'ru',
    PT: 'pt',
    FR: 'fra',
    VN: 'vie',
}

// 有道翻译支持语言
export const youdaoLangMap = {
    CN: 'ZH_CN',
    EN: 'EN',
    KR: 'KR',
    JP: 'JA',
    // RU: 'RU',
    // PT: 'PT',
    FR: 'FR',
    // VN: 'vi',
}

// 构建请求参数与数据转换函数
export const makeQuery = (from, to, query, transfer_api = 'baidu') => {
    let langMap = transfer_api === 'baidu' ? baiduLangMap : youdaoLangMap
    from = langMap[from]
    to = langMap[to]
    if(transfer_api === 'baidu'){
        return {
            query: { from, to, query, transfer_api },
            rule: res => res.data[0].dst,
        }
    }
    return {
        query: {
            doctype: 'json',
            type: `${from}2${to}`,
            i: query,
            transfer_api,
        },
        rule: res => res.translateResult[0][0].tgt,
    }
}
