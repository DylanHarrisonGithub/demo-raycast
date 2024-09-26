import { Edge2D } from "./elements/edge";
import { Ball } from "./elements/ball";

export interface Actor {
  attributes: { [key: string]: string | number | boolean | null },
  move: (dt: number) => void,
  applyForce: (f: Edge2D) => void,

  timeToCollideWithEdge(e: Edge2D): [number, number],
  timeToCollideWithBall(b: Ball): [number, number],
  timeToCollideWithPoint(p: {x: number, y: number}): [number, number],
  deflectWithEdge(e: Edge2D): void,
  deflectWithBall(b: Ball): void,
  deflectWithPoint(p: {x: number, y: number}): void
}

export class Engine {

  state: {
    numElements: number,
    actors: Actor[],
    elements: Array<Edge2D>
  }

  readonly minTime: number = 0.000001; //Number.MIN_VALUE;

  constructor(actors: Actor[], elements: Array<Edge2D>) { 
    let numElements = 0;
    actors.forEach(a => { a.attributes.id = (numElements++).toString() });
    elements.forEach(a => { a.attributes.id = (numElements++).toString() });
    this.state = {numElements: numElements, actors: actors, elements: elements};
  }

  getActors(): Actor[] { return this.state.actors; }
  getElements(): Array<Edge2D> { return this.state.elements; }
  pushActor(a: Actor) { a.attributes.id = this.state.numElements++; this.state.actors.push(a); }
  pushElement(e: Edge2D) { e.attributes.id = this.state.numElements++; this.state.elements.push(e); }
  popActorById(id: string): Actor | undefined { return this.state.actors.filter(a => a.attributes.id === id)[0]; }
  popElementById(id: string): Edge2D | undefined { return this.state.elements.filter(e => e.attributes.id === id)[0]; }

  private determineNextCollisions(): {
    t: number,
    Object1:  Edge2D | Ball | {x: number, y: number} | null,
    Object2:  Edge2D | Ball | {x: number, y: number} | null
  }[] {
    let collisions: {
      t: number,
      Object1:  Edge2D | Ball | {x: number, y: number} | null,
      Object2:  Edge2D | Ball | {x: number, y: number} | null
    }[] = [{
      t: 999999999,
      Object1: null,
      Object2: null
    }];

    this.state.actors.forEach((a, i) => {

      for (let j = i+1; j < this.state.actors.length; j++) {
        let t = Math.min(...a.timeToCollideWithBall( (<Ball>this.state.actors[j]) ));
        if (t === collisions[0].t) {
          collisions.push({
            t: t,
            Object1: <Ball>a,
            Object2: (<Ball>this.state.actors[j])
          });
        }
        if (t < collisions[0].t && (t > this.minTime)) { // and (t > 0.00001)   
          collisions = [{
            t: t,
            Object1: <Ball>a,
            Object2: (<Ball>this.state.actors[j])
          }];
        }
      }

      this.state.elements.forEach(e => {
        let t = Math.min(...a.timeToCollideWithEdge(<Edge2D>e));
        if (t === collisions[0].t) {
          collisions.push({
            t: t,
            Object1: <Ball>a,
            Object2: <Edge2D>e
          });
        }
        if (t < collisions[0].t && (t > this.minTime)) { //and (t > 0.00001)
          collisions = [{
            t: t,
            Object1: <Ball>a,
            Object2: <Edge2D>e
          }];
        }

        t = Math.min(...a.timeToCollideWithPoint((<Edge2D>e).getP1()));
        if (t === collisions[0].t) {
          collisions.push({
            t: t,
            Object1: <Ball>a,
            Object2: (<Edge2D>e).getP1()
          });
        }
        if (t < collisions[0].t && (t > this.minTime)) { //and (t > 0.00001)
          collisions = [{
            t: t,
            Object1: <Ball>a,
            Object2: (<Edge2D>e).getP1()
          }];
        }
        
        t = Math.min(...a.timeToCollideWithPoint((<Edge2D>e).getP2()));
        if (t === collisions[0].t) {
          collisions.push({
            t: t,
            Object1: <Ball>a,
            Object2: (<Edge2D>e).getP2()
          });
        }
        if (t < collisions[0].t && (t > this.minTime)) { //and (t > 0.00001)
          collisions = [{
            t: t,
            Object1: <Ball>a,
            Object2: (<Edge2D>e).getP2()
          }];
        }
      })
    });

    return collisions;
  }

  moveActors(dt: number): void {
  
    let nextCollisions = this.determineNextCollisions();
  
    while (nextCollisions[0].t < dt && nextCollisions[0].t > 0) {
  
      this.state.actors.forEach(v => v.move(nextCollisions[0].t) );
  
      nextCollisions.forEach(nextCollision => {
        if (nextCollision.Object2 instanceof Ball) {
          (<Ball>nextCollision.Object1).deflectWithBall(nextCollision.Object2);
        } else {
          if (nextCollision.Object2 instanceof Edge2D) {
            //(<Ball>nextCollision.Object1).deflectWithEdge((<Edge2D>nextCollision.Object2));
            (<Ball>nextCollision.Object1).slideOnEdge((<Edge2D>nextCollision.Object2));
          } else {
            if (nextCollision.Object2?.x && nextCollision.Object2?.y) {
              (<Ball>nextCollision.Object1).deflectWithPoint((<{x: number, y: number}>nextCollision.Object2));
            }
          }
        }
      });
      
      dt -= nextCollisions[0].t;
      nextCollisions = this.determineNextCollisions();
    }
    this.state.actors.forEach(a => a.move(dt));
    
  }
}