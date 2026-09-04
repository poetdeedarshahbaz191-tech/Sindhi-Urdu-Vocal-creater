const audioFile = document.getElementById("audioFile");
const fileName = document.getElementById("fileName");
const status = document.getElementById("status");

audioFile.addEventListener("change", function () {

    if (audioFile.files.length > 0) {

        fileName.innerHTML =
            "🎵 Selected: " + audioFile.files[0].name;

        status.innerHTML =
            "✅ Song selected. Ready for AI processing.";

    } else {

        fileName.innerHTML = "";
        status.innerHTML = "";

    }

});


function startProcessing() {

    if (audioFile.files.length === 0) {

        status.innerHTML =
            "⚠️ Please select a song first!";

        return;
    }

    status.innerHTML =
        "🤖 AI Vocal Separation will be connected next...";
}
