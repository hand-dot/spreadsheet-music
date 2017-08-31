import React from 'react';

// style
import '../style/CantPlay.css';

function CantPlay() {
  return (
    <div className="cantplay">
      <p>Can Play Only the Chrome of Desktop</p>
      <iframe title="SpreadSheet meets Music" width="560" height="315" src="https://www.youtube.com/embed/FcaDeMz2H28" frameBorder="0" allowFullScreen />
    </div>
  );
}

export default CantPlay;
