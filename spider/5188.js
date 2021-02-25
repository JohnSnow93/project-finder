const agent = require("./agent");
const cheerio = require("cheerio");
const { writeJSON } = require("./utils")


let maxPage = 10;
let wordCollection = [];

function collectByPage(currentPage = 1){
    agent
        .set('Referer', 'https://www.5118.com/seo/newwords/84e4e006/')
        .set('Cookie', 'only=47427140-8a1b-470e-97e9-f1c57ff55da5; .5118.referer={"TParam":"","QuestionParam":"","Referer":"https://www.baidu.com/link?url=JQbS939Y_y4fS1DQb4Q2nuUymuIzfGjQtdBjwzJb-GW&wd=&eqid=bf32b0b3000122f500000006602e1c19"}; ASP.NET_SessionId=0pf5xhzb4o5salmq0f0kohpx; Hm_lvt_f3b3086e3d9a7a0a65c711de523251a6=1613634604,1613634922,1613634968,1614238373; _5118_yx=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ1Z3VpZCI6ImUwMzAyMzVlLTZlNGEtNDg4Ny05MDVmLTc4ZjUwMGViM2I2MyIsInVpZCI6MTA3MjM1OSwiYXVkIjoid3d3LjUxMTguY29tIiwiaXNzIjoid3d3LjUxMTguY29tIn0.QTHiCX7SXiR4FtDUohAgbUsDY8kvEh3t9i5VJ2w-0CY; .AspNet.ApplicationCookie=k7D41JfdJSlTFnEj_0y8EjFfy6UgbnmY5tWWtRJTFbbCxEutTxPJoXrQPw9NURatojg5rAiYKA68gFJc1oVQH536en0IcxamfZKqXP8dT71S_ysooee8LNynVpIB_xSKs8IZT4Vle5-RSGucz6wdr7MxIjJacIX90-rROFYt9I3VDOwm1fhUvj7qYYCEbrBSqAYH_sWICn5oRFZ_8EtlpLD-o3kzTrEfj5Im216TFVNPZ1TxnQZIwg8cU9pvH8UeKpC6MsbH2nHqY1xBUqpUTecLq2zEI3Bmf8KyKsNNcIz2NUOnI0uEr_uSqHuxNIBAYvasJlmEmKsdi84ldmnK-z2k-XxcjipSux529P7_1Z6NHT_YA5odA9SIrupZEB2aWcCe7K-YjAnSEPMHQKgrI_t6QYm1jPApnfwyx7-g79y8_yeYhYmHnxoA8YbHKSwl8vYA5Gan0mxJO5c4gSPq04Lf-0V-oS9WNGBVWp2PvH_7scKKfG4rgTeBsMsWaqqe1NGV9nC2qvxL367zT0vtIT2yHUSWOPEu8n5LQAZdEpE; Hm_lpvt_f3b3086e3d9a7a0a65c711de523251a6=1614238455')
        .get(`https://www.5118.com/seo/newwords/84e4e006/?isPager=true&pageIndex=${currentPage}&sortfields=&filters=&filtersName=&addTime=&_=1614238455335`)
        .retry(2)
        .end(function (err, res) {
            if (err) {
                console.log(err);
            }
            if (res) console.log(`page: ${currentPage}`, res.statusCode);

            const $ = cheerio.load(res.text, {
                normalizeWhitespace: false,
            });

            $('table.list-table>tbody>tr>td:nth-child(1)>a').each((index, element) => {
                wordCollection.push($(element).text());
            });
            $('.pagination>li').map((i, e)=> $(e).text().trim()).map(i => parseInt(i)).filter(i => i);
            // findMaxPage($);
            if(maxPage >= currentPage){
                setTimeout(() => {
                    collectByPage(currentPage + 1)
                }, Math.random() * 5 * 5000);
            } else {
                writeJSON(wordCollection, './words.txt')
            }
        });
}

const findMaxPage = ($) => {
    const pageJumperMaxLimit = $('.pagination>li input').attr('max');
    console.log(pageJumperMaxLimit)
    maxPage = pageJumperMaxLimit || 1;
}

collectByPage(1);
