import { Button } from "@material-ui/core";
import PlayArrowIcon from "@material-ui/icons/PlayArrow";
import React, { FC, useRef, useState } from "react";
import "./custom-video-player.scss";

interface CustomVideoPlayerProps {
  videoPath: string;
  onMobile: boolean;
}

const CustomVideoPlayer: FC<CustomVideoPlayerProps> = (props) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [currentlyPlaying, setCurrentlyPlaying] = useState(false);

  return (
    <div
      className={`video-container ${currentlyPlaying ? '' : 'paused'}`}
      onClick={() => {
        videoRef.current?.play();
      }}
    >
      <video
        onPlay={() => {
          setCurrentlyPlaying(true);
        }}
        onEnded={() => {
          setCurrentlyPlaying(false);
        }}
        ref={videoRef}
        width={"100%"}
        controls={false}
      >
        <source src={props.videoPath} type="video/mp4" />
      </video>
      <div className="video-controls">
        {currentlyPlaying ? (
          <div></div>
        ) : (
          <Button
            onClick={() => {
              videoRef.current?.play();
            }}
            variant="contained"
            color="primary"
            size="large"
            startIcon={<PlayArrowIcon />}
          >
            Play
          </Button>
        )}
      </div>
    </div>
  );
};

export default CustomVideoPlayer;
