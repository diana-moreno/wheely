import { Link } from 'react-router-dom'
import React, { useContext } from 'react'
import Context from '../CreateContext'
import SearchIcon from './Search-icon'


export default function({ id }) {
  const { roleOwner } = useContext(Context)

  // special link for admin when wants to check users of one user
  const adminRoute = (
    <Link to={`/account/${id}/users/`}>
      <SearchIcon />
      <p>The instructor students</p>
    </Link>
  )

  const normalRoute = (
    <Link to="/users">
      <SearchIcon />
      <p>Your students</p>
    </Link>
  )

  return <>
    <Link to={`/reservations/${id}`}>
      <SearchIcon />
      <p>Reservations</p>
    </Link>
    { roleOwner === 'admin' ? adminRoute : normalRoute }
    <Link to={`/schedule/${id}`}>
      <SearchIcon />
      <p>Schedule</p>
    </Link>
  </>
}
