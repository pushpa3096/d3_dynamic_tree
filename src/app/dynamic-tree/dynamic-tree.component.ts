import { Component, ViewEncapsulation, OnInit } from '@angular/core';
import * as d3 from 'd3';

// import * as d3 from 'd3-selection';
import * as d3Scale from 'd3-scale';
import * as d3Shape from 'd3-shape';
import * as d3Array from 'd3-array';
import * as d3Axis from 'd3-axis';

import { TREEDATA } from '../shared';

@Component({
  selector: 'app-dynamic-tree',
  templateUrl: './dynamic-tree.component.html',
  styleUrls: ['./dynamic-tree.component.css']
})
export class DynamicTreeComponent implements OnInit {

  title = 'Dynamic Tree';

  private margin = {top: 20, right: 20, bottom: 30, left: 50};
  private width: number;
  private height: number;
  private x: any;
  private y: any;
  private svg: any;
  private line: d3Shape.Line<[number, number]>;
  private i = 0;
	private duration = 750;
	private root;
  // private tree:any;
  private treeLayout = d3.tree().size([this.height, this.width]);
  private diagonal:any;

  constructor() {
    this.width = 900 - this.margin.left - this.margin.right;
    this.height = 500 - this.margin.top - this.margin.bottom;
    this.initChart();
  }

  ngOnInit() {
  }
  private initChart(): void {
    this.diagonal = d3.svg.diagonal()
	.projection(function(d) { return [d.y, d.x]; });
  
  this.svg = d3.select("body").append("svg")
	.attr("width", this.width + this.margin.right + this.margin.left)
	.attr("height", this.height + this.margin.top + this.margin.bottom)
  .append("g")
	.attr("transform", "translate(" + this.margin.left + "," + this.margin.top + ")");

  this.root = TREEDATA[0];
  
  this.root.x0 = this.height / 2;
  this.root.y0 = 0;
   
  // update(this.root);
  d3.select(self.frameElement).style("height", "500px");
}

private update(source) {

  // Compute the new tree layout.
  var nodes = this.treeLayout.nodes(this.root).reverse(),
	  links = this.treeLayout.links(nodes);

  // Normalize for fixed-depth.
  nodes.forEach(function(d) { d.y = d.depth * 180; });

  // Update the nodes…
  var node = this.svg.selectAll("g.node")
	  .data(nodes, function(d) { return d.id || (d.id = (++this.i)); });

  // Enter any new nodes at the parent's previous position.
  var nodeEnter = node.enter().append("g")
	  .attr("class", "node")
	  .attr("transform", function(d) { return "translate(" + source.y0 + "," + source.x0 + ")"; })
	  .on("click", this.click);

  nodeEnter.append("circle")
	  .attr("r", 1e-6)
	  .style("fill", function(d) { return d._children ? "lightsteelblue" : "#fff"; });

  nodeEnter.append("text")
	  .attr("x", function(d) { return d.children || d._children ? -13 : 13; })
	  .attr("dy", ".35em")
	  .attr("text-anchor", function(d) { return d.children || d._children ? "end" : "start"; })
	  .text(function(d) { return d.name; })
	  .style("fill-opacity", 1e-6);

  // Transition nodes to their new position.
  var nodeUpdate = node.transition()
	  .duration(this.duration)
	  .attr("transform", function(d) { return "translate(" + d.y + "," + d.x + ")"; });

  nodeUpdate.select("circle")
	  .attr("r", 10)
	  .style("fill", function(d) { return d._children ? "lightsteelblue" : "#fff"; });

  nodeUpdate.select("text")
	  .style("fill-opacity", 1);

  // Transition exiting nodes to the parent's new position.
  var nodeExit = node.exit().transition()
	  .duration(this.duration)
	  .attr("transform", function(d) { return "translate(" + source.y + "," + source.x + ")"; })
	  .remove();

  nodeExit.select("circle")
	  .attr("r", 1e-6);

  nodeExit.select("text")
	  .style("fill-opacity", 1e-6);

  // Update the links…
  var link = this.svg.selectAll("path.link")
	  .data(links, function(d) { return d.target.id; });

  // Enter any new links at the parent's previous position.
  link.enter().insert("path", "g")
	  .attr("class", "link")
	  .attr("d", function(d) {
		var o = {x: source.x0, y: source.y0};
		return this.diagonal({source: o, target: o});
	  });

  // Transition links to their new position.
  link.transition()
	  .duration(this.duration)
	  .attr("d", this.diagonal);

  // Transition exiting nodes to the parent's new position.
  link.exit().transition()
	  .duration(this.duration)
	  .attr("d", function(d) {
		var o = {x: source.x, y: source.y};
		return this.diagonal({source: o, target: o});
	  })
	  .remove();

  // Stash the old positions for transition.
  nodes.forEach(function(d) {
	d.x0 = d.x;
	d.y0 = d.y;
  });
}

// Toggle children on click.
private click(d) {
  if (d.children) {
	d._children = d.children;
	d.children = null;
  } else {
	d.children = d._children;
	d._children = null;
  }
  this.update(d);

}



}
