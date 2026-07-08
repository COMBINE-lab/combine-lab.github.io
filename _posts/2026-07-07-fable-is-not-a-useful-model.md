---
title: 'Fable is not a useful model'
author: Rob Patro
member: rob-p
math: true
category: blog
---

The release of Anthropic's Fable (the "safety conscious" version of Mythos) has been a roller coaster ride for many reasons.  Originally released on June 9th, the US government placed export controls on Fable and Mythos on June 12.  
This meant that Anthropic could not serve the model to anyone who is not a US citizen, including their own employees. The impossibility of verifying all users at the risk of severe legal action made it functionally impossible 
to continue serving the model so Antrhopic pulled it.

After a couple of weeks of negotiations, export controls were lifted and Anthropic restored access to the model(s) (only Fable is generally available, Mythos is still available only to specific, pre-approved partners).  All of this, of course, 
cause much drama online, and resulted in a tremendous amount of speculation and many news stories.  Nonetheless, that is _not_ what I wanted to focus my thoughts on here. Rather, I wanted to explain why I think that, at least for research-level 
tasks in Computer Science, Fable is not a useful model.

### The first flop (understandable; but not really)

I wrote and maintain a widely-used tool for transcript quantification from RNA-seq data called [salmon](https://combine-lab.github.io/salmon).  The original salmon code was written in C++11/14, and early this year, I updated and modularized it a
bit (with the help of ChatGPT), and brought it up to the C++20 standard.  However, my more ambitious goal, and one that I've had for quite some time, was to re-write salmon in [rust](https://rust-lang.org/).  _Note_: This did eventually happen, 
resulting in salmon 2 (which is already beyond parity with the C++ version and is adding new features quickly, but that is for another post).

When the original Fable release dropped on June 9, my first thought was to use it to help orchestrate the salmon rewrite. Now, I've succesfully ported or rewritten several other libraries or programs developed in the lab from C++ into rust, mostly 
with the help of Opus (4.6-4.8), and those went fairly smoothly. So, I thought that this would be a great opportunity to see how Fable compared.  Alas, after spending some time crafting my detailed description and porting narrative, complete with 
implementation instructions and testing details, I submitted the query to Fable (in "plan" mode) and it _immediately_ flagged my query on safety concerns, rejected it, and offered to send it to Opus 4.8 instead.

Naturally, I wanted to know why the prompt was rejected. Anthropic claims that Fable uses a "classifier" to determine what prompts are rejected and which are allowed, though it's been 
[widely reported that this classifier is stupendously miscalibrated](https://www.theregister.com/ai-and-ml/2026/06/10/anthropic-claude-fable-5-refuses-innocuous-prompts/5253754).  Nominally, it seems, my prompt was rejected because it involves
working on software that deals with RNA-seq data, and the biological terminology in the documentation and source code set off the red flags needed to trigger the prompt rejection. I tried, to no avail, to explain to Fable that I am simply 
asking to re-write an existing, open source, widely used, publicly available C++ software tool in rust. The rewrite itself does not involve novel "biological" research. The inital ask is purely a software task, which is supposed to be a strong 
suit of Fable. Yet, not only did Fable refuse the prompt, but it also refused to disclose or explain _why_ it refused the prompt in any detail, or to help me understand how to prompt it in a way so as to avoid this issue.

After perhaps 15 to 30 minutes of failed attempts at rephrasing my prompts, I gave up and simply proceeded with Opus 4.8 (which happily complied and, all said and done, did a great job with the port). However, this was my first inkling that 
the "classifier" used by Fable is not so much a classifier as, perhaps, a simple rejection list of terms and users, refusing to even begin to engage with subjects (or users) who have any relation to biological research (and likely, also, 
cybersecurity research).

This attempt was _massively_ disappointing. Despite the _clear_ lack of any security risk or implication, Fable flatly refused to engage with me in work for which it should be well-suited. Taking a peek on social media, I learned that my 
experiences were shared by many others, including biologists who had Fable refuse to answer prompts as innocuous as "why am I?", "what is a mitochondrion?" and .... "what should I have for dinner?". Truly strange.

### The second flop (unforgivable)

While I thought of other challenges I could pose to Fable, it disappeared, succumbing to the administration's export controls on June 12.  Thus, while I had come up with another piece of interesting work that I wanted it to take a crack at it, 
the model was simply unavailable.  On July 1st, after coming to terms with the administration (and not providing many details on precisely what had traspired), Anthropic re-released Fable. With this re-release, they mentioned even stricter
safeguards. Nonetheless, Fable was back, so, I decided to give it another go. 

_the setup_: Back in the end of grad school, I worked on a paper about the problem of ["Parsimonious reconstruction of network evolution"](https://pmc.ncbi.nlm.nih.gov/articles/PMC3492119/), which basically asks; if 
we are given a network (say protein interaction network), and the series of gene duplication, creation and deletion events for the proteins involved, can we reconstruct a parsimonious history of interaction gains and losses that reconstructs
the observed network?  The formal problem statement appears in the paper, along with generations to multiple species, etc.  Nonetheless, we discovered something interesting, if we model the problem under the parsimony criterion, there is an 
efficient (polynomial) dynamic program that yields a (there can be many) most parsimonious solution.  In the model we adopt in the paper, a protein _inherits_ the interaction state of its parents, and rather than having to think about interaction
creation and deletion separately, we simply consider "flipping" the interaction between two proteins (i.e. if they interact and we no longer wish them to do so, we flip the interaction off; if they don't interact and we wish them to, 
we flip the interaction on). However, the solutions that are generated by the dynamic program can be such that they are _not physically realizable_.  How?

Assume that there are two distinct proteins A and B in our gene tree, such that neither is a descendant of the other.  Let's denote by $$A_l$$ and $$A_r$$ the left and right children of A and by $$B_l$$ and $$B_r$$ the left and right children of B.
Now, assume that our dynamic program identifies a parsimonious solution that involves the following set of interaction changes. It flips the interaction state between $$A_l$$ and B, as well as the interaction between $$B_r$$ and A. This particular set 
of flips is not physically realizable, because it assumes that $$A_l$$ co-exists with B (so that gene A must have duplicated before B). Yet, it also assumes that $$B_r$$ co-exists with A (so that gene B must have duplicated first).  We call this 
structure a "blocking loop".  It turns out that these types of simple blocking loops (those involving 2 interaction flips and 2 tree edges) can generally be forbidden. However, one can construct arbitrarily long chains of interaction flips that are 
themselves realizable, but where adding one more interaction turns the whole sequence of interaction flips into a physically unrealizable loop.  Take a look at [Figure 2](https://pmc.ncbi.nlm.nih.gov/articles/PMC3492119/figure/F2/) for a graphical 
example of this. So, while we could come up with a dynamic program to find a parsimonious history (i.e. minimal set of flips), we could not make it do so while avoiding all blocking loops! We eventually settled on a heuristic. First, find a parsimonious 
history. If there are no blocking loops, we're good to go. If there is a blocking loop, pick one edge in the loop, forbid it (set its cost in the dynamic program to infinity), and rerun the dynamic program.  Keep doing this until we find a solution
free of blocking loops. Those solutions with specific edges forbidden may not be parsimonious, but we show in the paper that they often are in practice and, when they aren't, they are likely not too far from optimal.

Ok, so why all of this background.  Well, what we have here is a very classic example of something computer scientists deal with frequently. We have a computational problem for which we did not come up with an algorithm that guarantees we always 
find the optimal solution. Normally in such a situation, that's common _when you can show that the problem likely has no efficient solution_ (i.e. when you can prove that the problem you wish to solve is [NP complete](https://en.wikipedia.org/wiki/NP-completeness)).
Yet, for this problem, we had neither an optimal algorithm, nor a formal proof of the hardness of the problem. Nonetheless, the problem and formulation were interesting, and the heuristic seemed to perform rather well.

Over the years, I've proposed this problem to several people, and in discussions with them we have yet to come up with either an optimal algorithm or a proof of hardness.  This is where I hoped Fable might come in.


 - Attempt 1: The naive ask. In my first attempt, I simply pointed Fable at the paper, described the issue much as I did above, and asked it to think about if the problem is likely hard (and if so, to provide a proof in the form of a
 ["reduction"](https://en.wikipedia.org/wiki/Polynomial-time_reduction) from a known hard problem), or to come up with an algorithm that solves the parsimony problem in the absence of blocking loops. **Immediate refusal to answer the prompt**. 
 I should have seen this coming, the paper describes proteins, biological networks, and appeared in a venue with biology words abound.

 - Attempt 2: So obviously that was silly. The classifier had previously decided that helping rewrite some open source software was potentially risky, so why would I trust it to properly contextualize this theoretical graph problem. So my next attempt
 was to try to pull the abstract (mathematical) problem directly out of the paper, strip it down to the bare minimum, and present it to Fable. Surely math, unlike biology, is not a dangerous flag-raising subject.  So, I stripped down the problem 
 to the bare minimum; made it a decision problem rather than an optimization problem (i.e. does there exist a series of flips of cardinality $$< m$$ for some integer $$m$$ rather than finding the minimum), and tried again. **Immediate refusal to answer 
 the prompt**. But why? what could it possibly be. At this point, I recruited ChatGPT to help me. I fed it the prompt and told it Fable was flagging this. I asked it for help.

 - Attempt 3: ChatGPT made some useful observations. Perhaps terms like "blocking" were being implicated by the model as related to cybersecurity and triggering the model's refusal. It helped me to rephrase the problem in as abstract and disconnected (from biology or 
 cybersecurity) a manner as possible.  This resulted in the problem statement below, which I then provided to Fable with the prompt "This is a discrete mathematics decision problem about rooted trees and parity. 
 Please restate it in standard mathematical language and suggest related known problem families.":

#### Formal problem statement 

 Let (F) be a finite collection of rooted binary trees. Let (T) be a subset of the leaves of (F). For nodes ($$u,v \in V(F)$$), write

$$
u \leq_F v
$$

if (u) lies on the unique root-to-(v) path.

Input:

$$
F,\ T,\ G=(T,E),\ m
$$

where (G) is an undirected graph on (T), and ($$t \geq 0$$) is an integer.

Question: does there exist a set

$$
A \subseteq \binom{V(F)}{2}
$$

with

$$
|A| \leq m
$$

satisfying the following two conditions?

First, for every distinct $$(s,t \in T)$$,

$$
{s,t} \in E
$$

if and only if

$$
\left|
\left\{
{u,v} \in A :
(u \leq_F s \wedge v \leq_F t)
\vee
(u \leq_F t \wedge v \leq_F s)
\right\}
\right|
\equiv 1 \pmod 2.
$$

Second, there do not exist $$(k \geq 1)$$ and pairs

$$
{u_1,v_1},\ldots,{u_k,v_k} \in A
$$

such that each pair can be ordered as

$$
(u_i,v_i)
$$

and

$$
u_{i+1} \leq_F v_i
$$

for every

$$
i=1,\ldots,k,
$$

with

$$
u_{k+1}=u_1.
$$


And **complete and utter refusal to engage with my prompt**. Fable flagged this, and stoped the interaction (giving me the option to proceed with Opus, which I did not want to do).  At this point, I could not possibly comprehend
what is potentially leading to a flagging of this query.  I spoke with a few folks who made other suggestions, like pause Claude's "memory", try this as a "private" chat, make sure it's not looking at some local Markdown file that
_itself_ might refer to biology or cybersecurity and be injected in the prompt, modify your personal description in Claude to remove any mention of biology, etc. **All of these failed**. Despite my best efforts, I was completely 
unable to get Fable to engage with a purely abstract and completely innocuous mathematical problem.

### Fin (for now)

That's it. That's the end of my story. Fable failed at helping me with my software development and porting tasks, presumably because of the type of data that software deals with. The fact that this is pre-existing, publicly available, open source
software didn't seem to matter. The fact that I was asking it for help only with the technical problem of rewriting this C++ software in rust did not seem to matter. The "safety" features of Fable prevented its use.  Then, I attempted to get it 
to help me with a purely abstract mathematical problem. Through constant rejections, and progressively more extreme measures to neuter the problem of any potential percieved context, I was unable to get Fable to provide me with any useful help. 
The model simply would not engage with me. I can only conclude that **Fable is not a useful model**.  This may not be true for everyone, but for anyone working in Bioinformatics, Genomics, Computational Biology, Biology, Cybersecurity, and, seemingly
Computer Science, this seems to be the case.  I sincerely hope that Antrhopic works to fix this in the future. Yet, for now, this is where things stand, and I've not even been able to assess if Fable might be worth the API pricing, since I can't
assess it at all.


### Bonus

While I was not able to get Fable to answer _a single_ useful question, I was able to get it to answer **one** question:

Me:
> Which ice cream flavor is better, vanilla, chocolate, or chocolate chip cookie dough?

Fable:
> Chocolate chip cookie dough, and it's not particularly close. It gives you the best of both worlds: a solid vanilla base plus the textural contrast and little pockets of brown-sugar richness from the dough. It's the flavor equivalent of a strict upgrade.
That said, a defense of the other two: chocolate is the most reliable — a good chocolate ice cream is deeply satisfying and hard to mess up. And vanilla gets unfairly maligned as "plain" when real vanilla bean ice cream is actually one of the most flavorful things you can eat; it's also the best team player if you're pairing with pie, brownies, or toppings.
So: cookie dough to eat on its own, vanilla if there's dessert to accompany, chocolate if you want a sure thing.





