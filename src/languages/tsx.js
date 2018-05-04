export default {
  language: 'tsx',
  init: Prism => {
    const typescript = Prism.util.clone(Prism.languages.typescript)
    Prism.languages.tsx = Prism.languages.extend('jsx', typescript)
  },
}
