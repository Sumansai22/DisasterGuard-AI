import os
import subprocess
import cv2
import numpy as np
import math
import imageio_ffmpeg

def generate_h264_drone_video():
    ffmpeg_exe = imageio_ffmpeg.get_ffmpeg_exe()
    print(f"Using FFmpeg: {ffmpeg_exe}")

    os.makedirs("public/demo", exist_ok=True)
    raw_temp_path = "public/demo/temp_raw.mp4"
    final_output_path = "public/demo/drone-flash-flood-demo.mp4"

    width, height = 960, 540
    fps = 24
    duration_sec = 48
    total_frames = fps * duration_sec

    # Generate video frames with OpenCV
    fourcc = cv2.VideoWriter_fourcc(*'mp4v')
    out = cv2.VideoWriter(raw_temp_path, fourcc, fps, (width, height))

    for f in range(total_frames):
        t = f / fps
        img = np.zeros((height, width, 3), dtype=np.uint8)

        # 1. Dynamic terrain gradient (aerial perspective over flooded canal sector)
        shift_x = int(math.sin(t * 0.2) * 30)
        
        # Muddy flooded banks & vegetation
        img[:int(height * 0.42), :] = [60, 85, 95]   # Muddy river bank / slope
        img[int(height * 0.42):, :] = [120, 90, 48]  # Turbid flood inundation water (BGR)

        # Water surface flow ripples
        for y_wave in range(int(height * 0.42), height, 20):
            offset = int(math.sin(t * 3.5 + y_wave * 0.08) * 12)
            cv2.line(img, (0, y_wave + offset), (width, y_wave + offset), (145, 115, 70), 1)

        # Arterial road & embankment (partially submerged)
        road_pts = np.array([
            [int(width * 0.08) + shift_x, height],
            [int(width * 0.22) + shift_x, int(height * 0.28)],
            [int(width * 0.32) + shift_x, int(height * 0.28)],
            [int(width * 0.20) + shift_x, height]
        ], np.int32)
        cv2.fillPoly(img, [road_pts], (75, 80, 85))

        # Inundated residential rooftops / structures
        buildings = [
            (160, 110, 80, 60, (135, 75, 60)),
            (440, 150, 95, 75, (140, 80, 65)),
            (700, 190, 105, 85, (130, 70, 55)),
        ]
        for bx, by, bw, bh, roof_col in buildings:
            cv2.rectangle(img, (bx, by), (bx + bw, by + bh), (95, 100, 105), -1)
            cv2.rectangle(img, (bx + 5, by + 5), (bx + bw - 5, by + bh - 5), roof_col, -1)
            # Water perimeter line
            cv2.rectangle(img, (bx - 4, by - 4), (bx + bw + 4, by + bh + 4), (130, 100, 55), 2)

        # 2. Key Person Detections at specific flight sector windows:
        # PERSON #12 at t ~ 14s (seconds 10 to 24), lying on rooftop at (42% x, 48% y)
        if 10.0 <= t <= 24.0:
            p12_x, p12_y = int(width * 0.42), int(height * 0.48)
            cv2.ellipse(img, (p12_x + 38, p12_y + 18), (34, 13), 15, 0, 360, (45, 55, 210), -1) # red/orange clothing
            cv2.circle(img, (p12_x + 14, p12_y + 14), 7, (185, 205, 225), -1) # head

        # PERSON #07 at t ~ 28s (seconds 24 to 38), standing/signaling near water edge (68% x, 36% y)
        if 24.0 <= t <= 38.0:
            p7_x, p7_y = int(width * 0.68), int(height * 0.36)
            arm_wave = int(math.sin(t * 6.5) * 14)
            cv2.ellipse(img, (p7_x + 20, p7_y + 40), (13, 26), 0, 0, 360, (210, 185, 45), -1) # yellow rain jacket
            cv2.circle(img, (p7_x + 20, p7_y + 15), 9, (185, 205, 225), -1)
            cv2.line(img, (p7_x + 20, p7_y + 25), (p7_x + 34 + arm_wave, p7_y + 6 - arm_wave), (210, 185, 45), 4)

        # PERSON #04 at t ~ 42s (seconds 38 to 48), walking on high ground (22% x, 62% y)
        if 38.0 <= t <= 48.0:
            p4_x, p4_y = int(width * 0.22), int(height * 0.62)
            walk_shift = int((t - 38.0) * 5)
            cv2.ellipse(img, (p4_x + walk_shift, p4_y + 20), (12, 25), 0, 0, 360, (65, 165, 75), -1) # green jacket
            cv2.circle(img, (p4_x + walk_shift, p4_y - 2), 8, (185, 205, 225), -1)

        # 3. UAV Flight HUD Graphic Overlays (Embedded inside video frames)
        cv2.putText(img, "DRONE-01 [NDMA DISASTER RECON]", (25, 35), cv2.FONT_HERSHEY_SIMPLEX, 0.65, (0, 255, 255), 2)
        cv2.putText(img, "ALT: 48.2m | SPD: 18.4km/h | BAT: 87%", (25, 62), cv2.FONT_HERSHEY_SIMPLEX, 0.5, (220, 220, 220), 1)

        mins = int(t // 60)
        secs = int(t % 60)
        ms = int((t % 1) * 100)
        cv2.putText(img, f"TIME: {mins:02d}:{secs:02d}.{ms:02d}", (width - 210, 35), cv2.FONT_HERSHEY_SIMPLEX, 0.6, (0, 255, 0), 2)
        cv2.putText(img, "GPS: 16.5448N, 81.5212E", (width - 250, 62), cv2.FONT_HERSHEY_SIMPLEX, 0.5, (220, 220, 220), 1)

        # Central Crosshair & Gimbal Reticle
        cx, cy = width // 2, height // 2
        cv2.line(img, (cx - 22, cy), (cx + 22, cy), (0, 255, 255), 1)
        cv2.line(img, (cx, cy - 22), (cx, cy + 22), (0, 255, 255), 1)
        cv2.circle(img, (cx, cy), 32, (0, 255, 255), 1)

        out.write(img)

    out.release()
    print(f"Temporary raw video created at {raw_temp_path}")

    # Transcode raw temp to genuine H.264 (avc1) with yuv420p and faststart using FFmpeg
    cmd = [
        ffmpeg_exe,
        "-y",
        "-i", raw_temp_path,
        "-c:v", "libx264",
        "-pix_fmt", "yuv420p",
        "-profile:v", "baseline",
        "-level", "3.0",
        "-movflags", "+faststart",
        final_output_path
    ]
    print(f"Running FFmpeg transcode: {' '.join(cmd)}")
    subprocess.run(cmd, check=True)

    if os.path.exists(raw_temp_path):
        os.remove(raw_temp_path)

    final_size = os.path.getsize(final_output_path)
    print(f"✓ Successfully generated H.264 demo video at {final_output_path} ({final_size} bytes)")

if __name__ == "__main__":
    generate_h264_drone_video()
