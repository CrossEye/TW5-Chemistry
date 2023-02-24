const {writeFile, mkdir, rm,} = require ('fs/promises')
const tap = (fn) => (x) => ((fn (x)), x)
const map = (fn) => (xs) => xs .map (x => fn (x))
const call = (fn, ...args) => fn (...args)
const display = msg => tap (() => console .log (msg))
const allPromises = (ps) => Promise .all (ps)

const main = (elements) =>
  deleteOutputDir ()   // ensure there's no detritus from previous runs
    .then (createOutputDir)
    .then (display ('Built directory'))
    .then (() => Promise .resolve (elements))
    .then (addFields)
    .then (display ('Added title and tags'))
    .then (map (addExtract))
    .then (allPromises)
    .then (display ('Added extract from Wikipedia to element tiddlers'))
    .then (map (addTimestamps))
    .then (display ('Added created/modified timestamps'))
    .then (tap (map (writeTiddler ('ChemicalElements'))))
    .then (allPromises)
    .then (display (`Wrote ${elements.length} element tiddlers`))
    .then (collectTypes)
    .then (display (`Gathered element types`))
    .then (map (addTimestamps))
    .then (display (`Added created/modified timestamps`))
    .then (map (addExtract))
    .then (display (`Added text from Wikipedia extracts to element type tiddlers`))
    .then (allPromises)
    .then (map (addLinks (elements)))
    .then (display (`Added text links to the elements`))
    .then (tap (map (writeTiddler ('ElementTypes'))))
    .then (tap ((types) => console .log (`Wrote ${types.length} element type tiddlers`)))

const deleteOutputDir = () => 
  rm ('./plugins/Elements/ChemicalElements', {force: true, recursive: true})
  .then (() => rm ('./plugins/Elements/ElementTypes', {force: true, recursive: true}))

const createOutputDir = () =>
  mkdir ('./plugins/Elements/ChemicalElements', {recursive: true})
  .then (() => mkdir ('./plugins/Elements/ElementTypes', {recursive: true}))

const addFields = (elements) =>
  elements .map (e => ({title: e.element, tags: '[[Chemical Element]]', ...e}))

const addExtract = (e) => 
  fetch (`https://en.wikipedia.org/api/rest_v1/page/summary/${wikipediaTitle (e .title)}`)
    .then(r => r.json()) 
    .then (o => ({
      ... e,
      ... (o .extract 
        ? {
            'wikipedia-extract': o.extract,
            'wikipedia-link': `https://en.wikipedia.org/wiki/${wikipediaTitle (e .title)}`
          }
        : {}
      )
    }))

const addTimestamps = (e) => call (
  (now = new Date().toISOString().replace(/\D/g, '')) => ({...e, created: now, modified: now})
)

const wikipediaTitle = ((conversions = {
  Mercury: 'Mercury_(element)' // just the one?
}) => (title) => conversions [title] || title .replace (/ ([A-Z])/g, (_, c) => `_${c.toLowerCase()}`)) ()

const writeTiddler = (folder) => (t) => 
  writeFile (`./plugins/Elements/${folder}/${t.title}.tid`, formatTiddler (t))

const formatTiddler = ({title, ...rest}) =>
   [['title', title]] .concat (Object .entries (rest) 
     .sort (([k1], [k2]) => k1 < k2 ? -1 : k1 > k2 ? +1 : 0))
     .map (([k, v]) => `${k}: ${v}`) .join ('\n') 

const collectTypes = (ts) => 
  [... new Set (ts .map (t => t ['element-type']))]
    .map (t => ({title: t, tags: '[[Element Type]]'}))

const addLinks = (elements) => ({'wikipedia-extract': extract = '', ...rest}) => ({
  ...rest,
  'wikipedia-extract': elements .reduce (
    (a, {element}) => a.replaceAll (new RegExp(`\\b${element}\\b`, `gi`), (s) => `[[${s}|${element}]]`), 
    extract
  )
})
   
main (require ('./../RawData/raw.json'))