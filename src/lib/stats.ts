import si from 'systeminformation';
import type { Systeminformation as SI } from 'systeminformation';
import { exec } from 'node:child_process';
import { promisify } from 'node:util';

const execAsync = promisify(exec);

export interface GpuStats {
  name: string;
  util: number | null;
  vramUsed: number | null;
  vramTotal: number | null;
}

export interface Sample {
  cpu: SI.CurrentLoadData;
  mem: SI.MemData;
  net: SI.NetworkStatsData | null;
  disk: SI.FsSizeData | null;
  fsio: SI.FsStatsData | null;
  procs: SI.ProcessesProcessData[];
  gpu: GpuStats;
}

export interface Meta {
  cpuBrand: string;
  gpuName: string;
  iface: string;
}

async function gpuStats(name: string): Promise<GpuStats> {
  const base: GpuStats = { name, util: null, vramUsed: null, vramTotal: null };
  try {
    if (process.platform === 'darwin') {
      // Apple Silicon / macOS: IOAccelerator exposes live utilization, no sudo needed.
      const { stdout } = await execAsync('ioreg -r -d 1 -c IOAccelerator', { timeout: 2000 });
      const matches = [...stdout.matchAll(/"Device Utilization %"\s*=\s*(\d+)/g)];
      if (matches.length > 0) {
        base.util = Math.max(...matches.map((m) => Number(m[1])));
      }
      return base;
    }
    // Linux/Windows with NVIDIA:
    const { stdout } = await execAsync(
      'nvidia-smi --query-gpu=utilization.gpu,memory.used,memory.total --format=csv,noheader,nounits',
      { timeout: 2000 }
    );
    const [util, used, total] = stdout.trim().split('\n')[0].split(',').map((s) => Number(s.trim()));
    if (!Number.isNaN(util)) base.util = util;
    if (!Number.isNaN(used)) base.vramUsed = used * 1024 * 1024;
    if (!Number.isNaN(total)) base.vramTotal = total * 1024 * 1024;
    return base;
  } catch {
    return base;
  }
}

export async function getMeta(): Promise<Meta> {
  const [cpu, graphics, iface] = await Promise.all([
    si.cpu().catch(() => null),
    si.graphics().catch(() => null),
    si.networkInterfaceDefault().catch(() => ''),
  ]);
  return {
    cpuBrand: cpu ? `${cpu.manufacturer} ${cpu.brand}`.trim() : 'CPU',
    gpuName: graphics?.controllers?.[0]?.model ?? 'GPU',
    iface: typeof iface === 'string' ? iface : '',
  };
}

export async function collect(meta: Meta): Promise<Sample> {
  const [cpu, mem, netArr, fsArr, fsio, procData, gpu] = await Promise.all([
    si.currentLoad(),
    si.mem(),
    si.networkStats(meta.iface || undefined).catch(() => []),
    si.fsSize().catch(() => []),
    si.fsStats().catch(() => null),
    si.processes().catch(() => null),
    gpuStats(meta.gpuName),
  ]);

  const disk = fsArr.find((f) => f.mount === '/') ?? fsArr[0] ?? null;
  const procs = (procData?.list ?? [])
    .slice()
    .sort((a, b) => b.cpu - a.cpu || b.mem - a.mem);

  return {
    cpu,
    mem,
    net: netArr[0] ?? null,
    disk,
    fsio,
    procs,
    gpu,
  };
}
