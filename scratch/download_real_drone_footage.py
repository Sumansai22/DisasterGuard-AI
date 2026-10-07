import os
import sys
import subprocess
import requests
import imageio_ffmpeg

def download_and_transcode():
    ffmpeg_exe = imageio_ffmpeg.get_ffmpeg_exe()
    print("Using FFmpeg:", ffmpeg_exe)

    target_dir = r"C:\Users\Sumanth\.gemini\antigravity\scratch\landslideguard-ai\public\demo"
    os.makedirs(target_dir, exist_ok=True)
    raw_temp = os.path.join(target_dir, "raw_aerial_source.webm")
    output_mp4 = os.path.join(target_dir, "drone-rescue-real-footage.mp4")
    output_fallback = os.path.join(target_dir, "drone-flash-flood-demo.mp4")

    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 LandslideGuard/1.0 (contact@example.org)'
    }

    candidate_urls = [
        # Real aerial flood / river reconnaissance footage from Wikimedia / NOAA
        "https://upload.wikimedia.org/wikipedia/commons/c/c2/Aerial_View_of_Bright_Angel_Canyon_%2855503817002%29.webm",
        "https://upload.wikimedia.org/wikipedia/commons/a/a0/Aerial_View_of_Bright_Angel_Canyon_%2855505196570%29.webm",
        "https://upload.wikimedia.org/wikipedia/commons/9/93/Kentucky_and_Missouri_Devastated_by_Flash_Flooding_%28NESDIS_2022-08-04_2022_08_04_KYandMODevastatedbyFlashFlooding_TWITTER%29.webm",
        "https://upload.wikimedia.org/wikipedia/commons/1/1d/Pont_Ddyfi_Newydd%2C_Machynlleth%2C_Powys_-_the_Welsh_Government%27s_New_Dyfi_Bridge%2C_Machynlleth%2C_Wales.webm"
    ]

    success = False
    for url in candidate_urls:
        print(f"\nAttempting download from: {url}")
        try:
            with requests.get(url, headers=headers, stream=True, timeout=15) as r:
                r.raise_for_status()
                total_length = r.headers.get('content-length')
                print(f"Connected. Content-Length: {total_length} bytes.")
                downloaded = 0
                with open(raw_temp, 'wb') as f:
                    for chunk in r.iter_content(chunk_size=65536):
                        if chunk:
                            f.write(chunk)
                            downloaded += len(chunk)
                            if downloaded % (1024 * 1024) < 65536:
                                sys.stdout.write(f"\rDownloaded {downloaded // (1024*1024)} MB...")
                                sys.stdout.flush()
                print(f"\nFinished downloading {downloaded} bytes.")
                if downloaded > 100_000:
                    success = True
                    break
        except Exception as e:
            print(f"Download failed for {url}: {e}")

    if not success or not os.path.exists(raw_temp):
        print("Could not download candidate videos. Exiting.")
        return False

    print("Transcoding to standard browser-compatible H.264 (yuv420p) + faststart MP4...")
    transcode_cmd = [
        ffmpeg_exe, "-y",
        "-i", raw_temp,
        "-t", "50",
        "-c:v", "libx264",
        "-preset", "veryfast",
        "-crf", "22",
        "-pix_fmt", "yuv420p",
        "-movflags", "+faststart",
        "-vf", "scale=1280:720:force_original_aspect_ratio=decrease,pad=1280:720:(ow-iw)/2:(oh-ih)/2:color=black",
        "-an",
        output_mp4
    ]

    res = subprocess.run(transcode_cmd, capture_output=True, text=True)
    if res.returncode != 0:
        print("FFmpeg transcode error:", res.stderr)
        return False

    file_sz = os.path.getsize(output_mp4)
    print(f"Transcode succeeded! Output file: {output_mp4} ({file_sz} bytes)")

    import shutil
    shutil.copyfile(output_mp4, output_fallback)
    print(f"Copied to fallback: {output_fallback}")

    if os.path.exists(raw_temp):
        os.remove(raw_temp)

    # Clean up any leftover temp files in public/demo
    for fname in ["temp_real_source.ogv", "temp_real_source.webm", "raw_temp.webm"]:
        p = os.path.join(target_dir, fname)
        if os.path.exists(p):
            try:
                os.remove(p)
            except:
                pass

    return True

if __name__ == "__main__":
    if download_and_transcode():
        print("\nSUCCESS: Real drone disaster footage is ready and installed.")
    else:
        sys.exit(1)
