import { db, auth } from './config.js'
import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signOut,
  signInWithEmailAndPassword,
  EmailAuthProvider,
  reauthenticateWithCredential,
  reauthenticateWithPopup,
  GoogleAuthProvider,
  signInWithPopup,
  sendPasswordResetEmail
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js"

export async function createAccount(email, password) {
  const signup = await createUserWithEmailAndPassword(auth, email, password)
  return signup
}

export async function login(email, password) {
  const userCredentials = await signInWithEmailAndPassword(auth, email, password)
  return userCredentials
}


export async function watchAuthChange(onLogin, onLogout) {
  onAuthStateChanged(auth, (user) => {
    if (user) {
      onLogin(user)
    } else {
      onLogout()
    }
  })
}


export async function logOut() {
  return signOut(auth)
}

export async function DeleteUser(USER, password) {
  const credential = EmailAuthProvider.credential(USER.email, password)
  const authentication = await reauthenticateWithCredential(USER, credential)
  return authentication
}




const googleProvider = new GoogleAuthProvider();


export async function reauthGoogleUserForDelete(user) {
  const reAuth = await reauthenticateWithPopup(user, googleProvider)
  return reAuth
}




export async function signinWithGoggle() {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    return result.user;
  }
  catch (error) {
   alert(`An error occur`)
  }

}


export async function resetPassword(email){
return sendPasswordResetEmail(auth,email)
}
// export async function deleteuser(user){
// let del= await deleteUser(user)
// return del
// }