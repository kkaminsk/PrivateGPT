## 1. Extract PNG Images from ICO
- [x] 1.1 Use ImageMagick or similar tool to extract/convert ICO to PNG at 512px
- [x] 1.2 Generate resized versions: 310px, 256px, 150px, 50px, 44px
- [x] 1.3 Replace files in `icon/` directory

## 2. Validation
- [x] 2.1 Verify all PNG files exist with correct dimensions
- [ ] 2.2 Build MSIX package with `npm run build:win:msix`
- [ ] 2.3 Run `npm start` and verify window icon displays correctly
- [ ] 2.4 Verify Start Menu tile shows new icon after install
