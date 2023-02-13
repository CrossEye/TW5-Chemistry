const {writeFile, mkdir, rm,} = require ('fs/promises')
const tap = (fn) => (x) => ((fn (x)), x)
const map = (fn) => (xs) => xs .map (x => fn (x))
const display = msg => tap (() => console .log (msg))
const allPromises = (ps) => Promise .all (ps)

const main = (elements) =>
  deleteOutputDir ()   // ensure there's no detritus from previous runs
    .then (createOutputDir)
    .then (() => Promise .resolve (elements))
    .then (display ('Built directory'))
    .then (addFields)
    .then (display ('Added title and tags'))
    .then (map(addText))
    .then (allPromises)
    .then (display ('Added text from Wikipedia extracts'))
    .then (map (writeTiddler))
    .then (allPromises)
    .then (display (`Wrote ${elements.length} tiddlers`))

const deleteOutputDir = () => 
  rm ('./plugins/Elements/ChemicalElements', {force: true, recursive: true})

const createOutputDir = () =>
  mkdir ('./plugins/Elements/ChemicalElements', {recursive: true})

const addFields = (elements) =>
  elements .map (e => ({title: e.element, tags: '[[Chemical Element]]', ...e}))

const addText = (e) => 
  fetch (`https://en.wikipedia.org/api/rest_v1/page/summary/${wikipediaTitle (e .title)}`)
    .then(r => r.json()) 
    .then (o => ({
      ... e,
      ... (o .extract 
        ? {text: '> ' + o.extract .split ('\n') .join ('\n> ') + `\n\n> ([[more information from Wikipedia|https://en.wikipedia.org/wiki/${wikipediaTitle (e .element)}]])`}
        : {}
      )
    }))

const wikipediaTitle = ((conversions = {
  Mercury: 'Mercury_(element)' // just the one?
}) => (title) => conversions [title] || title) ()

const writeTiddler = (t) => 
  writeFile (`./plugins/Elements/ChemicalElements/${t.title}.tid`, formatTiddler (t))

const formatTiddler = ({title, text, ...rest}) =>
   [['title', title]] .concat (Object .entries (rest) 
     .sort (([k1], [k2]) => k1 < k2 ? -1 : k1 > k2 ? +1 : 0))
     .map (([k, v]) => `${k}: ${v}`) .join ('\n') 
     + '\n\n' + text


main (require ('./../RawData/raw.json'))