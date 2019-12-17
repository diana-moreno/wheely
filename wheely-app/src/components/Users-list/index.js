import React, { useState, useEffect, useContext } from 'react'
import './index.sass'
import Feedback from '../Feedback'
import UsersItem from './User-item'
import Context from '../CreateContext'
import './index.sass'
import logic from '../../logic'
const { listUsers } = logic


export default function({ onBack, id }) {
  const { roleOwner } = useContext(Context)
  const [usersList, setUsersList] = useState()
  const { token } = sessionStorage
  const [notification, setNotification] = useState(null)
  const [activeFilter, setactiveFilter] = useState('')

  useEffect(() => {
    (async () => {
      try {
        let { users } = await handleListUsers()
        if(users.studentId) {
          users = users.studentId
        }
        setUsersList(users)
      } catch ({ message }) {
        setNotification({ error: true, message })
      }
    })()
  }, [])

  const handleListUsers = async () => {
    try {
      let users
      if (id) {
        users = await listUsers(token, id)
      } else {
        users = await listUsers(token)
      }
      return users
    } catch ({ message }) {
      setNotification({ error: true, message })
    }
  }

  // handle data from searcher and set it to the state
  const filterUser = ({ target }) => {
    setactiveFilter(target.value.toLowerCase())
  }

  // check if the query introduced matches with any user
  const filterByActiveFilter = (user) => {
    return user.name.toLowerCase().includes(activeFilter)
      || user.surname.toLowerCase().includes(activeFilter)
  }

  return <>
    <div className='title'>
      <i onClick={onBack} className="material-icons">undo</i>
      <h3 className='title'>{roleOwner === 'admin' ? 'Users' : 'Your students'}</h3>
    </div>
    <section className='users'>
      <form className='users__searcher' action="">
        <input
          className='users__searcher-input'
          type="text"
          placeholder="search user"
          onChange={filterUser}
        />
      </form>
      <ul>
      { usersList && usersList
        .filter(filterByActiveFilter)
        .sort((a, b) => (a.name > b.name) ? 1 : -1)
        .map((currentUser, i) =>
        <UsersItem key={i} currentUser={currentUser} /> )
      }
      </ul>
      { notification && <Feedback {...notification} />}
    </section>
    </>
}
