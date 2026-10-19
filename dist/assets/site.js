"use strict";

const scenes = [
  { id: "indoor-static", title: "Indoor Static Obstacles", results: ["Success", "Success", "Success", "Failure", "Failure"] },
  { id: "indoor-dynamic", title: "Indoor Dynamic Obstacles", results: ["Success", "Danger", "Danger", "Success", "Failure"] },
  { id: "pillars", title: "Pillars", results: ["Success", "Success", "Failure", "Failure", "Failure"] },
  { id: "forest", title: "Forest", results: ["Success", "Success", "Success", "Failure", "Failure"] },
  { id: "mesh-obstacles", title: "Mesh Obstacles", results: ["Success", "Success", "Failure", "Failure", "Failure"] },
  { id: "sports-field", title: "Crossing a Sports Field", results: ["Success", "Success", "Failure", "Failure", "Failure"] }
];
const methods = [
  { id: "omninav", label: "OmniNav", featured: true },
  { id: "omninav-minus", label: "OmniNav(-)" },
  { id: "trace", label: "TRACE" },
  { id: "abs", label: "ABS" },
  { id: "agile", label: "Agile" }
];
const mediaVersions = {
  "indoor-dynamic/omninav": "dfd9792519a2",
  "indoor-dynamic/omninav-minus": "8c6738c4e707",
  "indoor-dynamic/trace": "a35116ac7360"
};
function mediaUrl(scene, method, extension) {
  const key = `${scene.id}/${method.id}`;
  const version = mediaVersions[key];
  return `media/${key}.${extension}${version ? `?v=${version}` : ""}`;
}
const playIcon = '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M4 2.5v11L13 8z"/></svg>';
const pauseIcon = '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M4 2h3v12H4zm5 0h3v12H9z"/></svg>';
const resetIcon = '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M8 2a6 6 0 1 1-5.66 8h1.63A4.5 4.5 0 1 0 4.8 4.85L7 7H1V1l2.72 2.72A5.98 5.98 0 0 1 8 2z"/></svg>';
const sceneList = document.querySelector("#scene-list");
const sceneNumerals = ["I", "II", "III", "IV", "V", "VI"];

for (const [index, scene] of scenes.entries()) {
  const section = document.createElement("section");
  section.className = "scene";
  section.id = scene.id;
  section.setAttribute("aria-labelledby", `${scene.id}-heading`);
  section.innerHTML = `
    <header class="scene-header">
      <div class="scene-title"><h3 id="${scene.id}-heading">Comparative Test ${sceneNumerals[index]}: ${scene.title}</h3></div>
      <div class="scene-actions">
        <button type="button" class="scene-button play-button" aria-label="Play all five videos in ${scene.title}" aria-pressed="false">${playIcon}<span>Play scene</span></button>
        <button type="button" class="scene-button reset-button" aria-label="Reset all five videos in ${scene.title}" title="Reset scene">${resetIcon}</button>
      </div>
    </header>
    <div class="video-grid">${methods.map((method, methodIndex) => `
      <figure class="comparison-video${method.featured ? " featured" : ""}" data-method="${method.id}">
        <video controls muted playsinline preload="none" poster="${mediaUrl(scene, method, "jpg")}" src="${mediaUrl(scene, method, "mp4")}" aria-labelledby="${scene.id}-${method.id}-label">
          Your browser does not support embedded video. <a href="${mediaUrl(scene, method, "mp4")}">Open the video.</a>
        </video>
        <p class="media-error" hidden>Video could not be loaded. <a href="${mediaUrl(scene, method, "mp4")}" target="_blank" rel="noopener">Open video</a>.</p>
        <figcaption class="video-caption" id="${scene.id}-${method.id}-label"><span>${method.label} : ${scene.results[methodIndex]}</span></figcaption>
      </figure>`).join("")}</div>
    <span class="scene-status" role="status" aria-live="polite"></span>`;
  sceneList.append(section);
  const videos = [...section.querySelectorAll("video")];
  const button = section.querySelector(".play-button");
  const status = section.querySelector(".scene-status");
  let busy = false;
  let playRequest = 0;

  function updateButton() {
    const playing = videos.some(video => !video.paused && !video.ended);
    button.innerHTML = `${playing ? pauseIcon : playIcon}<span>${playing ? "Pause scene" : "Play scene"}</span>`;
    button.setAttribute("aria-pressed", String(playing));
    button.setAttribute("aria-label", `${playing ? "Pause" : "Play"} all five videos in ${scene.title}`);
  }

  button.addEventListener("click", async () => {
    if (busy || videos.some(video => !video.paused && !video.ended)) {
      playRequest += 1;
      busy = false;
      videos.forEach(video => video.pause());
      status.textContent = "Scene paused.";
      updateButton();
      return;
    }
    document.querySelectorAll(".scene video").forEach(video => {
      if (!section.contains(video)) video.pause();
    });
    busy = true;
    const request = ++playRequest;
    status.textContent = "Starting videos…";
    const allFinished = videos.every(video => video.ended);
    const results = await Promise.allSettled(videos.map(video => {
      if (allFinished || video.ended) video.currentTime = 0;
      video.playbackRate = 1;
      video.muted = true;
      return video.play();
    }));
    if (request !== playRequest) return;
    const failures = results.filter(result => result.status === "rejected").length;
    status.textContent = failures ? "Some videos could not start. Try their individual play controls." : "Playing at 1×. Audio is muted; use a video's controls to unmute.";
    busy = false;
    updateButton();
  });

  section.querySelector(".reset-button").addEventListener("click", () => {
    playRequest += 1;
    busy = false;
    videos.forEach(video => { video.pause(); video.currentTime = 0; video.playbackRate = 1; });
    status.textContent = "Scene reset.";
    updateButton();
  });
  videos.forEach(video => {
    ["play", "pause", "ended"].forEach(event => video.addEventListener(event, updateButton));
    video.addEventListener("error", () => { video.closest("figure").querySelector(".media-error").hidden = false; });
  });
}

if ("IntersectionObserver" in window) {
  const playbackObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) entry.target.querySelectorAll("video").forEach(video => video.pause());
    });
  });
  document.querySelectorAll(".scene").forEach(section => playbackObserver.observe(section));

  const navLinks = [...document.querySelectorAll(".scene-nav a")];
  const navigationObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      navLinks.forEach(link => {
        if (link.hash === `#${entry.target.id}`) link.setAttribute("aria-current", "location");
        else link.removeAttribute("aria-current");
      });
    });
  }, { rootMargin: "-15% 0px -55% 0px" });
  document.querySelectorAll(".scene").forEach(section => navigationObserver.observe(section));
}
