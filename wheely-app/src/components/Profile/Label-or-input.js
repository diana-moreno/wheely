import React from 'react'

const LabelOrInput = ({ isEditting, label, children, content }) => (
  <p className={isEditting ? 'detail-user__input--separation' : ''}>
    <b>{label}</b>
    { isEditting ? children : <span>{content}</span> }
  </p>
)

export default LabelOrInput