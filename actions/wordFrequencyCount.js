/*
    统计词频：使用jieba模块分词，同时统计词根个数
 */
const nodejieba = require("nodejieba");
const data_5188 = require('../result/5188-step1-words.json');
const {writeJSON} = require("../spider/utils");
const Excel = require('exceljs');

const allData = [];

async function readXLSX(){
    const workbook = new Excel.Workbook();
    await workbook.xlsx.readFile('../result/导出2021-3-8.xlsx');
    const worksheet = workbook.getWorksheet(1);
    worksheet.getColumn(1).eachCell(function(cell, rowNumber) {
        let wordSplit = nodejieba.cut(cell.text, true);
        allData.push(...wordSplit);
    });
}


function read5188File(){
    for (let i = 0, length = data_5188.length; i < length; i++) {
        let wordSplit = nodejieba.cut(data_5188[i], true);
        allData.push(...wordSplit);
    }
}

// 统计和排序
function sort(){
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
    return result;
}


async function start(){
    await readXLSX();
    read5188File();
    const result = sort();

    await writeJSON(result, '../result/word-frequency.json')
}

start();
