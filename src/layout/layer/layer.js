function Layer(context, name, x, y) {
    if (arguments.length != 4) console.warm('arguments must be 4');
    this.x = x || 0;
    this.y = y || 0;
    this.scale = 1;
    this.opacity = 1;
    this.rotate = 0;
    this.name = name;
    this.draw = function() {};
    this.context = context;
    this.init();
}

Layer.prototype = {
    constructor: 'Layer',
    setOpacity: function(opacity) {
        this.opacity = opacity;
    },
    setScale: function(scale) {
        this.scale = scale;
    },
    setRotate: function(deg) {
        this.rotate = deg;
    },
    setPosition: function(x, y) {
        if (isNaN(x) || isNaN(y)) {
            console.warm('arguments must be 2 and type is Number')
        }
        this.x = x;
        this.y = y;
    },
    init: function() {
        this.context.save();
        this.context.translate(this.x, this.y);
        if (this.opacity != 1) {
            this.context.globalAlpha = this.opacity;
        }
        this.context.scale(this.scale, this.scale);
        this.context.rotate(this.rotate * Math.PI / 180);
        this.draw(this);
        this.context.restore();
    }
}
