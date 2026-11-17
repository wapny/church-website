# Contact form setup

The form is built and works on the page. To make messages arrive in your inbox you only need to connect it to a free form service. A website cannot send email by itself, so this one step is needed.

## Option: Formspree (free plan, about 50 messages per month)

1. Go to https://formspree.io and create an account (use the email where you want to receive messages, for example ceribubaka@gmail.com).
2. Click **New form**, give it a name (for example "Mayak Nadezhdy website") and save it.
3. Formspree shows a form address that looks like `https://formspree.io/f/abcdwxyz`. Copy it.
4. Open `index.html` and find this line:

   ```html
   <form class="cform" id="contact-form" novalidate data-endpoint="">
   ```

5. Paste your address between the quotes:

   ```html
   <form class="cform" id="contact-form" novalidate data-endpoint="https://formspree.io/f/abcdwxyz">
   ```

6. Upload the site again. Send yourself a test message. The first time, Formspree sends a confirmation email: confirm it.

## Notes

- While `data-endpoint` is empty, the form shows the message "The form is not connected to email yet" and gives the church email address. Nothing is sent.
- The form does not work inside the preview link, because the preview blocks sending data to other sites. It works on the real hosted website.
- Spam: the form has a hidden trap field (`_gotcha`) that blocks simple bots. Formspree also has its own spam filter.
- Other services work the same way (Web3Forms, Getform, Netlify Forms with small changes). Any service that accepts a normal form POST and returns JSON will work with the `data-endpoint` address.

# Languages

- The site has Russian (default), Latvian and English. The visitor's choice is remembered in their browser.
- All Latvian and English texts are in `js/i18n.js`. Find the key (for example `history.p1`) and edit the text between the quotes.
- Russian texts are written directly in `index.html`.
