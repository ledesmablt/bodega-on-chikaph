# Methodology

## Sources & analysis
Reddit post data for r/ChikaPH was downloaded on July 9, 2025 from [Project Arctic Shift](https://github.com/ArthurHeitmann/arctic_shift),
an open-source database of Reddit posts and comments.

The 180 posts were shortlisted from the 10 posts with the highest upvotes for every month from January 2024 to June 2025.
I manually tagged the subject & sentiment per post by skimming its contents and comments, as well as additional googling where necessary.

For the analysis, I used Jupyter Notebook (pandas & matplotlib) and good ol' Google Sheets / Excel **(TODO: OPEN SOURCE!!)**.

For the visualization, I used svelte and d3.

## Tagging subjects

A *subject* is a person, organization, or topic to whom the engagement of the post (the high number of upvotes and comments) can be attributed to. A post may contain one or more subjects.

A subject may also look like a prominent person commenting on others going viral (in which case both are subjects), a celebrity being commented on by an anonymous user (in which case the celebrity is what the community probably “latched” on to and is therefore the subject), and so on.

It’s more nuanced when there are multiple potential subjects in the post. If one seems to have a stronger impact on the performance of the post (e.g. a celebrity is doing all talking during a talk show with a famous interviewer), only that subject is tagged in the post. If more than one of the subjects contributes significantly to the impact of the post (e.g. a collaborative social media post where everyone has the same screen time), all or at least more than one of the subjects are mentioned.

## Tagging sentiment

*Sentiment* is how the community is generally responding to the post content. This was manually tagged and based on reading the top comments (those with the most upvotes often end up on top).

The post sentiment is grouped into three main categories - positive, negative, and neutral. These categories also have their own subcategories:

- positive - respect, happy, funny, supportive
- negative - sad, annoyed, angry
- neutral - mixed, shocked, interested, neutral

I tried to refrain from adding a “neutral” category, but the way the community responded to some posts just didn’t fall cleanly into positive or negative.

Some posts had both strong positive & negative responses, and thus tagged as “mixed”.

From observing people reacting to scandals (both on Reddit and in real life), the feeling seems to be a mix of excitement to hear breaking news and almost a morbid curiosity to hear something so controversial — this is nuanced and common enough to deserve its own subcategory, “shocked”.

Finally, posts whose responses felt lukewarm or nonchalant fell into either “interested” (e.g. *"alright, nice post"*) or just “neutral” (e.g. *"ok i get it, moving on with life"*).

## Caveats & other notes
Post data does not reflect realtime stats — e.g. upvotes
are not as high as when you check them on Reddit itself, or some posts have been deleted. The cadence of ingestion and
whether existing data is updated is unclear, but from spot-checking a few old & recent posts and their upvotes,
the dataset is close enough to realtime data (a few hundred to a thousand upvotes apart) to paint a close-enough
picture of what's trending on the subreddit.

**TODO further analysis for next time?**
