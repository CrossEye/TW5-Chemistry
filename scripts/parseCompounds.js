const names = require ('../RawData/compoundNames.json')
const parseCompound = require ('./../scripts/parseCompound')

const main = (names) =>
 // console .log (names)
 // names .forEach (console .log) && Promise.resolve ('done')
   Promise .all (Object .entries (names) .map (([k, v]) => parseCompound (v)))
    // .then (console .log)
    

main (names)
  .then (console .log)
  .catch (console .warn)