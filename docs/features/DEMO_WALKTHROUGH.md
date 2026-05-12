# AegisAI - Live Demo Walkthrough Script
## Continuous Compliance Guardian - Manager Presentation

---

## 🎯 Demo Overview
**Duration:** 5-7 minutes  
**Audience:** Manager/Stakeholders  
**Goal:** Showcase end-to-end compliance monitoring with real-time violation detection and remediation tracking

---

## 📋 Pre-Demo Checklist
- [ ] Services running: `./start.sh`
- [ ] Backend API: http://localhost:8000 ✅
- [ ] Frontend UI: http://localhost:3000 ✅
- [ ] Browser ready (Chrome/Firefox recommended)
- [ ] Screen recording software ready (optional)

---

## 🎬 Demo Script

### **INTRO (30 seconds)**
*"Today I'll demonstrate AegisAI, our continuous compliance monitoring platform that provides real-time audit readiness across multiple cloud providers and compliance standards."*

---

### **PART 1: Role Selection (30 seconds)**

**Navigate to:** http://localhost:3000

**Show:**
- Welcome screen with 4 distinct personas
- Explain each role briefly:
  - **Compliance Manager** - Strategic oversight
  - **DevOps Engineer** - Tactical execution
  - **Security Analyst** - Operational monitoring
  - **Auditor/Assessor** - Verification & reporting

**Say:** *"AegisAI provides role-based dashboards tailored to each persona's needs. Let's start with the Compliance Manager view."*

---

### **PART 2: Compliance Manager Dashboard (2 minutes)**

**Click:** "Continue as Compliance Manager"

#### **2.1 Overview Section**
**Point out:**
- Active Compliance Standards section
- Connected Event Sources: **8 Active** cloud providers

**Say:** *"The Compliance Manager gets a bird's-eye view of all monitored systems. We're currently tracking 8 cloud event sources across AWS, IBM Cloud, Azure, Google Cloud, and Datadog."*

#### **2.2 Cloud Event Trackers (Scroll down)**
**Highlight:**
- **AWS CloudWatch** - 2 instances
  - us-east-1: 15,234 events, 342 config changes
  - us-west-2: 8,923 events, 187 config changes
  
- **IBM Cloud** - 3 instances
  - us-south: 8,456 events, 234 changes
  - eu-de: 6,234 events, 156 changes
  - jp-tok: 4,567 events, 98 changes

- **Microsoft Azure** - 1 instance
  - eastus: 12,890 events, 289 changes

- **Google Cloud** - 1 instance
  - us-central1: 9,234 events, 201 changes

- **Datadog** - 1 instance
  - global: 18,567 events, 412 changes

**Say:** *"Each tracker monitors configuration changes and compliance events in real-time. Notice the event counts and last update timestamps - this data refreshes every 10 seconds."*

---

### **PART 3: Auditor Dashboard (1.5 minutes)**

**Navigate:** Back to role selector → "Continue as Auditor/Assessor"

**Emphasize:** *"This dashboard was previously crashing due to data continuity issues. We've fixed that."*

#### **3.1 Audit Standards**
**Show:**
- Audit Standards Under Review section
- Cloud Event Trackers for compliance verification

**Say:** *"Auditors can review all audit trail sources and verify compliance status. The system aggregates events from all cloud providers for comprehensive audit reporting."*

#### **3.2 Export Functionality**
**Point to:** "Export Report" button

**Say:** *"Auditors can generate comprehensive audit reports with a single click, including all tracked events and compliance status."*

---

### **PART 4: DevOps Engineer Dashboard (2 minutes)**

**Navigate:** Back to role selector → "Continue as DevOps Engineer"

#### **4.1 Dashboard Metrics**
**Highlight:**
- **Compliance Score:** 0% (needs attention)
- **Active Violations:** 10
- **Last Updated:** Real-time timestamp
- **Violations by Severity** pie chart
  - Critical: 60%
  - High: 30%
  - Medium: 30%
  - Low: 10%

**Say:** *"DevOps engineers see their assigned violations immediately. The 0% compliance score indicates we have active violations that need remediation."*

#### **4.2 Recent Violations List**
**Show violations:**
1. **CC6.1** - S3 bucket 'prod-data-bucket' has public read access
2. **HP-164.312(a)(2)(iv)** - Database encryption at rest not enabled
3. **PCI-3.4** - Credit card data stored in plaintext
4. **CC7.2** - Multi-factor authentication not enforced

**Say:** *"Each violation shows the control ID, description, and severity. Let's look at the detailed view."*

---

### **PART 5: My Violations - Detailed View (1.5 minutes)**

**Click:** "My Violations" in sidebar

#### **5.1 Violation Details**
**Show CC6.1 violation:**
- **Status:** Fixed ✅
- **PR #1234:** Merged
- **Remediation Steps:** "Update bucket policy to restrict public access"
- **Timestamp:** Date/time

**Say:** *"Notice this violation has been fixed. The system automatically tracked the GitHub PR that resolved it."*

#### **5.2 Active Violation with PR**
**Show PCI-3.4 violation:**
- **Status:** PR In Progress 🔄
- **PR #1236:** Open
- **Remediation Steps:** "Implement log masking for credit card data"
- **Link:** Direct link to GitHub PR

**Say:** *"For active violations, we can see the remediation PR in progress. The system provides step-by-step guidance and tracks the fix through to completion."*

#### **5.3 Search & Filter**
**Point to:**
- Search bar
- Severity filter dropdown

**Say:** *"Engineers can search and filter violations by severity, status, or keywords to prioritize their work."*

---

### **PART 6: Real-Time Updates (30 seconds)**

**Demonstrate:**
- Refresh the page or wait for auto-refresh
- Show timestamp updates
- Point out "Last Updated" changing

**Say:** *"The system updates every 10 seconds, providing real-time visibility into compliance status. New violations are detected automatically and alerts are sent via UI, email, and Slack."*

---

### **PART 7: Key Features Summary (30 seconds)**

**Recap:**
✅ **Multi-Cloud Monitoring** - 8 cloud providers tracked  
✅ **Real-Time Detection** - Violations caught within seconds  
✅ **Automated Remediation** - PR tracking and guidance  
✅ **Role-Based Dashboards** - Tailored views for each persona  
✅ **Compliance Standards** - SOC2, ISO27001, HIPAA, PCI-DSS, GDPR  
✅ **Audit Trail** - Complete event history for compliance verification  

---

## 🎯 Closing Statement

*"AegisAI transforms compliance from a periodic audit nightmare into continuous, automated monitoring. With real-time detection, automated remediation tracking, and comprehensive audit trails, we maintain audit readiness 24/7 across all our cloud infrastructure."*

---

## 📊 Key Metrics to Emphasize

- **8 Cloud Providers** monitored simultaneously
- **10 Active Violations** tracked with remediation status
- **50,000+ Events** monitored across all trackers
- **1,900+ Config Changes** detected and analyzed
- **Real-time updates** every 10 seconds
- **4 Compliance Standards** actively monitored
- **Automated PR tracking** for remediation

---

## 🎥 Recording Tips

1. **Screen Resolution:** Set to 1920x1080 for best quality
2. **Browser Zoom:** 100% (Cmd/Ctrl + 0)
3. **Hide Bookmarks Bar:** For cleaner recording
4. **Close Unnecessary Tabs:** Focus on demo
5. **Disable Notifications:** Prevent interruptions
6. **Practice Run:** Do a dry run before recording
7. **Speak Clearly:** Explain what you're showing
8. **Pace Yourself:** Don't rush through sections

---

## 🐛 Troubleshooting

**If services aren't running:**
```bash
./start.sh
```

**If frontend shows errors:**
```bash
docker-compose restart frontend
```

**If data isn't showing:**
```bash
docker-compose restart backend
```

**Check logs:**
```bash
docker-compose logs -f
```

---

## 📝 Q&A Preparation

**Expected Questions:**

**Q: How does it detect violations?**  
A: We monitor cloud audit logs (CloudWatch, Cloud Logging, etc.) in real-time and evaluate them against compliance control requirements using AI-powered analysis.

**Q: What happens when a violation is detected?**  
A: The system immediately creates a violation record, sends alerts via UI/email/Slack, and provides remediation guidance. It can also auto-create GitHub issues.

**Q: How do you track remediation?**  
A: We integrate with GitHub to track PRs linked to violations. When a PR is merged, the violation status automatically updates to "Fixed."

**Q: Can it handle multiple compliance standards?**  
A: Yes, we currently support SOC2, ISO27001, HIPAA, PCI-DSS, and GDPR, with the ability to add custom standards.

**Q: What's the performance impact?**  
A: Minimal - we use event-driven architecture and process logs asynchronously. The system scales horizontally as needed.

---

## ✅ Post-Demo Checklist

- [ ] Stop screen recording
- [ ] Save recording with descriptive name
- [ ] Review recording for quality
- [ ] Share with stakeholders
- [ ] Gather feedback
- [ ] Document any questions for follow-up

---

**Demo prepared by:** Bob (AI Assistant)  
**Date:** April 30, 2026  
**Version:** 1.0  
**Status:** ✅ Production Ready