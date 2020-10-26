import { DOCUMENT } from "@angular/common";
import {
  AfterViewInit,
  Component,
  ElementRef,
  Inject,
  VERSION,
  ViewChild
} from "@angular/core";

@Component({
  selector: "my-app",
  templateUrl: "./app.component.html",
  styleUrls: ["./app.component.scss"]
})
export class AppComponent implements AfterViewInit {
  name = "Angular " + VERSION.major;

  public displayControllsOpacity = 1;
  public isPlaying = false;
  public isFullVolume = true;
  public isFullScreen = false;
  public watchedProgress = 0;
  public loadPercentage = 0;
  public isLoadingContent = false;
  public durationRemaining = "00:00";
  public controlsTimeout: number;

  @ViewChild("video") video: ElementRef;
  @ViewChild("videoContainer") videoContainer: ElementRef;
  @ViewChild("progressBar") progressBar: ElementRef;
  public videoElement: HTMLVideoElement;

  constructor(@Inject(DOCUMENT) private document: Document) {}
  ngAfterViewInit(): void {
    this.videoElement = this.video.nativeElement;
    this.videoContainer.nativeElement.addEventListener("mousemove", () => {
      // this.displayControls();
    });
    this.document.addEventListener("fullscreenchange", () => {
      if (!document.fullscreenElement) {
        this.isFullScreen = false;
      } else {
        this.isFullScreen = true;
      }
    });

    this.document.addEventListener("keyup", event => {
      if (event.code === "Space") {
        this.playPause();
      }
      if (event.code === "KeyM") {
        this.toggleMute();
      }
      if (event.code === "KeyF") {
        this.toggleFullScreen();
      }
      this.displayControls();
    });

    this.videoElement.addEventListener("timeupdate", () => {
      this.watchedProgress =
        (this.videoElement.currentTime / this.videoElement.duration) * 100;

      const totalSecondsRemaining =
        this.videoElement.duration - this.videoElement.currentTime;
      const time = new Date(null);
      time.setSeconds(totalSecondsRemaining);
      let hours = null;

      if (totalSecondsRemaining >= 3600) {
        hours = time
          .getHours()
          .toString()
          .padStart(2, "0");
      }

      let minutes = time
        .getMinutes()
        .toString()
        .padStart(2, "0");
      let seconds = time
        .getSeconds()
        .toString()
        .padStart(2, "0");

      this.durationRemaining = `${
        hours ? hours + ":" : ""
      }${minutes}:${seconds}`;
    });

    this.progressBar.nativeElement.addEventListener("click", event => {
      const progressBarEle = this.progressBar.nativeElement as HTMLElement;
      const pos =
        (event.pageX -
          (progressBarEle.offsetLeft + progressBarEle.offsetLeft)) /
        progressBarEle.offsetWidth;
      this.videoElement.currentTime = pos * this.videoElement.duration;
    });

    this.videoElement.addEventListener("progress", () => {
      var range = 0;
      var bf = this.videoElement.buffered;
      var time = this.videoElement.currentTime;
      console.log(bf.length);
      while (!(bf.start(range) <= time && time <= bf.end(range))) {
        range += 1;
      }
      var loadStartPercentage = bf.start(range) / this.videoElement.duration;
      var loadEndPercentage = bf.end(range) / this.videoElement.duration;
      this.loadPercentage = loadEndPercentage * 100;
      console.log(this.loadPercentage);
    });

    this.videoElement.addEventListener("waiting", data => {
      this.isLoadingContent = true;
      this.isPlaying = false;
    });
    this.videoElement.addEventListener("playing", data => {
      this.isLoadingContent = false;
      this.isPlaying = true;
    });

    console.log(this.videoElement);
  }

  displayControls() {
    this.displayControllsOpacity = 1;
    document.body.style.cursor = "initial";
    if (this.controlsTimeout) {
      clearTimeout(this.controlsTimeout);
    }
    this.controlsTimeout = setTimeout(() => {
      this.displayControllsOpacity = 0;
      document.body.style.cursor = "none";
    }, 5000);
  }

  playPause() {
    if (this.videoElement.paused) {
      this.videoElement.play();
      this.isPlaying = true;
    } else {
      this.videoElement.pause();
      this.isPlaying = false;
    }
  }

  toggleMute() {
    this.videoElement.muted = !this.videoElement.muted;
    if (this.videoElement.muted) {
      this.isFullVolume = false;
    } else {
      this.isFullVolume = true;
    }
  }

  toggleFullScreen() {
    if (!document.fullscreenElement) {
      this.videoContainer.nativeElement.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
  }
}
