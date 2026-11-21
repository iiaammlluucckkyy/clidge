import os
from PIL import Image, ImageDraw, ImageFont

def generate_ui_comparison():
    artifact_dir = r"C:\Users\LAKSHMANARAJARAMARAJ\.gemini\antigravity\brain\fbb324e5-4ecd-4fca-ae6a-366fb3692274"
    before_img_path = os.path.join(artifact_dir, ".user_uploaded", "media_1795175986299_30050cb7.jpg")
    logo_path = os.path.abspath("public/logo.png")

    # Dimensions
    canvas_w = 1400
    canvas_h = 950
    img = Image.new("RGB", (canvas_w, canvas_h), color=(6, 15, 28)) # #060F1C
    draw = ImageDraw.Draw(img)

    # Try loading system font, fallback to default
    try:
        font_title = ImageFont.truetype("arial.ttf", 32)
        font_subtitle = ImageFont.truetype("arial.ttf", 16)
        font_card_h = ImageFont.truetype("arialbd.ttf", 22)
        font_body = ImageFont.truetype("arial.ttf", 15)
        font_body_bold = ImageFont.truetype("arialbd.ttf", 15)
        font_tag = ImageFont.truetype("arialbd.ttf", 13)
    except Exception:
        font_title = ImageFont.load_default()
        font_subtitle = ImageFont.load_default()
        font_card_h = ImageFont.load_default()
        font_body = ImageFont.load_default()
        font_body_bold = ImageFont.load_default()
        font_tag = ImageFont.load_default()

    # Header Title
    draw.text((canvas_w // 2, 45), "CLIDGE UI/UX EVOLUTION: BEFORE VS. LATEST", font=font_title, fill=(255, 255, 255), anchor="mm")
    draw.text((canvas_w // 2, 80), "Approved Dark Collegiate Theme Preserved (#060F1C Navy & #06B6D4 Cyan) • De-Cluttered Interface", font=font_subtitle, fill=(6, 182, 212), anchor="mm")

    # Dividing border line
    draw.line([(50, 105), (canvas_w - 50, 105)], fill=(18, 48, 86), width=2)

    # LEFT PANEL: BEFORE (Initial UI)
    left_x = 60
    card_w = 610
    card_h = 790
    card_top = 125

    # Left Card Background
    draw.rounded_rectangle([left_x, card_top, left_x + card_w, card_top + card_h], radius=16, fill=(11, 29, 51), outline=(239, 68, 68), width=2)
    # Red badge for "INITIAL / BEFORE"
    draw.rounded_rectangle([left_x + 20, card_top + 16, left_x + 180, card_top + 46], radius=8, fill=(239, 68, 68))
    draw.text((left_x + 100, card_top + 31), "INITIAL / BEFORE", font=font_tag, fill=(255, 255, 255), anchor="mm")
    draw.text((left_x + 200, card_top + 31), "Cluttered & Redundant", font=font_card_h, fill=(226, 232, 240), anchor="lm")

    # Load and paste before screenshot thumbnail
    if os.path.exists(before_img_path):
        try:
            b_img = Image.open(before_img_path)
            thumb_w = card_w - 40
            thumb_h = int(b_img.height * (thumb_w / b_img.width))
            b_thumb = b_img.resize((thumb_w, thumb_h), Image.Resampling.LANCZOS)
            img.paste(b_thumb, (left_x + 20, card_top + 60))
            thumb_bottom = card_top + 60 + thumb_h
        except Exception:
            thumb_bottom = card_top + 260
    else:
        thumb_bottom = card_top + 260

    # Bullet points explaining Before UI
    before_points = [
        ("• No Central Logo:", "Only small plain text in header; lacked official visual identity."),
        ("• Cluttered Hero Section:", "Excessive wordy descriptions and duplicate college titles."),
        ("• Confusing Navigation:", "Mixed button actions without clear student vs faculty segregation."),
        ("• Student Dashboard:", "Showed live GPS coordinates, tracking controls, and map telemetry."),
        ("• Unorganized Layout:", "Wide spacing gaps with repetitive informational banners.")
    ]
    cur_y = thumb_bottom + 20
    for title, desc in before_points:
        draw.text((left_x + 25, cur_y), title, font=font_body_bold, fill=(248, 113, 113))
        draw.text((left_x + 25, cur_y + 22), desc, font=font_body, fill=(148, 163, 184))
        cur_y += 54

    # RIGHT PANEL: LATEST (Current Approved Redesign)
    right_x = 730
    draw.rounded_rectangle([right_x, card_top, right_x + card_w, card_top + card_h], radius=16, fill=(11, 29, 51), outline=(16, 185, 129), width=2)
    # Green badge for "LATEST / CURRENT"
    draw.rounded_rectangle([right_x + 20, card_top + 16, right_x + 195, card_top + 46], radius=8, fill=(16, 185, 129))
    draw.text((right_x + 107, card_top + 31), "LATEST / APPROVED", font=font_tag, fill=(255, 255, 255), anchor="mm")
    draw.text((right_x + 215, card_top + 31), "Clean, Modern & Simple", font=font_card_h, fill=(255, 255, 255), anchor="lm")

    # Header with Logo showcase preview on Right
    draw.rounded_rectangle([right_x + 20, card_top + 60, right_x + card_w - 20, card_top + 330], radius=12, fill=(6, 15, 28), outline=(18, 48, 86))
    if os.path.exists(logo_path):
        try:
            logo_img = Image.open(logo_path).convert("RGBA")
            logo_thumb = logo_img.resize((100, 100), Image.Resampling.LANCZOS)
            # Create white container for logo
            draw.rounded_rectangle([right_x + (card_w // 2) - 60, card_top + 75, right_x + (card_w // 2) + 60, card_top + 195], radius=16, fill=(255, 255, 255))
            img.paste(logo_thumb, (right_x + (card_w // 2) - 50, card_top + 85), mask=logo_thumb)
        except Exception:
            pass

    draw.text((right_x + (card_w // 2), card_top + 215), "CLIDGE • SMART CAMPUS SYSTEM", font=font_tag, fill=(6, 182, 212), anchor="mm")
    draw.text((right_x + (card_w // 2), card_top + 245), "Smart Campus Presence & Live Attendance", font=font_card_h, fill=(255, 255, 255), anchor="mm")
    
    # Dual Portal Mini Cards inside preview
    portal_card_w = (card_w - 70) // 2
    # Student card preview
    draw.rounded_rectangle([right_x + 30, card_top + 270, right_x + 30 + portal_card_w, card_top + 320], radius=8, fill=(11, 29, 51), outline=(6, 182, 212))
    draw.text((right_x + 30 + portal_card_w // 2, card_top + 295), "I am a Student ->", font=font_tag, fill=(6, 182, 212), anchor="mm")
    # Faculty card preview
    draw.rounded_rectangle([right_x + 40 + portal_card_w, card_top + 270, right_x + 40 + 2 * portal_card_w, card_top + 320], radius=8, fill=(11, 29, 51), outline=(100, 116, 139))
    draw.text((right_x + 40 + portal_card_w + portal_card_w // 2, card_top + 295), "I am a Faculty ->", font=font_tag, fill=(226, 232, 240), anchor="mm")

    # Bullet points explaining Latest Redesign
    latest_points = [
        ("• Prominent Official Logo:", "High-resolution graduation cap & pin emblem instantly recognizable."),
        ("• 2 Clear Portals (Zero Confusion):", "Dedicated 'I am a Student' and 'I am a Faculty' entry points."),
        ("• Live Tracking Removed from Student:", "No live map, tracking controls, or coordinates shown to students."),
        ("• Silent Background GPS Sharing:", "Location sends to faculty dashboard in background without student controls."),
        ("• Student Dashboard Essentials:", "Only shows Profile, Today's Classes, Attendance/QR Status & Notifications.")
    ]
    cur_y = card_top + 350
    for title, desc in latest_points:
        draw.text((right_x + 25, cur_y), title, font=font_body_bold, fill=(52, 211, 153))
        draw.text((right_x + 25, cur_y + 22), desc, font=font_body, fill=(226, 232, 240))
        cur_y += 54

    # Save output to artifact directory and project root
    out_path_1 = os.path.join(artifact_dir, "CLIDGE_UI_Before_After_Comparison.png")
    out_path_2 = os.path.abspath("CLIDGE_UI_Before_After_Comparison.png")
    img.save(out_path_1, "PNG")
    img.save(out_path_2, "PNG")
    print(f"Successfully generated comparison image at:\n  {out_path_1}\n  {out_path_2}")

if __name__ == "__main__":
    generate_ui_comparison()
