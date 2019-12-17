import React, { useState, useEffect } from 'react';
import { Route, withRouter } from 'react-router-dom'
import Context from '../CreateContext'
import './index.sass'

import Home from '../Home'
import Login from '../Login'
import Reservations from '../Reservations'
import Booking from '../Booking'
import Credits from '../Credits'
import Progression from '../Progression'
import Schedule from '../Schedule'
import UsersList from '../Users-list'
import Register from '../Register'
import Valoration from '../Valoration'
import Account from '../Account'
import Profile from '../Profile'
import Navbar from '../Navbar'
import ReservationDetail from '../Reservation-detail'

import logic from '../../logic'
const { retrieveUser } = logic

export default withRouter(function({ history }) {
  const [nameSurname, setNameSurname] = useState()
  const [myId, setMyId] = useState()
  const [roleOwner, setRoleOwner] = useState(undefined)
  const [credits, setCredits] = useState()
  const [name, setName] = useState()

  const { token } = sessionStorage

// when the page is reloaded, retrieve the user and save it into the state
  useEffect(() => {
    (async () => {
      try {
        if(token) {
          const [,payload,] = token.split('.')
          const json = atob(payload)
          const { sub } = JSON.parse(json)
          const id = sub

          const result = await retrieveUser(token, id)
          // retrieve and save in state my profile
          const { user: { name, surname, role } } = result
          const nameSurname = name.concat(' ').concat(surname)
          setMyId(id)
          setName(name)
          setRoleOwner(role)
          setNameSurname(nameSurname)
          if(roleOwner === 'student') {
            const { user: { profile: { credits } } } = result
            setCredits(credits)
          }
        }
      }catch (error) {
        console.log(error)
      }
    })()
  }, )

  const handleGoBack = (event) => {
    history.goBack()
  }

  return <>
    <Context.Provider value={{ roleOwner, setRoleOwner, nameSurname, setNameSurname, setMyId, myId }}>

      {/*Login*/}
      { !token && <Route exact path='/' render={() => <Login />} /> }

      {/*Navbar*/}
      { token && roleOwner && <Navbar /> }

      {/*Home*/}
      { token && <Route path='/home' render={() => <Home name={name} />} />}

      {/*Register*/}
      { token && roleOwner === 'admin' && <Route path = '/register' render={() => <Register onBack={handleGoBack} /> }/> }

      {/*Account*/}
      { token && roleOwner && <Route exact path='/account/:id' render={({ match: { params: { id }}}) => <Account id={id} onBack={handleGoBack} /> }/>}

      { token && roleOwner === 'admin' && <Route exact path='/account/:id/users/' render={({ match: { params: { id }}}) => id && <UsersList id={id} onBack={handleGoBack}  /> } />}

      { /* Profile */ }
      { token && roleOwner && <Route path='/profile/:id' render={({ match: { params: { id }}}) => token && id
        ? <Profile id={id} onBack={handleGoBack}  /> : <Home /> } /> }

      {/*Users list*/}
      { (roleOwner === 'admin' || roleOwner === 'instructor') && <Route path = '/users' render={() => <UsersList onBack={handleGoBack} /> }/> }

      {/*Booking*/}
      { token && roleOwner === 'student' && <Route path = '/booking'
        render={() => token ? <Booking onBack={handleGoBack}  /> : '' }/>}

      {/*Credits*/}
      { token && roleOwner === 'student' && <Route path = '/credits' render={() =>
        token ? <Credits onBack={handleGoBack} credits={credits} /> : '' }/>}

      {/*Progression*/}
      { roleOwner && <Route path='/progression/:id' render={({ match: { params: { id }}}) => token && id
        ? <Progression id={id} onBack={handleGoBack} />
        : <Navbar /> } /> }

      {/*Schedule*/}
      { token && (roleOwner === 'admin' || roleOwner === 'instructor') && <Route path='/schedule/:id' render={({ match: { params: { id }}}) => token && id
        ? <Schedule id={id} onBack={handleGoBack} />
        : <Home /> } /> }

      {/*Valoration*/}
      { token && roleOwner === 'instructor' && <Route path='/valoration/:id' render={({ match: { params: { id }}}) => token
        ? <Valoration id={id} onBack={handleGoBack}  />
        : <Home /> } /> }

      {/*Reservations*/}
      { roleOwner && <Route path='/reservations/:id' render={({ match: { params: { id }}}) => token && id
        ? <Reservations id={id} onBack={handleGoBack} />
        : '' } /> }

      {/*Reservations detail*/}
      { (roleOwner === 'instructor' || roleOwner === 'student') && <Route path='/reservation-detail/:id' render={({ match: { params: { id }}}) => token && id
        ? <ReservationDetail id={id} onBack={handleGoBack} />
        : '' } /> }

    </Context.Provider>
  </>
})
