# Default Assets

This directory contains default assets that ship with the cinematic-renderer2d library for demos and examples.

## Structure

```
assets/
├── audio/          # Audio files (mp3, ogg, wav)
├── video/          # Video files (mp4, webm)
├── images/         # Image files (png, jpg, svg)
└── README.md       # This file
```

## Usage

These assets can be referenced in your cinematic specs:

```json
{
  "scenes": [{
    "layers": [{
      "type": "image",
      "config": {
        "src": "/assets/images/your-image.png"
      }
    }],
    "audio": [{
      "src": "/assets/audio/your-audio.mp3"
    }]
  }]
}
```

## Asset Guidelines

- **Audio**: Keep files under 5MB, use MP3 format for best compatibility
- **Video**: Keep files under 10MB, use MP4 (H.264) for best compatibility
- **Images**: Use PNG for transparency, JPG for photos, SVG for graphics
- All assets should be optimized for web delivery
