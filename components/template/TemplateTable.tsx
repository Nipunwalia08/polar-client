'use client'

import { Button } from '@mui/material'
import Paper from '@mui/material/Paper'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import type { ITemplates } from '@type/collections'

import { LuPencilLine } from 'react-icons/lu'
import { MdDeleteOutline } from 'react-icons/md'

import { Templates } from '@firebase/config'
import usePersistStore from '@store/usePersistStore'
import useTemplateStore, { refetchTemplates } from '@store/useTemplateStore'
import { doc, setDoc } from 'firebase/firestore'
import React, { useEffect, useState } from 'react'
import DeleteTemplate from './DeleteTemplate'
import TemplateForm from './TemplateForm'

const TemplateRow = ({
  template,
}: { template: ITemplates & { id: string } }) => {
  const [editOpen, setEditOpen] = useState<boolean>(false)
  const [deleteOpen, setDeleteOpen] = useState<boolean>(false)
  return (
    <TableRow>
      <TableCell align="center">{template.name}</TableCell>
      <TableCell align="center">{template.description}</TableCell>
      <TableCell align="center">{template.type}</TableCell>
      <TableCell align="center" className="flex justify-center gap-3">
        <Button
          variant="contained"
          className="bg-[#d0ff84] hover:bg-[#d0ff84] text-black flex gap-2 normal-case"
          onClick={() => setEditOpen(true)}
        >
          <LuPencilLine />
          <div>Edit</div>
        </Button>
        <TemplateForm
          open={editOpen}
          setOpen={setEditOpen}
          _data={template}
          onSave={async (data) =>
            await setDoc(doc(Templates, template.id), data, { merge: true })
          }
        />
        <Button
          variant="contained"
          className="bg-[#feadad] hover:bg-[#feadad] text-black flex gap-2 normal-case"
          onClick={() => setDeleteOpen(true)}
        >
          <MdDeleteOutline className="size-4" />
          <div>Delete</div>
        </Button>
        <DeleteTemplate
          open={deleteOpen}
          setOpen={setDeleteOpen}
          id={template.id}
          name={template.name || ''}
        />
      </TableCell>
    </TableRow>
  )
}

const TemplateTable = () => {
  const { filteredTemplates, templates } = useTemplateStore()
  useEffect(() => {
    refetchTemplates()
  }, [])
  return (
    <TableContainer component={Paper} className="mt-5">
      <Table sx={{ minWidth: 700 }} aria-label="customized table">
        <TableHead className="bg-black">
          <TableRow>
            <TableCell className="py-2 text-white" align="center">
              Template Name
            </TableCell>
            <TableCell className="py-2 text-white" align="center">
              Description
            </TableCell>
            <TableCell className="py-2 text-white" align="center">
              Type
            </TableCell>
            <TableCell className="py-2 text-white" align="center">
              Action
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {(filteredTemplates?.length > 0 ? filteredTemplates : templates)?.map(
            (template) => (
              <TemplateRow key={template.id} template={template} />
            ),
          )}
        </TableBody>
      </Table>
    </TableContainer>
  )
}

export default TemplateTable
