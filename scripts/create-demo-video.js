const { chromium } = require('playwright');

(async () => {
  console.log('🎬 Starting AegisAI Demo Video Recording...\n');

  const browser = await chromium.launch({
    headless: false,
    slowMo: 100 // Slow down actions for better visibility
  });

  const context = await browser.newContext({
    recordVideo: {
      dir: 'videos/',
      size: { width: 1920, height: 1080 }
    },
    viewport: { width: 1920, height: 1080 }
  });

  const page = await context.newPage();

  try {
    // ========================================
    // INTRO: Landing Page
    // ========================================
    console.log('📍 Step 1: Opening AegisAI application...');
    await page.goto('http://localhost:3000');
    await page.waitForTimeout(3000);

    // ========================================
    // PERSONA 1: COMPLIANCE MANAGER
    // ========================================
    console.log('\n👔 PERSONA 1: Compliance Manager');
    console.log('   - Strategic oversight and system configuration');
    
    // Select Compliance Manager role
    await page.click('text=Compliance Manager');
    await page.waitForTimeout(2000);

    // Dashboard overview
    console.log('   ✓ Viewing dashboard overview');
    await page.waitForTimeout(3000);

    // Scroll to show Active Compliance Standards
    await page.mouse.wheel(0, 300);
    await page.waitForTimeout(2000);

    // Scroll to show Cloud Event Trackers
    console.log('   ✓ Showing cloud event trackers');
    await page.mouse.wheel(0, 400);
    await page.waitForTimeout(3000);

    // Navigate to Controls page
    console.log('   ✓ Navigating to Controls');
    await page.click('text=Controls');
    await page.waitForTimeout(2000);
    
    // Scroll through controls
    await page.mouse.wheel(0, 500);
    await page.waitForTimeout(2000);

    // Navigate to Settings
    console.log('   ✓ Checking Settings');
    await page.click('text=Settings');
    await page.waitForTimeout(2000);
    await page.mouse.wheel(0, 300);
    await page.waitForTimeout(2000);

    // ========================================
    // PERSONA 2: DEVOPS ENGINEER
    // ========================================
    console.log('\n👨‍💻 PERSONA 2: DevOps Engineer');
    console.log('   - Tactical execution and violation remediation');

    // Clear localStorage and go back to role selector
    await page.evaluate(() => localStorage.clear());
    await page.goto('http://localhost:3000/select-role');
    await page.waitForTimeout(3000);
    
    // Wait for the page to be fully loaded
    await page.waitForLoadState('networkidle');

    // Select DevOps Engineer role - click on the card
    await page.click('text=DevOps Engineer');
    await page.waitForTimeout(2000);

    // Dashboard with violations
    console.log('   ✓ Viewing violations dashboard');
    await page.waitForTimeout(3000);

    // Scroll to show violations by severity chart
    await page.mouse.wheel(0, 300);
    await page.waitForTimeout(2000);

    // Scroll to show recent violations list
    console.log('   ✓ Showing recent violations');
    await page.mouse.wheel(0, 400);
    await page.waitForTimeout(3000);

    // Navigate to My Violations
    console.log('   ✓ Navigating to My Violations');
    await page.click('text=My Violations');
    await page.waitForTimeout(2000);

    // Scroll through violations
    await page.mouse.wheel(0, 500);
    await page.waitForTimeout(2000);

    // Show search functionality
    console.log('   ✓ Demonstrating search/filter');
    const searchBox = await page.$('input[type="text"]');
    if (searchBox) {
      await searchBox.click();
      await page.keyboard.type('S3');
      await page.waitForTimeout(2000);
      await searchBox.click({ clickCount: 3 });
      await page.keyboard.press('Backspace');
      await page.waitForTimeout(1000);
    }

    // ========================================
    // PERSONA 3: SECURITY ANALYST
    // ========================================
    console.log('\n🛡️ PERSONA 3: Security Analyst');
    console.log('   - Operational monitoring and incident response');

    // Clear localStorage and go back to role selector
    await page.evaluate(() => localStorage.clear());
    await page.goto('http://localhost:3000/select-role');
    await page.waitForTimeout(3000);
    
    // Wait for the page to be fully loaded
    await page.waitForLoadState('networkidle');

    // Select Security Analyst role - click on the card
    await page.click('text=Security Analyst');
    await page.waitForTimeout(2000);

    // Dashboard overview
    console.log('   ✓ Viewing security dashboard');
    await page.waitForTimeout(3000);

    // Scroll to show metrics
    await page.mouse.wheel(0, 300);
    await page.waitForTimeout(2000);

    // Navigate to Incidents
    console.log('   ✓ Navigating to Incidents');
    await page.click('text=Incidents');
    await page.waitForTimeout(2000);

    // Scroll through incidents
    await page.mouse.wheel(0, 500);
    await page.waitForTimeout(2000);

    // Navigate to PR Tracking
    console.log('   ✓ Checking PR Tracking');
    await page.click('text=PR Tracking');
    await page.waitForTimeout(2000);

    // Scroll through PR tracking
    await page.mouse.wheel(0, 400);
    await page.waitForTimeout(3000);

    // ========================================
    // PERSONA 4: AUDITOR/ASSESSOR
    // ========================================
    console.log('\n📋 PERSONA 4: Auditor/Assessor');
    console.log('   - Verification, reporting, and audit evidence');

    // Clear localStorage and go back to role selector
    await page.evaluate(() => localStorage.clear());
    await page.goto('http://localhost:3000/select-role');
    await page.waitForTimeout(3000);
    
    // Wait for the page to be fully loaded
    await page.waitForLoadState('networkidle');

    // Select Auditor role - click on the card
    await page.click('text=Auditor/Assessor');
    await page.waitForTimeout(2000);

    // Dashboard overview
    console.log('   ✓ Viewing auditor dashboard');
    await page.waitForTimeout(3000);

    // Scroll to show audit standards
    await page.mouse.wheel(0, 300);
    await page.waitForTimeout(2000);

    // Scroll to show cloud event trackers
    console.log('   ✓ Showing audit trail sources');
    await page.mouse.wheel(0, 400);
    await page.waitForTimeout(3000);

    // Navigate to Reports
    console.log('   ✓ Navigating to Reports');
    await page.click('text=Reports');
    await page.waitForTimeout(2000);

    // Scroll through reports
    await page.mouse.wheel(0, 500);
    await page.waitForTimeout(2000);

    // Show export functionality
    console.log('   ✓ Demonstrating export functionality');
    await page.mouse.wheel(0, -300);
    await page.waitForTimeout(2000);

    // ========================================
    // FINALE: Return to Role Selector
    // ========================================
    console.log('\n🎯 Finale: Returning to role selector');
    await page.evaluate(() => localStorage.clear());
    await page.goto('http://localhost:3000/select-role');
    await page.waitForTimeout(3000);

    // Final scroll to show all roles
    await page.mouse.wheel(0, 200);
    await page.waitForTimeout(2000);
    await page.mouse.wheel(0, -200);
    await page.waitForTimeout(2000);

  } catch (error) {
    console.error('❌ Error during recording:', error);
  } finally {
    // Close browser and save video
    console.log('\n🎬 Closing browser and saving video...');
    await browser.close();
    console.log('✅ Demo video saved in /videos folder');
    console.log('\n📊 Demo Summary:');
    console.log('   • Compliance Manager: Dashboard, Controls, Settings');
    console.log('   • DevOps Engineer: Dashboard, Violations, Search/Filter');
    console.log('   • Security Analyst: Dashboard, Incidents, PR Tracking');
    console.log('   • Auditor/Assessor: Dashboard, Reports, Export');
    console.log('\n🎉 Recording complete!');
  }
})();