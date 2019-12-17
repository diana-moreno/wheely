import React, { useContext, useState } from 'react'
import './index.sass'
import Context from '../CreateContext'
import MenuStudent from './Menu-student'
import MenuInstructor from './Menu-instructor'
import MenuAdmin from './Menu-admin'

export default function() {
  const { roleOwner, nameSurname } = useContext(Context)
  const [toggleMenu, setToggleMenu] = useState(false)

  const handleToggleMenu = () => {
    setToggleMenu(!toggleMenu)
  }

  const handleLogout = () => {
    sessionStorage.clear()
  }

  return (
    <header>
      <nav className='navbar'>
        <div className='navbar__menu-toggle'>
          <div onClick={handleToggleMenu} className='navbar__lines-container' >
            <span className='navbar__line'></span>
            <span className='navbar__line'></span>
            <span className='navbar__line'></span>
          </div>
          <h1 className='navbar__title'>Wheely</h1>
          <ul className={!toggleMenu
            ? 'navbar__menu' : 'navbar__menu navbar__menu--show'}>
            { roleOwner === 'student'
              && <MenuStudent
                onToggleMenu={handleToggleMenu}
                onLogout={handleLogout} />
            }
            { roleOwner === 'instructor'
              && <MenuInstructor
                onToggleMenu={handleToggleMenu}
                onLogout={handleLogout} />
            }
            { roleOwner === 'admin'
              && <MenuAdmin
                onToggleMenu={handleToggleMenu}
                onLogout={handleLogout} />
            }
          </ul>
        </div>
      </nav>
      <div className='greeting'>
        <i className='material-icons greeting__rol-icon'>supervisor_account</i>
        <h3 className='greeting__name'>{nameSurname}</h3>
      </div>
    </header>
  )
}