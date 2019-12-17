import React from 'react'
import './index.sass'

export default function({ error, message }) {
  const baseClassName = 'feedback__message feedback__message'
  return (
    <section className="feedback">
      <p className={`${baseClassName}--${error ? 'error': 'success'}`}>
        {message}
      </p>
    </section>
  )
}