'use client'

import NotificationModal from '@components/notification/model'
import useAuth from '@hooks/useAuth'
import LogoutIcon from '@mui/icons-material/Logout'
import PersonIcon from '@mui/icons-material/Person'
import { IconButton } from '@mui/material'
import Button from '@mui/material/Button'
import usePersistStore from '@store/usePersistStore'
import navbarLinks from '@utils/navitems'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import React, { useState, useRef, useEffect } from 'react'

const Navbar = () => {
  const pathname = usePathname()
  const [showLogout, setShowLogout] = useState(false)
  const { setAdminId, setCompanyId } = usePersistStore()
  const logoutRef = useRef<HTMLDivElement>(null)
  const { signOut } = useAuth({ logoutURL: '/' })

  const handleLogout = async () => {
    // Remove CompanyId and AdminId from persist store
    await signOut()
    setAdminId('')
    setCompanyId('')
    // Redirect to the home page
  }

  const handleClickOutside = (event: MouseEvent) => {
    if (
      logoutRef.current &&
      !logoutRef.current.contains(event.target as Node)
    ) {
      setShowLogout(false)
    }
  }
  const { companyId } = usePersistStore()
  useEffect(() => {
    if (showLogout) {
      document.addEventListener('mousedown', handleClickOutside)
    } else {
      document.removeEventListener('mousedown', handleClickOutside)
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showLogout])

  return (
    <div
      className="py-1 w-full pl-[63px] pt-4 pb-4 fixed z-10"
      style={{
        border: '1px solid #E8E8E8',
        background: '#F3F4F6',
        boxShadow: '0px 0px 48px 0px rgba(0, 0, 0, 0.08)',
      }}
    >
      <div className="flex mx-5">
        <div className="flex justify-between w-full items-center mx-8">
          <div className="heading">
            <h1 className="text-xl font-[500] text-[26px]">
              {navbarLinks
                .flatMap(
                  (item) =>
                    (item.href === pathname ? item.title : null) ||
                    item.subLinks?.map((subItem) =>
                      subItem.href === pathname ? subItem.title : null,
                    ),
                )
                .find((item) => item)}
            </h1>
          </div>
          <div className="right-items relative gap-3 flex flex-row items-center justify-center">
            <NotificationModal companyId={companyId} />
            <Link
              href="/settings?tab=2"
              className="bg-theme px-8 py-2 rounded text-[#fff] items-center justify-center"
            >
              Upgrade
            </Link>
            <IconButton
              color="inherit"
              onClick={() => setShowLogout((prev) => !prev)}
            >
              <PersonIcon className="cursor-pointer" fontSize="large" />
            </IconButton>

            {showLogout && (
              <div
                ref={logoutRef}
                className="absolute right-0 mt-2 py-2 w-48 bg-white rounded-lg shadow-xl"
              >
                <Button
                  onClick={handleLogout}
                  className="block px-4 py-2 text-gray-800 hover:bg-gray-200 w-full text-left items-center justify-center"
                >
                  <LogoutIcon className="mb-1 mr-1" /> Logout
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Navbar
