'use client'

import useCampaignStore from '@store/useCampaignStore'
import React from 'react'

import { CiSearch } from 'react-icons/ci'

const SearchCampaign = () => {
  const { query, setQuery } = useCampaignStore()
  return (
    <div className="flex gap-2 items-center bg-[#e8e9f1] w-full rounded-md pl-3 py-2">
      <CiSearch />
      <input
        type="text"
        className="w-full"
        placeholder="Search Campaigns"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />
    </div>
  )
}

export default SearchCampaign
