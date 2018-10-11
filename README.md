# i18n-server
使用快速便捷的方式增加语言翻译包

## 使用方式
* `npm install i18n-server -g`
* `cd [你的语言包目录]`
* `i18n`

## 支持语言包格式
暂时只支持js文件，格式如下：  
```js
module.exports = {
    CN: {
        foo: '中文',
        bar: '你好',
    },
    EN: {
        foo: 'Chinese',
        bar: 'hello'
    }
}
```
