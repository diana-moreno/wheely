import React from 'react'
import './index.sass'

export default function ({ day, hour, handleClick, isChecked }) {
  return <>
    <li
      className={isChecked
        ? 'schedule__item schedule__item--checked'
        : 'schedule__item'}
      onClick={() => handleClick()}
    >
    </li>
  </>
}
