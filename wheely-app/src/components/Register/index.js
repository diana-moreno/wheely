import React, { useState } from 'react'
import './index.sass'
import Feedback from '../Feedback'
import logic from '../../logic'
const { registerUser } = logic

export default function({ onBack }) {
  const { token } = sessionStorage
  const [notification, setNotification] = useState(null)


  const handleSubmit = event => {
    event.preventDefault()
    const { name: { value: name }, surname: { value: surname }, email: { value: email }, dni: { value: dni }, password: { value: password }, role: { value: role } } = event.target
    handleRegister(name, surname, email, dni, password, role)
    event.target.reset()
  }

  const handleRegister = async (name, surname, email, dni, password, role) => {
    try {
      await registerUser(token, name, surname, email, dni, password, role)
      setNotification({ error: false, message: 'Registration succesfully!'})
    } catch ({ message }) {
      setNotification({ error: true, message })
    }
  }

  return <>
    <div className='title'>
      <i onClick={onBack} className='material-icons'>undo</i>
      <h3>Register</h3>
    </div>
    <section className='register'>
      <h3>Create a new user</h3>
      <p>All fields are required</p>
      <form className='register__form' onSubmit={handleSubmit}>
        <input type='text' name='name' placeholder='name' />
        <input type='text' name='surname' placeholder='surname' />
        <input type='text' name='email' placeholder='email' />
        <input type='text' name='dni' placeholder='DNI' />
        <input type='password' name='password' placeholder='password' />
        <select name='role'>
          <option value=''>-- role --</option>
          <option value='student'>student</option>
          <option value='instructor'>instructor</option>
          <option value='admin'>admin</option>
        </select>
        <button className='form__button form__button--register'>Create account</button>
      </form>
      <Feedback {...notification} />
    </section>
  </>
}
