"use client"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { createShortUrl } from "@/server/action/shorturl"
import type { shortUrls, videos as videoTable } from "@/server/db/schema"
import type { ColumnDef } from "@tanstack/react-table"
import {
  Clipboard,
  MoreHorizontal,
  PencilIcon,
  ShareIcon,
  Trash2Icon,
} from "lucide-react"

export type VideoType = {
  video: typeof videoTable.$inferSelect
  short_url: typeof shortUrls.$inferSelect | null
}
const handleShare = async (videoId: string) => {
  const result = await createShortUrl(videoId)
  if (result.success) {
    console.log(result.data)
    alert("Short url created successfully")
  } else {
    console.error(result.error)
    alert("Error creating short url")
  }
}

export const columns: ColumnDef<VideoType>[] = [
  {
    accessorFn: (row) => row.video.title,
    header: "Title",
  },
  {
    accessorFn: (row) => row.video.createdAt,
    header: "Created At",
    cell: ({ cell }) => (
      <div>{new Date(cell.getValue() as number).toLocaleDateString()}</div>
    ),
  },
  {
    id: "actions",
    header: "Actions",
    cell: ({ row }) => {
      const { video, short_url } = row.original
      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start">
            <DropdownMenuItem
              onClick={() =>
                navigator.clipboard.writeText(
                  window.location.origin + `/share/${short_url?.shortVideoId}`,
                )
              }
              disabled={!short_url}
            >
              <Clipboard className="mr-2 h-4 w-4" />
              Copy Share Link
            </DropdownMenuItem>

            <DropdownMenuItem
              onClick={() => handleShare(video.id)}
              disabled={!!short_url}
            >
              <ShareIcon className="mr-2 h-4 w-4" />
              Create Share Link
            </DropdownMenuItem>

            <DropdownMenuItem disabled>
              <PencilIcon className="mr-2 h-4 w-4" />
              Update
            </DropdownMenuItem>

            <DropdownMenuItem disabled className="text-red-500">
              <Trash2Icon className="mr-2 h-4 w-4 text-red-500" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )
    },
  },
]
