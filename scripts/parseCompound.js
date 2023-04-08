const cheerio = require ('cheerio')

const parse = (name) =>
  fetch (`https://en.wikipedia.org/wiki/${name .trim () .replace (/\s/g, '_')}`)
    .then (r => r .text())
    .then (cheerio .load)
    .then (getProps)
    .then (o => ({name, ...o}))


const getProps = ((props) => ($, cells = [ ... $('.infobox td')]) => {
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
  cell = $(cells [ idx + 1])
  // cell('span') .forEach (s => s .remove())
  return cell .text() .trim()
}

module .exports = parse


///*
// parse ('Adenosine triphosphate')
parse ('Acetic Acid')
  .then (console .log)
  .catch (console .warn)
//*/

