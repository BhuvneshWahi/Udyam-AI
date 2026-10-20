import os
from PIL import Image, ImageDraw

def create_pwa_icon(size: int, output_path: str, maskable: bool = False):
    img = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)

    scale = size / 512.0
    corner_radius = int((64 if maskable else 112) * scale) if not maskable else 0

    # Background
    # Dark Slate (#0f172a)
    if maskable:
        draw.rectangle([0, 0, size, size], fill=(15, 23, 42, 255))
    else:
        draw.rounded_rectangle([0, 0, size, size], radius=corner_radius, fill=(15, 23, 42, 255))
        # Subtle border
        draw.rounded_rectangle([int(4*scale), int(4*scale), size - int(4*scale), size - int(4*scale)], 
                               radius=int(104*scale), outline=(51, 65, 85, 180), width=int(4*scale))

    # Inner Content Scale (maskable needs safe zone padding: 80% inner area)
    margin_factor = 0.85 if maskable else 1.0
    cx = size / 2.0
    cy = size / 2.0

    # Draw stylized U shape
    # Line width
    stroke_w = max(4, int(48 * scale * margin_factor))
    
    # Left vert, bottom arc, right vert
    left_x = cx - int(108 * scale * margin_factor)
    right_x = cx + int(108 * scale * margin_factor)
    top_y = cy - int(120 * scale * margin_factor)
    bottom_y = cy + int(40 * scale * margin_factor)
    arc_bottom = cy + int(148 * scale * margin_factor)

    # Vertical left
    draw.line([left_x, top_y, left_x, bottom_y], fill=(16, 185, 129, 255), width=stroke_w)
    # Vertical right
    draw.line([right_x, top_y, right_x, bottom_y], fill=(59, 130, 246, 255), width=stroke_w)

    # Arc bottom
    bbox = [left_x - stroke_w//2, bottom_y - (arc_bottom - bottom_y), right_x + stroke_w//2, arc_bottom]
    draw.arc(bbox, start=0, end=180, fill=(6, 182, 212, 255), width=stroke_w)

    # Terminal caps (rounded endpoints)
    half_w = stroke_w // 2
    draw.ellipse([left_x - half_w, top_y - half_w, left_x + half_w, top_y + half_w], fill=(16, 185, 129, 255))
    draw.ellipse([right_x - half_w, top_y - half_w, right_x + half_w, top_y + half_w], fill=(59, 130, 246, 255))

    # AI Sparkle at Top-Right
    spark_cx = cx + int(115 * scale * margin_factor)
    spark_cy = cy - int(135 * scale * margin_factor)
    s_rad = int(32 * scale * margin_factor)

    # Star polygon
    star_points = [
        (spark_cx, spark_cy - s_rad),
        (spark_cx + s_rad // 3, spark_cy - s_rad // 3),
        (spark_cx + s_rad, spark_cy),
        (spark_cx + s_rad // 3, spark_cy + s_rad // 3),
        (spark_cx, spark_cy + s_rad),
        (spark_cx - s_rad // 3, spark_cy + s_rad // 3),
        (spark_cx - s_rad, spark_cy),
        (spark_cx - s_rad // 3, spark_cy - s_rad // 3),
    ]
    draw.polygon(star_points, fill=(245, 158, 11, 255))
    center_rad = max(2, int(6 * scale * margin_factor))
    draw.ellipse([spark_cx - center_rad, spark_cy - center_rad, spark_cx + center_rad, spark_cy + center_rad], fill=(255, 255, 255, 255))

    # Center glowing dot
    c_dot_rad = max(3, int(12 * scale * margin_factor))
    dot_y = cy + int(70 * scale * margin_factor)
    draw.ellipse([cx - c_dot_rad, dot_y - c_dot_rad, cx + c_dot_rad, dot_y + c_dot_rad], fill=(16, 185, 129, 255))

    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    img.save(output_path, "PNG")
    print(f"Generated {output_path} ({size}x{size})")

if __name__ == "__main__":
    icons_dir = os.path.join(os.path.dirname(__file__), "..", "public", "icons")
    create_pwa_icon(192, os.path.join(icons_dir, "icon-192.png"))
    create_pwa_icon(512, os.path.join(icons_dir, "icon-512.png"))
    create_pwa_icon(512, os.path.join(icons_dir, "icon-maskable.png"), maskable=True)
    print("All PWA icons created successfully.")
