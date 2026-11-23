#!/usr/bin/env python3
"""Convert the official Real-ESRGAN x4plus weights (.pth) to an ONNX model.

Works without PyTorch: the .pth zip is read with a restricted unpickler that
only rebuilds plain float tensors, and the RRDBNet graph is written with the
onnx helper API. Weights: https://github.com/xinntao/Real-ESRGAN (BSD-3).

usage: pth_to_onnx.py RealESRGAN_x4plus.pth out.onnx
"""
import pickle
import sys
import zipfile
from collections import OrderedDict

import numpy as np
import onnx
from onnx import TensorProto, helper, numpy_helper

DTYPES = {"FloatStorage": np.float32, "HalfStorage": np.float16}


class _Storage:
    def __init__(self, name):
        self.name = name


def load_state_dict(path):
    zf = zipfile.ZipFile(path)
    prefix = zf.namelist()[0].split("/")[0]

    def rebuild(storage, offset, size, stride, *_):
        dtype, key = storage
        raw = np.frombuffer(zf.read(f"{prefix}/data/{key}"), dtype=dtype)
        if not size:
            return raw[offset:offset + 1].reshape(())
        itemsize = raw.itemsize
        return np.lib.stride_tricks.as_strided(
            raw[offset:], shape=size, strides=[s * itemsize for s in stride]
        ).copy()

    class Unpickler(pickle.Unpickler):
        def find_class(self, module, name):
            if module == "collections" and name == "OrderedDict":
                return OrderedDict
            if module == "torch._utils" and name == "_rebuild_tensor_v2":
                return rebuild
            if module == "torch" and name in DTYPES:
                return _Storage(name)
            raise pickle.UnpicklingError(f"refusing to load {module}.{name}")

        def persistent_load(self, pid):
            _, storage_type, key, _location, _numel = pid
            return (DTYPES[storage_type.name], key)

    obj = Unpickler(zf.open(f"{prefix}/data.pkl")).load()
    for k in ("params_ema", "params"):
        if isinstance(obj, dict) and k in obj:
            return obj[k]
    return obj


def build(sd):
    nodes, inits = [], []
    counter = [0]

    def name(p):
        counter[0] += 1
        return f"{p}_{counter[0]}"

    def conv(x, key):
        w, b = sd[f"{key}.weight"], sd[f"{key}.bias"]
        inits.append(numpy_helper.from_array(w.astype(np.float32), f"{key}.weight"))
        inits.append(numpy_helper.from_array(b.astype(np.float32), f"{key}.bias"))
        out = name(key)
        nodes.append(helper.make_node("Conv", [x, f"{key}.weight", f"{key}.bias"], [out],
                                      pads=[1, 1, 1, 1], kernel_shape=[3, 3]))
        return out

    def lrelu(x):
        out = name("lrelu")
        nodes.append(helper.make_node("LeakyRelu", [x], [out], alpha=0.2))
        return out

    def cat(xs):
        out = name("cat")
        nodes.append(helper.make_node("Concat", xs, [out], axis=1))
        return out

    inits.append(numpy_helper.from_array(np.array(0.2, np.float32), "k02"))

    def scaled_add(x, res):
        m, a = name("mul"), name("add")
        nodes.append(helper.make_node("Mul", [x, "k02"], [m]))
        nodes.append(helper.make_node("Add", [m, res], [a]))
        return a

    def rdb(x, key):
        x1 = lrelu(conv(x, f"{key}.conv1"))
        x2 = lrelu(conv(cat([x, x1]), f"{key}.conv2"))
        x3 = lrelu(conv(cat([x, x1, x2]), f"{key}.conv3"))
        x4 = lrelu(conv(cat([x, x1, x2, x3]), f"{key}.conv4"))
        x5 = conv(cat([x, x1, x2, x3, x4]), f"{key}.conv5")
        return scaled_add(x5, x)

    inits.append(numpy_helper.from_array(np.array([1, 1, 2, 2], np.float32), "up2"))

    def up(x):
        out = name("up")
        nodes.append(helper.make_node("Resize", [x, "", "up2"], [out], mode="nearest"))
        return out

    n_blocks = 1 + max(int(k.split(".")[1]) for k in sd if k.startswith("body."))
    feat = conv("input", "conv_first")
    x = feat
    for i in range(n_blocks):
        y = rdb(rdb(rdb(x, f"body.{i}.rdb1"), f"body.{i}.rdb2"), f"body.{i}.rdb3")
        x = scaled_add(y, x)
    body = conv(x, "conv_body")
    feat2 = name("feat")
    nodes.append(helper.make_node("Add", [feat, body], [feat2]))
    f = lrelu(conv(up(feat2), "conv_up1"))
    f = lrelu(conv(up(f), "conv_up2"))
    f = lrelu(conv(f, "conv_hr"))
    out = conv(f, "conv_last")
    nodes.append(helper.make_node("Identity", [out], ["output"]))

    graph = helper.make_graph(
        nodes, "realesrgan_x4plus",
        [helper.make_tensor_value_info("input", TensorProto.FLOAT, [1, 3, "h", "w"])],
        [helper.make_tensor_value_info("output", TensorProto.FLOAT, [1, 3, "H", "W"])],
        inits,
    )
    model = helper.make_model(graph, opset_imports=[helper.make_opsetid("", 17)])
    model.ir_version = 8
    onnx.checker.check_model(model)
    return model


if __name__ == "__main__":
    if len(sys.argv) != 3:
        sys.exit(__doc__)
    onnx.save(build(load_state_dict(sys.argv[1])), sys.argv[2])
    print("wrote", sys.argv[2])
