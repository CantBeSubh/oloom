import os
import shutil
from dataclasses import asdict, dataclass, field
from tempfile import mkdtemp
from typing import Any, Dict, Optional

import whisper
from minio import Minio
from ollama import Client
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine
from sqlalchemy.orm import DeclarativeBase, sessionmaker

MINIO_URL = os.getenv("MINIO_URL")
MINIO_PORT = os.getenv("MINIO_PORT")
MINIO_ACCESS_KEY = os.getenv("MINIO_ACCESS_KEY")
MINIO_SECRET_KEY = os.getenv("MINIO_SECRET_KEY")
OLLAMA_URL = os.getenv("OLLAMA_URL")
PG_HOST = os.getenv("PG_HOST")
PG_PORT = os.getenv("PG_PORT")
PG_USER = os.getenv("PG_USER")
PG_PASSWORD = os.getenv("PG_PASSWORD")
PG_DATABASE = os.getenv("PG_DATABASE")

POSTGRES_URL = (
    f"postgresql+asyncpg://{PG_USER}:{PG_PASSWORD}@{PG_HOST}:{PG_PORT}/{PG_DATABASE}"
)


@dataclass
class VideoDetails:
    video_id: str
    file_name: str

    def to_json(self) -> Dict[str, Any]:
        return asdict(self)

    @classmethod
    def from_json(cls, data: Dict[str, Any]) -> "VideoDetails":
        return cls(**data)


class Base(DeclarativeBase):
    pass


@dataclass
class TempDirHandler:
    video_id: str
    file_name: str
    temp_dir: Optional[str] = field(default_factory=lambda: mkdtemp(prefix="oloom_"))

    def cleanup(self) -> None:
        if hasattr(self, "temp_dir") and self.temp_dir:
            print(f"Cleaning up: {self.temp_dir}")
            shutil.rmtree(self.temp_dir)
            self.temp_dir = None

    def to_json(self) -> Dict[str, Any]:
        return {
            "video_id": self.video_id,
            "file_name": self.file_name,
            "temp_dir": self.temp_dir,
        }

    @classmethod
    def from_json(cls, data: Dict[str, Any]) -> "TempDirHandler":
        handler = cls(
            video_id=data["video_id"],
            file_name=data["file_name"],
            temp_dir=data["temp_dir"],
        )
        return handler


@dataclass
class MinioHandler:
    host: str = field(default=f"{MINIO_URL}:{MINIO_PORT}")
    access_key: str = field(default=MINIO_ACCESS_KEY)
    secret_key: str = field(default=MINIO_SECRET_KEY)
    secure: bool = field(default=True)
    minio_client: Minio = field(init=False)

    def __post_init__(self):
        self.minio_client = Minio(
            self.host,
            access_key=self.access_key,
            secret_key=self.secret_key,
            secure=self.secure,
        )

    def cleanup(self) -> None:
        if hasattr(self, "minio_client"):
            del self.minio_client


@dataclass
class DBHandler:
    url: str = field(default=POSTGRES_URL)
    db: AsyncSession = field(init=False)

    def __post_init__(self):
        engine = create_async_engine(self.url)
        self.db = sessionmaker(engine, class_=AsyncSession)

    def cleanup(self) -> None:
        if hasattr(self, "db"):
            del self.db


@dataclass
class AIHandler:
    model_name: str = field(default="turbo")
    ollama_host: str = field(default=OLLAMA_URL)
    model: whisper.Whisper = field(init=False)
    ollama_client: Client = field(init=False)

    def __post_init__(self):
        self.model = whisper.load_model(self.model_name)
        self.ollama_client = Client(host=self.ollama_host)

    def cleanup(self) -> None:
        if hasattr(self, "model"):
            del self.model
