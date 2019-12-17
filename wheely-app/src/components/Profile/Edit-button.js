import React, { Fragment, useContext } from 'react'
import './index.sass'
import Context from '../CreateContext'

export default function ({ elem, permission, onEditMode }) {
  const { roleOwner } = useContext(Context)
  return <Fragment>
      <div
        className={roleOwner !== permission
          ? 'detail-user__input--separation-no-icon' : ''}
      >
        { roleOwner === permission &&
          <button
            type="button"
            className='detail-user__button--hidden'
            onClick={() => onEditMode(elem)}>
            <i className="material-icons detail-user__icon">create</i>
          </button>
        }
      </div>
  </Fragment>
}