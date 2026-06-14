import { useEffect, useRef, useState } from "react";
import type { PaperAudioSample } from "../../content/papers/types";

type WetDryAudioPlayerProps = {
  sample: PaperAudioSample;
};

type AudioNodes = {
  drySource: AudioBufferSourceNode;
  wetSource: AudioBufferSourceNode;
  dryGain: GainNode;
  wetGain: GainNode;
};

function formatTime(seconds: number) {
  if (!Number.isFinite(seconds)) {
    return "0:00";
  }

  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60).toString().padStart(2, "0");
  return `${minutes}:${remainingSeconds}`;
}

function WetDryAudioPlayer({ sample }: WetDryAudioPlayerProps) {
  const audioContextRef = useRef<AudioContext | null>(null);
  const dryBufferRef = useRef<AudioBuffer | null>(null);
  const wetBufferRef = useRef<AudioBuffer | null>(null);
  const nodesRef = useRef<AudioNodes | null>(null);
  const startedAtRef = useRef(0);
  const offsetRef = useRef(0);
  const animationFrameRef = useRef<number | null>(null);
  const isStoppingRef = useRef(false);

  const [activeSource, setActiveSource] = useState<"dry" | "wet">("wet");
  const [isLoading, setIsLoading] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(sample.durationSeconds ?? 0);

  useEffect(() => {
    return () => {
      stopProgressLoop();
      stopNodes();
      audioContextRef.current?.close();
    };
  }, []);

  useEffect(() => {
    const nodes = nodesRef.current;
    if (!nodes) {
      return;
    }

    nodes.dryGain.gain.value = activeSource === "dry" ? 1 : 0;
    nodes.wetGain.gain.value = activeSource === "wet" ? 1 : 0;
  }, [activeSource]);

  function getAudioContext() {
    if (!audioContextRef.current) {
      audioContextRef.current = new AudioContext();
    }

    return audioContextRef.current;
  }

  async function loadBuffers() {
    if (dryBufferRef.current && wetBufferRef.current) {
      return;
    }

    setIsLoading(true);
    const audioContext = getAudioContext();
    const [dryArrayBuffer, wetArrayBuffer] = await Promise.all([
      fetch(sample.drySrc).then((response) => response.arrayBuffer()),
      fetch(sample.wetSrc).then((response) => response.arrayBuffer())
    ]);
    const [dryBuffer, wetBuffer] = await Promise.all([
      audioContext.decodeAudioData(dryArrayBuffer),
      audioContext.decodeAudioData(wetArrayBuffer)
    ]);

    dryBufferRef.current = dryBuffer;
    wetBufferRef.current = wetBuffer;
    setDuration(Math.min(dryBuffer.duration, wetBuffer.duration));
    setIsLoading(false);
  }

  function stopProgressLoop() {
    if (animationFrameRef.current !== null) {
      window.cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
  }

  function stopNodes() {
    const nodes = nodesRef.current;
    if (!nodes) {
      return;
    }

    isStoppingRef.current = true;
    nodes.drySource.onended = null;
    nodes.wetSource.onended = null;
    try {
      nodes.drySource.stop();
    } catch {
      // Buffer sources can only be stopped once.
    }
    try {
      nodes.wetSource.stop();
    } catch {
      // Buffer sources can only be stopped once.
    }
    nodes.drySource.disconnect();
    nodes.wetSource.disconnect();
    nodes.dryGain.disconnect();
    nodes.wetGain.disconnect();
    nodesRef.current = null;
    isStoppingRef.current = false;
  }

  function getCurrentOffset() {
    const audioContext = audioContextRef.current;
    if (!audioContext || !nodesRef.current) {
      return offsetRef.current;
    }

    const nextTime = audioContext.currentTime - startedAtRef.current;
    return Math.min(nextTime, duration || nextTime);
  }

  function startProgressLoop() {
    stopProgressLoop();

    const tick = () => {
      const nextTime = getCurrentOffset();
      setCurrentTime(nextTime);
      offsetRef.current = nextTime;
      animationFrameRef.current = window.requestAnimationFrame(tick);
    };

    animationFrameRef.current = window.requestAnimationFrame(tick);
  }

  function createNodes(offset: number) {
    const audioContext = getAudioContext();
    const dryBuffer = dryBufferRef.current;
    const wetBuffer = wetBufferRef.current;

    if (!dryBuffer || !wetBuffer) {
      return null;
    }

    const drySource = audioContext.createBufferSource();
    const wetSource = audioContext.createBufferSource();
    const dryGain = audioContext.createGain();
    const wetGain = audioContext.createGain();

    drySource.buffer = dryBuffer;
    wetSource.buffer = wetBuffer;
    dryGain.gain.value = activeSource === "dry" ? 1 : 0;
    wetGain.gain.value = activeSource === "wet" ? 1 : 0;

    drySource.connect(dryGain).connect(audioContext.destination);
    wetSource.connect(wetGain).connect(audioContext.destination);

    drySource.onended = () => {
      if (isStoppingRef.current) {
        return;
      }

      stopProgressLoop();
      stopNodes();
      offsetRef.current = 0;
      setCurrentTime(0);
      setIsPlaying(false);
    };

    drySource.start(0, offset);
    wetSource.start(0, offset);
    startedAtRef.current = audioContext.currentTime - offset;

    return { drySource, wetSource, dryGain, wetGain };
  }

  async function togglePlayback() {
    await loadBuffers();
    const audioContext = getAudioContext();
    await audioContext.resume();

    if (isPlaying) {
      const nextOffset = getCurrentOffset();
      stopProgressLoop();
      stopNodes();
      offsetRef.current = nextOffset;
      setCurrentTime(nextOffset);
      setIsPlaying(false);
      return;
    }

    const startOffset = Math.min(offsetRef.current, duration || offsetRef.current);
    nodesRef.current = createNodes(startOffset);
    setIsPlaying(true);
    startProgressLoop();
  }

  async function seekTo(value: number) {
    await loadBuffers();
    const boundedValue = Math.min(value, duration || value);
    offsetRef.current = boundedValue;
    setCurrentTime(boundedValue);

    if (!isPlaying) {
      return;
    }

    stopNodes();
    nodesRef.current = createNodes(boundedValue);
  }

  function setAudibleSource(source: "dry" | "wet") {
    setActiveSource(source);
  }

  return (
    <div className="wet-dry-player" data-playing={isPlaying ? "true" : "false"}>
      <div className="wet-dry-player__controls">
        <button
          type="button"
          className="wet-dry-player__play"
          onClick={togglePlayback}
          disabled={isLoading}
        >
          {isLoading ? "Load" : isPlaying ? "Pause" : "Play"}
        </button>

        <div className="wet-dry-player__timeline">
          <input
            type="range"
            min="0"
            max={duration || 0}
            step="0.01"
            value={Math.min(currentTime, duration || currentTime)}
            onChange={(event) => seekTo(Number(event.target.value))}
            aria-label={`Seek ${sample.label}`}
          />
          <span>
            {formatTime(currentTime)} / {formatTime(duration)}
          </span>
        </div>

        <div className="wet-dry-player__toggle" aria-label={`${sample.label} wet dry toggle`}>
          <button
            type="button"
            className={activeSource === "dry" ? "is-active" : ""}
            onClick={() => setAudibleSource("dry")}
          >
            Dry
          </button>
          <button
            type="button"
            className={activeSource === "wet" ? "is-active" : ""}
            onClick={() => setAudibleSource("wet")}
          >
            Wet
          </button>
        </div>
      </div>
    </div>
  );
}

export default WetDryAudioPlayer;
