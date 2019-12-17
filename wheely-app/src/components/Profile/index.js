import React, { useContext, useState, useEffect } from 'react'
import './index.sass'
import Feedback from '../Feedback'
import Context from '../CreateContext'
import EditButton from './Edit-button'
import LabelOrInput from './Label-or-input'
import logic from '../../logic'
const { retrieveUser, deleteUser, editUser } = logic

export default function({ id, onBack }) {
  const [isEditMode, setEditMode] = useState(false)
  const [isFirstNameEdit, setFirstNameEdit] = useState(false)
  const [isLastNameEdit, setLastNameEdit] = useState(false)
  const [isEmailEdit, setEmailEdit] = useState(false)
  const [isCreditsEdit, setCreditsEdit] = useState(false)
  const [isDniEdit, setDniEdit] = useState(false)
  const [firstName, setFirstName] = useState()
  const [lastName, setLastName] = useState()
  const [email, setEmail] = useState()
  const [password, setPassword] = useState()
  const [role, setRole] = useState()
  const [credits, setCredits] = useState()
  const [dni, setDni] = useState()
  const [notification, setNotification] = useState(null)

  const { roleOwner } = useContext(Context)
  const { token } = sessionStorage

  useEffect(() => {
    (async () => {
      try {
        const user = await retrieveUser(token, id)
        const { user: { name, surname, email, dni, role, profile: { credits } } } = user
        setDni(dni)
        setFirstName(name)
        setLastName(surname)
        setEmail(email)
        setRole(role)
        setCredits(credits)

      } catch ({ message }) {
        setNotification({ error: true, message })
      }
    })()
  }, [token, id])

  // save in state for every input, a boolean to know if it's in edit mode or not
  const enableEditMode = (str) => {
    if(str === 'firstName') {
      setFirstNameEdit(!isFirstNameEdit)
    } else if(str === 'lastName') {
      setLastNameEdit(!isLastNameEdit)
    } else if (str === 'email') {
      setEmailEdit(!isEmailEdit)
    } else if(str === 'credits') {
      setCreditsEdit(!isCreditsEdit)
    } else if(str === 'dni') {
      setDniEdit(!isDniEdit)
    }
    setEditMode(true)
  }

  // disable all edits mode at a time
  const disableEditMode = () => {
    setEditMode(false)
    setFirstNameEdit(false)
    setLastNameEdit(false)
    setEmailEdit(false)
    setCreditsEdit(false)
    setDniEdit(false)
    setNotification(null)
  }

  const handleDeleteUser = async () => {
    try {
      await deleteUser(token, id)
      onBack()
      onBack()
      setNotification({ error: false, message: 'User deleted successfully!' })
    } catch ({ message }) {
      setNotification({ error: true, message })
    }
  }

  // prepare all data from form in submit
  const handleSubmit = event => {
    event.preventDefault()
    handleEditUser(firstName, lastName, email, dni, credits, password)
  }

  const handleEditUser = async (firstName, lastName, email, dni, credits, password) => {
    try {
      await editUser(token, id, firstName, lastName, email, dni, credits, password)
      disableEditMode()
      setNotification({ error: false, message: 'Your changes have been saved successfully!' })
    } catch ({ message }) {
      setNotification({ error: true, message })
    }
  }

  return <>
    <div className='title'>
      <i onClick={onBack} className='material-icons'>undo</i>
      <h3>Profile</h3>
    </div>
    <section className='detail-user'>
      <div className='detail-user__container'>
        <form onSubmit={handleSubmit} >

          {/* firstname*/}
          <div>
            <EditButton
              elem={'firstName'}
              permission={'admin'}
              onEditMode={enableEditMode}
            />
            <LabelOrInput
              isEditting={isFirstNameEdit}
              label='First name: '
              content={firstName}
            >
              <input
                className='detail-user__input'
                type='text'
                placeholder={ firstName }
                name='name'
                value={firstName}
                onChange={event => setFirstName(event.target.value)}
              />
            </LabelOrInput>
          </div>

          {/*lastName*/}
          <div>
            <EditButton
              elem={'lastName'}
              permission={'admin'}
              onEditMode={enableEditMode}
            />
            <LabelOrInput
              isEditting={isLastNameEdit}
              label='Last name: '
              content={lastName}
            >
              <input
                className='detail-user__input'
                type='text'
                placeholder={ lastName }
                name='surname'
                value={lastName}
                onChange={event => setLastName(event.target.value)}
              />
            </LabelOrInput>
          </div>

          {/*email*/}
          <div>
            <EditButton elem={'email'} permission={roleOwner} onEditMode={enableEditMode} />
            <LabelOrInput
              isEditting={isEmailEdit}
              label='e-mail: '
              content={email}
            >
              <input
                className='detail-user__input'
                type='text'
                placeholder={ email }
                name='email'
                value={email}
                onChange={event => setEmail(event.target.value)}
              />
            </LabelOrInput>
          </div>

          {/*credits*/}
          {roleOwner === 'admin' && role === 'student' &&
            <div>
              <EditButton elem={'credits'} permission={roleOwner} onEditMode={enableEditMode} />
              <LabelOrInput
                isEditting={isCreditsEdit}
                label='Credits : '
                content={credits}
              >
                <input
                  className='detail-user__input'
                  type='number'
                  pattern='[0-9]*'
                  placeholder={credits}
                  name='credits'
                  min='0'
                  value={credits}
                  onChange={event => setCredits(Number(event.target.value))}
                />
              </LabelOrInput>
            </div>
          }

          {/*dni*/}
            <div>
              <EditButton elem={'dni'} permission={'admin'} onEditMode={enableEditMode} />
              <LabelOrInput
                isEditting={isDniEdit}
                label='DNI : '
                content={dni}
              >
                <input
                  className='detail-user__input'
                  type='text'
                  placeholder={dni}
                  name='dni'
                  value={dni}
                  onChange={event => setDni(event.target.value)}
                />
              </LabelOrInput>
            </div>


          {/*role*/}
          {!isEditMode &&
            <div className='detail-user__input--separation-no-icon'>
              <p><b>Account: </b>{role}</p>
            </div>
          }

          {/*password*/}
          {isEditMode && roleOwner !== 'admin' &&
            <>
              <p>Introduce your password to confirm changes</p>
              <input
                className='detail-user__input--password'
                type='password'
                placeholder='password'
                name='password'
                value={password}
                onChange={event => setPassword(event.target.value)}
              />
            </>
          }

          {/*cancel and submit buttons*/}
          {isEditMode &&
            <div className='detail-user__buttons'>
              <button
                type='button'
                className='detail-user__button detail-user__button--cancel'
                onClick={disableEditMode}
              >
                Cancel
              </button>
              <button
                type='submit'
                className='detail-user__button detail-user__button--submit'
              >
                Submit
              </button>
            </div>
          }

        </form>

        {notification && <Feedback {...notification} />}

        {/*delete user button*/}
        {roleOwner === 'admin' && !isEditMode && !notification &&
          <button
            type='button'
            onClick={handleDeleteUser}
            className='detail-user__button detail-user__button--delete'
          >
            Delete user
          </button>
        }
      </div>
    </section>
  </>
}
