'use client'

import AntSwitch from '@components/global/AntSwitch'
import Paper from '@mui/material/Paper'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'

import campaignIcon from '@assets/campaign.svg'
import { IoIosInformationCircle } from 'react-icons/io'

import { Button, Tooltip } from '@mui/material'
import useCampaignStore, {
  refetchCampaigns,
  setActive,
  type ICampaignWithId,
} from '@store/useCampaignStore'
import Image from 'next/image'
import Link from 'next/link'
import React, { useEffect } from 'react'

const TemplateRow = ({ campaign }: { campaign: ICampaignWithId }) => {
  console.log(campaign)
  return (
    <TableRow>
      <TableCell
        align="left"
        sx={{ pl: 5 }}
        className="flex justify-start items-center gap-3"
      >
        <Link
          href={`/campaign/${campaign.id}`}
          className="flex items-center gap-3"
        >
          <Image src={campaignIcon} alt="campaign" width={40} height={40} />
          {campaign?.name}
        </Link>
        <Tooltip title="Campaign Information" placement="right" arrow>
          <Button className="min-w-0 min-h-0 !p-0 hover:bg-transparent hover:text-[#8e8e8e]">
            <IoIosInformationCircle className="text-[#8e8e8e] size-5"/>
          </Button>
        </Tooltip>
      </TableCell>
      {/* <TableCell align="center">{campaign?.listOfLeads}</TableCell> */}
      <TableCell align="center">{campaign?.customers?.length}</TableCell>
      <TableCell align="center">{campaign?.acceptanceRate}%</TableCell>
      <TableCell align="center">{campaign?.replyRate}%</TableCell>
      <TableCell align="center">
        {campaign?.createdAt?.toDate()?.toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        })}
      </TableCell>
      <TableCell
        align="center"
        className="flex justify-center items-center border-0 relative -top-2"
      >
        <AntSwitch
          defaultChecked={campaign?.active}
          value={campaign?.active}
          onChange={() => setActive(campaign.id, !campaign?.active)}
        />
      </TableCell>
    </TableRow>
  )
}

const CampaignTable = () => {
  const { filteredCampaigns, campaigns } = useCampaignStore()
  useEffect(() => {
    refetchCampaigns()
  }, [])
  return (
    <TableContainer component={Paper} className="mt-5">
      <Table sx={{ minWidth: 700 }} aria-label="customized table">
        <TableHead className="bg-black">
          <TableRow>
            <TableCell className="py-2 text-white" align="left" sx={{ pl: 5 }}>
              Name
            </TableCell>
            {/* <TableCell className="py-2 text-white" align="center">
              List of Leads
            </TableCell> */}
            <TableCell className="py-2 text-white" align="center">
              All Leads
            </TableCell>
            <TableCell className="py-2 text-white" align="center">
              Acceptance Rate
            </TableCell>
            <TableCell className="py-2 text-white" align="center">
              Reply Rate
            </TableCell>
            <TableCell className="py-2 text-white" align="center">
              Created
            </TableCell>
            <TableCell className="py-2 text-white" align="center">
              Status
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {(filteredCampaigns?.length > 0 ? filteredCampaigns : campaigns)?.map(
            (campaign) => (
              <TemplateRow key={campaign.id} campaign={campaign} />
            ),
          )}
        </TableBody>
      </Table>
    </TableContainer>
  )
}

export default CampaignTable
