export class TouchPad extends HTMLElement {
 
  private canvas: HTMLCanvasElement = document.createElement('canvas');
  private ctx: CanvasRenderingContext2D = <CanvasRenderingContext2D>this.canvas.getContext('2d');
  private resizeListener: ResizeObserver | null = null;
  private highlight: HTMLImageElement = new Image();
  private pointerdown: boolean = false;
  private prev: { x: number, y: number } = { x: -1, y: -1 };

  private inactiveColor: string = '#d3d3d3';
  private activeColor: string = '#ff1090';
  private analog: boolean = false;
  private digitalSectors: number = 8;
  private digitalMagnitudes: number = 1;

  private subscriptions: Array<((x: number, y: number) => void) | null> = [];

  constructor() { super(); }

  connectedCallback() {
    this.style.display = 'inline-block';
    //this.style.pointerEvents = 'none';

    this.canvas.style.borderRadius = '50%';
    this.canvas.style.display = 'block';
    this.canvas.style.margin = 'auto';
    this.canvas.style.position = 'relative';
    this.canvas.style.top = '50%';
    this.canvas.style.transform = 'translateY(-50%)';
    this.canvas.style.boxSizing = 'border-box';
    this.canvas.style.border = '1px solid black';
    //this.canvas.style.pointerEvents = 'auto';

    this.inactiveColor = this.hasAttribute('inactive-color') ? (<string>this.getAttribute('inactive-color')) : this.inactiveColor;
    this.activeColor = this.hasAttribute('active-color') ? (<string>this.getAttribute('active-color')) : this.activeColor;
    this.analog = this.hasAttribute('analog') ? (<string>this.getAttribute('analog') === 'true') : this.analog;
    this.digitalSectors = this.hasAttribute('digital-sectors') ? parseInt((<string>this.getAttribute('digital-sectors'))) : this.digitalSectors;
    this.digitalMagnitudes = this.hasAttribute('digital-magnitudes') ? parseInt(<string>this.getAttribute('digital-magnitudes')) : this.digitalMagnitudes;

    let AHC: HTMLCanvasElement = document.createElement('canvas');
    AHC.width = 140;
    AHC.height = 140;
    let actx = AHC.getContext('2d');
    let aGradient = actx!.createRadialGradient(70, 70, 5, 70, 70, 70);
    aGradient.addColorStop(0, 'white');
    aGradient.addColorStop(1, this.activeColor);
    actx!.arc(70, 70, 60, 0, 2*Math.PI);
    actx!.fillStyle = aGradient;
    actx!.fill();

    this.highlight.onload = () => {
      
      this.render();
      
      this.draw(0,0);

      if ('ResizeObserver' in window) {
        this.resizeListener = new ResizeObserver((entries) => {
          this.onResize();
        });
        this.resizeListener.observe(this);
      } else {
        alert('Warning! ResizeObserver not supported by your browser. Touchpad component may not function properly.');
        window.addEventListener('resize', ()=> this.onResize());
      }
      if (!this.addPointerEvents()) {
        this.addMouseEvents();
        alert('Warning! PointerEvent not supported by your browser. Touchpad component may not function properly.');
      }
    }
    this.highlight.src = AHC.toDataURL('image/png');
  }

  private calcPointerCoords(x: number, y: number): {x: number, y: number} {
    let p = { x: x - 0.5*this.clientWidth, y: y - 0.5*this.clientHeight };
    let maxMag = 0.25*(this.canvas.width < this.canvas.height ? this.canvas.width : this.canvas.height);
    let pMag = Math.sqrt(p.x*p.x + p.y*p.y);
    let magRatio = pMag/maxMag;
    if (magRatio > 1) { magRatio = 1; }
    p.x *= magRatio/pMag;
    p.y *= magRatio/pMag;
    if (!this.analog) {
      pMag = Math.sqrt(p.x*p.x + p.y*p.y);
      let theta = Math.atan2(p.y, p.x);
      if (theta < 0) { theta += 2*Math.PI}
      theta = Math.round((this.digitalSectors*theta)/(2*Math.PI))*(2*Math.PI)/this.digitalSectors;
      pMag = Math.round((this.digitalMagnitudes*pMag))/this.digitalMagnitudes;
      p.x = pMag*Math.cos(theta);
      p.y = pMag*Math.sin(theta);
    }
    return p;
  }

  draw(x: number, y: number) {
    this.ctx.clearRect(0,0,this.canvas.width, this.canvas.height);
    if (this.pointerdown) {
      this.ctx.fillStyle = this.activeColor;
      this.ctx.fillRect(0,0,this.canvas.width,this.canvas.height);
      let maxMag = 0.25*(this.canvas.width < this.canvas.height ? this.canvas.width : this.canvas.height);
      let highlightSize = 0.5*(this.canvas.width < this.canvas.height ? this.canvas.width : this.canvas.height);
      let p = {
        x: 0.5*this.canvas.width + maxMag*x,
        y: 0.5*this.canvas.height + maxMag*y
      }
      this.ctx.drawImage(this.highlight, p.x - 0.5*highlightSize, p.y - 0.5*highlightSize, highlightSize, highlightSize);
    } else {
      this.ctx.fillStyle = this.inactiveColor;
      this.ctx.fillRect(0,0,this.canvas.width,this.canvas.height);
    }
    this.ctx.fillStyle = 'darkgrey';
    this.ctx.strokeStyle = 'black';
      let ct = Math.cos(Math.PI/4); let st = Math.cos(Math.PI/4);
      let maxMag = 0.25*(this.canvas.width < this.canvas.height ? this.canvas.width : this.canvas.height);
      let highlightSize = 0.5*(this.canvas.width < this.canvas.height ? this.canvas.width : this.canvas.height);
      let points = [
        {x: highlightSize -0.5*maxMag, y: 0.25*maxMag},
        {x: highlightSize -0.5*maxMag , y: -0.25*maxMag},
        {x: 0.9*highlightSize, y: 0}
      ];
      for (let i = 0; i < 8; i++) {
        this.ctx.beginPath();
        this.ctx.moveTo(points[0].x + 0.5*this.canvas.width ,points[0].y + 0.5*this.canvas.height);
        this.ctx.lineTo(points[1].x + 0.5*this.canvas.width ,points[1].y + 0.5*this.canvas.height);
        this.ctx.lineTo(points[2].x + 0.5*this.canvas.width ,points[2].y + 0.5*this.canvas.height);
        this.ctx.closePath();
        this.ctx.fill();
        this.ctx.stroke();
        points.forEach(arrowpoint => {
          let x = arrowpoint.x*ct - arrowpoint.y*st;
          let y = arrowpoint.x*st + arrowpoint.y*ct;
          arrowpoint.x = x; arrowpoint.y = y;
        })
      }
  }


  private onResize() {
    if (this.clientWidth < this.clientHeight) {
      this.canvas.style.width = '100%';
      this.canvas.style.height = (this.canvas.clientWidth+2).toString() + 'px';
      this.canvas.style.width = this.canvas.clientHeight.toString() + 'px';
    } else {
      this.canvas.style.height = '100%';
      this.canvas.style.width = (this.canvas.clientHeight+2).toString() + 'px';
      this.canvas.style.height = this.canvas.clientWidth.toString() + 'px';
    }
    this.canvas.width = this.canvas.clientWidth;
    this.canvas.height = this.canvas.width;
    this.draw(0,0);
  }

  private addPointerEvents(): boolean {
    if (!('PointerEvent' in window)) { return false; }
    this.addEventListener('pointerdown', (e: PointerEvent) => {
      this.pointerdown = true;
      let coords = {
        x: e.clientX - this.getBoundingClientRect().left,
        y: e.clientY - this.getBoundingClientRect().top
      }
      let p = this.calcPointerCoords(coords.x, coords.y);
      if (p.x !== this.prev.x || p.y !== this.prev.y) {
        this.prev.x = p.x; this.prev.y = p.y;
        this.draw(p.x, p.y);
        this.subscriptions.forEach(f => { if (f) { f(p.x,-p.y) } });
      }
    });
    this.addEventListener('pointerup', (e: PointerEvent) => {
      this.pointerdown = false;
      this.prev.x = -1; this.prev.y = -1;
      this.draw(0,0);
      this.subscriptions.forEach(f => { if (f) { f(0,0) } });
    });
    this.addEventListener('pointermove', (e: PointerEvent) => {
      if (this.pointerdown) {
        let coords = {
          x: e.clientX - this.getBoundingClientRect().left,
          y: e.clientY - this.getBoundingClientRect().top
        }
        let p = this.calcPointerCoords(coords.x, coords.y);
        if (p.x !== this.prev.x || p.y !== this.prev.y) {
          this.prev.x = p.x; this.prev.y = p.y;
          this.draw(p.x, p.y);
          this.subscriptions.forEach(f => { if (f) { f(p.x,-p.y) } });
        }
      }
    });
    this.addEventListener('pointerleave', (e: PointerEvent) => {
      if (this.pointerdown) {
        this.pointerdown = false;
        this.prev.x = -1; this.prev.y = -1;
        this.draw(0,0);
        this.subscriptions.forEach(f => { if (f) { f(0,0) } });
      }
    });
    return true;
  }

  private addMouseEvents(): boolean {
    if (!('TouchEvent' in window)) { return false; }
    this.addEventListener('mousedown', (e: MouseEvent) => {
      this.pointerdown = true;
      let coords = {
        x: e.clientX - this.getBoundingClientRect().left,
        y: e.clientY - this.getBoundingClientRect().top
      }
      let p = this.calcPointerCoords(coords.x, coords.y);
      if (p.x !== this.prev.x || p.y !== this.prev.y) {
        this.prev.x = p.x; this.prev.y = p.y;
        this.draw(p.x, p.y);
        this.subscriptions.forEach(f => { if (f) { f(p.x,-p.y) } });
      }
    });
    this.addEventListener('mouseup', (e: MouseEvent) => {
      this.pointerdown = false;
      this.prev.x = -1; this.prev.y = -1;
      this.draw(0,0);
      this.subscriptions.forEach(f => { if (f) { f(0,0) } });
    });
    this.addEventListener('mousemove', (e: MouseEvent) => {
      if (this.pointerdown) {
        let coords = {
          x: e.clientX - this.getBoundingClientRect().left,
          y: e.clientY - this.getBoundingClientRect().top
        }
        let p = this.calcPointerCoords(coords.x, coords.y);
        if (p.x !== this.prev.x || p.y !== this.prev.y) {
          this.prev.x = p.x; this.prev.y = p.y;
          this.draw(p.x, p.y);
          this.subscriptions.forEach(f => { if (f) { f(p.x,-p.y) } });
        }
      }
    });
    this.addEventListener('mouseleave', (e: MouseEvent) => {
      if (this.pointerdown) {
        this.pointerdown = false;
        this.prev.x = -1; this.prev.y = -1;
        this.draw(0,0);
        this.subscriptions.forEach(f => { if (f) { f(0,0) } });
      }
    });
    return true;
  }
  render() {
    this.appendChild(this.canvas);
  }

  subscribe(f: (x: number, y: number) => void): number { this.subscriptions.push(f); return this.subscriptions.length-1; }
  unsubscribe(id: number) { this.subscriptions[id] = null; }
}