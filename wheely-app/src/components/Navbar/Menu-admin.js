import React from 'react'
import { Link } from 'react-router-dom'

export default function({ onToggleMenu, onLogout }) {
  const linkMapping = [
    { url: '/home', text: 'Home', fn: onToggleMenu },
    { url: '/register', text: 'Register', fn: onToggleMenu },
    { url: '/users', text: 'Users', fn: onToggleMenu },
    { url: '/', text: 'Logout', fn: onLogout },
  ]

  return <>
    { linkMapping.map(({ url, text, fn }) => (
        <li className='navbar__menu-item'>
          <Link onClick={fn} to={url}>{text}</Link>
        </li>
      ))
    }
  </>
}
