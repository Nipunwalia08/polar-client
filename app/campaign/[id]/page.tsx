import campaignIcon from '@assets/campaign.svg'
import CampaignInteraction from '@components/campaign/info/CampaignInteraction'
import DeleteCampaign from '@components/campaign/info/DeleteCampaign'
import Notes from '@components/campaign/info/Notes'
import Progress from '@components/global/Progress'
import { Campaigns, Customer, TeamMembers } from '@firebase/config'
import { Edit } from '@mui/icons-material'
import {
  Button,
  Card,
  Paper,
  Switch,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableRow,
} from '@mui/material'
import type { ICampaignWithId } from '@store/useCampaignStore'
import type { ICampaigns, ILead, ITeamMember } from '@type/collections'
import { doc, getDoc } from 'firebase/firestore'
import type { NextPage } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import React from 'react'
import type { FC, ReactNode } from 'react'
import { FaPlus } from 'react-icons/fa6'
import { IoIosArrowBack } from 'react-icons/io'

type CampaignInfoProps = { params: { id: string } }

export const generateMetadata = async ({
  params: { id },
}: CampaignInfoProps) => {
  const document = await getDoc(doc(Campaigns, id))
  if (document.exists()) {
    const data = document.data() as ICampaigns
    return {
      title: `${data.name} - Campaign` || `Campaign ${id}`,
      description: 'Campaign information',
      url: `campaign/${id}`,
    }
  }
  return {
    title: 'Campaign not found',
    description: 'Campaign information',
    url: 'campaign',
  }
}

const CampaignInfo: NextPage<CampaignInfoProps> = async ({
  params: { id },
}) => {
  const document = await getDoc(doc(Campaigns, id))
  if (!document.exists()) return <div>Campaign doesn't exist</div>
  const campaign = { id: document.id, ...document.data() } as ICampaignWithId
  const team = campaign?.teamMembers || []
  const resolvedTeam: ITeamMember[] = []

  for (const id of team) {
    const document = await getDoc(doc(TeamMembers, id))
    resolvedTeam.push({ ...document.data(), id: document.id } as ITeamMember)
  }

  const customers = campaign?.customers || []
  const resolvedCustomers: ILead[] = []

  for (const id of customers) {
    const document = await getDoc(doc(Customer, id))
    resolvedCustomers.push({ ...document.data(), id: document.id } as ILead)
  }
  return (
    <main className="px-5 py-7 flex gap-10">
      <Card variant="outlined" className="px-10 py-8 flex gap-8 w-[65vw]">
        <Link href="/campaign/manage" className="h-fit">
          <Button
            variant="outlined"
            className="min-w-2 p-1 border-[#00000020] hover:border-[#00000060]"
          >
            <IoIosArrowBack />
          </Button>
        </Link>
        <div className="flex flex-col w-full">
          <div className="flex gap-4">
            <Image src={campaignIcon} alt="campaign" width={35} height={35} />
            <span className="text-xl font-semibold">{campaign.name}</span>
          </div>
          <TableContainer component="div" className="mt-5 font-semibold">
            <Table
              sx={{ minWidth: 200, width: '100%' }}
              aria-label="customized table"
            >
              <TableBody>
                {/* <CampaignItem
                  title="List of Leads"
                  content={data?.customers?.length || 0}
                /> */}
                <CampaignItem
                  title="All Leads"
                  content={campaign?.customers?.length || 0}
                />
                <CampaignItem
                  title="Acceptance Rate"
                  content={
                    <div className="flex flex-col gap-1">
                      {campaign?.acceptanceRate}%
                      <Progress progress={campaign?.acceptanceRate || 0} />
                    </div>
                  }
                />
                <CampaignItem
                  title="Reply Rate"
                  content={
                    <div className="flex flex-col gap-1">
                      {campaign?.replyRate}%
                      <Progress progress={campaign?.replyRate || 0} />
                    </div>
                  }
                />
                <CampaignItem
                  title="Created At"
                  content={campaign?.createdAt
                    ?.toDate()
                    ?.toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                />
              </TableBody>
            </Table>
          </TableContainer>
          <CampaignInteraction id={document.id} name={campaign?.name} />
        </div>
      </Card>
      <Card variant="outlined" className="py-2 px-4 w-[25vw]">
        <div className="flex justify-between items-center p-4">
          <div className="font-semibold">Team Assigned</div>
          <Link href={`/campaign/launch/summarize?id=${document.id}`}>
            <Edit />
          </Link>
        </div>
        <div className="flex flex-col gap-1">
          {resolvedTeam.map((member) => (
            <Button
              key={member.id}
              variant="contained"
              className="w-full p-3 bg-theme"
            >
              {member.name}
            </Button>
          ))}
        </div>
        <Notes campaign={campaign} />
        <div className="mt-2">
          <div className="flex justify-between bg-gray-100 p-2 font-semibold">
            <div className="flex items-center gap-2">
              <div className="text-white bg-black px-1.5 py-.5 rounded-full">
                C
              </div>
              <div>List of Customers</div>
            </div>
            <Link href={`/campaign/launch/add-leads?id=${campaign.id}`}>
              <FaPlus className="text-white bg-black px-1.5 py-.5 rounded-full size-7" />
            </Link>
          </div>
          <div className="flex flex-col">
            {resolvedCustomers.map((customer) => (
              <div key={customer.id} className="p-2">
                {customer.name}
              </div>
            ))}
          </div>
        </div>
      </Card>
    </main>
  )
}

const CampaignItem: FC<{ title: string; content: string | ReactNode }> = ({
  title,
  content,
}) => {
  return (
    <TableRow>
      <TableCell className="text-base px-0 py-3 border-0 pr-16">
        {title} :
      </TableCell>
      <TableCell className="text-base px-0 py-3 border-0" align="left">
        {content}
      </TableCell>
    </TableRow>
  )
}

export default CampaignInfo
