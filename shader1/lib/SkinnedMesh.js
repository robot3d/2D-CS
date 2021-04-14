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

function SkinnedMesh() {
    this.loaded = false;
    this.vertices = null;
    this.uv = null;
    this.indices = null;
    this.bone_indices = null;
    this.bone_weights = null;
    this.bind_poses = null;
    this.bone_array = null;
    this.bone_map = null;
    this.bone_refs = null;
    this.bone_mats = null;
    this.clips = null;
    this.onload = null;

    this.time = 0;

    function evaluate(t, k0, k1) {
        var dt = k1.time - k0.time;
        if(Math.abs(dt) < 0.0000001)
        {
            return k0.value;
        }

        var t = (t - k0.time) / dt;
        var t2 = t * t;
        var t3 = t2 * t;
        var _t = 1 - t;
        var _t2 = _t * _t;
        var _t3 = _t2 * _t;

        var c = 1 / 3.0;
        var c0 = dt * c * k0.tan_out + k0.value;
        var c1 = - dt * c * k1.tan_in + k1.value;
        var value = k0.value * _t3 + 3 * c0 * t * _t2 + 3 * c1 * t2 * _t + k1.value * t3;

        return value;
    }

    function curve_evaluate(keys, t) {
        for(var i=0; i<keys.length; i++) {
            var f = keys[i];

            if(t < f['time']) {
                if(i == 0) {
                    return f['value'];
                } else {
                    return evaluate(t, keys[i-1], f);
                }
            }
        }

        return 0;
    }

    function update_clip(mesh) {
        var clip = mesh.clips['Idle'];

        if(mesh.time == 0) {
            mesh.time = new Date().getTime();
        }
        var now = new Date().getTime();
        var t = (now - mesh.time) / 1000;
        var ct = t / clip['len'];
        ct = (ct - Math.floor(ct)) * clip['len'];

        var curves = clip['curves'];
        for(var i=0; i<curves.length; i++) {
            var c = curves[i];

            var path = c['path'];
            var paths = path.split('/');
            var property = c['property'];
            var keys = c['keys'];

            var bone = null;
            for(var j=0; j<paths.length; j++) {
                if(bone == null) {
                    bone = mesh.bone_map[paths[j]];
                } else {
                    bone = bone['children'][paths[j]];
                }
            }

            var value = curve_evaluate(keys, ct);

            switch(property) {
                case "m_LocalPosition.x":
                    bone['pos_loc'][0] = value;
                    break;
                case "m_LocalPosition.y":
                    bone['pos_loc'][1] = value;
                    break;
                case "m_LocalPosition.z":
                    bone['pos_loc'][2] = value;
                    break;

                case "m_LocalRotation.x":
                    bone['rot_loc'].array[0] = value;
                    break;
                case "m_LocalRotation.y":
                    bone['rot_loc'].array[1] = value;
                    break;
                case "m_LocalRotation.z":
                    bone['rot_loc'].array[2] = value;
                    break;
                case "m_LocalRotation.w":
                    bone['rot_loc'].array[3] = value;
                    break;

                case "m_LocalScale.x":
                    bone['sca_loc'][0] = value;
                    break;
                case "m_LocalScale.y":
                    bone['sca_loc'][1] = value;
                    break;
                case "m_LocalScale.z":
                    bone['sca_loc'][2] = value;
                    break;
            }
        }
    }

    SkinnedMesh.prototype.updateBone = function(t, r, s) {
        if(this.bone_mats == null) {
            this.bone_mats = [];
        }

        update_clip(this);

        var trs = Matrix4x4.TRS(t, r, s);
        var rq = Quaternion.Euler(r);

        for(var i=0; i<this.bone_array.length; i++) {
            var bone = this.bone_array[i];

            if(bone.parent == null) {
                bone.pos = trs.multiplyPoint3x4(bone.pos_loc);
                bone.rot = rq.multiply(bone.rot_loc);
                bone.sca = [s[0] * bone.sca_loc[0], s[1] * bone.sca_loc[1], s[2] * bone.sca_loc[2]];
            } else {
                bone.pos = bone.parent.mat_local_to_world.multiplyPoint3x4(bone.pos_loc);
                bone.rot = bone.parent.rot.multiply(bone.rot_loc);

                var sca = bone.parent.sca;
                bone.sca = [sca[0] * bone.sca_loc[0], sca[1] * bone.sca_loc[1], sca[2] * bone.sca_loc[2]];
            }

            bone.mat_local_to_world = Matrix4x4.TQS(bone.pos, bone.rot.array, bone.sca);
        }

        for(var i=0; i<this.bind_poses.length; i++) {
            this.bone_mats[i] = this.bone_refs[i].mat_local_to_world;
        }

        return this.bone_mats;
    };
}

SkinnedMesh.Load = function(url, onload) {
    var m = new SkinnedMesh();
    m.onload = onload;

    DataLoader.LoadAsync(url, on_mesh_data_load, m);

    return m;
};

function on_mesh_data_load(data, mesh) {
    var offset = [0];
    read_string(data, offset);

    var bone_count = DataLoader.ReadInt32(data, offset);
    var bone_array = [];
    var bone_map = [];
    for(var i=0; i<bone_count; i++) {
        var b_name = read_string(data, offset);
        var b_pos = read_vector3(data, offset);
        var b_rot = read_quaternion(data, offset);
        var b_sca = read_vector3(data, offset);
        var parent = DataLoader.ReadInt32(data, offset);

        var b = {
            name:b_name,
            pos_loc:b_pos,
            rot_loc:new Quaternion().set(b_rot),
            sca_loc:b_sca,
            children:{}
        };
        if(parent >= 0) {
            b['parent'] = bone_array[parent];
            b['parent']['children'][b_name] = b;
        } else {
            b['parent'] = null;
        }

        bone_array[i] = b;
        bone_map[b_name] = b;
    }
    mesh.bone_array = bone_array;
    mesh.bone_map = bone_map;

    var clip_count = DataLoader.ReadInt32(data, offset);
    var clips = {};
    for(var i=0; i<clip_count; i++) {
        var c_name = read_string(data, offset);
        c_name = c_name.substr(0, c_name.indexOf('_'));

        var fps = DataLoader.ReadFloat32(data, offset);
        var len = DataLoader.ReadFloat32(data, offset);
        var mode = DataLoader.ReadUint8(data, offset);

        var curve_count = DataLoader.ReadInt32(data, offset);
        var curves = [];
        for(var j=0; j<curve_count; j++) {
            var path = read_string(data, offset);
            var property = read_string(data, offset);

            var key_count = DataLoader.ReadInt32(data, offset);
            var keys = [];
            for(var k=0; k<key_count; k++) {
                var tan_in = DataLoader.ReadFloat32(data, offset);
                var tan_out = DataLoader.ReadFloat32(data, offset);
                var tan_mode = DataLoader.ReadInt32(data, offset);
                var time = DataLoader.ReadFloat32(data, offset);
                var value = DataLoader.ReadFloat32(data, offset);

                keys[k] = {
                    tan_in:tan_in,
                    tan_out:tan_out,
                    tan_mode:tan_mode,
                    time:time,
                    value:value
                };
            }

            curves[j] = {
                path:path,
                property:property,
                keys:keys
            };
        }

        clips[c_name] = {
            name:c_name,
            fps:fps,
            len:len,
            mode:mode,
            curves:curves
        };
    }
    mesh.clips = clips;

    var renderer_count = DataLoader.ReadInt32(data, offset);
    for(var i=0; i<renderer_count; i++) {
        var r_name = read_string(data, offset);
        var r_pos = read_vector3(data, offset);
        var r_rot = read_quaternion(data, offset);
        var r_sca = read_vector3(data, offset);

        var r_bone_count = DataLoader.ReadInt32(data, offset);
        var r_bones = [];
        for(var i=0; i<r_bone_count; i++) {
            var index = DataLoader.ReadInt32(data, offset);
            if(index >= 0) {
                r_bones[i] = bone_array[index];
            } else {
                r_bones[i] = null;
            }
        }
        mesh.bone_refs = r_bones;

        break;
    }

    //read mesh
    {
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

        var bind_pose_count = DataLoader.ReadInt32(data, offset);
        var bind_poses = [];
        for(var j=0; j<bind_pose_count; j++) {
            var mat = new Matrix4x4();
            for(var k=0; k<16; k++) {
                mat.array[k] = DataLoader.ReadFloat32(data, offset);
            }

            bind_poses[j] = mat;
        }
        mesh.bind_poses = bind_poses;

        var bone_weight_count = DataLoader.ReadInt32(data, offset);
        var bone_indices = new Float32Array(bone_weight_count * 4);
        var bone_weights = new Float32Array(bone_weight_count * 4);
        for(var j=0; j<bone_weight_count; j++) {
            var i0 = DataLoader.ReadInt32(data, offset);
            var i1 = DataLoader.ReadInt32(data, offset);
            var i2 = DataLoader.ReadInt32(data, offset);
            var i3 = DataLoader.ReadInt32(data, offset);

            bone_indices.set([i0, i1, i2, i3], j*4);

            var w0 = DataLoader.ReadFloat32(data, offset);
            var w1 = DataLoader.ReadFloat32(data, offset);
            var w2 = DataLoader.ReadFloat32(data, offset);
            var w3 = DataLoader.ReadFloat32(data, offset);

            bone_weights.set([w0, w1, w2, w3], j*4);
        }
        mesh.bone_indices = bone_indices;
        mesh.bone_weights = bone_weights;
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