const fs = require('fs-extra');
const json2xls = require("json2xls");
const {excelSplitCount: splitNumber, pageSplitCount} = require("./config");

async function sleep(ms) {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve()
        }, ms);
    })
}

async function writeFile(list, fileNumber, prefix) {
    console.log('before excel')
    const xls = json2xls(list);
    try {
        await fs.writeFile(
            `./${prefix}/${prefix}${fileNumber}.xlsx`,
            xls,
            {
                encoding: 'binary',
                flag: 'w+'
            }
        );
    } catch (e) {
        console.log(e);
        throw e;
    }
}

async function writePage(page, prefix) {
    try {
        await fs.writeFile(
            `./${prefix}/${page}.txt`,
            '',
            {
                encoding: 'utf8',
                flag: 'w+'
            }
        );
    } catch (e) {
        console.log(e);
        throw e;
    }
}

async function writeJSON(data, filePath) {
    try {
        await fs.writeFile(
            filePath,
            JSON.stringify(data),
            {
                encoding: 'utf8',
                flag: 'w+'
            }
        );
    } catch (e) {
        console.log(e);
        throw e;
    }
}

/**
 * 合并多个JSON
 * 建议每次不要超过5W条数据，不然要导出Excel要等很久
 * @param sourcePath
 * @param distPathPrefix
 * @param fileNumber
 * @returns {Promise<[]>}
 */
async function combineJSON(sourcePath, distPathPrefix = 'combineResult', fileNumber = 0) {
    const requireDir = require('require-dir');
    const result = requireDir(sourcePath);
    const data = [];
    for (let fsKey in result) {
        console.log(fsKey)
        data.push(...(result[fsKey] || []));
    }
    if (distPathPrefix) {
        await writeFile(data, fileNumber, distPathPrefix)
    } else return data;
}

/**
 * 获取日期字符串
 * @returns {string}
 */
function getCurrentDateString() {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth() + 1;
    const day = now.getDate();

    return `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`
}

async function asyncLooperWithRetry(
    {
        initialPage = 1,
        maxRetryTimes = 3,
        retrySleepTime = 1000,
        excelSplitCount = splitNumber,
        initialFileNumber= 1,
        prefix,
        loopFn,
        onLoopEnd,
    } = {}
    ) {
    let page = initialPage;
    let reachEnd = false;
    let retryTime = 0;
    let fileNumber = initialFileNumber
    let list = []; // 收集数据
    while (!reachEnd && retryTime <= maxRetryTimes) {
        try {
            const {end, needStop} = await loopFn(page, list);
            reachEnd = end;
            if (needStop) {
                console.log('停止循环机制被触发');
                break;
            }
            if (list.length >= excelSplitCount) {
                await writeFile(list, fileNumber, prefix);
                await writePage(page, prefix)
                fileNumber++;
                list = [];
            }
        } catch (error) {
            console.log(error);
            await sleep(retrySleepTime);
            retryTime++;
            console.log(`由于上述错误发生，将进行重试，第${retryTime}次重试`)
            continue;
        }
        page++;
    }
    if (list.length > 0) {
        await writeFile(list, fileNumber, prefix)
    }
    if(onLoopEnd && typeof onLoopEnd === 'function'){
        await onLoopEnd();
    }
}

async function cleanDir(pathPrefix){
    if(!pathPrefix) return;
    const del = require('del');
    try {
        await del([`${pathPrefix}/*`])
    } catch (e){
        console.log(e);
    }
}

async function asyncLooperWithRetrySplitByPage(
    {
        initialPage = 1,
        maxRetryTimes = 3,
        retrySleepTime = 1000,
        splitCount = pageSplitCount,
        initialFileNumber= 1,
        prefix,
        loopFn,
        onLoopEnd,
    } = {}
) {
    let page = initialPage;
    let reachEnd = false;
    let retryTime = 0;
    let fileNumber = initialFileNumber
    let list = []; // 收集数据
    while (!reachEnd && retryTime <= maxRetryTimes) {
        try {
            const {end, needStop} = await loopFn(page, list);
            reachEnd = end;
            if (needStop) {
                console.log('停止循环机制被触发');
                break;
            }
            if (page >= splitCount) {
                await writeFile(list, fileNumber, prefix)
                fileNumber++;
                list = [];
            }
        } catch (error) {
            console.log(error);
            await sleep(retrySleepTime);
            retryTime++;
            console.log(`由于上述错误发生，将进行重试，第${retryTime}次重试`)
            continue;
        }
        page++;
    }
    if (list.length > 0) {
        await writeFile(list, fileNumber, prefix)
    }
    if(onLoopEnd && typeof onLoopEnd === 'function'){
        await onLoopEnd();
    }
}

module.exports = {
    sleep,
    cleanDir,
    writeFile,
    writeJSON,
    getCurrentDateString,
    asyncLooperWithRetry,
    asyncLooperWithRetrySplitByPage,
}


// async function B(){
//     await Promise.all([new Promise((resolve, reject) => {
//         reject('123');
//     })]);
// }
//
// async function A(){
//     try {
//         await B();
//     } catch (e){
//         throw e;
//     }
//     return {end: false, needStop: false}
// }
//
// (async function () {
//     // await cleanDir('deductionRecord');
//     await asyncLooperWithRetry({
//         loopFn: A,
//         prefix: 'deductionRecord',
//         excelSplitCount: 15000,
//     });
// })();
