export class NetworkDiagramConfig {
  xPadding: number;
  yPadding: number;
  width: number;
  height: number;
  abbreviatedMiddleNodes: boolean;
}

export class ElementData {
  x: number;
  y: number;
  width: number;
  height: number;
  text: string;
  displayText: string;
  color: string;
  source: LightNode;
}

export class LineData {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
}

export class ReturnData {
  bottomY: number;
  element: ElementData;
}

export class LightNode {
  Name: string;
  Badge: string;
  Next: LightNode[];
  Tag: any;
  constructor(name: string) {
    this.Name = name;
    this.Next = new Array<LightNode>();
    this.Badge = undefined;
  }

  get depth(): number {
    if (this.Next.length === 0) {
      return 1;
    } else {
      return this.Next.reduce( (p, c) => { return (p.depth > c.depth ) ? p : c; } ).depth + 1;
    }
  }

  get nextCount(): number {
    return this.Next.length;
  }

  get totalLeafs(): number {
    if (this.Next.length === 0){
      return 1;
    } else {
      return this.Next.map(x => x.totalLeafs).reduce((s, c) => s + c);
    }
  }
}