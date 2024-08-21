/**
 * Firebase configuration file.
 */

import { initializeApp } from 'firebase/app'
import type { FirebaseApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { collection, getFirestore } from 'firebase/firestore'
import type { CollectionReference, Firestore } from 'firebase/firestore'
import {
  UploadTaskSnapshot,
  getDownloadURL,
  getStorage,
  ref,
  uploadBytesResumable,
} from 'firebase/storage'

/**
 * Firebase configuration object.
 */
const firebaseConfig = {
  apiKey: "AIzaSyD1NIZLTjbl3Gs_ANQANv8W2IEpmKfTmLM",
  authDomain: "polarv2.firebaseapp.com",
  projectId: "polarv2",
  storageBucket: "polarv2.appspot.com",
  messagingSenderId: "213544665792",
  appId: "1:213544665792:web:e69ffde45dcb8b0349e325",
  measurementId: "G-0XZR7DECVP"
};

/**
 * Initialize the Firebase app with the provided configuration.
 */
const app: FirebaseApp = initializeApp(firebaseConfig)

/**
 * Get the Firebase storage instance.
 */
export const storage = getStorage(app)

/**
 * Get the Firestore instance.
 */
export const db: Firestore = getFirestore()

/**
 * Get the Firebase authentication instance.
 */
export const auth = getAuth(app)

/**
 * Reference to the "Customers" collection in Firestore.
 */
export const Customer: CollectionReference = collection(db, 'Customers')

/**
 * Reference to the "Companies" collection in Firestore.
 */
export const Companies: CollectionReference = collection(db, 'Companies')

/**
 * Reference to the "Admins" collection in Firestore.
 */
export const Admin: CollectionReference = collection(db, 'Admins')

/**
 * Reference to the "TeamMembers" collection in Firestore.
 */
export const TeamMembers: CollectionReference = collection(db, 'TeamMembers')

/**
 * Reference to the "Templates" collection in Firestore.
 */
export const Templates: CollectionReference = collection(db, 'Templates')

/**
 * Reference to the "CampaignFlows" collection in Firestore.
 */
export const CampaignFlows: CollectionReference = collection(db, 'CampaignFlows')

/**
 * Reference to the "Campaigns" collection in Firestore.
 */
export const Campaigns: CollectionReference = collection(db, 'Campaigns')

/**
 * Reference to the "WhatsappMessages" collection in Firestore.
 */
export const WhatsappMessages: CollectionReference = collection(db, 'WhatsappMessages')
