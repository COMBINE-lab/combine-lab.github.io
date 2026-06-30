---
title: Home
description: COMBINE-lab develops algorithms, data structures, and software for high-throughput genomics.
---

<div class="home_hero">
  <img class="home_logo" src="{{ '/images/combine-lab-logo-large.png' | relative_url }}" alt="COMBINE-lab">
  <p>
    We build methods and tools for analyzing high-throughput genomics data, with a focus on transcriptomics, single-cell assays, sequence indexing, and scalable inference.
  </p>
  <div class="home_actions">
    <a href="{{ '/research/' | relative_url }}">Research areas</a>
    <a href="{{ '/resources/' | relative_url }}">Software</a>
    <a href="{{ '/team/' | relative_url }}">Team</a>
  </div>
</div>

<!-- section break -->

## What We Study

<div class="home_focus_grid">
  <article>
    <h3>Transcriptomics</h3>
    <p>
      Algorithms for RNA-seq quantification, transcriptome analysis, long-read RNA-seq, and downstream inference from abundance estimates.
    </p>
  </article>
  <article>
    <h3>Single-cell assays</h3>
    <p>
      Scalable workflows for single-cell transcriptomics, feature barcoding, quality control, sparse data, and emerging multimodal sequencing protocols.
    </p>
  </article>
  <article>
    <h3>Sequence indexing</h3>
    <p>
      Compact indexes and mapping methods for large collections of genomes, transcriptomes, and raw sequencing experiments.
    </p>
  </article>
  <article>
    <h3>Succinct structures</h3>
    <p>
      Data structures for de Bruijn graphs, sequence collections, and compressed representations that make large-scale genomics practical.
    </p>
  </article>
</div>

<!-- section break -->

## Software

<div class="home_software">
  <p>
    The lab maintains open-source software used by researchers working with bulk RNA-seq, single-cell RNA-seq, long-read RNA-seq, sequence mapping, indexing, quality control, and graph-based sequence representations.
  </p>
  <div class="home_tool_list">
    <a href="{{ '/resources/' | relative_url }}?search=salmon">salmon</a>
    <a href="{{ '/resources/' | relative_url }}?search=alevin-fry">alevin-fry</a>
    <a href="{{ '/resources/' | relative_url }}?search=simpleaf">simpleaf</a>
    <a href="{{ '/resources/' | relative_url }}?search=piscem">piscem</a>
    <a href="{{ '/resources/' | relative_url }}?search=oarfish">oarfish</a>
    <a href="{{ '/resources/' | relative_url }}?search=QCatch">QCatch</a>
  </div>
  <p>
    See the <a href="{{ '/resources/' | relative_url }}">Resources page</a> for curated projects and GitHub-derived metadata.
  </p>
</div>

<!-- section break -->

## Lab Approach

<div class="home_approach">
  <div>
    <h3>Accuracy</h3>
    <p>
      We care about methods that support sound scientific inference, not just fast command-line runs.
    </p>
  </div>
  <div>
    <h3>Performance</h3>
    <p>
      We profile, benchmark, and engineer tools for datasets that are large enough to expose algorithmic weaknesses.
    </p>
  </div>
  <div>
    <h3>Usability</h3>
    <p>
      We aim to release software that researchers can install, document, cite, inspect, and build on.
    </p>
  </div>
</div>

<!-- section break -->

## For Prospective Students

COMBINE-lab is part of the [Department of Computer Science](https://www.cs.umd.edu/) at the [University of Maryland](https://www.umd.edu/). We generally work with students who are already at UMD and whose interests align with the research areas above.

Most projects in the lab involve algorithm engineering and performance-conscious implementation. New projects are commonly developed in [Rust](https://www.rust-lang.org/), and new lab members are expected to learn Rust if they do not already know it.

We are usually not the right home for projects centered primarily on deep learning in genomics. We are most interested in students who want to build robust computational methods, data structures, and open software for biological data analysis.

If that sounds like a strong fit, please [contact Rob]({{ '/contact/' | relative_url }}).
