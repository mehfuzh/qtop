/** Movable-tile layout: six fixed slots, tiles can be swapped between them.
 *
 * Slot geometry (matches Dashboard):
 *   0: top-left (large)      1: top-right upper
 *   2: top-right lower       3: mid-left
 *   4: mid-right             5: bottom (full width)
 */

export type TileId = 'cpu' | 'gpu' | 'mem' | 'net' | 'disk' | 'proc';
export type Dir = 'up' | 'down' | 'left' | 'right';

export const DEFAULT_LAYOUT: TileId[] = ['cpu', 'gpu', 'mem', 'net', 'disk', 'proc'];
export const SLOT_COUNT = DEFAULT_LAYOUT.length;

export interface TileState {
  /** slot index -> tile occupying it */
  layout: TileId[];
  /** currently selected slot */
  sel: number;
}

/** Spatial neighbours of each slot; null = no slot in that direction. */
const NEIGHBORS: Record<Dir, (number | null)[]> = {
  up:    [null, null, 1,    0,    2,    3],
  down:  [3,    2,    4,    5,    5,    null],
  left:  [null, 0,    0,    null, 3,    null],
  right: [1,    null, null, 4,    null, null],
};

/** Swap the selected tile with its neighbour in `dir`; selection follows it.
 *  Returns the same state when there is no neighbour (edge of the grid). */
export function moveTile(state: TileState, dir: Dir): TileState {
  const target = NEIGHBORS[dir][state.sel];
  if (target == null) return state;
  const layout = state.layout.slice();
  [layout[state.sel], layout[target]] = [layout[target], layout[state.sel]];
  return { layout, sel: target };
}

/** Cycle the selection through the slots (Tab / Shift+Tab). */
export function cycleSelection(state: TileState, backwards = false): TileState {
  const step = backwards ? SLOT_COUNT - 1 : 1;
  return { ...state, sel: (state.sel + step) % SLOT_COUNT };
}
