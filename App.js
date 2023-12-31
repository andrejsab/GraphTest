import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { Svg, Circle, Text, Line, G } from 'react-native-svg';
import * as d3 from 'd3';
import { Platform } from 'react-native';
const height= 500
const width= 960
const data = {
  name: "flare",
  children: [{
      name: "analytics",
      children: [{
          name: "cluster",
          children: [{
              name: "AgglomerativeCluster",
              size: 3938
          }, {
              name: "CommunityStructure",
              size: 3812
          }, {
              name: "HierarchicalCluster",
              size: 6714
          }, {
              name: "MergeEdge",
              size: 743
          }]
      }, {
          name: "graph",
          children: [{
              name: "BetweennessCentrality",
              size: 3534
          }, {
              name: "LinkDistance",
              size: 5731
          }, {
              name: "MaxFlowMinCut",
              size: 7840
          }, {
              name: "ShortestPaths",
              size: 5914
          }, {
              name: "SpanningTree",
              size: 3416
          }]
      }, {
          name: "optimization",
          children: [{
              name: "AspectRatioBanker",
              size: 7074
          }]
      }]
  }]
};

const flattenData = (data) => {
  let nodes = [];
  let i = 0;

  function recurse(node) {
    if (node.children) node.children.forEach(recurse);
    if (!node.id) node.id = ++i;
    nodes.push(node);
  }

  recurse(data);
  return nodes;
};

const Graph = () => {
  const [nodes, setNodes] = useState([]);
  const [links, setLinks] = useState([]);

// Define a force to keep nodes within a bounding box


const updateGraph = () => {
  const flatNodes = flattenData(data);
  // Create links based on parent-child relationships
  const createdLinks = flatNodes.map((node) => node.children?.map((child) => ({ source: node, target: child })) ?? []).flat();

  const simulation = d3.forceSimulation(flatNodes)
  .force('link', d3.forceLink(createdLinks).distance(80))
  .force('charge', d3.forceManyBody().strength(-120))
  .force('center', d3.forceCenter(width / 2, height / 2))
  .force('boundary', boundingBoxForce)
  .on('tick', () => {
    setNodes([...flatNodes]);
    setLinks([...createdLinks]);
  });
  function boundingBoxForce() {
    for (const node of flatNodes) {
      node.x = Math.max(30, Math.min(width - 30, node.x));
      node.y = Math.max(30, Math.min(height - 30, node.y));
    }
  } 
};


const handleNodeClick = (node) => {
  console.log("Node clicked", node);
  if (node.children) {
    node._children = node.children;
    node.children = null;
  } else {
    node.children = node._children;
    node._children = null;
  }
  updateGraph();
};

useEffect(() => {
  updateGraph();
}, []);

  const nodeColor = (node) => {
    return node._children ? "#3182bd" : node.children ? "#c6dbef" : "#fd8d3c";
  };

  return (
    <View style={styles.container}>
      <Svg height={height} width={width}>
        {/* Render links (edges) */}
        {links.map((link, index) => (
          <Line
            key={index}
            x1={link.source.x}
            y1={link.source.y}
            x2={link.target.x}
            y2={link.target.y}
            stroke="#9ecae1"
            strokeWidth="1.5"
          />
        ))}
  
        {/* Render nodes */}
        {nodes.map((node, index) => {
          const commonProps = {
            r: Math.sqrt(node.size) / 5 || 10.5,
            fill: nodeColor(node),
            stroke: "#3182bd",
            strokeWidth: "1.5",
          };
          return (
            <G key={index} transform={`translate(${node.x}, ${node.y})`}>
              {Platform.OS === 'web' ? (
                <G onClick={() => handleNodeClick(node)}>
                  <Circle {...commonProps} />
                </G>
              ) : (
                <Circle {...commonProps} onPress={() => handleNodeClick(node)} />
              )}
              <Text
                dy="-10"  // Adjust this value to your requirement
                fontSize="10"
                textAnchor="middle"
              >
                {node.name}
              </Text>
            </G>
          );
        })}
      </Svg>
      {/* Debugging Pressable */}
      <Pressable onPress={() => console.log("Clicked!")}>
        <View style={{ width: 50, height: 50, backgroundColor: 'red' }} />
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default Graph;
