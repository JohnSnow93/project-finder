const agent = require("./agent");
const cheerio = require("cheerio");
const { writeJSON } = require("./utils")


let maxPage = 100;
let wordCollection = [];

const cookie = '';

function collectByPage(currentPage = 1){
    agent
        .set('Referer', 'https://www.5118.com/seo/newwords/84e4e006/')
        .set('Cookie', cookie)
        .withCredentials()
        .get(`https://www.5118.com/seo/newwords/84e4e006/?isPager=true&pageIndex=${currentPage}&sortfields=&filters=&filtersName=&addTime=&_=1614579685654`)
        .retry(2)
        .end(function (err, res) {
            if (err) {
                console.log(err);
            }
            if (res) console.log(`page: ${currentPage}`, res.statusCode);

            const $ = cheerio.load(res.text, {
                normalizeWhitespace: false,
            });

            const aTagElement = $('table.list-table>tbody>tr>td:nth-child(1)>a').each((index, element) => {
                wordCollection.push($(element).text());
            });
            // $('.pagination>li').map((i, e)=> $(e).text().trim()).map(i => parseInt(i)).filter(i => i);
            // findMaxPage($);
            console.log('current total words:', wordCollection.length);
            if(maxPage >= currentPage && aTagElement.length){
                setTimeout(() => {
                    collectByPage(currentPage + 1)
                }, Math.random() * 2 * 3000);
            } else {
                writeJSON(wordCollection, '../result/5188-step1-words.json')
            }
        });
}

const findMaxPage = ($) => {
    const pageJumperMaxLimit = $('.pagination>li input').attr('max');
    console.log(pageJumperMaxLimit)
    maxPage = pageJumperMaxLimit || 1;
}

collectByPage(1);
