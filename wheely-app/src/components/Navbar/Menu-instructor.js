import React, { useContext } from 'react'
import { Link } from 'react-router-dom'
import Context from '../CreateContext'

export default function({ onToggleMenu, onLogout }) {
  const { myId } = useContext(Context)
  const linkMapping = [
    { url: '/home', text: 'Home', fn: onToggleMenu },
    { url: `/account/${myId}`, text: 'Account', fn: onToggleMenu },
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
