var test = require ('tap') . test
var rpt = require ('../rpt.js')
var path = require ('path')
var fs = require ('fs')
var archy = require ('archy')
var fixtures = path . resolve (__dirname, 'fixtures')
var roots = [ 'root', 'other', 'selflink' ]
var cwd = path . resolve (__dirname, '..')
var fs = require ('fs')

var symlinks = {
  'selflink/node_modules/@scope/x/node_modules/glob':
    '../../../foo/node_modules/glob',
  'other/node_modules/glob':
    '../../root/node_modules/@scope/x/node_modules/glob'
}

function cleanup () {
  Object . keys (symlinks) . forEach (function (s) {
    var p = path . resolve (cwd, 'test/fixtures', s)
    try {
      fs . unlinkSync (p)
    } catch (er) {}
  })
}

test ('setup symlinks', function (t) {
  cleanup ()

  Object . keys (symlinks) . forEach (function (s) {
    var p = path . resolve (cwd, 'test/fixtures', s)
    fs . symlinkSync (symlinks [ s ], p)
  })

  t . end ()
})

roots . forEach (function (root) {
  var dir = path . resolve (fixtures, root)
  var out = path . resolve (dir, 'archy.txt')

  test (root, function (t) {
    rpt (dir, function (er, d) {
      if (er)
        throw er
      var actual = archy (archyize (d)) . trim ()
      // console . log ('----', dir)
      // console . log (actual)
      var expect = fs . readFileSync (out, 'utf8') . trim ()
      t . equal (actual, expect)
      t . end()
    })
  })
})

function archyize (d) {
  var label = d . package ? d . package . _id + ' ' : ''
  label += d . path . substr (cwd . length + 1)
  return {
    label : label,
    nodes : d . children . map (archyize)
  }
}

test('cleanup', function (t) {
  cleanup ()
  t . end ()
})
