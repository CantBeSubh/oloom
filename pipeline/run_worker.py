import asyncio
import os

from temporalio.client import Client
from temporalio.worker import Worker

from activities import VideoProcessingActivities
from workflows import ProcessVideo


async def main():
    client = await Client.connect(
        os.getenv("TEMPORAL_URL"),
        namespace="oloom"
    )

    activities = VideoProcessingActivities()
    worker = Worker(
        client,
        task_queue="video-task-queue",
        workflows=[ProcessVideo],
        activities=[
            activities.create_temp_dir,
            activities.download_video,
            activities.extract_audio,
            activities.transcribe,
            activities.summarize,
            activities.update_db,
            activities.upload_vtt,
            activities.cleanup,
        ],
    )
    await worker.run()


if __name__ == "__main__":
    asyncio.run(main())
