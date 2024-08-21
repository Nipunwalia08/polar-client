'use client'

import React from 'react'

import useTemplateStore from '@store/useTemplateStore'
import { CiSearch } from 'react-icons/ci'

const SearchTemplate = () => {
  const { query, setQuery } = useTemplateStore()
  return (
    <div className="flex gap-2 items-center bg-[#e8e9f1] w-full rounded-md pl-3 py-2">
      <CiSearch />
      <input
        type="text"
        className="w-full"
        placeholder="Search Template"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />
    </div>
  )
}

export default SearchTemplate
