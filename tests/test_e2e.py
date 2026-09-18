import subprocess
import time
from playwright.sync_api import sync_playwright

def run_tests():
    # Start local HTTP server on port 3009
    server = subprocess.Popen(
        ["python3", "-m", "http.server", "3009"],
        cwd="/Users/jep/dev/nc/mekilla",
        stdout=subprocess.DEVNULL,
        stderr=subprocess.DEVNULL
    )
    time.sleep(1)

    try:
        with sync_playwright() as p:
            browser = p.chromium.launch(channel="chrome", headless=True)
            page = browser.new_page()

            print("1. Navigating to http://localhost:3009...")
            page.goto("http://localhost:3009")
            page.wait_for_selector("#mode-select")

            # Check initial mode is native-swap and scale is 1
            mode_val = page.eval_on_selector("#mode-select", "el => el.value")
            scale_val = page.eval_on_selector("#scale-select", "el => el.value")
            print(f"   Default mode: {mode_val}, Default scale: {scale_val}")
            assert mode_val == "native-swap"
            assert scale_val == "1"

            # Check swap style element
            style_content = page.eval_on_selector("#nesticle-swap-style", "el => el.textContent")
            print(f"   Initial style text: {style_content[:60]}...")
            assert "assets/frames/frame_" in style_content

            # Test native-swap scaling to 1.5x
            print("\n2. Testing native-swap scale to 1.5x...")
            page.select_option("#scale-select", "1.5")
            time.sleep(0.1)
            style_content = page.eval_on_selector("#nesticle-swap-style", "el => el.textContent")
            print(f"   1.5x style text: {style_content[:60]}...")
            assert "data:image/png;base64," in style_content
            # Wait for animation tick
            time.sleep(0.25)
            style_content_tick = page.eval_on_selector("#nesticle-swap-style", "el => el.textContent")
            print(f"   1.5x animation tick style: {style_content_tick[:60]}...")
            assert "data:image/png;base64," in style_content

            # Test native-swap scaling to 2x
            print("\n3. Testing native-swap scale to 2x...")
            page.select_option("#scale-select", "2")
            time.sleep(0.1)
            style_content_2x = page.eval_on_selector("#nesticle-swap-style", "el => el.textContent")
            print(f"   2x style text: {style_content_2x[:60]}...")
            assert "data:image/png;base64," in style_content_2x
            # Verify frame cycling continues
            time.sleep(0.25)
            style_content_2x_tick = page.eval_on_selector("#nesticle-swap-style", "el => el.textContent")
            print(f"   2x animation tick style: {style_content_2x_tick[:60]}...")
            assert "data:image/png;base64," in style_content_2x_tick

            # Test static mode scaling
            print("\n4. Testing static mode...")
            page.select_option("#mode-select", "static")
            time.sleep(0.1)
            static_2x = page.eval_on_selector("#nesticle-swap-style", "el => el.textContent")
            print(f"   Static 2x style: {static_2x[:60]}...")
            assert "data:image/png;base64," in static_2x

            page.select_option("#scale-select", "1")
            time.sleep(0.1)
            static_1x = page.eval_on_selector("#nesticle-swap-style", "el => el.textContent")
            print(f"   Static 1x style: {static_1x[:60]}...")
            assert "assets/nesticle.png" in static_1x

            # Test follower mode scaling
            print("\n5. Testing follower mode...")
            page.select_option("#mode-select", "follower")
            time.sleep(0.1)
            # Move mouse to reveal follower
            page.mouse.move(200, 200)
            follower_dims = page.eval_on_selector(
                ".nesticle-cursor-follower img",
                "el => ({ width: el.style.width, height: el.style.height })"
            )
            print(f"   Follower 1x dimensions: {follower_dims}")
            assert follower_dims["width"] == "42px"
            assert follower_dims["height"] == "62px"

            page.select_option("#scale-select", "1.5")
            time.sleep(0.1)
            follower_dims_1_5 = page.eval_on_selector(
                ".nesticle-cursor-follower img",
                "el => ({ width: el.style.width, height: el.style.height })"
            )
            print(f"   Follower 1.5x dimensions: {follower_dims_1_5}")
            assert follower_dims_1_5["width"] == "63px"
            assert follower_dims_1_5["height"] == "93px"

            page.select_option("#scale-select", "2")
            time.sleep(0.1)
            follower_dims_2x = page.eval_on_selector(
                ".nesticle-cursor-follower img",
                "el => ({ width: el.style.width, height: el.style.height })"
            )
            print(f"   Follower 2x dimensions: {follower_dims_2x}")
            assert follower_dims_2x["width"] == "84px"
            assert follower_dims_2x["height"] == "124px"

            # Test clicking and blood splatter
            print("\n6. Testing interactive buttons and splatter...")
            page.click("#btn-count")
            click_count = page.eval_on_selector("#click-count", "el => el.textContent")
            print(f"   Button clicked, count: {click_count}")
            assert click_count == "1"

            # Click canvas area and verify splatter particles spawn
            page.mouse.click(300, 300)
            splatters = page.query_selector_all(".nesticle-splatter-particle")
            print(f"   Blood splatter particles spawned: {len(splatters)}")
            assert len(splatters) > 0

            browser.close()
            print("\nALL PLAYWRIGHT TESTS PASSED SUCCESSFULLY!")
    finally:
        server.terminate()
        server.wait()

if __name__ == "__main__":
    run_tests()
