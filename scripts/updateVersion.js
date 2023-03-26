const {readFile, writeFile:wf} = require ('fs/promises')
const writeFile = (name) => (text) => wf (name, text, 'utf8')

const main = (version) =>
  readFile ('./tiddlers/About.tid', 'utf8')
    .then (setVersion(version))
    .then (delay (500)) // necessary?  I worry.
    .then (writeFile ('./tiddlers/About.tid'))
    .catch (console .warn)

const setVersion = (version) => (text) =>
  text.replace (
    /\nversion\: ([^\n]+)\n/, 
    (_, v) => `\nversion: ${version == 'latest' ? (v .trim () .replace (/\+/g, '') + '+') : version}\n`
  ) .replace (
    /caption\: About \(version ([^\)]+)\)\s*\n/,
    (_, v) => `caption: About (version ${version == 'latest' ? (v .trim () .replace (/\+/g, '') + '+') : version})\n`
  )

const delay = (ms) => (v) =>
  new Promise ((res) => setTimeout (() => res (v), ms)) 

main (process .argv [2] || 'unknown')

