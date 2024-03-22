const boardWidth = 300,
        boardHeight = 600;
      const xOffset = 19,
        yOffset = xOffset * 3.48;
      const count = 10;
      const background = "#ababbd";

      function generateSinGraph(xOff, yOff) {
        let d = `M 0,0 c ${xOff},${-yOff} ${xOff * 2},${-yOff} ${xOff * 3},0`;
        for (let i = 0; i < count - 2; i++) {
          if (i % 2 == 0) {
            d += ` s ${xOff * 2},${yOff} ${xOff * 3},0`;
          } else {
            d += ` s ${xOff * 2},${-yOff} ${xOff * 3},0`;
          }
        }
        return d;
      }

      function generateGradient(unit) {
        return `
              <stop offset="${unit}%" stop-color="#908dff" />
              <stop offset="${unit * 4}%" stop-color="#dec9ff" />
              <stop offset="${unit * 8}%" stop-color="#DBC6FF" />
              <stop offset="100%" stop-color="#DBC6FF00" />
        `;
      }

      function drawWave() {
        document.getElementById(
          "loading"
        ).innerHTML = `<svg id="wave" viewBox="0 0 ${boardWidth} ${boardHeight}" preserveAspectRatio="xMidYMid meet">
          <defs>
            <radialGradient id="myGradient">
              ${generateGradient(10)}
            </radialGradient>
          </defs>
          <circle id="gradient-back" cx="${boardWidth / 2}" cy="${
          boardHeight / 2
        }" r="${boardWidth}" fill="url('#myGradient')" />

          <path
            d="${generateSinGraph(xOffset, yOffset)}"
            id="wave-path"
            fill="none"
            stroke-width="3.5"
            stroke="#fff"
            transform="translate(${-xOffset * 1}, ${boardHeight / 2})"
          >
            <animateTransform
              attributeName="transform"
              attributeType="XML"
              type="translate"
              from="${-xOffset * 1} ${boardHeight / 2}"
              to="${-xOffset * 7}, ${boardHeight / 2}"
              dur="4s"
              repeatCount="indefinite" />
            
          </path>
        </svg>`;
      }
      const audioContext = new (window.AudioContext ||
        window.webkitAudioContext)();

      // Load your sound file
      const audioElement = new Audio("audio.mp3");
      const audioSource = audioContext.createMediaElementSource(audioElement);

      // Create an AnalyserNode
      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 256;
      audioSource.connect(analyser);
      audioSource.connect(audioContext.destination);

      // Get the SVG element and the path element
      const svg = document.getElementById("svg");
      const wavePath = document.getElementById("wave");

      // Get the buffer length and data array
      const bufferLength = analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);

      // Function to draw the wave
      function updateWave() {
        // Request animation frame
        if (!audioElement.paused) requestAnimationFrame(updateWave);

        // Get amplitude data
        analyser.getByteFrequencyData(dataArray);

        const sum = dataArray.reduce((acc, val) => acc + val, 0);
        const averageAmplitude = sum / bufferLength;

        // console.log(averageAmplitude);
        document
          .getElementById("wave-path")
          .setAttribute(
            "d",
            generateSinGraph(xOffset, yOffset * (averageAmplitude / 70))
          );
        document
          .getElementById("myGradient")
          .innerHTML = generateGradient(10 - (averageAmplitude / 70) * 2 )
      }

      // Start the animation
      document
        .getElementById("playButton")
        .addEventListener("click", function (e) {
          audioContext.resume().then(() => {
            // Start the animation when the audio can play
            if (audioElement.paused) {
              e.target.innerHTML = "Pause Audio";
              audioElement.play();
              audioElement.loop = true;
            } else {
              e.target.innerHTML = "Play Audio";
              audioElement.pause();
            }
            updateWave();
          });
        });

      drawWave();