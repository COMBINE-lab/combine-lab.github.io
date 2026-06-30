---
title: Research
description: Research areas in COMBINE-lab, spanning computational genomics, transcriptomics, indexing, and algorithm engineering.
---

# Research

<div class="research_intro">
  <p>
    COMBINE-lab develops algorithms, data structures, statistical methods, and production-quality software for high-throughput genomics. Much of our work is motivated by a simple constraint: modern biological data is growing faster than the tools used to analyze it.
  </p>
  <p>
    We focus on methods that are accurate enough for scientific inference, efficient enough for large public datasets, and reliable enough to become part of everyday computational biology workflows.
  </p>
</div>

<div class="research_links">
  <a href="{{ '/resources/' | relative_url }}">Software and resources</a>
  <a href="https://scholar.google.com/citations?user=H36hOqEAAAAJ&hl=en">Publications on Google Scholar</a>
  <a href="https://github.com/COMBINE-lab">COMBINE-lab on GitHub</a>
</div>

<!-- section break -->

## Research Areas

<div class="research_area_grid">
  <article class="research_area">
    <img src="{{ '/images/research-transcriptomics.png' | relative_url }}" alt="">
    <div>
      <h3>Transcriptomics and RNA-seq</h3>
      <p>
        We design methods for transcript quantification, bias modeling, transcriptome analysis, and downstream inference from short-read, long-read, bulk, and single-cell RNA-seq data.
      </p>
      <p class="research_examples">
        Related tools: salmon, sailfish, terminus, grouper
      </p>
    </div>
  </article>

  <article class="research_area">
    <img src="{{ '/images/microscope.jpg' | relative_url }}" alt="">
    <div>
      <h3>Single-cell and multimodal assays</h3>
      <p>
        We build scalable tools for processing single-cell sequencing experiments, including workflows that handle transcript counting, feature barcoding, sparse data, and emerging assay designs.
      </p>
      <p class="research_examples">
        Related tools: alevin-fry, simpleaf, pyroe
      </p>
    </div>
  </article>

  <article class="research_area">
    <img src="{{ '/images/network.jpg' | relative_url }}" alt="">
    <div>
      <h3>Sequence indexing and search</h3>
      <p>
        We develop compact indexes for genomes, transcriptomes, and large collections of sequencing experiments, with emphasis on exactness, memory efficiency, and practical query performance.
      </p>
      <p class="research_examples">
        Related tools: pufferfish, piscem, mantis
      </p>
    </div>
  </article>

  <article class="research_area">
    <img src="{{ '/images/research-succinct-data-structures.png' | relative_url }}" alt="">
    <div>
      <h3>Succinct data structures</h3>
      <p>
        We study compact representations of biological sequences and graph-derived objects, especially de Bruijn graph structures and probabilistic or approximate representations.
      </p>
      <p class="research_examples">
        Related tools: cuttlefish, rainbowfish, squeakr, deBGR
      </p>
    </div>
  </article>
</div>

<!-- section break -->

## How We Work

<div class="research_principles">
  <div>
    <h3>Algorithm engineering</h3>
    <p>
      The lab emphasizes careful implementation, benchmarking, profiling, and reproducibility. A method that is theoretically appealing but brittle in practice is not finished.
    </p>
  </div>
  <div>
    <h3>Open software</h3>
    <p>
      Most lab projects are developed in the open, released on GitHub, and designed for use by computational biologists beyond our immediate collaborators.
    </p>
  </div>
  <div>
    <h3>Scalable inference</h3>
    <p>
      We often work at the boundary between data structures and statistical inference, using better representations to make larger and more accurate analyses possible.
    </p>
  </div>
</div>

<!-- section break -->

## Publications

We are still migrating publication metadata into a maintainable format for this website. For now, the most complete publication list is available on [Rob Patro's Google Scholar profile](https://scholar.google.com/citations?user=H36hOqEAAAAJ&hl=en).

As the local publication data is cleaned up, this page can grow into a searchable publication archive linked to the software and datasets associated with each paper.
