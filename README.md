# Sensing Yuksam: website

A community-authored digital archive of Yuksam, West Sikkim. Plain HTML, CSS and JavaScript. No build step, nothing to install.

**All the stories live in one file: `data/chapters.json`.** To add a film, a photo or a sound, you only edit that file (and drop in a photo if there is one). You never need to touch the HTML.

```
index.html          home page
chapters.html       all ten chapters
chapter.html        one template for every chapter (chapter.html?id=yak)
about.html          the About page (edit the words directly in this file)
data/chapters.json  ALL chapter text and contributions
assets/photos/      photos (compressed)
assets/video/       offline copies of films for the stall laptop (not uploaded to GitHub)
assets/audio/       short sound recordings (mp3)
assets/logos/       KCC and Leiden logos
```

---

## 1. Add a contribution

1. Open `data/chapters.json` in any text editor (VS Code, TextEdit in plain-text mode, Notepad).
2. Find the chapter by its `"id"` (for example `"id": "people"`). Inside it you will see `"contributions": []`.
3. Copy the block below, paste it between the square brackets, and change the words. If the chapter already has a contribution, put a **comma** between the blocks.

```json
{
  "type": "video",
  "title": "Opening the shop",
  "url": "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
  "local_video": "",
  "image": "opening-the-shop.jpg",
  "alt": "Dawa pulling up the shutter of his shop at sunrise",
  "made_by": "Pema Lhamu",
  "made_by_url": "https://www.youtube.com/@pemalhamu",
  "featuring": "Dawa Sherpa, shopkeeper",
  "place": "Yuksam bazaar",
  "date": "March 2026",
  "description": "Every morning he opens at six. Nobody is up yet, but he says the first hour is the best one."
}
```

What each line means:

| Field | What to put | Needed? |
|---|---|---|
| `type` | `"video"`, `"photo"` or `"audio"` | yes |
| `title` | Name of the piece | yes |
| `url` | **The easiest way for videos:** paste the full link to the post on the maker's own YouTube or Facebook (see section 3). Use this *or* `youtube_id` | for videos |
| `youtube_id` | Only the code from a YouTube link. Use this instead of `url` if you prefer | for videos |
| `local_video` | File name of an offline copy in `assets/video/` (see section 5), or `""` | optional |
| `image` | For a **photo**: the photo itself. For a **video**: the thumbnail shown before play. Just the file name, for example `"opening-the-shop.jpg"` | photos: yes. Videos: recommended |
| `audio` | For **audio**: file name in `assets/audio/`, for example `"rain-on-roof.mp3"` | for audio |
| `alt` | One sentence describing the picture, for people who cannot see it | yes, always |
| `made_by` | **The person who made it.** Credit the maker, not only the subject | yes |
| `made_by_url` | Optional. Link to the maker's own channel or page. Their name becomes a link to it | optional |
| `credit_label` | Optional. Changes the handwritten word before the name. Normally "filmed by" (video), "photographed by" (photo), "recorded by" (audio) | optional |
| `featuring` | The person or thing shown | optional |
| `place` | Where in Yuksam | optional |
| `date` | Any format you like | optional |
| `description` | A few lines in the contributor's own words. A new paragraph: write `\n` | optional |

**Common mistakes** (the site will show "The stories did not load" if the file has one):

- A missing or extra comma. Every block except the last needs a comma after its closing `}`.
- Straight quotes only: `"like this"`, not curly “quotes”.
- Inside a description, do not use a double quote `"`. Use a single one `'` instead.
- Check your file at <https://jsonlint.com> by pasting it in.

When a chapter gets its first contribution, its tile on the home page automatically gets the orange **Now open** badge and loses the "Waiting for stories" label. You do not need to change anything else.

### Change a chapter's wording

In the same file, each chapter has `title_ne` (the Nepali title: replace `[Nepali title]`), `tagline` (the one line on the tile), `intro` (the sentence in the coloured band at the top of the chapter page) and `prompts` (the list of ideas). Edit the text between the quotes.

### Change the WhatsApp link, QR code, logos and contact line

At the top of `data/chapters.json`, in the `"site"` section:

- `whatsapp_url`: `https://wa.me/91XXXXXXXXXX` (country code, then the number, no `+` and no spaces)
- `qr_image`: replace `assets/qr-whatsapp.png` with a real QR code (make one at any free QR generator, save it as a PNG)
- `logos`: the two files in `assets/logos/`
- `contact_line`: the line in the footer

---

## 2. Add photos

Put photos in `assets/photos/`. Then write only the file name in `"image"`.

**Compress before adding.** Phone photos are 3 to 8 MB and the site is used on weak networks. Aim for **under 250 KB each**, about **1600 pixels** on the long side.

- **Easiest (any computer):** open <https://squoosh.app>, drop the photo in, choose **MozJPEG**, quality about 70, resize to 1600 px wide, download.
- **On a Mac, one photo:**
  ```bash
  sips -Z 1600 -s format jpeg -s formatOptions 70 big-photo.jpg --out assets/photos/opening-the-shop.jpg
  ```
- **On a Mac, every photo in a folder:**
  ```bash
  mkdir -p compressed && sips -Z 1600 -s format jpeg -s formatOptions 70 *.jpg --out compressed
  ```

Use simple file names: small letters, no spaces (`opening-the-shop.jpg`, not `IMG 4821 (1).JPG`).

The home page collage uses `home-01.jpg` to `home-06.jpg`, and the Yak tile uses `yak-cover.jpg`. Replace those files with real photos of the same names (or change the names in `index.html` and in `data/chapters.json`).

Do not put videos in the repository. Videos go on YouTube.

---

## 3. Videos: use the maker's own YouTube or Facebook

People keep their films on their own channels. The website does **not** copy them. Each film is a short entry in `data/chapters.json` that points at the maker's post, and the site plays it from there.

**To add a film that someone has already posted:**

1. Open the post and copy its address from the browser bar (or from the Share button).
2. Paste it as `"url"`. These all work:
   - `https://www.youtube.com/watch?v=dQw4w9WgXcQ`
   - `https://youtu.be/dQw4w9WgXcQ`
   - `https://www.youtube.com/shorts/dQw4w9WgXcQ`
   - a Facebook video or reel link, for example `https://www.facebook.com/someone/videos/123456789/`
   - any other website (Instagram, Vimeo): the thumbnail opens it in a new tab instead of playing inside the page
3. Fill `made_by` with the maker's name, and `made_by_url` with a link to their channel or page.
4. Add a thumbnail (`"image"`). For YouTube the site fetches one automatically if you leave it empty. **Facebook and other sites do not give one, so save a still from the film** and use it (see section 2).

Under each film the site always shows a **Watch on YouTube** or **Watch on Facebook** link. That matters, because makers can switch off embedding, and then the film will not play inside the page but the link still works.

**Things to agree with makers before adding their film** (a short WhatsApp message is enough):

- **Permission.** Ask that they are happy for it to appear on Sensing Yuksam, with their name. Keep their reply.
- **Public.** The post must be **Public** (or **Unlisted** on YouTube). Facebook posts set to Friends only will not play for visitors. A Private YouTube video will not play at all.
- **Embedding on.** On YouTube, "Allow embedding" must be switched on (YouTube Studio → video → Show more).
- **If they delete it,** the entry on this site stops working. Check the chapters from time to time, and remove the block if the film is gone.
- **Stall and weak network.** Facebook is heavy and slow on weak connections. For key films ask the maker for the original file and use `local_video` (section 5), so the stall copy does not depend on the internet.

**A message you can send to a maker** (edit the words, then paste into WhatsApp):

> Hello [name]. We would like to show your film "[title]" on the Sensing Yuksam website, under the chapter "[chapter]". It stays on your own [YouTube / Facebook] channel. The website only links to it and shows your name as the maker. Is that all right? If you ever want it taken off, tell us and we will remove it the same day. Please check that the video is set to Public and, on YouTube, that embedding is allowed.

**If someone has not posted anywhere yet,** the simplest route is a shared Sensing Yuksam YouTube channel run by the team: upload there (YouTube Studio → Create → Upload videos, visibility **Unlisted** or **Public**, "No, it's not made for kids"), copy the link and paste it as `"url"`. Write the maker's name in `made_by`, because the channel belongs to the project, not to them.

---

## 4. Publish with GitHub Pages

1. Put this whole folder in a GitHub repository (the files `index.html`, `data/`, `assets/` must be at the top level, not inside another folder).
2. On GitHub open the repository, then **Settings → Pages**.
3. Under **Build and deployment**, set **Source** to **Deploy from a branch**.
4. Choose the branch **main** and the folder **/ (root)**, then **Save**.
5. Wait a minute or two. GitHub shows the address at the top of the Pages screen, usually `https://YOUR-NAME.github.io/REPOSITORY-NAME/`.

After that, every time you save a change to `main` (including editing `data/chapters.json` right on github.com with the pencil icon), the live site updates in a minute or so.

Tip: if the live site looks unchanged, hard-refresh (Cmd+Shift+R or Ctrl+Shift+R).

---

## 5. Running an offline copy at the stall

YouTube needs the internet. For the stall laptop, keep a local copy of the key films so they play with no network.

**Before the festival (with internet):**

1. Download your key films as `.mp4` files (from YouTube Studio: your video → three dots → Download, or use the original file).
2. Put them in `assets/video/`, for example `assets/video/karki-maila.mp4`. This folder is not uploaded to GitHub, which is deliberate.
3. In `data/chapters.json`, set the contribution's `"local_video"` to just the file name:
   ```json
   "local_video": "karki-maila.mp4"
   ```
4. Keep the `"youtube_id"` as well. The site chooses automatically: when the offline file is found it plays that, otherwise it uses YouTube. So the same JSON works on GitHub Pages and on the laptop.
5. Keep the thumbnail (`"image"`) in `assets/photos/`, so the film shows a picture while offline.

**At the stall (no internet):**

- **Mac:** double-click `start-offline.command`. The first time, if macOS blocks it, right-click it, choose **Open**, then **Open** again.
- **Windows:** double-click `start-offline.bat`. (Needs Python installed from python.org.)
- Your browser opens at `http://localhost:8000`. Leave the black window open while you use the site. Close it to stop.

**Why not just double-click `index.html`?** Browsers will not let a page read `data/chapters.json` when opened straight from the disk, so the chapters would not appear. The start script runs a tiny server on the laptop only. Nothing goes on the internet. (If you prefer, the "Live Server" extension in VS Code does the same job.)

What works offline: the whole site, all photos, the fonts, and any film with a `local_video`. What does not: YouTube films without a local copy, and the WhatsApp link. People at the stall can scan the QR code with their own phones.

Test the offline copy once at home with the Wi-Fi switched off.

---

## Still to replace before sharing

| Where | What |
|---|---|
| `title_ne` for every chapter, and `SITE_TITLE_NE` in `assets/js/app.js` | The Nepali titles are drafts. Ask a Nepali speaker on the team to check and correct them |

Every chapter's cover photo is set with `cover_image` and `cover_alt` in `data/chapters.json`. Replace any of them by dropping a new compressed photo into `assets/photos/` and changing the file name there.

Already done: real photos on the home collage and on all ten chapters (compressed), the About page (written from the two invitation letters), the footer logos (KCC and Leiden), the footer contact names, the home page text and caption.
