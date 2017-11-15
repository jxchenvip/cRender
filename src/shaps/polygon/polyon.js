function Polygon(side = 6, radius = 100, angle = 0) {
    this.side = side;
    this.radius = radius;
    this.angle = angle;
    this.init();
}
Polygon.prototype = {
    constructor: 'Polygon',
    init: function() {
        this.points = [];
        for (let i = this.side; i--;) {
            var angle = (360 / this.side * i + this.angle) * Math.PI / 180;
            var x = this.radius * Math.cos(angle);
            var y = this.radius * Math.sin(angle);
            this.points[i] = {};
            this.points[i].x = x;
            this.points[i].y = y;
        }
    }
}
