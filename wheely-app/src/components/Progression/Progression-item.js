import React from 'react'
import './index.sass'
/*const moment = require('moment')*/
import moment from 'moment'

export default function ({ practice, i }) {
  let { date, feedback, valoration } = practice
  date = moment(date).format('DD-MM-YYYY')

  // color mappgin depending on the practice valoration
  const colorMapping = {
    bad: 'red',
    regular: 'orange',
    good: 'green',
  }
  const color = colorMapping[valoration]

  return <>
    <li className='timeline__item'>
      <div className={`timeline__bullet timeline__bullet--${color}`}>{i}</div>
      <div className='timeline__date'>{date}</div>
      <div className='timeline__feedback'>
        <p>{feedback}</p>
      </div>
    </li>
  </>
}
