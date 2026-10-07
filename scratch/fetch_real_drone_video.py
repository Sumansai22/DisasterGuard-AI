import os
import json
import urllib.request
import subprocess
import imageio_ffmpeg

def search_and_download_real_footage():
    ffmpeg_exe = imageio_ffmpeg.get_ffmpeg_exe()
    os.makedirs("public/demo", exist_ok=True)
    target_output_path = "public/demo/drone-rescue-real-footage.mp4"
    legacy_output_path = "public/demo/drone-flash-flood-demo.mp4"

    # Search Wikimedia Commons for real aerial flood disaster videos
    queries = [
        "flood aerial",
        "flooding aerial",
        "inundation aerial",
        "helicopter flood",
        "drone flood",
        "flooding",
        "flood rescue"
    ]
    
    headers = {"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"}
    video_url = None
    found_title = None

    for q in queries:
        api_url = f"https://commons.wikimedia.org/w/api.php?action=query&generator=search&gsrsearch={urllib.parse.quote(q)}&gsrnamespace=6&prop=imageinfo&iiprop=url|mime|size&format=json"
        try:
            req = urllib.request.Request(api_url, headers=headers)
            with urllib.request.urlopen(req, timeout=10) as resp:
                data = json.loads(resp.read().decode('utf-8'))
                pages = data.get('query', {}).get('pages', {})
                for pid, page in pages.items():
                    title = page.get('title', '')
                    ii = page.get('imageinfo', [{}])[0]
                    mime = ii.get('mime', '')
                    url = ii.get('url', '')
                    if ('video' in mime or url.endswith(('.webm', '.ogv', '.mp4'))) and ('flood' in title.lower() or 'aerial' in title.lower() or 'inundat' in title.lower() or 'rescue' in title.lower()):
                        print(f"Found candidate real disaster footage: {title} ({mime}) -> {url}")
                        video_url = url
                        found_title = title
                        break
        except Exception as e:
            print(f"Query {q} error:", e)
        if video_url:
            break

    if not video_url:
        # Fallback to direct high-quality open-access US Gov / Public Domain real flood aerial video on Wikimedia
        # E.g. "Aerial view of flooded areas along the Red River" or "Helicopter view of flooded terrain"
        video_url = "https://upload.wikimedia.org/wikipedia/commons/e/e0/Aerial_views_of_flooding_in_North_Dakota_%282009%29.webm"
        found_title = "Aerial views of flooding (Recorded Aerial Disaster Footage)"

    print(f"\nDownloading real footage from: {video_url}")
    temp_download = "public/demo/temp_real_source.webm" if video_url.endswith('.webm') else "public/demo/temp_real_source.ogv"
    
    req = urllib.request.Request(video_url, headers=headers)
    with urllib.request.urlopen(req, timeout=30) as resp, open(temp_download, "wb") as f:
        f.write(resp.read())
        
    print(f"Downloaded source file: {os.path.getsize(temp_download)} bytes")

    # Transcode downloaded real footage into high-compatibility H.264 (avc1) MP4 with faststart
    cmd = [
        ffmpeg_exe,
        "-y",
        "-i", temp_download,
        "-c:v", "libx264",
        "-pix_fmt", "yuv420p",
        "-profile:v", "main",
        "-movflags", "+faststart",
        "-t", "60",  # 60 seconds
        target_output_path
    ]
    print("Transcoding to standard H.264 MP4:", " ".join(cmd))
    subprocess.run(cmd, check=True)

    # Also copy to legacy path for backward compatibility
    import shutil
    shutil.copyfile(target_output_path, legacy_output_path)

    if os.path.exists(temp_download):
        os.remove(temp_download)

    print(f"[PASS] Successfully created real drone disaster footage at {target_output_path} ({os.path.getsize(target_output_path)} bytes)")

if __name__ == "__main__":
    search_and_download_real_footage()
