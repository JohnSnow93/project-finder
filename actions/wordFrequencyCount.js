/*
    统计词频：使用jieba模块分词，同时统计词根个数
 */
const nodejieba = require("nodejieba");
const data_5188 = require('../result/5188-step1-words.json');
const {writeJSON} = require("../spider/utils");

// 分词
const allData = [];
for (let i = 0, length = data_5188.length; i < length; i++) {
    let wordSplit = nodejieba.cut(data_5188[i], true);
    allData.push(...wordSplit);
}

// 统计和排序
const result = [];
allData.forEach((keyword) => {
    if(keyword.length > 1){
        const target = result.find(i => i.key === keyword);
        if(target){
            target.count += 1;
        } else {
            result.push({ key: keyword, count: 0 })
        }
    }
});

result.sort((a, b) => a.count-b.count > 0 ? -1 : 1);


writeJSON(result, '../result/word-frequency.json')
