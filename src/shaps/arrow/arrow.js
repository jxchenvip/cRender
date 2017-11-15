function Arrow(width = 100, height = 100) {
    this.width = width;
    this.height = height;
    this.points = [];
    this.init();
    this.points = [];
}

Arrow.prototype = {
    constructor: 'Arrow',
    init: function() {
        var point1 = { x: this.width, y: -this.height / 2 };
        var point2 = { x: 0, y: this.height / 2 };
        var point3 = { x: -this.width, y: -this.height / 2 };
        this.points.push(point1, point2, point3);
    }
}
