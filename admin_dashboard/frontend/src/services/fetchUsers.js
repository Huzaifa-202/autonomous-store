import {
  collection,
  getDocs,
  orderBy,
  query,
  Timestamp,
  where,
} from 'firebase/firestore'
import { db } from '../firebase/firebase'

export const fetchUsers = async () => {
  try {
    const usersCollection = collection(db, 'users')
    const usersQuery = query(usersCollection, orderBy('createdAt', 'desc'))

    const querySnapshot = await getDocs(usersQuery)

    const usersData = querySnapshot.docs.map((doc) => {
      const data = doc.data()

      // Helper function to format Firestore timestamps
      const formatTimestamp = (timestamp) => {
        return timestamp?.toDate?.()
          ? timestamp.toDate().toLocaleString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
              hour: 'numeric',
              minute: 'numeric',
              second: 'numeric',
              timeZoneName: 'short',
            })
          : 'Date not available'
      }

      // Format the user data
      return {
        id: doc.id,
        firstname: data.firstname || '',
        lastname: data.lastname || '',
        email: data.email || '',
        phoneNumber: data.phoneNumber || '',
        numberOfVisits: data.numberOfVisits || 0,
        lastVisitedTime: data.lastVisitedTime || 'Not available',
        registrationDate: formatTimestamp(data.registrationDate),
        DOB: formatTimestamp(data.DOB),
        createdAt: formatTimestamp(data.createdAt),
        creditCard: {
          number: data.creditCardNumber || 'Not available',
          expiry: formatTimestamp(data.creditCardExpiry),
          cvc: data.creditCardCVC || 'Not available',
        },
        imageUrl: data.imageUrl || '',
      }
    })

    return usersData
  } catch (error) {
    console.error('Error fetching users:', error)
    throw error
  }
}

export const addUser = async (userData) => {
  try {
    const usersCollection = collection(db, 'users')
    const docRef = await addDoc(usersCollection, userData)
    return docRef.id
  } catch (error) {
    console.error('Error adding user:', error)
    throw error
  }
}

export const deleteUser = async (userId) => {
  try {
    const userDoc = doc(db, 'users', userId)
    await deleteDoc(userDoc)
  } catch (error) {
    console.error('Error deleting user:', error)
    throw error
  }
}

export const fetchRecentUsers = async () => {
  try {
    // Calculate date 7 days ago
    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
    const timestampSevenDaysAgo = Timestamp.fromDate(sevenDaysAgo)

    console.log('Fetching users since:', sevenDaysAgo.toISOString())

    // Create query for users collection
    const usersCollection = collection(db, 'users')
    const recentUsersQuery = query(
      usersCollection,
      where('createdAt', '>=', timestampSevenDaysAgo),
      orderBy('createdAt', 'desc')
    )

    // Execute query
    const querySnapshot = await getDocs(recentUsersQuery)
    console.log('Query returned:', querySnapshot.size, 'documents')

    // Process results
    const recentUsersData = querySnapshot.docs.map((doc) => {
      const data = doc.data()

      // Helper function to format timestamps
      const formatTimestamp = (timestamp) => {
        return timestamp?.toDate?.()
          ? timestamp.toDate().toLocaleString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
              hour: 'numeric',
              minute: 'numeric',
              second: 'numeric',
              timeZoneName: 'short',
            })
          : 'Date not available'
      }

      // Return formatted user data with additional date processing
      return {
        id: doc.id,
        firstname: data.firstname || '',
        lastname: data.lastname || '',
        email: data.email || '',
        phoneNumber: data.phoneNumber || '',
        numberOfVisits: data.numberOfVisits || 0,
        lastVisitedTime: data.lastVisitedTime || 'Not available',
        registrationDate: formatTimestamp(data.registrationDate),
        DOB: formatTimestamp(data.DOB),
        createdAt: formatTimestamp(data.createdAt),
        // Add raw timestamp for sorting/filtering
        createdAtTimestamp: data.createdAt?.toDate?.() || null,
        registrationDateTimestamp: data.registrationDate?.toDate?.() || null,
        creditCard: {
          number: data.creditCardNumber || 'Not available',
          expiry: formatTimestamp(data.creditCardExpiry),
          cvc: data.creditCardCVC || 'Not available',
        },
        imageUrl: data.imageUrl || '',
      }
    })

    // Sort users by creation date (most recent first)
    recentUsersData.sort((a, b) => {
      return (
        (b.createdAtTimestamp?.getTime() || 0) -
        (a.createdAtTimestamp?.getTime() || 0)
      )
    })

    console.log('Processed recent users:', recentUsersData)
    return recentUsersData
  } catch (error) {
    console.error('Error in fetchRecentUsers:', error)
    throw error
  }
}

export const debugFirestoreTimestamps = async () => {
  try {
    const usersCollection = collection(db, 'users')
    const querySnapshot = await getDocs(usersCollection)

    querySnapshot.docs.forEach((doc) => {
      const data = doc.data()
    })
  } catch (error) {
    console.error('Error in debug function:', error)
  }
}
