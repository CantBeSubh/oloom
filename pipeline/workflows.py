from datetime import timedelta

from temporalio import workflow
from temporalio.common import RetryPolicy

with workflow.unsafe.imports_passed_through():
    from activities import VideoProcessingActivities
    from shared import VideoDetails


@workflow.defn
class ProcessVideo:
    @workflow.run
    async def run(self, video_details: VideoDetails) -> str:
        try:
            retry_policy = RetryPolicy(
                maximum_attempts=3,
                maximum_interval=timedelta(seconds=2),
            )

            temp_dir_handler = await workflow.execute_activity_method(
                VideoProcessingActivities.create_temp_dir,
                video_details,
                retry_policy=retry_policy,
                start_to_close_timeout=timedelta(minutes=10),
            )

            await workflow.execute_activity_method(
                VideoProcessingActivities.download_video,
                temp_dir_handler,
                retry_policy=retry_policy,
                start_to_close_timeout=timedelta(minutes=10),
            )

            await workflow.execute_activity_method(
                VideoProcessingActivities.extract_audio,
                temp_dir_handler,
                retry_policy=retry_policy,
                start_to_close_timeout=timedelta(minutes=10),
            )

            combined_text = await workflow.execute_activity_method(
                VideoProcessingActivities.transcribe,
                temp_dir_handler,
                retry_policy=retry_policy,
                start_to_close_timeout=timedelta(minutes=10),
            )

            summary_text = await workflow.execute_activity_method(
                VideoProcessingActivities.summarize,
                combined_text,
                retry_policy=retry_policy,
                start_to_close_timeout=timedelta(minutes=10),
            )

            await workflow.execute_activity_method(
                VideoProcessingActivities.update_db,
                {"temp_dir_handler": temp_dir_handler, "summary_text": summary_text},
                retry_policy=retry_policy,
                start_to_close_timeout=timedelta(minutes=10),
            )

            await workflow.execute_activity_method(
                VideoProcessingActivities.upload_vtt,
                temp_dir_handler,
                retry_policy=retry_policy,
                start_to_close_timeout=timedelta(minutes=10),
            )

            await workflow.execute_activity_method(
                VideoProcessingActivities.cleanup,
                temp_dir_handler,
                retry_policy=retry_policy,
                start_to_close_timeout=timedelta(minutes=10),
            )

            return f"Video ID: {video_details.video_id} processed successfully - summary length: {len(summary_text)}"
        except Exception as e:
            workflow.logger.error(f"Error processing video: {e}")
            raise e
