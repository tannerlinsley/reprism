# RePrism

<!-- [![Travis][build-badge]][build] -->

[![npm package][npm-badge]][npm]

<!-- [![Coveralls][coveralls-badge]][coveralls] -->

Modular Syntax highlighting for the web.

## Inspiration

The original [Prism.js](https://prismjs.com) is probably one of the best syntax highlighters ever created for javascript. It's extremely performant, and comes packed with tons of languages that people have worked hard to support. However, it wasn't created to play nice with tomorrow's module bundlers like Webpack, Rollup, or Parcel (despite it's claims to do so). **RePrism** is the answer to that need.

## Features

* 100% Prism Theme compatibility
* SSR compatible
* Feature Parity for all original Prism languages
* Modular & Bundler friendly
* Near-full support for plugins

## Installation

```bash
# yarn
$ yarn add reprism
# npm
$ npm install --save reprism
```

## Basic Usage

Reprism's core comes packaged with the same 4 default languages that Prism does:

* `markup`
* `clike`
* `css`
* `javascript`

All you need is a Prism theme and you can use `reprism` right away!

```javascript
import { highlight } from "reprism";

import "prismjs/themes/prism-okaidia.css";

const htmlCode = `
  <div>
  <ul>
    <li className='foo' alt='bar' style="background: red;">
      Hello!
    </li>
  </ul>
  </div>
`;

const highlightedCode = reprism(htmlCode, "html");
// <pre class='reprism html language-html'><span class=\\"token tag\\"><span class=\\"token tag\\"><span class=\\"token punctuation\\...
```

## Using Prism Themes

Good news! You can use any prism compatible theme that you want, out of the box. Just make sure the styles are loaded, and you're good to go! You can do this any number of ways using various bundlers and plugins or even traditional `<link>` tags.

Here are the themes we recommend:

* [PrismJS: Default Themes](https://github.com/PrismJS/prism/tree/master/themes/)
* [PrismJS: Extended Themes](https://github.com/PrismJS/prism-themes/tree/master/themes)
* [React-Smackdown Themes](https://github.com/react-tools/react-smackdown/tree/master/themes/)

## Languages

RePrism supports all of the same languages that Prism does, but they have been upgraded to play nicely with bundlers. [Click here for the complete directory of updated languages](https://github.com/tannerlinsley/reprism/tree/master/languages/).

To use these languages, simply import them and load them using RePrism's `loadLanguages` export. Here's an example of loading the `jsx` syntax and using it:

```javascript
import { highlight, loadLanguages } from "reprism";
import jsx from "reprism/lanugages/jsx";

loadLanguages(jsx);

const jsxCode = `
  const element = (
    <div>
      <ul>
        {items.map(item => (
          <li key={item.id} className='foo'>
            {item.name}
          </li>
        ))}
      </ul>
    </div>
  )
`;

const highlightedCode = reprism(jsxCode, "jsx");
// <pre class='reprism jsx language-jsx'<span class=\\"token keyword\\">const</span> element <span class=\\"token operator\\">=</span> <span class=\\"token punctuation\\">(</span>...
```

## Plugins

As long as they are used strictly in the browser, most original Prism plugins should work just fine as long as you provide them the global `Prism` object:

```javascript
// Import the Prism Api
import Prism from "reprism";

// When in the browser
if (typeof document !== "undefined") {
  // Provide window.Prism for plugins
  window.Prism = Prism;
  require("prismjs/plugins/copy-to-clipboard");
}
```

## Migrating Other Languages

If you have a language that wasn't already ported from the [original Prism list](https://github.com/tannerlinsley/reprism/tree/master/src/languages/), then you can easily upgrade it to work with RePrism like so:

```javascript
export default {
  language: "yourLanguageID",
  init: Prism => {
    // Insert your original Prism language code
  }
};
```

That's it!

## API

#### `highlight`

Use this method to highlight a string of code.

* Arguments
  * `code: String (Required)` - The string of code you want to highlight
  * `language: String (Required)` - The language you want to use to parse the code.
  * `component: String|Boolean` - Defaults to `pre`. The html tag RePrism should use to wrap the source code. If set to `false`, the source code will not be wrapped in any element.
* Returns
  * `String` - The resulting HTML markup for your code as a `String`, wrapped in a `<pre>` tag.

```javascript
import { highlight } from "reprism";

const highlightedCode = highlight("...", "javascript");
```

#### `loadLanguages`

Use this method to load languages into RePrism

* Arguments
  * `...languages` or `languages[]` - The languages you want to load. You can pass them as paramaters, or as an array.

```javascript
import { loadLanguages } from "reprism";

import jsx from "reprism/languages/jsx";
import elixir from "reprism/languages/elixir";
import ruby from "reprism/languages/ruby";

loadLanguages(jsx, elixir, ruby);
// or
loadLanguages([jsx, elixir, ruby]);
```

#### `Prism`

The global export used almost exclusively for Plugin backwards compatibility. Expose this as a global variable for plugins to work properly

```javascript
import Prism from "reprism";

if (typeof document !== "undefined") {
  window.Prism = Prism;
  require("prismjs/plugins/copy-to-clipboard");
}
```

[build-badge]: https://img.shields.io/travis/tannerlinsley/reprism/master.png
[build]: https://travis-ci.org/tannerlinsley/reprism
[npm-badge]: https://img.shields.io/npm/v/npm-package.png
[npm]: https://www.npmjs.org/package/npm-package
[coveralls-badge]: https://img.shields.io/coveralls/tannerlinsley/reprism/master.png
[coveralls]: https://coveralls.io/github/tannerlinsley/reprism
