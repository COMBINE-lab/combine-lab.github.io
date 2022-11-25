---
title: Why use Rust for bioinformatics?
author: Rob Patro
member: rob-p
category: blog
tags:
  - rust
  - programming
  - bioinformatics
  - tools
  - computer science
---

As has been well noted on the interwebs, I am a staunch advocate of the [Rust](https://www.rust-lang.org) 
programming language.  This is particularly true in my home domain of bioinformatics and computational biology.
In fact, so persistent am I in my advocacy for the use of Rust in bioinformatics applications that [some of my colleagues](https://kamimrcht.github.io/webpage/)
have claimed [I am an overfit bot](https://twitter.com/CamilleMrcht/status/1522609312006344705?s=20&t=xH6INShi5gwSSHIZlqfoDw).

So, an obvious question a reader may ask is "why?".  Why am I so zealous in my advocacy for Rust and its use in 
Bioinformatics?  What benefits do I think it provides over the alternatives? What even are the alternatives? 
Are there places in bioinformatics where I *don't* think Rust is the right choice?

I intend this post to be an initial foray into addressing these questions.  Perhaps this will become a series of posts.
Yet, my prior blogging discipline is so lacking that I will not dare to make that proimse at this point.  So, without 
further ado, let's get started.

### Defining the problem space

When I advocate for the use of Rust as a language for developing bioinformatics methods and tools, I do so from my own
particular perspective. Bioinformatics is a *giant* field, with many different sub-disciplines, problem areas, and methodological
approaches.  Perhaps, Rust is applicable everywhere here, but that is not the argument I mean to make.  Rather, I would like 
to advocate for the use of Rust when developing tools and methods for *data-intensive*, *high-throughput* analysis.  

The types of applications I have in mind are sequencing indexing, read mapping and alignment, genome and transcriptome assembly, bulk and
single-cell RNA-seq and metagenomic quantification, etc.  These applications are characterized by a need to process a large volume 
of input data --- often what many consider as *raw* input data. These applications have several charateristics that tie them together.
They often require reading and sometimes writing large quantities of data.  They often require low-level and / or binary parsing and 
interpretation of records.  Givne the problem sizes we encounter in practice, these are usually applications where memory usage is a 
concern and so they often rely on efficient (in space and time) implementation specific data structures.  Futher, in many such applications,
memory needs are often semi-regular and predictable.  Also, often times, these applications have components or subroutines that 
can be made embarassingly parallel.  There are other things such problems have in common, but these will suffice for now.

This, of course, leaves out huge areas of bioinformatics --- problems where we have processed or pre-processed data and we want to perform 
exploratory data analysis, or particular types of statistical testing, or do certain types of dynamical modeling.  It is not that I *don't*
think Rust could be a compelling choice for these types of applications (though I have my doubts about exploratory data anlaysis), it is just 
that these are not the application areas where I typically work, and so they are not the areas where I have the experience or confidence 
to advocate for Rust (yet).

### So what other languages occupy this space

To argue for what makes Rust compelling, I first have to lay out what I think are the other common (and, perhaps, not-so-common) languages
used for these types of problems.  

#### C and C++

Perhaps the most common languages are C and C++.  I mention these together, as is common, but it is 
critical to understand that they are *very* different languages.  The C language is relatively small and in many senses minimalistic. It
provides a small set of tools for modeling problems and for interacting with the system. It has a standard library, but a comparatively 
small one by modern standards, and things like collections must be written or provided as third-party libraries. I won't say too much 
else about C here specifically, except that almost all of the issues I raise about safety with respect to C++, and often times they are
even worse.  Since the C type system isn't as rich as the one in C++, C often makes specific procedures generic by simply casting around 
data into a payload (e.g. a `void*`) rather than generating type-safe code for specific invocations at compile-time (e.g. C++'s templates 
and monomorphization).

As opposed to C, the C++ language is a giant monster.  First, you must ask, to which C++ is one referring? C++98, C++03, C++11, C++14, C++17, C++20?
