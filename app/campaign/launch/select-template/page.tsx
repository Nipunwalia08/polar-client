'use client'
import TemplateTable from '@components/campaign/TemplateTable'
import TemplateNextButton from '@components/campaign/launch/TemplateNextButton'
import SearchTemplate from '@components/template/SearchTemplate'
import { Campaigns, Templates } from '@firebase/config'
import FilterListIcon from '@mui/icons-material/FilterList'
import { Button } from '@mui/material'
import { useGlobalCampaignStore } from '@store/useGlobalCampaignStore'
import type { ITemplates } from '@type/collections'
import { doc, getDoc } from 'firebase/firestore'
import { useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import React from 'react'

const Template = () => {
  const searchParam = useSearchParams()
  const id = searchParam.get('id')!
  const [selectedTemplate, setSelectedTemplate] = useState<ITemplates | null>(
    null,
  )
  const { setTemplate } = useGlobalCampaignStore()
  useEffect(() => {
    const fetchSelectedTemplate = async () => {
      if (id) {
        const campaignDoc = await getDoc(doc(Campaigns, id as string))
        if (campaignDoc.exists()) {
          const campaignData = campaignDoc.data()
          if (campaignData?.template?.id) {
            const templateDoc = await getDoc(
              doc(Templates, campaignData.template.id),
            )
            if (templateDoc.exists()) {
              setSelectedTemplate(templateDoc.data() as ITemplates)
              setTemplate(templateDoc.data() as ITemplates)
              console.log(templateDoc.data() as ITemplates)
            }
          }
        }
      }
    }
    fetchSelectedTemplate()
  }, [id])

  return (
    <main className="px-8 py-5">
      <h1 className="text-xl font-semibold">List of templates</h1>
      <div className="flex items-center mt-3">
        <SearchTemplate />
        {/* <Button
          variant="text"
          className="mx-2"
          sx={{
            py: 1.5,
            px: 1,
          }}
        >
          <FilterListIcon />
        </Button> */}
      </div>
      <TemplateTable
        selectedTemplate={selectedTemplate}
        setSelectedTemplate={setSelectedTemplate}
      />
      <div className="flex justify-end py-5">
        <TemplateNextButton campaignId={id} />
      </div>
    </main>
  )
}

export default Template
