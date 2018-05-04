import markup from './languages/markup'
import css from './languages/css'
import clike from './languages/clike'
import javascript from './languages/javascript'

import Reprism, { highlight, loadLanguages } from './core'

loadLanguages([markup, css, clike, javascript])

export default Reprism
export { highlight, loadLanguages }
