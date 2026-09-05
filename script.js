
const audioFile = document.getElementById("audioFile"); const fileName = document.getElementById("fileName"); const status = document.getElementById("status");
const audioPlayer = document.getElementById("audioPlayer"); const bpmSlider = document.getElementById("bpm"); const bpmValue = document.getElementById("bpmValue");
const countBox = document.getElementById("countBox"); const startCue = document.getElementById("startCue");
const startButton = document.getElementById("startButton"); const stopButton = document.getElementById("stopButton");
let audioURL = null; let beatTimer = null; let cueTimer = null; let currentBeat = 0;
/* ============================== SONG FILE SELECT ============================== */
audioFile.addEventListener("change", function () {
if (audioFile.files.length > 0) {

    const file = audioFile.files[0];

    fileName.innerHTML =
        "🎵 Selected: " + file.name;

    status.innerHTML =
        "✅ Song selected. Ready for playback.";

    // Create audio URL
    if (audioURL) {
        URL.revokeObjectURL(audioURL);
    }

    audioURL = URL.createObjectURL(file);

    audioPlayer.src = audioURL;

    audioPlayer.style.display = "block";

} else {

    fileName.innerHTML = "";
    status.innerHTML = "";

    audioPlayer.removeAttribute("src");
    audioPlayer.style.display = "none";
}
});
/* ============================== BPM SLIDER ============================== */
if (bpmSlider) {
bpmSlider.addEventListener("input", function () {

    bpmValue.innerHTML =
        bpmSlider.value + " BPM";

});
}
/* ============================== START PROCESSING ============================== */
function startProcessing() {
if (audioFile.files.length === 0) {

    status.innerHTML =
        "⚠️ Please select a song first!";

    return;
}

status.innerHTML =
    "🎵 Starting music with singer count-in...";

startCue.style.display = "none";

startCountIn();
}
/* ============================== COUNT-IN SYSTEM 1 → 2 → 3 → 4 ============================== */
function startCountIn() {
stopCue();

currentBeat = 0;

countBox.style.display = "flex";

const bpm = Number(bpmSlider.value);

const beatDuration = 60000 / bpm;

// Start music
audioPlayer.currentTime = 0;

audioPlayer.play().catch(function (error) {

    console.log("Audio play error:", error);

    status.innerHTML =
        "⚠️ Please press the Play button on the audio player.";

});


// First beat immediately
showBeat();

// Continue beats
beatTimer = setInterval(function () {

    showBeat();

}, beatDuration);
}
/* ============================== SHOW BEAT ============================== */
function showBeat() {
currentBeat++;

// 1, 2, 3, 4
if (currentBeat <= 4) {

    countBox.innerHTML = currentBeat;

    // Restart animation
    countBox.classList.remove("beatFlash");

    void countBox.offsetWidth;

    countBox.classList.add("beatFlash");

}

// After 4 beats
if (currentBeat === 4) {

    clearInterval(beatTimer);

    beatTimer = null;

    setTimeout(function () {

        showVocalStart();

    }, 600);

}
}
/* ============================== VOCAL START MESSAGE ============================== */
function showVocalStart() {
countBox.style.display = "none";

startCue.style.display = "block";

startCue.innerHTML =
    "🎤 VOCAL START!";

status.innerHTML =
    "🎶 Singer can start now!";

// Hide message after 2 seconds
cueTimer = setTimeout(function () {

    startCue.style.display = "none";

}, 2000);
}
/* ============================== STOP ============================== */
function stopCue() {
if (beatTimer) {

    clearInterval(beatTimer);

    beatTimer = null;

}

if (cueTimer) {

    clearTimeout(cueTimer);

    cueTimer = null;

}

currentBeat = 0;

countBox.style.display = "none";

startCue.style.display = "none";

if (audioPlayer) {

    audioPlayer.pause();

    audioPlayer.currentTime = 0;

}

status.innerHTML =
    "⏹️ Stopped.";
}
/* ============================== STOP BUTTON ============================== */
if (stopButton) {
stopButton.addEventListener("click", function () {

    stopCue();

});
}
/* ============================== START BUTTON ============================== */
if (startButton) {
startButton.addEventListener("click", function () {

    startProcessing();

});
}
