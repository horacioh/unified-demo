var h = require('virtual-dom/h');
var createElement = require('virtual-dom/create-element');
var diff = require('virtual-dom/diff');
var patch = require('virtual-dom/patch');
var unified = require('unified');
var english = require('retext-english');
var visit = require('unist-util-visit');

var hues = [
  60,
  60,
  60,
  300,
  300,
  0,
  0,
  120,
  120,
  120,
  120,
  120,
  120,
  180
];

var processor = unified().use(english);
var root = document.querySelector('#root');
var tree = render('The initial text.');
var dom = root.append(createElement(tree));

setTimeout(resize, 4);

function onchange(ev) {
  var next = render(ev.target.value);
  dom = patch(dom, diff(tree, next));
  tree = next;
  setTimeout(resize, 4);
}

function render(text) {
  var node = parse(text);
  console.log('node =>', node);
  var key = 0;

  return h('div', {className: 'editor'}, [
    h('div', {key: 'draw', className: 'draw'}, highlight(node)),
    h('textarea', {
      key: 'area',
      value: text,
      oninput: onchange
    })
  ]);

  function parse(value) {
    return processor.runSync(processor.parse(value));
  }

  function highlight(node) {
    var children = node.children;
    var length = children.length;
    var index = -1;
    var results = [];

    while (++index < length) {
      results = results.concat(one(children[index]));
    }

    return results;
  }

  function one(node) {
    var result = 'value' in node ? node.value : highlight(node);

    if (node.type === 'SentenceNode') {
      key++;
      result = h('span', {
        key: `s-${key}`,
        style: {
          backgroundColor: color(count(node))
        }
      }, result);
    }

    return result;
  }

  function count(node) {
    var value = 0;

    visit(node, 'WordNode', add);

    return value;

    function add() {
      value++;
    }
  }

  function color(count) {
    var value = count < hues.length ? hues[count] : hues[hues.length - 1];
    return `hsl(${value}, 93%, 85%)`;
  }
}

function resize() {
  dom.lastChild.rows = Math.ceil(
    dom.firstChild.getBoundingClientRect().height /
    Number.parseInt(window.getComputedStyle(dom.firstChild).lineHeight, 10)
  ) + 1;
}
