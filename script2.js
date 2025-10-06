// global variables
let current_song = new Audio();
let songs_list = [];
let songs_listurl = [];

// ...............................................................................

document.getElementById('searchicon').addEventListener('click', () => {
  document.getElementById('searchbox').focus();
});

// ...............................................................................

// function to extract album art from mp3 file manually
function getAlbumArtWithLibrary(fileUrl, callback) {
  if (typeof jsmediatags !== 'undefined') {
    jsmediatags.read(fileUrl, {
      onSuccess: function(tag) {
        if (tag.tags.picture) {
          const picture = tag.tags.picture;
          let base64String = "";
          for (let i = 0; i < picture.data.length; i++) {
            base64String += String.fromCharCode(picture.data[i]);
          }
          const base64 = `data:${picture.format};base64,${window.btoa(base64String)}`;
          callback(base64);
        } else {
          callback('covers/default.jpg');
        }
      },
      onError: function(error) {
        console.error('Error reading tags:', error);
        callback('covers/default.jpg');
      }
    });
  } else {
    // Fallback to manual method
    getAlbumArtFromMP3(fileUrl, callback);
  }
}

// FETCH SONGS FROM THE SERVER
async function getsongs() {
  let a = await fetch("http://127.0.0.1:3000/songs/");
  let response = await a.text();
  let div = document.createElement('div');
  div.innerHTML = response;
  let songs = div.getElementsByTagName('a');
  songs_list = [];
  songs_listurl = [];
  for (let index = 0; index < songs.length; index++) {
    const element = songs[index];
    if (element.href.endsWith('.mp3')) {
      songs_list.push(element.href.split('/%5Csongs%5C')[1].replaceAll('%20', ' ').split('.mp3')[0]);
      songs_listurl.push(element.href);
    }
  }
  console.log(songs_list);
  return songs_list;
}

// PLAY MUSIC
function play_music(track) {
  current_song.src = "songs/" + track + ".mp3";
  current_song.play();
  document.getElementById('playpose').innerHTML = `<img src="all svg/play.svg" alt=" pose button">`;
  document.querySelector('.songinfo .marquee').innerText = track;
}

// timing function
function formatTime(sec) {
  if (isNaN(sec)) return "00:00";
  let minutes = Math.floor(sec / 60);
  let seconds = Math.floor(sec % 60);
  return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

// THE MAIN FUNCTION
async function main() {
  let song_list = await getsongs();
  console.log(song_list);
  let song_ol = document.querySelector('.songlist ');
  let cardContainer = document.querySelector(".cardcontaner");
  
  // Clear existing content
  song_ol.innerHTML = '';
  cardContainer.innerHTML = '';
  
  for (let index = 0; index < song_list.length; index++) {
    const songs = song_list[index];
    const songUrl = songs_listurl[index];
    
    // Create song list item
    song_ol.innerHTML += `<div class="musiclist flex"><img src="all svg/music.svg" alt="music icon"><h4>${songs}</h4></div>`;
    
    // Create card with default image first
    const card = document.createElement('div');
    card.className = 'card';
    card.innerHTML = `<img class="cover-img" src="covers/default.jpg" alt="cover"><H4>${songs}</H4>`;
    cardContainer.appendChild(card);
    
    // Load album art for this card
    getAlbumArtWithLibrary(songUrl, function(coverUrl) {
      const img = card.querySelector('.cover-img');
      img.src = coverUrl;
      img.onerror = function() {
        this.src = 'covers/default.jpg';
      };
    });
  }
 
  // Add event listener to all songs LIST
  Array.from(document.querySelector('.songlist').getElementsByTagName('div')).forEach(e => {
    e.addEventListener('click', () => {
      play_music(e.getElementsByTagName('h4')[0].innerText);
    });
  });

  // Add event listener to cards
  Array.from(document.querySelectorAll('.card')).forEach((card, index) => {
    card.addEventListener('click', () => {
      play_music(song_list[index]);
    });
  });

  // search box functionality
  document.getElementById('searchbox').addEventListener('input', (e) => {
    let searchvalue = e.target.value.toLowerCase();
    Array.from(document.querySelector('.songlist').getElementsByTagName('div')).forEach(e => {
      let songname = e.getElementsByTagName('h4')[0].innerText.toLowerCase();
      if (songname.includes(searchvalue)) {
        e.style.display = 'flex';
      } else {
        e.style.display = 'none';
      }
    });
    Array.from(document.querySelectorAll('.card')).forEach(card => {
      let songname = card.getElementsByTagName('h4')[0].innerText.toLowerCase();
      if (songname.includes(searchvalue)) {
        card.style.display = 'block';
      } else {
        card.style.display = 'none';
      }
    });
  });

  // play pause functionality
  document.getElementById('playpose').addEventListener('click', () => {
    if (current_song.src == '') {
      play_music(song_list[0]);
      document.getElementById('playpose').innerHTML = `<img src="all svg/play.svg" alt=" pose button">`;
      return;
    }
    else if (current_song.paused) {
      current_song.play();
      document.getElementById('playpose').innerHTML = `<img src="all svg/play.svg" alt=" pose button">`;
    } else {
      current_song.pause();
      document.getElementById('playpose').innerHTML = `<img src="all svg/poes.svg" alt=" play button">`;
    }
  });

  // previes functionality
  document.getElementById('previes').addEventListener('click', () => {
    if (current_song.src == '') {
      play_music(song_list[0]);
      document.getElementById('playpose').innerHTML = `<img src="all svg/play.svg" alt=" pose button">`;
      return;
    }
    else {
      let currentName = current_song.src.split('/songs/').pop().split('.mp3')[0].replaceAll('%20', ' ');
      let current_index = song_list.indexOf(currentName);
      if (current_index <= 0) {
        play_music(song_list[0]);
      } else {
        play_music(song_list[current_index - 1]);
      }
      document.getElementById('playpose').innerHTML = `<img src="all svg/play.svg" alt=" pose button">`;
    }
  });

  // next functionality
  document.getElementById('next').addEventListener('click', () => {
    if (current_song.src == '') {
      play_music(song_list[0]);
      document.getElementById('playpose').innerHTML = `<img src="all svg/play.svg" alt=" pose button">`;
      return;
    }
    else {
      let currentName = current_song.src.split('/songs/').pop().split('.mp3')[0].replaceAll('%20', ' ');
      let current_index = song_list.indexOf(currentName);
      if (current_index >= song_list.length - 1) {
        play_music(song_list[0]);
      } else {
        play_music(song_list[current_index + 1]);
      }
      document.getElementById('playpose').innerHTML = `<img src="all svg/play.svg" alt=" pose button">`;
    }
  });

  // song time functionality
  current_song.addEventListener('timeupdate', () => {
    let progress = (current_song.currentTime / current_song.duration) * 95;
    document.querySelector('.circule').style.left = `${progress}%`;
    document.getElementById("current_time").innerText = formatTime(current_song.currentTime);
    document.getElementById("fulltime").innerText = " / " + formatTime(current_song.duration);
    if (progress >= 95) {
      let currentName = current_song.src.split('/songs/').pop().split('.mp3')[0].replaceAll('%20', ' ');
      let current_index = song_list.indexOf(currentName);
      if (current_index >= song_list.length - 1) {
        play_music(song_list[0]);
      } else {
        play_music(song_list[current_index + 1]);
      }
      document.getElementById('playpose').innerHTML = `<img src="all svg/play.svg" alt=" pose button">`;
    }
  });
}
// main function end here............................................................................................................
// seek functionality--
function seek() {
  let songtime = document.querySelector('.songtime');
  let circule = document.querySelector('.circule');
  let isDragging = false;

  circule.addEventListener('mousedown', () => {
    isDragging = true;
    document.body.style.userSelect = 'none';
  });

  document.addEventListener('mousemove', (e) => {
    if (!isDragging) return;
    const rect = songtime.getBoundingClientRect();
    let x = e.clientX - rect.left;
    x = Math.max(0, Math.min(x, rect.width));
    let percent = (x / rect.width);
    circule.style.left = `${percent * 95}%`;
  });

  document.addEventListener('mouseup', (e) => {
    if (!isDragging) return;
    isDragging = false;
    document.body.style.userSelect = '';
    const rect = songtime.getBoundingClientRect();
    let x = e.clientX - rect.left;
    x = Math.max(0, Math.min(x, rect.width));
    let percent = (x / rect.width);
    if (!isNaN(current_song.duration)) {
      current_song.currentTime = percent * current_song.duration;
    }
  });

  songtime.addEventListener('click', (e) => {
    const rect = songtime.getBoundingClientRect();
    let x = e.clientX - rect.left;
    x = Math.max(0, Math.min(x, rect.width));
    let percent = (x / rect.width);
    circule.style.left = `${percent * 95}%`;
    if (!isNaN(current_song.duration)) {
      current_song.currentTime = percent * current_song.duration;
    }
  });
}

// CALL THE MAIN  main FUNCTION
main();
seek();