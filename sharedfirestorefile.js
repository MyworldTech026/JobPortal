import { db, auth } from './config.js'

import {
   collection,
   doc,
   getDoc,
   getDocs, setDoc,
   addDoc, onSnapshot, query,
   where, limit, updateDoc, increment,
   collectionGroup,
   deleteDoc,
   serverTimestamp,
    writeBatch,
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js"

import { deleteUser } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js"
import { signinWithGoggle, reauthGoogleUserForDelete } from './sharedauthfile.js'

//import { deleteuser } from './sharedauthfile.js'


export async function saveUserDetails(userid, details) {
   await setDoc(doc(db, 'users', userid), details)
}

export async function getUser(userid) {
   const user = await getDoc(doc(db, 'users', userid))
   return user.data()
}

// THIS FUNCTION DOES SAME AS GETUSER JUST THAT THIS ONE DETECT LIVE CHANGES
export async function listenForUser(userid, callback) {
   onSnapshot(doc(db, 'users', userid), (snapshot) => {
      callback(snapshot.data())
   })
}

// export async function getJobOwner(){
//    const q=query(
//       collection(db,)
//    )
//    const owner=await getDoc()
// }

export async function PostJob(jobDetails) {
   const job = await addDoc(collection(db, 'Jobs'), jobDetails)
   return job
}

// limit(max)
export async function fetchAllApproveJobs(max, callback) {
   console.log(max)
   const q = query(
      collection(db, 'Jobs'),
      where('status', '==', 'accepted')
   )

   onSnapshot(q, (snapshot) => {
      const snap = snapshot.docs.map(doc => ({
         id: doc.id,
         ...doc.data()
      }))
      let totalJob = snap.length
      let maximum = 0;
      if (snap.length === max) {
         maximum = max
      }

      callback(snap.splice(0, max), maximum, totalJob)
   })
}

export async function getAJobDetails(jobid) {
   const singleJob = await getDoc(doc(db, 'Jobs', jobid))
   return singleJob.data()
}


export async function getEmployer(employerid) {
   const employer = await getDoc(doc(db, 'users', employerid))
   return employer.data()
}

export async function getJobsByEmployer(employerid, callback) {
   const q = query(
      collection(db, 'Jobs'),
      where('employerId', '==', employerid)
   )
   onSnapshot(q, (snapshot) => {
      const employerJobs = snapshot.docs.map(doc => ({
         id: doc.id,
         ...doc.data()
      }))
      callback(employerJobs)
   })
}


export async function checkIfAlreadyApplyForJob(jobid, userid) {
   const alreadyApplied = await getDoc(doc(db, 'Jobs', jobid, 'applicants', userid))
   return alreadyApplied
}

export async function applyForJob(jobid, userid, userApplicationDetails) {
   const apply = await setDoc(doc(db, 'Jobs', jobid, 'applicants', userid), userApplicationDetails)
}

export async function updateApplicantCount(jobid) {
   const update = updateDoc(doc(db, 'Jobs', jobid), {
      applicantCount: increment(1)
   })
}

export async function fetchJobApplications(userid, callback) {
   const q = query(
      collectionGroup(db, 'applicants'),
      where('graduateId', '==', userid)
   )

   onSnapshot(q, (snapshot) => {
      const snap = snapshot.docs.map(doc => ({
         id: doc.id,
         ...doc.data()
      }))
      callback(snap)
   })
}

export async function getApplicants(jobid) {
   const applicants = await getDocs(collection(db, 'Jobs', jobid, 'applicants'))
   const snap = applicants.docs.map(doc => ({
      ...doc.data()
   }))
   return snap
}

export async function updateApplicationStatus(jobid, applicantid, status) {
   const updateStatus = await updateDoc(doc(db, 'Jobs', jobid, 'applicants', applicantid), {
      status: status
   })
}

// UPDATE GRADUATE PROFILE
export async function updateProfile(userid, updatedetails) {
   const update = updateDoc(doc(db, 'users', userid), {
      Fname: updatedetails.Fname || '',
      Lname: updatedetails.Lname || '',
      phone: updatedetails.phone || '',
      fieldOfStudy: updatedetails.fieldOfStudy || '',
      bio: updatedetails.bio || '',
      skills: updatedetails.skills || []
   })
   return update
}


export async function updateEmployerProfile(userid, updatedetails) {
   const update = updateDoc(doc(db, 'users', userid), {
      companyName: updatedetails.companyName || '',
      companywebUrl: updatedetails.companywebsite || '',
      industry: updatedetails.industry || '',
      About: updatedetails.About || '',
      email: updatedetails.email || '',
      profileComplete:true
   })
   return update
}


//UPDATE BOTH GRADUATE AND EMPLOYER PROFILE PICTURE
export async function updateProfileImage(userid, url, property) {
   const update = updateDoc(doc(db, 'users', userid), {
      [property]: url
   })
}


// UPDATE GRADUATE CV AND PROFILECOMPLETE
export async function updateGraduateCV(userid, url){
    const update = updateDoc(doc(db, 'users', userid), {
      cvUrl: url,
      profileComplete:true
   })
    return update
}






const CLOUD_NAME = `inkswellblog`
export async function uploadToCloudinary(file, type, preset) {
   const formdata = new FormData()
   formdata.append('file', file)
   formdata.append('upload_preset', preset)

   console.log(`cloudinary`)
   // console.log( `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/${type}/upload`)
   // return
   const response = await fetch(
      `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/${type}/upload`,
      { method: 'POST', body: formdata }
   )

   if (!response.ok) {
      throw new Error(`cloudinary upload failed`)
   }

   const data = await response.json()
   return data.secure_url
}


export function saveToStorage(key, data) {
   localStorage.setItem(key, JSON.stringify(data))
}


export async function finishAccountDeletion(user) {
   try {
       const deldoc = await deleteDoc(doc(db, "users", user.uid));
         const deluser = await deleteUser(user);
         window.location.href = "index.html";
   }
   catch (error) {
      alert(`Network error
             pls try again`)
   }
}


export async function deleteAllJobsByEmployer(employerId) {
  const jobsQuery = query(collection(db, "Jobs"), where("employerId", "==", employerId));
  const snapshot = await getDocs(jobsQuery);

  for (const jobDoc of snapshot.docs) {
    const applicantsSnapshot = await getDocs(collection(db, "Jobs", jobDoc.id, "applicants"));
    const batch = writeBatch(db);
    applicantsSnapshot.forEach((appDoc) => {
      batch.delete(doc(db, "Jobs", jobDoc.id, "applicants", appDoc.id));
    });
    batch.delete(doc(db, "Jobs", jobDoc.id));
    await batch.commit();
  }
  return snapshot
}


export async function anonymizeGraduateApplications(graduateId) {
  const applicantsGroup = collectionGroup(db, 'applicants');
  const q = query(applicantsGroup, where('graduateId', '==', graduateId));

  const snapshot = await getDocs(q);

  if (snapshot.empty) return;

  const batch = writeBatch(db);

  snapshot.forEach((applicantDoc) => {
    batch.update(applicantDoc.ref, {
      graduateName: "Deleted User",
      graduatePhotoUrl: null,
      graduateFieldOfStudy: null,
      cvUrl: null,
      coverNote: null,
      accountDeleted: true
    });
  });

  await batch.commit();
  return snapshot
}



//import { doc, getDoc, setDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";


export async function handleGoogleSignIn(intendedRole,spinner) {
   const user = await signinWithGoggle(spinner);
   const userDocRef = doc(db, "users", user.uid);
   const userDoc = await getDoc(userDocRef);

   if (!userDoc.exists()) {
      // first time signing in , create their profile now


      if (!intendedRole) {
        document.querySelector('.js-no-account-overlay').hidden=false
          return
      }

      let [Fname, Lname] = user.displayName.split(' ')
      if (intendedRole === `graduate`) {
         const gradCredential = {
            uid: user.uid,
            Fname,
            Lname,
            email: user.email,
            phone: '',
            fieldOfStudy: '',
            role: intendedRole,
            suspend: false,
            profileComplete: false,
            cvUrl: null,
            photoUrl: user.photoURL,
            bio: '',
            skills: [],
            createdAt: serverTimestamp()
         }
         await setDoc(userDocRef, gradCredential);
      }
      else {
         const employerCredential = {
            uid: user.uid,
            Fname,
            Lname,
            email: user.email,
            About: '',
            industry: '',
            role: intendedRole,
            suspend: false,
            companyName: '',
            companywebUrl: null,
            companyLogoUrl: user.photoURL,
            profileComplete: false,
            isVerified: false,
            createdAt: serverTimestamp()
         }
         await setDoc(userDocRef, employerCredential);
      }

   }

   // now redirect based on their (new or existing) role
   const finalRole = userDoc.exists() ? userDoc.data().role : intendedRole;
   window.location.href = finalRole === "graduate" ? "graduate-dashboard.html" : "employer-dashboard.html";
  // return `error`
}








// UTILS FOR THE ADMIN PAGE ONLY

export async function getAllPendingJobs(callback) {
   const jobs = onSnapshot(collection(db, 'Jobs'), (snapshot) => {
      const snap = snapshot.docs.map(doc => ({
         id: doc.id,
         ...doc.data()
      }))
      const filtered = snap.filter(job => job.status === `pending`)
      callback(filtered, snap)
   })
   return jobs
}


export async function updateJobStatus(jobid, stat, reasons = undefined) {
   const update = await updateDoc(doc(db, 'Jobs', jobid),
      {
         status: stat,
         rejectionReason: reasons || null
      }
   )
   return update
}

export async function getAllUsers(callback) {
   const users = onSnapshot(collection(db, 'users'), (snapshot) => {
      const snap = snapshot.docs.map(doc => ({
         id: doc.id,
         ...doc.data()
      }))
      callback(snap)
   })
   return users
}

export async function suspendUser(userid, verdict,reason) {
   const user = await updateDoc(doc(db, 'users', userid), {
      suspend: verdict,
      suspensionReason:reason
   })

   return user
}









