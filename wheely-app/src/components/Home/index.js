import React, { useContext } from 'react'
import Context from '../CreateContext'
import './index.sass'
import OptionsInstructor from './Options-instructor'
import OptionsStudent from './Options-student'
import OptionsAdmin from './Options-admin'

export default function({ name }) {
  const { roleOwner } = useContext(Context)
  return <>
    <div className='title'>
      <h3>Home</h3>
    </div>
    <section className='home'>
      <p className='home__greeting'>Welcome, {name}!</p>
      <div className='home__description'>
        <p>This is your personal area in Wheely. From here you can:</p>
        <ul>
          { roleOwner === 'student' && <OptionsStudent />}
          { roleOwner === 'instructor' && <OptionsInstructor />}
          { roleOwner === 'admin' && <OptionsAdmin />}
        </ul>
      </div>
    </section>
  </>
}
