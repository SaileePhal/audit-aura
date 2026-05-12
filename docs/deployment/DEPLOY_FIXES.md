# 🚀 Deploy Latest Features - Quick Guide

## ⚠️ CRITICAL: Compliance Score Bug Fix

The compliance score is showing **10000%** instead of **78%** because the containers are running old code.

### Root Cause
- ✅ Data is correct in [`backend/data/mock_data.json`](backend/data/mock_data.json:251) (0.78 = 78%)
- ❌ Containers need to be rebuilt to load the fixed data

---

## 🔧 DEPLOYMENT STEPS

### Step 1: Stop Current Containers
```bash
docker-compose down
```

### Step 2: Rebuild All Containers
```bash
docker-compose build --no-cache
```

**Why `--no-cache`?**
- Ensures fresh build with latest code
- Loads updated mock_data.json
- Includes new WebSocket and PR tracking features

### Step 3: Start Containers
```bash
docker-compose up -d
```

### Step 4: Verify Deployment
```bash
# Check containers are running
docker-compose ps

# Check backend logs
docker-compose logs backend | tail -20

# Check frontend logs
docker-compose logs frontend | tail -20
```

### Step 5: Test in Browser
1. Open http://localhost:3000
2. Login as any role
3. Check compliance score shows **78%** (not 10000%)
4. Navigate to Security Team → PR Tracking
5. Verify 6 PRs are visible

---

## ✅ VERIFICATION CHECKLIST

### Backend Verification
- [ ] Backend container running: `docker ps | grep backend`
- [ ] API responding: `curl http://localhost:8000/health`
- [ ] Compliance score correct: `curl http://localhost:8000/dashboard | grep overall`
- [ ] PR endpoint working: `curl http://localhost:8000/prs`
- [ ] WebSocket stats: `curl http://localhost:8000/ws/stats`

### Frontend Verification
- [ ] Frontend container running: `docker ps | grep frontend`
- [ ] App loads: Open http://localhost:3000
- [ ] Login works: Select any role
- [ ] Dashboard shows 78% (not 10000%)
- [ ] PR Tracking page exists in Security Team nav
- [ ] PR badges show on Incidents page

### Data Verification
- [ ] 10 violations visible
- [ ] 6 PRs in PR Tracking
- [ ] Compliance scores: SOC2 75%, HIPAA 72%, PCI-DSS 85%
- [ ] Last Updated timestamp updates every 10 seconds

---

## 🐛 TROUBLESHOOTING

### Issue: Compliance Score Still Shows 10000%

**Solution 1: Hard Refresh Browser**
```
Chrome/Edge: Ctrl+Shift+R (Windows) or Cmd+Shift+R (Mac)
Firefox: Ctrl+F5 (Windows) or Cmd+Shift+R (Mac)
```

**Solution 2: Clear Browser Cache**
1. Open DevTools (F12)
2. Right-click refresh button
3. Select "Empty Cache and Hard Reload"

**Solution 3: Rebuild Backend Only**
```bash
docker-compose stop backend
docker-compose build --no-cache backend
docker-compose up -d backend
```

**Solution 4: Check Data File**
```bash
# Verify data file has decimals (0.78) not percentages (78)
docker exec aegis-backend cat /app/data/mock_data.json | grep overall
# Should show: "overall": 0.78
```

### Issue: PR Tracking Page Not Found

**Solution: Rebuild Frontend**
```bash
docker-compose stop frontend
docker-compose build --no-cache frontend
docker-compose up -d frontend
```

### Issue: WebSocket Not Connecting

**Solution: Check Backend Logs**
```bash
docker-compose logs backend | grep -i websocket
```

### Issue: Containers Won't Start

**Solution: Clean Docker**
```bash
# Stop all containers
docker-compose down

# Remove old images
docker-compose rm -f

# Rebuild from scratch
docker-compose build --no-cache

# Start fresh
docker-compose up -d
```

---

## 📊 EXPECTED RESULTS AFTER DEPLOYMENT

### Dashboard Metrics
- **Overall Compliance**: 78%
- **SOC2**: 75%
- **HIPAA**: 72%
- **PCI-DSS**: 85%
- **ISO 27001**: 88%
- **GDPR**: 80%

### Violations
- **Total**: 10 violations
- **Critical**: 2
- **High**: 3
- **Medium**: 3
- **Low**: 2

### PR Tracking
- **Total PRs**: 6
- **Merged**: 3
- **Open**: 3
- **Linked to Violations**: All 6

### Performance
- **Dashboard Refresh**: Every 10 seconds
- **Last Updated**: Updates every 10 seconds
- **PR Tracking Refresh**: Every 30 seconds

---

## 🎬 DEMO PREPARATION

### Before Demo:
1. ✅ Deploy all fixes (follow steps above)
2. ✅ Verify compliance score shows 78%
3. ✅ Test all 4 role dashboards
4. ✅ Test PR Tracking page
5. ✅ Practice demo script (see HACKATHON_FEATURES.md)

### During Demo:
1. **Start with Problem**: Point-in-time audit pain
2. **Show Dashboard**: 78% compliance, live updates
3. **Show Violations**: Click critical S3 bucket issue
4. **Show PR Tracking**: Navigate to PR Tracking, show 6 PRs
5. **Show Traceability**: Click PR #123, show it fixed violation
6. **Show Real-Time**: Watch "Last Updated" timestamp change

### Demo Tips:
- ✅ Keep browser window at 1920x1080 for projector
- ✅ Zoom to 125% for visibility
- ✅ Have backup screenshots ready
- ✅ Test everything 3x before presenting
- ✅ Clear browser cache before demo

---

## 🚨 EMERGENCY FIXES

### If Demo Breaks:

**Plan A: Use Screenshots**
- Take screenshots of working app now
- Show screenshots if live demo fails

**Plan B: Use Video**
- Record 2-minute demo video now
- Play video if live demo fails

**Plan C: Explain with Slides**
- Have slides ready with key features
- Walk through features without live demo

---

## 📞 QUICK COMMANDS REFERENCE

```bash
# Full rebuild (recommended)
docker-compose down && docker-compose build --no-cache && docker-compose up -d

# Check status
docker-compose ps

# View logs
docker-compose logs -f

# Restart specific service
docker-compose restart backend
docker-compose restart frontend

# Stop everything
docker-compose down

# Clean everything (nuclear option)
docker-compose down -v
docker system prune -a
```

---

## ✅ FINAL CHECKLIST

Before hackathon presentation:

- [ ] Containers rebuilt with latest code
- [ ] Compliance score shows 78% (not 10000%)
- [ ] All 4 role dashboards work
- [ ] PR Tracking page accessible
- [ ] 6 PRs visible in PR Tracking
- [ ] PR badges show on Incidents page
- [ ] Last Updated timestamp updates every 10s
- [ ] Demo script practiced 3x
- [ ] Backup screenshots taken
- [ ] Backup video recorded
- [ ] Laptop fully charged
- [ ] Internet connection tested
- [ ] Projector connection tested

---

## 🎉 YOU'RE READY!

Once you complete these deployment steps:
- ✅ Compliance score will show correctly (78%)
- ✅ PR Tracking will be fully functional
- ✅ WebSocket infrastructure will be ready
- ✅ All new features will be live

**Good luck with your hackathon presentation! 🚀**