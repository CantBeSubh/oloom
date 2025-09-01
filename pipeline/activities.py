import asyncio
import time

import ffmpeg
from sqlalchemy import text
from temporalio import activity
from tqdm import tqdm

from shared import AIHandler, DBHandler, MinioHandler, TempDirHandler, VideoDetails


class VideoProcessingActivities:
    def __init__(self):
        pass

    @activity.defn
    async def create_temp_dir(self, video_details: VideoDetails) -> TempDirHandler:
        def create_fxn(video_details: VideoDetails):
            return TempDirHandler(
                video_id=video_details.video_id, file_name=video_details.file_name
            )

        return await asyncio.to_thread(create_fxn, video_details)

    @activity.defn
    async def download_video(self, temp_dir_handler: TempDirHandler) -> bool:
        try:
            minio_handler = MinioHandler()
            video_path = f"{temp_dir_handler.temp_dir}/{temp_dir_handler.file_name}"
            await asyncio.to_thread(
                minio_handler.minio_client.fget_object,
                bucket_name="oloom",
                object_name=temp_dir_handler.file_name,
                file_path=video_path,
            )
            return True
        except Exception as e:
            activity.logger.error(f"Error downloading video: {e}")
            raise e
        finally:
            minio_handler.cleanup()

    @activity.defn
    async def extract_audio(self, temp_dir_handler: TempDirHandler) -> bool:
        try:
            video_path = f"{temp_dir_handler.temp_dir}/{temp_dir_handler.file_name}"
            audio = ffmpeg.input(video_path)
            audio = ffmpeg.output(
                audio,
                f"{temp_dir_handler.temp_dir}/output.wav",
                acodec="pcm_s16le",
                ac=1,
                ar="16k",
                loglevel="quiet",
            )
            await asyncio.to_thread(ffmpeg.run, audio, overwrite_output=True)
            activity.logger.info(f"Audio path: {temp_dir_handler.temp_dir}/output.wav")
            return True
        except Exception as e:
            activity.logger.error(f"Error extracting audio: {e}")
            raise e

    @activity.defn
    async def transcribe(self, temp_dir_handler: TempDirHandler) -> str:
        def format_timestamp(
            seconds: float,
            always_include_hours: bool = False,
            fractionalSeperator: str = ".",
        ):
            assert seconds >= 0, "non-negative timestamp expected"
            milliseconds = round(seconds * 1000.0)

            hours = milliseconds // 3_600_000
            milliseconds -= hours * 3_600_000

            minutes = milliseconds // 60_000
            milliseconds -= minutes * 60_000

            seconds = milliseconds // 1_000
            milliseconds -= seconds * 1_000

            hours_marker = f"{hours:02d}:" if always_include_hours or hours > 0 else ""
            return f"{hours_marker}{minutes:02d}:{seconds:02d}{fractionalSeperator}{milliseconds:03d}"

        ai_handler = AIHandler()
        try:
            audio_path = f"{temp_dir_handler.temp_dir}/output.wav"
            start_time = time.time()
            result = await asyncio.to_thread(
                ai_handler.model.transcribe, audio_path, verbose=True
            )
            activity.logger.info(
                f"Time taken for transcription: {time.time() - start_time:.2f} seconds"
            )
            segments = result["segments"]
            combined_text = result["text"]
            srt_path = f"{temp_dir_handler.temp_dir}/transcript.vtt"

            with open(srt_path, "w", encoding="utf-8") as f:
                f.write("WEBVTT\n\n")
                for segment in tqdm(segments, total=len(segments), desc="Writing VTT"):
                    text = segment["text"].strip().replace("-->", "->")

                    f.write(
                        f"{format_timestamp(segment['start'])} --> {format_timestamp(segment['end'])}\n"
                        f"{text}\n\n"
                    )

            activity.logger.info(f"VTT file: {srt_path}")
            return combined_text

        except Exception as e:
            activity.logger.error(f"Error transcribing video: {e}")
            raise e
        finally:
            ai_handler.cleanup()

    @activity.defn
    async def summarize(self, text) -> str:
        ai_handler = AIHandler()
        try:
            messages = [
                {
                    "role": "user",
                    "content": f"You are a helpful assistant. I made a video, give a brief summary of this transcript. Avoid including intro text. \n\n{text}",
                }
            ]
            model = "llama3.2:3b"
            response = await asyncio.to_thread(
                ai_handler.ollama_client.chat, model=model, messages=messages
            )
            return response["message"]["content"]

        except Exception as e:
            activity.logger.error(f"Error summarizing text: {e}")
            raise e

        finally:
            ai_handler.cleanup()

    @activity.defn
    async def update_db(self, data: dict) -> bool:
        temp_dir_handler = TempDirHandler.from_json(data.get("temp_dir_handler"))
        summary_text = data.get("summary_text")
        db_handler = DBHandler()
        try:
            async with db_handler.db() as session:
                sql_query = "UPDATE web_video SET description=:summary WHERE id=:id"
                await session.execute(
                    text(sql_query),
                    {"summary": summary_text, "id": temp_dir_handler.video_id},
                )
                await session.commit()
                return True
        except Exception as e:
            activity.logger.error(f"Error updating database: {e}")
            raise e
        finally:
            db_handler.cleanup()

    @activity.defn
    async def upload_vtt(self, temp_dir_handler: TempDirHandler) -> bool:
        minio_handler = MinioHandler()
        try:
            vtt_object_name = f"{'/'.join(temp_dir_handler.file_name.split('/')[0:-1])}/transcript.vtt"
            vtt_path = f"{temp_dir_handler.temp_dir}/transcript.vtt"
            await asyncio.to_thread(
                minio_handler.minio_client.fput_object,
                bucket_name="oloom",
                object_name=vtt_object_name,
                file_path=vtt_path,
                content_type="text/vtt",
            )
            return True
        except Exception as e:
            activity.logger.error(f"Error uploading SRT: {e}")
            raise e
        finally:
            minio_handler.cleanup()

    @activity.defn
    async def cleanup(self, temp_dir_handler: TempDirHandler) -> bool:
        temp_dir_handler.cleanup()
        return True
