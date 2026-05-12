#!/usr/bin/env python3
"""
Screenshot capture script for AegisAI UI testing
Captures screenshots of all dashboards and saves them to the screenshots folder
"""

import asyncio
import os
from playwright.async_api import async_playwright

SCREENSHOTS_DIR = "screenshots"
BASE_URL = "http://localhost:3000"

async def capture_screenshots():
    """Capture screenshots of all dashboard pages"""
    
    # Ensure screenshots directory exists
    os.makedirs(SCREENSHOTS_DIR, exist_ok=True)
    print(f"📁 Screenshots will be saved to: {os.path.abspath(SCREENSHOTS_DIR)}\n")
    
    async with async_playwright() as p:
        # Launch browser
        browser = await p.chromium.launch(headless=True)
        context = await browser.new_context(viewport={'width': 1280, 'height': 800})
        page = await context.new_page()
        
        try:
            print("🚀 Starting screenshot capture...\n")
            
            # 1. Role Selection Page
            print("📸 Capturing: Role Selection Page...")
            await page.goto(BASE_URL, wait_until='networkidle')
            await page.screenshot(path=f"{SCREENSHOTS_DIR}/01-role-selection.png", full_page=True)
            print("✓ Saved: 01-role-selection.png\n")
            
            # 2. Compliance Manager Dashboard
            print("📸 Capturing: Compliance Manager Dashboard...")
            await page.click('text=Continue as Compliance Manager')
            await page.wait_for_timeout(2000)
            await page.screenshot(path=f"{SCREENSHOTS_DIR}/02-compliance-manager-dashboard.png", full_page=True)
            print("✓ Saved: 02-compliance-manager-dashboard.png\n")
            
            # 3. Compliance Manager Controls Page
            print("📸 Capturing: Compliance Manager Controls...")
            try:
                await page.click('text=Controls', timeout=5000)
                await page.wait_for_timeout(2000)
                await page.screenshot(path=f"{SCREENSHOTS_DIR}/03-compliance-manager-controls.png", full_page=True)
                print("✓ Saved: 03-compliance-manager-controls.png\n")
            except:
                print("⚠ Could not capture Controls page\n")
            
            # 4. DevOps Dashboard
            print("📸 Capturing: DevOps Dashboard...")
            await page.goto(BASE_URL, wait_until='networkidle')
            await page.wait_for_timeout(1000)
            # Scroll down to see all role cards
            await page.evaluate("window.scrollTo(0, 300)")
            await page.wait_for_timeout(500)
            await page.click('text=DevOps Engineer')
            await page.wait_for_timeout(2000)
            await page.screenshot(path=f"{SCREENSHOTS_DIR}/04-devops-dashboard.png", full_page=True)
            print("✓ Saved: 04-devops-dashboard.png\n")
            
            # 5. My Violations Page
            print("📸 Capturing: My Violations Page...")
            try:
                await page.click('text=My Violations', timeout=5000)
                await page.wait_for_timeout(2000)
                await page.screenshot(path=f"{SCREENSHOTS_DIR}/05-devops-violations.png", full_page=True)
                print("✓ Saved: 05-devops-violations.png\n")
            except:
                print("⚠ Could not capture My Violations page\n")
            
            # 6. Security Analyst Dashboard
            print("📸 Capturing: Security Analyst Dashboard...")
            await page.goto(BASE_URL, wait_until='networkidle')
            await page.wait_for_timeout(1000)
            await page.evaluate("window.scrollTo(0, 300)")
            await page.wait_for_timeout(500)
            # Try different selectors
            try:
                await page.click('text=Security Analyst', timeout=5000)
            except:
                try:
                    await page.click('text=Security Team', timeout=5000)
                except:
                    await page.click('text=Security', timeout=5000)
            await page.wait_for_timeout(2000)
            await page.screenshot(path=f"{SCREENSHOTS_DIR}/06-security-dashboard.png", full_page=True)
            print("✓ Saved: 06-security-dashboard.png\n")
            
            # 7. Auditor Dashboard
            print("📸 Capturing: Auditor Dashboard...")
            await page.goto(BASE_URL, wait_until='networkidle')
            await page.wait_for_timeout(1000)
            await page.evaluate("window.scrollTo(0, 600)")
            await page.wait_for_timeout(500)
            try:
                await page.click('text=Auditor', timeout=5000)
            except:
                await page.click('text=Assessor', timeout=5000)
            await page.wait_for_timeout(2000)
            await page.screenshot(path=f"{SCREENSHOTS_DIR}/07-auditor-dashboard.png", full_page=True)
            print("✓ Saved: 07-auditor-dashboard.png\n")
            
            print("✅ All screenshots captured successfully!")
            print(f"📁 Location: {os.path.abspath(SCREENSHOTS_DIR)}")
            
        except Exception as e:
            print(f"❌ Error capturing screenshots: {e}")
            import traceback
            traceback.print_exc()
        finally:
            await browser.close()

if __name__ == "__main__":
    asyncio.run(capture_screenshots())