import React, { useContext, useState, useEffect } from 'react'
import './index.sass'
import Feedback from '../Feedback'
import ScheduleItem from './Schedule-item'
import { HOURS, DAYS_IN_NUMBERS, SHORT_WEEK_DAYS } from './constants'
import Context from '../CreateContext'
import logic from '../../logic'
const { updateSchedule, retrieveUser } = logic

export default function({ id, onBack }) {

  const { token } = sessionStorage
  const { roleOwner } = useContext(Context)
  const [name, setName] = useState()
  const [availableSchedule, setAvailableSchedule] = useState(null)
  const [notification, setNotification] = useState(null)

  useEffect(() => {
    (async () => {
      try {
        const result = await retrieveUser(token, id)
        const { user: { name, profile: { schedule : { days } } } } = result
        setName(name)
        setAvailableSchedule(days)
      } catch ({ message }) {
        setNotification({ error: true, message })
      }
    })()
  }, [token, id])

  // if is an instructor, only can visualize the data but modify nothing
  const updateSlot = (day, hour) => async () => {
    if(roleOwner === 'admin') {
      let result = await updateSchedule(token, id, day, hour)
      const { instructor: { profile: { schedule : { days } } } } = result
      setAvailableSchedule(days)
    }
  }

  return <>
    <div className='title'>
      <i onClick={onBack} className='material-icons'>undo</i>
      <h3>{name}'s Schedule</h3>
    </div>
    {notification && <Feedback {...notification} />}
    <section className='schedule'>
      <div className='schedule__timetable'>
        <div className='schedule__week-names'>
          { SHORT_WEEK_DAYS.map(d => <p>{d}</p>) }
        </div>
        <div className='schedule__time-interval'>
          { HOURS.map((hour) => <p>{hour}</p>) }
        </div>
        <ul className='schedule__board'>
          { availableSchedule === null
            ? 'Loading...'
            : HOURS.map((hour, j) => (
                DAYS_IN_NUMBERS.map((day, i) =>
                  <ScheduleItem
                    key={`${i}-${j}`}
                    day={day}
                    hour={hour}
                    handleClick={updateSlot(day, hour)}
                    isChecked={availableSchedule[day].hours.includes(hour)}
                  />
                )
              )
            )
          }
        </ul>
      </div>
    </section>
  </>
}