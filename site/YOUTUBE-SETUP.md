# Latest YouTube broadcast

The Broadcast section can show the newest video or live stream from the channel @mayaknadezdi directly on the site. It updates itself: after each Sunday service you do not need to change anything.

## One-time setup

1. Find the channel ID (it starts with `UC` and has 24 characters). On YouTube: open the channel, tap "About" (or the description), then "Share channel" -> "Copy channel ID". In YouTube Studio it is under Settings -> Channel -> Advanced settings.
2. Open `index.html` and find:

   ```html
   <div class="broadcast__media" id="yt-box" data-channel-id="">
   ```

3. Put the ID between the quotes, for example `data-channel-id="UCxxxxxxxxxxxxxxxxxxxxxx"`. This always shows the newest video.
4. To show one specific video instead (for example a particular sermon), put its 11-character ID in `data-video-id=""`: it is the part after `v=` in the video link. A video ID takes priority over the channel ID.

## Notes

- The player works on the real hosted website (https). It does not work when you open `index.html` from your own computer (file://), and not in the preview link: YouTube and the preview block it. There the site shows a picture that links to the channel.
- While `data-channel-id` is empty, the section shows the picture with a link to the channel.
- During a live stream the player shows the live video once YouTube lists it in the channel's uploads. If a stream does not show right away, it will appear as soon as YouTube publishes it.
- The channel's videos must allow embedding (YouTube Studio -> video -> "Allow embedding"), which is the default.
