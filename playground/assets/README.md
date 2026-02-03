# Playground Assets

This directory contains assets used in the playground demos and examples.

## Structure

```
assets/
├── audio/          # Audio files for playground demos
├── video/          # Video files for playground demos
├── images/         # Image files for playground demos
└── README.md       # This file
```

## Adding Your Assets

1. Place your files in the appropriate subdirectory:
   - Audio files → `audio/`
   - Video files → `video/`
   - Images → `images/`

2. Reference them in your playground specs:
   ```json
   {
     "scenes": [{
       "layers": [{
         "type": "image",
         "config": {
           "src": "/playground/assets/images/your-image.png"
         }
       }]
     }]
   }
   ```

## Recommended Formats

- **Audio**: MP3 (best compatibility), OGG (smaller size)
- **Video**: MP4 with H.264 codec
- **Images**: PNG (transparency), JPG (photos), SVG (graphics)
