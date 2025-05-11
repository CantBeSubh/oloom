import ScreenRecorder from "@/components/screen-recorder"
import VideoList from "@/components/view/video/list"
import UploadButton from "@/components/view/video/upload-btn"

export default function HomePage() {
  return (
    <main className="flex h-[88vh] w-full items-center justify-center p-4">
      <div className="grid h-full w-full flex-1 grid-cols-2 gap-3">
        <div className="row-span-2 flex size-full items-center justify-center rounded-lg border p-4">
          <VideoList />
        </div>

        <UploadButton />
        <div className="flex size-full items-center justify-center rounded-lg border p-4">
          <ScreenRecorder />
        </div>
      </div>
    </main>
  )
}
