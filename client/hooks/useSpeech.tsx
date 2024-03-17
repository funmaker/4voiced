import React, { useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { ImmutableRef } from "../helpers/utils";
import useRefCache from "./useRefCache";

const WORKER_COUNT = 5;
const STOP_FADE = 500;

export interface SpeechContextState {
  speak: (text: string, args?: GenerateSpeechArgs) => Promise<Emitter | null>;
  context: ImmutableRef<AudioContext | null>;
  status: AudioStatus;
  workerStatus: WorkerStatus[];
}

export const SpeechContext = React.createContext<SpeechContextState | null>(null);

function toStatus(status: AudioContextState) {
  switch(status) {
    case "closed": return AudioStatus.CLOSED;
    case "running": return AudioStatus.RUNNING;
    case "suspended": return AudioStatus.SUSPENDED;
    default: return AudioStatus.NO_AUDIO;
  }
}

export interface SpeechProviderProps {
  workers?: number;
  children: React.ReactNode;
}

export function SpeechProvider({ workers, children }: SpeechProviderProps) {
  const [audioStatus, setAudioStatus] = useState(AudioStatus.NO_AUDIO);
  const audioContext = useRef<AudioContext | null>(null);
  const { dispatchJob, workerStatus } = useWorkers();
  
  const speak = useCallback(async (text: string, args?: GenerateSpeechArgs) => {
    if(!audioContext.current) return null;
    
    const arrayBuffer = await dispatchJob(text, args);
    if(!arrayBuffer) return null;
    
    const audioBuffer = await audioContext.current.decodeAudioData(arrayBuffer);
    const panner = audioContext.current.createPanner();
    const gain = audioContext.current.createGain();
    const audioSource = audioContext.current.createBufferSource();
    audioSource.buffer = audioBuffer;
    audioSource.connect(gain);
    gain.connect(panner);
    panner.connect(audioContext.current.destination);
    panner.panningModel = "HRTF";
    
    const emitter: Emitter = {
      context: audioContext.current,
      source: audioSource,
      panner,
      gain,
      playing: false,
      stopping: false,
      play: (time = 0) => {
        if(!audioContext.current) return;
        if(time < 0) audioSource.start(audioContext.current.currentTime, -time);
        else audioSource.start(audioContext.current.currentTime + time);
        emitter.playing = true;
      },
      stop: () => {
        if(!audioContext.current) return;
        if(emitter.stopping) return;
        emitter.stopping = true;
        
        gain.gain.setValueCurveAtTime([1, 0], audioContext.current.currentTime, STOP_FADE / 1000);
        
        setTimeout(() => {
          emitter.playing = false;
          panner.disconnect();
          audioSource.disconnect();
        }, STOP_FADE);
      },
    };
    
    audioSource.addEventListener("ended", () => emitter.stop());
    
    return emitter;
  }, [dispatchJob]);
  
  useEffect(() => {
    const context = audioContext.current = new AudioContext();
    
    context.addEventListener("statechange", () => setAudioStatus(toStatus(context.state)));
    setAudioStatus(toStatus(context.state));
    
    const doResume = () => context.resume();
    if(context.state === "suspended") document.addEventListener("click", doResume, { once: true });
    
    return () => {
      document.removeEventListener("click", doResume);
      context.close().catch(console.error);
    };
  }, []);
  
  const state = useMemo(() => ({
    speak,
    context: audioContext,
    status: audioStatus,
    workerStatus,
  }), [speak, audioContext, audioStatus, workerStatus]);
  
  return (
    <SpeechContext.Provider value={state}>
      {children}
    </SpeechContext.Provider>
  );
}

function useWorkers() {
  const [workerStatus, setWorkerStatus] = useState<WorkerStatus[]>([]);
  const workersStatusRef = useRefCache(workerStatus);
  const workersRef = useRef<Worker[]>([]);
  const jobsRef = useRef<Array<Job | null>>([]);
  
  const updateStatus = useCallback((id: number, status: WorkerStatus) => {
    setWorkerStatus(statuses => {
      statuses = [...statuses];
      statuses[id] = status;
      return statuses;
    });
  }, []);
  
  useEffect(() => {
    const workers = workersRef.current = new Array<Worker>();
    
    for(let i = 0; i < WORKER_COUNT; i++) {
      const worker = new Worker(new URL('../helpers/audioWorker.ts', import.meta.url));
      
      worker.addEventListener("error", event => {
        console.error(event.error);
        updateStatus(i, WorkerStatus.ERROR);
        
        if(jobsRef.current[i]) {
          jobsRef.current[i]?.reject(event.error);
          jobsRef.current[i] = null;
        }
      });
      
      worker.addEventListener("message", event => {
        updateStatus(i, WorkerStatus.IDLE);
        
        if(jobsRef.current[i]) {
          jobsRef.current[i]?.resolve(event.data);
          jobsRef.current[i] = null;
        }
      });
      
      workers.push(worker);
    }
    
    setWorkerStatus(() => workers.map(() => WorkerStatus.IDLE));
    jobsRef.current = workers.map(() => null);
    
    return () => {
      for(const jobs of jobsRef.current) {
        jobs?.reject(new Error("Terminated"));
      }
      jobsRef.current = [];
      
      for(const worker of workers) {
        worker.terminate();
      }
      workersRef.current = [];
      
      setWorkerStatus(() => []);
    };
  }, [updateStatus]);
  
  const dispatchJob = useCallback(async (text: string, args?: GenerateSpeechArgs) => {
    const free = workersStatusRef.current.indexOf(WorkerStatus.IDLE);
    if(free < 0 || jobsRef.current[free]) return null;
    
    updateStatus(free, WorkerStatus.BUSY);
    
    workersRef.current[free].postMessage({ text, args });
    
    let resolve!: (data: ArrayBuffer | null) => void;
    let reject!: (err: any) => void;
    const promise = new Promise<ArrayBuffer | null>((res, rej) => { resolve = res; reject = rej; });
    
    jobsRef.current[free] = { promise, resolve, reject };
    
    return await promise;
  }, [updateStatus, workersStatusRef]);
  
  return { workerStatus, dispatchJob };
}

export default function useSpeech() {
  const context = useContext(SpeechContext);
  if(!context) throw new Error("useSpeech must be used within Speech context");
  return context;
}

interface Job {
  promise: Promise<ArrayBuffer | null>;
  resolve: (arr: ArrayBuffer | null) => void;
  reject: (err: any) => void;
}

export interface Emitter {
  context: AudioContext;
  source: AudioBufferSourceNode;
  panner: PannerNode;
  gain: GainNode;
  playing: boolean;
  stopping: boolean;
  play: (offset?: number) => void;
  stop: () => void;
}

export enum AudioStatus {
  NO_AUDIO = "noAudio",
  SUSPENDED = "suspended",
  RUNNING = "running",
  CLOSED = "closed",
}

export enum WorkerStatus {
  IDLE = "idle",
  BUSY = "busy",
  ERROR = "error",
}
