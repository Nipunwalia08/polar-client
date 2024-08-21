import React, { type FC } from 'react'

const Progress: FC<{ progress: number }> = ({ progress }) => {
  return (
    <div className="bg-gray-300 w-[35vw] h-2 rounded-full overflow-hidden">
      <div
        className="bg-[#7b36fe] h-full rounded-full"
        style={{
          width: `${progress}%`,
        }}
      />
    </div>
  )
}

export default Progress
