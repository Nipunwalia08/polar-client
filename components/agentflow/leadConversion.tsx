'use client'
import { Companies } from '@firebase/config' // Adjust the import path
import AddCircleIcon from '@mui/icons-material/AddCircle'
import {
  Button,
  MenuItem,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from '@mui/material'
import usePersistStore from '@store/usePersistStore'
import type { ICompanies, ILeadConversion } from '@type/collections'
import { doc, getDoc, updateDoc } from 'firebase/firestore'
import type React from 'react'
import { useEffect, useState } from 'react'
import { toast } from 'react-toastify'

const CaptureLeadComponent: React.FC = () => {
  const [tableEntries, setTableEntries] = useState<ILeadConversion[]>([])
  const { companyId } = usePersistStore()

  useEffect(() => {
    const fetchData = async () => {
      try {
        const companyDoc = await getDoc(doc(Companies, companyId))
        if (companyDoc.exists()) {
          const companyData = companyDoc.data() as ICompanies
          setTableEntries(companyData.leadConversion || [])
        } else {
          console.error('Company not found')
        }
      } catch (error) {
        console.error('Error during fetching:', error)
      }
    }
    fetchData()
  }, [companyId])

  const [formData, setFormData] = useState<ILeadConversion>({
    fieldName: '',
    fieldDatatype: '',
    required: false,
  })

  const dataTypes = ['String', 'Number', 'Boolean', 'Object', 'Array']

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prevData) => ({
      ...prevData,
      [name]: name === 'required' ? value === 'true' : value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    // Check if the field name already exists
    const existingFieldIndex = tableEntries.findIndex(
      (entry) => entry.fieldName === formData.fieldName,
    )
    let updatedLeadConversion = [...tableEntries]

    if (existingFieldIndex !== -1) {
      // Update existing field
      updatedLeadConversion[existingFieldIndex] = formData
    } else {
      // Add new field
      updatedLeadConversion = [...tableEntries, formData]
    }

    try {
      const companyRef = doc(Companies, companyId)
      await updateDoc(companyRef, { leadConversion: updatedLeadConversion })
      setTableEntries(updatedLeadConversion)
      toast.success('Field saved successfully')
    } catch (error) {
      console.error('Error during update:', error)
      toast.error('Error updating lead conversion fields')
    }

    setFormData({ fieldName: '', fieldDatatype: '', required: false })
  }

  const handleEdit = (item: ILeadConversion) => {
    setFormData({
      fieldName: item.fieldName,
      fieldDatatype: item.fieldDatatype,
      required: item.required,
    })
  }

  const handleDelete = async (item: ILeadConversion) => {
    const updatedEntries = tableEntries.filter((entry) => entry !== item)

    try {
      const companyRef = doc(Companies, companyId)
      await updateDoc(companyRef, { leadConversion: updatedEntries })
      setTableEntries(updatedEntries)
      toast.success('Field deleted successfully')
    } catch (error) {
      console.error('Error during update:', error)
      toast.error('Error updating lead conversion fields')
    }
  }

  return (
    <Stack>
      <form
        onSubmit={handleSubmit}
        style={{ display: 'flex', gap: '20px', marginBottom: '20px' }}
      >
        <Stack className="w-full">
          <Typography className="mb-2">Field Name</Typography>
          <TextField
            label="Enter Field Name"
            variant="outlined"
            name="fieldName"
            value={formData.fieldName}
            onChange={handleInputChange}
            style={{ flex: 1 }}
          />
        </Stack>
        <Stack className="w-full">
          <Typography className="mb-2">Field Datatype</Typography>
          <TextField
            select
            label="Select a data type"
            variant="outlined"
            name="fieldDatatype"
            value={formData.fieldDatatype}
            onChange={handleInputChange}
            style={{ flex: 1 }}
          >
            {dataTypes.map((dataType) => (
              <MenuItem key={dataType} value={dataType}>
                {dataType}
              </MenuItem>
            ))}
          </TextField>
        </Stack>
        <Stack className="w-full">
          <Typography className="mb-2">Required</Typography>
          <TextField
            select
            label="Select"
            variant="outlined"
            name="required"
            value={formData.required ? 'true' : 'false'}
            onChange={handleInputChange}
            style={{ flex: 1 }}
          >
            <MenuItem value="true">True</MenuItem>
            <MenuItem value="false">False</MenuItem>
          </TextField>
        </Stack>
        <Stack className="justify-end">
          <Button
            variant="contained"
            type="submit"
            sx={{
              borderRadius: '8px',
              background:
                ' var(--Linear, linear-gradient(270deg, #211AEB -36.04%, #7C36FE 100%))',
              padding: '10px 60px',
              width: '220px',
              mt: '20px',
              textTransform: 'none',
              fontWeight: '400',
              fontSize: '16px',
              height: '56px',
            }}
          >
            <AddCircleIcon sx={{ color: '#fff', marginRight: '6px' }} /> Add
            Field
          </Button>
        </Stack>
      </form>
      <TableContainer component={Paper} sx={{ mt: '15px' }}>
        <Table>
          <TableHead>
            <TableRow sx={{ background: '#000' }}>
              <TableCell sx={{ color: '#fff' }}>Field Name</TableCell>
              <TableCell sx={{ color: '#fff' }}>Field Datatype</TableCell>
              <TableCell sx={{ color: '#fff' }}>Required</TableCell>
              <TableCell sx={{ color: '#fff' }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {tableEntries.map((row, index) => (
              <TableRow key={index}>
                <TableCell>{row.fieldName}</TableCell>
                <TableCell>{row.fieldDatatype}</TableCell>
                <TableCell>{row.required ? 'True' : 'False'}</TableCell>
                <TableCell>
                  {row?.fieldName?.toLowerCase() !== 'name' &&
                    row?.fieldName?.toLowerCase() !== 'phone' && (
                      <Stack className="gap-3 flex-row" direction="row">
                        <Button
                          onClick={() => handleEdit(row)}
                          sx={{
                            borderRadius: '6px',
                            background: '#D0FF84',
                            textTransform: 'none',
                            '&:hover': {
                              background: '#D0FF84',
                            },
                          }}
                        >
                          Edit
                        </Button>
                        <Button
                          onClick={() => handleDelete(row)}
                          sx={{
                            borderRadius: '6px',
                            background: '#FFA09A',
                            textTransform: 'none',
                            '&:hover': {
                              background: '#FFA09A',
                            },
                          }}
                        >
                          Delete
                        </Button>
                      </Stack>
                    )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Stack>
  )
}

export default CaptureLeadComponent
