'use strict'

const fs = require('fs')
const y = require('js-yaml')
const c = require('color')

// var base = y.load(fs.readFileSync('mojo.yml', 'utf-8'))

function unescape(val) {
  return (val||'').toString().replace(/_([\w\d]{3,8})/g, m => '#' + m.slice(1))
}

function dct(val, _) {
  _ = _ || ''
  if (typeof val === 'string' || !val || typeof val !== 'object' || val.constructor !== Object)
    return `${_}<string>${unescape(val)}</string>\n`

  var res = `${_}<dict>\n`
  for (var x in val) {
    res += `${_}  <key>${x}</key>\n`
    res += dct(val[x], _ + '  ')
  }
  res += `${_}</dict>\n`
  return res
}

class S {

  constructor() {
    this.settings = {}
    this.scopes = []
  }

  static from(color) {
    var res = new S()
    res.settings.foreground = color.hex()
    S.scopes.push(res)
    return res
  }

  bg(col) {
    this.settings.background = col.hex()
    return this
  }

  italic() {
    this.settings.fontStyle = 'italic'
    return this
  }

  bold() {
    this.settings.fontStyle = 'bold'
    return this
  }

  add() {
    this.scopes = this.scopes.concat(Array.prototype.slice.call(arguments))
  }

  render(indent) {
    return dct({
      settings: this.settings,
      name: '...',
      scope: this.scopes.join(', ')
    }, indent)
  }
}

S.scopes = []

/////////////////////////////////////////////////

var NAME = 'My Mojo'

var FG = c('#eeeeee')

// Base color

// blueish
var FN = c('#68c4ff').saturate(0.2).lighten(0.15)

var TSX = FN.rotate(180)
var TYPES = FN.rotate(-60)
var BASE = FN.rotate(20)
var CONSTANT = FN.rotate(230).desaturate(0.4)

var COMMENT = FN.darken(0.5).desaturate(0.7)
var BG = FN.darken(0.9).desaturate(0.9)

var settings = {
  foreground: FG.hex(),
  background: BG.hex(),
  caret: FG.hex(),
  invisibles: FG.hex(),
  bracketContentsOptions: 'underline',
  tagsOptions: 'underline'
  // lineHighlight:
  // selection:
  // selectionBorder:
  // tagsForeground:
}

S.from(COMMENT).italic().add(
  'comment',
  'punctuation.definition.comment'
)

S.from(BASE).add(
  'keyword.control',
  'storage.type',
  'storage.modifier'
)

S.from(FG).add(
  'string variable',
  'string punctuation.accessor',
  'string keyword'
)

S.from(FN.lighten(0.15)).add(
  'meta.definition.variable',
  'meta.parameters punctuation',
  'meta.parameters punctuation.definition',
  'variable.parameter'
)

S.from(BASE.lighten(0.15)).add(
  'meta.objectliteral punctuation.definition',
  'meta.objectliteral meta.object-literal.key'
)

S.from(TYPES).add(
  'meta.type.annotation',
  'entity.name.type',
  'meta.return.type',
  'meta.type.parameters'
)

S.from(TYPES.lighten(0.2)).add(
  'meta.type.annotation keyword',
  'meta.type.annotation meta.brace',
  'meta.type.annotation punctuation',
  'meta.type.parameters punctuation',
  'meta.type.parameters meta.brace'
)

S.from(TYPES.darken(0.2)).add(
  'entity.name.type.class'
)

S.from(FN).add(
  'meta.definition entity.name.function',
  'entity.name.function',
  'support.function'
)


S.from(TSX).add(
  'entity.name.tag'
)

S.from(TSX.lighten(0.1)).add(
  'entity.other.attribute-name',
  'meta.tag punctuation.section',
  'meta.tag punctuation.definition',
  'meta.tag keyword.operator.assignment'
)

S.from(CONSTANT).add(
  'meta.embedded string',
  'string',
  'constant',
  'punctuation.definition.string'
)

S.from(CONSTANT.darken(0.3).saturate(0.3)).add(
  'string punctuation.definition.template-expression'
)

var res = `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist
  PUBLIC '-//Apple//DTD PLIST 1.0//EN'
  'http://www.apple.com/DTDs/PropertyList-1.0.dtd'>
<plist version="1.0">
  <dict>
    <key>name</key>
    <string>${NAME}</string>
    <key>comment</key>
    <string></string>
    <key>settings</key>
    <array>
${dct({settings: settings}, '      ')}
${S.scopes.map(s => s.render('       ')).join('\n')}
    </array>
  </dict>
</plist>
`

fs.writeFileSync('mojo.tmTheme', res, {encoding: 'utf-8'})
