export default {
  language: 'brainfuck',
  init: Prism => {
    Prism.languages.brainfuck = {
      pointer: {
        pattern: /<|>/,
        alias: 'keyword',
      },
      increment: {
        pattern: /\+/,
        alias: 'inserted',
      },
      decrement: {
        pattern: /-/,
        alias: 'deleted',
      },
      branching: {
        pattern: /\[|\]/,
        alias: 'important',
      },
      operator: /[.,]/,
      comment: /\S+/,
    }
  },
}
