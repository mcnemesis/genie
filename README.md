Genie
=======
Genie is a Chrome Browser extension that is meant to help you get more out of your surfing experience by leveraging the capabilities of Genius - the one annotation tool that rules them all.

HOW TO
------
- Clone this repository or just download and extract the zipped source code (alternatively, just download the genie.crx file which is a pre-packaged extension ready for installation)
- Open your Chrome browser and navigate to Settings > Extensions > (Check "Developer Mode") > "Load unpackaged extension" > navigate to where you placed the extracted Genie source files > Select that directory (genie) > You are ready to go!
- To see how it works, just visit any page on the web, and you shall notice that the Genie icon is displayed in your browser's address bar (on the extreme right).
- If the url you are viewing is not a page on Genius.com, and has already been annotated on Genius, the Genie icon will show as green, and clicking it will open a popup indicating how many annotations there are on that page so far. Also, clicking on the Genius icon in the popup will open a new tab from where you can read these annotations or even create new ones!

![When a page on the web has been annotated on Genius](https://raw.githubusercontent.com/mcnemesis/genie/master/demo/Anotated.png)

- If a page has never been annotated, then Genie icon will show as a black, and you shall have the option to create the first annotations for that page by clicking on the Genius logo that shows in the Genie popup.

![When a page on the web has never been annotated on Genius before](https://raw.githubusercontent.com/mcnemesis/genie/master/demo/NotAnotated.png)


- If the page you are currently viewing happens to be hosted on Genius itself (genius.com or genius.it), then currently, there's really no need to take you anywhere else. The Genius Icon will show where the genie previosly did, and clicking on the Genius logo in the popup opens the Genius.com home page in a new tab.

![When you are on a Genius hosted page](https://raw.githubusercontent.com/mcnemesis/genie/master/demo/OnGenius.png)

- **NOTE** that you NOW have the option to directly view and or update/create annotations on any web page you may happen to be viewing, without leaving or navigating to a new tab, by merely checking the box labelled "Use Genius Right Here" as shown below. This thus offers you the SAME functionality as what the official Genius Extension currently gives you (well, +more).

![Enable inline annotations](https://raw.githubusercontent.com/mcnemesis/genie/master/demo/InlineAnnotation.png)

To DISABLE inline annotations on the current page, simply click the Genie icon again, uncheck the "Use Genius Right Here", and the page will be reloaded without inline annotations - meaning, you can interact with it normally.

BUGS
-----
The [Genius API](https://docs.genius.com/) was just officially released a few hours back, and I started working on this Chrome extension a couple hours later. So, there will definitely be some bugs I might have overlooked thus far. So, should you find anything failing, please let me know via this very repository.

For those wanting to push the edge, please fork and contibute to the enhancement of this little nifty utility, who knows what we might do with a simple Extension, now that we have an API? Pull Requests are very welcome as well...

