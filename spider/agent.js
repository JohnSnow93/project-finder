const superagent = require('superagent');
const { retryTimes, cookie, baseURL, timeout, timeoutDeadLine } = require('./config');

const agent = superagent.agent()
    .timeout({
        response: timeout,
        deadline: timeoutDeadLine,
    })
    .set('Accept', 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9')
    .set('User-Agent', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/86.0.4240.198 Safari/537.36 Edg/86.0.622.69');

module.exports = agent;
