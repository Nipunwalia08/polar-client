import { Customer, WhatsappMessages } from '@firebase/config'
import usePersistStore from '@store/usePersistStore'
import type {
  ICustomer,
  ICustomerWithId,
  IMessage,
  IUser,
} from '@type/collections'
import { getDocs, query, where, onSnapshot } from 'firebase/firestore'
import { useEffect, useState } from 'react'

export type IMergedData = {
  user: IUser
  customerDetails: ICustomerWithId | null
}[]

const useFetchMessages = () => {
  const { adminId } = usePersistStore()
  const [mergedData, setMergedData] = useState<IMergedData>([])

  useEffect(() => {
    if (!adminId) return

    const fetchCustomerDetails = async (phone: string) => {
      const customerSnapshot = await getDocs(
        query(Customer, where('phone', '==', phone))
      )

      if (customerSnapshot.empty) {
        return null
      }

      const customerDoc = customerSnapshot.docs[0]
      const customer = customerDoc.data() as ICustomer
      const customerId = customerDoc.id

      return { ...customer, id: customerId }
    }

    const unsub = onSnapshot(
      query(WhatsappMessages, where('adminId', '==', adminId)),
      async (querySnapshot) => {
        if (querySnapshot.empty) return console.log('No messages found')

        const messagesData: IUser[] = []
        const customerDetails: (ICustomerWithId | null)[] = []

        for (const doc of querySnapshot.docs) {
          const user = doc.data() as IUser
          const phone = user.phone
          messagesData.push(user)

          if (!phone) {
            customerDetails.push(null)
          } else {
            const customerDetail = await fetchCustomerDetails(phone)
            customerDetails.push(customerDetail)
          }
        }

        const mergedDataTemp = messagesData.map((user, index) => ({
          user,
          customerDetails: customerDetails[index] || null,
        }))

        setMergedData(mergedDataTemp)
      }
    )

    return () => unsub()
  }, [adminId])
  console.log(mergedData);
  
  return { mergedData }
}

export default useFetchMessages
