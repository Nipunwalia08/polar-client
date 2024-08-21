import { db } from '@firebase/config' // Adjust the import path according to your project structure
import { Delete } from '@mui/icons-material'
import AddCircleIcon from '@mui/icons-material/AddCircle'
import {
  Button,
  Checkbox,
  FormControl,
  InputLabel,
  ListItemText,
  MenuItem,
  OutlinedInput,
  Select,
  type SelectChangeEvent,
  Stack,
  TextField,
} from '@mui/material'
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'
import { MobileDatePicker } from '@mui/x-date-pickers/MobileDatePicker'
import { MobileTimePicker } from '@mui/x-date-pickers/MobileTimePicker'
import { DemoContainer, DemoItem } from '@mui/x-date-pickers/internals/demo'
import { useGlobalCampaignStore } from '@store/useGlobalCampaignStore'
import usePersistStore from '@store/usePersistStore'
import dayjs from 'dayjs'
import { addDoc, collection, getDocs, query, where } from 'firebase/firestore'
import { useEffect, useState } from 'react'

const CampaignScheduler = () => {
  const adminId = usePersistStore().adminId
  const [teamMembers, setTeamMembers] = useState<any[]>([])
  const name = useGlobalCampaignStore((state) => state.name)
  const setName = useGlobalCampaignStore((state) => state.setName)
  const schedule = useGlobalCampaignStore((state) => state.schedule)
  const setSchedule = useGlobalCampaignStore((state) => state.setSchedule)
  const teamMembersCamp = useGlobalCampaignStore((state) => state.teamMembers)
  const setTeamMembersCamp = useGlobalCampaignStore(
    (state) => state.setTeamMembers,
  )

  // Create a mapping of team member IDs to names
  const teamMemberIdToNameMap = Object.fromEntries(
    teamMembers.map((member) => [member.id, member.name]),
  )

  useEffect(() => {
    const fetchData = async () => {
      if (!adminId) return

      try {
        const q = query(
          collection(db, 'TeamMembers'),
          where('adminId', '==', adminId),
        )
        const querySnapshot = await getDocs(q)
        console.log('@!querySnapshot', querySnapshot)
        if (!querySnapshot.empty) {
          const members: any[] = []
          for (const doc of querySnapshot.docs) {
            const data = doc.data()
            members.push(data)
          }
          console.log('@!Members', members)
          setTeamMembers(members)
        }
      } catch (e) {
        console.error('Error fetching document: ', e)
      }
    }

    fetchData()
  }, [adminId])

  const handleAddSchedule = () => {
    setSchedule([...(schedule || []), { date: dayjs(), time: dayjs() }])
  }

  const handleRemoveSchedule = (index: number) => {
    const updatedInputs = [...(schedule || [])]
    updatedInputs.splice(index, 1)
    setSchedule(updatedInputs)
  }

  // const handleSubmit = async () => {
  //     try {
  //         const campaignsBatch = db.batch();
  //         for (const input of scheduleInputs) {
  //             const combinedDateTime = input.date?.hour(input.time?.hour()!).minute(input.time?.minute()!);
  //             const formattedDateTime = combinedDateTime?.format('MM/DD/YY hh:mmA');

  //             const docRef = collection(db, 'Campaigns').doc();
  //             campaignsBatch.set(docRef, {
  //                 campaignName,
  //                 date: formattedDateTime,
  //                 teamMembers: selectedTeamMembers,
  //             });
  //         }

  //         await campaignsBatch.commit();

  //         alert('Campaigns scheduled successfully');
  //     } catch (e) {
  //         console.error('Error adding documents: ', e);
  //         alert('Failed to schedule campaigns');
  //     }
  // };

  const handleTeamMemberChange = (event: SelectChangeEvent<string[]>) => {
    setTeamMembersCamp(event.target.value as string[])
  }

  return (
    <div className="p-2 flex flex-col gap-3">
      <TextField
        label="Campaign Name"
        variant="outlined"
        required
        fullWidth
        margin="normal"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
      {schedule?.map((input, index) => (
        <Stack key={index} className="flex-row gap-8 w-full">
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <DemoContainer
              sx={{ width: '100%' }}
              components={[
                'DatePicker',
                'MobileDatePicker',
                'DesktopDatePicker',
                'StaticDatePicker',
              ]}
            >
              <DemoItem label="Date">
                <MobileDatePicker
                  value={input.date}
                  onChange={(newDate) => {
                    const updatedInputs = [...schedule]
                    updatedInputs[index].date = newDate
                    setSchedule(updatedInputs)
                  }}
                  minDate={dayjs()} // Disable past dates
                />
              </DemoItem>
            </DemoContainer>
          </LocalizationProvider>
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <DemoContainer
              sx={{ width: '100%' }}
              components={[
                'TimePicker',
                'MobileTimePicker',
                'DesktopTimePicker',
                'StaticTimePicker',
              ]}
            >
              <DemoItem label="Time">
                <MobileTimePicker
                  value={input.time}
                  onChange={(newTime) => {
                    const updatedInputs = [...schedule]
                    updatedInputs[index].time = newTime
                    setSchedule(updatedInputs)
                  }}
                  minTime={
                    dayjs().isSame(input.date, 'day')
                      ? dayjs()
                      : dayjs().startOf('day')
                  } // Disable past times only for the current day
                />
              </DemoItem>
            </DemoContainer>
          </LocalizationProvider>
          {index === 0 && (
            <Stack className="justify-end">
              <Button
                variant="contained"
                sx={{
                  borderRadius: '8px',
                  background:
                    'linear-gradient(270deg, #211AEB -36.04%, #7C36FE 100%)',
                  padding: '10px 60px',
                  width: '300px',
                  mt: '20px',
                  textTransform: 'none',
                  fontWeight: '400',
                  fontSize: '16px',
                  height: '56px',
                }}
                onClick={handleAddSchedule}
              >
                <AddCircleIcon sx={{ color: '#fff', marginRight: '6px' }} />
                Add Schedule Timing
              </Button>
            </Stack>
          )}
          {index > 0 && (
            <Button
              onClick={() => handleRemoveSchedule(index)}
              className="flex items-center mt-[30px] normal-case text-[#b94343]"
            >
              <Delete />
            </Button>
          )}
        </Stack>
      ))}
      <FormControl fullWidth margin="normal">
        <InputLabel>Assign Team Members</InputLabel>
        <Select
          multiple
          value={teamMembersCamp || ''}
          onChange={handleTeamMemberChange}
          input={<OutlinedInput label="Assign Team Members" />}
          renderValue={(selected) =>
            selected.map((id) => teamMemberIdToNameMap[id]).join(', ')
          }
        >
          {teamMembers.map((member) => (
            <MenuItem key={member.id} value={member.id}>
              {teamMembersCamp && (
                <Checkbox checked={teamMembersCamp.indexOf(member.id) > -1} />
              )}
              <ListItemText primary={member.name} />
            </MenuItem>
          ))}
        </Select>
      </FormControl>
      <Button
        variant="contained"
        type="submit"
        sx={{
          borderRadius: '8px',
          background: 'linear-gradient(270deg, #211AEB -36.04%, #7C36FE 100%)',
          padding: '10px 60px',
          width: '300px',
          mt: '20px',
          textTransform: 'none',
          fontWeight: '400',
          fontSize: '16px',
          height: '56px',
        }}
        // onClick={handleSubmit}
      >
        Schedule Campaign
      </Button>
    </div>
  )
}

export default CampaignScheduler