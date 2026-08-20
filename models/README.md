# Model artifacts

Place local YOLO weights in `models/weights/`. Weight files are intentionally
ignored by Git because they can be large and may have separate licensing or
distribution requirements.

Record the following beside every trained model in the future:

- model version and base architecture
- dataset version and split manifest
- class definitions
- training configuration and random seed
- validation metrics and selected thresholds
- export format and target hardware
