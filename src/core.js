let uniqueID = 0

export const languages = {
  extend,
  insertBefore,
  DFS,
}
export const plugins = {}
export const hooks = {
  all: {},
  add: addHook,
  run: runHook,
}

class Token {
  constructor (type, content, alias, matchedStr, greedy) {
    this.type = type
    this.content = content
    this.alias = alias
    // Copy of the full string this token was created from
    this.length = (matchedStr || '').length | 0
    this.greedy = !!greedy
  }
  static stringify = (o, language, parent) => {
    if (getType(o) === 'String') {
      return o
    }

    if (getType(o) === 'Array') {
      return o.map(element => Token.stringify(element, language, o)).join('')
    }

    const env = {
      type: o.type,
      content: Token.stringify(o.content, language, parent),
      tag: 'span',
      classes: ['token', o.type],
      attributes: {},
      language,
      parent,
    }

    if (o.alias) {
      const aliases = Array.isArray(o.alias) ? o.alias : [o.alias]
      Array.prototype.push.apply(env.classes, aliases)
    }

    hooks.run('wrap', env)

    const attributes = Object.keys(env.attributes)
      .map(name => `${name}="${(env.attributes[name] || '').replace(/"/g, '&quot;')}"`)
      .join(' ')

    return `<${env.tag} class="${env.classes.join(' ')}"${attributes ? ` ${attributes}` : ''}>${
      env.content
    }</${env.tag}>`
  }
}

const Prism = {
  languages,
  plugins,
  insertBefore,
  matchGrammar,
  tokenize,
  hooks,
  util: {
    encode,
    type: getType,
    objId,
    clone,
  },
  Token,
}

export default Prism

export function highlight (text, language, { component = 'pre' } = {}) {
  if (!languages[language]) {
    if (!language) {
      throw new Error('A language is required!')
    }
    throw new Error(`The language: ${language} hasn't been loaded yet!`)
  }
  const env = {
    code: text,
    grammar: languages[language],
    language,
  }
  hooks.run('before-tokenize', env)
  env.tokens = tokenize(env.code, env.grammar)
  hooks.run('after-tokenize', env)
  return `${
    component ? `<${component} class='reprism ${language} language-${language}'>` : ''
  }${Token.stringify(encode(env.tokens), env.language)}${component ? `</${component}>` : ''}`
}

export function encode (tokens) {
  if (tokens instanceof Token) {
    return new Token(tokens.type, encode(tokens.content), tokens.alias)
  } else if (getType(tokens) === 'Array') {
    return tokens.map(encode)
  }
  return tokens
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/\u00a0/g, ' ')
}

export function getType (o) {
  return Object.prototype.toString.call(o).match(/\[object (\w+)\]/)[1]
}

export function objId (obj) {
  if (!obj.__id) {
    uniqueID += 1
    Object.defineProperty(obj, '__id', { value: uniqueID })
  }
  return obj.__id
}

export function loadLanguages (...langs) {
  langs.forEach(lang => {
    if (getType(lang) === 'Array') {
      lang.forEach(subLang => {
        subLang.init(Prism)
      })
    } else {
      lang.init(Prism)
    }
  })
}

// Deep clone a language definition (e.g. to extend it)
export function clone (o, visited) {
  visited = visited || {}

  if (getType(o) === 'Array') {
    if (visited[objId(o)]) {
      return visited[objId(o)]
    }
    const c = []
    visited[objId(o)] = c

    o.forEach((v, i) => {
      c[i] = clone(v, visited)
    })

    return c
  }

  if (getType(o) === 'Object') {
    if (visited[objId(o)]) {
      return visited[objId(o)]
    }
    const c = {}
    visited[objId(o)] = c

    Object.keys(o).forEach(key => {
      c[key] = clone(o[key], visited)
    })

    return c
  }

  return o
}

export function extend (id, redef) {
  const lang = clone(languages[id])
  Object.keys(redef).forEach(key => {
    lang[key] = redef[key]
  })
  return lang
}

export function insertBefore (...args) {
  const [inside, before, insert, base = languages] = args

  const grammar = base[inside]
  let resolvedInsert = insert

  if (args.length === 2) {
    resolvedInsert = args[1]

    Object.keys(resolvedInsert).forEach(key => {
      grammar[key] = resolvedInsert[key]
    })

    return grammar
  }

  const ret = {}

  Object.keys(grammar).forEach(key => {
    if (key === before) {
      Object.keys(insert).forEach(newKey => {
        ret[newKey] = insert[newKey]
      })
    }
    ret[key] = grammar[key]
  })

  // Update references in other language definitions
  DFS(languages, function callback (key, value) {
    if (value === base[inside] && key !== inside) {
      this[key] = ret
    }
  })

  base[inside] = ret

  return base[inside]
}

// Traverse a language definition with Depth First Search
export function DFS (o = {}, callback, type, visited) {
  visited = visited || {}
  Object.keys(o).forEach(i => {
    callback.call(o, i, o[i], type || i)
    if (getType(o[i]) === 'Object' && !visited[objId(o[i])]) {
      visited[objId(o[i])] = true
      DFS(o[i], callback, i, visited)
    } else if (getType(o[i]) === 'Array' && !visited[objId(o[i])]) {
      visited[objId(o[i])] = true
      DFS(o[i], callback, null, visited)
    }
  })
}

export function matchGrammar (text, strarr, grammar = {}, index, startPos, oneshot, target) {
  Object.keys(grammar).forEach(token => {
    if (!grammar[token]) {
      return
    }

    if (token === target) {
      return
    }

    let patterns = grammar[token]
    patterns = Array.isArray(patterns) ? patterns : [patterns]

    patterns.forEach(pattern => {
      const inside = pattern.inside
      const lookbehind = !!pattern.lookbehind
      const greedy = !!pattern.greedy
      let lookbehindLength = 0
      const alias = pattern.alias

      if (greedy && !pattern.pattern.global) {
        // Without the global flag, lastIndex won't work
        const flags = pattern.pattern.toString().match(/[imuy]*$/)[0]
        pattern.pattern = RegExp(pattern.pattern.source, `${flags}g`)
      }

      pattern = pattern.pattern || pattern

      // Don’t cache length as it changes during the loop
      for (let i = index, pos = startPos; i < strarr.length; pos += strarr[i].length, i += 1) {
        let str = strarr[i]

        if (strarr.length > text.length) {
          // Something went terribly wrong, ABORT, ABORT!
          return
        }

        if (str instanceof Token) {
          // eslint-disable-next-line
          continue
        }

        let delNum = 0
        let match

        if (greedy && i !== strarr.length - 1) {
          pattern.lastIndex = pos
          match = pattern.exec(text)
          if (!match) {
            break
          }

          const from = match.index + (lookbehind ? match[1].length : 0)
          const to = match.index + match[0].length
          let k = i
          let p = pos

          for (
            let len = strarr.length;
            k < len && (p < to || (!strarr[k].type && !strarr[k - 1].greedy));
            ++k
          ) {
            p += strarr[k].length
            // Move the index i to the element in strarr that is closest to from
            if (from >= p) {
              i += 1
              pos = p
            }
          }

          // If strarr[i] is a Token, then the match starts inside another Token, which is invalid
          if (strarr[i] instanceof Token) {
            // eslint-disable-next-line
            continue
          }

          // Number of tokens to delete and replace with the new match
          delNum = k - i
          str = text.slice(pos, p)
          match.index -= pos
        } else {
          pattern.lastIndex = 0

          match = pattern.exec(str)
          delNum = 1
        }

        if (!match) {
          if (oneshot) {
            break
          }

          // eslint-disable-next-line
          continue
        }

        if (lookbehind) {
          lookbehindLength = match[1] ? match[1].length : 0
        }

        const from = match.index + lookbehindLength
        match = match[0].slice(lookbehindLength)
        const to = from + match.length
        const before = str.slice(0, from)
        const after = str.slice(to)

        const args = [i, delNum]

        if (before) {
          i += 1
          pos += before.length
          args.push(before)
        }

        const wrapped = new Token(
          token,
          inside ? tokenize(match, inside) : match,
          alias,
          match,
          greedy
        )

        args.push(wrapped)

        if (after) {
          args.push(after)
        }

        Array.prototype.splice.apply(strarr, args)

        if (delNum !== 1) matchGrammar(text, strarr, grammar, i, pos, true, token)

        if (oneshot) break
      }
    })
  })
}

export function tokenize (text, grammar) {
  const strarr = [text]

  const rest = grammar.rest

  if (rest) {
    Object.keys(rest).forEach(token => {
      grammar[token] = rest[token]
    })

    delete grammar.rest
  }

  matchGrammar(text, strarr, grammar, 0, 0, false)

  return strarr
}

export function addHook (name, callback) {
  const allHooks = hooks.all

  allHooks[name] = allHooks[name] || []

  allHooks[name].push(callback)
}

export function runHook (name, env) {
  const callbacks = hooks.all[name]

  if (!callbacks || !callbacks.length) {
    return
  }

  callbacks.forEach(callback => callback(env))
}
