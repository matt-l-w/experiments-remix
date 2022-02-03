import { LinksFunction } from 'remix'
import stylesUrl from '../styles/index.css'

export const links: LinksFunction = () => [{
  rel: 'stylesheet',
  href: stylesUrl,
}]

export default () => <p>Hello</p>