import { useEffect, useRef, useState } from 'react';
import { collect, getMeta, type Meta, type Sample } from '../lib/stats.js';

export interface History {
  cpu: number[];
  gpu: number[];
  rx: number[];
  tx: number[];
}

const CAP = 240;
const push = (arr: number[], v: number) => [...arr, v].slice(-CAP);

export function useStats(intervalMs = 1000) {
  const [sample, setSample] = useState<Sample | null>(null);
  const [meta, setMeta] = useState<Meta | null>(null);
  const [hist, setHist] = useState<History>({ cpu: [], gpu: [], rx: [], tx: [] });
  const [paused, setPaused] = useState(false);
  const pausedRef = useRef(paused);
  pausedRef.current = paused;

  useEffect(() => {
    let stopped = false;
    let busy = false;
    let localMeta: Meta | null = null;

    const tick = async () => {
      if (busy || pausedRef.current || stopped) return;
      busy = true;
      try {
        if (!localMeta) {
          localMeta = await getMeta();
          if (!stopped) setMeta(localMeta);
        }
        const s = await collect(localMeta);
        if (stopped) return;
        setSample(s);
        setHist((h) => ({
          cpu: push(h.cpu, s.cpu.currentLoad),
          gpu: s.gpu.util != null ? push(h.gpu, s.gpu.util) : h.gpu,
          rx: push(h.rx, s.net?.rx_sec ?? 0),
          tx: push(h.tx, s.net?.tx_sec ?? 0),
        }));
      } catch {
        // keep last good sample on transient errors
      } finally {
        busy = false;
      }
    };

    void tick();
    const id = setInterval(() => void tick(), intervalMs);
    return () => {
      stopped = true;
      clearInterval(id);
    };
  }, [intervalMs]);

  return { sample, meta, hist, paused, setPaused };
}
