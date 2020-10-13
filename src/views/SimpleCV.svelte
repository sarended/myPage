<script>
  const mySlider = document.getElementsByClassName('container');
  const rad1 = document.getElementById('nav1');
  const rad2 = document.getElementById('nav2');
  const rad3 = document.getElementById('nav3');
  const rad4 = document.getElementById('nav4');

  const navigate1 = () => {
    console.log('1');
    location.href = '#sc1';
  };
  const navigate2 = () => {
    console.log('2');
    location.href = '#sc2';
  };
  const navigate3 = () => {
    console.log('3');
    location.href = '#sc3';
  };
  const navigate4 = () => {
    console.log('4');
    location.href = '#sc4';
  };
</script>

<style>
  @media only screen and (max-width: 5000px) {
    .page {
      font-size: 1.5em;
    }
  }
  @media only screen and (max-width: 768px) {
    .page {
      font-size: 1em;
    }
  }

  @media only screen and (max-width: 320px) {
    .page {
      font-size: 0.7em;
    }
  }

  .page {
    color: white;
    /* font-size: 1.5em; */
    /* -webkit-text-stroke: 1px black; */
    background-position: center, center;
    background-size: 40vmax, 100vmax;
    background-repeat: no-repeat, no-repeat;
    background-color: rgb(18, 102, 201);
    background-image: url('../images/404.png'),
      radial-gradient(
        circle,
        rgba(18, 102, 201, 1) 60%,
        rgba(22, 53, 112, 1) 100%
      );
    width: 100vw;
    height: 100vh;
    position: fixed;
    display: flex;
    justify-content: center;
  }

  .container {
    /* display: none; */
    margin-top: 3vh;
    background-color: #feca1f;
    width: 70vw;
    height: 94vh;
    border-radius: 20px;
    padding: 0 15px;
    font-family: 'Roboto', sans-serif;
    overflow-x: auto;
    overflow-y: hidden;
    -ms-overflow-style: none; /* IE and Edge */
    scrollbar-width: none; /* Firefox */
    scroll-behavior: smooth;
  }

  .container::-webkit-scrollbar {
    display: none; /* Chrome, Safari and Opera */
  }

  .title {
    display: flex;
    align-self: flex-start;
    height: auto;
    position: -webkit-sticky; /* Safari */
    position: sticky;
    top: 0;
    left: 10%;
    width: 80%;
    background-color: #feca1f;
    justify-content: center;
  }

  h1.main_title {
    display: inline;
    /* font-family: 'Great Vibes', cursive; */
    font-family: 'Slackey', cursive;
    font-size: 1.2em;
  }

  .logo {
    width: 40px;
    margin: 0 12px 10px 0;
  }

  .slider {
    display: flex;
    flex-wrap: nowrap;
  }

  .slider > div {
    height: 55vh;
    width: 90%;
    display: flex;
    padding: 5vh 4vw 0 4vw;
    align-items: flex-start;
    justify-content: space-between;
    flex-direction: column;
    flex-shrink: 0;
  }

  .slider a {
    color: inherit;
    text-decoration: none;
  }

  .slider a:hover {
    font-weight: bold;
    color: #1266c9;
    -webkit-text-stroke: 1px #1266c9;
  }

  /* .slider > div:last-child {
    padding-right: 0vw;
    margin-right: -30vw;
  } */

  .slider img {
    width: 15vw;
    display: flex;
    position: relative;
    bottom: 0;
    right: 0;
    top: -10px;
    align-self: flex-end;
  }

  .slider > div:nth-of-type(2n) > img {
    width: 25vw;
  }

  .slider > div:nth-of-type(3n) > img {
    width: 25vw;
  }

  .slider > div:nth-of-type(4n) > img {
    width: 25vw;
  }

  /* .slider h3 {
    margin-bottom: 0;
  } */

  .slider p {
    margin-top: 0;
    text-align: justify;
    width: 40vw;
  }

  .bullet_pack {
    position: fixed;
    width: 27vw;
    bottom: 8vh;
    left: 38vw;
    /* justify-content: space-between;
    align-items: center; */
  }

  .bullet {
    height: 3.5px;
    /* @if __TODO__ */
    width: 4vw;
    border-radius: 20px;
    background-color: whitesmoke;
    -webkit-appearance: none; /* Safari */
    appearance: none; /* Rest of the Browsers */
    cursor: pointer;
    border: 3px solid lightgray;
  }

  .bullet:hover {
    background-color: #1266c9;
    border-color: #1266c9;
  }

  .bullet:focus,
  .bullet:checked {
    background-color: #163570;
    border-color: #163570;
  }
</style>

<div class="page">
  <div class="container">
    <div class="title">
      <img class="logo" src="/images/sarended_dark.svg" alt="sarended logo" />
      <h1 class="main_title">Saeed Raisi</h1>
    </div>
    <div class="bullet_pack">
      <input
        name="navigation"
        id="nav1"
        class="bullet"
        type="radio"
        checked="checked"
        href="#nav1"
        on:click={navigate1} />
      <input
        name="navigation"
        id="nav2"
        class="bullet"
        type="radio"
        href="#nav2"
        on:click={navigate2} />
      <input
        name="navigation"
        id="nav3"
        class="bullet"
        type="radio"
        href="#nav3"
        on:click={navigate3} />
      <input
        name="navigation"
        id="nav4"
        class="bullet"
        type="radio"
        href="#nav4"
        on:click={navigate4} />
    </div>
    <span class="light_mode" />
    <span class="lang" />
    <div class="slider">
      <div id="sc1">
        <h3>About Me</h3>
        <p>
          Hello! My name is Saeed Raisi. I am a front-end developer and
          javaScript obsessor. I also do like to do various things from reading
          ancient things to making weird things. BTW this webpage is under
          development and I'll add other things to it whenever I'm free. :D
        </p>
        <img src="../images/slides1.png" alt="image1" />
      </div>
      <div id="sc2">
        <h3>Programming</h3>
        <p>
          My main programming language is JavaScript/TypeScript(React, Svelte,
          Electron, Three) but I also code other stuff: python(OpenCV, PyTorch,
          Tensorflow), C++(Unreal Engine), C#(.net core, Unity), WASM.
        </p>
        <img src="../images/slides2.png" alt="image2" />
      </div>
      <div id="sc3">
        <h3>Designing</h3>
        <p>
          I have an infinite love for everything visual. I work with Adobe
          Photoshop, Adobe Illustrator, Adobe AfterEffects, Autodesk SketchBook,
          Autodesk Maya, Autodesk 3Ds Max, ZBrush, and Moho.
        </p>
        <img src="../images/slides3.png" alt="image3" />
      </div>
      <div id="sc4">
        <h3>Contact Me</h3>
        <p>
          You can always contact me via
          <a href="mailto:sarended@gmail.com">email</a>
        </p>
        <img src="../images/slides4.png" alt="image4" />
      </div>
    </div>
  </div>
</div>
