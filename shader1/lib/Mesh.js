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

function Mesh() {
    this.loaded = false;
    this.vertices = null;
    this.uv = null;
    this.indices = null;
    this.onload = null;
}

Mesh.Load = function(url, onload) {
    var m = new Mesh();
    m.onload = onload;

    DataLoader.LoadAsync(url, on_mesh_data_load, m);

    return m;
};

function on_mesh_data_load(data, mesh) {
    var offset = [0];
    read_string(data, offset);

    var mesh_count = DataLoader.ReadInt32(data, offset);

    for(var i=0; i<mesh_count; i++) {
        var name = read_string(data, offset);
        var position = read_vector3(data, offset);
        var rotation = read_quaternion(data, offset);
        var scale = read_vector3(data, offset);

        var vertex_count = DataLoader.ReadInt32(data, offset);
        var vertices = new Float32Array(vertex_count * 3);
        for(var j=0; j<vertex_count; j++) {
            var v = read_vector3(data, offset);
            vertices.set(v, j*3);
        }
        mesh.vertices = vertices;

        var color_count = DataLoader.ReadInt32(data, offset);
        var colors = new Float32Array(color_count * 4);
        for(var j=0; j<color_count; j++) {
            //read color
            var v = read_quaternion(data, offset);
            colors.set(v, j*4);
        }

        var uv_count = DataLoader.ReadInt32(data, offset);
        var uvs = new Float32Array(uv_count * 2);
        for(var j=0; j<uv_count; j++) {
            var x = DataLoader.ReadFloat32(data, offset);
            var y = 1 - DataLoader.ReadFloat32(data, offset);
            uvs.set([x, y], j*2);
        }
        mesh.uv = uvs;

        var uv2_count = DataLoader.ReadInt32(data, offset);
        var uv2s = new Float32Array(uv2_count * 2);
        for(var j=0; j<uv2_count; j++) {
            var x = DataLoader.ReadFloat32(data, offset);
            var y = 1 - DataLoader.ReadFloat32(data, offset);
            uv2s.set([x, y], j*2);
        }

        var normal_count = DataLoader.ReadInt32(data, offset);
        var normals = new Float32Array(normal_count * 3);
        for(var j=0; j<normal_count; j++) {
            var v = read_vector3(data, offset);
            normals.set(v, j*3);
        }

        var tangent_count = DataLoader.ReadInt32(data, offset);
        var tangents = new Float32Array(tangent_count * 4);
        for(var j=0; j<tangent_count; j++) {
            //read vector4
            var v = read_quaternion(data, offset);
            tangents.set(v, j*4);
        }

        var index_count = DataLoader.ReadInt32(data, offset);
        var indices = new Uint16Array(index_count);
        for(var j=0; j<index_count; j++) {
            var v = DataLoader.ReadUint16(data, offset);
            indices[j] = v;
        }
        mesh.indices = indices;

        var submeshs = [];
        var submesh_count = DataLoader.ReadInt32(data, offset);
        for(var j=0; j<submesh_count; j++) {
            var sub_count = DataLoader.ReadInt32(data, offset);
            var sub_indices = new Uint16Array(index_count);
            for(var k=0; k<sub_count; k++) {
                var v = DataLoader.ReadUint16(data, offset);
                sub_indices[k] = v;
            }

            submeshs[j] = sub_indices;
        }

        break;
    }

    mesh.loaded = true;

    mesh.onload(mesh);
};

function read_string(data, offset) {
    var size = DataLoader.ReadInt32(data, offset);
    return DataLoader.ReadUTF8String(data, offset, size);
}

function read_vector3(data, offset) {
    var x = DataLoader.ReadFloat32(data, offset);
    var y = DataLoader.ReadFloat32(data, offset);
    var z = DataLoader.ReadFloat32(data, offset);

    return [x, y, z];
}

function read_quaternion(data, offset) {
    var x = DataLoader.ReadFloat32(data, offset);
    var y = DataLoader.ReadFloat32(data, offset);
    var z = DataLoader.ReadFloat32(data, offset);
    var w = DataLoader.ReadFloat32(data, offset);

    return [x, y, z, w];
}