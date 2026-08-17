---
title: 'Fable is a more useful model now (and GPT 5.6-Sol is pretty good too)'
author: Rob Patro
member: rob-p
math: true
comments: true
category: blog
---

It's been several weeks since my [last post](https://combine-lab.github.io/blog/2026/07/07/fable-is-not-a-useful-model.html) on the futility of attempting to get Fable to answer even the most _basic_ 
or seemingly _abstract_ of questions. While we'd all been warned ad nauseam of Fable's filters for Biology, Chemistry, Computer Security, etc., stories abound on the internet of the model refusing 
to participate in even the most benign of tasks, like describing what an [endoplasmic reticulum](https://en.wikipedia.org/wiki/Endoplasmic_reticulum) is.

I encountered these difficulties myself and detailed them in my last post. Fable refused not just to do biology, but to do software engineering and development for already-existing, open source tools 
that touch Biological data. Perhaps most surprisingly, it even refused to engage in working on a purely theoretical CS problem of understanding the complexity class of solving the 
problem of ["parsimonious reconstruction of network evolution"](https://pmc.ncbi.nlm.nih.gov/articles/PMC3492119/).

### So with Fable unusable, 5.6 Sol to the rescue?

So, Opus 4.8 and ChatGPT 5.5 could make no progress on this problem one way or the other (finding an algorithm, or proving the problem hard), and Fable refused to give me the time of day. The **very day** that 
ChatGPT-5.6 was released, I getting ready to leave the house for the weekend to attend a friend's wedding.  However, I wanted to give this new model a go. So, I gave it the prompt that I'd crafted while interacting
with the other models, set the model to ChatGPT-5.6 Sol Ultra (YOLO), henceforth Sol, and submitted my prompt.

The first thing that really stuck out to me was the sub-agents that Sol spawned immediately, one to do literature review, one to try to find an algorithm, and one to try to find an NP-completeness reduction. Then, Sol
"thought"... and not for 30 seconds or a minute.  It continued churning, while I packed my suitcase and decided what socks and tie to bring to the wedding (congratulations Mike and Sandra, btw!).  When I checked in on the 
progress, the literature search was done, and the sub-agent spawned to find an algorithm had terminated. A few minutes later, the sub-agent spawned to find a reduction returned and the main agent (parent agent? mother agent?)
noted that the reduction agent looked to have been successful and that it would check the work.

Finally, **about 46 minutes after first submitting the prompt, and with no intermediate interaction**, Sol returned a claim that the problem was NP-complete, and a proof of this claim via reduction from Vertex Cover.
So, the problem that had evaded Opus 4.8 and ChatGPT 5.5 for weeks, and that had led Fable to tell me to take a hike, was (_seemingly_, read below) **one-shotted by Sol in 46 minutes**.  I submitted a follow up 
prompt to generate a writeup (in [typst](https://github.com/typst/typst)) of the result with some figures, sent the rendered PDF to some of my original co-authors on the
["parsimonious reconstruction of network evolution"](https://pmc.ncbi.nlm.nih.gov/articles/PMC3492119/) paper, AirDropped the paper to my iPad to read later, and headed off to the town where the wedding was being held.

Despite the fact that I really wanted to sit down with the proof to understand it deeply, the next few weeks were particularly busy with attending [ISMB 2026](https://www.iscb.org/ismb2026/home) (and presenting 
my work with Giulio Ermanno Pibiri on ["Optimizing sparse and skew hashing: faster k-mer dictionaries"](https://academic.oup.com/bioinformatics/article/42/Supplement_1/btag264/8726351)), followed by a family vacation
to visit San Francisco and Denver.  I didn't have a chance to comb over the proof in detail, but I did look at it, and it seemed highly plausible. Complexity theory is not my sub-area of expertise, and while I've done
my share of NP-completeness reductions, it's not something I do every day.  The reduction that Sol came up with was rather involved, and made use of some complex gadgets. Nonetheless, it looked solid (though those of 
us who have seen enough proofs and reductions know that looking solid is often insufficient for _being_ solid), and the general structure of the proof updated my beliefs considerably, from being decidedly undecided on 
the hardness of the problem, to being rather convinced that the (decision version of the) problem was, in fact, NP-complete. My expectations had changed, but I wasn't yet convinced _enough_ to share a writeup of 
the result publicly.

### Fable redux

Then, last week, Anthropic dropped a blog post on ["Improving Fable 5's biology safeguards"](https://www.anthropic.com/news/improving-fable-5-s-biology-safeguards). I saw it first, I think, through 
[David Garfield](https://x.com/dagarfield/status/2085751940697498082?s=20), who, after recently joining Anthropic, has been an excellent liaison between the company and the Computational Biology and Bioinformatics
community. **Was it true**, had they made _substantial_ progress in unlocking Fable for the host of problems and questions that were clearly benign, but for which Fable's classifier could have previously been 
generously described as "worst in class"?

Luckily for me, I had a problem for it ready to go! I gave Fable 5 my original prompt along with the writeup of Sol's result. I wanted to know if the result was correct, and also, if the proof could be futher 
simplified.  After a few moments of thought and analysis, it returned the result, which was, admittedly, surprising: 

> Fable: I read the manuscript closely and checked it against the definitions in the AMB 2012 paper. Short version: the internal mathematics of the manuscript is essentially sound, but Theorem 1 — the claimed identity with your Minimum Flips problem — is false, and the error is fatal to the headline claim. The reduction proves hardness of a different problem, and the complexity of the original problem is, as far as this document goes, still open.

The flaw it pointed out was subtle. Yet, like so many results, once it was pointed out, it was clear! The proof, as written, wouldn't work and, while it had some good ideas about a potential reduction, it was
_incorrect as written_.

Fable, however, didn't stop at the detection of the flaw. It analyzed what Sol had actually proved, how that problem was related to the one we wanted to solve, what parts of the machinery were still useful and 
what needed to be modified.  Then it _repaired Sol's proof_, and provided a new claimed reduction of the problem.  After a bit more prompting, I was also able to get it to clean up the formal statement of the 
problem a bit, and to simplify the proof considerably.  The formal problem statement below has a clear, one-to-one correspondence with our original parsimonious reconstruction of network evolution problem, and 
it is the problem for which Fable produced the proof.

#### The Acyclic Parity Tree-Pair problem

The Acyclic Parity Tree-Pair problem is the formal mathematical re-statement of parsimonious ancestral network reconstruction
in terminology that does not evoke the underlying Biology.

Let $$F$$ be a finite collection of pairwise vertex-disjoint rooted binary
trees, and write $$V(F)$$ for the union of their vertex sets. Let $$T$$ be a
subset of the leaves of $$F$$. For $$u,v \in V(F)$$, write $$u \le_{F} v$$ when $$u$$
lies on the unique path from the root of its tree to $$v$$; this relation is
reflexive. Write

$$
  u <_F v \iff u \le_F v \text{ and } u \neq v
$$

for the *proper*-ancestor relation. The input is

$$
  F, \quad T, \quad G = (T,E), \quad B,
$$

where $$G$$ is a simple undirected graph and $$B$$ is a nonnegative integer.

<style>
.problem-box {
  margin: 2rem 0;
  border: 1px solid var(--border, #d0d0d0);
  border-left: 4px solid var(--accent, #03a9f4);
  border-radius: 8px;
  background: var(--surface-alt, #f8f8f8);
  overflow: hidden;
}

.problem-box-title {
  padding: 0.8rem 1.2rem;
  border-bottom: 1px solid var(--border, #d0d0d0);
  background: var(--surface, #ffffff);
  font-size: 1.15rem;
  font-weight: 600;
}

.problem-box-body {
  padding: 1rem 1.25rem 0.5rem 1.25rem;
}

.problem-box-body > p:first-child {
  margin-top: 0;
}

/* Allow large equations to scroll rather than overflow on phones. */
.problem-box mjx-container[display="true"] {
  overflow-x: auto;
  overflow-y: hidden;
  padding-bottom: 0.2rem;
}
</style>

<div class="problem-box">
<div class="problem-box-title">Acyclic Parity Tree-Pair</div>
<div class="problem-box-body" markdown="1">

Decide whether there is a set $$A \subseteq \binom{V(F)}{2}$$ with
$$|A| \leq B$$ satisfying both conditions below.

**Parity realization.** For every two distinct $$s,t \in T$$,

$$
\{s,t\} \in E
\quad\Longleftrightarrow\quad
\left|
\left\{
\{u,v\}\in A :
\begin{array}{c}
(u \leq_F s \wedge v \leq_F t) \\[-2pt]
{}\vee (u \leq_F t \wedge v \leq_F s)
\end{array}
\right\}
\right|
\equiv 1 \pmod{2}.
$$

**Acyclicity.** There do not exist an integer
$$1 \leq k \leq |A|$$, pairwise distinct elements
$$e_1,\ldots,e_k \in A$$, and, for each $$i$$, an ordering

$$
e_i = \{u_i,v_i\}
$$

as $$(u_i,v_i)$$ such that

$$
u_{i+1} <_F v_i
\qquad (i=1,\ldots,k),
\qquad
u_{k+1}=u_1.
$$

Only the pairs $$e_i$$ must be distinct; endpoints belonging to different
pairs may coincide, and a shared endpoint imposes no relation by itself.
The case $$k=1$$ is retained, so a selected pair whose endpoints are
comparable is forbidden.

</div>
</div>


### What's the proof, is it right?

The proof itself remains a reduction from Vertex Cover, and it still is not what I would call a _trivial_ reduction. However, the gadgets
are much easier to follow, and much more closely tied to the original problem statement. The characterization of the uniqueness of a central 
object of the proof "tight blocks" was able to be made purely algebraic, eliminating some of the trickiest parts of Sol's construction.

I am not including the proof (or a link to a preprint of it) here, because I'm still going over it carefully. I was lured by Sol's original proof 
into a sense of "plausibility bordering on correctness" that, I think was carried on strong ideas but that was ultimately incomplete. So, I want 
to continue to take my time to study this proof in more depth, and to give the co-authors of our original paper, with whom I shared this proof, 
some time to digest it as well.  However, its greater simplicity and the time I have spent with it so far, leaves me rather strongly disposed 
to believe that it is correct, that the Acyclic Parity Tree-Pair problem is, in fact, NP-complete, and along with it the problem of Parsimonious 
Ancestral Reconstruction of Network Evolution.

The reduction itself is also strong enough to bring with it some approximation hardness guarantees. So, if the proof holds, not only is 
the original problem hard, but it is [APX-hard](https://en.wikipedia.org/wiki/APX), and therefore unlikely to admit a [polynomial time 
approximation scheme (PTAS)](https://en.wikipedia.org/wiki/Polynomial-time_approximation_scheme).

If correct, this would close the complexity class question raised in our original paper. It would mean that it wasn't simply that we didn't try
hard enough to expand our original approach to prevent blocking loops, or that we simply didn't stumble upon the right trick; rather, the problem 
is likely intractable to solve exactly in the general case.  

Of course, the results in our paper already showed that in many cases, the heuristic we suggested works well enough to still find a provably optimal 
solution, or a solution that is not too far from the optimum.  However, that approach can surely be improved upon, and the proof of hardness (and 
$$(1 + \epsilon)$$ inapproximability result) provide some motivation to look at approaches that can provably solve more instances of the problem than 
the heuristic we introduced.  I don't necessarily expect the field of ancestral network reconstruction to explode in a flurry of new activity, of course, 
but this proof (_again_, if correct), represents solid theoretical progress on this problem, and helps to scope and direct what some of the most interesting
future work might be.

### In closing

So, my lessons learned include (but are not limited to):

 - Sol 5.6 Ultra is kind of a beast. It seems qualitatively more capable than Opus 4.8 (and, I suspect Opus 5) and ChatGPT 5.5, but it's still not perfect, and you should take the results of all of these models with a warranted level of skepticism; still check their work.
 - Fable 5 has been made _tremendously_ more usable. It too, is still not perfect (and the safety filters are still frustrating some scientists asking clearly benign questions), but it is _much_ better. Not only did it help with this proof, but I've since been able to use it for some software work, including helping in the port of our [Cuttlefish 3](https://www.biorxiv.org/content/10.1101/2025.02.02.636161v2) work into an [official Rust release](https://github.com/COMBINE-lab/cuttlefish) that generally outperforms or original C++ implementation.
 - Cross-agent checking is a useful strategy. While the workflow of doing something start to finish with one agent can be very smooth, if the thing you are asking for is tricky, it's likely very useful to ask a second agent to review the work of the first and vice-versa. I used this strategy to great effect when developing the [thread-broker crate](https://crates.io/crates/thread-broker) (good fodder for another blog post), where Opus derived an initial design specification, Sol implemented it, Opus reviewed the work, Sol reviewed the review and improved the implementation, etc.
 - Parsimonious reconstruction of network evolution, while avoiding blocking loops, is _probably_ a hard problem with no polynomial time algorithm. I hope to drop that _probably_ soon, and put the actual proof of this fact out there as well.
