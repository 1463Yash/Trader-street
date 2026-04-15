import h5py
import json
import os

model_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), "./Nifty_50/nifty_50_model.h5")

with h5py.File(model_path, "r+") as f:
    model_config_str = f.attrs.get("model_config")
    if model_config_str is None:
        print("No model_config found in file.")
        exit(1)

    config = json.loads(model_config_str)

    def patch_config(obj):
        if isinstance(obj, dict):
            # Fix for Keras 3.x
            obj.pop("quantization_config", None)

            # Fix for Keras 2.15: InputLayer uses batch_input_shape, not batch_shape
            if obj.get("class_name") == "InputLayer":
                cfg = obj.get("config", {})
                if "batch_shape" in cfg:
                    cfg["batch_input_shape"] = cfg.pop("batch_shape")
                cfg.pop("optional", None)

            for v in obj.values():
                patch_config(v)
        elif isinstance(obj, list):
            for item in obj:
                patch_config(item)

    patch_config(config)

    f.attrs["model_config"] = json.dumps(config)
    print("Patched successfully.")
