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

function DataLoader() {
}

DataLoader.LoadAsync = function(url, callback, obj) {
    var req = new XMLHttpRequest();
    req.open("GET", url, true);
    req.responseType = 'arraybuffer';
    req.onreadystatechange = function() {
        if(req.readyState == 4) {
            if(req.status == 200 || req.status == 0) {
                callback(new DataView(req.response), obj);
            } else {
                alert('Could not load ' + url + ' (' + req.status + ')');
            }
        }
    };

    req.send(null);
};

//DataView
//int[]
//int,return
DataLoader.ReadInt32 = function(data_view, offset_ref) {
    var v = data_view.getInt32(offset_ref[0], true);
    offset_ref[0] += 4;
    return v;
};

DataLoader.ReadFloat32 = function(data_view, offset_ref) {
    var v = data_view.getFloat32(offset_ref[0], true);
    offset_ref[0] += 4;
    return v;
};

DataLoader.ReadUint16 = function(data_view, offset_ref) {
    var v = data_view.getUint16(offset_ref[0], true);
    offset_ref[0] += 2;
    return v;
};

DataLoader.ReadUint8 = function(data_view, offset_ref) {
    var v = data_view.getUint8(offset_ref[0]);
    offset_ref[0] += 1;
    return v;
};

//DataView
//int[]
//int
//String,return
DataLoader.ReadUTF8String = function(data_view, offset_ref, size) {
    var out = [], i = 0;
    var o = 0;
    var offset = offset_ref[0];

    while(i < size) {
        var c = data_view.getUint8(offset + (i++));

        if(c < 128) {
            out[o++] = String.fromCharCode(c);
        } else if(c > 191 && c < 224) {
            var c2 = data_view.getUint8(offset + (i++));
            out[o++] = String.fromCharCode((c & 31) << 6 | c2 & 63);
        } else {
            var c2 = data_view.getUint8(offset + (i++));
            var c3 = data_view.getUint8(offset + (i++));
            out[o++] = String.fromCharCode((c & 15) << 12 | (c2 & 63) << 6 | c3 & 63);
        }
    }

    offset_ref[0] += size;

    return out.join('');
};