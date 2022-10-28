const express = require('express')
const admin = require('firebase-admin')
require('dotenv').config()

const app = express()
const port = 4000
let idx = 1

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: `${process.env.FIREBASE_PROJECT_ID}`,
      clientEmail: `${process.env.FIREBASE_CLIENT_EMAIL}`,
      privateKey: `${process.env.FIREBASE_PRIVATE_KEY}`.replace(/\\n/g, '\n'),
    }),
  })
}
const auth = admin.auth()
const db = admin.firestore()

/**
 * Gets all the users (1000 MAX) from Firebase auth.
 *
 * @param {Object} req Express Request Object.
 * @param {Object} res Express Response Object
 */

const getAllUsersAnCreateNewUsersCollection = () => {
  auth
    .listUsers()
    .then(async (userRecords) => {
      const users = userRecords.users.map((user) => {
        const userJSON = user.toJSON()
        return {
          uid: userJSON.uid,
          username: userJSON.displayName || 'sin nombre',
          email: userJSON.email,
        }
      })
      for await (const user of users) {
        addUser(user)
      }
    })
    .catch((error) => console.error(error))
}

const addUser = async (user) => {
  try {
    const collectionRef = db.collection('users').doc(user.uid)
    await collectionRef.set(user)
    console.log(`${idx} Uruario creado`)
    idx++
  } catch (err) {
    console.error(err)
  }
}

getAllUsersAnCreateNewUsersCollection()

app.listen(port, () => console.log(`Listen on port: ${port}`))
