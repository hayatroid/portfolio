from pathlib import Path
from playwright.sync_api import sync_playwright


root_dir = Path(__file__).parent
public_dir = root_dir / "public"
ogp_dir = public_dir / "ogp"

with sync_playwright() as playwright:
    browser = playwright.chromium.launch(headless=True)
    context = browser.new_context(
        locale='ja-JP',
        viewport={'width': 600, 'height': 315},
        device_scale_factor=2
    )
    page = context.new_page()

    for html_path in public_dir.rglob("index.html"):
        page_dir = html_path.parent.relative_to(public_dir)

        if str(page_dir) == ".":
            output_path = ogp_dir / "home.png"
        else:
            output_path = ogp_dir / f"{page_dir}.png"

        output_path.parent.mkdir(parents=True, exist_ok=True)

        page.goto(f"file://{html_path.absolute()}", wait_until="networkidle")
        page.add_style_tag(content="""
            @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+JP');
            @import url('https://fonts.googleapis.com/css2?family=Noto+Color+Emoji');
            @import url('https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined');
            * {
                font-family: 'Noto Sans JP', 'Noto Color Emoji' !important;
            }
            .material-symbols-outlined {
                font-family: 'Material Symbols Outlined' !important;
            }
        """)
        page.wait_for_function("() => document.fonts.ready.then(() => true)")
        page.evaluate("window.scrollTo(0, 32)")
        page.screenshot(path=str(output_path), type="png")

    browser.close()
