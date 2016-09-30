var openFile = function(event) {
var input = event.target;
var audioContext = new AudioContext();

var reader = new FileReader();
reader.onload = function(){
var arrayBuffer = reader.result;
  console.log("arrayBuffer:");
  console.log(arrayBuffer);
  audioContext.decodeAudioData(arrayBuffer, decodedDone);

};
reader.readAsArrayBuffer(input.files[0]);
};
function decodedDone(decoded) {

 var typedArray = new Float32Array(decoded.length);

typedArray=decoded.getChannelData(0);
console.log("typedArray:");
console.log(typedArray);

}