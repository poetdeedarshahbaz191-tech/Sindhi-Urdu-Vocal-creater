
from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
import os
import uuid
import subprocess
import shutil

app = Flask(__name__)
CORS(app)

# ==========================================
# FOLDERS
# ==========================================

BASE_DIR = os.path.dirname(os.path.abspath(__file__))

UPLOAD_FOLDER = os.path.join(BASE_DIR, "uploads")
OUTPUT_FOLDER = os.path.join(BASE_DIR, "outputs")

os.makedirs(UPLOAD_FOLDER, exist_ok=True)
os.makedirs(OUTPUT_FOLDER, exist_ok=True)


# ==========================================
# HOME
# ==========================================

@app.route("/")
def home():
    return jsonify({
        "status": "online",
        "app": "Sindhi Urdu Vocal Maker",
        "message": "AI Vocal Separation Backend is running."
    })


# ==========================================
# AI VOCAL SEPARATION
# ==========================================

@app.route("/api/separate", methods=["POST"])
def separate():

    # Check uploaded file
    if "audio" not in request.files:
        return jsonify({
            "success": False,
            "message": "No audio file uploaded."
        }), 400

    audio = request.files["audio"]

    if audio.filename == "":
        return jsonify({
            "success": False,
            "message": "No audio file selected."
        }), 400

    # ======================================
    # CREATE UNIQUE JOB ID
    # ======================================

    job_id = str(uuid.uuid4())

    extension = os.path.splitext(audio.filename)[1].lower()

    if not extension:
        extension = ".mp3"

    input_filename = job_id + extension

    input_path = os.path.join(
        UPLOAD_FOLDER,
        input_filename
    )

    # Save uploaded audio
    audio.save(input_path)

    # ======================================
    # RUN DEMUCS
    # ======================================

    try:

        command = [
            "python",
            "-m",
            "demucs",
            "--two-stems=vocals",
            "-o",
            OUTPUT_FOLDER,
            input_path
        ]

        process = subprocess.run(
            command,
            capture_output=True,
            text=True
        )

        if process.returncode != 0:

            print(process.stderr)

            return jsonify({
                "success": False,
                "message": "AI separation failed.",
                "error": process.stderr
            }), 500

        # ==================================
        # FIND DEMUCS OUTPUT FILES
        # ==================================

        vocals_file = None
        music_file = None

        for root, dirs, files in os.walk(OUTPUT_FOLDER):

            for filename in files:

                lower_name = filename.lower()

                full_path = os.path.join(
                    root,
                    filename
                )

                if (
                    "vocals" in lower_name
                    and lower_name.endswith(".wav")
                ):
                    vocals_file = full_path

                elif (
                    "no_vocals" in lower_name
                    and lower_name.endswith(".wav")
                ):
                    music_file = full_path

        # ==================================
        # CHECK VOCALS
        # ==================================

        if vocals_file is None:

            return jsonify({
                "success": False,
                "message": "Vocals file was not created."
            }), 500

        # ==================================
        # CHECK MUSIC
        # ==================================

        if music_file is None:

            return jsonify({
                "success": False,
                "message": "Instrumental file was not created."
            }), 500

        # ==================================
        # CREATE FINAL FILENAMES
        # ==================================

        final_vocals = f"{job_id}_vocals.wav"
        final_music = f"{job_id}_instrumental.wav"

        final_vocals_path = os.path.join(
            OUTPUT_FOLDER,
            final_vocals
        )

        final_music_path = os.path.join(
            OUTPUT_FOLDER,
            final_music
        )

        # Copy final files
        shutil.copy2(
            vocals_file,
            final_vocals_path
        )

        shutil.copy2(
            music_file,
            final_music_path
        )

        # ==================================
        # RETURN RESULTS
        # ==================================

        return jsonify({
            "success": True,
            "message": "AI vocal separation completed.",
            "vocals": f"/outputs/{final_vocals}",
            "music": f"/outputs/{final_music}",
            "job_id": job_id
        })

    except Exception as error:

        print(error)

        return jsonify({
            "success": False,
            "message": "Server error.",
            "error": str(error)
        }), 500


# ==========================================
# OUTPUT FILES
# ==========================================

@app.route("/outputs/<filename>")
def output_file(filename):

    return send_from_directory(
        OUTPUT_FOLDER,
        filename,
        as_attachment=False
    )


# ==========================================
# RUN SERVER
# ==========================================

if __name__ == "__main__":

    app.run(
        host="0.0.0.0",
        port=5000,
        debug=True
    )
