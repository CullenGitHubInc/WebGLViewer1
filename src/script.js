// establishing the function of the scaling matrix in order to use the slider to control the changes
function scalingMatrix(scale) {
    return new Float32Array([
        scale, 0.0,  0.0, 0.0,
        0.0, scale, 0.0, 0.0,
        0.0, 0.0,  1.0, 0.0,
        0.0, 0.0,  0.0, 1.0
    ]);
}

// this is to initialize the context of WebGL
const canvas = document.getElementById("glCanvas");
const gl = canvas.getContext("webgl");

if (!gl) {
    alert("WebGL not supported in this browser.");
}

// vertex shader
const vertexShaderSource = `
    attribute vec2 aPosition;
    attribute vec3 aColor;
    varying vec3 vColor;

    uniform mat4 uTransformMatrix;

    void main() {
        gl_Position = uTransformMatrix * vec4(aPosition, 0.0, 1.0);
        vColor = aColor;
    }
`;

// code for fragment shader
const fragmentShaderSource = `
    precision mediump float;
    varying vec3 vColor;

    void main() {
        gl_FragColor = vec4(vColor, 1.0);
    }
`;

// this is to compile the shader function
function createShader(gl, type, source) {
    const shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        console.error("Shader compile error:", gl.getShaderInfoLog(shader));
        gl.deleteShader(shader);
        return null;
    }
    return shader;
}

// linking the shaders
function createProgram(gl, vertexShader, fragmentShader) {
    const program = gl.createProgram();
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
        console.error("Program link error:", gl.getProgramInfoLog(program));
        return null;
    }
    return program;
}

// create the shaders and compile them
const vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource);

// linking shaders into WebGL
const program = createProgram(gl, vertexShader, fragmentShader);
gl.useProgram(program);

// triangle vertices and colors
const vertices = new Float32Array([
    // x, y       r, g, b
    0.0,  0.5,   1.0, 0.0, 0.0,  // Vertex 1: Red
    -0.5, -0.5,   0.0, 1.0, 0.0,  // Vertex 2: Green
    0.5, -0.5,   0.0, 0.0, 1.0   // Vertex 3: Blue
]);

// formation of buffer and bind data
const buffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

// setting up position and color attributes
const aPosition = gl.getAttribLocation(program, "aPosition");
gl.vertexAttribPointer(aPosition, 2, gl.FLOAT, false, 5 * Float32Array.BYTES_PER_ELEMENT, 0);
gl.enableVertexAttribArray(aPosition);

const aColor = gl.getAttribLocation(program, "aColor");
gl.vertexAttribPointer(aColor, 3, gl.FLOAT, false, 5 * Float32Array.BYTES_PER_ELEMENT, 2 * Float32Array.BYTES_PER_ELEMENT);
gl.enableVertexAttribArray(aColor);

// finding where the uTransformMatrix in the shader is located
const uTransformMatrix = gl.getUniformLocation(program, "uTransformMatrix");

// this is to set the initial scale
let scale = 1.0;
gl.uniformMatrix4fv(uTransformMatrix, false, scalingMatrix(scale));

// rendering function for drawing a triangle
function render() {
    gl.clearColor(0.0, 0.0, 0.0, 1.0); // Clear with black background
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.drawArrays(gl.TRIANGLES, 0, 3); // Draw the triangle
}

render(); // initializing render call

// this includes the slider event listener in order to adjust the scale based on near-far distance
document.getElementById("depthSlider").oninput = function (event) {
    scale = parseFloat(event.target.value) / 2.5; // Adjust scale based on slider value
    gl.uniformMatrix4fv(uTransformMatrix, false, scalingMatrix(scale));
    render(); // this draws the triangle again with a new transformation
};



