"use client"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { createShortUrl } from "@/server/action/shorturl"
import { updateVideo } from "@/server/action/video"
import type { shortUrls, videos as videoTable } from "@/server/db/schema"
import type { ColumnDef } from "@tanstack/react-table"
import {
  Clipboard,
  MoreHorizontal,
  PencilIcon,
  ShareIcon,
  Trash2Icon,
} from "lucide-react"
import { useState } from "react"

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
      // eslint-disable-next-line react-hooks/rules-of-hooks
      const [isUpdateDialogOpen, setIsUpdateDialogOpen] = useState(false)
      // eslint-disable-next-line react-hooks/rules-of-hooks
      const [title, setTitle] = useState(video.title)
      // eslint-disable-next-line react-hooks/rules-of-hooks
      const [description, setDescription] = useState(video.description ?? "")

      return (
        <Dialog open={isUpdateDialogOpen} onOpenChange={setIsUpdateDialogOpen}>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
              <DropdownMenuItem
                onClick={(e) => {
                  e.stopPropagation()
                  navigator.clipboard
                    .writeText(
                      window.location.origin +
                        `/share/${short_url?.shortVideoId}`,
                    )
                    .catch((err) => {
                      console.error(err)
                      alert("Error copying share link")
                    })
                }}
                disabled={!short_url}
              >
                <Clipboard className="mr-2 h-4 w-4" />
                Copy Share Link
              </DropdownMenuItem>

              <DropdownMenuItem
                onClick={(e) => {
                  e.stopPropagation()
                  handleShare(video.id).catch((err) => {
                    console.error(err)
                    alert("Error creating short url")
                  })
                }}
                disabled={!!short_url}
              >
                <ShareIcon className="mr-2 h-4 w-4" />
                Create Share Link
              </DropdownMenuItem>

              <DropdownMenuItem
                onClick={(e) => {
                  e.stopPropagation()
                  setIsUpdateDialogOpen(true)
                }}
              >
                <PencilIcon className="mr-2 h-4 w-4" />
                Update
              </DropdownMenuItem>

              <DropdownMenuItem disabled className="text-red-500">
                <Trash2Icon className="mr-2 h-4 w-4 text-red-500" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <DialogContent onClick={(e) => e.stopPropagation()}>
            <DialogHeader>
              <DialogTitle>Update Video</DialogTitle>
            </DialogHeader>
            <div className="mt-2 flex flex-col gap-2">
              <label htmlFor="title" className="text-sm">
                Title
              </label>
              <Input
                type="text"
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Title"
              />
              <label htmlFor="description" className="text-sm">
                Description
              </label>
              <Textarea
                id="description"
                placeholder="Description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
            <DialogFooter>
              <Button
                onClick={() =>
                  updateVideo(video.id, { title, description })
                    .then(() => setIsUpdateDialogOpen(false))
                    .catch((err) => console.error(err))
                }
              >
                Update
              </Button>
              <DialogClose asChild>
                <Button variant="outline">Cancel</Button>
              </DialogClose>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )
    },
  },
]
