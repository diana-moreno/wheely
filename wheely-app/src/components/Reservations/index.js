import React, { useState, useEffect } from 'react';
import './index.sass'
import Feedback from '../Feedback'
import ReservationCard from './Reservation-card'
import moment from 'moment'
import logic from '../../logic'
const { listPractices, retrieveUser } = logic
/*const moment = require('moment')*/

export default function({ id, onBack }) {
  const [practices, setPractices] = useState(undefined)
  const [role, setRole] = useState()
  const [notification, setNotification] = useState(null)
  const [activeFilter, setactiveFilter] = useState('all')
  const { token } = sessionStorage

  useEffect(() => {
    (async () => {
      try {
        const user = await retrieveUser(token, id)
        const { user: { role } } = user
        setRole(role)
        const result = await listPractices(token, id)
        const { practices } = result

        // if there are no reservations, we receive and empty array which throws and error. To avoid this, we set the value to undefined.
        setPractices(practices.length === 0
          ? undefined
          : practices.map(addStatus))
      } catch ({ message }) {
        setNotification({ error: true, message })
      }
    })()
  }, [token, id])

  // depending on the time and/or if a practices has feedback or not, we defined a status to each practice
  const addStatus = practice => {
    if (moment(practice.date).isAfter(moment())) {
      return {...practice, status: 'pending'}
    } else if(moment(practice.date).isBefore(moment()) && !practice.feedback) {
      return {...practice, status: 'feedback'}
    } else if (moment(practice.date).isBefore(moment()) && practice.feedback) {
      return {...practice, status: 'finished'}
    } else return {...practice}
  }

  // update in the state the value of the filter selected by the user
  const updateFilter = ({ target }) => {
    setactiveFilter(target.value)
  }

  // render the reservations depending on the filter selected
  const filterByActiveFilter = practice => {
    if (activeFilter === 'all') return practice // every practice
    return practice.status === activeFilter // only the same status
  }

  return < >
    <div className='title'>
      <i onClick={onBack} className="material-icons">undo</i>
      <h3>Reservations</h3>
    </div> <
    section className = 'reservations' >
    <form action="">
        <select name="role" className='reservations__search' onChange={updateFilter}>
          <option value="all">All</option>
          <option value="pending">Pending</option>
          <option value="feedback">Missing feedback</option>
          <option value="finished">Finished</option>
        </select>
      </form>
    <div className = 'reservations__container' >
      <ul>
        { practices ? practices
          .filter(filterByActiveFilter)
          .sort((a, b) =>  moment(b.date).diff(moment(a.date)))
          .map((practice, i) =>
            <ReservationCard key={i} practice={practice} role={role} /> )
          : <p className='reservations__empty'>No reservations yet</p>
        }

      </ul>
    </div>
    {notification && <Feedback {...notification} />}
  </section>
  </>
}
