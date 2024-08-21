'use client'
import React, { useState } from 'react'
import Navbar from './Navbar'
import Sidebar from './Sidebar'

const MenuBars = () => {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      <Navbar />
      <Sidebar isOpen={isOpen} setIsOpen={setIsOpen} />
    </>
  )
}

export default MenuBars
