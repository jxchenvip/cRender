(function(window, document) {
    var win = window,
        doc = document;

    function jRender(dom) {
        return new jRender.init(dom);
    }
    jRender.init = function(dom) {
        this.canvas = typeof dom === 'string' ? document.getElementById(dom) : dom;
        this.context = this.canvas.getContext('2d');

        this.width = this.canvas.width;
        this.height = this.canvas.height;

        this.cx = this.width / 2;
        this.cy = this.height / 2;

        this.mouseX = -1;
        this.mouseY = -1;

        this.updateFrame = false;
        this.childrens = [];

        this.render();


        return this;
    }

    jRender.init.prototype = jRender.prototype = {
        update: function() {
            this.updateFrame = true;
        },
        sortChildrens: function() {
            this.childrens.sort(function(a, b) {
                return a.zIndex - b.zIndex;
            })
        },
        render: function() {
            if (this.updateFrame) {
                this.updateFrame = false;
                this.draw();
            }
            window.requestAnimationFrame(this.render.bind(this));
        },
        draw: function() {
            this.context.clearRect(0, 0, this.width, this.height)
            this.childrens.forEach(function(item) {
                item.rotate++;
                item.init();
            }.bind(this));
        },
        addChildren: function(child) {
            this.childrens.push(child);
            this.sortChildrens();
            return this;
        },
        d2a: function(n = 0) {
            return n * Math.PI / 180;
        },
        addShape: function(options = {}) {
            if (typeof options.shape != 'string') return '';
            var fnName = '__draw' + options.shape.charAt(0).toUpperCase() + options.shape.substring(1);
            var name = options.name || 'Layer_' + this.childrens.length;
            var style = options.style || {};
            var layer = new Layer(this.context, name, style.x, style.y);
            layer.draw = function(parent) {
                this.context.beginPath();
                this.context.lineWidth = style.lineWidth;
                this.context.fillStyle = style.fill;
                this.context.strokeStyle = style.stroke;
                this.context.lineCap = style.lineCap;
                this.context.lineJoin = style.lineJoin;
                this.context.miterLimit = style.miterLimit;
                this.context.shadowColor = style.shadowColor;
                this.context.shadowBlur = style.shadowBlur;
                this.context.shadowOffsetX = style.shadowOffsetX;
                this.context.shadowOffsetY = style.shadowOffsetY;
                typeof this[fnName] == 'function' && this[fnName](options.style);
                if (!this[fnName] && typeof style.draw == 'function') {
                    style.draw.call(this);
                }
                if (this.context.isPointInPath(this.mouseX, this.mouseY)) {
                    console.log('a')
                }
                this.context.closePath();
                style.fill && this.context.fill();
                style.stroke && this.context.stroke();
            }.bind(this);
            layer.setZIndex(options.zIndex);
            this.addChildren(layer);
            this.update();
            return layer;
        },
        __drawLine: function(style = {}) {
            style.points.forEach(function(item) {
                this.context.lineTo(item.x, item.y);
            }.bind(this))
        },
        __drawPolygon: function(style = {}) {
            var polygon = new Polygon(style.side, style.radius, style.angle);
            style.points = polygon.points;
            this.__drawLine(style);
            polygon = null;
        },
        __drawStar: function(style = {}) {
            var star = new Star(style.side, style.radius, style.angle);
            style.points = star.points;
            this.__drawLine(style);
            star = null;
        },
        __drawArrow: function(style = {}) {
            var arrow = new Arrow(style.width, style.height);
            style.points = arrow.points;
            this.__drawLine(style);
            arrow = null;
        },
        __drawCircel: function(style) {
            this.context.arc(0, 0, style.radius, this.d2a(0), this.d2a(360), style.counterclockwise);
        },
        __drawSector: function(style = {}) {
            this.context.moveTo(0, 0);
            this.context.arc(0, 0, style.radius, this.d2a(style.sAngle), this.d2a(style.eAngle));
        },
        __drawRect: function(style = {}) {
            this.context.rect(-style.width / 2, -style.height / 2, style.width, style.height);
        },
        __drawRectRadius: function(style = {}) {
            let width = style.width;
            let height = style.height;
            let x = -width / 2;
            let y = -height / 2;
            let radius = Math.min(style.radius, width / 2) || 0;
            let top = Math.min(style.top, width / 2) || radius;
            let left = Math.min(style.left, width / 2) || radius;
            let right = Math.min(style.right, width / 2) || radius;
            let bottom = Math.min(style.bottom, width / 2) || radius;
            this.context.moveTo(x, y + top);
            this.context.quadraticCurveTo(x, y, x + top, y);
            this.context.lineTo(x + width - right, y);
            this.context.quadraticCurveTo(x + width, y, x + width, y + right);
            this.context.lineTo(x + width, y + height - bottom);
            this.context.quadraticCurveTo(x + width, y + height, x + width - bottom, y + height);
            this.context.lineTo(x + left, y + height);
            this.context.quadraticCurveTo(x, y + height, x, y + height - left);
        },
        __drawOval: function(style = {}) {
            let width = style.width;
            let height = style.height;
            let x = -width / 2;
            let y = -height / 2;
            this.context.moveTo(x, 0);
            this.context.quadraticCurveTo(x, y, 0, y);
            this.context.quadraticCurveTo(x + width, y, x + width, 0);
            this.context.quadraticCurveTo(x + width, y + height, 0, y + height);
            this.context.quadraticCurveTo(x, y + height, x, 0);
        },
        __drawText: function(style = {}) {
            this.context.font = style.font;
            this.context.textAlign = style.textAlign;
            this.context.textBaseline = style.textBaseline;
            var texts = style.text.split('\n');
            var fontSize = this.context.font.match(/\d+/)[0];
            var lines = Math.floor(texts.length / 2);
            texts.forEach(function(item, index) {
                style.fill && this.context.fillText(item, 0, (index - lines) * fontSize);
                style.stroke && this.context.strokeText(item, 0, (index - lines) * fontSize);
            }.bind(this))
        }
    }

    function Arrow(width = 50, height = 100) {
        this.width = width;
        this.height = height;
        this.points = [];
        this.init();
    }

    Arrow.prototype = {
        constructor: 'Arrow',
        init: function() {
            var point1 = { x: this.width, y: 0 };
            var point2 = { x: 0, y: this.height };
            var point3 = { x: -this.width, y: 0 };
            this.points.push(point1, point2, point3);
        }
    }

    function Star(side = 5, radius = 10, angle = -90) {
        this.side = side;
        this.radius = radius;
        this.angle = angle;
        this.points = [];
        this.init();
    }

    Star.prototype = {
        constructor: 'Star',
        init: function() {
            for (let i = this.side * 2; i--;) {
                let angle = (180 / this.side * i + this.angle) * Math.PI / 180;
                let r = i % 2 == 0 ? this.radius : this.radius / Math.sqrt(6.18);
                let x = r * Math.cos(angle);
                let y = r * Math.sin(angle);
                this.points.push({ x: x, y: y });
            }
        }
    }

    function Polygon(side = 6, radius = 100, angle = 0) {
        this.side = side;
        this.radius = radius;
        this.angle = angle;
        this.points = [];
        this.init();
    }
    Polygon.prototype = {
        constructor: 'Polygon',
        init: function() {
            for (let i = this.side; i--;) {
                let angle = (360 / this.side * i + this.angle) * Math.PI / 180;
                let x = this.radius * Math.cos(angle);
                let y = this.radius * Math.sin(angle);
                this.points.push({ x: x, y: y });
            }
        }
    }

    function Layer(context, name = '', x = 0, y = 0) {
        this.x = x;
        this.y = y;
        this.scale = 1;
        this.opacity = 1;
        this.rotate = 0;
        this.name = name;
        this.draw = function() {};
        this.context = context;
        this.zIndex = 0;
        this.init();
    }

    Layer.prototype = {
        constructor: 'Layer',
        setZIndex: function(n = 0) {
            this.zIndex = n;
            return this;
        },
        setOpacity: function(opacity = 1) {
            this.opacity = opacity;
            return this;
        },
        setScale: function(scale = 1) {
            this.scale = scale;
            return this;
        },
        setRotate: function(deg = 0) {
            this.rotate = deg;
            return this;
        },
        setPosition: function(x = 0, y = 0) {
            this.x = x;
            this.y = y;
            return this;
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
            return this;
        }
    }
    window.jRender = jRender;
    return jRender;
})(window, document)
