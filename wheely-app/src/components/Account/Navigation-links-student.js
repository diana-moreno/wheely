import React, { useContext } from 'react'
import { Link } from 'react-router-dom'
import Context from '../CreateContext'
import SearchIcon from './Search-icon'


export default function({ id }) {
  const { roleOwner } = useContext(Context)

  return <>
    <Link to={`/reservations/${id}`}>
      <SearchIcon />
      <p>Reservations</p>
    </Link>
    { roleOwner === 'student' &&
      <Link to={`/credits/${id}`}>
        <SearchIcon />
        <p>Credits</p>
      </Link>
    }
    <Link to={`/progression/${id}`}>
      <SearchIcon />
      <p>Progression</p>
    </Link>
  </>
}
