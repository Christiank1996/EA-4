// canvas
// Get the WebGL context.
var canvas = document.getElementById('canvas');
var gl = canvas.getContext('experimental-webgl');

// Pipeline setup.
gl.clearColor(.95, .95, .95, 1);
gl.frontFace(gl.CCW);
gl.enable(gl.CULL_FACE);
gl.cullFace(gl.BACK);

// Compile vertex shader. 
var vsSource = '' + 
    'attribute vec3 pos;' + 
    'attribute vec4 col;' +  // Color as an attribute
    'varying vec4 color;' + 
    'void main(){' + 
        'color = col;' + 
        'gl_Position = vec4(pos, 1);' +
    '}';
var vs = gl.createShader(gl.VERTEX_SHADER);
gl.shaderSource(vs, vsSource);
gl.compileShader(vs);

// Compile fragment shader.
var fsSource = 'precision mediump float;' + 
    'varying vec4 color;' + 
    'void main() {' + 
        'gl_FragColor = color;' + 
    '}';
var fs = gl.createShader(gl.FRAGMENT_SHADER);
gl.shaderSource(fs, fsSource);
gl.compileShader(fs);

// Link shader together into a program.
var prog = gl.createProgram();
gl.attachShader(prog, vs);
gl.attachShader(prog, fs);
gl.bindAttribLocation(prog, 0, "pos");
gl.bindAttribLocation(prog, 1, "col");
gl.linkProgram(prog);
gl.useProgram(prog);

// Vertex data.
var vertices, colors, indicesLines, indicesTris;
createVertexData();

// Setup position vertex buffer object.
var vboPos = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, vboPos);
gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);
var posAttrib = gl.getAttribLocation(prog, 'pos');
gl.vertexAttribPointer(posAttrib, 3, gl.FLOAT, false, 0, 0);
gl.enableVertexAttribArray(posAttrib);

// Setup color vertex buffer object for gradient.
var vboCol = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, vboCol);
gl.bufferData(gl.ARRAY_BUFFER, colors, gl.STATIC_DRAW);
var colAttrib = gl.getAttribLocation(prog, 'col');
gl.vertexAttribPointer(colAttrib, 4, gl.FLOAT, false, 0, 0);
gl.enableVertexAttribArray(colAttrib);

// Setup lines index buffer object.
var iboLines = gl.createBuffer();
gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, iboLines);
gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indicesLines, gl.STATIC_DRAW);
iboLines.numberOfElements = indicesLines.length;
gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);

// Setup tris index buffer object.
var iboTris = gl.createBuffer();
gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, iboTris);
gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indicesTris, gl.STATIC_DRAW);
iboTris.numberOfElements = indicesTris.length;
gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);

// Clear framebuffer and render primitives.
gl.clear(gl.COLOR_BUFFER_BIT);

// Render triangles with gradient colors.
gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, iboTris);
gl.drawElements(gl.TRIANGLES, iboTris.numberOfElements, gl.UNSIGNED_SHORT, 0);

// Render lines with a constant color.
gl.disableVertexAttribArray(colAttrib); // Disable color attribute for lines
gl.vertexAttrib4f(colAttrib, 0, 0, 1, 1); // Set line color to blue
gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, iboLines);
gl.drawElements(gl.LINES, iboLines.numberOfElements, gl.UNSIGNED_SHORT, 0);
gl.enableVertexAttribArray(colAttrib); // Re-enable color attribute for future use

function createVertexData(){
    var n = 64;
    var m = 32;
    var R = 0.6;
    var r = 0.2;
    
    vertices = new Float32Array(3 * (n+1) * (m+1));
    colors = new Float32Array(4 * (n+1) * (m+1));
    indicesLines = new Uint16Array(2 * 2 * n * m);
    indicesTris  = new Uint16Array(3 * 2 * n * m);

    var dt = 2 * Math.PI / n;
    var dp = 2 * Math.PI / m;
    var iLines = 0;
    var iTris = 0;

    for (var i = 0, t = 0; i <= n; i++, t += dt) {
        for (var j = 0, p = 0; j <= m; j++, p += dp) {
            var iVertex = i * (m+1) + j;
            var x = (R + r * Math.cos(p)) * Math.cos(t);
            var y = (R + r * Math.cos(p)) * Math.sin(t);
            var z = r * Math.sin(p);

            vertices[iVertex * 3] = x;
            vertices[iVertex * 3 + 1] = y;
            vertices[iVertex * 3 + 2] = z;

            var progress = i / n;
            if (progress <= 0.5) {
                colors[iVertex * 4] = 0.5 + progress;
                colors[iVertex * 4 + 1] = 0.9 * (1 - 2 * progress);
                colors[iVertex * 4 + 2] = 0.9 * (1 - 2 * progress);
            } else {
                var reverseProgress = (progress - 0.5) * 2;
                colors[iVertex * 4] = 1.0 - 0.5 * reverseProgress;
                colors[iVertex * 4 + 1] = 0.0 + 0.9 * reverseProgress;
                colors[iVertex * 4 + 2] = 0.0 + 0.9 * reverseProgress;
            }
            colors[iVertex * 4 + 3] = 1.0; // Alpha

            if (j > 0 && i > 0) {
                indicesLines[iLines++] = iVertex - 1;
                indicesLines[iLines++] = iVertex;
                indicesLines[iLines++] = iVertex - (m + 1);
                indicesLines[iLines++] = iVertex;

                indicesTris[iTris++] = iVertex;
                indicesTris[iTris++] = iVertex - 1;
                indicesTris[iTris++] = iVertex - (m + 1);
                indicesTris[iTris++] = iVertex - 1;
                indicesTris[iTris++] = iVertex - (m + 1) - 1;
                indicesTris[iTris++] = iVertex - (m + 1);
            }
        }
    }
}





// canvas2
var canvas2 = document.getElementById('canvas2');
var gl2 = canvas2.getContext('experimental-webgl');

// Pipeline setup.
gl2.clearColor(.95, .95, .95, 1);
gl2.frontFace(gl2.CCW);
gl2.enable(gl2.CULL_FACE);
gl2.cullFace(gl2.BACK);

// Compile vertex shader. 
var vsSource2 = '' + 
    'attribute vec3 pos;' + 
    'attribute vec4 col;' +  // Color as an attribute
    'varying vec4 color;' + 
    'void main(){' + 
        'color = col;' + 
        'gl_Position = vec4(pos, 1);' +
    '}';
var vs2 = gl2.createShader(gl2.VERTEX_SHADER);
gl2.shaderSource(vs2, vsSource2);
gl2.compileShader(vs2);

// Compile fragment shader.
var fsSource2 = 'precision mediump float;' + 
    'varying vec4 color;' + 
    'void main() {' + 
        'gl_FragColor = color;' + 
    '}';
var fs2 = gl2.createShader(gl2.FRAGMENT_SHADER);
gl2.shaderSource(fs2, fsSource2);
gl2.compileShader(fs2);

// Link shader together into a program.
var prog2 = gl2.createProgram();
gl2.attachShader(prog2, vs2);
gl2.attachShader(prog2, fs2);
gl2.bindAttribLocation(prog2, 0, "pos");
gl2.bindAttribLocation(prog2, 1, "col");
gl2.linkProgram(prog2);
gl2.useProgram(prog2);

// Vertex data.
var vertices2, colors2, indicesLines2, indicesTris2;
createVertexData2();

// Setup position vertex buffer object.
var vboPos2 = gl2.createBuffer();
gl2.bindBuffer(gl2.ARRAY_BUFFER, vboPos2);
gl2.bufferData(gl2.ARRAY_BUFFER, vertices2, gl.STATIC_DRAW);
var posAttrib2 = gl2.getAttribLocation(prog2, 'pos');
gl2.vertexAttribPointer(posAttrib2, 3, gl2.FLOAT, false, 0, 0);
gl2.enableVertexAttribArray(posAttrib2);

// Setup color vertex buffer object for gradient.
var vboCol2 = gl2.createBuffer();
gl2.bindBuffer(gl2.ARRAY_BUFFER, vboCol2);
gl2.bufferData(gl2.ARRAY_BUFFER, colors2, gl2.STATIC_DRAW);
var colAttrib2 = gl2.getAttribLocation(prog2, 'col');
gl2.vertexAttribPointer(colAttrib2, 4, gl2.FLOAT, false, 0, 0);
gl2.enableVertexAttribArray(colAttrib2);

// Setup lines index buffer object.
var iboLines2 = gl2.createBuffer();
gl2.bindBuffer(gl2.ELEMENT_ARRAY_BUFFER, iboLines2);
gl2.bufferData(gl2.ELEMENT_ARRAY_BUFFER, indicesLines2, gl2.STATIC_DRAW);
iboLines2.numberOfElements = indicesLines2.length;
gl2.bindBuffer(gl2.ELEMENT_ARRAY_BUFFER, null);

// Setup tris index buffer object.
var iboTris2 = gl2.createBuffer();
gl2.bindBuffer(gl2.ELEMENT_ARRAY_BUFFER, iboTris2);
gl2.bufferData(gl2.ELEMENT_ARRAY_BUFFER, indicesTris2, gl2.STATIC_DRAW);
iboTris2.numberOfElements = indicesTris2.length;
gl2.bindBuffer(gl2.ELEMENT_ARRAY_BUFFER, null);

// Clear framebuffer and render primitives.
gl2.clear(gl2.COLOR_BUFFER_BIT);

// Render triangles with gradient colors.
gl2.bindBuffer(gl2.ELEMENT_ARRAY_BUFFER, iboTris2);
gl2.drawElements(gl2.TRIANGLES, iboTris2.numberOfElements, gl2.UNSIGNED_SHORT, 0);

// Render lines with a constant color.
gl2.disableVertexAttribArray(colAttrib2); // Disable color attribute for lines
gl2.vertexAttrib4f(colAttrib2, 0, 0, 1, 1); // Set line color to blue
gl2.bindBuffer(gl2.ELEMENT_ARRAY_BUFFER, iboLines2);
gl2.drawElements(gl2.LINES, iboLines2.numberOfElements, gl2.UNSIGNED_SHORT, 0);
gl2.enableVertexAttribArray(colAttrib2); // Re-enable color attribute for future use

function createVertexData2(){
    var n = 24;
    var m = 3;
    var R = 0.6;
    var r = 0.2;
    
    vertices2 = new Float32Array(3 * (n+1) * (m+1) * 10);
    colors2 = new Float32Array(4 * (n+1) * (m+1) * 10);
    indicesLines2 = new Uint16Array(2 * 2 * n * m * 10);
    indicesTris2  = new Uint16Array(3 * 2 * n * m * 10);

    var dt = 2 * Math.PI / n;
    var dp = 2 * Math.PI / m;
  var k = 0;
    var iLines = 0;
    var iTris = 0;

    for (var k = 0; k <= 10; k++) {
      for (var i = 0, t = 0; i <= n; i++, t += dt) {
        for (var j = 0, p = 0; j <= m; j++, p += dp) {
            var iVertex = k * ((m + 1) * (n + 1)) + i * (m+1) + j;
            var x = (R + r * Math.cos(p)) * Math.cos(t) * k * 0.1;
            var y = (R + r * Math.cos(p)) * Math.sin(t);
            var z = r * Math.sin(p);

            vertices2[iVertex * 3] = x;
            vertices2[iVertex * 3 + 1] = y;
            vertices2[iVertex * 3 + 2] = z;
            var progress = i / n;
            if (progress <= 0.5) {
                colors2[iVertex * 4] = 0.5 + progress;
                colors2[iVertex * 4 + 1] = 0.5 + progress;
                colors2[iVertex * 4 + 2] = 0.9 * (1 - 2 * progress);
            } else {
                var reverseProgress = (progress - 0.5) * 2;
                colors2[iVertex * 4] = 1.0 - 0.5 * reverseProgress;
                colors2[iVertex * 4 + 1] = 1.0 - 0.5 * reverseProgress;
                colors2[iVertex * 4 + 2] = 0.0 + 0.9 * reverseProgress;
            }
            colors2[iVertex * 4 + 3] = 1.0; // Alpha

            if (j > 0 && i > 0) {
                indicesLines2[iLines++] = iVertex - 1;
                indicesLines2[iLines++] = iVertex;
                indicesLines2[iLines++] = iVertex - (m + 1);
                indicesLines2[iLines++] = iVertex;

                indicesTris2[iTris++] = iVertex;
                indicesTris2[iTris++] = iVertex - 1;
                indicesTris2[iTris++] = iVertex - (m + 1);
                indicesTris2[iTris++] = iVertex - 1;
                indicesTris2[iTris++] = iVertex - (m + 1) - 1;
                indicesTris2[iTris++] = iVertex - (m + 1);
            }
        }
    }
    }
}
