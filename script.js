
/* ==========================================
   🎤 Sindhi Urdu Vocal Maker
   Complete script.js
   ========================================== */

const audioFile = document.getElementById("audioFile");
const fileName = document.getElementById("fileName");
const audioPlayer = document.getElementById("audioPlayer");

const bpm = document.getElementById("bpm");
const bpmValue = document.getElementById("bpmValue");

const countBox = document.getElementById("countBox");
const countNumber = document.getElementById("countNumber");

const startCue = document.getElementById("startCue");

const startBtn = document.getElementById("startBtn");
const stopBtn = document.getElementById("stopBtn");

const status = document.getElementById("status");


/* ==========================================
   VARIABLES
   ========================================== */

let selectedFile = null;
let audioURL = null;

let countTimer = null;
let countStep = 0;

let processing = false;


/* ==========================================
   INITIAL STATE
   ========================================== */

countBox.style.display = "block";
startCue.style.display = "none";

stopBtn.disabled = true;

bpmValue.textContent = bpm.value + " BPM";

status.textContent = "🎵 Select a song to begin.";


/* ==========================================
   SONG SELECT
   ========================================== */

audioFile.addEventListener("change", function () {

    if (!audioFile.files.length) {

        selectedFile = null;

        fileName.textContent = "";
        audioPlayer.style.display = "none";

        status.textContent =
            "❌ No song selected.";

        return;
    }


    selectedFile = audioFile.files[0];


    /* Show selected filename */

    fileName.textContent =
        "🎵 Selected: " + selectedFile.name;


    /* Create preview URL */

    if (audioURL) {

        URL.revokeObjectURL(audioURL);

    }

    audioURL =
        URL.createObjectURL(selectedFile);


    audioPlayer.src = audioURL;

    audioPlayer.style.display = "block";


    status.textContent =
        "✅ Song selected. Ready for processing.";

});


/* ==========================================
   BPM
   ========================================== */

bpm.addEventListener("input", function () {

    bpmValue.textContent =
        bpm.value + " BPM";

});


/* ==========================================
   START PROCESSING
   ========================================== */

async function startProcessing() {

    if (!selectedFile) {

        status.textContent =
            "⚠️ Please select a song first.";

        return;
    }


    if (processing) {

        return;

    }


    processing = true;

    startBtn.disabled = true;

    stopBtn.disabled = false;


    status.textContent =
        "🥁 Preparing singer count-in...";


    /* Count-in */

    const countFinished =
        await startCountIn();


    if (!countFinished) {

        return;

    }


    if (!processing) {

        return;

    }


    status.textContent =
        "🤖 AI is separating vocals and music...";


    /*
       ======================================
       AI SEPARATION
       ======================================

       NOTE:

       /api/separate must be connected
       to a real AI backend.

    */

    try {

        const result =
            await separateVocals(selectedFile);


        if (!processing) {

            return;

        }


        if (result && result.success) {

            status.textContent =
                "✅ Vocal separation completed.";

            showResults(result);

        }

        else {

            status.textContent =
                "❌ Separation failed.";

        }

    }

    catch (error) {

        console.error(error);

        status.textContent =
            "⚠️ AI backend is not connected yet.";

    }


    processing = false;

    startBtn.disabled = false;

    stopBtn.disabled = true;

}


/* ==========================================
   COUNT-IN
   ========================================== */

function startCountIn() {

    return new Promise(function (resolve) {

        stopCountTimer();

        countStep = 1;


        countBox.style.display =
            "block";

        startCue.style.display =
            "none";


        countNumber.textContent =
            countStep;


        const bpmNumber =
            Number(bpm.value);


        const beatTime =
            60000 / bpmNumber;


        countTimer =
            setInterval(function () {

                if (!processing) {

                    stopCountTimer();

                    resolve(false);

                    return;

                }


                countStep++;


                if (countStep <= 4) {

                    countNumber.textContent =
                        countStep;

                }


                else {

                    stopCountTimer();


                    countBox.style.display =
                        "none";


                    startCue.style.display =
                        "block";


                    startCue.textContent =
                        "🎤 VOCAL START";


                    status.textContent =
                        "🎤 VOCAL START";


                    resolve(true);

                }

            }, beatTime);

    });

}


/* ==========================================
   STOP COUNT TIMER
   ========================================== */

function stopCountTimer() {

    if (countTimer) {

        clearInterval(countTimer);

        countTimer = null;

    }

}


/* ==========================================
   STOP BUTTON
   ========================================== */

function stopCue() {

    processing = false;

    stopCountTimer();


    if (audioPlayer) {

        audioPlayer.pause();

    }


    countStep = 0;

    countNumber.textContent = "1";


    countBox.style.display =
        "block";

    startCue.style.display =
        "none";


    startBtn.disabled = false;

    stopBtn.disabled = true;


    status.textContent =
        "⏹ Processing stopped.";

}


/* ==========================================
   AI VOCAL SEPARATOR
   ========================================== */

async function separateVocals(file) {

    const formData =
        new FormData();


    formData.append(
        "audio",
        file
    );


    formData.append(
        "bpm",
        bpm.value
    );


    /*
       Send file to AI backend
    */

    const response =
        await fetch(
            "/api/separate",
            {
                method: "POST",
                body: formData
            }
        );


    if (!response.ok) {

        throw new Error(
            "Server error: " +
            response.status
        );

    }


    return await response.json();

}


/* ==========================================
   SHOW VOCALS + MUSIC
   ========================================== */

function showResults(result) {

    const oldResults =
        document.getElementById("results");


    if (oldResults) {

        oldResults.remove();

    }


    const results =
        document.createElement("div");


    results.id =
        "results";


    results.innerHTML = `

        <hr>

        <h2>🎧 Separation Complete</h2>


        <div class="result-item">

            <h3>🎤 Vocals</h3>

            <audio
                controls
                style="width:100%;"
                src="${result.vocals}">
            </audio>

            <br><br>

            <a
                href="${result.vocals}"
                download
                class="download-btn">

                ⬇️ Download Vocals

            </a>

        </div>


        <br>


        <div class="result-item">

            <h3>🎵 Music / Instrumental</h3>

            <audio
                controls
                style="width:100%;"
                src="${result.music}">
            </audio>

            <br><br>

            <a
                href="${result.music}"
                download
                class="download-btn">

                ⬇️ Download Music

            </a>

        </div>

    `;


    document
        .querySelector(".upload-box")
        .appendChild(results);

}


/* ==========================================
   CLEANUP
   ========================================== */

window.addEventListener(
    "beforeunload",
    function () {

        if (audioURL) {

            URL.revokeObjectURL(audioURL);

        }

        stopCountTimer();

    }
);
