import { Companies } from '@firebase/config'
import NotificationsIcon from '@mui/icons-material/Notifications'
import {
  Box,
  Button,
  IconButton,
  List,
  ListItem,
  ListItemText,
  Modal,
  Stack,
  Typography,
} from '@mui/material'
import { type Timestamp, doc, getDoc, updateDoc } from 'firebase/firestore'
import type React from 'react'
import { useEffect, useState } from 'react'

interface Notification {
  body: string
  dateTime: Timestamp
  title: string
}

const NotificationModal: React.FC<{ companyId: string }> = ({ companyId }) => {
  const [open, setOpen] = useState(false)
  const [notifications, setNotifications] = useState<Notification[]>([])

  const handleOpen = () => setOpen(true)
  const handleClose = () => setOpen(false)

  useEffect(() => {
    const fetchNotifications = async () => {
      if (!companyId) return
      const docRef = doc(Companies, companyId)
      const docSnap = await getDoc(docRef)

      if (docSnap.exists()) {
        const notificationData = docSnap.data()
        if (notificationData?.notifications) {
          setNotifications(notificationData.notifications)
        }
      } else {
        console.log('No such document!')
      }
    }

    fetchNotifications()
  }, [companyId])

  const formatDateTime = (timestamp: Timestamp) => {
    const date = timestamp.toDate()
    const options: Intl.DateTimeFormatOptions = {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true,
    }
    return date.toLocaleDateString('en-GB', options)
  }

  const handleClearAll = async () => {
    const docRef = doc(Companies, companyId)

    // Clear notifications in the local state
    setNotifications([])

    // Clear notifications in Firebase
    try {
      await updateDoc(docRef, {
        notifications: [],
      })
    } catch (error) {
      console.error('Error clearing notifications: ', error)
    }
  }

  return (
    <>
      <IconButton color="inherit" onClick={handleOpen}>
        <NotificationsIcon fontSize="large" />
      </IconButton>
      <Modal
        open={open}
        onClose={handleClose}
        aria-labelledby="notification-modal"
        aria-describedby="notification-modal-description"
      >
        <Box
          sx={{
            width: 400,
            maxHeight: '70vh',
            p: 4,
            bgcolor: 'background.paper',
            margin: 'auto',
            marginTop: '10%',
            overflowY: 'auto',
            borderRadius: 2,
            boxShadow: 24,
          }}
        >
          <Stack sx={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <h2 id="notification-modal" className="text-[20px] font-semibold">
              Notifications
            </h2>
            <Button variant="contained" onClick={handleClearAll} sx={{ mb: 2 }}>
              Clear All
            </Button>
          </Stack>
          <List>
            {notifications.length === 0 && (
              <>
                <Typography sx={{ textAlign: 'center' }}>
                  No Notifications{' '}
                </Typography>
              </>
            )}
            {notifications.map((notification, index) => (
              <ListItem key={index} divider>
                <ListItemText
                  primary={notification.title}
                  secondary={
                    <>
                      <div>{notification.body}</div>
                      <div style={{ marginTop: '8px', color: 'gray' }}>
                        {formatDateTime(notification.dateTime)}
                      </div>
                    </>
                  }
                />
              </ListItem>
            ))}
          </List>
        </Box>
      </Modal>
    </>
  )
}

export default NotificationModal
