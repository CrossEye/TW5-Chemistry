/*\
title: $:/_/my/macros/displayfield.js
type: application/javascript
module-type: macro
Macro to format the chemical field value
\*/
(function(){

/*jslint node: true, browser: true */
/*global $tw: false */
"use strict";

/*
Information about this macro
*/

exports.name = "displayfield";

exports.params = [{name: 'name'}];

/*
Helpers for the macro
*/

const displayField = ((handlers = {
  'atomic-mass': (v, e) => `A<sub>r</sub><sup>°</sup>(${e.symbol}) = ${v}`,
  'boiling-point': (v, e) => `${v} °K`,
  'density': (v, e) => `${v} g/cm<sup>3</sup>`,
  'atomic-radius': (v, e) => `${v} pm`,
  'electronegativity': (v, e) => `Pauling scale: ${v}`,
  'element-type': (v, e) => `[[${v}]]`,
  'first-ionization': (v, e) => `${v} kJ/mol`,
  'group': (v, e) => v ? `[[${v}|https://en.wikipedia.org/wiki/Group_${v}_element]]` : ``,
  'melting-point': (v, e) => `${v} °K`,
  'metal': (v, e) => v || 'no',
  'metalloid': (v, e) => v || 'no',
  'natural': (v, e) => v || 'no',
  'non-metal': (v, e) => v || 'no',
  'period': (v, e) => v ? `[[${v}|https://en.wikipedia.org/wiki/Period_${v}_element]]`: ``,
  'radioactive': (v, e) => v || 'no',
  'specific-heat': (v, e) => `${v} J⋅kg<sup>−1</sup>⋅K<sup>−1</sup>`,
  'year': (v, e) => v || e.discoverer,  // interesting hack
}) => (field, element) => 
  (handlers [field] || ((v) => v)) (element [field] || '',  element)
) ()
/*
Run the macro
*/
exports.run = function(name) {
	return displayField (name)
};

})();