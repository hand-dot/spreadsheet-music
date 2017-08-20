const scritp = `
  let timerID=null;
  let interval=100;

  this.onmessage=function(e){
    if (e.data==="start") {
      timerID=setInterval(function(){postMessage("tick");},interval)
    }
    else if (e.data==="stop") {
      clearInterval(timerID);
      timerID=null;
    }
    else if (e.data.interval) {
      interval=e.data.interval;
      if (timerID) {
        clearInterval(timerID);
        timerID=setInterval(function(){postMessage("tick");},interval)
      }
    }
  };
`;

export default new Worker(window.URL.createObjectURL(new Blob([scritp])));
