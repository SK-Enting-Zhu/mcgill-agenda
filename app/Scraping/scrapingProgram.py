import os
import time
from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from webdriver_manager.chrome import ChromeDriverManager

# --- CONFIGURATION ---
DOWNLOAD_DIR = os.path.join(os.getcwd(), "syllabi")

# Keywords
MODULE_KEYWORDS = ["course information", "syllabus", "course outline", "outline", "schedule", "admin", "start"]
FILE_KEYWORDS = ["syllabus", "outline", "schedule", "plan", "2026", "calendar", "pdf", "docx"]


def setup_driver():
    if not os.path.exists(DOWNLOAD_DIR):
        os.makedirs(DOWNLOAD_DIR)

    chrome_options = Options()
    chrome_options.add_argument("--start-maximized")

    prefs = {
        "download.default_directory": DOWNLOAD_DIR,
        "download.prompt_for_download": False,
        "download.directory_upgrade": True,
        "plugins.always_open_pdf_externally": True
    }
    chrome_options.add_experimental_option("prefs", prefs)

    service = Service(ChromeDriverManager().install())
    return webdriver.Chrome(service=service, options=chrome_options)


def get_all_links_recursive(driver):
    script = """
    function collectLinks(root) {
        let found = [];
        try {
            let links = root.querySelectorAll('a');
            links.forEach(link => {
                if (link.href && link.href.includes('/d2l/home/')) {
                    let text = link.innerText || link.getAttribute('title') || "";
                    found.push({ text: text.trim(), url: link.href });
                }
            });
        } catch(e) { }
        let allElements = root.querySelectorAll('*');
        allElements.forEach(el => {
            if (el.shadowRoot) found = found.concat(collectLinks(el.shadowRoot));
        });
        return found;
    }
    return collectLinks(document.body);
    """
    return driver.execute_script(script)


def click_content_button(driver):
    print("      [?] Looking for 'Content' button...")
    try:
        btn = driver.find_element(By.LINK_TEXT, "Content")
        driver.execute_script("arguments[0].click();", btn)
        print("      [+] Clicked standard text link.")
        return True
    except:
        pass

    try:
        xpath = "//a[contains(@href, '/content/') and not(contains(@href, 'd2l/home'))]"
        btns = driver.find_elements(By.XPATH, xpath)
        for btn in btns:
            if btn.is_displayed():
                driver.execute_script("arguments[0].click();", btn)
                print("      [+] Clicked icon/nav link.")
                return True
    except:
        pass

    if "/d2l/home/" in driver.current_url:
        print("      [!] Button not found. Using URL hack.")
        new_url = driver.current_url.replace("/d2l/home/", "/d2l/le/lessons/")
        driver.get(new_url)
        return True
    return False


def switch_to_content_iframe(driver):
    """Waits for the Smart Curriculum iframe and switches into it."""
    try:
        iframe = WebDriverWait(driver, 8).until(
            EC.presence_of_element_located((By.XPATH, "//iframe[contains(@src, 'smart-curriculum')]"))
        )
        print("      [FRAME] Found Smart Curriculum Iframe. Switching in...")
        driver.switch_to.frame(iframe)
        return True
    except:
        print("      [FRAME] No iframe found. Assuming Classic View.")
        return False


def click_download_button(driver, course_name):
    """
    Standard 'Impatient' Clicker.
    Checks ONCE if the download button is there. If not, it fails immediately.
    """
    script = """
    let found = false;
    function findDlBtn(root) {
        if(found) return;
        let all = root.querySelectorAll('*');
        for(let el of all) {
            let tag = el.tagName.toLowerCase();
            let text = (el.getAttribute('text') || el.innerText || "").toLowerCase();
            let icon = (el.getAttribute('icon') || "").toLowerCase();
            let title = (el.getAttribute('title') || "").toLowerCase();

            // Check keywords
            if(text.includes('download') || title.includes('download') || icon.includes('download') || icon.includes('file-document')) {
                if(el.shadowRoot) {
                    let btn = el.shadowRoot.querySelector('button');
                    if(btn) { btn.click(); found=true; return; }
                }
                el.click(); found=true; return;
            }
            if(el.shadowRoot) findDlBtn(el.shadowRoot);
        }
    }
    findDlBtn(document.body);
    return found;
    """

    # Executes once and returns True/False immediately
    if driver.execute_script(script):
        print(f"      [SUCCESS] Download started for {course_name} ✅")
        return True
    return False


def deep_pierce_click(driver, keywords, target_type="module"):
    """
    Hunts for text and uses SMART CLICKING on the parent container.
    """
    print(f"      [SCAN] Searching for {target_type} matching: {keywords}")

    script = f"""
    let keywords = {keywords};
    let found = false;

    function searchAndClick(root) {{
        if (found) return;

        let all = root.querySelectorAll('*');

        for (let el of all) {{
            if (found) return;

            let text = el.innerText || el.textContent || el.getAttribute('text') || "";
            text = text.trim();

            if (text.length > 0 && text.length < 100) {{
                let lowerText = text.toLowerCase();

                for (let k of keywords) {{
                    if (lowerText.includes(k.toLowerCase())) {{
                        let clickable = el.closest('d2l-list-item, d2l-list-item-nav, a, button');
                        if (!clickable) clickable = el; 

                        console.log("MATCH FOUND: " + text);
                        clickable.click(); 
                        found = true; 
                        return;
                    }}
                }}
            }}
        }}

        let children = root.querySelectorAll('*');
        for(let child of children) {{
            if(child.shadowRoot) searchAndClick(child.shadowRoot);
        }}
    }}

    searchAndClick(document.body);
    return found;
    """
    return driver.execute_script(script)


def scrape_course(driver, course_name, course_url):
    print(f"\n   📍 Entering: {course_name}...")
    driver.get(course_url)
    time.sleep(2)

    if not click_content_button(driver):
        print("      [!] Failed to enter Content area. Skipping.")
        return

    time.sleep(4)
    in_iframe = switch_to_content_iframe(driver)

    # 3. Wait for Sidebar
    found_module = False
    print("      [WAIT] Waiting for sidebar...")

    for i in range(5):
        time.sleep(2)
        found_module = deep_pierce_click(driver, MODULE_KEYWORDS, "Sidebar Folder")
        if found_module: break
        print(f"      ... searching sidebar {i + 1}/5")

    if found_module:
        print("      [+] Folder clicked. Waiting for file list...")
        time.sleep(3)

        # 4. Click File
        found_file = deep_pierce_click(driver, FILE_KEYWORDS, "File Item")

        if found_file:
            print("      [+] File clicked. Checking for download button...")

            # --- NON-PERSISTENT CHECK (Will fail if content loads slowly) ---
            downloaded = False

            # Check iframe once
            if click_download_button(driver, course_name):
                downloaded = True
            elif in_iframe:
                # Check main frame once
                driver.switch_to.default_content()
                if click_download_button(driver, course_name):
                    downloaded = True

            if downloaded:
                print("      [WAIT] Waiting 5s for download to finish...")
                time.sleep(6)
            else:
                print("      [!] Download button NOT found immediately (Skipping).")

        else:
            print("      [-] Folder opened, but no file found.")
    else:
        print("      [-] No 'Syllabus/Outline' folder found.")

    driver.switch_to.default_content()


def main():
    driver = setup_driver()
    print("--- 📥 Automated Downloader (No Persistence) ---")

    try:
        driver.get("https://mycourses2.mcgill.ca/d2l/home")

        # 1. Automatic Wait Phase
        print("\n⏳ Waiting 50 seconds for you to log in...")
        time.sleep(50)

        # 2. Polling Loop
        courses = []
        ignore = ["https://mycourses2.mcgill.ca/d2l/home", "https://mycourses2.mcgill.ca/d2l/home/"]

        while True:
            print("\n🔍 Checking for dashboard links...")
            raw_links = get_all_links_recursive(driver)

            # Reset and filter
            courses = []
            seen = set()
            for l in raw_links:
                if l['url'] not in seen and l['url'] not in ignore:
                    courses.append(l)
                    seen.add(l['url'])

            if len(courses) > 0:
                print(f"✅ Login Detected! Found {len(courses)} courses.")
                break  # Exit loop and start scraping
            else:
                print("❌ No courses found yet. (Still logged out?) Waiting 20s...")
                time.sleep(20)

        # 3. Auto-Start Scrape
        print(f"🚀 Starting scrape automatically...")
        for c in courses:
            scrape_course(driver, c['text'], c['url'])

        print(f"\n✅ All courses processed. Finalizing...")

        print(f"📂 Check folder: {DOWNLOAD_DIR}")

    except Exception as e:
        print(f"Critical Error: {e}")
    finally:
        print("🔒 Closing browser...")
        driver.quit()


if __name__ == "__main__":
    main()