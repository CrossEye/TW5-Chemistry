const cheerio = require ('cheerio')
// bad idea, but may be useful behind corporate walls
// process .env ["NODE_TLS_REJECT_UNAUTHORIZED"] = 0

const tap = (fn) => (x) => (fn (x), x)
const findIndices = (fn) => ($, xs) => xs .reduce (
    (a, x, i) => [...a, ... (fn(x) ? [i] : [])], 
    []
)

// Trying to scrape Wikipedia's compound page

const processTable = ($) => {
  const rows = [ ... $('.infobox tr')]
  const indices = findIndices (tr => {
    const th = $(tr) .find ('th:first-child') 
    return th && th .attribs .colspan == '2'
    // td.attribs.colspan == '2'
  }) ($, rows)
  console .log ({indices})
  /*
  return rows .forEach ((elem, idx) => {
    const value = $ (elem) .text() .trim()
    console .log ({idx, value})
    return {idx, value}
  })
  */
  return indices .map (i => $ (rows [i]) .text() )
}


const parse = (name) =>
  fetch (`https://en.wikipedia.org/wiki/${name .trim () .replace (/\s/g, '_')}`)
    .then (r => r .text())
//     .then (tap (console .log))
    .then (cheerio .load)
    .then (processTable)


parse ('Adenosine triphosphate')
  .then (console .log)
  .catch (console .warn)