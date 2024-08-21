'use client'

import React from 'react'
import type { HTMLInputTypeAttribute } from 'react'

type InputBoxProps = {
  type?: HTMLInputTypeAttribute
  id: string
  label: string
  placeholder: string
  textarea?: boolean
  value: string
  readOnly: boolean
  onChange: (value: string) => void
}

const InputBox = ({
  type,
  id,
  label,
  placeholder,
  textarea,
  value,
  readOnly,
  onChange,
}: InputBoxProps) => {
  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={id}>{label}</label>
      {textarea ? (
        <textarea
          value={value}
          onChange={(e) => {
            onChange(e?.target?.value)
          }}
          placeholder={placeholder}
          className="w-full px-4 py-2 rounded-md border text-sm"
          id={id}
          readOnly={readOnly}
        />
      ) : (
        <input
          value={value}
          onChange={(e) => {
            onChange(e?.target?.value)
          }}
          type={type || 'text'}
          placeholder={placeholder}
          className="w-full px-4 py-2 rounded-md border text-sm"
          readOnly={readOnly}
        />
      )}
    </div>
  )
}

export default InputBox
