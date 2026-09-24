import os
from PIL import Image, ImageDraw, ImageFont

def generate_pwa_assets():
    icons_dir = os.path.join('public', 'icons')
    screenshots_dir = os.path.join('public', 'screenshots')
    os.makedirs(icons_dir, exist_ok=True)
    os.makedirs(screenshots_dir, exist_ok=True)

    # 1. Base icon source: assets/logo.png
    icon_src_path = os.path.join('assets', 'logo.png')
    base_img = Image.open(icon_src_path).convert('RGBA')
    print(f"Loaded base icon from: {icon_src_path} ({base_img.size})")

    # Save direct copy to public/logo.png and public/icons/logo.png
    base_img.save(os.path.join('public', 'logo.png'), 'PNG', optimize=True)
    base_img.save(os.path.join(icons_dir, 'logo.png'), 'PNG', optimize=True)

    # Standard icon sizes
    sizes = [48, 72, 96, 128, 144, 152, 192, 384, 512]
    for s in sizes:
        resized = base_img.resize((s, s), Image.Resampling.LANCZOS)
        out_path = os.path.join(icons_dir, f'icon-{s}x{s}.png')
        resized.save(out_path, 'PNG', optimize=True)
        print(f"Generated standard icon: {out_path}")

    # Corner pixel color of logo.png for seamless maskable background padding
    corner_rgb = base_img.getpixel((0, 0))[:3]
    maskable_bg = corner_rgb + (255,)

    # Maskable icons (safe zone ~80% inner with seamless corner background)
    maskable_sizes = [192, 512]
    for s in maskable_sizes:
        maskable_canvas = Image.new('RGBA', (s, s), maskable_bg)
        inner_size = int(s * 0.80)
        inner_resized = base_img.resize((inner_size, inner_size), Image.Resampling.LANCZOS)
        offset = (s - inner_size) // 2
        maskable_canvas.paste(inner_resized, (offset, offset), inner_resized)
        out_path = os.path.join(icons_dir, f'maskable-icon-{s}x{s}.png')
        maskable_canvas.save(out_path, 'PNG', optimize=True)
        print(f"Generated maskable icon: {out_path}")

    # 2. Screenshots
    # Wide screenshot (1280x720)
    wide_w, wide_h = 1280, 720
    wide_img = Image.new('RGB', (wide_w, wide_h), (91, 201, 255))
    draw_wide = ImageDraw.Draw(wide_img)

    # Decorate wide screenshot
    # Draw cloud-like bubbles or header banner
    draw_wide.rectangle([0, 0, wide_w, 70], fill=(42, 157, 244))
    draw_wide.text((40, 22), "ART CLASS - MEDIA PEMBELAJARAN INTERAKTIF SENI BUDAYA", fill=(255, 255, 255))

    # Center card simulation with logo & artwork
    card_w, card_h = 800, 520
    card_x, card_y = (wide_w - card_w) // 2, 110
    draw_wide.rounded_rectangle([card_x, card_y, card_x + card_w, card_y + card_h], radius=24, fill=(255, 255, 255), outline=(230, 240, 255), width=3)
    
    # Paste centered logo in card
    logo_w, logo_h = 240, 240
    logo_thumb = base_img.resize((logo_w, logo_h), Image.Resampling.LANCZOS)
    wide_img.paste(logo_thumb, (card_x + (card_w - logo_w) // 2, card_y + 40), logo_thumb)
    
    # Text inside card
    draw_wide.text((card_x + 280, card_y + 310), "SELAMAT DATANG DI ART CLASS", fill=(30, 41, 59))
    draw_wide.text((card_x + 230, card_y + 350), "Petualangan Seru Belajar Seni Budaya & Prakarya", fill=(100, 116, 139))
    
    # Button mockup
    btn_w, btn_h = 260, 56
    btn_x = card_x + (card_w - btn_w) // 2
    btn_y = card_y + 410
    draw_wide.rounded_rectangle([btn_x, btn_y, btn_x + btn_w, btn_y + btn_h], radius=16, fill=(245, 158, 11))
    draw_wide.text((btn_x + 65, btn_y + 18), "MULAI PETUALANGAN", fill=(255, 255, 255))

    wide_out = os.path.join(screenshots_dir, 'screenshot-desktop-wide.png')
    wide_img.save(wide_out, 'PNG', optimize=True)
    print(f"Generated wide screenshot: {wide_out}")

    # Narrow screenshot (750x1334)
    narrow_w, narrow_h = 750, 1334
    narrow_img = Image.new('RGB', (narrow_w, narrow_h), (91, 201, 255))
    draw_narrow = ImageDraw.Draw(narrow_img)

    # Top app bar
    draw_narrow.rectangle([0, 0, narrow_w, 90], fill=(42, 157, 244))
    draw_narrow.text((40, 32), "ART CLASS 🎨", fill=(255, 255, 255))

    # Mobile Card
    mcard_w, mcard_h = 650, 950
    mcard_x = (narrow_w - mcard_w) // 2
    mcard_y = 150
    draw_narrow.rounded_rectangle([mcard_x, mcard_y, mcard_x + mcard_w, mcard_y + mcard_h], radius=28, fill=(255, 255, 255))

    mlogo_w, mlogo_h = 280, 280
    mlogo_thumb = base_img.resize((mlogo_w, mlogo_h), Image.Resampling.LANCZOS)
    narrow_img.paste(mlogo_thumb, (mcard_x + (mcard_w - mlogo_w) // 2, mcard_y + 80), mlogo_thumb)

    draw_narrow.text((mcard_x + 190, mcard_y + 420), "ART CLASS", fill=(30, 41, 59))
    draw_narrow.text((mcard_x + 120, mcard_y + 470), "Media Pembelajaran Interaktif", fill=(100, 116, 139))
    draw_narrow.text((mcard_x + 140, mcard_y + 510), "Seni Budaya & Prakarya (SBdP)", fill=(71, 85, 105))

    # Menu items mockup
    menu_items = ["🎨 Materi Seni Rupa", "🎵 Eksplorasi Musik", "✂️ Seni Tari & Prakarya", "🎯 Kuis Tantangan"]
    for i, item in enumerate(menu_items):
        item_y = mcard_y + 580 + (i * 70)
        draw_narrow.rounded_rectangle([mcard_x + 50, item_y, mcard_x + mcard_w - 50, item_y + 55], radius=14, fill=(241, 245, 249))
        draw_narrow.text((mcard_x + 80, item_y + 18), item, fill=(30, 41, 59))

    narrow_out = os.path.join(screenshots_dir, 'screenshot-mobile-narrow.png')
    narrow_img.save(narrow_out, 'PNG', optimize=True)
    print(f"Generated narrow screenshot: {narrow_out}")

if __name__ == '__main__':
    generate_pwa_assets()
