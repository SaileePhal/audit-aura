#!/usr/bin/env python3
import asyncio
from playwright.async_api import async_playwright

async def save_screenshot(url, filename):
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        context = await browser.new_context(viewport={'width': 1280, 'height': 800})
        page = await context.new_page()
        await page.goto(url, wait_until='networkidle')
        await page.wait_for_timeout(2000)
        await page.screenshot(path=f"screenshots/{filename}", full_page=True)
        await browser.close()
        print(f"✓ Saved: {filename}")

if __name__ == "__main__":
    import sys
    if len(sys.argv) != 3:
        print("Usage: python save_screenshot.py <url> <filename>")
        sys.exit(1)
    asyncio.run(save_screenshot(sys.argv[1], sys.argv[2]))