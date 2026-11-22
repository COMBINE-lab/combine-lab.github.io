---
title: 'AI x Bio is not _just_ a data problem'
author: Rob Patro
member: rob-p
math: true
comments: true
category: blog
---


# Perspective matters

I keep making the same point in conversations, both in person and online, with people who are bullish on AI “solving biology.” I’d like to put it down here so I have a post to point to the next time it comes up. What could we learn about a living system if we ran the same experiment a million more times? My answer depends on what we measured in the first place.

<details style="border: 1px solid currentColor; border-radius: 0.4rem; padding: 0.65rem 0.9rem;">
  <summary><strong>A few caveats about “solving biology”</strong></summary>
  <p>I’m rarely sure what it would mean to “solve” biology. We can solve particular problems in biology, but understanding the living world seems to me a different sort of undertaking. It is a field of natural study, and understanding the world is not quite the same as solving a problem. I’m happy to set that semantic (and somewhat epistemological) question aside here.</p> 
  <p>I <em>absolutely</em> believe that AI will transform how we do biological research and what we can learn over the next several years. When people dismiss capabilities that AI systems have already demonstrated, or insist that their own field is uniquely impervious to any intelligence that isn’t human, I think they often confuse what they want to be true with what is.</p>
  <p>As I’ve written here before, I also take seriously the <em>ethical</em> concerns about how companies train frontier models and what it means for a handful of corporations to control how they’re deployed. Those questions deserve a discussion of their own.</p>
</details>

**Ultimately**, how far AI gets in biology, in large part, depends on how much data we have and, just as much, on what those data are: what we measured, from which vantage point, and which of those things we measured together in the same cell.

If you are missing certain information _by construction_ (or by design), then even with an unbounded amount of measurement, it is not clear that a model (or any intelligence) can learn what it must to predict, to compress, or to understand. Just as a lifetime of observation of shadows did not lead the prisoners of [Plato’s cave](https://pressbooks.ulib.csuohio.edu/republic/chapter/book-7/) to a proper understanding of the true nature of forms, an abundance of systematically incomplete measurements is unlikely to lead to a comprehensive understanding of many of the complex systems that occur in biology. Socrates even imagines the prisoners honoring whoever could best predict which shadow would appear next. A prisoner might be very good at that and still have no way to tell which of two objects had passed if both cast the same shadow from where he sat. Move the fire, though, and the two objects might cast different shadows. Everything he saw from his old vantage point would still fit either object. In biology we often get to choose our vantage point. We make that choice when we design the experiment, well before anyone trains a model, and the vantage points from among which we can choose are limited by our measurement technologies. Certainly, they provide much information and critical insight. They provide sufficient information to guide search and conclusively address certain hypotheses. But as mechanisms for “measuring the world,” they currently have foundational limitations.

## The measurement problem (not the physics one)

### Which cells have both?

<img src="https://pbs.twimg.com/media/FLBqwLiVgAAmbTI.jpg" alt="The girl from the Old El Paso ad asks, “Why not both?”" width="360" style="max-width: 100%; height: auto;">

Suppose I take two random samples of cells from the same tissue. In one, I measure a particular RNA. In the other, I measure a protein on the cell surface. Imagine that approximately half the cells have the RNA and half have the protein. What fraction have both?

Even if I knew both percentages exactly, the answer could be anywhere from zero to half. Maybe every cell with the RNA also carries the protein. Maybe the two molecules occur in entirely different subpopulations. I could keep measuring cells in perpetuity and, as long as I ran the two experiments separately and recorded only those counts, both explanations would fit. A model trained on paired measurements from another tissue might make a good prediction about mine, but I’d still like to test it.

For this particular question, I could use CITE-seq. I choose antibodies for the surface proteins I care about, then read their tags alongside the RNA from each cell. Now I can estimate how often the two molecules occur together. Say a model later predicts that a second receptor is present in those same cells. If I left it off my panel, I can go back to the data and look for its RNA. Whether the receptor made it to the cell surface is still an open question. I lysed those cells to collect the RNA, so I’d need a fresh sample to test the prediction. [Stoeckius et al., *Nature Methods* (2017)](https://doi.org/10.1038/nmeth.4380)

### Why not measure every surface protein?

<img src="https://i.kym-cdn.com/entries/icons/original/000/006/199/responsibility12%28alternate%29.jpg" alt="Allie Brosh’s “All the Things” cartoon from Hyperbole and a Half." width="360" style="max-width: 100%; height: auto;">

There’s room for more DNA barcodes. Hao and colleagues used a panel of 228 antibodies to study human blood cells. The harder part is finding antibodies that bind each target reliably and still work together. At a fixed sequencing depth, tags from abundant proteins and background binding also leave fewer reads for rare targets. There are, thus, good reasons to work on better assays ([Hao et al., *Cell* (2021)](https://doi.org/10.1016/j.cell.2021.04.048), [Key considerations for CITE-seq](https://pmc.ncbi.nlm.nih.gov/articles/PMC12645808/)).

Suppose we solved all those technical problems so that I can now count every surface protein on a cell. Imagine two cells have the same number of copies of β1 integrin on their surfaces. How many of those receptors are active in each cell? If my antibody binds the active and inactive forms equally well, the total count tells me nothing about how to divide it between the two forms. I could choose an antibody that distinguishes them. But one such antibody, 12G10, can itself *stabilize* the active form. Now I’d want to know how much my choice of antibody changed the state I set out to measure ([Byron et al., *Nature Communications* (2015)](https://doi.org/10.1038/ncomms7135)).

This is why I’m wary of treating even a very broad assay as an “omni-assay.” Once we know the question, we can often design an experiment to answer it. The larger ambition is to collect data today that will answer questions we haven’t yet thought to ask. Here I had to decide whether I cared about integrin activation *before* I chose the antibody. I might only have thought to ask about activation *after* looking at the data.

### What happened to the cell next?

Here's another example. Say I want to know whether a developing blood cell will give rise to neutrophils or monocytes. With conventional single-cell RNA sequencing, I lyse the cell to measure its RNA. I can make a prediction about its descendants, but I’ve lost the chance to follow _that particular_ cell.

[Caleb Weinreb and colleagues](https://doi.org/10.1126/science.aaw3381) got around part of this problem by using heritable barcodes to identify related cells. They could sequence one cell and later see what its relatives had become. When they checked three methods for predicting cell fate from RNA snapshots against those family records, they found that cells already favored one fate earlier than the methods could detect. Weinreb and colleagues also asked whether they could predict the dominant fate of a clone from RNA profiles of its relatives. Every classifier they tried did better with profiles taken later from relatives grown separately. In culture, the best accuracy rose from 60% to 76%. The relatives, it seems, shared information about their fate that the researchers couldn’t reliably recover from the early RNA measurements. They couldn’t tell whether those measurements were too noisy or whether some of that information lay elsewhere (perhaps in chromatin state or protein abundance).

Imagine it occurred to me later to ask whether one of two sister cells had briefly switched on a particular gene before it divided. From the barcode I’d know which cells belonged to the same family, but I’d still _have no record_ of a "pulse" that came and went between samples. To catch it, I might build a fluorescent reporter for the gene and film the cells as they divide. Then I could follow that gene in the same living cell over time. With that movie alone, though, I’d have no RNA counts for the thousands of other genes I could examine in the sequencing data.

### When did the cells become stressed?

Our measurements are also perturbative. We can change a cell before we get a chance to measure it. [Ciara O’Flanagan and colleagues](https://doi.org/10.1186/s13059-019-1830-0) compared two ways to break up tumor tissue for single-cell sequencing. With a commonly used warm digestion, the cells switched on stress-response genes, including *FOS* and *JUN*, while the researchers saw a much weaker response with a cold preparation.

Imagine training a model on a million cells from the warm preparation alone. It might learn to recognize that stress response extremely well. From those cells alone, neither the model nor I could separate the stress that was present _in the tumor_ from the stress we caused by taking the tissue apart. By also running the cold preparation, the researchers could see how much the observed stress response depended on how they took the tissue apart.

However, I might only think to ask where the stressed cells were _after_ I’d seen the sequencing results. Were the cells expressing *FOS* clustered around blood vessels in the original tumor? Once I’ve broken up the tissue, even with the gentler preparation, I’ve lost those cells’ positions. In a fresh section I could stain the vessels and use RNA probes for *FOS* and *JUN* to see where those transcripts were. In this case, I’d have the neighbors back in view, but only for the genes for which I chose probes. If a colleague later asked about a third gene, I could look across the transcriptome in another section, with spatial resolution and sensitivity that depend on the assay. Either way, the tissue is fixed, so I still couldn’t say what any of those cells went on to do.

## Why not run all the assays?

In each of the examples above, the quantity I wanted was **joint**. I wanted to know about two molecules in the same cell, a receptor’s state on a cell I hadn’t disturbed, a cell’s RNA now and its descendants later, or a transcript and its position in the tissue. For every gap, I could use a different assay, so a reader could fairly ask why we don’t run all of them. After I lyse a cell to collect its RNA, I can’t follow that cell through its next division. With [Live-seq](https://www.nature.com/articles/s41586-022-05046-9), I could sample some of its cytoplasm and follow it afterward. For this to work, someone had to invent a different way of collecting the RNA to make that possible. Specifically, a reporter has to be engineered _before_ the experiment starts, and the antibodies in a large panel can block one another’s binding sites. When I do have to run two assays on separate samples, I’m back to the first example, in that I know how often each thing occurs, and I’m asking a model how often they occur together, which is a distinct question. With paired data from somewhere else, it can make a prediction, but to check that answer in my tissue, I’d need the paired measurement, and **for many pairs no such assay yet exists**.

Now, with more cells I can narrow the error bars on both percentages. Even if I knew both exactly, however, I’d still have the same range of answers to the question I asked. What fraction of the cells have both? Every answer from zero to half fits my measurements. Even if we measured every pair of three markers, we could still be wrong about how often all three occur in the same cell. Consider that the dimensionality of the joint distribution I care about can be much larger than 2 or 3, and you can see how this problem generalizes.

I also, personally, doubt we know everything we’re missing. In the Weinreb study, the researchers needed the family relationships to see how much the early RNA profiles missed. They could measure the gap in prediction accuracy even though they couldn’t identify its biological source. Perhaps some decent fraction of what looks like noise in today’s cell atlases might be recognized as biology if we knew what else to measure.

## Which experiment should we scale up?

I am bullish on AI being used as a powerful tool to contribute to the study of biology. That’s part of why I care which experiments we scale up. If I want a better estimate of how often a rare cell type occurs in a tissue, I have a good reason to count more independently sampled cells from that tissue. If I want to know whether two molecules co-occur, I’d spend some of that budget measuring both in the same cells.

We've seen substantial breakthroughs already. [AlphaFold2 learned from experimentally determined structures as well as from large collections of sequences](https://doi.org/10.1038/s41586-021-03819-2). When researchers wanted to know how well it predicted a structure it hadn’t seen, they had an experimental structure to check it against. What would we need to measure to make an equally convincing test of a prediction about a whole living cell? 

I would also advocate putting much of our effort into developing ways to make observations we can’t yet make today. For example, we'd certainly like to know which receptors were active on a particular cell and still be able to see what that cell does next. And when two explanations fit everything we’ve seen so far, I’d be excited to have a model suggest an experiment where the two explanations predict different outcomes.

**Suppose we could make every measurement available to us today more precise and collect as much data as we liked from any mixture of those assays. I still don’t see a clear path from those observations to a comprehensive account of how a whole cell or tissue works, one we could use to predict how it will behave under conditions we haven’t seen**. For that I think we’ll need **fundamentally new ways to measure living systems**. In some cases we’ve yet to devise the experiment, let alone understand what we’d still miss if we could execute it. Even granting that it makes sense to speak of “solving” biology (which I think is the wrong verb here), I don’t think any amount of measurement from the vantage points we have today gets us there. Massive quantities of data and massive amounts of compute can and certainly will have a tremendous impact, but we still have to expand the way in which we generate those data, and that's a different type of problem.
