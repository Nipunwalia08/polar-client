import LeadTable from '@components/campaign/launch/LeadTable'
import LeadsNextButton from '@components/campaign/launch/LeadsNextButton'
import SelectAllLeads from '@components/campaign/launch/SelectAllLeads'
import UploadLeads from '@components/campaign/launch/UploadLeads'
import { Campaigns } from '@firebase/config'
import {
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material'
import type { ICampaigns } from '@type/collections'
import { doc, getDoc } from 'firebase/firestore'
import type { NextPage } from 'next'
import React from 'react'
import { FiUpload } from 'react-icons/fi'

export const dynamic = 'force-dynamic'

const AddLeads: NextPage<{ searchParams: { id?: string } }> = async ({
  searchParams: { id },
}) => {
  return (
    <React.Fragment>
      <div className="flex justify-between items-center py-4 pl-3">
        <h1 className="font-semibold text-xl">List of Leads</h1>
        <Button
          variant="outlined"
          className="normal-case px-6 py-2 rounded mr-12 flex items-center gap-2"
          href="/leads/scrape"
        >
          <FiUpload />
          Upload Leads
        </Button>
      </div>
      <TableContainer component={Paper}>
        <Table sx={{ minWidth: 700 }} aria-label="customized table">
          <TableHead className="bg-black">
            <TableRow>
              <TableCell
                className="py-2 text-white"
                align="center"
                sx={{ width: 100 }}
              >
                <SelectAllLeads />
              </TableCell>
              <TableCell className="py-2 text-white" align="left">
                Name
              </TableCell>
              <TableCell className="py-2 text-white" align="left">
                Phone
              </TableCell>
              <TableCell className="py-2 text-white" align="left">
                Email
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            <LeadTable id={id || ''} />
          </TableBody>
        </Table>
      </TableContainer>
      <div className="flex justify-end py-5">
        <LeadsNextButton campaignId={id} />
      </div>
    </React.Fragment>
  )
}

export default AddLeads
