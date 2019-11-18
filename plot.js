// Generating random data..

class Slider {
    constructor(id, min, max, ini) {
        this.min = min;
        this.max = max;
        this.ini = ini;
        this.id = id;

        var mydiv = document.getElementById("sliders");
        var newdiv = document.createElement("div");
        this.newslider = document.createElement("input");

        this.label = document.createElement("label");
        this.span = document.createElement("span");
        this.span.id = "span_" + id;
        this.span.innerHTML = " " + ini;
        this.label.innerHTML = " " + id;
        this.label.appendChild(this.span);


        var newdiv_att = { "class": "slidecontainer" };
        var newslider_att = {
            "type": "range", "min": min, "max": max, "step": 0.01,
            "value": parseFloat(ini), "class": "slider",
            "id": id
        };
        for (var key in newdiv_att) {
            newdiv.setAttribute(key, newdiv_att[key]);
        }
        for (var key in newslider_att) {
            this.newslider.setAttribute(key, newslider_att[key]);
        }

        newdiv.appendChild(this.newslider);
        newdiv.appendChild(this.label);
        mydiv.appendChild(newdiv);

        var myself = this;
        this.newslider.oninput = function update() {
            myself.update_label(this)
            myself.update();
        };
    }
    update_label(slider) {
        this.span.innerHTML = " " + slider.value;
    }
    update() {

    }
}

class Energy {
    constructor() {
        var myself = this;
        function auxupdate() {
            myself.update(this);
        }
        var p_dyn = new Slider("p_dyn", 0, 20, 0.29);
        p_dyn.update = auxupdate;

        var p_leak = new Slider("p_leak", 0, 50, 0.97);
        p_leak.update = auxupdate;

        var p_static = new Slider("p_static", 0, 3000, 198);
        p_static.update = auxupdate;

        var parallel = new Slider("parallel", 0, 1, 0.5);
        parallel.update = auxupdate;

        var freq_max = new Slider("freq_max", 1, 10, 5.0);
        freq_max.update = auxupdate;

        var thr_max = new Slider("thr_max", 1, 300, 120);
        thr_max.update = auxupdate;

        this.x0 = [1, 0.29, 0.97, 198, 0.5];
        this.minfreq = 1.0;
        this.maxfreq = 5.0;
        this.minthr = 1;
        this.maxthr = 120;

        var [a, b, c] = this.compute();
        // Plotting the mesh
        var data = [
            {
                opacity: 0.8,
                color: 'rgb(300,100,200)',
                type: 'surface',
                x: a,
                y: b,
                z: c,
            }
        ];
        var layout = {
            title: "Energy",
            height: 800,
            scene: {
                xaxis: { title: 'Frequency' },
                yaxis: { title: 'Threads' },
                zaxis: { title: 'Energy' },
            },
        };
        Plotly.newPlot('3dplot', data, layout, {responsive: true});
        var data2 = [
            {
                opacity: 0.8,
                color: 'rgb(300,100,200)',
                type: 'contour',
                x: a,
                y: b,
                z: c,
            }
        ];
        var layout = {
            title: "Gradient",
            height: 800,
            scene: {
                xaxis: { title: 'Frequency' },
                yaxis: { title: 'Threads' },
                zaxis: { title: 'Energy' },
            },
        };
        Plotly.newPlot('grad', data2, layout, {responsive: true});
    }
    update(slider) {
        if (slider.id == "p_dyn") {
            this.x0[1] = slider.newslider.value;
            this.redraw();
        }
        if (slider.id == "p_leak") {
            this.x0[2] = slider.newslider.value;
            this.redraw();
        }
        if (slider.id == "p_static") {
            this.x0[3] = parseInt(slider.newslider.value);
            this.redraw();
        }
        if (slider.id == "parallel") {
            this.x0[4] = slider.newslider.value;
            this.redraw();
        }
        if (slider.id == "freq_max") {
            this.maxfreq = slider.newslider.value;
            this.redraw();
        }
        if (slider.id == "thr_max") {
            this.maxthr = parseInt(slider.newslider.value);
            this.redraw();
        }
    }
    compute() {
        var a = [], b = [], c = [];
        var freq_step = (this.maxfreq - this.minfreq) / (this.maxthr - this.minthr);
        for (var f = this.minfreq; f < this.maxfreq; f += freq_step) {
            b.push(f);
        }
        for (var t = this.minthr; t < this.maxthr; t++) {
            a.push(t);
        }
        for (var p = this.minthr; p < this.maxthr; p++) {
            var aux = [];
            for (var f = this.minfreq; f < this.maxfreq; f += freq_step) {
                var pw = (this.x0[1]*f**3+this.x0[2]*f)*p+this.x0[3];
                var perf = (this.x0[4]/p-this.x0[4]+1);
                var en = this.x0[0]*(pw*perf)/f;
                aux.push(en);
            }
            c.push(aux);
        }
        return [b, a, c];
    }
    redraw() {
        var [a, b, c] = this.compute();
        Plotly.animate("3dplot", {
            data: [
                {
                    opacity: 0.8,
                    color: 'rgb(300,100,200)',
                    type: 'surface',
                    x: a,
                    y: b,
                    z: c,
                }
            ]
        },
            {
                transition: {
                    duration: 100,
                    easing: 'cubic-in-out'
                },
                frame: {
                    duration: 100
                }
            }
        );
        Plotly.animate("grad", {
            data: [
                {
                    opacity: 0.8,
                    color: 'rgb(300,100,200)',
                    type: 'contour',
                    x: a,
                    y: b,
                    z: c,
                }
            ]
        },
            {
                transition: {
                    duration: 100,
                    easing: 'cubic-in-out'
                },
                frame: {
                    duration: 100
                }
            }
        );
    }
}

document.addEventListener("DOMContentLoaded", function () {
    eq = new Energy()
});