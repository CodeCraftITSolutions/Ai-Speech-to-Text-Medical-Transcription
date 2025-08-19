import whisper
import tempfile
import os

# Load Whisper model (base, medium, or large depending on accuracy/performance tradeoff)
model = whisper.load_model("base")

def transcribe_audio(file_bytes: bytes) -> str:
    with tempfile.NamedTemporaryFile(delete=False, suffix=".mp3") as temp_audio:
        temp_audio.write(file_bytes)
        temp_audio.flush()
        result = model.transcribe(temp_audio.name)
        os.remove(temp_audio.name)
        return result["text"]