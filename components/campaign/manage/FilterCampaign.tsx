'use client'

import ToggleButtons from '@components/global/ToggleButtons'
import FilterListIcon from '@mui/icons-material/FilterList'
import { Button, Menu, Paper, ToggleButton } from '@mui/material'
import useCampaignStore from '@store/useCampaignStore'
import React, { useState } from 'react'

const FilterCampaign = () => {
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null)
  const open = Boolean(anchorEl)
  const handleClose = () => {
    setAnchorEl(null)
  }
  const { statusFilter, setStatusFilter } = useCampaignStore()
  return (
    <React.Fragment>
      <Button
        onClick={(e) => setAnchorEl(e.currentTarget)}
        variant="text"
        className="mx-2"
        sx={{
          py: 1.5,
          px: 1,
        }}
      >
        <FilterListIcon />
      </Button>
      <Paper
        elevation={0}
        sx={{
          display: 'flex',
          border: (theme) => `1px solid ${theme.palette.divider}`,
          flexWrap: 'wrap',
        }}
      >
        <Menu
          id="basic-menu"
          anchorEl={anchorEl}
          open={open}
          onClose={handleClose}
          MenuListProps={{
            'aria-labelledby': 'basic-button',
          }}
          className="*:py-0"
        >
          <ToggleButtons
            value={statusFilter}
            onChange={(_e, status) => {
              console.log(status)
              setStatusFilter(status)
            }}
            exclusive
            orientation="vertical"
            className="px-1 !py-0"
          >
            <ToggleButton
              value="active"
              className="p-0 text-left px-2 py-1.5 normal-case text-black min-w-20 justify-start"
              color="success"
            >
              Active
            </ToggleButton>
            <ToggleButton
              value="inactive"
              className="p-0 !ml-1 text-left px-2 py-1.5 normal-case text-black min-w-20 justify-start"
              color="error"
            >
              Inactive
            </ToggleButton>
          </ToggleButtons>
        </Menu>
      </Paper>
    </React.Fragment>
  )
}

export default FilterCampaign
