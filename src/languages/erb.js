export default {
  language: 'erb',
  init: Prism => {
    (function (Prism) {
      Prism.languages.erb = Prism.languages.extend('ruby', {})
      Prism.languages.insertBefore('erb', 'comment', {
        delimiter: {
          pattern: /^<%=?|%>$/,
          alias: 'punctuation',
        },
      })

      Prism.hooks.add('before-tokenize', env => {
        const erbPattern = /<%=?[\s\S]+?%>/g
        Prism.languages['markup-templating'].buildPlaceholders(
          env,
          'erb',
          erbPattern
        )
      })

      Prism.hooks.add('after-tokenize', env => {
        Prism.languages['markup-templating'].tokenizePlaceholders(env, 'erb')
      })
    }(Prism))
  },
}
