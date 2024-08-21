import AddTemplate from '@components/template/AddTemplate'
import SearchTemplate from '@components/template/SearchTemplate'
import TemplateTable from '@components/template/TemplateTable'
import FilterListIcon from '@mui/icons-material/FilterList'
import { Button } from '@mui/material'
import type { Metadata } from 'next'
import React from 'react'

export const metadata: Metadata = {
  title: 'Template Management',
}

const Template = async () => {
  return (
    <main className="px-8 py-5">
      <h1 className="text-xl font-semibold">List of templates</h1>
      <div className="flex items-center mt-3 gap-4">
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
        <AddTemplate />
      </div>
      <TemplateTable />
    </main>
  )
}

export default Template
