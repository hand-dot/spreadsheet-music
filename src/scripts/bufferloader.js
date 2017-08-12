let BufferLoader = function(context, soundObjs, callback) {
  this.context = context;
  //{key:url}
  this.soundObjs = soundObjs;
  this.onload = callback;
  // this.bufferList = [];
  this.bufferObjs = {};
  this.loadCount = 0;
};

BufferLoader.prototype.loadBuffer = function({key,url}) {
  // Load buffer asynchronously
  let request = new XMLHttpRequest();
  request.open("GET", url, true);
  request.responseType = "arraybuffer";

  let loader = this;

  request.onload = function() {
    // Asynchronously decode the audio file data in request.response
    loader.context.decodeAudioData(
      request.response,
      function(buffer) {
        if (!buffer) {
          alert('error decoding file data: ' + url);
          return;
        }
        loader.bufferObjs[key] = buffer;
        if (++loader.loadCount === loader.soundObjs.length)
          loader.onload(loader.bufferObjs);
      },
      function(error) {
        console.error('decodeAudioData error', error);
      }
    );
  }
  request.onerror = function() {
    alert('BufferLoader: XHR error');
  }
  request.send();
};

BufferLoader.prototype.load = function() {
  Object.entries(this.soundObjs).forEach((entrie)=>{
    this.loadBuffer({key:entrie[0],url:entrie[1]});
  });
};

export default BufferLoader;