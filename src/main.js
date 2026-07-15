import { mount } from 'svelte'
//import './app.css'
import '../node_modules/bootstrap-icons/font/bootstrap-icons.scss'
import './ripflo-dark.sass'

import App from './App.svelte'

const app = mount(App, {
  target: document.getElementById('app'),
})

export default app
//export const rpHost = `http://192.168.68.109/`;