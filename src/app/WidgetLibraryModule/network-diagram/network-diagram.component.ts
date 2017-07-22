import { Component, ElementRef, Input, Output, EventEmitter, OnChanges } from '@angular/core';
import { Params } from '@angular/router';

import { BaseWidget } from 'app/common/baseComponents/BaseWidget/BaseWidget.component';

import { NetworkDiagramConfig, ElementData, LineData, ReturnData, LightNode } from './helper-classes';

@Component({
  selector: 'app-network-diagram',
  templateUrl: './network-diagram.component.html',
  styleUrls: ['./network-diagram.component.css']
})
export class NetworkDiagramComponent extends BaseWidget implements OnChanges {

  @Input() rootNode: LightNode;
  @Output() nodeSelect: EventEmitter<LightNode> = new EventEmitter<LightNode>();

  svgHeight = 20;
  canvas: HTMLCanvasElement = undefined;
  config: NetworkDiagramConfig;
  rectangles: ElementData[];
  lines: LineData[];

  onInitialize() {

    if (this.canvas === undefined) {
      this.canvas = document.createElement('canvas');
      this.svgHeight = 20;
      this.rectangles = [];
      this.lines = [];
      this.config = {
        xPadding: 17,
        yPadding: 5,
        width: 310,
        height: 18,
        abbreviatedMiddleNodes: false
      };
      this.ngOnChanges();
    }
  }

  RectangleFactory(node: LightNode): ElementData {
    const data: ElementData = {
      x: 0, y: 0,
      width: this.config.width, height: this.config.height,
      text: node.Name, displayText: node.Name,
      color: 'blue',
      source: node,
    };
    return data;
  }

  selectNode(node: LightNode) {
    this.nodeSelect.emit(node);
    // this.appStateService.SelectNodeByName(name);
  }

  CreateRectangles(node: LightNode, rect: ElementData[], lines: LineData[], top: number, left: number): ReturnData {
    const data = this.RectangleFactory(node);

    if (node.Next.length > 0 && this.config.abbreviatedMiddleNodes) {
      data.width = 16;
      data.displayText = '';
    } else {
      data.width = this.getTextWidth(node.Name, '14pt Helvetica Neue') + 5;
    }

    if (node === this.rootNode) {
      data.color = 'white';
    } else if (node.Next.length === 0) {
      data.color = 'rgb(150,150,150)';
    }
    const heightOccupied = node.totalLeafs * data.height + ((node.totalLeafs - 1) * this.config.yPadding);

    // console.log(`${heightOccupied} = ${node.totalLeafs} * ${data.height} + ((${node.totalLeafs} - 1) * ${this.config.yPadding});`);

    data.y  = top + (heightOccupied / 2) - (data.height / 2);
    data.x   = left + 5;
    rect.push(data);

    // console.log(`heightOccupied->${heightOccupied} data->${JSON.stringify(data)} totalLeafs->${node.totalLeafs}`);
    let nextY = top;
    node.Next.forEach( n => {
      const returnData = this.CreateRectangles(n, rect, lines, nextY, left + this.config.xPadding + data.width);
      nextY = returnData.bottomY + this.config.yPadding;

      const newLineData = {
          x1: data.x + data.width,
          x2: returnData.element.x,

          y1: data.y + this.config.height / 2,
          y2: returnData.element.y + this.config.height / 2 };

      if (this.svgHeight < newLineData.y2 + this.config.height ) {
        this.svgHeight = newLineData.y2 + this.config.height;
      }
      lines.push(newLineData);

    });
    return { bottomY: top + heightOccupied, element: data };
  }



  getTextWidth(text, font) {
    // re-use canvas object for better performance
    const context = this.canvas.getContext('2d');
    context.font = font;
    const metrics = context.measureText(text);
    return metrics.width;
  }


  ngOnChanges() {
    if (this.config === undefined) {
      return;
    }
    const localRectangles: any[] = [];
    const localLines: any[] = [];
    this.svgHeight = 0;
    this.CreateRectangles(this.rootNode, localRectangles, localLines, 5, 5);
    this.rectangles = [... localRectangles];
    this.lines = [... localLines];
  }

}
