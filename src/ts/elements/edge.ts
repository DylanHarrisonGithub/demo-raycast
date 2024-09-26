export class Edge2D {

  public p1: {x: number, y: number};
  public p2: {x: number, y: number};

  attributes: { [key: string]: boolean | number | string | null } = {}

  constructor(p1: {x: number, y: number}, p2: {x: number, y: number}, attributes?: { [key: string]: boolean | number | string | null }) {
    this.p1 = p1;
    this.p2 = p2;
    this.attributes = {...this.attributes, ...attributes};
  }

  public x() { return this.p2.x - this.p1.x }
  public y() { return this.p2.y - this.p1.y }
  public getP1() { return {x: this.p1.x, y: this.p1.y } }
  public getP2() { return {x: this.p2.x, y: this.p2.y } }
  public setP1(p1: {x: number, y: number}): Edge2D { this.p1.x = p1.x; this.p1.y = p1.y; return this; } 
  public setP2(p2: {x: number, y: number}): Edge2D { this.p2.x = p2.x; this.p2.y = p2.y; return this; } 
  public m() { return Math.sqrt(this.mm()); }
  public mm() { return this.x()*this.x() + this.y()*this.y(); }
  public t() { let t = Math.atan2(this.y(), this.x()); if (t < 0) t += 2*Math.PI; return t; }
  
  public dot(b: Edge2D): number { return this.x()*b.x() + this.y()*b.y(); }
  public det(b: Edge2D): number { return this.x()*b.y() - this.y()*b.x(); }
  public projectedScalar(b: Edge2D): number { return this.dot(b)/b.m(); }
  public rejectedScalar(b: Edge2D): number { return this.det(b)/b.m(); }

  public getParametricPoint(t: number): {x: number, y: number} { return {x: this.p1.x + t*this.x(), y: this.p1.y + t*this.y()}; }
  public getParametricIntersection(b: Edge2D): number | null { let det = this.det(b); return det ? (b.y()*(b.p1.x - this.p1.x) - b.x()*(b.p1.y - this.p1.y))/det : null; }

  public reposition(p1: {x: number, y: number}): Edge2D { let dx = this.x(); let dy = this.y(); this.p1.x = p1.x; this.p1.y = p1.y; this.p2.x = this.p1.x+dx; this.p2.y = this.p1.y+dy; return this; }
  public repositioned(p1: {x: number, y: number}): Edge2D { return new Edge2D({x: p1.x, y: p1.y}, {x: p1.x + this.x(), y: p1.y + this.y()}, {...this.attributes}); }
  public scale(c: number): Edge2D { this.p2.x = this.p1.x + c*this.x(); this.p2.y = this.p1.y + c*this.y(); return this; }
  public scaled(c: number): Edge2D { return new Edge2D({x: this.p1.x, y: this.p1.y}, {x: this.p1.x + c*this.x(), y: this.p1.y + c*this.y()}, {...this.attributes}); }
  public size(m: number): Edge2D { return this.scale(1/this.m()).scale(m); }
  public sized(m: number): Edge2D { return (new Edge2D({x: this.p1.x, y: this.p1.y}, {x: this.p2.x, y: this.p2.y}, {...this.attributes})).scale(1/this.m()).scale(m); }
  public angle(a: number): Edge2D { let m = this.m(); this.p2.x = this.p1.x + m*Math.cos(a); this.p2.y = this.p1.y + m*Math.sin(a); return this }
  public angled(a: number): Edge2D { let m = this.m(); return new Edge2D({x: this.p1.x, y: this.p1.y}, {x: this.p1.x + m*Math.cos(a), y: this.p1.y + m*Math.sin(a)}, {...this.attributes}); }
  public rotate(a: number): Edge2D { 
    let ct = Math.cos(a); let st = Math.sin(a); 
    let p = this.x(); let q = this.y();
    this.p2.x = this.p1.x + p*ct - q*st;
    this.p2.y = this.p1.y + p*st + q*ct;
    return this;
  }
  public rotated(a: number): Edge2D {
    let ct = Math.cos(a); let st = Math.sin(a); 
    let p = this.x(); let q = this.y();
    return new Edge2D (
      {x: this.p1.x, y: this.p1.y},
      {x: this.p1.x + p*ct - q*st, y: this.p1.y + p*st + q*ct}, 
      {...this.attributes}
    );
  }
  public pivot(a: number, p: {x: number, y: number}): Edge2D {
    let ct = Math.cos(a); let st = Math.sin(a); 
    let x1 = this.p1.x - p.x; let y1 = this.p1.y - p.y;
    let x2 = this.p2.x - p.x; let y2 = this.p2.y - p.y;

    this.p1.x = p.x + x1*ct - y1*st;
    this.p1.y = p.y + x1*st + y1*ct;

    this.p2.x = p.x + x2*ct - y2*st;
    this.p2.y = p.y + x2*st + y2*ct;
    return this;
  }
  pivoted(a: number, p: {x: number, y: number}): Edge2D {
    return new Edge2D(
      {x: this.p1.x, y: this.p1.y},
      {x: this.p2.x, y: this.p2.y},
      {...this.attributes}
    ).pivot(a, p);
  }
  //turn
  //turned
  public add(b: Edge2D): Edge2D { this.p2.x += b.x(); this.p2.y += b.y(); return this; }
  public added(b: Edge2D): Edge2D { return new Edge2D({x: this.p1.x, y: this.p1.y}, {x: this.p2.x += b.x(), y: this.p2.y += b.y()}, {...this.attributes}); }
  public project(b: Edge2D): Edge2D { 
    let c = this.dot(b)/b.mm();
    this.p2.x = this.p1.x + c*b.x(); this.p2.y = this.p1.y + c*b.y();
    return this;
  }
  public projected(b: Edge2D): Edge2D {
    let c = this.dot(b)/b.mm();
    return new Edge2D(
      {x: this.p1.x, y: this.p1.y},
      {x: this.p1.x + c*b.x(), y: this.p1.y + c*b.y()}, 
      {...this.attributes}
    );
  }
  public reject(b: Edge2D): Edge2D {
    let pTemp = this.projected(b);
    let c = this.det(b)/b.mm();
    this.p2.x = this.p1.x + c*b.y(); this.p2.y = this.p1.y - c*b.x();
    return this;
  }
  public rejected(b: Edge2D): Edge2D {
    let pTemp = this.projected(b);
    let c = this.det(b)/b.mm();
    return new Edge2D(
      {x: this.p1.x, y: this.p1.y},
      {x: this.p1.x + + c*b.y(), y: this.p1.y  - c*b.x()}, 
      {...this.attributes}
    )
  }
  public intersection(e: Edge2D): number { return (-e.y()*(e.p1.x - this.p1.x) + e.x()*(e.p1.y - this.p1.y))/e.det(this); }
  clip1(e: Edge2D): Edge2D { 
    let t = this.intersection(e);
    if (isFinite(t) && t > 0 && t < 1) {
      this.p1.x = this.p1.x + t*(this.p2.x - this.p1.x);
      this.p1.y = this.p1.y + t*(this.p2.y - this.p1.y);
    }
    return this; 
  }
  clipped1(e: Edge2D): Edge2D { return new Edge2D({x: this.p1.x, y: this.p1.y}, {x: this.p2.x, y: this.p2.y}, {...this.attributes}).clip1(e); }
  clip2(e: Edge2D): Edge2D {
    let t = this.intersection(e);
    if (isFinite(t) && t > 0 && t < 1) {
      this.p2.x = this.p1.x + t*(this.p2.x - this.p1.x);
      this.p2.y = this.p1.y + t*(this.p2.y - this.p1.y);
    }
    return this; 
  }
  clipped2(e: Edge2D): Edge2D { return new Edge2D({x: this.p1.x, y: this.p1.y}, {x: this.p2.x, y: this.p2.y}, {...this.attributes}).clip2(e); }
  reach1(e: Edge2D): Edge2D {
    let t = this.intersection(e);
    if (isFinite(t)) {
      let p = this.getParametricPoint(t);
      this.p1.x = p.x; this.p1.y = p.y;
    }
    return this;
  }
  reached1(e: Edge2D): Edge2D { return new Edge2D({x: this.p1.x, y: this.p1.y}, {x: this.p2.x, y: this.p2.y}, {...this.attributes}).reach1(e); }
  reach2(e: Edge2D): Edge2D {
    let t = this.intersection(e);
    if (isFinite(t)) {
      let p = this.getParametricPoint(t);
      this.p2.x = p.x; this.p2.y = p.y;
    }
    return this;
  }
  reached2(e: Edge2D): Edge2D { return new Edge2D({x: this.p1.x, y: this.p1.y}, {x: this.p2.x, y: this.p2.y}, {...this.attributes}).reach2(e); }
  public point(t: number): {x: number, y: number} { return {x: this.p1.x + t*(this.p2.x - this.p1.x), y: this.p1.y + t*(this.p2.y - this.p1.y)}; }

}