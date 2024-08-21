import usePersistStore from '@store/usePersistStore'
import type {
  CustomerLeads,
  IAdmin,
  IBankDetails,
  IBankRoi,
  ICampaigns,
  ICompanies,
  ICustomer,
  ILead,
  ILeadConversion,
  IMessage,
  ITeamMember,
  ProfileData,
  TeamMemberData,
} from '@type/collections'
import {
  type DocumentReference,
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  query,
  setDoc,
  where,
} from 'firebase/firestore'
import { arrayUnion } from 'firebase/firestore'
import { getDownloadURL, ref, uploadBytesResumable } from 'firebase/storage'
import { useEffect, useState } from 'react'
import { toast } from 'react-toastify'
import {
  Admin,
  Campaigns,
  Companies,
  Customer,
  TeamMembers,
  WhatsappMessages,
  storage,
} from './config'

const defaultLeadConversion: ILeadConversion[] = [
  { fieldDatatype: 'string', fieldName: 'name', required: true },
  { fieldDatatype: 'Number', fieldName: 'phone', required: true },
]
/**
 * Uploads a single file to Firebase storage and updates the company document in Firestore.
 *
 * @param adminId - The ID of the admin.
 * @param companyId - The ID of the company.
 * @param file - The file to be uploaded.
 * @param docs - An array of document IDs.
 * @returns A Promise that resolves to an array of updated document IDs or an error message.
 */
export const singleFileUpload = async (
  adminId: string,
  companyId: string,
  file: File,
  docs: string[],
): Promise<string[] | string> => {
  try {
    console.log('HI enter')

    const dateTime = new Date().toISOString()

    // Check if the admin with the given ID exists
    const adminExists = await isAdmin(adminId)
    if (!adminExists) {
      toast.error('Admin not found')
      return 'Error'
    }

    const companyExists = await getDoc(doc(Companies, companyId)).then((doc) =>
      doc.exists(),
    )
    if (!companyExists) {
      toast.error('Company not found')
      return 'Error'
    }
    // Get the admin data by ID
    const companyDoc = await getDoc(doc(Companies, companyId))
    const companyData = companyDoc.data() as ICompanies
    const newdocs = () => {
      if (!companyData.pineIds) return docs
      const pineset = new Set(companyData.pineIds)
      return docs.filter((str) => !pineset.has(str))
    }
    const updatedDocs = newdocs()
    const adminSnap = await getDoc(doc(Admin, adminId))
    const admin = adminSnap.data() as IAdmin
    console.log(admin?.email)

    const storageRef = ref(
      storage,
      `files/${admin?.email ?? adminId}/${file.name} ${dateTime}`,
    )
    console.log(storageRef)

    // Create file metadata including the content type
    const metadata = {
      contentType: file.type,
    }

    // Upload the file in the bucket storage
    const snapshot = await uploadBytesResumable(storageRef, file, metadata)

    // Grab the public URL
    const downloadURL = await getDownloadURL(snapshot.ref)

    const companySnap = await getDoc(doc(Companies, companyId))
    const company = companySnap.data() as ICompanies
    const fileDetails = {
      fileName: file.name,
      filePath: `files/${admin?.email ?? adminId}/${file.name} ${dateTime}`,
      fileUrl: downloadURL,
      id: updatedDocs,
    }

    if (!company.companyDocs) {
      company.companyDocs = []
    }

    company.companyDocs.push(fileDetails)
    company.pineIds = docs
    const companyRef = doc(Companies, companyId)
    await setDoc(companyRef, company)
    if (updatedDocs) return updatedDocs
  } catch (error) {
    toast.error('Internal server error')
    console.error('Error uploading file: ', error)
  }
  return 'Error'
}

/**
 * Checks if a business ID already exists in the Firestore collection.
 *
 * @param businessId - The business ID to check.
 * @returns A Promise that resolves to a boolean indicating if the business ID exists.
 * @throws If there is an error checking the business ID existence.
 */
export const checkBusinessIdExistence = async (
  businessId: string,
): Promise<boolean> => {
  try {
    const q = query(Admin, where('businessId', '==', businessId))
    const querySnapshot = await getDocs(q)
    return querySnapshot.docs.length > 0
  } catch (error) {
    console.error(`Error checking businessId existence: ${error}`)
    throw error
  }
}

/**
 * Checks if a team member with the given email already exists in the Firestore collection.
 *
 * @param email - The email to check.
 * @returns A Promise that resolves to a boolean indicating if the team member exists.
 * @throws If there is an error checking the team member existence.
 */
export const checkTeamExistenceEmail = async (
  email: string,
): Promise<boolean> => {
  try {
    const q = query(TeamMembers, where('email', '==', email))
    const querySnapshot = await getDocs(q)
    return querySnapshot.docs.length > 0
  } catch (error) {
    console.error(`Error checking team member existence by email: ${error}`)
    throw error
  }
}

/**
 * Adds an admin to Firestore.
 *
 * @param adminData - The admin data to be added.
 * @returns A Promise that resolves to the ID of the added admin.
 * @throws If there is an error adding the admin to Firestore.
 */
export const addAdminToFirestore = async (
  adminData: IAdmin,
): Promise<string> => {
  try {
    const adminRef: DocumentReference = await addDoc(Admin, adminData)
    adminData.id = adminRef.id
    await setDoc(adminRef, adminData)
    return adminRef.id // Return the admin ID
  } catch (error) {
    console.error(`Error adding admin to Firestore: ${error}`)
    throw error
  }
}

/**
 * Adds a company to Firestore.
 *
 * @param companyData - The company data to be added.
 * @param adminId - The ID of the admin associated with the company.
 * @param businessId - The ID of the business.
 * @returns A Promise that resolves when the company is successfully added.
 * @throws If there is an error adding the company to Firestore.
 */
export const addCompanyToFirestore = async (
  companyData: ICompanies,
  adminId: string,
  businessId: string,
  companyName: string,
): Promise<void> => {
  try {
    companyData.adminId = adminId // Set the admin ID in the company data
    companyData.id = businessId
    companyData.companyName = companyName
    companyData.leadConversion = companyData.leadConversion?.length
      ? companyData.leadConversion
      : defaultLeadConversion
    const companyRef: DocumentReference = doc(Companies, businessId) // Create a document reference with the specified ID
    await setDoc(companyRef, companyData) // Set the document data at the specified reference
  } catch (error) {
    console.error(`Error adding company to Firestore: ${error}`)
    throw error
  }
}

/**
 * Adds an admin and a company to Firestore.
 *
 * @param adminData - The admin data to be added.
 * @param companyData - The company data to be added.
 * @param businessId - The ID of the business.
 * @returns A Promise that resolves when the admin and company are successfully added.
 * @throws If there is an error adding the admin and company to Firestore.
 */
export const addAdminAndCompany = async (
  adminData: IAdmin,
  companyData: ICompanies,
  businessId: string,
  companyName: string,
): Promise<void> => {
  try {
    const adminId = await addAdminToFirestore(adminData) // Get admin ID
    await addCompanyToFirestore(companyData, adminId, businessId, companyName) // Add company with admin ID
  } catch (error) {
    console.error(`Error adding admin and company to Firestore: ${error}`)
    throw error
  }
}

/**
 * Checks if a user with the given ID is an admin or a team member.
 *
 * @param id - The ID of the user.
 * @returns A Promise that resolves to a boolean indicating if the user is an admin or a team member.
 * @throws If there is an error checking the ID existence.
 */
export const isAdmin = async (id: string): Promise<boolean> => {
  try {
    const adminRef = doc(Admin, id)
    const adminDoc = await getDoc(adminRef)

    if (adminDoc.exists()) {
      return true
    }

    const teamMemberRef = doc(TeamMembers, id)
    const teamMemberDoc = await getDoc(teamMemberRef)

    return teamMemberDoc.exists()
  } catch (error) {
    console.error(`Error checking ID existence: ${error}`)
    throw error
  }
}

/**
 * Checks if an admin with the given email already exists in the Firestore collection.
 *
 * @param email - The email to check.
 * @returns A Promise that resolves to a boolean indicating if the admin exists.
 * @throws If there is an error checking the admin existence.
 */
export const checkAdminExistenceEmail = async (
  email: string,
): Promise<boolean> => {
  try {
    const q = query(Admin, where('email', '==', email))
    const querySnapshot = await getDocs(q)
    return querySnapshot.docs.length > 0
  } catch (error) {
    console.error(`Error checking admin existence by email: ${error}`)
    throw error
  }
}

/**
 * Adds team members to the team document in Firestore.
 *
 * @param teamData - The team member data to be added.
 * @returns A Promise that resolves when the team members are successfully added.
 * @throws If there is an error adding the team members to Firestore.
 */
export const addTeamMembersToTeamDoc = async (
  teamData: TeamMemberData,
): Promise<void> => {
  try {
    const teamRef: DocumentReference = await addDoc(TeamMembers, teamData)
    for (const teamMember of teamData.Array) {
      teamMember.id = teamRef.id
      console.log(teamMember)
      await setDoc(doc(TeamMembers, teamMember.id), teamMember)
    }
  } catch (error) {
    console.error(`Error adding team members to Firestore: ${error}`)
    throw error
  }
}

/**
 * Updates a team member in Firestore.
 *
 * @param teamMember - The team member data to be updated.
 * @returns A Promise that resolves when the team member is successfully updated.
 * @throws If there is an error updating the team member in Firestore.
 */
export const updateTeamMember = async (
  teamMember: ITeamMember,
): Promise<void> => {
  try {
    const teamMemberRef = doc(TeamMembers, teamMember.id)
    await setDoc(teamMemberRef, teamMember, { merge: true })
  } catch (error) {
    console.error(`Error updating team member in Firestore: ${error}`)
    throw error
  }
}

/**
 * Retrieves the team members associated with the given admin ID from Firestore.
 *
 * @param adminId - The ID of the admin.
 * @returns A Promise that resolves to an array of team members.
 * @throws If there is an error retrieving the team members from Firestore.
 */
export const getTeamMembers = async (
  adminId: string,
): Promise<ITeamMember[]> => {
  try {
    const q = query(TeamMembers, where('adminId', '==', adminId))
    const querySnapshot = await getDocs(q)
    const teamMembers: ITeamMember[] = []
    for (const doc of querySnapshot.docs) {
      teamMembers.push({ ...doc.data(), id: doc.id } as ITeamMember)
    }
    return teamMembers
  } catch (error) {
    console.error(`Error getting team members from Firestore: ${error}`)
    throw error
  }
}

/**
 * Retrieves a team member with the given ID from Firestore.
 *
 * @param id - The ID of the team member.
 * @returns A Promise that resolves to the team member object.
 * @throws If there is an error retrieving the team member from Firestore.
 */
export const getTeamMember = async (id: string): Promise<ITeamMember> => {
  try {
    const teamMemberDoc = await getDoc(doc(TeamMembers, id))
    return teamMemberDoc.data() as ITeamMember
  } catch (error) {
    console.error(`Error getting team member from Firestore: ${error}`)
    throw error
  }
}

/**
 * Deletes a team member from Firestore.
 *
 * @param id - The ID of the team member to delete.
 * @returns A Promise that resolves when the team member is successfully deleted.
 * @throws If there is an error deleting the team member from Firestore.
 */
export const deleteTeamMember = async (id: string): Promise<void> => {
  try {
    await deleteDoc(doc(TeamMembers, id))
    toast.success('Team member deleted successfully')
  } catch (error) {
    toast.error('Internal server error: Team member not deleted')
    console.error(`Error deleting team member from Firestore: ${error}`)
    throw error
  }
}

/**
 * Retrieves the profile data for the given admin ID from Firestore.
 *
 * @param adminId - The ID of the admin.
 * @returns A Promise that resolves to the profile data object.
 * @throws If there is an error retrieving the profile data from Firestore.
 */
export const getProfileData = async (adminId: string): Promise<ProfileData> => {
  try {
    const docRef = doc(Admin, adminId)
    const docSnap = await getDoc(docRef)
    return docSnap.data() as ProfileData
  } catch (error) {
    console.error(`Error getting profile data from Firestore: ${error}`)
    throw error
  }
}

/**
 * Sets the updated profile data for the given admin ID in Firestore.
 *
 * @param adminId - The ID of the admin.
 * @param profileData - The updated profile data to be set.
 * @returns A Promise that resolves when the profile data is successfully set.
 * @throws If there is an error setting the profile updated data in Firestore.
 */
export const setProfileUpdatedData = async (
  adminId: string,
  profileData: ProfileData,
): Promise<void> => {
  try {
    const adminRef = doc(Admin, adminId)
    await setDoc(adminRef, profileData, { merge: true })
  } catch (error) {
    console.error(`Error setting profile updated data to Firestore: ${error}`)
    throw error
  }
}

/**
 * Adds customer leads to Firestore.
 *
 * @param customerLeads - The array of customer leads to be added.
 * @param preSave - A boolean indicating whether to check for existing leads before saving.
 * @returns A promise that resolves to an array of extra leads that were not added.
 */
export const customerLeads = async (
  customerLeads: CustomerLeads,
  preSave: boolean,
): Promise<CustomerLeads> => {
  try {
    const extraLeads: CustomerLeads = []
    for (const lead of customerLeads) {
      lead.adminId = usePersistStore.getState().adminId
      const q = query(
        Customer,
        where('phone', '==', lead.phone),
        where('adminId', '==', lead.adminId),
      )
      const doc = (await getDocs(q)).docs[0]

      if (doc?.exists() && preSave) {
        console.log('Lead already exists')
        extraLeads.push(lead)
      } else {
        if (doc?.exists() && !preSave) {
          console.log('Lead already exists 02')
          await setDoc(doc.ref, lead)
        } else {
          console.log('Lead does not exist')
          await addDoc(Customer, lead)
        }
      }
    }
    return extraLeads
  } catch (error) {
    toast.error('Internal server error: Leads not added')
    console.error(`Error adding leads to Firestore: ${error}`)
    return []
  }
}

/**
 * Retrieves the leads associated with the admin ID from Firestore.
 *
 * @returns A Promise that resolves to an array of leads.
 * @throws If there is an error retrieving the leads from Firestore.
 */
export const getLeads = async (): Promise<CustomerLeads | undefined> => {
  try {
    const q = query(
      Customer,
      where('adminId', '==', usePersistStore.getState().adminId),
    )
    const querySnapshot = await getDocs(q)
    const leads: CustomerLeads = []
    for (const doc of querySnapshot.docs) {
      leads.push({ ...(doc.data() as ILead), id: doc.id })
    }
    return leads
  } catch (error) {
    toast.error('Internal server error: Leads not fetched')
    console.error(`Error getting leads from Firestore: ${error}`)
  }
}

/**
 * Retrieves a lead with the given phone number from Firestore.
 *
 * @param phone - The phone number of the lead.
 * @returns A Promise that resolves to the lead object.
 * @throws If there is an error retrieving the lead from Firestore.
 */
export const getLead = async (phone: string): Promise<ILead | undefined> => {
  try {
    const q = query(
      Customer,
      where('phone', '==', phone),
      where('adminId', '==', usePersistStore.getState().adminId),
    )
    const docSnap = (await getDocs(q)).docs[0]
    return docSnap.data() as ILead
  } catch (error) {
    toast.error('Internal server error: Lead not fetched')
    console.error(`Error getting lead from Firestore: ${error}`)
  }
}

/**
 * Deletes a lead from Firestore.
 *
 * @param phone - The phone number of the lead to delete.
 * @returns A Promise that resolves when the lead is successfully deleted.
 * @throws If there is an error deleting the lead from Firestore.
 */
export const deleteLead = async (phone: string): Promise<void> => {
  try {
    const q = query(
      Customer,
      where('phone', '==', phone),
      where('adminId', '==', usePersistStore.getState().adminId),
    )
    const docSnap = (await getDocs(q)).docs[0]
    await deleteDoc(doc(Customer, docSnap.id))
    toast.success('Lead deleted successfully')
  } catch (error) {
    toast.error('Internal server error: Lead not deleted')
    console.error(`Error deleting lead from Firestore: ${error}`)
  }
}

/**
 * Adds bank details to the company document in Firestore.
 *
 * @param companyId - The ID of the company.
 * @param bankDetails - The bank details to be added.
 * @param update - A boolean indicating whether to update existing bank details if they already exist.
 * @returns A Promise that resolves when the bank details are successfully added.
 * @throws If there is an error adding the bank details to Firestore.
 */
export const addBankDetails = async (
  companyId: string,
  bankDetails: IBankDetails,
  update: boolean,
): Promise<void> => {
  try {
    const companyRef = doc(Companies, companyId)
    const companyDoc = await getDoc(companyRef)
    const company = companyDoc.data() as ICompanies
    const bankExists = company.bankDetails?.some(
      (bank) => bank.bankName === bankDetails.bankName,
    )

    if (bankExists) {
      if (!update) {
        toast.error('Bank already exists')
        return
      }
      company.bankDetails = company.bankDetails?.map((bank) =>
        bank.bankName === bankDetails.bankName ? bankDetails : bank,
      )
      await setDoc(companyRef, company)
    } else {
      await setDoc(companyRef, {
        ...company,
        bankDetails: [...(company.bankDetails ?? []), bankDetails],
      })
    }
  } catch (error) {
    toast.error('Internal server error: Bank details not added')
    console.error(`Error adding bank details to Firestore: ${error}`)
  }
}

/**
 * Retrieves the bank details associated with the given company ID from Firestore.
 *
 * @param companyId - The ID of the company.
 * @returns A Promise that resolves to an array of bank details.
 * @throws If there is an error retrieving the bank details from Firestore.
 */
export const getBankDetails = async (
  companyId: string,
): Promise<IBankDetails[] | undefined> => {
  try {
    console.log(companyId)

    const companyRef = doc(Companies, companyId)
    const companyDoc = await getDoc(companyRef)
    const company = companyDoc.data() as ICompanies
    return company.bankDetails
  } catch (error) {
    toast.error('Internal server error: Bank details not fetched')
    console.error(`Error getting bank details from Firestore: ${error}`)
  }
}

/**
 * Retrieves a specific bank from Firestore based on the company ID and bank name.
 *
 * @param companyId - The ID of the company.
 * @param bankName - The name of the bank.
 * @returns A Promise that resolves to the bank details object.
 * @throws If there is an error retrieving the bank from Firestore.
 */
export const getBank = async (
  companyId: string,
  bankName: string,
): Promise<IBankDetails | undefined> => {
  try {
    const companyRef = doc(Companies, companyId)
    const companyDoc = await getDoc(companyRef)
    const company = companyDoc.data() as ICompanies
    const bank = company.bankDetails?.find((b) => b.bankName === bankName)
    return bank
  } catch (error) {
    toast.error('Internal server error: Bank not fetched')
    console.error(`Error getting bank from Firestore: ${error}`)
  }
}

/**
 * Deletes a bank from the company document in Firestore.
 *
 * @param companyId - The ID of the company.
 * @param bankName - The name of the bank to delete.
 * @returns A Promise that resolves when the bank is successfully deleted.
 * @throws If there is an error deleting the bank from Firestore.
 */
export const deleteBank = async (
  companyId: string,
  bankName: string,
): Promise<void> => {
  try {
    const companyRef = doc(Companies, companyId)
    const companyDoc = await getDoc(companyRef)
    const company = companyDoc.data() as ICompanies
    company.bankDetails = company.bankDetails?.filter(
      (bank) => bank.bankName !== bankName,
    )
    await setDoc(companyRef, company)
    toast.success('Bank deleted successfully')
  } catch (error) {
    toast.error('Internal server error: Bank not deleted')
    console.error(`Error deleting bank from Firestore: ${error}`)
  }
}

/**
 * Adds a CTA (Call to Action) to the company document in Firestore.
 *
 * @param companyId - The ID of the company.
 * @param ctaData - The CTA data to be added.
 * @returns A Promise that resolves when the CTA is successfully added.
 * @throws If there is an error adding the CTA to Firestore.
 */
export const addCtaToDb = async (
  companyId: string,
  ctaData: string[],
): Promise<void> => {
  try {
    const companyRef = doc(Companies, companyId)
    const companyDoc = await getDoc(companyRef)
    const company = companyDoc.data() as ICompanies
    company.cta = company.cta ?? []
    company.cta[0] = ctaData[0]
    company.cta[1] = ctaData[1]
    await setDoc(companyRef, company)
    toast.success('CTA added successfully')
  } catch (error) {
    toast.error('Internal server error: CTA not added')
    console.error(`Error adding CTA to Firestore: ${error}`)
  }
}

/**
 * Retrieves the CTA (Call to Action) associated with the given company ID from Firestore.
 *
 * @param companyId - The ID of the company.
 * @returns A Promise that resolves to an array of CTA strings.
 * @throws If there is an error retrieving the CTA from Firestore.
 */
export const getCta = async (
  companyId: string,
): Promise<string[] | undefined> => {
  try {
    const companyRef = doc(Companies, companyId)
    const companyDoc = await getDoc(companyRef)
    const company = companyDoc.data() as ICompanies
    return company.cta
  } catch (error) {
    toast.error('Internal server error: CTA not fetched')
    console.error(`Error getting CTA from Firestore: ${error}`)
    return undefined
  }
}

// export const addCustomersCreateCampaign = async (
//   customerData: CustomerLeads,
// ): Promise<string> => {
//   try {
//     const { companyId } = usePersistStore.getState()
//     const existingLeads = await customerLeads(customerData, companyId, true)
//     if (existingLeads.length) {
//       await customerLeads(existingLeads, companyId, false)
//     }
//     const customerNumbers = customerData.map((customer) => customer.phone)
//     const campaignRef = await addDoc(Campaigns, {
//       customers: customerNumbers,
//     })
//     return campaignRef.id
//   } catch (error) {
//     console.error(`Error adding customers to campaign: ${error}`)
//     throw error
//   }
// }

// Import arrayUnion

/**
 * Creates a campaign and adds additional data to it.
 *
 * @param campaignData - The data for the campaign.
 * @returns A Promise that resolves when the campaign is successfully created.
 * @throws If there is an error creating the campaign and adding data.
 */
export const createCampaignAddAllData = async (
  campaignData: ICampaigns,
): Promise<void> => {
  try {
    const { adminId } = usePersistStore.getState()
    const appendData = {
      acceptanceRate: 12,
      active: true,
      allLeads: 4,
      createdAt: new Date(),
      listOfLeads: 10,
      replyRate: 30,
    }

    const campaignRef = await addDoc(Campaigns, {
      ...campaignData,
      adminId,
      ...appendData,
    })
    const campaignName = campaignData.name
    // iterate on TeamMembers in campaign and add them to TeamMembers collection
    if (campaignData.teamMembers) {
      for (const team of campaignData.teamMembers) {
        const teamMemberRef = doc(TeamMembers, team)
        await setDoc(
          teamMemberRef,
          { assignedCampaigns: arrayUnion(campaignName) },
          { merge: true },
        )
      }
    }

    if (!campaignRef) toast.error('Campaign not created')
  } catch (error) {
    console.error(`Error creating campaign and adding data: ${error}`)
    throw error
  }
}

/**
 * Deletes a question from the out of bound array in the WhatsappMessages document and adds it to the custom FAQ in the company document.
 *
 * @param question - The question to be added to the custom FAQ.
 * @param answer - The answer to the question.
 * @param comId - The ID of the company.
 * @param index - The index of the question in the out of bound array.
 * @param wpUserId - The ID of the WhatsappMessages document.
 * @returns A Promise that resolves when the question is successfully moved.
 * @throws If there is an error moving the question.
 */
export const fromOutOfBoundToCustomFaq = async (
  question: string,
  answer: string,
  comId: string,
  index: number,
  wpUserId: string,
): Promise<void> => {
  try {
    const companyRef = doc(Companies, comId)
    const companyDoc = await getDoc(companyRef)
    const company = companyDoc.data() as ICompanies
    if (!company.botInfo) {
      // return if botInfo is not present
      return
    }
    company.botInfo.customFaq = company.botInfo.customFaq
      ? [...company.botInfo.customFaq, { Question: question, Ans: answer }]
      : [{ Question: question, Ans: answer }]
    await setDoc(companyRef, company)

    const wpMessagesRef = doc(WhatsappMessages, wpUserId)
    const wpMessagesDoc = await getDoc(wpMessagesRef)
    const wpMessages = wpMessagesDoc.data() as IMessage
    if (wpMessages?.outOfBoundQuestions) {
      wpMessages?.outOfBoundQuestions.splice(index, 1)
    }
    await setDoc(wpMessagesRef, wpMessages)
  } catch (error) {
    console.error(
      `Error moving question from out of bound to custom faq: ${error}`,
    )
    throw error
  }
}

/**
 * Deletes a question from the out of bound array in the WhatsappMessages document.
 *
 * @param index - The index of the question in the out of bound array.
 * @param wpUserId - The ID of the WhatsappMessages document.
 * @returns A Promise that resolves when the question is successfully deleted.
 * @throws If there is an error deleting the question.
 */
export const deleteOutOfBoundQuestion = async (
  index: number,
  wpUserId: string,
): Promise<void> => {
  // deleting the question from out of bound array in the WhatsappMessages doc using the wpUserId for finding the doc and index for finding the question in the array of outOfBoundQuestions
  try {
    const wpMessagesRef = doc(WhatsappMessages, wpUserId)
    const wpMessagesDoc = await getDoc(wpMessagesRef)
    const wpMessages = wpMessagesDoc.data() as IMessage
    if (wpMessages?.outOfBoundQuestions) {
      wpMessages?.outOfBoundQuestions.splice(index, 1)
    }
    await setDoc(wpMessagesRef, wpMessages)
  } catch (error) {
    console.error(`Error deleting out of bound question: ${error}`)
    throw error
  }
}
