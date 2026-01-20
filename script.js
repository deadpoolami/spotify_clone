
const songs = [
    {
        name: "Bargad",
        artist: "Arpit Bala",
        file: "Bargad.mp3",
        img: "assets/img/bargad.jpg"
    },
    {
        name: "Departure Lane",
        artist: "Talha Anjum",
        file: "depla.mp3",
        img: "assets/img/departure-lane.jpg"
    },
    {
        name: "Mera Yaar",
        artist: "Javed Bashir",
        file: "mereyaar.mp3",
        img: "assets/img/mera-yaar.jpg"
    },
    {
        name: "Snowman",
        artist: "Sia",
        file: "snowman.mp3",
        img: "assets/img/snowman.jpg"
    }
];


const audio = document.getElementById("audioplayer");
const playPauseBtn = document.getElementById("playpause");
const prevBtn = document.getElementById("prevBtn");
const nextBtn = document.getElementById("nextBtn");
const progress = document.getElementById("progress");
const currentTimeEl = document.getElementById("currentTime");
const durationEl = document.getElementById("duration");
const songNameEl = document.getElementById("songname");
const songArtistEl = document.getElementById("songartist");
const nowPlayingImg = document.getElementById("nowPlayingImg");
const volumeSlider = document.getElementById("volumeSlider");
const volumeBtn = document.getElementById("volumeBtn");
const searchInput = document.getElementById("searchInput");
const searchResults = document.getElementById("searchResults");

let currentSongIndex = -1;
let isPlaying = false;
let currentVolume = 70;
let queue = [...songs];

document.addEventListener("DOMContentLoaded", () => {
    initializePlayer();
    setupEventListeners();
    setupNavigation();
    setupSearch();
    setupVolume();

    audio.volume = currentVolume / 100;
});


function initializePlayer() {
    audio.volume = currentVolume / 100;
    updatePlayPauseButton();
}


function setupEventListeners() {
  
    playPauseBtn.addEventListener("click", togglePlayPause);
    

    prevBtn.addEventListener("click", playPrevious);
    nextBtn.addEventListener("click", playNext);
    
    // Progress bar
    progress.addEventListener("input", seek);
    
    // Audio events
    audio.addEventListener("timeupdate", updateProgress);
    audio.addEventListener("loadedmetadata", () => {
        durationEl.textContent = formatTime(audio.duration);
    });
    audio.addEventListener("ended", playNext);
    audio.addEventListener("play", () => {
        isPlaying = true;
        updatePlayPauseButton();
    });
    audio.addEventListener("pause", () => {
        isPlaying = false;
        updatePlayPauseButton();
    });
    
    document.querySelectorAll(".play-btn").forEach(button => {
        button.addEventListener("click", (e) => {
            const songName = button.dataset.name;
            playSongByName(songName);
        });
    });
}

function setupNavigation() {
    const navItems = document.querySelectorAll(".nav-item");
    const views = {
        home: document.querySelector(".home-view"),
        search: document.querySelector(".search-view"),
        library: document.querySelector(".library-view")
    };
    
    navItems.forEach(item => {
        item.addEventListener("click", () => {
            const viewName = item.dataset.view;
            if (viewName && views[viewName]) {
                // Hide all views
                Object.values(views).forEach(view => {
                    if (view) {
                        view.classList.remove("active");
                    }
                });
                
                // Show selected view
                views[viewName].classList.add("active");
                
                // Update active nav item
                navItems.forEach(nav => nav.classList.remove("active"));
                item.classList.add("active");
            }
        });
    });
}

// Setup search functionality
function setupSearch() {
    searchInput.addEventListener("input", (e) => {
        const query = e.target.value.toLowerCase().trim();
        if (query === "") {
            searchResults.innerHTML = "";
            return;
        }
        
        const filteredSongs = songs.filter(song => 
            song.name.toLowerCase().includes(query) || 
            song.artist.toLowerCase().includes(query)
        );
        
        displaySearchResults(filteredSongs);
    });
}

// Display search results
function displaySearchResults(filteredSongs) {
    if (filteredSongs.length === 0) {
        searchResults.innerHTML = "<p class='no-results'>No songs found</p>";
        return;
    }
    
    searchResults.innerHTML = filteredSongs.map(song => `
        <div class="card">
            <div class="img-wrap">
                <img src="${song.img}" alt="${song.name}">
                <button class="play-btn" data-song="${song.file}" data-name="${song.name}" data-artist="${song.artist}" data-img="${song.img}">▶</button>
            </div>
            <h2>${song.name}</h2>
            <p>${song.artist}</p>
        </div>
    `).join("");
    
    // Re-attach event listeners to new play buttons
    searchResults.querySelectorAll(".play-btn").forEach(button => {
        button.addEventListener("click", () => {
            const songName = button.dataset.name;
            playSongByName(songName);
        });
    });
}

// Setup volume control
function setupVolume() {
    volumeSlider.addEventListener("input", (e) => {
        currentVolume = e.target.value;
        audio.volume = currentVolume / 100;
        updateVolumeIcon();
    });
    
    volumeBtn.addEventListener("click", toggleMute);
}

// Toggle mute
function toggleMute() {
    if (audio.volume > 0) {
        audio.volume = 0;
        volumeSlider.value = 0;
    } else {
        audio.volume = currentVolume / 100;
        volumeSlider.value = currentVolume;
    }
    updateVolumeIcon();
}

// Update volume icon
function updateVolumeIcon() {
    const volumeIcon = volumeBtn.querySelector(".volume-icon");
    if (audio.volume === 0) {
        volumeIcon.innerHTML = '<path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z"/>';
    } else if (audio.volume < 0.5) {
        volumeIcon.innerHTML = '<path d="M18.5 12c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM5 9v6h4l5 5V4L9 9H5z"/>';
    } else {
        volumeIcon.innerHTML = '<path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/>';
    }
}

// Play song by name
function playSongByName(songName) {
    const index = songs.findIndex(song => song.name === songName);
    if (index !== -1) {
        currentSongIndex = index;
        playSong(songs[index]);
    }
}

// Play song
function playSong(song) {
    audio.src = `songs/${song.file}`;
    audio.play();
    
    // Update UI
    songNameEl.textContent = song.name;
    songArtistEl.textContent = song.artist;
    
    // Update image
    nowPlayingImg.innerHTML = `<img src="${song.img}" alt="${song.name}">`;
    
    // Update queue index
    currentSongIndex = songs.findIndex(s => s.name === song.name);
    
    isPlaying = true;
    updatePlayPauseButton();
}

// Toggle play/pause
function togglePlayPause() {
    if (!audio.src) {
        // If no song is loaded, play first song
        if (songs.length > 0) {
            currentSongIndex = 0;
            playSong(songs[0]);
        }
        return;
    }
    
    if (audio.paused) {
        audio.play();
        isPlaying = true;
    } else {
        audio.pause();
        isPlaying = false;
    }
    updatePlayPauseButton();
}

// Play previous song
function playPrevious() {
    if (currentSongIndex <= 0) {
        currentSongIndex = songs.length - 1;
    } else {
        currentSongIndex--;
    }
    playSong(songs[currentSongIndex]);
}

// Play next song
function playNext() {
    if (currentSongIndex >= songs.length - 1) {
        currentSongIndex = 0;
    } else {
        currentSongIndex++;
    }
    playSong(songs[currentSongIndex]);
}

// Update play/pause button
function updatePlayPauseButton() {
    const playIcon = playPauseBtn.querySelector(".play-icon");
    const pauseIcon = playPauseBtn.querySelector(".pause-icon");
    
    if (isPlaying) {
        playIcon.style.display = "none";
        pauseIcon.style.display = "block";
    } else {
        playIcon.style.display = "block";
        pauseIcon.style.display = "none";
    }
}

// Update progress bar
function updateProgress() {
    if (audio.duration) {
        const progressPercent = (audio.currentTime / audio.duration) * 100;
        progress.value = progressPercent;
        currentTimeEl.textContent = formatTime(audio.currentTime);
    }
}

// Seek to position
function seek() {
    const seekTime = (progress.value / 100) * audio.duration;
    audio.currentTime = seekTime;
}

// Format time (seconds to MM:SS)
function formatTime(time) {
    if (isNaN(time) || time === 0) return "0:00";
    const min = Math.floor(time / 60);
    const sec = Math.floor(time % 60).toString().padStart(2, "0");
    return `${min}:${sec}`;
}

// Keyboard shortcuts
document.addEventListener("keydown", (e) => {
    // Spacebar to play/pause
    if (e.code === "Space" && e.target.tagName !== "INPUT") {
        e.preventDefault();
        togglePlayPause();
    }
    // Arrow left for previous
    if (e.code === "ArrowLeft" && e.target.tagName !== "INPUT") {
        e.preventDefault();
        if (audio.currentTime > 5) {
            audio.currentTime = 0;
        } else {
            playPrevious();
        }
    }
    // Arrow right for next
    if (e.code === "ArrowRight" && e.target.tagName !== "INPUT") {
        e.preventDefault();
        playNext();
    }
});

