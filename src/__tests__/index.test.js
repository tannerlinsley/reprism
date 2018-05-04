import Prism, { highlight, loadLanguages } from '../'

import markupTest from './snippets/markup'
import cssTest from './snippets/css'
import clikeTest from './snippets/clike'
import javascriptTest from './snippets/javascript'
import elixirTest from './snippets/elixir'
import rubyTest from './snippets/ruby'

import jsx from '../languages/jsx'
import elixir from '../languages/elixir'
import ruby from '../languages/ruby'

loadLanguages(jsx, elixir, ruby)

describe('Prism', () => {
  it('should export a global', () => {
    expect(Prism).toBeDefined()
  })
  it('should highlight markup', () => {
    const res = highlight(markupTest, 'markup')
    expect(res).toMatchSnapshot()
  })
  it('should highlight css', () => {
    const res = highlight(cssTest, 'css')
    expect(res).toMatchSnapshot()
  })
  it('should highlight clike', () => {
    const res = highlight(clikeTest, 'clike')
    expect(res).toMatchSnapshot()
  })
  it('should highlight javascript', () => {
    const res = highlight(javascriptTest, 'javascript')
    expect(res).toMatchSnapshot()
  })
  it('should highlight jsx', () => {
    const res = highlight(javascriptTest, 'jsx')
    expect(res).toMatchSnapshot()
  })
  it('should highlight elixir', () => {
    const res = highlight(elixirTest, 'elixir')
    expect(res).toMatchSnapshot()
  })
  it('should highlight ruby', () => {
    const res = highlight(rubyTest, 'ruby')
    expect(res).toMatchSnapshot()
  })
})
