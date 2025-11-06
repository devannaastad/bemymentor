# Logo Setup Instructions

## Files You Need to Add

Please add the following image files to your project. You can use the logo image you uploaded (the gold/yellow BeMyMentor logo on black background).

### 1. Main Logo for Navbar
**Location:** `/public/logo.png`
- **Size:** 512x512px (or larger, will be scaled down)
- **Format:** PNG with transparent background preferred
- **Usage:** Displays in the top-left corner of the navbar

### 2. Favicon (Browser Tab Icon)
**Location:** `/app/favicon.ico`
- **Size:** 32x32px or 16x16px
- **Format:** .ico file
- **Usage:** Shows in the browser tab
- **Note:** There's already a favicon.ico file here, replace it with your logo

### 3. App Icon (High Resolution)
**Location:** `/app/icon.png`
- **Size:** 512x512px
- **Format:** PNG
- **Usage:** Used for PWA and high-resolution displays

### 4. Apple Touch Icon
**Location:** `/app/apple-icon.png`
- **Size:** 180x180px
- **Format:** PNG
- **Usage:** Used when users add your site to their iPhone/iPad home screen

## How to Create These Files

### Option 1: Using Online Tools
1. Go to https://realfavicongenerator.net/
2. Upload your logo image
3. Download the generated package
4. Place the files in the correct locations as listed above

### Option 2: Using Image Editor
1. Open your logo in an image editor (Photoshop, GIMP, Figma, etc.)
2. Create the following sizes:
   - 512x512px → Save as `/public/logo.png` and `/app/icon.png`
   - 180x180px → Save as `/app/apple-icon.png`
   - 32x32px → Save as `/app/favicon.ico` (use an ICO converter)

### Option 3: Simple Copy (Quick Start)
1. Save your logo as `/public/logo.png` (any reasonable size, 512x512 recommended)
2. Make a copy and save it as `/app/icon.png`
3. Make a smaller version (180x180) and save as `/app/apple-icon.png`
4. Convert to ICO format and replace `/app/favicon.ico`

## Quick Commands to Check Files

After adding the files, run these commands to verify:

```bash
ls -lh /Users/devannaastad/bemymentor/public/logo.png
ls -lh /Users/devannaastad/bemymentor/app/favicon.ico
ls -lh /Users/devannaastad/bemymentor/app/icon.png
ls -lh /Users/devannaastad/bemymentor/app/apple-icon.png
```

## What's Already Updated in the Code

✅ Navbar now uses `/public/logo.png` instead of the "BM" badge
✅ App metadata configured to use the icon files
✅ Favicon configuration added to the layout

Once you add the image files, refresh your browser and you should see:
- Your logo in the top-left navbar
- Your logo in the browser tab (favicon)
- Your logo when sharing on social media
