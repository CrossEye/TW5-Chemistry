const {writeFile, mkdir, rm,} = require ('fs/promises')
const tap = (fn) => (x) => ((fn (x)), x)
const map = (fn) => (xs) => xs .map (x => fn (x))
const call = (fn, ...args) => fn (...args)
const display = msg => tap (() => console .log (msg))
const allPromises = (ps) => Promise .all (ps)

const main = (elements, compounds) =>
  deleteOutputDirs ()   // ensure there's no detritus from previous runs
    .then (createOutputDir)
    .then (display ('Built directory'))
    .then (display ('Working with elements'))
    .then (() => Promise .resolve (elements))
    .then (addElementFields)
    .then (display ('Added title and tags to elements'))
    .then (map (cleanFields))
    .then (map (addExtract('title')))
    .then (allPromises)
    .then (display ('Added extract from Wikipedia to element tiddlers'))
    .then (allPromises)
    .then (map (addLinks (elements)))
    .then (display (`Added text links to other elements`))
    .then (map (addTimestamps))
    .then (display ('Added created/modified timestamps'))
    .then (tap (map (writeTiddlerTo ('Elements', 'ChemicalElements'))))
    .then (allPromises)
    .then (display (`Wrote ${elements.length} element tiddlers`))

    .then (collectTypes)
    .then (display (`Gathered element types`))
    .then (map (addTimestamps))
    .then (display (`Added created/modified timestamps`))
    .then (map (addExtract('title')))
    .then (display (`Added text from Wikipedia extracts to element type tiddlers`))
    .then (allPromises)
    .then (map (addLinks (elements, compounds)))
    .then (display (`Added text links to the elements`))
    .then (tap (map (writeTiddlerTo ('Elements', 'ElementTypes'))))
    .then (tap ((types) => console .log (`Wrote ${types.length} element type tiddlers`)))
    
    .then (display ('Working with compounds'))
    .then (() => Promise .resolve (compounds))
    .then (addCompoundFields)
    .then (display ('Added title and tags'))
    .then (map (addExtract('chemical-name')))
    .then (allPromises)
    .then (display ('Added extract from Wikipedia compound tiddlers'))
    .then (allPromises)
    //.then (map (addLinks (elements)))
    //.then (display (`Added text links to other elements`))
    .then (map (addTimestamps))
    .then (display ('Added created/modified timestamps'))
    .then (tap (map (writeTiddlerTo ('Compounds', 'CommonCompounds'))))
    .then (allPromises)
    .then (display (`Wrote ${compounds.length} compound tiddlers`))

const deleteOutputDirs = () => 
  rm ('./plugins/Elements/ChemicoalElements', {force: true, recursive: true})
  .then (() => rm ('./plugins/Elements/ElementTypes', {force: true, recursive: true}))
  .then (() => rm ('./plugins/Compounds/CommonCompounds', {force: true, recursive: true}))

const createOutputDir = () =>
  mkdir ('./plugins/Elements/ChemicalElements', {recursive: true})
  .then (() => mkdir ('./plugins/Elements/ElementTypes', {recursive: true}))
  .then (() => mkdir ('./plugins/Compounds/CommonCompounds', {recursive: true}))

const addElementFields = (elements) =>
  elements .map (e => ({title: e.element, tags: '[[Chemical Element]]', ... e}))

const addCompoundFields = (compounds) =>
  compounds .map (c => ({
    caption: `${c ['compound-name']} (${c .formula .replace(/([A-Za-z])(\d+)/g, '$1,,$2,,')})`,
    title: c ['compound-name'], 
    tags: 'Compound', ... c
  }))

const cleanFields = ({density, metal, metalloid, natural, 'non-metal': nm, ...rest}) => ({
  density: density ? Number (density) : '',
  metal: metal || 'no',
  metalloid: metalloid || 'no',
  natural: natural || 'no',
  'non-metal': nm || 'no',
  ...rest
})
  


const addExtract = (prop) => (e) => 
  fetch (`https://en.wikipedia.org/api/rest_v1/page/summary/${wikipediaTitle (e [prop])}`)
    .then(r => r.json()) 
    .then (o => ({
      ... e,
      ... (o .extract
        ? {
            'wikipedia-extract': o.extract .trim (),
            'wikipedia-link': `https://en.wikipedia.org/wiki/${wikipediaTitle (e .title)}`
          }
        : {}
      )
    }))

const addTimestamps = (x) => call (
  (now = new Date().toISOString().replace(/\D/g, '')) => ({...x, created: now, modified: now})
)

const wikipediaTitle = ((conversions = {
  Mercury: 'Mercury_(element)' // just the one?
}) => (title) => conversions [title] || title .replace (/ ([A-Z])/g, (_, c) => `_${c.toLowerCase()}`)) ()

const writeTiddlerTo = (parent, folder) => (t) => 
  writeFile (`./plugins/${parent}/${folder}/${t.title}.tid`, formatTiddler (t))

const formatTiddler = ({title, ...rest}) =>
   [['title', title]] .concat (Object .entries (rest) 
     .sort (([k1], [k2]) => k1 < k2 ? -1 : k1 > k2 ? +1 : 0))
     .map (([k, v]) => `${k}: ${v}`) .join ('\n') 

const collectTypes = (ts) => 
  [... new Set (ts .map (t => t ['element-type']))]
    .map (t => ({title: t, tags: '[[Element Type]]'}))

const addLinks = (elements) => ({'wikipedia-extract': extract = '', title, ...rest}) => ({
  title,
  ...rest,
  'wikipedia-extract': elements .reduce (
    (a, {element}) => element == title ? a : a.replaceAll (new RegExp(`\\b${element}\\b`, `gi`), (s) => `[[${s}|${element}]]`), 
    extract
  )
})
   
main (require ('../RawData/raw.json'), require ('../RawData/raw_compounds.json'))