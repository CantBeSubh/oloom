import asyncio

from run_worker import ProcessVideo
from shared import VideoDetails
from temporalio.client import Client


async def main():
    client = await Client.connect("localhost:7233", namespace="default")

    data: VideoDetails = VideoDetails(
        video_id="167e76b3-5ff6-460f-a496-f0a7910ab6e5",
        file_name="2487fac1-db28-41bb-bdd3-c901d36ea7bf/d34021c2-4965-477b-9c50-ac9bbfdb204b/video.mp4",
    )

    try:
        result = await client.execute_workflow(
            ProcessVideo.run,
            data,
            id=f"video-workflow-{data.video_id}",
            task_queue="video-task-queue",
        )
    except Exception as e:
        print(f"Error processing video: {e}")

    print(f"Result: {result}")


if __name__ == "__main__":
    asyncio.run(main())
