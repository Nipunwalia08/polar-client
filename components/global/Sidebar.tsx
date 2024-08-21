'use client'

import logo from '@assets/svg/logo.svg'
import { Admin } from '@firebase/config'
import { Button } from '@mui/material'
import useAuthStore from '@store/useAuthStore'
import navbarLinks from '@utils/navitems'
import clsx from 'clsx'
import { getDocs, query, where } from 'firebase/firestore'
import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import type React from 'react'
import { useEffect, useState } from 'react'

interface SidebarProps {
  isOpen: boolean
  setIsOpen: (value: boolean) => void
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, setIsOpen }) => {
  const [admin, setAdmin] = useState<boolean | null>(null)
  const pathname = usePathname()
  const { user } = useAuthStore()

  useEffect(() => {
    const checkAdminStatus = async () => {
      if (!user?.email) return
      setAdmin(
        !(await getDocs(query(Admin, where('email', '==', user?.email)))).empty,
      )
    }

    checkAdminStatus()
  }, [user?.email])

  return (
    <div
      className="flex flex-col h-screen w-fit transition-width duration-300 ease-in-out fixed z-10 max-h-[100vh] overflow-y-auto pb-4"
      onMouseEnter={() => {
        setIsOpen(true)
      }}
      onMouseLeave={() => {
        setIsOpen(false)
      }}
      style={{
        borderRadius: '0px 24px 24px 0px',
        border: '0.908px solid #EEE',
        background: '#F7F7F7',
        boxShadow: '0px 0px 43.607px 0px rgba(0, 0, 0, 0.08)',
      }}
    >
      <div className="logo flex items-center w-full justify-center mt-4 mb-2">
        <Image src={logo} alt="logo" width={50} />
      </div>
      <div className="flex flex-col">
        {navbarLinks.map((item, index) => {
          if (item?.title === 'break')
            return (
              <div
                key="break"
                className="bg-theme pt-0.5 mt-2 w-[70%] mx-auto"
              />
            )
          if (!item.adminSpecific || (item.adminSpecific && admin)) {
            return (
              <div key={index} className="flex flex-col">
                <Button
                  component={item?.href ? Link : 'button'}
                  href={item?.href}
                  className={clsx(
                    'flex normal-case justify-start font-normal items-center rounded mt-2 mx-3 px-2 py-0 hover:bg-gray-200',
                    isOpen ? 'w-auto' : 'w-fit',
                    pathname === item.href
                      ? 'bg-theme text-white selected'
                      : 'bg-inherit',
                  )}
                >
                  <Image src={item.icon} alt={item.title} className="w-12" />
                  {isOpen && <h3>{item.title}</h3>}
                </Button>
                {isOpen && item.subLinks && (
                  <div className="ml-[60px]">
                    {item.subLinks.map((subLink, subIndex) => {
                      if (
                        !subLink.adminSpecific ||
                        (subLink.adminSpecific && admin)
                      )
                        return (
                          <Link
                            href={subLink.href as string}
                            key={subIndex}
                            className={clsx(
                              'flex items-center rounded py-1 px-2 hover:bg-gray-200 mr-3 my-0.5',
                              pathname === subLink.href
                                ? 'bg-theme text-white selected'
                                : 'bg-inherit',
                            )}
                          >
                            {subLink.title}
                          </Link>
                        )
                    })}
                  </div>
                )}
              </div>
            )
          }
          return null
        })}
      </div>
    </div>
  )
}

export default Sidebar
