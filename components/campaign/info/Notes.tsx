'use client'

import { Campaigns } from '@firebase/config'
import { Edit } from '@mui/icons-material'
import type { ICampaignWithId } from '@store/useCampaignStore'
import { Timestamp, doc, updateDoc } from 'firebase/firestore'
import { useRouter } from 'next/navigation'
import React, { useState } from 'react'
import { IoCheckmarkOutline } from 'react-icons/io5'
import { RxCross2 } from 'react-icons/rx'

const Notes = ({ campaign }: { campaign: ICampaignWithId }) => {
  const [note, setNote] = useState({
    editMode: false,
    content: campaign?.note?.content || '',
  })
  const router = useRouter()
  return (
    <div className="mt-2 border border-gray-100 rounded">
      <div className="bg-gray-100 p-2 flex justify-between items-center rounded">
        <span className="font-semibold">Notes</span>
        <div className="flex justify-center items-center gap-2">
          {note.editMode ? (
            <React.Fragment>
              <button
                type="button"
                onClick={async () => {
                  await updateDoc(doc(Campaigns, campaign.id), {
                    note: {
                      content: note.content,
                      createdAt: Timestamp.now(),
                    },
                  })
                  router.refresh()
                  setNote({
                    ...note,
                    editMode: false,
                  })
                }}
              >
                <IoCheckmarkOutline className="size-5" />
              </button>
              <button
                type="button"
                onClick={() =>
                  setNote({
                    editMode: false,
                    content: campaign?.note?.content || '',
                  })
                }
              >
                <RxCross2 className="size-5" />
              </button>
            </React.Fragment>
          ) : (
            <button
              type="button"
              onClick={() =>
                setNote({
                  ...note,
                  editMode: true,
                })
              }
            >
              <Edit className="size-6" />
            </button>
          )}
        </div>
      </div>
      <div className="text-sm p-2">
        {note.editMode ? (
          <textarea
            className="w-full"
            value={note.content}
            onChange={(e) =>
              setNote({
                ...note,
                content: e.target.value,
              })
            }
          />
        ) : (
          <React.Fragment>
            <div>{campaign?.note?.content || 'No notes available'}</div>
            {campaign?.note?.createdAt && (
              <div className="flex justify-end text-xs text-gray-500">
                {new Timestamp(
                  campaign?.note?.createdAt.seconds,
                  campaign?.note?.createdAt.nanoseconds,
                )
                  ?.toDate()
                  ?.toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })
                  ?.replace(/\//g, '-')}
              </div>
            )}
          </React.Fragment>
        )}
      </div>
    </div>
  )
}

export default Notes
