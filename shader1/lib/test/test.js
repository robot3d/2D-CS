console.log("Hello,World!!!!!!!");
////////////////////////////////////////////////////////////////////////////////////////////
//  Copyright (C) 2015 ZeroWorks.Co.Ltd. All rights reserved.
//  Author:D.J http://blog.csdn.net/crystal_do
//
//  Licensed under the Apache License, Version 2.0 (the "License");
//  you may not use this file except in compliance with the License.
//  You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0
//
//  Unless required by applicable law or agreed to in writing, software
//  distributed under the License is distributed on an "AS IS" BASIS,
//  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
//  See the License for the specific language governing permissions and
//  limitations under the License.
////////////////////////////////////////////////////////////////////////////////////////////
var gl = null;
var frame = 0;
var time = 0;
var vertex_buffer = null;
var weights_buffer = null;
var indices_buffer = null;
var uv_buffer = null;
var index_buffer = null;
var program = null;
var texture = null;
var mesh = null;
var shader_src_vs = "\
    uniform mat4 u_mat_vp;\
    uniform mat4 u_bones[48];\
    attribute vec4 a_position;\
    attribute vec4 a_weights;\
    attribute vec4 a_indices;\
    attribute vec2 a_uv;\
    varying vec2 v_uv;\
    void main()\
    {\
        vec4 skinned_pos_world = vec4(0.0);\
        int indices[4];\
        indices[0] = int(a_indices.x);\
        indices[1] = int(a_indices.y);\
        indices[2] = int(a_indices.z);\
        indices[3] = int(a_indices.w);\
        float weights[4];\
        weights[0] = a_weights.x;\
        weights[1] = a_weights.y;\
        weights[2] = a_weights.z;\
        weights[3] = a_weights.w;\
        for(int i=0; i<4; i++) {\
            float weight = weights[i];\
            int index = indices[i];\
            if(weight > 0.0) {\
                vec4 world = a_position * u_bones[index];\
                skinned_pos_world += world * weight;\
            }\
        }\
        gl_Position = skinned_pos_world * u_mat_vp;\
        v_uv = a_uv;\
    }\
";
var shader_src_ps = "\
    precision highp float;\
    uniform sampler2D u_tex;\
    varying vec2 v_uv;\
    void main()\
    {\
        gl_FragColor = texture2D(u_tex, v_uv);\
    }\
";
onload = function () {
    var c = document.getElementById('canvas');
    gl = c.getContext('experimental-webgl');
    init_gl();
    render();
};
function init_gl() {
    gl.clearColor(0.0, 0.0, 1.0, 1.0);
    gl.enable(gl.DEPTH_TEST);
    gl.enable(gl.CULL_FACE);
    gl.frontFace(gl.CW);
    create_shader();
    create_buffer();
    create_texture();
}
function render() {
    update_fps();
    gl.clear(gl.COLOR_BUFFER_BIT);
    if (texture != null && mesh.loaded) {
        gl.useProgram(program);
        var index_vp = gl.getUniformLocation(program, "u_mat_vp");
        var index_bones = gl.getUniformLocation(program, "u_bones");
        var index_pos = gl.getAttribLocation(program, "a_position");
        var index_weights = gl.getAttribLocation(program, "a_weights");
        var index_indices = gl.getAttribLocation(program, "a_indices");
        var index_uv = gl.getAttribLocation(program, "a_uv");
        var index_tex = gl.getUniformLocation(program, "u_tex");
        var mat_v = Matrix4x4.LookTo([0, 0, -3], [0, 0, 1], [0, 1, 0]);
        var ratio = gl.drawingBufferWidth / gl.drawingBufferHeight;
        var mat_p = Matrix4x4.Perspective(45, ratio, 0.3, 100);
        var mat_vp = mat_p.multiply(mat_v);
        var bones = mesh.updateBone([0, -1, 0], [0, 180, 0], [1, 1, 1]);
        var bones_buffer = new Float32Array(bones.length * 16);
        for (var i = 0; i < bones.length; i++) {
            var bone = bones[i].multiply(mesh.bind_poses[i]);
            bones_buffer.set(bone.array, i * 16);
        }
        gl.uniformMatrix4fv(index_vp, gl.FALSE, mat_vp.array);
        gl.uniformMatrix4fv(index_bones, gl.FALSE, bones_buffer);
        gl.bindBuffer(gl.ARRAY_BUFFER, vertex_buffer);
        gl.enableVertexAttribArray(index_pos);
        gl.vertexAttribPointer(index_pos, 3, gl.FLOAT, gl.FALSE, 0, 0);
        gl.bindBuffer(gl.ARRAY_BUFFER, weights_buffer);
        gl.enableVertexAttribArray(index_weights);
        gl.vertexAttribPointer(index_weights, 4, gl.FLOAT, gl.FALSE, 0, 0);
        gl.bindBuffer(gl.ARRAY_BUFFER, indices_buffer);
        gl.enableVertexAttribArray(index_indices);
        gl.vertexAttribPointer(index_indices, 4, gl.FLOAT, gl.FALSE, 0, 0);
        gl.bindBuffer(gl.ARRAY_BUFFER, uv_buffer);
        gl.enableVertexAttribArray(index_uv);
        gl.vertexAttribPointer(index_uv, 2, gl.FLOAT, gl.FALSE, 0, 0);
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.uniform1i(index_tex, 0);
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, index_buffer);
        gl.drawElements(gl.TRIANGLES, mesh.indices.length, gl.UNSIGNED_SHORT, 0);
    }
    window.requestAnimationFrame(render);
}
function update_fps() {
    frame++;
    var now = new Date().getTime();
    if (now - time > 1000) {
        var c2d = document.getElementById('canvas2d').getContext('2d');
        c2d.clearRect(0, 0, c2d.canvas.width, c2d.canvas.height);
        c2d.font = "20px Consolas";
        c2d.fillStyle = "#00ff00";
        c2d.fillText("FPS:" + frame, 5, 20);
        time = now;
        frame = 0;
    }
}
function create_shader() {
    var vs = gl.createShader(gl.VERTEX_SHADER);
    var fs = gl.createShader(gl.FRAGMENT_SHADER);
    gl.shaderSource(vs, shader_src_vs);
    gl.shaderSource(fs, shader_src_ps);
    gl.compileShader(vs);
    gl.compileShader(fs);
    if (!gl.getShaderParameter(vs, gl.COMPILE_STATUS)) {
        alert(gl.getShaderInfoLog(vs));
        return;
    }
    if (!gl.getShaderParameter(fs, gl.COMPILE_STATUS)) {
        alert(gl.getShaderInfoLog(fs));
        return;
    }
    program = gl.createProgram();
    gl.attachShader(program, vs);
    gl.attachShader(program, fs);
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
        alert(gl.getProgramInfoLog(program));
        return;
    }
}
function create_buffer() {
    mesh = SkinnedMesh.Load("resources/ranger.skin", function (m) {
        vertex_buffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, vertex_buffer);
        gl.bufferData(gl.ARRAY_BUFFER, m.vertices, gl.STATIC_DRAW);
        weights_buffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, weights_buffer);
        gl.bufferData(gl.ARRAY_BUFFER, m.bone_weights, gl.STATIC_DRAW);
        indices_buffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, indices_buffer);
        gl.bufferData(gl.ARRAY_BUFFER, m.bone_indices, gl.STATIC_DRAW);
        uv_buffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, uv_buffer);
        gl.bufferData(gl.ARRAY_BUFFER, m.uv, gl.STATIC_DRAW);
        index_buffer = gl.createBuffer();
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, index_buffer);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(m.indices), gl.STATIC_DRAW);
    });
}
function create_texture() {
    var tex = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, tex);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    var img = new Image();
    img.onload = function () {
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, img);
        texture = tex;
    };
    img.src = "resources/ranger.png";
}
//# sourceMappingURL=test.js.map