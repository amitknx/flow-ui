/**
 * Common React Flow type definitions
 * Consolidated from duplicate definitions across components
 */

export interface Node<T = any> {
  id: string;
  type?: string;
  position: { x: number; y: number };
  data: T;
  selected?: boolean;
  dragging?: boolean;
  dragHandle?: string;
  width?: number;
  height?: number;
  parentNode?: string;
  zIndex?: number;
  extent?: 'parent' | [[number, number], [number, number]];
  expandParent?: boolean;
  positionAbsolute?: { x: number; y: number };
  ariaLabel?: string;
  focusable?: boolean;
  resizing?: boolean;
  selectable?: boolean;
  connectable?: boolean;
  deletable?: boolean;
  style?: React.CSSProperties;
  className?: string;
  sourcePosition?: any;
  targetPosition?: any;
  hidden?: boolean;
  actionHandler?: any;
}

export interface Edge {
  id: string;
  source: string;
  target: string;
  sourceHandle?: string;
  targetHandle?: string;
  type?: string;
  animated?: boolean;
  hidden?: boolean;
  deletable?: boolean;
  focusable?: boolean;
  selectable?: boolean;
  className?: string;
  style?: React.CSSProperties;
  ariaLabel?: string;
  interactionWidth?: number;
  zIndex?: number;
  label?: string | React.ReactNode;
  labelStyle?: React.CSSProperties;
  labelShowBg?: boolean;
  labelBgStyle?: React.CSSProperties;
  labelBgPadding?: [number, number];
  labelBgBorderRadius?: number;
  markerStart?: string;
  markerEnd?: string | { type: any; color?: string };
  pathOptions?: any;
  data?: any;
}

export interface Connection {
  source: string;
  target: string;
  sourceHandle?: string;
  targetHandle?: string;
}
