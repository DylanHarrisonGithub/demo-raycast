import { TouchPad } from './components/touchpad';
import { Engine } from './engine';
import { Ball } from './elements/ball';
import { Edge2D } from './elements/edge';

interface UI {
  canvas: HTMLCanvasElement
  controlPanel: HTMLDivElement
  overlay: HTMLDivElement
  outputPanel: HTMLDivElement
  touchpad1: TouchPad
  touchpad2: TouchPad
}
interface State {
  engine: Engine
  virtualScreen: Edge2D
  playerBall: Ball
  playerDirection: Edge2D
  velocity: Edge2D
  angularVelocity: number
  mouseAngularVelocity: number
  walls: Array<Edge2D>
  ui: UI
  ctx: CanvasRenderingContext2D
}

customElements.define('touch-pad', TouchPad);

function draw(state: State) {
  state.ctx.clearRect(0,0,state.ui.canvas.width, state.ui.canvas.height);
  //floor and celinig
  for (let h = 0; h < state.ui.canvas.height*0.5; h++) {
    let t = h/(state.ui.canvas.height*0.5);
    state.ctx.strokeStyle = darken('#0000ffff', t);
    state.ctx.beginPath(); state.ctx.moveTo(0,h); state.ctx.lineTo(state.ui.canvas.width, h); state.ctx.stroke();
    state.ctx.closePath();
  }
  for (let h = 0; h <= state.ui.canvas.height*0.5; h++) {
    let t = h/(state.ui.canvas.height*0.5);
    state.ctx.strokeStyle = darken('#ffaa00ff', t);
    state.ctx.beginPath(); state.ctx.moveTo(0,state.ui.canvas.height-h); state.ctx.lineTo(state.ui.canvas.width, state.ui.canvas.height-h); state.ctx.stroke();
    state.ctx.closePath();
  }

  let reachRays: Array<Edge2D> = [];
  for (let x = 0; x < state.ui.canvas.width; x++) {
    let t = x/state.ui.canvas.width;
    let closest: { d: number, c: string, ray: Edge2D | null } = { d: 99999999, c: '', ray: null };
    let p2 = state.virtualScreen.getParametricPoint(t);
    let ray = new Edge2D(state.playerDirection.getP1(), p2); //playerDirection.repositioned(p2);
    state.walls.forEach(w => {
      let i = ray.intersection(w);
      let i2 = w.intersection(ray);
      if (isFinite(i) && i > 0 && isFinite(i2) && i2 >= 0 && i2 <= 1) {
        let rray = ray.reached2(w);
        let rraymm = rray.mm();
        if (rraymm < closest.d) {
          closest.d = rraymm; closest.c = <string>w.attributes.color; closest.ray = rray;
          if (i2 == 0 || i2 == 1) {
            closest.c = 'black';
          }
        }
      }
    });
    if (closest.c !== '') {
      closest.d = Math.sqrt(closest.d);
      let d = 0.5*state.ui.canvas.height/closest.d;// - 6*closest.wwd;
      let t = (1-1/(closest.d))*0.5;
      if (t > 1) t = 1;
      state.ctx.strokeStyle = darken(closest.c, t); //.slice(0,-2);
      state.ctx.beginPath();
      state.ctx.moveTo(x, 0.5*state.ui.canvas.height - d);
      state.ctx.lineTo(x, 0.5*state.ui.canvas.height + d);
      state.ctx.stroke();
      reachRays.push(<Edge2D>closest.ray);
    }
  }
  // state.ctx.strokeStyle = 'red';
  // state.ctx.beginPath();
  // state.ctx.moveTo(state.playerDirection.getP1().x + state.ui.canvas.width*0.5, state.playerDirection.getP1().y + state.ui.canvas.height*0.5);
  // state.ctx.lineTo(
  //   state.playerDirection.getP1().x + state.playerDirection.x()+ state.ui.canvas.width*0.5,
  //   state.playerDirection.getP1().y + state.playerDirection.y() + state.ui.canvas.height*0.5,
  // );
  // state.ctx.stroke();

  // state.ctx.strokeStyle = 'blue';
  // state.ctx.beginPath();
  // state.ctx.moveTo(
  //   state.virtualScreen.getP1().x + state.ui.canvas.width*0.5, 
  //   state.virtualScreen.getP1().y + state.ui.canvas.height*0.5
  // );
  // state.ctx.lineTo(
  //   state.virtualScreen.getP1().x + state.virtualScreen.x() + state.ui.canvas.width*0.5,
  //   state.virtualScreen.getP1().y + state.virtualScreen.y() + state.ui.canvas.height*0.5,
  // );
  // state.ctx.stroke();

  // state.walls.forEach(w => {
  //   state.ctx.strokeStyle = <string>w.attributes.color;
  //   state.ctx.beginPath();
  //   state.ctx.moveTo(
  //     w.getP1().x + state.ui.canvas.width*0.5, 
  //     w.getP1().y + state.ui.canvas.height*0.5
  //   );
  //   state.ctx.lineTo(
  //     w.getP2().x + state.ui.canvas.width*0.5, 
  //     w.getP2().y + state.ui.canvas.height*0.5
  //   );
  //   state.ctx.stroke();
  // });
  // state.ctx.strokeStyle = '#00ff00ff';
  // reachRays.forEach(w => {
    
  //   state.ctx.beginPath();
  //   state.ctx.moveTo(
  //     w.getP1().x + state.ui.canvas.width*0.5, 
  //     w.getP1().y + state.ui.canvas.height*0.5
  //   );
  //   state.ctx.lineTo(
  //     w.getP2().x + state.ui.canvas.width*0.5, 
  //     w.getP2().y + state.ui.canvas.height*0.5
  //   );
  //   state.ctx.stroke();
  //});


    // let e1 = new Edge2D( {x:120,y:25}, {x:0,y:50},{color: 'blue'});
    // let e2 = new Edge2D({x:150,y:-25}, {x:20,y:100}, {color: 'green'});
    // let e3 = e1.projected(e2);
    // let e4 = e1.rejected(e2).clip2(e2);
    // e3.attributes.color = 'red';
    // e4.attributes.color = 'purple';

    // state.ctx.strokeStyle = <string>e1.attributes.color;
    // state.ctx.beginPath();
    // state.ctx.moveTo(
    //   e1.getP1().x + state.ui.canvas.width*0.5, 
    //   e1.getP1().y + state.ui.canvas.height*0.5
    // );
    // state.ctx.lineTo(
    //   e1.getP2().x + state.ui.canvas.width*0.5, 
    //   e1.getP2().y + state.ui.canvas.height*0.5
    // );
    // state.ctx.stroke();

    // state.ctx.strokeStyle = <string>e2.attributes.color;
    // state.ctx.beginPath();
    // state.ctx.moveTo(
    //   e2.getP1().x + state.ui.canvas.width*0.5, 
    //   e2.getP1().y + state.ui.canvas.height*0.5
    // );
    // state.ctx.lineTo(
    //   e2.getP2().x + state.ui.canvas.width*0.5, 
    //   e2.getP2().y + state.ui.canvas.height*0.5
    // );
    // state.ctx.stroke();

    // state.ctx.strokeStyle = <string>e3.attributes.color;
    // state.ctx.beginPath();
    // state.ctx.moveTo(
    //   e3.getP1().x + state.ui.canvas.width*0.5, 
    //   e3.getP1().y + state.ui.canvas.height*0.5
    // );
    // state.ctx.lineTo(
    //   e3.getP2().x + state.ui.canvas.width*0.5, 
    //   e3.getP2().y + state.ui.canvas.height*0.5
    // );
    // state.ctx.stroke();

    // state.ctx.strokeStyle = <string>e4.attributes.color;
    // state.ctx.beginPath();
    // state.ctx.moveTo(
    //   e4.getP1().x + state.ui.canvas.width*0.5, 
    //   e4.getP1().y + state.ui.canvas.height*0.5
    // );
    // state.ctx.lineTo(
    //   e4.getP2().x + state.ui.canvas.width*0.5, 
    //   e4.getP2().y + state.ui.canvas.height*0.5
    // );
    // state.ctx.stroke();

}
function go(
  state: State, 
  t: number
) {
  let time = Date.now();
  let dt = (time - t) / 1000.0;

  let strafe = new Edge2D({x: 0, y: 0}, {x: -state.playerDirection.y(), y: state.playerDirection.x()}).size(dt*state.velocity.x());
  let march = new Edge2D({x: 0, y: 0}, {x: state.playerDirection.x(), y: state.playerDirection.y()}).size(dt*state.velocity.y());
  let sum = march.add(strafe);
  state.playerBall.relocate(state.playerDirection.getP1().x, state.playerDirection.getP1().y);
  state.playerBall.velocity.setP1(state.playerDirection.getP1());
  state.playerBall.velocity.setP2({
    x: state.playerBall.velocity.p1.x + sum.x(),
    y: state.playerBall.velocity.p1.y + sum.y()
  });

  let px = state.playerBall.getLocation().x;
  let py = state.playerBall.getLocation().y;
  state.engine.moveActors(dt);
  //state.playerBall.move(dt);

  px = state.playerBall.getLocation().x - px;
  py = state.playerBall.getLocation().y - py;
  //console.log(px, py);
  state.playerDirection.reposition({
    x: state.playerDirection.getP1().x + px,
    y: state.playerDirection.getP1().y + py,
  });
  
  state.virtualScreen.reposition({
    x: state.virtualScreen.getP1().x + px,
    y: state.virtualScreen.getP1().y + py
  })
  state.playerDirection.rotate(dt*state.angularVelocity);
  state.virtualScreen.pivot(dt*state.angularVelocity, state.playerDirection.getP1());

  state.playerDirection.rotate(dt*state.mouseAngularVelocity);
  state.virtualScreen.pivot(dt*state.mouseAngularVelocity, state.playerDirection.getP1());
  state.mouseAngularVelocity = 0;


  draw(state);
  requestAnimationFrame(() => go(state, time));
}
(<any> window).main = () => {

  try {
    

  let ui: UI = {
    canvas: <HTMLCanvasElement> document.getElementById('myCanvas'),
    controlPanel: <HTMLDivElement> document.getElementById('control-panel'),
    overlay: <HTMLDivElement> document.getElementById('overlay'),
    outputPanel: <HTMLDivElement> document.getElementById('output-panel'),
    touchpad1: <TouchPad>document.getElementById('touch-pad1'),
    touchpad2: <TouchPad>document.getElementById('touch-pad2'),
  };

  ui.canvas.width = (<HTMLElement>ui.canvas.parentElement).clientWidth;
  ui.canvas.height = (<HTMLElement>ui.canvas.parentElement).clientHeight;
  (new ResizeObserver((entries) => {
    ui.canvas.width = ui.canvas.clientWidth;
    ui.canvas.height = ui.canvas.clientHeight;
  })).observe(ui.canvas)

  let points = [
    {x: 10, y: -10},
    {x: 10, y: 10},
    {x: -10, y: 10},
    {x: -10, y: -10},

    {x: 0.5, y: -7.5},
    {x: 7.5, y: -7.5},
    {x: 7.5, y: 7.5},
    {x: -7.5, y: 7.5},
    {x: -7.5, y: -7.5},
    {x: -0.5, y: -7.5},

    {x: 0.5, y: 4},
    {x: 5, y: 5},
    {x: 0, y: -4},
    {x: -5, y: 5},

    {x: -0.5, y: 4},
  ];
  let walls: Array<Edge2D> = [
    new Edge2D(points[0], points[1], { color: '#' + (((Math.floor(Math.random()*16777215) << 8) | 0xff) >>> 0).toString(16).padStart(8, '0') }),
    new Edge2D(points[1], points[2], { color: '#' + (((Math.floor(Math.random()*16777215) << 8) | 0xff) >>> 0).toString(16).padStart(8, '0') }),
    new Edge2D(points[2], points[3], { color: '#' + (((Math.floor(Math.random()*16777215) << 8) | 0xff) >>> 0).toString(16).padStart(8, '0') }),
    new Edge2D(points[3], points[0], { color: '#' + (((Math.floor(Math.random()*16777215) << 8) | 0xff) >>> 0).toString(16).padStart(8, '0') }),

    new Edge2D(points[4], points[5], { color: '#' + (((Math.floor(Math.random()*16777215) << 8) | 0xff) >>> 0).toString(16).padStart(8, '0') }),
    new Edge2D(points[5], points[6], { color: '#' + (((Math.floor(Math.random()*16777215) << 8) | 0xff) >>> 0).toString(16).padStart(8, '0') }),
    new Edge2D(points[6], points[7], { color: '#' + (((Math.floor(Math.random()*16777215) << 8) | 0xff) >>> 0).toString(16).padStart(8, '0') }),
    new Edge2D(points[7], points[8], { color: '#' + (((Math.floor(Math.random()*16777215) << 8) | 0xff) >>> 0).toString(16).padStart(8, '0') }),
    new Edge2D(points[8], points[9], { color: '#' + (((Math.floor(Math.random()*16777215) << 8) | 0xff) >>> 0).toString(16).padStart(8, '0') }),

    new Edge2D(points[10], points[11], { color: '#' + (((Math.floor(Math.random()*16777215) << 8) | 0xff) >>> 0).toString(16).padStart(8, '0') }),
    new Edge2D(points[11], points[12], { color: '#' + (((Math.floor(Math.random()*16777215) << 8) | 0xff) >>> 0).toString(16).padStart(8, '0') }),
    new Edge2D(points[12], points[13], { color: '#' + (((Math.floor(Math.random()*16777215) << 8) | 0xff) >>> 0).toString(16).padStart(8, '0') }),
    new Edge2D(points[13], points[14], { color: '#' + (((Math.floor(Math.random()*16777215) << 8) | 0xff) >>> 0).toString(16).padStart(8, '0') }),
  ];
  
  
  let playerDirection = new Edge2D({x: 0, y: 0}, {x: 1, y: 0}, { directed: true }).scale(10);
  let virtualScreen = playerDirection.rotated(0.5*Math.PI);
  virtualScreen.reposition(playerDirection.getP2()).reposition({x: virtualScreen.getP1().x, y: -5});
  let ctx = <CanvasRenderingContext2D>ui.canvas.getContext('2d');
  
  let velocity = new Edge2D({x:0,y:0}, {x: 0,y:0});

  let playerBall = new Ball(
    {x: 0, y: 0},
    {x: 0, y: 0},{x: 0,y: 0},
    0.25,10
  );
  let engine = new Engine([playerBall], walls);

  let state = {
    virtualScreen: virtualScreen,
    playerDirection: playerDirection,
    velocity: velocity,
    playerBall: playerBall,
    engine: engine,
    angularVelocity: 0,
    mouseAngularVelocity: 0,
    walls: walls,
    ui: ui,
    ctx: ctx
  }
  
  
  let id1 = ui.touchpad1.subscribe((x,y) => velocity.setP2({x: 200*x, y: 200*y}));
  let id2 = ui.touchpad2.subscribe((x,y) => state.angularVelocity = x*0.5*Math.PI );
  document.addEventListener('keydown', (e: KeyboardEvent) => {
    switch(e.key) {
      case 'w':
        state.velocity.setP2({x: state.velocity.getP2().x, y: 200});
        break;
      case 's':
        state.velocity.setP2({x: state.velocity.getP2().x, y: -200});
        break;
      case 'a':
        state.velocity.setP2({x: -200, y: state.velocity.getP2().y});
        break;
      case 'd':
        state.velocity.setP2({x: 200, y: state.velocity.getP2().y});
        break;
      }
  });
  document.addEventListener('keyup', (e: KeyboardEvent) => {
    switch(e.key) {
      case 'w':
        state.velocity.setP2({x: state.velocity.getP2().x, y: 0});
        break;
      case 's':
        state.velocity.setP2({x: state.velocity.getP2().x, y: 0});
        break;
      case 'a':
        state.velocity.setP2({x: 0, y: state.velocity.getP2().y});
        break;
      case 'd':
        state.velocity.setP2({x: 0, y: state.velocity.getP2().y});
        break;
      }
  });
  let mx = ui.canvas.clientWidth*0.5;
  document.addEventListener('mousemove', (e: MouseEvent) => {
    let dx = e.clientX - mx;
    mx = e.clientX;
    state.mouseAngularVelocity = dx*0.5
  });

  go( state, Date.now() );

  if ('ontouchstart' in document.documentElement) {
    // detected touchscreen
    console.log('test');
  }

} catch(error) {
  alert(error);
}
}

function darken(c: string, t: number): string {
  let r = parseInt(c.substring(1, 3), 16);
  let g = parseInt(c.substring(3, 5), 16);
  let b = parseInt(c.substring(5, 7), 16);
  let a = parseInt(c.substring(7, 9), 16);

  r = Math.floor(r*(1-t));
  g = Math.floor(g*(1-t));
  b = Math.floor(b*(1-t));

  return '#' + r.toString(16).padStart(2,'0') + g.toString(16).padStart(2,'0')+ b.toString(16).padStart(2,'0')+ a.toString(16).padStart(2,'0');
}