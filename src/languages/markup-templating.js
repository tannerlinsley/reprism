export default {
  language: 'markup-templating',
  init: Prism => {
    Prism.languages['markup-templating'] = {}

    Object.defineProperties(Prism.languages['markup-templating'], {
      buildPlaceholders: {
        // Tokenize all inline templating expressions matching placeholderPattern
        // If the replaceFilter function is provided, it will be called with every match.
        // If it returns false, the match will not be replaced.
        value (env, language, placeholderPattern, replaceFilter) {
          if (env.language !== language) {
            return
          }

          env.tokenStack = []

          env.code = env.code.replace(placeholderPattern, match => {
            if (typeof replaceFilter === 'function' && !replaceFilter(match)) {
              return match
            }
            let i = env.tokenStack.length
            // Check for existing strings
            while (
              env.code.indexOf(`___${language.toUpperCase()}${i}___`) !==
              -1
            ) { ++i }

            // Create a sparse array
            env.tokenStack[i] = match

            return `___${language.toUpperCase()}${i}___`
          })

          // Switch the grammar to markup
          env.grammar = Prism.languages.markup
        },
      },
      tokenizePlaceholders: {
        // Replace placeholders with proper tokens after tokenizing
        value (env, language) {
          if (env.language !== language || !env.tokenStack) {
            return
          }

          // Switch the grammar back
          env.grammar = Prism.languages[language]

          let j = 0
          const keys = Object.keys(env.tokenStack)
          var walkTokens = function (tokens) {
            if (j >= keys.length) {
              return
            }
            for (let i = 0; i < tokens.length; i++) {
              const token = tokens[i]
              if (
                typeof token === 'string' ||
                (token.content && typeof token.content === 'string')
              ) {
                const k = keys[j]
                const t = env.tokenStack[k]
                const s = typeof token === 'string' ? token : token.content

                const index = s.indexOf(
                  `___${language.toUpperCase()}${k}___`
                )
                if (index > -1) {
                  ++j
                  const before = s.substring(0, index)
                  const middle = new Prism.Token(
                    language,
                    Prism.tokenize(t, env.grammar, language),
                    `language-${language}`,
                    t
                  )
                  const after = s.substring(
                    index + (`___${language.toUpperCase()}${k}___`).length
                  )
                  var replacement
                  if (before || after) {
                    replacement = [before, middle, after].filter(v => !!v)
                    walkTokens(replacement)
                  } else {
                    replacement = middle
                  }
                  if (typeof token === 'string') {
                    Array.prototype.splice.apply(
                      tokens,
                      [i, 1].concat(replacement)
                    )
                  } else {
                    token.content = replacement
                  }

                  if (j >= keys.length) {
                    break
                  }
                }
              } else if (token.content && typeof token.content !== 'string') {
                walkTokens(token.content)
              }
            }
          }

          walkTokens(env.tokens)
        },
      },
    })
  },
}
