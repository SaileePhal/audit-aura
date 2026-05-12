# AegisAI Demo Video Recording Script

This script automates the recording of a comprehensive demo video showcasing all four personas in the AegisAI application.

## Prerequisites

1. **Node.js and npm** installed
2. **Playwright** installed:
   ```bash
   npm install playwright
   ```
3. **AegisAI application running**:
   ```bash
   ./start.sh
   ```
   - Backend: http://localhost:8000
   - Frontend: http://localhost:3000

## Usage

### Run the Demo Recording

```bash
node create-demo-video.js
```

The script will:
1. Launch a browser window (non-headless for visibility)
2. Navigate through all 4 personas automatically
3. Record the entire session as a video
4. Save the video to the `videos/` directory

### What Gets Recorded

The demo covers all four personas with their key features:

#### 1. **Compliance Manager** (Strategic Oversight)
- Dashboard overview with compliance standards
- Cloud event trackers (8 providers)
- Controls management
- System settings

#### 2. **DevOps Engineer** (Tactical Execution)
- Violations dashboard with metrics
- Compliance score and severity breakdown
- My Violations page with detailed view
- Search and filter functionality

#### 3. **Security Analyst** (Operational Monitoring)
- Security dashboard overview
- Incidents management
- PR tracking for remediation
- Real-time monitoring metrics

#### 4. **Auditor/Assessor** (Verification & Reporting)
- Audit dashboard with standards
- Audit trail sources
- Reports generation
- Export functionality

## Output

- **Video Location**: `videos/` directory
- **Video Format**: WebM (Playwright default)
- **Resolution**: 1920x1080 (Full HD)
- **Duration**: ~5-7 minutes (depending on timing)

## Customization

### Adjust Recording Speed

Modify the `slowMo` parameter in the script:
```javascript
const browser = await chromium.launch({
  headless: false,
  slowMo: 100 // Increase for slower, decrease for faster
});
```

### Change Video Resolution

Modify the viewport and video size:
```javascript
recordVideo: {
  dir: 'videos/',
  size: { width: 1920, height: 1080 } // Change resolution here
},
viewport: { width: 1920, height: 1080 }
```

### Adjust Wait Times

Modify `waitForTimeout` values throughout the script:
```javascript
await page.waitForTimeout(3000); // 3 seconds - adjust as needed
```

## Troubleshooting

### Application Not Running
```bash
# Start the application
./start.sh

# Verify services are up
docker-compose ps
```

### Browser Doesn't Launch
```bash
# Install Playwright browsers
npx playwright install chromium
```

### Video Not Saved
- Check that the `videos/` directory exists
- Ensure you have write permissions
- Wait for the browser to fully close before checking

### Script Fails on Navigation
- Ensure the application is fully loaded before running
- Check that all routes are accessible
- Verify role selector is working in the UI

## Demo Flow Summary

```
1. Landing Page (3s)
   ↓
2. Compliance Manager
   - Dashboard (3s)
   - Cloud Trackers (5s)
   - Controls (4s)
   - Settings (4s)
   ↓
3. DevOps Engineer
   - Dashboard (3s)
   - Violations Chart (5s)
   - My Violations (4s)
   - Search Demo (3s)
   ↓
4. Security Analyst
   - Dashboard (3s)
   - Incidents (4s)
   - PR Tracking (5s)
   ↓
5. Auditor/Assessor
   - Dashboard (3s)
   - Audit Standards (5s)
   - Reports (4s)
   - Export Demo (4s)
   ↓
6. Finale: Role Selector (5s)
```

**Total Duration**: ~60-70 seconds of content

## Converting Video Format

If you need to convert the WebM output to MP4:

```bash
# Using ffmpeg
ffmpeg -i videos/video-*.webm -c:v libx264 -c:a aac demo-output.mp4
```

## Tips for Best Results

1. **Close unnecessary applications** to reduce system load
2. **Disable notifications** to avoid interruptions
3. **Use a clean browser profile** (Playwright does this automatically)
4. **Ensure stable internet** if the app makes external API calls
5. **Run during off-peak hours** for consistent performance
6. **Do a test run first** to verify everything works

## Adding Narration

To add voiceover narration to the video:

1. Record the video using this script
2. Write a narration script (see `docs/features/DEMO_SCRIPT.txt`)
3. Record audio separately
4. Combine using video editing software or ffmpeg:

```bash
ffmpeg -i demo-video.webm -i narration.mp3 -c:v copy -c:a aac -map 0:v:0 -map 1:a:0 final-demo.mp4
```

## Support

For issues or questions:
- Check the main README.md
- Review docs/features/DEMO_WALKTHROUGH.md
- Contact the development team

---

**Created by**: Bob (AI Assistant)  
**Last Updated**: May 6, 2026  
**Version**: 1.0