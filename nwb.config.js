module.exports = {
  type: 'react-component',
  npm: {
    esModules: true,
    umd: {
      global: 'ReactSyntax',
      externals: {
        react: 'React'
      }
    }
  }
}
