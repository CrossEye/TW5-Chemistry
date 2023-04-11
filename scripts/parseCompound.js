const cheerio = require ('cheerio')

const parse = (name) =>
  import ('node-fetch')  
    // .then (({default: fetch}) => fetch (`https://en.wikipedia.org/wiki/${name .trim () .replace (/\s/g, '_')}`))
    .then (({default: fetch}) => fetch (wpLink (name)))
    .then (r => r .text())
    .then (cheerio .load)
    .then (getProps)
    .then (o => ({'common-name': name, ...o}))

const wpLink = (s, t = s.trim()) => {
  const url = `https://en.wikipedia.org/wiki/${t .replace (/\s([A-Z])/g, (_, c) => `_${c .toLowerCase ()}`)}`
  // console .log (`Fetching "${url}"`)
  return url
}
  


const getProps = ((props) => ($, cells = [ ... $('.infobox td'), ...$('.infobox th')]) => {
  return Object .fromEntries (Object .entries (props) .flatMap (([k, vs]) => {
    const res = getProp ($, cells, vs)
    return res ? [[k, res]] : []
  }))
}) ({
  'boiling-point': ['Boiling point'],
  'density': ['Density'],
  'formula': ['Formula', 'Chemical formula'],
  'melting-point': ['Melting point'],
  'molar-mass': ['Molar mass'],
})

const getProp = ($, cells, keys) => {
  const idx = cells .findIndex (td => keys .includes ($(td) .text() .trim()))
  if (idx < 0) {return undefined}
  [...$(cells [idx + 1]).find('style')].forEach(c => $(c).remove())
  return $(cells [idx + 1]) .text() .trim() .replaceAll('\u00A0', ' ') .replaceAll('−', '-') // That's a Unicode minus sign.  Don't know why `\u8722` doesn't work.
}

module .exports = parse


/*
//parse ('Adenosine triphosphate')
parse ('Caffeine')
  .then (console .log)
  .catch (console .warn)
*/

