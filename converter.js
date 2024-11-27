var toWav = require('audiobuffer-to-wav');
var xhr = require('xhr');
var context = new AudioContext();

// Ajouter le bouton dans la page
var playButton = document.createElement('button');
playButton.textContent = "Play Converted Audio";
playButton.disabled = true; // Désactivé tant que l'audio n'est pas prêt
document.body.appendChild(playButton);

// Charger et convertir l'audio
xhr({
  uri: 'audio/the chain solo.mp3',
  responseType: 'arraybuffer'
}, function (err, body, resp) {
  if (err) throw err;

  // Décoder le MP3 en AudioBuffer
  context.decodeAudioData(resp, function (buffer) {
    // Convertir AudioBuffer en WAV
    var wav = toWav(buffer);

    // Créer un blob pour l'audio WAV
    var blob = new Blob([wav], { type: 'audio/wav' });
    var url = URL.createObjectURL(blob);

    // Créer un élément audio pour jouer le fichier
    var audioElement = new Audio(url);

    // Activer le bouton et associer l'événement de lecture
    playButton.disabled = false;
    playButton.addEventListener('click', function () {
      audioElement.play();
    });
  });
});
