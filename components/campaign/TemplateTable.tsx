'use client'

import ActionForm from '@components/campaign/ActionForm'
import { Templates } from '@firebase/config'
import { Button } from '@mui/material'
import Paper from '@mui/material/Paper'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import useTemplateStore, { refetchTemplates } from '@store/useTemplateStore'
import type { ITemplates } from '@type/collections'
import { doc, setDoc } from 'firebase/firestore'
import type React from 'react'
import { useEffect, useState } from 'react'

const TemplateRow = ({
  template,
  selectedTemplate,
  setSelectedTemplate,
}: {
  template: ITemplates & { id: string }
  selectedTemplate: ITemplates | null
  setSelectedTemplate: (template: ITemplates) => void
}) => {
  const [actionOpen, setActionOpen] = useState<boolean>(false)

  return (
    <TableRow>
      <TableCell align="center">{template.name}</TableCell>
      <TableCell align="center">{template.description}</TableCell>
      <TableCell align="center">{template.type}</TableCell>
      <TableCell align="center" className="flex justify-center gap-3">
        <Button
          variant="contained"
          className={
            selectedTemplate?.id === template.id
              ? 'bg-[#d0ff84] hover:bg-[#d0ff84] text-black flex gap-2 normal-case'
              : 'bg-theme flex gap-2 normal-case'
          }
          onClick={() => setActionOpen(true)}
        >
          <div>
            {selectedTemplate?.id === template.id ? 'Selected' : 'Select'}
          </div>
        </Button>
        <ActionForm
          open={actionOpen}
          setOpen={setActionOpen}
          _data={template}
          onSave={async (data) => {
            await setDoc(doc(Templates, template.id), data, { merge: true })
            setSelectedTemplate(template)
          }}
        />
      </TableCell>
    </TableRow>
  )
}

const TemplateTable: React.FC<{
  selectedTemplate: ITemplates | null
  setSelectedTemplate: (template: ITemplates) => void
}> = ({ selectedTemplate, setSelectedTemplate }) => {
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
              <TemplateRow
                key={template.id}
                template={template}
                selectedTemplate={selectedTemplate}
                setSelectedTemplate={setSelectedTemplate}
              />
            ),
          )}
        </TableBody>
      </Table>
    </TableContainer>
  )
}

export default TemplateTable
